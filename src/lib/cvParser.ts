import type { ProfileInput } from "./profileStore";

/**
 * PARTE A — turns the raw CV text /limbo already extracted (or, absent a
 * CV, the person's own chat answers) into a standard CV template's fields.
 * Plain heuristics, no AI call: the brief is explicit that this is field
 * extraction from text that's already there, not a rewrite.
 *
 * Recognizes the "<puesto> en <empresa> (<fechas>)" line shape and a
 * handful of common resume section headers (Experiencia/Educación/
 * Herramientas/Habilidades/Skills). Real-world CVs vary a lot in layout —
 * anything that doesn't match a known shape falls into `extra` as a plain
 * bullet instead of being dropped, so nothing typed in the CV silently
 * disappears.
 */

export type CvExperienceEntry = { puesto: string; empresa: string; fechas: string };

export type ParsedCv = {
  nombre: string | null;
  /** Real, scanned from anywhere in the CV text — null when there's no CV (the chat-answers fallback never collects an email). */
  email: string | null;
  /** Free-text summary — only populated when there's no CV to parse (built from the /limbo conversation's own trigger summary). */
  resumen: string | null;
  experiencia: CvExperienceEntry[];
  educacion: string[];
  herramientas: string[];
  /** Lines that look like resume content but didn't match a known shape — shown as plain bullets instead of lost. */
  extra: string[];
};

const EXPERIENCE_ENTRY_RE = /^(.+?)\s+(?:en|@|-|—)\s+(.+?)\s*\(([^)]+)\)\.?$/i;
const HEADER_RE =
  /^(experiencia(\s+laboral)?|educaci[oó]n|formaci[oó]n(\s+acad[eé]mica)?|habilidades|herramientas|skills|tecnolog[ií]as)\s*:?$/i;
const TOOLS_LINE_RE = /^(herramientas|habilidades|skills|tecnolog[ií]as)\s*:\s*(.+)$/i;
const NAME_GUESS_RE = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ']+){1,3}$/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/;

type Section = "experiencia" | "educacion" | "otros";

function headerToSection(word: string): Section {
  const w = word.toLowerCase();
  if (w.startsWith("educaci") || w.startsWith("formaci")) return "educacion";
  if (w.startsWith("experiencia")) return "experiencia";
  return "otros";
}

function parseFromCvText(cvText: string): ParsedCv {
  const emailMatch = cvText.match(EMAIL_RE);
  const email = emailMatch ? emailMatch[0] : null;

  const lines = cvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    // Drop a line that's just the email itself (common right under the
    // name) — it's already captured above, no need for it to also show
    // up as a stray bullet in `extra`.
    .filter((l) => l !== email);

  let nombre: string | null = null;
  const experiencia: CvExperienceEntry[] = [];
  const educacion: string[] = [];
  const herramientas: string[] = [];
  const extra: string[] = [];

  let section: Section = "experiencia";
  let start = 0;

  if (lines[0] && NAME_GUESS_RE.test(lines[0]) && !EXPERIENCE_ENTRY_RE.test(lines[0])) {
    nombre = lines[0];
    start = 1;
  }

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];

    const headerMatch = line.match(HEADER_RE);
    if (headerMatch) {
      section = headerToSection(headerMatch[1]);
      continue;
    }

    const toolsMatch = line.match(TOOLS_LINE_RE);
    if (toolsMatch) {
      herramientas.push(...toolsMatch[2].split(",").map((t) => t.trim()).filter(Boolean));
      continue;
    }

    // The "<puesto> en <empresa> (<fechas>)" shape only counts as a work
    // entry while we're in the experiencia section — inside educacion the
    // same shape shows up for degrees ("Licenciatura en Diseño, UBA
    // (2015-2019)") and has to stay there, not leak into work history.
    if (section !== "educacion") {
      const expMatch = line.match(EXPERIENCE_ENTRY_RE);
      if (expMatch) {
        experiencia.push({ puesto: expMatch[1].trim(), empresa: expMatch[2].trim(), fechas: expMatch[3].trim() });
        continue;
      }
    }

    if (section === "educacion") {
      educacion.push(line);
    } else {
      extra.push(line);
    }
  }

  return { nombre, email, resumen: null, experiencia, educacion, herramientas, extra };
}

function guessNameFromAnswers(answers: string[]): string | null {
  const joined = answers.join(" ");
  const m = joined.match(/\bsoy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
  return m ? m[1] : null;
}

export function parseCv(input: ProfileInput | null, fallbackResumen: string | null): ParsedCv {
  if (input?.cvText && input.cvText.trim()) {
    return parseFromCvText(input.cvText);
  }

  return {
    nombre: input ? guessNameFromAnswers(input.userAnswers) : null,
    email: null,
    resumen: fallbackResumen,
    experiencia: [],
    educacion: [],
    herramientas: [],
    extra: [],
  };
}
