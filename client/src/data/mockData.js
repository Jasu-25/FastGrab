// Mock data used until the Express/MongoDB API exists.
// Shapes here are a good starting point for the Mongoose models.

import { isoDate } from '../utils/format.js'

export const DEFAULT_USER = {
  firstName: 'Priya',
  lastName: 'Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  memberSince: 'March 2026',
  pickups: 42,
  avatarUrl: null,
}

export const STORE_FILTERS = ['All Stores', 'Supermarkets', 'Bakeries', 'Organic', 'Pharmacies', 'Cafes']

export const STORES = [
  {
    id: 'greengrocer-central',
    name: 'GreenGrocer Central',
    type: 'Supermarkets',
    tags: ['Groceries', 'Organic', 'Fresh'],
    rating: 4.8,
    reviews: '2.4k',
    distanceKm: 0.4,
    address: '12 MG Road, Bengaluru 560001',
    phone: '+918040001001',
    open: '08:00',
    close: '22:00',
    prepMins: 20,
    deposit: 0,
    counter: 'FastGrab Desk 2',
    icon: 'basket',
    tone: 'green',
    description: 'Local source for fresh organic produce, sustainable pantry items and artisanal dairy products.',
    mapPos: { x: 42, y: 38 },
  },
  {
    id: 'bakers-corner',
    name: "Baker's Corner",
    type: 'Bakeries',
    tags: ['Bakery', 'Coffee', 'Pastries'],
    rating: 4.9,
    reviews: '1.8k',
    distanceKm: 1.2,
    address: '48 Church Street, Bengaluru 560001',
    phone: '+918040001002',
    open: '07:00',
    close: '21:00',
    prepMins: 15,
    deposit: 20,
    counter: 'Pickup shelf, left of entrance',
    icon: 'croissant',
    tone: 'orange',
    description: 'Artisan sourdough, flaky pastries and fresh coffee, baked every morning.',
    mapPos: { x: 70, y: 26 },
  },
  {
    id: 'urban-mart',
    name: 'Urban Mart',
    type: 'Supermarkets',
    tags: ['Household', 'Toiletries', 'Daily needs'],
    rating: 4.6,
    reviews: '3k',
    distanceKm: 0.8,
    address: '5 Residency Road, Bengaluru 560025',
    phone: '+918040001003',
    open: '09:00',
    close: '23:00',
    prepMins: 30,
    deposit: 0,
    counter: 'Customer service desk',
    icon: 'store',
    tone: 'teal',
    description: 'Household supplies, toiletries and everyday essentials under one roof.',
    mapPos: { x: 58, y: 62 },
  },
  {
    id: 'metro-pharmacy',
    name: 'Metro Pharmacy',
    type: 'Pharmacies',
    tags: ['Medicines', 'Wellness', 'Personal care'],
    rating: 4.7,
    reviews: '980',
    distanceKm: 0.7,
    address: '3 Station Road, Bengaluru 560009',
    phone: '+918040001004',
    open: '08:00',
    close: '23:00',
    prepMins: 10,
    deposit: 10,
    counter: 'Counter 1',
    icon: 'pill',
    tone: 'blue',
    description: 'Prescription and over-the-counter medicines, vitamins and first aid.',
    mapPos: { x: 28, y: 64 },
  },
  {
    id: 'natures-best',
    name: "Nature's Best",
    type: 'Organic',
    tags: ['Organic', 'Vegan', 'Health'],
    rating: 4.7,
    reviews: '760',
    distanceKm: 2.1,
    address: '22 Indiranagar 100 Ft Road, Bengaluru 560038',
    phone: '+918040001005',
    open: '08:00',
    close: '21:00',
    prepMins: 25,
    deposit: 0,
    counter: 'FastGrab Desk',
    icon: 'leaf',
    tone: 'green',
    description: 'Certified organic produce, healthy pantry staples and plant-based snacks.',
    mapPos: { x: 84, y: 54 },
  },
  {
    id: 'chai-and-co',
    name: 'Chai & Co.',
    type: 'Cafes',
    tags: ['Chai', 'Snacks', 'Breakfast'],
    rating: 4.5,
    reviews: '640',
    distanceKm: 0.6,
    address: '9 Brigade Road, Bengaluru 560001',
    phone: '+918040001006',
    open: '07:00',
    close: '20:00',
    prepMins: 10,
    deposit: 0,
    counter: 'Takeaway window',
    icon: 'coffee',
    tone: 'purple',
    description: 'Kulhad chai, filter coffee and fresh snacks for your commute.',
    mapPos: { x: 50, y: 18 },
  },
  {
    id: 'daily-mart',
    name: 'Daily Mart',
    type: 'Supermarkets',
    tags: ['Convenience', 'Household'],
    rating: 4.4,
    reviews: '1.1k',
    distanceKm: 0.6,
    address: '61 Koramangala 5th Block, Bengaluru 560095',
    phone: '+918040001007',
    open: '07:00',
    close: '23:00',
    prepMins: 15,
    deposit: 0,
    counter: 'Billing counter 3',
    icon: 'bag',
    tone: 'red',
    description: 'Your neighbourhood convenience store for daily essentials.',
    mapPos: { x: 18, y: 30 },
  },
]

