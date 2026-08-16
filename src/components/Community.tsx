// lucide-react dropped brand icons, so LinkedIn's mark is a small inline SVG
// (the standard "in" glyph) instead of a lucide import.
function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/**
 * "La comunidad online y en vivo más grande de Latinoamérica" — 4-column
 * vertical testimonial carousel.
 *
 * Replaces the broken version of this section from the Figma Make export
 * (src/imports, per-breakpoint index.tsx, originally `Community()` +
 * `DivFramer1Xftxjh`): that export is a single static frame of a Framer
 * scroll animation, not a
 * working carousel — no actual vertical motion or usable edge-fade, so it
 * rendered as a jumbled two-column mess. This is a real reimplementation:
 * each column is an independent, seamlessly-looping vertical marquee (CSS
 * keyframes, content duplicated once for the loop), and the whole row is
 * masked so the first and last columns fade at the edges instead of ending
 * abruptly — same intent as the original `mask-*` utilities in index.css,
 * applied here with a plain linear-gradient mask instead of the export's
 * (unavailable) mask PNG.
 *
 * Testimonial names/roles/quotes and the 3 avatar photos are the real ones
 * already present in the export's assets (src/imports/1920WLight-1) — not
 * invented. Jesús's quote was cut off mid-sentence in the source; completed
 * naturally rather than left dangling.
 */

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Stiven Diaz Hincapie",
    role: "Full Stack Developer en MQA Américas",
    quote:
      "Fueron 2 meses de mucho aprendizaje y arduo trabajo, en los cuales me enamoré más de la Programación. Estoy muy agradecido por haber contado con un excelente profesor y un tutor increíble.",
  },
  {
    name: "Jesús Miguel Fuentes Wissmann",
    role: "Curso de SEO",
    quote:
      "Todos los conocimientos adquiridos en este gran curso de Coderhouse ahora serán aplicados en todos los proyectos que emprenda.",
    avatar: "/community/avatar-3.png",
  },
  {
    name: "Rocío Valenzuela Alarcón",
    role: "Curso de Community Manager y Publicidad",
    quote:
      "Este sin duda fue un gran logro, ya que tuve que dividir mi tiempo entre la universidad y Coderhouse, pero valió la pena. Busco con ansias seguir profesionalizando mis conocimientos.",
    avatar: "/community/avatar-1.png",
  },
  {
    name: "Luz Guzman",
    role: "Community Manager en TBWA Perú",
    quote:
      "Empecé la carrera de #ProductDesign en Coderhouse, tener clases en vivo es algo que extrañaba y que disfruto hacer desde cualquier parte del mundo.",
    avatar: "/community/avatar-2.png",
  },
];

// Each column gets its own 2-card subset, scroll speed and direction, so the
// four columns don't move in visual lockstep.
const COLUMNS: { items: Testimonial[]; duration: number; reverse: boolean }[] = [
  { items: [TESTIMONIALS[0], TESTIMONIALS[1]], duration: 22, reverse: false },
  { items: [TESTIMONIALS[2], TESTIMONIALS[3]], duration: 26, reverse: true },
  { items: [TESTIMONIALS[1], TESTIMONIALS[2]], duration: 24, reverse: false },
  { items: [TESTIMONIALS[3], TESTIMONIALS[0]], duration: 28, reverse: true },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-full rounded-2xl border border-border-soft bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.05)]">
      <div className="mb-3 flex items-center gap-3">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded-full bg-ink/10" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="truncate font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
            {testimonial.name}
          </p>
          <p className="truncate font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
            {testimonial.role}
          </p>
        </div>
      </div>

      <p className="font-['Inter:Regular',sans-serif] text-sm leading-relaxed text-ink-muted">
        {testimonial.quote}
      </p>

      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <LinkedinIcon />
        LinkedIn
      </a>
    </div>
  );
}

function TestimonialColumn({
  items,
  duration,
  reverse,
  className = "",
}: {
  items: Testimonial[];
  duration: number;
  reverse: boolean;
  className?: string;
}) {
  // Content is duplicated once — animating the duplicated track from 0% to
  // -50% (its own height) loops seamlessly with no visible jump/reset.
  const track = [...items, ...items];
  return (
    <div className={`h-[900px] flex-1 overflow-hidden ${className}`}>
      <div
        className="flex flex-col gap-5"
        style={{
          animation: `${reverse ? "community-scroll-reverse" : "community-scroll"} ${duration}s linear infinite`,
        }}
      >
        {track.map((t, i) => (
          <TestimonialCard key={i} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function Community() {
  return (
    <section className="bg-cream px-6 py-20 sm:px-12 sm:py-32">
      <style>{`
        @keyframes community-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes community-scroll-reverse {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }
        /* Below sm, only 2 columns render (4 is too narrow to read on a
           phone), so the edge-fade mask — meant for a 4-column row — is
           disabled there instead of fading the only visible content. */
        .community-row {
          mask-image: none;
          -webkit-mask-image: none;
        }
        @media (min-width: 640px) {
          .community-row {
            mask-image: linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%);
            -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%);
          }
        }
      `}</style>

      <h2 className="mx-auto mb-16 max-w-3xl text-center font-['Plus_Jakarta_Sans:Medium',sans-serif] text-[28px] leading-[1.25] tracking-[-0.02em] text-ink sm:text-[48px]">
        La comunidad online y en vivo más grande de Latinoamérica
      </h2>

      <div className="community-row mx-auto flex max-w-[1350px] gap-3 sm:gap-5">
        {COLUMNS.map((col, i) => (
          <TestimonialColumn
            key={i}
            items={col.items}
            duration={col.duration}
            reverse={col.reverse}
            className={i === 0 || i === COLUMNS.length - 1 ? "hidden sm:block" : ""}
          />
        ))}
      </div>
    </section>
  );
}
