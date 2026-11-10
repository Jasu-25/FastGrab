import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Camera,
  CircleCheck,
  Dumbbell,
  Heart,
  House,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { getStore } from '../../../data/mockData.js'
import { Field } from '../../../components/FormField.jsx'
import PasswordInput from '../../../components/PasswordInput.jsx'
import { inputClass } from '../../../utils/inputClass.js'
import { isEmail, isIndianPhone, isRequired, isStrongPassword } from '../../../utils/validators.js'
import Avatar from '../components/Avatar.jsx'
import { StoreIcon } from '../components/StoreLogo.jsx'
import './Settings.css'

const LOCATION_TYPES = {
  home: { icon: House, tone: 'teal' },
  work: { icon: Briefcase, tone: 'blue' },
  gym: { icon: Dumbbell, tone: 'purple' },
  other: { icon: MapPin, tone: 'orange' },
}

function SavedNotice({ text }) {
  return (
    <span className="saved-notice" role="status">
      <CircleCheck size={15} /> {text}
    </span>
  )
}

// ---------- Personal details ----------
function PersonalDetails() {
  const { user, updateUser } = useCustomer()
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setSaved(false)
  }

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    // Preview only. Upload to the API (multipart) once it exists.
    if (file) updateUser({ avatarUrl: URL.createObjectURL(file) })
  }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!isRequired(form.firstName)) er.firstName = 'First name is required.'
    if (!isRequired(form.lastName)) er.lastName = 'Last name is required.'
    if (!isEmail(form.email)) er.email = 'Enter a valid email address.'
    if (!isIndianPhone(form.phone)) er.phone = 'Enter a valid 10-digit mobile number.'
    setErrors(er)
    if (Object.keys(er).length) return
    updateUser(form)
    setSaved(true)
  }

  const input = (name, label, type = 'text') => (
    <Field label={label} htmlFor={`set-${name}`} error={errors[name]}>
      <input id={`set-${name}`} name={name} type={type} className={inputClass(errors[name], 'input--filled')} value={form[name]} onChange={change} />
    </Field>
  )

  return (
    <form className="card card-pad settings-card" onSubmit={submit} noValidate>
      <h2 className="card-title"><User size={18} /> Personal Details</h2>

      <div className="profile-row">
        <label className="profile-photo">
          <Avatar user={user} size={68} />
          <span className="profile-photo__btn" aria-hidden="true"><Camera size={13} /></span>
          <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} aria-label="Change profile photo" />
        </label>
        <div>
          <strong>{user.firstName} {user.lastName}</strong>
          <small>Member since {user.memberSince} · {user.pickups} pickups</small>
        </div>
      </div>

      <div className="settings-grid">
        {input('firstName', 'First name')}
        {input('lastName', 'Last name')}
        {input('email', 'Email', 'email')}
        {input('phone', 'Phone', 'tel')}
      </div>

      <div className="settings-actions">
        {saved && <SavedNotice text="Profile updated" />}
        <button type="submit" className="btn btn--primary">Save changes</button>
      </div>
    </form>
  )
}

// ---------- Saved locations ----------
function LocationForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!isRequired(form.label) || !isRequired(form.address)) {
      setError('Add a name and an address.')
      return
    }
    onSave(form)
  }

  return (
    <form className="location-form" onSubmit={submit}>
      <div className="location-form__row">
        <input className="input input--filled" placeholder="Name (e.g. Home)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} aria-label="Location name" />
        <select className="input input--filled" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="Location type">
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="gym">Gym</option>
          <option value="other">Other</option>
        </select>
      </div>
      <input className="input input--filled" placeholder="Full address with pincode" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} aria-label="Address" />
      {error && <p className="field__error">{error}</p>}
      <div className="location-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save location</button>
      </div>
    </form>
  )
}

