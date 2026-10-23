import { api } from '../api'

// The server calculates prices, tax and totals itself; we only send item ids and quantities.
export function createOrder({ orderType, customer, items, notes, paymentMethod, paymentRef }) {
  return api('/orders', {
    method: 'POST',
    body: {
      orderType,
      customer,
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
      notes,
      paymentMethod,
      paymentRef,
    },
  })
}

export const getPublicOrder = (publicId) => api(`/orders/public/${encodeURIComponent(publicId)}`)

// Starts an online payment for an order that was already created.
//   JazzCash  -> { action: 'post', url, fields }: the browser must submit these to JazzCash (see goToGateway)
//   Easypaisa -> { action: 'done', paid, message }: the customer approves on their phone
export const startPayment = (publicId, provider, mobile) => api('/payments/session', { method: 'POST', body: { publicId, provider, mobile } })

// JazzCash's hosted page expects a normal form POST from the browser.
export function goToGateway({ url, fields }) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
