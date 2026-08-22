import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCvExtractPrompt, CV_EXTRACT_SCHEMA } from "./_lib/cvExtractPrompt.js";
import { clientKey, isRateLimited } from "./_lib/rateLimit.js";

/**
 * CV section extraction (src/components/plataforma/CvView.tsx) — reads a
 * CV's raw text and classifies it into Destacados (links)/Experiencia
 * laboral/Educación/Herramientas, one structured-output Gemini call, same
 * pattern as api/roadmap.ts. Replaces src/lib/cvParser.ts's regex-only
 * approach for these fields, which only matched a fixed line shape and
 * silently dumped anything else into an undifferentiated "extra" section —
 * see api/_lib/cvExtractPrompt.ts's own doc comment for the real CV that
 * exposed this.
 *
 * cvParser.ts's synchronous nombre/email extraction is untouched and still
 * used wherever a CV needs to render before this async call can complete
 * (the header's account menu, this same view's own header while loading).
 *
 * Request body: { cvText: string }
 * Response body: {
 *   nombre: string | null,
 *   email: string | null,
 *   links: string[],
 *   experiencia: { puesto, empresa, fechas, descripcion }[],
 *   educacion: string[],
 *   herramientas: string[],
 * }
 */

const MODEL_NAME = "gemini-3.5-flash";

// A CV this long is either pasted-in garbage or an attempt to run up the
// bill on one call — same cap and reasoning as api/roadmap.ts's transcript.
const MAX_CV_CHARS = 20_000;

type RawExperience = { puesto?: unknown; empresa?: unknown; fechas?: unknown; descripcion?: unknown };
type RawResponse = {
  nombre?: unknown;
  email?: unknown;
  links?: unknown;
  experiencia?: unknown;
  educacion?: unknown;
  herramientas?: unknown;
};

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (isRateLimited(clientKey(req))) {
    res.status(429).json({ error: "Demasiadas solicitudes. Esperá un minuto y probá de nuevo." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    return;
  }

  const { cvText } = req.body ?? {};

  if (typeof cvText !== "string" || !cvText.trim() || cvText.length > MAX_CV_CHARS) {
    res.status(400).json({ error: `cvText must be a non-empty string of at most ${MAX_CV_CHARS} characters` });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: CV_EXTRACT_SCHEMA,
      },
    });

    const prompt = buildCvExtractPrompt(cvText);
    const result = await model.generateContent(prompt);
    const parsed: RawResponse = JSON.parse(result.response.text());

    // Never trust the model's shape blindly — every field gets its own
    // defensive cleanup, same as api/roadmap.ts never trusting course ids.
    const experiencia = (Array.isArray(parsed.experiencia) ? (parsed.experiencia as RawExperience[]) : [])
      .filter((e) => typeof e?.puesto === "string" && e.puesto.trim().length > 0)
      .map((e) => ({
        puesto: (e.puesto as string).trim(),
        empresa: typeof e.empresa === "string" ? e.empresa.trim() : "",
        fechas: typeof e.fechas === "string" ? e.fechas.trim() : "",
        descripcion: typeof e.descripcion === "string" ? e.descripcion.trim() : "",
      }));

    res.status(200).json({
      nombre: typeof parsed.nombre === "string" && parsed.nombre.trim() ? parsed.nombre.trim() : null,
      email: typeof parsed.email === "string" && parsed.email.trim() ? parsed.email.trim() : null,
      links: cleanStringArray(parsed.links),
      experiencia,
      educacion: cleanStringArray(parsed.educacion),
      herramientas: cleanStringArray(parsed.herramientas),
    });
  } catch (error) {
    console.error("[api/cvExtract] Gemini call failed:", error);
    res.status(502).json({ error: "No pudimos leer tu CV. Probá de nuevo." });
  }
}
