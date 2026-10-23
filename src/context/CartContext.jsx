import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'cafe_cart_v2'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage can be unavailable */
    }
  }, [items])

  const value = useMemo(() => {
    const add = (item, qty = 1, notes = '') =>
      setItems((cur) => {
        const note = String(notes || '').trim().slice(0, 150)
        const found = cur.find((i) => i.id === item.id)
        if (found) return cur.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty, notes: note || i.notes || '' } : i))
        return [...cur, { id: item.id, name: item.name, price: Number(item.price), imageUrl: item.imageUrl || '', category: item.category || '', qty, notes: note }]
      })
    const inc = (id) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
    const dec = (id) => setItems((cur) => cur.flatMap((i) => (i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i])))
    const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id))
    const clear = () => setItems([])
    const qtyOf = (id) => items.find((i) => i.id === id)?.qty || 0
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const count = items.reduce((s, i) => s + i.qty, 0)
    return { items, add, inc, dec, remove, clear, qtyOf, subtotal, count }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
