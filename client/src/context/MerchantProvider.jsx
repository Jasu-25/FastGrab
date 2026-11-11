import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MerchantContext } from './merchantContext.js'
import usePersistentState from '../hooks/usePersistentState.js'
import {
  DEFAULT_INVENTORY,
  DEFAULT_SHOP,
  buildMerchantOrders,
  buildMonthlyRevenue,
  buildOffers,
  buildSlots,
} from '../data/merchantData.js'

const SHELVES = ['A-1', 'A-2', 'A-3', 'B-1', 'B-3', 'C-3', 'D-1']
const stamp = () => new Date().toISOString()

function MerchantProvider({ children }) {
  // Persisted per browser: the shop profile and its catalogue.
  const [shop, setShop] = usePersistentState('fg.m.shop', DEFAULT_SHOP)
  const [inventory, setInventory] = usePersistentState('fg.m.inventory', DEFAULT_INVENTORY)
  // Rebuilt each visit so times stay relative to "now".
  const [orders, setOrders] = useState(buildMerchantOrders)
  const [slots, setSlots] = useState(() => buildSlots(DEFAULT_SHOP))
  const [defaultMax, setDefaultMaxState] = useState(10)
  const [offers, setOffers] = useState(buildOffers)
  const [revenue] = useState(buildMonthlyRevenue)
  const [paused, setPaused] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  // A clock for "due in 9m", overdue detection and the LIVE badge.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const toast = useCallback((message, tone = 'success') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const value = useMemo(() => {
    const updateOrder = (id, fn) => setOrders((list) => list.map((o) => (o.id === id ? fn(o) : o)))

    const acceptOrder = (id) => {
      updateOrder(id, (o) => ({
        ...o,
        status: 'packing',
        shelf: o.shelf ?? SHELVES[Math.floor(Math.random() * SHELVES.length)],
        timeline: { ...o.timeline, accepted: stamp() },
      }))
      toast(`Order #${id} accepted. Start packing!`)
    }
    const declineOrder = (id) => {
      updateOrder(id, (o) => ({ ...o, status: 'cancelled', timeline: { ...o.timeline, cancelled: stamp() } }))
      toast(`Order #${id} declined. The customer has been refunded.`, 'warn')
    }
    const togglePicked = (id, productId) =>
      updateOrder(id, (o) => ({
        ...o,
        items: o.items.map((i) => (i.productId === productId ? { ...i, picked: !i.picked } : i)),
      }))
    const markPacked = (id) => {
      updateOrder(id, (o) => ({
        ...o,
        status: 'ready',
        items: o.items.map((i) => ({ ...i, picked: true })),
        timeline: { ...o.timeline, packed: stamp(), ready: stamp() },
      }))
      toast(`#${id} is ready. Customer notified.`)
    }
    const handOver = (id) => {
      updateOrder(id, (o) => ({ ...o, status: 'picked_up', timeline: { ...o.timeline, picked_up: stamp() } }))
      toast(`#${id} handed over. Nice work!`)
    }
    const markNoShow = (id) => {
      updateOrder(id, (o) => ({ ...o, status: 'no_show', timeline: { ...o.timeline, no_show: stamp() } }))
      toast(`#${id} marked as no-show.`, 'warn')
    }
    const remind = (id) => toast(`Reminder sent for #${id}.`)

    const findByCode = (code) => {
      const c = code.trim().toUpperCase().replace(/^#/, '')
      return orders.find((o) => o.pickupCode === c || o.id === c || o.id === `FG-${c}`)
    }

    // ----- Inventory -----
    const saveItem = (item) => {
      setInventory((list) => (list.some((i) => i.id === item.id) ? list.map((i) => (i.id === item.id ? item : i)) : [item, ...list]))
    }
    const toggleVisible = (id) => {
      const item = inventory.find((i) => i.id === id)
      setInventory((list) => list.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i)))
      toast(item?.visible ? `${item.name} is hidden from customers.` : `${item?.name} is live in your store.`)
    }
    const adjustStock = (id, delta) =>
      setInventory((list) => list.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)))

    // ----- Slots -----
    const updateSlot = (date, time, fn) =>
      setSlots((all) => ({ ...all, [date]: all[date].map((s) => (s.time === time ? fn(s) : s)) }))
    const setSlotMax = (date, time, max) => updateSlot(date, time, (s) => ({ ...s, max: Math.max(s.booked, Math.min(50, max)) }))
    const toggleSlot = (date, time) => updateSlot(date, time, (s) => ({ ...s, open: !s.open }))
    const setDayOpen = (date, open) => {
      setSlots((all) => ({ ...all, [date]: all[date].map((s) => ({ ...s, open })) }))
      toast(open ? 'All slots opened for this day.' : 'All slots stopped for this day.', open ? 'success' : 'warn')
    }
    const setDefaultMax = (next) => {
      const value = Math.max(1, Math.min(50, next))
      // Slots still on the old default follow the new default; custom ones stay.
      setSlots((all) =>
        Object.fromEntries(
          Object.entries(all).map(([d, list]) => [d, list.map((s) => (s.max === defaultMax ? { ...s, max: Math.max(s.booked, value) } : s))]),
        ),
      )
      setDefaultMaxState(value)
    }

    // ----- Offers -----
    const extendOffer = (id, weeks = 1) => {
      setOffers((list) =>
        list.map((o) => {
          if (o.id !== id) return o
          const end = new Date(o.end)
          end.setDate(end.getDate() + weeks * 7)
          return { ...o, end: end.toISOString().slice(0, 10), weeks: o.weeks + weeks, status: 'live' }
        }),
      )
      toast(`Offer extended by ${weeks} week${weeks > 1 ? 's' : ''}.`)
    }
    const createOffer = (offer) => setOffers((list) => [offer, ...list])

    const updateShop = (patch) => setShop((s) => ({ ...s, ...patch }))

    return {
      shop,
      updateShop,
      orders,
      acceptOrder,
      declineOrder,
      togglePicked,
      markPacked,
      handOver,
      markNoShow,
      remind,
      findByCode,
      inventory,
      saveItem,
      toggleVisible,
      adjustStock,
      slots,
      defaultMax,
      setSlotMax,
      toggleSlot,
      setDayOpen,
      setDefaultMax,
      offers,
      extendOffer,
      createOffer,
      revenue,
      paused,
      setPaused,
      now,
      toasts,
      toast,
    }
  }, [shop, setShop, orders, inventory, setInventory, slots, defaultMax, offers, revenue, paused, now, toasts, toast])

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>
}

export default MerchantProvider
