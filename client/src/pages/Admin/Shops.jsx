import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { commissionFor } from '../../data/platformData.js'
import { compactPrice, formatPrice } from '../../utils/format.js'
import { formatRate } from '../../utils/commission.js'
import { ShopStatus, ShopThumb } from './components.jsx'
import './Admin.css'

function Shops() {
  const { shops } = usePlatform()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('revenue')

  const categories = [...new Set(shops.map((s) => s.category))]
  const q = query.trim().toLowerCase()
  const rows = shops
    .filter((s) => category === 'all' || s.category === category)
    .filter((s) => status === 'all' || s.status === status)
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.owner.name.toLowerCase().includes(q))
    .sort((a, b) => (sort === 'revenue' ? b.revenueMonth - a.revenueMonth : sort === 'orders' ? b.ordersMonth - a.ordersMonth : a.name.localeCompare(b.name)))

  const gmv = shops.reduce((n, s) => n + s.revenueMonth, 0)
  const commission = shops.reduce((n, s) => n + commissionFor(s.plan, s.revenueMonth).total, 0)
  const [monthLabel] = useState(() => new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }))

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Shop Management</h1>
          <p className="m-sub">All partner shops · {monthLabel}</p>
        </div>
        <div className="a-filters">
          <label className="search-box">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search shops</span>
            <input type="search" placeholder="Search shops or owners" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="input input--filled a-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input input--filled a-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="all">Any status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="m-stats">
        {[
          ['Total shops', shops.length],
          ['Online now', shops.filter((s) => s.status === 'online').length, 'green'],
          ['Monthly GMV', compactPrice(gmv)],
          ['Commission earned', formatPrice(commission)],
        ].map(([label, value, tone]) => (
          <div key={label} className="m-stat m-stat--plain">
            <span className="m-stat__label">{label}</span>
            <strong className={`m-stat__value${tone ? ` text-${tone}` : ''}`}>{value}</strong>
          </div>
        ))}
      </div>

      <section className="m-panel a-table-panel">
        <div className="a-table-tools">
          <span>{rows.length} shops</span>
          <select className="input input--filled a-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="revenue">Sort: Monthly revenue</option>
            <option value="orders">Sort: Orders</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead><tr><th>Shop</th><th>Location</th><th>Status</th><th className="num">Orders (mo)</th><th className="num">Monthly revenue</th><th className="num">Commission</th><th /></tr></thead>
            <tbody>
              {rows.map((s) => {
                const c = commissionFor(s.plan, s.revenueMonth)
                return (
                  <tr key={s.id} className="is-link" onClick={() => navigate(`/admin/shops/${s.id}`)}>
                    <td>
                      <span className="a-shop">
                        <ShopThumb shop={s} />
                        <span><strong>{s.name}</strong><small>{s.category}</small></span>
                      </span>
                    </td>
                    <td>{s.city.split(',')[0]}</td>
                    <td><ShopStatus status={s.status} /></td>
                    <td className="num strong">{s.ordersMonth.toLocaleString('en-IN')}</td>
                    <td className="num">
                      <span className="strong">{formatPrice(s.revenueMonth)}</span>
                      <span className={`a-trend ${s.trend >= 0 ? 'is-up' : 'is-down'}`}>{s.trend >= 0 ? '+' : ''}{s.trend}%</span>
                    </td>
                    <td className="num">
                      {c.total ? <span className="strong">{formatPrice(c.total)}</span> : <span className="muted">₹0</span>}
                      <small className="a-rate">{s.plan.type === 'exempt' ? 'exempt' : formatRate(c.rate)}</small>
                    </td>
                    <td className="num">
                      <Link to={`/admin/shops/${s.id}`} className="btn btn--primary m-btn-sm" onClick={(e) => e.stopPropagation()}>View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="m-empty">No shops match your filters.</p>}
        </div>
      </section>
    </>
  )
}

export default Shops
