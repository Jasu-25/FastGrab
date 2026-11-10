import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw, Sparkles, Star, TrendingUp } from 'lucide-react'
import { PRODUCTS, STORES, getStore } from '../../../data/mockData.js'
import { useCustomer } from '../../../context/customerContext.js'
import StoreCard from '../components/StoreCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import './Recommended.css'

// Hand-picked "popular" items until the API returns real recommendations.
const POPULAR = [
  ['greengrocer-central', 'bananas'],
  ['bakers-corner', 'croissant'],
  ['chai-and-co', 'masala-chai'],
  ['natures-best', 'almonds'],
  ['greengrocer-central', 'avocados'],
  ['metro-pharmacy', 'vitamin-c'],
  ['daily-mart', 'bread'],
  ['bakers-corner', 'cappuccino'],
]

function Recommended() {
  const { user, orders } = useCustomer()

  const orderAgain = useMemo(() => {
    const ids = [...new Set(orders.filter((o) => o.status === 'picked_up').map((o) => o.storeId))]
    return ids.map(getStore).filter(Boolean)
  }, [orders])

  const topRated = useMemo(() => [...STORES].sort((a, b) => b.rating - a.rating).slice(0, 4), [])

  return (
    <div className="container">
      <section className="reco-hero">
        <div>
          <span className="reco-hero__eyebrow">
            <Sparkles size={14} /> Picked for you
          </span>
          <h1>Good to see you, {user.firstName}!</h1>
          <p>Based on your past pickups and what’s popular around Bengaluru right now.</p>
        </div>
        <Link to="/customer/explore" className="btn btn--accent">
          Explore all stores <ArrowRight size={18} />
        </Link>
      </section>

      {orderAgain.length > 0 && (
        <section className="reco-section">
          <h2 className="reco-title">
            <RotateCcw size={18} /> Order again
          </h2>
          <div className="reco-stores">
            {orderAgain.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
        </section>
      )}

      <section className="reco-section">
        <h2 className="reco-title">
          <TrendingUp size={18} /> Popular near you
        </h2>
        <div className="reco-products">
          {POPULAR.map(([storeId, productId]) => {
            const product = PRODUCTS[storeId].find((p) => p.id === productId)
            return (
              <ProductCard
                key={`${storeId}-${productId}`}
                storeId={storeId}
                product={product}
                storeName={`from ${getStore(storeId).name}`}
              />
            )
          })}
        </div>
      </section>

      <section className="reco-section">
        <h2 className="reco-title">
          <Star size={18} /> Top rated shops
        </h2>
        <div className="reco-stores">
          {topRated.map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Recommended
