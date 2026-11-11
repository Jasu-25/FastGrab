import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import BackButton from '../../components/BackButton.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { Field, InputWithIcon } from '../../components/FormField.jsx'
import { usePlatform } from '../../context/platformContext.js'
import { inputClass } from '../../utils/inputClass.js'
import { isEmail } from '../../utils/validators.js'
import './AdminLogin.css'

/**
 * Admin sign-in. Not linked from Get Started on purpose; admins open
 * /admin/login directly.
 */
function AdminLogin() {
  const { currentAdmin, signIn } = usePlatform()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [failed, setFailed] = useState('')

  if (currentAdmin) return <Navigate to={state?.from ?? '/admin/overview'} replace />

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!isEmail(email)) er.email = 'Enter your admin email.'
    if (!password) er.password = 'Enter your password.'
    setErrors(er)
    setFailed('')
    if (Object.keys(er).length) return
    // TODO: POST /api/admin/auth/login (server-side check, rate limiting, 2FA)
    const res = signIn(email, password)
    if (!res.ok) return setFailed(res.error)
    navigate(state?.from ?? '/admin/overview', { replace: true })
  }

  return (
    <div className="admin-login">
      <aside className="admin-login__panel">
        <div className="admin-login__panel-inner">
          <Logo size="lg" variant="light" badge="ADMIN" to="/admin/login" />
          <h2>Platform console</h2>
          <p>Approve shops, manage commission plans and keep FastGrab running smoothly.</p>
          <ul>
            <li><ShieldCheck size={18} /> Restricted area. Access is logged.</li>
            <li><LockKeyhole size={18} /> Never share your admin credentials.</li>
          </ul>
        </div>
      </aside>

      <main className="admin-login__main">
        <BackButton to="/" label="Back to home" />
        <form className="admin-login__form" onSubmit={submit} noValidate>
          <div className="admin-login__mobile-logo"><Logo size="lg" badge="ADMIN" to="/admin/login" /></div>
          <span className="admin-login__icon"><ShieldCheck size={26} /></span>
          <h1>Admin sign in</h1>
          <p className="admin-login__sub">Use the email your FastGrab super admin invited.</p>

          {failed && (
            <div className="form-alert form-alert--error" role="alert">
              <CircleAlert size={18} /> {failed}
            </div>
          )}

          <Field label="Admin email" htmlFor="admin-email" error={errors.email}>
            <InputWithIcon icon={Mail}>
              <input
                id="admin-email"
                type="email"
                className={inputClass(errors.email)}
                placeholder="you@fastgrab.in"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((x) => ({ ...x, email: undefined }))
                }}
              />
            </InputWithIcon>
          </Field>
          <Field label="Password" htmlFor="admin-password" error={errors.password}>
            <PasswordInput
              id="admin-password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((x) => ({ ...x, password: undefined }))
              }}
              invalid={!!errors.password}
            />
          </Field>

          <button type="submit" className="btn btn--primary btn--block btn--lg">Sign in</button>
          <p className="admin-login__foot">Trouble signing in? Ask a super admin to resend your invite.</p>
        </form>
      </main>
    </div>
  )
}

export default AdminLogin
