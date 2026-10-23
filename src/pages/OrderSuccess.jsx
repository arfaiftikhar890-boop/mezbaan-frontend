import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getPublicOrder } from '../services/orders'
import { useSettings } from '../context/SettingsContext'
import { PAY_METHOD_LABEL, waLink } from '../lib/utils'
import ReceiptPair from '../components/ReceiptView'
import PayOnline from '../components/PayOnline'
import HelpLine from '../components/HelpLine'

function steps(orderType) {
  return [
    { id: 'new', label: 'Order received' },
    { id: 'preparing', label: 'Being prepared' },
    { id: 'ready', label: orderType === 'delivery' ? 'Out for delivery' : 'Ready for pickup' },
    { id: 'completed', label: 'Completed' },
  ]
}

export default function OrderSuccess() {
  const { id } = useParams()
  const s = useSettings()
  const [order, setOrder] = useState(undefined)
  const [params] = useSearchParams()
  const payResult = params.get('payment')

  // Poll so the customer sees status changes made by the café.
  useEffect(() => {
    let stop = false
    const load = () =>
      getPublicOrder(id)
        .then((o) => !stop && setOrder(o))
        .catch((e) => !stop && e.status === 404 && setOrder(null))
    load()
    const t = setInterval(load, 10000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [id])

  if (order === undefined) return <div className="container section">Loading your order…</div>
  if (order === null)
    return (
      <div className="container section empty">
        <h1 className="page-title">Order not found</h1>
        <p className="muted">Please check the link or contact us on WhatsApp.</p>
        <Link to="/" className="btn">
          Back to home
        </Link>
      </div>
    )

  const list = steps(order.orderType)
  const idx = list.findIndex((x) => x.id === order.status)
  const cancelled = order.status === 'cancelled'
  const pay = order.payment || {}
  const waText = `Hi! Regarding my order (invoice #${order.invoiceNo}).`

  return (
    <div className="container section narrow">
      <div className="card pad success no-print">
        <div className="check" aria-hidden="true">
          {cancelled ? '✕' : '✓'}
        </div>
        <h1 className="page-title">{cancelled ? 'Order cancelled' : 'Thank you! Order placed'}</h1>
        <p className="muted">
          Invoice number <strong className="code">#{order.invoiceNo}</strong>
        </p>

        {!cancelled && (
          <ol className="tracker">
            {list.map((st, i) => (
              <li key={st.id} className={i <= idx ? 'done' : ''}>
                <span className="dot" />
                <span>{st.label}</span>
              </li>
            ))}
          </ol>
        )}

        {pay.status === 'verification' && <div className="notice">We will verify your payment (TID: {pay.tid}) and confirm shortly.</div>}
        {pay.status === 'paid' && <div className="notice notice-ok">Payment received. Thank you!</div>}
        {pay.status === 'unpaid' && ['online', 'jazzcash', 'easypaisa'].includes(pay.method) && !cancelled && (
          <div className="stack-sm">
            <div className={`notice ${payResult === 'failed' ? 'notice-warn' : ''}`}>
              {payResult === 'failed'
                ? `Your payment did not go through${pay.message ? ` (${pay.message})` : ''}. Your order is saved, so you can try again.`
                : 'Your payment is not completed yet.'}
            </div>
            <PayOnline publicId={id} gateways={s.gateways} defaultMobile={order.customer?.phone || ''} />
            <p className="muted small">Prefer to pay later? Send us the amount on WhatsApp or pay on arrival.</p>
          </div>
        )}
        {pay.status === 'unpaid' && pay.method === 'cod' && !cancelled && (
          <div className="notice">
            Please pay {order.orderType === 'delivery' ? 'the rider on delivery' : 'at the café'} ({PAY_METHOD_LABEL.cod}).
          </div>
        )}
      </div>

      <div className="bill-wrap">
        <ReceiptPair order={order} settings={s} />
      </div>

      <div className="actions no-print">
        <button className="btn" onClick={() => window.print()}>
          Print / save bills
        </button>
        <a className="btn btn-ghost" href={waLink(s.whatsapp, waText)} target="_blank" rel="noreferrer">
          Message us on WhatsApp
        </a>
        <Link to="/menu" className="btn btn-ghost">
          Order more
        </Link>
      </div>
      <p className="muted small no-print">Bookmark this page to check your order status anytime.</p>
      <HelpLine className="no-print" />
    </div>
  )
}