const p = (id, name, detail, price, emoji, category) => ({ id, name, detail, price, emoji, category })

export const PRODUCTS = {
  'greengrocer-central': [
    p('bananas', 'Robusta Bananas', 'Bunch of 6 · Karnataka', 60, '🍌', 'Fresh Produce'),
    p('coldbrew', 'Cold Brew Coffee', '500 ml · Organic', 199, '☕', 'Beverages'),
    p('sourdough', 'Artisan Sourdough', 'Large · Freshly baked', 220, '🍞', 'Bakery'),
    p('avocados', 'Hass Avocados', 'Pack of 2 · Ready to eat', 249, '🥑', 'Fresh Produce'),
    p('honey', 'Wildflower Honey', '340 g · Raw & pure', 320, '🍯', 'Pantry'),
    p('tomatoes', 'Farm Tomatoes', '1 kg · Local farm', 45, '🍅', 'Fresh Produce'),
    p('apples', 'Shimla Apples', '1 kg · Himachal', 180, '🍎', 'Fresh Produce'),
    p('milk', 'Organic Toned Milk', '1 L · Glass bottle', 72, '🥛', 'Dairy & Eggs'),
    p('eggs', 'Free-range Eggs', 'Pack of 6', 90, '🥚', 'Dairy & Eggs'),
    p('paneer', 'Fresh Paneer', '200 g', 95, '🧀', 'Dairy & Eggs'),
    p('rice', 'Sona Masoori Rice', '5 kg', 410, '🍚', 'Pantry'),
  ],
  'bakers-corner': [
    p('sourdough', 'Artisan Sourdough', 'Large · Freshly baked', 220, '🍞', 'Breads'),
    p('croissant', 'Butter Croissant', 'Pack of 2', 140, '🥐', 'Pastries'),
    p('baguette', 'French Baguette', 'Classic', 120, '🥖', 'Breads'),
    p('muffin', 'Blueberry Muffin', 'Single', 90, '🧁', 'Pastries'),
    p('cookies', 'Oat & Raisin Cookies', 'Pack of 6', 160, '🍪', 'Pastries'),
    p('cake', 'Chocolate Truffle Cake', '500 g', 550, '🎂', 'Cakes'),
    p('cappuccino', 'Cappuccino', 'Regular · 250 ml', 150, '☕', 'Coffee'),
  ],
  'urban-mart': [
    p('detergent', 'Liquid Detergent', '1 L', 299, '🧴', 'Household'),
    p('towels', 'Kitchen Towels', 'Pack of 2', 120, '🧻', 'Household'),
    p('toothpaste', 'Herbal Toothpaste', '150 g', 95, '🪥', 'Personal care'),
    p('soap', 'Sandal Soap', 'Pack of 4', 180, '🧼', 'Personal care'),
    p('noodles', 'Instant Noodles', 'Pack of 4', 56, '🍜', 'Snacks'),
    p('biscuits', 'Cream Biscuits', '300 g', 40, '🍪', 'Snacks'),
  ],
  'metro-pharmacy': [
    p('vitamin-c', 'Vitamin C 1000 mg', '60 tablets', 349, '💊', 'Vitamins'),
    p('paracetamol', 'Paracetamol 650', 'Strip of 15', 32, '💊', 'Pain relief'),
    p('bandages', 'Adhesive Bandages', 'Pack of 20', 85, '🩹', 'First aid'),
    p('sanitizer', 'Hand Sanitizer', '500 ml', 199, '🧴', 'Personal care'),
    p('thermometer', 'Digital Thermometer', 'Fast read', 299, '🌡️', 'First aid'),
    p('ors', 'ORS Sachets', 'Pack of 10', 210, '🧃', 'Wellness'),
  ],
  'natures-best': [
    p('spinach', 'Organic Spinach', '250 g', 40, '🥬', 'Fresh Produce'),
    p('carrots', 'Organic Carrots', '500 g', 50, '🥕', 'Fresh Produce'),
    p('quinoa', 'White Quinoa', '500 g', 299, '🌾', 'Pantry'),
    p('oats', 'Rolled Oats', '1 kg', 199, '🥣', 'Pantry'),
    p('almonds', 'California Almonds', '250 g', 330, '🥜', 'Snacks'),
    p('kombucha', 'Ginger Kombucha', '330 ml', 180, '🧃', 'Beverages'),
  ],
  'chai-and-co': [
    p('masala-chai', 'Masala Chai', 'Kulhad · 150 ml', 40, '🍵', 'Chai'),
    p('filter-coffee', 'Filter Coffee', 'Davara set', 50, '☕', 'Coffee'),
    p('samosa', 'Punjabi Samosa', 'Pack of 2', 60, '🥟', 'Snacks'),
    p('sandwich', 'Veg Grilled Sandwich', 'With chutney', 120, '🥪', 'Snacks'),
    p('vada-pav', 'Vada Pav', 'Single', 45, '🍔', 'Snacks'),
  ],
  'daily-mart': [
    p('bread', 'Whole Wheat Bread', '400 g', 50, '🍞', 'Essentials'),
    p('milk', 'Toned Milk', '500 ml', 28, '🥛', 'Essentials'),
    p('butter', 'Salted Butter', '100 g', 58, '🧈', 'Essentials'),
    p('onions', 'Onions', '1 kg', 40, '🧅', 'Vegetables'),
    p('potatoes', 'Potatoes', '1 kg', 35, '🥔', 'Vegetables'),
    p('cola', 'Cola', '750 ml', 40, '🥤', 'Beverages'),
  ],
}

