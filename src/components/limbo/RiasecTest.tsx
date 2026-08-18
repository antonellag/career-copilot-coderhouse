import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { RIASEC_QUESTIONS, scoreRiasec, type RiasecAnswers, type RiasecDimension } from "@/lib/riasec/questions";

/**
 * Fase 3 (Test) — forced-choice RIASEC card. One pair of options at a time,
 * tap one, card animates out and the next one animates in. No 1-5 scale on
 * purpose (see prompt-claude-code-fases-limbo.md: a scale collects noisy
 * middle-of-the-road answers that don't carry real signal).
 *
 * `inline`: renders inside the /limbo chat timeline (Limbo.tsx) instead of
 * as its own full-screen route step. The card mechanics (progress bar,
 * two-option card, tap-to-advance transition) are untouched — only the
 * outer wrapper's height/centering classes change, since inline it lives
 * inside a scrolling message list with its own height instead of owning
 * the whole viewport.
 */
export function RiasecTest({
  onComplete,
  inline = false,
}: {
  onComplete: (code: RiasecDimension[]) => void;
  inline?: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RiasecAnswers>([]);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);

  const total = RIASEC_QUESTIONS.length;
  const question = RIASEC_QUESTIONS[index];

  const handlePick = (side: "a" | "b") => {
    if (picked) return; // avoid double-taps mid-transition
    setPicked(side);
    const dimension = question[side].dimension;
    const next = [...answers, dimension];

    // Small delay so the tap's own highlight is visible before the card
    // transitions out — that's the "micro-feedback" the spec asked for.
    setTimeout(() => {
      setAnswers(next);
      setPicked(null);
      if (index + 1 < total) {
        setIndex(index + 1);
      } else {
        onComplete(scoreRiasec(next));
      }
    }, 220);
  };

  if (!started) {
    return (
      <div
        className={
          inline
            ? "flex flex-col items-center px-4 py-6 text-center"
            : "flex flex-1 flex-col items-center justify-center px-6 text-center"
        }
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xs uppercase tracking-[0.6px] text-brand-hover">
            Test vocacional
          </p>
          <h1 className="mb-3 max-w-md font-['Inter:Regular',sans-serif] text-[28px] leading-tight text-ink sm:text-[36px]">
            Un par de preguntas rápidas
          </h1>
          <p className="mx-auto mb-8 max-w-sm font-['Inter:Regular',sans-serif] text-sm text-ink-muted sm:text-base">
            No hay respuestas correctas, elegí lo que más te representa. Son 10 preguntas, tocá la
            opción que sientas más tuya.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="rounded-pill bg-brand-hover px-8 py-3.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-105"
          >
            Empezar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={
        inline
          ? "flex flex-col items-center px-4 py-6"
          : "flex flex-1 flex-col items-center justify-center px-6"
      }
    >
      <div className="mb-8 flex w-full max-w-md items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-ink/10">
          <motion.div
            className="h-full rounded-pill bg-brand-hover"
            animate={{ width: `${(index / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="shrink-0 font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
          {index + 1}/{total}
        </span>
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-3xl border border-border-soft bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8"
          >
            <p className="mb-6 text-center font-['Inter:Regular',sans-serif] text-xs uppercase tracking-[0.6px] text-ink-muted">
              ¿Qué preferís hacer?
            </p>
            <div className="flex flex-col gap-3">
              <OptionButton
                text={question.a.text}
                selected={picked === "a"}
                disabled={picked !== null}
                onClick={() => handlePick("a")}
              />
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border-soft" />
                <span className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">o</span>
                <span className="h-px flex-1 bg-border-soft" />
              </div>
              <OptionButton
                text={question.b.text}
                selected={picked === "b"}
                disabled={picked !== null}
                onClick={() => handlePick("b")}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OptionButton({
  text,
  selected,
  disabled,
  onClick,
}: {
  text: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: 0.97, backgroundColor: "var(--color-brand-hover)" } : { scale: 1 }}
      className={`rounded-2xl border px-5 py-4 text-left font-['Inter:Regular',sans-serif] text-[15px] transition-colors ${
        selected
          ? "border-brand-hover text-white"
          : "border-border-soft bg-white text-ink hover:border-brand-hover/40 hover:bg-ink/5"
      }`}
    >
      {text}
    </motion.button>
  );
}
