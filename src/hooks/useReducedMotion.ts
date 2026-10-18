import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (typeof (mediaQuery as unknown as { addListener?: (fn: unknown) => void }).addListener === 'function') {
      const legacy = mediaQuery as unknown as { 
        addListener: (fn: (e: MediaQueryListEvent) => void) => void
        removeListener: (fn: (e: MediaQueryListEvent) => void) => void 
      }
      legacy.addListener(handleChange)
      return () => legacy.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}
