// Brand logos as inline SVGs (lucide-react does not ship brand icons).

export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.74-6-6.2s2.7-6.2 6-6.2c1.88 0 3.14.8 3.86 1.5l2.63-2.54C16.8 3.2 14.62 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.66 0 9.4-3.98 9.4-9.58 0-.64-.07-1.13-.16-1.62H12z"
      />
    </svg>
  )
}

export function AppleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.7.71 2.87.69 1.18-.02 1.93-1.08 2.66-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5zM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.21z" />
    </svg>
  )
}

export function PlayStoreIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.8a1 1 0 0 0-.5.87v16.66a1 1 0 0 0 .5.87l9.2-9.2-9.2-9.2zm10.62 7.78L6.4 1.86l10.94 6.3-2.22 2.42zm0 2.84 2.22 2.42L6.4 22.14l8.72-8.72zm3.6-4.47 2.6 1.5a1 1 0 0 1 0 1.73l-2.6 1.5-2.5-2.37 2.5-2.36z" />
    </svg>
  )
}
