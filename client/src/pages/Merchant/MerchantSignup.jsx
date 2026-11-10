import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CircleCheck,
  CloudUpload,
  FileText,
  QrCode,
  Receipt,
  TrendingUp,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import PasswordInput from '../../components/PasswordInput.jsx'
import { Field } from '../../components/FormField.jsx'
import { inputClass } from '../../utils/inputClass.js'
import useForm from '../../hooks/useForm.js'
import {
  isAccountNumber,
  isEmail,
  isFssai,
  isGstin,
  isIfsc,
  isIndianPhone,
  isPan,
  isPincode,
  isRequired,
  isStrongPassword,
  isUpiId,
} from '../../utils/validators.js'
import './Merchant.css'

// ---------- Options ----------

const STEPS = ['Account', 'Shop details', 'Verification']

const CATEGORIES = [
  'Supermarket / Grocery',
  'Fruits & Vegetables',
  'Bakery & Confectionery',
  'Cafe & Beverages',
  'Meat & Fish',
  'Pharmacy',
  'Clothing & Apparel',
  'Electronics',
  'Stationery & Books',
  'Other',
]

// Food businesses need an FSSAI licence; pharmacies need a drug licence.
const FOOD_CATEGORIES = new Set([
  'Supermarket / Grocery',
  'Fruits & Vegetables',
  'Bakery & Confectionery',
  'Cafe & Beverages',
  'Meat & Fish',
])

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const PREP_TIMES = ['15', '30', '45', '60', '90']
const SLOT_LENGTHS = ['15', '30', '60']

const WHY_PARTNER = [
  { icon: CalendarCheck, text: 'Control exactly how many orders each slot takes' },
  { icon: QrCode, text: 'QR hand-over in under 10 seconds' },
  { icon: Receipt, text: 'Clear monthly commission statements' },
  { icon: TrendingUp, text: 'Sales & demand analytics' },
]

const INITIAL_VALUES = {
  // Step 1: Account
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  // Step 2: Shop details
  shopName: '',
  category: CATEGORIES[0],
  address: '',
  city: '',
  state: '',
  pincode: '',
  openTime: '08:00',
  closeTime: '21:00',
  prepTime: '30',
  slotLength: '15',
  maxOrdersPerSlot: '5',
  storefrontPhoto: null,
  // Step 3: Verification
  legalName: '',
  pan: '',
  gstin: '',
  fssai: '',
  drugLicense: '',
  businessProof: null,
  accountHolder: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  upiId: '',
  agree: false,
}

// ---------- Validation (per step) ----------

function validateStep(step, v) {
  const e = {}

  if (step === 0) {
    if (!isRequired(v.fullName)) e.fullName = 'Full name is required.'
    if (!isRequired(v.email)) e.email = 'Business email is required.'
    else if (!isEmail(v.email)) e.email = 'Enter a valid email address.'
    if (!isRequired(v.phone)) e.phone = 'Phone number is required.'
    else if (!isIndianPhone(v.phone)) e.phone = 'Enter a valid 10-digit mobile number.'
    if (!isStrongPassword(v.password))
      e.password = 'Use at least 8 characters with a number and a symbol.'
    if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.'
    else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.'
  }

  if (step === 1) {
    if (!isRequired(v.shopName)) e.shopName = 'Shop name is required.'
    if (!isRequired(v.category)) e.category = 'Choose a category.'
    if (!isRequired(v.address)) e.address = 'Pickup address is required.'
    if (!isRequired(v.city)) e.city = 'City is required.'
    if (!isRequired(v.state)) e.state = 'Choose a state.'
    if (!isPincode(v.pincode)) e.pincode = 'Enter a valid 6-digit pincode.'
    if (!v.openTime) e.openTime = 'Opening time is required.'
    if (!v.closeTime) e.closeTime = 'Closing time is required.'
    else if (v.openTime && v.closeTime <= v.openTime)
      e.closeTime = 'Closing time must be after opening time.'
    const max = Number(v.maxOrdersPerSlot)
    if (!Number.isInteger(max) || max < 1 || max > 100)
      e.maxOrdersPerSlot = 'Enter a number from 1 to 100.'
    if (!v.storefrontPhoto) e.storefrontPhoto = 'Upload a photo of your storefront.'
  }

  if (step === 2) {
    if (!isRequired(v.legalName)) e.legalName = 'Legal business name is required.'
    if (!isPan(v.pan)) e.pan = 'Enter a valid PAN (e.g. ABCDE1234F).'
    if (isRequired(v.gstin) && !isGstin(v.gstin)) e.gstin = 'Enter a valid 15-character GSTIN.'
    if (FOOD_CATEGORIES.has(v.category) && !isFssai(v.fssai))
      e.fssai = 'Enter your 14-digit FSSAI licence number.'
    if (v.category === 'Pharmacy' && !isRequired(v.drugLicense))
      e.drugLicense = 'Drug licence number is required for pharmacies.'
    if (!v.businessProof) e.businessProof = 'Upload a business registration document.'
    if (!isRequired(v.accountHolder)) e.accountHolder = 'Account holder name is required.'
    if (!isAccountNumber(v.accountNumber)) e.accountNumber = 'Enter a valid account number.'
    if (v.confirmAccountNumber !== v.accountNumber || !v.confirmAccountNumber)
      e.confirmAccountNumber = 'Account numbers do not match.'
    if (!isIfsc(v.ifsc)) e.ifsc = 'Enter a valid IFSC (e.g. HDFC0001234).'
    if (isRequired(v.upiId) && !isUpiId(v.upiId)) e.upiId = 'Enter a valid UPI ID.'
    if (!v.agree) e.agree = 'Please accept the Partner Terms to continue.'
  }

  return e
}

