import { Link, useNavigate } from 'react-router-dom'
import { Eye, History, IndianRupee, Megaphone, Plus, RotateCcw, Ticket } from 'lucide-react'
import { useMerchant } from '../../../context/merchantContext.js'
import { SHOP_ID } from '../../../data/merchantData.js'
import { formatPrice, parseIsoDate } from '../../../utils/format.js'
import Photo from '../../../components/Photo.jsx'
import { StatCard } from '../components/ui.jsx'
import './Offers.css'

const fmt = (iso) => parseIsoDate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

function OfferRow({ offer, now }) {
  const { extendOffer } = useMerchant()
  const start = parseIsoDate(offer.start).getTime()
  const end = parseIsoDate(offer.end).getTime() + 86400000
  const left = Math.max(0, Math.ceil((end - now) / 86400000))
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
  const ending = left <= 3

  return (
    <article className={`offer-row${ending ? ' is-ending' : ''}`}>
      <div className="offer-row__img"><Photo src={offer.image} alt="" fallback={<Ticket size={28} />} /></div>
      <div className="offer-row__body">
        <div className="offer-row__tags">
          <span className="m-pill m-pill--green">● Live</span>
          <span className="m-pill m-pill--soft-green">{offer.badge}</span>
        </div>
        <h3>{offer.title}</h3>
        <p>{fmt(offer.start)} – {fmt(offer.end)} · {offer.weeks}-week plan · {offer.appliesTo.join(', ')}</p>
        <div className="offer-row__progress">
          <span className="offer-row__bar"><span style={{ width: `${pct}%` }} /></span>
          <strong>{ending ? `Ends in ${left} day${left === 1 ? '' : 's'}` : `${left} days left`}</strong>
        </div>
      </div>
      <div className="offer-row__stats">
        <span><strong>{compact(offer.views)}</strong> views</span>
        <span className="text-green"><strong>{offer.redeemed}</strong> redeemed</span>
        <span><strong>{((offer.redeemed / offer.views) * 100).toFixed(1)}%</strong> conversion</span>
      </div>
      <button type="button" className={`btn ${ending ? 'btn--accent' : 'btn--primary'} offer-row__btn`} onClick={() => extendOffer(offer.id, 1)}>
        <History size={16} /> Extend 1 week
      </button>
    </article>
  )
}

function Offers() {
  const { offers, now } = useMerchant()
  const navigate = useNavigate()
  const mine = offers.filter((o) => o.storeId === SHOP_ID)
  const live = mine.filter((o) => o.status === 'live')
  const ended = mine.filter((o) => o.status === 'ended')
  const views = mine.reduce((n, o) => n + o.views, 0)
  const redeemed = mine.reduce((n, o) => n + o.redeemed, 0)
  const spent = mine.reduce((n, o) => n + ({ 1: 499, 2: 949, 4: 1799, 8: 3299 }[o.weeks] ?? o.weeks * 499), 0)

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">My Offers</h1>
          <p className="m-sub">Promoted offers shown to nearby customers on the Explore page</p>
        </div>
        <Link to="/merchant/offers/new" className="btn btn--accent">
          <Plus size={18} /> Promote New Offer
        </Link>
      </div>

      <div className="m-stats">
        <StatCard label="Live offers" value={live.length} icon={Megaphone} tone="green" />
        <StatCard label="Views (30 days)" value={compact(views)} icon={Eye} tone="blue" />
        <StatCard label="Redemptions" value={redeemed} icon={Ticket} tone="purple" trend={`${((redeemed / views) * 100).toFixed(1)}% conv.`} />
        <StatCard label="Spent on promotion" value={formatPrice(spent)} icon={IndianRupee} tone="orange" />
      </div>

      <h2 className="m-section-label">Currently promoted</h2>
      {live.length ? (
        <div className="offer-list">
          {live.map((o) => <OfferRow key={o.id} offer={o} now={now} />)}
        </div>
      ) : (
        <div className="m-panel m-empty">
          <Megaphone size={28} />
          No live offers. Promote one to reach more nearby shoppers.
        </div>
      )}

      {ended.length > 0 && (
        <>
          <h2 className="m-section-label">Ended</h2>
          <div className="m-panel">
            {ended.map((o) => (
              <div key={o.id} className="offer-ended">
                <span className="offer-ended__img"><Photo src={o.image} alt="" fallback={<Ticket size={20} />} /></span>
                <div>
                  <strong>{o.title}</strong>
                  <small>Ended {fmt(o.end)} · {o.redeemed} redeemed · {compact(o.views)} views</small>
                </div>
                <button type="button" className="btn btn--outline m-btn-sm" onClick={() => navigate(`/merchant/offers/new?from=${o.id}`)}>
                  <RotateCcw size={14} /> Run again
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default Offers
