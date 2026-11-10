import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, Mail } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { AppleIcon, GoogleIcon } from '../../components/BrandIcons.jsx'
import { Field, InputWithIcon } from '../../components/FormField.jsx'
import { inputClass } from '../../utils/inputClass.js'
import useForm from '../../hooks/useForm.js'
import { isEmail, isRequired } from '../../utils/validators.js'
import './Customer.css'

function validate(values) {
  const errors = {}
  if (!isRequired(values.email)) errors.email = 'Email is required.'
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.'
  if (!isRequired(values.password)) errors.password = 'Password is required.'
  return errors
}

function CustomerLogin() {
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
    // TODO: POST /api/auth/customer/login
    setSubmitted(true)
  }

  return (
    <div className="auth-split">
      <aside className="auth-panel">
        <div className="customer-panel">
          <Logo size="xl" variant="light" />
          <h2 className="customer-panel__title">
            Skip the wait.
            <br />
            Your time matters.
          </h2>
          <p className="customer-panel__text">
            Join thousands of commuters who save 15+ minutes every day by ordering ahead and
            grabbing their items on the go.
          </p>

          <figure className="testimonial">
            <figcaption className="testimonial__person">
              <span className="testimonial__avatar">PS</span>
              <span>
                <strong>Priya Sharma</strong>
                <small>Daily Commuter</small>
              </span>
            </figcaption>
            <blockquote>
              “FastGrab has completely changed my morning routine. I order my coffee and
              croissant on the metro and pick it up the second I step out. No queues, ever.”
            </blockquote>
          </figure>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-mobile-logo">
            <Logo size="lg" />
          </div>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your account to start grabbing.</p>

          {submitted && (
            <div className="form-alert form-alert--success" role="status">
              <CircleCheck size={18} />
              Details look good. Login will work once the API is connected.
            </div>
          )}

          <Field label="Email Address" htmlFor="login-email" error={errors.email}>
            <InputWithIcon icon={Mail}>
              <input
                id="login-email"
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

          <Field
            label="Password"
            htmlFor="login-password"
            error={errors.password}
            action={
              <a href="#" className="link field__action">
                Forgot Password?
              </a>
            }
          >
            <PasswordInput
              id="login-password"
              name="password"
              value={values.password}
              onChange={handleChange}
              invalid={!!errors.password}
            />
          </Field>

          <label className="checkbox auth-remember">
            <input type="checkbox" name="remember" checked={values.remember} onChange={handleChange} />
            Remember me for 30 days
          </label>

          <button type="submit" className="btn btn--primary btn--block btn--lg">
            Log In
          </button>

          <div className="divider">Or continue with</div>

          <div className="social-row">
            <button type="button" className="btn btn--outline social-btn">
              <GoogleIcon /> Google
            </button>
            <button type="button" className="btn btn--outline social-btn">
              <AppleIcon /> Apple
            </button>
          </div>

          <p className="auth-switch">
            Don’t have an account?
            <Link to="/customer/signup" className="link">
              Sign Up
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}

export default CustomerLogin
