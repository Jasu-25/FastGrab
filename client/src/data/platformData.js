// Platform-wide mock data shared by the admin console and the shop's Payments page.
// Replace with API calls (/api/admin/*) once the backend exists.

import { STORES, getProduct } from './mockData.js'
import { STORE_PHOTOS, productPhoto, unsplash } from './photos.js'
import { calcCommission } from '../utils/commission.js'
import { isoDate } from '../utils/format.js'

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ---------- Shops & their owners ----------

const SHOP_META = {
  'greengrocer-central': { owner: 'Rajesh Kumar', email: 'hello@greengrocer.in', phone: '+91 80 4000 1001', area: 'MG Road', status: 'online', orders: 1284, revenue: 284600, trend: 13, plan: { type: 'standard' }, since: 'Jan 2026', gstin: '29AAGCG1234F1Z5', color: '#c8ecd9' },
  'urban-mart': { owner: 'Marcus Dsouza', email: 'marcus@urbanmart.in', phone: '+91 80 4000 1003', area: 'Residency Road', status: 'online', orders: 1032, revenue: 219400, trend: 7, plan: { type: 'standard' }, since: 'Feb 2026', gstin: '29AAKCU5521M1Z2', color: '#b5d8f7' },
  'bakers-corner': { owner: 'Fatima Sheikh', email: 'fatima@bakerscorner.in', phone: '+91 80 4000 1002', area: 'Church Street', status: 'offline', orders: 846, revenue: 98200, trend: -2, plan: { type: 'standard' }, since: 'Mar 2026', gstin: '29AAFCB7781Q1Z9', color: '#fde68a' },
  'natures-best': { owner: 'Emily Fernandes', email: 'emily@naturesbest.in', phone: '+91 80 4000 1005', area: 'Indiranagar', status: 'online', orders: 612, revenue: 123800, trend: 9, plan: { type: 'flat', rate: 0.015 }, since: 'Mar 2026', gstin: '29AABCN4410K1Z1', color: '#d9f99d' },
  'metro-pharmacy': { owner: 'Dr. Arvind Rao', email: 'arvind@metropharmacy.in', phone: '+91 80 4000 1004', area: 'Station Road', status: 'online', orders: 540, revenue: 71500, trend: 4, plan: { type: 'standard' }, since: 'Apr 2026', gstin: '29AADCM2290P1Z4', color: '#bae6fd' },
  'chai-and-co': { owner: 'Raj Mehta', email: 'raj@chaiandco.in', phone: '+91 80 4000 1006', area: 'Brigade Road', status: 'online', orders: 1890, revenue: 42300, trend: 18, plan: { type: 'standard' }, since: 'May 2026', gstin: '29AAECC6612H1Z7', color: '#e9d5ff' },
  'daily-mart': { owner: 'Oliver Reddy', email: 'oliver@dailymart.in', phone: '+91 80 4000 1007', area: 'Koramangala', status: 'suspended', orders: 204, revenue: 31500, trend: -18, plan: { type: 'exempt' }, since: 'Jun 2026', gstin: '29AAHCD9081B1Z3', color: '#fecaca' },
}

/** Commission for a month under a shop's plan. */
export function commissionFor(plan, revenue) {
  if (plan.type === 'exempt') return { total: 0, rate: 0, label: 'Exempt' }
  if (plan.type === 'flat') return { total: Math.round(revenue * plan.rate), rate: plan.rate, label: `Flat ${(plan.rate * 100).toFixed(1)}%` }
  const c = calcCommission(revenue)
  return { total: c.total, rate: c.currentRate, effective: c.effectiveRate, label: 'Standard slabs' }
}

