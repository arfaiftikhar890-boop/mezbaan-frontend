import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { money } from '../lib/utils'
import { ItemImage } from '../components/ItemCard'
import { CategoryArt } from '../components/Art'
import HelpLine from '../components/HelpLine'

export default function Cart() {
  const { items, inc, dec, remove, clear, subtotal } = useCart()
  const s = useSettings()

  if (items.length === 0) {
    return (
      <div className="container section empty">
        <CategoryArt category="Coffee" className="empty-art" />
        <h1 className="page-title">Your cart is empty</h1>
        <p className="muted">Add something delicious from the menu.</p>
        <Link to="/menu" className="btn">
          Browse the menu
        </Link>
        <HelpLine />
      </div>
    )
  }

  const belowMin = s.minOrder > 0 && subtotal < s.minOrder

  return (
    <div className="container section narrow">
      <div className="section-head">
        <h1 className="page-title">Your cart</h1>
        <button className="link danger" onClick={clear}>
          Clear all
        </button>
      </div>

      <div className="card list">
        {items.map((i) => (
          <div key={i.id} className="line">
            <div className="line-img">
              <ItemImage item={i} />
            </div>
            <div className="line-main">
              <strong>{i.name}</strong>
              <span className="muted">{money(i.price, s.currency)}</span>
              {i.notes && <small className="muted line-note">Note: {i.notes}</small>}
            </div>
            <div className="stepper">
              <button onClick={() => dec(i.id)} aria-label={`Remove one ${i.name}`}>
                −
              </button>
              <span>{i.qty}</span>
              <button onClick={() => inc(i.id)} aria-label={`Add one ${i.name}`}>
                +
              </button>
            </div>
            <div className="line-total">{money(i.price * i.qty, s.currency)}</div>
            <button className="icon-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card summary">
        <div className="row">
          <span>Subtotal</span>
          <span>{money(subtotal, s.currency)}</span>
        </div>
        <p className="muted small">Delivery fee (if any) is added at checkout.</p>
        {belowMin && (
          <div className="notice notice-warn">
            Minimum order is {money(s.minOrder, s.currency)}. Add {money(s.minOrder - subtotal, s.currency)} more.
          </div>
        )}
        <div className="actions">
          <Link to="/menu" className="btn btn-ghost">
            Add more
          </Link>
          <Link to="/checkout" className={`btn ${belowMin ? 'disabled' : ''}`} aria-disabled={belowMin} onClick={(e) => belowMin && e.preventDefault()}>
            Checkout
          </Link>
        </div>
      </div>
      <HelpLine />
    </div>
  )
}
