import { Link, useLocation, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowLeft,
  CircleCheck,
  ClipboardList,
  Download,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  ShoppingBag,
  Store,
  CircleX,
} from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { getStore } from '../../../data/mockData.js'
import { dateTimeLabel, dayLabel, formatPrice, pluralize, shortDate, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import StoreLogo from '../components/StoreLogo.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { TRACK_STEPS } from '../components/orderStatus.js'
import './Orders.css'

const STEP_ICONS = {
  placed: ClipboardList,
  confirmed: Store,
  packing: Package,
  ready: ShoppingBag,
  picked_up: PackageCheck,
}

function Tracking({ order }) {
  const cancelled = order.status === 'cancelled'
  const currentIndex = TRACK_STEPS.findIndex((s) => s.key === order.status)

  return (
    <section className="card card-pad">
      <div className="card-head">
        <h2 className="card-title">Order Tracking</h2>
        <span className="muted small">
          {cancelled ? 'Order cancelled' : `Live · updated ${timeOf(Object.values(order.timeline).pop())}`}
        </span>
      </div>

      {cancelled ? (
        <p className="track-cancelled">
          <CircleX size={18} />
          This order was cancelled on {dayLabel(order.timeline.cancelled)} at {timeOf(order.timeline.cancelled)}.
          {order.deposit > 0 && ` Your ${formatPrice(order.deposit)} deposit has been refunded.`}
        </p>
      ) : (
        <ol className="track" style={{ '--progress': currentIndex / (TRACK_STEPS.length - 1) }}>
          {TRACK_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[step.key]
            const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming'
            const at = order.timeline[step.key]
            return (
              <li key={step.key} className={`track__step is-${state}`}>
                <span className="track__dot">
                  <Icon size={18} />
                </span>
                <strong>{step.label}</strong>
                <small>
                  {at
                    ? `${dayLabel(at).split(',').pop().trim()} · ${timeOf(at)}`
                    : step.key === 'picked_up'
                      ? `Window ${slotLabel(order.slot)}`
                      : 'Pending'}
                </small>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function OrderDetails() {
  const { orderId } = useParams()
  const { getOrder } = useCustomer()
  const { state } = useLocation()
  const order = getOrder(orderId)

  if (!order) {
    return (
      <div className="container">
        <div className="card empty">
          <span className="empty__icon"><Package size={28} /></span>
          <h2>Order not found</h2>
          <p>We couldn’t find order {orderId}.</p>
          <Link to="/customer/orders" className="btn btn--primary">Back to My Orders</Link>
        </div>
      </div>
    )
  }

  const store = getStore(order.storeId)
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0)
  const showCode = !['picked_up', 'cancelled'].includes(order.status)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}`)}`

  return (
    <div className="container order-detail">
      <Link to="/customer/orders" className="back-link">
        <ArrowLeft size={14} /> Back to My Orders
      </Link>

      {state?.justPlaced && (
        <div className="placed-banner" role="status">
          <CircleCheck size={20} />
          <div>
            <strong>Order placed!</strong>{' '}
            {state.justPlaced > 1
              ? `We created ${state.justPlaced} orders, one for each shop. Find them all in My Orders.`
              : 'We’ll notify you as soon as the shop confirms.'}
          </div>
        </div>
      )}

      <div className="page-head">
        <div>
          <h1 className="page-title">Order #{order.id}</h1>
          <p className="page-sub">
            Placed on {dateTimeLabel(order.placedAt)} · {store.name}
          </p>
        </div>
        <StatusBadge status={order.status} size="lg" />
      </div>

      <Tracking order={order} />

      <div className="detail-grid">
        <section className="card items-card">
          <div className="card-head card-pad-x">
            <h2 className="card-title">Items Ordered</h2>
            <span className="muted small">{pluralize(itemCount, 'item')}</span>
          </div>
          <ul className="line-items">
            {order.items.map((item) => (
              <li key={item.productId} className="detail-item">
                <span className="detail-item__img" aria-hidden="true">{item.emoji}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {formatPrice(item.price)} × {item.qty}
                  </small>
                </div>
                <span className="detail-item__total">{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`code-card${showCode ? '' : ' is-muted'}`}>
          <p className="code-card__label">Pickup code</p>
          {showCode ? (
            <>
              <div className="code-card__qr">
                <QRCodeSVG value={`FASTGRAB:${order.id}:${order.pickupCode}`} size={150} fgColor="#0a4a38" level="M" />
              </div>
              <p className="code-card__code">{order.pickupCode}</p>
              <p className="code-card__hint">Show this at the FastGrab counter</p>
            </>
          ) : (
            <div className="code-card__done">
              {order.status === 'cancelled' ? <CircleX size={44} /> : <CircleCheck size={44} />}
              <p>{order.status === 'cancelled' ? 'This order was cancelled' : `Collected on ${shortDate(order.timeline.picked_up)}`}</p>
            </div>
          )}
        </section>

        <section className="card card-pad">
          <h2 className="card-title payment-title">Payment Details</h2>
          <div className="payment-grid">
            <div>
              <div className="sum-row">Items subtotal <strong>{formatPrice(order.subtotal)}</strong></div>
              <div className="sum-row">
                Booking deposit <strong>{order.deposit ? formatPrice(order.deposit) : 'FREE'}</strong>
              </div>
              {order.deposit > 0 && (
                <div className="sum-row">
                  Deposit credited back <strong className="text-green">−{formatPrice(order.deposit)}</strong>
                </div>
              )}
              <div className="sum-row sum-row--total">Total <strong>{formatPrice(order.subtotal)}</strong></div>
              <div className="sum-row">Paid online <strong>{formatPrice(order.paidOnline)}</strong></div>
              <div className="sum-row">
                Due at pickup
                <strong className={order.dueAtPickup ? 'text-orange' : ''}>{formatPrice(order.dueAtPickup)}</strong>
              </div>
            </div>
            <div className="payment-box">
              <div className="sum-row">Method <strong>{order.method}</strong></div>
              <div className="sum-row">Transaction ID <strong>{order.txnId}</strong></div>
              <div className="sum-row">Paid on <strong>{order.paidOnline ? `${shortDate(order.placedAt)}, ${timeOf(order.placedAt)}` : '—'}</strong></div>
              <div className="sum-row">
                Status
                <strong className="text-green">
                  {order.status === 'cancelled' && order.paidOnline ? 'Refunded' : order.paidOnline ? 'Successful' : 'Pay at pickup'}
                </strong>
              </div>
              <button type="button" className="btn btn--outline btn--block receipt-btn" onClick={() => window.print()}>
                <Download size={15} /> Download receipt
              </button>
            </div>
          </div>
        </section>

        <section className="card card-pad pickup-card">
          <div className="pickup-card__store">
            <StoreLogo store={store} size={44} />
            <div>
              <Link to={`/customer/store/${store.id}`} className="pickup-card__name">{store.name}</Link>
              <p className="muted small">{store.address}</p>
            </div>
          </div>
          <div className="sum-row">Pickup date <strong>{dayLabel(order.pickupDate)}</strong></div>
          <div className="sum-row">Pickup window <strong>{slotLabel(order.slot)}</strong></div>
          <div className="sum-row">Counter <strong className="text-green">{store.counter}</strong></div>
          <div className="pickup-card__actions">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn pickup-card__btn pickup-card__btn--green">
              <Navigation size={14} /> Directions
            </a>
            <a href={`tel:${store.phone}`} className="btn pickup-card__btn">
              <Phone size={14} /> Call shop
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default OrderDetails
