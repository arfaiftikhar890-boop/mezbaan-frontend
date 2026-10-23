import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { useSettings } from '../../context/SettingsContext'
import ReceiptView from '../../components/ReceiptView'

export default function Receipt() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const s = useSettings()
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState('')
  const autoPrint = params.get('print') === '1'

  useEffect(() => {
    api(`/orders/${id}`)
      .then(setOrder)
      .catch((e) => setErr(e.message))
  }, [id])

  // Open the print dialog right after a counter sale
  useEffect(() => {
    if (!order || !autoPrint) return
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [order, autoPrint])

  if (err) return <div className="notice notice-warn">{err}</div>
  if (!order) return <p className="muted">Loading bill…</p>

  return (
    <div>
      <div className="actions no-print">
        <button className="btn" onClick={() => window.print()}>
          🖨 Print bill
        </button>
        <Link className="btn btn-ghost" to="/admin/pos">
          New sale
        </Link>
        <Link className="btn btn-ghost" to="/admin">
          Back to orders
        </Link>
      </div>
      <div className="bill-wrap">
        <ReceiptView order={order} settings={s} />
      </div>
    </div>
  )
}
