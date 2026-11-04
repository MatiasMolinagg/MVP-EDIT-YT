import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, Square, Lightbulb, Save, Wand2, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { useDictation } from '@/lib/useDictation'
import { IDEA_EJEMPLO } from '@/data/mock'
import { TEMATICAS, DURACIONES, TONOS } from '@/data/types'
import { DevNotice } from '@/components/common'
import { cn } from '@/lib/cn'
import { ActionBar } from './parts'

const MIN = 30

export function IdeaStage() {
  const { t, lang } = useT()
  const nav = useNavigate()
  const form = useStudio((s) => s.form)
  const setForm = useStudio((s) => s.setForm)
  const saveDraft = useStudio((s) => s.saveDraft)
  const crear = useStudio((s) => s.crearDesdeForm)
  const micDestacado = useStudio((s) => s.micDestacado)
  const setMicDestacado = useStudio((s) => s.setMicDestacado)
  const toast = useApp((s) => s.toast)
  const [touched, setTouched] = useState(false)
  const [instr, setInstr] = useState(false)

  const getBase = useCallback(() => useStudio.getState().form.idea, [])
  const onText = useCallback((s: string) => useStudio.getState().setForm({ idea: s }), [])
  const dict = useDictation(lang, getBase, onText)

  const len = form.idea.trim().length
  const valid = len >= MIN
  const toggleMic = () => {
    setMicDestacado(false)
    if (dict.recording) { dict.stop(); toast('idea.mic.listo', undefined, 'info') } else dict.start()
  }
  const guardar = () => {
    if (!len) { setTouched(true); toast('idea.validar', undefined, 'warn'); return }
    saveDraft(); toast('idea.guardado')
  }
  const generar = () => {
    if (!valid) { setTouched(true); toast('idea.validar', undefined, 'warn'); return }
    if (dict.recording) dict.stop()
    const id = crear()
    nav(`/crear/${id}/guion`)
  }

  return (
    <div>
      <h1 className="h-display">{t('idea.titulo')}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-2">{t('idea.sub')}</p>

      <div className={cn('card mt-6 p-4 transition sm:p-5', dict.recording && 'border-red-400/60 ring-4 ring-red-500/10')}>
        <textarea
          data-testid="idea-input"
          data-trailer="idea"
          value={form.idea}
          onChange={(e) => setForm({ idea: e.target.value })}
          onBlur={() => setTouched(true)}
          rows={5}
          placeholder={t('idea.ph')}
          className="w-full resize-none bg-transparent text-[17px] leading-relaxed text-ink outline-none placeholder:text-ink-2/80"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
          <div className="relative">
            {micDestacado && !dict.recording && <span className="anim-halo pointer-events-none absolute inset-0 rounded-full bg-accent" aria-hidden />}
            <button
              data-tour="mic"
              data-testid="mic-btn"
              onClick={toggleMic}
              aria-pressed={dict.recording}
              aria-label={t(dict.recording ? 'idea.mic.parar' : 'idea.mic')}
              className={cn('relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition', dict.recording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-accent on-accent hover:bg-accent-hover')}
            >
              {dict.recording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
              {dict.recording && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />}
            </button>
          </div>
          <div className="min-w-0 flex-1">
            {dict.recording ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400" role="status">
                <span className="flex h-4 items-end gap-0.5" aria-hidden>
                  {[0, 1, 2, 3].map((i) => <span key={i} className="w-1 animate-pulse rounded bg-red-500" style={{ height: `${6 + ((i * 5) % 10)}px`, animationDelay: `${i * 0.15}s` }} />)}
                </span>
                {t('idea.mic.grabando')}{dict.mode === 'sim' && <span className="font-normal text-ink-2">· {t('idea.mic.sim')}</span>}
              </p>
            ) : (
              <p className="text-sm font-medium">{micDestacado ? <span className="text-accent">{t('idea.mic.ayuda')}</span> : t('idea.mic')}</p>
            )}
            <p className={cn('mt-0.5 text-xs', touched && !valid ? 'text-red-600 dark:text-red-400' : valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-2')}>
              <span className="font-mono">{t('idea.contador', { n: len })}</span>
              {' · '}
              {valid ? <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} />{t('idea.ok')}</span> : t('idea.minimo', { n: MIN - len })}
            </p>
          </div>
          <button onClick={() => { setForm({ idea: IDEA_EJEMPLO[lang], tematica: 'historia_finanzas' }); setTouched(false) }} className="btn-ghost px-3 text-accent">
            <Lightbulb size={17} /> {t('idea.ejemplo')}
          </button>
        </div>
      </div>
      {dict.usedSim && <DevNotice className="mt-3" f="dev.dictado.f" ahora="dev.dictado.ahora" luego="dev.dictado.luego" />}

      <section className="mt-7" data-trailer="params">
        <h2 className="kpi-label">{t('idea.tematica')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMATICAS.map((tm) => (
            <button key={tm} onClick={() => setForm({ tematica: tm })} aria-pressed={form.tematica === tm} className={cn('chip', form.tematica === tm && 'chip-on')}>
              {t(`tem.${tm}`)}
            </button>
          ))}
        </div>

        <h2 className="kpi-label mt-7">{t('idea.parametros')}</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Segmented label={t('idea.duracion')} value={form.duracionMin} options={DURACIONES.map((d) => ({ v: d, l: t('unidad.min', { n: d }) }))} onChange={(v) => setForm({ duracionMin: v })} />
          <Segmented label={t('idea.idioma')} value={form.idioma} options={(['es', 'en'] as const).map((d) => ({ v: d, l: t(`idioma.${d}`) }))} onChange={(v) => setForm({ idioma: v })} />
          <div className="sm:col-span-2"><Segmented label={t('idea.tono')} value={form.tono} options={TONOS.map((d) => ({ v: d, l: t(`tono.${d}`) }))} onChange={(v) => setForm({ tono: v })} /></div>
        </div>
      </section>

      <section className="card mt-7">
        <button onClick={() => setInstr((o) => !o)} aria-expanded={instr} className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left sm:px-5">
          <Lock size={17} className="shrink-0 text-ink-2" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t('idea.instr.titulo')}</span>
            <span className="block text-xs text-ink-2">{t('idea.instr.sub')}</span>
          </span>
          {instr ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
        </button>
        {instr && (
          <div className="border-t border-line px-4 pb-4 pt-3 text-sm sm:px-5">
            <p className="text-ink-2">{t('idea.instr.p')}</p>
            <ul className="mt-3 space-y-2">
              {[1, 2, 3, 4].map((n) => <li key={n} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />{t(`idea.instr.${n}`)}</li>)}
            </ul>
          </div>
        )}
      </section>

      <ActionBar>
        <button onClick={guardar} className="btn-secondary"><Save size={17} /> {t('idea.guardar')}</button>
        <button onClick={generar} data-testid="generate-script" data-trailer="generate" className={cn('btn-primary', !valid && 'opacity-60')}><Wand2 size={17} /> {t('idea.generar')}</button>
      </ActionBar>
    </div>
  )
}

function Segmented<V extends string | number>({ label, value, options, onChange }: { label: string; value: V; options: { v: V; l: string }[]; onChange: (v: V) => void }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex rounded-lg border border-line bg-surface-2 p-1" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={String(o.v)} role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
            className={cn('min-h-[40px] min-w-0 flex-1 truncate rounded-md px-1.5 text-[13px] font-semibold transition', value === o.v ? 'bg-surface text-accent shadow-card' : 'text-ink-2 hover:text-ink')}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  )
}
