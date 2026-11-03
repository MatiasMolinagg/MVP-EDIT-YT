import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NotebookPen, Trash2, Play, Plus } from 'lucide-react'
import { useT, tr } from '@/i18n'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { fechaRelativa } from '@/data/fechas'
import type { Borrador } from '@/data/types'
import { PageHeader, PreviewBanner } from '@/components/common'
import { ConfirmModal } from '@/components/ui/Modal'

export default function Borradores() {
  const { t, L, lang } = useT()
  const nav = useNavigate()
  const drafts = useStudio((s) => s.drafts)
  const loadDraft = useStudio((s) => s.loadDraft)
  const deleteDraft = useStudio((s) => s.deleteDraft)
  const toast = useApp((s) => s.toast)
  const [del, setDel] = useState<Borrador | null>(null)

  const retomar = (d: Borrador) => { loadDraft(d.id, lang); toast('bor.retomado', { idea: d.idea }, 'info'); nav('/crear') }
  return (
    <div data-view="borradores" className="pb-app">
      <PreviewBanner id="borradores" />
      <PageHeader title={t('bor.titulo')} sub={t('bor.sub')} actions={<Link to="/crear" className="btn-primary"><Plus size={17} /> {t('nav.crear')}</Link>} />
      {drafts.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent"><NotebookPen size={24} /></span>
          <p className="mt-4 font-bold">{t('bor.vacio.title')}</p>
          <p className="mt-1 max-w-sm text-sm text-ink-2">{t('bor.vacio.body')}</p>
          <Link to="/crear" className="btn-primary mt-5">{t('bor.vacio.cta')}</Link>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {drafts.map((d) => (
            <li key={d.id} className="card flex flex-col p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300">{t('estado.borrador')}</span>
                <span className="text-xs text-ink-2">{t('bor.guardado', { fecha: fechaRelativa(d.fechaISO, lang).toLowerCase() })}</span>
              </div>
              <button onClick={() => retomar(d)} className="mt-3 flex-1 text-left text-[15px] font-semibold leading-snug hover:text-accent">{L(d.idea)}</button>
              <p className="mt-2 text-xs text-ink-2">{t(`tem.${d.tematica}`)}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => retomar(d)} className="btn-primary flex-1"><Play size={15} /> {t('bor.retomar')}</button>
                <button onClick={() => setDel(d)} data-testid="draft-delete" className="btn-secondary px-3 text-red-600 dark:text-red-400" aria-label={`${t('bor.eliminar')}: ${L(d.idea)}`}><Trash2 size={16} /><span className="hidden xs:inline">{t('bor.eliminar')}</span></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmModal
        open={!!del}
        title={t('bor.confirm.title')}
        body={del ? tr('bor.confirm.body', lang, { idea: del.idea }) : ''}
        confirmLabel={t('bor.eliminar')}
        danger
        onConfirm={() => { if (del) { deleteDraft(del.id); toast('bor.eliminado') } }}
        onClose={() => setDel(null)}
      />
    </div>
  )
}
