# Career Copilot — resumen de la sesión (hackathon CoderCUP IA)

## ✅ Estado del deploy (verificado en producción real)

**URL pública: https://career-copilot-coderhouse.vercel.app** — funcionando de punta a punta,
verificado en el navegador contra la URL real (no localhost), sin login de Vercel de por medio.

Bugs reales que solo aparecían en producción (no en `vercel dev` local) y se arreglaron:
- `api/chat.ts` importaba `./_lib/prompts` sin extensión — Node ESM nativo (lo que corre Vercel
  en prod) lo resuelve distinto a la resolución de bundler que usa `vercel dev`. Fix: `./_lib/prompts.js`.
- El modelo `gemini-2.0-flash` (y después `gemini-2.5-flash`) devolvían 404 "no longer available
  [to new users]" — Google restringe modelos viejos para API keys nuevas. Modelo final:
  **`gemini-3.5-flash`**.
- Había un `pnpm-lock.yaml` viejo compitiendo con `package-lock.json` — se borró para que Vercel
  use npm sin ambigüedad.
- Se agregó `vercel.json` con rewrite catch-all a `index.html` (si no, entrar directo a `/limbo`
  tiraba 404 — probado de verdad, no asumido).

Si el modelo vuelve a fallar en el futuro (Google deprecia modelos seguido), el error real
siempre aparece en `npx vercel logs <url-del-deploy>` — no confiar en el mensaje genérico
"The AI model call failed" que devuelve la API, siempre mirar los logs del lado del servidor.

## ✅ Adjuntar CV en /limbo (verificado en producción real)

- Botón de audio/micrófono: **sacado del todo** de la caja de chat (era decorativo, no hacía
  nada — se sacó en vez de dejarlo deshabilitado).
- Botón `+` de adjuntar CV: conectado de verdad. Solo PDF, tope de 8MB, extrae el texto **del
  lado del cliente** con `pdfjs-dist` (no se manda el PDF entero al servidor — ver la decisión
  técnica abajo). Estados: cargando (spinner) → listo (chip con nombre del archivo + botón para
  sacarlo) → error (mensaje claro si no es PDF, pesa de más, o es un PDF escaneado sin texto).
- El texto extraído viaja como contexto oculto en el primer mensaje que arranca la conversación
  (no se ve en la burbuja del chat, pero sí le llega al modelo). Probado en producción real con
  un CV de prueba: el modelo saludó por nombre, citó datos concretos del CV (años de experiencia,
  empresa, herramientas) y dijo explícitamente "en tu CV mencionás que...", en vez de volver a
  preguntar algo que el CV ya contestaba.
- **Decisión técnica**: se confirmó que el proyecto en Vercel es plan Hobby, con el límite de
  4.5MB de body en funciones serverless (no es específico de Hobby, aplica a todos los planes).
  Un PDF en base64 (+33% de peso) más el historial de la conversación deja muy poco margen para
  un CV real de varios MB — por eso se extrae el texto en el navegador en vez de mandar el PDF
  nativo a Gemini.


Deadline del hackathon: **23/8**. Este documento resume todo lo construido en esta sesión de
Claude Code, para retomar el trabajo en otra conversación sin perder contexto.

## Contexto del proyecto

- Repo base: réplica visual del sitio de Coderhouse (nav, colores, tipografía), generada
  originalmente con **Figma Make** y exportada como código. Vive en `src/imports/{1920WLight-1,1440WLight,768WLight}/index.tsx` —
  tres archivos gigantes (14.000+ líneas c/u), uno por breakpoint, con posicionamiento absoluto
  fijo tipo "canvas de Figma". Ese código es en gran parte código muerto/roto (ver más abajo) y
  **no se debe editar a mano salvo swaps puntuales** ya hechos esta sesión.
- Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 (sin `tailwind.config`, todo el theming
  vive en `src/index.css` con `@theme`). Se sumaron `framer-motion`, `lucide-react`,
  `react-router-dom`.
- Sistema de diseño: tokens centralizados en `src/index.css` (`--color-brand`, `--color-ink`,
  `--color-cream`, `--radius-pill`, etc.) — extraídos de los hex ya repetidos en el export, no
  inventados.

## Alcance original de la sesión (4 piezas)

1. Hero de la home
2. Motor de IA compartido (backend)
3. Widget de IA en el footer del sitio marketing (modo "sales")
4. Ruta `/limbo` con el agente de discovery (modo "discovery")

**Explícitamente fuera de alcance** (etapas posteriores ya planificadas, no tocar):
roadmap de 12 semanas, Job Ready Score, intranet/dashboard de alumnos.

## Qué se construyó

### 1. Hero (`src/components/Hero.tsx`)
- Escena ilustrada (isla + nubes + personaje), no video — capas: `back-clouds.png` (fondo, Ken
  Burns lento), `middle-sun.png` (logo-sol de Coderhouse entre el cielo y la montaña, con
  oclusión real detrás de la roca), `front-character.png` (primer plano, parallax sutil).
  Assets en `public/hero/`.
