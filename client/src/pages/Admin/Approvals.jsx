import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, CircleCheck, Mail, Megaphone, Phone, Search, TriangleAlert, X } from 'lucide-react'
import { usePlatform } from '../../context/platformContext.js'
import { formatPrice, timeAgo } from '../../utils/format.js'
import Photo from '../../components/Photo.jsx'
import { ShopIcon, ShopThumb } from './components.jsx'
import './Admin.css'

function ApplicationDetail({ app, now }) {
  const { approveApplication, rejectApplication, requestInfo } = usePlatform()
  const [note, setNote] = useState('')
  const missing = app.docs.filter(([, s]) => s === 'missing')
  const facts = [
    ['Owner', app.owner],
    ['Category', app.category],
    ['Pickup address', app.address],
    ['GSTIN', app.gstin],
    ['PAN', app.pan],
    app.fssai ? ['FSSAI licence', app.fssai] : app.drugLicense ? ['Drug licence', app.drugLicense] : null,
  ].filter(Boolean)

  return (
    <section className="m-panel m-panel--pad ap-detail">
      <header className="ap-detail__head">
        <span className={`ap-detail__icon tone-${app.tone}`}><ShopIcon shop={app} size={24} /></span>
        <div>
          <h2>{app.name}</h2>
          <p>Application #{app.id} · submitted {timeAgo(app.submitted, now)}</p>
        </div>
        <span className={`m-pill ${app.status === 'info_sent' ? 'm-pill--blue' : 'm-pill--orange'}`}>
          {app.status === 'info_sent' ? 'Info requested' : 'Pending review'}
        </span>
      </header>

      <div className="ap-detail__cover"><Photo src={app.cover} alt={`${app.name} storefront`} /></div>

      <div className="ap-facts">
        {facts.map(([k, v]) => (
          <div key={k} className={k === 'Pickup address' ? 'is-wide' : ''}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      <div className="ap-contact">
        <a href={`mailto:${app.email}`}><Mail size={14} /> {app.email}</a>
        <a href={`tel:${app.phone.replace(/\s/g, '')}`}><Phone size={14} /> {app.phone}</a>
      </div>

      <h3 className="ap-docs__title">Documents</h3>
      <ul className="ap-docs">
        {app.docs.map(([name, status]) => (
          <li key={name} className={status === 'missing' ? 'is-missing' : ''}>
            {status === 'missing' ? <TriangleAlert size={16} /> : <CircleCheck size={16} />}
            <span>{name}</span>
            <strong>{status === 'missing' ? 'Missing' : 'Verified'}</strong>
          </li>
        ))}
      </ul>

      <label className="sr-only" htmlFor="ap-note">Note for the shop owner</label>
      <textarea id="ap-note" className="input input--filled ap-note" placeholder="Add a note for the shop owner (optional)" value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="ap-actions">
        <button type="button" className="btn ap-reject" onClick={() => rejectApplication(app.id)}><X size={16} /> Reject</button>
        <button type="button" className="btn btn--outline" onClick={() => requestInfo(app.id)}><Mail size={16} /> Request info</button>
        <button type="button" className="btn btn--accent" disabled={missing.length > 0} onClick={() => approveApplication(app.id)}>
          <Check size={16} /> Approve
        </button>
      </div>
      {missing.length > 0 && <p className="ap-hint">Approve unlocks once all documents are verified. Use “Request info” to ask for the missing ones.</p>}
    </section>
  )
}

function OfferDetail({ offer, shops, now }) {
  const { decideOffer } = usePlatform()
  const shop = shops.find((s) => s.id === offer.shopId)
  return (
    <section className="m-panel m-panel--pad ap-detail">
      <header className="ap-detail__head">
        <ShopThumb shop={shop} size={52} />
        <div>
          <h2>{offer.title}</h2>
          <p>{shop.name} · #{offer.id} · submitted {timeAgo(offer.submitted, now)}</p>
        </div>
        <span className="m-pill m-pill--orange">Pending review</span>
      </header>
      <div className="ap-detail__cover ap-offer-banner">
        <Photo src={offer.image} alt="" />
        <span className="ap-offer-banner__text">
          <em>Featured</em>
          <strong>{offer.title}</strong>
          <small>{shop.name}</small>
        </span>
      </div>
      <div className="ap-facts">
        <div><small>Plan</small><strong>{offer.weeks} week{offer.weeks > 1 ? 's' : ''}</strong></div>
        <div><small>Paid</small><strong>{formatPrice(offer.price)}</strong></div>
        <div><small>Shop status</small><strong>{shop.status}</strong></div>
        <div><small>Shop rating</small><strong>★ {shop.rating}</strong></div>
      </div>
      <p className="ap-hint ap-hint--left">Check the offer is honest (real discount, products in stock) and the banner has no misleading claims.</p>
      <div className="ap-actions ap-actions--two">
        <button type="button" className="btn ap-reject" onClick={() => decideOffer(offer.id, false)}><X size={16} /> Reject & refund</button>
        <button type="button" className="btn btn--accent" onClick={() => decideOffer(offer.id, true)}><Check size={16} /> Approve offer</button>
      </div>
    </section>
  )
}

function Approvals() {
  const { applications, offerRequests, shops } = usePlatform()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'offers' ? 'offers' : 'shops')
  const [query, setQuery] = useState('')
  const [now] = useState(() => Date.now())

  const list = tab === 'shops' ? applications : offerRequests
  const q = query.trim().toLowerCase()
  const filtered = list.filter((x) => !q || (x.name ?? x.title).toLowerCase().includes(q))
  const selectedId = params.get('id')
  const selected = filtered.find((x) => x.id === selectedId) ?? filtered[0]

  const select = (id) => setParams((p) => { p.set('id', id); return p }, { replace: true })

  return (
    <>
      <div className="m-head">
        <div>
          <h1 className="m-title">Approvals</h1>
          <p className="m-sub">Review new shops and promoted offers before they go live</p>
        </div>
        <div className="m-seg" role="tablist" aria-label="Approval type">
          <button type="button" role="tab" aria-selected={tab === 'shops'} className={tab === 'shops' ? 'is-active' : ''} onClick={() => setTab('shops')}>
            Shop applications <span>{applications.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'offers'} className={tab === 'offers' ? 'is-active' : ''} onClick={() => setTab('offers')}>
            Offer promotions <span>{offerRequests.length}</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="m-panel m-empty">
          <CircleCheck size={32} />
          Nothing waiting for review. Nice!
        </div>
      ) : (
        <div className="ap-layout">
          <aside className="m-panel ap-list">
            <label className="search-box ap-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search</span>
              <input type="search" placeholder={tab === 'shops' ? 'Search applications' : 'Search offers'} value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <ul>
              {filtered.map((x) => {
                const shop = tab === 'offers' ? shops.find((s) => s.id === x.shopId) : null
                return (
                  <li key={x.id}>
                    <button type="button" className={`ap-item${selected?.id === x.id ? ' is-active' : ''}`} onClick={() => select(x.id)}>
                      {tab === 'shops' ? (
                        <span className={`ap-item__icon tone-${x.tone}`}><ShopIcon shop={x} size={18} /></span>
                      ) : (
                        <span className="ap-item__icon tone-orange"><Megaphone size={18} /></span>
                      )}
                      <span className="ap-item__text">
                        <strong>{x.name ?? x.title}</strong>
                        <small>{tab === 'shops' ? `${x.category} · ${x.city.split(',')[0]}` : shop?.name} · {timeAgo(x.submitted, now)}</small>
                      </span>
                      {x.status === 'info_sent' ? <span className="m-pill m-pill--blue">Info sent</span> : <span className="m-pill m-pill--amber">New</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>

          {selected && (tab === 'shops'
            ? <ApplicationDetail key={selected.id} app={selected} now={now} />
            : <OfferDetail key={selected.id} offer={selected} shops={shops} now={now} />)}
        </div>
      )}
    </>
  )
}

export default Approvals
