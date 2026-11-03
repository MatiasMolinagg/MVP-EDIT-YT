import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Loader2, RotateCw, Clock, PartyPopper, PlayCircle, Film, Info } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio } from '@/store/studio'
import { estadoJob, type PasoInfo } from '@/data/pipeline'
import type { Video } from '@/data/types'
import { DevNotice } from '@/components/common'
import { cn } from '@/lib/cn'

export function GeneracionStage({ video }: { video: Video }) {
  const { t, L } = useT()
  const nav = useNavigate()
  const job = useStudio((s) => s.job)
  const startJob = useStudio((s) => s.startJob)
  const mine = !!job && job.videoId === video.id
  const running = mine && !job!.finished
  const [, tick] = useState(0)
  useEffect(() => {
    if (!running) return
    const i = setInterval(() => tick((n) => n + 1), 120)
    return () => clearInterval(i)
  }, [running])

  const st = mine ? estadoJob(job!) : null
  const done = (mine && (job!.finished || st!.done)) || (!running && (video.estado === 'listo' || video.estado === 'publicado'))
  const otro = job && !job.finished && job.videoId !== video.id ? useStudio.getState().videos.find((v) => v.id === job.videoId) : undefined

  return (
    <div>
      <h1 className="h-display">{done ? t('gen.listo') : t('gen.titulo')}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-2">{done ? L(video.titulo) : t('gen.sub')}</p>

      {done ? (
        <div className="card mt-6 flex flex-col items-center p-8 text-center" data-testid="gen-done">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"><PartyPopper size={30} /></span>
          <p className="mt-4 text-lg font-bold">{L(video.titulo)}</p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button onClick={() => nav(`/crear/${video.id}/resultado`)} data-trailer="ver-video" className="btn-primary"><PlayCircle size={18} /> {t('gen.verResultado')}</button>
            <Link to="/proyectos" className="btn-secondary"><Film size={17} /> {t('gen.irVideos')}</Link>
          </div>
        </div>
      ) : running && st ? (
        <>
          <div className="card mt-6 p-5 sm:p-6" data-trailer="pipeline" data-testid="pipeline">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kpi-label">{t('gen.general')}</p>
                <p className="mt-1 font-mono text-[clamp(40px,7vw,56px)] font-bold leading-none tracking-tight">{Math.round(st.f * 100)}%</p>
              </div>
              <p className="flex items-center gap-1.5 font-mono text-xs text-ink-2"><Clock size={13} />{t('gen.restante', { n: Math.ceil(st.restanteMs / 1000) })}</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${st.f * 100}%` }} />
            </div>
            <ol className="mt-6 space-y-2">
              {st.pasos.map((p) => <PasoRow key={p.id} p={p} />)}
            </ol>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[13px] text-ink-2"><Info size={15} className="mt-0.5 shrink-0" />{t('gen.nota')}</p>
          <DevNotice className="mt-3" f="dev.pipeline.f" ahora="dev.pipeline.ahora" luego="dev.pipeline.luego" />
        </>
      ) : (
        <div className="card mt-6 p-8 text-center">
          <p className="font-semibold">{t('gen.sinJob')}</p>
          {otro && <p className="mt-2 text-sm text-ink-2">{t('gen.enCurso.otro', { titulo: otro.titulo })}</p>}
          <button onClick={() => startJob(video.id)} className="btn-primary mt-5"><RotateCw size={17} /> {t('gen.iniciar')}</button>
        </div>
      )}
    </div>
  )
}

function PasoRow({ p }: { p: PasoInfo }) {
  const { t } = useT()
  return (
    <li className={cn('rounded-xl border p-3 transition-colors sm:p-4', p.estado === 'retry' ? 'border-amber-300 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10' : p.estado === 'running' ? 'border-accent/40 bg-accent-soft/50' : 'border-line')}>
      <div className="flex items-center gap-3">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          p.estado === 'done' ? 'bg-emerald-500 text-white' : p.estado === 'running' ? 'bg-accent text-white dark:text-[#0b0b12]' : p.estado === 'retry' ? 'bg-amber-500 text-white' : 'bg-surface-2 text-ink-2')}>
          {p.estado === 'done' ? <Check size={16} /> : p.estado === 'running' ? <Loader2 size={16} className="animate-spin" /> : p.estado === 'retry' ? <RotateCw size={15} className="animate-spin" /> : <Clock size={15} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold sm:text-[15px]">{t(`gen.paso.${p.id}`)}</span>
        <span className={cn('shrink-0 text-xs font-semibold', p.estado === 'retry' ? 'text-amber-700 dark:text-amber-300' : p.estado === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-2')}>
          {t(`gen.est.${p.estado}`)}{p.estado === 'running' && <span className="ml-1.5 font-mono">{Math.round(p.progreso * 100)}%</span>}
        </span>
      </div>
      {(p.estado === 'running' || p.estado === 'retry') && (
        <div className="ml-11 mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className={cn('h-full rounded-full transition-[width] duration-150', p.estado === 'retry' ? 'bg-amber-500' : 'bg-accent')} style={{ width: `${p.progreso * 100}%` }} />
        </div>
      )}
      {p.estado === 'retry' && <p className="ml-11 mt-2 text-xs text-amber-800 dark:text-amber-200">{t('gen.retry.msg')}</p>}
    </li>
  )
}
