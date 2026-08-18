import { MoreVertical, UserRound } from "lucide-react";
import { useMemo } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
import { loadProfileInput } from "@/lib/profileStore";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * Plan carrera's side profile-summary card, per the hand-drawn boceto:
 * avatar circle, Nombre/Carrera header with a "⋮" menu, then the 6
 * categories as two groups of full-width rounded blocks split by a
 * divider (Experiencia/Habilidades/Plan de carrera, then Estrategia y
 * especialización/Records/Proyectos) — not six individual icon rows like
 * the previous pass.
 *
 * Still NOT a phase tracker (see git history for why that distinction
 * matters — it's what got this mistaken for /limbo's LimboSidebar in the
 * first place): no done/active/upcoming states, no shared component, no
 * import from src/components/limbo/. The blocks are plain labels, no
 * invented counts — the boceto doesn't show numbers on them either.
 *
 * Data sources that ARE real: Nombre from src/lib/cvParser.ts (same parse
 * CvView already uses); Carrera is the dominant category among this
 * roadmap's non-transversal (core specialization) courses.
 */
export function PlanCarreraPerfilCard({
  roadmap,
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

  const groupOne = ["Experiencia", "Habilidades", "Plan de carrera"];
  const groupTwo = ["Estrategia y especialización", "Records", "Proyectos"];

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border-soft bg-white p-5 lg:block">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{cv.nombre ?? "Nombre"}</p>
            <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
              {especializacion ?? "Carrera"}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Más opciones"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {groupOne.map((label) => (
          <ProfileBlock key={label} label={label} />
        ))}
      </div>

      <div className="my-3 border-t border-border-soft" />

      <div className="flex flex-col gap-2.5">
        {groupTwo.map((label) => (
          <ProfileBlock key={label} label={label} />
        ))}
      </div>
    </aside>
  );
}

function ProfileBlock({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-ink/5 px-4 py-3 font-['Inter:Regular',sans-serif] text-sm text-ink">{label}</div>
  );
}
