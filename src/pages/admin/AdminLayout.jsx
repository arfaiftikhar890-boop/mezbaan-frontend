import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Login from './Login'

export default function AdminLayout() {
  const { user, loading, logout, isAdmin } = useAuth()

  if (loading) return <div className="container section">Loading…</div>
  if (!user) return <Login />

  return (
    <div className="container section">
      <div className="admin-bar">
        <nav className="admin-tabs">
          <NavLink to="/admin" end>
            Orders
          </NavLink>
          <NavLink to="/admin/pos">Billing (POS)</NavLink>
          <NavLink to="/admin/menu">Menu</NavLink>
          {isAdmin && <NavLink to="/admin/reports">Reports</NavLink>}
          {isAdmin && <NavLink to="/admin/settings">Settings</NavLink>}
          {isAdmin && <NavLink to="/admin/users">Staff</NavLink>}
        </nav>
        <div className="admin-user">
          <span className="muted small">
            {user.name} · {user.role}
          </span>
          <button className="btn btn-sm btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
