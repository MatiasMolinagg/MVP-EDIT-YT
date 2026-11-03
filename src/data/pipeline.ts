export type PasoId = 'guion' | 'locucion' | 'escenas' | 'montaje' | 'exportacion'
export type PasoEstado = 'done' | 'running' | 'retry' | 'pending'
export interface Job { videoId: string; startedAt: number; durationMs: number; finished: boolean }
export interface PasoInfo { id: PasoId; estado: PasoEstado; progreso: number }

export const PASOS: { id: PasoId; desde: number; hasta: number }[] = [
  { id: 'guion', desde: 0, hasta: 0 },
  { id: 'locucion', desde: 0, hasta: 0.3 },
  { id: 'escenas', desde: 0.3, hasta: 0.58 },
  { id: 'montaje', desde: 0.58, hasta: 0.82 },
  { id: 'exportacion', desde: 0.82, hasta: 1 },
]
// Fallo simulado en Locución con reintento automático.
export const RETRY_DESDE = 0.11
export const RETRY_HASTA = 0.2

export function estadoJob(job: Job, now = Date.now()) {
  const f = Math.min(1, Math.max(0, (now - job.startedAt) / job.durationMs))
  const retrying = f >= RETRY_DESDE && f < RETRY_HASTA
  const pasos: PasoInfo[] = PASOS.map((p) => {
    if (p.id === 'guion') return { id: p.id, estado: 'done', progreso: 1 }
    if (f >= p.hasta) return { id: p.id, estado: 'done', progreso: 1 }
    if (f < p.desde) return { id: p.id, estado: 'pending', progreso: 0 }
    let prog = (f - p.desde) / (p.hasta - p.desde)
    if (p.id === 'locucion') {
      if (retrying) return { id: p.id, estado: 'retry', progreso: (RETRY_DESDE - p.desde) / (p.hasta - p.desde) }
      if (f >= RETRY_HASTA) prog = (RETRY_DESDE + ((f - RETRY_HASTA) / (p.hasta - RETRY_HASTA)) * (p.hasta - RETRY_DESDE)) / p.hasta
    }
    return { id: p.id, estado: 'running', progreso: Math.min(1, prog) }
  })
  return { f, pasos, retrying, done: f >= 1, restanteMs: Math.max(0, job.durationMs - (now - job.startedAt)) }
}
