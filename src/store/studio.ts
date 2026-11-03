import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Video, Borrador, IdeaForm, VozId, Visibilidad } from '@/data/types'
import type { Lang, Texto } from '@/i18n'
import { crearVideosMock, crearBorradoresMock, IDEA_EJEMPLO, ETIQUETAS_BASE } from '@/data/mock'
import { generarGuion } from '@/data/guion'
import { isoLocal } from '@/data/fechas'
import type { Job } from '@/data/pipeline'

export const FORM_INICIAL: IdeaForm = { idea: '', tematica: 'finanzas_personales', duracionMin: 15, idioma: 'es', tono: 'didactico', voz: 'sofia' }

export interface PublishData { titulo: string; descripcion: string; etiquetas: string[]; visibilidad: Visibilidad }

interface StudioState {
  videos: Video[]
  drafts: Borrador[]
  form: IdeaForm
  canalConectado: boolean
  job: Job | null
  variantes: Record<string, number>
  micDestacado: boolean
  setForm: (p: Partial<IdeaForm>) => void
  resetForm: () => void
  saveDraft: () => void
  deleteDraft: (id: string) => void
  loadDraft: (id: string, lang: Lang) => void
  crearDesdeForm: () => string
  regenerar: (id: string) => void
  editarEscena: (id: string, escenaId: string, lang: Lang, campo: 'titulo' | 'narracion', valor: string) => void
  setVoz: (id: string, voz: VozId) => void
  startJob: (id: string, durationMs?: number) => void
  finishJob: () => void
  cancelJob: () => void
  publicar: (id: string, d: PublishData) => void
  reintentar: (id: string) => 'voz' | 'subida' | null
  setCanal: (v: boolean) => void
  setMicDestacado: (v: boolean) => void
  sembrarPreview: (modulo: number, lang: Lang) => void
}

const patch = (videos: Video[], id: string, fn: (v: Video) => Video) => videos.map((v) => (v.id === id ? fn(v) : v))

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      videos: crearVideosMock(),
      drafts: crearBorradoresMock(),
      form: FORM_INICIAL,
      canalConectado: true,
      job: null,
      variantes: {},
      micDestacado: false,
      setForm: (p) => set({ form: { ...get().form, ...p } }),
      resetForm: () => set({ form: FORM_INICIAL }),
      saveDraft: () => {
        const f = get().form
        const d: Borrador = { id: `b-${Date.now().toString(36)}`, idea: { es: f.idea, en: f.idea }, tematica: f.tematica, fechaISO: isoLocal() }
        set({ drafts: [d, ...get().drafts] })
      },
      deleteDraft: (id) => set({ drafts: get().drafts.filter((d) => d.id !== id) }),
      loadDraft: (id, lang) => {
        const d = get().drafts.find((x) => x.id === id)
        if (d) set({ form: { ...get().form, idea: d.idea[lang], tematica: d.tematica } })
      },
      crearDesdeForm: () => {
        const f = get().form
        const id = `v-${Date.now().toString(36)}`
        const g = generarGuion(f.idea, f.tematica, { seed: id })
        const idea: Texto = { es: f.idea, en: f.idea }
        const v: Video = {
          id, titulo: g.titulo, idea, tematica: f.tematica, duracionMin: f.duracionMin, idioma: f.idioma, tono: f.tono, voz: f.voz,
          estado: 'guion', fechaISO: isoLocal(), escenas: g.escenas, etiquetas: ETIQUETAS_BASE,
          descripcion: { es: `${g.titulo.es}. Un video de Finanzas en Claro.`, en: `${g.titulo.en}. A Finanzas en Claro video.` },
        }
        set({ videos: [v, ...get().videos] })
        return id
      },
      regenerar: (id) => {
        const n = (get().variantes[id] ?? 0) + 1
        set({
          variantes: { ...get().variantes, [id]: n },
          videos: patch(get().videos, id, (v) => {
            const g = generarGuion(v.idea.es, v.tematica, { seed: `${id}-${n}`, variante: n, titulo: v.titulo })
            return { ...v, escenas: g.escenas }
          }),
        })
      },
      editarEscena: (id, escenaId, lang, campo, valor) =>
        set({ videos: patch(get().videos, id, (v) => ({ ...v, escenas: v.escenas.map((e) => (e.id === escenaId ? { ...e, [campo]: { ...e[campo], [lang]: valor } } : e)) })) }),
      setVoz: (id, voz) => set({ videos: patch(get().videos, id, (v) => ({ ...v, voz })) }),
      startJob: (id, durationMs = 12000) =>
        set({ job: { videoId: id, startedAt: Date.now(), durationMs, finished: false }, videos: patch(get().videos, id, (v) => ({ ...v, estado: 'en_proceso', errorMotivo: undefined, errorTipo: undefined })) }),
      finishJob: () => {
        const j = get().job
        if (!j || j.finished) return
        set({ job: { ...j, finished: true }, videos: patch(get().videos, j.videoId, (v) => ({ ...v, estado: 'listo', progreso: undefined })) })
      },
      cancelJob: () => {
        const j = get().job
        if (!j) return
        set({ job: null, videos: j.finished ? get().videos : patch(get().videos, j.videoId, (v) => ({ ...v, estado: 'listo' })) })
      },
      publicar: (id, d) =>
        set({
          videos: patch(get().videos, id, (v) => ({
            ...v, estado: 'publicado', visibilidad: d.visibilidad, errorMotivo: undefined, errorTipo: undefined, fechaISO: isoLocal(),
            titulo: d.titulo.trim() && d.titulo !== v.titulo.es && d.titulo !== v.titulo.en ? { es: d.titulo, en: d.titulo } : v.titulo,
            etiquetas: d.etiquetas,
          })),
        }),
      reintentar: (id) => {
        const v = get().videos.find((x) => x.id === id)
        if (!v || !v.errorTipo) return null
        const tipo = v.errorTipo
        if (tipo === 'voz') get().startJob(id)
        else set({ videos: patch(get().videos, id, (x) => ({ ...x, errorMotivo: undefined, errorTipo: undefined })) })
        return tipo
      },
      setCanal: (v) => set({ canalConectado: v }),
      setMicDestacado: (v) => set({ micDestacado: v }),
      sembrarPreview: (modulo, lang) => {
        const s = get()
        if (modulo === 1) {
          const d = s.drafts[0]
          set({ form: { ...FORM_INICIAL, idea: d ? d.idea[lang] : IDEA_EJEMPLO[lang], tematica: d ? d.tematica : 'historia_finanzas' }, micDestacado: false })
        } else if (modulo === 2) {
          set({ form: { ...FORM_INICIAL, tematica: 'historia_finanzas' }, micDestacado: true })
        } else if (modulo === 3) {
          s.startJob('v-demo')
        } else if (modulo === 4) {
          if (s.job && s.job.videoId === 'v-demo' && !s.job.finished) s.cancelJob()
          set({ videos: patch(get().videos, 'v-demo', (v) => ({ ...v, estado: v.estado === 'publicado' ? 'publicado' : 'listo' })) })
        } else if (modulo === 5) {
          set({ canalConectado: true })
        }
      },
    }),
    {
      name: 'creavo_studio',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ videos: s.videos, drafts: s.drafts, form: s.form, canalConectado: s.canalConectado, job: s.job, variantes: s.variantes }),
    },
  ),
)

export function useVideo(id: string | undefined): Video | undefined {
  return useStudio((s) => s.videos.find((v) => v.id === id))
}
