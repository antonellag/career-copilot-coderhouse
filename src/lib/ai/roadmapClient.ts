/**
 * Client-side entry point for /api/roadmap (Fase 4's node-map roadmap
 * generation). Separate from client.ts's sendChatMessage — this isn't a
 * chat turn, see api/roadmap.ts.
 */

export type RoadmapTrigger = {
  experiencia: string;
  habilidades: string;
  planDeCarrera: string;
  estrategiaYEspecializacion: string;
};

export type RoadmapCourse = {
  id: string;
  nombre: string;
  categoria: string;
  tipo: "curso" | "carrera" | "diplomatura" | "on-demand";
};

/** Which of the 3 branches a node belongs to — see Roadmap's own doc comment for what each means. */
export type RoadmapNodeTipo = "principal" | "repaso" | "complementaria";

export type RoadmapNode = {
  id: string;
  orden: number;
  justificacion: string;
  curso: RoadmapCourse;
  /** Name of the branch this node belongs to — ramaPrincipal's nombre, ramaRepaso's, or a complementary branch's. */
  rama: string;
  tipo: RoadmapNodeTipo;
};

export type RoadmapBranch = {
  nombre: string;
  nodos: RoadmapNode[];
};

export type Roadmap = {
  trigger: RoadmapTrigger;
  /** What the person genuinely needs to learn/grow into their goal — never courses they already know (those go in ramaRepaso instead). */
  ramaPrincipal: RoadmapBranch;
  /** Courses covering skills/tools the CV or conversation already confirms the person has — a refresher, not new learning. Null when there's no real evidence of prior knowledge to point at (never fabricated). */
  ramaRepaso: RoadmapBranch | null;
  /** Optional transversal skills (Softs Skills/Negocios/Producto) the person can choose to pursue alongside ramaPrincipal. */
  ramasComplementarias: RoadmapBranch[];
  /** Flat, ALL nodes (principal + repaso + every complementary branch) — for consumers that don't need branch structure (CV certifications, portfolio, the map's search filter, the detail panel's node lookup). */
  nodos: RoadmapNode[];
};

export async function generateRoadmap(transcript: string, riasecLabels: string[]): Promise<Roadmap> {
  const response = await fetch("/api/roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, riasecLabels }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Roadmap request failed with status ${response.status}`);
  }

  return response.json();
}

const STORAGE_KEY = "career-copilot-roadmap";

export function saveRoadmap(roadmap: Roadmap) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
}

export function loadRoadmap(): Roadmap | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Roadmap;
  } catch {
    return null;
  }
}
