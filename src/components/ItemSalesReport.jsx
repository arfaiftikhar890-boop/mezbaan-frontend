import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { api } from '../api'
import { money } from '../lib/utils'
import { useSettings } from '../context/SettingsContext'

const TZ = 'Asia/Karachi'
const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ })
const shiftDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const PRESETS = [
  { id: 'today', label: 'Today', range: () => [todayStr(), todayStr()] },
  { id: 'yesterday', label: 'Yesterday', range: () => [shiftDays(todayStr(), -1), shiftDays(todayStr(), -1)] },
  { id: '1w', label: '1 week', range: () => [shiftDays(todayStr(), -6), todayStr()] },
  { id: '2w', label: '2 weeks', range: () => [shiftDays(todayStr(), -13), todayStr()] },
  { id: '1m', label: '1 month', range: () => [shiftDays(todayStr(), -29), todayStr()] },
]

export default function ItemSalesReport() {
  const s = useSettings()
  const [preset, setPreset] = useState('today')
  const [from, setFrom] = useState(todayStr())
  const [to, setTo] = useState(todayStr())
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(f, t) {
    setErr('')
    setLoading(true)
    try {
      const res = await api(`/reports/item-sales?from=${f}&to=${t}`)
      setData(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  function choose(p) {
    const [f, t] = p.range()
    setPreset(p.id)
    setFrom(f)
    setTo(t)
    load(f, t)
  }

  function applyCustom() {
    setPreset('custom')
    load(from, to)
  }

  useEffect(() => {
    choose(PRESETS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function downloadExcel() {
    if (!data) return
    const cur = s.currency
    const header = ['Item', 'Category', 'Quantity', `Sales (${cur})`, `Cost (${cur})`, `Profit (${cur})`]
    const rows = data.items.map((i) => [i.name, i.category, i.qty, i.amount, i.cost, i.profit])
    const total = ['Total', '', data.totalQty, data.totalAmount, data.totalCost, data.totalProfit]

    const aoa = [
      ['Item-wise sales report'],
      [`Period: ${from} to ${to}`],
      [],
      header,
      ...rows,
      [],
      total,
    ]

    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Item Sales')
    XLSX.writeFile(wb, `item-sales-${from}-to-${to}.xlsx`)
  }

  return (
    <section className="card pad">
      <div className="section-head">
        <h2>Item-wise sales</h2>
        <button type="button" className="btn btn-sm" onClick={downloadExcel} disabled={!data || loading}>
          Download Excel
        </button>
      </div>

      <div className="chips">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip ${preset === p.id ? 'on' : ''}`}
            onClick={() => choose(p)}
            disabled={loading}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="two" style={{ marginTop: 12 }}>
        <label className="field">
          <span>From</span>
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="field">
          <span>To</span>
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <button type="button" className="btn btn-ghost block" onClick={applyCustom} disabled={loading}>
        {loading ? 'Loading…' : 'Show custom range'}
      </button>

      {err && <div className="notice notice-warn">{err}</div>}

      {data && (
        <>
          {data.totalQty > 0 && (
            <div className="stats" style={{ marginTop: 16 }}>
              <div className="stat"><span className="muted small">Total quantity</span><strong>{data.totalQty}</strong></div>
              <div className="stat"><span className="muted small">Total sales</span><strong>{money(data.totalAmount, s.currency)}</strong></div>
              <div className="stat"><span className="muted small">Total cost</span><strong>{money(data.totalCost, s.currency)}</strong></div>
              <div className="stat"><span className="muted small">Profit</span><strong>{money(data.totalProfit, s.currency)}</strong></div>
            </div>
          )}

          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="rtable">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Item</th>
                  <th className="num">Qty</th>
                  <th className="num">Sales</th>
                  <th className="num">Cost</th>
                  <th className="num">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted">Is date range mein koi sale nahi hai.</td>
                  </tr>
                )}
                {data.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td className="num">{i.qty}</td>
                    <td className="num">{money(i.amount, s.currency)}</td>
                    <td className="num">{money(i.cost, s.currency)}</td>
                    <td className="num">{money(i.profit, s.currency)}</td>
                  </tr>
                ))}
                {data.items.length > 0 && (
                  <tr>
                    <td><strong>Total</strong></td>
                    <td className="num"><strong>{data.totalQty}</strong></td>
                    <td className="num"><strong>{money(data.totalAmount, s.currency)}</strong></td>
                    <td className="num"><strong>{money(data.totalCost, s.currency)}</strong></td>
                    <td className="num"><strong>{money(data.totalProfit, s.currency)}</strong></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
