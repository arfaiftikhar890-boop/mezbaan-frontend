
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useSettings } from '../../context/SettingsContext'
import {
  PAY_METHOD_LABEL,
  PAY_STATUS_LABEL,
  TYPE_LABEL,
  beep,
  fmtDateTime,
  money,
} from '../../lib/utils'

const FILTERS = [
  { id: 'active', label: 'Active', params: 'status=active' },
  { id: 'unpaid', label: 'Unpaid', params: 'unpaid=1' },
  { id: 'completed', label: 'Completed', params: 'status=completed' },
  { id: 'cancelled', label: 'Cancelled', params: 'status=cancelled' },
  { id: 'all', label: 'All', params: 'status=all' },
]

const NEXT = {
  new: { to: 'preparing', label: 'Accept & prepare' },
  preparing: { to: 'ready', label: 'Mark ready' },
  ready: { to: 'completed', label: 'Complete' },
}

function PayForm({ order, onDone, onError }) {
  const s = useSettings()
  const start =
    order.payment.method === 'cod' ? 'cash' : order.payment.method

  const [method, setMethod] = useState(
    ['cash', 'card', 'wallet', 'bank'].includes(start) ? start : 'cash',
  )
  const [received, setReceived] = useState('')
  const [tid, setTid] = useState(order.payment.tid || '')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)

    try {
      const body = { method }

      if (method === 'cash' && received !== '') {
        body.received = Number(received)
      }

      if (method !== 'cash' && tid.trim()) {
        body.tid = tid.trim()
      }

      await api(`/orders/${order.id}/payment`, {
        method: 'PATCH',
        body,
      })

      onDone()
    } catch (err) {
      onError(err.message || 'Could not update payment.')
    } finally {
      setBusy(false)
    }
  }

  const change =
    method === 'cash' && received !== ''
      ? Number(received) - order.total
      : null

  return (
    <form className="pay-inline" onSubmit={submit}>
      <div className="two">
        <label className="field">
          <span>Method</span>
          <select
            className="input"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="wallet">Easypaisa / JazzCash</option>
            <option value="bank">Bank transfer</option>
          </select>
        </label>

        {method === 'cash' ? (
          <label className="field">
            <span>Cash received (blank = exact)</span>
            <input
              className="input"
              type="number"
              min={order.total}
              step="0.01"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              placeholder={String(order.total)}
            />
          </label>
        ) : (
          <label className="field">
            <span>TID / reference</span>
            <input
              className="input"
              value={tid}
              onChange={(e) => setTid(e.target.value)}
            />
          </label>
        )}
      </div>

      {change !== null && change >= 0 && (
        <p className="small">
          Change to return: <strong>{money(change, s.currency)}</strong>
        </p>
      )}

      <button className="btn btn-sm" disabled={busy}>
        {busy ? 'Saving…' : `Confirm ${money(order.total, s.currency)} received`}
      </button>
    </form>
  )
}

