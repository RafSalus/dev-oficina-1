import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 860px)'

function readMatch() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(readMatch)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const handleChange = (event) => setIsMobile(event.matches)

    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
      return () => mql.removeEventListener('change', handleChange)
    }

    mql.addListener(handleChange)
    return () => mql.removeListener(handleChange)
  }, [])

  return isMobile
}
