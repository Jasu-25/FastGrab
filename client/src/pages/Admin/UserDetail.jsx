import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Pencil } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { commissionFor } from '../../data/platformData.js'
import { initialsOf } from '../../data/merchantData.js'
import { formatPrice, parseIsoDate } from '../../utils/format.js'
import { formatRate } from '../../utils/commission.js'
import { Modal } from '../Merchant/components/ui.jsx'
import { ShopThumb } from './components.jsx'
import './Admin.css'

const PLANS = [
  { type: 'standard', label: 'Standard slabs', hint: '0% up to ₹50k, then 1% · 1.5% · 2% by monthly sales' },
  { type: 'flat', label: 'Flat rate', hint: 'One rate on every order, whatever the monthly sales' },
  { type: 'exempt', label: 'Exempt', hint: 'No commission (pilot partners, charities)' },
]

function PlanModal({ shop, onClose }) {
  const { setPlan } = usePlatform()
  const [type, setType] = useState(shop.plan.type)
  const [rate, setRate] = useState(shop.plan.rate ? shop.plan.rate * 100 : 1.5)
  const invalid = type === 'flat' && !(rate > 0 && rate <= 10)

  return (
    <Modal
      title="Change commission plan"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={invalid}
          onClick={() => {
            setPlan(shop.id, type === 'flat' ? { type, rate: rate / 100 } : { type })
            onClose()
          }}
        >
          Save plan
        </button>
      }
    >
      <div className="plan-options" role="radiogroup" aria-label="Commission plan">
        {PLANS.map((p) => (
          <label key={p.type} className={`plan-option${type === p.type ? ' is-active' : ''}`}>
            <input type="radio" name="plan" checked={type === p.type} onChange={() => setType(p.type)} />
            <span><strong>{p.label}</strong><small>{p.hint}</small></span>
          </label>
        ))}
      </div>
      {type === 'flat' && (
        <label className="plan-rate">
          <span className="field__label">Rate on each order (%)</span>
          <input type="number" min="0.1" max="10" step="0.1" className={`input input--filled${invalid ? ' input--error' : ''}`} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          {invalid && <span className="field__error">Enter a rate between 0.1% and 10%.</span>}
        </label>
      )}
      <p className="plan-note">The new plan applies to orders from now on. Past settlements don’t change.</p>
    </Modal>
  )
}

function exportCsv(name, rows) {
  const lines = [['Date', 'Transaction', 'Period', 'Sales (INR)', 'Commission (INR)', 'Method', 'Status']]
  rows.forEach((t) => lines.push([t.date, t.id, t.period, t.sales, t.commission, t.method, t.status]))
  const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  Object.assign(document.createElement('a'), { href: url, download: `${name.replace(/\W+/g, '-').toLowerCase()}-commission.csv` }).click()
  URL.revokeObjectURL(url)
}

function UserDetail() {
  const { userId } = useParams()
  const { shops, transactions } = usePlatform()
  const [editing, setEditing] = useState(false)
  const [month] = useState(() => new Date().toLocaleDateString('en-IN', { month: 'short' }))
  const shop = shops.find((s) => s.owner.id === userId)

  if (!shop) {
    return <div className="m-panel m-empty">User not found. <Link to="/admin/users" className="link">Back to users</Link></div>
  }

  const { owner } = shop
  const c = commissionFor(shop.plan, shop.revenueMonth)
  const txns = transactions.filter((t) => t.shopId === shop.id)
  const paid = txns.filter((t) => t.status === 'paid').reduce((n, t) => n + t.commission, 0)
  const pending = txns.filter((t) => t.status === 'pending').reduce((n, t) => n + t.commission, 0)

  return (
    <>
      <Link to="/admin/users" className="a-back"><ArrowLeft size={14} /> All users</Link>

      <section className="m-panel m-panel--pad ud-head">
        <span className="ud-avatar" style={{ background: owner.color }}>{initialsOf(owner.name)}</span>
        <div className="ud-head__text">
          <h1>{owner.name}</h1>
          <p>{owner.email} · {owner.phone} · Joined {shop.since}</p>
        </div>
        <div className="ud-plan">
          <span>
            <small>Commission plan</small>
            <strong>{c.label}{shop.plan.type === 'standard' && ` · ${formatRate(c.rate)} now`}</strong>
          </span>
          <button type="button" onClick={() => setEditing(true)} aria-label="Change commission plan"><Pencil size={15} /></button>
        </div>
      </section>

      <div className="m-stats">
        <Link to={`/admin/shops/${shop.id}`} className="m-stat ud-shop">
          <ShopThumb shop={shop} size={44} />
          <span><span className="m-stat__label">Shop</span><strong>{shop.name}</strong></span>
        </Link>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Monthly revenue</span><strong className="m-stat__value">{formatPrice(shop.revenueMonth)}</strong><span className={`a-trend ${shop.trend >= 0 ? 'is-up' : 'is-down'}`}>{shop.trend >= 0 ? '+' : ''}{shop.trend}% vs last month</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Commission ({month})</span><strong className="m-stat__value">{formatPrice(c.total)}</strong><span className="m-stat__hint">{formatPrice(pending)} pending</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Total orders</span><strong className="m-stat__value">{(shop.ordersMonth * 7).toLocaleString('en-IN')}</strong><span className="m-stat__hint">{shop.ordersMonth.toLocaleString('en-IN')} this month</span></div>
      </div>

      <section className="m-panel">
        <div className="ud-txn-head">
          <div>
            <h2 className="m-panel__title">Commission Transactions</h2>
            <p>Payments made by this shop to FastGrab</p>
          </div>
          <div className="ud-total">
            <small>Total paid</small>
            <strong>{formatPrice(paid)}</strong>
          </div>
          <button type="button" className="btn btn--outline m-btn-sm" onClick={() => exportCsv(shop.name, txns)} disabled={!txns.length}><Download size={14} /> Export</button>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead><tr><th>Date</th><th>Transaction ID</th><th>Period</th><th className="num">Sales base</th><th className="num">Commission</th><th>Method</th><th className="num">Status</th></tr></thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{parseIsoDate(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="strong">{t.id}</td>
                  <td>{t.period}</td>
                  <td className="num">{formatPrice(t.sales)}</td>
                  <td className="num strong">{formatPrice(t.commission)}</td>
                  <td>{t.method}</td>
                  <td className="num"><span className={`m-pill ${t.status === 'paid' ? 'm-pill--soft-green' : 'm-pill--amber'}`}>{t.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
            {txns.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3}><strong>Last {txns.length} weeks</strong></td>
                  <td className="num strong">{formatPrice(txns.reduce((n, t) => n + t.sales, 0))}</td>
                  <td className="num strong text-green">{formatPrice(txns.reduce((n, t) => n + t.commission, 0))}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
          {txns.length === 0 && <p className="m-empty">No commission charged. This shop is exempt.</p>}
        </div>
      </section>

      {editing && <PlanModal shop={shop} onClose={() => setEditing(false)} />}
    </>
  )
}

export default UserDetail
