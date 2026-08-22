/**
 * Decorative "active course" activity content for Panel inicio's Parte 2
 * (src/components/plataforma/PanelInicioView.tsx) — pending tasks, recent
 * activity feed, upcoming events, teacher notes, and attendance/delivery
 * metrics.
 *
 * EXPLICITLY NOT REAL DATA, same treatment as src/lib/courseDetailContent.ts
 * (read that file's own doc comment for the full reasoning): there's no
 * real cursada backend behind any Coderhouse course in this app — no real
 * classes, submissions, calendar, or teacher messages exist to show. Every
 * function here fabricates that content in a real course-activity-panel's
 * shape, derived from a course's real categoria/nombre (never random, so
 * the same active course shows the same content on every render) — but it
 * is fabricated, and this module says so everywhere it's used. Swap this
 * out entirely once a real cursada backend exists; nothing else about
 * Panel inicio's layout should need to change.
 */

export function pendingTasksFor(categoria: string): string[] {
  const byCategoria: Record<string, string[]> = {
    Programación: ["Terminar el ejercicio de la clase 3", "Repasar el video de repaso antes de la próxima clase"],
    Data: ["Entregar el dataset limpio del práctico", "Revisar el feedback del último entregable"],
    Diseño: ["Subir la última versión del wireframe", "Ver el video complementario de heurísticas"],
    "Inteligencia Artificial": ["Probar el prompt del práctico con tu propio caso", "Entregar el ejercicio de la clase 3"],
    "Marketing Digital": ["Armar el brief de la campaña de práctica", "Revisar el material complementario de la semana"],
    Negocios: ["Completar la planilla del caso de estudio", "Preparar 2 preguntas para la próxima clase"],
    Producto: ["Actualizar el backlog de la práctica", "Ver la clase grabada de la semana pasada"],
    "Softs Skills": ["Completar la autoevaluación de la semana", "Practicar el ejercicio de feedback entre pares"],
  };
  return byCategoria[categoria] ?? ["Terminar el ejercicio de la clase 3", "Revisar el material complementario"];
}

export type ActivityItem = { texto: string; hace: string };

export function recentActivityFor(nombreCurso: string): ActivityItem[] {
  return [
    { texto: `El profe subió el material de la clase 3 de ${nombreCurso}`, hace: "hace 1 día" },
    { texto: "Un compañero respondió tu pregunta en el foro", hace: "hace 2 días" },
    { texto: "Se agregó una guía extra en la sección de recursos", hace: "hace 4 días" },
  ];
}

export type UpcomingEvent = { titulo: string; cuando: string };

export function upcomingEventsFor(): UpcomingEvent[] {
  return [
    { titulo: "Próxima clase en vivo", cuando: "Miércoles 20:30 hs" },
    { titulo: "Entrega del práctico grupal", cuando: "Viernes" },
    { titulo: "Examen final", cuando: "En 2 semanas" },
  ];
}

export type TeacherNote = { autor: string; mensaje: string };

export function teacherNotesFor(categoria: string): TeacherNote[] {
  const byCategoria: Record<string, TeacherNote[]> = {
    Programación: [{ autor: "Tu profe", mensaje: "Buen avance esta semana — repasen el manejo de errores antes de la próxima clase." }],
    Diseño: [{ autor: "Tu profe", mensaje: "Me gustó mucho la dirección del último wireframe, sigan por ahí." }],
    "Inteligencia Artificial": [{ autor: "Tu profe", mensaje: "Recuerden documentar los prompts que prueben, lo vamos a usar en la próxima clase." }],
  };
  return byCategoria[categoria] ?? [{ autor: "Tu profe", mensaje: "Buen ritmo esta semana, cualquier duda me escriben por el foro." }];
}

export type PanelMetric = { label: string; valor: string };

export function metricsExample(): PanelMetric[] {
  return [
    { label: "Asistencia", valor: "90%" },
    { label: "Entregas a tiempo", valor: "3/4" },
    { label: "Actividad esta semana", valor: "Alta" },
  ];
}

export const NOTIFICATION_EXAMPLE = "Examen la próxima semana — repasá el material antes de la clase.";
