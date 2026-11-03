// QA de rutas profundas sobre el build (servidor estático sin fallback SPA).
import { startServer, launch, watchConsole, login, fail, table } from './lib.mjs'

const ROUTES = [
  { route: '/propuesta', view: 'propuesta' },
  { route: '/crear/v-demo/resultado', view: 'crear-resultado' },
  { route: '/proyectos/v-001', view: 'proyecto-detalle' },
  { route: '/configuracion/proveedores', view: 'proveedores' },
]
const { base, close } = await startServer()
const browser = await launch()
const rows = []; const errors = []
let cur = ''

// 1) Sin sesión: rutas internas → login (200 + React montado)
{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  watchConsole(page, errors, () => 'sin-sesion ' + cur)
  for (const r of ROUTES) {
    cur = r.route
    const res = await page.goto(base + '#' + r.route)
    const ok = await page.waitForSelector('[data-view="login"]', { timeout: 8000 }).then(() => true, () => false)
    rows.push({ sesion: 'no', ruta: '/#' + r.route, http: res.status(), resultado: ok ? 'login montado' : 'NO MONTÓ', ok })
  }
  await ctx.close()
}
// 2) Con sesión: entrar directo + F5
{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  watchConsole(page, errors, () => 'con-sesion ' + cur)
  const landed = await login(page, base)
  rows.push({ sesion: 'sí', ruta: 'login →', http: 200, resultado: 'aterrizó en ' + landed, ok: landed === '#/propuesta' })
  for (const r of ROUTES) {
    cur = r.route
    const res = await page.goto(base + '#' + r.route)
    const a = await page.waitForSelector(`[data-view="${r.view}"]`, { timeout: 8000 }).then(() => true, () => false)
    const textA = a ? (await page.innerText(`[data-view="${r.view}"]`)).length : 0
    const res2 = await page.reload()
    const b = await page.waitForSelector(`[data-view="${r.view}"]`, { timeout: 8000 }).then(() => true, () => false)
    const textB = b ? (await page.innerText(`[data-view="${r.view}"]`)).length : 0
    const hash = await page.evaluate(() => location.hash)
    rows.push({ sesion: 'sí', ruta: '/#' + r.route, http: `${res.status()} / F5 ${res2.status()}`, resultado: `directo:${a ? 'OK' : 'FALLA'}(${textA} chars) F5:${b ? 'OK' : 'FALLA'}(${textB} chars) hash:${hash}`, ok: a && b && textA > 50 && textB > 50 && hash === '#' + r.route })
  }
  await ctx.close()
}
await browser.close(); await close()
table(rows, ['sesion', 'ruta', 'http', 'resultado', 'ok'])
errors.forEach((e) => console.log('  ' + e))
const bad = rows.filter((r) => !r.ok)
if (bad.length) fail(`rutas con problema: ${bad.map((b) => b.ruta).join(', ')}`)
if (errors.length) fail(`${errors.length} errores de consola`)
console.log('\n✓ QA rutas en verde')
