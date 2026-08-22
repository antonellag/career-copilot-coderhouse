/**
 * Client-side entry point for /api/cvExtract — reads a CV's raw text and
 * classifies it into Destacados/Experiencia laboral/Educación/
 * Herramientas via one Gemini call. Separate from client.ts's
 * sendChatMessage and roadmapClient.ts's generateRoadmap — this isn't a
 * chat turn or the roadmap itself, see api/cvExtract.ts.
 */

export type CvExtractExperience = { puesto: string; empresa: string; fechas: string; descripcion: string };

export type CvExtractResult = {
  nombre: string | null;
  email: string | null;
  links: string[];
  experiencia: CvExtractExperience[];
  educacion: string[];
  herramientas: string[];
};

export async function extractCv(cvText: string): Promise<CvExtractResult> {
  const response = await fetch("/api/cvExtract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvText }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `CV extraction request failed with status ${response.status}`);
  }

  return response.json();
}

const STORAGE_KEY = "career-copilot-cv-extract";

type CachedExtract = { cvTextHash: string; result: CvExtractResult };

// Not cryptographic, just cheap — only needs to answer "is this the exact
// same CV text I already extracted?" so switching Perfil tabs back and
// forth doesn't re-call Gemini every time, only when the actual CV text
// changes (a new upload).
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return String(hash);
}

export function loadCachedCvExtract(cvText: string): CvExtractResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedExtract;
    return cached.cvTextHash === hashText(cvText) ? cached.result : null;
  } catch {
    return null;
  }
}

export function saveCvExtractCache(cvText: string, result: CvExtractResult) {
  const cached: CachedExtract = { cvTextHash: hashText(cvText), result };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
}
