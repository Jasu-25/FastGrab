import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  House,
  Menu,
  Power,
  Receipt,
  ShieldUser,
  Store,
  Users,
  X,
} from 'lucide-react'
import Logo from '../../../components/Logo.jsx'
import { usePlatform } from '../../../context/platformContext.js'
import { ADMIN_ROLES } from '../../../data/platformData.js'
import { initialsOf } from '../../../data/merchantData.js'
// Reuse the dashboard building blocks (panels, tables, pills, modal, toasts).
import '../../Merchant/layout/MerchantApp.css'
import './AdminApp.css'

function Sidebar() {
  const { applications, offerRequests, currentAdmin, signOut } = usePlatform()
  const navigate = useNavigate()
  const pending = applications.length + offerRequests.length

  const NAV = [
    { to: '/admin/overview', label: 'Overview', icon: House },
    { to: '/admin/shops', label: 'Shop Management', icon: Store },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck, badge: pending },
    { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
    { to: '/admin/admins', label: 'Admin Management', icon: ShieldUser },
  ]

  return (
    <div className="a-side__inner">
      <div className="a-side__brand">
        <Logo badge="ADMIN" to="/admin/overview" />
      </div>
      <nav className="a-side__nav" aria-label="Admin">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} className="a-side__link">
            <Icon size={18} />
            <span>{label}</span>
            {badge > 0 && <span className="a-side__badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="a-side__foot">
        <span className="a-side__avatar" style={{ background: currentAdmin.color }}>{initialsOf(currentAdmin.name)}</span>
        <span className="a-side__who">
          <strong>{currentAdmin.name}</strong>
          <small>{ADMIN_ROLES[currentAdmin.role].label}</small>
        </span>
        <button
          type="button"
          className="a-side__logout"
          aria-label="Sign out"
          onClick={() => {
            signOut()
            navigate('/admin/login')
          }}
        >
          <Power size={17} />
        </button>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts } = usePlatform()
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

/** Admin console shell. Redirects to /admin/login when signed out. */
function AdminLayout() {
  const { currentAdmin } = usePlatform()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!currentAdmin) return <Navigate to="/admin/login" replace state={{ from: pathname }} />

  return (
    <div className="m-app a-app">
      <aside className={`a-side${open ? ' is-open' : ''}`}>
        <button type="button" className="a-side__close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>
        <Sidebar />
      </aside>
      {open && <div className="m-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="m-content">
        <header className="m-topbar">
          <button type="button" className="m-topbar__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo badge="ADMIN" to="/admin/overview" />
        </header>
        <main className="m-main">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}

export default AdminLayout
