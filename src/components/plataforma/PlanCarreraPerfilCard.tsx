import { Award, Briefcase, Compass, FolderKanban, Map as MapIcon, Wrench } from "lucide-react";
import { useMemo } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
import { loadProfileInput } from "@/lib/profileStore";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * Plan carrera's side profile-summary card. NOT a phase tracker — it just
 * happens to also be a short vertical list, which is what made it easy to
 * mistake for /limbo's LimboSidebar at a glance. Built from scratch here on
 * purpose: no shared component, no "done/active/upcoming" step states, no
 * import from src/components/limbo/. Rows are a static list of profile
 * categories, not sequential steps — none of them are "completed" relative
 * to the others.
 *
 * Data sources, real where cheap to derive, plain labels otherwise (same
 * "don't invent it" rule as everywhere else in this app):
 * - Nombre: src/lib/cvParser.ts, same parse CvView already uses.
 * - Carrera / Estrategia y especialización: the dominant category among
 *   this roadmap's non-transversal (core specialization) courses.
 * - Habilidades: count of tools parsed from the CV.
 * - Plan de carrera: number of courses in the roadmap.
 * - Records: number of courses marked "completado" (src/lib/roadmapProgress.ts).
 * - Experiencia / Proyectos: no reliable count is available in this card's
 *   scope (work-history entries and portfolio project counts live in
 *   different components) — shown as plain rows, no invented number.
 */
export function PlanCarreraPerfilCard({
  roadmap,
  getStatus,
}: {
  roadmap: Roadmap;
  getStatus: (id: string) => CourseStatus;
}) {
  const cv = useMemo(() => parseCv(loadProfileInput(), roadmap.trigger.resumen), [roadmap]);

  const especializacion = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of roadmap.nodos) {
      if (n.esTransversal) continue;
      counts.set(n.curso.categoria, (counts.get(n.curso.categoria) ?? 0) + 1);
    }
    let top: string | null = null;
    let topCount = 0;
    for (const [categoria, count] of counts) {
      if (count > topCount) {
        top = categoria;
        topCount = count;
      }
    }
    return top;
  }, [roadmap]);

  const completedCount = roadmap.nodos.filter((n) => getStatus(n.id) === "completado").length;

  const rows: { icon: typeof Briefcase; label: string; value?: string }[] = [
    { icon: Briefcase, label: "Experiencia" },
    { icon: Wrench, label: "Habilidades", value: cv.herramientas.length ? String(cv.herramientas.length) : undefined },
    { icon: MapIcon, label: "Plan de carrera", value: String(roadmap.nodos.length) },
    { icon: Compass, label: "Estrategia y especialización", value: especializacion ?? undefined },
    { icon: Award, label: "Records", value: String(completedCount) },
    { icon: FolderKanban, label: "Proyectos" },
  ];

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border-soft bg-white p-5 lg:block">
      <h2 className="mb-0.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">
        {cv.nombre ?? "Tu perfil"}
      </h2>
      <p className="mb-5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
        {especializacion ? `Camino en ${especializacion}` : "Armando tu camino"}
      </p>

      <div className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2">
            <span className="flex items-center gap-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink">
              <row.icon className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} />
              {row.label}
            </span>
            {row.value && (
              <span className="shrink-0 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
