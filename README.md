# Career Copilot

Proyecto final del hackathon **CoderCUP IA** de Coderhouse. Es una réplica funcional del sitio de
Coderhouse con un asistente de IA (Gemini) integrado de punta a punta: ayuda a una persona a
descubrir qué estudiar, arma un CV a partir de una conversación o un PDF, y genera un recorrido de
cursos personalizado.

**Demo en vivo:** https://career-copilot-coderhouse.vercel.app
**Video explicando el proyecto:** https://youtu.be/qslOCPU4wwQ

> Nota: la demo usa una API key gratuita de Google AI Studio, sin facturación asociada — no tiene
> costo para nadie, bajo ningún uso. Tiene rate limiting y límites de tamaño de entrada para que
> siga disponible para todos.

## Qué hace

- **Landing** — réplica del sitio de Coderhouse (nav, catálogo, cursos).
- **`/limbo`** — flujo de descubrimiento: un test RIASEC + una conversación con un agente de IA
  (podés adjuntar tu CV en PDF) para entender tu perfil antes de elegir qué estudiar.
- **`/plataforma`** — la plataforma del estudiante: CV builder, portfolio, catálogo de cursos, y
  un **roadmap de carrera** generado por IA y renderizado como un flowchart interactivo
  (React Flow) con ramas principal, de repaso y complementarias.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 (theming vía `@theme` en
  `src/index.css`, sin `tailwind.config`)
- **Routing:** React Router
- **Animación:** Framer Motion
- **Flowchart del roadmap:** React Flow (`@xyflow/react`)
- **Lectura de CV en PDF:** `pdfjs-dist`, client-side (el PDF nunca se sube al servidor)
- **IA:** Google Gemini (`@google/generative-ai`), server-side únicamente
- **Backend:** 3 funciones serverless de Vercel (`/api/chat`, `/api/roadmap`, `/api/cvExtract`)
- **Deploy:** Vercel

## Arquitectura de IA

Los tres endpoints en `api/` son el único lugar donde se llama a Gemini. La API key vive solo en
una variable de entorno del servidor — nunca llega al cliente. Cada endpoint valida su input
(tamaño máximo de mensaje/CV/transcript), aplica rate limiting por IP, y nunca confía ciegamente
en la respuesta del modelo (los ids de curso que devuelve se filtran contra el catálogo real antes
de mostrarse).

```
src/lib/ai/        → clientes que llaman a los endpoints desde el frontend
api/                → las 3 funciones serverless (chat, roadmap, cvExtract)
api/_lib/           → prompts, rate limiting y el catálogo de cursos compartido
```

## Correr el proyecto localmente

```bash
npm install
cp .env.example .env.local   # completá tu propia GEMINI_API_KEY (gratuita en Google AI Studio)
npm run dev:full              # vercel dev — levanta el front + las funciones de /api
```

`npm run dev` (sin `dev:full`) levanta solo el frontend con Vite; los endpoints de IA no van a
responder sin `vercel dev` corriendo las funciones serverless.

## Calidad de código

```bash
npm run lint       # ESLint (TypeScript + reglas de React Hooks)
npm run typecheck  # tsc --noEmit
npm run test       # Vitest — tests unitarios sobre la lógica real (parser de CV,
                   # rate limiting, catálogo de cursos, helpers del roadmap)
```

## Una nota sobre `src/imports/`

Esa carpeta son los exports crudos de **Figma Make** (una página completa por breakpoint,
generada automáticamente, no escrita a mano) — están marcados como `linguist-generated` en
`.gitattributes` para que GitHub no los cuente como código del proyecto. El trabajo real de
frontend — la IA, el roadmap, el CV builder, el portfolio, el test RIASEC — está en `src/pages`,
`src/components` y `src/lib`.
