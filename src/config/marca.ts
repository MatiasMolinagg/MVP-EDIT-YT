// ÚNICA fuente de verdad de marca y montos de la propuesta.
export const MARCA = {
  producto: 'Creavo',
  cliente: 'Juan Carlos',
  agencia: 'Insights',
  canalFicticio: 'Finanzas en Claro',
  whatsappUrl: 'https://wa.me/5491139375146?text=Vi%20el%20demo%20de%20Creavo%2C%20quiero%20que%20avancemos!',
  moneda: 'USD',
  precioTotal: 5000,
  mantenimientoMensual: 97,
  plazoSemanas: 6,
  primeraVersionSemanas: 2,
  soporteMeses: 1,
} as const

export function formatMonto(n: number, lang: 'es' | 'en'): string {
  const num = new Intl.NumberFormat(lang === 'es' ? 'es-AR' : 'en-US', { maximumFractionDigits: 0 }).format(n)
  return `${MARCA.moneda} ${num}`
}
