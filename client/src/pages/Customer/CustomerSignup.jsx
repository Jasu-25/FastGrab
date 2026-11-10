import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Clock, Gift, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { AppleIcon, GoogleIcon } from '../../components/BrandIcons.jsx'
import { Field, InputWithIcon } from '../../components/FormField.jsx'
import { inputClass } from '../../utils/inputClass.js'
import useForm from '../../hooks/useForm.js'
import {
  isEmail,
  isIndianPhone,
  isRequired,
  isStrongPassword,
} from '../../utils/validators.js'
import './Customer.css'

const PERKS = [
  { icon: Clock, label: 'Save 15 mins per order' },
  { icon: ShieldCheck, label: '100% Secure Payments' },
  { icon: MapPin, label: '1000+ Stores Available' },
]

function validate(v) {
  const errors = {}
  if (!isRequired(v.firstName)) errors.firstName = 'First name is required.'
  if (!isRequired(v.lastName)) errors.lastName = 'Last name is required.'
  if (!isRequired(v.email)) errors.email = 'Email is required.'
  else if (!isEmail(v.email)) errors.email = 'Enter a valid email address.'
  if (!isRequired(v.phone)) errors.phone = 'Phone number is required.'
  else if (!isIndianPhone(v.phone)) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (!isStrongPassword(v.password))
    errors.password = 'Use at least 8 characters with a number and a symbol.'
  if (!v.agree) errors.agree = 'Please accept the Terms and Privacy Policy.'
  return errors
}

function CustomerSignup() {
  const { values, errors, setErrors, handleChange } = useForm({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agree: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    // TODO: POST /api/auth/customer/register
    setSubmitted(true)
  }

  return (
    <div className="auth-split">
      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-mobile-logo">
            <Logo size="lg" />
          </div>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join FastGrab and start saving time on your daily essentials.</p>

          {submitted && (
            <div className="form-alert form-alert--success" role="status">
              <CircleCheck size={18} />
              Details look good. Sign-up will work once the API is connected.
            </div>
          )}

          <div className="form-row">
            <Field label="First Name" htmlFor="su-first" error={errors.firstName}>
              <input
                id="su-first"
                name="firstName"
                className={inputClass(errors.firstName)}
                placeholder="Rahul"
                autoComplete="given-name"
                value={values.firstName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Last Name" htmlFor="su-last" error={errors.lastName}>
              <input
                id="su-last"
                name="lastName"
                className={inputClass(errors.lastName)}
                placeholder="Verma"
                autoComplete="family-name"
                value={values.lastName}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Email Address" htmlFor="su-email" error={errors.email}>
            <InputWithIcon icon={Mail}>
              <input
                id="su-email"
                name="email"
                type="email"
                className={inputClass(errors.email)}
                placeholder="name@example.com"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
              />
            </InputWithIcon>
          </Field>

          <Field label="Phone Number" htmlFor="su-phone" error={errors.phone}>
            <InputWithIcon icon={Phone}>
              <input
                id="su-phone"
                name="phone"
                type="tel"
                className={inputClass(errors.phone)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange}
              />
            </InputWithIcon>
          </Field>

          <Field
            label="Password"
            htmlFor="su-password"
            error={errors.password}
            hint="Must be at least 8 characters with a number and a symbol."
          >
            <PasswordInput
              id="su-password"
              name="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              invalid={!!errors.password}
            />
          </Field>

          <div className="field">
            <label className="checkbox">
              <input type="checkbox" name="agree" checked={values.agree} onChange={handleChange} />
              <span>
                By creating an account, you agree to our <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
              </span>
            </label>
            {errors.agree && <p className="field__error">{errors.agree}</p>}
          </div>

          <button type="submit" className="btn btn--accent btn--block btn--lg">
            Create Account
          </button>

          <div className="divider">Or sign up with</div>

          <div className="social-row">
            <button type="button" className="btn btn--outline social-btn">
              <GoogleIcon /> Google
            </button>
            <button type="button" className="btn btn--outline social-btn">
              <AppleIcon /> Apple
            </button>
          </div>

          <p className="auth-switch">
            Already have an account?
            <Link to="/customer/login" className="link">
              Log In
            </Link>
          </p>
        </form>
      </main>

      <aside className="auth-side">
        <div className="promo-card">
          <span className="promo-card__icon">
            <Gift size={26} />
          </span>
          <h2>First pickup is free!</h2>
          <p>
            Create an account today and we’ll waive the booking deposit on your first order.
            Experience the fastest way to shop.
          </p>
          <ul className="promo-card__perks">
            {PERKS.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span>
                  <Icon size={18} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default CustomerSignup
