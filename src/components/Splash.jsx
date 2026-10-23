import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { BRAND } from '../config'

const KEY = 'splash-seen'

// One short intro per browser session: logo pops in, the name rises letter by letter, then the curtain lifts.
export default function Splash() {
  const s = useSettings()
  const [name] = useState(() => BRAND)
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem(KEY) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!show) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* private mode: the intro just plays again next visit */
    }
    const t = setTimeout(() => {
      setShow(false)
      document.documentElement.classList.remove('has-splash')
    }, 2500)
    return () => clearTimeout(t)
  }, [show])

  if (!show) return null
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-inner">
        <div className="splash-logo-wrap">
          <img className="splash-logo" src="/mezbaan-logo.png" alt="" />
        </div>
        <div className="splash-name">
          {[...name].map((ch, i) => (
            <span key={i} style={{ '--i': i }}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
