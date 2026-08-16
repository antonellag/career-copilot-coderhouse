import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, FileText, Loader2, Plus, Send, Settings2, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";
import { LimboSidebar } from "@/components/limbo/LimboSidebar";
import { extractCareerProfile } from "@/lib/ai/careerProfile";
import { useChat } from "@/lib/ai/useChat";
import { extractPdfText } from "@/lib/pdf/extractPdfText";

/**
 * /limbo — the discovery agent (mode: "discovery", see api/_lib/prompts.ts).
 * Independent space, reached only from the hero CTA (never linked in the
 * site navbar). Lighter/friendlier than the rest of the site: white/grid
 * background, a floating step sidebar, and a conversational start screen —
 * per this session's reference screenshot, closer to a creation tool
 * (Notion AI mood) than the institutional Coderhouse look.
 *
 * "Limbo" is this session's internal codename only (see
 * landing-arquitectura-ia.md) — it never appears in user-facing copy here.
 */

// The real site's full category list (src/imports/1920WLight-1's Categories
// section) — same 6 categories/images/order used there, not invented for
// this screen.
const CATEGORIES = [
  { label: "Programación y desarrollo", image: "/limbo/categoria-programacion.png" },
  { label: "Marketing digital", image: "/limbo/categoria-marketing.png" },
  { label: "Inteligencia Artificial", image: "/limbo/categoria-ia.png", badge: "NUEVO" },
  { label: "Diseño UX/UI", image: "/limbo/categoria-uxui.png" },
  { label: "Data", image: "/limbo/categoria-data.png" },
  { label: "Negocios", image: "/limbo/categoria-negocios.png" },
];

type CvState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "ready"; fileName: string; text: string }
  | { status: "error"; message: string };

const CV_ERROR_MESSAGES: Record<string, string> = {
  "not-a-pdf": "Por ahora solo podemos leer archivos PDF.",
  "too-large": "El archivo pesa más de 8MB — probá con uno más liviano.",
  "empty-or-scanned":
    "No pudimos leer texto en este PDF (puede ser una imagen escaneada). Sin problema, seguimos por acá.",
  "parse-failed": "Hubo un problema al leer el PDF. Sin problema, seguimos por acá.",
};

