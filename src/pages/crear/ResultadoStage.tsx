import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Upload, Loader2, CheckCircle2, Tv, X, Plus, Link2, Globe, EyeOff, Lock, Plug, AlertTriangle, RotateCw, Wand2 } from 'lucide-react'
import { useT, tr } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import type { Video, Visibilidad } from '@/data/types'
import { Player } from '@/components/player/Player'
import { DevNotice, StatusBadge } from '@/components/common'
import { cn } from '@/lib/cn'

function useFakeProgress(ms: number, onDone: () => void) {
  const [p, setP] = useState<number | null>(null)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (p === null || p >= 100) return
    const id = setTimeout(() => setP((x) => Math.min(100, (x ?? 0) + 100 / (ms / 80))), 80)
    return () => clearTimeout(id)
  }, [p, ms])
  useEffect(() => { if (p !== null && p >= 100) done.current() }, [p])
  return { p, start: () => setP(0), reset: () => setP(null) }
}

export function ResultadoStage({ video }: { video: Video }) {
  const { t, L } = useT()
  const job = useStudio((s) => s.job)
  const generating = !!job && job.videoId === video.id && !job.finished
  if (generating || video.estado === 'en_proceso' || video.estado === 'guion' || (video.estado === 'error' && video.errorTipo === 'voz')) {
    return (
      <div className="card mt-2 p-8 text-center">
        <Loader2 className={cn('mx-auto text-accent', generating && 'animate-spin')} size={30} />
        <p className="mt-3 font-semibold">{t(video.estado === 'guion' ? 'estado.guion' : 'res.generando')}</p>
        <p className="mt-1 text-sm text-ink-2">{L(video.titulo)}</p>
        <Link to={`/crear/${video.id}/${video.estado === 'guion' ? 'guion' : 'generacion'}`} className="btn-primary mt-5">{t('res.verProgreso')}</Link>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="h-page">{t('res.titulo')}</h1>
          <p className="mt-1 text-[15px] text-ink-2">{t('res.sub')}</p>
        </div>
        <StatusBadge estado={video.estado} className="self-start sm:self-auto" />
      </div>
      <p className="mb-3 text-[17px] font-bold leading-snug">{L(video.titulo)}</p>
      <Player video={video} />
      <DevNotice className="mt-3" f="dev.preview.f" ahora="dev.preview.ahora" luego="dev.preview.luego" />
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DownloadCard />
        <PublishCard video={video} />
      </div>
      <div className="mt-6 flex justify-center">
        <Link to="/crear" className="btn-ghost text-accent"><Wand2 size={17} /> {t('res.nuevo')}</Link>
      </div>
    </div>
  )
}

function DownloadCard() {
  const { t } = useT()
  const toast = useApp((s) => s.toast)
  const [ready, setReady] = useState(false)
  const fp = useFakeProgress(2200, () => { setReady(true); toast('res.descargado') })
  const busy = fp.p !== null && fp.p < 100
  return (
    <section className="card flex flex-col p-5" data-testid="download-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><Download size={19} /></span>
        <div className="min-w-0">
          <h2 className="font-bold">{t('res.descargar')}</h2>
          <p className="text-sm text-ink-2">{t('res.descargar.sub')}</p>
        </div>
      </div>
      {fp.p !== null && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${fp.p}%` }} /></div>
          <p className="mt-1.5 font-mono text-xs text-ink-2">{ready ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Link2 size={12} />{t('res.enlace')}</span> : t('res.descargando', { p: Math.round(fp.p) })}</p>
        </div>
      )}
      <button onClick={() => { setReady(false); fp.start() }} disabled={busy} className="btn-primary mt-4 w-full">
        {busy ? <Loader2 size={17} className="animate-spin" /> : ready ? <CheckCircle2 size={17} /> : <Download size={17} />} {t('res.descargar.btn')}
      </button>
      <DevNotice className="mt-4" f="dev.descarga.f" ahora="dev.descarga.ahora" luego="dev.descarga.luego" />
    </section>
  )
}

const VIS: { v: Visibilidad; icon: typeof Globe }[] = [{ v: 'publico', icon: Globe }, { v: 'no_listado', icon: EyeOff }, { v: 'privado', icon: Lock }]

function PublishCard({ video }: { video: Video }) {
  const { t, L, lang } = useT()
  const nav = useNavigate()
  const canal = useStudio((s) => s.canalConectado)
  const publicar = useStudio((s) => s.publicar)
  const reintentar = useStudio((s) => s.reintentar)
  const toast = useApp((s) => s.toast)
  const addNotif = useApp((s) => s.addNotif)
  const [titulo, setTitulo] = useState(L(video.titulo))
  const [desc, setDesc] = useState(video.descripcion ? L(video.descripcion) : '')
  const [tags, setTags] = useState<string[]>(video.etiquetas ?? [])
  const [tag, setTag] = useState('')
  const [vis, setVis] = useState<Visibilidad>(video.visibilidad ?? 'publico')
  useEffect(() => { setTitulo(L(video.titulo)); setDesc(video.descripcion ? L(video.descripcion) : '') }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const fp = useFakeProgress(3000, () => {
    publicar(video.id, { titulo, descripcion: desc, etiquetas: tags, visibilidad: vis })
    toast('res.publicado', { vis: tr(`vis.${vis}`, lang) })
    addNotif({ titleKey: 'notif.publicado.title', bodyKey: 'notif.publicado.body', vars: { titulo: video.titulo }, to: `/proyectos/${video.id}` })
  })
  const busy = fp.p !== null && fp.p < 100
  const addTag = () => { const x = tag.trim(); if (x && !tags.includes(x)) setTags([...tags, x]); setTag('') }

  return (
    <section className="card p-5" data-trailer="publish" data-testid="publish-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-400/15 dark:text-red-300"><Tv size={19} /></span>
        <div className="min-w-0">
          <h2 className="font-bold">{t('res.publicar')}</h2>
          <p className="text-sm text-ink-2">{t('res.publicar.canal')}</p>
        </div>
      </div>
      {video.errorTipo === 'subida' && video.errorMotivo && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200">
          <AlertTriangle size={17} className="shrink-0" /><span className="min-w-0 flex-1">{L(video.errorMotivo)}</span>
          <button onClick={() => { reintentar(video.id); toast('pro.reintentado.subida', { titulo: video.titulo }, 'info') }} className="btn-secondary min-h-[40px] px-3 text-xs"><RotateCw size={14} /> {t('pro.reintentar')}</button>
        </div>
      )}
      {video.estado === 'publicado' ? (
        <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
          <p className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} /> {t('res.publicado.ok')} · {t(`vis.${video.visibilidad ?? 'publico'}`)}</p>
          <button onClick={() => nav(`/proyectos/${video.id}`)} className="btn-secondary mt-3">{t('res.publicado.ver')}</button>
        </div>
      ) : !canal ? (
        <div className="mt-5 rounded-xl border border-dashed border-line p-4 text-center">
          <p className="text-sm text-ink-2">{t('res.sinCanal')}</p>
          <button onClick={() => nav('/canal')} className="btn-primary mt-3"><Plug size={17} /> {t('res.conectar')}</button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t('res.campo.titulo')}</span>
            <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t('res.campo.desc')}</span>
            <textarea className="input min-h-[88px] py-2" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-medium">{t('res.campo.tags')}</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((x) => (
                <span key={x} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-3 pr-0.5 text-xs font-medium">
                  {x}
                  <button onClick={() => setTags(tags.filter((y) => y !== x))} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-2 hover:text-ink" aria-label={t('res.campo.tags.quitar', { tag: x })}><X size={13} /></button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input className="input" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder={t('res.campo.tags.ph')} />
              <button onClick={addTag} className="btn-secondary shrink-0 px-3" aria-label={t('res.campo.tags.add')}><Plus size={17} /></button>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium">{t('res.campo.vis')}</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t('res.campo.vis')}>
              {VIS.map(({ v, icon: I }) => (
                <button key={v} role="radio" aria-checked={vis === v} onClick={() => setVis(v)} className={cn('flex min-h-[52px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition', vis === v ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2')}>
                  <I size={17} className={cn('shrink-0', vis === v ? 'text-accent' : 'text-ink-2')} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t(`vis.${v}`)}</span>
                    <span className="block text-[11px] text-ink-2">{t(`res.vis.${v}.d`)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          {fp.p !== null && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-red-500 transition-[width]" style={{ width: `${fp.p}%` }} /></div>
              <p className="mt-1.5 font-mono text-xs text-ink-2">{t('res.subiendo', { p: Math.round(fp.p) })}</p>
            </div>
          )}
          <button onClick={fp.start} disabled={busy || !titulo.trim()} data-testid="publish-btn" className="btn-primary w-full">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />} {t('res.publicar')}
          </button>
        </div>
      )}
      <DevNotice className="mt-4" f="dev.subida.f" ahora="dev.subida.ahora" luego="dev.subida.luego" />
    </section>
  )
}
