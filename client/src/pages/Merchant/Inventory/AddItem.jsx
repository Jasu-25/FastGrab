import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, CloudUpload, ImagePlus, Plus, Star, X } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { INVENTORY_CATEGORIES, PREP_OPTIONS } from '../../../data/merchantData.js'
import { Field } from '../../../components/FormField.jsx'
import Photo from '../../../components/Photo.jsx'
import { inputClass } from '../../../utils/inputClass.js'
import { formatPrice } from '../../../utils/format.js'
import { Toggle } from '../components/ui.jsx'
import './Inventory.css'

const MAX_PHOTOS = 5

const BLANK = {
  id: '',
  name: '',
  category: INVENTORY_CATEGORIES[0],
  unit: '',
  description: '',
  tags: [],
  price: '',
  comparePrice: '',
  sku: '',
  aisle: 'Aisle 1',
  stock: '',
  lowStockAt: 10,
  prep: PREP_OPTIONS[0],
  visible: true,
  preorder: true,
  images: [],
  emoji: '🛒',
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function TagInput({ tags, onChange }) {
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setText('')
  }
  return (
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag-chip">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X size={12} /></button>
        </span>
      ))}
      <input
        id="item-tags"
        value={text}
        placeholder={tags.length ? 'Add tag…' : 'e.g. Organic, Vegan (press Enter)'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          } else if (e.key === 'Backspace' && !text && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={add}
      />
    </div>
  )
}

