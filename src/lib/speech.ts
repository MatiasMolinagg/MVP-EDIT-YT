import type { VozId } from '@/data/types'

const FEM: VozId[] = ['sofia', 'valentina']
export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

/** Habla con la voz del navegador. Devuelve false si no hay soporte. */
export function speak(text: string, lang: 'es' | 'en', voz: VozId, onEnd?: () => void): boolean {
  if (!speechSupported()) return false
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'es' ? 'es-419' : 'en-US'
    const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang))
    if (voices.length) u.voice = voices[(FEM.includes(voz) ? 0 : 1) % voices.length]
    u.pitch = FEM.includes(voz) ? 1.1 : 0.85
    u.rate = voz === 'andres' ? 0.92 : voz === 'valentina' ? 1.08 : 1
    if (onEnd) { u.onend = onEnd; u.onerror = onEnd }
    synth.speak(u)
    return true
  } catch { return false }
}
export function stopSpeech() {
  try { if (speechSupported()) window.speechSynthesis.cancel() } catch { /* nada */ }
}
