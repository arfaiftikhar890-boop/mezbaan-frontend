// The shop's contact number, shown across the whole site.
// The brand name shown on every page and receipt.
export const BRAND = 'MEZBAAN'

export const CONTACT = { phone: '0337-2384613', phoneDigits: '03372384613', whatsapp: '923372384613' }

// Shown until the real settings load from the server (Admin → Settings overrides all of these).
export const DEFAULT_SETTINGS = {
  name: 'MEZBAAN',
  tagline: 'Dil se khilaye, mehmaan banaye',
  about: '',
  address: 'MEZBAAN Main Albela Signal, Plot No 305, Shop No G3/G4, Garden West, Karachi, Pakistan',
  phone: CONTACT.phone,
  whatsapp: CONTACT.whatsapp,
  hours: '24 hours',
  currency: 'Rs.',
  acceptingOrders: true,
  deliveryFee: 0,
  minOrder: 0,
  taxName: 'Sales Tax',
  taxRate: 0,
  taxNumber: '',
  receiptFooter: 'Thank you for visiting!',
  maxCashierDiscount: 10,
  codEnabled: true,
  easypaisaEnabled: false,
  easypaisaNumber: '03022679909',
  easypaisaTitle: '',
  jazzcashNumber: '03372384613',
  jazzcashTitle: '',
  bankEnabled: false,
  bankDetails: 'Bank: AL HABIB\nTitle: MUHAMMAD AHSAN QURESHI\nAccount: 10820981012794014\nIBAN: PK07BAHL1082098101279401',
  onlinePaymentEnabled: false,
  gateways: { jazzcash: false, easypaisa: false },
}

export const PREFERRED_CATEGORY_ORDER = ['Pulao', 'Biryani Pot', 'Platters', 'Halwa Puri', 'Parathas', 'Lassi & Flavored Milk', 'Chai & Coffee', 'Shakes & Coolers', 'Beverages']

// Order-type popup (shown on the first visit). Replace these with the real cities, areas and branches from the client.
export const CITIES = ['Karachi']
export const AREAS = { Karachi: ['Pechs', 'Smchs', 'Bahadurabad', 'Saddar', 'Nazimabad', 'FB Area'] }
export const BRANCHES = { Karachi: ['MEZBAAN Main Branch'] }
