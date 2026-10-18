import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { GlobeMesh } from './shared/GlobeMesh'
import { latLonToVector3, calculateGlobeTargetQuaternion } from './shared/coordinates'
import { THEME_3D } from '../../config/theme3d'
import type { CountryInfo } from '../../store/types'

interface CountryGlobeSceneProps {
  selectedCountry?: CountryInfo
  paused?: boolean
  reducedMotion?: boolean
}

// 3D Country Location Pin — Rendered inside the globe's geographic transform
const CountryPin: React.FC<{
  position: THREE.Vector3
  countryName: string
  countryCode: string
  reducedMotion: boolean
}> = ({ position, reducedMotion }) => {
  const pinGroupRef = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)

  // Align the pin perpendicular to the sphere surface
  const orientationQuaternion = useMemo(() => {
    const normal = position.clone().normalize()
    const up = new THREE.Vector3(0, 1, 0)
    return new THREE.Quaternion().setFromUnitVectors(up, normal)
  }, [position])

  useFrame((state) => {
    if (pulseRef.current && !reducedMotion) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.25
      pulseRef.current.scale.set(s, 1, s)
    }
  })

  return (
    <group ref={pinGroupRef} position={position} quaternion={orientationQuaternion}>
      {/* Ground Pulse Ring on the globe surface */}
      <mesh ref={pulseRef} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.08, 0.16, 24]} />
        <meshBasicMaterial 
          color={THEME_3D.colors.skyAtmosphere} 
          transparent 
          opacity={0.7} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Pin Needle Shaft */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.05, 0.3, 12]} />
        <meshStandardMaterial 
          color={THEME_3D.colors.warmWhite} 
          metalness={0.6} 
          roughness={0.2} 
        />
      </mesh>

      {/* Pin Head */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial 
          color={THEME_3D.colors.pinRed} 
          roughness={0.2} 
          metalness={0.3}
          emissive={THEME_3D.colors.pinRedEmissive}
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  )
}

export const CountryGlobeScene: React.FC<CountryGlobeSceneProps> = ({
  selectedCountry,
  paused = false,
  reducedMotion = false
}) => {
  const globeRadius = 2.0

  const targetQuaternion = useMemo(() => {
    if (!selectedCountry) return undefined
    return calculateGlobeTargetQuaternion(selectedCountry.lat, selectedCountry.lon)
  }, [selectedCountry])

  const pinPosition = useMemo(() => {
    if (!selectedCountry) return null
    return latLonToVector3(selectedCountry.lat, selectedCountry.lon, globeRadius)
  }, [selectedCountry, globeRadius])

  return (
    <>
      <SoftLighting />

      {/* GlobeMesh containing the pin inside the same geographic transform */}
      <GlobeMesh
        radius={globeRadius}
        autoRotate={!selectedCountry && !reducedMotion}
        rotationSpeed={0.002}
        targetQuaternion={targetQuaternion}
        paused={paused}
        reducedMotion={reducedMotion}
      >
        {pinPosition && selectedCountry && (
          <CountryPin 
            position={pinPosition} 
            countryName={selectedCountry.name}
            countryCode={selectedCountry.code}
            reducedMotion={reducedMotion}
          />
        )}
      </GlobeMesh>
    </>
  )
}
