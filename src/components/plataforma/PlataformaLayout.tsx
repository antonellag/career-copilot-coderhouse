import { Bell, Gift, MessageSquareText, Rocket, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";

/**
 * The student platform's own shell — built from scratch per the boceto,
 * deliberately independent of /limbo's UI. Imports nothing from
 * src/components/limbo/, uses the site's normal white/cream surfaces (no
 * .bg-grid — that class is /limbo-only, see its own comment in
 * src/index.css), and its own two-row nav instead of /limbo's floating
 * phase sidebar:
 *
 *   Top row — logo, a "0/4 workshops" pill, "Upgrade a Pro", notifications,
 *   profile (per the boceto: peach pill, rocket-icon CTA, dark avatar with
 *   an orange ring, notifications bell right next to it).
 *   Sub-nav row — the 5 real platform sections (Panel inicio/Plan carrera/
 *   Catálogo/Perfil/Novedades) on the left, "Feedback" and "Referí y ganá"
 *   on the right.
 *
 * Purely a shell: it owns no data, just `activeTab`/`onTabChange` and
 * whatever the active tab renders as `children` — src/pages/Plataforma.tsx
 * still owns the roadmap/portfolio/etc. state and decides what to render.
 */

export type PlataformaTab = "panel" | "plan-carrera" | "catalogo" | "perfil" | "novedades";

const TABS: { id: PlataformaTab; label: string }[] = [
  { id: "panel", label: "Panel inicio" },
  { id: "plan-carrera", label: "Plan carrera" },
  { id: "catalogo", label: "Catálogo" },
  { id: "perfil", label: "Perfil" },
  { id: "novedades", label: "Novedades" },
];

export function PlataformaLayout({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: PlataformaTab;
  onTabChange: (tab: PlataformaTab) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cream-soft">
      {/* Top row */}
      <div className="flex shrink-0 items-center gap-4 border-b border-border-soft bg-white px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <CoderhouseLogo className="h-5 w-auto" />
        </Link>
        <span className="hidden rounded-pill bg-brand-hover/10 px-3 py-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xs text-brand-hover sm:inline-block">
          0/4 workshops
        </span>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-hover px-4 py-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xs text-white transition-transform hover:scale-105 sm:text-sm"
          >
            <Rocket className="h-3.5 w-3.5" />
            Upgrade a Pro
          </button>
          <button
            type="button"
            aria-label="Notificaciones"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-hover bg-ink text-white transition-opacity hover:opacity-90"
          >
            <UserRound className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sub-nav row */}
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border-soft bg-white px-5 py-2 sm:px-8">
        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`rounded-pill px-3.5 py-1.5 font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                activeTab === t.id ? "bg-ink/5 font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted transition-colors hover:text-ink"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Feedback
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill border border-border-soft px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted transition-colors hover:text-ink"
          >
            <Gift className="h-3.5 w-3.5" />
            Referí y ganá
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
