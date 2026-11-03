import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { useStudio, FORM_INICIAL } from '@/store/studio'
import { IDEA_EJEMPLO } from '@/data/mock'
import { LogoMark } from './Logo'
import { WhatsAppButton } from './common'

type Ctx = { lang: 'es' | 'en'; videoId: string | null; setVideoId: (id: string) => void; push: (id: number) => void }
export interface TrailerScene {
  view?: string | ((c: Ctx) => string)
  selector?: string
  click?: boolean
  position?: 'top' | 'bottom'
  chapter: string
  title: string
  body: string
  duration: number
  cta?: boolean
  before?: (c: Ctx) => void
  run?: (c: Ctx) => void
}

const typeIdea = (c: Ctx) => {
  const words = IDEA_EJEMPLO[c.lang].split(' ')
  words.forEach((_, i) => c.push(window.setTimeout(() => useStudio.getState().setForm({ idea: words.slice(0, i + 1).join(' ') }), 400 + i * 150)))
}

const SCENES: TrailerScene[] = [
  { view: '/propuesta', selector: '[data-view="propuesta"] h1', chapter: 'trailer.c1', title: 'trailer.s1.t', body: 'trailer.s1.b', duration: 6000 },
  { view: '/propuesta', selector: '[data-trailer="circuito"]', chapter: 'trailer.c2', title: 'trailer.s2.t', body: 'trailer.s2.b', duration: 7000 },
  { view: '/propuesta', selector: '[data-trailer="modulos"]', position: 'top', chapter: 'trailer.c3', title: 'trailer.s3.t', body: 'trailer.s3.b', duration: 7000 },
  { view: '/crear', selector: '[data-trailer="idea"]', chapter: 'trailer.c4', title: 'trailer.s4.t', body: 'trailer.s4.b', duration: 8500, before: () => useStudio.getState().setForm({ ...FORM_INICIAL }), run: typeIdea },
  {
    view: '/crear', selector: '[data-trailer="params"]', chapter: 'trailer.c5', title: 'trailer.s5.t', body: 'trailer.s5.b', duration: 7000,
    run: (c) => {
      const set = useStudio.getState().setForm
      c.push(window.setTimeout(() => set({ tematica: 'historia_finanzas' }), 900))
      c.push(window.setTimeout(() => set({ duracionMin: 15 }), 2000))
      c.push(window.setTimeout(() => set({ tono: 'documental' }), 3100))
    },
  },
  {
    view: (c) => `/crear/${c.videoId}/guion`, selector: '[data-trailer="script"]', chapter: 'trailer.c6', title: 'trailer.s6.t', body: 'trailer.s6.b', duration: 8000,
    before: (c) => { const s = useStudio.getState(); if (!s.form.idea) s.setForm({ idea: IDEA_EJEMPLO[c.lang], tematica: 'historia_finanzas' }); c.setVideoId(s.crearDesdeForm()) },
  },
  { selector: '[data-trailer="approve"]', click: true, chapter: 'trailer.c7', title: 'trailer.s7.t', body: 'trailer.s7.b', duration: 8500 },
  { selector: '[data-trailer="bell"]', click: true, chapter: 'trailer.c8', title: 'trailer.s8.t', body: 'trailer.s8.b', duration: 6000 },
  {
    view: (c) => `/crear/${c.videoId}/resultado`, selector: '[data-trailer="player"]', click: true, chapter: 'trailer.c9', title: 'trailer.s9.t', body: 'trailer.s9.b', duration: 8500,
    before: () => { if (document.querySelector('[data-testid="notif-panel"]')) (document.querySelector('[data-trailer="bell"]') as HTMLElement | null)?.click() },
  },
  { selector: '[data-trailer="publish"]', position: 'top', chapter: 'trailer.c10', title: 'trailer.s10.t', body: 'trailer.s10.b', duration: 7000 },
  { chapter: 'trailer.c11', title: 'trailer.s11.t', body: 'trailer.s11.b', duration: 7500, cta: true },
]

