/**
 * The ONLY source of valid courses for the Fase 4 roadmap (api/roadmap.ts).
 * Data lives in /data/course-catalog.json — a placeholder list for now,
 * meant to be swapped for the real Coderhouse catalog by just replacing
 * that file's contents (same shape: id/nombre/categoria/tipo/descripcion),
 * no code changes required. Never import the JSON directly from anywhere
 * else — go through this module so there's one typed, validated point of
 * truth for "does this course id actually exist".
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
  tipo: "curso" | "carrera";
  descripcion: string;
};

export const COURSE_CATALOG: Course[] = catalog as Course[];

const BY_ID = new Map(COURSE_CATALOG.map((c) => [c.id, c]));

export function getCourseById(id: string): Course | undefined {
  return BY_ID.get(id);
}

/** Compact text block for embedding the catalog into a model prompt. */
export function catalogAsPromptText(): string {
  return COURSE_CATALOG.map((c) => `- id: "${c.id}" | ${c.nombre} (${c.tipo}, ${c.categoria}) — ${c.descripcion}`).join(
    "\n",
  );
}
