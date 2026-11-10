import { Link } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { StoreIcon } from './StoreLogo.jsx'
import Photo from '../../../components/Photo.jsx'
import { formatPrice } from '../../../utils/format.js'
import { nextSlotShort } from '../../../utils/slots.js'

/** Store card used on Explore, Recommended and Settings. */
function StoreCard({ store, compact = false }) {
  return (
    <Link to={`/customer/store/${store.id}`} className={`shop-card${compact ? ' shop-card--compact' : ''}`}>
      <div className={`shop-card__media tone-${store.tone}`}>
        <Photo src={store.image} alt={`${store.name} storefront`} fallback={<StoreIcon store={store} size={compact ? 36 : 52} />} />
        <span className="shop-card__rating">
          <Star size={12} fill="currentColor" strokeWidth={0} />
          {store.rating}
        </span>
      </div>
      <div className="shop-card__body">
        <div className="shop-card__row">
          <h3>{store.name}</h3>
          <span className="shop-card__distance">{store.distanceKm} km</span>
        </div>
        <p className="shop-card__tags">{store.tags.join(' • ')}</p>
        {!compact && (
          <div className="shop-card__foot">
            <span className="shop-card__ready">
              <Clock size={14} /> Ready: {nextSlotShort(store)}
            </span>
            {store.deposit > 0 ? (
              <span className="pill pill--warn">{formatPrice(store.deposit)} Deposit</span>
            ) : (
              <span className="pill pill--green">Free Pickup</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default StoreCard