export const getStore = (id) => STORES.find((s) => s.id === id)
export const getProduct = (storeId, productId) => PRODUCTS[storeId]?.find((x) => x.id === productId)

export const DEFAULT_LOCATIONS = [
  { id: 'home', label: 'Home', type: 'home', address: '24, 3rd Cross, Indiranagar, Bengaluru 560038', isDefault: true },
  { id: 'work', label: 'Work', type: 'work', address: 'Embassy Tech Village, Outer Ring Road, Bengaluru 560103', isDefault: false },
  { id: 'gym', label: 'Gym', type: 'gym', address: '100 Feet Road, HAL 2nd Stage, Bengaluru 560008', isDefault: false },
]

export const DEFAULT_SAVED_SHOPS = ['greengrocer-central', 'bakers-corner', 'natures-best']

// ---------- Orders ----------

/** Copy product details into the order so later price changes don't affect it. */
export function snapshotItem(storeId, productId, qty) {
  const product = getProduct(storeId, productId)
  return { productId, name: product.name, detail: product.detail, emoji: product.emoji, price: product.price, qty }
}

function at(dayOffset, hhmm) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function dateIn(dayOffset) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  return isoDate(d)
}

function mockOrder({ id, storeId, status, day, placed, slot, items, payMode, method, timeline }) {
  const store = getStore(storeId)
  const snapshot = items.map(([pid, qty]) => snapshotItem(storeId, pid, qty))
  const subtotal = snapshot.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deposit = store.deposit
  const paidOnline = status === 'cancelled' ? deposit : payMode === 'full' ? subtotal : deposit
  return {
    id,
    storeId,
    status,
    placedAt: at(day, placed),
    pickupDate: dateIn(day),
    slot,
    items: snapshot,
    subtotal,
    deposit,
    payMode,
    paidOnline,
    dueAtPickup: status === 'cancelled' ? 0 : subtotal - paidOnline,
    method,
    txnId: `TXN-${id.slice(3)}A9F`,
    timeline: Object.fromEntries(Object.entries(timeline).map(([k, t]) => [k, at(day, t)])),
    pickupCode: `${id.slice(3)}-${id.charCodeAt(4).toString(36).toUpperCase()}X`,
  }
}

