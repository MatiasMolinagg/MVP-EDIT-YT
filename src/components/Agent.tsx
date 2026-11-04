import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X, Send } from 'lucide-react'
import { useT, tr, txt, type Lang } from '@/i18n'
import { useApp } from '@/store/app'
import { useStudio } from '@/store/studio'
import { estadoJob } from '@/data/pipeline'
import { cn } from '@/lib/cn'

interface Msg { id: number; from: 'bot' | 'me'; text: string; typing?: boolean }

/** Respuestas pre-programadas por palabras clave, con datos reales del mock. */
export function responder(q: string, lang: Lang): string {
  const s = q.toLowerCase()
  const st = useStudio.getState()
  const has = (re: RegExp) => re.test(s)
  if (has(/ganar|ganancia|ingres|monetiz|vistas|suscript|earn|income|money|views|subscriber/)) return tr('agent.r.ganar', lang)
  if (has(/precio|monto|cu[aá]nto (cuesta|sale|vale)|costo|inversi[oó]n|price|cost|how much|investment/)) return tr('agent.r.precio', lang)
  if (has(/inflaci|fall[oó]|error|inflation|fail/)) {
    const v = st.videos.find((x) => x.id === 'v-006')
    return tr(v?.estado === 'error' ? 'agent.r.inflacion' : 'agent.r.inflacion.ok', lang)
  }
  if (has(/tem[aá]tica|pr[oó]ximo video|tema|topic|next video/)) {
    const b = st.drafts.find((d) => d.tematica === 'historia_finanzas') ?? st.drafts[0]
    return tr('agent.r.tematica', lang, { borrador: b ? txt(b.idea, lang) : '—' })
  }
  if (has(/pendiente|pending|publicar|publish/)) {
    const listos = st.videos.filter((v) => v.estado === 'listo')
    const job = st.job && !st.job.finished ? st.job : null
    const enProc = job ? st.videos.find((v) => v.id === job.videoId) : st.videos.find((v) => v.estado === 'en_proceso')
    if (!listos.length && !enProc) return tr('agent.r.pendiente.nada', lang)
    const p = job ? Math.round(estadoJob(job).f * 100) : enProc?.progreso ?? 0
    return tr('agent.r.pendiente', lang, {
      n: listos.length,
      lista: listos.map((v) => `“${txt(v.titulo, lang)}”`).join(', '),
      proceso: enProc ? tr('agent.r.pendiente.proceso', lang, { titulo: enProc.titulo, p }) : '',
    }).trim()
  }
  if (has(/canal|youtube|conect|channel|connect/)) return tr(st.canalConectado ? 'agent.r.canal.ok' : 'agent.r.canal.no', lang)
  if (has(/dict|micr[oó]fono|hablar|voz|mic|speak|voice/)) return tr('agent.r.dictado', lang)
  if (has(/descarg|mp4|download/)) return tr('agent.r.descarga', lang)
  if (has(/borrador|draft/)) return tr('agent.r.borradores', lang, { n: st.drafts.length, borrador: st.drafts[0] ? txt(st.drafts[0].idea, lang) : '—' })
  return tr('agent.r.nose', lang)
}

export function Agent() {
  const { t, lang } = useT()
  const open = useApp((s) => s.agentOpen)
  const setOpen = useApp((s) => s.setAgentOpen)
  const trailer = useApp((s) => s.trailer)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [thinking, setThinking] = useState(false)
  const [input, setInput] = useState('')
  const seq = useRef(1)
  const timers = useRef<number[]>([])
  const bodyRef = useRef<HTMLDivElement>(null)

  // Mensaje inicial en el idioma activo (se rehace si cambia el idioma y no hay charla).
  useEffect(() => {
    setMsgs((m) => (m.length <= 1 ? [{ id: 0, from: 'bot', text: tr('agent.hola', lang) }] : m))
  }, [lang])
  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }) }, [msgs, thinking])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, setOpen])

  const ask = useCallback((q: string) => {
    if (!q.trim() || thinking) return
    const lng = useApp.getState().lang
    setMsgs((m) => [...m, { id: seq.current++, from: 'me', text: q.trim() }])
    setInput('')
    setThinking(true)
    timers.current.push(window.setTimeout(() => {
      setThinking(false)
      const full = responder(q, lng)
      const id = seq.current++
      setMsgs((m) => [...m, { id, from: 'bot', text: '', typing: true }])
      let n = 0
      const step = () => {
        n = Math.min(full.length, n + 3)
        setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: full.slice(0, n), typing: n < full.length } : x)))
        if (n < full.length) timers.current.push(window.setTimeout(step, 16))
      }
      step()
    }, 900))
  }, [thinking])

  if (trailer) return null
  const bottom = 'calc(var(--agent-bottom))'
  return createPortal(
    <>
      <style>{`:root{--agent-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--action-bar-h, 0px) + 12px)}@media (min-width:1024px){:root{--agent-bottom: 24px}}`}</style>
      <button
        data-testid="agent-fab"
        onClick={() => setOpen(!open)}
        aria-label={t(open ? 'agent.cerrar' : 'agent.abrir')}
        aria-expanded={open}
        className="no-print fixed right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-accent on-accent shadow-[0_8px_28px_-4px_var(--accent)] transition hover:bg-accent-hover"
        style={{ bottom }}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && <span className="absolute right-0.5 top-0.5 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" /></span>}
      </button>
      {open && (
        <section
          data-testid="agent-panel"
          role="dialog"
          aria-label={t('agent.nombre')}
          className="anim-panel fixed right-4 z-[46] flex h-[min(540px,64vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          style={{ bottom: 'calc(var(--agent-bottom) + 68px)', maxHeight: 'calc(100dvh - var(--agent-bottom) - 68px - 64px)' }}
        >
          <header className="flex items-center gap-3 border-b border-line bg-accent px-4 py-3 on-accent">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"><Sparkles size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{t('agent.nombre')}</p>
              <p className="flex items-center gap-1.5 text-xs opacity-90"><span className="h-2 w-2 rounded-full bg-emerald-300" />{t('agent.online')}</p>
            </div>
            <button onClick={() => setOpen(false)} className="tap -mr-2 inline-flex items-center justify-center rounded-lg hover:bg-white/15" aria-label={t('agent.cerrar')}><X size={18} /></button>
          </header>
          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
            {msgs.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                <p className={cn('max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', m.from === 'me' ? 'rounded-br-md bg-accent on-accent' : 'rounded-bl-md bg-surface-2')}>
                  {m.text}{m.typing && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle" />}
                </p>
              </div>
            ))}
            {thinking && (
              <div className="flex" aria-label={t('agent.pensando')} role="status">
                <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3.5">
                  {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-2" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </span>
              </div>
            )}
            {msgs.length <= 1 && !thinking && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} data-testid="agent-chip" onClick={() => ask(t(`agent.chip${n}`))} className="min-h-[44px] rounded-xl border border-accent/30 bg-accent-soft/60 px-3 py-2 text-left text-[13px] font-medium text-accent hover:bg-accent-soft">
                    {t(`agent.chip${n}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); ask(input) }} className="flex gap-2 border-t border-line p-3">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('agent.ph')} aria-label={t('agent.ph')} />
            <button type="submit" className="btn-primary shrink-0 px-3" aria-label={t('agent.enviar')} disabled={!input.trim() || thinking}><Send size={17} /></button>
          </form>
          <p className="border-t border-line bg-surface-2 px-3 py-1.5 text-center text-[10.5px] text-ink-2">{t('agent.footer')}</p>
        </section>
      )}
    </>,
    document.body,
  )
}
