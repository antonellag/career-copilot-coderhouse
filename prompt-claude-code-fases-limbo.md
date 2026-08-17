# Prompt para Claude Code — Reestructurar /limbo en 4 fases

No, mejor no le pegues el documento tal cual — está escrito para pensarlo entre nosotras, no como especificación de ingeniería (le faltan límites de alcance explícitos, y el banco de preguntas del test solo tenía 5 ejemplos, no los 10 que hacen falta para armarlo de verdad). Te convertí todo eso en un prompt ejecutable, con el banco de preguntas completo adentro para que Claude Code no tenga que inventarlo.

Un paso antes de pegarlo: guardá el archivo `fases-contenido-limbo.md` que te mandé en el repo (por ejemplo en `docs/fases-limbo.md`) y commiteálo, así el prompt puede referenciarlo para el *por qué* de cada decisión sin que tengas que pegar todo el texto en la terminal.

```
Guardé el racional completo de esto en docs/fases-limbo.md (léelo para el contexto/por qué de
cada decisión) — este prompt es la especificación ejecutable de lo que hay que construir.

CONTEXTO: hoy /limbo es una sola conversación de chat continua. Hay que reestructurarla en 4
fases con interacciones distintas: Experiencia y Habilidades siguen siendo chat, Test es una UI
nueva de tarjetas de elección forzada, Resultado agrega un paso de selección + loading. Los pasos
del sidebar (Experiencia/Habilidades/Test/Resultado) tienen que pasar de ser decorativos a
reflejar la fase real en la que está la persona — esto resuelve algo que habíamos dejado
pendiente.

ALCANCE — hacé SOLO esto:
1. Reestructurar /limbo en las 4 fases secuenciales de abajo.
2. NO toques ni construyas: el roadmap de 12 semanas, el Job Ready Score, ni la plataforma de
   alumnos con nodos (todavía no tengo el diseño de esa parte) — al terminar la Fase 4, la
   persona tiene que llegar a una pantalla placeholder simple ("Estamos armando tu plataforma...")
   en una ruta nueva, no a nada construido de verdad.

Trabajá en una rama nueva, commits chicos por fase.

---

FASE 1 — Experiencia (ajuste sobre lo que ya existe, no una pantalla nueva)

Sigue siendo el chat actual. Cambio al system prompt de esta fase en api/_lib/prompts.ts: si hay
contenido de CV disponible (ya lo tenemos conectado), la primera pregunta del agente tiene que
partir de ahí en vez de arrancar de cero — por ejemplo, si el CV dice que viene de un rol
puntual, la apertura profundiza sobre eso en vez de preguntar "¿a qué te dedicás?" desde cero.
Objetivo de la fase: quién es, qué hace, qué sabe, qué le gusta.

---

FASE 2 — Habilidades (ajuste sobre lo que ya existe)

Sigue siendo chat. Cambio al system prompt: el objetivo es lo que la persona sabe hacer que el
CV no dice — herramientas, conocimientos informales, cosas de hobbies. En vez de preguntas
abiertas tipo "¿qué sabés hacer?" (la mayoría de la gente se queda en blanco con esa pregunta),
el agente ofrece anclas concretas, por ejemplo:
- "¿Hay herramientas que usás seguido aunque no sean parte de tu trabajo principal?"
- "¿Alguna vez te pidieron ayuda con algo porque 'se te da bien', aunque no sea tu profesión?"
- "¿Tenés algún hobby donde con el tiempo terminaste desarrollando una habilidad real?"

---

FASE 3 — Test vocacional (pantalla nueva, la pieza más grande de este prompt)

Basado en el modelo RIASEC de Holland (Realista, Investigador, Artístico, Social, Emprendedor,
Convencional) — cada persona termina con 2-3 dimensiones dominantes.

UI: una tarjeta central por vez con DOS opciones cortas tocables (elección forzada, no escala del
1 al 5 — la escala genera respuestas en el medio que no sirven de señal). Indicador de progreso
simple arriba (ej. "3/10"). Transición ágil entre tarjetas (la tarjeta actual sale, entra la
siguiente) con un micro-feedback visual al tocar. Antes de arrancar, un texto breve tipo "No hay
respuestas correctas, elegí lo que más te representa" — bajale la ansiedad de sentirse evaluada.

Banco de preguntas — usalo tal cual, no inventes otras (10 pares, cada opción vale 1 punto para
la dimensión entre paréntesis):

1. "Armar o reparar algo con las manos" (R) vs. "Investigar por qué pasa algo hasta entenderlo" (I)
2. "Crear algo original y estético" (A) vs. "Organizar información para que todo esté en orden" (C)
3. "Ayudar a alguien a resolver un problema personal" (S) vs. "Liderar un proyecto y tomar decisiones" (E)
4. "Analizar datos para encontrar un patrón" (I) vs. "Expresar una idea de forma creativa" (A)
5. "Convencer a otros de una idea" (E) vs. "Seguir un proceso paso a paso sin errores" (C)
6. "Trabajar con herramientas o tecnología concreta" (R) vs. "Escuchar y acompañar a otra persona" (S)
7. "Diseñar algo desde cero" (A) vs. "Negociar o vender una idea" (E)
8. "Resolver un problema lógico complejo" (I) vs. "Mantener todo prolijo y bien documentado" (C)
9. "Trabajar en equipo coordinando personas" (S) vs. "Trabajar solo/a con foco y precisión" (C)
10. "Hacer algo funcional y práctico" (R) vs. "Hacer algo visualmente atractivo" (A)

Al terminar las 10, sumá los puntos por dimensión y quedate con las 2-3 dimensiones más altas
(desempatá arbitrariamente si hace falta) — ese es el "código" que pasa a la Fase 4.

---

FASE 4 — Resultado (ajuste sobre el Career Profile que ya existe + agregar selección)

El Career Profile que ya se genera tiene que incorporar de verdad el código RIASEC de la Fase 3,
no solo el texto de la conversación — pasale ese resultado al prompt que arma los 2-3 caminos
recomendados, así la explicación del "por qué" puede apoyarse también en el test, no solo en lo
que la persona escribió.

Agregado nuevo: la persona tiene que ELEGIR uno de los caminos (no solo mirarlos) antes de
avanzar. Al elegir, mostrá un loading breve y navegá a una ruta nueva placeholder (por ejemplo
/plataforma) con un mensaje simple tipo "Estamos armando tu plataforma de aprendizaje..." — no
construyas nada real ahí todavía, es solo el punto de conexión para cuando tengamos el diseño de
la plataforma de nodos.

---

SIDEBAR: hacé que los pasos (Experiencia/Habilidades/Test/Resultado) reflejen la fase real en la
que está la persona en vez de quedar fijos — se marca completo el paso anterior al pasar a la
siguiente fase, y el paso activo se resalta.

Cuando termines cada fase, decime cómo probarla en pantalla — qué tengo que hacer para llegar
ahí, qué tengo que ver, y en el caso del Test específicamente cómo verificar que el resultado
final realmente refleja las respuestas que fui eligiendo (por ejemplo, si elijo todas las opciones
de un mismo tipo, el código final tiene que reflejar eso).
```
