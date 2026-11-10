import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Store,
} from 'lucide-react'
import { STORES, STORE_FILTERS, getStore } from '../../../data/mockData.js'
import { useCustomer } from '../../../context/customerContext.js'
import { slotLabel } from '../../../utils/slots.js'
import { isActiveOrder } from '../components/orderStatus.js'
import StoreCard from '../components/StoreCard.jsx'
import { StoreIcon } from '../components/StoreLogo.jsx'
import './Explore.css'

const PAGE_SIZE = 8

const SORTS = {
  distance: { label: 'Nearest first', fn: (a, b) => a.distanceKm - b.distanceKm },
  rating: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
  prep: { label: 'Fastest ready', fn: (a, b) => a.prepMins - b.prepMins },
}

function FiltersPopover({ sort, setSort, freeOnly, setFreeOnly }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const active = (sort !== 'distance') + freeOnly

  return (
    <div className="filters" ref={ref}>
      <button
        type="button"
        className={`btn btn--outline filters__btn${open ? ' is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <SlidersHorizontal size={16} /> Filters
        {active > 0 && <span className="filters__count">{active}</span>}
      </button>
      {open && (
        <div className="filters__panel">
          <p className="filters__label">Sort by</p>
          {Object.entries(SORTS).map(([key, { label }]) => (
            <label key={key} className="filters__option">
              <input type="radio" name="sort" checked={sort === key} onChange={() => setSort(key)} />
              {label}
            </label>
          ))}
          <p className="filters__label">Show</p>
          <label className="filters__option">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
            Free pickup only (no deposit)
          </label>
        </div>
      )}
    </div>
  )
}

function MapView({ stores }) {
  return (
    <div className="map-view" role="img" aria-label="Map of nearby stores">
      <span className="map-view__me" style={{ left: '50%', top: '48%' }}>
        <span />
        You
      </span>
      {stores.map((s) => (
        <Link
          key={s.id}
          to={`/customer/store/${s.id}`}
          className="map-pin"
          style={{ left: `${s.mapPos.x}%`, top: `${s.mapPos.y}%` }}
        >
          <span className={`map-pin__icon tone-${s.tone}`}>
            <StoreIcon store={s} size={16} strokeWidth={2} />
          </span>
          <span className="map-pin__label">
            {s.name}
            <small>{s.distanceKm} km</small>
          </span>
        </Link>
      ))}
    </div>
  )
}

const nearest = [...STORES].sort((a, b) => a.distanceKm - b.distanceKm)[0]
const fastest = [...STORES].sort((a, b) => a.prepMins - b.prepMins)[0]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Explore() {
  const { user, orders } = useCustomer()
  const [greeting] = useState(getGreeting)
  const nextOrder = orders.find((o) => o.status === 'ready') ?? orders.find(isActiveOrder)
  const [filter, setFilter] = useState(STORE_FILTERS[0])
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [sort, setSort] = useState('distance')
  const [freeOnly, setFreeOnly] = useState(false)
  const [page, setPage] = useState(1)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STORES.filter((s) => filter === STORE_FILTERS[0] || s.type === filter)
      .filter((s) => !freeOnly || s.deposit === 0)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)))
      .sort(SORTS[sort].fn)
  }, [filter, query, sort, freeOnly])

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeFilter = (f) => {
    setFilter(f)
    setPage(1)
  }

  return (
    <div className="container">
      <section className="explore-hero">
        <div className="explore-hero__text">
          <nav className="breadcrumb breadcrumb--light" aria-label="Breadcrumb">
            <Link to="/customer/explore">Home</Link>/<span aria-current="page">Nearby stores</span>
          </nav>
          <p className="explore-hero__greet">
            {greeting}, {user.firstName} 👋
          </p>
          <h1>Discover Nearby</h1>
          <p className="explore-hero__sub">
            {results.length} shops found in <strong>Bengaluru, IN</strong> · ready in as little as 10 minutes
          </p>
          <label className="explore-hero__search">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Search stores</span>
            <input
              type="search"
              placeholder="Search stores, items or categories..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </label>
        </div>

        <div className="explore-hero__side">
          {nextOrder ? (
            <Link to={`/customer/orders/${nextOrder.id}`} className="hero-order">
              <span className="hero-order__icon">
                <ShoppingBag size={20} />
              </span>
              <span className="hero-order__text">
                <small>{nextOrder.status === 'ready' ? 'Ready for pickup' : 'Your next pickup'}</small>
                <strong>{getStore(nextOrder.storeId).name}</strong>
                <span>Window {slotLabel(nextOrder.slot)}</span>
              </span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="hero-order">
              <span className="hero-order__icon">
                <Gift size={20} />
              </span>
              <span className="hero-order__text">
                <small>New here?</small>
                <strong>First pickup deposit-free</strong>
                <span>Use code FIRSTFREE at checkout</span>
              </span>
            </div>
          )}
          <div className="hero-stats">
            <span>
              <strong>{nearest.distanceKm} km</strong>
              <small>Nearest shop</small>
            </span>
            <span>
              <strong>{fastest.prepMins} min</strong>
              <small>Fastest ready</small>
            </span>
            <span>
              <strong>{STORES.filter((s) => s.deposit === 0).length}</strong>
              <small>Free pickup</small>
            </span>
          </div>
        </div>
      </section>

      <div className="explore-toolbar">
        <div className="chips" role="tablist" aria-label="Store type">
          {STORE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={`chip${filter === f ? ' is-active' : ''}`}
              onClick={() => changeFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="explore-tools">
          <div className="view-toggle" role="group" aria-label="View">
            <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}>
              <List size={15} /> List View
            </button>
            <button type="button" className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')} aria-pressed={view === 'map'}>
              <MapIcon size={15} /> Map View
            </button>
          </div>
          <FiltersPopover sort={sort} setSort={setSort} freeOnly={freeOnly} setFreeOnly={setFreeOnly} />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card empty">
          <span className="empty__icon">
            <MapPin size={30} />
          </span>
          <h2>No shops match</h2>
          <p>Try another category or clear your search and filters.</p>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              setQuery('')
              setFreeOnly(false)
              changeFilter(STORE_FILTERS[0])
            }}
          >
            Clear filters
          </button>
        </div>
      ) : view === 'map' ? (
        <MapView stores={results} />
      ) : (
        <>
          <div className="explore-grid">
            {visible.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
            {currentPage === pageCount && (
              <div className="explore-soon">
                <Store size={30} />
                Partnering with more stores daily...
              </div>
            )}
          </div>

          {pageCount > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === currentPage ? 'is-active' : ''}
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page">
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default Explore
