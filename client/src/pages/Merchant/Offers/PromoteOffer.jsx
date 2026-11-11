import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Landmark, Megaphone, Upload, Wallet, X } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { BANNER_CHOICES, OFFER_PRICING, SHOP_ID } from '../../../data/merchantData.js'
import { getStore } from '../../../data/mockData.js'
import { Field } from '../../../components/FormField.jsx'
import Photo from '../../../components/Photo.jsx'
import { inputClass } from '../../../utils/inputClass.js'
import { formatPrice, isoDate, parseIsoDate } from '../../../utils/format.js'
import './Offers.css'

const TYPES = {
  percent: { label: 'Percentage off', badge: (v) => `${v}% OFF`, unit: '%' },
  flat: { label: 'Flat ₹ off', badge: (v) => `₹${v} OFF`, unit: '₹' },
  bogo: { label: 'Buy 1 Get 1 free', badge: () => 'BUY 1 GET 1', unit: '' },
}

const PAYMENTS = [
  { id: 'payout', icon: Wallet, title: 'Deduct from next payout', hint: 'Available balance ₹28,410' },
  { id: 'card', icon: CreditCard, title: 'Business card •••• 9012', hint: 'Expires 08/28' },
  { id: 'bank', icon: Landmark, title: 'Bank transfer', hint: 'Offer goes live once payment clears' },
]

const fmt = (iso) => parseIsoDate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

