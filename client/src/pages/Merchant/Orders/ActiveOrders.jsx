import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Clock,
  Coffee,
  Footprints,
  ScanLine,
} from 'lucide-react'
import { isOverdue, useMerchant } from '../../../context/merchantContext.js'
import { formatPrice, minutesUntil, pluralize, timeAgo, timeOf } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import Photo from '../../../components/Photo.jsx'
import VerifyPickup from '../components/VerifyPickup.jsx'
import './Orders.css'

const count = (o) => o.items.reduce((n, i) => n + i.qty, 0)

function NewCard({ o }) {
  const { acceptOrder, declineOrder, now } = useMerchant()
  const mins = minutesUntil(o.slotStart, now)
  return (
    <article className="ao-card">
      <div className="ao-card__top">
        <Link to={`/merchant/orders/${o.id}`} className="ao-card__id">#{o.id}</Link>
        <span className="ao-card__when">{timeAgo(o.placedAt, now)}</span>
      </div>
      <p className="ao-card__name">{o.customer.name}</p>
      <p className="ao-card__meta">{pluralize(count(o), 'item')} · {formatPrice(o.subtotal)}</p>
      <div className="ao-thumbs">
        {o.items.slice(0, 5).map((i) => (
          <span key={i.productId} title={`${i.name} × ${i.qty}`}><Photo src={i.image} alt="" fallback={i.emoji} /></span>
        ))}
      </div>
      <p className={`ao-chip${mins <= 20 ? ' ao-chip--urgent' : ''}`}>
        <Clock size={14} /> Pickup {timeOf(o.slotStart)} · in {mins}m
      </p>
      <div className="ao-card__btns">
        <button type="button" className="btn btn--outline m-btn-sm" onClick={() => declineOrder(o.id)}>Decline</button>
        <button type="button" className="btn btn--accent m-btn-sm" onClick={() => acceptOrder(o.id)}>Accept</button>
      </div>
    </article>
  )
}

