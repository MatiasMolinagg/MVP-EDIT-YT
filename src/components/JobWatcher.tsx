import { useEffect } from 'react'
import { useStudio } from '@/store/studio'
import { useApp } from '@/store/app'
import { estadoJob } from '@/data/pipeline'

/** El pipeline vive en el store: este vigía lo cierra aunque navegues a otra pantalla. */
export function JobWatcher() {
  useEffect(() => {
    const i = setInterval(() => {
      const s = useStudio.getState()
      const j = s.job
      if (!j || j.finished) return
      if (estadoJob(j).done) {
        const v = s.videos.find((x) => x.id === j.videoId)
        s.finishJob()
        if (v) {
          const app = useApp.getState()
          app.toast('toast.listo', { titulo: v.titulo }, 'ok')
          app.addNotif({ titleKey: 'notif.listo.title', bodyKey: 'notif.listo.body', vars: { titulo: v.titulo }, to: `/crear/${v.id}/resultado` })
        }
      }
    }, 250)
    return () => clearInterval(i)
  }, [])
  return null
}
