import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { GlobeMesh } from './shared/GlobeMesh'
import { TravelRoute } from './shared/TravelRoute'
import { latLonToVector3, calculateGlobeTargetQuaternion } from './shared/coordinates'
import { THEME_3D } from '../../config/theme3d'
import type { CountryInfo, DestinationCountryAnswer } from '../../store/types'

interface DestinationGlobeSceneProps {
  originCountry?: CountryInfo
  destinationCountry?: DestinationCountryAnswer
  isAlreadyAbroad?: boolean
  originAbroad?: CountryInfo
  paused?: boolean
  reducedMotion?: boolean
}

const GLOBE_RADIUS = 1.8

const DestinationPin: React.FC<{
  position: THREE.Vector3
  color: string
  reducedMotion?: boolean
}> = ({ position, color, reducedMotion }) => {
  const pulseRef = useRef<THREE.Mesh>(null)

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
    <group position={position} quaternion={orientationQuaternion}>
      <mesh ref={pulseRef} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.08, 0.16, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.05, 0.3, 12]} />
        <meshStandardMaterial color={THEME_3D.colors.warmWhite} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

export const DestinationGlobeScene: React.FC<DestinationGlobeSceneProps> = ({
  originCountry,
  destinationCountry,
  isAlreadyAbroad = false,
  originAbroad,
  paused = false,
  reducedMotion = false
}) => {
  // Determine origin coordinates:
  // If already abroad and originAbroad is provided, use originAbroad.
  // If preparing to move, use originCountry.
  const origin = isAlreadyAbroad ? originAbroad : originCountry

  const isExplore = Boolean(destinationCountry && 'explore' in destinationCountry && destinationCountry.explore)
  const destination = destinationCountry && !('explore' in destinationCountry && destinationCountry.explore) && 'code' in destinationCountry
    ? (destinationCountry as CountryInfo)
    : undefined

  // Determine target coordinates to face the camera:
  // Prioritize destination, or origin if destination is not yet chosen
  const targetQuaternion = useMemo(() => {
    if (destination) {
      return calculateGlobeTargetQuaternion(destination.lat, destination.lon)
    }
    if (origin) {
      return calculateGlobeTargetQuaternion(origin.lat, origin.lon)
    }
    return null
  }, [destination, origin])

  // Compute 3D surface coordinates for pins
  const originPos = useMemo(() => {
    if (!origin) return null
    return latLonToVector3(origin.lat, origin.lon, GLOBE_RADIUS)
  }, [origin])

  const destPos = useMemo(() => {
    if (!destination) return null
    return latLonToVector3(destination.lat, destination.lon, GLOBE_RADIUS)
  }, [destination])

  // Can draw route if both origin and destination are known and distinct
  const canDrawRoute = Boolean(
    origin && destination && (origin.code !== destination.code)
  )

  return (
    <>
      <SoftLighting />

      <GlobeMesh
        radius={GLOBE_RADIUS}
        targetQuaternion={targetQuaternion || undefined}
        paused={paused}
        reducedMotion={reducedMotion}
      >
        {/* Origin Pin (Teal) */}
        {originPos && (
          <DestinationPin
            position={originPos}
            color={THEME_3D.colors.seaTeal}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Destination Pin (Amber) */}
        {destPos && (
          <DestinationPin
            position={destPos}
            color={THEME_3D.colors.warmAmber}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Co-transformed Curved Flight Route */}
        {canDrawRoute && origin && destination && (
          <TravelRoute
            startLat={origin.lat}
            startLon={origin.lon}
            endLat={destination.lat}
            endLon={destination.lon}
            globeRadius={GLOBE_RADIUS}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        )}
      </GlobeMesh>

      {/* Floating Exploration Ring when exploring */}
      {isExplore && (
        <group position={[0, 0, 0]} rotation={[0.4, 0.3, 0]}>
          <mesh>
            <torusGeometry args={[GLOBE_RADIUS + 0.3, 0.02, 16, 64]} />
            <meshBasicMaterial color={THEME_3D.colors.seaTeal} transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </>
  )
}
