import { PAY_METHOD_LABEL, PAY_STATUS_LABEL, TYPE_LABEL, fmtDateTime, money } from '../lib/utils'
import { BRAND } from '../config'

// Printable bill / receipt (80 mm thermal paper width; also prints fine on A4).
export default function ReceiptView({ order, settings }) {
  const cur = settings.currency
  const o = order
  const pay = o.payment || {}
  const num = (n) => Math.round(n).toLocaleString('en-PK')

  return (
    <div className="receipt">
      <div className="r-center">
        <div className="r-name">{BRAND}</div>
        {settings.address && <div>{settings.address}</div>}
        {settings.phone && <div>Tel: {settings.phone}</div>}
        {settings.taxNumber && <div>NTN/STRN: {settings.taxNumber}</div>}
      </div>

      <hr />
      <div className="r-row">
        <span>Invoice #</span>
        <strong>{o.invoiceNo}</strong>
      </div>
      <div className="r-row">
        <span>Date</span>
        <span>{fmtDateTime(o.createdAt)}</span>
      </div>
      <div className="r-row">
        <span>Type</span>
        <span>
          {TYPE_LABEL[o.orderType] || o.orderType}
          {o.table ? ` · Table ${o.table}` : ''}
        </span>
      </div>
      {o.customer?.name && (
        <div className="r-row">
          <span>Customer</span>
          <span>{o.customer.name}</span>
        </div>
      )}
      {o.customer?.phone && (
        <div className="r-row">
          <span>Phone</span>
          <span>{o.customer.phone}</span>
        </div>
      )}
      {o.orderType === 'delivery' && o.customer?.address && <div className="r-addr">{o.customer.address}</div>}
      {o.createdBy?.name && (
        <div className="r-row">
          <span>Cashier</span>
          <span>{o.createdBy.name}</span>
        </div>
      )}

      <hr />
      <table className="r-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {o.items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td>{i.qty}</td>
              <td>{num(i.price)}</td>
              <td>{num(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />
      <div className="r-row">
        <span>Subtotal</span>
        <span>{money(o.subtotal, cur)}</span>
      </div>
      {o.discount?.amount > 0 && (
        <div className="r-row">
          <span>Discount{o.discount.kind === 'percent' ? ` (${o.discount.value}%)` : ''}</span>
          <span>− {money(o.discount.amount, cur)}</span>
        </div>
      )}
      {o.tax > 0 && (
        <div className="r-row">
          <span>
            {settings.taxName} ({o.taxRate}%)
          </span>
          <span>{money(o.tax, cur)}</span>
        </div>
      )}
      {o.deliveryFee > 0 && (
        <div className="r-row">
          <span>Delivery</span>
          <span>{money(o.deliveryFee, cur)}</span>
        </div>
      )}
      <div className="r-row r-total">
        <span>TOTAL</span>
        <span>{money(o.total, cur)}</span>
      </div>

      <hr />
      <div className="r-row">
        <span>Payment</span>
        <span>{PAY_METHOD_LABEL[pay.method] || pay.method}</span>
      </div>
      <div className="r-row">
        <span>Status</span>
        <strong>{o.status === 'cancelled' ? 'CANCELLED' : (PAY_STATUS_LABEL[pay.status] || pay.status).toUpperCase()}</strong>
      </div>
      {pay.status === 'paid' && pay.method === 'cash' && pay.received > 0 && (
        <>
          <div className="r-row">
            <span>Cash received</span>
            <span>{money(pay.received, cur)}</span>
          </div>
          <div className="r-row">
            <span>Change</span>
            <span>{money(pay.change, cur)}</span>
          </div>
        </>
      )}
      {pay.tid && (
        <div className="r-row">
          <span>TID</span>
          <span>{pay.tid}</span>
        </div>
      )}
      {o.notes && <div className="r-addr">Note: {o.notes}</div>}

         <hr />
      <div className="r-center">{settings.receiptFooter}</div>
      <div className="r-center r-powered">Powered by EloraTech</div>
    </div>
  )
}