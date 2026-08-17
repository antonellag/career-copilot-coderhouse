import { Check, CheckCircle2, Folder, LayoutGrid, Sparkles } from "lucide-react";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";

export type LimboPhase = "experiencia" | "habilidades" | "test" | "resultado";

const PHASE_ORDER: LimboPhase[] = ["experiencia", "habilidades", "test", "resultado"];

const STEPS: { phase: LimboPhase; label: string; icon: typeof Folder }[] = [
  { phase: "experiencia", label: "Experiencia", icon: Folder },
  { phase: "habilidades", label: "Habilidades", icon: LayoutGrid },
  { phase: "test", label: "Test", icon: Sparkles },
  { phase: "resultado", label: "Resultado", icon: CheckCircle2 },
];

/**
 * Floating step sidebar for /limbo. These are sequential steps, not buttons
 * — nothing here is clickable, and you can't jump ahead. Reflects the
 * person's real current phase (passed down from src/pages/Limbo.tsx's phase
 * state machine): steps before the current one show a checkmark (done),
 * the current one is highlighted, steps after are muted (not reached yet).
 */
export function LimboSidebar({ currentPhase }: { currentPhase: LimboPhase }) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <aside className="hidden w-60 shrink-0 rounded-2xl border border-border-soft bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] lg:block">
      <CoderhouseLogo className="mb-8 h-9 w-auto text-ink" />
      <nav className="flex flex-col gap-1">
        {STEPS.map(({ phase, label, icon: Icon }, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          return (
            <div
              key={phase}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-['Inter:Regular',sans-serif] text-sm ${
                isActive ? "bg-ink/5 font-medium text-ink" : isDone ? "text-ink" : "text-ink-muted"
              }`}
            >
              {isDone ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              ) : (
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              )}
              {label}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
