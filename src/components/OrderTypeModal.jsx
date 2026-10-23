import { useEffect, useState } from 'react'
import { AREAS, BRANCHES, CITIES } from '../config'

const KEY = 'mezbaan-order-choice'
const CLOSED_FOR_SESSION = 'mezbaan-popup-closed'

export function getOrderChoice() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export default function OrderTypeModal() {
  const [open, setOpen] = useState(() => !getOrderChoice() && !sessionStorage.getItem(CLOSED_FOR_SESSION))
  const [type, setType] = useState('delivery')
  const [city, setCity] = useState(CITIES[0])
  const [place, setPlace] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('open-order-modal', show)
    return () => window.removeEventListener('open-order-modal', show)
  }, [])

  if (!open) return null

  const places = (type === 'pickup' ? BRANCHES[city] : AREAS[city]) || []

  function close() {
    sessionStorage.setItem(CLOSED_FOR_SESSION, '1')
    setOpen(false)
  }

  function confirm() {
    if (!place) {
      setError(type === 'pickup' ? 'Please select a branch.' : 'Please select your area.')
      return
    }
    localStorage.setItem(KEY, JSON.stringify({ type, city, place }))
    window.dispatchEvent(new Event('order-choice-changed'))
    setOpen(false)
  }

  return (
    <div className="om-backdrop" role="dialog" aria-modal="true" aria-label="Choose order type">
      <div className="om-card">
        <button type="button" className="om-close" onClick={close} aria-label="Close">
          ×
        </button>
        <img src="/mezbaan-logo.png" alt="" className="om-logo" />
        <h2>Select your order type</h2>

        <div className="om-seg" role="radiogroup" aria-label="Order type">
          {[
            ['delivery', 'Delivery'],
            ['pickup', 'Pick-up'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              className={type === value ? 'on' : ''}
              onClick={() => {
                setType(value)
                setPlace('')
                setError('')
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="om-field">
          <span>Select city / region</span>
          <select className="input" value={city} onChange={(e) => { setCity(e.target.value); setPlace('') }}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="om-field">
          <span>{type === 'pickup' ? 'Which branch would you like to pick up from?' : 'Select area / sub region'}</span>
          <select className="input" value={place} onChange={(e) => { setPlace(e.target.value); setError('') }}>
            <option value="">{type === 'pickup' ? 'Select branch' : 'Select area'}</option>
            {places.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="om-error">{error}</p>}
        <button type="button" className="btn btn-lg" onClick={confirm}>
          Select
        </button>
      </div>
    </div>
  )
}
