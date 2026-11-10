import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, Package, Search } from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { getStore } from '../../../data/mockData.js'
import { dayLabel, formatPrice, pluralize, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import StoreLogo from '../components/StoreLogo.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { isActiveOrder } from '../components/orderStatus.js'
import './Orders.css'

const itemCount = (order) => order.items.reduce((n, i) => n + i.qty, 0)

function paymentCaption(order) {
  if (order.dueAtPickup === 0) return 'Paid online'
  if (order.paidOnline > 0) return 'Deposit paid'
  return 'Pay at pickup'
}

function OrderRow({ order, variant }) {
  const store = getStore(order.storeId)
  const past = variant === 'past'
  return (
    <Link
      to={`/customer/orders/${order.id}`}
      className={`order-row order-row--${variant}${order.status === 'ready' ? ' is-ready' : ''}`}
    >
      <StoreLogo store={store} size={past ? 40 : 46} />
      <div className="order-row__info">
        <p className="order-row__title">
          {store.name} <span>#{order.id}</span>
        </p>
        <p className="order-row__meta">
          {pluralize(itemCount(order), 'item')} ·{' '}
          {past ? (
            <>
              {dayLabel(order.placedAt)} ·{' '}
              {order.status === 'cancelled'
                ? order.deposit
                  ? 'Deposit refunded'
                  : 'Cancelled'
                : `Collected ${timeOf(order.timeline.picked_up)}`}
            </>
          ) : (
            <>
              <CalendarDays size={12} /> {dayLabel(order.pickupDate)} · {slotLabel(order.slot)}
            </>
          )}
        </p>
      </div>
      <div className="order-row__amount">
        <strong className={order.status === 'cancelled' ? 'is-struck' : ''}>{formatPrice(order.subtotal)}</strong>
        {!past && <small>{paymentCaption(order)}</small>}
      </div>
      <StatusBadge status={order.status} />
    </Link>
  )
}

function MyOrders() {
  const { orders } = useCustomer()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) => o.id.toLowerCase().includes(q) || getStore(o.storeId).name.toLowerCase().includes(q),
    )
  }, [orders, query])

  const current = filtered.filter(isActiveOrder)
  const past = filtered.filter((o) => !isActiveOrder(o))
  const ready = orders.find((o) => o.status === 'ready')

  return (
    <div className="container orders-page">
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

      {ready && !query && (
        <div className="ready-banner">
          <span className="ready-banner__icon">
            <Bell size={20} />
          </span>
          <div>
            <strong>Your order from {getStore(ready.storeId).name} is ready!</strong>
            <p>
              Show your QR code at the FastGrab counter · Pickup window {slotLabel(ready.slot)}
            </p>
          </div>
          <Link to={`/customer/orders/${ready.id}`} className="btn ready-banner__btn">
            View QR
          </Link>
        </div>
      )}

      <h2 className="orders-heading">Current orders · {current.length}</h2>
      {current.length ? (
        <div className="orders-list">
          {current.map((o) => (
            <OrderRow key={o.id} order={o} variant="current" />
          ))}
        </div>
      ) : (
        <div className="card empty">
          <span className="empty__icon"><Package size={28} /></span>
          <h2>No active orders</h2>
          <p>{query ? 'No current orders match your search.' : 'Order ahead from a nearby shop and skip the queue.'}</p>
          {!query && <Link to="/customer/explore" className="btn btn--primary">Explore stores</Link>}
        </div>
      )}

      <h2 className="orders-heading">Past orders</h2>
      {past.length ? (
        <div className="card orders-past">
          {past.map((o) => (
            <OrderRow key={o.id} order={o} variant="past" />
          ))}
        </div>
      ) : (
        <p className="muted">No past orders{query ? ' match your search' : ' yet'}.</p>
      )}
    </div>
  )
}

export default MyOrders
