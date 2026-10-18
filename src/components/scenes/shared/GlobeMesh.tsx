import React, { useRef, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getOrCreateGlobeTexture } from './GlobeTexture'
import { THEME_3D } from '../../../config/theme3d'

interface GlobeMeshProps {
  radius?: number
  autoRotate?: boolean
  rotationSpeed?: number
  targetQuaternion?: THREE.Quaternion
  targetRotation?: { x: number; y: number }
  paused?: boolean
  reducedMotion?: boolean
  children?: ReactNode
}

export const GlobeMesh: React.FC<GlobeMeshProps> = ({
  radius = 2,
  autoRotate = true,
  rotationSpeed = 0.003,
  targetQuaternion,
  targetRotation,
  paused = false,
  reducedMotion = false,
  children,
}) => {
  const globeGroupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  const texture = useMemo(() => getOrCreateGlobeTexture(), [])

  // Derive target quaternion if Euler angles were passed
  const effectiveTargetQuat = useMemo(() => {
    if (targetQuaternion) return targetQuaternion
    if (targetRotation) {
      return new THREE.Quaternion().setFromEuler(
        new THREE.Euler(targetRotation.x, targetRotation.y, 0, 'YXZ')
      )
    }
    return undefined
  }, [targetQuaternion, targetRotation])

  useFrame((_, delta) => {
    if (paused) return
    const group = globeGroupRef.current
    if (!group) return

    if (effectiveTargetQuat) {
      if (reducedMotion) {
        group.quaternion.copy(effectiveTargetQuat)
      } else {
        // Slerp along shortest geodesic path without 360-degree spins
        group.quaternion.slerp(effectiveTargetQuat, Math.min(delta * 4.5, 0.2))
      }
    } else if (autoRotate && !reducedMotion) {
      group.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), rotationSpeed)
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
          roughness={THEME_3D.materials.globeRoughness} 
          metalness={THEME_3D.materials.globeMetalness} 
        />
      </mesh>

      {/* 2. Soft Cloud Sphere */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
        <meshStandardMaterial 
          color={THEME_3D.colors.pureWhite}
          transparent
          opacity={THEME_3D.materials.cloudsOpacity}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Atmospheric Halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.07, 32, 32]} />
        <meshBasicMaterial
          color={THEME_3D.colors.skyAtmosphere}
          transparent
          opacity={THEME_3D.materials.atmosphereHaloOpacity}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Children attached to the globe's rotating geographic transform (e.g. location pin) */}
      {children}
    </group>
  )
}
