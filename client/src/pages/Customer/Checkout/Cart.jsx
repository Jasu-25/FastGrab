import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Clock, Info, MapPin, ShoppingCart, Trash2 } from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { formatPrice, pluralize } from '../../../utils/format.js'
import { slotLabel } from '../../../utils/slots.js'
import Photo from '../../../components/Photo.jsx'
import StoreLogo from '../components/StoreLogo.jsx'
import QtyStepper from '../components/QtyStepper.jsx'
import './Checkout.css'

function PromoForm() {
  const { applyPromo, promoApplied } = useCustomer()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  if (promoApplied) {
    return (
      <p className="promo-ok">
        <CircleCheck size={16} /> FIRSTFREE applied: booking deposits waived
      </p>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    setError(applyPromo(code) ? '' : 'That code isn’t valid.')
  }

  return (
    <form className="promo" onSubmit={submit}>
      <label className="sr-only" htmlFor="promo">Promo code</label>
      <input
        id="promo"
        className="input input--filled"
        placeholder="Promo code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
          setError('')
        }}
      />
      <button type="submit" className="btn btn--outline promo__btn" disabled={!code.trim()}>
        Apply
      </button>
      {error && <p className="field__error promo__error">{error}</p>}
    </form>
  )
}

function Cart() {
  const {
    cartGroups,
    cartCount,
    checkoutGroups,
    checkoutSubtotal,
    checkoutDeposit,
    selectedStoreId,
    selectCheckoutStore,
    setQty,
    clearCart,
  } = useCustomer()
  const navigate = useNavigate()

  if (cartGroups.length === 0) {
    return (
      <div className="container">
        <div className="card empty">
          <span className="empty__icon">
            <ShoppingCart size={30} />
          </span>
          <h2>Your cart is empty</h2>
          <p>Browse nearby shops and add items to schedule a quick pickup.</p>
          <Link to="/customer/explore" className="btn btn--primary">
            Explore stores
          </Link>
        </div>
      </div>
    )
  }

  const selected = checkoutGroups[0]
  const others = cartGroups.filter((g) => g.store.id !== selectedStoreId)
  const multi = cartGroups.length > 1

  return (
    <div className="container">
      <Link to="/customer/explore" className="back-link">
        <ArrowLeft size={14} /> Continue shopping
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Your Cart</h1>
          <p className="page-sub">
            {pluralize(cartCount, 'item')} from <strong>{pluralize(cartGroups.length, 'shop')}</strong>
            {multi ? ' · choose one shop to check out now' : ' · collected at the shop counter'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost clear-btn"
          onClick={() => window.confirm('Remove everything from your cart?') && clearCart()}
        >
          <Trash2 size={14} /> Clear cart
        </button>
      </div>

      {multi && (
        <p className="cart-tip">
          <Info size={16} /> Each shop is a separate pickup order. Pick the shop you want to check out. The others stay
          saved in your cart.
        </p>
      )}

      <div className="checkout-layout">
        <div className="checkout-main" role={multi ? 'radiogroup' : undefined} aria-label={multi ? 'Shop to check out' : undefined}>
          {cartGroups.map((g) => {
            const isSelected = g.store.id === selectedStoreId
            return (
              <section key={g.store.id} className={`card shop-group${multi ? ' is-selectable' : ''}${multi && isSelected ? ' is-selected' : ''}`}>
                <header className="shop-group__head">
                  {multi && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`Check out ${g.store.name}`}
                      className="shop-group__pick"
                      onClick={() => selectCheckoutStore(g.store.id)}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  )}
                  <StoreLogo store={g.store} size={40} />
                  <div>
                    <Link to={`/customer/store/${g.store.id}`} className="shop-group__name">
                      {g.store.name}
                    </Link>
                    <p className="shop-group__addr">
                      <MapPin size={12} /> {g.store.address.split(',')[0]} · {g.store.distanceKm} km
                    </p>
                  </div>
                  {g.slot ? (
                    <span className="pill pill--green">
                      <Clock size={12} /> Pickup {slotLabel(g.slot.time)}
                    </span>
                  ) : multi && !isSelected ? (
                    <button type="button" className="btn btn--outline m-btn-sm shop-group__choose" onClick={() => selectCheckoutStore(g.store.id)}>
                      Check out this shop
                    </button>
                  ) : (
                    <span className="pill pill--warn">
                      <Clock size={12} /> Slot not chosen
                    </span>
                  )}
                </header>

                <ul className="line-items">
                  {g.lines.map(({ product, qty, total }) => (
                    <li key={product.id} className="line-item">
                      <span className="line-item__img">
                        <Photo src={product.image} alt={product.name} fallback={product.emoji} />
                      </span>
                      <div className="line-item__info">
                        <strong>{product.name}</strong>
                        <small>{product.detail}</small>
                      </div>
                      <QtyStepper qty={qty} label={product.name} onChange={(n) => setQty(g.store.id, product.id, n)} />
                      <span className="line-item__total">{formatPrice(total)}</span>
                    </li>
                  ))}
                </ul>

                <footer className="shop-group__foot">
                  Shop subtotal · {pluralize(g.count, 'item')}
                  <strong>{formatPrice(g.subtotal)}</strong>
                </footer>
              </section>
            )
          })}
        </div>

        <aside className="card card-pad summary">
          <h2 className="summary__title">Order Summary</h2>
          <div className="summary__shop">
            <StoreLogo store={selected.store} size={36} />
            <div>
              <small>{multi ? 'Checking out' : 'Your order from'}</small>
              <strong>{selected.store.name}</strong>
            </div>
          </div>
          <div className="sum-row">
            Items ({selected.count}) <strong>{formatPrice(checkoutSubtotal)}</strong>
          </div>
          <div className="sum-row">
            Booking deposit
            <strong className={checkoutDeposit ? '' : 'text-green'}>{checkoutDeposit ? formatPrice(checkoutDeposit) : 'FREE'}</strong>
          </div>
          <div className="sum-row">
            Delivery <strong className="text-green">None · you collect</strong>
          </div>

          <div className="pay-now">
            <div>
              <p className="pay-now__label">{checkoutDeposit ? 'Pay now (deposit)' : 'Total'}</p>
              <p className="pay-now__hint">
                {checkoutDeposit
                  ? `Remaining ${formatPrice(checkoutSubtotal - checkoutDeposit)} paid at pickup, or pay in full at checkout.`
                  : 'No deposit needed. Pay online or at pickup.'}
              </p>
            </div>
            <strong>{formatPrice(checkoutDeposit || checkoutSubtotal)}</strong>
          </div>

          <PromoForm />

          <button
            type="button"
            className="btn btn--primary btn--block btn--lg"
            onClick={() => navigate('/customer/checkout/pickup')}
          >
            {selected.slot ? 'Continue' : 'Choose Pickup Slot'} <ArrowRight size={18} />
          </button>

          {others.length > 0 && (
            <p className="summary__others">
              Still in your cart: {others.map((g) => `${g.store.name} (${formatPrice(g.subtotal)})`).join(', ')}
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Cart
