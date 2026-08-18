/**
 * System prompt + response schema for Fase 4's roadmap generation
 * (api/roadmap.ts). Separate from api/_lib/prompts.ts (getSystemPrompt/
 * ChatMode) on purpose: this isn't a chat turn, it's a single structured-
 * output call that returns JSON matching ROADMAP_RESPONSE_SCHEMA below, not
 * a conversational reply.
 *
 * Two real-feedback changes baked in here (see src/pages/Plataforma.tsx for
 * how each renders):
 * - The map's first node isn't a course — it's a "trigger" node (n8n-style)
 *   summarizing the person (identity/experience/skills/CV), and the first
 *   course's justification has to cite something concrete from what they
 *   said, same as it already connects each course to the next.
 * - The course selection isn't just the specialization track — 1-2 picks
 *   have to come from Softs Skills/Negocios/Producto (TRANSVERSAL_CATEGORIES),
 *   chosen with real reasoning, each flagged `esTransversal` so the UI can
 *   mark it as a deliberate complement instead of an unexplained outlier.
 */
import { SchemaType, type Schema } from "@google/generative-ai";
import { catalogAsPromptText, TRANSVERSAL_CATEGORIES } from "./courseCatalog.js";

export const ROADMAP_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    trigger: {
      type: SchemaType.OBJECT,
      description:
        "Resumen del perfil de la persona a partir de TODA la conversación — el nodo de arranque del mapa, no un curso.",
      properties: {
        resumen: {
          type: SchemaType.STRING,
          description:
            "3-5 oraciones: quién es la persona, resumen de su experiencia, herramientas/habilidades detectadas, y si adjuntó CV, una referencia breve a eso. Concreto, nada de relleno genérico.",
        },
      },
      required: ["resumen"],
    },
    nodos: {
      type: SchemaType.ARRAY,
      description: "4 a 7 cursos del catálogo, en el orden en que la persona debería hacerlos.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Debe ser exactamente un id que exista en el catálogo." },
          orden: { type: SchemaType.INTEGER },
          esTransversal: {
            type: SchemaType.BOOLEAN,
            description:
              "true solo si este curso es uno de los 1-2 picks transversales (categoría Softs Skills, Negocios o Producto) que complementan la especialización — false para los cursos del camino central.",
          },
          justificacion: {
            type: SchemaType.STRING,
            description:
              "1-2 oraciones: por qué este curso va en este punto del recorrido y qué le aporta a ESTA persona en base a algo concreto que dijo — nunca una descripción genérica del curso. Si esTransversal es true, tiene que explicar explícitamente por qué un curso fuera de la especialización central le sirve a esta persona en particular (nunca aparece sin esa explicación).",
          },
        },
        required: ["id", "orden", "esTransversal", "justificacion"],
      },
    },
  },
  required: ["trigger", "nodos"],
};

export function buildRoadmapPrompt(transcript: string, riasecLabels: string[]): string {
  return `Sos el Career Copilot de Coderhouse. Ya tuviste una conversación completa con esta persona (fases Experiencia y Habilidades) y completó un test vocacional RIASEC. Tu tarea ahora es armar su recorrido de cursos: 4 a 7 cursos de Coderhouse, EN ORDEN, elegidos y ordenados según lo que contó en la conversación y su resultado del test.

Reglas, no negociables:
- Cada "id" que devuelvas tiene que ser EXACTAMENTE uno de los ids del catálogo de abajo. Nunca inventes un curso ni un id que no esté en esta lista.
- El campo "trigger.resumen" resume quién es la persona a partir de TODA la conversación (identidad, experiencia, herramientas/habilidades, y si hay un bloque "--- CV adjunto ---" en la conversación, una referencia breve a eso).
- El curso en orden 1 es el que sigue directamente del perfil de la persona — su "justificacion" tiene que citar algo concreto que dijo (una herramienta, un interés, algo textual), no ser genérica.
- De los 4 a 7 cursos totales, 1 o 2 tienen que ser picks TRANSVERSALES: cursos de las categorías ${TRANSVERSAL_CATEGORIES.join(", ")} (nunca de la especialización central), marcados con "esTransversal": true, elegidos con criterio real según lo que la conversación sugiere que le serviría a esta persona (ej. alguien muy técnico se beneficia de un curso de habilidades blandas o de negocio para poder comunicarse con los equipos con los que va a trabajar). La "justificacion" de estos cursos tiene que explicar EXPLÍCITAMENTE por qué están ahí aunque no sean el foco central del camino — nunca pueden aparecer sin esa explicación, se sentirían relleno random. El resto de los cursos (esTransversal: false) forma el camino central de especialización.
- Ninguna "justificacion" puede ser una descripción genérica del curso que serviría para cualquier persona — siempre conectada a algo real de esta conversación y/o su resultado del test.

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
