import { createContext, useContext } from 'react'

export const PlatformContext = createContext(null)

/** Platform-wide state: partner shops, applications, commission payments and admins. */
export function usePlatform() {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform must be used inside <PlatformProvider>')
  return ctx
}
