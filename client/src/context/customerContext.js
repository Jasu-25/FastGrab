import { createContext, useContext } from 'react'

export const CustomerContext = createContext(null)

// Promo code that waives booking deposits (matches the "first pickup is free" offer).
export const PROMO_CODE = 'FIRSTFREE'

/** Access customer state: user, cart, slots, orders, saved shops and locations. */
export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used inside <CustomerProvider>')
  return ctx
}
