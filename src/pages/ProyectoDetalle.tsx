import { useParams } from 'react-router-dom'
import Proyectos from './Proyectos'

export default function ProyectoDetalle() {
  const { id } = useParams()
  return <Proyectos detailId={id} />
}
