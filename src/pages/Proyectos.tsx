import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, RotateCw, ChevronRight, X, Download, Upload, Loader2, Check, Circle, Film, PanelRightOpen, SearchX } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { estadoJob } from '@/data/pipeline'
import { formatFecha, fechaRelativa } from '@/data/fechas'
import type { Estado, Video } from '@/data/types'
import { PageHeader, PreviewBanner, StatusBadge, ErrorBadge, KPI } from '@/components/common'
import { Player } from '@/components/player/Player'
import { cn } from '@/lib/cn'

const FILTROS: ('todos' | Estado)[] = ['todos', 'en_proceso', 'listo', 'publicado', 'error', 'guion']

function useProgreso(v: Video): number | undefined {
  const job = useStudio((s) => s.job)
  const [, tick] = useState(0)
  const live = !!job && job.videoId === v.id && !job.finished
  useEffect(() => {
    if (!live) return
    const i = setInterval(() => tick((n) => n + 1), 300)
    return () => clearInterval(i)
  }, [live])
  if (live) return Math.round(estadoJob(job!).f * 100)
  return v.estado === 'en_proceso' ? v.progreso : undefined
}

export function useReintentar() {
  const reintentar = useStudio((s) => s.reintentar)
  const toast = useApp((s) => s.toast)
  return (v: Video) => {
    const tipo = reintentar(v.id)
    if (tipo === 'voz') toast('pro.reintentado.voz', { titulo: v.titulo }, 'info')
    else if (tipo === 'subida') toast('pro.reintentado.subida', { titulo: v.titulo }, 'info')
  }
}

export default function Proyectos({ detailId }: { detailId?: string }) {
  const { t } = useT()
  const nav = useNavigate()
  const videos = useStudio((s) => s.videos)
  const [q, setQ] = useState('')
  const [f, setF] = useState<'todos' | Estado>('todos')
  const retry = useReintentar()

  const lista = useMemo(() => {
    const s = q.trim().toLowerCase()
    return videos.filter((v) => (f === 'todos' || v.estado === f) && (!s || `${v.titulo.es} ${v.titulo.en} ${t(`tem.${v.tematica}`)}`.toLowerCase().includes(s)))
  }, [videos, q, f, t])
  const kpi = {
    gen: videos.filter((v) => ['listo', 'publicado'].includes(v.estado)).length,
    pub: videos.filter((v) => v.estado === 'publicado').length,
    proc: videos.filter((v) => v.estado === 'en_proceso').length,
    min: videos.filter((v) => ['listo', 'publicado'].includes(v.estado)).reduce((n, v) => n + v.duracionMin, 0),
  }
  const open = (v: Video) => nav(`/proyectos/${v.id}`)

  return (
    <div data-view={detailId ? 'proyecto-detalle' : 'proyectos'} className="pb-app">
      <PreviewBanner id="proyectos" />
      <PageHeader title={t('pro.titulo')} sub={t('pro.sub')} actions={<Link to="/crear" className="btn-primary"><Plus size={17} /> {t('pro.nuevo')}</Link>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI label={t('pro.kpi.generados')} value={kpi.gen} />
        <KPI label={t('pro.kpi.publicados')} value={kpi.pub} />
        <KPI label={t('pro.kpi.proceso')} value={kpi.proc} />
        <KPI label={t('pro.kpi.minutos')} value={kpi.min} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('pro.buscar')} aria-label={t('pro.buscar')} />
        </label>
        <select className="input sm:w-56" value={f} onChange={(e) => setF(e.target.value as typeof f)} aria-label={t('pro.filtro')}>
          {FILTROS.map((x) => <option key={x} value={x}>{x === 'todos' ? t('pro.filtro.todos') : t(`estado.${x}`)}</option>)}
        </select>
      </div>

      {lista.length === 0 ? (
        <div className="card mt-4 p-10 text-center">
          <SearchX className="mx-auto text-ink-2" />
          <p className="mt-2 text-sm text-ink-2">{t('pro.vacio')}</p>
          <button onClick={() => { setQ(''); setF('todos') }} className="btn-secondary mt-4">{t('pro.limpiar')}</button>
        </div>
      ) : (
        <>
          {/* ≥640: tabla */}
          <div className="card mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-ink-2">
                  <th className="px-4 py-3 font-semibold">{t('pro.col.titulo')}</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">{t('pro.col.tematica')}</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">{t('pro.col.duracion')}</th>
                  <th className="px-4 py-3 font-semibold">{t('pro.col.estado')}</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">{t('pro.col.fecha')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('pro.col.acciones')}</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((v) => <Row key={v.id} v={v} onOpen={open} onRetry={retry} active={v.id === detailId} />)}
              </tbody>
            </table>
          </div>
          {/* <640: tarjetas */}
          <ul className="mt-4 space-y-3 sm:hidden">
            {lista.map((v) => <CardItem key={v.id} v={v} onOpen={open} onRetry={retry} />)}
          </ul>
        </>
      )}
      {detailId && <DetailPanel id={detailId} onClose={() => nav('/proyectos')} />}
    </div>
  )
}

