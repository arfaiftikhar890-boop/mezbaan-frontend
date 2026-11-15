import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { useSettings } from '../../context/SettingsContext'
import { PAY_METHOD_LABEL, TYPE_LABEL, fmtDateTime, money } from '../../lib/utils'

export default function Receipt() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = useSettings()
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    api(`/orders/${id}`)
      .then((o) => {
        if (!cancelled) setOrder(o)
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message || 'Bill nahi mila.')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (order && params.get('print') === '1') {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [order, params])

  if (err) {
    return (
      <div className="container section">
        <div className="notice notice-warn">{err}</div>
        <Link to="/admin">Orders par wapas jayein</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container section">
        <p className="muted">Bill load ho raha hai…</p>
      </div>
    )
  }

  const cur = s.currency
  const isPaid = order.payment?.status === 'paid'

  return (
    <div className="container section">
      <div className="bill-wrap">
        <div className="receipt">
          <div className="r-center">
            <div className="r-name">MEZBAAN</div>
            <div className="r-addr">Bill / Receipt</div>
          </div>
          <hr />
          <div className="r-row">
            <span>Invoice</span>
            <strong>#{order.invoiceNo}</strong>
          </div>
          <div className="r-row">
            <span>Date</span>
            <span>{fmtDateTime(order.createdAt)}</span>
          </div>
          <div className="r-row">
            <span>Type</span>
            <span>
              {TYPE_LABEL[order.orderType] || order.orderType}
              {order.table ? ` · Table ${order.table}` : ''}
            </span>
          </div>
          {order.customer?.name && (
            <div className="r-row">
              <span>Customer</span>
              <span>{order.customer.name}</span>
            </div>
          )}
          <hr />

          <table className="r-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>{money(i.price * i.qty, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />

          <div className="r-row">
            <span>Subtotal</span>
            <span>{money(order.subtotal, cur)}</span>
          </div>
          {order.discount?.amount > 0 && (
            <div className="r-row">
              <span>Discount</span>
              <span>− {money(order.discount.amount, cur)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="r-row">
              <span>{s.taxName || 'Tax'}</span>
              <span>{money(order.tax, cur)}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div className="r-row">
              <span>Delivery</span>
              <span>{money(order.deliveryFee, cur)}</span>
            </div>
          )}
          <hr />
          <div className="r-row r-total">
            <span>Total</span>
            <span>{money(order.total, cur)}</span>
          </div>
          <div className="r-row">
            <span>Payment</span>
            <span>
              {PAY_METHOD_LABEL[order.payment?.method] || order.payment?.method}
              {' · '}
              {isPaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          {isPaid && order.payment?.method === 'cash' && order.payment?.change > 0 && (
            <div className="r-row">
              <span>Change</span>
              <span>{money(order.payment.change, cur)}</span>
            </div>
          )}
          <hr />
          <div className="r-center r-inote">Shukriya, dobara tashreef laayein!</div>
          <div className="r-center r-powered">Powered by Mezbaan</div>
        </div>
      </div>

      <div className="actions no-print" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-sm" onClick={() => window.print()}>
          Print bill
        </button>
        <Link className="btn btn-sm btn-ghost" to="/admin">
          Orders
        </Link>
      </div>
    </div>
  )
}
