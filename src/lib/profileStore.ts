/**
 * Hands off raw /limbo data to the student platform (Plataforma) for the
 * CV builder (src/lib/cvParser.ts) — separate from the roadmap itself
 * (src/lib/ai/roadmapClient.ts), which only carries the AI-generated course
 * plan, not the source material the CV is built from.
 *
 * sessionStorage-backed, same pattern as roadmapClient.ts/roadmapProgress.ts
 * — no database, this is a demo hand-off within one browser session.
 */

export type ProfileInput = {
  /** Raw extracted CV text, exactly as read from the uploaded PDF — null if no CV was attached. */
  cvText: string | null;
  /** The person's own chat messages (Experiencia + Habilidades), in order — used as a fallback when there's no CV. */
  userAnswers: string[];
};

const STORAGE_KEY = "career-copilot-profile-input";

export function saveProfileInput(input: ProfileInput) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
}

export function loadProfileInput(): ProfileInput | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProfileInput;
  } catch {
    return null;
  }
}
