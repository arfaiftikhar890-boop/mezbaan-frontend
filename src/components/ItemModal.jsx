import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { money } from '../lib/utils'
import { ItemImage } from './ItemCard'

const MAX_NOTE = 150

// Popup that opens when a menu item is clicked: photo, price, description,
// special instructions, quantity and an "Add To Cart" button.
export default function ItemModal({ item, onClose }) {
  const { add } = useCart()
  const s = useSettings()
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const soldOut = item.available === false

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  function addToCart() {
    add(item, qty, notes)
    onClose()
  }

  return createPortal(
    <div className="im-backdrop" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className="im-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="im-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="im-img">
          <ItemImage item={item} />
        </div>

        <div className="im-side">
          <div className="im-body">
            <h2>{item.name}</h2>
            <strong className="im-price">{money(item.price, s.currency)}</strong>
            {item.description && <p className="muted im-desc">{item.description}</p>}

            <div className="im-instr">
              <h3>Instructions</h3>
              <textarea
                className="input"
                rows={3}
                maxLength={MAX_NOTE}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
                aria-label="Special instructions"
              />
              <span className="im-count">
                {notes.length}/{MAX_NOTE}
              </span>
            </div>
          </div>

          <div className="im-foot">
            <div className="im-qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label="Increase quantity">
                +
              </button>
            </div>
            {soldOut ? (
              <button type="button" className="btn im-add" disabled>
                Sold out
              </button>
            ) : (
              <button type="button" className="btn im-add" onClick={addToCart}>
                <span>{money(item.price * qty, s.currency)}</span>
                <strong>Add To Cart</strong>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