function SavedLocations() {
  const { locations, saveLocation, removeLocation, setDefaultLocation } = useCustomer()
  const [editing, setEditing] = useState(null) // location id, 'new', or null

  const save = (loc) => {
    saveLocation(loc.id === 'new' ? { ...loc, id: `loc-${Date.now()}` } : loc)
    setEditing(null)
  }

  return (
    <section className="card card-pad settings-card">
      <div className="card-head">
        <h2 className="card-title"><MapPin size={18} /> Saved Locations</h2>
        {editing !== 'new' && (
          <button type="button" className="link small-link" onClick={() => setEditing('new')}>
            <Plus size={14} /> Add location
          </button>
        )}
      </div>

      <ul className="locations">
        {locations.map((loc) => {
          if (editing === loc.id) {
            return <li key={loc.id}><LocationForm initial={loc} onSave={save} onCancel={() => setEditing(null)} /></li>
          }
          const { icon: Icon, tone } = LOCATION_TYPES[loc.type] ?? LOCATION_TYPES.other
          return (
            <li key={loc.id} className={`location${loc.isDefault ? ' is-default' : ''}`}>
              <span className={`location__icon ${loc.isDefault ? 'is-default' : `tone-${tone}`}`}><Icon size={18} /></span>
              <div className="location__info">
                <strong>
                  {loc.label}
                  {loc.isDefault && <span className="location__badge">Default</span>}
                </strong>
                <small>{loc.address}</small>
              </div>
              <div className="location__actions">
                {!loc.isDefault && (
                  <button type="button" className="link small-link" onClick={() => setDefaultLocation(loc.id)}>Set default</button>
                )}
                <button type="button" className="icon-action" onClick={() => setEditing(loc.id)} aria-label={`Edit ${loc.label}`}>
                  <Pencil size={15} />
                </button>
                {!loc.isDefault && (
                  <button type="button" className="icon-action icon-action--danger" onClick={() => removeLocation(loc.id)} aria-label={`Delete ${loc.label}`}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
          )
        })}
        {editing === 'new' && (
          <li>
            <LocationForm
              initial={{ id: 'new', label: '', type: 'other', address: '', isDefault: locations.length === 0 }}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          </li>
        )}
      </ul>
    </section>
  )
}

// ---------- Saved shops ----------
function SavedShops() {
  const { savedShops, toggleSavedShop } = useCustomer()
  const stores = savedShops.map(getStore).filter(Boolean)

  return (
    <section className="card card-pad settings-card">
      <div className="card-head">
        <h2 className="card-title card-title--heart"><Heart size={18} fill="currentColor" /> Saved Shops</h2>
        <Link to="/customer/explore" className="link small-link">Browse shops</Link>
      </div>
      {stores.length ? (
        <div className="saved-shops">
          {stores.map((s) => (
            <div key={s.id} className="saved-shop">
              <Link to={`/customer/store/${s.id}`} className={`saved-shop__media tone-${s.tone}`}>
                <StoreIcon store={s} size={36} />
              </Link>
              <div className="saved-shop__body">
                <div>
                  <Link to={`/customer/store/${s.id}`} className="saved-shop__name">{s.name}</Link>
                  <small>{s.distanceKm} km · ★ {s.rating}</small>
                </div>
                <button type="button" className="saved-shop__heart" onClick={() => toggleSavedShop(s.id)} aria-label={`Remove ${s.name} from saved shops`}>
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No saved shops yet. Tap the heart on any store to save it here.</p>
      )}
    </section>
  )
}

// ---------- Change password ----------
function ChangePassword() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
    setSaved(false)
  }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.current) er.current = 'Enter your current password.'
    if (!isStrongPassword(form.next)) er.next = 'Min. 8 characters with a number and a symbol.'
    if (form.confirm !== form.next || !form.confirm) er.confirm = 'Passwords do not match.'
    setErrors(er)
    if (Object.keys(er).length) return
    // TODO: PATCH /api/customers/me/password
    setForm({ current: '', next: '', confirm: '' })
    setSaved(true)
  }

  const pw = (name, label, placeholder, autoComplete) => (
    <Field label={label} htmlFor={`pw-${name}`} error={errors[name]}>
      <PasswordInput id={`pw-${name}`} name={name} value={form[name]} onChange={change} placeholder={placeholder} autoComplete={autoComplete} invalid={!!errors[name]} showIcon={false} filled />
    </Field>
  )

  return (
    <form className="card card-pad settings-card" onSubmit={submit} noValidate>
      <h2 className="card-title"><Lock size={18} /> Change Password</h2>
      <div className="settings-grid settings-grid--3">
        {pw('current', 'Current password', '••••••••', 'current-password')}
        {pw('next', 'New password', 'Min. 8 characters', 'new-password')}
        {pw('confirm', 'Confirm new password', 'Repeat password', 'new-password')}
      </div>
      <div className="settings-actions">
        {saved && <SavedNotice text="Password updated" />}
        <button type="submit" className="btn btn--outline btn--outline-dark">Update password</button>
      </div>
    </form>
  )
}

function Settings() {
  const { logout } = useCustomer()
  const navigate = useNavigate()

  return (
    <div className="container settings-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your profile, places and security.</p>
        </div>
      </div>

      <div className="settings-stack">
        <PersonalDetails />
        <SavedLocations />
        <SavedShops />
        <ChangePassword />

        <section className="card card-pad logout-card">
          <div>
            <strong>Log out of FastGrab</strong>
            <small>Active pickups stay saved to your account.</small>
          </div>
          <button
            type="button"
            className="btn logout-card__btn"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </section>
      </div>
    </div>
  )
}

export default Settings
