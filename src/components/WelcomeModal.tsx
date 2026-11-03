import { useEffect, useState } from 'react'
import { useT } from '@/i18n'
import { useApp } from '@/store/app'
import { Modal } from './ui/Modal'
import { LogoMark } from './Logo'

/** Aparece ~400 ms después del login, una vez por sesión, encima de la Propuesta. */
export function WelcomeModal() {
  const { t } = useT()
  const seen = useApp((s) => s.welcomeSeen)
  const trailer = useApp((s) => s.trailer)
  const mark = useApp((s) => s.markWelcome)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (seen || trailer) return
    const id = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(id)
  }, [seen, trailer])
  return (
    <Modal open={ready && !seen && !trailer} width={520} backdropClose={false} showClose={false} labelledBy="welcome-title" z={85}>
      <div className="flex items-center gap-2.5"><LogoMark size={36} /><span className="text-xl font-extrabold text-accent">Creavo</span></div>
      <h2 id="welcome-title" className="mt-5 text-2xl font-extrabold tracking-tight">{t('welcome.hola')}</h2>
      <p className="mt-3 text-[15px] leading-relaxed">{t('welcome.p1')}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{t('welcome.p2')}</p>
      <p className="mt-3 text-[15px] italic leading-relaxed">{t('welcome.p3')}</p>
      <button data-testid="welcome-close" onClick={mark} className="btn-primary mt-6 w-full">{t('welcome.cta')}</button>
    </Modal>
  )
}
