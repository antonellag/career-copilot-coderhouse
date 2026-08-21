import { Send } from "lucide-react";
import { useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";

/**
 * Perfil > Oferta laboral. A visual replica of the real coderhouse.com
 * "Ticher" job-matching chat (the reference screenshot the user provided) —
 * one greeting message plus a filter-pill input bar. There's no real job
 * board or matching model behind this, so — same pattern as every other
 * decorative surface in this app (Feedback, Referí y ganá, "Más vendidos"
 * in Catálogo) — typing works, but sending does nothing; the pill filters
 * (Modalidad/Salario/Fecha) are visual only, nothing to filter against.
 *
 * The one real piece of logic: the greeting's closing "armá tu CV" nudge
 * only shows up when `roadmap` is null — i.e. the person hasn't gone
 * through Plan carrera yet, so there's genuinely no CV data behind their
 * profile for Ticher to match against. Once they have a roadmap, that CV
 * data exists (see CvView.tsx), so the nudge would be stale advice and is
 * dropped instead of shown unconditionally.
 */
export function OfertaLaboralView({
  roadmap,
  onGoToPlanCarrera,
}: {
  roadmap: Roadmap | null;
  onGoToPlanCarrera: () => void;
}) {
  const [draft, setDraft] = useState("");
  const hasCv = roadmap !== null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto flex h-full max-w-2xl flex-col">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Buscá trabajo con Ticher</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Avisos reales ordenados por afinidad con tu perfil.
        </p>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-lg">👋</span>
          <div className="rounded-2xl rounded-tl-sm bg-ink/5 px-4 py-3">
            <p className="font-['Inter:Regular',sans-serif] text-sm leading-relaxed text-ink">
              Hola 👋 Todavía no tengo tu CV cargado. Para recomendarte oportunidades contame{" "}
              <strong className="font-['Inter:SemiBold',sans-serif]">en qué país</strong> buscás,{" "}
              <strong className="font-['Inter:SemiBold',sans-serif]">qué rol</strong> te interesa y{" "}
              <strong className="font-['Inter:SemiBold',sans-serif]">qué seniority</strong> (junior, semi senior o
              senior){" "}
              {!hasCv && (
                <>
                  , o{" "}
                  <button
                    type="button"
                    onClick={onGoToPlanCarrera}
                    className="text-brand-hover underline hover:no-underline"
                  >
                    armá tu CV
                  </button>{" "}
                  para un match más fino.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-border-soft bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Contame qué buscás… ej: 'backend remoto en USD'"
              className="mb-3 w-full font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <FilterPill label="Modalidad" />
                <FilterPill label="Salario" />
                <FilterPill label="Fecha" />
              </div>
              <button
                type="button"
                disabled={!draft.trim()}
                aria-label="Enviar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white transition-transform hover:scale-105 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Decorative — no filter logic exists for job listings we don't have.
function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-pill border border-border-soft bg-white px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted transition-colors hover:text-ink"
    >
      {label}
    </button>
  );
}
