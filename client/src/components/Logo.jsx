import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const ICON_SIZE = { md: 18, lg: 24, xl: 28 }

/**
 * FastGrab logo.
 * size: 'md' | 'lg' | 'xl'   variant: 'dark' | 'light' (for dark backgrounds)
 */
function Logo({ size = 'md', variant = 'dark', badge, to = '/' }) {
  return (
    <Link to={to} className={`logo logo--${size} logo--${variant}`} aria-label="FastGrab home">
      <span className="logo__mark">
        <Zap size={ICON_SIZE[size]} fill="currentColor" strokeWidth={1.5} />
      </span>
      <span className="logo__text">FastGrab</span>
      {badge && <span className="logo__badge">{badge}</span>}
    </Link>
  )
}

export default Logo
