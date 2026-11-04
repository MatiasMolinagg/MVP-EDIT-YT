// QA i18n: (1) claves crudas en pantallas renderizadas ES/EN, (2) claves duplicadas
// entre archivos del diccionario, (3) claves usadas en el código que no existen.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { ROOT, startServer, launch, VIEWS, watchConsole, login, gotoView, fail, setPrefs } from './lib.mjs'

const problems = []
const I18N = path.join(ROOT, 'src/i18n')
const dictFiles = fs.readdirSync(I18N).filter((f) => f.startsWith('dict-'))
const require = createRequire(import.meta.url)
let ts
try { ts = require('typescript') } catch { fail('no encuentro typescript para leer los diccionarios. No pude correr el chequeo.') }

// ---------- 1) Diccionarios: duplicados entre archivos y valores vacíos ----------
const owner = new Map()
const DICT = {}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qai18n-'))
for (const f of dictFiles) {
  const src = fs.readFileSync(path.join(I18N, f), 'utf8')
  // Duplicados dentro del mismo archivo (TS también lo marca) y entre archivos.
  const keys = [...src.matchAll(/^\s*'([^']+)'\s*:\s*\[/gm)].map((m) => m[1])
  const seen = new Set()
  for (const k of keys) {
    if (seen.has(k)) problems.push(`duplicada en ${f}: ${k}`)
    seen.add(k)
    if (owner.has(k)) problems.push(`clave declarada dos veces: "${k}" en ${owner.get(k)} y ${f}`)
    else owner.set(k, f)
  }
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText
  const out = path.join(tmp, f.replace(/\.ts$/, '.mjs'))
  fs.writeFileSync(out, js)
  const mod = await import(pathToFileURL(out).href)
  const obj = Object.values(mod)[0]
  for (const [k, v] of Object.entries(obj)) {
    if (!Array.isArray(v) || v.length !== 2) problems.push(`formato inválido: ${k}`)
    else if (!String(v[0]).trim() || !String(v[1]).trim()) problems.push(`traducción vacía (ES o EN): ${k}`)
    DICT[k] = v
  }
}
console.log(`Diccionario: ${Object.keys(DICT).length} claves en ${dictFiles.length} archivos`)

// ---------- 2) Claves usadas en el código ----------
const KEY_LIT = /['"`]([a-z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+)['"`]/g
const DYN = /[`]([a-z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*\.)\$\{/g
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) }
const codeFiles = walk(path.join(ROOT, 'src')).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes(`${path.sep}i18n${path.sep}dict-`))
let used = 0
for (const f of codeFiles) {
  const src = fs.readFileSync(f, 'utf8')
  for (const m of src.matchAll(KEY_LIT)) {
    const k = m[1]
    if (/\.(ts|tsx|js|css|png|svg|json|webmanifest)$/.test(k)) continue
    used++
    if (!(k in DICT)) problems.push(`clave usada y no declarada: "${k}" (${path.relative(ROOT, f)})`)
  }
  for (const m of src.matchAll(DYN)) {
    if (!Object.keys(DICT).some((k) => k.startsWith(m[1]))) problems.push(`prefijo dinámico sin claves: "${m[1]}\${…}" (${path.relative(ROOT, f)})`)
  }
}
console.log(`Código: ${used} usos literales de claves en ${codeFiles.length} archivos`)

// ---------- 3) Pantallas renderizadas, ES y EN ----------
const RAW = /(?<![\w/@.-])[A-Za-z][A-Za-z0-9_]+(?:\.[A-Za-z][A-Za-z0-9_]+)+(?![\w/@-])/g
const ALLOW = new Set([])
async function visible(page) {
  return page.evaluate(() => {
    const parts = [document.body.innerText]
    document.querySelectorAll('[placeholder],[aria-label],[title]').forEach((el) => {
      ;['placeholder', 'aria-label', 'title'].forEach((a) => { const v = el.getAttribute(a); if (v) parts.push(v) })
    })
    parts.push(document.title)
    return parts.join('\n')
  })
}
const { base, close } = await startServer()
const browser = await launch()
const screens = { es: 0, en: 0 }
const consoleIssues = []
for (const lang of ['es', 'en']) {
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 860 } })
    await setPrefs(ctx, { lang })
    const page = await ctx.newPage()
    let cur = 'login'
    watchConsole(page, consoleIssues, () => `${lang} ${width}px ${cur}`)
    const check = async (label) => {
      cur = label
      const text = await visible(page)
      screens[lang]++
      for (const m of text.matchAll(RAW)) {
        if (ALLOW.has(m[0])) continue
        problems.push(`[${lang} ${width}px ${label}] clave cruda visible: "${m[0]}"`)
      }
    }
    await page.goto(base + '#/login'); await page.waitForSelector('[data-view="login"]'); await check('login')
    await page.click('[data-testid="forgot-open"]'); await page.waitForSelector('[data-modal]'); await check('login · olvidé contraseña'); await page.keyboard.press('Escape')
    await login(page, base, { closeWelcome: false }); await check('welcome'); await page.click('[data-testid="welcome-close"]')
    for (const v of VIEWS) { cur = v.view; await gotoView(page, base, v); await page.waitForTimeout(v.view === 'crear-guion' ? 2600 : 200); await check(v.view) }
    await gotoView(page, base, VIEWS[0]); await page.click('[data-testid="price-toggle"]'); await page.waitForTimeout(300); await check('propuesta · inversión visible')
    await page.click('[data-testid="notif-btn"]'); await page.waitForTimeout(250); await check('notificaciones'); await page.keyboard.press('Escape')
    await page.click('[data-testid="agent-fab"]'); await page.waitForTimeout(300)
    await page.click('[data-testid="agent-chip"] >> nth=2'); await page.waitForTimeout(3500); await check('agente'); await page.keyboard.press('Escape')
    if (width < 1024) { await page.click('[data-tour="mobile-menu"]'); await page.waitForSelector('[data-testid="more-sheet"]'); await check('sheet Más'); await page.keyboard.press('Escape') }
    // Tour completo
    await page.click('[data-tour="tour-btn"]')
    for (let i = 0; i < 14; i++) {
      await page.waitForTimeout(700)
      await check(`tour paso ${i + 1}`)
      const next = await page.$('[data-testid="tour-next"]')
      if (!next) break
      await next.click()
    }
    const fin = await page.$('[data-testid="tour-finish"]')
    if (fin) await fin.click()
    await page.waitForSelector('[data-modal]', { timeout: 4000 }).catch(() => problems.push(`[${lang} ${width}px] el modal final del tour no apareció`))
    await page.waitForTimeout(400)
    await check('tour · modal final')
    await ctx.close()
  }
}
await browser.close(); await close()
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`Pantallas revisadas: ES ${screens.es} · EN ${screens.en}`)
consoleIssues.forEach((c) => problems.push(c))
const raw = problems.filter((p) => p.includes('clave cruda'))
console.log(`Claves crudas visibles: ES ${raw.filter((p) => p.startsWith('[es')).length} · EN ${raw.filter((p) => p.startsWith('[en')).length}`)
if (problems.length) { problems.forEach((p) => console.log('  ✗ ' + p)); fail(`${problems.length} problemas de i18n`) }
console.log('\n✓ QA i18n en verde: 0 claves crudas en ES y EN, 0 duplicadas, 0 faltantes')
