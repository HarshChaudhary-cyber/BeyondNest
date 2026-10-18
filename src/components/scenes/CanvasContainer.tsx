import React, { Suspense, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useDocumentVisibility } from '../../hooks/useDocumentVisibility'
import styles from './CanvasContainer.module.css'

interface CanvasContainerProps {
  children: (props: { paused: boolean; reducedMotion: boolean }) => ReactNode
  fallback: ReactNode
  className?: string
}

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[BeyondNest] 3D Canvas error caught, using fallback:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  fallback,
  className = ''
}) => {
  const hasWebGL = useWebGLSupport()
  const reducedMotion = useReducedMotion()
  const isDocumentVisible = useDocumentVisibility()

  // If WebGL is not supported, immediately return the static fallback
  if (!hasWebGL) {
    return (
      <div className={`${styles.container} ${className}`} aria-hidden="true">
        {fallback}
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${className}`} aria-hidden="true">
      <CanvasErrorBoundary fallback={fallback}>
        <div className={styles.canvasWrapper}>
          <Suspense fallback={
            <div className={styles.loadingFallback}>
              <div className={styles.spinner} />
              <span>Preparing 3D view...</span>
            </div>
          }>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 5.2], fov: 45 }}
              gl={{ 
                antialias: true, 
                alpha: true,
                powerPreference: 'high-performance' 
              }}
              // Frameloop: 'demand' or 'always' paused when document is hidden
              frameloop={isDocumentVisible ? 'always' : 'never'}
            >
              {children({ 
                paused: !isDocumentVisible, 
                reducedMotion 
              })}
            </Canvas>
          </Suspense>
        </div>
      </CanvasErrorBoundary>
    </div>
  )
}
