import { useCallback, useEffect, useState } from "react";

/**
 * Fase 4's per-course demo progress state (CAMBIO 5). There's no real
 * payments/cursada backend, so this is explicitly a demo mechanism — the
 * detail panel's "Marcar como completado (demo)" button advances a course's
 * state without going through any real payment/enrollment flow.
 *
 * Backed by sessionStorage (not just component state) because it's shared
 * app-wide state on purpose: this same key is meant to be read/written by
 * more than just src/pages/Plataforma.tsx (the CV flow mentioned alongside
 * this request needs it too), so any component importing this hook sees the
 * same progress. No database persistence — sessionStorage is enough for a
 * demo and matches the pattern already used for the roadmap itself (see
 * src/lib/ai/roadmapClient.ts).
 */

export type CourseStatus = "no-iniciado" | "en-progreso" | "completado";

const STORAGE_KEY = "career-copilot-roadmap-progress";

type ProgressMap = Record<string, CourseStatus>;

function readStorage(): ProgressMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeStorage(map: ProgressMap) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** not-iniciado -> en-progreso -> completado -> completado (stays, no button after that). */
export function nextStatus(current: CourseStatus): CourseStatus {
  if (current === "no-iniciado") return "en-progreso";
  if (current === "en-progreso") return "completado";
  return "completado";
}

export function useRoadmapProgress() {
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    setMap(readStorage());
  }, []);

  const getStatus = useCallback((courseId: string): CourseStatus => map[courseId] ?? "no-iniciado", [map]);

  const advance = useCallback((courseId: string) => {
    setMap((prev) => {
      const current = prev[courseId] ?? "no-iniciado";
      const next = { ...prev, [courseId]: nextStatus(current) };
      writeStorage(next);
      return next;
    });
  }, []);

  return { getStatus, advance };
}
