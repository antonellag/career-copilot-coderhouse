import { useCallback, useEffect, useState } from "react";

/**
 * Fase 4's per-course demo progress state (CAMBIO 5, prompt-fase4-v1), now
 * also the source for CV Part B's auto-added "Certificaciones Coderhouse"
 * (prompt-fase4-cv-portfolio): a course transitioning into "completado"
 * here is the ONE event that adds a certification line — no separate
 * tracking, the CV view just reads getStatus/getCompletedAt for every node
 * in the roadmap (see src/components/plataforma/CvView.tsx).
 *
 * There's no real payments/cursada backend, so this is explicitly a demo
 * mechanism — the detail panel's "Marcar como completado (demo)" button
 * advances a course's state without going through any real flow.
 *
 * Backed by sessionStorage (not just component state) because it's shared
 * app-wide state on purpose — read/written from more than one view within
 * src/pages/Plataforma.tsx. No database persistence — sessionStorage is
 * enough for a demo and matches the pattern already used for the roadmap
 * itself (see src/lib/ai/roadmapClient.ts).
 */

export type CourseStatus = "no-iniciado" | "en-progreso" | "completado";

type ProgressEntry = { status: CourseStatus; completedAt?: string };
type ProgressMap = Record<string, ProgressEntry>;

const STORAGE_KEY = "career-copilot-roadmap-progress";

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

  const getStatus = useCallback((courseId: string): CourseStatus => map[courseId]?.status ?? "no-iniciado", [map]);

  const getCompletedAt = useCallback((courseId: string): string | undefined => map[courseId]?.completedAt, [map]);

  const advance = useCallback((courseId: string) => {
    setMap((prev) => {
      const current = prev[courseId]?.status ?? "no-iniciado";
      const status = nextStatus(current);
      const entry: ProgressEntry = {
        status,
        // Set once, the moment it first becomes "completado" — later clicks
        // (nextStatus is a no-op past "completado") never overwrite it.
        completedAt: status === "completado" ? (prev[courseId]?.completedAt ?? new Date().toISOString()) : prev[courseId]?.completedAt,
      };
      const next = { ...prev, [courseId]: entry };
      writeStorage(next);
      return next;
    });
  }, []);

  return { getStatus, getCompletedAt, advance };
}
