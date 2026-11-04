import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'

/** Botón flotante de retorno a la Propuesta durante "Ver en el demo". */
export function PreviewReturn() {
  const { t, L } = useT()
  const preview = useApp((s) => s.preview)
  const trailer = useApp((s) => s.trailer)
  const cerrar = useApp((s) => s.cerrarPreview)
  const nav = useNavigate()
  const volver = useCallback(() => { cerrar(); nav('/propuesta') }, [cerrar, nav])
  useEffect(() => {
    if (!preview || trailer) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[data-modal],[data-testid="more-sheet"],[data-testid="notif-panel"],[data-testid="agent-panel"]')) volver() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [preview, trailer, volver])
  if (!preview || trailer) return null
  return (
    <div data-testid="preview-return" className="no-print fixed left-3 right-3 top-[64px] z-[35] flex flex-wrap items-center gap-2 lg:left-[264px]">
      <button onClick={volver} className="relative inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent pl-3 pr-4 text-sm font-semibold on-accent shadow-lg">
        <span className="anim-halo pointer-events-none absolute inset-0 rounded-full bg-accent" aria-hidden />
        <ArrowLeft size={17} className="relative" />
        <span className="relative">{t('preview.volver')}</span>
      </button>
      <span className="glass inline-flex min-h-[36px] max-w-full items-center gap-2 rounded-full border border-line px-3 text-xs font-medium text-ink shadow-sm">
        <Eye size={14} className="shrink-0 text-accent" />
        <span className="truncate">{t('preview.viendo', { modulo: `${String(preview.modulo).padStart(2, '0')} · ${L(preview.titulo)}` })}</span>
      </span>
    </div>
  )
}
