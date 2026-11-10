import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { isExploreChild } from './navUtils.js'
import { ChevronDown, Compass, LogOut, Package, Settings, ShoppingCart, Sparkles } from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import Avatar from '../components/Avatar.jsx'

const LINKS = [
  { to: '/customer/explore', label: 'Explore', icon: Compass },
  { to: '/customer/recommended', label: 'Recommended', icon: Sparkles },
  { to: '/customer/orders', label: 'My Orders', icon: Package },
  { to: '/customer/cart', label: 'Cart', icon: ShoppingCart, showCount: true },
  { to: '/customer/settings', label: 'Settings', icon: Settings },
]

/**
 * Avatar button that reveals the navigation menu on hover (desktop)
 * or on click/tap (touch, keyboard). The current page is highlighted.
 */
function ProfileMenu() {
  const { user, cartCount, logout } = useCustomer()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <div
      ref={ref}
      className={`profile${open ? ' is-open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="profile__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar user={user} size={32} />
        <span className="profile__name">{user.firstName}</span>
        <ChevronDown size={16} className="profile__chevron" />
      </button>

      <div className="profile__menu" role="menu">
        <div className="profile__head">
          <Avatar user={user} size={40} />
          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <small>{user.email}</small>
          </div>
        </div>

        <nav aria-label="Account">
          {LINKS.map(({ to, label, icon: Icon, showCount }) => (
            <NavLink
              key={to}
              to={to}
              role="menuitem"
              className={({ isActive }) => `profile__link${isActive || isExploreChild(to, pathname) ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
              {showCount && cartCount > 0 && <span className="profile__count">{cartCount}</span>}
            </NavLink>
          ))}
        </nav>

        <button type="button" role="menuitem" className="profile__logout" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  )
}

export default ProfileMenu
