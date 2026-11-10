import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleCheck, ShoppingBasket, Store } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import './RoleSelect.css'

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    title: 'I’m a Customer',
    description: 'Order ahead from nearby stores and collect without queues.',
    icon: ShoppingBasket,
    features: ['Browse 1,000+ local shops', 'Pick your pickup time slot', 'QR code collection in seconds'],
  },
  {
    id: 'merchant',
    label: 'Business',
    title: 'I’m a Business',
    description: 'Supermarkets, grocers and retailers taking pre-orders.',
    icon: Store,
    features: ['Manage orders & inventory', 'Control pickup slot capacity', 'Sales analytics & payouts'],
  },
]

function RoleSelect() {
  const [role, setRole] = useState('customer')
  const navigate = useNavigate()
  const selected = ROLES.find((r) => r.id === role)

  return (
    <main className="role-page">
      <Link to="/" className="role-page__back">
        <ArrowLeft size={18} /> Back to home
      </Link>

      <div className="role-page__inner">
        <Logo />

        <h1 className="role-page__title">How will you use FastGrab?</h1>
        <p className="role-page__subtitle">Choose your account type to continue.</p>

        <div className="role-grid" role="radiogroup" aria-label="Account type">
          {ROLES.map(({ id, title, description, icon: Icon, features }) => {
            const isActive = role === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`role-card role-card--${id}${isActive ? ' is-active' : ''}`}
                onClick={() => setRole(id)}
              >
                <span className="role-card__top">
                  <span className="role-card__icon">
                    <Icon size={24} />
                  </span>
                  <span className="role-card__radio" aria-hidden="true">
                    {isActive && <Check size={14} strokeWidth={3} />}
                  </span>
                </span>
                <span className="role-card__title">{title}</span>
                <span className="role-card__desc">{description}</span>
                <span className="role-card__features">
                  {features.map((f) => (
                    <span key={f} className="role-card__feature">
                      <CircleCheck size={16} aria-hidden="true" />
                      {f}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="btn btn--primary btn--lg role-page__cta"
          onClick={() => navigate(`/${role}/login`)}
        >
          Continue as {selected.label} <ArrowRight size={20} />
        </button>

        <p className="role-page__new">
          New here?{' '}
          <Link to={`/${role}/signup`} className="link">
            {role === 'merchant' ? 'Register your shop' : 'Create an account'}
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RoleSelect
