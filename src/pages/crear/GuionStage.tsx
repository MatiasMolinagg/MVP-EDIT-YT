import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, RefreshCw, Rocket, Volume2, Square, Check, Type, BarChart3, PanelBottom, List, Sparkles } from 'lucide-react'
import { useT, tr } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { VOCES, type Video, type Escena } from '@/data/types'
import { speak, stopSpeech } from '@/lib/speech'
import { DevNotice } from '@/components/common'
import { cn } from '@/lib/cn'
import { ActionBar } from './parts'

const VISUAL_ICON = { titulo: Type, grafico: BarChart3, zocalo: PanelBottom, lista: List }
// Guiones ya "escritos" en esta sesión de pestaña (para no repetir el efecto al volver).
const typed = new Set<string>()

export function GuionStage({ video }: { video: Video }) {
  const { t, L, lang } = useT()
  const nav = useNavigate()
  const regenerar = useStudio((s) => s.regenerar)
  const startJob = useStudio((s) => s.startJob)
  const setVoz = useStudio((s) => s.setVoz)
  const job = useStudio((s) => s.job)
  const toast = useApp((s) => s.toast)
  const sig = video.escenas.map((e) => e.id).join('|')
  const total = video.escenas.reduce((n, e) => n + L(e.narracion).length, 0)
  const [shown, setShown] = useState(() => (typed.has(sig) ? Number.MAX_SAFE_INTEGER : 0))
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    if (typed.has(sig)) { setShown(Number.MAX_SAFE_INTEGER); return }
    setShown(0)
    const i = setInterval(() => {
      setShown((s) => {
        const n = s + 22
        if (n >= total) { clearInterval(i); typed.add(sig); return Number.MAX_SAFE_INTEGER }
        return n
      })
    }, 30)
    return () => clearInterval(i)
  }, [sig, total])
  useEffect(() => () => stopSpeech(), [])

  const writing = shown < total
  let budget = shown
  const muestra = (voz: (typeof VOCES)[number]['id']) => {
    if (playing === voz) { stopSpeech(); setPlaying(null); return }
    const ok = speak(tr('guion.muestra.texto', lang, { voz: tr(`voz.${voz}`, lang) }), lang, voz, () => setPlaying(null))
    if (ok) setPlaying(voz)
    else toast('guion.muestra.sinSoporte', undefined, 'warn')
  }
  const aprobar = () => {
    stopSpeech()
    if (job && !job.finished && job.videoId !== video.id) useStudio.getState().cancelJob()
    startJob(video.id, useApp.getState().trailer ? 7000 : 12000)
    nav(`/crear/${video.id}/generacion`)
  }

  return (
    <div>
      <h1 className="h-display">{t('guion.titulo')}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-2">{t('guion.sub')}</p>

      <div className="card mt-6 overflow-hidden" data-trailer="script">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-surface-2/60 px-4 py-3 sm:px-5">
          <p className="min-w-0 flex-1 text-[17px] font-bold leading-snug">{L(video.titulo)}</p>
          <span className="font-mono text-xs text-ink-2">{t('guion.escenas', { n: video.escenas.length })} · {t('unidad.min', { n: video.duracionMin })}</span>
        </div>
        {writing && (
          <p className="flex items-center gap-2 px-5 pt-4 text-sm font-medium text-accent" role="status">
            <Sparkles size={15} className="animate-pulse" /> {t('guion.escribiendo')}
          </p>
        )}
        <ol className="divide-y divide-line">
          {video.escenas.map((e, i) => {
            const len = L(e.narracion).length
            const vis = Math.max(0, Math.min(len, budget))
            budget -= len
            if (vis === 0 && writing) return null
            return <SceneRow key={e.id} video={video} e={e} n={i + 1} visible={vis} full={vis >= len} />
          })}
        </ol>
      </div>
      <DevNotice className="mt-3" f="dev.guion.f" ahora="dev.guion.ahora" luego="dev.guion.luego" />

      <section className="mt-8">
        <h2 className="kpi-label">{t('guion.voz')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VOCES.map((v) => {
            const on = video.voz === v.id
            return (
              <div key={v.id} className={cn('card flex items-center gap-3 p-3 transition', on && 'border-accent ring-2 ring-accent/20')}>
                <button onClick={() => { setVoz(video.id, v.id); toast('guion.vozElegida', { voz: t(`voz.${v.id}`) }, 'info') }} role="radio" aria-checked={on} className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold', on ? 'bg-accent text-white dark:text-[#0b0b12]' : 'bg-surface-2 text-ink-2')}>
                    {on ? <Check size={17} /> : t(`voz.${v.id}`).charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t(`voz.${v.id}`)}</span>
                    <span className="block truncate text-xs text-ink-2">{t(`voz.${v.id}.d`)}</span>
                  </span>
                </button>
                <button onClick={() => muestra(v.id)} className="btn-secondary shrink-0 px-3 text-xs" aria-label={`${t('guion.muestra')} · ${t(`voz.${v.id}`)}`}>
                  {playing === v.id ? <Square size={14} fill="currentColor" /> : <Volume2 size={15} />}
                  <span className="hidden xs:inline">{t(playing === v.id ? 'guion.muestra.parar' : 'guion.muestra')}</span>
                </button>
              </div>
            )
          })}
        </div>
        <DevNotice className="mt-3" f="dev.voz.f" ahora="dev.voz.ahora" luego="dev.voz.luego" />
      </section>

      <ActionBar>
        <button onClick={() => { regenerar(video.id); toast('guion.regenerado', undefined, 'info') }} disabled={writing} className="btn-secondary"><RefreshCw size={17} /> {t('guion.regenerar')}</button>
        <button onClick={aprobar} disabled={writing} data-testid="approve" data-trailer="approve" className="btn-primary"><Rocket size={17} /> <span className="truncate">{t('guion.aprobar')}</span></button>
      </ActionBar>
    </div>
  )
}

