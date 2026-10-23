export const money = (n, cur = 'Rs.') => `${cur} ${Math.round(Number(n) || 0).toLocaleString('en-PK')}`

export const cleanPhone = (p) => String(p || '').replace(/[\s\-()]/g, '')

// Accepts 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX
export const isValidPkPhone = (p) => /^(\+92|92|0)?3\d{9}$/.test(cleanPhone(p))

export const waLink = (number, text) => `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

// Same maths as the server (server/src/services/billing.js). The server is the source of truth;
// this only previews the bill on screen.
export function computeTotals({ subtotal, discount, taxRate = 0, deliveryFee = 0 }) {
  const d = discount || { kind: 'none', value: 0 }
  let discountAmount = 0
  const v = Number(d.value) || 0
  if (d.kind === 'percent') discountAmount = Math.round((subtotal * Math.min(Math.max(v, 0), 100)) / 100)
  else if (d.kind === 'amount') discountAmount = Math.min(Math.round(Math.max(v, 0)), subtotal)
  const taxable = subtotal - discountAmount
  const tax = Math.round((taxable * (Number(taxRate) || 0)) / 100)
  const total = taxable + tax + Math.round(deliveryFee || 0)
  return { discountAmount, taxable, tax, total }
}

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

export const TYPE_LABEL = { delivery: 'Delivery', pickup: 'Pickup', dinein: 'Dine-in', takeaway: 'Takeaway' }
export const PAY_METHOD_LABEL = {
  cash: 'Cash',
  cod: 'Cash on delivery',
  card: 'Card',
  wallet: 'Easypaisa / JazzCash',
  bank: 'Bank transfer',
  online: 'Online payment',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
}
export const PAY_STATUS_LABEL = { unpaid: 'Unpaid', verification: 'To verify', paid: 'Paid', refunded: 'Refunded' }

export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    o.start()
    o.stop(ctx.currentTime + 0.6)
  } catch {
    /* sound is optional */
  }
}

export const telHref = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`
