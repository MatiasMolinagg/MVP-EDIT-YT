// QA funcional de la demo: Propuesta, inversión, "Ver en el demo" con retorno, dictado fallback,
// CTAs, textos prohibidos y tour a 390 px. Sale con error ante cualquier fallo.
import fs from 'node:fs'
import { startServer, launch, watchConsole, login, gotoView, fail, VIEWS, setPrefs, table } from './lib.mjs'

const MARCA_URL = 'https://wa.me/5491139375146?text=Vi%20el%20demo%20de%20Creavo%2C%20quiero%20que%20avancemos!'
const SHOTS = process.env.SHOTS_DIR || 'qa-output'
fs.mkdirSync(SHOTS, { recursive: true })
const { base, close } = await startServer()
const browser = await launch()
const rows = []; const errors = []
const ok = (check, pass, detalle = '') => rows.push({ check, ok: !!pass, detalle: String(detalle).slice(0, 110) })

for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 844 : 900 }, deviceScaleFactor: 2 })
  await setPrefs(ctx)
  const page = await ctx.newPage()
  let cur = ''
  watchConsole(page, errors, () => `${width}px ${cur}`)
  const tag = `[${width}]`
  cur = 'login'
  const landed = await login(page, base)
  ok(`${tag} login aterriza en /propuesta`, landed === '#/propuesta', landed)

  // Inversión: oculta por defecto, revela, oculta, y arranca oculta tras F5
  cur = 'inversion'
  const body = () => page.evaluate(() => document.body.innerText)
  let txt = await body()
  ok(`${tag} inversión oculta por defecto`, !(await page.$('[data-testid="monto"]')) && !/5[.,]000/.test(txt), /5[.,]000/.test(txt) ? 'monto visible' : 'sin monto en pantalla')
  const btn = await page.$('[data-testid="price-toggle"]')
  const bb = await btn.boundingBox()
  ok(`${tag} ojito cómodo (≥44px de alto)`, bb.height >= 44, `${Math.round(bb.width)}×${Math.round(bb.height)}`)
  await page.screenshot({ path: `${SHOTS}/propuesta-${width}-precio-oculto.png`, fullPage: true })
  await btn.click(); await page.waitForTimeout(450)
  const monto = await page.$eval('[data-testid="monto"]', (e) => e.textContent).catch(() => null)
  ok(`${tag} revela el monto`, monto === 'USD 5.000', monto)
  const montoBox = await page.$eval('[data-testid="monto"]', (e) => { const r = e.getBoundingClientRect(); return { r: r.right, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth } })
  ok(`${tag} monto sin desbordar`, montoBox.r <= montoBox.vw && montoBox.sw === montoBox.vw, JSON.stringify(montoBox))
  txt = await body()
  ok(`${tag} desglose y condiciones`, ['Plataforma completa · pago único: USD 5.000', '100% al firmar el contrato.', '6 semanas, con una primera versión funcional a las 2 semanas.', 'USD 97 por mes'].every((s) => txt.includes(s)), '')
  await page.$eval('[data-testid="inversion"]', (e) => e.scrollIntoView({ block: 'center' }))
  await page.screenshot({ path: `${SHOTS}/propuesta-${width}-precio-revelado.png` })
  await btn.click(); await page.waitForTimeout(450)
  ok(`${tag} segundo click oculta`, !(await page.$('[data-testid="monto"]')))
  await btn.click(); await page.waitForTimeout(300)
  await page.reload(); await page.waitForSelector('[data-view="propuesta"]')
  ok(`${tag} tras F5 arranca oculta`, !(await page.$('[data-testid="monto"]')) && !/5[.,]000/.test(await body()))

  // Textos prohibidos y montos fuera de la Propuesta
  cur = 'textos'
  const banned = /pr[oó]ximamente|pr[oó]xima etapa|roadmap|coming soon|descuento|discount|15 ?%|tiktok|instagram|facebook/i
  for (const v of VIEWS) {
    await gotoView(page, base, v)
    const t = await body()
    const m = t.match(banned)
    if (m) ok(`${tag} texto prohibido en ${v.view}`, false, m[0])
    if (v.view !== 'propuesta' && /USD|5[.,]000/.test(t)) ok(`${tag} monto fuera de Propuesta en ${v.view}`, false, t.match(/USD.{0,10}|5[.,]000/)[0])
  }
  ok(`${tag} sin textos prohibidos ni montos fuera de la Propuesta (${VIEWS.length} vistas)`, !rows.some((r) => r.check.startsWith(`${tag} texto prohibido`) || r.check.startsWith(`${tag} monto fuera`)))

  // CTAs de WhatsApp: un solo nombre y una sola URL
  cur = 'cta'
  await gotoView(page, base, VIEWS[0])
  if (width < 1024) { await page.click('[data-tour="mobile-menu"]'); await page.waitForSelector('[data-testid="more-sheet"]') }
  const ctas = await page.$$eval('a[href*="wa.me"]', (as) => as.map((a) => ({ t: a.textContent.trim(), h: a.getAttribute('href') })))
  ok(`${tag} CTAs WhatsApp (${ctas.length}) con nombre y URL únicos`, ctas.length >= 2 && ctas.every((c) => c.t === 'Avanzar por WhatsApp' && c.h === MARCA_URL), [...new Set(ctas.map((c) => c.t))].join(' | '))
  if (width < 1024) await page.keyboard.press('Escape')

  // Ver en el demo ↗ — siembra, navega, botón de retorno y vuelta a la tarjeta
  const MODS = [
    { n: 1, hash: '#/crear', check: () => page.$eval('[data-testid="idea-input"]', (e) => e.value.length > 20), desc: 'idea sembrada' },
    { n: 2, hash: '#/crear', check: () => page.$$eval('[data-tour="mic"]', (e) => !!e[0]?.parentElement?.querySelector('.anim-halo')), desc: 'micrófono resaltado' },
    { n: 3, hash: '#/crear/v-demo/generacion', check: () => page.$('[data-testid="pipeline"]').then(Boolean), desc: 'pipeline corriendo' },
    { n: 4, hash: '#/crear/v-demo/resultado', check: () => page.$('[data-testid="player"]').then(Boolean), desc: 'reproductor' },
    { n: 5, hash: '#/canal', check: () => page.$('[data-testid="channel-card"]').then(Boolean), desc: 'canal conectado' },
    { n: 6, hash: '#/configuracion/proveedores', check: () => page.$('[data-view="proveedores"] table, [data-view="proveedores"] ul').then(Boolean), desc: 'proveedores' },
  ]
  for (const m of MODS) {
    cur = `ver-demo-${m.n}`
    await gotoView(page, base, VIEWS[0])
    await page.click(`[data-testid="ver-demo-${m.n}"]`)
    await page.waitForTimeout(700)
    const hash = await page.evaluate(() => location.hash)
    const ret = await page.$('[data-testid="preview-return"]')
    const pobl = await m.check().catch(() => false)
    const label = ret ? (await ret.innerText()).replace(/\s+/g, ' ') : ''
    if (m.n === 4 && width < 1024) await page.screenshot({ path: `${SHOTS}/ver-demo-04-${width}.png` })
    if (m.n === 5) {
      // Esc también vuelve
      await page.keyboard.press('Escape')
    } else await page.click('[data-testid="preview-return"] button')
    await page.waitForTimeout(900)
    const back = await page.evaluate((n) => {
      const el = document.querySelector(`[data-testid="modulo-${n}"]`)
      const r = el.getBoundingClientRect()
      return { hash: location.hash, ring: el.className.includes('ring-4'), visible: r.top >= 0 && r.bottom <= window.innerHeight + 2 }
    }, m.n)
    ok(`${tag} Ver en el demo ${String(m.n).padStart(2, '0')}`, hash === m.hash && !!ret && pobl && back.hash === '#/propuesta' && back.ring && back.visible,
      `${hash} · ${m.desc}:${pobl} · retorno:${!!ret} "${label}" · vuelve:${back.hash} resaltada:${back.ring} visible:${back.visible}${m.n === 5 ? ' (con Esc)' : ''}`)
  }
  // Navegar por el menú cancela la previsualización
  await gotoView(page, base, VIEWS[0])
  await page.click('[data-testid="ver-demo-4"]'); await page.waitForTimeout(500)
  await page.click(width < 1024 ? '[data-tour="tab-proyectos"]' : '[data-tour="nav-proyectos"]'); await page.waitForTimeout(400)
  ok(`${tag} navegar por el menú cancela la previsualización`, !(await page.$('[data-testid="preview-return"]')))
  await ctx.close()
}

