// Formatting helpers shared across the app.

/** ₹1,234 or ₹49.50 */
export const formatPrice = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

/** Local date as YYYY-MM-DD (avoids UTC shifting from toISOString). */
export function isoDate(date = new Date()) {
  const d = new Date(date)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** Parse YYYY-MM-DD as a local date. */
export function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** "Today, 10 Nov" / "Tomorrow, 11 Nov" / "Sat, 14 Nov" */
export function dayLabel(isoOrDate) {
  const d = typeof isoOrDate === 'string' && isoOrDate.length === 10 ? parseIsoDate(isoOrDate) : new Date(isoOrDate)
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000)
  const short = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  if (diff === 0) return `Today, ${short}`
  if (diff === 1) return `Tomorrow, ${short}`
  if (diff === -1) return `Yesterday, ${short}`
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** "13:52" */
export const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

/** "10 Nov 2026" */
export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** "Tue, 10 Nov 2026 at 13:52" */
export const dateTimeLabel = (iso) =>
  `${new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} at ${timeOf(iso)}`

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/** "just now", "12 min ago", "3 h ago", "2 d ago". Pass `now` from state to keep renders pure. */
export function timeAgo(iso, now) {
  const mins = Math.round((now - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`
  return `${Math.round(mins / 1440)} d ago`
}

/** Minutes from now until `iso` (negative if in the past). */
export const minutesUntil = (iso, now) => Math.round((new Date(iso).getTime() - now) / 60000)

/** ₹2.8L / ₹48.2k style short amounts for chart labels. */
export function compactPrice(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k`
  return `₹${n}`
}
