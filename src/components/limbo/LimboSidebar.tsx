import { CheckCircle2, Folder, LayoutGrid, Sparkles } from "lucide-react";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";

/**
 * Floating step sidebar for /limbo, per this session's reference screenshot.
 * These are sequential steps, not buttons — nothing here is clickable.
 * "Experiencia" starts as the active/current step (per explicit request);
 * "Habilidades" / "Test" (the discovery conversation) / "Resultado" are the
 * rest of the flow but aren't wired to advance the step indicator yet
 * (that's the roadmap/Job Ready Score/intranet work explicitly out of scope
 * for this session).
 */
const STEPS = [
  { label: "Experiencia", icon: Folder, active: true },
  { label: "Habilidades", icon: LayoutGrid },
  { label: "Test", icon: Sparkles },
  { label: "Resultado", icon: CheckCircle2 },
];

export function LimboSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 rounded-2xl border border-border-soft bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] lg:block">
      <CoderhouseLogo className="mb-8 h-9 w-auto text-ink" />
      <nav className="flex flex-col gap-1">
        {STEPS.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-['Inter:Regular',sans-serif] text-sm ${
              active ? "bg-ink/5 font-medium text-ink" : "text-ink-muted"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
          </div>
        ))}
      </nav>
    </aside>
  );
}
