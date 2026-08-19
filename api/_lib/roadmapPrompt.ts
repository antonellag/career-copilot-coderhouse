/**
 * System prompt + response schema for Fase 4's roadmap generation
 * (api/roadmap.ts). Separate from api/_lib/prompts.ts (getSystemPrompt/
 * ChatMode) on purpose: this isn't a chat turn, it's a single structured-
 * output call that returns JSON matching ROADMAP_RESPONSE_SCHEMA below, not
 * a conversational reply.
 *
 * Real-feedback changes baked in here (see src/pages/Plataforma.tsx for how
 * each renders):
 * - The map's first node isn't a course — it's a "trigger" node (n8n-style),
 *   not a menu, not a course. It holds real text summarizing each thing
 *   /limbo actually covered (CV if any, Experiencia, Habilidades, and the
 *   RIASEC test), broken into topic sections (`trigger.experiencia`,
 *   `.habilidades`, `.planDeCarrera`, `.estrategiaYEspecializacion`)
 *   instead of one paragraph.
 * - The roadmap is no longer one flat chain. It's a branching structure:
 *   `rama_principal` is the core specialization, sequential;
 *   `ramas_complementarias` are 1-2 side branches (Softs Skills/Negocios/
 *   Producto — TRANSVERSAL_CATEGORIES) that fork off from a specific
 *   `rama_principal` node (`nace_desde`, wherever it makes sense in the
 *   conversation, not necessarily the last one) instead of being just
 *   another link in the main chain. This is what makes them read as
 *   optional depth the person can choose to pursue, not a mandatory step.
 */
import { SchemaType, type Schema } from "@google/generative-ai";
import { catalogAsPromptText, TRANSVERSAL_CATEGORIES } from "./courseCatalog.js";

const NODE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING, description: "Debe ser exactamente un id que exista en el catálogo." },
    orden: { type: SchemaType.INTEGER, description: "Orden dentro de SU rama (1, 2, 3...), no un orden global." },
    justificacion: {
      type: SchemaType.STRING,
      description:
        "1-2 oraciones: por qué este curso va acá y qué le aporta a ESTA persona en base a algo concreto que dijo — nunca una descripción genérica del curso que serviría para cualquiera.",
    },
  },
  required: ["id", "orden", "justificacion"],
};

export const ROADMAP_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    trigger: {
      type: SchemaType.OBJECT,
      description:
        "El nodo de arranque del mapa (no un curso, no un menú) — texto real resumiendo cada tema que se cubrió en la conversación, en base a TODA la conversación (CV si lo hay, fase Experiencia, fase Habilidades, y el resultado del test RIASEC).",
      properties: {
        experiencia: {
          type: SchemaType.STRING,
          description:
            "2-3 oraciones resumiendo la experiencia profesional/laboral de la persona, en base al CV (si lo adjuntó) y a lo que contó en la fase Experiencia. Concreto — cita roles, empresas o tareas reales que haya mencionado, nunca genérico.",
        },
        habilidades: {
          type: SchemaType.STRING,
          description:
            "2-3 oraciones resumiendo las herramientas y habilidades identificadas — las del CV (si las hay) más lo que surgió en la fase Habilidades. Concreto, nombra herramientas/habilidades reales que haya dicho.",
        },
        planDeCarrera: {
          type: SchemaType.STRING,
          description:
            "1-2 oraciones explicando la lógica del recorrido: por qué ese orden en la rama principal, qué cubre en conjunto.",
        },
        estrategiaYEspecializacion: {
          type: SchemaType.STRING,
          description:
            "2-3 oraciones con el análisis y la estrategia de especialización: apoyate en el resultado del test vocacional (RIASEC) y en lo que la persona contó. Si hay ramas complementarias, referite a ellas explícitamente (ej. 'además del camino principal en X, te conviene profundizar en Y porque...') — por qué esta estrategia tiene sentido para ELLA, no una estrategia genérica.",
        },
      },
      required: ["experiencia", "habilidades", "planDeCarrera", "estrategiaYEspecializacion"],
    },
    rama_principal: {
      type: SchemaType.OBJECT,
      description: "La especialización central de la persona — 3 a 5 cursos, en orden secuencial.",
      properties: {
        nombre: {
          type: SchemaType.STRING,
          description:
            "Nombre real de esta especialización a partir de la categoría dominante de sus cursos (ej. 'Diseño UX/UI', 'Inteligencia Artificial') — nunca genérico como 'Camino principal'.",
        },
        nodos: { type: SchemaType.ARRAY, items: NODE_SCHEMA },
      },
      required: ["nombre", "nodos"],
    },
    ramas_complementarias: {
      type: SchemaType.ARRAY,
      description:
        "1 a 2 ramas que nacen desde un nodo puntual de la rama principal — nunca en el camino central. Suman 1 a 2 cursos en total entre todas.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          nombre: {
            type: SchemaType.STRING,
            description:
              "Describe la orientación real de esta rama según la categoría de sus cursos (ej. cursos de 'Producto' -> 'Complemento de producto'; de 'Softs Skills' -> 'Complemento de habilidades blandas'). Nunca 'Extra', 'Otros' ni nada genérico.",
          },
          nace_desde: {
            type: SchemaType.STRING,
            description:
              "El id de un nodo de rama_principal.nodos — el punto donde esta rama nace. Elegí el nodo donde tenga más sentido según la conversación, no siempre el último.",
          },
          nodos: { type: SchemaType.ARRAY, items: NODE_SCHEMA },
        },
        required: ["nombre", "nace_desde", "nodos"],
      },
    },
  },
  required: ["trigger", "rama_principal", "ramas_complementarias"],
};

