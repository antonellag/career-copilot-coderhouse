/**
 * Decorative "active course" activity content for Panel inicio
 * (src/components/plataforma/PanelInicioView.tsx) — pending tasks, one per
 * "Clase N" row in the Tareas pendientes section. The sidebar's own agenda
 * blocks are sourced from courseDetailContent.ts's temarioFor instead
 * (keyed to categoria, already existed for the Plan carrera detail panel).
 *
 * EXPLICITLY NOT REAL DATA, same treatment as src/lib/courseDetailContent.ts
 * (read that file's own doc comment for the full reasoning): there's no
 * real cursada backend behind any Coderhouse course in this app — no real
 * classes or submissions exist to show. Derived from a course's real
 * categoria (never random, so the same active course shows the same
 * content on every render) — but it is fabricated, and this module says so
 * everywhere it's used. Swap this out entirely once a real cursada backend
 * exists; nothing else about Panel inicio's layout should need to change.
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