/** Modo trailer: demo automática en loop, con cursor virtual que hace click() real. */
export function Trailer() {
  const { t, lang } = useT()
  const active = useApp((s) => s.trailer)
  const navigate = useNavigate()
  const navRef = useRef(navigate)
  navRef.current = navigate
  const [i, setI] = useState(0)
  const [cursor, setCursor] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2, down: false })
  const [ring, setRing] = useState<DOMRect | null>(null)
  const timers = useRef<number[]>([])
  const videoId = useRef<string | null>(null)
  const snap = useRef<{ studio: ReturnType<typeof useStudio.getState>; notifs: ReturnType<typeof useApp.getState>['notifs'] } | null>(null)

  const exit = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    if (snap.current) { useStudio.setState(snap.current.studio); useApp.setState({ notifs: snap.current.notifs }); snap.current = null }
    const app = useApp.getState()
    app.setTrailer(false)
    app.trailerSession(false)
    navRef.current('/login')
  }, [])

  useEffect(() => {
    if (!active) return
    snap.current = { studio: { ...useStudio.getState() }, notifs: useApp.getState().notifs }
    setI(0)
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') exit() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [active, exit])

  // Motor: una escena por vez. `navigate` vive en un ref para no reiniciar el motor.
  useEffect(() => {
    if (!active) return
    const sc = SCENES[i]
    const push = (id: number) => { timers.current.push(id) }
    const ctx: Ctx = { lang, videoId: videoId.current, setVideoId: (id) => { videoId.current = id; ctx.videoId = id }, push }
    timers.current.forEach(clearTimeout); timers.current = []
    setRing(null)
    if (i === 0) { useStudio.setState({ ...snap.current!.studio }); window.scrollTo({ top: 0 }) }
    sc.before?.(ctx)
    const view = typeof sc.view === 'function' ? sc.view(ctx) : sc.view
    if (view) navRef.current(view)
    if (sc.selector) {
      push(window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(sc.selector!)
        if (!el) return
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        push(window.setTimeout(() => {
          const r = el.getBoundingClientRect()
          setRing(r)
          setCursor({ x: r.left + Math.min(r.width / 2, 160), y: r.top + Math.min(r.height / 2, 60), down: false })
          if (sc.click) push(window.setTimeout(() => { setCursor((c) => ({ ...c, down: true })); el.click(); push(window.setTimeout(() => setCursor((c) => ({ ...c, down: false })), 180)) }, 1100))
        }, 650))
      }, 550))
    } else {
      setCursor({ x: window.innerWidth / 2, y: window.innerHeight * 0.62, down: false })
    }
    sc.run?.(ctx)
    push(window.setTimeout(() => setI((n) => (n + 1) % SCENES.length), sc.duration))
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [active, i]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null
  const sc = SCENES[i]
  return createPortal(
    <>
      <div className="fixed inset-0 z-[9990]" aria-hidden />
      {ring && !sc.cta && (
        <div className="pointer-events-none fixed z-[9991] rounded-xl transition-all duration-500"
          style={{ left: ring.left - 8, top: ring.top - 8, width: ring.width + 16, height: ring.height + 16, boxShadow: '0 0 0 3px #3b82f6, 0 0 0 9px rgba(59,130,246,.25)' }} />
      )}
      <div className="pointer-events-none fixed z-[9993] transition-[left,top] duration-700 ease-out" style={{ left: cursor.x, top: cursor.y }}>
        <svg width="28" height="28" viewBox="0 0 24 24" style={{ scale: cursor.down ? '0.85' : '1', transition: 'scale .15s' }}>
          <path d="M4 2l16 9-7 2-3 7z" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        {cursor.down && <span className="absolute -left-3 -top-3 h-8 w-8 animate-ping rounded-full bg-blue-400/60" />}
      </div>
      {sc.cta ? (
        <div className="fixed inset-0 z-[9992] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="anim-modal glass w-[min(520px,calc(100vw-32px))] rounded-2xl border border-white/20 p-8 text-center text-ink shadow-2xl">
            <LogoMark size={48} className="mx-auto" />
            <p className="mt-5 text-3xl font-extrabold tracking-tight">{t(sc.title)}</p>
            <p className="mt-2 text-ink-2">{t(sc.body)}</p>
            <div className="relative z-[9995] mt-6"><WhatsAppButton full size="lg" /></div>
            <p className="mt-3 text-[11px] text-ink-2">{t('app.poweredBy')}</p>
          </div>
        </div>
      ) : (
        <div className={`pointer-events-none fixed left-1/2 z-[9994] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 ${sc.position === 'top' ? 'top-20' : 'bottom-8'}`}>
          <div key={i} className="anim-panel glass rounded-2xl border border-white/30 p-5 text-ink shadow-2xl">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">{String(i + 1).padStart(2, '0')} · {t(sc.chapter)}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">{t(sc.title)}</p>
            <p className="mt-1 text-sm text-ink-2">{t(sc.body)}</p>
            <div className="mt-3 flex gap-1">{SCENES.map((_, n) => <span key={n} className={`h-1 flex-1 rounded-full ${n <= i ? 'bg-accent' : 'bg-line'}`} />)}</div>
          </div>
        </div>
      )}
      <button onClick={exit} data-testid="trailer-exit" aria-label={t('trailer.salir')} className="fixed right-4 top-4 z-[9994] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black">
        <X size={20} />
      </button>
    </>,
    document.body,
  )
}
