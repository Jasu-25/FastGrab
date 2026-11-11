// Mock data for the merchant (shop) side until the API exists.
// The signed-in shop is GreenGrocer Central.

import { PRODUCTS, getProduct, getStore } from './mockData.js'
import { productPhoto, storePhoto, unsplash, STORE_PHOTOS } from './photos.js'
import { addMinutes } from '../utils/slots.js'
import { isoDate } from '../utils/format.js'

export const SHOP_ID = 'greengrocer-central'

export const DEFAULT_SHOP = {
  id: SHOP_ID,
  name: 'GreenGrocer Central',
  category: 'Supermarket / Grocery',
  owner: 'Rajesh Kumar',
  role: 'Store Manager',
  email: 'hello@greengrocer.in',
  phone: '+91 80 4000 1001',
  address: '12 MG Road, Bengaluru 560001',
  open: '08:00',
  close: '22:00',
  prepMins: 20,
  holdMins: 30,
  autoAccept: false,
  online: true,
  partnerSince: 'January 2026',
  logo: null,
}

// ---------- time helpers (all relative to "now" so the demo always looks live) ----------

const minutesFromNow = (m) => new Date(Date.now() + m * 60000).toISOString()

/** Round to the next 15-minute slot start, `offset` minutes from now. */
function slotAt(offset) {
  const d = new Date(Date.now() + offset * 60000)
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
  return d.toISOString()
}

const plusMinutes = (iso, m) => new Date(new Date(iso).getTime() + m * 60000).toISOString()

// ---------- customers ----------

const CUSTOMERS = {
  ananya: { name: 'Ananya Rao', phone: '+91 98450 11223', email: 'ananya.rao@example.com', pickups: 42, color: '#f7c59f' },
  daniel: { name: 'Daniel Fernandes', phone: '+91 99000 44120', email: 'daniel.f@example.com', pickups: 18, color: '#b5d8f7' },
  priya: { name: 'Priya Shah', phone: '+91 97411 88231', email: 'priya.shah@example.com', pickups: 7, color: '#c8ecd9' },
  arjun: { name: 'Arjun Mehta', phone: '+91 98861 22990', email: 'arjun.m@example.com', pickups: 25, color: '#e9d5ff' },
  olivia: { name: 'Olivia D’Souza', phone: '+91 96320 77345', email: 'olivia.ds@example.com', pickups: 3, color: '#fde68a' },
  karan: { name: 'Karan Singh', phone: '+91 90080 55671', email: 'karan.s@example.com', pickups: 11, color: '#fecaca' },
  meera: { name: 'Meera Iyer', phone: '+91 98805 33412', email: 'meera.i@example.com', pickups: 56, color: '#bae6fd' },
  rohit: { name: 'Rohit Nair', phone: '+91 99724 10087', email: 'rohit.n@example.com', pickups: 9, color: '#d9f99d' },
  sneha: { name: 'Sneha Kulkarni', phone: '+91 97390 66218', email: 'sneha.k@example.com', pickups: 14, color: '#fbcfe8' },
  vikram: { name: 'Vikram Joshi', phone: '+91 98450 90012', email: 'vikram.j@example.com', pickups: 2, color: '#ddd6fe' },
}

export const initialsOf = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// ---------- inventory ----------

const AISLES = { 'Fresh Produce': 'Aisle 1', 'Dairy & Eggs': 'Chiller 2', Bakery: 'Aisle 4', Pantry: 'Aisle 3', Beverages: 'Chiller 3' }
const sku = (id) => `GG-${id.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase()}-${String(id.length * 37).padStart(3, '0')}`

const STOCK = { bananas: 120, coldbrew: 38, sourdough: 0, avocados: 64, honey: 3, tomatoes: 85, apples: 52, milk: 40, eggs: 6, paneer: 22, rice: 30 }
const HIDDEN = new Set(['sourdough', 'honey'])
const COMPARE = { avocados: 299, honey: 380 }

