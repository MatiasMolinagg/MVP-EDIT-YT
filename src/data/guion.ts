// Plantillas de guion ES/EN por temática. Sin cifras históricas: redacción general.
import type { Texto } from '@/i18n'
import type { Escena, Tematica, ChartKind } from './types'

type Tpl = { titulo: Texto; narracion: Texto; visual: Escena['visual']; chart?: ChartKind; bullets?: Texto[] }

const T = (es: string, en: string): Texto => ({ es, en })

const PLANTILLAS: Record<Exclude<Tematica, 'otra'>, Tpl[]> = {
  historia_finanzas: [
    { visual: 'titulo', titulo: T('Apertura', 'Opening'), narracion: T('El tema de hoy: {tema}. Vamos a ver de dónde viene la forma en que manejamos el dinero y qué podés hacer con eso.', 'Today’s topic: {tema}. We’ll see where the way we handle money comes from, and what you can do with it.') },
    { visual: 'lista', titulo: T('Cómo empezó todo', 'How it all began'), narracion: T('Antes de los bancos, el intercambio marcaba la economía de todos los días. Con el tiempo, {pais} tuvo su propia moneda y sus primeras instituciones financieras.', 'Before banks, trade shaped everyday economic life. Over time, {pais} adopted its own currency and its first financial institutions.'), bullets: [T('Intercambio y comercio local', 'Barter and local trade'), T('Una moneda propia', 'A national currency'), T('Primeros bancos', 'The first banks')] },
    { visual: 'grafico', chart: 'etapas', titulo: T('Etapas y cambios', 'Stages and changes'), narracion: T('La historia económica de {pais} tuvo etapas de crecimiento y etapas difíciles, con inflación y cambios de moneda. Cada etapa cambió cómo ahorran las familias.', 'The economic history of {pais} had stages of growth and hard times, with inflation and currency changes. Each stage changed how families save.') },
    { visual: 'zocalo', titulo: T('La lección que se repite', 'The recurring lesson'), narracion: T('Cuando el dinero pierde valor, las familias que tienen un plan sufren menos. Esa es la idea que nos llevamos de la historia.', 'When money loses value, families with a plan suffer less. That is the idea history leaves us with.') },
    { visual: 'lista', titulo: T('Tus finanzas hoy', 'Your finances today'), narracion: T('Llevemos esto a tu bolsillo: anotá tus ingresos, separá gastos fijos y variables, y definí cuánto ahorrar apenas cobrás.', 'Let’s bring it to your wallet: write down your income, split fixed and variable expenses, and decide how much to save as soon as you get paid.'), bullets: [T('Anotá tus ingresos', 'Write down your income'), T('Separá fijos y variables', 'Split fixed and variable'), T('Ahorrá primero', 'Pay yourself first')] },
    { visual: 'grafico', chart: 'presupuesto', titulo: T('Una regla simple', 'A simple rule'), narracion: T('Una referencia útil es dividir el ingreso en necesidades, gustos y ahorro. No es una ley: es un punto de partida para ajustar a tu realidad.', 'A useful reference is to split income into needs, wants and savings. It is not a law: it is a starting point to adjust to your reality.') },
    { visual: 'titulo', titulo: T('Cierre', 'Closing'), narracion: T('Conocer la historia te ayuda a decidir mejor. Empezá esta semana con un paso: anotá todo lo que gastás durante siete días.', 'Knowing the history helps you decide better. Start this week with one step: write down everything you spend for seven days.') },
  ],
  finanzas_personales: [
    { visual: 'titulo', titulo: T('Apertura', 'Opening'), narracion: T('El tema de hoy: {tema}. Lo vemos paso a paso y sin complicaciones.', 'Today’s topic: {tema}. We’ll go step by step, without complications.') },
    { visual: 'zocalo', titulo: T('Por qué importa', 'Why it matters'), narracion: T('Cuando sabés a dónde va tu dinero, dejás de llegar justo a fin de mes y empezás a decidir vos.', 'When you know where your money goes, you stop scraping by at the end of the month and start making the decisions.') },
    { visual: 'lista', titulo: T('Lo que necesitás', 'What you need'), narracion: T('Solo hacen falta tres cosas: tus ingresos del mes, tus gastos fijos y una lista honesta de los gastos variables.', 'You only need three things: your monthly income, your fixed expenses and an honest list of your variable expenses.'), bullets: [T('Ingresos del mes', 'Monthly income'), T('Gastos fijos', 'Fixed expenses'), T('Gastos variables', 'Variable expenses')] },
    { visual: 'grafico', chart: 'presupuesto', titulo: T('Cómo repartir', 'How to split it'), narracion: T('Una guía práctica es separar necesidades, gustos y ahorro. Ajustá los porcentajes a tu situación, lo importante es que el ahorro exista.', 'A practical guide is to separate needs, wants and savings. Adjust the percentages to your situation; what matters is that savings exist.') },
    { visual: 'lista', titulo: T('Errores comunes', 'Common mistakes'), narracion: T('Los errores más comunes son no anotar los gastos chicos, no tener fondo de emergencia y usar la tarjeta para cubrir el mes.', 'The most common mistakes are not tracking small expenses, having no emergency fund and using the card to cover the month.'), bullets: [T('Gastos chicos sin anotar', 'Untracked small expenses'), T('Sin fondo de emergencia', 'No emergency fund'), T('Tarjeta para llegar a fin de mes', 'Card to cover the month')] },
    { visual: 'grafico', chart: 'ahorro', titulo: T('Constancia', 'Consistency'), narracion: T('Un monto chico que se repite todos los meses termina pesando más que un esfuerzo grande que hacés una sola vez.', 'A small amount repeated every month ends up weighing more than one big effort you make only once.') },
    { visual: 'titulo', titulo: T('Cierre', 'Closing'), narracion: T('Tu tarea para hoy: armá tu primer presupuesto con lo que viste y revisalo en una semana.', 'Your homework for today: build your first budget with what you saw and review it in a week.') },
  ],
  ahorro_inversion: [
    { visual: 'titulo', titulo: T('Apertura', 'Opening'), narracion: T('El tema de hoy: {tema}. Cómo pasar de guardar lo que sobra a ahorrar con un objetivo.', 'Today’s topic: {tema}. How to go from keeping whatever is left to saving with a goal.') },
    { visual: 'zocalo', titulo: T('Ahorrar no es invertir', 'Saving is not investing'), narracion: T('Ahorrar es apartar dinero; invertir es ponerlo a trabajar asumiendo algún riesgo. Primero se ahorra, después se invierte.', 'Saving is setting money aside; investing is putting it to work while taking on some risk. Save first, invest later.') },
    { visual: 'lista', titulo: T('Primero, la base', 'First, the foundation'), narracion: T('Antes de invertir conviene tener un fondo de emergencia, deudas caras bajo control y un objetivo con fecha.', 'Before investing, it helps to have an emergency fund, expensive debt under control and a goal with a date.'), bullets: [T('Fondo de emergencia', 'Emergency fund'), T('Deudas caras controladas', 'Expensive debt under control'), T('Objetivo con fecha', 'A goal with a date')] },
    { visual: 'grafico', chart: 'ahorro', titulo: T('El efecto del tiempo', 'The effect of time'), narracion: T('Cuando los rendimientos se reinvierten, el crecimiento se acelera con los años. Por eso empezar temprano importa más que empezar con mucho.', 'When returns are reinvested, growth accelerates over the years. That is why starting early matters more than starting big.') },
    { visual: 'lista', titulo: T('Preguntas antes de invertir', 'Questions before investing'), narracion: T('Antes de poner tu dinero en algo, preguntate: ¿lo entiendo?, ¿cuándo lo voy a necesitar?, ¿qué pasa si baja?', 'Before putting your money into something, ask yourself: do I understand it? When will I need it? What happens if it drops?'), bullets: [T('¿Lo entiendo?', 'Do I understand it?'), T('¿Cuándo lo necesito?', 'When will I need it?'), T('¿Qué pasa si baja?', 'What if it drops?')] },
    { visual: 'zocalo', titulo: T('Cuidado con las promesas', 'Beware of promises'), narracion: T('Desconfiá de cualquier propuesta que asegure ganancias rápidas y sin riesgo. Esa garantía no existe.', 'Be wary of any offer that guarantees quick, risk-free gains. That guarantee does not exist.') },
    { visual: 'titulo', titulo: T('Cierre', 'Closing'), narracion: T('Definí hoy un objetivo de ahorro y un monto mensual. El hábito es lo que hace la diferencia.', 'Set a savings goal and a monthly amount today. The habit is what makes the difference.') },
  ],
  deudas_credito: [
    { visual: 'titulo', titulo: T('Apertura', 'Opening'), narracion: T('El tema de hoy: {tema}. Con un plan concreto para recuperar el control.', 'Today’s topic: {tema}. With a concrete plan to get back in control.') },
    { visual: 'lista', titulo: T('Hacé la lista', 'Make the list'), narracion: T('El primer paso es anotar todas tus deudas: a quién le debés, cuánto, la cuota mínima y la tasa de interés.', 'The first step is to write down all your debts: who you owe, how much, the minimum payment and the interest rate.'), bullets: [T('A quién le debés', 'Who you owe'), T('Saldo y cuota mínima', 'Balance and minimum payment'), T('Tasa de interés', 'Interest rate')] },
    { visual: 'grafico', chart: 'bola', titulo: T('Método bola de nieve', 'Snowball method'), narracion: T('Con el método bola de nieve pagás primero la deuda más chica. Cuando la cancelás, sumás esa cuota a la siguiente y el pago crece.', 'With the snowball method you pay the smallest debt first. When it’s gone, you add that payment to the next one and the payment grows.') },
    { visual: 'zocalo', titulo: T('La alternativa avalancha', 'The avalanche alternative'), narracion: T('Otra opción es atacar primero la deuda con la tasa más alta. Ahorra intereses, aunque los logros se ven más tarde.', 'Another option is to tackle the highest-rate debt first. It saves interest, although the wins show up later.') },
    { visual: 'lista', titulo: T('Usar el crédito a favor', 'Using credit in your favor'), narracion: T('El crédito bien usado te ayuda: pagá el total de la tarjeta, no te acerques al límite y evitá adelantos de efectivo.', 'Credit used well helps you: pay your card in full, stay away from the limit and avoid cash advances.'), bullets: [T('Pagá el total', 'Pay in full'), T('Lejos del límite', 'Stay away from the limit'), T('Sin adelantos de efectivo', 'No cash advances')] },
    { visual: 'grafico', chart: 'presupuesto', titulo: T('Un lugar en el presupuesto', 'A place in the budget'), narracion: T('Reservá una parte fija del presupuesto para deudas, así el plan no depende de lo que sobre.', 'Set aside a fixed part of the budget for debt, so the plan doesn’t depend on what’s left over.') },
    { visual: 'titulo', titulo: T('Cierre', 'Closing'), narracion: T('Elegí hoy tu método y anotá la primera deuda que vas a atacar. Cada pago cuenta.', 'Pick your method today and write down the first debt you’ll tackle. Every payment counts.') },
  ],
}

