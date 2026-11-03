import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useT, tr, type Lang, type Vars } from '@/i18n'
import { useApp } from '@/store/app'
import { useStudio } from '@/store/studio'
import { SHEET_ITEMS } from './nav'
import { Modal } from './ui/Modal'
import { WhatsAppButton } from './common'

interface Step { target?: string; route?: string; title: string; body: string }
const FLAG = 'creavo_tour_completed_creador'
const PAD = 6

export function getTourSteps(lang: Lang, mobile: boolean, vars: Vars): Step[] {
  const s = (k: string, m = false) => tr(mobile && m ? `${k}.m` : k, lang, vars)
  const item = (id: string) => (mobile ? (SHEET_ITEMS.includes(id) ? 'mobile-menu' : `tab-${id}`) : `nav-${id}`)
  return [
    { title: s('tour.bienvenida.t'), body: s('tour.bienvenida.b') },
    { target: mobile ? 'bottom-nav' : 'sidebar-nav', title: s('tour.nav.t'), body: s('tour.nav.b', true) },
    { target: item('propuesta'), title: s('tour.propuesta.t'), body: s('tour.propuesta.b') },
    { target: item('crear'), title: s('tour.crear.t'), body: s('tour.crear.b') },
    { target: item('proyectos'), title: s('tour.proyectos.t'), body: s('tour.proyectos.b') },
    { target: item('borradores'), title: s('tour.borradores.t'), body: s('tour.borradores.b', true) },
    { target: item('canal'), title: s('tour.canal.t'), body: s('tour.canal.b') },
    { target: item('proveedores'), title: s('tour.proveedores.t'), body: s('tour.proveedores.b', true) },
    { target: 'mic', route: '/crear', title: s('tour.mic.t'), body: s('tour.mic.b') },
    { target: mobile ? 'mobile-menu' : 'whatsapp-cta', title: s('tour.cta.t'), body: s('tour.cta.b', true) },
  ]
}