export const DEFAULT_INVENTORY = PRODUCTS[SHOP_ID].map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  unit: p.detail.split('·')[0].trim(),
  description: `${p.name}, ${p.detail.toLowerCase()}. Packed fresh for your pickup.`,
  tags: p.category === 'Fresh Produce' ? ['Fresh', 'Local'] : [],
  price: p.price,
  comparePrice: COMPARE[p.id] ?? null,
  sku: sku(p.id),
  aisle: AISLES[p.category] ?? 'Aisle 2',
  stock: STOCK[p.id] ?? 25,
  lowStockAt: 10,
  prep: p.category === 'Fresh Produce' ? 'Pick & pack (5 min)' : 'Instant (shelf item)',
  visible: !HIDDEN.has(p.id),
  preorder: true,
  images: [p.image].filter(Boolean),
  emoji: p.emoji,
}))

export const INVENTORY_CATEGORIES = ['Fresh Produce', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Beverages', 'Snacks', 'Household']
export const PREP_OPTIONS = ['Instant (shelf item)', 'Pick & pack (5 min)', 'Prepared (15 min)', 'Made to order (30 min)']

// ---------- orders ----------

function item(productId, qty, picked = false) {
  const p = getProduct(SHOP_ID, productId)
  const inv = DEFAULT_INVENTORY.find((i) => i.id === productId)
  return { productId, name: p.name, price: p.price, qty, image: p.image, emoji: p.emoji, sku: inv.sku, aisle: inv.aisle, picked }
}

function order({ id, customer, items, status, placed, slot, shelf, method, payMode = 'full', note = '', timeline = {} }) {
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
  const deposit = 0
  const paidOnline = payMode === 'full' ? subtotal : deposit
  return {
    id,
    customer: { ...CUSTOMERS[customer], initials: initialsOf(CUSTOMERS[customer].name) },
    items,
    status,
    placedAt: placed,
    slotStart: slot,
    slotEnd: plusMinutes(slot, 15),
    shelf,
    pickupCode: `${id.slice(3)}-${id.charCodeAt(5).toString(36).toUpperCase()}Q`,
    subtotal,
    paidOnline,
    dueAtPickup: subtotal - paidOnline,
    method,
    txnId: paidOnline ? `TXN-${id.slice(3)}F2` : '—',
    note,
    timeline: { placed, ...timeline },
  }
}

export function buildMerchantOrders() {
  return [
    // New: waiting for the shop to accept
    order({ id: 'FG-8824', customer: 'priya', status: 'new', placed: minutesFromNow(-2), slot: slotAt(36), items: [item('milk', 2), item('eggs', 1)], method: 'UPI · priya@okaxis', payMode: 'deposit' }),
    order({ id: 'FG-8833', customer: 'olivia', status: 'new', placed: minutesFromNow(-1), slot: slotAt(66), items: [item('apples', 1), item('tomatoes', 2), item('paneer', 1), item('honey', 1)], method: 'Card · Visa •••• 1182' }),
    // Packing
    order({ id: 'FG-8819', customer: 'daniel', status: 'packing', placed: minutesFromNow(-24), slot: slotAt(9), shelf: 'B-1', items: [item('bananas', 2, true), item('avocados', 1, true), item('rice', 1, true), item('milk', 2, true), item('coldbrew', 1, true), item('tomatoes', 1), item('apples', 1)], method: 'UPI · daniel@okhdfc', timeline: { accepted: minutesFromNow(-21) } }),
    order({ id: 'FG-8830', customer: 'arjun', status: 'packing', placed: minutesFromNow(-12), slot: slotAt(51), shelf: 'A-2', items: [item('eggs', 1, true), item('paneer', 2), item('honey', 1)], method: 'Card · Mastercard •••• 7710', payMode: 'deposit', timeline: { accepted: minutesFromNow(-10) } }),
    // Ready for pickup
    order({ id: 'FG-8821', customer: 'ananya', status: 'ready', placed: minutesFromNow(-38), slot: slotAt(4), shelf: 'B-2', items: [item('bananas', 2, true), item('coldbrew', 1, true), item('avocados', 1, true)], method: 'UPI · ananya@okicici', payMode: 'deposit', note: 'Please pick slightly firm avocados, eating them tomorrow. Thanks!', timeline: { accepted: minutesFromNow(-35), packed: minutesFromNow(-12), ready: minutesFromNow(-10) } }),
    order({ id: 'FG-8812', customer: 'meera', status: 'ready', placed: minutesFromNow(-55), slot: slotAt(19), shelf: 'A-4', items: [item('milk', 1, true), item('tomatoes', 1, true)], method: 'UPI · meera@oksbi', timeline: { accepted: minutesFromNow(-52), packed: minutesFromNow(-30), ready: minutesFromNow(-28) } }),
    // Overdue (ready, window already passed)
    order({ id: 'FG-8806', customer: 'karan', status: 'ready', placed: minutesFromNow(-95), slot: slotAt(-38), shelf: 'C-1', items: [item('rice', 1, true), item('apples', 1, true), item('eggs', 1, true)], method: 'Pay at pickup', payMode: 'deposit', timeline: { accepted: minutesFromNow(-92), packed: minutesFromNow(-60), ready: minutesFromNow(-58) } }),
    // Past
    order({ id: 'FG-8815', customer: 'sneha', status: 'picked_up', placed: minutesFromNow(-190), slot: slotAt(-150), shelf: 'A-1', items: [item('coldbrew', 1, true)], method: 'UPI · sneha@okaxis', timeline: { accepted: minutesFromNow(-188), packed: minutesFromNow(-170), ready: minutesFromNow(-168), picked_up: minutesFromNow(-146) } }),
    order({ id: 'FG-8802', customer: 'rohit', status: 'picked_up', placed: minutesFromNow(-300), slot: slotAt(-240), shelf: 'B-3', items: [item('bananas', 1, true), item('milk', 2, true), item('eggs', 1, true), item('honey', 1, true), item('tomatoes', 1, true)], method: 'Card · Visa •••• 0042', timeline: { accepted: minutesFromNow(-298), packed: minutesFromNow(-270), ready: minutesFromNow(-266), picked_up: minutesFromNow(-236) } }),
    order({ id: 'FG-8790', customer: 'vikram', status: 'no_show', placed: minutesFromNow(-1500), slot: slotAt(-1440), shelf: 'C-2', items: [item('avocados', 1, true), item('paneer', 1, true)], method: 'Pay at pickup', payMode: 'deposit', timeline: { accepted: minutesFromNow(-1497), packed: minutesFromNow(-1470), ready: minutesFromNow(-1466) } }),
    order({ id: 'FG-8774', customer: 'daniel', status: 'cancelled', placed: minutesFromNow(-1600), slot: slotAt(-1560), items: [item('rice', 1), item('apples', 2)], method: 'UPI · daniel@okhdfc', timeline: { cancelled: minutesFromNow(-1590) } }),
  ]
}

// Completed sales by month for the revenue chart (₹). Last value = this month so far.
export function buildMonthlyRevenue() {
  const values = [148200, 171500, 196800, 214300, 251900, 284600]
  const now = new Date()
  return values.map((value, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - i), 1)
    return { label: d.toLocaleDateString('en-IN', { month: 'short' }), full: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), value }
  })
}

