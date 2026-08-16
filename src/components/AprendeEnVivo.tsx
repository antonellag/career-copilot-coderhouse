/**
 * "APRENDÉ [cloud ring] EN VIVO" slogan card.
 *
 * Replaces the broken version from the Figma Make export (src/imports,
 * per-breakpoint index.tsx, originally `Slogan()` / `Card()`): that export
 * hardcodes a 250px flex gap between "Aprendé" and "en vivo" (Card()'s
 * `gap-[249.99px]`) that only made sense inside Figma's exact-canvas export,
 * not a real responsive page — it rendered as three widely separated,
 * oddly-proportioned pieces instead of the tight, single composition the
 * real site has.
 *
 * The gradient colors and the cloud-ring icon are the real ones from the
 * export (Card()'s inline SVG gradient stops; the icon image copied to
 * public/community/cloud-ring.png) — not invented. The icon keeps the
 * original's `mix-blend-screen` so its black background disappears into the
 * gradient.
 */
export function AprendeEnVivo() {
  return (
    <div className="mx-auto w-full max-w-[1350px]">
      <div
        className="relative overflow-hidden rounded-[40px] px-8 py-16 text-center sm:px-16 sm:py-20"
        style={{
          background: "radial-gradient(140% 120% at 50% 0%, #f6b4cc 0%, #ffac8e 48%, #ffc485 100%)",
        }}
      >
        {/* Decorative side clouds bleeding past the card edges */}
        <img
          src="/community/nube-decorativa.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/2 hidden w-72 -translate-y-1/2 mix-blend-screen sm:block"
        />
        <img
          src="/community/nube-decorativa.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 hidden w-72 -translate-y-1/2 scale-x-[-1] mix-blend-screen sm:block"
        />

        <p className="font-['Inter:Regular',sans-serif] text-[40px] font-bold uppercase leading-[1] tracking-[-0.02em] text-ink sm:text-[64px] lg:text-[90px]">
          Aprendé
        </p>
        <img
          src="/community/cloud-ring.png"
          alt=""
          aria-hidden="true"
          className="relative z-10 mx-auto -my-2 h-[70px] w-auto mix-blend-screen sm:-my-3 sm:h-[110px] lg:h-[150px]"
        />
        <p className="font-['Inter:Regular',sans-serif] text-[40px] font-bold uppercase leading-[1] tracking-[-0.02em] text-ink sm:text-[64px] lg:text-[90px]">
          en vivo
        </p>
      </div>
    </div>
  );
}
