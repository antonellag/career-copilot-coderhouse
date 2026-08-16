/**
 * Parses the closing "Career Profile" marker the discovery system prompt
 * (api/_lib/prompts.ts) is instructed to emit once the conversation wraps up:
 *   <!--CAREER_PROFILE:{"paths":[{"title":"...","why":"..."}]}-->
 * Used only by /limbo (Piece 4) — the sales widget never sees this format.
 */

export type CareerPath = {
  title: string;
  why: string;
};

export type CareerProfile = {
  paths: CareerPath[];
};

const MARKER_RE = /<!--CAREER_PROFILE:(.+?)-->/s;

export function extractCareerProfile(text: string): {
  cleanText: string;
  profile: CareerProfile | null;
} {
  const match = text.match(MARKER_RE);
  if (!match) return { cleanText: text, profile: null };

  const cleanText = text.replace(MARKER_RE, "").trim();

  try {
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed.paths)) return { cleanText, profile: null };
    return { cleanText, profile: parsed as CareerProfile };
  } catch {
    return { cleanText, profile: null };
  }
}
