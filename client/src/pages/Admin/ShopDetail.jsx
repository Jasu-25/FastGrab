import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, Clock, FileText, Mail, MessageSquare, Phone, RotateCcw, Star } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { commissionFor } from '../../data/platformData.js'
import { compactPrice, formatPrice } from '../../utils/format.js'
import { formatRate } from '../../utils/commission.js'
import Photo from '../../components/Photo.jsx'
import { BarChart, ShopStatus, ShopThumb } from './components.jsx'
import './Admin.css'

function ShopDetail() {
  const { shopId } = useParams()
  const { shops, transactions, setShopStatus, toast } = usePlatform()
  const shop = shops.find((s) => s.id === shopId)

  if (!shop) {
    return (
      <div className="m-panel m-empty">
        Shop not found. <Link to="/admin/shops" className="link">Back to shops</Link>
      </div>
    )
  }

  const c = commissionFor(shop.plan, shop.revenueMonth)
  const pending = transactions.filter((t) => t.shopId === shop.id && t.status === 'pending').reduce((n, t) => n + t.commission, 0)
  const history = shop.history.map((m) => ({ ...m, commission: commissionFor(shop.plan, m.value).total }))
  const settlements = transactions.filter((t) => t.shopId === shop.id).slice(0, 4)
  const slots = [
    ['Morning 08–11', 62 + (shop.ordersMonth % 9)],
    ['Lunch 11–15', Math.min(98, 80 + (shop.ordersMonth % 15))],
    ['Evening 17–22', 70 + (shop.ordersMonth % 12)],
  ]

  return (
    <>
      <Link to="/admin/shops" className="a-back"><ArrowLeft size={14} /> All shops</Link>

      <section className="m-panel sd-hero">
        <div className="sd-hero__cover"><Photo src={shop.cover} alt="" /></div>
        <div className="sd-hero__body">
          <ShopThumb shop={shop} size={84} />
          <div className="sd-hero__text">
            <h1>{shop.name} <ShopStatus status={shop.status} /></h1>
            <p>{shop.category} · {shop.address} · Partner since {shop.since} · Owner {shop.owner.name}</p>
          </div>
          <div className="m-actions">
            <button type="button" className="btn btn--outline" onClick={() => toast(`Message sent to ${shop.owner.name}.`)}><MessageSquare size={16} /> Message</button>
            {shop.status === 'suspended' ? (
              <button type="button" className="btn btn--accent" onClick={() => setShopStatus(shop.id, 'online')}><RotateCcw size={16} /> Reactivate</button>
            ) : (
              <button type="button" className="btn sd-suspend" onClick={() => window.confirm(`Suspend ${shop.name}? Customers won’t be able to order.`) && setShopStatus(shop.id, 'suspended')}>
                <Ban size={16} /> Suspend
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="sd-stats">
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Monthly revenue</span><strong className="m-stat__value">{formatPrice(shop.revenueMonth)}</strong><span className={`a-trend ${shop.trend >= 0 ? 'is-up' : 'is-down'}`}>{shop.trend >= 0 ? '+' : ''}{shop.trend}%</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Orders (mo)</span><strong className="m-stat__value">{shop.ordersMonth.toLocaleString('en-IN')}</strong><span className="a-trend is-up">+9%</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Commission ({c.label})</span><strong className="m-stat__value">{formatPrice(c.total)}</strong><span className="m-stat__hint">{formatPrice(pending)} pending</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Rating</span><strong className="m-stat__value">{shop.rating} <Star size={18} className="sd-star" fill="currentColor" strokeWidth={0} /></strong><span className="m-stat__hint">{shop.reviews} reviews</span></div>
        <div className="m-stat m-stat--plain"><span className="m-stat__label">Pickup success</span><strong className="m-stat__value text-green">{shop.pickupSuccess}%</strong><span className="m-stat__hint">{100 - shop.pickupSuccess}% no-show</span></div>
      </div>

      <div className="a-grid">
        <div className="a-main-col">
          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title a-mb">Revenue & Commission · last 6 months</h2>
            {/* Two different scales → two charts side by side, never a dual axis */}
            <div className="sd-charts">
              <div>
                <p className="sd-chart__label">Revenue</p>
                <BarChart data={history} format={formatPrice} caption="Monthly revenue" />
              </div>
              <div>
                <p className="sd-chart__label">Commission to FastGrab</p>
                <BarChart data={history.map((h) => ({ label: h.label, value: h.commission }))} format={formatPrice} caption="Monthly commission" />
              </div>
            </div>
          </section>

          <section className="m-panel">
            <h2 className="m-panel__title a-panel-head">Recent commission settlements</h2>
            <div className="m-table-wrap">
              <table className="m-table">
                <thead><tr><th>Transaction</th><th>Period</th><th className="num">Sales</th><th className="num">Commission</th><th className="num">Status</th></tr></thead>
                <tbody>
                  {settlements.map((t) => (
                    <tr key={t.id}>
                      <td className="strong">{t.id}</td>
                      <td>{t.period}</td>
                      <td className="num">{formatPrice(t.sales)}</td>
                      <td className="num strong">{formatPrice(t.commission)}</td>
                      <td className="num"><span className={`m-pill ${t.status === 'paid' ? 'm-pill--soft-green' : 'm-pill--amber'}`}>{t.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {settlements.length === 0 && <p className="m-empty">This shop is commission-exempt.</p>}
            </div>
          </section>
        </div>

        <div className="a-side-col">
          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title a-mb">Top Products</h2>
            <ul className="sd-products">
              {shop.topProducts.map((p) => (
                <li key={p.name}>
                  <span className="sd-products__img"><Photo src={p.image} alt="" fallback={p.emoji} /></span>
                  <span><strong>{p.name}</strong><small>{p.sold} sold</small></span>
                  <strong>{compactPrice(p.revenue)}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="m-panel m-panel--pad">
            <h2 className="m-panel__title a-mb">Slot Utilisation</h2>
            <ul className="sd-slots">
              {slots.map(([label, pct]) => (
                <li key={label}>
                  <span className="sd-slots__row"><span>{label}</span><strong className={pct >= 90 ? 'text-orange' : ''}>{pct}%</strong></span>
                  <span className={`sd-slots__bar${pct >= 90 ? ' is-busy' : ''}`}><span style={{ width: `${pct}%` }} /></span>
                </li>
              ))}
            </ul>
          </section>

          <section className="sd-info">
            <p className="sd-info__label">Shop info</p>
            <a href={`mailto:${shop.owner.email}`}><Mail size={15} /> {shop.owner.email}</a>
            <a href={`tel:${shop.owner.phone.replace(/\s/g, '')}`}><Phone size={15} /> {shop.owner.phone}</a>
            <span><Clock size={15} /> Mon–Sun · {shop.open}–{shop.close}</span>
            <span><FileText size={15} /> GSTIN {shop.gstin}</span>
            <Link to={`/admin/users/${shop.owner.id}`} className="sd-info__link">Commission plan: {c.label} {shop.plan.type === 'standard' && `· ${formatRate(c.rate)} now`} →</Link>
          </section>
        </div>
      </div>
    </>
  )
}

export default ShopDetail
