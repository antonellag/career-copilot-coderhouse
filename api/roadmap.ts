import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildRoadmapPrompt, ROADMAP_RESPONSE_SCHEMA } from "./_lib/roadmapPrompt.js";
import { getCourseById, type Course } from "./_lib/courseCatalog.js";

/**
 * Fase 4 (Resultado) roadmap generation. Separate endpoint from /api/chat —
 * this isn't a chat turn, it's one structured-output call that returns a
 * course roadmap (see api/_lib/roadmapPrompt.ts for the schema), and the
 * model is restricted to picking course ids from data/course-catalog.json
 * (never a free-text course name).
 *
 * Request body: { transcript: string, riasecLabels: string[] }
 * Response body: { trigger: {resumen: string}, nodos: RoadmapNode[] }
 */

const MODEL_NAME = "gemini-3.5-flash";

type RawNode = { id: string; orden: number; esTransversal: boolean; justificacion: string };
type RawResponse = { trigger?: { resumen: string }; nodos?: RawNode[] };

export type RoadmapNode = {
  id: string;
  orden: number;
  esTransversal: boolean;
  justificacion: string;
  curso: Course;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    return;
  }

  const { transcript, riasecLabels } = req.body ?? {};

  if (typeof transcript !== "string" || !transcript.trim()) {
    res.status(400).json({ error: "transcript must be a non-empty string" });
    return;
  }
  if (!Array.isArray(riasecLabels) || !riasecLabels.every((l) => typeof l === "string")) {
    res.status(400).json({ error: "riasecLabels must be a string array" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ROADMAP_RESPONSE_SCHEMA,
      },
    });

    const prompt = buildRoadmapPrompt(transcript, riasecLabels);
    const result = await model.generateContent(prompt);
    const parsed: RawResponse = JSON.parse(result.response.text());

    // Never trust the model's course ids — filter out anything that isn't
    // in the real catalog, then re-sort by the model's requested order.
    const nodos: RoadmapNode[] = (parsed.nodos ?? [])
      .map((n) => {
        const curso = getCourseById(n.id);
        return curso
          ? { id: n.id, orden: n.orden, esTransversal: Boolean(n.esTransversal), justificacion: n.justificacion, curso }
          : null;
      })
      .filter((n): n is RoadmapNode => n !== null)
      .sort((a, b) => a.orden - b.orden);

    if (nodos.length === 0) {
      res.status(502).json({ error: "El modelo no devolvió ningún curso válido del catálogo. Probá de nuevo." });
      return;
    }

    const trigger = { resumen: parsed.trigger?.resumen?.trim() || "Perfil armado a partir de tu conversación." };

    res.status(200).json({ trigger, nodos });
  } catch (error) {
    console.error("[api/roadmap] Gemini call failed:", error);
    res.status(502).json({ error: "No pudimos armar tu recorrido. Probá de nuevo." });
  }
}
