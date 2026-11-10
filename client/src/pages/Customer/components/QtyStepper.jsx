import { Minus, Plus } from 'lucide-react'

/** − qty + control. Going below 1 removes the item. */
function QtyStepper({ qty, onChange, label = 'item', size = 'md' }) {
  return (
    <div className={`qty qty--${size}`}>
      <button type="button" onClick={() => onChange(qty - 1)} aria-label={`Remove one ${label}`}>
        <Minus size={14} />
      </button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} aria-label={`Add one ${label}`}>
        <Plus size={14} />
      </button>
    </div>
  )
}

export default QtyStepper
