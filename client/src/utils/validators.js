// Client-side validation helpers. The server must validate again.

const clean = (v) => String(v ?? '').trim()

export const isRequired = (v) => clean(v).length > 0

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v))

/** Indian mobile number: 10 digits starting 6-9, optional +91 / 0 prefix. */
export const isIndianPhone = (v) =>
  /^[6-9]\d{9}$/.test(clean(v).replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))

/** At least 8 characters, one number and one symbol. */
export const isStrongPassword = (v) =>
  String(v).length >= 8 && /\d/.test(v) && /[^A-Za-z0-9]/.test(v)

export const isPincode = (v) => /^[1-9]\d{5}$/.test(clean(v))

/** GSTIN, e.g. 29ABCDE1234F1Z5 */
export const isGstin = (v) =>
  /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(clean(v).toUpperCase())

/** PAN, e.g. ABCDE1234F */
export const isPan = (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(clean(v).toUpperCase())

/** FSSAI licence / registration number: 14 digits */
export const isFssai = (v) => /^\d{14}$/.test(clean(v))

/** IFSC, e.g. HDFC0001234 */
export const isIfsc = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean(v).toUpperCase())

/** Bank account number: 9 to 18 digits */
export const isAccountNumber = (v) => /^\d{9,18}$/.test(clean(v))

/** UPI ID, e.g. shopname@okhdfcbank */
export const isUpiId = (v) => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(clean(v))
