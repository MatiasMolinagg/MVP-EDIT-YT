import { create } from 'zustand'
import type { Lang, Texto, Vars } from '@/i18n'

type Theme = 'light' | 'dark'
export type Tone = 'ok' | 'info' | 'warn' | 'error'
export interface Toast { id: number; key: string; vars?: Vars; tone: Tone }
export interface Notif { id: number; titleKey: string; bodyKey: string; vars?: Vars; fechaMs: number; read: boolean; to?: string }
export interface Preview { modulo: number; view: string; titulo: Texto }

const ls = {
  get(k: string) { try { return localStorage.getItem(k) } catch { return null } },
  set(k: string, v: string) { try { localStorage.setItem(k, v) } catch { /* sin storage */ } },
}
const ss = {
  get(k: string) { try { return sessionStorage.getItem(k) } catch { return null } },
  set(k: string, v: string) { try { sessionStorage.setItem(k, v) } catch { /* sin storage */ } },
  del(k: string) { try { sessionStorage.removeItem(k) } catch { /* sin storage */ } },
}

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', t === 'dark' ? '#09090b' : '#6366f1')
}

interface AppState {
  lang: Lang
  theme: Theme
  session: boolean
  welcomeSeen: boolean
  welcomePending: boolean
  toasts: Toast[]
  notifs: Notif[]
  preview: Preview | null
  moduloDestacado: number | null
  bannersCollapsed: string[]
  tourRun: number
  tourOpen: boolean
  trailer: boolean
  agentOpen: boolean
  setLang: (l: Lang) => void
  toggleTheme: () => void
  login: () => void
  logout: () => void
  markWelcome: () => void
  toast: (key: string, vars?: Vars, tone?: Tone) => void
  dismissToast: (id: number) => void
  addNotif: (n: Omit<Notif, 'id' | 'fechaMs' | 'read'>) => void
  markAllRead: () => void
  abrirPreview: (modulo: number, view: string, titulo: Texto) => void
  cerrarPreview: () => void
  cancelarPreview: () => void
  trailerSession: (v: boolean) => void
  limpiarDestacado: () => void
  collapseBanner: (id: string, collapsed: boolean) => void
  startTour: () => void
  setTourOpen: (v: boolean) => void
  setTrailer: (v: boolean) => void
  setAgentOpen: (v: boolean) => void
}

const initialTheme: Theme = ls.get('creavo_theme') === 'dark' ? 'dark' : 'light'
const initialLang: Lang = ls.get('creavo_lang') === 'en' ? 'en' : 'es'
let seq = 1
const now = Date.now()

export const useApp = create<AppState>((set, get) => ({
  lang: initialLang,
  theme: initialTheme,
  session: ss.get('creavo_session') === '1',
  welcomeSeen: ss.get('welcome_modal_seen') === '1',
  welcomePending: false,
  toasts: [],
  notifs: [
    { id: seq++, titleKey: 'notif.seed.publicado.title', bodyKey: 'notif.seed.publicado.body', fechaMs: now - 1000 * 60 * 60 * 26, read: false, to: '/proyectos/v-001' },
    { id: seq++, titleKey: 'notif.seed.error.title', bodyKey: 'notif.seed.error.body', fechaMs: now - 1000 * 60 * 60 * 5, read: false, to: '/proyectos/v-006' },
  ],
  preview: null,
  moduloDestacado: null,
  bannersCollapsed: JSON.parse(ss.get('creavo_banners') || '[]'),
  tourRun: 0,
  tourOpen: false,
  trailer: false,
  agentOpen: false,
  setLang: (l) => { ls.set('creavo_lang', l); document.documentElement.lang = l; set({ lang: l }) },
  toggleTheme: () => { const t: Theme = get().theme === 'dark' ? 'light' : 'dark'; ls.set('creavo_theme', t); applyTheme(t); set({ theme: t }) },
  login: () => { ss.set('creavo_session', '1'); set({ session: true, welcomePending: !get().welcomeSeen }) },
  logout: () => { ss.del('creavo_session'); set({ session: false, preview: null, agentOpen: false, tourOpen: false }) },
  markWelcome: () => { ss.set('welcome_modal_seen', '1'); set({ welcomeSeen: true, welcomePending: false }) },
  toast: (key, vars, tone = 'ok') => {
    const id = seq++
    set({ toasts: [...get().toasts.slice(-2), { id, key, vars, tone }] })
    setTimeout(() => get().dismissToast(id), 3600)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  addNotif: (n) => set({ notifs: [{ ...n, id: seq++, fechaMs: Date.now(), read: false }, ...get().notifs] }),
  markAllRead: () => set({ notifs: get().notifs.map((n) => ({ ...n, read: true })) }),
  abrirPreview: (modulo, view, titulo) => set({ preview: { modulo, view, titulo } }),
  cerrarPreview: () => { const p = get().preview; set({ preview: null, moduloDestacado: p ? p.modulo : null }) },
  cancelarPreview: () => { if (get().preview) set({ preview: null }) },
  trailerSession: (v) => set({ session: v || ss.get('creavo_session') === '1' }),
  limpiarDestacado: () => set({ moduloDestacado: null }),
  collapseBanner: (id, collapsed) => {
    const list = collapsed ? [...new Set([...get().bannersCollapsed, id])] : get().bannersCollapsed.filter((b) => b !== id)
    ss.set('creavo_banners', JSON.stringify(list)); set({ bannersCollapsed: list })
  },
  startTour: () => set({ tourRun: get().tourRun + 1, tourOpen: true, agentOpen: false }),
  setTourOpen: (v) => set({ tourOpen: v }),
  setTrailer: (v) => set({ trailer: v, agentOpen: false, tourOpen: false, preview: null }),
  setAgentOpen: (v) => set({ agentOpen: v }),
}))
