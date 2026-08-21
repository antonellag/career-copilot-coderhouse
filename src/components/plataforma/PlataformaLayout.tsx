import { Bell, CreditCard, Gift, LogOut, MessageSquareText, Rocket, Sparkles, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";
import { parseCv } from "@/lib/cvParser";
import { loadProfilePhotos } from "@/lib/profilePhotoStore";
import { loadProfileInput } from "@/lib/profileStore";

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
 *   profile menu (real feedback: this used to jump straight to the Perfil
 *   tab — it's supposed to be its own account dropdown instead, see
 *   ProfileMenu below).
 *   Sub-nav row — the 5 sections as plain TEXT links (bold + orange when
 *   active, not pill buttons — that's what the reference actually does),
 *   "Feedback" and "Referí y ganá" on the right. The "Buscar curso" box
 *   is NOT here — it's fixed over the Plan carrera canvas itself (see
 *   src/pages/Plataforma.tsx's MapaBody), not embedded in this shared shell.
 *
 * Mostly a shell — it owns no tab/roadmap state, just `activeTab`/
 * `onTabChange` and whatever the active tab renders as `children`
 * (src/pages/Plataforma.tsx still owns the roadmap/portfolio/etc. state) —
 * except ProfileMenu, which reads the profile snapshot (name/email/avatar)
 * directly from its own stores the same way the map's trigger card does,
 * rather than having that threaded down as props just for this one menu.
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
          <CoderhouseLogo className="h-7 w-auto" />
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
          <ProfileMenu onTabChange={onTabChange} />
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

// The avatar in the header used to jump straight to the Perfil tab — real
// feedback: it's supposed to be its own account dropdown (name/email,
// Mi perfil, Facturación, Explorar planes, Cerrar sesión), separate from
// the Perfil tab itself. "Mi perfil" is the one real link into that tab;
// Facturación/Explorar planes stay decorative, same as Feedback/Referí y
// ganá above — there's no billing or plans system behind this app.
// "Cerrar sesión" goes home, same real destination Limbo's own overflow
// menu (src/pages/Limbo.tsx) uses for "Salir" — there's no real auth
// session anywhere in this app to actually tear down.
function ProfileMenu({ onTabChange }: { onTabChange: (tab: PlataformaTab) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const photos = useMemo(() => loadProfilePhotos(), [open]);
  const cv = useMemo(() => parseCv(loadProfileInput(), null), [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Cuenta"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-brand-hover bg-ink text-white transition-opacity hover:opacity-90"
      >
        {photos.avatar ? <img src={photos.avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-20 w-64 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <div className="border-b border-border-soft px-4 py-3">
            <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{cv.nombre ?? "Tu perfil"}</p>
            {cv.email && <p className="truncate font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{cv.email}</p>}
          </div>
          <div className="py-1.5">
            <button
              type="button"
              onClick={() => {
                onTabChange("perfil");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-['Inter:Regular',sans-serif] text-sm text-ink transition-colors hover:bg-ink/5"
            >
              <UserRound className="h-4 w-4 text-ink-muted" />
              Mi perfil
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-['Inter:Regular',sans-serif] text-sm text-ink transition-colors hover:bg-ink/5"
            >
              <CreditCard className="h-4 w-4 text-ink-muted" />
              Facturación
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-['Inter:Regular',sans-serif] text-sm text-ink transition-colors hover:bg-ink/5"
            >
              <Sparkles className="h-4 w-4 text-ink-muted" />
              Explorar planes
            </button>
          </div>
          <div className="border-t border-border-soft py-1.5">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-brand-hover transition-colors hover:bg-brand-hover/5"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
