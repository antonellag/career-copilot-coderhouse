import { Briefcase } from "lucide-react";

/**
 * Perfil > Oferta laboral. Placeholder only — the real content (matching,
 * job listings, whatever it ends up being) comes in a separate prompt with
 * exact production HTML to match. This is just the nav destination so
 * "Oferta laboral" isn't a dead link.
 */
export function OfertaLaboralView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
        <Briefcase className="h-6 w-6" />
      </span>
      <h1 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl text-ink">Oferta laboral</h1>
      <p className="max-w-sm font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
        Próximamente vas a poder ver acá oportunidades laborales para tu perfil.
      </p>
    </div>
  );
}
