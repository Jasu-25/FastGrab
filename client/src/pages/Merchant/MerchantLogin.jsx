import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CircleCheck, Mail, QrCode, Receipt, TrendingUp } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { Field, InputWithIcon } from '../../components/FormField.jsx'
import { inputClass } from '../../utils/inputClass.js'
import useForm from '../../hooks/useForm.js'
import { isEmail, isRequired } from '../../utils/validators.js'
import './Merchant.css'

const BENEFITS = [
  { icon: CalendarCheck, text: 'See every pre-order and pickup slot in one place' },
  { icon: QrCode, text: 'Verify pickups with a QR scan in seconds' },
  { icon: Receipt, text: 'Transparent monthly commission statements' },
  { icon: TrendingUp, text: 'Track sales and peak-hour demand' },
]

function validate(values) {
  const errors = {}
  if (!isRequired(values.email)) errors.email = 'Business email is required.'
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!isRequired(values.password)) errors.password = 'Password is required.'
  return errors
}

function MerchantLogin() {
  const { values, errors, setErrors, handleChange } = useForm({
    email: '',
    password: '',
    remember: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    // TODO: POST /api/auth/merchant/login
    setSubmitted(true)
  }

  return (
    <div className="auth-split">
      <aside className="auth-panel">
        <div className="merchant-panel">
          <Logo size="lg" variant="light" badge="BUSINESS" />
          <h2 className="merchant-panel__title">Your store, ready before they arrive.</h2>
          <p className="merchant-panel__text">
            Log in to manage today’s orders, pickup slots and stock.
          </p>

          <ul className="merchant-panel__list">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span>
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-mobile-logo">
            <Logo size="lg" badge="BUSINESS" />
          </div>

          <h1 className="auth-title">Partner Login</h1>
          <p className="auth-subtitle">Welcome back. Log in to your store dashboard.</p>

          {submitted && (
            <div className="form-alert form-alert--success" role="status">
              <CircleCheck size={18} />
              Details look good. Login will work once the API is connected.
            </div>
          )}

          <Field label="Business Email" htmlFor="ml-email" error={errors.email}>
            <InputWithIcon icon={Mail}>
              <input
                id="ml-email"
                name="email"
                type="email"
                className={inputClass(errors.email)}
                placeholder="you@yourshop.com"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
              />
            </InputWithIcon>
          </Field>

          <Field
            label="Password"
            htmlFor="ml-password"
            error={errors.password}
            action={
              <a href="#" className="link field__action">
                Forgot Password?
              </a>
            }
          >
            <PasswordInput
              id="ml-password"
              name="password"
              value={values.password}
              onChange={handleChange}
              invalid={!!errors.password}
            />
          </Field>

          <label className="checkbox merchant-remember">
            <input type="checkbox" name="remember" checked={values.remember} onChange={handleChange} />
            Keep me logged in on this device
          </label>

          <button type="submit" className="btn btn--primary btn--block btn--lg">
            Log In
          </button>

          <p className="auth-switch">
            New to FastGrab?
            <Link to="/merchant/signup" className="link">
              Register your shop
            </Link>
          </p>
          <p className="merchant-alt">
            Shopping instead? <Link to="/customer/login" className="link">Customer login</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default MerchantLogin
