import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ClipboardList,
  FileText,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Printer,
  ScanLine,
  ShoppingBag,
  ThumbsUp,
} from 'lucide-react'
import { isOverdue, useMerchant } from '../../../context/merchantContext.js'
import { calcCommission, formatRate } from '../../../utils/commission.js'
import { dateTimeLabel, dayLabel, formatPrice, minutesUntil, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import Photo from '../../../components/Photo.jsx'
import { CustomerAvatar, OrderStatusPill } from '../components/ui.jsx'
import VerifyPickup from '../components/VerifyPickup.jsx'
import './Orders.css'

const FLOW = [
  { key: 'placed', label: 'Order placed', icon: ClipboardList },
  { key: 'accepted', label: 'Accepted', icon: ThumbsUp },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'ready', label: 'Ready · customer notified', icon: ShoppingBag },
  { key: 'picked_up', label: 'Picked up', icon: Check },
]

const STEP_FOR_STATUS = { new: 0, packing: 1, ready: 3, picked_up: 4, no_show: 3, cancelled: 0 }

function MerchantOrderDetails() {
  const { orderId } = useParams()
  const { orders, togglePicked, acceptOrder, markPacked, revenue, toast, now } = useMerchant()
  const [handover, setHandover] = useState(false)
  const order = orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="m-panel m-empty">
        <h2>Order not found</h2>
        <Link to="/merchant/orders" className="btn btn--primary">Back to orders</Link>
      </div>
    )
  }

  const current = STEP_FOR_STATUS[order.status] ?? 0
  const picked = order.items.filter((i) => i.picked).length
  const canPick = order.status === 'packing' || order.status === 'new'
  const rate = calcCommission(revenue[revenue.length - 1].value).effectiveRate
  const commission = Math.round(order.subtotal * rate * 100) / 100
  const statusKey = isOverdue(order, now) ? 'overdue' : order.status

  return (
    <>
      <div className="m-head">
        <div>
          <p className="m-eyebrow"><Link to="/merchant/orders"><ArrowLeft size={13} /> All orders</Link></p>
          <h1 className="m-title od-title">
            #{order.id} <OrderStatusPill status={statusKey} />
          </h1>
          <p className="m-sub">Placed {dateTimeLabel(order.placedAt)}</p>
        </div>
        <div className="m-actions">
          <button type="button" className="btn btn--outline" onClick={() => window.print()}>
            <Printer size={16} /> Print label
          </button>
          {order.status === 'new' && <button type="button" className="btn btn--accent" onClick={() => acceptOrder(order.id)}>Accept order</button>}
          {order.status === 'packing' && <button type="button" className="btn btn--primary" onClick={() => markPacked(order.id)}><Package size={16} /> Mark as packed</button>}
          {order.status === 'ready' && <button type="button" className="btn btn--primary" onClick={() => setHandover(true)}><ScanLine size={16} /> Scan & Complete</button>}
        </div>
      </div>

      <section className="m-panel m-panel--pad">
        <h2 className="m-panel__title">Order Track Flow</h2>
        {order.status === 'cancelled' || order.status === 'no_show' ? (
          <p className="od-stopped">
            {order.status === 'cancelled' ? 'This order was cancelled / declined.' : 'The customer did not collect this order.'}
          </p>
        ) : (
          <ol className="od-flow" style={{ '--progress': current / (FLOW.length - 1) }}>
            {FLOW.map((step, i) => {
              const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
              const at = order.timeline[step.key]
              return (
                <li key={step.key} className={`od-flow__step is-${state}`}>
                  <span className="od-flow__dot"><step.icon size={18} /></span>
                  <strong>{step.label}</strong>
                  <small>{at ? `${timeOf(at)}${step.key === 'ready' ? ` · Shelf ${order.shelf}` : ''}` : step.key === 'picked_up' ? `Window ${slotLabel(timeOf(order.slotStart))}` : 'Pending'}</small>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="od-grid">
        <div className="od-main">
          <section className="m-panel">
            <div className="m-panel__head od-pad">
              <h2 className="m-panel__title">Items Ordered</h2>
              <span className={`od-picked${picked === order.items.length ? ' is-done' : ''}`}>
                <Check size={14} /> {picked} of {order.items.length} picked
              </span>
            </div>
            <ul className="od-items">
              {order.items.map((i) => (
                <li key={i.productId}>
                  <label className={`od-item${i.picked ? ' is-picked' : ''}`}>
                    <input type="checkbox" checked={i.picked} disabled={!canPick} onChange={() => togglePicked(order.id, i.productId)} aria-label={`Picked ${i.name}`} />
                    <span className="od-item__img"><Photo src={i.image} alt="" fallback={i.emoji} /></span>
                    <span className="od-item__info">
                      <strong>{i.name}</strong>
                      <small>SKU {i.sku} · {i.aisle}</small>
                    </span>
                    <span className="od-item__qty">× {i.qty}</span>
                    <span className="od-item__total">{formatPrice(i.price * i.qty)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="m-panel m-panel--pad">
            <div className="m-panel__head">
              <div>
                <h2 className="m-panel__title">Payment Invoice</h2>
                <p className="od-inv-sub">INV-{order.id.slice(3)} · issued {dateTimeLabel(order.placedAt)}</p>
              </div>
              <button type="button" className="link small od-pdf" onClick={() => window.print()}><FileText size={14} /> Download PDF</button>
            </div>
            <div className="m-table-wrap">
              <table className="m-table od-inv">
                <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.productId}><td>{i.name}</td><td className="num">{i.qty}</td><td className="num">{formatPrice(i.price)}</td><td className="num strong">{formatPrice(i.price * i.qty)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="od-pay">
              <div className="od-pay__box">
                <div className="sum-row">Method <strong>{order.method}</strong></div>
                <div className="sum-row">Transaction <strong>{order.txnId}</strong></div>
                <div className="sum-row">Paid online <strong className="text-green">{formatPrice(order.paidOnline)}</strong></div>
                <div className="sum-row">Collect at counter <strong className={order.dueAtPickup ? 'text-orange' : ''}>{formatPrice(order.dueAtPickup)}</strong></div>
              </div>
              <div>
                <div className="sum-row">Subtotal <strong>{formatPrice(order.subtotal)}</strong></div>
                <div className="sum-row">GST (incl.) <strong>{formatPrice(Math.round(((order.subtotal * 5) / 105) * 100) / 100)}</strong></div>
                <div className="sum-row">FastGrab commission (est. {formatRate(rate)}) <strong className="text-red">−{formatPrice(commission)}</strong></div>
                <div className="sum-row sum-row--total">Order total <strong>{formatPrice(order.subtotal)}</strong></div>
                <div className="od-payout">Your payout <strong>{formatPrice(order.subtotal - commission)}</strong></div>
                <p className="od-inv-note">Commission is billed monthly on your progressive slab. This is an estimate at this month’s effective rate.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="od-side">
          <section className="m-panel m-panel--pad">
            <p className="m-eyebrow">Customer</p>
            <div className="od-cust">
              <CustomerAvatar customer={order.customer} size={48} />
              <div>
                <strong>{order.customer.name}</strong>
                <small>{order.customer.pickups} pickups · reliable</small>
              </div>
            </div>
            <a href={`tel:${order.customer.phone.replace(/\s/g, '')}`} className="od-contact"><Phone size={14} /> {order.customer.phone}</a>
            <a href={`mailto:${order.customer.email}`} className="od-contact"><Mail size={14} /> {order.customer.email}</a>
            <button type="button" className="btn btn--block od-msg" onClick={() => toast(`Message sent to ${order.customer.name.split(' ')[0]}.`)}>
              <MessageSquare size={15} /> Message customer
            </button>
          </section>

          <section className="od-slot">
            <p className="od-slot__label">Pickup slot</p>
            <strong className="od-slot__time">{slotLabel(timeOf(order.slotStart))}</strong>
            <p className="od-slot__date">
              {dayLabel(order.slotStart)}
              {order.status === 'ready' && ` · ${minutesUntil(order.slotStart, now) > 0 ? `in ${minutesUntil(order.slotStart, now)} min` : 'now'}`}
            </p>
            <div className="od-slot__boxes">
              <span><small>Shelf</small><strong>{order.shelf ?? '—'}</strong></span>
              <span><small>Pickup code</small><strong>{order.pickupCode}</strong></span>
            </div>
          </section>

          {order.note && (
            <section className="m-panel m-panel--pad">
              <p className="m-eyebrow">Customer note</p>
              <p className="od-note">“{order.note}”</p>
            </section>
          )}
        </aside>
      </div>

      {handover && <VerifyPickup order={order} onClose={() => setHandover(false)} />}
    </>
  )
}

export default MerchantOrderDetails
