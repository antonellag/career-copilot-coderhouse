import {
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Lock,
  MessageSquareQuote,
  Radio,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Roadmap, RoadmapBranch, RoadmapNode } from "@/lib/ai/roadmapClient";
import { DEFAULT_COVER_GRADIENT } from "@/lib/profilePhotoStore";
import { categoryIcon, RoadmapCourseCard } from "./RoadmapCourseCard";
import type { PlataformaTab } from "./PlataformaLayout";
import {
  metricsExample,
  NOTIFICATION_EXAMPLE,
  pendingTasksFor,
  recentActivityFor,
  teacherNotesFor,
  upcomingEventsFor,
} from "@/lib/panelInicioContent";
import type { CourseStatus } from "@/lib/roadmapProgress";

const ESTADO_OPTIONS: { label: string; value: "Todos" | CourseStatus }[] = [
  { label: "Estado", value: "Todos" },
  { label: "No iniciado", value: "no-iniciado" },
  { label: "En progreso", value: "en-progreso" },
  { label: "Completado", value: "completado" },
];

/**
 * "Panel inicio" — the first screen after logging in. Two parts of a
 * genuinely different nature, kept visually and structurally separate on
 * purpose (never blurred into looking like one system):
 *
 * PARTE 1 — a condensed, Duolingo-style version of the REAL Plan carrera
 * map: ramaPrincipal + ramasComplementarias, reading the exact same
 * `getStatus` state the full map writes to (src/lib/roadmapProgress.ts) —
 * no separate progress tracking exists here, this is the same state
 * rendered smaller. Real feedback: an earlier version showed this as plain
 * small circles ("muy básico") — each branch row is now a real progress
 * card (real % completado for that branch) followed by real course cards
 * (RoadmapCourseCard — the same card component the Plan carrera map and
 * Catálogo use, not a simplified stand-in), plus real categoría/estado
 * filters over the actual node data. A node's "locked" overlay is still
 * purely a visual read of that real state (no-iniciado AND the previous
 * node in its branch isn't completado yet) — not a second stored flag, and
 * unaffected by the filters (locking always reads the branch's real,
 * unfiltered order). "Ver plan completo" jumps to the real Plan carrera
 * tab. rama_repaso is intentionally left out of this condensed view — it's
 * an optional refresher offer, not part of the growth path this dashboard
 * is meant to summarize at a glance.
 *
 * PARTE 2 — the active course's work panel (tareas, actividad, calendario,
 * notas del profe, "Unirme a la clase", notificaciones, métricas). There's
 * no real cursada backend behind any course in this catalog (no classes,
 * submissions, or teacher messages exist), so every piece of content here
 * is explicitly decorative, sourced from src/lib/panelInicioContent.ts
 * (same fabricated-and-documented pattern as courseDetailContent.ts) —
 * derived from the active course's real categoria/nombre so it reads as
 * belonging to that course, never random or functional. "Unirme a la
 * clase" doesn't link to any real video service, same decorative-button
 * pattern as "Comprar" everywhere else in this app.
 */