function VerifyPayment({ order, onDone, onError }) {
  const [busy, setBusy] = useState(false)

  async function verify(action) {
    const message =
      action === 'approve'
        ? 'Have you checked the actual wallet/bank transaction and confirmed the full amount was received?'
        : 'Reject this payment verification?'

    if (!window.confirm(message)) return

    let note = ''

    if (action === 'reject') {
      note = window.prompt(
        'Reason for rejection (optional):',
        'Payment could not be verified',
      )

      if (note === null) return
    }

    setBusy(true)

    try {
      await api(`/orders/${order.id}/verify-payment`, {
        method: 'PATCH',
        body: { action, note },
      })

      onDone()
    } catch (err) {
      onError(err.message || 'Could not update payment verification.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pay-inline">
      <p className="small">
        <strong>Manual payment verification required.</strong>
        {' '}Check the TID against your actual receiving account before approving.
      </p>

      <div className="actions">
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy}
          onClick={() => verify('approve')}
        >
          {busy ? 'Processing…' : 'Approve payment'}
        </button>

        <button
          type="button"
          className="btn btn-sm btn-danger"
          disabled={busy}
          onClick={() => verify('reject')}
        >
          Reject payment
        </button>
      </div>
    </div>
  )
}

export default function Orders() {
  const s = useSettings()
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('active')
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [payingId, setPayingId] = useState(null)
  const seen = useRef(null)

  const load = useCallback(async () => {
    const f = FILTERS.find((x) => x.id === filter)
    const qs = `${f.params}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}&limit=100`

    try {
      const d = await api(`/orders?${qs}`)

      const ids = new Set(d.orders.map((o) => o.id))

      if (
        seen.current &&
        d.orders.some(
          (o) =>
            o.source === 'online' &&
            o.status === 'new' &&
            !seen.current.has(o.id),
        )
      ) {
        beep()
      }

      seen.current = ids
      setOrders(d.orders)
      setTotal(d.total)
      setErr('')
    } catch (e) {
      setErr(e.message || 'Could not load orders.')
    }
  }, [filter, q])

  useEffect(() => {
    seen.current = null
    load()

    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [load])

  async function act(fn) {
    try {
      await fn()
      setErr('')
      setPayingId(null)
      await load()
    } catch (e) {
      setErr(e.message || 'Something went wrong.')
    }
  }

  const setStatus = (o, status, reason) =>
    act(() =>
      api(`/orders/${o.id}/status`, {
        method: 'PATCH',
        body: { status, reason },
      }),
    )

  function cancel(o) {
    const reason = window.prompt(
      'Reason for cancelling this order? (optional)',
    )

    if (reason === null) return
    setStatus(o, 'cancelled', reason)
  }

  const newCount = orders.filter((o) => o.status === 'new').length

  return (
    <div>
      {err && (
        <div className="notice notice-warn" role="alert">
          {err}
        </div>
      )}

      <div className="toolbar row-gap">
        <input
          className="input"
          type="search"
          placeholder="Search invoice #, name, phone or table…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search orders"
        />
      </div>

      <div className="chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip ${filter === f.id ? 'on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === 'active' && newCount > 0
              ? ` (${newCount} new)`
              : ''}
          </button>
        ))}

        <span className="muted small chips-count">
          {total} order{total === 1 ? '' : 's'}
        </span>
      </div>

      {orders.length === 0 && !err && (
        <p className="muted">No orders here yet.</p>
      )}

      <div className="orders">
        {orders.map((o) => {
          const next = NEXT[o.status]
          const pay = o.payment

          const canSettle =
            o.status !== 'cancelled' &&
            pay.status !== 'paid' &&
            pay.status !== 'refunded'

          const needsVerification =
            o.source === 'online' &&
            ['wallet', 'bank'].includes(pay.method) &&
            pay.status === 'verification'

          return (
            <article
              key={o.id}
              className={`card pad order st-${o.status}`}
            >
              <header className="order-head">
                <div>
                  <strong className="code">#{o.invoiceNo}</strong>{' '}
                  <span className={`pill pill-${o.status}`}>
                    {o.status}
                  </span>{' '}
                  <span className="pill">
                    {o.source === 'online' ? 'online' : 'counter'}
                  </span>
                </div>

                <span className="muted small">
                  {fmtDateTime(o.createdAt)}
                </span>
              </header>

              <p>
                <strong>{TYPE_LABEL[o.orderType]}</strong>
                {o.table ? ` · Table ${o.table}` : ''}
                {o.customer?.name ? ` · ${o.customer.name}` : ''}
                {o.customer?.phone && (
                  <>
                    {' · '}
                    <a href={`tel:${o.customer.phone}`}>
                      {o.customer.phone}
                    </a>
                  </>
                )}
              </p>

              {o.orderType === 'delivery' && (
                <p className="muted">🛵 {o.customer?.address}</p>
              )}

              <ul className="sum-list">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    <span>
                      {i.qty} × {i.name}
                    </span>
                    <span>{money(i.price * i.qty, s.currency)}</span>
                  </li>
                ))}
              </ul>

              {o.notes && <p className="note">📝 {o.notes}</p>}

              {o.status === 'cancelled' && o.cancelReason && (
                <p className="note">Cancelled: {o.cancelReason}</p>
              )}

              {(o.discount?.amount > 0 ||
                o.tax > 0 ||
                o.deliveryFee > 0) && (
                <p className="muted small">
                  Subtotal {money(o.subtotal, s.currency)}
                  {o.discount?.amount > 0 &&
                    ` · Discount −${money(o.discount.amount, s.currency)}`}
                  {o.tax > 0 &&
                    ` · ${s.taxName} ${money(o.tax, s.currency)}`}
                  {o.deliveryFee > 0 &&
                    ` · Delivery ${money(o.deliveryFee, s.currency)}`}
                </p>
              )}

              <div className="row total">
                <span>Total</span>
                <span>{money(o.total, s.currency)}</span>
              </div>

              <p className="small">
                💳 {PAY_METHOD_LABEL[pay.method] || pay.method}
                {' · '}
                <span className={`pill pay-${pay.status}`}>
                  {PAY_STATUS_LABEL[pay.status] || pay.status}
                </span>

                {pay.tid && (
                  <>
                    {' · '}TID: <strong>{pay.tid}</strong>
                    {pay.sender ? ` (from ${pay.sender})` : ''}
                  </>
                )}

                {pay.status === 'paid' &&
                  pay.method === 'cash' &&
                  pay.change > 0 &&
                  ` · change ${money(pay.change, s.currency)}`}
              </p>

              {needsVerification && (
                <VerifyPayment
                  order={o}
                  onDone={() => act(async () => {})}
                  onError={setErr}
                />
              )}

              {payingId === o.id && (
                <PayForm
                  order={o}
                  onDone={() => act(async () => {})}
                  onError={setErr}
                />
              )}

              <div className="actions">
                {next && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setStatus(o, next.to)}
                  >
                    {next.label}
                  </button>
                )}

                {canSettle && !needsVerification && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      setPayingId(payingId === o.id ? null : o.id)
                    }
                  >
                    {payingId === o.id ? 'Close' : 'Receive payment'}
                  </button>
                )}

                <Link
                  className="btn btn-sm btn-ghost"
                  to={`/admin/receipt/${o.id}`}
                >
                  Bill / print
                </Link>

                {o.status !== 'cancelled' &&
                  o.status !== 'completed' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => cancel(o)}
                    >
                      Cancel
                    </button>
                  )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
