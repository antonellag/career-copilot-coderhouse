/**
 * The ONLY source of valid courses for the Fase 4 roadmap (api/roadmap.ts).
 * Data lives in /data/course-catalog.json — the real Coderhouse catalog (57
 * courses/carreras/diplomaturas/on-demand, scraped from coderhouse.com/ar).
 * Never import the JSON directly from anywhere else — go through this
 * module so there's one typed, validated point of truth for "does this
 * course id actually exist".
 *
 * id/nombre/categoria/tipo cover all 57. The 28 curso/carrera/diplomatura
 * entries also carry real pricing/schedule/discount/image fields (scraped
 * from the official site — see src/lib/catalogClient.ts's own doc comment
 * for the full story); the 29 on-demand ones genuinely don't have that
 * data on the real site, so those fields stay undefined there. Nothing in
 * this codebase should invent them when absent (see the Fase 4 detail
 * panel in src/pages/Plataforma.tsx, which renders only what's actually
 * here).
 */
// Read + JSON.parse at runtime instead of a native ESM JSON import — Vercel's
// Node function builder doesn't reliably bundle relative imports (hence the
// explicit ".js" extension rule already documented in api/chat.ts), so a
// native `import ... with { type: "json" }` is a needless risk here. fs is
// unambiguous regardless of how the function ends up packaged.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const catalogPath = fileURLToPath(new URL("../../data/course-catalog.json", import.meta.url));
const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));

export type Course = {
  id: string;
  nombre: string;
  categoria: string;
  tipo: "curso" | "carrera" | "diplomatura" | "on-demand";
  descuento?: string;
  proximaFecha?: string;
  extraFechas?: string;
  horario?: string;
  precioOriginal?: number;
  precioFinal?: number;
  cuotas?: number;
  precioCuota?: number;
  imagen?: string;
};

export const COURSE_CATALOG: Course[] = catalog as Course[];

const BY_ID = new Map(COURSE_CATALOG.map((c) => [c.id, c]));

export function getCourseById(id: string): Course | undefined {
  return BY_ID.get(id);
}

/** The 3 categories eligible as CAMBIO 3's transversal picks (never the core specialization). */
export const TRANSVERSAL_CATEGORIES = ["Softs Skills", "Negocios", "Producto"];

/** Compact text block for embedding the catalog into a model prompt. */
export function catalogAsPromptText(): string {
  return COURSE_CATALOG.map((c) => `- id: "${c.id}" | ${c.nombre} (${c.tipo}, ${c.categoria})`).join("\n");
}

// Same-topic-different-modality detector — mirrored from src/lib/
// catalogClient.ts's findAlternateModalities (that file can't be imported
// here: it's a Vite/browser module, not bundled into this Vercel
// function), see that copy's doc comment for the full reasoning and match
// examples. Used only to build promptSameTopicExamples() below: real,
// catalog-derived examples of same-topic/different-modality clusters, so
// the roadmap prompt's "pick one modality per topic" rule
// (api/_lib/roadmapPrompt.ts) has concrete anchors instead of an abstract
// instruction alone.
const TIPO_PREFIX_RE = /^(carrera de|diplomatura( en| de)?|curso de)\s+/i;
const STOPWORDS = new Set(["de", "la", "el", "en", "y", "para", "con", "tu", "tus", "un", "una", "del", "al", "los", "las", "que"]);

function topicTokens(nombre: string): Set<string> {
  const normalized = nombre.toLowerCase().replace(TIPO_PREFIX_RE, "").trim();
  return new Set(normalized.split(/[\s/&:,-]+/).filter((w) => w.length > 0 && !STOPWORDS.has(w)));
}

function isSameTopic(a: Course, b: Course): boolean {
  if (a.id === b.id || a.categoria !== b.categoria || a.tipo === b.tipo) return false;
  const ta = topicTokens(a.nombre);
  const tb = topicTokens(b.nombre);
  const minSize = Math.min(ta.size, tb.size);
  if (minSize === 0) return false;
  // Full containment, not a partial-overlap ratio — see the mirrored copy
  // in src/lib/catalogClient.ts for why (a lower bar false-positived on
  // real catalog names sharing one generic word like "ai").
  const shared = [...ta].filter((t) => tb.has(t)).length;
  return shared === minSize;
}

/**
 * Real clusters of 2+ catalog courses that are the same topic in different
 * modalities (e.g. "Carrera de Diseño UX/UI" + "Diplomatura Diseño UX/UI"
 * + the on-demand "UX/UI & Diseño de Producto Digital") — formatted as a
 * few lines for the prompt so "one modality per topic" has real examples
 * from THIS catalog, not a generic rule the model has to infer blind.
 */
export function promptSameTopicExamples(): string {
  const seen = new Set<string>();
  const clusters: Course[][] = [];
  for (const course of COURSE_CATALOG) {
    if (seen.has(course.id)) continue;
    const alternates = COURSE_CATALOG.filter((c) => isSameTopic(course, c));
    if (alternates.length === 0) continue;
    const cluster = [course, ...alternates];
    cluster.forEach((c) => seen.add(c.id));
    clusters.push(cluster);
  }
  return clusters
    .map((cluster) => `- ${cluster.map((c) => `"${c.nombre}" (${c.tipo})`).join(" / ")} → son el mismo tema, elegí solo uno`)
    .join("\n");
}
