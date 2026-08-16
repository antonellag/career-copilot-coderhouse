import { motion } from "framer-motion";
import { ArrowLeft, Send, Settings2, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";
import { LimboSidebar } from "@/components/limbo/LimboSidebar";
import { extractCareerProfile } from "@/lib/ai/careerProfile";
import { useChat } from "@/lib/ai/useChat";

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

const CATEGORIES = [
  { label: "Programación y desarrollo", image: "/limbo/categoria-programacion.png" },
  { label: "Marketing digital", image: "/limbo/categoria-marketing.png" },
  { label: "Inteligencia Artificial", image: "/limbo/categoria-ia.png", badge: "NUEVO" },
  { label: "Diseño UX/UI", image: "/limbo/categoria-uxui.png" },
  { label: "Data", image: "/limbo/categoria-data.png" },
];

export default function Limbo() {
  const { messages, send, isLoading, error } = useChat("discovery");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

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
    send(openingMessage);
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
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-['Inter:Regular',sans-serif] text-[32px] leading-tight text-ink sm:text-[44px]"
          >
            Hablemos sobre
            <br />
            tu vocación y futuro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 font-['Inter:Regular',sans-serif] text-sm text-ink-muted sm:text-base"
          >
            Te ayudamos a gestionar tu plan estudiantil para convertirte en profesional
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => handleCategoryClick(c.label)}
                className="w-[150px] rounded-2xl border border-border-soft bg-white p-2.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.03]"
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
                <img
                  src={c.image}
                  alt=""
                  className="h-20 w-full rounded-xl object-cover"
                />
              </button>
            ))}
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

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl shrink-0 px-6 pb-8">
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
    </LimboShell>
  );
}

function LimboShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grid flex h-screen">
      <div className="hidden p-4 lg:block">
        <LimboSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            <CoderhouseLogo className="h-4 w-auto" />
          </Link>
          <span className="hidden items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:flex">
            <Sparkles className="h-3.5 w-3.5 text-brand-hover" />
            Career Copilot
          </span>

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
