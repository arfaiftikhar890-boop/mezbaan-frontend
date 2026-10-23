import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useMenu, groupByCategory, categoriesOf } from '../../hooks/useMenu'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../lib/utils'
import { ItemImage } from '../../components/ItemCard'

const EMPTY = { name: '', price: '', category: '', description: '', available: true, featured: false }

function ItemForm({ initial, categories, onCancel, onSaved }) {
  const [f, setF] = useState({ ...EMPTY, ...initial })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function save(e) {
    e.preventDefault()
    setMsg('')
    if (!f.name.trim()) return setMsg('Name is required.')
    if (!f.category.trim()) return setMsg('Category is required.')
    if (f.price === '' || Number(f.price) < 0) return setMsg('Enter a valid price.')
    if (file && file.size > 1.5 * 1024 * 1024) return setMsg('Photo is too large (max 1.5 MB). Please choose a smaller one.')
    setBusy(true)
    try {
      const form = new FormData()
      form.append('name', f.name.trim())
      form.append('price', String(Number(f.price)))
      form.append('category', f.category.trim())
      form.append('description', f.description.trim())
      form.append('available', String(Boolean(f.available)))
      form.append('featured', String(Boolean(f.featured)))
      if (file) form.append('image', file)
      if (removeImage && !file) form.append('removeImage', 'true')
      if (initial?.id) await api(`/menu/${initial.id}`, { method: 'PUT', form })
      else await api('/menu', { method: 'POST', form })
      onSaved()
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  const shownImage = preview || (removeImage ? '' : f.imageUrl)

  return (
    <form className="card pad form-card" onSubmit={save}>
      <h2>{initial?.id ? 'Edit item' : 'Add item'}</h2>
      <div className="two">
        <label className="field">
          <span>Name</span>
          <input className="input" value={f.name} onChange={set('name')} required />
        </label>
        <label className="field">
          <span>Price</span>
          <input className="input" type="number" min="0" step="1" value={f.price} onChange={set('price')} required />
        </label>
      </div>
      <label className="field">
        <span>Category</span>
        <input className="input" list="cats" value={f.category} onChange={set('category')} placeholder="e.g. Coffee" required />
        <datalist id="cats">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label className="field">
        <span>Description</span>
        <textarea className="input" rows={2} value={f.description} onChange={set('description')} />
      </label>
      <div className="field">
        <span>Photo (JPG, PNG or WebP, max 1.5 MB)</span>
        <div className="photo-row">
          <div className="photo-prev">
            <ItemImage item={f} src={shownImage} />
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null)
                setRemoveImage(false)
              }}
            />
            {(shownImage || f.imageUrl) && (
              <button
                type="button"
                className="link danger"
                onClick={() => {
                  setFile(null)
                  setPreview('')
                  setRemoveImage(true)
                }}
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="checks">
        <label>
          <input type="checkbox" checked={f.available} onChange={set('available')} /> Available
        </label>
        <label>
          <input type="checkbox" checked={f.featured} onChange={set('featured')} /> Show as popular on home page
        </label>
      </div>
      {msg && <div className="notice notice-warn">{msg}</div>}
      <div className="actions">
        <button className="btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function MenuManager() {
  const { items, loading, error, reload } = useMenu()
  const s = useSettings()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(null)
  const [err, setErr] = useState('')

  const cats = categoriesOf(items)
  const groups = groupByCategory(items)

  const run = async (fn) => {
    try {
      await fn()
      setErr('')
      reload()
    } catch (e) {
      setErr(e.message)
    }
  }

  if (editing) {
    return (
      <ItemForm
        initial={editing.id ? editing : null}
        categories={cats}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          reload()
        }}
      />
    )
  }

  return (
    <div>
      {(err || error) && <div className="notice notice-warn">{err || error}</div>}
      <div className="section-head">
        <h2>Menu items ({items.length})</h2>
        {isAdmin && (
          <button className="btn btn-sm" onClick={() => setEditing({})}>
            + Add item
          </button>
        )}
      </div>
      {!isAdmin && <p className="muted small">Cashiers can mark items sold out or available. Only the admin can edit the menu.</p>}

      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length === 0 && !error && isAdmin && (
        <div className="card pad">
          <p>Your menu is empty.</p>
          <div className="actions">
            <button className="btn" onClick={() => setEditing({})}>
              Add the first item
            </button>
            <button className="btn btn-ghost" onClick={() => run(() => api('/menu/seed', { method: 'POST' }))}>
              Load sample menu
            </button>
          </div>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.name} className="menu-group">
          <h3>{g.name}</h3>
          <div className="card list">
            {g.items.map((i) => (
              <div key={i.id} className="line">
                <div className="line-img">
                  <ItemImage item={i} />
                </div>
                <div className="line-main">
                  <strong>{i.name}</strong>
                  <span className="muted">
                    {money(i.price, s.currency)}
                    {i.featured ? ' · ⭐ popular' : ''}
                  </span>
                </div>
                <label className="switch" title="Available">
                  <input type="checkbox" checked={i.available !== false} onChange={(e) => run(() => api(`/menu/${i.id}/available`, { method: 'PATCH', body: { available: e.target.checked } }))} />
                  <span>{i.available !== false ? 'Available' : 'Sold out'}</span>
                </label>
                {isAdmin && (
                  <>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing(i)}>
                      Edit
                    </button>
                    <button className="icon-btn" aria-label={`Delete ${i.name}`} onClick={() => window.confirm(`Delete "${i.name}"?`) && run(() => api(`/menu/${i.id}`, { method: 'DELETE' }))}>
                      🗑
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
