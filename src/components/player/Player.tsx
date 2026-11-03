import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useT } from '@/i18n'
import type { Video, Escena } from '@/data/types'
import { speak, stopSpeech } from '@/lib/speech'
import { cn } from '@/lib/cn'
import { SceneChart } from './Charts'

export const SCENE_SEC = 6
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Reproductor 16:9 de escenas construido con React + framer-motion + Recharts. Sin imágenes externas. */
export function Player({ video, stickyMobile = true }: { video: Video; stickyMobile?: boolean }) {
  const { t, L, lang } = useT()
  const n = video.escenas.length
  const total = n * SCENE_SEC
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [voice, setVoice] = useState(false)
  const raf = useRef<number | null>(null)
  const last = useRef(0)
  const barRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const loop = (now: number) => {
      const dt = (now - last.current) / 1000
      last.current = now
      setTime((tm) => {
        const nt = tm + dt
        if (nt >= total) { setPlaying(false); return total }
        return nt
      })
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [playing, total])

  const idx = Math.min(n - 1, Math.floor(time / SCENE_SEC))
  const local = Math.min(0.999, (time - idx * SCENE_SEC) / SCENE_SEC)
  const escena = video.escenas[idx]
  const narr = L(escena.narracion)

  // Locución de muestra (apagada por defecto): habla la escena actual.
  useEffect(() => {
    if (playing && voice) speak(narr, lang, video.voz)
    else stopSpeech()
  }, [idx, playing, voice, narr, lang, video.voz])
  useEffect(() => () => stopSpeech(), [])

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && time >= total) setTime(0)
      return !p
    })
  }, [time, total])
  const seekFromX = (clientX: number) => {
    const r = barRef.current?.getBoundingClientRect()
    if (!r) return
    setTime(Math.max(0, Math.min(total - 0.01, ((clientX - r.left) / r.width) * total)))
  }
  const onDown = (e: RPE<HTMLDivElement>) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); seekFromX(e.clientX) }
  const onMove = (e: RPE<HTMLDivElement>) => { if (dragging.current) seekFromX(e.clientX) }
  const onUp = () => { dragging.current = false }

  // Subtítulos sincronizados: la narración se parte en bloques de ~9 palabras.
  const words = narr.split(' ')
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += 9) chunks.push(words.slice(i, i + 9).join(' '))
  const sub = chunks[Math.min(chunks.length - 1, Math.floor(local * chunks.length))]
  const ended = time >= total

  return (
    <div>
      <div className={cn(stickyMobile && 'sticky top-14 z-20 -mx-4 bg-bg px-4 pb-2 pt-2 sm:static sm:mx-0 sm:p-0')}>
        <div
          data-trailer="player"
          data-testid="player"
          onClick={toggle}
          className="relative aspect-video w-full cursor-pointer select-none overflow-hidden rounded-xl bg-[#0c0b1d] text-white shadow-lg [container-type:inline-size]"
          role="region"
          aria-label={L(video.titulo)}
        >
          <SceneVisual key={`${escena.id}-${idx}`} e={escena} n={idx + 1} video={video} />
          <div className="absolute left-[3cqw] top-[3cqw] flex items-center gap-[1cqw] text-[1.9cqw] font-semibold text-white/80">
            <span className="flex h-[3.4cqw] w-[3.4cqw] items-center justify-center rounded-[0.8cqw] bg-white/15"><Play className="h-[55%] w-[55%]" fill="currentColor" /></span>
            {t('res.marca')}
          </div>
          {sub && (
            <div className="absolute inset-x-[6cqw] bottom-[3.5cqw] flex justify-center">
              <motion.p key={sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[0.8cqw] bg-black/65 px-[1.6cqw] py-[0.6cqw] text-center text-[2.5cqw] font-medium leading-snug">{sub}</motion.p>
            </div>
          )}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex h-[13cqw] max-h-20 w-[13cqw] max-w-20 items-center justify-center rounded-full bg-white/95 text-[#4f46e5] shadow-2xl">
                {ended ? <RotateCcw className="h-[45%] w-[45%]" /> : <Play className="ml-[6%] h-[45%] w-[45%]" fill="currentColor" />}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 sm:gap-3">
          <button onClick={toggle} data-testid="player-play" className="tap inline-flex shrink-0 items-center justify-center rounded-lg bg-accent text-white dark:text-[#0b0b12]" aria-label={t(playing ? 'res.pausa' : 'res.play')}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <span className="shrink-0 font-mono text-xs text-ink-2">{fmt(time)} / {fmt(total)}</span>
          <div
            ref={barRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="relative flex h-11 min-w-0 flex-1 cursor-pointer touch-none items-center"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Math.round(total)}
            aria-valuenow={Math.round(time)}
            aria-label={t('res.escenas')}
          >
            <div className="relative h-1.5 w-full rounded-full bg-surface-2">
              {video.escenas.slice(1).map((_, i) => <span key={i} className="absolute top-0 h-1.5 w-[2px] bg-bg" style={{ left: `${((i + 1) / n) * 100}%` }} />)}
              <div className="h-full rounded-full bg-accent" style={{ width: `${(time / total) * 100}%` }} />
              <span className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow" style={{ left: `calc(${(time / total) * 100}% - 7px)` }} />
            </div>
          </div>
          <button onClick={() => setVoice((v) => !v)} aria-pressed={voice} className={cn('tap inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold', voice ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-surface-2')} aria-label={t('res.locucion')} title={t('res.locucion')}>
            {voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>
      <label className="mt-1 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
        <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', voice ? 'bg-accent' : 'bg-line')}>
          <input type="checkbox" className="peer sr-only" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
          <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', voice ? 'left-[22px]' : 'left-0.5')} />
        </span>
        {t('res.locucion')}
      </label>
      <div className="mt-2">
        <p className="kpi-label mb-2">{t('res.escenas')}</p>
        <ol className="scroll-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {video.escenas.map((e, i) => (
            <li key={e.id} className="shrink-0">
              <button onClick={() => setTime(i * SCENE_SEC + 0.01)} aria-current={i === idx ? 'true' : undefined}
                className={cn('flex min-h-[44px] w-[168px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition', i === idx ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2')}>
                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold', i === idx ? 'bg-accent text-white dark:text-[#0b0b12]' : 'bg-surface-2 text-ink-2')}>{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{L(e.titulo)}</span>
                  <span className="block font-mono text-[10.5px] text-ink-2">{fmt(i * SCENE_SEC)}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function SceneVisual({ e, n, video }: { e: Escena; n: number; video: Video }) {
  const { t, L } = useT()
  const bgs = [
    'radial-gradient(circle at 20% 20%, #4f46e5 0%, transparent 55%), radial-gradient(circle at 85% 80%, #7c3aed 0%, transparent 50%), #0c0b1d',
    'radial-gradient(circle at 80% 15%, #0ea5e9 0%, transparent 45%), radial-gradient(circle at 10% 90%, #4f46e5 0%, transparent 55%), #0c0b1d',
    'radial-gradient(circle at 50% 120%, #059669 0%, transparent 55%), radial-gradient(circle at 0% 0%, #4338ca 0%, transparent 50%), #0c0b1d',
  ]
  const bg = bgs[n % bgs.length]
  if (e.visual === 'titulo')
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[8cqw] text-center" style={{ background: bg }}>
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-full bg-white/15 px-[1.8cqw] py-[0.5cqw] text-[1.8cqw] font-bold uppercase tracking-[.2em]">
          {n === 1 ? t(`tem.${video.tematica}`) : t('guion.escena', { n })}
        </motion.span>
        <motion.h3 initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="mt-[2cqw] text-[5.4cqw] font-extrabold leading-[1.08] tracking-tight">
          {L(e.titulo)}
        </motion.h3>
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-[2.4cqw] h-[0.5cqw] w-[14cqw] origin-left rounded-full bg-[#a5b4fc]" />
      </div>
    )
  if (e.visual === 'grafico')
    return (
      <div className="absolute inset-0 flex flex-col px-[5cqw] pb-[11cqw] pt-[8cqw]" style={{ background: bgs[1] }}>
        <div className="flex items-start justify-between gap-[2cqw]">
          <motion.h3 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="text-[3.6cqw] font-extrabold leading-tight">{L(e.titulo)}</motion.h3>
          <span className="shrink-0 rounded-full border border-white/30 px-[1.2cqw] py-[0.3cqw] text-[1.6cqw] font-semibold text-white/80">{t('res.ilustrativo')}</span>
        </div>
        <div className="mt-[2cqw] min-h-0 flex-1" onClick={(ev) => ev.stopPropagation()}>
          <SceneChart kind={e.chart ?? 'presupuesto'} k={e.id} />
        </div>
      </div>
    )
  if (e.visual === 'lista')
    return (
      <div className="absolute inset-0 flex flex-col justify-center px-[8cqw] pb-[8cqw]" style={{ background: bgs[2] }}>
        <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[4.2cqw] font-extrabold leading-tight">{L(e.titulo)}</motion.h3>
        <ul className="mt-[2.4cqw] space-y-[1.4cqw]">
          {(e.bullets ?? []).map((b, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.45 }} className="flex items-center gap-[1.6cqw] text-[2.9cqw] font-semibold">
              <span className="flex h-[3.4cqw] w-[3.4cqw] shrink-0 items-center justify-center rounded-full bg-emerald-400 font-mono text-[1.8cqw] font-bold text-[#0c0b1d]">{i + 1}</span>
              {L(b)}
            </motion.li>
          ))}
        </ul>
      </div>
    )
  // zócalo
  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute rounded-full border border-white/15"
          style={{ width: `${30 + i * 18}cqw`, height: `${30 + i * 18}cqw`, right: `${-8 - i * 6}cqw`, top: `${-10 + i * 4}cqw` }}
          animate={{ rotate: 360 }} transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }} />
      ))}
      <div className="absolute left-[5cqw] top-[24%] max-w-[60%]">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[7cqw] font-extrabold leading-none text-white/10">{String(n).padStart(2, '0')}</motion.p>
      </div>
      <motion.div initial={{ opacity: 0, x: '-8cqw' }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute bottom-[17cqw] left-[5cqw] flex max-w-[80%] items-stretch overflow-hidden rounded-[0.8cqw] shadow-2xl">
        <span className="w-[1cqw] bg-[#818cf8]" />
        <div className="bg-white px-[2.4cqw] py-[1.4cqw] text-[#0c0b1d]">
          <p className="text-[3.2cqw] font-extrabold leading-tight">{L(e.titulo)}</p>
          <p className="text-[1.8cqw] font-semibold text-[#4f46e5]">{t('res.marca')}</p>
        </div>
      </motion.div>
    </div>
  )
}
