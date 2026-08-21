/**
 * Decorative course-detail content — descripción, dificultad, módulos,
 * duración, temario — for the Plan carrera detail panel
 * (src/pages/Plataforma.tsx's DetailPanel).
 *
 * EXPLICITLY NOT REAL DATA. The scraped catalog (src/lib/catalogClient.ts,
 * data/course-catalog.json) only has real categoria/tipo/fechas/horario/
 * precio for 28 of 57 courses — individual course *detail* pages (which
 * would have real descripción/dificultad/módulos/duración/temario) weren't
 * scraped (app.coderhouse.com/catalog/live-courses requires login, so a
 * live re-scrape wasn't possible this session). Per explicit direction:
 * this whole module fabricates that content in the same shape/format as
 * the real reference screenshots the user provided, derived from a
 * course's real categoria/tipo (never random, never per-course bespoke
 * copy) so it's at least internally consistent — but it is fabricated,
 * and every function here says so. Swap this module out entirely once
 * real per-course detail data exists; nothing else should need to change.
 */
import type { CourseType } from "./catalogClient";

export type DifficultyLevel = "Principiante" | "Intermedio" | "Avanzado";

export function difficultyFor(tipo: CourseType): DifficultyLevel {
  if (tipo === "carrera" || tipo === "diplomatura") return "Avanzado";
  return "Intermedio";
}

export function modulesCountFor(tipo: CourseType): number {
  switch (tipo) {
    case "carrera":
      return 18;
    case "diplomatura":
      return 10;
    case "on-demand":
      return 5;
    default:
      return 7;
  }
}

export function durationFor(tipo: CourseType): string {
  switch (tipo) {
    case "carrera":
      return "9 meses";
    case "diplomatura":
      return "3 meses";
    case "on-demand":
      return "Autogestionado";
    default:
      return "6 semanas";
  }
}

export function descriptionFor(nombre: string, categoria: string): string {
  return `En este ${nombre.toLowerCase().startsWith("carrera") || nombre.toLowerCase().startsWith("diplomatura") ? "programa" : "curso"} vas a desarrollar habilidades prácticas de ${categoria.toLowerCase()}, con foco en herramientas y flujos de trabajo reales que usan los equipos del sector hoy.`;
}

const TEMARIO_BY_CATEGORIA: Record<string, string[]> = {
  Programación: [
    "Fundamentos y entorno de trabajo",
    "Sintaxis y estructuras de control",
    "Estructuras de datos",
    "Buenas prácticas y testing",
    "Integración y despliegue",
    "Proyecto final",
  ],
  Data: [
    "Fundamentos de análisis de datos",
    "Limpieza y modelado de datos",
    "Consultas y bases de datos",
    "Visualización y storytelling",
    "Automatización de reportes",
    "Proyecto final",
  ],
  "Inteligencia Artificial": [
    "Fundamentos de IA aplicada",
    "Prompting y modelos de lenguaje",
    "Integración de APIs de IA",
    "Automatización de flujos con IA",
    "Evaluación y buenas prácticas",
    "Proyecto final",
  ],
  Diseño: [
    "Fundamentos de diseño",
    "Investigación de usuarios",
    "Wireframes y prototipado",
    "Sistemas de diseño",
    "Testeo y validación",
    "Proyecto final",
  ],
  "Marketing Digital": [
    "Fundamentos de marketing digital",
    "Estrategia de contenido",
    "Métricas y analítica",
    "Publicidad y performance",
    "Automatización de campañas",
    "Proyecto final",
  ],
  Negocios: [
    "Fundamentos del área",
    "Planificación y estrategia",
    "Herramientas de gestión",
    "Casos reales del sector",
    "Proyecto final",
  ],
  Producto: [
    "Fundamentos de producto",
    "Descubrimiento y research",
    "Priorización y roadmap",
    "Métricas de producto",
    "Proyecto final",
  ],
  "Softs Skills": ["Autoconocimiento", "Comunicación efectiva", "Trabajo en equipo", "Aplicación práctica"],
};

export function temarioFor(categoria: string): string[] {
  return TEMARIO_BY_CATEGORIA[categoria] ?? ["Introducción y fundamentos", "Desarrollo práctico", "Herramientas del sector", "Proyecto final"];
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * Extends the ONE real scraped date (`proximaFecha`, e.g. "19 de agosto")
 * into a short list of upcoming dates by repeating it weekly — a real
 * pattern (Coderhouse cohorts run on a fixed weekday, same as `horario`
 * says), just not real individual dates beyond the first one. Capped at
 * `max` regardless of how many `extraFechas` claims exist.
 */
export function upcomingDatesFrom(proximaFecha: string, max = 6): string[] {
  const match = proximaFecha.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i);
  if (!match) return [proximaFecha];

  const day = Number(match[1]);
  const monthIndex = MESES.findIndex((m) => m === match[2].toLowerCase());
  if (monthIndex === -1) return [proximaFecha];

  const now = new Date();
  let year = now.getFullYear();
  const first = new Date(year, monthIndex, day);
  if (first < now) year += 1;

  const dates: string[] = [];
  for (let i = 0; i < max; i++) {
    const d = new Date(year, monthIndex, day + i * 7);
    dates.push(`${d.getDate()} de ${MESES[d.getMonth()]}`);
  }
  return dates;
}
