import { useEffect, useState } from 'react'

/**
 * useState that also saves to localStorage (per browser only).
 * Falls back to plain in-memory state if storage is blocked.
 */
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored)
    } catch {
      // storage unavailable or corrupt: use the default
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [key, value])

  return [value, setValue]
}
