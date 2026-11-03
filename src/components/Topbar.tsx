import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Bell, Sun, Moon, Loader2 } from 'lucide-react'
import { useT, tr } from '@/i18n'
import { useApp } from '@/store/app'
import { useStudio } from '@/store/studio'
import { estadoJob } from '@/data/pipeline'
import { horaRelativa } from '@/data/fechas'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

const iconBtn = 'tap inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink'

export function Topbar() {
  const { t, lang } = useT()
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const setLang = useApp((s) => s.setLang)
  const startTour = useApp((s) => s.startTour)
  const trailer = useApp((s) => s.trailer)
  const notifs = useApp((s) => s.notifs)
  const toast = useApp((s) => s.toast)
  const cancelarPreview = useApp((s) => s.cancelarPreview)
  const [open, setOpen] = useState(false)
  const unread = notifs.filter((n) => !n.read).length
  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-line bg-surface/90 px-2 backdrop-blur sm:px-4 lg:px-6">
      <Link to="/propuesta" onClick={cancelarPreview} className="flex min-h-[44px] min-w-0 items-center px-1 lg:hidden"><Logo size={28} /></Link>
      <div className="flex-1" />
      <JobChip />
      <button data-tour="tour-btn" onClick={() => !trailer && startTour()} className={cn(iconBtn, 'gap-1.5 px-2.5 font-semibold text-accent hover:text-accent sm:bg-accent-soft')} aria-label={t('app.tour')}>
        <Sparkles size={17} /><span className="hidden text-sm sm:inline">{t('app.tour')}</span>
      </button>
      <div className="relative">
        <button data-testid="notif-btn" data-trailer="bell" onClick={() => setOpen((o) => !o)} className={cn(iconBtn, 'relative')} aria-label={t('app.notifs')} aria-expanded={open}>
          <Bell size={18} />
          {unread > 0 && <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[10px] font-bold text-white">{unread}</span>}
        </button>
        {open && <NotifPanel onClose={() => setOpen(false)} />}
      </div>
      <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className={cn(iconBtn, 'font-mono text-[13px] font-bold')} aria-label={t('app.idioma')} title={t('app.idioma')}>
        {lang === 'es' ? 'EN' : 'ES'}
      </button>
      <button onClick={toggleTheme} className={iconBtn} aria-label={theme === 'dark' ? t('app.tema.claro') : t('app.tema.oscuro')} title={theme === 'dark' ? t('app.tema.claro') : t('app.tema.oscuro')}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button onClick={() => toast('app.perfil.toast', undefined, 'info')} className="tap inline-flex items-center justify-center" aria-label={t('app.avatar')}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white dark:text-[#0b0b12]">JC</span>
      </button>
    </header>
  )
}

function JobChip() {
  const { t, L } = useT()
  const job = useStudio((s) => s.job)
  const video = useStudio((s) => s.videos.find((v) => v.id === s.job?.videoId))
  const { pathname } = useLocation()
  const [, tick] = useState(0)
  useEffect(() => {
    if (!job || job.finished) return
    const i = setInterval(() => tick((n) => n + 1), 400)
    return () => clearInterval(i)
  }, [job])
  if (!job || job.finished || !video || pathname.endsWith('/generacion')) return null
  const p = Math.round(estadoJob(job).f * 100)
  return (
    <Link to={`/crear/${job.videoId}/generacion`} className="mr-1 hidden min-h-[36px] max-w-[260px] items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 text-xs font-semibold text-accent md:inline-flex">
      <Loader2 size={14} className="shrink-0 animate-spin" />
      <span className="truncate">{t('gen.banner', { titulo: L(video.titulo), p })}</span>
    </Link>
  )
}

function NotifPanel({ onClose }: { onClose: () => void }) {
  const { t, lang } = useT()
  const notifs = useApp((s) => s.notifs)
  const markAllRead = useApp((s) => s.markAllRead)
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const c = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-testid="notif-btn"]')) onClose() }
    window.addEventListener('keydown', k); document.addEventListener('mousedown', c)
    return () => { window.removeEventListener('keydown', k); document.removeEventListener('mousedown', c) }
  }, [onClose])
  return (
    <div ref={ref} data-testid="notif-panel" className="anim-panel fixed right-2 top-[60px] z-50 w-[min(380px,calc(100vw-16px))] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl sm:absolute sm:right-0 sm:top-12">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <p className="text-sm font-bold">{t('app.notifs')}</p>
        <button onClick={markAllRead} className="min-h-[40px] text-xs font-semibold text-accent">{t('app.notifs.marcar')}</button>
      </div>
      <div className="max-h-[60dvh] overflow-y-auto">
        {notifs.length === 0 && <p className="p-4 text-sm text-ink-2">{t('app.notifs.vacio')}</p>}
        {notifs.map((n) => (
          <button key={n.id} onClick={() => { if (n.to) nav(n.to); onClose() }} className="flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-surface-2">
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-accent')} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{tr(n.titleKey, lang)}</span>
              <span className="block text-[13px] text-ink-2">{tr(n.bodyKey, lang, n.vars)}</span>
              <span className="mt-0.5 block text-[11px] text-ink-2">{horaRelativa(n.fechaMs, lang)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
