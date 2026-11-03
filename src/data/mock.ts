import type { Texto } from '@/i18n'
import type { Video, Borrador, Tematica, Duracion, Estado, Visibilidad, Tono, VozId } from './types'
import { generarGuion } from './guion'
import { isoDiasAtras } from './fechas'

const T = (es: string, en: string): Texto => ({ es, en })

interface Semilla {
  id: string; titulo: Texto; idea: Texto; tematica: Tematica; dur: Duracion; estado: Estado; dias: number
  vis?: Visibilidad; progreso?: number; tono?: Tono; voz?: VozId; error?: Texto; errorTipo?: 'voz' | 'subida'
}

const SEMILLAS: Semilla[] = [
  { id: 'v-demo', titulo: T('Historia de las finanzas de Nicaragua y cómo controlar las tuyas', 'The history of Nicaragua’s finances and how to control yours'), idea: T('Necesito un video sobre la historia de las finanzas de Nicaragua y cómo controlar tus finanzas personales hoy', 'I need a video about the financial history of Nicaragua and how to control your personal finances today'), tematica: 'historia_finanzas', dur: 15, estado: 'listo', dias: 0, tono: 'documental', voz: 'mateo' },
  { id: 'v-001', titulo: T('Tu primer presupuesto mensual sin planillas', 'Your first monthly budget without spreadsheets'), idea: T('Un video para armar el primer presupuesto mensual sin usar planillas', 'A video to build your first monthly budget without spreadsheets'), tematica: 'finanzas_personales', dur: 15, estado: 'publicado', vis: 'publico', dias: 9, tono: 'didactico', voz: 'sofia' },
  { id: 'v-002', titulo: T('Método bola de nieve para salir de deudas', 'The snowball method to get out of debt'), idea: T('Explicar el método bola de nieve para salir de deudas paso a paso', 'Explain the snowball method to get out of debt step by step'), tematica: 'deudas_credito', dur: 25, estado: 'listo', dias: 3, tono: 'conversado', voz: 'andres' },
  { id: 'v-003', titulo: T('Cómo ahorrar en dólares viviendo en Estados Unidos', 'How to save in dollars while living in the United States'), idea: T('Cómo ahorrar en dólares si vivís y trabajás en Estados Unidos', 'How to save in dollars if you live and work in the United States'), tematica: 'ahorro_inversion', dur: 25, estado: 'en_proceso', progreso: 62, dias: 0, tono: 'conversado', voz: 'valentina' },
  { id: 'v-004', titulo: T('Enviar remesas sin perder plata', 'Sending remittances without losing money'), idea: T('Qué mirar antes de enviar remesas para no perder plata en comisiones', 'What to check before sending remittances so you don’t lose money on fees'), tematica: 'finanzas_personales', dur: 8, estado: 'publicado', vis: 'no_listado', dias: 14, tono: 'didactico', voz: 'mateo' },
  { id: 'v-005', titulo: T('Interés compuesto explicado con ejemplos', 'Compound interest explained with examples'), idea: T('Explicar el interés compuesto con ejemplos simples', 'Explain compound interest with simple examples'), tematica: 'ahorro_inversion', dur: 40, estado: 'publicado', vis: 'privado', dias: 21, tono: 'didactico', voz: 'sofia' },
  { id: 'v-006', titulo: T('Inflación: qué le hace a tu sueldo', 'Inflation: what it does to your paycheck'), idea: T('Qué es la inflación y cómo afecta a tu sueldo', 'What inflation is and how it affects your paycheck'), tematica: 'finanzas_personales', dur: 15, estado: 'error', dias: 1, tono: 'documental', voz: 'mateo', errorTipo: 'voz', error: T('Saldo insuficiente en síntesis de voz', 'Insufficient balance in voice synthesis') },
  { id: 'v-007', titulo: T('Crédito: cómo usarlo sin que te use', 'Credit: how to use it without it using you'), idea: T('Cómo usar el crédito a tu favor sin endeudarte de más', 'How to use credit in your favor without getting into too much debt'), tematica: 'deudas_credito', dur: 15, estado: 'listo', dias: 2, tono: 'conversado', voz: 'andres', errorTipo: 'subida', error: T('La subida a YouTube se interrumpió', 'The YouTube upload was interrupted') },
]

export const ETIQUETAS_BASE = ['finanzas', 'finanzas personales', 'ahorro', 'Finanzas en Claro']

export function crearVideosMock(): Video[] {
  return SEMILLAS.map((s) => {
    const g = generarGuion(s.idea.es, s.tematica, { titulo: s.titulo, seed: s.id })
    return {
      id: s.id,
      titulo: s.titulo,
      idea: s.idea,
      tematica: s.tematica,
      duracionMin: s.dur,
      idioma: 'es',
      tono: s.tono ?? 'didactico',
      voz: s.voz ?? 'sofia',
      estado: s.estado,
      visibilidad: s.vis,
      fechaISO: isoDiasAtras(s.dias),
      progreso: s.progreso,
      escenas: g.escenas,
      errorMotivo: s.error,
      errorTipo: s.errorTipo,
      descripcion: T(`${s.titulo.es}. Un video de Finanzas en Claro para entender tu dinero, sin vueltas.`, `${s.titulo.en}. A Finanzas en Claro video to understand your money, plain and simple.`),
      etiquetas: ETIQUETAS_BASE,
    }
  })
}

export function crearBorradoresMock(): Borrador[] {
  return [
    { id: 'b-1', idea: T('Cómo leer el recibo de sueldo en Estados Unidos', 'How to read a pay stub in the United States'), tematica: 'finanzas_personales', fechaISO: isoDiasAtras(1) },
    { id: 'b-2', idea: T('Fondo de emergencia: cuánto y dónde', 'Emergency fund: how much and where'), tematica: 'ahorro_inversion', fechaISO: isoDiasAtras(4) },
    { id: 'b-3', idea: T('Historia del córdoba nicaragüense', 'The history of the Nicaraguan córdoba'), tematica: 'historia_finanzas', fechaISO: isoDiasAtras(11) },
  ]
}

export const IDEA_EJEMPLO = T(
  'Necesito un video sobre la historia de las finanzas de Nicaragua y cómo controlar tus finanzas personales hoy',
  'I need a video about the history of Nicaragua’s finances and how to control your personal finances today',
)