function PromoteOffer() {
  const { offers, inventory, createOffer, toast } = useMerchant()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const source = offers.find((o) => o.id === params.get('from'))
  const today = isoDate()

  const [form, setForm] = useState(() => ({
    title: source?.title ?? '',
    type: source?.type ?? 'percent',
    value: source?.value ?? 10,
    start: today,
    appliesTo: source?.appliesTo ?? [],
    banner: source?.image ?? BANNER_CHOICES[0].url,
    weeks: 2,
    payment: 'payout',
  }))
  const [query, setQuery] = useState('')
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const plan = OFFER_PRICING.find((p) => p.weeks === form.weeks)
  const endDate = (() => {
    const d = parseIsoDate(form.start)
    d.setDate(d.getDate() + form.weeks * 7 - 1)
    return isoDate(d)
  })()
  const store = getStore(SHOP_ID)
  const suggestions = inventory
    .filter((i) => i.visible && !form.appliesTo.includes(i.name) && i.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)

  const onUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) set('banner', URL.createObjectURL(file))
  }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.title.trim()) er.title = 'Give your offer a short, clear title.'
    if (form.type !== 'bogo' && !(Number(form.value) > 0)) er.value = 'Enter a discount value.'
    if (form.type === 'percent' && Number(form.value) > 90) er.value = 'Keep percentage discounts at 90% or less.'
    if (!form.appliesTo.length) er.appliesTo = 'Pick at least one product.'
    if (form.start < today) er.start = 'Start date can’t be in the past.'
    setErrors(er)
    if (Object.keys(er).length) return
    // TODO: POST /api/merchants/me/offers, charge via the chosen payment method,
    // and keep the offer in "review" until FastGrab approves it.
    createOffer({
      id: `off-${offers.length + 1}-${form.start}`,
      storeId: SHOP_ID,
      title: form.title.trim(),
      badge: TYPES[form.type].badge(form.value),
      type: form.type,
      value: Number(form.value),
      appliesTo: form.appliesTo,
      image: form.banner,
      start: form.start,
      end: endDate,
      weeks: form.weeks,
      views: 0,
      redeemed: 0,
      status: 'live',
    })
    toast('Offer is live. Nearby customers now see it on Explore.')
    navigate('/merchant/offers')
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="m-head">
        <div>
          <p className="m-eyebrow"><Link to="/merchant/offers"><ArrowLeft size={13} /> My offers</Link></p>
          <h1 className="m-title">Promote an Offer</h1>
          <p className="m-sub">Featured offers appear on the customer Explore page and in Recommended for nearby shoppers.</p>
        </div>
      </div>

      <div className="promo-layout">
        <div className="promo-main">
          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title promo-step">1. Offer details</h2>
            <Field label="Offer title" htmlFor="offer-title" error={errors.title}>
              <input id="offer-title" className={inputClass(errors.title, 'input--filled')} maxLength={48} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 20% off all organic fruit" />
            </Field>
            <div className="m-form-grid m-form-grid--3">
              <Field label="Discount type" htmlFor="offer-type">
                <select id="offer-type" className="input input--filled" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {Object.entries(TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Value" htmlFor="offer-value" error={errors.value}>
                <div className="prefix-input">
                  <span>{TYPES[form.type].unit}</span>
                  <input id="offer-value" type="number" min="1" disabled={form.type === 'bogo'} className={inputClass(errors.value, 'input--filled')} value={form.type === 'bogo' ? '' : form.value} onChange={(e) => set('value', e.target.value)} placeholder={form.type === 'bogo' ? 'Free item' : ''} />
                </div>
              </Field>
              <Field label="Start date" htmlFor="offer-start" error={errors.start}>
                <input id="offer-start" type="date" min={today} className={inputClass(errors.start, 'input--filled')} value={form.start} onChange={(e) => set('start', e.target.value)} />
              </Field>
            </div>

            <Field label="Applies to" htmlFor="offer-products" error={errors.appliesTo}>
              <div className="promo-products">
                <div className="tag-input">
                  {form.appliesTo.map((n) => (
                    <span key={n} className="tag-chip">
                      {n}
                      <button type="button" onClick={() => set('appliesTo', form.appliesTo.filter((x) => x !== n))} aria-label={`Remove ${n}`}><X size={12} /></button>
                    </span>
                  ))}
                  <input id="offer-products" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your products…" autoComplete="off" />
                </div>
                {query && suggestions.length > 0 && (
                  <ul className="promo-suggest">
                    {suggestions.map((i) => (
                      <li key={i.id}>
                        <button type="button" onClick={() => { set('appliesTo', [...form.appliesTo, i.name]); setQuery('') }}>
                          <span className="promo-suggest__img"><Photo src={i.images[0]} alt="" fallback={i.emoji} /></span>
                          {i.name} <small>{formatPrice(i.price)}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>

            <p className="field__label">Banner image</p>
            <div className="banner-picks">
              {BANNER_CHOICES.map((b) => (
                <button key={b.id} type="button" className={`banner-pick${form.banner === b.url ? ' is-active' : ''}`} onClick={() => set('banner', b.url)} aria-label={`Use ${b.label} photo`} aria-pressed={form.banner === b.url}>
                  <Photo src={b.url} alt="" />
                  {form.banner === b.url && <span className="banner-pick__check"><Check size={12} strokeWidth={3} /></span>}
                </button>
              ))}
              <label className="banner-pick banner-pick--upload">
                <input type="file" accept="image/*" className="sr-only" onChange={onUpload} />
                <Upload size={18} />
                <span>Upload</span>
              </label>
            </div>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title">2. Promotion length</h2>
            <p className="promo-sub">{formatPrice(499)} per week · longer plans get a discount</p>
            <div className="plans" role="radiogroup" aria-label="Promotion length">
              {OFFER_PRICING.map((p) => (
                <button key={p.weeks} type="button" role="radio" aria-checked={form.weeks === p.weeks} className={`plan${form.weeks === p.weeks ? ' is-active' : ''}`} onClick={() => set('weeks', p.weeks)}>
                  {p.popular && <span className="plan__popular">Popular</span>}
                  <strong>{p.weeks} <small>week{p.weeks > 1 ? 's' : ''}</small></strong>
                  <span>{formatPrice(p.price)} {p.save > 0 && <em>save {p.save}%</em>}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title promo-step">3. Payment method</h2>
            <div className="pay-options" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map(({ id, icon: Icon, title, hint }) => (
                <label key={id} className={`pay-option${form.payment === id ? ' is-active' : ''}`}>
                  <input type="radio" name="payment" checked={form.payment === id} onChange={() => set('payment', id)} />
                  <span className="pay-option__icon"><Icon size={18} /></span>
                  <span>
                    <strong>{title}</strong>
                    <small>{hint}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="promo-preview m-panel m-panel--pad">
          <p className="m-eyebrow">Preview on customer Explore</p>
          <div className="promo-banner">
            <Photo src={form.banner} alt="" />
            <div className="promo-banner__shade" />
            <div className="promo-banner__text">
              <span className="promo-banner__badge">{TYPES[form.type].badge(form.value || 0)}</span>
              <strong>{form.title || 'Your offer title'}</strong>
              <small>{store.name} · {store.distanceKm} km</small>
            </div>
          </div>
          <div className="sum-row">Duration <strong>{form.weeks} week{form.weeks > 1 ? 's' : ''}</strong></div>
          <div className="sum-row">Runs <strong>{fmt(form.start)} – {fmt(endDate)}</strong></div>
          <div className="sum-row">Est. reach <strong>~{(form.weeks * 4800).toLocaleString('en-IN')} shoppers</strong></div>
          <div className="sum-row sum-row--total">Total <strong>{formatPrice(plan.price)}</strong></div>
          <button type="submit" className="btn btn--primary btn--block btn--lg promo-pay">
            <Megaphone size={18} /> Pay & Promote
          </button>
          <p className="promo-note">Offers are reviewed by FastGrab within 2 hours. You’re only charged once it’s approved.</p>
        </aside>
      </div>
    </form>
  )
}

export default PromoteOffer
