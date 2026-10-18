import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getOrCreateGlobeTexture } from './GlobeTexture'

interface GlobeMeshProps {
  radius?: number
  autoRotate?: boolean
  rotationSpeed?: number
  targetRotation?: { x: number; y: number }
  paused?: boolean
  reducedMotion?: boolean
}

export const GlobeMesh: React.FC<GlobeMeshProps> = ({
  radius = 2,
  autoRotate = true,
  rotationSpeed = 0.003,
  targetRotation,
  paused = false,
  reducedMotion = false,
}) => {
  const globeGroupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  const texture = useMemo(() => getOrCreateGlobeTexture(), [])

  useFrame((_, delta) => {
    if (paused) return
    const group = globeGroupRef.current
    if (!group) return

    if (targetRotation) {
      // Smoothly interpolate toward target lat/lon rotation
      const lerpFactor = reducedMotion ? 1 : Math.min(delta * 4, 0.15)
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.x, lerpFactor)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotation.y, lerpFactor)
    } else if (autoRotate && !reducedMotion) {
      group.rotation.y += rotationSpeed
    }

    if (cloudsRef.current && !reducedMotion && !paused) {
      cloudsRef.current.rotation.y += rotationSpeed * 1.3
    }
  })

  return (
    <group ref={globeGroupRef}>
      {/* 1. Main Globe Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.65} 
          metalness={0.15} 
        />
      </mesh>

      {/* 2. Soft Cloud Sphere */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          transparent
          opacity={0.18}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Atmospheric Halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.07, 32, 32]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
