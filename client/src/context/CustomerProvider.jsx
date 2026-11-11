import { useMemo, useState } from 'react'
import { CustomerContext, PROMO_CODE } from './customerContext.js'
import usePersistentState from '../hooks/usePersistentState.js'
import {
  DEFAULT_LOCATIONS,
  DEFAULT_SAVED_SHOPS,
  DEFAULT_USER,
  buildMockOrders,
  getProduct,
  getStore,
  snapshotItem,
} from '../data/mockData.js'

function CustomerProvider({ children }) {
  const [user, setUser] = usePersistentState('fg.user', DEFAULT_USER)
  // cart: { [storeId]: { [productId]: qty } }
  const [cart, setCart] = usePersistentState('fg.cart', {})
  // slots: { [storeId]: { date: 'YYYY-MM-DD', time: 'HH:MM' } }
  const [slots, setSlots] = usePersistentState('fg.slots', {})
  const [placedOrders, setPlacedOrders] = usePersistentState('fg.orders', [])
  const [savedShops, setSavedShops] = usePersistentState('fg.savedShops', DEFAULT_SAVED_SHOPS)
  const [locations, setLocations] = usePersistentState('fg.locations', DEFAULT_LOCATIONS)
  const [promoApplied, setPromoApplied] = useState(false)
  // Which shop's cart is being checked out (one shop per order).
  const [checkoutStoreId, setCheckoutStoreId] = usePersistentState('fg.checkoutStore', null)
  const [mockOrders] = useState(buildMockOrders)

  const value = useMemo(() => {
    // ----- Cart -----
    const setQty = (storeId, productId, qty) =>
      setCart((prev) => {
        const storeItems = { ...(prev[storeId] || {}) }
        if (qty <= 0) delete storeItems[productId]
        else storeItems[productId] = qty
        const next = { ...prev, [storeId]: storeItems }
        if (Object.keys(storeItems).length === 0) {
          delete next[storeId]
          setSlots((s) => {
            const copy = { ...s }
            delete copy[storeId]
            return copy
          })
        }
        return next
      })

    const getQty = (storeId, productId) => cart[storeId]?.[productId] ?? 0
    const addToCart = (storeId, productId) => setQty(storeId, productId, getQty(storeId, productId) + 1)

    const clearCart = () => {
      setCart({})
      setSlots({})
      setPromoApplied(false)
    }

    // Cart grouped by shop. Each shop becomes its own order.
    const cartGroups = Object.entries(cart)
      .map(([storeId, items]) => {
        const store = getStore(storeId)
        if (!store) return null
        const lines = Object.entries(items)
          .map(([productId, qty]) => {
            const product = getProduct(storeId, productId)
            return product ? { product, qty, total: product.price * qty } : null
          })
          .filter(Boolean)
        if (lines.length === 0) return null
        return {
          store,
          lines,
          count: lines.reduce((n, l) => n + l.qty, 0),
          subtotal: lines.reduce((n, l) => n + l.total, 0),
          deposit: promoApplied ? 0 : store.deposit,
          slot: slots[storeId] || null,
        }
      })
      .filter(Boolean)

    const cartCount = cartGroups.reduce((n, g) => n + g.count, 0)
    const cartSubtotal = cartGroups.reduce((n, g) => n + g.subtotal, 0)
    const cartDeposit = cartGroups.reduce((n, g) => n + g.deposit, 0)

    // Checkout covers one shop at a time. Falls back to the first shop in the cart.
    const selectedStoreId = cartGroups.some((g) => g.store.id === checkoutStoreId)
      ? checkoutStoreId
      : cartGroups[0]?.store.id ?? null
    const checkoutGroups = cartGroups.filter((g) => g.store.id === selectedStoreId)
    const checkoutCount = checkoutGroups.reduce((n, g) => n + g.count, 0)
    const checkoutSubtotal = checkoutGroups.reduce((n, g) => n + g.subtotal, 0)
    const checkoutDeposit = checkoutGroups.reduce((n, g) => n + g.deposit, 0)
    const selectCheckoutStore = (storeId) => setCheckoutStoreId(storeId)

    const setSlot = (storeId, slot) => setSlots((prev) => ({ ...prev, [storeId]: slot }))

    const applyPromo = (code) => {
      const ok = code.trim().toUpperCase() === PROMO_CODE
      if (ok) setPromoApplied(true)
      return ok
    }

    /** Turns the cart into one order per shop. Returns the new order IDs. */
    const placeOrders = ({ payMode, method }) => {
      const now = new Date().toISOString()
      const newOrders = checkoutGroups.map((g) => {
        const id = `FG-${Math.floor(1000 + Math.random() * 9000)}`
        const paidOnline = payMode === 'full' ? g.subtotal : g.deposit
        return {
          id,
          storeId: g.store.id,
          status: 'placed',
          placedAt: now,
          pickupDate: g.slot.date,
          slot: g.slot.time,
          items: g.lines.map((l) => snapshotItem(g.store.id, l.product.id, l.qty)),
          subtotal: g.subtotal,
          deposit: g.deposit,
          payMode,
          paidOnline,
          dueAtPickup: g.subtotal - paidOnline,
          method: paidOnline > 0 ? method : 'Pay at pickup',
          txnId: paidOnline > 0 ? `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}` : '—',
          timeline: { placed: now },
          pickupCode: `${id.slice(3)}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`,
        }
      })
      setPlacedOrders((prev) => [...newOrders, ...prev])
      // Remove only the checked-out shop; other shops stay in the cart.
      const done = new Set(checkoutGroups.map((g) => g.store.id))
      const keep = (obj) => Object.fromEntries(Object.entries(obj).filter(([id]) => !done.has(id)))
      setCart(keep)
      setSlots(keep)
      setCheckoutStoreId(null)
      if (done.size === cartGroups.length) setPromoApplied(false)
      return newOrders.map((o) => o.id)
    }

    // ----- Orders -----
    const orders = [...placedOrders, ...mockOrders]
    const getOrder = (id) => orders.find((o) => o.id === id)

    // ----- Saved shops -----
    const isSaved = (storeId) => savedShops.includes(storeId)
    const toggleSavedShop = (storeId) =>
      setSavedShops((prev) => (prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]))

    // ----- Profile & locations -----
    const updateUser = (patch) => setUser((prev) => ({ ...prev, ...patch }))

    const saveLocation = (location) =>
      setLocations((prev) => {
        const exists = prev.some((l) => l.id === location.id)
        return exists ? prev.map((l) => (l.id === location.id ? location : l)) : [...prev, location]
      })
    const removeLocation = (id) => setLocations((prev) => prev.filter((l) => l.id !== id))
    const setDefaultLocation = (id) =>
      setLocations((prev) => prev.map((l) => ({ ...l, isDefault: l.id === id })))

    const logout = () => {
      // TODO: call /api/auth/logout and clear the session cookie
      clearCart()
    }

    return {
      user,
      updateUser,
      cart,
      cartGroups,
      cartCount,
      cartSubtotal,
      cartDeposit,
      checkoutGroups,
      checkoutCount,
      checkoutSubtotal,
      checkoutDeposit,
      selectedStoreId,
      selectCheckoutStore,
      getQty,
      addToCart,
      setQty,
      clearCart,
      setSlot,
      promoApplied,
      applyPromo,
      placeOrders,
      orders,
      getOrder,
      savedShops,
      isSaved,
      toggleSavedShop,
      locations,
      saveLocation,
      removeLocation,
      setDefaultLocation,
      logout,
    }
  }, [
    user, setUser, cart, setCart, slots, setSlots, placedOrders, setPlacedOrders, mockOrders,
    savedShops, setSavedShops, locations, setLocations, promoApplied, checkoutStoreId, setCheckoutStoreId,
  ])

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export default CustomerProvider
