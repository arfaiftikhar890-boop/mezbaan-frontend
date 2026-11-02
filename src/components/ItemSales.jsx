import { useCallback, useEffect, useState } from 'react'
import { api, download } from '../api'
import { useSettings } from '../context/SettingsContext'
import { money } from '../lib/utils'

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '1 week' },
  { id: '14d', label: '2 weeks' },
  { id: '30d', label: '1 month' },
]

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const th = { textAlign: 'right', fontWeight: 700, padding: '6px 8px', whiteSpace: 'nowrap' }

// How many of each item were sold and for how much (unpaid orders included), with a one-click Excel download.
// Used on the Reports page and on the POS.
export default function ItemSales() {
  const s = useSettings()
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    try {
      setData(await api(`/reports/items?period=${period}`))
      setErr('')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }, [period])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function excel() {
    setSaving(true)
    try {
      await download(`/reports/items.xlsx?period=${period}`, `item-sales-${period}-${ymd(new Date())}.xlsx`)
      setErr('')
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const cur = s.currency
  const t = data?.totals

  return (
    <div className="stack">
      <div className="chips" role="tablist" aria-label="Report period">
        {PERIODS.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={period === p.id} className={`chip ${period === p.id ? 'on' : ''}`} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      {err && <div className="notice notice-warn">{err}</div>}

      {data && (
        <>
          <p className="muted small" style={{ margin: 0 }}>
            {data.label}: {fmt(data.range.from)}
            {fmt(data.range.from) !== fmt(data.range.to) ? ` to ${fmt(data.range.to)}` : ''} · unpaid orders included
          </p>

          {data.items.length === 0 ? (
            <p className="muted">No sales in this period.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="rtable" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left' }}>Item</th>
                    <th style={th}>Qty</th>
                    <th style={th}>Amount</th>
                    <th style={th}>Unpaid qty</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((i) => (
                    <tr key={i.name}>
                      <td>{i.name}</td>
                      <td className="num">{i.qty}</td>
                      <td className="num">{money(i.amount, cur)}</td>
                      <td className="num">{i.unpaidQty || '-'}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--line)' }}>
                    <td>Total</td>
                    <td className="num">{t.qty}</td>
                    <td className="num">{money(data.items.reduce((a, i) => a + i.amount, 0), cur)}</td>
                    <td className="num">{data.items.reduce((a, i) => a + i.unpaidQty, 0) || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {t.unpaidOrders > 0 && (
            <p className="small" style={{ margin: 0 }}>
              Unpaid: <strong>{t.unpaidOrders}</strong> order{t.unpaidOrders === 1 ? '' : 's'} · <strong>{money(t.unpaidTotal, cur)}</strong> still to collect
            </p>
          )}
        </>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={excel} disabled={saving}>
          {saving ? 'Preparing Excel…' : `Download Excel (${PERIODS.find((p) => p.id === period).label})`}
        </button>
        <button type="button" className="btn btn-ghost" onClick={load} disabled={busy}>
          {busy ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="muted small" style={{ margin: 0 }}>
        Amounts are price × quantity, before discount and tax. The Excel file has the item list, a summary and the unpaid orders on separate sheets.
      </p>
    </div>
  )
}
