import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, Clock, Info } from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { dayLabel, formatPrice, pluralize } from '../../../utils/format.js'
import { getSlots, slotLabel, upcomingDates } from '../../../utils/slots.js'
import StoreLogo from '../components/StoreLogo.jsx'
import './Checkout.css'

function SlotPicker({ group }) {
  const { setSlot } = useCustomer()
  const dates = upcomingDates(4)
  const [date, setDate] = useState(group.slot?.date ?? dates[0])
  const slots = getSlots(group.store, date)
  const bookable = slots.filter((s) => s.status !== 'past')

  return (
    <section className="card slot-card">
      <header className="shop-group__head">
        <StoreLogo store={group.store} size={40} />
        <div>
          <p className="shop-group__name">{group.store.name}</p>
          <p className="shop-group__addr">
            {pluralize(group.count, 'item')} · {formatPrice(group.subtotal)} · ready {group.store.prepMins} min after
            you order
          </p>
        </div>
        {group.slot ? (
          <span className="pill pill--green">
            <CircleCheck size={12} /> {dayLabel(group.slot.date).split(',')[0]} {slotLabel(group.slot.time)}
          </span>
        ) : (
          <span className="pill pill--warn">
            <Clock size={12} /> Choose a slot
          </span>
        )}
      </header>

      <div className="slot-card__body">
        <div className="date-tabs" role="tablist" aria-label={`Pickup date for ${group.store.name}`}>
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={d === date}
              className={`date-tab${d === date ? ' is-active' : ''}`}
              onClick={() => setDate(d)}
            >
              <span>{dayLabel(d).split(',')[0]}</span>
              <small>{dayLabel(d).split(', ').pop()}</small>
            </button>
          ))}
        </div>

        <p className="slot-card__hours">
          Open {group.store.open} – {group.store.close} · 15-minute pickup windows
        </p>

        {bookable.length === 0 ? (
          <p className="slot-card__none">No more slots today. Pick another day.</p>
        ) : (
          <div className="slot-grid">
            {bookable.map(({ time, status }) => {
              const selected = group.slot?.date === date && group.slot?.time === time
              return (
                <button
                  key={time}
                  type="button"
                  disabled={status === 'full'}
                  className={`slot${selected ? ' is-selected' : ''}`}
                  onClick={() => setSlot(group.store.id, { date, time })}
                  aria-pressed={selected}
                >
                  {time}
                  {status === 'full' && <small>Full</small>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function Pickup() {
  const { checkoutGroups } = useCustomer()
  const navigate = useNavigate()

  if (checkoutGroups.length === 0) return <Navigate to="/customer/cart" replace />

  const allChosen = checkoutGroups.every((g) => g.slot)

  return (
    <div className="container">
      <Link to="/customer/cart" className="back-link">
        <ArrowLeft size={14} /> Back to cart
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Choose a Pickup Slot</h1>
          <p className="page-sub">Pick a time to collect. Your order will be packed and waiting at the counter.</p>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {checkoutGroups.map((g) => (
            <SlotPicker key={g.store.id} group={g} />
          ))}
        </div>

        <aside className="card card-pad summary">
          <h2 className="summary__title">Pickup Plan</h2>
          <ul className="plan-list">
            {checkoutGroups.map((g) => (
              <li key={g.store.id}>
                <StoreLogo store={g.store} size={32} />
                <div>
                  <strong>{g.store.name}</strong>
                  <small className={g.slot ? '' : 'text-orange'}>
                    {g.slot ? `${dayLabel(g.slot.date)} · ${slotLabel(g.slot.time)}` : 'No slot selected'}
                  </small>
                </div>
              </li>
            ))}
          </ul>
          <p className="summary__note">
            <Info size={14} /> Arrive within your window. Orders are held for 30 minutes after the slot ends.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            disabled={!allChosen}
            onClick={() => navigate('/customer/checkout/payment')}
          >
            Continue to Payment <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  )
}

export default Pickup
