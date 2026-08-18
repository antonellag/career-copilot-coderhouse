import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATALOG, categoriesFor, type CatalogCourse, type CourseType } from "@/lib/catalogClient";

/**
 * The "Catálogo" tab — a mostly-visual replica of the real Coderhouse
 * catalog, no purchase logic. Two filters are REAL (they work against
 * data/course-catalog.json, the only data we actually have): the name
 * search and the categoria dropdown. "Más vendidos", "Nuevos", and "Nivel"
 * are left in the UI to look complete but don't filter anything — we have
 * no real sales/publish-date/difficulty data for these 57 courses, and
 * filtering by something invented would just show fake results. Clicking
 * them is a no-op; the visible list never changes because of them.
 */

const SECTIONS: { id: CourseType; label: string }[] = [
  { id: "curso", label: "Cursos" },
  { id: "carrera", label: "Carreras" },
  { id: "diplomatura", label: "Diplomaturas" },
  { id: "on-demand", label: "Cursos on demand" },
];

export function CatalogoView() {
  const [section, setSection] = useState<CourseType>("curso");
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<string>("Todas");
  // Decorative only — see the header comment. Kept as state purely so the
  // buttons/select can visually show a selection, never used to filter.
  const [masVendidos, setMasVendidos] = useState(false);
  const [nuevos, setNuevos] = useState(false);
  const [nivel, setNivel] = useState("Todos los niveles");

  const categoriaOptions = useMemo(() => ["Todas", ...categoriesFor(section)], [section]);

  // Switching sections can leave a categoria selected that doesn't exist
  // there (e.g. "Softs Skills" only has on-demand courses) — reset instead
  // of silently showing an empty grid with no explanation.
  useEffect(() => {
    setCategoria("Todas");
  }, [section]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(
      (c) =>
        c.tipo === section &&
        (categoria === "Todas" || c.categoria === categoria) &&
        (q === "" || c.nombre.toLowerCase().includes(q)),
    );
  }, [section, categoria, query]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sub-navegación lateral — the 4 sections, mapped 1:1 to course-catalog.json's "tipo" field. */}
      <aside className="hidden w-52 shrink-0 border-r border-border-soft bg-white px-3 py-6 lg:block">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3 py-2 text-left font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                section === s.id ? "bg-ink/5 font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Catálogo</h1>
          <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
            Todos los cursos, carreras y diplomaturas de Coderhouse.
          </p>

          {/* Mobile section picker — the sidebar above is lg-only. */}
          <div className="mb-4 flex gap-1 overflow-x-auto lg:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`shrink-0 rounded-pill px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs ${
                  section === s.id ? "bg-brand-hover text-white" : "bg-white text-ink-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar curso"
                className="w-56 rounded-pill border border-border-soft bg-white py-2 pl-9 pr-3 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-pill border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none"
            >
              {categoriaOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "Todas" ? "Categoría" : c}
                </option>
              ))}
            </select>

            {/* Decorative from here down — see doc comment. */}
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="rounded-pill border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink-muted outline-none"
            >
              <option>Todos los niveles</option>
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
            <button
              type="button"
              onClick={() => setMasVendidos((v) => !v)}
              className={`rounded-pill border border-border-soft px-3 py-2 font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                masVendidos ? "bg-ink/5 text-ink" : "bg-white text-ink-muted"
              }`}
            >
              Más vendidos
            </button>
            <button
              type="button"
              onClick={() => setNuevos((v) => !v)}
              className={`rounded-pill border border-border-soft px-3 py-2 font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                nuevos ? "bg-ink/5 text-ink" : "bg-white text-ink-muted"
              }`}
            >
              Nuevos
            </button>
          </div>

          {section === "on-demand" ? (
            <OnDemandList courses={filtered} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                  No encontramos cursos con esos filtros.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CatalogCourse }) {
  const hasPrice = course.precioFinal !== undefined;
  return (
    <div className="flex flex-col rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-pill bg-ink/5 px-2.5 py-1 font-['Inter:Regular',sans-serif] text-[11px] text-ink-muted">
          {course.categoria}
        </span>
        {course.descuento && (
          <span className="rounded-pill bg-brand-hover px-2.5 py-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[11px] text-white">
            {course.descuento}
          </span>
        )}
      </div>

      <h3 className="mb-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base leading-snug text-ink">
        {course.nombre}
      </h3>

      {(course.proximaFecha || course.horario) && (
        <p className="mb-1 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
          {course.proximaFecha}
          {course.proximaFecha && course.horario ? " · " : ""}
          {course.horario}
        </p>
      )}
      {course.proximaFecha && (
        <p className="mb-3 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">más fechas disponibles</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
        {hasPrice ? (
          <div className="flex items-baseline gap-1.5">
            {course.precioOriginal !== undefined && (
              <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted line-through">
                {formatPrice(course.precioOriginal)}
              </span>
            )}
            <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
              {formatPrice(course.precioFinal!)}
            </span>
          </div>
        ) : (
          <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{tipoLabel(course.tipo)}</span>
        )}
        <button
          type="button"
          className="shrink-0 rounded-pill bg-brand-hover px-4 py-1.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-xs text-white transition-transform hover:scale-105"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}

// on-demand courses have no price/schedule data — grouped by categoria as
// numbered lists ("rutas") instead of forcing the pricing-card shape onto
// data that doesn't have prices.
function OnDemandList({ courses }: { courses: CatalogCourse[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, CatalogCourse[]>();
    for (const c of courses) {
      if (!map.has(c.categoria)) map.set(c.categoria, []);
      map.get(c.categoria)!.push(c);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  if (grouped.length === 0) {
    return (
      <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">No encontramos cursos con esos filtros.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {grouped.map(([categoria, items]) => (
        <div key={categoria} className="rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{categoria}</h3>
          <ol className="space-y-1.5">
            {items.map((c, i) => (
              <li key={c.id} className="flex gap-2 font-['Inter:Regular',sans-serif] text-sm text-ink">
                <span className="shrink-0 text-ink-muted">{i + 1}.</span>
                {c.nombre}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function tipoLabel(tipo: CourseType): string {
  if (tipo === "carrera") return "Carrera";
  if (tipo === "diplomatura") return "Diplomatura";
  if (tipo === "on-demand") return "On-demand";
  return "Curso";
}

function formatPrice(n: number): string {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}
