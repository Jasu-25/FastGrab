import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Flame,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Settings,
  Wallet,
  X,
} from 'lucide-react'
import Logo from '../../../components/Logo.jsx'
import { ACTIVE_STATUSES, useMerchant } from '../../../context/merchantContext.js'
import { initialsOf } from '../../../data/merchantData.js'
import './MerchantApp.css'

function Sidebar({ onNavigate }) {
  const { orders, shop } = useMerchant()
  const navigate = useNavigate()
  const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
  const newCount = orders.filter((o) => o.status === 'new').length

  const NAV = [
    { to: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/merchant/active-orders', label: 'Active Orders', icon: Flame, badge: activeCount, pulse: newCount > 0 },
    { to: '/merchant/orders', label: 'All Orders', icon: ClipboardList },
    { to: '/merchant/inventory', label: 'Inventory', icon: Package },
    { to: '/merchant/offers', label: 'Offers', icon: Megaphone },
    { to: '/merchant/payments', label: 'Payments', icon: Wallet },
    { to: '/merchant/slots', label: 'Pickup Slots', icon: CalendarClock },
    { to: '/merchant/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="m-side__inner">
      <div className="m-side__brand">
        <Logo variant="light" badge="SHOP" to="/merchant/dashboard" />
      </div>

      <div className={`m-side__status${shop.online ? '' : ' is-off'}`}>
        <span className="m-side__dot" />
        {shop.online ? 'Taking orders' : 'Shop offline'}
      </div>

      <nav className="m-side__nav" aria-label="Shop">
        {NAV.map(({ to, label, icon: Icon, badge, pulse }) => (
          <NavLink key={to} to={to} className="m-side__link" onClick={onNavigate}>
            <Icon size={18} />
            <span>{label}</span>
            {badge > 0 && <span className={`m-side__badge${pulse ? ' is-pulse' : ''}`}>{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="m-side__foot">
        <div className="m-side__user">
          <span className="m-side__avatar">{initialsOf(shop.owner)}</span>
          <span>
            <strong>{shop.owner}</strong>
            <small>{shop.name}</small>
          </span>
        </div>
        <button type="button" className="m-side__logout" onClick={() => navigate('/merchant/login')} aria-label="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts } = useMerchant()
  return (
    <div className="m-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`m-toast m-toast--${t.tone}`}>
          {t.tone === 'warn' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

/** Shell for the merchant dashboard: dark sidebar + page content. */
function MerchantLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  // Close the mobile drawer whenever the page changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  // While the mobile menu is open, stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <div className="m-app">
      <aside className={`m-side${open ? ' is-open' : ''}`}>
        <button type="button" className="m-side__close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>
      {open && <div className="m-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="m-content">
        <header className="m-topbar">
          <button type="button" className="m-topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo badge="SHOP" to="/merchant/dashboard" />
        </header>
        <main className="m-main">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}

export default MerchantLayout