// ---------- Small components ----------

function Stepper({ current, onSelect }) {
  return (
    <ol className="stepper">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
        return (
          <li key={label} className={`stepper__item is-${state}`}>
            <button
              type="button"
              className="stepper__btn"
              onClick={() => onSelect(i)}
              disabled={i >= current}
              aria-current={i === current ? 'step' : undefined}
            >
              <span className="stepper__dot">
                {state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className="stepper__label">{label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function UploadField({ id, name, label, accept, hint, file, error, onChange }) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <label className={`upload${error ? ' upload--error' : ''}${file ? ' upload--done' : ''}`}>
        <input id={id} name={name} type="file" accept={accept} onChange={onChange} className="sr-only" />
        {file ? <FileText size={18} /> : <CloudUpload size={18} />}
        <span>{file ? file.name : hint}</span>
      </label>
    </Field>
  )
}

// ---------- Page ----------

function MerchantSignup() {
  const { values, errors, setErrors, handleChange } = useForm(INITIAL_VALUES)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const isFood = FOOD_CATEGORIES.has(values.category)
  const isPharmacy = values.category === 'Pharmacy'

  /** Renders a text-like input wrapped in a Field. */
  const input = (name, label, { type = 'text', placeholder, autoComplete, hint, full, ...rest } = {}) => (
    <Field
      label={label}
      htmlFor={`ms-${name}`}
      error={errors[name]}
      hint={hint}
      className={full ? 'field--full' : ''}
    >
      <input
        id={`ms-${name}`}
        name={name}
        type={type}
        className={inputClass(errors[name], 'input--filled')}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={!!errors[name] || undefined}
        {...rest}
      />
    </Field>
  )

  /** Renders a <select> wrapped in a Field. */
  const select = (name, label, options, { placeholder, format = (o) => o, full } = {}) => (
    <Field label={label} htmlFor={`ms-${name}`} error={errors[name]} className={full ? 'field--full' : ''}>
      <select
        id={`ms-${name}`}
        name={name}
        className={inputClass(errors[name], 'input--filled')}
        value={values[name]}
        onChange={handleChange}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {format(o)}
          </option>
        ))}
      </select>
    </Field>
  )

  const goNext = (e) => {
    e.preventDefault()
    const stepErrors = validateStep(step, values)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      // Move focus to the first invalid field.
      const first = Object.keys(stepErrors)[0]
      document.getElementById(`ms-${first}`)?.focus()
      return
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // TODO: POST /api/merchants/register (multipart/form-data for the uploads)
      setSubmitted(true)
    }
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="merchant-page">
      <header className="merchant-topbar">
        <div className="container merchant-topbar__inner">
          <Logo badge="BUSINESS" />
          <p>
            Already a partner?{' '}
            <Link to="/merchant/login" className="link">
              Log in
            </Link>
          </p>
        </div>
      </header>

      <div className="container merchant-layout">
        <main>
          <h1 className="merchant-title">Register your shop</h1>
          <p className="merchant-subtitle">Start taking scheduled pickup orders in under 24 hours.</p>

          {submitted ? (
            <div className="merchant-card merchant-success">
              <span className="merchant-success__icon">
                <CircleCheck size={40} />
              </span>
              <h2>Application submitted</h2>
              <p>
                Thanks, {values.fullName.split(' ')[0]}! We’ll review <strong>{values.shopName}</strong>{' '}
                and email <strong>{values.email}</strong> within 24–48 hours.
              </p>
              <Link to="/" className="btn btn--primary">
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <Stepper current={step} onSelect={setStep} />

              <form className="merchant-card" onSubmit={goNext} noValidate>
                {step === 0 && (
                  <section>
                    <h2 className="merchant-section-title">Owner account</h2>
                    <div className="form-grid">
                      {input('fullName', 'Full name', { placeholder: 'Rajesh Kumar', autoComplete: 'name' })}
                      {input('email', 'Business email', {
                        type: 'email',
                        placeholder: 'you@yourshop.com',
                        autoComplete: 'email',
                      })}
                      {input('phone', 'Phone', {
                        type: 'tel',
                        placeholder: '+91 98765 43210',
                        autoComplete: 'tel',
                        hint: 'Used for order alerts and OTP verification.',
                      })}
                      <div />
                      <Field label="Password" htmlFor="ms-password" error={errors.password} hint="Min. 8 characters with a number and a symbol.">
                        <PasswordInput
                          id="ms-password"
                          name="password"
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                          value={values.password}
                          onChange={handleChange}
                          invalid={!!errors.password}
                          showIcon={false}
                          filled
                        />
                      </Field>
                      <Field label="Confirm password" htmlFor="ms-confirmPassword" error={errors.confirmPassword}>
                        <PasswordInput
                          id="ms-confirmPassword"
                          name="confirmPassword"
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          invalid={!!errors.confirmPassword}
                          showIcon={false}
                          filled
                        />
                      </Field>
                    </div>
                  </section>
                )}

                {step === 1 && (
                  <>
                    <section>
                      <h2 className="merchant-section-title">Shop details</h2>
                      <div className="form-grid">
                        {input('shopName', 'Shop name', { placeholder: 'GreenGrocer Central' })}
                        {select('category', 'Category', CATEGORIES)}
                        {input('address', 'Pickup address', {
                          placeholder: 'Shop no., building, street, area',
                          autoComplete: 'street-address',
                          full: true,
                        })}
                        {input('city', 'City', { placeholder: 'Bengaluru', autoComplete: 'address-level2' })}
                        {select('state', 'State', STATES, { placeholder: 'Select state' })}
                        {input('pincode', 'Pincode', {
                          inputMode: 'numeric',
                          maxLength: 6,
                          placeholder: '560001',
                          autoComplete: 'postal-code',
                        })}
                        <UploadField
                          id="ms-storefrontPhoto"
                          name="storefrontPhoto"
                          label="Storefront photo"
                          accept="image/png,image/jpeg"
                          hint="Upload JPG / PNG"
                          file={values.storefrontPhoto}
                          error={errors.storefrontPhoto}
                          onChange={handleChange}
                        />
                      </div>
                    </section>

                    <hr className="merchant-divider" />

                    <section>
                      <h2 className="merchant-section-title">Pickup settings</h2>
                      <p className="merchant-section-text">
                        Customers can only book slots inside your opening hours. You can change these
                        later from the dashboard.
                      </p>
                      <div className="form-grid">
                        {input('openTime', 'Opening time', { type: 'time' })}
                        {input('closeTime', 'Closing time', { type: 'time' })}
                        {select('prepTime', 'Order preparation time', PREP_TIMES, {
                          format: (m) => `${m} minutes`,
                        })}
                        {select('slotLength', 'Pickup slot length', SLOT_LENGTHS, {
                          format: (m) => `${m} minutes`,
                        })}
                        {input('maxOrdersPerSlot', 'Max orders per slot', {
                          type: 'number',
                          min: 1,
                          max: 100,
                          hint: 'Prevents overbooking during busy hours.',
                        })}
                      </div>
                    </section>
                  </>
                )}

                {step === 2 && (
                  <>
                    <section>
                      <h2 className="merchant-section-title">Business verification</h2>
                      <div className="form-grid">
                        {input('legalName', 'Legal business name', {
                          placeholder: 'As on PAN / registration',
                          full: true,
                        })}
                        {input('pan', 'PAN', {
                          placeholder: 'ABCDE1234F',
                          maxLength: 10,
                          style: { textTransform: 'uppercase' },
                        })}
                        {input('gstin', 'GSTIN (optional)', {
                          placeholder: '29ABCDE1234F1Z5',
                          maxLength: 15,
                          style: { textTransform: 'uppercase' },
                          hint: 'Required if your business is GST-registered.',
                        })}
                        {isFood &&
                          input('fssai', 'FSSAI licence no.', {
                            inputMode: 'numeric',
                            maxLength: 14,
                            placeholder: '14-digit number',
                          })}
                        {isPharmacy &&
                          input('drugLicense', 'Drug licence no.', { placeholder: 'e.g. KA-B12-123456' })}
                        <UploadField
                          id="ms-businessProof"
                          name="businessProof"
                          label="Registration document"
                          accept="application/pdf,image/png,image/jpeg"
                          hint="Shop & Establishment / GST certificate (PDF, JPG, PNG)"
                          file={values.businessProof}
                          error={errors.businessProof}
                          onChange={handleChange}
                        />
                      </div>
                    </section>

                    <hr className="merchant-divider" />

                    <section>
                      <h2 className="merchant-section-title">Payout details</h2>
                      <p className="merchant-section-text">
                        Where we send your settlements. The account should be in your business or
                        owner’s name.
                      </p>
                      <div className="form-grid">
                        {input('accountHolder', 'Account holder name', { full: true })}
                        {input('accountNumber', 'Account number', {
                          inputMode: 'numeric',
                          autoComplete: 'off',
                        })}
                        {input('confirmAccountNumber', 'Confirm account number', {
                          inputMode: 'numeric',
                          autoComplete: 'off',
                          onPaste: (e) => e.preventDefault(),
                        })}
                        {input('ifsc', 'IFSC code', {
                          placeholder: 'HDFC0001234',
                          maxLength: 11,
                          style: { textTransform: 'uppercase' },
                        })}
                        {input('upiId', 'UPI ID (optional)', { placeholder: 'yourshop@okbank' })}
                      </div>
                    </section>

                    <div className="field">
                      <label className="checkbox merchant-agree">
                        <input type="checkbox" name="agree" checked={values.agree} onChange={handleChange} />
                        <span>
                          I agree to the FastGrab <a href="#">Partner Terms</a> and confirm I’m
                          authorised to register this business.
                        </span>
                      </label>
                      {errors.agree && <p className="field__error">{errors.agree}</p>}
                    </div>
                  </>
                )}

                <div className="merchant-actions">
                  {step > 0 && (
                    <button type="button" className="btn btn--outline btn--lg" onClick={goBack}>
                      <ArrowLeft size={18} /> Back
                    </button>
                  )}
                  <button type="submit" className="btn btn--accent btn--lg merchant-actions__next">
                    {step === STEPS.length - 1 ? 'Submit for Approval' : 'Continue'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </main>

        <aside className="merchant-aside">
          <div className="why-card">
            <p className="why-card__eyebrow">Why partner</p>
            <h2>No setup fee. First ₹50,000 in sales every month is commission-free.</h2>
            <ul>
              {WHY_PARTNER.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <Icon size={18} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <figure className="merchant-quote">
            <span className="merchant-quote__avatar">RM</span>
            <div>
              <blockquote>“Our lunchtime queue disappeared in the first week.”</blockquote>
              <figcaption>Raj M. · Daily Fresh Market</figcaption>
            </div>
          </figure>
        </aside>
      </div>
    </div>
  )
}

export default MerchantSignup
