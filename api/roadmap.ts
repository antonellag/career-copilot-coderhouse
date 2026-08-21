import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildRoadmapPrompt, ROADMAP_RESPONSE_SCHEMA } from "./_lib/roadmapPrompt.js";
import { getCourseById, type Course } from "./_lib/courseCatalog.js";

/**
 * Fase 4 (Resultado) roadmap generation. Separate endpoint from /api/chat —
 * this isn't a chat turn, it's one structured-output call that returns a
 * branching course roadmap (see api/_lib/roadmapPrompt.ts for the schema),
 * and the model is restricted to picking course ids from
 * data/course-catalog.json (never a free-text course name).
 *
 * Request body: { transcript: string, riasecLabels: string[] }
 * Response body: {
 *   trigger: RoadmapTrigger,
 *   ramaPrincipal: RoadmapBranch,
 *   ramaRepaso: RoadmapBranch | null,
 *   ramasComplementarias: RoadmapBranch[],
 *   nodos: RoadmapNode[]  // flat, ALL nodes (principal + repaso + every
 *                         // complementary branch) — kept for the existing
 *                         // consumers that never needed to know about
 *                         // branches (CV certifications, portfolio
 *                         // auto-projects, the map's own search filter,
 *                         // the detail panel's node lookup). The map UI
 *                         // reads ramaPrincipal/ramaRepaso/
 *                         // ramasComplementarias instead to draw branches.
 * }
 */

const MODEL_NAME = "gemini-3.5-flash";

// Hardcoded rather than trusting the model's own "nombre" for this one
// branch — direct product ask was this exact wording every time, not
// "whatever close paraphrase the model lands on".
const REPASO_BRANCH_NAME = "¿Necesitás repasar algo?";

export type RoadmapTrigger = {
  experiencia: string;
  habilidades: string;
  planDeCarrera: string;
  estrategiaYEspecializacion: string;
};

type RoadmapNodeTipo = "principal" | "repaso" | "complementaria";

type RawNode = { id: string; orden: number; justificacion: string };
type RawBranch = { nombre: string; nodos: RawNode[] };
type RawResponse = {
  trigger?: Partial<RoadmapTrigger>;
  rama_principal?: RawBranch;
  rama_repaso?: RawBranch;
  ramas_complementarias?: RawBranch[];
};

export type RoadmapNode = {
  id: string;
  orden: number;
  justificacion: string;
  curso: Course;
  /** Name of the branch this node belongs to — rama_principal's nombre, rama_repaso's, or a complementary branch's. */
  rama: string;
  tipo: RoadmapNodeTipo;
};

export type RoadmapBranch = {
  nombre: string;
  nodos: RoadmapNode[];
};

// `usedIds` is shared across every buildNodes() call for one roadmap (see
// the handler below) and mutated as nodes are accepted — with the volume
// raised to 15-20 courses per roadmap, the model repeating a course
// (within a branch, or the same id showing up across rama_principal,
// rama_repaso, and a complementary branch) got a lot more likely than it
// was at 4-7, so this is a real safeguard now, not defensive-for-its-own-
// sake. First occurrence wins; a later duplicate is silently dropped
// rather than shown twice on the map. Branches are built in priority
// order (principal, then repaso, then complementarias) so a contested id
// stays on the substantive learning path rather than the optional ones.
function buildNodes(
  raw: RawNode[] | undefined,
  rama: string,
  tipo: RoadmapNodeTipo,
  usedIds: Set<string>,
): RoadmapNode[] {
  return (raw ?? [])
    .map((n) => {
      if (usedIds.has(n.id)) return null;
      const curso = getCourseById(n.id);
      if (!curso) return null;
      usedIds.add(n.id);
      return { id: n.id, orden: n.orden, justificacion: n.justificacion, curso, rama, tipo };
    })
    .filter((n): n is RoadmapNode => n !== null)
    .sort((a, b) => a.orden - b.orden);
}

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
    // in the real catalog, then re-sort each branch by its own orden.
    // `usedIds` is shared across every buildNodes() call below so no
    // course id can appear twice anywhere in the roadmap — see buildNodes's
    // own doc comment for the priority order this relies on.
    const usedIds = new Set<string>();
    const ramaPrincipalNombre = parsed.rama_principal?.nombre?.trim() || "Tu especialización";
    const ramaPrincipalNodos = buildNodes(parsed.rama_principal?.nodos, ramaPrincipalNombre, "principal", usedIds);

    if (ramaPrincipalNodos.length === 0) {
      res.status(502).json({ error: "El modelo no devolvió ningún curso válido del catálogo. Probá de nuevo." });
      return;
    }

    // Optional — null when the model correctly found no real evidence of
    // prior knowledge to point at (see the prompt's own instruction not to
    // fabricate this), or when everything it suggested turned out to be a
    // duplicate of rama_principal.
    const ramaRepasoNodos = buildNodes(parsed.rama_repaso?.nodos, REPASO_BRANCH_NAME, "repaso", usedIds);
    const ramaRepaso: RoadmapBranch | null =
      ramaRepasoNodos.length > 0 ? { nombre: REPASO_BRANCH_NAME, nodos: ramaRepasoNodos } : null;

    // A complementary branch only survives if it has at least one valid
    // course left after dedup.
    const ramasComplementarias: RoadmapBranch[] = (parsed.ramas_complementarias ?? [])
      .map((r): RoadmapBranch | null => {
        const nombre = r.nombre?.trim();
        if (!nombre) return null;
        const nodos = buildNodes(r.nodos, nombre, "complementaria", usedIds);
        if (nodos.length === 0) return null;
        return { nombre, nodos };
      })
      .filter((r): r is RoadmapBranch => r !== null);

    const ramaPrincipal: RoadmapBranch = { nombre: ramaPrincipalNombre, nodos: ramaPrincipalNodos };
    const nodos: RoadmapNode[] = [
      ...ramaPrincipalNodos,
      ...ramaRepasoNodos,
      ...ramasComplementarias.flatMap((r) => r.nodos),
    ];

    const trigger: RoadmapTrigger = {
      experiencia: parsed.trigger?.experiencia?.trim() || "Perfil armado a partir de tu conversación.",
      habilidades: parsed.trigger?.habilidades?.trim() || "",
      planDeCarrera: parsed.trigger?.planDeCarrera?.trim() || "",
      estrategiaYEspecializacion: parsed.trigger?.estrategiaYEspecializacion?.trim() || "",
    };

    res.status(200).json({ trigger, ramaPrincipal, ramaRepaso, ramasComplementarias, nodos });
  } catch (error) {
    console.error("[api/roadmap] Gemini call failed:", error);
    res.status(502).json({ error: "No pudimos armar tu recorrido. Probá de nuevo." });
  }
}