const PAISES: { re: RegExp; t: Texto }[] = [
  { re: /nicaragu/i, t: T('Nicaragua', 'Nicaragua') },
  { re: /estados unidos|ee\.? ?uu|united states|\busa?\b/i, t: T('Estados Unidos', 'the United States') },
  { re: /m[eé]xico/i, t: T('México', 'Mexico') },
  { re: /honduras/i, t: T('Honduras', 'Honduras') },
  { re: /costa rica/i, t: T('Costa Rica', 'Costa Rica') },
  { re: /el salvador/i, t: T('El Salvador', 'El Salvador') },
  { re: /guatemala/i, t: T('Guatemala', 'Guatemala') },
  { re: /colombia/i, t: T('Colombia', 'Colombia') },
  { re: /argentin/i, t: T('Argentina', 'Argentina') },
]

export function detectarPais(idea: string): Texto {
  return PAISES.find((p) => p.re.test(idea))?.t ?? T('tu país', 'your country')
}

/** Elige plantilla por chip y, si es "Otra", por palabras clave de la idea. */
export function elegirPlantilla(tematica: Tematica, idea: string): Exclude<Tematica, 'otra'> {
  const s = idea.toLowerCase()
  if (/histori|history|orig|pa[ií]s|country/.test(s) && tematica !== 'deudas_credito') return tematica === 'otra' || tematica === 'historia_finanzas' || tematica === 'finanzas_personales' ? 'historia_finanzas' : tematica
  if (tematica !== 'otra') return tematica
  if (/deud|cr[eé]dit|tarjeta|debt|credit|loan|pr[eé]stamo/.test(s)) return 'deudas_credito'
  if (/ahorr|invers|invert|inter[eé]s|saving|invest/.test(s)) return 'ahorro_inversion'
  return 'finanzas_personales'
}

