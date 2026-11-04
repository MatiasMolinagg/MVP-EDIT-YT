import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { useT } from '@/i18n'
import { cn } from '@/lib/cn'
import type { Tematica, Duracion, Tono, VozId } from '@/data/types'

export type Etapa = 'idea' | 'guion' | 'generacion' | 'resultado'
const ETAPAS: Etapa[] = ['idea', 'guion', 'generacion', 'resultado']

export function StageBar({ etapa, id, maxReached }: { etapa: Etapa; id?: string; maxReached: number }) {
  const { t } = useT()
  const cur = ETAPAS.indexOf(etapa)
  return (
    <nav aria-label={t('etapa.paso', { n: cur + 1 })} className="mb-6">
      <ol className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {ETAPAS.map((e, i) => {
          const done = i < cur || (i <= maxReached && i !== cur)
          const active = i === cur
          const to = e === 'idea' ? '/crear' : id ? `/crear/${id}/${e}` : undefined
          const clickable = !!to && !active && i <= maxReached
          const inner = (
            <>
              <span className={cn('h-1.5 w-full rounded-full', active ? 'bg-accent' : done ? 'bg-accent/50' : 'bg-line')} />
              <span className="mt-2 flex min-w-0 items-center gap-1.5">
                <span className={cn('hidden h-5 w-5 shrink-0 items-center sm:flex justify-center rounded-full font-mono text-[10px] font-bold', active ? 'bg-accent on-accent' : done ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2')}>
                  {done && !active ? <Check size={11} /> : i + 1}
                </span>
                <span className={cn('truncate text-[12px] font-semibold sm:text-[13px]', active ? 'text-ink' : 'text-ink-2')}>{t(`etapa.${e}`)}</span>
              </span>
            </>
          )
          return (
            <li key={e} className="min-w-0" aria-current={active ? 'step' : undefined}>
              {clickable ? <Link to={to!} className="flex min-h-[44px] flex-col">{inner}</Link> : <div className="flex min-h-[44px] flex-col">{inner}</div>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export interface ResumenData { tematica: Tematica; duracionMin: Duracion; idioma: 'es' | 'en'; tono: Tono; voz: VozId; titulo?: string }

function ResumenRows({ d }: { d: ResumenData }) {
  const { t } = useT()
  const rows: [string, string][] = [
    ['resumen.tematica', t(`tem.${d.tematica}`)],
    ['resumen.duracion', t('unidad.min', { n: d.duracionMin })],
    ['resumen.idioma', t(`idioma.${d.idioma}`)],
    ['resumen.tono', t(`tono.${d.tono}`)],
    ['resumen.voz', t(`voz.${d.voz}`)],
  ]
  return (
    <dl className="divide-y divide-line">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <dt className="text-ink-2">{t(k)}</dt>
          <dd className="text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ResumenLateral({ d }: { d: ResumenData }) {
  const { t } = useT()
  return (
    <div className="card sticky top-[76px] p-5">
      <p className="kpi-label">{t('resumen.titulo')}</p>
      {d.titulo && <p className="mt-2 text-[15px] font-bold leading-snug">{d.titulo}</p>}
      <div className="mt-2"><ResumenRows d={d} /></div>
    </div>
  )
}

export function ResumenMovil({ d }: { d: ResumenData }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <div className="card mb-5 lg:hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 text-left">
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <ListChecks size={17} className="shrink-0 text-accent" />
          <span className="truncate">{t('resumen.titulo')} · <span className="font-normal text-ink-2">{t(`tem.${d.tematica}`)} · {t('unidad.min', { n: d.duracionMin })}</span></span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-ink-2">{t(open ? 'resumen.ocultar' : 'resumen.ver')}{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
      </button>
      {open && <div className="border-t border-line px-4 pb-2">{d.titulo && <p className="pt-3 text-sm font-bold">{d.titulo}</p>}<ResumenRows d={d} /></div>}
    </div>
  )
}

/** Barra fija de acción: en <1024 queda arriba de la bottom-nav. Publica su alto para que el agente se ubique encima. */
export function ActionBar({ children, desktop = true }: { children: ReactNode; desktop?: boolean }) {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const apply = () => document.documentElement.style.setProperty('--action-bar-h', mq.matches ? '72px' : '0px')
    apply(); mq.addEventListener('change', apply)
    return () => { mq.removeEventListener('change', apply); document.documentElement.style.setProperty('--action-bar-h', '0px') }
  }, [])
  return (
    <>
      {desktop && <div className="mt-8 hidden justify-end gap-3 lg:flex">{children}</div>}
      <div data-testid="action-bar" className="glass fixed inset-x-0 z-30 flex h-[72px] items-center gap-2 border-t border-line px-4 lg:hidden" style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 [&>*]:min-w-0 [&>*]:flex-1 [&>*]:whitespace-nowrap">{children}</div>
      </div>
    </>
  )
}
