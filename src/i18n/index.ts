import { useCallback } from 'react'
import { useApp } from '@/store/app'
import { dictApp } from './dict-app'
import { dictEstudio } from './dict-estudio'
import { dictConexiones } from './dict-conexiones'
import { dictPropuesta } from './dict-propuesta'
import { dictGuia } from './dict-guia'

export type Lang = 'es' | 'en'
export type Texto = { es: string; en: string }
export type Vars = Record<string, string | number | Texto>
export type Dict = Record<string, readonly [string, string]>

// Cada clave vive en UN solo archivo. `npm run qa:i18n` verifica duplicados entre archivos.
const DICT: Dict = { ...dictApp, ...dictEstudio, ...dictConexiones, ...dictPropuesta, ...dictGuia }

const warned = new Set<string>()

export function hasKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(DICT, key)
}

export function txt(v: Texto | string, lang: Lang): string {
  return typeof v === 'string' ? v : v[lang]
}

/** Traducción pura: usable en efectos, stores y fuera de React. */
export function tr(key: string, lang: Lang, vars?: Vars): string {
  const entry = DICT[key]
  let s: string
  if (!entry) {
    if (!warned.has(key)) {
      warned.add(key)
      console.warn(`[i18n] clave faltante: "${key}"`)
    }
    s = key
  } else s = entry[lang === 'es' ? 0 : 1]
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => {
    if (!(k in vars)) return m
    const v = vars[k]
    return typeof v === 'object' ? v[lang] : String(v)
  })
  return s
}

export function useLang(): Lang {
  return useApp((s) => s.lang)
}

/** Hook para componentes. NO pongas `t` en dependencias de useEffect: usá `tr(clave, lang)`. */
export function useT() {
  const lang = useLang()
  const t = useCallback((key: string, vars?: Vars) => tr(key, lang, vars), [lang])
  const L = useCallback((v: Texto | string) => txt(v, lang), [lang])
  return { t, L, lang }
}
