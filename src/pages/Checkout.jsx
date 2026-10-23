import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { createOrder, goToGateway, startPayment } from '../services/orders'
import { cleanPhone, computeTotals, isValidPkPhone, money } from '../lib/utils'
import HelpLine from '../components/HelpLine'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const s = useSettings()
  const nav = useNavigate()

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '', orderType: 'delivery' })
  const [method, setMethod] = useState('')
  const [pay, setPay] = useState({ tid: '', sender: '', epMobile: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const g = s.gateways || {}
  const methods = [
    s.codEnabled && { id: 'cod', label: form.orderType === 'delivery' ? 'Cash on delivery' : 'Pay at the café', hint: 'Pay when you receive your order' },
    g.jazzcash && { id: 'jazzcash', label: 'JazzCash', hint: 'Pay by JazzCash wallet or card, instantly confirmed' },
    g.easypaisa && { id: 'easypaisa', label: 'Easypaisa', hint: 'Approve the payment in your Easypaisa app' },
    s.easypaisaEnabled && { id: 'wallet', label: 'Send to our JazzCash / Easypaisa number', hint: 'Transfer, then enter the transaction ID' },
    s.bankEnabled && { id: 'bank', label: 'Bank transfer', hint: 'Transfer, then enter the transaction ID' },
  ].filter(Boolean)
  const chosen = methods.some((m) => m.id === method) ? method : methods[0]?.id || ''

  if (items.length === 0) {
    return (
      <div className="container section empty">
        <h1 className="page-title">Nothing to check out</h1>
        <Link to="/menu" className="btn">
          Browse the menu
        </Link>
      </div>
    )
  }

  const deliveryFee = form.orderType === 'delivery' ? Number(s.deliveryFee) || 0 : 0
  const { tax, total } = computeTotals({ subtotal, taxRate: s.taxRate, deliveryFee })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    if (!s.acceptingOrders) return 'We are not taking online orders right now.'
    if (s.minOrder > 0 && subtotal < s.minOrder) return `Minimum order is ${money(s.minOrder, s.currency)}.`
    if (form.name.trim().length < 2) return 'Please enter your name.'
    if (!isValidPkPhone(form.phone)) return 'Please enter a valid mobile number, e.g. 0300 1234567.'
    if (form.orderType === 'delivery' && form.address.trim().length < 8) return 'Please enter your full delivery address.'
    if (!chosen) return 'No payment method is available. Please contact the café.'
    if ((chosen === 'wallet' || chosen === 'bank') && pay.tid.trim().length < 6) return 'Please enter the transaction ID (TID) of your payment.'
    if (chosen === 'easypaisa' && !isValidPkPhone(pay.epMobile || form.phone)) return 'Please enter your Easypaisa mobile number, e.g. 0300 1234567.'
    return ''
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) return setError(msg)
    setBusy(true)
    try {
      const { publicId } = await createOrder({
        orderType: form.orderType,
        customer: { name: form.name.trim(), phone: cleanPhone(form.phone), email: form.email.trim(), address: form.orderType === 'delivery' ? form.address.trim() : '' },
        items,
        notes: form.notes.trim(),
        paymentMethod: chosen,
        paymentRef: chosen === 'wallet' || chosen === 'bank' ? { tid: pay.tid.trim(), sender: pay.sender.trim() } : undefined,
      })
      clear()
      if (chosen === 'jazzcash' || chosen === 'easypaisa') {
        try {
          const r = await startPayment(publicId, chosen, chosen === 'easypaisa' ? cleanPhone(pay.epMobile || form.phone) : undefined)
          if (r.action === 'post') return goToGateway(r)
          nav(`/order/${publicId}?payment=${r.paid ? 'paid' : 'failed'}`)
          return
        } catch {
          // The order is saved. The order page offers "Pay now" so the customer can try again.
          nav(`/order/${publicId}?payment=failed`)
          return
        }
      }
      nav(`/order/${publicId}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container section checkout">
      <h1 className="page-title">Checkout</h1>
      <form className="checkout-grid" onSubmit={submit} noValidate>
        <div className="stack">
          <div className="card pad">
            <h2>Your details</h2>
            <div className="seg" role="radiogroup" aria-label="Order type">
              {['delivery', 'pickup'].map((t) => (
                <button type="button" key={t} role="radio" aria-checked={form.orderType === t} className={form.orderType === t ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, orderType: t }))}>
                  {t === 'delivery' ? 'Delivery' : 'Pickup'}
                </button>
              ))}
            </div>
            <label className="field">
              <span>Full name</span>
              <input className="input" value={form.name} onChange={set('name')} autoComplete="name" required />
            </label>
            <label className="field">
              <span>Mobile number</span>
              <input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="0300 1234567" required />
            </label>
            <label className="field">
              <span>Email (optional, for your order confirmation)</span>
              <input className="input" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
            </label>
            {form.orderType === 'delivery' ? (
              <label className="field">
                <span>Delivery address</span>
                <textarea className="input" rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="House / flat, street, area, landmark" required />
              </label>
            ) : (
              <p className="muted small">Pickup from: {s.address}</p>
            )}
            <label className="field">
              <span>Notes (optional)</span>
              <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Allergies, extra napkins, call on arrival…" />
            </label>
          </div>

          <div className="card pad">
            <h2>Payment</h2>
            {methods.length === 0 && <p className="muted">No payment methods are enabled.</p>}
            <div className="stack-sm">
              {methods.map((m) => (
                <label key={m.id} className={`radio ${chosen === m.id ? 'on' : ''}`}>
                  <input type="radio" name="pay" checked={chosen === m.id} onChange={() => setMethod(m.id)} />
                  <span className="radio-text">
                    <strong>{m.label}</strong>
                    <small className="muted">{m.hint}</small>
                  </span>
                </label>
              ))}
            </div>

            {chosen === 'wallet' && (
              <div className="pay-box">
                <p>
                  Send <strong>{money(total, s.currency)}</strong> to one of these accounts:
                </p>
                <ul className="acct-list">
                  {s.jazzcashNumber && (
                    <li>
                      <strong>JazzCash</strong> <span className="code">{s.jazzcashNumber}</span>
                      {s.jazzcashTitle && <span className="muted"> ({s.jazzcashTitle})</span>}
                    </li>
                  )}
                  {s.easypaisaNumber && (
                    <li>
                      <strong>Easypaisa</strong> <span className="code">{s.easypaisaNumber}</span>
                      {s.easypaisaTitle && <span className="muted"> ({s.easypaisaTitle})</span>}
                    </li>
                  )}
                </ul>
                <p className="muted small">Then enter the transaction ID from the confirmation message. We verify it before dispatching.</p>
                <label className="field">
                  <span>Transaction ID (TID)</span>
                  <input className="input" value={pay.tid} onChange={(e) => setPay((p) => ({ ...p, tid: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Number you sent from (optional)</span>
                  <input className="input" value={pay.sender} onChange={(e) => setPay((p) => ({ ...p, sender: e.target.value }))} inputMode="tel" />
                </label>
              </div>
            )}

            {chosen === 'bank' && (
              <div className="pay-box">
                <p>
                  Transfer <strong>{money(total, s.currency)}</strong> to:
                </p>
                <pre className="bank">{s.bankDetails}</pre>
                <label className="field">
                  <span>Transaction ID / reference</span>
                  <input className="input" value={pay.tid} onChange={(e) => setPay((p) => ({ ...p, tid: e.target.value }))} />
                </label>
              </div>
            )}

            {chosen === 'jazzcash' && <p className="muted small pay-box">After you place the order you will be taken to JazzCash's secure page to pay.</p>}

            {chosen === 'easypaisa' && (
              <div className="pay-box">
                <p className="muted small">After you place the order, you will get a payment request in your Easypaisa app. Approve it to confirm your order.</p>
                <label className="field">
                  <span>Easypaisa mobile number</span>
                  <input className="input" value={pay.epMobile} onChange={(e) => setPay((p) => ({ ...p, epMobile: e.target.value }))} inputMode="tel" placeholder={form.phone || '0300 1234567'} />
                </label>
              </div>
            )}
          </div>
        </div>

        <aside className="card pad summary sticky">
          <h2>Order summary</h2>
          <ul className="sum-list">
            {items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.qty} × {i.name}
                </span>
                <span>{money(i.price * i.qty, s.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="row">
            <span>Subtotal</span>
            <span>{money(subtotal, s.currency)}</span>
          </div>
          {tax > 0 && (
            <div className="row">
              <span>
                {s.taxName} ({s.taxRate}%)
              </span>
              <span>{money(tax, s.currency)}</span>
            </div>
          )}
          <div className="row">
            <span>Delivery</span>
            <span>{deliveryFee ? money(deliveryFee, s.currency) : 'Free'}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>{money(total, s.currency)}</span>
          </div>
          {error && (
            <div className="notice notice-warn" role="alert">
              {error}
            </div>
          )}
          <button className="btn btn-lg block" disabled={busy || !chosen}>
            {busy ? 'Placing order…' : chosen === 'jazzcash' || chosen === 'easypaisa' ? 'Place order and pay' : 'Place order'}
          </button>
          <p className="muted small">Final prices are confirmed by our system when you place the order.</p>
        </aside>
      </form>
      <HelpLine />
    </div>
  )
}