export function buildRoadmapPrompt(transcript: string, riasecLabels: string[]): string {
  return `Sos el Career Copilot de Coderhouse. Ya tuviste una conversación completa con esta persona (fases Experiencia y Habilidades) y completó un test vocacional RIASEC. Tu tarea ahora es armar su recorrido de cursos, EN FORMA DE RAMAS — no una sola cadena lineal.

Concepto: hay UNA rama principal (la especialización central de la persona, secuencial) y 1-2 ramas complementarias que nacen desde un nodo puntual de la rama principal. Una rama complementaria representa una especialidad o habilidad adicional que la persona PUEDE elegir profundizar — no es un paso obligatorio del camino central, por eso nunca va mezclada en la misma secuencia.

Reglas, no negociables:
- Cada "id" que devuelvas (en cualquier rama) tiene que ser EXACTAMENTE uno de los ids del catálogo de abajo. Nunca inventes un curso ni un id que no esté en esta lista.
- "trigger" tiene 4 campos de texto, cada uno resumiendo un tema real de la conversación (no un resumen genérico único): "experiencia" (CV + fase Experiencia), "habilidades" (CV + fase Habilidades), "planDeCarrera" (por qué este orden en la rama principal), "estrategiaYEspecializacion" (análisis apoyado en el resultado del test RIASEC, mencionando las ramas complementarias si las hay). Cada uno tiene que citar algo concreto y real de la conversación — nunca relleno genérico.
- "rama_principal.nombre" tiene que ser el nombre real de la especialización (a partir de la categoría dominante de sus cursos), nunca genérico. Sus 3 a 5 nodos son SOLO cursos de esa especialización, en orden secuencial — el nodo 1 tiene que seguir directamente del perfil de la persona, con una "justificacion" que cite algo concreto que dijo.
- "ramas_complementarias": 1 a 2 ramas, cada una con TODOS sus cursos de las categorías ${TRANSVERSAL_CATEGORIES.join(", ")} — estos cursos NUNCA van en "rama_principal". El "nombre" de cada rama describe su orientación real (categoría de sus cursos), nunca "Extra" ni "Otros". "nace_desde" es el id de un nodo de rama_principal.nodos elegido con criterio real según la conversación (no siempre el último). Una rama puede tener más de un nodo si hay progresión natural dentro de esa orientación. La "justificacion" de cada nodo complementario tiene que explicar EXPLÍCITAMENTE por qué esa rama le sirve a esta persona en particular (ej. alguien muy técnico se beneficia de un curso de habilidades blandas para comunicarse con los equipos con los que va a trabajar) — nunca aparece sin esa explicación, se sentiría relleno random.
- El total de cursos entre rama_principal y todas las ramas_complementarias tiene que ser entre 4 y 7.
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
