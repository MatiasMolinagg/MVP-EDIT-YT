import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Eye, EyeOff, Check, PlayCircle, Sun, Moon, Zap } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { MARCA } from '@/config/marca'
import { Logo } from '@/components/Logo'
import { DemoBadge } from '@/components/common'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

export default function Login() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const login = useApp((s) => s.login)
  const toast = useApp((s) => s.toast)
  const setLang = useApp((s) => s.setLang)
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const setTrailer = useApp((s) => s.setTrailer)
  const trailerSession = useApp((s) => s.trailerSession)
  const [tab, setTab] = useState<'in' | 'up'>('in')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [err, setErr] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [email, setEmail] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !pass.trim()) { setErr(true); return }
    if (tab === 'up') { toast('login.crear.toast'); setTab('in'); return }
    login()
    nav('/propuesta', { replace: true })
  }
  const autofill = () => { setUser('juancarlos'); setPass('demo1234'); setName('Juan Carlos'); setErr(false) }
  const trailer = () => { trailerSession(true); setTrailer(true); nav('/propuesta') }

  const bullets = ['login.b1', 'login.b2', 'login.b3', 'login.b4']
  return (
    <div data-view="login" className="relative flex min-h-[100dvh] w-full">
      <div className="absolute right-3 top-3 z-20 flex gap-1">
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="tap inline-flex items-center justify-center rounded-lg font-mono text-[13px] font-bold text-ink-2 hover:bg-surface-2 hover:text-ink" aria-label={t('app.idioma')}>{lang === 'es' ? 'EN' : 'ES'}</button>
        <button onClick={toggleTheme} className="tap inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink" aria-label={theme === 'dark' ? t('app.tema.claro') : t('app.tema.oscuro')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
      </div>

      {/* Izquierda: marca (solo ≥1024) */}
      <section className="relative hidden w-[55%] overflow-hidden border-r border-line bg-surface-2 lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-indigo-400/30 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[380px] w-[380px] rounded-full bg-fuchsia-400/20 blur-[100px]" />
        <div className="relative max-w-xl">
          <div className="flex items-center gap-3"><Logo size={40} /><DemoBadge /></div>
          <h1 className="mt-10 text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.05] tracking-tight">
            {t('login.headline1')}<br /><span className="text-accent">{t('login.headline2')}</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-2">{t('login.sub')}</p>
          <ul className="mt-8 space-y-3">
            {bullets.map((b, i) => (
              <motion.li key={b} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12 }} className="flex items-center gap-3 text-[15px] font-medium">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent"><Check size={15} /></span>{t(b)}
              </motion.li>
            ))}
          </ul>
          <button onClick={trailer} data-testid="trailer-link" className="mt-10 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent hover:underline">
            <PlayCircle size={18} /> {t('login.trailer')}
          </button>
        </div>
      </section>

      {/* Derecha: tarjeta */}
      <section className="flex w-full flex-col items-center justify-center px-4 py-16 lg:w-[45%] lg:px-10">
        <div className="mb-6 flex w-full max-w-[420px] items-center justify-between lg:hidden">
          <Logo size={34} />
          <DemoBadge />
        </div>
        <p className="mb-5 w-full max-w-[420px] text-[22px] font-extrabold leading-tight tracking-tight lg:hidden">
          {t('login.headline1')} <span className="text-accent">{t('login.headline2')}</span>
        </p>
        <div className="card w-full max-w-[420px] p-5 sm:p-7">
          <div className="grid grid-cols-2 rounded-lg bg-surface-2 p-1" role="tablist">
            {(['in', 'up'] as const).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(false) }}
                className={cn('min-h-[40px] rounded-md text-sm font-semibold transition', tab === k ? 'bg-surface text-ink shadow-card' : 'text-ink-2')}>
                {t(k === 'in' ? 'login.tab.ingresar' : 'login.tab.crear')}
              </button>
            ))}
          </div>
          <h2 className="mt-6 text-xl font-bold">{t(tab === 'in' ? 'login.titulo' : 'login.titulo.crear')}</h2>
          <button type="button" onClick={autofill} data-testid="autofill" className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dashed border-accent/50 bg-accent-soft px-3 text-[13px] font-semibold text-accent">
            <Zap size={14} /> {t('login.autofill')} <span className="hidden font-normal text-ink-2 xs:inline">· {t('login.autofill.hint')}</span>
          </button>
          <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
            {tab === 'up' && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{t('login.nombre')}</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('login.nombre.ph')} autoComplete="name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t('login.usuario')}</span>
              <input data-testid="login-user" className="input" value={user} onChange={(e) => { setUser(e.target.value); setErr(false) }} placeholder={t('login.usuario.ph')} autoComplete="username" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{t('login.pass')}</span>
              <span className="relative block">
                <input data-testid="login-pass" type={show ? 'text' : 'password'} className="input pr-12" value={pass} onChange={(e) => { setPass(e.target.value); setErr(false) }} placeholder={t('login.pass.ph')} autoComplete="current-password" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={t(show ? 'login.ocultar' : 'login.mostrar')} className="tap absolute right-0 top-0 inline-flex items-center justify-center text-ink-2">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </span>
            </label>
            {err && <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">{t('login.error')}</p>}
            {tab === 'in' && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-[18px] w-[18px] accent-[var(--accent)]" />
                  {t('login.recordarme')}
                </label>
                <button type="button" data-testid="forgot-open" onClick={() => setForgot(true)} className="min-h-[44px] text-sm font-semibold text-accent hover:underline">{t('login.olvide')}</button>
              </div>
            )}
            <button type="submit" data-testid="login-submit" className="btn-primary w-full">
              {tab === 'in' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {t(tab === 'in' ? 'login.entrar' : 'login.registrar')}
            </button>
          </form>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 border-t border-line pt-4 text-sm text-ink-2">
            <DemoBadge className="mb-2 w-full justify-center bg-transparent" />
            {t('login.sinAcceso')}
            <a href={MARCA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center font-semibold text-[#16a34a] hover:underline">{t('app.whatsapp')}</a>
          </div>
        </div>
        <p className="mt-6 text-[11px] text-ink-2">{t('app.poweredBy')}</p>
      </section>

      <Modal open={forgot} onClose={() => setForgot(false)} width={420} labelledBy="forgot-title">
        <h2 id="forgot-title" className="pr-10 text-lg font-bold">{t('login.forgot.title')}</h2>
        <p className="mt-2 text-sm text-ink-2">{t('login.forgot.body')}</p>
        <form onSubmit={(e) => { e.preventDefault(); setForgot(false); toast('login.forgot.toast', undefined, 'info') }} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t('login.forgot.email')}</span>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juancarlos@finanzasenclaro.com" />
          </label>
          <button type="submit" className="btn-primary w-full">{t('login.forgot.enviar')}</button>
        </form>
      </Modal>
    </div>
  )
}
