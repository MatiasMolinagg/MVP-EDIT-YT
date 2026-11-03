import { useState, type ReactNode } from 'react'
import { Wrench, MessageCircle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { MARCA } from '@/config/marca'
import { cn } from '@/lib/cn'
import type { Estado } from '@/data/types'

export function WhatsAppButton({ className, tour, full, size = 'md' }: { className?: string; tour?: boolean; full?: boolean; size?: 'md' | 'lg' }) {
  const { t } = useT()
  return (
    <a
      href={MARCA.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-tour={tour ? 'whatsapp-cta' : undefined}
      data-testid="whatsapp-cta"
      className={cn('btn-wa', full && 'w-full', size === 'lg' && 'min-h-[52px] text-base', className)}
    >
      <MessageCircle size={18} />
      {t('app.whatsapp')}
    </a>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  const { t } = useT()
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-accent', className)}>
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" /></span>
      {t('app.demoPreview')}
    </span>
  )
}

/** Aviso ámbar honesto de función simulada. */
export function DevNotice({ f, ahora, luego, className }: { f: string; ahora: string; luego: string; className?: string }) {
  const { t } = useT()
  return (
    <div className={cn('flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200', className)} role="note">
      <Wrench size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{t(f)} · {t('dev.sufijo')}</p>
        <p className="mt-0.5"><span className="font-medium">{t('dev.ahora')}</span> {t(ahora)}</p>
        <p><span className="font-medium">{t('dev.luego')}</span> {t(luego)}</p>
      </div>
    </div>
  )
}

const ESTADO_CLS: Record<Estado, string> = {
  borrador: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
  guion: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
  en_proceso: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
  listo: 'bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  publicado: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  error: 'bg-red-50 text-red-700 dark:bg-red-400/15 dark:text-red-300',
}
const DOT: Record<Estado, string> = { borrador: 'bg-zinc-400', guion: 'bg-indigo-500', en_proceso: 'bg-indigo-500 anim-pulse-dot', listo: 'bg-sky-500', publicado: 'bg-emerald-500', error: 'bg-red-500' }

export function StatusBadge({ estado, className }: { estado: Estado; className?: string }) {
  const { t } = useT()
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', ESTADO_CLS[estado], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[estado])} />
      {t(`estado.${estado}`)}
    </span>
  )
}
export function ErrorBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-400/15 dark:text-red-300">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />{label}
    </span>
  )
}

export function PageHeader({ title, sub, actions, badge }: { title: string; sub?: string; actions?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {badge}
        <h1 className="h-page break-words">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** Banner de preview: arriba de cada vista salvo Propuesta y Login. Se colapsa por sesión. */
export function PreviewBanner({ id }: { id: string }) {
  const { t } = useT()
  const collapsed = useApp((s) => s.bannersCollapsed.includes(id))
  const collapse = useApp((s) => s.collapseBanner)
  const [, force] = useState(0)
  if (collapsed)
    return (
      <button onClick={() => { collapse(id, false); force((n) => n + 1) }} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-1 text-xs font-semibold text-ink-2 hover:text-ink">
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent">{t('banner.preview')}</span>
        {t('banner.expandir')} <ChevronDown size={14} />
      </button>
    )
  return (
    <section className="mb-6 rounded-xl border border-accent/25 bg-accent-soft/60 p-4 sm:p-5" aria-label={t('banner.preview')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-white dark:text-[#0b0b12]">{t('banner.preview')}</span>
          <span className="rounded-full border border-accent/40 px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-accent">{t('banner.mock')}</span>
        </div>
        <button onClick={() => collapse(id, true)} className="tap -mr-2 -mt-2 inline-flex items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-ink-2 hover:text-ink">
          {t('banner.colapsar')} <ChevronUp size={14} />
        </button>
      </div>
      <p className="mt-3 text-[15px] font-semibold">{t(`banner.${id}.title`)}</p>
      <ul className="mt-2 grid gap-1.5 text-sm text-ink-2 md:grid-cols-3 md:gap-4">
        {[1, 2, 3].map((n) => (
          <li key={n} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-accent" /><span>{t(`banner.${id}.b${n}`)}</span></li>
        ))}
      </ul>
    </section>
  )
}

export function KPI({ label, value, delta }: { label: string; value: string | number; delta?: string }) {
  return (
    <div className="card p-4">
      <p className="kpi-label">{label}</p>
      <p className="num-xl mt-2">{value}</p>
      {delta && <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">{delta}</p>}
    </div>
  )
}
