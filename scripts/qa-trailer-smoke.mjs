// Smoke del trailer: lo lanza desde el login a 1440 px, captura escenas y errores de consola.
import { startServer, launch, watchConsole, fail } from './lib.mjs'
const { base, close } = await startServer()
const b = await launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errs = []
watchConsole(p, errs, () => 'trailer')
await p.goto(base + '#/login')
await p.click('[data-testid="trailer-link"]')
const marks = [3, 26, 36, 55, 62, 80, 88]
let last = 0
for (const s of marks) {
  await p.waitForTimeout((s - last) * 1000); last = s
  const info = await p.evaluate(() => ({ hash: location.hash, caption: document.querySelector('.glass p.font-mono')?.textContent || document.querySelector('.glass p.text-3xl')?.textContent, agent: !!document.querySelector('[data-testid="agent-fab"]'), back: !!document.querySelector('[data-testid="preview-return"]') }))
  console.log(`t=${s}s`, JSON.stringify(info))
  await p.screenshot({ path: `${process.env.SHOTS_DIR || 'qa-output'}/trailer-${s}s.png` })
}
await p.keyboard.press('Escape')
await p.waitForTimeout(500)
console.log('después de Esc:', await p.evaluate(() => location.hash))
await b.close(); await close()
errs.forEach((e) => console.log(e))
if (errs.length) fail('errores en el trailer')
