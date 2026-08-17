import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Placeholder landing spot for whatever comes after someone picks a career
 * path at the end of /limbo — the real node-based student platform. Explicitly
 * out of scope this session (per prompt-claude-code-fases-limbo.md: no
 * design for it yet) — this route exists only so /limbo has somewhere real
 * to navigate to, not a dead end.
 */
export default function Plataforma() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-cream-soft px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-hover text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <h1 className="mb-3 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink sm:text-3xl">
          Estamos armando tu plataforma de aprendizaje
        </h1>
        <p className="mx-auto max-w-md font-['Inter:Regular',sans-serif] text-sm text-ink-muted sm:text-base">
          Ya guardamos tu camino elegido. En breve vas a poder ver tu roadmap y arrancar.
        </p>
      </motion.div>
    </div>
  );
}
