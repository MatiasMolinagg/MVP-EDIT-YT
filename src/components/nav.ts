import { FileText, Clapperboard, Film, NotebookPen, Tv, Cpu, type LucideIcon } from 'lucide-react'

export interface NavItem { id: string; to: string; key: string; short?: string; icon: LucideIcon; match: string }
export const NAV_GROUPS: { key: string; items: NavItem[] }[] = [
  { key: 'nav.grupo.comercial', items: [{ id: 'propuesta', to: '/propuesta', key: 'nav.propuesta', icon: FileText, match: '/propuesta' }] },
  {
    key: 'nav.grupo.estudio',
    items: [
      { id: 'crear', to: '/crear', key: 'nav.crear', short: 'nav.crear.corto', icon: Clapperboard, match: '/crear' },
      { id: 'proyectos', to: '/proyectos', key: 'nav.proyectos', short: 'nav.proyectos.corto', icon: Film, match: '/proyectos' },
      { id: 'borradores', to: '/borradores', key: 'nav.borradores', icon: NotebookPen, match: '/borradores' },
    ],
  },
  {
    key: 'nav.grupo.conexiones',
    items: [
      { id: 'canal', to: '/canal', key: 'nav.canal', short: 'nav.canal.corto', icon: Tv, match: '/canal' },
      { id: 'proveedores', to: '/configuracion/proveedores', key: 'nav.proveedores', icon: Cpu, match: '/configuracion' },
    ],
  },
]
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)
export const TABS = ['propuesta', 'crear', 'proyectos', 'canal']
export const SHEET_ITEMS = ['borradores', 'proveedores']
export const isActive = (pathname: string, item: NavItem) => pathname === item.match || pathname.startsWith(item.match + '/')
