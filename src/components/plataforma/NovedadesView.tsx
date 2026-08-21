import { ArrowUpRight, CalendarClock, MessageCircle, Newspaper, Sparkles, Users } from "lucide-react";

/**
 * "Novedades" — an editorial, skim-it-and-move-on feed (real feedback:
 * "todo lo que sea para leer y visual pasajero"). There's no CMS or news
 * API behind any of this — NEWS/WORKSHOPS below are illustrative example
 * content only, same treatment as data/courseDetailContent.ts's fabricated
 * course copy: clearly not a live feed, never presented as real dated
 * facts (no invented stats/numbers, just generic descriptive blurbs). The
 * Discord card is decorative for the same reason — there's no real invite
 * link to send anyone to, so "Unirme" does nothing rather than linking
 * somewhere wrong.
 */

type NewsItem = { categoria: string; titulo: string; resumen: string; fecha: string };
type WorkshopItem = { dia: string; hora: string; titulo: string; categoria: string };

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Producto: { bg: "#ffe4e6", text: "#be123c" },
  Comunidad: { bg: "#e0e7ff", text: "#4338ca" },
  "Inteligencia Artificial": { bg: "#ffedd5", text: "#ff7d2a" },
  Empleo: { bg: "#dcfce7", text: "#16a34a" },
  Eventos: { bg: "#fce7f3", text: "#be185d" },
  Data: { bg: "#dbeafe", text: "#2563eb" },
};

function categoryColor(categoria: string) {
  return CATEGORY_COLORS[categoria] ?? { bg: "#f3f4f6", text: "#374151" };
}

const FEATURED: NewsItem = {
  categoria: "Producto",
  titulo: "Nueva sección Plan carrera: tu recorrido armado a partir de tu CV",
  resumen:
    "Subís tu CV, la IA arma un mapa de cursos pensado para tu perfil y podés reordenarlo o sumar el tuyo desde el catálogo.",
  fecha: "Esta semana",
};

const NEWS: NewsItem[] = [
  {
    categoria: "Inteligencia Artificial",
    titulo: "Se suman nuevos cursos de IA aplicada al catálogo",
    resumen: "Automatización, agentes y engineering — pensados para sumar a cualquier especialización.",
    fecha: "Hace 3 días",
  },
  {
    categoria: "Empleo",
    titulo: "Ticher: buscá trabajo directo desde tu perfil",
    resumen: "Contale qué buscás y te acerca avisos ordenados por afinidad con tu CV.",
    fecha: "Hace 1 semana",
  },
  {
    categoria: "Eventos",
    titulo: "Vuelven las Demo Day de fin de curso",
    resumen: "Mostrá tu proyecto final en vivo frente a otros estudiantes y mentores.",
    fecha: "Hace 2 semanas",
  },
  {
    categoria: "Data",
    titulo: "Nuevas rutas on-demand por categoría",
    resumen: "Diseño, Data y Negocios ya tienen su propio recorrido on-demand para avanzar a tu ritmo.",
    fecha: "Hace 2 semanas",
  },
];

const WORKSHOPS: WorkshopItem[] = [
  { dia: "Lun", hora: "19:00 hs", titulo: "Cómo armar un portfolio que consiga entrevistas", categoria: "Empleo" },
  { dia: "Mié", hora: "20:30 hs", titulo: "IA generativa para no-programadores", categoria: "Inteligencia Artificial" },
  { dia: "Jue", hora: "18:00 hs", titulo: "Data storytelling: contar historias con datos", categoria: "Data" },
  { dia: "Vie", hora: "19:30 hs", titulo: "Meetup de la comunidad: mostrá tu proyecto", categoria: "Comunidad" },
];

export function NovedadesView() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Novedades</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Lo último de Coderhouse, workshops de la semana y tu lugar en la comunidad.
        </p>

        {/* Featured — the one "read this first" item, editorial banner style. */}
        <div className="mb-8 overflow-hidden rounded-[20px] border border-border-soft bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <div
            className="relative flex h-40 items-end p-6 sm:h-48"
            style={{ background: "linear-gradient(120deg, #1a1a1a 0%, #3a2418 45%, #ff5a36 78%, #ff8a5c 100%)" }}
          >
            <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
              <Newspaper className="h-4.5 w-4.5" />
            </span>
            <span className="inline-flex w-fit items-center rounded-pill bg-white px-2.5 py-0.5 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-brand-hover shadow-sm">
              {FEATURED.categoria}
            </span>
          </div>
          <div className="p-6">
            <p className="mb-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{FEATURED.fecha}</p>
            <h2 className="mb-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">{FEATURED.titulo}</h2>
            <p className="font-['Inter:Regular',sans-serif] text-sm leading-relaxed text-ink-muted">{FEATURED.resumen}</p>
          </div>
        </div>

        {/* News grid — quick skim, one card per item. */}
        <h2 className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">Últimas noticias</h2>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {NEWS.map((n, i) => {
            const c = categoryColor(n.categoria);
            return (
              <div key={i} className="rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center rounded-pill px-2.5 py-0.5 font-['Inter:SemiBold',sans-serif] text-xs font-semibold"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {n.categoria}
                  </span>
                  <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{n.fecha}</span>
                </div>
                <h3 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm leading-snug text-ink">
                  {n.titulo}
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">{n.resumen}</p>
              </div>
            );
          })}
        </div>

        {/* Workshops — horizontal scroll strip, day/hour first since that's what matters at a glance. */}
        <h2 className="mb-3 flex items-center gap-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">
          <CalendarClock className="h-4 w-4 text-ink-muted" />
          Workshops de la semana
        </h2>
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {WORKSHOPS.map((w, i) => {
            const c = categoryColor(w.categoria);
            return (
              <div
                key={i}
                className="w-56 shrink-0 rounded-2xl border border-border-soft bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              >
                <p className="mb-2 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-ink">
                  {w.dia} · {w.hora}
                </p>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm leading-snug text-ink">
                  {w.titulo}
                </h3>
                <span
                  className="inline-flex items-center rounded-pill px-2.5 py-0.5 font-['Inter:SemiBold',sans-serif] text-[11px] font-semibold"
                  style={{ background: c.bg, color: c.text }}
                >
                  {w.categoria}
                </span>
              </div>
            );
          })}
        </div>

        {/* Community — Discord card, decorative CTA (see module doc comment). */}
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border-soft bg-[#5865F2]/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#5865F2]/15 text-[#5865F2]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="mb-0.5 flex items-center gap-1.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
                Comunidad de Discord
                <Sparkles className="h-3.5 w-3.5 text-brand-hover" />
              </h2>
              <p className="max-w-md font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">
                Sumate para resolver dudas con otros estudiantes, compartir tu progreso y enterarte de eventos
                antes que nadie.
              </p>
              <p className="mt-1.5 flex items-center gap-1 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                <Users className="h-3 w-3" />
                Estudiantes y mentores de toda la comunidad Coderhouse
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-[#5865F2] px-4 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-105"
          >
            Unirme
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