/** Built at runtime so dates are always relative to "today". */
export function buildMockOrders() {
  return [
    mockOrder({
      id: 'FG-8821',
      storeId: 'greengrocer-central',
      status: 'ready',
      day: 0,
      placed: '13:52',
      slot: '14:30',
      items: [['bananas', 2], ['coldbrew', 1], ['avocados', 1]],
      payMode: 'full',
      method: 'UPI · priya@okhdfcbank',
      timeline: { placed: '13:52', confirmed: '13:55', packing: '14:18', ready: '14:24' },
    }),
    mockOrder({
      id: 'FG-8834',
      storeId: 'metro-pharmacy',
      status: 'packing',
      day: 0,
      placed: '14:05',
      slot: '15:00',
      items: [['vitamin-c', 1]],
      payMode: 'deposit',
      method: 'Card · Visa •••• 4821',
      timeline: { placed: '14:05', confirmed: '14:09', packing: '14:20' },
    }),
    mockOrder({
      id: 'FG-8840',
      storeId: 'bakers-corner',
      status: 'confirmed',
      day: 1,
      placed: '07:40',
      slot: '08:15',
      items: [['sourdough', 1], ['croissant', 1]],
      payMode: 'deposit',
      method: 'UPI · priya@okhdfcbank',
      timeline: { placed: '07:40', confirmed: '07:44' },
    }),
    mockOrder({
      id: 'FG-8702',
      storeId: 'greengrocer-central',
      status: 'picked_up',
      day: -20,
      placed: '17:10',
      slot: '18:00',
      items: [['bananas', 1], ['milk', 2], ['eggs', 1], ['honey', 1], ['tomatoes', 1]],
      payMode: 'full',
      method: 'UPI · priya@okhdfcbank',
      timeline: { placed: '17:10', confirmed: '17:12', packing: '17:40', ready: '17:55', picked_up: '18:07' },
    }),
    mockOrder({
      id: 'FG-8655',
      storeId: 'urban-mart',
      status: 'picked_up',
      day: -23,
      placed: '18:30',
      slot: '19:30',
      items: [['detergent', 1], ['towels', 1]],
      payMode: 'full',
      method: 'Card · Visa •••• 4821',
      timeline: { placed: '18:30', confirmed: '18:33', packing: '19:05', ready: '19:25', picked_up: '19:42' },
    }),
    mockOrder({
      id: 'FG-8590',
      storeId: 'bakers-corner',
      status: 'cancelled',
      day: -26,
      placed: '08:02',
      slot: '09:00',
      items: [['cake', 1], ['muffin', 2]],
      payMode: 'deposit',
      method: 'UPI · priya@okhdfcbank',
      timeline: { placed: '08:02', cancelled: '08:20' },
    }),
  ]
}