- Copy: headline "¿SABÉS QUÉ TE APASIONA?" en **Boldonse** (Google Font, decisión explícita del
  usuario tras probar Montserrat ExtraBold primero), mayúsculas, `leading-[1.6]` (Boldonse tiene
  glifos muy altos, con menos interlineado se pisaban las líneas). Subcopy + botón "Probá Career
  Copilot" (naranja sólido, apunta a `/limbo`).
- Pill "🔥 Nueva Coder funcionalidad 🔥" arriba del heading.
- Legibilidad del texto sobre la foto: gradientes (vertical + horizontal hacia la izquierda) +
  text-shadow — **no hay card ni fondo sólido detrás del texto** (se probó y se sacó, tapaba
  el diseño).
- Posicionamiento responsive: mobile = texto arriba (el personaje ocupa el centro/abajo del
  frame); desktop/tablet = texto centrado verticalmente a la altura del personaje. En pantallas
  ≥1920px hay más padding izquierdo (`min-[1920px]:px-32!` — el `!important` es necesario porque
  Tailwind v4 genera esa regla arbitraria *antes* que `sm:px-16` en el CSS compilado, y sin
  `!` la cascada la pisaba).

### 2. Navbar del sitio (`src/components/Navbar.tsx`)
No estaba en el alcance original, pero se rehizo porque el primer intento (píldora flotante
"tipo hero") no era lo que el usuario pedía — el usuario quería el **header real de Coderhouse**:
banner promo naranja que se va con el scroll + barra blanca con el logo que queda `sticky`. Se
reconstruyó fiel al original (mismo copy/colores) y se corrigió un bug real de `position:sticky`
(el wrapper que envolvía banner+nav era muy chico, así que el sticky se despegaba a los pocos
píxeles — el fix fue sacar ese wrapper para que el contenedor de posicionamiento sea toda la
página). Se usa en `MarketingLayout`, por lo tanto aparece en todo el sitio marketing, no en
`/limbo`.

### 3. Motor de IA compartido
- `api/chat.ts` — función serverless de **Vercel** (Node), único punto que llama al modelo.
  Recibe `{ mode: "sales" | "discovery", messages }`, usa **Gemini** (`gemini-2.5-flash` vía
  `@google/generative-ai`) con el system prompt correspondiente.
- `api/_lib/prompts.ts` — los dos system prompts (sales/discovery), solo server-side.
- `src/lib/ai/client.ts` — `sendChatMessage(mode, messages)`, el único punto del cliente que
  llama a `/api/chat`.
- `src/lib/ai/useChat.ts` — hook compartido de estado de chat (mensajes/loading/error), lo usan
  tanto el widget como `/limbo`.
- `src/lib/ai/careerProfile.ts` — parsea el marcador `<!--CAREER_PROFILE:{...}-->` que el prompt
  de discovery emite al cerrar la conversación.
- **`GEMINI_API_KEY` vive solo en `.env.local`** (gitignored) / variable de entorno de Vercel.
  Hay `.env.example` como plantilla (sin secreto, sí está commiteado).
- ⚠️ **Importante para deploy**: este repo tiene su propio pipeline (`figma make deploy`,
  estático, sin `/api`). Para que `api/chat.ts` funcione en producción hace falta deployar este
  repo a **Vercel** (no vía `figma make deploy`) y cargar `GEMINI_API_KEY` ahí. Local: `npm run
  dev` NO sirve `/api/chat` — hay que usar `npm run dev:full` (`vercel dev`).

### 4. Widget de venta (`src/components/SalesWidget.tsx`)
Píldora flotante fija abajo a la derecha, deliberadamente más chica/discreta que el CTA del hero.
Formato final (tras iterar): ícono circular naranja con varita (`Wand2`), texto "Hablá con el
Experto IA de Coderhouse", botón circular oscuro con ícono de teclado, botón "Hablar" naranja —
los tres abren el mismo panel de chat (modo `sales`). Se monta desde `MarketingLayout`, por lo
tanto en todo el sitio marketing salvo `/limbo`.

### 5. `/limbo` — agente de discovery (`src/pages/Limbo.tsx`)
Rediseñado completamente esta sesión (más allá del build inicial) según referencias visuales que
fue pasando el usuario. Estado actual:

- **Layout**: `LimboShell` con sidebar flotante (`src/components/limbo/LimboSidebar.tsx`,
  overlay `position:absolute`, NO es un sibling de flex — así el contenido principal se centra
  respecto al viewport completo y no al espacio que sobra al lado del sidebar) + fondo de grilla
  clara (`.bg-grid` en `index.css`, solo se usa acá) + barra superior ("Omitir test" → vuelve a
  `/`, ícono de config, avatar).
- **Sidebar**: pasos "Experiencia / Habilidades / Test / Resultado" — son **steps, no botones**
  (nada es clickeable todavía). "Experiencia" arranca como el paso activo. Solo "Test" (esta
  conversación) está realmente implementado; los otros tres son visuales, pertenecen a las etapas
  posteriores (roadmap/Job Ready Score/intranet) fuera de alcance.