function PackingCard({ o }) {
  const { togglePicked, markPacked, now } = useMerchant()
  const [open, setOpen] = useState(false)
  const picked = o.items.filter((i) => i.picked).length
  const pct = Math.round((picked / o.items.length) * 100)
  const due = minutesUntil(o.slotStart, now)
  const done = picked === o.items.length

  return (
    <article className="ao-card ao-card--packing">
      <div className="ao-card__top">
        <Link to={`/merchant/orders/${o.id}`} className="ao-card__id">#{o.id}</Link>
        <span className={`ao-card__when${due <= 15 ? ' is-red' : ''}`}>{due >= 0 ? `Due in ${due}m` : `${-due}m late`}</span>
      </div>
      <p className="ao-card__name">{o.customer.name}</p>
      <p className="ao-card__meta">{pluralize(count(o), 'item')} · {formatPrice(o.subtotal)} · Shelf {o.shelf}</p>

      <button type="button" className="ao-progress" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="ao-progress__row">
          <span>Picked {picked} / {o.items.length}</span>
          <span className="ao-progress__pct">{pct}% <ChevronDown size={14} className={open ? 'is-flipped' : ''} /></span>
        </span>
        <span className="ao-progress__bar"><span style={{ width: `${pct}%` }} /></span>
      </button>

      {open && (
        <ul className="ao-checklist">
          {o.items.map((i) => (
            <li key={i.productId}>
              <label className={i.picked ? 'is-picked' : ''}>
                <input type="checkbox" checked={i.picked} onChange={() => togglePicked(o.id, i.productId)} />
                <span className="ao-checklist__img"><Photo src={i.image} alt="" fallback={i.emoji} /></span>
                <span className="ao-checklist__name">
                  {i.name} <small>× {i.qty} · {i.aisle}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={`btn btn--block m-btn-sm ${done ? 'btn--accent' : 'btn--primary'}`} onClick={() => markPacked(o.id)}>
        {done ? <><Check size={15} /> Mark as Packed</> : 'Mark as Packed'}
      </button>
    </article>
  )
}

function ReadyCard({ o, onHandOver }) {
  return (
    <article className="ao-card ao-card--ready">
      <div className="ao-card__top">
        <Link to={`/merchant/orders/${o.id}`} className="ao-card__id">#{o.id}</Link>
        <span className="ao-shelf">Shelf {o.shelf}</span>
      </div>
      <p className="ao-card__name">{o.customer.name}</p>
      <p className="ao-card__meta">
        {pluralize(count(o), 'item')} · {formatPrice(o.subtotal)} · {o.dueAtPickup ? `${formatPrice(o.dueAtPickup)} due` : 'Paid in full'}
      </p>
      <p className="ao-notified"><Footprints size={14} /> Customer notified · window {slotLabel(timeOf(o.slotStart))}</p>
      <button type="button" className="btn btn--accent btn--block m-btn-sm" onClick={() => onHandOver(o)}>
        <ScanLine size={15} /> Scan & Hand Over
      </button>
    </article>
  )
}

function OverdueCard({ o }) {
  const { remind, markNoShow, now } = useMerchant()
  const late = -minutesUntil(o.slotEnd, now)
  return (
    <article className="ao-card ao-card--overdue">
      <div className="ao-card__top">
        <Link to={`/merchant/orders/${o.id}`} className="ao-card__id">#{o.id}</Link>
        <span className="ao-card__when is-red">+{late}m late</span>
      </div>
      <p className="ao-card__name">{o.customer.name}</p>
      <p className="ao-card__meta">{pluralize(count(o), 'item')} · window {slotLabel(timeOf(o.slotStart))} · Shelf {o.shelf}</p>
      <div className="ao-card__btns">
        <button type="button" className="btn btn--outline m-btn-sm" onClick={() => remind(o.id)}><Bell size={14} /> Remind</button>
        <button type="button" className="btn m-btn-sm ao-noshow" onClick={() => markNoShow(o.id)}>No-show</button>
      </div>
    </article>
  )
}

function ActiveOrders() {
  const { orders, paused, setPaused, now, toast } = useMerchant()
  const [handover, setHandover] = useState(null)
  const [scanOpen, setScanOpen] = useState(false)

  const groups = {
    new: orders.filter((o) => o.status === 'new'),
    packing: orders.filter((o) => o.status === 'packing'),
    ready: orders.filter((o) => o.status === 'ready' && !isOverdue(o, now)),
    overdue: orders.filter((o) => isOverdue(o, now)),
  }
  const total = Object.values(groups).reduce((n, g) => n + g.length, 0)
  const next = [...groups.packing, ...groups.ready, ...groups.new].sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart))[0]

  const COLUMNS = [
    { key: 'new', label: 'New', tone: 'amber', render: (o) => <NewCard key={o.id} o={o} /> },
    { key: 'packing', label: 'Packing', tone: 'blue', render: (o) => <PackingCard key={o.id} o={o} /> },
    { key: 'ready', label: 'Ready for pickup', tone: 'green', render: (o) => <ReadyCard key={o.id} o={o} onHandOver={setHandover} /> },
    { key: 'overdue', label: 'Overdue', tone: 'red', render: (o) => <OverdueCard key={o.id} o={o} /> },
  ]

  return (
    <>
      <div className="m-head">
        <div>
          <p className="m-eyebrow m-eyebrow--live">Live · {timeOf(new Date(now).toISOString())}</p>
          <h1 className="m-title">Active Orders</h1>
          <p className="m-sub">
            {pluralize(total, 'order')} in progress{next && ` · next pickup window ${slotLabel(timeOf(next.slotStart))}`}
          </p>
        </div>
        <div className="m-actions">
          <button
            type="button"
            className={`btn btn--outline ${paused ? 'ao-resume' : 'ao-pause'}`}
            onClick={() => {
              setPaused(!paused)
              toast(paused ? 'You’re taking new orders again.' : 'New orders paused. Existing orders continue.', paused ? 'success' : 'warn')
            }}
          >
            {paused ? <><CirclePlay size={17} /> Resume new orders</> : <><CirclePause size={17} /> Pause new orders</>}
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setScanOpen(true)}>
            <ScanLine size={17} /> Scan Pickup QR
          </button>
        </div>
      </div>

      {paused && (
        <div className="ao-paused">
          <CirclePause size={18} /> New orders are paused. Customers see your shop as “busy” until you resume.
        </div>
      )}

      <div className="ao-board">
        {COLUMNS.map((col) => (
          <section key={col.key} className="ao-col">
            <h2 className={`ao-col__label ao-col__label--${col.tone}`}>
              <span className="ao-col__dot" /> {col.label} · {groups[col.key].length}
            </h2>
            {groups[col.key].map(col.render)}
            {groups[col.key].length === 0 && (
              <div className="ao-empty">
                <Coffee size={22} />
                {col.key === 'overdue' ? 'Nothing overdue' : 'All clear here'}
              </div>
            )}
          </section>
        ))}
      </div>

      {handover && <VerifyPickup order={handover} onClose={() => setHandover(null)} />}
      {scanOpen && <VerifyPickup onClose={() => setScanOpen(false)} />}
    </>
  )
}

export default ActiveOrders