function Badges({ v }: { v: Video }) {
  const { t } = useT()
  return (
    <span className="flex flex-wrap gap-1.5">
      <StatusBadge estado={v.estado} />
      {v.errorTipo === 'subida' && <ErrorBadge label={t('estado.errorSubida')} />}
    </span>
  )
}

function ProgressMini({ v }: { v: Video }) {
  const { t } = useT()
  const p = useProgreso(v)
  if (p === undefined) return null
  return (
    <span className="mt-1.5 flex items-center gap-2">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-accent" style={{ width: `${p}%` }} /></span>
      <span className="font-mono text-[11px] text-ink-2">{t('pro.progreso', { p })}</span>
    </span>
  )
}

function Row({ v, onOpen, onRetry, active }: { v: Video; onOpen: (v: Video) => void; onRetry: (v: Video) => void; active: boolean }) {
  const { t, L, lang } = useT()
  return (
    <tr onClick={() => onOpen(v)} className={cn('cursor-pointer border-b border-line last:border-0 hover:bg-surface-2/60', active && 'bg-accent-soft/50')}>
      <td className="max-w-[360px] px-4 py-3">
        <p className="font-semibold leading-snug">{L(v.titulo)}</p>
        {v.errorMotivo && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{L(v.errorMotivo)}</p>}
        <ProgressMini v={v} />
      </td>
      <td className="hidden px-4 py-3 text-ink-2 md:table-cell">{t(`tem.${v.tematica}`)}</td>
      <td className="hidden whitespace-nowrap px-4 py-3 font-mono text-xs md:table-cell">{t('unidad.min', { n: v.duracionMin })}</td>
      <td className="px-4 py-3"><Badges v={v} /></td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-ink-2 lg:table-cell">{formatFecha(v.fechaISO, lang)}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          {v.errorTipo && <button onClick={(e) => { e.stopPropagation(); onRetry(v) }} className="btn-secondary min-h-[40px] px-3 text-xs" data-testid="retry-btn"><RotateCw size={14} /> {t('pro.reintentar')}</button>}
          <button onClick={(e) => { e.stopPropagation(); onOpen(v) }} className="tap inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface hover:text-ink" aria-label={t('pro.det.ver')}><ChevronRight size={18} /></button>
        </div>
      </td>
    </tr>
  )
}

function CardItem({ v, onOpen, onRetry }: { v: Video; onOpen: (v: Video) => void; onRetry: (v: Video) => void }) {
  const { t, L, lang } = useT()
  return (
    <li className="card p-4" onClick={() => onOpen(v)}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-semibold leading-snug">{L(v.titulo)}</p>
        <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-2" />
      </div>
      <p className="mt-1 text-xs text-ink-2">{t(`tem.${v.tematica}`)} · <span className="font-mono">{t('unidad.min', { n: v.duracionMin })}</span> · {fechaRelativa(v.fechaISO, lang)}</p>
      <div className="mt-2.5"><Badges v={v} /></div>
      <ProgressMini v={v} />
      {v.errorMotivo && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{L(v.errorMotivo)}</p>}
      {v.errorTipo && (
        <button onClick={(e) => { e.stopPropagation(); onRetry(v) }} className="btn-secondary mt-3 w-full"><RotateCw size={15} /> {t('pro.reintentar')}</button>
      )}
    </li>
  )
}

function DetailPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { t, L, lang } = useT()
  const nav = useNavigate()
  const v = useStudio((s) => s.videos.find((x) => x.id === id))
  const toast = useApp((s) => s.toast)
  const retry = useReintentar()
  const p = useProgresoSafe(v)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[data-modal]')) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  const pasos: { k: string; done: boolean }[] = v
    ? [
        { k: 'pro.det.linea.creado', done: true },
        { k: 'pro.det.linea.guion', done: v.estado !== 'guion' },
        { k: 'pro.det.linea.generado', done: ['listo', 'publicado'].includes(v.estado) },
        { k: 'pro.det.linea.publicado', done: v.estado === 'publicado' },
      ]
    : []
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={v ? L(v.titulo) : t('pro.det.noEncontrado')} data-testid="detail-panel"
        className="anim-panel absolute bottom-0 right-0 top-0 flex w-[min(92vw,460px)] flex-col border-l border-line bg-surface shadow-2xl lg:w-[500px]">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
          <Link to="/proyectos" className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink"><Film size={16} /> {t('pro.det.volver')}</Link>
          <button onClick={onClose} className="tap inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2" aria-label={t('pro.det.cerrar')}><X size={19} /></button>
        </div>
        {!v ? (
          <p className="p-6 text-sm text-ink-2">{t('pro.det.noEncontrado')}</p>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 sm:px-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>
            <h2 className="text-xl font-extrabold leading-tight">{L(v.titulo)}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2"><Badges v={v} />{v.visibilidad && <span className="text-xs text-ink-2">· {t(`vis.${v.visibilidad}`)}</span>}</div>
            {v.errorMotivo && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200">
                <span className="min-w-0 flex-1">{L(v.errorMotivo)}</span>
                <button onClick={() => retry(v)} className="btn-secondary min-h-[40px] px-3 text-xs"><RotateCw size={14} /> {t('pro.reintentar')}</button>
              </div>
            )}
            {p !== undefined && <p className="mt-3 flex items-center gap-2 text-sm text-accent"><Loader2 size={15} className="animate-spin" />{t('pro.det.enProceso', { p })}</p>}

            {['listo', 'publicado'].includes(v.estado) && <div className="mt-4"><Player video={v} stickyMobile={false} /></div>}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {v.estado === 'listo' && <button onClick={() => nav(`/crear/${v.id}/resultado`)} className="btn-primary"><Upload size={16} /> {t('pro.det.publicar')}</button>}
              {['listo', 'publicado'].includes(v.estado) && <button onClick={() => toast('res.descargado')} className="btn-secondary"><Download size={16} /> {t('pro.det.descargar')}</button>}
              {v.estado === 'en_proceso' && <button onClick={() => nav(`/crear/${v.id}/generacion`)} className="btn-primary col-span-2">{t('pro.det.verGen')}</button>}
              <button onClick={() => nav(`/crear/${v.id}/${v.estado === 'guion' ? 'guion' : v.estado === 'en_proceso' || v.estado === 'error' ? 'generacion' : 'resultado'}`)} className="btn-secondary col-span-2"><PanelRightOpen size={16} /> {t('pro.det.verPanel')}</button>
            </div>

            <h3 className="kpi-label mt-6">{t('pro.det.linea')}</h3>
            <ol className="mt-3 space-y-2.5">
              {pasos.map((s) => (
                <li key={s.k} className="flex items-center gap-2.5 text-sm">
                  {s.done ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={12} /></span> : <Circle size={20} className="text-line" />}
                  <span className={s.done ? 'font-medium' : 'text-ink-2'}>{t(s.k)}</span>
                </li>
              ))}
            </ol>

            <h3 className="kpi-label mt-6">{t('pro.det.parametros')}</h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['resumen.tematica', t(`tem.${v.tematica}`)], ['resumen.duracion', t('unidad.min', { n: v.duracionMin })],
                ['resumen.idioma', t(`idioma.${v.idioma}`)], ['resumen.tono', t(`tono.${v.tono}`)],
                ['resumen.voz', t(`voz.${v.voz}`)], ['pro.col.fecha', formatFecha(v.fechaISO, lang)],
              ].map(([k, val]) => (
                <div key={k} className="min-w-0"><dt className="text-xs text-ink-2">{t(k)}</dt><dd className="font-semibold">{val}</dd></div>
              ))}
            </dl>

            <h3 className="kpi-label mt-6">{t('pro.det.idea')}</h3>
            <p className="mt-2 rounded-lg bg-surface-2 p-3 text-sm italic">“{L(v.idea)}”</p>

            <h3 className="kpi-label mt-6">{t('pro.det.guion')}</h3>
            <ol className="mt-2 space-y-3">
              {v.escenas.map((e, i) => (
                <li key={e.id} className="text-sm">
                  <p className="font-semibold"><span className="mr-1.5 font-mono text-xs text-accent">{i + 1}.</span>{L(e.titulo)}</p>
                  <p className="mt-0.5 text-ink-2">{L(e.narracion)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  )
}

function useProgresoSafe(v: Video | undefined) {
  const dummy: Video = v ?? ({ id: '', estado: 'borrador' } as Video)
  const p = useProgreso(dummy)
  return v ? p : undefined
}
