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

export type RoadmapNode = {
  id: string;
  orden: number;
  justificacion: string;
  curso: RoadmapCourse;
  /** Name of the branch this node belongs to — ramaPrincipal's nombre, or a complementary branch's. */
  rama: string;
  esPrincipal: boolean;
};

export type RoadmapBranch = {
  nombre: string;
  /** Only set on complementary branches — id of the ramaPrincipal node it forks from. */
  naceDesde?: string;
  nodos: RoadmapNode[];
};

export type Roadmap = {
  trigger: RoadmapTrigger;
  ramaPrincipal: RoadmapBranch;
  ramasComplementarias: RoadmapBranch[];
  /** Flat, ALL nodes (principal + every complementary branch) — for consumers that don't need branch structure (CV certifications, portfolio, the map's search filter, the detail panel's node lookup). */
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