function AddItem() {
  const { itemId } = useParams()
  const { inventory, saveItem, toast } = useMerchant()
  const navigate = useNavigate()
  const existing = inventory.find((i) => i.id === itemId)
  const [form, setForm] = useState(() =>
    existing ? { ...existing, comparePrice: existing.comparePrice ?? '' } : BLANK,
  )
  const [errors, setErrors] = useState({})

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((e) => ({ ...e, [name]: undefined }))
  }
  const change = (e) => set(e.target.name, e.target.value)

  const addPhotos = (e) => {
    const files = [...(e.target.files ?? [])].slice(0, MAX_PHOTOS - form.images.length)
    // Previews only. Upload to the API (multipart) once it exists.
    set('images', [...form.images, ...files.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }
  const makeCover = (idx) => set('images', [form.images[idx], ...form.images.filter((_, i) => i !== idx)])
  const removePhoto = (idx) => set('images', form.images.filter((_, i) => i !== idx))

  const price = Number(form.price) || 0
  const compare = Number(form.comparePrice) || 0
  const discount = compare > price && price > 0 ? Math.round(((compare - price) / compare) * 100) : 0
  const missing = [!form.name.trim() && 'name', !price && 'price', form.stock === '' && 'stock'].filter(Boolean)

  const save = (visible) => {
    const er = {}
    if (!form.name.trim()) er.name = 'Give the item a name.'
    if (!(price > 0)) er.price = 'Enter a price above ₹0.'
    if (compare && compare <= price) er.comparePrice = 'Compare-at price should be higher than the price.'
    if (form.stock === '' || Number(form.stock) < 0) er.stock = 'Enter how many you have.'
    setErrors(er)
    if (Object.keys(er).length) {
      document.getElementById(`item-${Object.keys(er)[0]}`)?.focus()
      return
    }
    const id = form.id || `${slug(form.name)}-${Math.random().toString(36).slice(2, 6)}`
    saveItem({
      ...form,
      id,
      name: form.name.trim(),
      price,
      comparePrice: compare || null,
      stock: Number(form.stock),
      lowStockAt: Number(form.lowStockAt) || 0,
      sku: form.sku.trim() || `GG-${slug(form.name).slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-3)}`,
      unit: form.unit.trim() || 'Each',
      visible,
    })
    toast(visible ? `${form.name.trim()} is live in your store.` : `${form.name.trim()} saved as a draft (hidden).`)
    navigate('/merchant/inventory')
  }

  const err = (n) => errors[n]

  return (
    <>
      <div className="m-head">
        <div>
          <p className="m-eyebrow"><Link to="/merchant/inventory"><ArrowLeft size={13} /> Inventory</Link> / {existing ? 'Edit product' : 'New product'}</p>
          <h1 className="m-title">{existing ? `Edit ${existing.name}` : 'Add New Item'}</h1>
        </div>
        <div className="m-actions">
          <button type="button" className="btn btn--outline" onClick={() => save(false)}>Save Draft</button>
          <button type="button" className="btn btn--accent" onClick={() => save(true)}><Check size={17} /> {existing ? 'Save & Publish' : 'Publish Item'}</button>
        </div>
      </div>

      <div className="item-layout">
        <div className="item-main">
          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title">Product Photos</h2>
            <p className="item-hint">Up to {MAX_PHOTOS} images · JPG or PNG · square works best. Click a photo to make it the cover.</p>
            <div className="photo-grid">
              {form.images.map((src, i) => (
                <div key={src} className={`photo-tile${i === 0 ? ' is-cover' : ''}`}>
                  <button type="button" className="photo-tile__img" onClick={() => makeCover(i)} aria-label={i === 0 ? 'Cover photo' : 'Make cover photo'}>
                    <Photo src={src} alt="" fallback={form.emoji} />
                  </button>
                  {i === 0 && <span className="photo-tile__cover"><Star size={10} fill="currentColor" /> Cover</span>}
                  <button type="button" className="photo-tile__remove" onClick={() => removePhoto(i)} aria-label="Remove photo"><X size={14} /></button>
                </div>
              ))}
              {form.images.length < MAX_PHOTOS && (
                <label className="photo-tile photo-tile--upload">
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={addPhotos} />
                  {form.images.length ? <ImagePlus size={22} /> : <CloudUpload size={26} />}
                  <span>{form.images.length ? 'Add photo' : 'Upload photos'}</span>
                </label>
              )}
            </div>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title item-title">Item Details</h2>
            <Field label="Product name" htmlFor="item-name" error={err('name')}>
              <input id="item-name" name="name" className={inputClass(err('name'), 'input--filled')} value={form.name} onChange={change} placeholder="e.g. Organic Hass Avocados" />
            </Field>
            <div className="m-form-grid">
              <Field label="Category" htmlFor="item-category">
                <select id="item-category" name="category" className="input input--filled" value={form.category} onChange={change}>
                  {INVENTORY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Unit / size" htmlFor="item-unit">
                <input id="item-unit" name="unit" className="input input--filled" value={form.unit} onChange={change} placeholder="e.g. Pack of 2, 500 g" />
              </Field>
            </div>
            <Field label="Description" htmlFor="item-description" hint={`${form.description.length}/240`}>
              <textarea id="item-description" name="description" maxLength={240} className="input input--filled" value={form.description} onChange={change} placeholder="What makes it great? Customers see this on the product." />
            </Field>
            <Field label="Tags" htmlFor="item-tags">
              <TagInput tags={form.tags} onChange={(t) => set('tags', t)} />
            </Field>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title item-title">Pricing & Stock</h2>
            <div className="m-form-grid m-form-grid--3">
              <Field label="Price (₹)" htmlFor="item-price" error={err('price')}>
                <div className="prefix-input"><span>₹</span><input id="item-price" name="price" type="number" min="0" step="0.5" className={inputClass(err('price'), 'input--filled')} value={form.price} onChange={change} /></div>
              </Field>
              <Field label="Compare-at price" htmlFor="item-comparePrice" error={err('comparePrice')} hint="Shows a strike-through price">
                <div className="prefix-input"><span>₹</span><input id="item-comparePrice" name="comparePrice" type="number" min="0" step="0.5" className={inputClass(err('comparePrice'), 'input--filled')} value={form.comparePrice} onChange={change} /></div>
              </Field>
              <Field label="SKU" htmlFor="item-sku" hint="Leave blank to auto-generate">
                <input id="item-sku" name="sku" className="input input--filled" value={form.sku} onChange={change} placeholder="GG-AVO-002" />
              </Field>
              <Field label="Stock quantity" htmlFor="item-stock" error={err('stock')}>
                <input id="item-stock" name="stock" type="number" min="0" className={inputClass(err('stock'), 'input--filled')} value={form.stock} onChange={change} />
              </Field>
              <Field label="Low-stock alert at" htmlFor="item-lowStockAt">
                <input id="item-lowStockAt" name="lowStockAt" type="number" min="0" className="input input--filled" value={form.lowStockAt} onChange={change} />
              </Field>
              <Field label="Prep time" htmlFor="item-prep">
                <select id="item-prep" name="prep" className="input input--filled" value={form.prep} onChange={change}>
                  {PREP_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <div className="item-toggle">
              <div>
                <strong>Available for pre-order pickup</strong>
                <small>Customers can add this item to scheduled pickups</small>
              </div>
              <Toggle checked={form.preorder} onChange={(v) => set('preorder', v)} label="Available for pre-order pickup" />
            </div>
          </section>
        </div>

        <aside className="item-preview m-panel m-panel--pad">
          <p className="m-eyebrow">Customer preview</p>
          <div className="preview-card">
            <div className="preview-card__media">
              <Photo src={form.images[0]} alt="" fallback={<span className="preview-card__emoji">{form.emoji}</span>} />
              {discount > 0 && <span className="preview-card__off">−{discount}%</span>}
            </div>
            <strong className="preview-card__name">{form.name || 'Product name'}</strong>
            <small className="preview-card__meta">{[form.unit || 'Unit', ...form.tags].join(' · ')}</small>
            <div className="preview-card__foot">
              <span>
                <strong>{price ? formatPrice(price) : '₹0'}</strong>
                {discount > 0 && <s>{formatPrice(compare)}</s>}
              </span>
              <span className="add-btn" aria-hidden="true"><Plus size={18} /></span>
            </div>
          </div>
          <div className="sum-row">Status <strong className={missing.length ? 'text-orange' : 'text-green'}>{missing.length ? `Missing ${missing.join(', ')}` : 'Ready to publish'}</strong></div>
          <div className="sum-row">In stock <strong>{form.stock === '' ? '—' : `${form.stock} units`}</strong></div>
          <div className="sum-row">Visible in <strong className="text-green">{form.category}</strong></div>
          <div className="sum-row">Pre-order <strong>{form.preorder ? 'On' : 'Off'}</strong></div>
        </aside>
      </div>
    </>
  )
}

/** Re-mount the form when switching between items so its state resets. */
function AddItemPage() {
  const { itemId } = useParams()
  return <AddItem key={itemId ?? 'new'} />
}

export default AddItemPage
