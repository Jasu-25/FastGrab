import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
import { ACTIVE_STATUSES, isOverdue, useMerchant } from '../../../context/merchantContext.js'
import { dayLabel, formatPrice, pluralize, timeOf } from '../../../utils/format.js'
import { CustomerAvatar, OrderStatusPill } from '../components/ui.jsx'
import './Orders.css'

const PRESENT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'packing', label: 'Packing' },
  { id: 'ready', label: 'Ready' },
]

const count = (o) => o.items.reduce((n, i) => n + i.qty, 0)

function exportCsv(orders) {
  const rows = [['Order', 'Customer', 'Items', 'Pickup', 'Total (INR)', 'Status']]
  orders.forEach((o) => rows.push([o.id, o.customer.name, count(o), new Date(o.slotStart).toLocaleString('en-IN'), o.subtotal, o.status]))
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `fastgrab-orders-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

function AllOrders() {
  const { orders, shop, now } = useMerchant()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [range, setRange] = useState(7)

  const q = query.trim().toLowerCase()
  const matches = (o) => !q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)

  const present = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).filter(matches)
  const shown = present.filter((o) => filter === 'all' || o.status === filter)
  const past = orders
    .filter((o) => !ACTIVE_STATUSES.includes(o.status))
    .filter((o) => now - new Date(o.placedAt).getTime() <= range * 86400000)
    .filter(matches)

  const noShows = orders.filter((o) => o.status === 'no_show').length
  const completed = orders.filter((o) => o.status === 'picked_up').length
  const STATS = [
    { label: 'Present orders', value: present.length },
    { label: 'Ready, awaiting pickup', value: orders.filter((o) => o.status === 'ready').length, tone: 'green' },
    { label: 'Completed this week', value: 284 + completed },
    { label: 'No-show rate', value: `${((noShows / (286 + noShows)) * 100).toFixed(1)}%`, tone: 'orange' },
  ]

  const open = (id) => navigate(`/merchant/orders/${id}`)

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Orders</h1>
          <p className="m-sub">All pre-orders for {shop.name}</p>
        </div>
        <div className="m-actions">
          <label className="search-box">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search orders</span>
            <input type="search" placeholder="Search order or customer" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button type="button" className="btn btn--outline" onClick={() => exportCsv([...present, ...past])}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="m-stats">
        {STATS.map((s) => (
          <div key={s.label} className="m-stat m-stat--plain">
            <span className="m-stat__label">{s.label}</span>
            <strong className={`m-stat__value${s.tone ? ` text-${s.tone}` : ''}`}>{s.value}</strong>
          </div>
        ))}
      </div>

      <section className="m-panel orders-panel">
        <div className="m-panel__head orders-panel__head">
          <h2 className="m-panel__title">Present Orders</h2>
          <div className="m-seg" role="tablist" aria-label="Filter present orders">
            {PRESENT_FILTERS.map((f) => {
              const n = f.id === 'all' ? present.length : present.filter((o) => o.status === f.id).length
              return (
                <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? 'is-active' : ''} onClick={() => setFilter(f.id)}>
                  {f.label} <span>{n}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th><th>Pickup slot</th><th>Total</th><th className="num">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.id} className="is-link" onClick={() => open(o.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(o.id)}>
                  <td className="strong">#{o.id}</td>
                  <td><span className="m-cust"><CustomerAvatar customer={o.customer} size={30} /> {o.customer.name}</span></td>
                  <td>{pluralize(count(o), 'item')}</td>
                  <td className="strong">{dayLabel(o.slotStart).split(',')[0]} {timeOf(o.slotStart)}</td>
                  <td className="strong">{formatPrice(o.subtotal)}</td>
                  <td className="num"><OrderStatusPill status={isOverdue(o, now) ? 'overdue' : o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="m-empty">No orders here.</p>}
        </div>
      </section>

      <section className="m-panel orders-panel">
        <div className="m-panel__head orders-panel__head">
          <h2 className="m-panel__title">Past Orders</h2>
          <select className="input input--filled orders-range" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Date range">
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <div className="m-table-wrap">
          <table className="m-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Items</th><th>Collected</th><th>Total</th><th className="num">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((o) => (
                <tr key={o.id} className="is-link" onClick={() => open(o.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open(o.id)}>
                  <td className="strong">#{o.id}</td>
                  <td><span className="m-cust"><CustomerAvatar customer={o.customer} size={30} /> {o.customer.name}</span></td>
                  <td>{pluralize(count(o), 'item')}</td>
                  <td>{o.timeline.picked_up ? `${dayLabel(o.timeline.picked_up).split(',').pop().trim()} · ${timeOf(o.timeline.picked_up)}` : `${dayLabel(o.slotStart).split(',').pop().trim()} · —`}</td>
                  <td className={o.status === 'picked_up' ? 'strong' : 'struck'}>{formatPrice(o.subtotal)}</td>
                  <td className="num"><OrderStatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {past.length === 0 && <p className="m-empty">No past orders in this range.</p>}
        </div>
      </section>
    </>
  )
}

export default AllOrders
