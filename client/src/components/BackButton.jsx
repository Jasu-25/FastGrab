import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Pill-shaped "← Back" link shown at the top-left of auth pages. */
function BackButton({ to, label = 'Back', className = '' }) {
  return (
    <Link to={to} className={`back-btn ${className}`.trim()}>
      <ArrowLeft size={17} /> {label}
    </Link>
  )
}

export default BackButton
