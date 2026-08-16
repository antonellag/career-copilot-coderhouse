import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, Send, Wand2, X } from "lucide-react";
import { useState } from "react";
import { useChat } from "@/lib/ai/useChat";

/**
 * Footer sales/support widget ("sales" mode — see api/_lib/prompts.ts).
 * Lives on every marketing page except /limbo (rendered from MarketingLayout,
 * not from App directly, so it never mounts on the discovery route).
 *
 * Deliberately smaller and quieter than the hero's "Probá Career Copilot"
 * CTA: a compact pill, muted colors, tucked in a corner — a side door for
 * someone who already knows what they want, not a competing headline action.
 */
export function SalesWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, send, isLoading, error } = useChat("sales");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex h-[420px] w-[calc(100vw-2rem)] max-w-[340px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-cream-soft shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-border-soft bg-cream px-4 py-3">
              <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
                Asistente de Coderhouse
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                className="rounded-full p-1 text-ink-muted hover:bg-ink/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                  ¿Tenés dudas sobre un curso, precio o modalidad? Preguntame.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 font-['Inter:Regular',sans-serif] text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-brand-hover text-white"
                      : "bg-ink/5 text-ink"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {isLoading && (
                <div className="max-w-[85%] rounded-2xl bg-ink/5 px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                  Escribiendo…
                </div>
              )}
              {error && (
                <p className="font-['Inter:Regular',sans-serif] text-sm text-red-600">{error}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border-soft p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu pregunta…"
                className="flex-1 rounded-full border border-border-soft bg-white px-3.5 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Enviar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div className="flex items-center gap-3 rounded-pill border border-white/40 bg-white/30 py-1.5 pl-1.5 pr-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-lg">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2.5 rounded-pill py-1 pl-1 pr-3 text-left transition-opacity hover:opacity-80"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-hover text-white">
              <Wand2 className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="hidden font-['Inter:Regular',sans-serif] text-sm text-ink sm:inline">
              Hablá con el Experto IA de Coderhouse
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white sm:flex"
          >
            <Keyboard className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-pill bg-brand-hover px-5 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-[1.03]"
          >
            Hablar
          </button>
        </div>
      )}
    </div>
  );
}
