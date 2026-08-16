import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";
import { extractCareerProfile } from "@/lib/ai/careerProfile";
import { useChat } from "@/lib/ai/useChat";

/**
 * /limbo — the discovery agent (mode: "discovery", see api/_lib/prompts.ts).
 * Independent space, reached only from the hero CTA (never linked in the
 * site navbar). Deliberately lighter/friendlier than the rest of the site —
 * a conversational creation tool (Notion AI mood), not the institutional
 * Coderhouse look: soft-bordered cards, a big friendly headline up top, the
 * conversation box docked at the bottom of the screen.
 *
 * "Limbo" is this session's internal codename only (see
 * landing-arquitectura-ia.md) — it never appears in user-facing copy here.
 */

const OPENING_PROMPT =
  "Hola, quiero descubrir qué podría estudiar. Contame vos por dónde empezamos.";

export default function Limbo() {
  const { messages, send, isLoading, error } = useChat("discovery");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Kick off the conversation automatically so the person lands on a live
  // question, not an empty box waiting for them to guess what to type.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    send(OPENING_PROMPT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { profile } = useMemo(
    () => extractCareerProfile(lastAssistant?.content ?? ""),
    [lastAssistant],
  );

  const visibleMessages = messages
    .filter((m) => !(m.role === "user" && m.content === OPENING_PROMPT))
    .map((m) => (m.role === "assistant" ? { ...m, content: extractCareerProfile(m.content).cleanText } : m));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  if (profile && profile.paths.length > 0) {
    return <CareerProfileResult paths={profile.paths} />;
  }

  return (
    <div className="flex h-screen flex-col bg-cream-soft">
      <header className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-ink-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          <CoderhouseLogo className="h-4 w-auto" />
        </Link>
        <span className="flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <Sparkles className="h-3.5 w-3.5 text-brand-hover" />
          Career Copilot
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-5 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="shrink-0 pt-2 pb-6 text-center font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[28px] leading-tight text-ink sm:text-[34px]"
        >
          Descubramos qué estudiar
        </motion.h1>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
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
          {error && (
            <p className="font-['Inter:Regular',sans-serif] text-sm text-red-600">{error}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 py-5"
        >
          <div className="flex items-center gap-2 rounded-3xl border border-border-soft bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu respuesta…"
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-2 font-['Inter:Regular',sans-serif] text-[15px] text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white transition-transform hover:scale-105 disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CareerProfileResult({ paths }: { paths: { title: string; why: string }[] }) {
  return (
    <div className="min-h-screen bg-cream-soft px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-8 flex w-fit items-center gap-2 text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <CoderhouseLogo className="h-4 w-auto" />
        </Link>

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