export function PanelInicioView({
  roadmap,
  getStatus,
  onTabChange,
}: {
  roadmap: Roadmap | null;
  getStatus: (id: string) => CourseStatus;
  onTabChange: (tab: PlataformaTab) => void;
}) {
  // First course marked "en progreso" anywhere in the roadmap — if more
  // than one, real feedback said to just show the first (this panel is a
  // snapshot, not a course switcher).
  const activeNode = roadmap?.nodos.find((n) => getStatus(n.id) === "en-progreso") ?? null;

  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [estadoFilter, setEstadoFilter] = useState<"Todos" | CourseStatus>("Todos");

  const branches: RoadmapBranch[] = roadmap ? [roadmap.ramaPrincipal, ...roadmap.ramasComplementarias] : [];
  const categoriaOptions = useMemo(
    () => ["Todas", ...new Set(branches.flatMap((b) => b.nodos.map((n) => n.curso.categoria)))],
    [branches],
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Panel inicio</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Tu recorrido y tu curso activo, de un vistazo.</p>

        {/* PARTE 1 */}
        <div className="mb-8 rounded-[20px] border border-border-soft bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">Tu camino de carrera</h2>
            <button
              type="button"
              onClick={() => onTabChange("plan-carrera")}
              className="flex shrink-0 items-center gap-1 font-['Inter:Regular',sans-serif] text-xs text-brand-hover hover:underline"
            >
              Ver plan completo
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {roadmap ? (
            <div>
              {/* Real filters — categoría/estado over the real node data,
                  same appearance-none + ChevronDown fix as CatalogoView's
                  own filter selects. */}
              <div className="mb-5 flex flex-wrap gap-2.5">
                <FilterSelect value={categoriaFilter} onChange={setCategoriaFilter} options={categoriaOptions.map((c) => ({ label: c === "Todas" ? "Categoría" : c, value: c }))} />
                <FilterSelect value={estadoFilter} onChange={(v) => setEstadoFilter(v as "Todos" | CourseStatus)} options={ESTADO_OPTIONS} />
              </div>

              {branches.map((branch, i) => (
                <BranchRow
                  key={branch.nombre}
                  branch={branch}
                  getStatus={getStatus}
                  categoriaFilter={categoriaFilter}
                  estadoFilter={estadoFilter}
                  primary={i === 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Todavía no armaste tu recorrido.</p>
              <button
                type="button"
                onClick={() => onTabChange("plan-carrera")}
                className="mt-1 rounded-pill bg-brand-hover px-4 py-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-xs text-white transition-transform hover:scale-105"
              >
                Ir a Plan de carrera
              </button>
            </div>
          )}
        </div>

        {/* PARTE 2 */}
        {activeNode ? (
          <ActiveCoursePanel node={activeNode} onTabChange={onTabChange} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-border-soft bg-white px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">No tenés ningún curso en progreso</p>
            <p className="max-w-sm font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
              Activá un curso de tu recorrido en Plan de carrera para ver acá tu panel de trabajo.
            </p>
            <button
              type="button"
              onClick={() => onTabChange("plan-carrera")}
              className="mt-1 rounded-pill border border-border-soft bg-white px-4 py-2 font-['Inter:Regular',sans-serif] text-xs text-ink transition-colors hover:bg-cream-soft"
            >
              Ir a Plan de carrera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Decorative filter pill — appearance-none select + positioned ChevronDown,
// same fix already applied to CatalogoView's own filter selects (native
// chevrons used to sit flush against the pill's rounded border).
function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-pill border border-border-soft bg-white py-2.5 pl-4 pr-9 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

// One horizontally-scrolling branch row: a leading progress card (real %
// completado for THIS branch) followed by real course cards
// (RoadmapCourseCard — same card the Plan carrera map and Catálogo use,
// not a simplified stand-in). Locking is a pure visual read of the real
// per-node status against the branch's real (unfiltered) order — filtering
// only hides/shows cards, it never changes what counts as "previous".
function BranchRow({
  branch,
  getStatus,
  categoriaFilter,
  estadoFilter,
  primary,
}: {
  branch: RoadmapBranch;
  getStatus: (id: string) => CourseStatus;
  categoriaFilter: string;
  estadoFilter: "Todos" | CourseStatus;
  primary?: boolean;
}) {
  const visible = branch.nodos.filter(
    (n) =>
      (categoriaFilter === "Todas" || n.curso.categoria === categoriaFilter) &&
      (estadoFilter === "Todos" || getStatus(n.id) === estadoFilter),
  );
  if (visible.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <p className="mb-2.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{branch.nombre}</p>
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
        <BranchProgressCard branch={branch} getStatus={getStatus} />
        {visible.map((node) => {
          const index = branch.nodos.findIndex((n) => n.id === node.id);
          const locked = isLocked(branch.nodos, index, getStatus);
          return (
            <div key={node.id} className="relative shrink-0">
              <RoadmapCourseCard node={node} status={getStatus(node.id)} />
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 text-ink-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Real % completado for this branch — same DEFAULT_COVER_GRADIENT used on
// the CV's cover photo, for one consistent brand look across the app.
function BranchProgressCard({ branch, getStatus }: { branch: RoadmapBranch; getStatus: (id: string) => CourseStatus }) {
  const total = branch.nodos.length;
  const done = branch.nodos.filter((n) => getStatus(n.id) === "completado").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const Icon = categoryIcon(branch.nodos[0]?.curso.categoria ?? "");

  return (
    <div
      className="flex w-[170px] shrink-0 flex-col justify-between rounded-2xl p-4 text-white"
      style={{ background: DEFAULT_COVER_GRADIENT }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="mb-1 line-clamp-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm leading-tight">{branch.nombre}</p>
        <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-3xl font-extrabold leading-none">{pct}%</p>
        <p className="mt-0.5 font-['Inter:Regular',sans-serif] text-[11px] text-white/70">
          {done}/{total} completado
        </p>
      </div>
    </div>
  );
}

// Purely a visual read of the real per-node status — see PanelInicioView's
// own doc comment. Not a stored flag.
function isLocked(branchNodes: RoadmapNode[], index: number, getStatus: (id: string) => CourseStatus): boolean {
  if (index <= 0) return false;
  const status = getStatus(branchNodes[index].id);
  if (status !== "no-iniciado") return false;
  return getStatus(branchNodes[index - 1].id) !== "completado";
}

// PARTE 2 — see PanelInicioView's own doc comment for why every field
// below is decorative.
function ActiveCoursePanel({ node, onTabChange }: { node: RoadmapNode; onTabChange: (tab: PlataformaTab) => void }) {
  const curso = node.curso;
  const tasks = pendingTasksFor(curso.categoria);
  const activity = recentActivityFor(curso.nombre);
  const events = upcomingEventsFor();
  const notes = teacherNotesFor(curso.categoria);
  const metrics = metricsExample();

  return (
    <div className="overflow-hidden rounded-[20px] border border-border-soft bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft bg-brand-hover/[0.04] px-6 py-5">
        <div>
          <p className="mb-0.5 font-['Inter:Regular',sans-serif] text-xs uppercase tracking-wide text-brand-hover">En progreso</p>
          <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">{curso.nombre}</h2>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-brand-hover px-4 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-105"
        >
          <Radio className="h-4 w-4" />
          Unirme a la clase
        </button>
      </div>

      {/* Notificación destacada */}
      <div className="flex items-center gap-2.5 border-b border-border-soft bg-amber-50 px-6 py-3">
        <Bell className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="font-['Inter:Regular',sans-serif] text-xs text-amber-800">{NOTIFICATION_EXAMPLE}</p>
      </div>

      {/* Métricas de ejemplo */}
      <div className="grid grid-cols-3 gap-3 border-b border-border-soft px-6 py-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">{m.valor}</p>
            <p className="font-['Inter:Regular',sans-serif] text-[11px] text-ink-muted">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
        {/* Tareas pendientes */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
            <ClipboardList className="h-3.5 w-3.5 text-ink-muted" />
            Tareas pendientes de la semana
          </p>
          <ul className="flex flex-col gap-1.5">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-2 font-['Inter:Regular',sans-serif] text-sm text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-hover/60" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Calendario / próximas fechas */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
            <Calendar className="h-3.5 w-3.5 text-ink-muted" />
            Próximas fechas
          </p>
          <ul className="flex flex-col gap-1.5">
            {events.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-3 font-['Inter:Regular',sans-serif] text-sm text-ink">
                <span>{e.titulo}</span>
                <span className="shrink-0 text-xs text-ink-muted">{e.cuando}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actividad reciente */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
            <LayoutDashboard className="h-3.5 w-3.5 text-ink-muted" />
            Actividad reciente
          </p>
          <ul className="flex flex-col gap-2">
            {activity.map((a, i) => (
              <li key={i} className="font-['Inter:Regular',sans-serif] text-sm text-ink">
                {a.texto}
                <span className="ml-1.5 text-xs text-ink-muted">· {a.hace}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notas del profe */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
            <MessageSquareQuote className="h-3.5 w-3.5 text-ink-muted" />
            Notas del profe
          </p>
          <div className="flex flex-col gap-2">
            {notes.map((n, i) => (
              <div key={i} className="rounded-xl bg-ink/[0.03] p-3">
                <p className="mb-0.5 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-ink">{n.autor}</p>
                <p className="font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">{n.mensaje}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border-soft px-6 py-3">
        <button
          type="button"
          onClick={() => onTabChange("plan-carrera")}
          className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Ver este curso en tu recorrido
        </button>
      </div>
    </div>
  );
}
