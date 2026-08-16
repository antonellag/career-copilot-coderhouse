import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "./CoderhouseLogo";

/**
 * Floating pill navbar for the new video/image Hero.
 *
 * Content (links, CTA label, logo) is copied 1:1 from the existing site nav
 * (src/imports/1920WLight-1/index.tsx ~ line 13937, components `Links` /
 * `ElementoMenu*` / `Orange1`) — only the shape changed, from a full-width
 * sticky bar to a pill that hangs off the top edge, per this session's brief.
 * Colors are the shared tokens from src/index.css (--color-ink, --color-brand-hover).
 */

const NAV_LINKS = ["Cursos", "Carreras", "Diplomaturas", "Empresas", "Nuestros graduados"];

export function PillNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 sm:top-6">
      <nav className="flex items-center justify-between gap-4 rounded-pill border border-white/40 bg-cream-soft/95 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:px-6 sm:py-3">
        <Link to="/" className="shrink-0 text-ink">
          <CoderhouseLogo className="h-5 w-auto sm:h-6" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-ink tracking-[-0.28px] transition-colors hover:bg-ink/5"
              >
                {label}
                <ChevronDown className="h-3.5 w-3.5 text-ink/40" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 sm:block">
          <button
            type="button"
            className="rounded-pill bg-brand-hover px-6 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.03]"
          >
            Inscribirme ahora
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-ink lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="mt-2 flex flex-col gap-1 rounded-3xl border border-white/40 bg-cream-soft/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm lg:hidden">
          {NAV_LINKS.map((label) => (
            <button
              key={label}
              type="button"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-ink"
            >
              {label}
              <ChevronDown className="h-3.5 w-3.5 text-ink/40" strokeWidth={2} />
            </button>
          ))}
          <button
            type="button"
            className="mt-1 rounded-pill bg-brand-hover px-6 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white"
          >
            Inscribirme ahora
          </button>
        </div>
      )}
    </div>
  );
}
