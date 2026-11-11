import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Clock, Download, IndianRupee, Percent, Search } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { formatPrice, parseIsoDate } from '../../utils/format.js'
import { formatRate } from '../../utils/commission.js'
import { StatCard } from '../Merchant/components/ui.jsx'
import { ShopThumb } from './components.jsx'
import './Admin.css'

function Transactions() {
  const { transactions, shops } = usePlatform()
  const [status, setStatus] = useState('all')
  const [shopId, setShopId] = useState('all')
  const [query, setQuery] = useState('')

  const shopOf = (id) => shops.find((s) => s.id === id)
  const q = query.trim().toLowerCase()
  const rows = transactions
    .filter((t) => status === 'all' || t.status === status)
    .filter((t) => shopId === 'all' || t.shopId === shopId)
    .filter((t) => !q || t.id.toLowerCase().includes(q) || shopOf(t.shopId).name.toLowerCase().includes(q))

  const paid = transactions.filter((t) => t.status === 'paid')
  const pending = transactions.filter((t) => t.status === 'pending')
  const sum = (list, k) => list.reduce((n, t) => n + t[k], 0)

  const exportCsv = () => {
    const lines = [['Date', 'Transaction', 'Shop', 'Period', 'Sales (INR)', 'Rate', 'Commission (INR)', 'Method', 'Status']]
    rows.forEach((t) => lines.push([t.date, t.id, shopOf(t.shopId).name, t.period, t.sales, formatRate(t.rate), t.commission, t.method, t.status]))
    const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    Object.assign(document.createElement('a'), { href: url, download: 'fastgrab-transactions.csv' }).click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Transactions</h1>
          <p className="m-sub">Weekly commission settlements from every partner shop</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={exportCsv}><Download size={16} /> Export CSV</button>
      </div>

      <div className="m-stats">
        <StatCard label="Collected (6 weeks)" value={formatPrice(sum(paid, 'commission'))} icon={CircleCheck} tone="green" />
        <StatCard label="Pending this week" value={formatPrice(sum(pending, 'commission'))} icon={Clock} tone="orange" trend={`${pending.length} shops`} trendTone="flat" />
        <StatCard label="Sales base" value={formatPrice(sum(transactions, 'sales'))} icon={IndianRupee} tone="blue" />
        <StatCard label="Average rate" value={formatRate(sum(transactions, 'commission') / sum(transactions, 'sales'))} icon={Percent} tone="purple" />
      </div>

      <section className="m-panel a-table-panel">
        <div className="a-table-tools">
          <div className="m-seg" role="tablist" aria-label="Status">
            {['all', 'paid', 'pending'].map((s) => (
              <button key={s} type="button" role="tab" aria-selected={status === s} className={status === s ? 'is-active' : ''} onClick={() => setStatus(s)}>
                {s === 'all' ? 'All' : s === 'paid' ? 'Paid' : 'Pending'} <span>{s === 'all' ? transactions.length : transactions.filter((t) => t.status === s).length}</span>
              </button>
            ))}
          </div>
          <div className="a-filters">
            <label className="search-box">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search transactions</span>
              <input type="search" placeholder="Transaction ID or shop" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <select className="input input--filled a-select" value={shopId} onChange={(e) => setShopId(e.target.value)} aria-label="Shop">
              <option value="all">All shops</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead><tr><th>Date</th><th>Transaction</th><th>Shop</th><th>Period</th><th className="num">Sales</th><th className="num">Commission</th><th>Method</th><th className="num">Status</th></tr></thead>
            <tbody>
              {rows.map((t) => {
                const s = shopOf(t.shopId)
                return (
                  <tr key={t.id}>
                    <td>{parseIsoDate(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="strong">{t.id}</td>
                    <td><Link to={`/admin/shops/${s.id}`} className="a-shop a-shop--sm"><ShopThumb shop={s} size={28} /><strong>{s.name}</strong></Link></td>
                    <td>{t.period}</td>
                    <td className="num">{formatPrice(t.sales)}</td>
                    <td className="num strong">{formatPrice(t.commission)} <small className="a-rate">{formatRate(t.rate)}</small></td>
                    <td>{t.method}</td>
                    <td className="num"><span className={`m-pill ${t.status === 'paid' ? 'm-pill--soft-green' : 'm-pill--amber'}`}>{t.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="m-empty">No transactions match.</p>}
        </div>
      </section>
    </>
  )
}

export default Transactions