function useIsMobile() {
  const q = '(max-width: 1023px)'
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const h = () => setM(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return m
}

function holePath(w: number, h: number, r: DOMRect) {
  const x = r.left - PAD, y = r.top - PAD, rw = r.width + PAD * 2, rh = r.height + PAD * 2
  const k = Math.min(12, rw / 2, rh / 2)
  return `path(evenodd, "M0 0H${w}V${h}H0Z M${x + k} ${y}H${x + rw - k}A${k} ${k} 0 0 1 ${x + rw} ${y + k}V${y + rh - k}A${k} ${k} 0 0 1 ${x + rw - k} ${y + rh}H${x + k}A${k} ${k} 0 0 1 ${x} ${y + rh - k}V${y + k}A${k} ${k} 0 0 1 ${x + k} ${y}Z")`
}

export function Tour() {
  const { t, lang } = useT()
  const run = useApp((s) => s.tourRun)
  const open = useApp((s) => s.tourOpen)
  const setOpen = useApp((s) => s.setTourOpen)
  const trailer = useApp((s) => s.trailer)
  const videos = useStudio((s) => s.videos)
  const drafts = useStudio((s) => s.drafts)
  const mobile = useIsMobile()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [fin, setFin] = useState(false)
  const [tipH, setTipH] = useState(220)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const timers = useRef<number[]>([])
  const tipRef = useRef<HTMLDivElement>(null)

  const vars = useMemo<Vars>(() => ({
    total: videos.length,
    pub: videos.filter((v) => v.estado === 'publicado').length,
    proc: videos.filter((v) => v.estado === 'en_proceso').length,
    err: videos.filter((v) => v.errorTipo).length,
    n: drafts.length,
  }), [videos, drafts])
  const steps = useMemo(() => getTourSteps(lang, mobile, vars), [lang, mobile, vars])
  const step = steps[i]

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const teardown = useCallback(() => { clearTimers(); setRect(null); setOpen(false) }, [setOpen])

  // Arranque manual: solo cuando cambia tourRun (botón ✨ Tour).
  useEffect(() => { if (run > 0) { setI(0); setFin(false) } }, [run])
  // Cambio de idioma con el tour abierto: reinicia en el paso 1.
  const prevLang = useRef(lang)
  useEffect(() => { if (prevLang.current !== lang) { prevLang.current = lang; if (useApp.getState().tourOpen) setI(0) } }, [lang])
  useEffect(() => { if (trailer && open) teardown() }, [trailer, open, teardown])

  // Medición del target: navegar si hace falta → esperar ~260 ms → scrollIntoView(center) → medir; reintento ~220 ms.
  useEffect(() => {
    if (!open || !step) return
    clearTimers()
    setRect(null)
    if (!step.target) return
    if (step.route && pathname !== step.route) nav(step.route)
    const measure = (tries: number) => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (el && el.getClientRects().length) {
        el.scrollIntoView({ block: 'center' })
        setRect(el.getBoundingClientRect())
      } else if (tries > 0) timers.current.push(window.setTimeout(() => measure(tries - 1), 220))
    }
    timers.current.push(window.setTimeout(() => measure(3), 260))
    return clearTimers
  }, [open, i, step, nav]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-medir en resize y scroll, sin volver a hacer scrollIntoView.
  useEffect(() => {
    if (!open) return
    const re = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight })
      const tg = steps[i]?.target
      const el = tg ? document.querySelector<HTMLElement>(`[data-tour="${tg}"]`) : null
      if (el) setRect(el.getBoundingClientRect())
    }
    window.addEventListener('resize', re)
    window.addEventListener('scroll', re, true)
    return () => { window.removeEventListener('resize', re); window.removeEventListener('scroll', re, true) }
  }, [open, i, steps])

  useLayoutEffect(() => { if (tipRef.current) setTipH(tipRef.current.offsetHeight) }, [i, rect, lang, open])

  const terminar = useCallback(() => {
    teardown()
    let done = false
    try { done = localStorage.getItem(FLAG) === '1'; localStorage.setItem(FLAG, '1') } catch { /* sin storage */ }
    if (!done) setFin(true)
  }, [teardown])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') teardown() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, teardown])

  const finModal = (
    <Modal open={fin} onClose={() => setFin(false)} width={440} labelledBy="tour-fin" z={9002}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"><Compass size={22} /></span>
      <h2 id="tour-fin" className="mt-4 text-xl font-extrabold">{t('tour.fin.t')}</h2>
      <p className="mt-2 text-sm text-ink-2">{t('tour.fin.b')}</p>
      <div className="mt-6 flex flex-col gap-2">
        <button onClick={() => setFin(false)} className="btn-secondary w-full">{t('tour.fin.explorar')}</button>
        <WhatsAppButton full />
      </div>
    </Modal>
  )
  if (!open || !step) return finModal

  const w = Math.min(360, vp.w - 24)
  let style: React.CSSProperties
  if (!step.target || !rect) {
    style = { left: '50%', top: '50%', translate: '-50% -50%', width: w, position: 'fixed' }
  } else {
    const clampX = (x: number) => Math.max(12, Math.min(vp.w - w - 12, x))
    const clampY = (y: number) => Math.max(12, Math.min(vp.h - tipH - 12, y))
    if (!mobile && rect.right + 20 + w <= vp.w - 12 && rect.width < 320) {
      style = { position: 'fixed', left: rect.right + 20, top: clampY(rect.top + rect.height / 2 - tipH / 2), width: w }
    } else if (rect.bottom + 14 + tipH <= vp.h - 12) {
      style = { position: 'fixed', left: clampX(rect.left + rect.width / 2 - w / 2), top: rect.bottom + 14, width: w }
    } else {
      style = { position: 'fixed', left: clampX(rect.left + rect.width / 2 - w / 2), top: Math.max(12, rect.top - 14 - tipH), width: w }
    }
  }
  const last = i === steps.length - 1
  const waiting = !!step.target && !rect

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9000]" style={{ background: 'rgba(10,10,10,.55)', clipPath: rect ? holePath(vp.w, vp.h, rect) : undefined }} onClick={(e) => e.stopPropagation()} data-testid="tour-overlay" />
      {rect && (
        <div className="pointer-events-none fixed z-[9001] rounded-xl border-2 border-accent" style={{ left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: '0 0 0 4px var(--accent-soft), 0 0 16px var(--accent)' }}>
          <span className="absolute -right-1.5 -top-1.5 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500" /></span>
        </div>
      )}
      <div
        ref={tipRef}
        {...(!step.target ? { 'data-modal': '' } : {})}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="anim-fade z-[9002] rounded-2xl border border-line bg-surface p-5 text-ink shadow-2xl"
        style={{ ...style, visibility: waiting ? 'hidden' : 'visible' }}
        data-testid="tour-tooltip"
      >
        <p className="font-mono text-[11px] font-bold tracking-wider text-accent">{t('tour.paso', { x: i + 1, y: steps.length })}</p>
        <h2 id="tour-title" className="mt-1.5 text-[17px] font-bold leading-snug">{step.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button onClick={terminar} data-testid="tour-skip" className="min-h-[44px] px-1 text-sm font-semibold text-ink-2 hover:text-ink">{t('tour.saltar')}</button>
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI(i - 1)} className="btn-secondary px-3">{t('tour.atras')}</button>}
            <button onClick={() => (last ? terminar() : setI(i + 1))} data-testid={last ? 'tour-finish' : 'tour-next'} className="btn-primary px-4">{t(last ? 'tour.terminar' : 'tour.siguiente')}</button>
          </div>
        </div>
      </div>
      {finModal}
    </>,
    document.body,
  )
}
