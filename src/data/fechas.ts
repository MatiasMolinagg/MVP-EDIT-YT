import type { Lang } from '@/i18n'
import { tr } from '@/i18n'

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO local (YYYY-MM-DD) sin toISOString(): de noche no salta al día siguiente. */
export function isoLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export function isoDiasAtras(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return isoLocal(d)
}
function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function diasDesde(iso: string): number {
  const hoy = parse(isoLocal())
  return Math.round((hoy.getTime() - parse(iso).getTime()) / 86400000)
}
export function formatFecha(iso: string, lang: Lang): string {
  return parse(iso).toLocaleDateString(lang === 'es' ? 'es-419' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}
/** "Hoy", "Ayer", "Hace 3 días" o fecha corta, siempre traducido. */
export function fechaRelativa(iso: string, lang: Lang): string {
  const d = diasDesde(iso)
  if (d <= 0) return tr('fecha.hoy', lang)
  if (d === 1) return tr('fecha.ayer', lang)
  if (d < 7) return tr('fecha.haceDias', lang, { n: d })
  return formatFecha(iso, lang)
}
export function horaRelativa(ms: number, lang: Lang): string {
  const min = Math.max(0, Math.round((Date.now() - ms) / 60000))
  if (min < 1) return tr('fecha.ahora', lang)
  if (min < 60) return tr('fecha.haceMin', lang, { n: min })
  const h = Math.round(min / 60)
  if (h < 24) return tr('fecha.haceHoras', lang, { n: h })
  const d = Math.round(h / 24)
  return d === 1 ? tr('fecha.ayer', lang) : tr('fecha.haceDias', lang, { n: d })
}
