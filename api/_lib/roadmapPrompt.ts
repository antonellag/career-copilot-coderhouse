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
 * - The roadmap is 3 branches, ALL forking directly from the trigger node
 *   (not from each other, not mid-chain): `rama_principal` (what the person
 *   needs to LEARN — sequential), `rama_repaso` (courses covering what they
 *   ALREADY know, per real CV/conversation evidence — a refresher offer,
 *   never new learning; omitted entirely when there's no real evidence to
 *   point at), and 0-3 `ramas_complementarias` (Softs Skills/Negocios/
 *   Producto — TRANSVERSAL_CATEGORIES, optional depth). Older versions of
 *   this prompt had ramas_complementarias fork from a specific
 *   rama_principal node (`nace_desde`) instead of the trigger — dropped
 *   per direct feedback: seeing all 3 paths fan out from the one profile
 *   card reads much clearer than one branch sprouting from the middle of
 *   another.
 *
 * Three more real-feedback fixes, all from the same round (a non-technical
 * tester ran /limbo end to end and the roadmap it produced had all three
 * problems at once):
 * - No fixed volume target anymore. An earlier version of this prompt
 *   mandated "15-20 courses total, always add 1-2 complementary" — that
 *   produced padded, unfocused roadmaps for people who genuinely only
 *   needed 3-5 well-chosen courses. Node count is now a CONSEQUENCE of fit,
 *   never a target: ramas_complementarias can legitimately be an empty
 *   array, and rama_principal's length is calibrated (see below), not
 *   fixed.
 * - One modality per topic. The same tester got Diseño UX/UI recommended
 *   as a curso, a carrera AND a diplomatura simultaneously — those are the
 *   same real Coderhouse offering at 3 commitment levels, not 3 different
 *   things to stack. The model now has to pick exactly one modality per
 *   topic, with real catalog-derived examples of what "same topic" looks
 *   like (promptSameTopicExamples() — see api/_lib/courseCatalog.ts). The
 *   alternates it didn't pick aren't lost: src/pages/Plataforma.tsx's
 *   DetailPanel surfaces them via src/lib/catalogClient.ts's
 *   findAlternateModalities() in a "Cambiar de modalidad" block, so
 *   switching commitment level never requires a duplicate node.
 * - Calibrated to tech distance + pivot size. Same tester (zero tech
 *   background) got a scattershot mix of diseño + desarrollo + IA +
 *   branding all at once — too many unrelated directions to choose between
 *   for someone starting from zero. The prompt now has the model read the
 *   full conversation (already-available signal, no new question added to
 *   the flow) to gauge tech-background distance and pivot size BEFORE
 *   building the roadmap, and calibrates both length and modality
 *   accordingly (see the prompt body's "Antes de armar el recorrido"
 *   section).
 */
import { SchemaType, type Schema } from "@google/generative-ai";
import { catalogAsPromptText, promptSameTopicExamples, TRANSVERSAL_CATEGORIES } from "./courseCatalog.js";

const NODE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING, description: "Debe ser exactamente un id que exista en el catálogo." },
    orden: { type: SchemaType.INTEGER, description: "Orden dentro de SU rama (1, 2, 3...), no un orden global." },
    justificacion: {
      type: SchemaType.STRING,
      description:
        "1-2 oraciones: por qué este curso va acá y qué le aporta a ESTA persona en base a algo concreto que dijo — nunca una descripción genérica del curso que serviría para cualquiera. En rama_repaso, explicá qué evidencia concreta de la conversación/CV muestra que ya domina esto.",
    },
  },
  required: ["id", "orden", "justificacion"],
};

