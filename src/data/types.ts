import type { Texto } from '@/i18n'

export type Estado = 'borrador' | 'guion' | 'en_proceso' | 'listo' | 'publicado' | 'error'
export type Visibilidad = 'publico' | 'no_listado' | 'privado'
export type Tematica = 'finanzas_personales' | 'historia_finanzas' | 'ahorro_inversion' | 'deudas_credito' | 'otra'
export type Tono = 'didactico' | 'conversado' | 'documental'
export type Duracion = 8 | 15 | 25 | 40
export type VozId = 'sofia' | 'mateo' | 'valentina' | 'andres'
export type ChartKind = 'presupuesto' | 'etapas' | 'bola' | 'ahorro'

export interface Escena {
  id: string
  titulo: Texto
  narracion: Texto
  visual: 'titulo' | 'grafico' | 'zocalo' | 'lista'
  chart?: ChartKind
  bullets?: Texto[]
}

export interface Video {
  id: string
  titulo: Texto
  idea: Texto
  tematica: Tematica
  duracionMin: Duracion
  idioma: 'es' | 'en'
  tono: Tono
  voz: VozId
  estado: Estado
  visibilidad?: Visibilidad
  fechaISO: string
  progreso?: number
  escenas: Escena[]
  errorMotivo?: Texto
  errorTipo?: 'voz' | 'subida'
  descripcion?: Texto
  etiquetas?: string[]
}

export interface Borrador {
  id: string
  idea: Texto
  tematica: Tematica
  fechaISO: string
}

export interface IdeaForm {
  idea: string
  tematica: Tematica
  duracionMin: Duracion
  idioma: 'es' | 'en'
  tono: Tono
  voz: VozId
}

export const TEMATICAS: Tematica[] = ['finanzas_personales', 'historia_finanzas', 'ahorro_inversion', 'deudas_credito', 'otra']
export const DURACIONES: Duracion[] = [8, 15, 25, 40]
export const TONOS: Tono[] = ['didactico', 'conversado', 'documental']
export const VOCES: { id: VozId; genero: 'f' | 'm' }[] = [
  { id: 'sofia', genero: 'f' },
  { id: 'mateo', genero: 'm' },
  { id: 'valentina', genero: 'f' },
  { id: 'andres', genero: 'm' },
]
