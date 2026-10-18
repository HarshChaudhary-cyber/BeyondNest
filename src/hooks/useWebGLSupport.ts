import { useState } from 'react'

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function useWebGLSupport(): boolean {
  const [hasWebGL] = useState<boolean>(() => checkWebGLSupport())
  return hasWebGL
}
