// QA de centrado: desvío (px) entre el centro de cada modal y el del viewport.
import { startServer, launch, watchConsole, login, gotoView, fail, table } from './lib.mjs'

const SIZES = [[1440, 900], [1920, 854], [375, 812]]
const { base, close } = await startServer()
const browser = await launch()
const rows = []; const errors = []

async function measure(page, name, size) {
  await page.waitForSelector('[data-modal]', { timeout: 6000 })
  await page.waitForTimeout(500) // fin de la animación de entrada
  const r = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-modal]')]
    const el = els[els.length - 1]
    const b = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth, vh = window.innerHeight
    return { dx: Math.abs(b.left + b.width / 2 - vw / 2), dy: Math.abs(b.top + b.height / 2 - vh / 2), w: b.width, h: b.height, fits: b.left >= 0 && b.right <= vw && b.top >= 0 && b.bottom <= vh }
  })
  const dx = Math.round(r.dx * 10) / 10, dy = Math.round(r.dy * 10) / 10
  rows.push({ viewport: size.join('×'), modal: name, 'Δx px': dx, 'Δy px': dy, tamaño: `${Math.round(r.w)}×${Math.round(r.h)}`, 'entra': r.fits, ok: dx < 0.5 && dy < 0.5 && r.fits })
}

for (const size of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: size[0], height: size[1] } })
  const page = await ctx.newPage()
  let cur = ''
  watchConsole(page, errors, () => size.join('×') + ' ' + cur)
  // Olvidé mi contraseña
  cur = 'forgot'
  await page.goto(base + '#/login'); await page.waitForSelector('[data-view="login"]')
  await page.click('[data-testid="forgot-open"]'); await measure(page, '¿Olvidaste tu contraseña?', size)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  // Welcome
  cur = 'welcome'
  await login(page, base, { closeWelcome: false }); await measure(page, 'Welcome', size)
  await page.click('[data-testid="welcome-close"]'); await page.waitForTimeout(250)
  // Canal: desconectar (confirmación) y conectar (simulación)
  cur = 'canal'
  await gotoView(page, base, { route: '/canal', view: 'canal' })
  await page.click('[data-testid="channel-disconnect"]'); await measure(page, 'Desconectar canal', size)
  await page.click('[data-testid="confirm-ok"]'); await page.waitForTimeout(300)
  await page.click('[data-testid="channel-connect"]'); await measure(page, 'Conectar canal (simulación)', size)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  // Borradores: eliminar
  cur = 'borradores'
  await gotoView(page, base, { route: '/borradores', view: 'borradores' })
  await page.click('[data-testid="draft-delete"]'); await measure(page, 'Eliminar borrador', size)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  // Tour: bienvenida (sin target) y modal final
  cur = 'tour'
  await gotoView(page, base, { route: '/propuesta', view: 'propuesta' })
  await page.click('[data-tour="tour-btn"]'); await measure(page, 'Tour · paso 1 (centrado)', size)
  await page.click('[data-testid="tour-skip"]'); await measure(page, 'Tour · modal final', size)
  await ctx.close()
}
await browser.close(); await close()
table(rows, ['viewport', 'modal', 'Δx px', 'Δy px', 'tamaño', 'entra', 'ok'])
errors.forEach((e) => console.log('  ' + e))
const bad = rows.filter((r) => !r.ok)
if (bad.length) fail(`modales descentrados: ${bad.map((b) => `${b.viewport} ${b.modal}`).join(', ')}`)
if (errors.length) fail(`${errors.length} errores de consola`)
console.log('\n✓ QA centrado en verde (desvío 0 px)')
