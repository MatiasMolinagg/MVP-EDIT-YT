import { useParams } from 'react-router-dom'
export default function Crear({ etapa }: { etapa: 'idea' | 'guion' | 'generacion' | 'resultado' }) {
  const { id } = useParams()
  return <div data-view={`crear-${etapa}`} className="pb-app">Crear {etapa} {id} placeholder content for layout testing.</div>
}
