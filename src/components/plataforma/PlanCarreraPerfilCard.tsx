import { ChevronRight, MoreVertical, UserRound } from "lucide-react";
import { useMemo } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
import type { PerfilSection } from "@/components/plataforma/PerfilView";
import { loadProfileInput } from "@/lib/profileStore";

/**
 * Plan carrera's side profile-summary card, per the hand-drawn boceto.
 * Round two: the first pass repeated the trigger node's "quién sos"
 * summary (it showed the dominant specialization category as a subtitle,
 * same info the black "TU PERFIL" node already states) — real user
 * feedback was that both ended up saying the same thing on the same
 * screen. Fixed by giving each a distinct job instead of a distinct look:
 * the trigger node still summarizes identity, this card is now pure
 * navigation — no specialization subtitle, and every row jumps to where
 * that data actually lives (Perfil's Curriculum/Portfolio sections) rather
 * than repeating a summary of it here.
 *
 * "Plan de carrera" and "Estrategia y especialización" don't navigate —
 * both already describe the map on THIS screen, so they're shown as plain
 * (non-clickable) rows instead of linking to themselves.
 *
 * Still NOT a phase tracker: no done/active/upcoming states, no shared
 * component, no import from src/components/limbo/.
 */
export function PlanCarreraPerfilCard({
  roadmap,
  onNavigate,
}: {
  roadmap: Roadmap;
  onNavigate: (section: PerfilSection) => void;
}) {
  const cv = useMemo(() => parseCv(loadProfileInput(), roadmap.trigger.resumen), [roadmap]);

  const rows: { label: string; onClick?: () => void }[] = [
    { label: "Experiencia", onClick: () => onNavigate("curriculum") },
    { label: "Habilidades", onClick: () => onNavigate("curriculum") },
    { label: "Plan de carrera" },
    { label: "Estrategia y especialización" },
    { label: "Records", onClick: () => onNavigate("curriculum") },
    { label: "Proyectos", onClick: () => onNavigate("portfolio") },
  ];

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border-soft bg-white p-5 lg:block">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
            <UserRound className="h-5 w-5" />
          </span>
          <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{cv.nombre ?? "Nombre"}</p>
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
        <ProfileBlock label={rows[0].label} onClick={rows[0].onClick} />
        <ProfileBlock label={rows[1].label} onClick={rows[1].onClick} />
        <ProfileBlock label={rows[2].label} onClick={rows[2].onClick} />
      </div>

      <div className="my-3 border-t border-border-soft" />

      <div className="flex flex-col gap-2.5">
        <ProfileBlock label={rows[3].label} onClick={rows[3].onClick} />
        <ProfileBlock label={rows[4].label} onClick={rows[4].onClick} />
        <ProfileBlock label={rows[5].label} onClick={rows[5].onClick} />
      </div>
    </aside>
  );
}

function ProfileBlock({ label, onClick }: { label: string; onClick?: () => void }) {
  if (!onClick) {
    return (
      <div className="rounded-xl bg-ink/5 px-4 py-3 font-['Inter:Regular',sans-serif] text-sm text-ink">{label}</div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-xl bg-ink/5 px-4 py-3 text-left font-['Inter:Regular',sans-serif] text-sm text-ink transition-colors hover:bg-ink/10"
    >
      {label}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
    </button>
  );
}
