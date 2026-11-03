// Utilidad interna: screenshots rápidos. Uso: node scripts/shot.mjs <ruta> <ancho> <archivo> [dark] [en] [acciones-js]
import { startServer, launch, login, setPrefs } from './lib.mjs'
const [route, width, out, theme = 'light', lang = 'es', js = ''] = process.argv.slice(2)
const { base, close } = await startServer()
const b = await launch()
const ctx = await b.newContext({ viewport: { width: +width, height: +width < 800 ? 844 : 900 }, deviceScaleFactor: 1 })
await setPrefs(ctx, { lang, theme })
const p = await ctx.newPage()
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.type(), m.text()) })
p.on('pageerror', (e) => console.log('pageerror', e.message))
if (route !== '/login') await login(p, base)
await p.goto(base + '#' + route)
await p.waitForTimeout(900)
if (js) { await p.evaluate(js); await p.waitForTimeout(1200) }
await p.screenshot({ path: out, fullPage: process.env.FULL === '1' })
await b.close(); await close()
