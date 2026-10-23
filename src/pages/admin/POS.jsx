import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useMenu, categoriesOf } from '../../hooks/useMenu'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { computeTotals, money } from '../../lib/utils'
import { ItemImage } from '../../components/ItemCard'

const TYPES = [
  { id: 'dinein', label: '🍽 Dine-in' },
  { id: 'takeaway', label: '🥡 Takeaway' },
  { id: 'delivery', label: '🛵 Delivery' },
]

// Takeaway is paid at the counter by default. Dine-in is an open tab and delivery is paid on arrival.
const defaultPayNow = (type) => type === 'takeaway'

export default function POS() {
  const { items, loading, error } = useMenu()
  const s = useSettings()
  const { isAdmin } = useAuth()
  const nav = useNavigate()

  const [lines, setLines] = useState([]) // {id,name,price,qty}
  const [orderType, setOrderType] = useState('dinein')
  const [table, setTable] = useState('')
  const [cust, setCust] = useState({ name: '', phone: '', address: '' })
  const [discount, setDiscount] = useState({ kind: 'none', value: '' })
  const [notes, setNotes] = useState('')
  const [payNow, setPayNow] = useState(defaultPayNow('dinein'))
  const [method, setMethod] = useState('cash')
  const [received, setReceived] = useState('')
  const [tid, setTid] = useState('')
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const cats = categoriesOf(items)
  const shown = items.filter(
    (i) => (cat === 'All' || (i.category || 'Other') === cat) && `${i.name} ${i.category}`.toLowerCase().includes(q.trim().toLowerCase()),
  )

  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0)
  const deliveryFee = orderType === 'delivery' ? Number(s.deliveryFee) || 0 : 0
  const disc = { kind: discount.kind, value: Number(discount.value) || 0 }
  const t = useMemo(
    () => computeTotals({ subtotal, discount: disc, taxRate: s.taxRate, deliveryFee }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subtotal, discount.kind, discount.value, s.taxRate, deliveryFee],
  )
  const discountPct = subtotal > 0 ? (t.discountAmount * 100) / subtotal : 0
  const overLimit = !isAdmin && discountPct > s.maxCashierDiscount + 0.0001

  const add = (item) =>
    setLines((cur) => {
      const f = cur.find((l) => l.id === item.id)
      if (f) return cur.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
      return [...cur, { id: item.id, name: item.name, price: item.price, qty: 1 }]
    })
  const inc = (id) => setLines((c) => c.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)))
  const dec = (id) => setLines((c) => c.flatMap((l) => (l.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l])))

  const chooseOrderType = (type) => {
    setOrderType(type)
    setPayNow(defaultPayNow(type))
  }

  const receivedNum = received === '' ? t.total : Number(received)
  const change = method === 'cash' ? receivedNum - t.total : 0

  function reset() {
    setLines([])
    setTable('')
    setCust({ name: '', phone: '', address: '' })
    setDiscount({ kind: 'none', value: '' })
    setNotes('')
    setReceived('')
    setTid('')
    setPayNow(defaultPayNow(orderType))
  }

  async function submit(pay) {
    setErr('')
    if (lines.length === 0) return setErr('Add at least one item.')
    if (overLimit) return setErr(`Discounts above ${s.maxCashierDiscount}% need the admin.`)
    if (orderType === 'delivery' && (cust.address.trim().length < 5 || cust.phone.trim().length < 7)) return setErr('Delivery needs the customer phone and address.')
    if (pay && method === 'cash' && receivedNum < t.total) return setErr('Cash received is less than the total.')
    setBusy(true)
    try {
      const order = await api('/orders/pos', {
        method: 'POST',
        body: {
          orderType,
          table: orderType === 'dinein' ? table : '',
          customer: cust,
          items: lines.map((l) => ({ id: l.id, qty: l.qty })),
          discount: { kind: disc.value > 0 ? disc.kind : 'none', value: disc.value },
          notes,
          payNow: pay,
          payment: { method, received: method === 'cash' && received !== '' ? Number(received) : undefined, tid },
        },
      })
      reset()
      nav(`/admin/receipt/${order.id}${pay ? '?print=1' : ''}`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pos">
      <section className="pos-menu">
        <div className="toolbar">
          <input className="input" type="search" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items" />
        </div>
        <div className="chips">
          {['All', ...cats].map((c) => (
            <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        {loading && <p className="muted">Loading menu…</p>}
        {error && <div className="notice notice-warn">{error}</div>}
        <div className="pos-grid">
          {shown.map((i) => (
            <button key={i.id} className="pos-item" disabled={i.available === false} onClick={() => add(i)}>
              <span className="pos-thumb">
                <ItemImage item={i} />
              </span>
              <span className="pos-name">{i.name}</span>
              <span className="pos-price">{i.available === false ? 'Sold out' : money(i.price, s.currency)}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="card pad pos-bill">
        <div className="seg seg3" role="radiogroup" aria-label="Order type">
          {TYPES.map((t2) => (
            <button type="button" key={t2.id} role="radio" aria-checked={orderType === t2.id} className={orderType === t2.id ? 'on' : ''} onClick={() => chooseOrderType(t2.id)}>
              {t2.label}
            </button>
          ))}
        </div>

        {orderType === 'dinein' && (
          <label className="field">
            <span>Table</span>
            <input className="input" value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. 5" />
          </label>
        )}
        {orderType === 'delivery' ? (
          <>
            <div className="two">
              <label className="field">
                <span>Customer name</span>
                <input className="input" value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} />
              </label>
              <label className="field">
                <span>Phone</span>
                <input className="input" value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} inputMode="tel" />
              </label>
            </div>
            <label className="field">
              <span>Address</span>
              <textarea className="input" rows={2} value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} />
            </label>
          </>
        ) : (
          <label className="field">
            <span>Customer name (optional)</span>
            <input className="input" value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} />
          </label>
        )}

        <div className="pos-lines">
          {lines.length === 0 && <p className="muted small">Tap items on the left to add them to the bill.</p>}
          {lines.map((l) => (
            <div key={l.id} className="pos-line">
              <span className="pos-line-name">{l.name}</span>
              <div className="stepper">
                <button onClick={() => dec(l.id)} aria-label={`Remove one ${l.name}`}>
                  −
                </button>
                <span>{l.qty}</span>
                <button onClick={() => inc(l.id)} aria-label={`Add one ${l.name}`}>
                  +
                </button>
              </div>
              <span className="pos-line-total">{money(l.price * l.qty, s.currency)}</span>
            </div>
          ))}
        </div>

        <div className="two">
          <label className="field">
            <span>Discount</span>
            <select className="input" value={discount.kind} onChange={(e) => setDiscount({ ...discount, kind: e.target.value })}>
              <option value="none">None</option>
              <option value="percent">Percent (%)</option>
              <option value="amount">Amount ({s.currency})</option>
            </select>
          </label>
          <label className="field">
            <span>Value</span>
            <input className="input" type="number" min="0" disabled={discount.kind === 'none'} value={discount.value} onChange={(e) => setDiscount({ ...discount, value: e.target.value })} />
          </label>
        </div>
        {overLimit && <div className="notice notice-warn">Cashiers can give up to {s.maxCashierDiscount}%. This needs the admin.</div>}

        <div className="row">
          <span>Subtotal</span>
          <span>{money(subtotal, s.currency)}</span>
        </div>
        {t.discountAmount > 0 && (
          <div className="row">
            <span>Discount</span>
            <span>− {money(t.discountAmount, s.currency)}</span>
          </div>
        )}
        {t.tax > 0 && (
          <div className="row">
            <span>
              {s.taxName} ({s.taxRate}%)
            </span>
            <span>{money(t.tax, s.currency)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="row">
            <span>Delivery</span>
            <span>{money(deliveryFee, s.currency)}</span>
          </div>
        )}
        <div className="row total">
          <span>Total</span>
          <span>{money(t.total, s.currency)}</span>
        </div>

        <label className="checks">
          <span>
            <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} /> Customer pays now
          </span>
        </label>

        {payNow && (
          <>
            <label className="field">
              <span>Payment method</span>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="wallet">Easypaisa / JazzCash</option>
                <option value="bank">Bank transfer</option>
              </select>
            </label>
            {method === 'cash' ? (
              <>
                <label className="field">
                  <span>Cash received</span>
                  <input className="input" type="number" min="0" value={received} onChange={(e) => setReceived(e.target.value)} placeholder={String(t.total)} />
                </label>
                <div className="quick">
                  {[500, 1000, 5000].map((n) => (
                    <button type="button" key={n} className="chip" onClick={() => setReceived(String(n))}>
                      {n}
                    </button>
                  ))}
                  <button type="button" className="chip" onClick={() => setReceived('')}>
                    Exact
                  </button>
                </div>
                {lines.length > 0 && <p className="small">{change >= 0 ? <>Change: <strong>{money(change, s.currency)}</strong></> : <span className="danger-text">Short by {money(-change, s.currency)}</span>}</p>}
              </>
            ) : (
              <label className="field">
                <span>TID / slip no. (optional)</span>
                <input className="input" value={tid} onChange={(e) => setTid(e.target.value)} />
              </label>
            )}
          </>
        )}

        <label className="field">
          <span>Notes</span>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Kitchen / bill note" />
        </label>

        {err && (
          <div className="notice notice-warn" role="alert">
            {err}
          </div>
        )}
        <button className="btn btn-lg block" disabled={busy || lines.length === 0} onClick={() => submit(payNow)}>
          {busy ? 'Saving…' : payNow ? `Charge ${money(t.total, s.currency)} & print` : 'Save as open bill (pay later)'}
        </button>
        <button type="button" className="btn btn-ghost block" onClick={reset} disabled={busy}>
          Clear
        </button>
      </aside>
    </div>
  )
}