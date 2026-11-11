import { useEffect, useRef } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { initialsOf } from '../../../data/merchantData.js'

/** Round avatar with a customer's initials. */
export function CustomerAvatar({ customer, size = 32 }) {
  return (
    <span className="m-avatar" style={{ width: size, height: size, background: customer.color, fontSize: Math.round(size * 0.36) }}>
      {customer.initials ?? initialsOf(customer.name)}
    </span>
  )
}

const STATUS = {
  new: ['New', 'amber'],
  packing: ['Packing', 'blue'],
  ready: ['Ready', 'green'],
  overdue: ['Overdue', 'red'],
  picked_up: ['Picked up', 'done'],
  no_show: ['No-show', 'orange'],
  cancelled: ['Cancelled', 'red'],
}

export function OrderStatusPill({ status }) {
  const [label, tone] = STATUS[status] ?? [status, 'grey']
  return <span className={`m-pill m-pill--${tone}`}>{label}</span>
}

/** Stat tile used across the dashboard pages. */
export function StatCard({ label, value, icon: Icon, tone = 'green', trend, trendTone = 'up', hint }) {
  return (
    <div className="m-stat">
      <div className="m-stat__top">
        {Icon && (
          <span className={`m-stat__icon tone-${tone}`}>
            <Icon size={20} />
          </span>
        )}
        {trend && <span className={`m-trend m-trend--${trendTone}`}>{trend}</span>}
      </div>
      <strong className="m-stat__value">{value}</strong>
      <span className="m-stat__label">{label}</span>
      {hint && <span className="m-stat__hint">{hint}</span>}
    </div>
  )
}

/** − value + number control. */
export function NumberStepper({ value, onChange, min = 0, max = 99, label }) {
  return (
    <div className="m-stepper">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`}>
        <Plus size={14} />
      </button>
    </div>
  )
}

/** Accessible on/off switch. */
export function Toggle({ checked, onChange, label, showText = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`m-toggle${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="m-toggle__knob">{showText && (checked ? 'ON' : 'OFF')}</span>
    </button>
  )
}

/** Simple modal dialog with focus on open and Escape to close. */
export function Modal({ title, onClose, children, footer }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('input, button:not(.m-modal__close)')?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="m-modal-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="m-modal" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header className="m-modal__head">
          <h2>{title}</h2>
          <button type="button" className="m-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="m-modal__body">{children}</div>
        {footer && <footer className="m-modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
