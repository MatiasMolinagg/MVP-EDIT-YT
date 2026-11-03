import { useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from '@/store/app'
import { Shell } from '@/components/Shell'
import { Toasts } from '@/components/Toasts'
import { JobWatcher } from '@/components/JobWatcher'
import Login from '@/pages/Login'
import Propuesta from '@/pages/Propuesta'
import Crear from '@/pages/crear/Crear'
import Proyectos from '@/pages/Proyectos'
import ProyectoDetalle from '@/pages/ProyectoDetalle'
import Borradores from '@/pages/Borradores'
import Canal from '@/pages/Canal'
import Proveedores from '@/pages/Proveedores'

function RequireAuth({ children }: { children: ReactNode }) {
  const session = useApp((s) => s.session)
  return session ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const session = useApp((s) => s.session)
  const lang = useApp((s) => s.lang)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return (
    <>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/propuesta" replace /> : <Login />} />
        <Route element={<RequireAuth><Shell /></RequireAuth>}>
          <Route path="/propuesta" element={<Propuesta />} />
          <Route path="/crear" element={<Crear etapa="idea" />} />
          <Route path="/crear/:id/guion" element={<Crear etapa="guion" />} />
          <Route path="/crear/:id/generacion" element={<Crear etapa="generacion" />} />
          <Route path="/crear/:id/resultado" element={<Crear etapa="resultado" />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="/borradores" element={<Borradores />} />
          <Route path="/canal" element={<Canal />} />
          <Route path="/configuracion/proveedores" element={<Proveedores />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? '/propuesta' : '/login'} replace />} />
      </Routes>
      <Toasts />
      {session && <JobWatcher />}
    </>
  )
}
