import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Home hero — illustrated "island in the clouds" scene, per this session's
 * brief (landing-arquitectura-ia.md: introspection-with-company mood, not the
 * old stock video).
 *
 * The header (promo banner + sticky menu bar) is NOT part of this component —
 * it's <Navbar /> from MarketingLayout, rendered once above every marketing
 * page. This used to be a floating pill nav rendered here; that was wrong
 * (see Navbar.tsx for why) and was replaced site-wide.
 *
 * Assets are two constants below — swap them for final art without touching
 * the component. Both live in /public/hero so they're served as plain static
 * files (no bundler hashing needed while art is still a placeholder).
 */
const BACK_LAYER_SRC = "/hero/back-clouds.png";
const FRONT_LAYER_SRC = "/hero/front-character.png";

// Inline SVG feTurbulence noise, used as a subtle grain overlay so the hero
// doesn't feel like a flat photo. No external asset/network request.
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`,
  );

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-ink">
      {/* Background layer: clouds sky, slow "breathing" pan+zoom (not a scroll loop —
          it's a single photo, not a tileable texture, so a loop would show a seam). */}
      <motion.img
        src={BACK_LAYER_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        animate={{ x: ["0%", "-3%", "0%"], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Foreground layer: island + character, subtle independent drift for parallax depth. */}
      <motion.img
        src={FRONT_LAYER_SRC}
        alt="Una persona en su propio espacio, con su notebook, rodeada de nubes"
        className="absolute inset-0 h-full w-full object-cover object-top"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_DATA_URI}")` }}
      />

      {/* Readability gradient: transparent center, darker toward the edges/bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(38,7,0,0.35) 0%, rgba(38,7,0,0) 30%, rgba(38,7,0,0) 55%, rgba(38,7,0,0.75) 100%)",
        }}
      />

      {/* Copy + CTA — left-aligned. On mobile the character fills most of the
          frame, so the copy sits at the top, above it; from sm up there's
          room to vertically center it alongside the character instead. */}
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
        className="absolute inset-0 flex flex-col items-start justify-start px-6 pt-28 text-left sm:justify-center sm:px-16 sm:pt-0"
      >
        {/* Frosted glass card — the illustration behind was too busy for
            white text straight on top of it, so the copy gets its own
            translucent, blurred surface instead of relying only on the
            gradient overlay. */}
        <div className="flex flex-col items-start gap-5 rounded-3xl border border-white/30 bg-white/20 p-6 backdrop-blur-md sm:max-w-xl sm:p-8">
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[32px] uppercase leading-[1.15] tracking-[-0.02em] text-white sm:text-[44px]"
          >
            ¿Sabés qué te apasiona?
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-['Inter:Regular',sans-serif] text-base text-white/90 sm:text-lg"
          >
            Career Copilot te ayuda a descubrir tu camino antes de elegir qué estudiar, tomá las
            clases que te apasionan, en vivo con expertos de la industria.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Link
              to="/limbo"
              className="group inline-flex items-center gap-2.5 rounded-pill bg-brand-hover px-8 py-4 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-[1.03]"
            >
              Probá Career Copilot
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