export function buildShops() {
  return STORES.map((s) => {
    const m = SHOP_META[s.id]
    const months = [0.52, 0.6, 0.69, 0.75, 0.88, 1].map((f, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i), 1)
      return { label: d.toLocaleDateString('en-IN', { month: 'short' }), value: Math.round(m.revenue * f) }
    })
    return {
      id: s.id,
      name: s.name,
      category: s.type,
      tags: s.tags,
      city: `${m.area}, Bengaluru`,
      address: s.address,
      rating: s.rating,
      reviews: s.reviews,
      icon: s.icon,
      tone: s.tone,
      cover: STORE_PHOTOS[s.id] ? unsplash(STORE_PHOTOS[s.id], 1400, 360) : null,
      thumb: STORE_PHOTOS[s.id] ? unsplash(STORE_PHOTOS[s.id], 120, 120) : null,
      open: s.open,
      close: s.close,
      owner: { id: `u-${s.id}`, name: m.owner, email: m.email, phone: m.phone, color: m.color },
      status: m.status,
      ordersMonth: m.orders,
      revenueMonth: m.revenue,
      trend: m.trend,
      plan: m.plan,
      since: m.since,
      gstin: m.gstin,
      history: months,
      pickupSuccess: 96 + (m.orders % 3),
      topProducts: ['bananas', 'coldbrew', 'avocados'].map((pid, i) => {
        const p = getProduct('greengrocer-central', pid)
        return { name: p.name, image: p.image, emoji: p.emoji, sold: [842, 610, 498][i], revenue: p.price * [842, 610, 498][i] }
      }),
    }
  })
}

// ---------- Weekly commission payments (shop → FastGrab) ----------

const METHODS = ['Payout deduction', 'Payout deduction', 'UPI · AutoPay', 'Bank transfer', 'Payout deduction']

export function buildTransactions(shops) {
  const out = []
  let seq = 1100
  shops.forEach((shop, si) => {
    if (shop.plan.type === 'exempt') return
    for (let w = 0; w < 6; w++) {
      const end = daysAgo(w * 7 + 1)
      const start = daysAgo(w * 7 + 7)
      const sales = Math.round((shop.revenueMonth / 4.3) * (0.88 + ((si + w) % 5) * 0.05))
      const rate = shop.plan.type === 'flat' ? shop.plan.rate : commissionFor(shop.plan, shop.revenueMonth).rate || 0.01
      out.push({
        id: `CM-26-${seq--}`,
        shopId: shop.id,
        date: isoDate(daysAgo(w * 7)),
        period: `${start.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('en-IN', { month: 'short' })}`,
        orders: Math.round(shop.ordersMonth / 4.3),
        sales,
        commission: Math.round(sales * rate),
        rate,
        method: w === 0 ? '—' : METHODS[(si + w) % METHODS.length],
        status: w === 0 ? 'pending' : 'paid',
      })
    }
  })
  return out.sort((a, b) => (a.date < b.date ? 1 : -1))
}

// ---------- Pending applications & offer promotions ----------

export function buildApplications() {
  return [
    { id: 'APP-1042', name: 'Amma’s Kitchen Pickles', category: 'Grocery & Deli', city: 'Jayanagar, Bengaluru', owner: 'Lakshmi Iyer', email: 'lakshmi@ammaskitchen.in', phone: '+91 98450 22118', address: '14, 9th Main, Jayanagar 4th Block, Bengaluru 560011', gstin: '29AAJFA3321L1Z8', pan: 'AAJFA3321L', fssai: '11226330000123', cover: unsplash(STORE_PHOTOS['daily-mart'], 1200, 400), icon: 'basket', tone: 'green', submitted: daysAgo(0).toISOString(), status: 'new', docs: [['Shop & Establishment certificate', 'verified'], ['Owner PAN / Aadhaar', 'verified'], ['FSSAI licence', 'missing']] },
    { id: 'APP-1041', name: 'CarePlus Pharmacy', category: 'Pharmacy', city: 'HSR Layout, Bengaluru', owner: 'Dr. Neha Kapoor', email: 'neha@careplus.in', phone: '+91 99000 34512', address: '220, 27th Main, HSR Layout, Bengaluru 560102', gstin: '29AADCC8812M1Z3', pan: 'AADCC8812M', drugLicense: 'KA-B12-778812', cover: unsplash(STORE_PHOTOS['metro-pharmacy'], 1200, 400), icon: 'pill', tone: 'blue', submitted: daysAgo(1).toISOString(), status: 'new', docs: [['Shop & Establishment certificate', 'verified'], ['Owner PAN / Aadhaar', 'verified'], ['Drug licence', 'verified']] },
    { id: 'APP-1039', name: 'Pet Paradise', category: 'Pet Supplies', city: 'Whitefield, Bengaluru', owner: 'Arjun Nair', email: 'arjun@petparadise.in', phone: '+91 97411 99230', address: '8, ITPL Main Road, Whitefield, Bengaluru 560066', gstin: '29AAPFP7740D1Z6', pan: 'AAPFP7740D', cover: unsplash(STORE_PHOTOS['urban-mart'], 1200, 400), icon: 'store', tone: 'purple', submitted: daysAgo(2).toISOString(), status: 'info_sent', docs: [['Shop & Establishment certificate', 'verified'], ['Owner PAN / Aadhaar', 'missing']] },
    { id: 'APP-1037', name: 'Golden Crust Bakery', category: 'Bakery', city: 'Malleshwaram, Bengaluru', owner: 'Joseph D’Cruz', email: 'joseph@goldencrust.in', phone: '+91 98861 44120', address: '33, Sampige Road, Malleshwaram, Bengaluru 560003', gstin: '29AAGFG2219C1Z1', pan: 'AAGFG2219C', fssai: '11226330000456', cover: unsplash(STORE_PHOTOS['bakers-corner'], 1200, 400), icon: 'croissant', tone: 'orange', submitted: daysAgo(3).toISOString(), status: 'new', docs: [['Shop & Establishment certificate', 'verified'], ['Owner PAN / Aadhaar', 'verified'], ['FSSAI licence', 'verified']] },
    { id: 'APP-1036', name: 'Fresh Fields Market', category: 'Grocery', city: 'Electronic City, Bengaluru', owner: 'Kavya Reddy', email: 'kavya@freshfields.in', phone: '+91 96320 88123', address: '5, Neeladri Road, Electronic City, Bengaluru 560100', gstin: '29AAFCF5501R1Z0', pan: 'AAFCF5501R', fssai: '11226330000789', cover: unsplash(STORE_PHOTOS['greengrocer-central'], 1200, 400), icon: 'leaf', tone: 'green', submitted: daysAgo(4).toISOString(), status: 'new', docs: [['Shop & Establishment certificate', 'verified'], ['Owner PAN / Aadhaar', 'verified'], ['FSSAI licence', 'verified']] },
  ]
}

