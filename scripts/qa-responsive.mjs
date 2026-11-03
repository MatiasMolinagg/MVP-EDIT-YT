// QA responsive: scrollWidth === clientWidth por vista y ancho + consola limpia
// + chequeos de capas fijas en mobile (agente sobre bottom-nav y barra de acción).
import { startServer, launch, VIEWS, watchConsole, login, gotoView, fail, table, setPrefs } from './lib.mjs'

const WIDTHS = [360, 390, 768, 1024, 1280, 1440]
const only = process.argv.find((a) => a.startsWith('--widths='))
const widths = only ? only.split('=')[1].split(',').map(Number) : WIDTHS

const { base, close } = await startServer()
const browser = await launch()
const rows = []
const errors = []
const layerIssues = []
const measure = (page) => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 } })
  await setPrefs(ctx)
  const page = await ctx.newPage()
  let cur = 'login'
  watchConsole(page, errors, () => `${width}px ${cur}`)
  // Login sin sesión
  await page.goto(base + '#/login')
  await page.waitForSelector('[data-view="login"]')
  await page.waitForTimeout(400)
  let m = await measure(page)
  rows.push({ width, view: 'login', scrollWidth: m.sw, clientWidth: m.cw, ok: m.sw === m.cw })
  await login(page, base)
  for (const v of VIEWS) {
    cur = v.view
    await gotoView(page, base, v)
    m = await measure(page)
    rows.push({ width, view: v.view, scrollWidth: m.sw, clientWidth: m.cw, ok: m.sw === m.cw })
  }
  // Estado extra: inversión revelada
  cur = 'propuesta+inversion'
  await gotoView(page, base, VIEWS[0])
  await page.click('[data-testid="price-toggle"]')
  await page.waitForTimeout(400)
  m = await measure(page)
  rows.push({ width, view: 'propuesta (inversión visible)', scrollWidth: m.sw, clientWidth: m.cw, ok: m.sw === m.cw })

  if (width < 1024) {
    // Agente por encima de bottom-nav y de la barra fija de /crear
    cur = 'capas-fijas'
    await gotoView(page, base, VIEWS[1])
    const r = await page.evaluate(() => {
      const box = (s) => document.querySelector(s)?.getBoundingClientRect()
      const fab = box('[data-testid="agent-fab"]'), nav = box('[data-tour="bottom-nav"]'), bar = box('[data-testid="action-bar"]')
      return { fab: fab && { top: fab.top, bottom: fab.bottom }, nav: nav && { top: nav.top }, bar: bar && { top: bar.top, bottom: bar.bottom } }
    })
    if (!r.fab || !r.nav || !r.bar) layerIssues.push(`${width}px: falta agente/bottom-nav/barra de acción`)
    else {
      if (r.fab.bottom > r.bar.top + 0.5) layerIssues.push(`${width}px: el agente (bottom ${r.fab.bottom}) tapa la barra de acción (top ${r.bar.top})`)
      if (r.bar.bottom > r.nav.top + 0.5) layerIssues.push(`${width}px: la barra de acción (bottom ${r.bar.bottom}) tapa la bottom-nav (top ${r.nav.top})`)
      console.log(`${width}px capas /crear → barra acción ${Math.round(r.bar.top)}–${Math.round(r.bar.bottom)}, bottom-nav top ${Math.round(r.nav.top)}, agente bottom ${Math.round(r.fab.bottom)}`)
    }
    // Sheet "Más"
    await page.click('[data-tour="mobile-menu"]')
    await page.waitForSelector('[data-testid="more-sheet"]')
    await page.waitForTimeout(350)
    m = await measure(page)
    rows.push({ width, view: 'sheet Más abierto', scrollWidth: m.sw, clientWidth: m.cw, ok: m.sw === m.cw })
    await page.keyboard.press('Escape')
  }
  await ctx.close()
}

await browser.close(); await close()
table(rows, ['width', 'view', 'scrollWidth', 'clientWidth', 'ok'])
const bad = rows.filter((r) => !r.ok)
console.log(`\nVistas medidas: ${rows.length} · con scroll horizontal: ${bad.length}`)
console.log(`Errores de consola: ${errors.length}`)
errors.forEach((e) => console.log('  ' + e))
layerIssues.forEach((e) => console.log('  capas: ' + e))
if (bad.length) fail(`scroll horizontal en: ${bad.map((b) => `${b.width}px ${b.view} (${b.scrollWidth}>${b.clientWidth})`).join(', ')}`)
if (errors.length) fail(`${errors.length} errores de consola`)
if (layerIssues.length) fail(`capas fijas superpuestas: ${layerIssues.length}`)
console.log('\n✓ QA responsive en verde')
