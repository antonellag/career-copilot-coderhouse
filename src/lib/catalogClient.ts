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
