/**
 * Parses the "phase done" marker the Experiencia/Habilidades system prompts
 * (api/_lib/prompts.ts) are instructed to emit once they've gathered enough
 * for that phase's objective:
 *   <!--PHASE_COMPLETE-->
 * Same technique as careerProfile.ts's CAREER_PROFILE marker — lets the
 * model decide when a phase has enough signal instead of hardcoding a turn
 * count, while keeping the marker itself out of what's rendered in the chat.
 */

const MARKER_RE = /<!--PHASE_COMPLETE-->/;

export function extractPhaseComplete(text: string): { cleanText: string; complete: boolean } {
  const complete = MARKER_RE.test(text);
  const cleanText = text.replace(MARKER_RE, "").trim();
  return { cleanText, complete };
}
