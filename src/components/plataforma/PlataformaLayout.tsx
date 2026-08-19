import { Bell, Gift, MessageSquareText, Rocket, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";

/**
 * The student platform's own shell — aligned to the Figma Make export the
 * user built by hand (Frame27/Frame26/Frame25 in that file's App.tsx),
 * deliberately independent of /limbo's UI. Imports nothing from
 * src/components/limbo/, uses the site's normal white/cream surfaces (no
 * .bg-grid — that class is /limbo-only, see its own comment in
 * src/index.css).
 *
 * Two rows, matching the reference:
 *   Top row — logo, "0/4 workshops" pill, "Upgrade a Pro", notifications,
 *   profile.
 *   Sub-nav row — the 5 sections as plain TEXT links (bold + orange when
 *   active, not pill buttons — that's what the reference actually does),
 *   "Feedback" and "Referí y ganá" on the right. The "Buscar curso" box
 *   is NOT here — it's fixed over the Plan carrera canvas itself (see
 *   src/pages/Plataforma.tsx's MapaBody), not embedded in this shared shell.
 *
 * Purely a shell: it owns no data, just `activeTab`/`onTabChange` and
 * whatever the active tab renders as `children` — src/pages/Plataforma.tsx
 * still owns the roadmap/portfolio/etc. state and decides what to render.
 */

export type PlataformaTab = "panel" | "plan-carrera" | "catalogo" | "perfil" | "novedades";

const TABS: { id: PlataformaTab; label: string; hideBelow?: string }[] = [
  { id: "panel", label: "Panel inicio", hideBelow: "sm" },
  { id: "plan-carrera", label: "Plan carrera" },
  { id: "catalogo", label: "Catálogo", hideBelow: "sm" },
  { id: "perfil", label: "Perfil", hideBelow: "md" },
  { id: "novedades", label: "Novedades", hideBelow: "md" },
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
        <span className="hidden rounded-pill bg-brand-hover/20 px-4 py-2.5 font-['Inter:SemiBold',sans-serif] text-sm font-semibold text-brand-hover lg:inline-block">
          0/4 workshops
        </span>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-pill bg-brand-hover px-4 py-2.5 font-['Inter:SemiBold',sans-serif] text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Upgrade a Pro</span>
          </button>
          <button
            type="button"
            aria-label="Notificaciones"
            className="hidden h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-ink/10 sm:flex"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Perfil"
            onClick={() => onTabChange("perfil")}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-ink/10 text-ink-muted transition-opacity hover:opacity-90"
          >
            <UserRound className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sub-nav row */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-b border-border-soft bg-white px-5 py-4 sm:px-8">
        <nav className="flex flex-wrap items-center gap-6 md:gap-10">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`whitespace-nowrap font-['Inter:Regular',sans-serif] text-sm transition-colors md:text-base ${
                  t.hideBelow === "sm" ? "hidden sm:inline" : t.hideBelow === "md" ? "hidden md:inline" : ""
                } ${active ? "font-extrabold text-brand-hover" : "font-normal text-ink hover:text-brand-hover"}`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-pill px-4 py-3 font-['Inter:Regular',sans-serif] text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <MessageSquareText className="h-4 w-4" />
            Feedback
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-pill border border-border-soft bg-white px-4 py-3 font-['Inter:Regular',sans-serif] text-sm text-ink transition-colors hover:bg-cream-soft"
          >
            <Gift className="h-4 w-4" />
            Referí y ganá
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
