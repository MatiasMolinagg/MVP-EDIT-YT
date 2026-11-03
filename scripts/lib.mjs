// Utilidades compartidas por los scripts de QA. Sirven `dist/` con un servidor
// estático SIN fallback SPA (equivalente a `npx serve dist` sin `-s`).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DIST = path.join(ROOT, 'dist')

export function fail(msg) {
  console.error(`\n✗ QA ROJO: ${msg}`)
  process.exit(1)
}

export function ensureDist() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) fail('no existe dist/index.html — corré `npm run build` antes. No pude correr el chequeo.')
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.woff2': 'font/woff2' }

export function startServer() {
  ensureDist()
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || '/').split('?')[0])
      let file = path.join(DIST, url === '/' ? 'index.html' : url)
      if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'content-type': 'text/plain' }); res.end('404'); return
      }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
      fs.createReadStream(file).pipe(res)
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ base: `http://127.0.0.1:${port}/`, close: () => new Promise((r) => server.close(r)) })
    })
  })
}

export async function launch() {
  let pw
  const req = createRequire(import.meta.url)
  try { pw = req('playwright') } catch {
    try { pw = req('/opt/node-tools/node_modules/playwright') } catch { fail('Playwright no está disponible. No pude correr el chequeo.') }
  }
  try {
    return await pw.chromium.launch()
  } catch (e) {
    try { return await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }) } catch {
      fail(`no pude abrir Chromium (${e.message.split('\n')[0]}). No pude correr el chequeo.`)
    }
  }
}

export const VIEWS = [
  { route: '/propuesta', view: 'propuesta' },
  { route: '/crear', view: 'crear-idea' },
  { route: '/crear/v-demo/guion', view: 'crear-guion' },
  { route: '/crear/v-demo/generacion', view: 'crear-generacion' },
  { route: '/crear/v-demo/resultado', view: 'crear-resultado' },
  { route: '/proyectos', view: 'proyectos' },
  { route: '/proyectos/v-001', view: 'proyecto-detalle' },
  { route: '/borradores', view: 'borradores' },
  { route: '/canal', view: 'canal' },
  { route: '/configuracion/proveedores', view: 'proveedores' },
]

/** Registra errores de consola y excepciones de página. Ignora fuentes externas que no cargan offline. */
export function watchConsole(page, sink, label) {
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const txt = m.text()
      if (/fonts\.(googleapis|gstatic)\.com/.test(txt) || (txt.includes('Failed to load resource') && /fonts/.test(m.location()?.url || ''))) return
      sink.push(`[${label()}] console.error: ${txt}`)
    }
    if (m.type() === 'warning' && m.text().includes('[i18n]')) sink.push(`[${label()}] ${m.text()}`)
  })
  page.on('pageerror', (e) => sink.push(`[${label()}] pageerror: ${e.message}`))
}

export async function setPrefs(context, { lang = 'es', theme = 'light' } = {}) {
  await context.addInitScript(([l, t]) => {
    try {
      if (!sessionStorage.getItem('__qa_prefs')) {
        localStorage.setItem('creavo_lang', l); localStorage.setItem('creavo_theme', t); sessionStorage.setItem('__qa_prefs', '1')
      }
    } catch {}
  }, [lang, theme])
}

/** Login real por la UI. Devuelve el hash al que aterrizó. */
export async function login(page, base, { closeWelcome = true } = {}) {
  await page.goto(base + '#/login')
  await page.waitForSelector('[data-testid="login-user"]', { timeout: 15000 })
  await page.fill('[data-testid="login-user"]', 'juancarlos')
  await page.fill('[data-testid="login-pass"]', 'demo1234')
  await page.click('[data-testid="login-submit"]')
  await page.waitForFunction(() => location.hash.startsWith('#/propuesta'), null, { timeout: 10000 })
  const landed = await page.evaluate(() => location.hash)
  if (closeWelcome) {
    await page.waitForSelector('[data-testid="welcome-close"]', { timeout: 5000 })
    await page.click('[data-testid="welcome-close"]')
    await page.waitForSelector('[data-testid="welcome-close"]', { state: 'detached' })
  }
  return landed
}

export async function gotoView(page, base, v) {
  await page.goto(base + '#' + v.route)
  await page.waitForSelector(`[data-view="${v.view}"]`, { timeout: 10000 })
  await page.waitForTimeout(450)
}

export function table(rows, cols) {
  const w = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)))
  const line = (vals) => vals.map((v, i) => String(v).padEnd(w[i])).join(' | ')
  console.log(line(cols)); console.log(w.map((n) => '-'.repeat(n)).join('-|-'))
  rows.forEach((r) => console.log(line(cols.map((c) => r[c]))))
}
