import { useState } from 'react'
import { api } from '../../api'
import { useSettings, useReloadSettings } from '../../context/SettingsContext'

const NUMBER_KEYS = ['deliveryFee', 'minOrder', 'taxRate', 'maxCashierDiscount']
const KEYS = [
  'name', 'tagline', 'about', 'address', 'phone', 'whatsapp', 'hours', 'currency', 'acceptingOrders',
  'deliveryFee', 'minOrder', 'taxName', 'taxRate', 'maxCashierDiscount', 'taxNumber', 'receiptFooter',
  'codEnabled', 'easypaisaEnabled', 'easypaisaNumber', 'easypaisaTitle', 'jazzcashNumber', 'jazzcashTitle', 'bankEnabled', 'bankDetails',
]

export default function SettingsAdmin() {
  const current = useSettings()
  const reload = useReloadSettings()
  const [f, setF] = useState(current)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setSaved(false)
    setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const body = {}
      for (const k of KEYS) body[k] = NUMBER_KEYS.includes(k) ? Number(f[k]) || 0 : f[k]
      await api('/settings', { method: 'PUT', body })
      await reload()
      setSaved(true)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  const text = (k, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" value={f[k] ?? ''} onChange={set(k)} {...props} />
    </label>
  )
  const check = (k, label) => (
    <label>
      <input type="checkbox" checked={Boolean(f[k])} onChange={set(k)} /> {label}
    </label>
  )

  return (
    <form className="stack" onSubmit={save}>
      {err && <div className="notice notice-warn">{err}</div>}

      <div className="card pad">
        <h2>Café details</h2>
        {text('name', 'Café name')}
        {text('tagline', 'Tagline')}
        <label className="field">
          <span>About</span>
          <textarea className="input" rows={3} value={f.about} onChange={set('about')} />
        </label>
        {text('address', 'Address')}
        {text('hours', 'Opening hours')}
        <div className="two">
          {text('phone', 'Phone')}
          {text('whatsapp', 'WhatsApp number (923001234567)')}
        </div>
      </div>

      <div className="card pad">
        <h2>Billing &amp; tax</h2>
        <div className="two">
          {text('currency', 'Currency label')}
          {text('taxName', 'Tax name (e.g. GST, SRB)')}
        </div>
        <div className="two">
          {text('taxRate', 'Tax rate % (0 = no tax)', { type: 'number', min: 0, max: 50, step: '0.1' })}
          {text('taxNumber', 'NTN / STRN (printed on bills)')}
        </div>
        <div className="two">
          {text('maxCashierDiscount', 'Max discount a cashier can give (%)', { type: 'number', min: 0, max: 100 })}
          {text('receiptFooter', 'Bill footer message')}
        </div>
        <p className="muted small">Tax is added on top of the bill (after discount). Ask the café&rsquo;s accountant which rate applies to them.</p>
      </div>

      <div className="card pad">
        <h2>Online ordering</h2>
        <div className="checks">{check('acceptingOrders', 'Accepting online orders')}</div>
        <div className="two">
          {text('deliveryFee', 'Delivery fee', { type: 'number', min: 0 })}
          {text('minOrder', 'Minimum order (0 = none)', { type: 'number', min: 0 })}
        </div>
      </div>

      <div className="card pad">
        <h2>Payment methods (online customers)</h2>
        <div className="checks">
          {check('codEnabled', 'Cash on delivery / pickup')}
          {check('easypaisaEnabled', 'JazzCash / Easypaisa transfer to our number (customer enters TID)')}
          {check('bankEnabled', 'Bank transfer')}
        </div>
        <div className="two">
          {text('jazzcashNumber', 'JazzCash number')}
          {text('jazzcashTitle', 'JazzCash account title')}
          {text('easypaisaNumber', 'Easypaisa number')}
          {text('easypaisaTitle', 'Easypaisa account title')}
        </div>
        <p className="muted small">
          Automatic payments: JazzCash {current.gateways?.jazzcash ? 'is connected' : 'is not connected'}, Easypaisa{' '}
          {current.gateways?.easypaisa ? 'is connected' : 'is not connected'}. They switch on when their keys are added in the server
          environment variables (see README).
        </p>
        <label className="field">
          <span>Bank details (shown to customers)</span>
          <textarea className="input" rows={4} value={f.bankDetails} onChange={set('bankDetails')} />
        </label>
      </div>

      {saved && <div className="notice notice-ok">Saved. Changes are live.</div>}
      <div className="actions">
        <button className="btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
