import { useState } from 'react'
import { Coffee, Croissant, Leaf, Pill, ShoppingBag, ShoppingBasket, Store } from 'lucide-react'
import Photo from '../../components/Photo.jsx'

const ICONS = { basket: ShoppingBasket, croissant: Croissant, store: Store, pill: Pill, leaf: Leaf, coffee: Coffee, bag: ShoppingBag }

/** Shop photo thumbnail with an icon fallback. */
export function ShopThumb({ shop, size = 40 }) {
  const Icon = ICONS[shop.icon] ?? Store
  return (
    <span className={`a-shop__img tone-${shop.tone ?? 'teal'}`} style={{ width: size, height: size }}>
      <Photo src={shop.thumb} alt="" fallback={<Icon size={Math.round(size * 0.45)} />} />
    </span>
  )
}

export function ShopIcon({ shop, size = 20 }) {
  const Icon = ICONS[shop.icon] ?? Store
  return <Icon size={size} />
}

const SHOP_STATUS = { online: 'Online', offline: 'Offline', suspended: 'Suspended' }
export function ShopStatus({ status }) {
  return <span className={`a-status a-status--${status}`}>{SHOP_STATUS[status] ?? status}</span>
}

/**
 * Single-series bar chart (no legend needed). Hover/focus shows a tooltip;
 * the highlighted bar keeps its label visible. Includes a screen-reader table.
 */
export function BarChart({ data, format, caption, highlight = data.length - 1, dark = false, height = 150 }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => d.value)) * 1.18 || 1
  const shown = hover ?? highlight

  return (
    <div className={`a-bars${dark ? ' is-dark' : ''}`}>
      <div className="a-bars__plot" style={{ height }} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <button
            key={d.label}
            type="button"
            className={`a-bars__col${i === highlight ? ' is-hl' : ''}${hover === i ? ' is-hover' : ''}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${d.label}: ${format(d.value)}`}
          >
            <span className="a-bars__bar" style={{ height: `${(d.value / max) * 100}%` }}>
              {shown === i && <span className="a-bars__tip">{format(d.value)}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="a-bars__labels" aria-hidden="true">
        {data.map((d, i) => <span key={d.label} className={i === highlight ? 'is-hl' : ''}>{d.label}</span>)}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>{data.map((d) => <tr key={d.label}><th>{d.label}</th><td>{format(d.value)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
