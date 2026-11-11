import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Minus, Pencil, Plus, Search, TriangleAlert } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { formatPrice } from '../../../utils/format.js'
import Photo from '../../../components/Photo.jsx'
import './Inventory.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'low', label: 'Low stock' },
]

const isLow = (i) => i.stock <= i.lowStockAt

function stockLabel(i) {
  if (i.stock === 0) return <span className="inv-stock inv-stock--out">Out of stock</span>
  if (isLow(i)) return <span className="inv-stock inv-stock--low">{i.stock} units · low</span>
  return <span className="inv-stock">{i.stock} units</span>
}

function Inventory() {
  const { inventory, toggleVisible, adjustStock } = useMerchant()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const q = query.trim().toLowerCase()
  const counts = {
    all: inventory.length,
    live: inventory.filter((i) => i.visible).length,
    hidden: inventory.filter((i) => !i.visible).length,
    low: inventory.filter(isLow).length,
  }
  const rows = inventory
    .filter((i) => filter === 'all' || (filter === 'live' && i.visible) || (filter === 'hidden' && !i.visible) || (filter === 'low' && isLow(i)))
    .filter((i) => !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
  const lowItems = inventory.filter(isLow)

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Inventory</h1>
          <p className="m-sub">
            {counts.all} items · {counts.live} live in store · {counts.hidden} hidden
          </p>
        </div>
        <Link to="/merchant/inventory/new" className="btn btn--accent">
          <Plus size={18} /> Add Item
        </Link>
      </div>

      {lowItems.length > 0 && (
        <button type="button" className="inv-alert" onClick={() => setFilter('low')}>
          <TriangleAlert size={18} />
          <span>
            <strong>{lowItems.length} items need restocking:</strong> {lowItems.map((i) => i.name).join(', ')}
          </span>
          <span className="inv-alert__cta">Review</span>
        </button>
      )}

      <div className="inv-tools">
        <label className="search-box inv-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search inventory</span>
          <input type="search" placeholder="Search by name or SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="m-seg" role="tablist" aria-label="Filter items">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? 'is-active' : ''} onClick={() => setFilter(f.id)}>
              {f.label} <span>{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="m-panel inv-panel">
        <div className="m-table-wrap">
          <table className="m-table">
            <thead>
              <tr>
                <th>Item</th><th>Price</th><th>Stock</th><th>Visibility</th><th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className={i.visible ? '' : 'is-hidden'}>
                  <td>
                    <Link to={`/merchant/inventory/${i.id}`} className="inv-item">
                      <span className="inv-item__img"><Photo src={i.images[0]} alt="" fallback={i.emoji ?? '🛒'} /></span>
                      <span>
                        <strong>{i.name}</strong>
                        <small>{i.category} · {i.sku}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="strong">{formatPrice(i.price)}</span>
                    {i.comparePrice > i.price && <small className="inv-compare">{formatPrice(i.comparePrice)}</small>}
                  </td>
                  <td>
                    <div className="inv-stock-cell">
                      <button type="button" className="inv-adj" onClick={() => adjustStock(i.id, -1)} aria-label={`Decrease ${i.name} stock`} disabled={i.stock === 0}><Minus size={12} /></button>
                      {stockLabel(i)}
                      <button type="button" className="inv-adj" onClick={() => adjustStock(i.id, 10)} aria-label={`Add 10 ${i.name} to stock`}><Plus size={12} /></button>
                    </div>
                  </td>
                  <td>
                    <span className={`m-pill ${i.visible ? 'm-pill--soft-green' : 'm-pill--grey'}`}>● {i.visible ? 'Live' : 'Hidden'}</span>
                  </td>
                  <td className="num">
                    <div className="inv-actions">
                      <button type="button" className="inv-edit" onClick={() => navigate(`/merchant/inventory/${i.id}`)} aria-label={`Edit ${i.name}`}>
                        <Pencil size={15} />
                      </button>
                      {i.visible ? (
                        <button type="button" className="btn m-btn-sm inv-hide" onClick={() => toggleVisible(i.id)}>
                          <EyeOff size={14} /> Stop Displaying
                        </button>
                      ) : (
                        <button type="button" className="btn btn--accent m-btn-sm" onClick={() => toggleVisible(i.id)}>
                          <Eye size={14} /> Show in Store
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="m-empty">No items match.</p>}
        </div>
      </section>
    </>
  )
}

export default Inventory
