import { useState } from 'react'

/**
 * Lazy-loaded photo that falls back to an icon/emoji if the image is
 * missing or fails to load (offline, blocked CDN, etc.).
 */
function Photo({ src, alt = '', className = '', fallback = null }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <span className={`photo photo--fallback ${className}`.trim()}>{fallback}</span>
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`photo ${className}`.trim()}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

export default Photo
