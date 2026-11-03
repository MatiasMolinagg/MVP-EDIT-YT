import type { Video } from '@/data/types'
export function GeneracionStage({ video }: { video: Video }) {
  return <div>{video.id}</div>
}
