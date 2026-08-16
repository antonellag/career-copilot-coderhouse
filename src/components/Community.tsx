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
 * vertical testimonial + photo carousel, closing in a "+500.000 graduados /
 * Ver opiniones" pill over a bottom fade.
 *
 * Replaces the broken version of this section from the Figma Make export
 * (src/imports, per-breakpoint index.tsx, originally `Community()` +
 * `DivFramer1Xftxjh`): that export is a single static frame of a Framer
 * scroll animation, not a working carousel — no actual vertical motion, no
 * community photos rendering in the columns, and no bottom fade/pill, so it
 * showed up as a jumbled two-column mess. This is a real reimplementation.
 *
 * Testimonial names/roles/quotes, the avatar photos and the community event
 * photos are the real ones already present in the export's assets
 * (src/imports/1920WLight-1, copied to public/community/) — not invented.
 * Jesús's quote was cut off mid-sentence in the source; completed naturally
 * rather than left dangling. The graduates pill reuses the same "+500.000
 * graduados" copy and avatar-stack idea as the export's Frame92/Frame93.
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

const PHOTOS = [
  "/community/photo-1.png",
  "/community/photo-2.png",
  "/community/photo-3.png",
  "/community/photo-4.png",
  "/community/photo-5.png",
  "/community/photo-6.png",
];

type ColumnItem = { kind: "testimonial"; data: Testimonial } | { kind: "photo"; src: string };

const t = (i: number): ColumnItem => ({ kind: "testimonial", data: TESTIMONIALS[i] });
const p = (i: number): ColumnItem => ({ kind: "photo", src: PHOTOS[i] });

// Each column mixes testimonial cards with real community photos (matching
// the real site's masonry look), at its own scroll speed/direction so the
// four columns don't move in visual lockstep.
const COLUMNS: { items: ColumnItem[]; duration: number; reverse: boolean }[] = [
  { items: [t(0), p(0), t(1)], duration: 24, reverse: false },
  { items: [t(2), p(1), p(2)], duration: 28, reverse: true },
  { items: [p(3), t(3), p(4)], duration: 26, reverse: false },
  { items: [p(5), t(0), t(2)], duration: 30, reverse: true },
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

function PhotoCard({ src }: { src: string }) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function TestimonialColumn({
  items,
  duration,
  reverse,
  className = "",
}: {
  items: ColumnItem[];
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
        {track.map((item, i) =>
          item.kind === "testimonial" ? (
            <TestimonialCard key={i} testimonial={item.data} />
          ) : (
            <PhotoCard key={i} src={item.src} />
          ),
        )}
      </div>
    </div>
  );
}

function GraduatesPill() {
  const avatars = ["/community/avatar-1.png", "/community/avatar-2.png", "/community/avatar-3.png"];
  return (
    <div className="flex items-center gap-3 rounded-pill bg-ink py-2 pl-2 pr-4 sm:gap-4 sm:py-2.5 sm:pl-2.5 sm:pr-5">
      <div className="flex items-center">
        {avatars.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-ink object-cover"
            style={{ marginLeft: i === 0 ? 0 : -10 }}
          />
        ))}
      </div>
      <span className="font-['Plus_Jakarta_Sans:Regular',sans-serif] text-xs text-white/90 sm:text-sm">
        +500.000 graduados
      </span>
      <span className="h-5 w-px bg-white/15" aria-hidden="true" />
      <button
        type="button"
        className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xs text-white sm:text-sm"
      >
        Ver opiniones
      </button>
    </div>
  );
}

export function Community() {
  return (
    <section className="bg-cream px-6 pb-8 pt-20 sm:px-12 sm:pb-12 sm:pt-32">
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

      <div className="relative">
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

        {/* Bottom fade into the pill, so the carousel doesn't end on a hard edge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream to-transparent sm:h-56" />

        <div className="absolute inset-x-0 bottom-4 flex justify-center sm:bottom-8">
          <GraduatesPill />
        </div>
      </div>
    </section>
  );
}
