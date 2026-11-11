import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Check, CreditCard, Landmark, Lock, ShieldCheck, Smartphone } from 'lucide-react'
import StoreLogo from '../components/StoreLogo.jsx'
import { slotLabel } from '../../../utils/slots.js'
import { useCustomer } from '../../../context/customerContext.js'
import { Field } from '../../../components/FormField.jsx'
import { inputClass } from '../../../utils/inputClass.js'
import { dayLabel, formatPrice, pluralize } from '../../../utils/format.js'
import { isRequired, isUpiId } from '../../../utils/validators.js'
import './Checkout.css'
import Photo from '../../../components/Photo.jsx'

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm or any UPI app', icon: Smartphone },
  { id: 'card', label: 'Credit or Debit Card', hint: 'Visa, Mastercard, RuPay supported', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major Indian banks', icon: Landmark },
]

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank']

const digits = (v) => v.replace(/\D/g, '')

function validate(method, f) {
  const e = {}
  if (method === 'upi' && !isUpiId(f.upiId)) e.upiId = 'Enter a valid UPI ID, e.g. name@okbank.'
  if (method === 'card') {
    if (!isRequired(f.cardName)) e.cardName = 'Name on card is required.'
    if (digits(f.cardNumber).length < 15) e.cardNumber = 'Enter a valid card number.'
    const [mm, yy] = f.expiry.split('/').map((x) => Number(x))
    if (!mm || mm > 12 || !yy || yy < 26) e.expiry = 'Enter a valid expiry (MM/YY).'
    if (!/^\d{3,4}$/.test(f.cvv)) e.cvv = 'Enter the 3 or 4 digit CVV.'
  }
  if (method === 'netbanking' && !f.bank) e.bank = 'Choose your bank.'
  return e
}

function methodLabel(method, f) {
  if (method === 'upi') return `UPI · ${f.upiId.trim()}`
  if (method === 'card') return `Card •••• ${digits(f.cardNumber).slice(-4)}`
  return `Net Banking · ${f.bank}`
}