// ---------- pickup slots ----------

function hash(str) {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** Slots for the next 5 days: { [YYYY-MM-DD]: [{ time, max, booked, open }] } */
export function buildSlots(shop, days = 5, defaultMax = 10) {
  const out = {}
  for (let d = 0; d < days; d++) {
    const date = new Date()
    date.setDate(date.getDate() + d)
    const iso = isoDate(date)
    const list = []
    for (let t = shop.open; t < shop.close; t = addMinutes(t, 15)) {
      const h = hash(iso + t)
      const hour = Number(t.slice(0, 2))
      const busy = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20) // commute peaks
      const booked = d > 1 ? h % 3 : Math.min(defaultMax, (h % (busy ? 11 : 6)) + (busy ? 2 : 0))
      list.push({ time: t, max: defaultMax, booked, open: h % 17 !== 0 })
    }
    out[iso] = list
  }
  return out
}

// ---------- offers (shown on the customer Explore page too) ----------

const daysFromToday = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export const OFFER_PRICING = [
  { weeks: 1, price: 499, save: 0 },
  { weeks: 2, price: 949, save: 5 },
  { weeks: 4, price: 1799, save: 10, popular: true },
  { weeks: 8, price: 3299, save: 17 },
]

export function buildOffers() {
  return [
    { id: 'off-1', storeId: SHOP_ID, title: '20% off all organic fruit', badge: '20% OFF', type: 'percent', value: 20, appliesTo: ['Robusta Bananas', 'Hass Avocados', 'Shimla Apples'], image: productPhoto('bananas', 600), start: daysFromToday(-11), end: daysFromToday(17), weeks: 4, views: 9200, redeemed: 318, status: 'live' },
    { id: 'off-2', storeId: SHOP_ID, title: 'Cold brew: buy one, get one free', badge: 'BUY 1 GET 1', type: 'bogo', value: 1, appliesTo: ['Cold Brew Coffee'], image: productPhoto('coldbrew', 600), start: daysFromToday(-11), end: daysFromToday(3), weeks: 2, views: 6100, redeemed: 254, status: 'live' },
    { id: 'off-3', storeId: SHOP_ID, title: '₹50 off Wildflower Honey', badge: '₹50 OFF', type: 'flat', value: 50, appliesTo: ['Wildflower Honey'], image: productPhoto('honey', 600), start: daysFromToday(-4), end: daysFromToday(10), weeks: 2, views: 3100, redeemed: 70, status: 'live' },
    { id: 'off-4', storeId: SHOP_ID, title: 'Weekend sourdough 15% off', badge: '15% OFF', type: 'percent', value: 15, appliesTo: ['Artisan Sourdough'], image: productPhoto('sourdough', 600), start: daysFromToday(-40), end: daysFromToday(-26), weeks: 2, views: 5400, redeemed: 412, status: 'ended' },
    // Other shops' offers (visible to customers on Explore)
    { id: 'off-5', storeId: 'bakers-corner', title: 'Fresh croissants, 2 for ₹199', badge: 'COMBO', type: 'flat', value: 81, appliesTo: ['Butter Croissant'], image: productPhoto('croissant', 600), start: daysFromToday(-3), end: daysFromToday(11), weeks: 2, views: 4800, redeemed: 190, status: 'live' },
    { id: 'off-6', storeId: 'chai-and-co', title: 'Free samosa with any chai, 7–10 am', badge: 'FREE SNACK', type: 'bogo', value: 1, appliesTo: ['Masala Chai', 'Punjabi Samosa'], image: productPhoto('masala-chai', 600), start: daysFromToday(-6), end: daysFromToday(8), weeks: 2, views: 7300, redeemed: 520, status: 'live' },
    { id: 'off-7', storeId: 'metro-pharmacy', title: '10% off vitamins & wellness', badge: '10% OFF', type: 'percent', value: 10, appliesTo: ['Vitamin C 1000 mg'], image: productPhoto('vitamin-c', 600), start: daysFromToday(-2), end: daysFromToday(26), weeks: 4, views: 2100, redeemed: 64, status: 'live' },
  ]
}

/** Images a merchant can pick as an offer banner without uploading. */
export const BANNER_CHOICES = [
  { id: 'store', label: 'Storefront', url: storePhoto(SHOP_ID, 1200, 400) },
  ...['bananas', 'avocados', 'apples', 'tomatoes', 'coldbrew', 'honey'].map((id) => ({
    id,
    label: getProduct(SHOP_ID, id).name,
    url: productPhoto(id, 900),
  })),
]

export const shopCover = () => (STORE_PHOTOS[SHOP_ID] ? unsplash(STORE_PHOTOS[SHOP_ID], 1200, 400) : null)
export const storeName = (id) => getStore(id)?.name ?? ''
