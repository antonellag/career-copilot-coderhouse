# Arquitectura de la landing + los dos asistentes de IA

Este documento complementa el journey map del onboarding (`journey-map-onboarding-draft.md`) con la etapa que va *antes* de él: la landing pública de Coderhouse, replicada en identidad, y los dos puntos de contacto con IA que conviven ahí.

## Etapa -1 — Landing (réplica de identidad Coderhouse)

Réplica fiel del diseño real de Coderhouse (paleta clara/vibrante, tono aspiracional, nav con Cursos / Carreras / Diplomaturas / Empresas / Nuestros graduados) — en desarrollo en Figma como design system propio, para que el resto de las pantallas nazcan con esa base y no se note salto de identidad.

**Hero:** reemplaza el video actual por una escena ilustrada — una persona con su notebook en su propio espacio/mundo (la referencia de "Prisma" con la isla flotante entre nubes es el mood correcto de composición: horizonte elevado, luz cálida, sensación de estar en un lugar propio con herramientas a mano). El encuadre correcto, después de la aclaración: no es soledad/angustia, es introspección con acompañamiento — la persona está en su mundo, y la herramienta (el Career Copilot) ya está ahí con ella. Esa lectura resuelve el único riesgo que había señalado (que abrir con angustia sin resolución baje la motivación de entrada) — con este encuadre no hace falta "resolver" nada visualmente, porque la escena ya transmite compañía, no aislamiento.

**Título + copy corto + CTA:** enunciar el problema en una frase (no "elegí tu curso", sino algo del orden de "no sé qué estudiar para conseguir el trabajo que quiero") y un botón de entrada al espacio de discovery. Ajustar el naming de cara al usuario — "limbo" queda como nombre interno de equipo, no como texto visible.

## Los dos asistentes de IA: mismo motor, dos objetivos de conversación distintos

Confirmado: es el mismo backend/IA en ambas superficies, no dos sistemas separados. Lo que cambia es el objetivo de la conversación y por lo tanto el prompt que la dirige — vale la pena que quede documentado así desde ahora para que cuando se escriban los prompts de sistema no se mezclen los dos objetivos en uno solo:

**Asistente 1 — Discovery ("limbo")**
Espacio independiente, previo a la plataforma de alumnos, donde se ajustan los contenidos que después van a figurar en la intranet. Objetivo de la conversación: conocer en profundidad a alguien que todavía no sabe qué quiere — hacer las preguntas, correr los mini-desafíos, construir el Career Profile y el roadmap. Es guiado, de varios turnos, y termina en un output estructurado (perfil + camino + roadmap). En términos de la skill playful-learning-ux, este es el modo "push" completo: la IA lleva la conversación.

**Asistente 2 — Widget de la web (asistente de venta/soporte)**
Vive en la landing pública, sin llevar a la persona a "limbo". Objetivo distinto y más acotado: acompañar a alguien que **ya sabe** lo que quiere pero tiene dudas puntuales sobre un curso o sobre Coderhouse, y ayudar a cerrar la decisión de inscribirse. Es reactivo y corto — responde lo que se le pregunta, no corre un test vocacional. En términos de la skill, esto es exactamente el modo "pull"/competencia de Self-Determination Theory: ayuda just-in-time cuando la persona la busca, no un flujo que la arrastra. Por eso conviene que en la interfaz se sienta claramente secundario al CTA principal ("Probá Career Copilot") — es una salida lateral para quien ya está decidido, no una alternativa de igual peso a la decisión de entrar al discovery.

Práctico para cuando se escriban los prompts de sistema más adelante: al Asistente 1 conviene darle instrucciones de iniciativa (qué preguntar, en qué orden, cuándo pasar al siguiente paso). Al Asistente 2 conviene darle una base de conocimiento sobre cursos/carreras/precios/modalidad y una instrucción explícita de mantenerse breve y orientado a resolver la duda puntual + invitar a inscribirse, sin intentar reconstruir el perfil vocacional de la persona.

## Referencia visual para "limbo"

La segunda captura compartida (interfaz tipo "Describe the mood, we'll make the board") es una referencia de tono más útil que la de Prisma para esta pantalla en particular: fondo claro, tarjetas suaves, headline grande y amigable, caja de conversación abajo. Encaja mejor con el tono real de Coderhouse (claro/aspiracional) que la estética oscura de Prisma, así que valdría la pena que el mood de "limbo" tome más de esta referencia que de la landing, y que la landing tome de Coderhouse real + el mood ilustrado del hero.

## Cierre del flujo

Al terminar el discovery en "limbo", la persona entra a la intranet de alumnos (Career Dashboard: roadmap, CV, portfolio, búsqueda laboral) — es la plataforma existente de Coderhouse, pero es la pieza que va a requerir más trabajo real porque hay que rehacerla para que sea funcional, no solo un mockup visual. Queda para cuando se llegue a esa etapa de construcción.