export function buildOfferRequests() {
  return [
    { id: 'PRM-221', shopId: 'urban-mart', title: 'Flat ₹100 off on ₹999+', weeks: 2, price: 949, image: productPhoto('detergent', 600), submitted: daysAgo(0).toISOString(), status: 'pending' },
    { id: 'PRM-220', shopId: 'natures-best', title: 'Organic week: 15% off greens', weeks: 4, price: 1799, image: productPhoto('spinach', 600), submitted: daysAgo(0).toISOString(), status: 'pending' },
    { id: 'PRM-219', shopId: 'chai-and-co', title: 'Monsoon chai combo ₹79', weeks: 1, price: 499, image: productPhoto('masala-chai', 600), submitted: daysAgo(1).toISOString(), status: 'pending' },
  ]
}

// ---------- Admin users ----------

export const ADMIN_ROLES = {
  super: { label: 'Super Admin', can: 'Everything, including managing other admins' },
  admin: { label: 'Admin', can: 'Shops, users, approvals and transactions' },
  support: { label: 'Support', can: 'View shops and orders, reply to tickets' },
}

export const DEFAULT_ADMINS = [
  { id: 'adm-1', name: 'Vikram Rao', email: 'vikram@fastgrab.in', role: 'super', status: 'active', lastActive: daysAgo(0).toISOString(), color: '#c8ecd9' },
  { id: 'adm-2', name: 'Sara Thomas', email: 'sara@fastgrab.in', role: 'admin', status: 'active', lastActive: daysAgo(1).toISOString(), color: '#bae6fd' },
  { id: 'adm-3', name: 'Imran Shaikh', email: 'imran@fastgrab.in', role: 'support', status: 'active', lastActive: daysAgo(3).toISOString(), color: '#fde68a' },
]

// Front-end only demo sign-in until the API exists. Real admin auth must be
// server-side (hashed passwords, sessions, 2FA). Never ship this to production.
export const DEMO_ADMIN_PASSWORD = 'FastGrab@Admin1'

export const WEEKLY_ORDERS = [
  { label: 'Mon', value: 4120 },
  { label: 'Tue', value: 4680 },
  { label: 'Wed', value: 4390 },
  { label: 'Thu', value: 5210 },
  { label: 'Fri', value: 6040 },
  { label: 'Sat', value: 5480 },
  { label: 'Sun', value: 5620 },
]