- **Pantalla inicial**: headline "¡Hola! Hablemos sobre tu vocación y futuro" + subcopy "Contanos
  sobre vos, tu experiencia laboral, habilidades y qué te gusta, podés incluso adjuntar tu CV" +
  **carrusel horizontal** de 6 categorías reales (Programación y desarrollo, Marketing digital,
  Inteligencia Artificial +NUEVO, Diseño UX/UI, Data, Negocios — mismas imágenes que ya usa la
  sección "Categorías" de la home real, copiadas a `public/limbo/`). Clickear una categoría
  arranca la conversación con esa categoría como foco. El carrusel tiene flechas (chevron) en
  los bordes que hacen scroll horizontal.
- **Caja de chat** (abajo, píldora): ícono de varita, input, botón `+` (adjuntar documento) y
  ícono de micrófono (audio) — **estos dos últimos son solo visuales, no están conectados** a
  upload de archivos ni speech-to-text real todavía.
- **Conversación**: al mandar el primer mensaje, la pantalla inicial se reemplaza por el hilo de
  mensajes (burbujas), reusando `useChat("discovery")`.
- **Resultado**: cuando el prompt de discovery cierra con el marcador `CAREER_PROFILE`, se
  muestra la pantalla de Career Profile (2-3 caminos con explicación citando algo que dijo la
  persona) — sigue dentro del mismo `LimboShell` (sidebar/topbar visibles).
- Bugs reales encontrados y corregidos en el camino:
  - El centrado horizontal se rompía porque el sidebar era un sibling de flex (empujaba el
    contenido, quedaba centrado en el espacio sobrante, no en la pantalla completa).
  - Al sacar el sidebar del flujo de flex, apareció un bug de overflow real: el carrusel de
    categorías (contenido que no puede encogerse, `overflow-x-auto`) empujaba a sus ancestros a
    ~816px en un viewport de 375px, por el comportamiento default `min-width:auto` en flex/grid
    children. Se arregló agregando `min-w-0` en la cadena de contenedores.

## Cómo correrlo / probarlo

```bash
npm run dev        # solo el sitio estático (NO sirve /api/chat)
npm run dev:full    # vercel dev — necesario para probar cualquier cosa con IA real
```

Rutas: `/` (home), `/limbo` (discovery). Para IA real, cargar `GEMINI_API_KEY` en `.env.local`
(conseguir una gratis en https://aistudio.google.com/apikey).

## Qué falta / próximos pasos posibles

- **Deploy real a Vercel** para el hackathon (el pipeline actual del repo no sirve `/api`).
- Conectar de verdad el botón `+` (adjuntar CV) y el de audio en `/limbo`, o sacarlos si no se
  van a implementar a tiempo.
- Decidir si los pasos del sidebar (Experiencia/Habilidades/Resultado) deben avanzar
  automáticamente según el progreso de la conversación, o si quedan estáticos para el demo.
- Todo lo que ya estaba explícitamente fuera de alcance: roadmap de 12 semanas, Job Ready Score,
  intranet/dashboard de alumnos.
- Revisar en un dispositivo mobile real (no solo el emulador) que el carrusel de categorías y el
  centrado se vean bien — se verificó en el navegador de este entorno pero vale una pasada final.

## Estructura de archivos nuevos de esta sesión

```
api/chat.ts                          # endpoint serverless (Vercel + Gemini)
api/_lib/prompts.ts                  # system prompts (sales/discovery)
src/lib/ai/client.ts                 # fetch a /api/chat
src/lib/ai/useChat.ts                # hook de estado de chat compartido
src/lib/ai/careerProfile.ts          # parser del marcador CAREER_PROFILE
src/components/Hero.tsx
src/components/Navbar.tsx
src/components/CoderhouseLogo.tsx    # wordmark SVG reusable
src/components/MarketingLayout.tsx   # navbar + children + widget
src/components/SalesWidget.tsx
src/components/Community.tsx         # sección "La comunidad..." (rehecha, no era del alcance
                                      # original pero estaba rota en el export)
src/components/AprendeEnVivo.tsx     # card "Aprendé en vivo" (ídem, rehecha)
src/components/limbo/LimboSidebar.tsx
src/pages/Home.tsx
src/pages/Limbo.tsx
public/hero/, public/community/, public/limbo/   # assets reales copiados del export original
```

## Notas para quien retome esto

- Los 3 archivos gigantes de `src/imports/` son en gran parte auto-generados y frágiles. Cuando
  hubo que arreglar secciones rotas del export (Community, Aprendé en vivo), la estrategia fue:
  dejar el wrapper `<div className="absolute ... top-[Xpx]">` original intacto (mismo
  `data-name`, misma posición) y reemplazar el contenido interno por un componente nuevo en
  `src/components/`, para no tener que tocar miles de líneas de posicionamiento absoluto.
- Si aparece un nuevo error de build tipo `Expected a semicolon / Declaration or statement
  expected` en un componente nuevo, revisar que ningún comentario JSDoc contenga literalmente
  `*/` en medio del texto (p. ej. escribir una ruta tipo `imports/*/index.tsx` cierra el
  comentario antes de tiempo) — pasó dos veces esta sesión.
