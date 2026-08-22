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
 *   produced padded, unfocused roadmaps. Node count is now a CONSEQUENCE of
 *   fit, never a target — this went through TWO rounds:
 *   Round 1 replaced the 15-20 mandate with "3-5 well-chosen courses is a
 *   complete result" — that overcorrected into roadmaps that were too
 *   small and dropped rama_repaso/ramas_complementarias too eagerly,
 *   losing variety. The goal was never to minimize course count (it's
 *   still a sales surface — more real, justified courses shown is better),
 *   only to stop padding with unjustified ones.
 *   Round 2 (current) drops BOTH a floor and a ceiling: size is calibrated
 *   to how solid/broad the profile's shown base is (see the prompt body's
 *   calibration section) — a strong, broad profile can and should sustain
 *   a bigger roadmap with all 3 branch types active, a narrow/starting-
 *   from-zero profile stays shorter. The prompt also now explicitly tells
 *   the model to actively check all 3 branch categories for a legitimate
 *   opportunity before closing the roadmap, instead of stopping after
 *   rama_principal — rama_repaso/ramas_complementarias must never be
 *   skipped or emptied by default when real evidence for them exists.
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
 *
 * A 4th fix, separate round: another real tester who works as a bricklayer
 * described "armando y diseñando cosas" (building things by hand) and the
 * model pointed the roadmap at Diseño UX/UI — it matched the word
 * "diseñando" against the vocabulary of a professional area instead of
 * reasoning about the actual activity (manual construction is a Realista
 * signal, not Artístico). The prompt's "El test RIASEC es la señal
 * principal" section below fixes this at the source: the RIASEC test
 * result (an objective forced-choice test) is now the primary signal for
 * vocational direction, free-text conversation only personalizes/justifies
 * it — it can no longer shift which dimension/area gets picked just
 * because a word in what the person said happens to overlap with a
 * profession's name. Note this lives here, not api/_lib/prompts.ts: that
 * file only drives the /limbo chat turns (Experiencia/Habilidades/
 * Resultado's closing line) — none of them reason about RIASEC dimensions
 * or pick a specialization, this file's buildRoadmapPrompt is the only
 * place that does.
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
            "2-3 oraciones con el análisis y la estrategia de especialización: la orientación vocacional sale del resultado del test RIASEC (la señal principal), personalizada con cosas concretas que la persona contó — nunca al revés, nunca reinterpretando el test a partir de una palabra suelta de la conversación (ver la sección 'El test RIASEC es la señal principal' más abajo). Si hay ramas complementarias, referite a ellas explícitamente (ej. 'además del camino principal en X, te conviene profundizar en Y porque...') — por qué esta estrategia tiene sentido para ELLA, no una estrategia genérica.",
        },
      },
      required: ["experiencia", "habilidades", "planDeCarrera", "estrategiaYEspecializacion"],
    },
    rama_principal: {
      ...BRANCH_SCHEMA,
      description:
        "Lo que la persona necesita APRENDER para su objetivo, en orden secuencial. Nunca incluye algo que ya domina (eso va en rama_repaso). Puede combinar más de una categoría real del catálogo si forman una narrativa coherente hacia el mismo objetivo. Sin cantidad fija en ningún sentido (ni mínimo ni máximo) — calibrá la extensión según qué tan sólida/amplia es la base que mostró el perfil en el Test y la conversación completa (ver instrucciones de calibración): un perfil con base sólida y ganas explícitas de expandirse puede sostener un camino más largo y específico; uno acotado o recién arrancando puede sostener uno más corto y enfocado. Cada nodo necesita su propia razón real — ni de más (relleno) ni de menos (dejar afuera una oportunidad legítima que sí tenía sustento).",
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
        "Cursos que cubren algo que la persona YA sabe hacer, con evidencia real y citable de la conversación o el CV (ej. dijo que usa SQL a diario, o el CV lista una herramienta puntual) — es un repaso/actualización opcional para reforzar una base existente, no aprendizaje nuevo. 0 a 3 cursos. Buscala activamente en Habilidades/CV antes de asumir que está vacía — cuando hay evidencia real, tiene una razón tan legítima como cualquier nodo de rama_principal, no es relleno. Solo devolvé \"nodos\": [] si genuinamente no hay ninguna evidencia real y concreta de conocimiento previo que coincida con un curso del catálogo — nunca inventes que la persona ya sabe algo que no dijo, pero tampoco la vacíes por defecto cuando sí hay evidencia.",
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

--- El test RIASEC (Fase 3) es la señal PRINCIPAL de orientación vocacional ---
Las dimensiones dominantes que te paso abajo (sección "Resultado test vocacional") vienen de un test de elección forzada — es la señal objetiva y principal de hacia qué área vocacional apunta esta persona. La conversación libre (Experiencia + Habilidades) se usa para PERSONALIZAR y JUSTIFICAR el recorrido con cosas concretas que la persona dijo (como ya hacés en cada "justificacion") — pero NUNCA para reinterpretar la orientación vocacional ni correr el peso hacia una dimensión distinta a partir de que una palabra suelta de la conversación coincida textualmente con el nombre de un rubro.

Regla explícita: fijate en qué actividad describe realmente la persona, nunca en si una palabra de la frase coincide con el vocabulario de un área profesional.
- Ejemplo concreto: "armar o reparar algo con las manos" (construcción, albañilería, herrería, o cualquier oficio manual) es señal de Realista (y a veces Convencional, si implica medidas/precisión/seguir un proceso técnico) — NO es señal de Artístico ni de Diseño, aunque la persona haya usado la palabra "crear" o "diseñar" para describirlo.
- Artístico solo se refuerza con señales EXPLÍCITAS de sensibilidad estética o expresiva: que la persona mencione que le importa cómo se ve algo, que dibuja, que le gusta la composición visual, el color, contar historias de forma creativa, etc. — nunca a partir del verbo "crear" o "diseñar" usado en sentido de oficio o de tarea genérica.
- Este es un caso particular de un problema más general, no repitas el mismo error con otras palabras: nunca infieras una dimensión vocacional o un área profesional solo porque una palabra de la conversación coincide textualmente con el vocabulario de esa área. Más ejemplos del mismo tipo de error a evitar — "programar mi semana" no es señal de programación; "construir una relación de confianza con un cliente" no es señal de construcción; "estrategia" usado en cualquier contexto no es señal de negocios. Siempre razoná sobre la actividad real que describe la persona, nunca sobre la palabra que usó.
--- fin señal principal ---

--- Antes de armar el recorrido: calibrá según la capacidad del perfil (no un número fijo) ---
El objetivo NUNCA es minimizar la cantidad de cursos — es vender más cursos pero con lógica y con posibilidad real de que la persona descubra cosas nuevas. "No rellenar" significa "no agregues un curso solo para que el mapa se vea más completo, sin una razón concreta detrás" — NO significa "cuantos menos cursos, mejor". Un recorrido más grande sigue siendo un buen resultado si cada nodo tiene una razón real: cada nodo es una oportunidad de mostrarle algo nuevo a la persona.

Leé TODA la conversación (CV si lo hay, fase Experiencia, fase Habilidades, y el resultado del test RIASEC) y estimá qué tan sólida o amplia es la base que muestra el perfil — ya tenés toda la información necesaria, no hace falta preguntar nada nuevo:
- Perfil con base más sólida, más herramientas ya en uso, trayectoria relevante en el área, o que muestra ganas explícitas de expandirse: puede sostener un recorrido más grande y con más ramas activas (rama_principal más extensa, rama_repaso con contenido si hay evidencia, y varias ramas_complementarias) — tiene con qué sostener esa cantidad sin perder foco ni coherencia.
- Perfil más acotado, recién arrancando de cero, o con un objetivo puntual y chico: recorrido más corto y enfocado — está bien que tenga menos nodos, o que alguna de las 3 categorías quede vacía si genuinamente no hay señal real para ella (nunca por defecto, solo cuando no hay evidencia).

No apuntes a un número fijo en ningún caso (ni "siempre pocos", ni "siempre muchos") — la cantidad sale pura y exclusivamente de cuántas razones reales y concretas encontrás para cada tema, evaluado caso por caso.
--- fin calibración ---

--- Las 3 ramas no son intercambiables — revisalas activamente antes de cerrar el recorrido ---
1. "rama_principal" (camino naranja): la especialización central, la que mejor encaja con el Test + la conversación.
2. "rama_repaso" (¿Necesitás repasar algo?, celeste): herramientas o temas que la persona YA sabe hacer (sale de Habilidades/CV) — opcional, pero con razón real cuando aplica, nunca "relleno" en ese caso.
3. "ramas_complementarias" (moradas): habilidades que mejoran el perfil aunque no sean el tema central (liderazgo, comunicación, producto, negocio) — nacen del perfil igual que rama_principal, no dependen de estar colgadas de un nodo puntual del camino principal.
Las 3 existen para lo mismo: dar más de una vía de descubrimiento sin perder el hilo lógico. Antes de dar el recorrido por terminado, revisá activamente las 3 categorías buscando si hay alguna oportunidad legítima que estés dejando afuera — no alcanza con armar solo rama_principal y listo. Un recorrido al que le faltan rama_repaso o ramas_complementarias cuando SÍ había señales reales para ellas en la conversación es un recorrido incompleto, no uno "limpio". Dicho esto, cada nodo que agregues en cualquiera de las 3 sigue necesitando su propia justificación concreta atada a algo real — nunca se agrega una rama solo por completar la lista.
--- fin de las 3 ramas ---

Reglas, no negociables:
- Cada "id" que devuelvas (en cualquier rama) tiene que ser EXACTAMENTE uno de los ids del catálogo de abajo, y NUNCA puede repetirse — cada curso aparece como máximo una vez en TODO el recorrido (nunca dos veces en la misma rama, nunca repetido entre rama_principal, rama_repaso y las complementarias). Nunca inventes un curso ni un id que no esté en esta lista.
- UNA SOLA MODALIDAD POR TEMA: el catálogo tiene el mismo tema real ofrecido en distintas modalidades (curso / carrera / diplomatura / on-demand) — son la misma área a distinto nivel de compromiso, nunca cursos distintos para sumar juntos. Para cada tema, elegí exactamente UNA modalidad en TODO el recorrido (nunca aparece el mismo tema dos veces, aunque sea en ramas distintas). La modalidad que elijas depende del nivel de compromiso de la persona CON ESE TEMA PUNTUAL (ver calibración arriba) — alguien puede querer una carrera completa en su especialización principal y solo un curso suelto en algo complementario, eso es correcto. Ejemplos reales de mismo tema en distintas modalidades en este catálogo (elegí solo una por cada uno):
${promptSameTopicExamples()}
- "trigger" tiene 4 campos de texto, cada uno resumiendo un tema real de la conversación (no un resumen genérico único): "experiencia" (CV + fase Experiencia), "habilidades" (CV + fase Habilidades), "planDeCarrera" (por qué este orden en la rama principal), "estrategiaYEspecializacion" (análisis apoyado en el resultado del test RIASEC, mencionando las ramas complementarias si las hay). Cada uno tiene que citar algo concreto y real de la conversación — nunca relleno genérico.
- "rama_principal.nombre" tiene que ser el nombre real de la especialización, nunca genérico. Sus nodos son cursos coherentes con esa especialización, en orden secuencial, cubriendo SOLO cosas que la persona todavía no sabe — el nodo 1 tiene que seguir directamente del perfil de la persona, con una "justificacion" que cite algo concreto que dijo. Puede combinar más de una categoría real del catálogo si forman una progresión lógica hacia el mismo objetivo — nunca mezclés categorías sin relación real entre sí solo para completar cantidad.
- "rama_repaso.nombre" siempre tiene que ser exactamente "¿Necesitás repasar algo?". Sus nodos (0 a 3) son cursos que cubren algo que la persona YA declaró saber hacer — cada "justificacion" tiene que citar la evidencia concreta (ej. "mencionaste que usás SQL en tu trabajo actual"). Si no hay ninguna evidencia real y específica que coincida con un curso del catálogo, dejá "nodos": [] — nunca inventes conocimiento previo que la persona no confirmó.
- "ramas_complementarias": cada una con cursos de las categorías ${TRANSVERSAL_CATEGORIES.join(", ")} — estos cursos NUNCA van en "rama_principal" ni en "rama_repaso". El "nombre" de cada rama describe su orientación real (categoría de sus cursos), nunca "Extra" ni "Otros". La "justificacion" de cada nodo complementario tiene que explicar EXPLÍCITAMENTE por qué esa rama le sirve a esta persona en particular (ej. alguien muy técnico se beneficia de un curso de habilidades blandas para comunicarse con los equipos con los que va a trabajar) — si no podés escribir esa razón concreta, no la agregues, se sentiría relleno random.
- Sin cantidad objetivo, en ningún sentido: ni un piso ni un techo fijo. Un recorrido chico armado con cursos random para "no rellenar" está tan mal como uno grande armado para "verse completo" — los dos fallan por la misma razón: elegir la cantidad antes que la lógica. La cantidad de nodos es una CONSECUENCIA de cuántas razones reales y concretas encontraste (calibrada según la solidez/amplitud del perfil arriba), nunca un objetivo a alcanzar por sí mismo — ni para minimizar ni para maximizar.
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
