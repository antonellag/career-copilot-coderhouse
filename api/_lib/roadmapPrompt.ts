/**
 * System prompt + response schema for Fase 4's roadmap generation
 * (api/roadmap.ts). Separate from api/_lib/prompts.ts (getSystemPrompt/
 * ChatMode) on purpose: this isn't a chat turn, it's a single structured-
 * output call that returns JSON matching RoadmapSchema below, not a
 * conversational reply.
 */
import { SchemaType, type Schema } from "@google/generative-ai";
import { catalogAsPromptText } from "./courseCatalog.js";

export const ROADMAP_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    base: {
      type: SchemaType.ARRAY,
      description:
        "2 a 4 cosas concretas que la persona YA trae (experiencia, herramientas, rasgos) según la conversación — no cursos, son el punto de partida del mapa.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING, description: "Nombre corto, ej. 'Figma' o 'Diseño UX/UI'." },
        },
        required: ["label"],
      },
    },
    nodos: {
      type: SchemaType.ARRAY,
      description: "4 a 7 cursos del catálogo, en el orden en que la persona debería hacerlos.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Debe ser exactamente un id que exista en el catálogo." },
          orden: { type: SchemaType.INTEGER },
          justificacion: {
            type: SchemaType.STRING,
            description:
              "1-2 oraciones: por qué este curso va en este punto del recorrido y qué le aporta a ESTA persona en base a algo concreto que dijo — nunca una descripción genérica del curso.",
          },
        },
        required: ["id", "orden", "justificacion"],
      },
    },
  },
  required: ["base", "nodos"],
};

export function buildRoadmapPrompt(transcript: string, riasecLabels: string[]): string {
  return `Sos el Career Copilot de Coderhouse. Ya tuviste una conversación completa con esta persona (fases Experiencia y Habilidades) y completó un test vocacional RIASEC. Tu tarea ahora es armar su recorrido de cursos: 4 a 7 cursos de Coderhouse, EN ORDEN, elegidos y ordenados según lo que contó en la conversación y su resultado del test.

Reglas, no negociables:
- Cada "id" que devuelvas tiene que ser EXACTAMENTE uno de los ids del catálogo de abajo. Nunca inventes un curso ni un id que no esté en esta lista.
- La "justificacion" de cada curso tiene que conectarse con algo concreto que la persona dijo en la conversación (una herramienta, un interés, una habilidad, algo que mencionó) y/o con su resultado del test — nunca una descripción genérica del curso que serviría para cualquiera.
- El campo "base" (2-4 items) resume lo que la persona YA trae — experiencia, herramientas o rasgos reales que surgieron en la conversación — para que el mapa no arranque vacío.

--- Catálogo de cursos válidos ---
${catalogAsPromptText()}
--- fin catálogo ---

--- Resultado test vocacional (RIASEC) ---
Dimensiones dominantes: ${riasecLabels.join(", ")}
--- fin resultado test ---

--- Conversación completa (Experiencia + Habilidades) ---
${transcript}
--- fin conversación ---`;
}
