import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { assetUrl } from '../api'
import { money } from '../lib/utils'
import { flyToCart } from '../lib/fly'
import { CategoryArt, tintOf } from './Art'
import ItemModal from './ItemModal'

export function ItemImage({ item, src }) {
  const url = assetUrl(src || item.imageUrl)
  if (url) return <img src={url} alt={item.name || ''} loading="lazy" />
  return (
    <div className="img-fallback" style={{ background: tintOf(item.category) }} aria-hidden="true">
      <CategoryArt category={item.category} />
    </div>
  )
}

// Cards lean toward the pointer (desktop only) and set the CSS vars the stylesheet reads.
function tilt(e) {
  if (e.pointerType === 'touch') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
  el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`)
  el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(0)}%`)
  el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(0)}%`)
}
function untilt(e) {
  e.currentTarget.style.setProperty('--ry', '0deg')
  e.currentTarget.style.setProperty('--rx', '0deg')
}

export default function ItemCard({ item }) {
  const { add, inc, dec, qtyOf } = useCart()
  const s = useSettings()
  const qty = qtyOf(item.id)
  const soldOut = item.available === false
  const [open, setOpen] = useState(false)

  return (
    <>
    <article
      className={`card item item-click ${soldOut ? 'sold-out' : ''}`}
      onPointerMove={tilt}
      onPointerLeave={untilt}
      onClick={(e) => {
        if (e.target.closest('button, .stepper')) return
        setOpen(true)
      }}
    >
      <div className="item-img">
        <ItemImage item={item} />
        {soldOut && <span className="tag">Sold out</span>}
        {item.featured && !soldOut && <span className="tag tag-hot">Top pick</span>}
      </div>
      <div className="item-body">
        <h3>{item.name}</h3>
        {item.description && <p className="muted">{item.description}</p>}
        <div className="item-foot">
          <strong className="price">{money(item.price, s.currency)}</strong>
          {soldOut ? null : qty === 0 ? (
            <button
              className="btn btn-sm btn-add"
              onClick={(e) => {
                flyToCart(e.currentTarget)
                add(item)
              }}
              aria-label={`Add ${item.name} to cart`}
            >
              Add
            </button>
          ) : (
            <div className="stepper" role="group" aria-label={`Quantity of ${item.name}`}>
              <button onClick={() => dec(item.id)} aria-label="Remove one">
                −
              </button>
              <span key={qty} className="qty">
                {qty}
              </span>
              <button
                onClick={(e) => {
                  flyToCart(e.currentTarget)
                  inc(item.id)
                }}
                aria-label="Add one"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
      {open && <ItemModal item={item} onClose={() => setOpen(false)} />}
    </>
  )
}
