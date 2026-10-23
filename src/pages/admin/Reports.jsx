import { useCallback, useEffect, useState } from 'react'
import { api, download } from '../../api'
import { useSettings } from '../../context/SettingsContext'
import { PAY_METHOD_LABEL, TYPE_LABEL, money } from '../../lib/utils'

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function presetRange(id) {
  const now = new Date()
  const today = startOfDay(now)
  if (id === 'today') return [today, endOfDay(now)]
  if (id === 'yesterday') return [addDays(today, -1), endOfDay(addDays(today, -1))]
  if (id === '7d') return [addDays(today, -6), endOfDay(now)]
  if (id === 'month') return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)]
  return [addDays(today, -29), endOfDay(now)]
}

const PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'month', label: 'This month' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'custom', label: 'Custom' },
]

function Stat({ label, value, sub }) {
  return (
    <div className="card pad stat">
      <span className="muted small">{label}</span>
      <strong>{value}</strong>
      {sub && <span className="muted small">{sub}</span>}
    </div>
  )
}

function Table({ title, rows, cur, label }) {
  if (!rows?.length) return null
  return (
    <div className="card pad">
      <h3>{title}</h3>
      <table className="rtable">
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{label(r._id)}</td>
              <td>{r.orders} orders</td>
              <td className="num">{money(r.total, cur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Reports() {
  const s = useSettings()
  const [preset, setPreset] = useState('today')
  const [custom, setCustom] = useState(() => ({ from: ymd(new Date()), to: ymd(new Date()) }))
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const range = useCallback(() => {
    if (preset === 'custom') return [startOfDay(parseYmd(custom.from)), endOfDay(parseYmd(custom.to))]
    return presetRange(preset)
  }, [preset, custom])

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const [from, to] = range()
      setData(await api(`/reports/summary?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`))
      setErr('')
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }, [range])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function csv() {
    try {
      const [from, to] = range()
      await download(`/reports/orders.csv?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`, `orders-${ymd(from)}-to-${ymd(to)}.csv`)
    } catch (e) {
      setErr(e.message)
    }
  }

  const cur = s.currency
  const t = data?.totals
  const maxDaily = Math.max(1, ...(data?.daily || []).map((d) => d.total))

  return (
    <div className="stack">
      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p.id} className={`chip ${preset === p.id ? 'on' : ''}`} onClick={() => setPreset(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="two">
          <label className="field">
            <span>From</span>
            <input className="input" type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
          </label>
          <label className="field">
            <span>To</span>
            <input className="input" type="date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </label>
        </div>
      )}
      {err && <div className="notice notice-warn">{err}</div>}

      {t && (
        <>
          <div className="stats">
            <Stat label="Net sales (incl. tax)" value={money(t.net, cur)} sub={`${t.orders} orders · avg ${money(t.avgOrder, cur)}`} />
            <Stat label="Gross (before discount)" value={money(t.gross, cur)} />
            <Stat label="Discounts given" value={money(t.discounts, cur)} />
            <Stat label={`${s.taxName} collected`} value={money(t.tax, cur)} />
            <Stat label="Delivery charges" value={money(t.delivery, cur)} />
            <Stat label="Payments received" value={money(t.collected, cur)} />
            <Stat label="Still unpaid" value={money(t.unpaidTotal, cur)} sub={`${t.unpaidOrders} orders`} />
            <Stat label="Cancelled orders" value={t.cancelled} />
          </div>

          <div className="report-cols">
            <Table title="By payment method" rows={data.byPayment} cur={cur} label={(k) => PAY_METHOD_LABEL[k] || k} />
            <Table title="By order type" rows={data.byType} cur={cur} label={(k) => TYPE_LABEL[k] || k} />
            <Table title="Online vs counter" rows={data.bySource} cur={cur} label={(k) => (k === 'online' ? 'Website orders' : 'Counter (POS)')} />
          </div>

          {data.topItems?.length > 0 && (
            <div className="card pad">
              <h3>Top selling items</h3>
              <table className="rtable">
                <tbody>
                  {data.topItems.map((i) => (
                    <tr key={i._id}>
                      <td>{i._id}</td>
                      <td>{i.qty} sold</td>
                      <td className="num">{money(i.revenue, cur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.daily?.length > 1 && (
            <div className="card pad">
              <h3>Sales by day</h3>
              <div className="bars">
                {data.daily.map((d) => (
                  <div key={d._id} className="bar-row">
                    <span className="small">{d._id}</span>
                    <div className="bar-track">
                      <div className="bar" style={{ width: `${(d.total / maxDaily) * 100}%` }} />
                    </div>
                    <span className="small num">{money(d.total, cur)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="actions">
        <button className="btn btn-ghost" onClick={load} disabled={busy}>
          {busy ? 'Refreshing…' : 'Refresh'}
        </button>
        <button className="btn" onClick={csv}>
          Download orders (CSV / Excel)
        </button>
      </div>
      <p className="muted small">Cancelled orders are excluded from sales. Refunds appear as cancelled bills.</p>
    </div>
  )
}
