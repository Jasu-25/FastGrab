import { Fragment } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Check } from 'lucide-react'
import Logo from '../../../components/Logo.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import './CustomerApp.css'

const STEPS = [
  { label: 'Cart', path: '/customer/cart' },
  { label: 'Pickup', path: '/customer/checkout/pickup' },
  { label: 'Payment', path: '/customer/checkout/payment' },
]

/** Shell for Cart → Pickup → Payment with a progress stepper in the header. */
function CheckoutLayout() {
  const { pathname } = useLocation()
  const current = Math.max(0, STEPS.findIndex((s) => s.path === pathname))

  return (
    <div className="cx">
      <header className="cx-nav cx-nav--checkout">
        <div className="container cx-nav__inner">
          <Logo to="/customer/explore" />
          <ol className="checkout-steps" aria-label="Checkout progress">
            {STEPS.map((step, i) => {
              const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
              return (
                <Fragment key={step.label}>
                  {i > 0 && <li className="checkout-steps__line" aria-hidden="true" />}
                  <li className={`checkout-steps__item is-${state}`}>
                    {state === 'done' ? (
                      <Link to={step.path} className="checkout-steps__link">
                        <span className="checkout-steps__dot">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {step.label}
                      </Link>
                    ) : (
                      <span className="checkout-steps__link" aria-current={state === 'current' ? 'step' : undefined}>
                        <span className="checkout-steps__dot">{i + 1}</span>
                        {step.label}
                      </span>
                    )}
                  </li>
                </Fragment>
              )
            })}
          </ol>
          <div className="cx-nav__actions">
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

export default CheckoutLayout
