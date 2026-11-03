import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, BarChart, Bar, AreaChart, Area, Legend } from 'recharts'
import { useT } from '@/i18n'
import type { ChartKind } from '@/data/types'

const C = ['#818cf8', '#c4b5fd', '#34d399', '#fbbf24']

/** Gráficos ilustrativos animados (sin datos reales ni métricas de YouTube). */
export function SceneChart({ kind, k }: { kind: ChartKind; k: string }) {
  const { t } = useT()
  const axis = { stroke: 'rgba(255,255,255,.55)', fontSize: 11, tickLine: false, axisLine: false }
  const legend = <Legend wrapperStyle={{ fontSize: 11, color: '#e0e7ff' }} iconSize={8} />
  if (kind === 'presupuesto') {
    const data = [{ n: t('res.chart.necesidades'), v: 50 }, { n: t('res.chart.gustos'), v: 30 }, { n: t('res.chart.ahorro'), v: 20 }]
    return (
      <ResponsiveContainer width="100%" height="100%" key={k}>
        <PieChart>
          <Pie data={data} dataKey="v" nameKey="n" innerRadius="45%" outerRadius="80%" paddingAngle={3} stroke="none" animationDuration={1100}>
            {data.map((_, i) => <Cell key={i} fill={C[i]} />)}
          </Pie>
          {legend}
        </PieChart>
      </ResponsiveContainer>
    )
  }
  if (kind === 'etapas') {
    const vals = [55, 62, 40, 48, 35, 58, 66]
    const data = vals.map((v, i) => ({ n: t('res.chart.etapa', { n: i + 1 }), v }))
    return (
      <ResponsiveContainer width="100%" height="100%" key={k}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
          <XAxis dataKey="n" {...axis} interval="preserveStartEnd" />
          <Line type="monotone" dataKey="v" name={t('res.chart.estabilidad')} stroke="#a5b4fc" strokeWidth={3} dot={{ r: 3, fill: '#fff' }} animationDuration={1400} />
          {legend}
        </LineChart>
      </ResponsiveContainer>
    )
  }
  if (kind === 'bola') {
    const data = [1, 2, 3, 4].map((i) => ({ n: t('res.chart.deuda', { n: i }), pago: 20 + i * 18, saldo: 30 + i * 22 }))
    return (
      <ResponsiveContainer width="100%" height="100%" key={k}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
          <XAxis dataKey="n" {...axis} />
          <Bar dataKey="saldo" name={t('res.chart.saldo')} fill="rgba(255,255,255,.25)" radius={[6, 6, 0, 0]} animationDuration={1000} />
          <Bar dataKey="pago" name={t('res.chart.pago')} fill="#34d399" radius={[6, 6, 0, 0]} animationDuration={1300} />
          {legend}
        </BarChart>
      </ResponsiveContainer>
    )
  }
  const data = Array.from({ length: 10 }, (_, i) => ({ n: t('res.chart.anio', { n: i + 1 }), a: (i + 1) * 10, b: Math.round(10 * ((Math.pow(1.07, i + 1) - 1) / 0.07)) }))
  return (
    <ResponsiveContainer width="100%" height="100%" key={k}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
        <XAxis dataKey="n" {...axis} interval="preserveStartEnd" />
        <Area type="monotone" dataKey="b" name={t('res.chart.total')} stroke="#34d399" fill="rgba(52,211,153,.35)" strokeWidth={2.5} animationDuration={1400} />
        <Area type="monotone" dataKey="a" name={t('res.chart.aportes')} stroke="#a5b4fc" fill="rgba(165,180,252,.3)" strokeWidth={2.5} animationDuration={1200} />
        {legend}
      </AreaChart>
    </ResponsiveContainer>
  )
}
