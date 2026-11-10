import { Coffee, Croissant, Leaf, Pill, ShoppingBag, ShoppingBasket, Store } from 'lucide-react'

const ICONS = {
  basket: ShoppingBasket,
  croissant: Croissant,
  store: Store,
  pill: Pill,
  leaf: Leaf,
  coffee: Coffee,
  bag: ShoppingBag,
}

/** Store "logo" tile: tinted square with the store's icon. Swap for a real logo later. */
function StoreLogo({ store, size = 44, iconSize }) {
  const Icon = ICONS[store.icon] || Store
  return (
    <span
      className={`store-logo tone-${store.tone}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={iconSize || Math.round(size * 0.48)} />
    </span>
  )
}

export function StoreIcon({ store, size = 48, strokeWidth = 1.25 }) {
  const Icon = ICONS[store.icon] || Store
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}

export default StoreLogo
