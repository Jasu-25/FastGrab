import { useState } from 'react'
import { CalendarClock, CircleCheck, Download, Info, Landmark, Percent, Receipt, Smartphone, Wallet } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { usePlatform } from '../../../context/platformContext.js'
import { SHOP_ID } from '../../../data/merchantData.js'
import { SLABS, calcCommission, formatRate } from '../../../utils/commission.js'
import { compactPrice, formatPrice, parseIsoDate } from '../../../utils/format.js'
import { Modal } from '../components/ui.jsx'
import './Payments.css'

const METHODS = [
  { id: 'Payout deduction', icon: Wallet, hint: 'Taken from your next weekly payout (₹28,410 available)' },
  { id: 'UPI · AutoPay', icon: Smartphone, hint: 'Pay instantly from your business UPI ID' },
  { id: 'Bank transfer', icon: Landmark, hint: 'NEFT/IMPS to FastGrab. Marked paid once it clears' },
]

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
]

const fmtDate = (iso) => parseIsoDate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function nextMonday(now) {
  const d = new Date(now)
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function exportCsv(rows) {
  const lines = [['Date', 'Transaction', 'Period', 'Orders', 'Sales (INR)', 'Rate', 'Commission (INR)', 'Method', 'Status']]
  rows.forEach((t) => lines.push([t.date, t.id, t.period, t.orders, t.sales, formatRate(t.rate), t.commission, t.method, t.status]))
  const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  Object.assign(document.createElement('a'), { href: url, download: 'fastgrab-commission-payments.csv' }).click()
  URL.revokeObjectURL(url)
}

function PayModal({ amount, onClose, onPay }) {
  const [method, setMethod] = useState(METHODS[0].id)
  return (
    <Modal
      title={`Pay ${formatPrice(amount)} commission`}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--accent btn--block" onClick={() => onPay(method)}>
          <CircleCheck size={18} /> Pay {formatPrice(amount)}
        </button>
      }
    >
      <div className="pay-methods" role="radiogroup" aria-label="Payment method">
        {METHODS.map(({ id, icon: Icon, hint }) => (
          <label key={id} className={`pay-option${method === id ? ' is-active' : ''}`}>
            <input type="radio" name="commission-method" checked={method === id} onChange={() => setMethod(id)} />
            <span className="pay-option__icon"><Icon size={18} /></span>
            <span>
              <strong>{id}</strong>
              <small>{hint}</small>
            </span>
          </label>
        ))}
      </div>
    </Modal>
  )
}