// Dictado: fallback simulado sin SpeechRecognition
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addInitScript(() => { try { delete window.SpeechRecognition; delete window.webkitSpeechRecognition } catch {} })
  const page = await ctx.newPage()
  watchConsole(page, errors, () => 'dictado-fallback')
  await login(page, base)
  await gotoView(page, base, VIEWS[1])
  await page.click('[data-testid="mic-btn"]')
  await page.waitForTimeout(1200)
  const live = await page.$eval('[data-testid="idea-input"]', (e) => e.value)
  await page.waitForTimeout(2800)
  const val = await page.$eval('[data-testid="idea-input"]', (e) => e.value)
  const notice = (await page.evaluate(() => document.body.innerText)).includes('Dictado por voz · función en desarrollo')
  ok('[390] dictado fallback escribe en vivo + DevNotice', live.length > 0 && val.length > live.length && val.includes('Nicaragua') && notice, `a 1.2s: "${live.slice(0, 30)}…" · final: "${val.slice(0, 50)}…" · DevNotice:${notice}`)
  await page.screenshot({ path: `${SHOTS}/dictado-fallback-390.png` })
  await ctx.close()
}

// Tour a 390: bottom-nav y botón "Más"
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  watchConsole(page, errors, () => 'tour-390')
  await login(page, base)
  await page.click('[data-tour="tour-btn"]')
  const seen = []
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(800)
    const s = await page.evaluate(() => {
      const tip = document.querySelector('[data-testid="tour-tooltip"]')
      const title = tip?.querySelector('h2')?.textContent
      const ring = document.querySelector('.border-accent.rounded-xl.pointer-events-none')?.getBoundingClientRect()
      const t = tip?.getBoundingClientRect()
      return { title, ring: ring && { top: Math.round(ring.top), left: Math.round(ring.left), w: Math.round(ring.width) }, tipInside: t ? t.left >= 0 && t.right <= innerWidth && t.top >= 0 && t.bottom <= innerHeight : false }
    })
    seen.push(s)
    if (i === 1) await page.screenshot({ path: `${SHOTS}/tour-390-bottom-nav.png` })
    if (i === 5) await page.screenshot({ path: `${SHOTS}/tour-390-mas.png` })
    const next = await page.$('[data-testid="tour-next"]')
    if (!next) break
    await next.click()
  }
  const navStep = seen[1], masStep = seen[5]
  ok('[390] tour paso 2 apunta a la bottom-nav', navStep.ring && navStep.ring.top > 700 && navStep.ring.w > 300 && navStep.tipInside, JSON.stringify(navStep))
  ok('[390] tour "4. Borradores" apunta al botón Más', masStep.title === '4. Borradores' && masStep.ring && masStep.ring.left > 280 && masStep.tipInside, JSON.stringify(masStep))
  ok('[390] tour: los 10 pasos con tooltip dentro de pantalla', seen.length === 10 && seen.every((s) => s.tipInside), seen.map((s) => s.title).join(' › '))
  await ctx.close()
}

await browser.close(); await close()
table(rows, ['check', 'ok', 'detalle'])
errors.forEach((e) => console.log('  ' + e))
const bad = rows.filter((r) => !r.ok)
if (bad.length) fail(`${bad.length} chequeos en rojo: ${bad.map((b) => b.check).join(' · ')}`)
if (errors.length) fail(`${errors.length} errores de consola`)
console.log(`\n✓ QA propuesta/funcional en verde (${rows.length} chequeos)`)
