import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarRange,
  CircleCheck,
  IndianRupee,
  PackageCheck,
  ScanLine,
  ShoppingBag,
  Star,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { isOverdue, useMerchant } from '../../../context/merchantContext.js'
import { usePlatform } from '../../../context/platformContext.js'
import { SHOP_ID } from '../../../data/merchantData.js'
import { calcCommission, formatRate } from '../../../utils/commission.js'
import { compactPrice, formatPrice, isoDate, minutesUntil, pluralize, timeAgo, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import Photo from '../../../components/Photo.jsx'
import { CustomerAvatar, OrderStatusPill } from '../components/ui.jsx'
import VerifyPickup from '../components/VerifyPickup.jsx'
import './Dashboard.css'

// ---------- Revenue chart (single series → no legend; hover tooltip per bar) ----------
function RevenueChart({ data }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => d.value))
  // Leave ~15% headroom above the tallest bar for its tooltip.
  const top = Math.ceil((max * 1.15) / 50000) * 50000
  const ticks = [top, top / 2, 0]
  const last = data.length - 1

  return (
    <div className="rev-chart">
      <div className="rev-chart__plot" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <div key={t} className="rev-chart__grid" style={{ bottom: `${(t / top) * 100}%` }}>
            <span>{compactPrice(t)}</span>
          </div>
        ))}
        <div className="rev-chart__bars">
          {data.map((d, i) => (
            <button
              key={d.label}
              type="button"
              className={`rev-chart__col${i === last ? ' is-current' : ''}${hover === i ? ' is-hover' : ''}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.full}: ${formatPrice(d.value)}`}
            >
              <span className="rev-chart__bar" style={{ height: `${(d.value / top) * 100}%` }}>
                {(hover === i || (hover === null && i === last)) && (
                  <span className="rev-chart__tip">
                    <strong>{formatPrice(d.value)}</strong>
                    <small>{d.full}</small>
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="rev-chart__labels" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.label} className={i === last ? 'is-current' : ''}>{d.label}</span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Monthly completed FastGrab sales</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><th>{d.full}</th><td>{formatPrice(d.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Commission: monthly revenue, rate applied on each order ----------
function CommissionCard({ sales, monthName }) {
  const { orders } = useMerchant()
  const { transactions } = usePlatform()
  const c = calcCommission(sales)
  const rate = c.currentRate
  const recent = orders.filter((o) => ['picked_up', 'ready'].includes(o.status)).slice(0, 4)
  const due = transactions.filter((t) => t.shopId === SHOP_ID && t.status === 'pending').reduce((n, t) => n + t.commission, 0)

  return (
    <section className="commission">
      <p className="commission__eyebrow">Commission · {monthName}</p>

      <div className="commission__split">
        <div>
          <small>Monthly revenue</small>
          <strong>{formatPrice(sales)}</strong>
        </div>
        <div>
          <small>Commission so far</small>
          <strong>{formatPrice(c.total)}</strong>
        </div>
      </div>

      <div className="commission__rate">
        <span className="commission__rate-value">{formatRate(rate)}</span>
        <span>
          <strong>applied on each order</strong>
          <small>Your rate for this month’s sales band. It resets on the 1st.</small>
        </span>
      </div>

      <p className="commission__label">Recent orders</p>
      <ul className="commission__orders">
        {recent.map((o) => (
          <li key={o.id}>
            <span>#{o.id}</span>
            <span>{formatPrice(o.subtotal)}</span>
            <strong>−{formatPrice(Math.round(o.subtotal * rate * 100) / 100)}</strong>
          </li>
        ))}
      </ul>

      <Link to="/merchant/payments" className="commission__due">
        <span>
          <small>Due this week</small>
          <strong>{formatPrice(due)}</strong>
        </span>
        <span className="commission__pay">Pay commission <ArrowRight size={14} /></span>
      </Link>
    </section>
  )
}

// ---------- Live preparation: one clean list with tabs ----------
const BOARD_TABS = [
  { id: 'new', label: 'New' },
  { id: 'packing', label: 'Packing' },
  { id: 'ready', label: 'Ready' },
]

function PrepBoard({ onHandOver }) {
  const { orders, acceptOrder, markPacked, now } = useMerchant()
  const [tab, setTab] = useState('new')
  const list = orders
    .filter((o) => o.status === tab)
    .sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart))

  return (
    <section className="m-panel prep">
      <div className="prep__head">
        <div>
          <h2 className="m-panel__title">Live Preparation</h2>
          <p className="prep__sub">Sorted by pickup time</p>
        </div>
        <div className="m-seg" role="tablist" aria-label="Order stage">
          {BOARD_TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
              {t.label} <span>{orders.filter((o) => o.status === t.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="m-empty">No {tab} orders right now.</p>
      ) : (
        <ul className="prep__list">
          {list.slice(0, 5).map((o) => {
            const mins = minutesUntil(o.slotStart, now)
            const overdue = isOverdue(o, now)
            const picked = o.items.filter((i) => i.picked).length
            return (
              <li key={o.id} className="prep__row">
                <div className={`prep__time${mins <= 15 || overdue ? ' is-soon' : ''}`}>
                  <strong>{timeOf(o.slotStart)}</strong>
                  <small>{overdue ? `${-minutesUntil(o.slotEnd, now)}m late` : mins > 0 ? `in ${mins}m` : 'now'}</small>
                </div>
                <div className="prep__who">
                  <CustomerAvatar customer={o.customer} size={34} />
                  <span>
                    <Link to={`/merchant/orders/${o.id}`} className="prep__id">#{o.id}</Link>
                    <small>{o.customer.name} · {pluralize(o.items.reduce((n, i) => n + i.qty, 0), 'item')}</small>
                  </span>
                </div>
                <div className="prep__thumbs" aria-hidden="true">
                  {o.items.slice(0, 3).map((i) => (
                    <span key={i.productId}><Photo src={i.image} alt="" fallback={i.emoji} /></span>
                  ))}
                  {o.items.length > 3 && <span className="prep__more">+{o.items.length - 3}</span>}
                </div>
                <div className="prep__state">
                  {tab === 'packing' ? (
                    <span className="prep__progress">
                      <span><span style={{ width: `${(picked / o.items.length) * 100}%` }} /></span>
                      <small>{picked}/{o.items.length} picked</small>
                    </span>
                  ) : (
                    <OrderStatusPill status={overdue ? 'overdue' : o.status} />
                  )}
                </div>
                <strong className="prep__total">{formatPrice(o.subtotal)}</strong>
                <div className="prep__action">
                  {tab === 'new' && <button type="button" className="btn btn--accent m-btn-sm" onClick={() => acceptOrder(o.id)}>Accept</button>}
                  {tab === 'packing' && <button type="button" className="btn btn--primary m-btn-sm" onClick={() => markPacked(o.id)}>Mark ready</button>}
                  {tab === 'ready' && <button type="button" className="btn btn--outline m-btn-sm" onClick={() => onHandOver(o)}><ScanLine size={14} /> Hand over</button>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <Link to="/merchant/active-orders" className="prep__all">
        Open the full order board <ArrowRight size={14} />
      </Link>
    </section>
  )
}

// ---------- Slot load + activity ----------
function SlotLoad() {
  const { slots, now } = useMerchant()
  const d = new Date(now)
  const today = slots[isoDate(d)] ?? []
  const current = `${String(d.getHours()).padStart(2, '0')}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0')}`
  const upcoming = today.filter((s) => s.time >= current && s.open).slice(0, 4)

  return (
    <section className="m-panel m-panel--pad">
      <div className="m-panel__head">
        <h2 className="m-panel__title">Active Slot Load</h2>
        <span className="m-pill m-pill--soft-green">Today</span>
      </div>
      {upcoming.length ? (
        <ul className="slot-load">
          {upcoming.map((s) => {
            const pct = (s.booked / s.max) * 100
            const tone = pct >= 100 ? 'full' : pct >= 70 ? 'busy' : 'ok'
            return (
              <li key={s.time}>
                <div className="slot-load__row">
                  <span>{slotLabel(s.time)}</span>
                  <span className={`slot-load__state slot-load__state--${tone}`}>
                    {tone === 'full' ? 'Full' : tone === 'busy' ? 'Busy' : 'Available'} ({s.booked}/{s.max})
                  </span>
                </div>
                <span className={`slot-load__bar slot-load__bar--${tone}`}><span style={{ width: `${Math.min(100, pct)}%` }} /></span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="m-empty">No more open slots today.</p>
      )}
      <Link to="/merchant/slots" className="btn btn--outline btn--block slot-load__btn">Manage all slots</Link>
    </section>
  )
}

function Activity() {
  const { orders, inventory, now } = useMerchant()
  const events = []
  orders.forEach((o) => {
    if (o.timeline.picked_up) events.push({ at: o.timeline.picked_up, icon: CircleCheck, tone: 'green', text: `Order #${o.id} picked up` })
    if (o.status === 'new') events.push({ at: o.placedAt, icon: ShoppingBag, tone: 'blue', text: `New order #${o.id} from ${o.customer.name.split(' ')[0]}` })
    if (o.timeline.ready && o.status === 'ready') events.push({ at: o.timeline.ready, icon: PackageCheck, tone: 'purple', text: `#${o.id} packed and ready` })
  })
  events.sort((a, b) => new Date(b.at) - new Date(a.at))
  const lowStock = inventory.filter((i) => i.stock > 0 && i.stock <= i.lowStockAt)

  return (
    <section className="m-panel m-panel--pad">
      <div className="m-panel__head">
        <h2 className="m-panel__title">Recent Activity</h2>
      </div>
      <ul className="activity">
        {lowStock.slice(0, 1).map((i) => (
          <li key={i.id}>
            <span className="activity__icon tone-orange"><TriangleAlert size={14} /></span>
            <div>
              <Link to="/merchant/inventory" className="activity__text">Low stock: {i.name} ({i.stock} left)</Link>
              <small>Restock soon</small>
            </div>
          </li>
        ))}
        {events.slice(0, 4).map((e, idx) => (
          <li key={idx}>
            <span className={`activity__icon tone-${e.tone}`}><e.icon size={14} /></span>
            <div>
              <span className="activity__text">{e.text}</span>
              <small>{timeAgo(e.at, now)}</small>
            </div>
          </li>
        ))}
        <li>
          <span className="activity__icon tone-orange"><Star size={14} /></span>
          <div>
            <span className="activity__text">New 5-star review: “Bag was ready before I arrived!”</span>
            <small>today</small>
          </div>
        </li>
      </ul>
    </section>
  )
}

function Dashboard() {
  const { shop, orders, revenue, now } = useMerchant()
  const [handover, setHandover] = useState(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [range, setRange] = useState(6)

  const today = isoDate(new Date(now))
  const todays = orders.filter((o) => isoDate(o.placedAt) === today && o.status !== 'cancelled')
  const todayRevenue = todays.reduce((n, o) => n + o.subtotal, 0)
  const active = orders.filter((o) => ['new', 'packing', 'ready'].includes(o.status)).length
  const thisMonth = revenue[revenue.length - 1]
  const prevMonth = revenue[revenue.length - 2]
  const growth = Math.round(((thisMonth.value - prevMonth.value) / prevMonth.value) * 100)
  const dateLabel = new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <div className="m-head">
        <div>
          <p className="m-eyebrow">{dateLabel}</p>
          <h1 className="m-title">Store Overview</h1>
          <p className="m-sub">
            {shop.name} has <strong>{active} active orders</strong> right now.
          </p>
        </div>
        <div className="m-actions">
          <button type="button" className="dash-bell" aria-label="Notifications">
            <Bell size={18} />
            <span />
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setScanOpen(true)}>
            <ScanLine size={18} /> Scan Pickup QR
          </button>
        </div>
      </div>

      <div className="m-stats dash-stats">
        <div className="m-stat">
          <div className="m-stat__top">
            <span className="m-stat__icon tone-green"><ShoppingBag size={20} /></span>
            <span className="m-trend m-trend--up">+12%</span>
          </div>
          <strong className="m-stat__value">{todays.length}</strong>
          <span className="m-stat__label">Today’s orders</span>
        </div>
        <div className="m-stat">
          <div className="m-stat__top">
            <span className="m-stat__icon tone-blue"><IndianRupee size={20} /></span>
            <span className="m-trend m-trend--up">+8%</span>
          </div>
          <strong className="m-stat__value">{formatPrice(todayRevenue)}</strong>
          <span className="m-stat__label">Today’s revenue</span>
        </div>
        <div className="m-stat">
          <div className="m-stat__top">
            <span className="m-stat__icon tone-orange"><CalendarRange size={20} /></span>
            <span className="m-trend m-trend--up">+{growth}%</span>
          </div>
          <strong className="m-stat__value">{formatPrice(thisMonth.value)}</strong>
          <span className="m-stat__label">Monthly sales · {thisMonth.full.split(' ')[0]}</span>
        </div>
      </div>

      <div className="dash-grid">
        <section className="m-panel m-panel--pad">
          <div className="m-panel__head">
            <div>
              <p className="m-eyebrow">Monthly FastGrab sales</p>
              <p className="dash-revenue">
                {formatPrice(thisMonth.value)} <span className="m-trend m-trend--up">+{growth}%</span>
              </p>
            </div>
            <div className="m-seg" role="group" aria-label="Range">
              {[3, 6].map((n) => (
                <button key={n} type="button" className={range === n ? 'is-active' : ''} onClick={() => setRange(n)}>
                  {n} months
                </button>
              ))}
            </div>
          </div>
          <RevenueChart data={revenue.slice(-range)} />
        </section>

        <CommissionCard sales={thisMonth.value} monthName={thisMonth.full.split(' ')[0]} />
      </div>

      <div className="dash-grid">
        <PrepBoard onHandOver={setHandover} />
        <div className="dash-side">
          <SlotLoad />
          <Activity />
        </div>
      </div>

      <div className="dash-links">
        <Link to="/merchant/offers/new" className="dash-promo">
          <div>
            <p className="m-eyebrow">Grow your sales</p>
            <h2>Promote an offer to ~9,600 nearby shoppers</h2>
            <p>Featured offers appear on the customer Explore page. From {formatPrice(499)} a week.</p>
          </div>
          <span className="btn btn--accent">Create offer <ArrowRight size={16} /></span>
        </Link>
        <Link to="/merchant/payments" className="dash-promo dash-promo--plain">
          <div>
            <p className="m-eyebrow"><Wallet size={13} /> Payments</p>
            <h2>Commission & payment history</h2>
            <p>See what’s due and every payment you’ve made to FastGrab.</p>
          </div>
          <span className="btn btn--outline">Open <ArrowRight size={16} /></span>
        </Link>
      </div>

      {handover && <VerifyPickup order={handover} onClose={() => setHandover(null)} />}
      {scanOpen && <VerifyPickup onClose={() => setScanOpen(false)} />}
    </>
  )
}

export default Dashboard
