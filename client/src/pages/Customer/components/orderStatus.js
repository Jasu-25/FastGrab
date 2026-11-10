import { CircleCheck, CircleX, Clock, PackageOpen, ShoppingBag, Store } from 'lucide-react'

export const ORDER_STATUS = {
  placed: { label: 'Awaiting shop', icon: Clock, tone: 'neutral' },
  confirmed: { label: 'Confirmed', icon: Store, tone: 'orange' },
  packing: { label: 'Packing', icon: PackageOpen, tone: 'blue' },
  ready: { label: 'Ready for pickup', icon: CircleCheck, tone: 'ready' },
  picked_up: { label: 'Picked up', icon: ShoppingBag, tone: 'done' },
  cancelled: { label: 'Cancelled', icon: CircleX, tone: 'red' },
}

/** The order lifecycle shown in the tracking bar. */
export const TRACK_STEPS = [
  { key: 'placed', label: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed by shop' },
  { key: 'packing', label: 'Order packed' },
  { key: 'ready', label: 'Ready to pick up' },
  { key: 'picked_up', label: 'Order picked up' },
]

export const isActiveOrder = (order) => !['picked_up', 'cancelled'].includes(order.status)