function SceneRow({ video, e, n, visible, full }: { video: Video; e: Escena; n: number; visible: number; full: boolean }) {
  const { t, L, lang } = useT()
  const editar = useStudio((s) => s.editarEscena)
  const toast = useApp((s) => s.toast)
  const [edit, setEdit] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [narr, setNarr] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const Icon = VISUAL_ICON[e.visual]
  const open = () => { if (!full) return; setTitulo(L(e.titulo)); setNarr(L(e.narracion)); setEdit(true); setTimeout(() => ref.current?.focus(), 30) }
  const save = () => {
    editar(video.id, e.id, lang, 'titulo', titulo.trim() || L(e.titulo))
    editar(video.id, e.id, lang, 'narracion', narr.trim() || L(e.narracion))
    setEdit(false); toast('guion.editado')
  }
  const text = L(e.narracion)
  return (
    <li className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs font-bold text-accent">{n}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-2">{t('guion.escena', { n })}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2"><Icon size={12} />{t(`guion.visual.${e.visual}`)}</span>
        </div>
        {edit ? (
          <div className="mt-2 space-y-2">
            <input value={titulo} onChange={(x) => setTitulo(x.target.value)} className="input font-semibold" aria-label={t('guion.editar')} />
            <textarea ref={ref} value={narr} onChange={(x) => setNarr(x.target.value)} rows={3} className="input min-h-[96px] py-2 leading-relaxed" aria-label={t('guion.editar')}
              onKeyDown={(x) => { if (x.key === 'Enter' && (x.metaKey || x.ctrlKey)) save(); if (x.key === 'Escape') setEdit(false) }} />
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary h-10 min-h-[44px] px-3 text-xs"><Check size={15} /> {t('app.confirmar')}</button>
              <button onClick={() => setEdit(false)} className="btn-ghost min-h-[44px] px-3 text-xs">{t('app.cancelar')}</button>
            </div>
          </div>
        ) : (
          <button onClick={open} className="group mt-1 block w-full rounded-lg text-left" aria-label={`${t('guion.editar')} ${n}`} disabled={!full}>
            <span className="block font-semibold">{L(e.titulo)}</span>
            <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">
              {text.slice(0, visible)}
              {!full && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent" />}
            </span>
          </button>
        )}
      </div>
      {!edit && full && (
        <button onClick={open} className="tap -mr-2 -mt-1 inline-flex shrink-0 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink" aria-label={t('guion.editar')}>
          <Pencil size={16} />
        </button>
      )}
    </li>
  )
}
