import { createPortal } from 'react-dom'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp, type Tone } from '@/store/app'
import { cn } from '@/lib/cn'

const ICON: Record<Tone, typeof Info> = { ok: CheckCircle2, info: Info, warn: AlertTriangle, error: XCircle }
const CLR: Record<Tone, string> = { ok: 'text-emerald-500', info: 'text-accent', warn: 'text-amber-500', error: 'text-red-500' }

export function Toasts() {
  const { t } = useT()
  const toasts = useApp((s) => s.toasts)
  const dismiss = useApp((s) => s.dismissToast)
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-[64px] z-[95] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
      {toasts.map((x) => {
        const I = ICON[x.tone]
        return (
          <div key={x.id} data-testid="toast" className="anim-panel pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-xl border border-line bg-surface p-3 pr-1 text-sm shadow-xl">
            <I size={18} className={cn('mt-0.5 shrink-0', CLR[x.tone])} />
            <p className="min-w-0 flex-1 py-0.5">{t(x.key, x.vars)}</p>
            <button onClick={() => dismiss(x.id)} aria-label={t('app.cerrar')} className="-my-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-2 hover:text-ink"><X size={15} /></button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
