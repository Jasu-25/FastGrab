import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, ClipboardCheck, IndianRupee, Percent, Search, Store, TrendingUp, Users, X } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { WEEKLY_ORDERS, commissionFor } from '../../data/platformData.js'
import { compactPrice, formatPrice, timeAgo } from '../../utils/format.js'
import { StatCard } from '../Merchant/components/ui.jsx'
import { BarChart, ShopIcon, ShopThumb } from './components.jsx'
import './Admin.css'

function Overview() {
  const { shops, applications, approveApplication, rejectApplication, currentAdmin } = usePlatform()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [now] = useState(() => Date.now())

  const gmv = shops.reduce((n, s) => n + s.revenueMonth, 0)
  const commission = shops.reduce((n, s) => n + commissionFor(s.plan, s.revenueMonth).total, 0)
  const online = shops.filter((s) => s.status === 'online').length
  const top = [...shops].sort((a, b) => b.revenueMonth - a.revenueMonth).slice(0, 3)
  const week = WEEKLY_ORDERS.reduce((n, d) => n + d.value, 0)
  const best = WEEKLY_ORDERS.reduce((bi, d, i, a) => (d.value > a[bi].value ? i : bi), 0)

  return (
    <>
      <div className="m-head">
        <div>
          <p className="m-eyebrow">Welcome back, {currentAdmin.name.split(' ')[0]}</p>
          <h1 className="m-title">Platform Overview</h1>
        </div>
        <div className="m-actions">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/admin/shops?q=${encodeURIComponent(query)}`)
            }}
          >
            <label className="search-box a-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search shops</span>
              <input type="search" placeholder="Search shops or owners…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </form>
          <Link to="/admin/approvals" className="btn btn--primary">
            <ClipboardCheck size={17} /> Review applications
          </Link>
        </div>
      </div>

      <div className="m-stats">
        <StatCard label="Monthly GMV" value={compactPrice(gmv)} icon={IndianRupee} tone="green" trend="+24.8%" />
        <StatCard label="Partner shops" value={shops.length} icon={Store} tone="blue" trend={`${online} online`} trendTone="flat" />
        <StatCard label="Active shoppers" value="84,200" icon={Users} tone="purple" trend="+4.2k" />
        <StatCard label="Commission this month" value={formatPrice(commission)} icon={Percent} tone="orange" trend={`${((commission / gmv) * 100).toFixed(1)}% avg`} trendTone="flat" />
      </div>

      <div className="a-grid">
        <section className="m-panel a-queue">
          <div className="m-panel__head a-panel-head">
            <h2 className="m-panel__title">Shop Approval Queue</h2>
            <span className="m-pill m-pill--soft-green">{applications.length} pending</span>
          </div>
          <div className="m-table-wrap">
            <table className="m-table">
              <thead><tr><th>Shop</th><th>Category</th><th>Location</th><th>Applied</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {applications.slice(0, 4).map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/admin/approvals?id=${a.id}`} className="a-shop">
                        <span className={`a-shop__img tone-${a.tone}`} style={{ width: 36, height: 36, display: 'grid', placeItems: 'center' }}>
                          <ShopIcon shop={a} size={16} />
                        </span>
                        <strong>{a.name}</strong>
                      </Link>
                    </td>
                    <td>{a.category}</td>
                    <td>{a.city.split(',')[0]}</td>
                    <td>{timeAgo(a.submitted, now)}</td>
                    <td className="num">
                      <div className="a-icon-actions">
                        <button type="button" className="a-ok" onClick={() => approveApplication(a.id)} aria-label={`Approve ${a.name}`} disabled={a.docs.some(([, s]) => s === 'missing')} title={a.docs.some(([, s]) => s === 'missing') ? 'Documents missing. Review first.' : 'Approve'}>
                          <Check size={15} />
                        </button>
                        <button type="button" className="a-no" onClick={() => rejectApplication(a.id)} aria-label={`Reject ${a.name}`}>
                          <X size={15} />
                        </button>
                        <Link to={`/admin/approvals?id=${a.id}`} className="a-more" aria-label={`Review ${a.name}`}><ChevronRight size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length === 0 && <p className="m-empty">All caught up. No pending applications.</p>}
          </div>
          <Link to="/admin/approvals" className="a-panel-link">View all applications <ArrowRight size={14} /></Link>
        </section>

        <div className="a-side-col">
          <section className="a-growth">
            <h2>Weekly Growth</h2>
            <p>{week.toLocaleString('en-IN')} pre-orders this week · up 15%</p>
            <BarChart data={WEEKLY_ORDERS} format={(v) => `${v.toLocaleString('en-IN')} orders`} caption="Pre-orders per day this week" highlight={best} dark height={120} />
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title a-mb"><TrendingUp size={16} /> Top Performing Stores</h2>
            <ol className="a-top">
              {top.map((s, i) => (
                <li key={s.id}>
                  <span className="a-top__rank">{i + 1}</span>
                  <ShopThumb shop={s} size={36} />
                  <Link to={`/admin/shops/${s.id}`}>
                    <strong>{s.name}</strong>
                    <small>{s.ordersMonth.toLocaleString('en-IN')} orders</small>
                  </Link>
                  <span className="a-top__value">{compactPrice(s.revenueMonth)}</span>
                </li>
              ))}
            </ol>
            <Link to="/admin/shops" className="btn btn--outline btn--block m-btn-sm a-mt">Full leaderboard</Link>
          </section>
        </div>
      </div>
    </>
  )
}

export default Overview
