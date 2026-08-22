/**
 * System prompt + response schema for CV section extraction (api/
 * cvExtract.ts). Same kind of single structured-output call as
 * api/_lib/roadmapPrompt.ts, not a chat turn.
 *
 * Real feedback that prompted this file entirely: the previous approach
 * (src/lib/cvParser.ts, plain regex heuristics matching a fixed line
 * shape like "<puesto> en <empresa> (<fechas>)") only worked on CVs that
 * happened to match that exact shape. A real CV pasted from a LinkedIn/PDF
 * export ("Antonella González AI Product Builder · Producto...
 * Experiencia laboral AI Product Builder · Orkestra (Startup fintech)
 * Diseño Jun 2025 – Presente Product Discovery, User experience...") has
 * none of the line breaks or punctuation the regex expected, so every
 * real section fell through into an undifferentiated "extra" bucket
 * instead of Experiencia laboral / Educación. An LLM reading the whole
 * text and classifying it is the actual fix, not another regex — the
 * same reasoning that already justified using Gemini for Fase 4's roadmap
 * instead of hand-written matching.
 */
import { SchemaType, type Schema } from "@google/generative-ai";

const EXPERIENCE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    puesto: { type: SchemaType.STRING, description: "El puesto/rol tal como aparece en el CV." },
    empresa: { type: SchemaType.STRING, description: "La empresa u organización — cadena vacía si el texto no la menciona." },
    fechas: { type: SchemaType.STRING, description: "El rango de fechas tal como aparece (ej. 'Jun 2025 – Presente') — cadena vacía si no está." },
    descripcion: {
      type: SchemaType.STRING,
      description:
        "1-2 oraciones resumiendo qué hizo la persona en ese rol, basadas SOLO en lo que el texto realmente dice cerca de esa entrada (tareas, logros, tecnologías) — nunca una descripción genérica del puesto. Cadena vacía si el texto no da detalle real de las tareas.",
    },
  },
  required: ["puesto", "empresa", "fechas", "descripcion"],
};

export const CV_EXTRACT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    nombre: { type: SchemaType.STRING, nullable: true, description: "El nombre completo de la persona, tal como aparece en el CV. null si no se puede identificar con confianza." },
    email: { type: SchemaType.STRING, nullable: true, description: "El email de contacto, tal como aparece literalmente en el texto. null si no hay uno." },
    links: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "TODAS las URLs reales que aparezcan literalmente en el texto (LinkedIn, GitHub, Behance, portfolio personal, etc.) — con dominio reconocible (ej. 'linkedin.com/in/...', 'github.com/...', 'https://...'). Si el texto solo tiene la PALABRA 'LinkedIn' o 'Behance' sin ninguna URL real al lado (común cuando un PDF pierde los hipervínculos y deja solo el texto del link), NO la incluyas — devolver un array vacío es mejor que inventar una URL que no está.",
    },
    experiencia: {
      type: SchemaType.ARRAY,
      items: EXPERIENCE_SCHEMA,
      description: "Cada experiencia laboral real que el texto describe, en el orden en que aparecen.",
    },
    educacion: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "Una entrada de texto por cada institución/curso/título educativo real mencionado (ej. 'Licenciatura en Diseño, UBA (2015-2019)', 'Curso de UX Writing, Coderhouse'). Combiná institución + título/curso + fechas en una sola línea legible cuando el texto los tenga cerca; si falta algún dato, incluí solo lo que el texto realmente dice.",
    },
    herramientas: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Herramientas, tecnologías o habilidades técnicas puntuales que el texto menciona explícitamente (ej. 'Figma', 'Python', 'SQL') — no inferencias genéricas.",
    },
  },
  required: ["links", "experiencia", "educacion", "herramientas"],
};

export function buildCvExtractPrompt(cvText: string): string {
  return `Sos un asistente que organiza el contenido de un CV real en secciones estructuradas — nunca reescribís ni inventás nada, solo leés el texto y clasificás cada parte en el campo que le corresponde.

Regla no negociable, la más importante de todas: TODO lo que devuelvas tiene que estar basado en algo que el texto realmente dice. Nunca inventes una empresa, una fecha, una URL, una institución o una tarea que no esté en el texto — si un dato no aparece, dejalo como cadena vacía ("") en ese campo puntual, o no incluyas esa entrada si no hay nada real que poner. Es preferible un campo vacío a un dato inventado.

El texto de un CV real puede venir con formato irregular (todo en un párrafo largo, sin saltos de línea claros, con viñetas mezcladas con texto plano, copiado de un PDF o de LinkedIn) — tu trabajo es leerlo con sentido común y encontrar la información real aunque no tenga un formato prolijo, no exigir que tenga una forma exacta.

--- Texto del CV ---
${cvText}
--- fin del texto ---`;
}
