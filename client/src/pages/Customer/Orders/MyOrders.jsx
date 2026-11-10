import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CircleHelp,
  Clock,
  Heart,
  IndianRupee,
  Package,
  PackageCheck,
  Search,
  Timer,
} from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { getStore } from '../../../data/mockData.js'
import { dayLabel, formatPrice, pluralize, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import StoreLogo from '../components/StoreLogo.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { TRACK_STEPS, isActiveOrder } from '../components/orderStatus.js'
import './Orders.css'
import Photo from '../../../components/Photo.jsx'
import { productPhoto } from '../../../data/photos.js'

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All orders' },
]

const itemCount = (order) => order.items.reduce((n, i) => n + i.qty, 0)

function paymentCaption(order) {
  if (order.status === 'cancelled') return order.paidOnline ? 'Refunded' : 'Cancelled'
  if (order.dueAtPickup === 0) return 'Paid online'
  if (order.paidOnline > 0) return `${formatPrice(order.dueAtPickup)} due at pickup`
  return 'Pay at pickup'
}

/** Small 5-step progress bar for active orders. */
function MiniProgress({ status }) {
  const index = TRACK_STEPS.findIndex((s) => s.key === status)
  return (
    <div className="mini-progress" aria-label={`Step ${index + 1} of ${TRACK_STEPS.length}`}>
      {TRACK_STEPS.map((s, i) => (
        <span key={s.key} className={i <= index ? 'is-on' : ''} />
      ))}
      <small>{TRACK_STEPS[index]?.label}</small>
    </div>
  )
}

function OrderCard({ order }) {
  const store = getStore(order.storeId)
  const active = isActiveOrder(order)
  const shown = order.items.slice(0, 4)
  const extra = order.items.length - shown.length

  return (
    <Link to={`/customer/orders/${order.id}`} className="order-card">
      <div className="order-card__top">
        <StoreLogo store={store} size={48} />
        <div className="order-card__info">
          <p className="order-card__title">
            {store.name} <span>#{order.id}</span>
          </p>
          <p className="order-card__meta">
            {active ? (
              <>
                <CalendarDays size={13} /> {dayLabel(order.pickupDate)} · {slotLabel(order.slot)}
              </>
            ) : (
              <>
                <Clock size={13} /> {dayLabel(order.placedAt)}
                {order.status === 'picked_up' && ` · Collected ${timeOf(order.timeline.picked_up)}`}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-card__bottom">
        <div className="order-card__items">
          {shown.map((i) => (
            <span key={i.productId} className="order-card__thumb" title={`${i.name} × ${i.qty}`}>
              <Photo src={i.image || productPhoto(i.productId, 120)} alt="" fallback={i.emoji} />
            </span>
          ))}
          {extra > 0 && <span className="order-card__thumb order-card__thumb--more">+{extra}</span>}
          <span className="order-card__count">{pluralize(itemCount(order), 'item')}</span>
        </div>
        <div className="order-card__amount">
          <strong className={order.status === 'cancelled' ? 'is-struck' : ''}>{formatPrice(order.subtotal)}</strong>
          <small>{paymentCaption(order)}</small>
        </div>
      </div>

      {active && <MiniProgress status={order.status} />}
    </Link>
  )
}

function OrdersSidebar({ orders }) {
  const { savedShops } = useCustomer()
  const completed = orders.filter((o) => o.status === 'picked_up')
  const spent = completed.reduce((n, o) => n + o.subtotal, 0)
  const stats = [
    { icon: Package, label: 'Active', value: orders.filter(isActiveOrder).length, tone: 'green' },
    { icon: PackageCheck, label: 'Collected', value: completed.length, tone: 'blue' },
    { icon: IndianRupee, label: 'Spent', value: formatPrice(spent), tone: 'orange' },
    { icon: Timer, label: 'Time saved', value: `${completed.length * 15} min`, tone: 'purple' },
  ]
  const shops = savedShops.map(getStore).filter(Boolean).slice(0, 3)

  return (
    <aside className="orders-aside">
      <section className="card card-pad">
        <h2 className="aside-title">Your FastGrab stats</h2>
        <div className="stat-tiles">
          {stats.map(({ icon: Icon, label, value, tone }) => (
            <div key={label} className="stat-tile">
              <span className={`stat-tile__icon tone-${tone}`}>
                <Icon size={16} />
              </span>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </section>

      {shops.length > 0 && (
        <section className="card card-pad">
          <h2 className="aside-title">
            <Heart size={16} fill="currentColor" /> Order again
          </h2>
          <ul className="quick-shops">
            {shops.map((s) => (
              <li key={s.id}>
                <Link to={`/customer/store/${s.id}`}>
                  <StoreLogo store={s} size={36} />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{s.distanceKm} km · ★ {s.rating}</small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="help-card">
        <CircleHelp size={22} />
        <div>
          <strong>Need help with an order?</strong>
          <p>Missing item or a late pickup? Our team replies within minutes.</p>
        </div>
      </section>
    </aside>
  )
}

function MyOrders() {
  const { orders } = useCustomer()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('active')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => o.id.toLowerCase().includes(q) || getStore(o.storeId).name.toLowerCase().includes(q))
  }, [orders, query])

  const counts = {
    active: filtered.filter(isActiveOrder).length,
    past: filtered.filter((o) => !isActiveOrder(o)).length,
    all: filtered.length,
  }
  const visible = filtered.filter((o) => (tab === 'all' ? true : tab === 'active' ? isActiveOrder(o) : !isActiveOrder(o)))

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-sub">Track active pickups and revisit past orders.</p>
        </div>
        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search orders</span>
          <input type="search" placeholder="Search by shop or order ID" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="orders-layout">
        <div className="orders-main">
          <div className="tabs" role="tablist" aria-label="Order filter">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span>{counts[t.id]}</span>
              </button>
            ))}
          </div>

          {visible.length ? (
            <div className="order-grid">
              {visible.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          ) : (
            <div className="card empty">
              <span className="empty__icon"><Package size={28} /></span>
              <h2>{query ? 'No orders match' : tab === 'active' ? 'No active orders' : 'No orders here yet'}</h2>
              <p>{query ? 'Try a different shop name or order ID.' : 'Order ahead from a nearby shop and skip the queue.'}</p>
              {!query && <Link to="/customer/explore" className="btn btn--primary">Explore stores</Link>}
            </div>
          )}
        </div>

        <OrdersSidebar orders={orders} />
      </div>
    </div>
  )
}

export default MyOrders
