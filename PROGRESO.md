# PROGRESO — Creavo demo

## Completado
- Bloque 1: scaffold Vite + React 18 + TS + Tailwind v3, tokens claro/oscuro, fuentes, HashRouter, anti-flash, manifest + íconos, render.yaml, scripts QA.
- Bloque 2: i18n (diccionario por archivos + useT + tr pura), stores (app + studio persistido en sessionStorage), marca.ts, mock completo, plantillas de guion, pipeline.

## En curso
- Bloque 3: shell.

## Pendiente
- Bloques 3–15.

## Decisiones
- Servidor de QA propio (scripts/lib.mjs) que sirve `dist/` sin fallback SPA (equivale a `serve dist` sin `-s`).
- Modales animados con CSS (`scale`/`translate`/`opacity` individuales), no framer-motion, para no tocar `transform`.

## Bloqueos
- `gh` en el contenedor tiene un token inválido (GH_TOKEN). Se resuelve al final, antes de crear el repo.
