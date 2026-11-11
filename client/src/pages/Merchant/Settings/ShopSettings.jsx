import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, Camera, Clock, Landmark, LogOut, Store } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { SHOP_ID, initialsOf, shopCover } from '../../../data/merchantData.js'
import { Field } from '../../../components/FormField.jsx'
import Photo from '../../../components/Photo.jsx'
import { inputClass } from '../../../utils/inputClass.js'
import { isEmail, isIndianPhone, isRequired } from '../../../utils/validators.js'
import { Toggle } from '../components/ui.jsx'
import './ShopSettings.css'

const CATEGORIES = ['Supermarket / Grocery', 'Fruits & Vegetables', 'Bakery & Confectionery', 'Cafe & Beverages', 'Pharmacy', 'Other']
const PREP = [10, 15, 20, 30, 45]
const HOLD = [15, 30, 45, 60]

function ShopSettings() {
  const { shop, updateShop, toast } = useMerchant()
  const navigate = useNavigate()
  const [form, setForm] = useState(shop)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const change = (e) => set(e.target.name, e.target.value)

  const toggleOnline = (online) => {
    updateShop({ online })
    setForm((f) => ({ ...f, online }))
    toast(online ? 'You’re online. Customers can book pickups.' : 'Shop is offline. Customers can’t place new orders.', online ? 'success' : 'warn')
  }

  const onLogo = (e) => {
    const file = e.target.files?.[0]
    if (file) set('logo', URL.createObjectURL(file))
  }

  const save = (e) => {
    e.preventDefault()
    const er = {}
    if (!isRequired(form.name)) er.name = 'Shop name is required.'
    if (!isRequired(form.owner)) er.owner = 'Owner / manager name is required.'
    if (!isEmail(form.email)) er.email = 'Enter a valid business email.'
    // Shops often list a landline, so accept 10–12 digit numbers, not just mobiles.
    const digits = form.phone.replace(/\D/g, '')
    if (!isIndianPhone(form.phone) && !(digits.length >= 10 && digits.length <= 12)) er.phone = 'Enter a valid phone number.'
    if (!isRequired(form.address)) er.address = 'Pickup address is required.'
    if (form.close <= form.open) er.close = 'Closing time must be after opening time.'
    setErrors(er)
    if (Object.keys(er).length) return
    updateShop(form)
    toast('Shop details saved.')
  }

  const input = (name, label, props = {}) => (
    <Field label={label} htmlFor={`shop-${name}`} error={errors[name]} className={props.full ? 'm-field-full' : ''}>
      <input id={`shop-${name}`} name={name} className={inputClass(errors[name], 'input--filled')} value={form[name]} onChange={change} type={props.type ?? 'text'} />
    </Field>
  )

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Shop Settings</h1>
          <p className="m-sub">Your storefront, hours and pickup preferences.</p>
        </div>
      </div>

      <div className="ss-layout">
        <div className="ss-main">
          <section className={`ss-status${shop.online ? '' : ' is-off'}`}>
            <span className="ss-status__icon"><Store size={24} /></span>
            <div>
              <p className="ss-status__label">Shop status</p>
              <h2>{shop.online ? 'You’re Online' : 'You’re Offline'}</h2>
              <p>{shop.online ? 'Customers can see your shop and book pickup slots.' : 'Your shop is hidden. Turn it on to accept orders again.'}</p>
            </div>
            <Toggle checked={shop.online} onChange={toggleOnline} label="Shop online" showText />
          </section>

          <form className="m-panel m-panel--pad" onSubmit={save} noValidate>
            <h2 className="m-panel__title ss-title">Basic Details</h2>
            <div className="ss-brand">
              <label className="ss-logo">
                {form.logo ? <img src={form.logo} alt="" /> : <span>{initialsOf(form.name || 'Shop')}</span>}
                <span className="ss-logo__cam"><Camera size={13} /></span>
                <input type="file" accept="image/*" className="sr-only" onChange={onLogo} aria-label="Change logo" />
              </label>
              <div>
                <strong>{form.name}</strong>
                <small><BadgeCheck size={13} /> Verified partner since {shop.partnerSince}</small>
              </div>
            </div>

            <div className="m-form-grid">
              {input('name', 'Shop name')}
              <Field label="Category" htmlFor="shop-category">
                <select id="shop-category" name="category" className="input input--filled" value={form.category} onChange={change}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              {input('owner', 'Owner / manager')}
              {input('email', 'Business email', { type: 'email' })}
              {input('phone', 'Phone', { type: 'tel' })}
              <div className="ss-hours">
                {input('open', 'Opens at', { type: 'time' })}
                {input('close', 'Closes at', { type: 'time' })}
              </div>
              {input('address', 'Pickup address', { full: true })}
            </div>

            <h2 className="m-panel__title ss-title ss-title--gap"><Clock size={17} /> Pickup preferences</h2>
            <div className="m-form-grid">
              <Field label="Average prep time" htmlFor="shop-prep" hint="Customers can’t book slots sooner than this.">
                <select id="shop-prep" className="input input--filled" value={form.prepMins} onChange={(e) => set('prepMins', Number(e.target.value))}>
                  {PREP.map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </Field>
              <Field label="Hold orders after the slot for" htmlFor="shop-hold" hint="After this an order can be marked as a no-show.">
                <select id="shop-hold" className="input input--filled" value={form.holdMins} onChange={(e) => set('holdMins', Number(e.target.value))}>
                  {HOLD.map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </Field>
            </div>
            <div className="item-toggle ss-toggle">
              <div>
                <strong>Auto-accept new orders</strong>
                <small>Skip the accept step when you have enough stock and slot capacity.</small>
              </div>
              <Toggle checked={form.autoAccept} onChange={(v) => set('autoAccept', v)} label="Auto-accept new orders" />
            </div>

            <div className="ss-actions">
              <button type="button" className="btn btn--ghost" onClick={() => { setForm(shop); setErrors({}) }}>Discard</button>
              <button type="submit" className="btn btn--primary">Save changes</button>
            </div>
          </form>
        </div>

        <aside className="ss-side">
          <section className="m-panel ss-preview">
            <div className="ss-preview__cover"><Photo src={shopCover()} alt="" /></div>
            <div className="ss-preview__body">
              <p className="m-eyebrow">How customers see you</p>
              <strong>{form.name}</strong>
              <small>{form.category} · open {form.open}–{form.close}</small>
              <Link to={`/customer/store/${SHOP_ID}`} target="_blank" rel="noreferrer" className="link small">View storefront ↗</Link>
            </div>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title"><Landmark size={17} /> Payout account</h2>
            <div className="ss-bank">
              <strong>HDFC Bank •••• 4417</strong>
              <small>IFSC HDFC0001234 · weekly settlements</small>
            </div>
            <button type="button" className="btn btn--outline btn--block m-btn-sm" onClick={() => toast('For security, bank changes are verified by FastGrab support.', 'warn')}>
              Request change
            </button>
          </section>

          <section className="m-panel m-panel--pad ss-logout">
            <strong>Log out of your shop account</strong>
            <small>Active orders keep running for your staff.</small>
            <button type="button" className="btn ss-logout__btn" onClick={() => navigate('/merchant/login')}>
              <LogOut size={16} /> Log out
            </button>
          </section>
        </aside>
      </div>
    </>
  )
}

export default ShopSettings
