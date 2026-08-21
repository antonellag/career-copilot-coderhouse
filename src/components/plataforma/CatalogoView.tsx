import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Clock,
  Code2,
  Database,
  Megaphone,
  Package,
  Palette,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
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
 *
 * Visual structure (sidebar shape, filter pills, card layout) aligned to
 * the Figma Make reference's CatalogDesktop. CourseCard's price/date/
 * discount/image fields are now real, scraped straight from the official
 * coderhouse.com pages for the 28 curso/carrera/diplomatura entries — see
 * src/lib/catalogClient.ts's doc comment. Still renders each field only
 * when it's actually present (the 29 on-demand courses have none of
 * this), same rule as everywhere else in this app; nothing here is
 * invented.
 *
 * One known caveat carried over from the source data: "próxima fecha" is
 * a snapshot from whenever that page was scraped, not a live value — it
 * can read as a date already in the past by the time someone looks at it.
 */

const SECTIONS: { id: CourseType; label: string; title: string; blurb: string }[] = [
  { id: "curso", label: "Cursos", title: "Cursos", blurb: "Aprendé en vivo con docentes de la industria y desarrollá las habilidades que el mercado laboral demanda." },
  { id: "carrera", label: "Carreras", title: "Carreras", blurb: "Formaciones completas, de punta a punta, para especializarte en un rol específico." },
  { id: "diplomatura", label: "Diplomaturas", title: "Diplomaturas", blurb: "Programas intensivos de profundización en un área concreta." },
  { id: "on-demand", label: "Cursos on demand", title: "Cursos on demand", blurb: "Contenido para avanzar a tu propio ritmo, organizado por categoría." },
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

  const activeSection = SECTIONS.find((s) => s.id === section)!;
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
      {/* Sub-navegación lateral — the 4 sections, mapped 1:1 to course-catalog.json's "tipo" field. Pill-shaped rows per the reference. */}
      <aside className="hidden w-56 shrink-0 border-r border-border-soft bg-white px-4 py-6 lg:block">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-pill px-6 py-3 text-left font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                section === s.id ? "bg-brand-hover/20 font-medium text-ink" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">{activeSection.title}</h1>
          <p className="mb-6 max-w-2xl font-['Inter:Regular',sans-serif] text-sm text-ink-muted">{activeSection.blurb}</p>

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
          <div className="mb-6 flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar curso"
                className="w-56 rounded-pill border border-border-soft bg-white py-3 pl-10 pr-4 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>

            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="appearance-none rounded-pill border border-border-soft bg-white py-3 pl-5 pr-10 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none"
              >
                {categoriaOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === "Todas" ? "Categoría" : c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            </div>

            {/* Decorative from here down — see doc comment. */}
            <div className="relative">
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="appearance-none rounded-pill border border-border-soft bg-white py-3 pl-5 pr-10 font-['Inter:Regular',sans-serif] text-sm text-ink-muted outline-none"
              >
                <option>Todos los niveles</option>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            </div>
            <button
              type="button"
              onClick={() => setMasVendidos((v) => !v)}
              className={`rounded-pill border border-border-soft px-5 py-3 font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                masVendidos ? "bg-ink/5 text-ink" : "bg-white text-ink-muted"
              }`}
            >
              Más vendidos
            </button>
            <button
              type="button"
              onClick={() => setNuevos((v) => !v)}
              className={`rounded-pill border border-border-soft px-5 py-3 font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                nuevos ? "bg-ink/5 text-ink" : "bg-white text-ink-muted"
              }`}
            >
              Nuevos
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}

// Category-tinted header block, same palette used for the Plan carrera map
// nodes (src/pages/Plataforma.tsx's CATEGORY_COLORS) so the two screens
// read as one system. No thumbnail image, discount badge, date, schedule,
// or price render unless the course actually has that field — none do yet
// in data/course-catalog.json, so those rows just don't appear rather than
// showing invented numbers like the Figma reference's example data did.
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Inteligencia Artificial": { bg: "#ffedd5", text: "#ff7d2a" },
  "Programación": { bg: "#dcfce7", text: "#16a34a" },
  "Diseño": { bg: "#fce7f3", text: "#be185d" },
  Data: { bg: "#dbeafe", text: "#2563eb" },
  "Marketing Digital": { bg: "#fef3c7", text: "#b45309" },
  Negocios: { bg: "#e0e7ff", text: "#4338ca" },
  Producto: { bg: "#ffe4e6", text: "#be123c" },
  "Softs Skills": { bg: "#f3f4f6", text: "#374151" },
};