function Payments() {
  const { revenue, now, toast } = useMerchant()
  const { transactions, payCommission } = usePlatform()
  const [filter, setFilter] = useState('all')
  const [paying, setPaying] = useState(false)

  const mine = transactions.filter((t) => t.shopId === SHOP_ID)
  const pending = mine.filter((t) => t.status === 'pending')
  const due = pending.reduce((n, t) => n + t.commission, 0)
  const paid = mine.filter((t) => t.status === 'paid')
  const paidTotal = paid.reduce((n, t) => n + t.commission, 0)
  const month = revenue[revenue.length - 1]
  const c = calcCommission(month.value)
  const rows = mine.filter((t) => filter === 'all' || t.status === filter)

  const pay = (method) => {
    const amount = payCommission(SHOP_ID, method)
    setPaying(false)
    toast(`Paid ${formatPrice(amount)} to FastGrab via ${method}.`)
  }

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Payments</h1>
          <p className="m-sub">Commission is charged on each completed order and settled with FastGrab every week.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={() => exportCsv(mine)}>
          <Download size={16} /> Export statement
        </button>
      </div>

      <div className="pay-top">
        <section className={`pay-due${due ? '' : ' is-clear'}`}>
          <p className="pay-due__label">{due ? 'Commission due' : 'All settled'}</p>
          <strong className="pay-due__amount">{formatPrice(due)}</strong>
          <p className="pay-due__meta">
            {due ? (
              <>
                <CalendarClock size={14} /> For {pending.map((t) => t.period).join(', ')} · auto-deducted {nextMonday(now)} if unpaid
              </>
            ) : (
              <>
                <CircleCheck size={14} /> Nothing to pay. Next statement {nextMonday(now)}.
              </>
            )}
          </p>
          {due > 0 && (
            <button type="button" className="btn pay-due__btn" onClick={() => setPaying(true)}>
              Pay now
            </button>
          )}
        </section>

        <div className="pay-tiles">
          <div className="m-stat">
            <span className="m-stat__icon tone-green"><Percent size={18} /></span>
            <strong className="m-stat__value">{formatRate(c.currentRate)}</strong>
            <span className="m-stat__label">Rate on each order now</span>
          </div>
          <div className="m-stat">
            <span className="m-stat__icon tone-blue"><Receipt size={18} /></span>
            <strong className="m-stat__value">{formatPrice(c.total)}</strong>
            <span className="m-stat__label">Commission in {month.full.split(' ')[0]}</span>
          </div>
          <div className="m-stat">
            <span className="m-stat__icon tone-purple"><Wallet size={18} /></span>
            <strong className="m-stat__value">{formatPrice(paidTotal)}</strong>
            <span className="m-stat__label">Paid to FastGrab ({paid.length} payments)</span>
          </div>
        </div>
      </div>

      <section className="m-panel m-panel--pad pay-how">
        <h2 className="m-panel__title"><Info size={16} /> How your commission is calculated</h2>
        <p className="pay-how__text">
          Each order is charged at the rate of the sales band you’re in that month. Your monthly sales counter resets
          on the 1st, so every month starts commission-free.
        </p>
        <ol className="pay-bands">
          {SLABS.map((s, i) => (
            <li key={s.from} className={i === c.currentIndex ? 'is-current' : ''}>
              <span>{Number.isFinite(s.to) ? `${compactPrice(s.from)} – ${compactPrice(s.to)}` : `Above ${compactPrice(s.from)}`}</span>
              <strong>{formatRate(s.rate)}</strong>
              {i === c.currentIndex && <em>You’re here</em>}
            </li>
          ))}
        </ol>
      </section>

      <section className="m-panel">
        <div className="m-panel__head pay-list__head">
          <div>
            <h2 className="m-panel__title">Payments to FastGrab</h2>
            <p className="pay-list__sub">Weekly commission settlements</p>
          </div>
          <div className="m-seg" role="tablist" aria-label="Filter payments">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? 'is-active' : ''} onClick={() => setFilter(f.id)}>
                {f.label} <span>{f.id === 'all' ? mine.length : mine.filter((t) => t.status === f.id).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead>
              <tr>
                <th>Date</th><th>Transaction</th><th>Period</th><th className="num">Orders</th><th className="num">Sales</th><th className="num">Commission</th><th>Method</th><th className="num">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{fmtDate(t.date)}</td>
                  <td className="strong">{t.id}</td>
                  <td>{t.period}</td>
                  <td className="num">{t.orders}</td>
                  <td className="num">{formatPrice(t.sales)}</td>
                  <td className="num strong">
                    {formatPrice(t.commission)} <small className="pay-rate">{formatRate(t.rate)}</small>
                  </td>
                  <td>{t.method}</td>
                  <td className="num">
                    <span className={`m-pill ${t.status === 'paid' ? 'm-pill--soft-green' : 'm-pill--amber'}`}>
                      {t.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}><strong>Total ({rows.length})</strong></td>
                <td className="num strong">{formatPrice(rows.reduce((n, t) => n + t.sales, 0))}</td>
                <td className="num strong text-green">{formatPrice(rows.reduce((n, t) => n + t.commission, 0))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {paying && <PayModal amount={due} onClose={() => setPaying(false)} onPay={pay} />}
    </>
  )
}

export default Payments