const BRANCH_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    nombre: { type: SchemaType.STRING },
    nodos: { type: SchemaType.ARRAY, items: NODE_SCHEMA },
  },
  required: ["nombre", "nodos"],
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
      ...BRANCH_SCHEMA,
      description:
        "Lo que la persona necesita APRENDER para su objetivo, en orden secuencial. Nunca incluye algo que ya domina (eso va en rama_repaso). Puede combinar más de una categoría real del catálogo si forman una narrativa coherente hacia el mismo objetivo. Sin cantidad fija — calibrá la extensión según qué tan lejos está su trasfondo del mundo tech y qué tan grande es el cambio que busca (ver instrucciones de calibración): puede ser un camino corto de 3-5 cursos para alguien sin base técnica que recién arranca, o uno más largo y específico para alguien que ya viene del área. Un recorrido corto pero bien elegido es un resultado completo, no una versión a medio hacer.",
      properties: {
        ...BRANCH_SCHEMA.properties,
        nombre: {
          type: SchemaType.STRING,
          description:
            "Nombre real de esta especialización a partir de la(s) categoría(s) dominante(s) de sus cursos (ej. 'Diseño UX/UI', 'Especialización en IA Full Stack') — nunca genérico como 'Camino principal'.",
        },
      },
    },
    rama_repaso: {
      ...BRANCH_SCHEMA,
      description:
        "Cursos que cubren algo que la persona YA sabe hacer, con evidencia real y citable de la conversación o el CV (ej. dijo que usa SQL a diario, o el CV lista una herramienta puntual) — es un repaso/actualización opcional, no aprendizaje nuevo. 0 a 3 cursos. Si no hay ninguna evidencia real y concreta de conocimiento previo que coincida con un curso del catálogo, devolvé \"nodos\": [] — nunca inventes que la persona ya sabe algo que no dijo.",
      properties: {
        ...BRANCH_SCHEMA.properties,
        nombre: {
          type: SchemaType.STRING,
          description: 'Siempre exactamente: "¿Necesitás repasar algo?"',
        },
      },
    },
    ramas_complementarias: {
      type: SchemaType.ARRAY,
      description:
        "0 a 3 ramas de habilidades adicionales, cada una naciendo directamente del perfil de la persona (igual que rama_principal y rama_repaso) — nunca conectadas entre sí ni a mitad de otra rama. Genuinamente opcionales: devolvé un array vacío si no hay una razón concreta y específica de la conversación que justifique alguna. Nunca se agregan como mínimo obligatorio ni para que el mapa se vea más completo — eso es relleno, no una recomendación real.",
      items: {
        ...BRANCH_SCHEMA,
        properties: {
          ...BRANCH_SCHEMA.properties,
          nombre: {
            type: SchemaType.STRING,
            description:
              "Describe la orientación real de esta rama según la categoría de sus cursos (ej. cursos de 'Producto' -> 'Complemento de producto'; de 'Softs Skills' -> 'Complemento de habilidades blandas'). Nunca 'Extra', 'Otros' ni nada genérico.",
          },
        },
      },
    },
  },
  required: ["trigger", "rama_principal", "rama_repaso", "ramas_complementarias"],
};