function categoryColor(categoria: string): { bg: string; text: string } {
  return CATEGORY_COLORS[categoria] ?? { bg: "#f3f4f6", text: "#374151" };
}

// A category-specific icon (not always the same generic book) plus a
// faint repeated-dot texture behind it — real feedback: the flat
// color+centered-icon placeholder read as "broken/missing image" next to
// cards that do have a real photo, especially since 29 of 57 courses
// (every on-demand one) never will. Same treatment as the map's course
// nodes (src/pages/Plataforma.tsx's PlaceholderHeader) so both read as one
// system.
const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  "Inteligencia Artificial": Sparkles,
  "Programación": Code2,
  "Diseño": Palette,
  Data: Database,
  "Marketing Digital": Megaphone,
  Negocios: Briefcase,
  Producto: Package,
  "Softs Skills": Users,
};

function categoryIcon(categoria: string): typeof BookOpen {
  return CATEGORY_ICONS[categoria] ?? BookOpen;
}

function CourseCard({ course }: { course: CatalogCourse }) {
  const hasPrice = course.precioFinal !== undefined;
  const catColor = categoryColor(course.categoria);
  const Icon = categoryIcon(course.categoria);
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[20px] border border-border-soft bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Real course photo when we have one (28 of 57 courses do — see
          public/courses/); category-tinted icon block otherwise, same
          honest placeholder the map's course nodes use. */}
      <div className="relative aspect-[16/7] overflow-hidden" style={{ background: catColor.bg }}>
        {course.imagen ? (
          <img src={course.imagen} alt={course.nombre} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(${catColor.text}33 1px, transparent 1px)`,
                backgroundSize: "14px 14px",
              }}
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
              <Icon className="h-6 w-6" style={{ color: catColor.text }} />
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {/* Always a white pill, never catColor.bg — when there's no
              image the block behind it IS catColor.bg, so a same-color
              pill was invisible (real bug, flagged live against the map's
              identical badge). White stays visibly a pill either way. */}
          <span
            className="inline-flex items-center rounded-pill bg-white px-2.5 py-0.5 font-['Inter:SemiBold',sans-serif] text-xs font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
            style={{ color: catColor.text }}
          >
            {course.categoria}
          </span>
          {course.descuento && (
            <span className="rounded-pill bg-brand-hover px-2.5 py-0.5 font-['Inter:Bold',sans-serif] text-xs font-bold text-white">
              {course.descuento}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base font-bold leading-snug text-ink">
          {course.nombre}
        </h3>

        {(course.proximaFecha || course.horario) && (
          <div className="flex flex-col gap-0.5">
            {course.proximaFecha && (
              <span className="flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-sm text-ink">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                Próxima fecha: {course.proximaFecha}
                {course.extraFechas && (
                  <span className="whitespace-nowrap font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                    {course.extraFechas}
                  </span>
                )}
              </span>
            )}
            {course.horario && (
              <span className="flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-sm text-ink">
                <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                {course.horario}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2.5 pt-2">
          {hasPrice ? (
            <div className="flex flex-col gap-0.5 leading-tight">
              {course.cuotas !== undefined && (
                <span className="font-['Inter:Regular',sans-serif] text-xs font-medium text-ink-muted">
                  Hasta {course.cuotas} cuotas sin interés de
                </span>
              )}
              {course.precioCuota !== undefined && (
                <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl font-extrabold tracking-tight text-ink">
                  {formatPrice(course.precioCuota)}{" "}
                  <span className="text-xs font-extrabold text-ink">ARS</span>
                </span>
              )}
              <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                {course.precioOriginal !== undefined && (
                  <span className="mr-2 line-through">{formatPrice(course.precioOriginal)} ARS</span>
                )}
                Precio final: {formatPrice(course.precioFinal!)} ARS
              </span>
            </div>
          ) : (
            <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{tipoLabel(course.tipo)}</span>
          )}
          <button
            type="button"
            className="shrink-0 rounded-[10px] border border-border-soft bg-white px-4 py-2 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-ink transition-colors hover:bg-cream-soft"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

function tipoLabel(tipo: CourseType): string {
  if (tipo === "carrera") return "Carrera";
  if (tipo === "diplomatura") return "Diplomatura";
  if (tipo === "on-demand") return "On-demand";
  return "Curso";
}

// Plain "$111.300" — "ARS" is appended separately where it's shown
// (matching the real site's card layout, which never merges the two).
function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}
