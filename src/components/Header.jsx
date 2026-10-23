import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { LogoMark } from './Art'
import { getOrderChoice } from './OrderTypeModal'
import { BRAND } from '../config'

export default function Header() {
  const s = useSettings()
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [choice, setChoice] = useState(getOrderChoice)
  const barRef = useRef(null)

  // Shrink the bar and draw the scroll-progress line.
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 20)
        const max = document.documentElement.scrollHeight - window.innerHeight
        barRef.current?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0')
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
    }
  }, [])

  useEffect(() => {
    const f = () => setChoice(getOrderChoice())
    window.addEventListener('order-choice-changed', f)
    return () => window.removeEventListener('order-choice-changed', f)
  }, [])

  const locTop = choice ? (choice.type === 'pickup' ? 'Pick-up from' : 'Deliver to') : 'Delivery or pick-up'
  const locBottom = choice ? `${choice.place}, ${choice.city}` : 'Choose your area'

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={`${BRAND} home`}>
          <LogoMark size={38} />
          <span className="brand-name">{BRAND}</span>
        </Link>

        <button type="button" className="loc-pill" onClick={() => window.dispatchEvent(new Event('open-order-modal'))} aria-label="Change delivery or pick-up location">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
          </svg>
          <span>
            <b>{locTop}</b>
            <small>{locBottom}</small>
          </span>
          <i aria-hidden="true" className="caret" />
        </button>

        <Link to="/cart" className="cart-btn" data-cart-target aria-label={`Cart, ${count} items`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.600h7.400a2 2 0 0 0 2-1.500L20.500 8H6.200" />
            <circle cx="10" cy="20" r="1.200" />
            <circle cx="17" cy="20" r="1.200" />
          </svg>
          <span className="cart-label">Cart</span>
          {count > 0 && (
            <b key={count} className="badge">
              {count}
            </b>
          )}
        </Link>
      </div>
      <span className="scroll-bar" ref={barRef} aria-hidden="true" />
    </header>
  )
}