export default function Limbo() {
  const { messages, send, isLoading, error } = useChat("discovery");
  const [input, setInput] = useState("");
  const [cv, setCv] = useState<CvState>({ status: "idle" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the person re-pick the same file later if they remove it
    if (!file) return;

    setCv({ status: "loading", fileName: file.name });
    const result = await extractPdfText(file);
    if (result.ok) {
      setCv({ status: "ready", fileName: file.name, text: result.text });
    } else {
      setCv({ status: "error", message: CV_ERROR_MESSAGES[result.reason] });
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { profile } = useMemo(
    () => extractCareerProfile(lastAssistant?.content ?? ""),
    [lastAssistant],
  );

  const visibleMessages = messages.map((m) =>
    m.role === "assistant" ? { ...m, content: extractCareerProfile(m.content).cleanText } : m,
  );

  const startConversation = (openingMessage: string) => {
    if (started.current) return;
    started.current = true;
    // If a CV finished processing before the first message goes out, its
    // extracted text rides along as hidden context for the model — the
    // chat bubble still shows just `openingMessage`, nothing extra.
    const apiContent =
      cv.status === "ready"
        ? `--- CV adjunto (texto extraído) ---\n${cv.text}\n--- fin CV ---\n\n${openingMessage}`
        : undefined;
    send(openingMessage, apiContent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    startConversation(input);
    setInput("");
  };

  const handleCategoryClick = (label: string) => {
    startConversation(`Me interesa explorar ${label}. Contame vos por dónde empezamos.`);
  };

  if (profile && profile.paths.length > 0) {
    return (
      <LimboShell>
        <CareerProfileResult paths={profile.paths} />
      </LimboShell>
    );
  }

  return (
    <LimboShell>
      {messages.length === 0 ? (
        <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-['Inter:Regular',sans-serif] text-[26px] leading-tight text-ink sm:text-[44px]"
          >
            ¡Hola! Hablemos sobre
            <br />
            tu vocación y futuro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 max-w-lg font-['Inter:Regular',sans-serif] text-sm text-ink-muted sm:text-base"
          >
            Contanos sobre vos, tu experiencia laboral, habilidades y qué te gusta, podés incluso
            adjuntar tu CV
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 w-full min-w-0"
          >
            <CategoryCarousel onSelect={handleCategoryClick} />
          </motion.div>
        </div>
      ) : (
        <div ref={scrollRef} className="mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-6 py-8">
          {visibleMessages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand-hover px-4 py-3 font-['Inter:Regular',sans-serif] text-[15px] text-white"
                  : "max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-white px-4 py-3 font-['Inter:Regular',sans-serif] text-[15px] text-ink shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              }
            >
              {m.content}
            </motion.div>
          ))}
          {isLoading && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-white px-4 py-3 font-['Inter:Regular',sans-serif] text-[15px] text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              Pensando…
            </div>
          )}
          {error && <p className="font-['Inter:Regular',sans-serif] text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl shrink-0 px-6 pb-8">
        {/* CV status row — only rendered once a file's been picked, sits right
            above the input pill so it doesn't shift the pill's own height. */}
        {cv.status !== "idle" && (
          <div className="mb-2 flex items-center gap-2 px-1">
            {cv.status === "loading" && (
              <span className="flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Leyendo {cv.fileName}…
              </span>
            )}
            {cv.status === "ready" && (
              <span className="flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <FileText className="h-3.5 w-3.5 text-brand-hover" />
                {cv.fileName}
                <button
                  type="button"
                  onClick={() => setCv({ status: "idle" })}
                  aria-label="Quitar CV adjunto"
                  className="ml-1 text-ink-muted hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {cv.status === "error" && (
              <span className="flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {cv.message}
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 rounded-pill border border-border-soft bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white">
              <Wand2 className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hablá con el Experto IA de Coderhouse"
              disabled={isLoading}
              className="flex-1 bg-transparent px-1 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={cv.status === "loading"}
              aria-label="Adjuntar CV (PDF)"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white transition-transform hover:scale-105 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </LimboShell>
  );
}

function CategoryCarousel({ onSelect }: { onSelect: (label: string) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto max-w-3xl">
      <div
        ref={trackRef}
        className="scrollbar-none flex gap-4 overflow-x-auto scroll-smooth px-1 py-1"
        style={{ scrollSnapType: "x proximity" }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onSelect(c.label)}
            style={{ scrollSnapAlign: "start" }}
            className="w-[150px] shrink-0 rounded-2xl border border-border-soft bg-white p-2.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.03]"
          >
            <div className="mb-2 flex items-center justify-between gap-1">
              <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xs leading-tight text-ink">
                {c.label}
              </span>
              {c.badge && (
                <span className="shrink-0 rounded-pill bg-brand-hover px-1.5 py-0.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[9px] text-white">
                  {c.badge}
                </span>
              )}
            </div>
            <img src={c.image} alt="" className="h-20 w-full rounded-xl object-cover" />
          </button>
        ))}
      </div>

      {/* Edge chevrons — peek over the first/last card to hint there's more
          to scroll to, same idea as the real site's Categories carousel. */}
      <button
        type="button"
        onClick={() => scrollByCards(-1)}
        aria-label="Ver categorías anteriores"
        className="absolute -left-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.08)] sm:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCards(1)}
        aria-label="Ver más categorías"
        className="absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-ink shadow-[0_2px_10px_rgba(0,0,0,0.08)] sm:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function LimboShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grid relative h-screen">
      {/* Floating overlay, not a flex sibling — this way the main column
          below centers against the full viewport width instead of just the
          leftover space next to it (which read as "shifted right"). */}
      <div className="absolute left-4 top-4 hidden lg:block">
        <LimboSidebar />
      </div>

      <div className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            <CoderhouseLogo className="h-4 w-auto" />
          </Link>
          {/* No 'Career Copilot' badge here at lg — the floating sidebar
              (branding + logo) already covers that, and this header spans
              the FULL viewport width now (sidebar is an overlay, not a flex
              sibling) so nothing should sit under where the sidebar floats. */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="rounded-pill bg-white px-4 py-2 font-['Inter:Regular',sans-serif] text-xs text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:text-ink sm:text-sm"
            >
              Omitir test
            </Link>
            <button
              type="button"
              aria-label="Configuración"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <Settings2 className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <img src="/community/avatar-1.png" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

function CareerProfileResult({ paths }: { paths: { title: string; why: string }[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-2 font-['Plus_Jakarta_Sans:Bold',sans-serif] text-xs uppercase tracking-[0.6px] text-brand-hover">
            Tu Career Profile
          </p>
          <h1 className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[30px] leading-tight text-ink sm:text-[36px]">
            Esto es lo que vimos en tu conversación
          </h1>
          <p className="mb-10 font-['Inter:Regular',sans-serif] text-[15px] text-ink-muted">
            No es un puntaje — son caminos posibles a partir de lo que nos contaste recién.
          </p>
        </motion.div>

        <div className="space-y-4">
          {paths.map((path, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="rounded-2xl border border-border-soft bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
            >
              <h2 className="mb-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">
                {path.title}
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-relaxed text-ink-muted">
                {path.why}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
