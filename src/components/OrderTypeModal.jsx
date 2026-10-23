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
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState(null) // { lat, lng } of the detected position
  const [detected, setDetected] = useState('') // a place name that is not in the AREAS list

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener('open-order-modal', show)
    return () => window.removeEventListener('open-order-modal', show)
  }, [])

  if (!open) return null

  const base = (type === 'pickup' ? BRANCHES[city] : AREAS[city]) || []
  const places = detected && type === 'delivery' && !base.includes(detected) ? [detected, ...base] : base

  function close() {
    sessionStorage.setItem(CLOSED_FOR_SESSION, '1')
    setOpen(false)
  }

  // Ask the browser for the position, turn it into an area name and pre-select it.
  function useCurrentLocation() {
    setError('')
    if (!('geolocation' in navigator)) return setError('Your browser does not support location. Please select your area manually.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
          const g = await r.json()
          const names = [g.locality, g.city, ...(g.localityInfo?.administrative || []).map((a) => a.name), ...(g.localityInfo?.informative || []).map((a) => a.name)].filter(Boolean)
          const areas = AREAS[city] || []
          const hit = areas.find((a) => names.some((n) => n.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(n.toLowerCase())))
          if (type === 'pickup') {
            setError('Location found. Please select the branch you want to pick up from.')
          } else if (hit) {
            setPlace(hit)
          } else {
            const name = g.locality || g.city || 'Current location'
            setDetected(name)
            setPlace(name)
          }
        } catch {
          setDetected('Current location')
          setPlace('Current location')
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setError(err.code === 1 ? 'Location permission was denied. Allow location access in your browser, or select your area manually.' : 'We could not get your location. Please select your area manually.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  }

  function confirm() {
    if (!place) {
      setError(type === 'pickup' ? 'Please select a branch.' : 'Please select your area.')
      return
    }
    localStorage.setItem(KEY, JSON.stringify({ type, city, place, ...(coords && type === 'delivery' ? { lat: coords.lat, lng: coords.lng } : {}) }))
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

        <button type="button" className="om-locate" onClick={useCurrentLocation} disabled={locating}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="8" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          {locating ? 'Finding your location…' : 'Use Current Location'}
        </button>

        <label className="om-field">
          <span>Select city / region</span>
          <select className="input" value={city} onChange={(e) => { setCity(e.target.value); setPlace(''); setDetected('') }}>
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
