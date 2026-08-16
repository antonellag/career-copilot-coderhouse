import { Menu } from "lucide-react";
import { CoderhouseLogo } from "./CoderhouseLogo";

/**
 * Site header — rebuilt to match the real Coderhouse header (not a floating
 * pill): a promo banner on top that scrolls away normally, and a white/cream
 * menu bar underneath that stays fixed to the top of the viewport.
 *
 * Content and colors are copied 1:1 from the original nav in
 * src/imports/1920WLight-1/index.tsx (~line 130 for the promo banner,
 * ~line 13937 for Links/Logo1/Buttons) — only the previous session's pill
 * shape was wrong, not the palette or copy, which is why this reuses the
 * same shared tokens (brand-hover, ink, cream, surface-dark) as the rest of
 * the site instead of introducing new colors.
 */
export function Navbar() {
  return (
    <>
      {/* Promo banner — normal flow, scrolls away with the page */}
      <div className="relative z-30 flex flex-wrap items-center justify-center gap-3 bg-brand-hover px-4 py-1.5 text-center sm:gap-4">
        <span className="rounded-pill bg-surface-dark px-2.5 py-0.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[13px] text-white tracking-[-0.28px]">
          FLASH CODER ⚡
        </span>
        <p className="font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[13px] text-white tracking-[-0.14px]">
          Aprovechá <span className="font-['Inter:Bold',sans-serif] font-bold">hasta 35% OFF</span> y
          hasta <span className="font-['Inter:Bold',sans-serif] font-bold">12 cuotas sin interés</span> en
          CURSOS y CARRERAS
        </p>
        <span className="hidden font-['Inter:Regular',sans-serif] text-[13px] text-white/70 sm:inline">
          |
        </span>
        <p className="font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[13px] text-white tracking-[-0.14px]">
          Hasta el 16/08 ⏰
        </p>
      </div>

      {/* Menu bar — sticky, stays put once the promo banner scrolls past. Its
          containing block must span the full page (not a small wrapper sized
          to promo+nav) or the sticky range collapses to just the promo's
          height — that's why this isn't wrapped in its own div and instead
          sits directly in MarketingLayout's page-length flow. */}
      <nav className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-cream px-4 py-2.5 sm:px-8 sm:py-3">
        <a href="/" className="shrink-0 text-ink">
          <CoderhouseLogo className="h-8 w-auto sm:h-10" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ label, hasChevron }) => (
            <li key={label}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-ink tracking-[-0.28px] transition-colors hover:bg-ink/5"
              >
                {label}
                {hasChevron && <ChevronDown />}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-pill bg-brand-hover px-6 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.03] sm:block"
          >
            Inscribirme ahora
          </button>
          <button
            type="button"
            aria-label="Menú"
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white lg:flex"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden shrink-0 items-center gap-2 rounded-pill bg-surface-dark px-3.5 py-3 text-white lg:flex"
          >
            <span className="text-sm leading-none">🇦🇷</span>
            <ChevronDown className="text-white/70" />
          </button>
          <button
            type="button"
            aria-label="Abrir menú"
            className="rounded-full p-2 text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </>
  );
}

const NAV_LINKS = [
  { label: "Cursos", hasChevron: true },
  { label: "Carreras", hasChevron: true },
  { label: "Diplomaturas", hasChevron: true },
  { label: "Empresas", hasChevron: true },
  { label: "Nuestros graduados", hasChevron: false },
];

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 6" fill="none" className={`h-1.5 w-2.5 text-ink/40 ${className}`}>
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
