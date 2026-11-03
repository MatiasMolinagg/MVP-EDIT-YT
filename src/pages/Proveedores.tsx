import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Brain, AudioLines, Mic2, Clapperboard, Tv, AlertTriangle, RotateCw, BookOpen, KeyRound, Wallet } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { PageHeader, PreviewBanner, DevNotice } from '@/components/common'
import { cn } from '@/lib/cn'

type Est = 'activo' | 'saldo' | 'pendiente'
const ROWS: { id: string; icon: typeof Brain; clave: string; est: Est }[] = [
  { id: 'llm', icon: Brain, clave: 'sk-••••••••3f9a', est: 'activo' },
  { id: 'stt', icon: AudioLines, clave: 'tr-••••••••81c0', est: 'activo' },
  { id: 'tts', icon: Mic2, clave: 'vs-••••••••a27e', est: 'saldo' },
  { id: 'video', icon: Clapperboard, clave: 'vg-••••••••5d14', est: 'pendiente' },
  { id: 'yt', icon: Tv, clave: 'oauth-••••••7c2', est: 'activo' },
]
const EST_CLS: Record<Est, string> = {
  activo: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  saldo: 'bg-amber-50 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  pendiente: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
}
const DOT: Record<Est, string> = { activo: 'bg-emerald-500', saldo: 'bg-amber-500', pendiente: 'bg-zinc-400' }

export default function Proveedores() {
  const { t } = useT()
  const toast = useApp((s) => s.toast)
  const reintentar = useStudio((s) => s.reintentar)
  const v006 = useStudio((s) => s.videos.find((v) => v.id === 'v-006'))
  const theme = useApp((s) => s.theme)
  const [edit, setEdit] = useState<string | null>(null)
  const pendiente = v006?.estado === 'error'

  const retry = () => {
    if (pendiente) { reintentar('v-006'); toast('prov.aviso.ok', undefined, 'info') } else toast('prov.aviso.ya', undefined, 'info')
  }
  const data = Array.from({ length: 7 }, (_, i) => ({ d: t('prov.dia', { n: i + 1 }), llm: 14 + ((i * 7) % 9), stt: 4 + ((i * 3) % 5), tts: 9 + ((i * 5) % 7), video: 6 + ((i * 4) % 6) }))
  const grid = theme === 'dark' ? 'rgba(255,255,255,.07)' : '#e4e4e7'
  const tick = { fontSize: 11, fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }

  const Estado = ({ e }: { e: Est }) => <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', EST_CLS[e])}><span className={cn('h-1.5 w-1.5 rounded-full', DOT[e])} />{t(`prov.e.${e}`)}</span>
  const Clave = ({ id, clave }: { id: string; clave: string }) => edit === id ? (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setEdit(null); toast('prov.clave.noGuarda', undefined, 'info') }}>
      <input type="password" autoComplete="off" className="input min-w-0 font-mono text-xs" placeholder={t('prov.clave.ph')} autoFocus />
      <button className="btn-primary shrink-0 px-3 text-xs">{t('prov.clave.guardar')}</button>
    </form>
  ) : (
    <button onClick={() => setEdit(id)} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg font-mono text-xs hover:text-accent" title={t('prov.reemplazar')}>
      <KeyRound size={14} className="shrink-0 text-ink-2" />{clave}
    </button>
  )
  const Docs = () => <button onClick={() => toast('prov.docs.toast', undefined, 'info')} className="btn-ghost min-h-[44px] px-2 text-xs text-accent"><BookOpen size={15} /> {t('prov.docs')}</button>

  return (
    <div data-view="proveedores" className="pb-app">
      <PreviewBanner id="proveedores" />
      <PageHeader title={t('prov.titulo')} sub={t('prov.sub')} />
      <div className="flex gap-3 rounded-xl border border-accent/30 bg-accent-soft/60 p-4 text-[15px] font-medium">
        <Wallet size={20} className="mt-0.5 shrink-0 text-accent" />
        <p>{t('prov.mensaje')}</p>
      </div>
      {pendiente && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100" role="alert">
          <AlertTriangle size={20} className="shrink-0 text-amber-600 dark:text-amber-300" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{t('prov.aviso.title')}</p>
            <p className="mt-0.5 text-sm">{t('prov.aviso.body')}</p>
          </div>
          <button onClick={retry} className="btn-secondary shrink-0"><RotateCw size={16} /> {t('pro.reintentar')}</button>
        </div>
      )}

      {/* ≥640: tabla con scroll propio */}
      <div className="card mt-5 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-ink-2">
              {['servicio', 'proveedor', 'cobro', 'clave', 'estado', 'docs'].map((c) => <th key={c} className="px-4 py-3 font-semibold">{t(`prov.col.${c}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-semibold"><r.icon size={17} className="shrink-0 text-accent" />{t(`prov.s.${r.id}`)}</span></td>
                <td className="px-4 py-3 text-ink-2">{t('prov.aDefinir')}</td>
                <td className="px-4 py-3 text-ink-2">{t(`prov.c.${r.id}`)}</td>
                <td className="px-4 py-2"><Clave id={r.id} clave={r.clave} /></td>
                <td className="px-4 py-3"><Estado e={pendiente || r.est !== 'saldo' ? r.est : 'activo'} /></td>
                <td className="px-2 py-2"><Docs /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <640: tarjetas */}
      <ul className="mt-5 space-y-3 sm:hidden">
        {ROWS.map((r) => (
          <li key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2.5 font-semibold"><r.icon size={17} className="shrink-0 text-accent" /><span className="truncate">{t(`prov.s.${r.id}`)}</span></span>
              <Estado e={pendiente || r.est !== 'saldo' ? r.est : 'activo'} />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div><dt className="text-xs text-ink-2">{t('prov.col.proveedor')}</dt><dd>{t('prov.aDefinir')}</dd></div>
              <div><dt className="text-xs text-ink-2">{t('prov.col.cobro')}</dt><dd>{t(`prov.c.${r.id}`)}</dd></div>
            </dl>
            <div className="mt-1"><Clave id={r.id} clave={r.clave} /></div>
            <Docs />
          </li>
        ))}
      </ul>
      <DevNotice className="mt-3" f="dev.claves.f" ahora="dev.claves.ahora" luego="dev.claves.luego" />

      <section className="card mt-6 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{t('prov.consumo')}</h2>
          <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-2">{t('prov.consumo.ilustrativo')}</span>
        </div>
        <p className="text-xs text-ink-2">{t('prov.consumo.unidad')}</p>
        <div className="mt-4 h-[220px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={grid} />
              <XAxis dataKey="d" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={tick} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: grid }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              <Bar dataKey="llm" name={t('prov.s.llm')} stackId="a" fill="#6366f1" />
              <Bar dataKey="stt" name={t('prov.s.stt')} stackId="a" fill="#a5b4fc" />
              <Bar dataKey="tts" name={t('prov.s.tts')} stackId="a" fill="#f59e0b" />
              <Bar dataKey="video" name={t('prov.s.video')} stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
