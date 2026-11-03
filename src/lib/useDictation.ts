import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from '@/i18n'
import { IDEA_EJEMPLO } from '@/data/mock'

type Mode = 'idle' | 'real' | 'sim'
/* eslint-disable @typescript-eslint/no-explicit-any */
type SR = any

/**
 * Dictado real con SpeechRecognition (interimResults) y fallback simulado
 * si no hay soporte o se niega el permiso. Nunca escribe errores en consola.
 */
export function useDictation(lang: Lang, getBase: () => string, onText: (s: string) => void) {
  const [mode, setMode] = useState<Mode>('idle')
  const [usedSim, setUsedSim] = useState(false)
  const recRef = useRef<SR | null>(null)
  const simRef = useRef<number | null>(null)
  const gotResult = useRef(false)
  const onTextRef = useRef(onText)
  const baseRef = useRef(getBase)
  onTextRef.current = onText
  baseRef.current = getBase

  const stopSim = () => { if (simRef.current) { clearInterval(simRef.current); simRef.current = null } }

  const simulate = useCallback(() => {
    stopSim()
    setUsedSim(true)
    setMode('sim')
    const base = baseRef.current().trim()
    const words = IDEA_EJEMPLO[lang].split(' ')
    let i = 0
    simRef.current = window.setInterval(() => {
      i++
      onTextRef.current((base ? base + ' ' : '') + words.slice(0, i).join(' '))
      if (i >= words.length) { stopSim(); setMode('idle') }
    }, 130)
  }, [lang])

  const stop = useCallback(() => {
    stopSim()
    try { recRef.current?.stop() } catch { /* ya detenido */ }
    recRef.current = null
    setMode('idle')
  }, [])

  const start = useCallback(() => {
    const w = window as any
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) { simulate(); return }
    let rec: SR
    try {
      rec = new Ctor()
    } catch { simulate(); return }
    const base = baseRef.current().trim()
    gotResult.current = false
    rec.lang = lang === 'es' ? 'es-419' : 'en-US'
    rec.interimResults = true
    rec.continuous = true
    rec.onresult = (e: any) => {
      gotResult.current = true
      let txt = ''
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript
      onTextRef.current((base ? base + ' ' : '') + txt.trim())
    }
    rec.onerror = (e: any) => {
      recRef.current = null
      if (!gotResult.current && e?.error !== 'aborted' && e?.error !== 'no-speech') simulate()
      else setMode('idle')
    }
    rec.onend = () => { if (recRef.current === rec) { recRef.current = null; setMode('idle') } }
    try {
      rec.start()
      recRef.current = rec
      setMode('real')
    } catch { simulate() }
  }, [lang, simulate])

  useEffect(() => () => { stopSim(); try { recRef.current?.abort() } catch { /* nada */ } }, [])

  return { mode, recording: mode !== 'idle', usedSim, start, stop }
}
