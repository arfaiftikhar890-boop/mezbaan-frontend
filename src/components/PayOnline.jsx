import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { goToGateway, startPayment } from '../services/orders'

// Pay-now buttons for an order that is already placed (used on the order page to pay or to try again).
export default function PayOnline({ publicId, gateways, defaultMobile = '' }) {
  const nav = useNavigate()
  const [mobile, setMobile] = useState(defaultMobile)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function pay(provider) {
    setError('')
    setBusy(provider)
    try {
      const r = await startPayment(publicId, provider, provider === 'easypaisa' ? mobile : undefined)
      if (r.action === 'post') return goToGateway(r)
      nav(`/order/${publicId}?payment=${r.paid ? 'paid' : 'failed'}`, { replace: true })
      if (!r.paid) setError(r.message || 'Payment was not completed.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  if (!gateways?.jazzcash && !gateways?.easypaisa) return null

  return (
    <div className="pay-retry">
      {gateways.jazzcash && (
        <button className="btn" disabled={Boolean(busy)} onClick={() => pay('jazzcash')}>
          {busy === 'jazzcash' ? 'Opening JazzCash…' : 'Pay with JazzCash'}
        </button>
      )}
      {gateways.easypaisa && (
        <div className="pay-retry-ep">
          <label className="field">
            <span>Easypaisa mobile number</span>
            <input className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" placeholder="0300 1234567" />
          </label>
          <button className="btn" disabled={Boolean(busy) || mobile.trim().length < 10} onClick={() => pay('easypaisa')}>
            {busy === 'easypaisa' ? 'Waiting for your approval…' : 'Pay with Easypaisa'}
          </button>
          {busy === 'easypaisa' && <p className="muted small">Open your Easypaisa app or check your phone and approve the payment request.</p>}
        </div>
      )}
      {error && (
        <div className="notice notice-warn" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