export function buildRoadmapPrompt(transcript: string, riasecLabels: string[]): string {
  return `Sos el Career Copilot de Coderhouse. Ya tuviste una conversación completa con esta persona (fases Experiencia y Habilidades) y completó un test vocacional RIASEC. Tu tarea ahora es armar su recorrido de cursos, EN FORMA DE RAMAS — no una sola cadena lineal.

Concepto: hay 3 tipos de rama, y las 3 nacen DIRECTAMENTE del perfil de la persona (nunca una rama sale de otra, ni de un curso a mitad de camino):
1. "rama_principal" — lo que necesita APRENDER para su objetivo, secuencial.
2. "rama_repaso" — cursos sobre cosas que YA sabe hacer (evidencia real de la conversación o el CV), ofrecidos como repaso/actualización opcional. Puede quedar vacía si no hay evidencia real.
3. "ramas_complementarias" (0-3) — habilidades adicionales que la persona PUEDE elegir profundizar, nunca un paso obligatorio ni un mínimo a completar.

--- Antes de armar el recorrido: calibrá según el trasfondo de la persona ---
Leé TODA la conversación (CV si lo hay, fase Experiencia, fase Habilidades, y el resultado del test RIASEC) y estimá dos cosas — ya tenés toda la información necesaria para esto, no hace falta preguntar nada nuevo:
(a) qué tan cerca o lejos está su trasfondo del mundo tech (¿ya trabajó o estudió algo relacionado a programación/datos/diseño/producto, o viene de un área totalmente distinta?).
(b) qué tan grande es el cambio que busca (¿quiere pivotar completamente a algo nuevo, o complementar/profundizar lo que ya hace?).

Usá esa lectura para calibrar el recorrido:
- Sin trasfondo tech + quiere pivotar de verdad: priorizá UNA sola área coherente con lo que mostró el test y la conversación — nunca una mezcla de disciplinas muy distintas entre sí (ej. diseño + desarrollo + IA + branding juntos es demasiado para alguien que arranca de cero). Camino corto y claro (rama_principal más chica), pensado para no abrumar. "ramas_complementarias" en este caso casi siempre debería quedar vacía — sumar más frentes es lo último que necesita alguien recién arrancando.
- Sin trasfondo tech + solo quiere complementar o explorar (no pivotar): un único curso liviano alcanza. No corresponde una carrera ni una diplomatura para esta situación — es demasiado compromiso para una exploración.
- Trasfondo técnico o con experiencia relevante ya en el área que busca: acá sí corresponde ser más específico y ambicioso — profundizar o especializar dentro de lo que la persona ya sabe (carrera/diplomatura si el nivel de compromiso lo amerita), en vez de mantenerlo en nivel introductorio.
--- fin calibración ---

Reglas, no negociables:
- Cada "id" que devuelvas (en cualquier rama) tiene que ser EXACTAMENTE uno de los ids del catálogo de abajo, y NUNCA puede repetirse — cada curso aparece como máximo una vez en TODO el recorrido (nunca dos veces en la misma rama, nunca repetido entre rama_principal, rama_repaso y las complementarias). Nunca inventes un curso ni un id que no esté en esta lista.
- UNA SOLA MODALIDAD POR TEMA: el catálogo tiene el mismo tema real ofrecido en distintas modalidades (curso / carrera / diplomatura / on-demand) — son la misma área a distinto nivel de compromiso, nunca cursos distintos para sumar juntos. Para cada tema, elegí exactamente UNA modalidad en TODO el recorrido (nunca aparece el mismo tema dos veces, aunque sea en ramas distintas). La modalidad que elijas depende del nivel de compromiso de la persona CON ESE TEMA PUNTUAL (ver calibración arriba) — alguien puede querer una carrera completa en su especialización principal y solo un curso suelto en algo complementario, eso es correcto. Ejemplos reales de mismo tema en distintas modalidades en este catálogo (elegí solo una por cada uno):
${promptSameTopicExamples()}
- "trigger" tiene 4 campos de texto, cada uno resumiendo un tema real de la conversación (no un resumen genérico único): "experiencia" (CV + fase Experiencia), "habilidades" (CV + fase Habilidades), "planDeCarrera" (por qué este orden en la rama principal), "estrategiaYEspecializacion" (análisis apoyado en el resultado del test RIASEC, mencionando las ramas complementarias si las hay). Cada uno tiene que citar algo concreto y real de la conversación — nunca relleno genérico.
- "rama_principal.nombre" tiene que ser el nombre real de la especialización, nunca genérico. Sus nodos son cursos coherentes con esa especialización, en orden secuencial, cubriendo SOLO cosas que la persona todavía no sabe — el nodo 1 tiene que seguir directamente del perfil de la persona, con una "justificacion" que cite algo concreto que dijo. Puede combinar más de una categoría real del catálogo si forman una progresión lógica hacia el mismo objetivo — nunca mezclés categorías sin relación real entre sí solo para completar cantidad.
- "rama_repaso.nombre" siempre tiene que ser exactamente "¿Necesitás repasar algo?". Sus nodos (0 a 3) son cursos que cubren algo que la persona YA declaró saber hacer — cada "justificacion" tiene que citar la evidencia concreta (ej. "mencionaste que usás SQL en tu trabajo actual"). Si no hay ninguna evidencia real y específica que coincida con un curso del catálogo, dejá "nodos": [] — nunca inventes conocimiento previo que la persona no confirmó.
- "ramas_complementarias": cada una con cursos de las categorías ${TRANSVERSAL_CATEGORIES.join(", ")} — estos cursos NUNCA van en "rama_principal" ni en "rama_repaso". El "nombre" de cada rama describe su orientación real (categoría de sus cursos), nunca "Extra" ni "Otros". La "justificacion" de cada nodo complementario tiene que explicar EXPLÍCITAMENTE por qué esa rama le sirve a esta persona en particular (ej. alguien muy técnico se beneficia de un curso de habilidades blandas para comunicarse con los equipos con los que va a trabajar) — si no podés escribir esa razón concreta, no la agregues, se sentiría relleno random.
- Sin cantidad objetivo. Preferimos un recorrido de 3-5 cursos bien elegidos, con una razón real para cada uno, a uno de 15+ armado para "verse completo" — eso es exactamente lo que hay que evitar. La cantidad de nodos es una CONSECUENCIA de qué tan bien encaja cada curso con esta persona puntual (calibrada según trasfondo/pivote arriba), nunca un objetivo a alcanzar.
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
