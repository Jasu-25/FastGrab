import { useState } from 'react'
import { Heart, Plus } from 'lucide-react'
import { useCustomer } from '../../../context/customerContext.js'
import { formatPrice } from '../../../utils/format.js'
import QtyStepper from './QtyStepper.jsx'

/** Product tile with add-to-cart / quantity stepper. */
function ProductCard({ storeId, product, storeName }) {
  const { getQty, addToCart, setQty } = useCustomer()
  const [liked, setLiked] = useState(false)
  const qty = getQty(storeId, product.id)

  return (
    <article className="product-card">
      <div className="product-card__media">
        <span className="product-card__emoji" aria-hidden="true">
          {product.emoji}
        </span>
        <button
          type="button"
          className={`product-card__like${liked ? ' is-liked' : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        >
          <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__detail">{storeName ?? product.detail}</p>
      <div className="product-card__foot">
        <span className="product-card__price">{formatPrice(product.price)}</span>
        {qty > 0 ? (
          <QtyStepper qty={qty} label={product.name} size="sm" onChange={(n) => setQty(storeId, product.id, n)} />
        ) : (
          <button
            type="button"
            className="add-btn"
            onClick={() => addToCart(storeId, product.id)}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={18} />
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard
