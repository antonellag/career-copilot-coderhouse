/**
 * RIASEC (Holland Codes) forced-choice question bank for /limbo's Fase 3
 * (Test). Exactly the 10 pairs from prompt-claude-code-fases-limbo.md, used
 * verbatim — not invented, not reworded.
 *
 * Forced choice (2 options, pick one) instead of a 1-5 scale on purpose: a
 * scale collects a lot of noisy "3 out of 5" answers that carry weak signal.
 * Each option is worth exactly 1 point for its dimension.
 */

export type RiasecDimension = "R" | "I" | "A" | "S" | "E" | "C";

export const RIASEC_LABELS: Record<RiasecDimension, string> = {
  R: "Realista",
  I: "Investigador",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

export type RiasecOption = {
  text: string;
  dimension: RiasecDimension;
};

export type RiasecQuestion = {
  a: RiasecOption;
  b: RiasecOption;
};

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  { a: { text: "Armar o reparar algo con las manos", dimension: "R" }, b: { text: "Investigar por qué pasa algo hasta entenderlo", dimension: "I" } },
  { a: { text: "Crear algo original y estético", dimension: "A" }, b: { text: "Organizar información para que todo esté en orden", dimension: "C" } },
  { a: { text: "Ayudar a alguien a resolver un problema personal", dimension: "S" }, b: { text: "Liderar un proyecto y tomar decisiones", dimension: "E" } },
  { a: { text: "Analizar datos para encontrar un patrón", dimension: "I" }, b: { text: "Expresar una idea de forma creativa", dimension: "A" } },
  { a: { text: "Convencer a otros de una idea", dimension: "E" }, b: { text: "Seguir un proceso paso a paso sin errores", dimension: "C" } },
  { a: { text: "Trabajar con herramientas o tecnología concreta", dimension: "R" }, b: { text: "Escuchar y acompañar a otra persona", dimension: "S" } },
  { a: { text: "Diseñar algo desde cero", dimension: "A" }, b: { text: "Negociar o vender una idea", dimension: "E" } },
  { a: { text: "Resolver un problema lógico complejo", dimension: "I" }, b: { text: "Mantener todo prolijo y bien documentado", dimension: "C" } },
  { a: { text: "Trabajar en equipo coordinando personas", dimension: "S" }, b: { text: "Trabajar solo/a con foco y precisión", dimension: "C" } },
  { a: { text: "Hacer algo funcional y práctico", dimension: "R" }, b: { text: "Hacer algo visualmente atractivo", dimension: "A" } },
];

/** Every answer is one dimension letter (whichever option was tapped). */
export type RiasecAnswers = RiasecDimension[];

/**
 * Sums points per dimension and keeps the top 2-3. Ties are broken by
 * dimension order (R,I,A,S,E,C) — arbitrary but deterministic, per spec.
 */
export function scoreRiasec(answers: RiasecAnswers): RiasecDimension[] {
  const order: RiasecDimension[] = ["R", "I", "A", "S", "E", "C"];
  const scores = Object.fromEntries(order.map((d) => [d, 0])) as Record<RiasecDimension, number>;
  for (const d of answers) scores[d] += 1;

  const ranked = [...order].sort((a, b) => scores[b] - scores[a]);

  // Keep the top 2, and include a 3rd only if it's not clearly behind the
  // 2nd (avoids padding to 3 when someone has one runaway dimension).
  const top = ranked.slice(0, 3);
  if (top.length === 3 && scores[top[2]] === 0) return top.slice(0, 2);
  return top;
}
