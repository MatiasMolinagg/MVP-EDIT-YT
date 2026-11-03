import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useT } from '@/i18n'

interface Props {
  open: boolean
  onClose?: () => void
  width?: number
  children: ReactNode
  backdropClose?: boolean
  showClose?: boolean
  className?: string
  labelledBy?: string
  z?: number
}

/** Modal centrado con `fixed inset-0 m-auto h-fit`. Entrada con scale/translate/opacity individuales. */
export function Modal({ open, onClose, width = 480, children, backdropClose = true, showClose = true, className, labelledBy, z = 80 }: Props) {
  const { t } = useT()
  useEffect(() => {
    if (!open || !onClose) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: z }}>
      <div className="anim-fade fixed inset-0 bg-black/55 backdrop-blur-[3px]" onClick={backdropClose ? onClose : undefined} aria-hidden />
      <div
        data-modal
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn('anim-modal fixed inset-0 m-auto h-fit max-h-[88vh] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-5 text-ink shadow-2xl sm:p-6', className)}
        style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      >
        {showClose && onClose && (
          <button onClick={onClose} aria-label={t('app.cerrar')} className="tap absolute right-2 top-2 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink">
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmProps { open: boolean; title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void }
export function ConfirmModal({ open, title, body, confirmLabel, danger, onConfirm, onClose }: ConfirmProps) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onClose} width={420} labelledBy="confirm-title">
      <h2 id="confirm-title" className="pr-10 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-ink-2">{body}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-secondary" onClick={onClose}>{t('app.cancelar')}</button>
        <button data-testid="confirm-ok" className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
