import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMenu, groupByCategory } from '../hooks/useMenu'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { money, telHref } from '../lib/utils'
import ItemCard from '../components/ItemCard'

const slug = (name) => `cat-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`

export default function Menu() {
  const { items, loading, error } = useMenu()
  const { count, subtotal } = useCart()
  const s = useSettings()
  const [params] = useSearchParams()
  const [q, setQ] = useState('')
  const [active, setActive] = useState('')
  const lockUntil = useRef(0)
  const tabsRef = useRef(null)
  const jumped = useRef(false)

  // "Top Picks" first (like the reference site), then one section per category.
  const search = q.trim().toLowerCase()
  const filtered = items.filter((i) => !search || `${i.name} ${i.description || ''}`.toLowerCase().includes(search))
  const base = groupByCategory(filtered).filter((g) => g.items.length)
  const top = search ? [] : filtered.filter((i) => i.featured && i.available !== false).slice(0, 8)
  const groups = top.length ? [{ name: 'Top Picks', items: top }, ...base] : base
  const key = groups.map((g) => g.name).join('|')
  const current = groups.some((g) => g.name === active) ? active : groups[0]?.name

  function go(name) {
    lockUntil.current = Date.now() + 900
    setActive(name)
    document.getElementById(slug(name))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Highlight the tab of the section currently under the sticky bar.
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-cat]')]
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (seen) setActive(seen.target.dataset.cat)
      },
      { rootMargin: '-130px 0px -65% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key])

  // Slide the underline to the active tab and keep that tab in view.
  useLayoutEffect(() => {
    const box = tabsRef.current
    const tab = box?.querySelector(`[data-tab="${CSS.escape(current || '')}"]`)
    if (!box || !tab) return
    box.style.setProperty('--x', `${tab.offsetLeft}px`)
    box.style.setProperty('--w', `${tab.offsetWidth}px`)
    box.scrollTo({ left: tab.offsetLeft - box.clientWidth / 2 + tab.offsetWidth / 2, behavior: 'smooth' })
  }, [current, key])

  // Coming from a Home tile (?cat=Pulao): jump straight to that section once the menu is on screen.
  useEffect(() => {
    const c = params.get('cat')
    if (!c || jumped.current || loading || !groups.some((g) => g.name === c)) return
    const t = setTimeout(() => {
      jumped.current = true
      go(c)
    }, 350)
    return () => clearTimeout(t)
  })

  return (
    <div className="container section">
      <h1 className="page-title">Our menu</h1>
      <p className="muted menu-call">
        Prefer to order by phone? Call <a href={telHref(s.phone)}>{s.phone}</a>.
      </p>

      {!s.acceptingOrders && <div className="notice notice-warn">We are not taking online orders right now.</div>}

      <div className="toolbar">
        <input type="search" className="input" placeholder="Search the menu…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the menu" />
      </div>

      {groups.length > 0 && (
        <div className="menu-tabs">
          <div className="mtabs-scroll" role="tablist" aria-label="Menu categories" ref={tabsRef}>
            {groups.map((g) => (
              <button key={g.name} role="tab" data-tab={g.name} aria-selected={current === g.name} className={`mtab ${current === g.name ? 'on' : ''}`} onClick={() => go(g.name)}>
                {g.name}
              </button>
            ))}
            <span className="mtabs-bar" aria-hidden="true" />
          </div>
        </div>
      )}

      {loading && <p className="muted">Loading menu…</p>}
      {error && <div className="notice notice-warn">Could not load the menu ({error}).</div>}
      {!loading && !error && items.length === 0 && <p className="muted">The menu is coming soon.</p>}
      {!loading && items.length > 0 && groups.length === 0 && <p className="muted">No items match your search.</p>}

      {groups.map((g) => (
        <section key={g.name} id={slug(g.name)} data-cat={g.name} className="menu-group">
          <h2 className="uline" data-reveal>
            {g.name}
          </h2>
          <div className="grid">
            {g.items.map((i, n) => (
              <div className="rv" key={i.id} data-reveal style={{ '--i': n % 4 }}>
                <ItemCard item={i} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {count > 0 && (
        <Link to="/cart" className="cart-bar">
          <span key={count} className="cart-bar-sum">
            {count} item{count > 1 ? 's' : ''}, {money(subtotal, s.currency)}
          </span>
          <strong>View cart</strong>
        </Link>
      )}
    </div>
  )
}
