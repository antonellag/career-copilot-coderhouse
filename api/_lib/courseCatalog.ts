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