/** Título derivado de la idea, en las palabras del cliente. */
export function derivarTitulo(idea: string): string {
  let s = idea.trim().replace(/\s+/g, ' ')
  s = s.replace(/^(yo\s+)?(necesito|quiero|quisiera|me gustar[ií]a|hagamos|vamos a)\s+(crear|hacer|armar|grabar)?\s*/i, '')
  s = s.replace(/^(un|una)\s+(video|vídeo)\s*(de\s+finanzas(\s+personales)?\s*,?\s*)?(de|sobre|acerca de|que explique|que hable de)?\s*/i, '')
  s = s.replace(/^i\s+(need|want|would like)\s+(to\s+(create|make)\s+)?(a\s+)?video\s+(about|on|explaining)?\s*/i, '')
  s = s.replace(/^(la|el|los|las|the)\s+(?=\S+\s+\S+)/i, '')
  s = s.replace(/[.!?¡¿,;:]+$/g, '').trim()
  if (s.length > 100) s = s.slice(0, 100).replace(/\s+\S*$/, '').replace(/\s+(y|de|del|la|las|el|los|a|en|con|and|of|the|to|in|with)$/i, '')
  if (s.length < 6) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fill(t: Texto, vars: { tema: Texto; pais: Texto }): Texto {
  const rep = (s: string, l: 'es' | 'en') => s.replace(/\{tema\}/g, vars.tema[l]).replace(/\{pais\}/g, vars.pais[l])
  return { es: rep(t.es, 'es'), en: rep(t.en, 'en') }
}

const TITULOS_BASE: Record<Exclude<Tematica, 'otra'>, Texto> = {
  historia_finanzas: T('La historia de las finanzas de tu país', 'The financial history of your country'),
  finanzas_personales: T('Cómo ordenar tus finanzas personales', 'How to organize your personal finances'),
  ahorro_inversion: T('Ahorro e inversión para empezar', 'Saving and investing to get started'),
  deudas_credito: T('Cómo salir de deudas', 'How to get out of debt'),
}

export interface GuionGenerado { titulo: Texto; escenas: Escena[]; plantilla: Exclude<Tematica, 'otra'> }

/** Genera un guion de 7 escenas a partir de la idea. `titulo` opcional fuerza el título bilingüe (mock). */
export function generarGuion(idea: string, tematica: Tematica, opts: { titulo?: Texto; seed?: string; variante?: number } = {}): GuionGenerado {
  const plantilla = elegirPlantilla(tematica, idea)
  const derivado = derivarTitulo(idea)
  const titulo: Texto = opts.titulo ?? (derivado ? { es: derivado, en: derivado } : TITULOS_BASE[plantilla])
  const tema: Texto = { es: `“${titulo.es}”`, en: `“${titulo.en}”` }
  const pais = detectarPais(idea)
  const seed = opts.seed ?? 'g'
  let tpls = PLANTILLAS[plantilla]
  if (opts.variante && opts.variante % 2 === 1) {
    // Regenerar: reordena las escenas del medio para que se note el cambio.
    tpls = [tpls[0], tpls[2], tpls[1], tpls[4], tpls[3], tpls[5], tpls[6]]
  }
  const escenas: Escena[] = tpls.map((tp, i) => ({
    id: `${seed}-e${i + 1}`,
    visual: tp.visual,
    chart: tp.chart,
    bullets: tp.bullets,
    titulo: i === 0 ? titulo : tp.titulo,
    narracion: fill(tp.narracion, { tema, pais }),
  }))
  return { titulo, escenas, plantilla }
}
