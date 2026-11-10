import { isoDate } from './format.js'

// Pickup slot helpers. Slots respect opening hours and the shop's prep time.
// "Full" slots are faked deterministically until the API provides capacity.

export const SLOT_LENGTH = 15

const toMins = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

export const addMinutes = (hhmm, n) => toHHMM(toMins(hhmm) + n)

/** "14:30 – 14:45" */
export const slotLabel = (time, length = SLOT_LENGTH) => `${time} – ${addMinutes(time, length)}`

function hash(str) {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** All slots for a store on a given date, each marked available / full / past. */
export function getSlots(store, dateIso, now = new Date()) {
  const isToday = dateIso === isoDate(now)
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + store.prepMins : -1
  const slots = []
  for (let t = toMins(store.open) + store.prepMins; t + SLOT_LENGTH <= toMins(store.close); t += SLOT_LENGTH) {
    const time = toHHMM(t)
    let status = 'available'
    if (t < earliest) status = 'past'
    else if (hash(store.id + dateIso + time) % 6 === 0) status = 'full'
    slots.push({ time, status })
  }
  return slots
}

/** First bookable slot in the next 3 days, or null. */
export function nextAvailableSlot(store, now = new Date()) {
  for (let offset = 0; offset < 3; offset++) {
    const day = new Date(now)
    day.setDate(now.getDate() + offset)
    const date = isoDate(day)
    const slot = getSlots(store, date, now).find((s) => s.status === 'available')
    if (slot) return { date, time: slot.time, dayOffset: offset }
  }
  return null
}

/** Short label for cards: "14:30" today, "Tmrw 08:15" otherwise. */
export function nextSlotShort(store) {
  const next = nextAvailableSlot(store)
  if (!next) return 'Unavailable'
  return next.dayOffset === 0 ? next.time : `Tmrw ${next.time}`
}

/** Next N dates (YYYY-MM-DD) starting today. */
export function upcomingDates(count = 4, now = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    return isoDate(d)
  })
}
