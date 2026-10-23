import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function Staff() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'cashier' })
  const [pw, setPw] = useState({ current: '', next: '' })

  const load = useCallback(() => {
    api('/users')
      .then(setUsers)
      .catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  async function run(fn, done) {
    setErr('')
    setOk('')
    try {
      await fn()
      if (done) setOk(done)
      load()
    } catch (e) {
      setErr(e.message)
    }
  }

  const add = (e) => {
    e.preventDefault()
    run(async () => {
      await api('/users', { method: 'POST', body: f })
      setF({ name: '', email: '', password: '', role: 'cashier' })
    }, 'Staff account created.')
  }

  const changePw = (e) => {
    e.preventDefault()
    run(async () => {
      await api('/auth/change-password', { method: 'POST', body: pw })
      setPw({ current: '', next: '' })
    }, 'Your password was changed.')
  }

  return (
    <div className="stack">
      {err && <div className="notice notice-warn">{err}</div>}
      {ok && <div className="notice notice-ok">{ok}</div>}

      <div className="card pad">
        <h2>Staff accounts</h2>
        <p className="muted small">Admins can do everything. Cashiers can take orders, bill customers and receive payments, but cannot see reports or change prices, settings or paid bills.</p>
        <div className="card list">
          {users.map((u) => (
            <div key={u.id} className="line staff-line">
              <div className="line-main">
                <strong>
                  {u.name} {u.id === me.id && <span className="muted small">(you)</span>}
                </strong>
                <span className="muted">{u.email}</span>
              </div>
              <select className="input" value={u.role} disabled={u.id === me.id} onChange={(e) => run(() => api(`/users/${u.id}`, { method: 'PATCH', body: { role: e.target.value } }))}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  const password = window.prompt(`New password for ${u.name} (min 8 characters):`)
                  if (password) run(() => api(`/users/${u.id}`, { method: 'PATCH', body: { password } }), 'Password updated.')
                }}
              >
                Reset password
              </button>
              <button className={`btn btn-sm ${u.active ? 'btn-danger' : ''}`} disabled={u.id === me.id} onClick={() => run(() => api(`/users/${u.id}`, { method: 'PATCH', body: { active: !u.active } }))}>
                {u.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <form className="card pad" onSubmit={add}>
        <h3>Add staff</h3>
        <div className="two">
          <label className="field">
            <span>Name</span>
            <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </label>
          <label className="field">
            <span>Email (login)</span>
            <input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
          </label>
        </div>
        <div className="two">
          <label className="field">
            <span>Password (min 8)</span>
            <input className="input" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} minLength={8} required autoComplete="new-password" />
          </label>
          <label className="field">
            <span>Role</span>
            <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <button className="btn btn-sm">Create account</button>
      </form>

      <form className="card pad" onSubmit={changePw}>
        <h3>Change my password</h3>
        <div className="two">
          <label className="field">
            <span>Current password</span>
            <input className="input" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" required />
          </label>
          <label className="field">
            <span>New password (min 8)</span>
            <input className="input" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} minLength={8} autoComplete="new-password" required />
          </label>
        </div>
        <button className="btn btn-sm">Change password</button>
      </form>
    </div>
  )
}
