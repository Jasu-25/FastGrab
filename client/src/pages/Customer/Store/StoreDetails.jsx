import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Heart, MapPin, Search, ShoppingBasket, Star, Tag } from 'lucide-react'
import { PRODUCTS, getStore } from '../../../data/mockData.js'
import { useCustomer } from '../../../context/customerContext.js'
import { formatPrice, pluralize } from '../../../utils/format.js'
import { nextSlotShort } from '../../../utils/slots.js'
import StoreLogo from '../components/StoreLogo.jsx'
import ProductCard from '../components/ProductCard.jsx'
import './StoreDetails.css'
import Photo from '../../../components/Photo.jsx'

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  priceLow: { label: 'Price: Low to High', fn: (a, b) => a.price - b.price },
  priceHigh: { label: 'Price: High to Low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name: A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

const ALL = 'All Items'

function StoreCart({ store }) {
  const { cartGroups, cartCount } = useCustomer()
  const group = cartGroups.find((g) => g.store.id === store.id)
  const otherItems = cartCount - (group?.count ?? 0)

  return (
    <aside className="card card-pad store-cart">
      <div className="card-head">
        <h2 className="store-cart__title">My Cart</h2>
        {group && <span className="store-cart__count">{group.count}</span>}
      </div>

      {group ? (
        <>
          <ul className="store-cart__list">
            {group.lines.map(({ product, qty }) => (
              <li key={product.id}>
                <span className="store-cart__emoji">
                  <Photo src={product.image} alt={product.name} fallback={product.emoji} />
                </span>
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {qty} × {formatPrice(product.price)}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <div className="sum-row">
            Subtotal <strong>{formatPrice(group.subtotal)}</strong>
          </div>
          <div className="sum-row">
            Booking Deposit
            <strong className={group.deposit ? '' : 'text-green'}>
              {group.deposit ? formatPrice(group.deposit) : 'FREE'}
            </strong>
          </div>
          <div className="sum-row sum-row--total">
            Total <strong>{formatPrice(group.subtotal)}</strong>
          </div>
        </>
      ) : (
        <p className="store-cart__empty">
          <ShoppingBasket size={28} />
          Add items from {store.name} to start your pickup order.
        </p>
      )}

      {otherItems > 0 && (
        <p className="store-cart__other">+ {pluralize(otherItems, 'item')} from other shops</p>
      )}

      <Link
        to="/customer/cart"
        className={`btn btn--primary btn--block store-cart__btn${cartCount ? '' : ' is-disabled'}`}
        aria-disabled={!cartCount}
        onClick={(e) => !cartCount && e.preventDefault()}
      >
        View Cart
      </Link>
    </aside>
  )
}

function StoreDetails() {
  const { storeId } = useParams()
  const store = getStore(storeId)
  const { isSaved, toggleSavedShop } = useCustomer()
  const [category, setCategory] = useState(ALL)
  const [sort, setSort] = useState('featured')
  const [query, setQuery] = useState('')

  const products = useMemo(() => PRODUCTS[storeId] ?? [], [storeId])

  const categories = useMemo(() => {
    const counts = products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {})
    return [[ALL, products.length], ...Object.entries(counts)]
  }, [products])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => category === ALL || p.category === category)
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .sort(SORTS[sort].fn)
  }, [products, category, query, sort])

  if (!store) {
    return (
      <div className="container">
        <div className="card empty">
          <span className="empty__icon"><MapPin size={30} /></span>
          <h2>Store not found</h2>
          <p>This shop may no longer be on FastGrab.</p>
          <Link to="/customer/explore" className="btn btn--primary">Browse stores</Link>
        </div>
      </div>
    )
  }

  const saved = isSaved(store.id)

  return (
    <div className="container">
      <Link to="/customer/explore" className="back-link">
        <ArrowLeft size={14} /> Back to stores
      </Link>

      <div className="store-layout">
        <div className="store-side">
          <section className="card card-pad store-info">
            <div className="store-info__cover">
              <Photo src={store.image} alt={`${store.name} storefront`} />
            </div>
            <div className="store-info__top">
              <StoreLogo store={store} size={72} />
              <button
                type="button"
                className={`save-btn${saved ? ' is-saved' : ''}`}
                onClick={() => toggleSavedShop(store.id)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from saved shops' : 'Save this shop'}
              >
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            <h1 className="store-info__name">{store.name}</h1>
            <p className="store-info__meta">
              <Star size={14} fill="currentColor" strokeWidth={0} /> {store.rating}
              <span>•</span> {store.tags[0]}
            </p>
            <p className="store-info__desc">{store.description}</p>
            <ul className="store-info__facts">
              <li><MapPin size={15} /> {store.distanceKm} km away</li>
              <li><Clock size={15} /> Next Pickup: {nextSlotShort(store)}</li>
              <li><Tag size={15} /> {store.deposit ? `${formatPrice(store.deposit)} booking deposit` : 'Free Pickup'}</li>
            </ul>
          </section>

          <nav className="card card-pad store-cats" aria-label="Categories">
            <h2 className="store-cats__title">Categories</h2>
            {categories.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={`store-cats__item${category === name ? ' is-active' : ''}`}
                onClick={() => setCategory(name)}
                aria-current={category === name ? 'true' : undefined}
              >
                {name}
                <span>{count}</span>
              </button>
            ))}
          </nav>
        </div>

        <section className="store-products">
          <div className="store-products__head">
            <h2>{category}</h2>
            <div className="store-products__tools">
              <label className="search-box">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">Search in {store.name}</span>
                <input type="search" placeholder={`Search in ${store.name}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <label className="sort-select">
                <span className="sr-only">Sort products</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([key, { label }]) => (
                    <option key={key} value={key}>Sort by: {label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {visible.length ? (
            <div className="product-grid">
              {visible.map((p) => (
                <ProductCard key={p.id} storeId={store.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="card empty">
              <h2>No items found</h2>
              <p>Try a different search or category.</p>
            </div>
          )}
        </section>

        <StoreCart store={store} />
      </div>
    </div>
  )
}

export default StoreDetails
