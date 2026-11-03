import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tv, ShieldCheck, Upload, PencilLine, UserCircle, KeyRound, Unplug, Plug, Loader2, CheckCircle2, Globe, EyeOff, Lock } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { formatFecha, isoDiasAtras } from '@/data/fechas'
import type { Visibilidad } from '@/data/types'
import { PageHeader, PreviewBanner, DevNotice } from '@/components/common'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { LogoMark } from '@/components/Logo'
import { cn } from '@/lib/cn'

const VIS_ICON: Record<Visibilidad, typeof Globe> = { publico: Globe, no_listado: EyeOff, privado: Lock }
const PERMISOS = [
  { k: 'canal.permiso.subir', icon: Upload },
  { k: 'canal.permiso.editar', icon: PencilLine },
  { k: 'canal.permiso.ver', icon: UserCircle },
]

export default function Canal() {
  const { t, L, lang } = useT()
  const conectado = useStudio((s) => s.canalConectado)
  const setCanal = useStudio((s) => s.setCanal)
  const videos = useStudio((s) => s.videos)
  const toast = useApp((s) => s.toast)
  const [confirm, setConfirm] = useState(false)
  const [connect, setConnect] = useState(false)
  const subidas = videos.filter((v) => v.estado === 'publicado').sort((a, b) => b.fechaISO.localeCompare(a.fechaISO))

  return (
    <div data-view="canal" className="pb-app">
      <PreviewBanner id="canal" />
      <PageHeader title={t('canal.titulo')} sub={t('canal.sub')} />
      {conectado ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <section className="card p-5" data-testid="channel-card">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-extrabold text-white">FC</span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{t('canal.nombre')}</p>
                <p className="truncate text-sm text-ink-2">{t('canal.handle')}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t('canal.conectado')}</span>
              <span className="text-xs text-ink-2">{t('canal.desde', { fecha: formatFecha(isoDiasAtras(30), lang) })}</span>
            </div>
            <h2 className="kpi-label mt-6">{t('canal.permisos')}</h2>
            <ul className="mt-2 space-y-2">
              {PERMISOS.map((p) => (
                <li key={p.k} className="flex items-start gap-2.5 text-sm"><p.icon size={16} className="mt-0.5 shrink-0 text-accent" />{t(p.k)}</li>
              ))}
            </ul>
            <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-surface-2 p-3 text-sm">
              <KeyRound size={16} className="mt-0.5 shrink-0 text-ink-2" />
              <p><span className="font-semibold">{t('canal.token')}:</span> <span className="text-ink-2">{t('canal.token.v')}</span></p>
            </div>
            <button onClick={() => setConfirm(true)} data-testid="channel-disconnect" className="btn-secondary mt-5 w-full text-red-600 dark:text-red-400"><Unplug size={16} /> {t('canal.desconectar')}</button>
          </section>
          <section className="card p-5">
            <h2 className="font-bold">{t('canal.subidas')}</h2>
            {subidas.length === 0 ? <p className="mt-3 text-sm text-ink-2">{t('canal.subidas.vacio')}</p> : (
              <ul className="mt-3 divide-y divide-line">
                {subidas.map((v) => {
                  const I = VIS_ICON[v.visibilidad ?? 'publico']
                  return (
                    <li key={v.id}>
                      <Link to={`/proyectos/${v.id}`} className="flex min-h-[56px] items-center gap-3 py-2.5 hover:text-accent">
                        <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-700 text-white"><Tv size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{L(v.titulo)}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-2"><I size={12} />{t(`vis.${v.visibilidad ?? 'publico'}`)} · {formatFecha(v.fechaISO, lang)}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="card flex flex-col items-center p-8 text-center sm:p-12">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent"><Tv size={28} /></span>
          <p className="mt-4 text-lg font-bold">{t('canal.vacio.title')}</p>
          <p className="mt-1 max-w-md text-sm text-ink-2">{t('canal.vacio.body')}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />{t('canal.desconectado')}</span>
          <button onClick={() => setConnect(true)} data-testid="channel-connect" className="btn-primary mt-6"><Plug size={17} /> {t('canal.conectar')}</button>
        </div>
      )}
      <DevNotice className="mt-5" f="dev.canal.f" ahora="dev.canal.ahora" luego="dev.canal.luego" />
      <ConfirmModal open={confirm} title={t('canal.desc.title')} body={t('canal.desc.body')} confirmLabel={t('canal.desconectar')} danger
        onConfirm={() => { setCanal(false); toast('canal.desc.ok', undefined, 'info') }} onClose={() => setConfirm(false)} />
      <ConnectModal open={connect} onClose={() => setConnect(false)} onDone={() => { setCanal(true); toast('canal.ok') }} />
    </div>
  )
}

function ConnectModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { t } = useT()
  const [step, setStep] = useState(1)
  useEffect(() => { if (open) setStep(1) }, [open])
  useEffect(() => {
    if (step !== 2) return
    const id = setTimeout(() => setStep(3), 1500)
    return () => clearTimeout(id)
  }, [step])
  return (
    <Modal open={open} onClose={onClose} width={460} labelledBy="connect-title">
      <div className="flex items-center gap-2 pr-10">
        <LogoMark size={28} />
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">{t('canal.modal.sim')}</span>
        <span className="ml-auto font-mono text-xs text-ink-2">{t('canal.modal.paso', { n: step })}</span>
      </div>
      <h2 id="connect-title" className="mt-4 text-lg font-bold">{t('canal.modal.title')}</h2>
      <div className="mt-2 flex gap-1.5">{[1, 2, 3].map((n) => <span key={n} className={cn('h-1 flex-1 rounded-full', n <= step ? 'bg-accent' : 'bg-line')} />)}</div>
      {step === 1 && (
        <>
          <p className="mt-4 text-sm font-semibold">{t('canal.modal.paso1')}</p>
          <ul className="mt-2 space-y-2">
            {PERMISOS.map((p) => <li key={p.k} className="flex items-start gap-2.5 rounded-lg bg-surface-2 p-3 text-sm"><p.icon size={16} className="mt-0.5 shrink-0 text-accent" />{t(p.k)}</li>)}
          </ul>
          <p className="mt-3 flex gap-2 text-xs text-ink-2"><ShieldCheck size={15} className="shrink-0" />{t('canal.modal.nota')}</p>
          <button onClick={() => setStep(2)} className="btn-primary mt-5 w-full">{t('canal.modal.autorizar')}</button>
        </>
      )}
      {step === 2 && <div className="flex flex-col items-center py-10"><Loader2 className="animate-spin text-accent" size={32} /><p className="mt-3 text-sm font-medium">{t('canal.modal.paso2')}</p></div>}
      {step === 3 && (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="text-emerald-500" size={40} />
          <p className="mt-3 font-bold">{t('canal.modal.paso3')}</p>
          <p className="text-sm text-ink-2">{t('canal.nombre')}</p>
          <button onClick={() => { onDone(); onClose() }} className="btn-primary mt-5 w-full">{t('canal.modal.listo')}</button>
        </div>
      )}
    </Modal>
  )
}