function Payment() {
  const { checkoutGroups, checkoutCount, checkoutSubtotal, checkoutDeposit, placeOrders } = useCustomer()
  const navigate = useNavigate()
  // Set right before the cart is emptied so the guards below don't redirect to /cart.
  const [placing, setPlacing] = useState(false)

  const [method, setMethod] = useState('upi')
  const [payMode, setPayMode] = useState('full')
  const [fields, setFields] = useState({ upiId: '', cardName: '', cardNumber: '', expiry: '', cvv: '', bank: '' })
  const [errors, setErrors] = useState({})

  if (placing) return null
  if (checkoutGroups.length === 0) return <Navigate to="/customer/cart" replace />
  if (checkoutGroups.some((g) => !g.slot)) return <Navigate to="/customer/checkout/pickup" replace />

  const payNow = payMode === 'full' ? checkoutSubtotal : checkoutDeposit
  const dueLater = checkoutSubtotal - payNow

  const update = (name, value) => {
    setFields((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const formatCard = (v) => digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const formatExpiry = (v) => {
    const d = digits(v).slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const handlePay = () => {
    if (payNow > 0) {
      const e = validate(method, fields)
      setErrors(e)
      if (Object.keys(e).length) return
    }
    // TODO: create a payment order on the server, open the gateway checkout,
    // and confirm via webhook before marking orders as paid.
    setPlacing(true)
    const ids = placeOrders({ payMode, method: methodLabel(method, fields) })
    navigate(`/customer/orders/${ids[0]}`, { state: { justPlaced: ids.length } })
  }

  const err = (name) => errors[name]

  return (
    <div className="container">
      <Link to="/customer/checkout/pickup" className="back-link">
        <ArrowLeft size={14} /> Back to pickup slots
      </Link>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div>
            <h1 className="page-title page-title--light">Secure Payment</h1>
            <p className="page-sub">Select your preferred payment method to complete your booking.</p>
          </div>

          {payNow === 0 ? (
            <div className="card card-pad pay-later">
              <ShieldCheck size={22} />
              <div>
                <strong>Nothing to pay online</strong>
                <p>You’ll pay {formatPrice(checkoutSubtotal)} at the shop counter when you collect.</p>
              </div>
            </div>
          ) : (
            <div className="methods" role="radiogroup" aria-label="Payment method">
              {METHODS.map(({ id, label, hint, icon: Icon }) => {
                const active = method === id
                return (
                  <div key={id} className={`method${active ? ' is-active' : ''}`}>
                    <button type="button" role="radio" aria-checked={active} className="method__head" onClick={() => setMethod(id)}>
                      <span className="method__icon"><Icon size={20} /></span>
                      <span className="method__text">
                        <strong>{label}</strong>
                        <small>{hint}</small>
                      </span>
                      <span className="method__radio">{active && <Check size={14} strokeWidth={3} />}</span>
                    </button>

                    {active && id === 'upi' && (
                      <div className="method__body">
                        <Field label="UPI ID" htmlFor="pay-upi" error={err('upiId')}>
                          <input id="pay-upi" className={inputClass(err('upiId'), 'input--filled')} placeholder="yourname@okbank" value={fields.upiId} onChange={(e) => update('upiId', e.target.value)} />
                        </Field>
                      </div>
                    )}

                    {active && id === 'card' && (
                      <div className="method__body">
                        <Field label="Cardholder name" htmlFor="pay-name" error={err('cardName')}>
                          <input id="pay-name" className={inputClass(err('cardName'), 'input--filled')} placeholder="Name on card" autoComplete="cc-name" value={fields.cardName} onChange={(e) => update('cardName', e.target.value)} />
                        </Field>
                        <Field label="Card number" htmlFor="pay-number" error={err('cardNumber')}>
                          <input id="pay-number" className={inputClass(err('cardNumber'), 'input--filled')} placeholder="•••• •••• •••• ••••" inputMode="numeric" autoComplete="cc-number" value={fields.cardNumber} onChange={(e) => update('cardNumber', formatCard(e.target.value))} />
                        </Field>
                        <div className="form-row">
                          <Field label="Expiry date" htmlFor="pay-exp" error={err('expiry')}>
                            <input id="pay-exp" className={inputClass(err('expiry'), 'input--filled')} placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" value={fields.expiry} onChange={(e) => update('expiry', formatExpiry(e.target.value))} />
                          </Field>
                          <Field label="CVV" htmlFor="pay-cvv" error={err('cvv')}>
                            <input id="pay-cvv" type="password" className={inputClass(err('cvv'), 'input--filled')} placeholder="•••" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={fields.cvv} onChange={(e) => update('cvv', digits(e.target.value))} />
                          </Field>
                        </div>
                      </div>
                    )}

                    {active && id === 'netbanking' && (
                      <div className="method__body">
                        <Field label="Bank" htmlFor="pay-bank" error={err('bank')}>
                          <select id="pay-bank" className={inputClass(err('bank'), 'input--filled')} value={fields.bank} onChange={(e) => update('bank', e.target.value)}>
                            <option value="" disabled>Select your bank</option>
                            {BANKS.map((b) => <option key={b}>{b}</option>)}
                          </select>
                        </Field>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <section className="card review">
            <header className="review__head">
              <h2 className="card-title">Review your pickups</h2>
              <Link to="/customer/cart" className="link small">Edit cart</Link>
            </header>
            {checkoutGroups.map((g) => (
              <div key={g.store.id} className="review__shop">
                <div className="review__store">
                  <StoreLogo store={g.store} size={40} />
                  <div>
                    <strong>{g.store.name}</strong>
                    <small>
                      <CalendarClock size={12} /> {dayLabel(g.slot.date)} · {slotLabel(g.slot.time)} · {g.store.counter}
                    </small>
                  </div>
                  <span className="review__total">{formatPrice(g.subtotal)}</span>
                </div>
                <div className="review__items">
                  {g.lines.map(({ product, qty }) => (
                    <span key={product.id} className="review__item">
                      <span aria-hidden="true"><Photo src={product.image} fallback={product.emoji} /></span>
                      {product.name}
                      <small>× {qty}</small>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="card card-pad summary">
          <h2 className="summary__title">Payment Summary</h2>
          <div className="sum-row">
            Subtotal ({pluralize(checkoutCount, 'item')}) <strong>{formatPrice(checkoutSubtotal)}</strong>
          </div>
          <div className="sum-row">
            Booking Deposit
            <strong className={checkoutDeposit ? '' : 'text-green'}>{checkoutDeposit ? formatPrice(checkoutDeposit) : 'FREE'}</strong>
          </div>

          <div className="pay-mode" role="radiogroup" aria-label="How much to pay now">
            <button type="button" role="radio" aria-checked={payMode === 'full'} className={payMode === 'full' ? 'is-active' : ''} onClick={() => setPayMode('full')}>
              Pay in full now
            </button>
            <button type="button" role="radio" aria-checked={payMode === 'deposit'} className={payMode === 'deposit' ? 'is-active' : ''} onClick={() => setPayMode('deposit')}>
              {checkoutDeposit ? 'Deposit now, rest at pickup' : 'Pay at pickup'}
            </button>
          </div>

          <div className="sum-row sum-row--total">
            To Pay Now <strong>{formatPrice(payNow)}</strong>
          </div>
          {dueLater > 0 && (
            <div className="sum-row">
              Due at pickup <strong className="text-orange">{formatPrice(dueLater)}</strong>
            </div>
          )}

          <p className="secure-note">
            <ShieldCheck size={16} />
            Your payment is encrypted and processed by our payment partner. FastGrab never stores your full card
            details.
          </p>

          <button type="button" className="btn btn--primary btn--block btn--lg" onClick={handlePay}>
            <Lock size={16} /> {payNow > 0 ? `Pay ${formatPrice(payNow)}` : 'Place order'}
          </button>
          <p className="summary__terms">
            By continuing you agree to FastGrab’s <a href="#">Pickup Terms</a> and cancellation policy.
          </p>
        </aside>
      </div>
    </div>
  )
}

export default Payment
