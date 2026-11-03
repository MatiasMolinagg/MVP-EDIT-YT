import { useParams, Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { useT } from '@/i18n'
import { useStudio, useVideo } from '@/store/studio'
import { PreviewBanner } from '@/components/common'
import { StageBar, ResumenLateral, ResumenMovil, type Etapa, type ResumenData } from './parts'
import { IdeaStage } from './IdeaStage'
import { GuionStage } from './GuionStage'
import { GeneracionStage } from './GeneracionStage'
import { ResultadoStage } from './ResultadoStage'
import { cn } from '@/lib/cn'

export default function Crear({ etapa }: { etapa: Etapa }) {
  const { t, L } = useT()
  const { id } = useParams()
  const video = useVideo(id)
  const form = useStudio((s) => s.form)
  const job = useStudio((s) => s.job)

  if (etapa !== 'idea' && !video) {
    return (
      <div data-view={`crear-${etapa}`} className="pb-app">
        <div className="card mx-auto mt-10 max-w-md p-8 text-center">
          <SearchX className="mx-auto text-ink-2" size={32} />
          <p className="mt-3 font-semibold">{t('guion.noEncontrado')}</p>
          <Link to="/crear" className="btn-primary mt-5">{t('guion.irCrear')}</Link>
        </div>
      </div>
    )
  }
  const d: ResumenData = video
    ? { tematica: video.tematica, duracionMin: video.duracionMin, idioma: video.idioma, tono: video.tono, voz: video.voz, titulo: L(video.titulo) }
    : { ...form }
  const generating = !!video && !!job && job.videoId === video.id && !job.finished
  const maxReached = !video ? 0 : video.estado === 'guion' ? 1 : generating ? 2 : 3
  const hasBar = etapa === 'idea' || etapa === 'guion'

  return (
    <div data-view={`crear-${etapa}`} className={cn(hasBar ? 'pb-app-bar' : 'pb-app')}>
      <PreviewBanner id="crear" />
      <StageBar etapa={etapa} id={video?.id} maxReached={maxReached} />
      <div className="gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0">
          {etapa !== 'resultado' && <ResumenMovil d={d} />}
          {etapa === 'idea' && <IdeaStage />}
          {etapa === 'guion' && video && <GuionStage video={video} />}
          {etapa === 'generacion' && video && <GeneracionStage video={video} />}
          {etapa === 'resultado' && video && <ResultadoStage video={video} />}
        </div>
        <aside className="hidden lg:block"><ResumenLateral d={d} /></aside>
      </div>
    </div>
  )
}
