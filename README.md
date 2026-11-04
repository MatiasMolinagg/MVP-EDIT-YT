# Creavo · Demo navegable

MVP navegable con datos mock de **Creavo**, el estudio de video con IA propuesto a Juan Carlos: contás la idea (texto o voz), la IA arma el guion, se generan voz y edición y el video se descarga o se publica en YouTube. Es una demo comercial, no producción.

Stack: Vite + React 18 + TypeScript + Tailwind v3 + componentes estilo shadcn/ui + Recharts + framer-motion + lucide-react + react-router-dom (`HashRouter`) + zustand.

## Correr local

```bash
npm install
```

```bash
npm run dev
```

## Build

```bash
npm run build
```

Verificación local del build sin fallback SPA (igual que cualquier hosting estático):

```bash
npx serve dist
```

Entrá directo a `http://localhost:3000/#/propuesta` (sin `-s`): si funciona así, funciona en cualquier hosting.

## Deploy en Render (manual)

1. New → **Static Site** → elegir este repo.
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

Nada más. El `render.yaml` está solo por prolijidad (sin `plan` ni `region`).

## Chequeo post-deploy (manual)

1. Abrí la URL de Render y logueate (botón “Juan Carlos · Creador” → Ingresar).
2. Pegá cada una de estas rutas en la barra del navegador y apretá **F5** en cada una:
   - `/#/propuesta`
   - `/#/crear/v-demo/resultado`
   - `/#/proyectos/v-001`
   - `/#/configuracion/proveedores`
3. Cada una tiene que cargar poblada y seguir igual después del F5.

## Dictado con micrófono real (chequeo manual)

El dictado real (`SpeechRecognition` / `webkitSpeechRecognition`, `interimResults`) **no se puede medir en un navegador headless**. Chequeo manual: en Chrome de escritorio o Safari iOS, entrá a **Crear video**, tocá el micrófono, aceptá el permiso y hablá: el texto aparece en vivo y queda editable. Si el navegador no lo soporta o se niega el permiso, se activa el dictado simulado con su aviso “Dictado por voz · función en desarrollo” (este fallback sí está verificado por `qa:propuesta`).

## QA automatizado

Todos los scripts sirven `dist/` con un servidor estático propio **sin fallback SPA**, usan Chromium real (Playwright) y salen con código ≠ 0 ante cualquier fallo o si no pueden correr.

| Script | Qué verifica |
|---|---|
| `npm run qa:responsive` | `scrollWidth === clientWidth` en cada vista a 360, 390, 768, 1024, 1280 y 1440, consola sin errores, y que el agente quede por encima de la barra de acción y de la bottom-nav |
| `npm run qa:i18n` | Claves crudas en pantallas renderizadas (ES y EN, 1280 y 390, incluye modales, tour, agente y notificaciones), claves duplicadas entre archivos del diccionario y claves usadas que no existen |
| `npm run qa:centrado` | Desvío entre el centro de cada modal y el del viewport a 1440×900, 1920×854 y 375×812 |
| `npm run qa:rutas` | Login → `/propuesta` y entrada directa + F5 en las 4 rutas profundas; sin sesión, las rutas internas montan el login |
| `npm run qa:propuesta` | Inversión oculta, revelado, ocultado y oculta tras F5; cada “Ver en el demo” con pantalla poblada, botón de retorno y vuelta a la tarjeta; CTAs; textos prohibidos; dictado fallback; tour a 390 px |
| `npm run qa:trailer` | Corre el modo trailer completo a 1440 px y sale con Esc |
| `npm run qa` | Build + todos los anteriores salvo trailer |

La evidencia de la última corrida está en `qa-evidencia/`.

## Dónde está cada cosa

- Precio y marca: `src/config/marca.ts` (única fuente de los montos).
- Diccionario ES/EN: `src/i18n/dict-*.ts` (cada clave vive en un solo archivo).
- Mock: `src/data/mock.ts`; plantillas de guion: `src/data/guion.ts`.
- Pipeline simulado: `src/data/pipeline.ts` + `src/components/JobWatcher.tsx`.

Powered by Insights.
