/**
 * Client-side read of the real course catalog for the "Catálogo" tab
 * (src/components/plataforma/CatalogoView.tsx) — pure browsing/filtering,
 * no purchase logic, so unlike the roadmap (which needs Gemini) this never
 * touches /api/*. Same file as the server reads (api/_lib/courseCatalog.ts)
 * — data/course-catalog.json is the one source of truth for both; Vite can
 * import JSON straight from outside src/ since /data sits in the project
 * root, so there's no second copy to keep in sync.
 *
 * id/nombre/categoria/tipo cover all 57 courses. The pricing/schedule/
 * discount/image fields below are real too, but only for the 28
 * curso/carrera/diplomatura entries — scraped straight from the official
 * coderhouse.com pages (saved HTML snapshots the user provided), matched
 * back to this catalog by course name. The 29 on-demand courses
 * genuinely don't have this data on the real site either (they're listed,
 * not sold as scheduled cohorts), so those fields stay undefined for
 * them — nothing in this codebase invents a value when it's absent (see
 * CatalogoView's CourseCard, which only renders a field when it's
 * actually present).
 */
import catalog from "../../data/course-catalog.json";

export type CourseType = "curso" | "carrera" | "diplomatura" | "on-demand";

export type CatalogCourse = {
  id: string;
  nombre: string;
  categoria: string;
  tipo: CourseType;
  descuento?: string;
  proximaFecha?: string;
  /** e.g. "+16 fechas más" — real, scraped alongside proximaFecha. */
  extraFechas?: string;
  horario?: string;
  precioOriginal?: number;
  precioFinal?: number;
  /** Per-installment amount — "Hasta {cuotas} cuotas sin interés de {precioCuota}". */
  cuotas?: number;
  precioCuota?: number;
  /** Real course photo, e.g. "/courses/excel-avanzado.png" — see public/courses/. */
  imagen?: string;
};

export const CATALOG: CatalogCourse[] = catalog as CatalogCourse[];

export function categoriesFor(tipo: CourseType): string[] {
  return [...new Set(CATALOG.filter((c) => c.tipo === tipo).map((c) => c.categoria))].sort();
}

// Same topic, different modality (curso/carrera/diplomatura/on-demand) —
// powers the node detail panel's "Cambiar de modalidad" block
// (src/pages/Plataforma.tsx's DetailPanel). Real feedback: the roadmap AI
// used to be able to recommend the same subject (e.g. Diseño UX/UI) as a
// curso, a carrera AND a diplomatura all at once — those aren't different
// courses to stack, they're the same real Coderhouse offering at different
// commitment levels. The AI is now told to pick one (see
// api/_lib/roadmapPrompt.ts), and this is the other half: surface the
// alternates it didn't pick so the person can still see/switch to them
// without the map ever showing a duplicate node.
//
// No topic field exists in course-catalog.json to look this up directly,
// so this matches on real course-name overlap instead: same categoria,
// different tipo, and enough shared significant words in the name once
// tipo-indicating prefixes ("Carrera de", "Diplomatura (en)") are
// stripped. e.g. "Carrera de Diseño UX/UI" and "Diplomatura Diseño UX/UI"
// both normalize to "diseño ux/ui" and match; "Carrera de Marketing
// Digital" doesn't match "Marca, Redes y Contenido Social..." (an
// unrelated on-demand course in the same categoria) because their word
// sets don't overlap. Mirrored server-side in api/_lib/courseCatalog.ts
// (Node can't share this module — it isn't bundled into the Vercel
// function — so the same small heuristic lives in both places).
const TIPO_PREFIX_RE = /^(carrera de|diplomatura( en| de)?|curso de)\s+/i;
const STOPWORDS = new Set(["de", "la", "el", "en", "y", "para", "con", "tu", "tus", "un", "una", "del", "al", "los", "las", "que"]);

function topicTokens(nombre: string): Set<string> {
  const normalized = nombre.toLowerCase().replace(TIPO_PREFIX_RE, "").trim();
  return new Set(normalized.split(/[\s/&:,-]+/).filter((w) => w.length > 0 && !STOPWORDS.has(w)));
}

function isSameTopic(a: CatalogCourse, b: CatalogCourse): boolean {
  if (a.id === b.id || a.categoria !== b.categoria || a.tipo === b.tipo) return false;
  const ta = topicTokens(a.nombre);
  const tb = topicTokens(b.nombre);
  const minSize = Math.min(ta.size, tb.size);
  if (minSize === 0) return false;
  // Full containment (the shorter name's whole token set inside the
  // longer's), not a partial-overlap ratio — a single shared generic word
  // like "ai" between two otherwise-unrelated 2-word names (e.g. "AI
  // Engineering" vs "Carrera de AI Automation") isn't enough to call them
  // the same topic, and a lower bar produced exactly that false positive
  // when tested against the real catalog.
  const shared = [...ta].filter((t) => tb.has(t)).length;
  return shared === minSize;
}

/** Other real catalog entries covering the same topic as `course`, in a different modality. Empty when there's no real alternate. */
export function findAlternateModalities(course: CatalogCourse): CatalogCourse[] {
  return CATALOG.filter((c) => isSameTopic(course, c));
}
