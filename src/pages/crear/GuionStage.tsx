import type { Video } from '@/data/types'
export function GuionStage({ video }: { video: Video }) {
  return <div>{video.id}</div>
}
