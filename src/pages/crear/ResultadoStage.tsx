import type { Video } from '@/data/types'
export function ResultadoStage({ video }: { video: Video }) {
  return <div>{video.id}</div>
}
