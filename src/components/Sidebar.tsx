import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NAV_GROUPS, isActive } from './nav'
import { WhatsAppButton, DemoBadge } from './common'

export function Sidebar() {
  const { t } = useT()
  const { pathname } = useLocation()
  const nav = useNavigate()
  const cancelarPreview = useApp((s) => s.cancelarPreview)
  const logout = useApp((s) => s.logout)
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col self-start border-r border-line bg-surface lg:flex">
      <div className="flex h-14 items-center px-5"><Link to="/propuesta" onClick={cancelarPreview}><Logo /></Link></div>
      <nav data-tour="sidebar-nav" className="scroll-thin flex-1 overflow-y-auto px-3 py-2" aria-label={t('app.menu')}>
        {NAV_GROUPS.map((g) => (
          <div key={g.key} className="mb-4">
            <p className="px-3 pb-1.5 pt-2 text-[10.5px] font-bold tracking-[.1em] text-ink-2">{t(g.key)}</p>
            {g.items.map((it) => {
              const on = isActive(pathname, it)
              return (
                <Link
                  key={it.id}
                  to={it.to}
                  data-tour={`nav-${it.id}`}
                  onClick={cancelarPreview}
                  aria-current={on ? 'page' : undefined}
                  className={cn('flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors', on ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink')}
                >
                  <it.icon size={18} />
                  {t(it.key)}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <DemoBadge />
          <p className="mt-2 text-[13px] font-medium leading-snug">{t('app.ctaSidebar')}</p>
          <WhatsAppButton tour full className="mt-3 px-2 text-[13px]" />
          <p className="mt-2 text-center text-[10px] text-ink-2">{t('app.poweredBy')}</p>
        </div>
        <div className="mt-3 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold on-accent">JC</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{t('app.usuario')}</p>
            <p className="text-xs text-ink-2">{t('app.rol')}</p>
          </div>
          <button onClick={() => { logout(); nav('/login') }} aria-label={t('app.logout')} title={t('app.logout')} className="tap inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface hover:text-ink">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
}
