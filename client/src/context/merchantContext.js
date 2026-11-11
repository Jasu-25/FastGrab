import { createContext, useContext } from 'react'

export const MerchantContext = createContext(null)

/** Shop-side state: profile, orders, inventory, slots, offers and toasts. */
export function useMerchant() {
  const ctx = useContext(MerchantContext)
  if (!ctx) throw new Error('useMerchant must be used inside <MerchantProvider>')
  return ctx
}

/** A ready order whose pickup window has already ended. */
export const isOverdue = (order, now) => order.status === 'ready' && new Date(order.slotEnd).getTime() < now

export const ACTIVE_STATUSES = ['new', 'packing', 'ready']
