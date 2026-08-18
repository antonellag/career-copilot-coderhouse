/**
 * Client-side read of the real course catalog for the "Catálogo" tab
 * (src/components/plataforma/CatalogoView.tsx) — pure browsing/filtering,
 * no purchase logic, so unlike the roadmap (which needs Gemini) this never
 * touches /api/*. Same file as the server reads (api/_lib/courseCatalog.ts)
 * — data/course-catalog.json is the one source of truth for both; Vite can
 * import JSON straight from outside src/ since /data sits in the project
 * root, so there's no second copy to keep in sync.
 *
 * Only id/nombre/categoria/tipo are real fields in that file today — the
 * optional pricing/schedule/discount fields below are typed for whenever
 * that data gets added, but nothing in this codebase invents them when
 * they're absent (see CatalogoView's CourseCard, which only renders a
 * field when it's actually present).
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
  horario?: string;
  precioOriginal?: number;
  precioFinal?: number;
};

export const CATALOG: CatalogCourse[] = catalog as CatalogCourse[];

export function categoriesFor(tipo: CourseType): string[] {
  return [...new Set(CATALOG.filter((c) => c.tipo === tipo).map((c) => c.categoria))].sort();
}
