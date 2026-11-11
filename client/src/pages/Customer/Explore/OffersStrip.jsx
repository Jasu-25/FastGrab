import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { getStore } from '../../../data/mockData.js'
import { parseIsoDate } from '../../../utils/format.js'
import Photo from '../../../components/Photo.jsx'

/**
 * "Offers near you": live offers that shops promote from their dashboard
 * (Merchant → Offers). A new promoted offer shows up here straight away.
 */
function OffersStrip() {
  const { offers, now } = useMerchant()
  const track = useRef(null)
  const live = offers.filter((o) => o.status === 'live' && parseIsoDate(o.end).getTime() + 86400000 > now)

  if (live.length === 0) return null

  const scroll = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <section className="offers" aria-labelledby="offers-title">
      <div className="offers__head">
        <div>
          <h2 id="offers-title" className="offers__title">
            <Tag size={18} /> Offers near you
          </h2>
          <p className="offers__sub">Deals from shops within 3 km · applied automatically at checkout</p>
        </div>
        <div className="offers__arrows">
          <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label="Previous offers"><ChevronLeft size={18} /></button>
          <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label="Next offers"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="offers__track" ref={track}>
        {live.map((o) => {
          const store = getStore(o.storeId)
          const daysLeft = Math.max(0, Math.ceil((parseIsoDate(o.end).getTime() + 86400000 - now) / 86400000))
          return (
            <Link key={o.id} to={`/customer/store/${o.storeId}`} className="offer-card">
              <Photo src={o.image} alt="" className="offer-card__img" />
              <span className="offer-card__shade" />
              <span className="offer-card__badge">{o.badge}</span>
              {daysLeft <= 3 && (
                <span className="offer-card__ending"><Clock size={12} /> Ends in {daysLeft}d</span>
              )}
              <span className="offer-card__body">
                <strong>{o.title}</strong>
                <small>{store?.name} · {store?.distanceKm} km</small>
                <span className="offer-card__cta">Shop now <ArrowRight size={14} /></span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default OffersStrip
