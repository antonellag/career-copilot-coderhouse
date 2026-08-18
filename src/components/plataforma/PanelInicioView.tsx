import { LayoutDashboard } from "lucide-react";

/**
 * "Panel inicio" — required by the nav (src/components/plataforma/
 * PlataformaLayout.tsx) but its real content wasn't part of any prompt yet.
 * Placeholder only, same pattern as OfertaLaboralView.tsx.
 */
export function PanelInicioView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
        <LayoutDashboard className="h-6 w-6" />
      </span>
      <h1 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl text-ink">Panel inicio</h1>
      <p className="max-w-sm font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
        Próximamente vas a ver acá un resumen de tu actividad.
      </p>
    </div>
  );
}
