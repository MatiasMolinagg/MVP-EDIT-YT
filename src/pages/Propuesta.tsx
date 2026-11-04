import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Printer, Check, Eye, EyeOff, Mic, Sparkles, ClipboardCheck, Wand2, Send, RefreshCw, Lock } from 'lucide-react'
import { useT, tr } from '@/i18n'
import { useApp } from '@/store/app'
import { useStudio } from '@/store/studio'
import { MARCA, formatMonto } from '@/config/marca'
import { WhatsAppButton } from '@/components/common'
import { cn } from '@/lib/cn'

interface Modulo { n: number; view?: string; bullets: number }
const MODULOS: Modulo[] = [
  { n: 0, bullets: 3 },
  { n: 1, view: '/crear', bullets: 4 },
  { n: 2, view: '/crear', bullets: 4 },
  { n: 3, view: '/crear/v-demo/generacion', bullets: 4 },
  { n: 4, view: '/crear/v-demo/resultado', bullets: 4 },
  { n: 5, view: '/canal', bullets: 4 },
  { n: 6, view: '/configuracion/proveedores', bullets: 4 },
]
const PASOS = [Mic, Sparkles, ClipboardCheck, Wand2, Send]

export default function Propuesta() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const abrirPreview = useApp((s) => s.abrirPreview)
  const destacado = useApp((s) => s.moduloDestacado)
  const limpiar = useApp((s) => s.limpiarDestacado)
  const sembrar = useStudio((s) => s.sembrarPreview)
  const refs = useRef<Record<number, HTMLElement | null>>({})
  const [hl, setHl] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (destacado === null) return
    const m = destacado
    setHl(m)
    const s = setTimeout(() => refs.current[m]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    const id = setTimeout(() => { setHl(null); limpiar() }, 4000)
    return () => { clearTimeout(s); clearTimeout(id) }
  }, [destacado, limpiar])

  const verDemo = (m: Modulo) => {
    if (!m.view) return
    sembrar(m.n, lang)
    abrirPreview(m.n, m.view, { es: tr(`prop.m${m.n}.t`, 'es'), en: tr(`prop.m${m.n}.t`, 'en') })
    nav(m.view)
  }

  return (
    <div data-view="propuesta" className="pb-app print-full">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-accent">{t('prop.badge')}</span>
          <h1 className="mt-3 text-[clamp(30px,5vw,48px)] font-extrabold leading-[1.05] tracking-tight">{t('prop.titulo')}</h1>
          <p className="mt-3 text-[clamp(15px,1.6vw,18px)] leading-relaxed text-ink-2">{t('prop.bajada')}</p>
        </div>
        <div className="no-print flex flex-col gap-2 sm:flex-row">
          <button onClick={() => window.print()} className="btn-secondary"><Printer size={17} /> {t('prop.imprimir')}</button>
          <WhatsAppButton />
        </div>
      </header>

      {/* El circuito */}
      <section className="mt-12" data-trailer="circuito">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t('prop.circuito')}</h2>
        <p className="mt-1 text-sm text-ink-2">{t('prop.circuito.sub')}</p>
        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PASOS.map((I, i) => {
            const key = i === 3
            return (
              <li key={i} className={cn('relative flex flex-col rounded-xl border p-4', key ? 'border-accent bg-accent on-accent shadow-lg shadow-accent/25' : 'card')}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('font-mono text-[11px] font-bold tracking-wider', key ? 'opacity-80' : 'text-accent')}>{t('prop.paso', { n: i + 1 })}</span>
                  <I size={18} className={key ? '' : 'text-ink-2'} />
                </div>
                <p className="mt-3 text-[15px] font-semibold leading-snug">{t(`prop.paso${i + 1}`)}</p>
                {key && <span className="mt-3 inline-flex w-fit rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">{t('prop.paso4.tag')}</span>}
              </li>
            )
          })}
        </ol>
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-2"><RefreshCw size={14} /> {t('prop.circuito.loop')}</p>
      </section>

      {/* Qué incluye */}
      <section className="mt-12" data-trailer="modulos">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t('prop.incluye')}</h2>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs font-semibold text-ink-2">{t('prop.contador')}</span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((m) => (
            <article
              key={m.n}
              ref={(el) => { refs.current[m.n] = el }}
              data-testid={`modulo-${m.n}`}
              className={cn('card flex flex-col p-5 transition-all duration-300', hl === m.n && 'z-10 -translate-y-1 border-accent shadow-xl ring-4 ring-accent/25')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-2xl font-bold text-accent">{String(m.n).padStart(2, '0')}</span>
                {m.n === 0 && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent">{t('prop.paso1.badge')}</span>}
              </div>
              <h3 className="mt-3 text-[17px] font-bold leading-snug">{t(`prop.m${m.n}.t`)}</h3>
              <p className="mt-1.5 text-sm text-ink-2">{t(`prop.m${m.n}.d`)}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {Array.from({ length: m.bullets }, (_, i) => (
                  <li key={i} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-accent" />{t(`prop.m${m.n}.b${i + 1}`)}</li>
                ))}
              </ul>
              {m.view && (
                <button onClick={() => verDemo(m)} data-testid={`ver-demo-${m.n}`} className="no-print mt-5 inline-flex min-h-[44px] w-fit items-center gap-1 rounded-lg text-sm font-semibold text-accent hover:underline">
                  {t('prop.verDemo')}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Inversión: siempre al final, oculta por defecto */}
      <section className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface shadow-card" data-testid="inversion">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Lock size={19} /></span>
            <div className="min-w-0">
              <p className="kpi-label">{t('prop.inv.titulo')}</p>
              {open ? <p className="text-sm text-ink-2">{t('prop.inv.desglose', { monto: formatMonto(MARCA.precioTotal, lang) })}</p> : (
                <p className="font-mono text-2xl font-bold tracking-[.2em] text-ink-2" aria-hidden>••••••</p>
              )}
              {!open && <p className="text-xs text-ink-2">{t('prop.inv.hint')}</p>}
            </div>
          </div>
          <button onClick={() => setOpen((o) => !o)} data-testid="price-toggle" aria-expanded={open} className={cn('btn min-h-[52px] w-full border px-5 text-[15px] sm:w-auto', open ? 'border-line bg-surface text-ink hover:bg-surface-2' : 'border-accent bg-accent-soft text-accent hover:bg-accent hover:text-white')}>
            {open ? <EyeOff size={20} /> : <Eye size={20} />}
            {t(open ? 'prop.inv.ocultar' : 'prop.inv.ver')}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="border-t border-line p-5 sm:p-6" data-testid="inversion-detalle">
                <p className="kpi-label">{t('prop.inv.total')}</p>
                <p className="mt-1 break-words font-mono font-bold leading-none tracking-tight text-accent" style={{ fontSize: 'clamp(40px, 8vw, 56px)' }} data-testid="monto">{formatMonto(MARCA.precioTotal, lang)}</p>
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Item t={t('prop.inv.pago.t')}>{t('prop.inv.pago')}</Item>
                  <Item t={t('prop.inv.plazo.t')}>{t('prop.inv.plazo', { s: MARCA.plazoSemanas, p: MARCA.primeraVersionSemanas })}</Item>
                  <Item t={t('prop.inv.incluye.t')}>
                    <ul className="space-y-1.5">{[1, 2, 3].map((i) => <li key={i} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />{t(`prop.inv.incluye${i}`)}</li>)}</ul>
                  </Item>
                  <Item t={t('prop.inv.noIncluye.t')}>{t('prop.inv.noIncluye')}</Item>
                  <Item t={t('prop.inv.opcional.t')} className="md:col-span-2">{t('prop.inv.opcional', { monto: formatMonto(MARCA.mantenimientoMensual, lang) })}</Item>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Cierre */}
      <section className="no-print mt-10 rounded-2xl bg-surface-2 p-5 text-center sm:p-8">
        <p className="text-xl font-extrabold tracking-tight">{t('prop.cierre.t')}</p>
        <p className="mt-1 text-sm text-ink-2">{t('prop.cierre.sub')}</p>
        <WhatsAppButton full size="lg" className="mt-5" />
        <p className="mt-3 text-[11px] text-ink-2">{t('app.poweredBy')}</p>
      </section>
    </div>
  )
}

function Item({ t, children, className }: { t: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl bg-surface-2 p-4 text-sm', className)}>
      <p className="mb-1.5 font-semibold">{t}</p>
      <div className="text-ink-2">{children}</div>
    </div>
  )
}
