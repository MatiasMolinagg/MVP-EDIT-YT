# PROGRESO — Creavo demo

## Completado
- Bloque 1: scaffold, tokens claro/oscuro, fuentes, HashRouter, anti-flash, manifest + íconos, render.yaml, scripts QA.
- Bloque 2: i18n (diccionario por archivos + useT + tr pura), stores (app + studio en sessionStorage), marca.ts, mock, plantillas de guion, pipeline.
- Bloque 3: shell (sidebar, bottom-nav, sheet Más, topbar, banners, DevNotice, toasts, notificaciones, retorno de preview).
- Bloque 4: login dos columnas + Welcome modal.
- Bloque 5: /crear Idea con dictado real + fallback.
- Bloque 6: Guion con efecto de escritura, escenas editables, voces con muestra.
- Bloque 7: Generación con cola en tiempo real, reintento 1/3 y aviso.
- Bloque 8: Resultado con reproductor de escenas, descarga y publicación.
- Bloque 9: Mis videos, detalle lateral y Borradores.
- Bloque 10: Canal de YouTube y Proveedores de IA.
- Bloque 11: Propuesta (circuito, módulos, Ver en el demo con retorno, inversión oculta).
- Bloque 12: Tour manual con spotlight clip-path.
- Bloque 13: Trailer (11 escenas, loop) y agente pre-programado.
- Bloque 14: QA responsive completo; arreglos: grilla de Canal desbordaba a 360/390, barra de acción encimada 1 px sobre la bottom-nav, contraste de texto sobre acento en oscuro, etiquetas cortas de la barra de Guion.

## En curso
- Bloque 15: portón de calidad y repo.

## Pendiente
- Crear repo en GitHub y entregar URL.

## Decisiones
- Servidor de QA propio (scripts/lib.mjs) que sirve `dist/` sin fallback SPA.
- Modales animados con CSS (`scale`/`translate`/`opacity` individuales).
- Script extra `qa:propuesta` para lo funcional del portón (inversión, Ver en el demo, dictado fallback, CTAs, tour 390).
- El trailer guarda y restaura el estado del estudio al salir.

## Bloqueos
- `gh` del contenedor con GH_TOKEN inválido: se resuelve al crear el repo.
