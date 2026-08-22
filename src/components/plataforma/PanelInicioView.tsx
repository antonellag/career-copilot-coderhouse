import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, Lock, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Roadmap, RoadmapBranch, RoadmapNode } from "@/lib/ai/roadmapClient";
import { temarioFor } from "@/lib/courseDetailContent";
import { pendingTasksFor } from "@/lib/panelInicioContent";
import { DEFAULT_COVER_GRADIENT } from "@/lib/profilePhotoStore";
import type { PlataformaTab } from "./PlataformaLayout";
import { categoryColor, categoryIcon, RoadmapCourseCard } from "./RoadmapCourseCard";
import type { CourseStatus } from "@/lib/roadmapProgress";

const ESTADO_OPTIONS: { label: string; value: "Todos" | CourseStatus }[] = [
  { label: "Estado", value: "Todos" },
  { label: "No iniciado", value: "no-iniciado" },
  { label: "En progreso", value: "en-progreso" },
  { label: "Completado", value: "completado" },
];

/**
 * "Panel inicio" — the first screen after logging in. Rebuilt from a
 * detailed sketch the user provided (real feedback: replace the previous
 * layout wholesale). Same real-vs-decorative split as before, just
 * reorganized:
 *
 * REAL (reads the same getStatus/roadmap state Plan carrera writes to,
 * nothing invented, nothing separately tracked):
 * - The 4 overview stat tiles' numbers (progreso, cursos activos,
 *   certificados) except "Promedio calificación", which is explicitly
 *   decorative (no grading system exists anywhere in this app) — kept
 *   only because the sketch called for a 4th tile and marked clearly in
 *   code, same "not real data" rule as everywhere else.
 * - "Plan de carrera": a Rama/Estado filter pair picks ONE branch at a
 *   time (not every branch shown at once like the previous version) —
 *   its real nodes render as cards. A node's real status decides which
 *   CARD TYPE it gets: "en progreso" gets ActiveCourseCard (real
 *   horario when the catalog has one, "Ingresar al curso" jumps to Plan
 *   carrera); anything else gets the same RoadmapCourseCard used
 *   elsewhere (Comprar, decorative), with a locked overlay when its
 *   branch-predecessor isn't completado yet — pure visual read of real
 *   state, not a second flag.
 *
 * DECORATIVE, explicitly (same fabricated-and-documented pattern as
 * courseDetailContent.ts/panelInicioContent.ts everywhere else in this
 * app):
 * - "Tareas pendientes": per-class task rows for whichever course(s) are
 *   "en progreso" — task text and "Clase N" numbering are example
 *   content (pendingTasksFor), never a real assignment system.
 * - The right sidebar's calendar shows the REAL current month and
 *   correctly highlights today (both real, from `new Date()`) — the
 *   agenda blocks under it are example content (temarioFor, keyed to the
 *   active course's real categoria for at least topical plausibility),
 *   and "Go premium" is decorative, same as the header's own
 *   "Upgrade a Pro" (no real paid tier exists).
 *
 * Dropped per direct feedback right after this rebuild shipped: the old
 * "Curso activo" panel (notificación/métricas de ejemplo/actividad
 * reciente/notas del profe/"Unirme a la clase") and its "Otros cursos en
 * progreso" list. Both were carried over unchanged from the previous
 * layout, but the sketch never called for them and they read as
 * redundant next to the new Plan de carrera cards + Tareas pendientes —
 * removed rather than kept "just in case".
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
  const allNodes = roadmap?.nodos ?? [];
  const activeNodes = allNodes.filter((n) => getStatus(n.id) === "en-progreso");
  const completadoCount = allNodes.filter((n) => getStatus(n.id) === "completado").length;
  const totalCount = allNodes.length;
  const progresoPct = totalCount > 0 ? Math.round((completadoCount / totalCount) * 100) : 0;

  const branches: RoadmapBranch[] = roadmap ? [roadmap.ramaPrincipal, ...roadmap.ramasComplementarias] : [];
  const [ramaFilter, setRamaFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<"Todos" | CourseStatus>("Todos");
  const selectedBranch = branches.find((b) => b.nombre === ramaFilter) ?? branches[0] ?? null;

  const visibleNodes = useMemo(() => {
    if (!selectedBranch) return [];
    return selectedBranch.nodos.filter((n) => estadoFilter === "Todos" || getStatus(n.id) === estadoFilter);
  }, [selectedBranch, estadoFilter, getStatus]);

  // The sidebar's agenda keys off whichever course is "en progreso" first —
  // Plan de carrera / Tareas pendientes above already show every active
  // course, so the sidebar doesn't need its own "other courses" list.
  const primaryActive = activeNodes[0] ?? null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Panel inicio</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Tu recorrido y tu curso activo, de un vistazo.</p>

        {!roadmap ? (
          <div className="flex flex-col items-center gap-2 rounded-[20px] border border-border-soft bg-white py-10 text-center">
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
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* MAIN COLUMN */}
            <div className="min-w-0 flex-1">
              {/* Overview — real counts, see module doc comment for the one exception. */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Progreso plan de carrera" value={`${progresoPct}%`} pct={progresoPct} />
                <StatTile
                  label="Cursos activos"
                  value={`${activeNodes.length}/${totalCount}`}
                  pct={totalCount > 0 ? (activeNodes.length / totalCount) * 100 : 0}
                />
                <StatTile label="Promedio calificación" value="89 ptos" pct={89} decorative />
                <StatTile
                  label="Certificados"
                  value={`${completadoCount}`}
                  pct={totalCount > 0 ? (completadoCount / totalCount) * 100 : 0}
                />
              </div>

              {/* Plan de carrera — Rama/Estado filtered card row. */}
              <div className="mb-6 rounded-[20px] border border-border-soft bg-white p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">Plan de carrera</h2>
                    <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                      Seleccioná la rama para ver tu plan de carrera y comenzar los cursos.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <FilterSelect
                      value={selectedBranch?.nombre ?? ""}
                      onChange={setRamaFilter}
                      options={branches.map((b) => ({ label: b.nombre, value: b.nombre }))}
                    />
                    <FilterSelect
                      value={estadoFilter}
                      onChange={(v) => setEstadoFilter(v as "Todos" | CourseStatus)}
                      options={ESTADO_OPTIONS}
                    />
                  </div>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
                  {visibleNodes.length === 0 ? (
                    <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                      No hay cursos con ese filtro en esta rama.
                    </p>
                  ) : (
                    visibleNodes.map((node) => {
                      const status = getStatus(node.id);
                      if (status === "en-progreso") {
                        return <ActiveCourseCard key={node.id} node={node} onTabChange={onTabChange} />;
                      }
                      const index = selectedBranch!.nodos.findIndex((n) => n.id === node.id);
                      const locked = isLocked(selectedBranch!.nodos, index, getStatus);
                      return (
                        <div key={node.id} className="relative shrink-0">
                          <RoadmapCourseCard node={node} status={status} />
                          {locked && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 text-ink-muted">
                                <Lock className="h-4 w-4" />
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tareas pendientes — example content, see doc comment. */}
              {activeNodes.length > 0 && <TareasPendientes nodes={activeNodes} />}
            </div>

            {/* SIDEBAR */}
            <aside className="w-full shrink-0 lg:w-[320px]">
              <ScheduleSidebar activeNode={primaryActive} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

// Real counts + a real ratio-based bar; "decorative" (Promedio calificación)
// is the one exception, no grading system exists to back it.
// `decorative` only documents intent in code (the "Promedio calificación"
// tile has no real grading system behind it) — no visual difference is
// shown to the person, same as every other decorative/real split in this
// app not being called out in the UI itself.
function StatTile({ label, value, pct }: { label: string; value: string; pct: number; decorative?: boolean }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-cream-soft/60 p-4">
      <span className="mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink/10" />
      <p className="mb-0.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl text-ink">{value}</p>
      <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-ink/10">
        <div className="h-full rounded-pill bg-brand-hover" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{label}</p>
    </div>
  );
}

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

// The "en curso" card style from the sketch — real photo/category cover
// when available, real horario when the catalog has one (falls back to
// "A tu ritmo" for on-demand courses, which never have a horario), and a
// decorative progress bar (no granular per-course completion % exists,
// only the 3-state no-iniciado/en-progreso/completado, so this is a fixed
// illustrative fill, never a real number).
function ActiveCourseCard({ node, onTabChange }: { node: RoadmapNode; onTabChange: (tab: PlataformaTab) => void }) {
  const curso = node.curso;
  const catColor = categoryColor(curso.categoria);
  const Icon = categoryIcon(curso.categoria);
  return (
    <div className="flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border-soft bg-white">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden">
        {curso.imagen ? (
          <img src={curso.imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: catColor.bg }}>
            <div className="flex h-full items-center justify-center">
              <Icon className="h-6 w-6" style={{ color: catColor.text }} />
            </div>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-pill bg-brand-hover/15 px-2.5 py-0.5 font-['Inter:SemiBold',sans-serif] text-[10px] font-semibold text-brand-hover">
          En curso
        </span>
      </div>
      <div className="p-3.5">
        <p className="mb-1 line-clamp-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm font-bold leading-tight text-ink">
          {curso.nombre}
        </p>
        <p className="mb-2.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{curso.horario ?? "A tu ritmo"}</p>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-pill bg-ink/10">
          <div className="h-full w-3/5 rounded-pill bg-brand-hover" />
        </div>
        <button
          type="button"
          onClick={() => onTabChange("plan-carrera")}
          className="w-full rounded-pill bg-brand-hover/10 px-3 py-2 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-brand-hover transition-colors hover:bg-brand-hover/15"
        >
          Ingresar al curso
        </button>
      </div>
    </div>
  );
}

// Purely a visual read of the real per-node status — not a stored flag.
function isLocked(branchNodes: RoadmapNode[], index: number, getStatus: (id: string) => CourseStatus): boolean {
  if (index <= 0) return false;
  const status = getStatus(branchNodes[index].id);
  if (status !== "no-iniciado") return false;
  return getStatus(branchNodes[index - 1].id) !== "completado";
}

// Example content (pendingTasksFor), restructured per-class per the
// sketch — one row per task, grouped under whichever course(s) are
// "en progreso". "Clase N" is a fabricated sequence number, same
// treatment as courseDetailContent.ts's fabricated module counts.
function TareasPendientes({ nodes }: { nodes: RoadmapNode[] }) {
  const rows = nodes.flatMap((n) =>
    pendingTasksFor(n.curso.categoria).map((tarea, i) => ({ node: n, clase: i + 1, tarea })),
  );
  if (rows.length === 0) return null;

  return (
    <div className="rounded-[20px] border border-border-soft bg-white p-6">
      <h2 className="mb-4 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">Tareas pendientes</h2>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const catColor = categoryColor(r.node.curso.categoria);
          const Icon = categoryIcon(r.node.curso.categoria);
          return (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-xl bg-cream-soft/60 p-3">
              {r.node.curso.imagen ? (
                <img src={r.node.curso.imagen} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
              ) : (
                <span
                  className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: catColor.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: catColor.text }} />
                </span>
              )}
              <div className="min-w-[140px]">
                <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{r.node.curso.nombre}</p>
                <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">Clase {r.clase}</p>
              </div>
              <p className="min-w-0 flex-1 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{r.tarea}</p>
              <button
                type="button"
                className="shrink-0 rounded-pill bg-brand-hover/10 px-4 py-2 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-brand-hover transition-colors hover:bg-brand-hover/15"
              >
                Hacer tarea
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Right sidebar — real calendar (today is genuinely today), example
// agenda blocks below (temarioFor, keyed to the active course's real
// categoria), decorative "Go premium" card (no real paid tier, same as
// the header's own "Upgrade a Pro").
function ScheduleSidebar({ activeNode }: { activeNode: RoadmapNode | null }) {
  const agenda = activeNode ? temarioFor(activeNode.curso.categoria).slice(0, 3) : [];
  const AGENDA_COLORS = ["bg-sky-50 text-sky-800", "bg-sky-50 text-sky-800", "bg-amber-50 text-amber-800"];
  const AGENDA_TIMES = ["9:00 - 10:30 AM", "11:00 AM - 12:30 PM", "1:30 - 2:30 PM"];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl text-ink">Schedule</h2>

      <MiniCalendar />

      {agenda.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {agenda.map((titulo, i) => (
            <div key={i} className={`rounded-xl px-4 py-3 ${AGENDA_COLORS[i % AGENDA_COLORS.length]}`}>
              <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm">{titulo}</p>
              <p className="font-['Inter:Regular',sans-serif] text-xs opacity-70">{AGENDA_TIMES[i % AGENDA_TIMES.length]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Same DEFAULT_COVER_GRADIENT used on the CV's cover photo and the
          catalog card placeholders — one consistent brand gradient across
          the app instead of a flat fill, per direct feedback. */}
      <div className="rounded-2xl px-5 py-6 text-center text-white" style={{ background: DEFAULT_COVER_GRADIENT }}>
        <Sparkles className="mx-auto mb-2 h-5 w-5" />
        <p className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base">Pasate a Pro</p>
        <button
          type="button"
          className="rounded-pill bg-white px-5 py-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-ink transition-transform hover:scale-105"
        >
          Quiero acceso
        </button>
      </div>
    </div>
  );
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// A real month calendar for the actual current month/year, today
// genuinely highlighted (both from `new Date()`) — no navigation, just a
// glanceable "where are we" like the sketch's calendar widget.
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  // Monday-first week, matching the sketch — JS getDay() is Sunday-first (0-6).
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(leadingBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <ChevronLeft className="h-4 w-4 text-ink-muted" />
        <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
          {MONTH_LABELS[month]} {year}
        </p>
        <ChevronRight className="h-4 w-4 text-ink-muted" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="font-['Inter:Regular',sans-serif] text-[10px] text-ink-muted">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`flex h-7 w-7 items-center justify-center rounded-full font-['Inter:Regular',sans-serif] text-xs ${
              day === today.getDate() ? "bg-ink text-white" : day ? "text-ink" : ""
            }`}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
