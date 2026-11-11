import { useState } from 'react'
import { Ban, CircleCheck, Clock, Play, Sun, Sunrise, Sunset } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { isoDate, parseIsoDate } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import { NumberStepper } from '../components/ui.jsx'
import './Slots.css'

const PERIODS = [
  { id: 'all', label: 'All day' },
  { id: 'morning', label: 'Morning', icon: Sunrise, from: '00:00', to: '12:00' },
  { id: 'afternoon', label: 'Afternoon', icon: Sun, from: '12:00', to: '17:00' },
  { id: 'evening', label: 'Evening', icon: Sunset, from: '17:00', to: '24:00' },
]

function PickupSlots() {
  const { slots, defaultMax, setDefaultMax, setSlotMax, toggleSlot, setDayOpen, now } = useMerchant()
  const dates = Object.keys(slots)
  const [date, setDate] = useState(dates[0])
  const [period, setPeriod] = useState('all')

  const nowDate = new Date(now)
  const isToday = date === isoDate(nowDate)
  const p = PERIODS.find((x) => x.id === period)
  // Start of the current 15-minute window, e.g. 14:37 → "14:30".
  const currentSlot = `${String(nowDate.getHours()).padStart(2, '0')}:${String(Math.floor(nowDate.getMinutes() / 15) * 15).padStart(2, '0')}`

  // Today: only show slots whose window hasn't ended yet.
  const daySlots = (slots[date] ?? []).filter((s) => !isToday || s.time >= currentSlot)
  const list = daySlots.filter((s) => period === 'all' || (s.time >= p.from && s.time < p.to))

  const open = daySlots.filter((s) => s.open)
  const capacity = open.reduce((n, s) => n + s.max, 0)
  const booked = daySlots.reduce((n, s) => n + s.booked, 0)
  const util = capacity ? Math.round((booked / capacity) * 100) : 0
  const allStopped = daySlots.length > 0 && open.length === 0

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Manage Pickup Slots</h1>
          <p className="m-sub">15-minute windows · set how many orders each slot can take</p>
        </div>
        <div className="slots-default">
          <span>Default per slot</span>
          <NumberStepper value={defaultMax} onChange={setDefaultMax} min={1} max={50} label="default orders per slot" />
        </div>
      </div>

      <div className="slots-top">
        <div className="slots-days" role="tablist" aria-label="Day">
          {dates.map((d, i) => {
            const dt = parseIsoDate(d)
            return (
              <button key={d} type="button" role="tab" aria-selected={d === date} className={`slots-day${d === date ? ' is-active' : ''}`} onClick={() => setDate(d)}>
                <small>{i === 0 ? 'Today' : dt.toLocaleDateString('en-IN', { weekday: 'short' })}</small>
                <strong>{i === 0 ? dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) : dt.getDate()}</strong>
              </button>
            )
          })}
        </div>
        <div className="m-actions">
          <button type="button" className="btn slots-stop-all" disabled={allStopped} onClick={() => setDayOpen(date, false)}>
            <Ban size={16} /> Stop all {isToday ? 'today' : 'this day'}
          </button>
          <button type="button" className="btn slots-open-all" onClick={() => setDayOpen(date, true)}>
            <CircleCheck size={16} /> Open all
          </button>
        </div>
      </div>

      <div className="slots-summary">
        <span><strong>{open.length}</strong> open slots</span>
        <span><strong>{capacity}</strong> order capacity</span>
        <span><strong>{booked}</strong> booked</span>
        <span className="slots-summary__util">
          <strong>{util}%</strong> utilisation
          <span className="slots-summary__bar"><span style={{ width: `${util}%` }} /></span>
        </span>
      </div>

      <section className="m-panel slots-panel">
        <div className="slots-periods m-seg" role="tablist" aria-label="Time of day">
          {PERIODS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={period === x.id} className={period === x.id ? 'is-active' : ''} onClick={() => setPeriod(x.id)}>
              {x.icon && <x.icon size={14} />} {x.label}
            </button>
          ))}
        </div>

        <ul className="slot-list">
          {list.map((s) => {
            const pct = Math.min(100, (s.booked / s.max) * 100)
            const full = s.booked >= s.max
            const state = !s.open ? 'stopped' : full ? 'full' : pct >= 70 ? 'busy' : 'open'
            return (
              <li key={s.time} className={`slot-row slot-row--${state}`}>
                <span className="slot-row__icon"><Clock size={18} /></span>
                <div className="slot-row__time">
                  <strong>{slotLabel(s.time)}</strong>
                  <span className={`m-pill slot-pill--${state}`}>{state === 'stopped' ? 'Stopped' : state === 'full' ? 'Full' : state === 'busy' ? 'Filling fast' : 'Open'}</span>
                </div>
                <div className="slot-row__load">
                  <div className="slot-row__nums">
                    <span>{s.booked} booked</span>
                    <strong>{Math.max(0, s.max - s.booked)} left</strong>
                  </div>
                  <span className="slot-row__bar"><span style={{ width: `${pct}%` }} /></span>
                </div>
                <div className="slot-row__max">
                  <span>Max orders</span>
                  <NumberStepper value={s.max} onChange={(v) => setSlotMax(date, s.time, v)} min={Math.max(1, s.booked)} max={50} label={`max orders ${s.time}`} />
                </div>
                {s.open ? (
                  <button type="button" className="btn m-btn-sm slot-stop" onClick={() => toggleSlot(date, s.time)}>
                    <Ban size={14} /> Stop slot
                  </button>
                ) : (
                  <button type="button" className="btn btn--accent m-btn-sm" onClick={() => toggleSlot(date, s.time)}>
                    <Play size={14} /> Open slot
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {list.length === 0 && <p className="m-empty">No more slots in this period.</p>}
      </section>
    </>
  )
}

export default PickupSlots
