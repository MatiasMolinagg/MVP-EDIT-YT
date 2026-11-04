// Capturas de evidencia: vistas clave a escritorio (1440) y a 390 px, ES/EN y claro/oscuro.
import fs from 'node:fs'
import { startServer, launch, login, gotoView, setPrefs, VIEWS } from './lib.mjs'
const OUT = 'qa-evidencia'; fs.mkdirSync(OUT, { recursive: true })
const { base, close } = await startServer(); const b = await launch()
const combos = [[1440, 'es', 'light'], [390, 'es', 'light'], [390, 'en', 'dark'], [1440, 'en', 'dark']]
for (const [w, lang, theme] of combos) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 2 })
  await setPrefs(ctx, { lang, theme })
  const p = await ctx.newPage()
  await p.goto(base + '#/login'); await p.waitForSelector('[data-view="login"]'); await p.waitForTimeout(700)
  await p.screenshot({ path: `${OUT}/${w}-${lang}-${theme}-login.png` })
  await login(p, base, { closeWelcome: false }); await p.waitForTimeout(500)
  await p.screenshot({ path: `${OUT}/${w}-${lang}-${theme}-welcome.png` })
  await p.click('[data-testid="welcome-close"]')
  for (const v of VIEWS) {
    await gotoView(p, base, v)
    if (v.view === 'crear-guion') await p.waitForTimeout(2600)
    await p.screenshot({ path: `${OUT}/${w}-${lang}-${theme}-${v.view}.png`, fullPage: w < 800 })
  }
  await gotoView(p, base, VIEWS[0]); await p.click('[data-testid="ver-demo-3"]'); await p.waitForTimeout(3500)
  await p.screenshot({ path: `${OUT}/${w}-${lang}-${theme}-generacion-corriendo.png` })
  await p.click('[data-testid="agent-fab"]'); await p.waitForTimeout(300)
  await p.click('[data-testid="agent-chip"] >> nth=2'); await p.waitForTimeout(3800)
  await p.screenshot({ path: `${OUT}/${w}-${lang}-${theme}-agente.png` })
  await ctx.close()
}
await b.close(); await close()
console.log(fs.readdirSync(OUT).length, 'capturas en', OUT)
