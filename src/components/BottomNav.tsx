import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MoreHorizontal, LogOut } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { cn } from '@/lib/cn'
import { NAV_ITEMS, TABS, SHEET_ITEMS, isActive } from './nav'
import { WhatsAppButton, DemoBadge } from './common'

export function BottomNav() {
  const { t } = useT()
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState(false)
  const cancelarPreview = useApp((s) => s.cancelarPreview)
  const sheetActive = NAV_ITEMS.filter((i) => SHEET_ITEMS.includes(i.id)).some((i) => isActive(pathname, i))
  return (
    <>
      <nav
        data-tour="bottom-nav"
        aria-label={t('app.menu')}
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur safe-bottom lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
          {NAV_ITEMS.filter((i) => TABS.includes(i.id)).map((it) => {
            const on = isActive(pathname, it)
            return (
              <Link key={it.id} to={it.to} data-tour={`tab-${it.id}`} onClick={cancelarPreview} aria-current={on ? 'page' : undefined}
                className={cn('flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold', on ? 'text-accent' : 'text-ink-2')}>
                <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', on && 'bg-accent-soft')}><it.icon size={19} /></span>
                <span className="max-w-full truncate px-0.5">{t(it.short ?? it.key)}</span>
              </Link>
            )
          })}
          <button data-tour="mobile-menu" onClick={() => setSheet(true)} aria-expanded={sheet}
            className={cn('flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold', sheetActive ? 'text-accent' : 'text-ink-2')}>
            <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', sheetActive && 'bg-accent-soft')}><MoreHorizontal size={19} /></span>
            {t('app.mas')}
          </button>
        </div>
      </nav>
      {sheet && <MoreSheet onClose={() => setSheet(false)} />}
    </>
  )
}

function MoreSheet({ onClose }: { onClose: () => void }) {
  const { t } = useT()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const logout = useApp((s) => s.logout)
  const cancelarPreview = useApp((s) => s.cancelarPreview)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden">
      <div className="anim-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div data-testid="more-sheet" role="dialog" aria-modal="true" aria-label={t('app.mas')} className="anim-sheet absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-4 pt-3 safe-bottom">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        {NAV_ITEMS.filter((i) => SHEET_ITEMS.includes(i.id)).map((it) => (
          <Link key={it.id} to={it.to} onClick={() => { cancelarPreview(); onClose() }}
            className={cn('flex min-h-[52px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium', isActive(pathname, it) ? 'bg-accent-soft text-accent' : 'hover:bg-surface-2')}>
            <it.icon size={20} /> {t(it.key)}
          </Link>
        ))}
        <div className="mt-3 rounded-xl border border-line bg-surface-2 p-4">
          <DemoBadge />
          <p className="mt-2 text-sm font-medium">{t('app.ctaSidebar')}</p>
          <WhatsAppButton full className="mt-3" />
          <p className="mt-2 text-center text-[10px] text-ink-2">{t('app.poweredBy')}</p>
        </div>
        <button onClick={() => { onClose(); logout(); nav('/login') }} className="mb-4 mt-2 flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-ink-2 hover:bg-surface-2">
          <LogOut size={20} /> {t('app.logout')}
        </button>
      </div>
    </div>,
    document.body,
  )
}
