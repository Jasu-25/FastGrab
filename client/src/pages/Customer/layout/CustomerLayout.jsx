import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import Logo from '../../../components/Logo.jsx'
import { useCustomer } from '../../../context/customerContext.js'
import ProfileMenu from './ProfileMenu.jsx'
import { isExploreChild } from './navUtils.js'
import './CustomerApp.css'

const NAV = [
  { to: '/customer/explore', label: 'Explore' },
  { to: '/customer/recommended', label: 'Recommended' },
  { to: '/customer/orders', label: 'My Orders' },
]

export function CartButton() {
  const { cartCount } = useCustomer()
  return (
    <NavLink to="/customer/cart" className="cx-cart" aria-label={`Cart, ${cartCount} items`}>
      <ShoppingCart size={20} />
      {cartCount > 0 && <span className="cx-cart__badge">{cartCount}</span>}
    </NavLink>
  )
}

/** Shell for the signed-in customer pages: top nav + page content. */
function CustomerLayout() {
  const { pathname } = useLocation()
  return (
    <div className="cx">
      <header className="cx-nav">
        <div className="container cx-nav__inner">
          <Logo to="/customer/explore" />
          <nav className="cx-nav__links" aria-label="Main">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `cx-nav__link${isActive || isExploreChild(to, pathname) ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="cx-nav__actions">
            <CartButton />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <main className="cx-main">
        <Outlet />
      </main>
    </div>
  )
}

export default CustomerLayout
