import { ORDER_STATUS } from './orderStatus.js'

function StatusBadge({ status, size = 'md' }) {
  const { label, icon: Icon, tone } = ORDER_STATUS[status] ?? ORDER_STATUS.placed
  return (
    <span className={`status status--${tone} status--${size}`}>
      <Icon size={size === 'lg' ? 16 : 13} />
      {label}
    </span>
  )
}

export default StatusBadge
