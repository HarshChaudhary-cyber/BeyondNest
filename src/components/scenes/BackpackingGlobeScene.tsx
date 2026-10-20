import React, { useMemo } from 'react'
import * as THREE from 'three'
import { SoftLighting } from './shared/SoftLighting'
import { GlobeMesh } from './shared/GlobeMesh'
import { TravelRoute } from './shared/TravelRoute'
import { latLonToVector3, calculateGlobeTargetQuaternion } from './shared/coordinates'
import { THEME_3D } from '../../config/theme3d'
import type { BackpackingDestinationsAnswer } from '../../store/types'

interface BackpackingGlobeSceneProps {
  backpacking?: BackpackingDestinationsAnswer
  paused?: boolean
  reducedMotion?: boolean
}

const GLOBE_RADIUS = 1.8

const BackpackingPin: React.FC<{
  position: THREE.Vector3
  index: number
}> = ({ position, index }) => {
  const orientationQuaternion = useMemo(() => {
    const normal = position.clone().normalize()
    const up = new THREE.Vector3(0, 1, 0)
    return new THREE.Quaternion().setFromUnitVectors(up, normal)
  }, [position])

  return (
    <group position={position} quaternion={orientationQuaternion}>
      <mesh position={[0, 0.02, 0]}>
        <ringGeometry args={[0.06, 0.14, 24]} />
        <meshBasicMaterial color={index === 0 ? '#14B8A6' : '#F59E0B'} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.3, 12]} />
        <meshStandardMaterial color={THEME_3D.colors.warmWhite} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={index === 0 ? '#0D9488' : '#F59E0B'} />
      </mesh>
    </group>
  )
}

export const BackpackingGlobeScene: React.FC<BackpackingGlobeSceneProps> = ({
  backpacking,
  paused = false,
  reducedMotion = false
}) => {
  const destinations = useMemo(() => backpacking?.destinations || [], [backpacking?.destinations])
  const lastDest = destinations[destinations.length - 1]

  const targetQuaternion = useMemo(() => {
    if (lastDest) {
      return calculateGlobeTargetQuaternion(lastDest.lat, lastDest.lon)
    }
    return null
  }, [lastDest])

  // Pairs of consecutive stops
  const routeSegments = useMemo(() => {
    const segments: Array<{ start: (typeof destinations)[0]; end: (typeof destinations)[0] }> = []
    for (let i = 0; i < destinations.length - 1; i++) {
      segments.push({ start: destinations[i], end: destinations[i + 1] })
    }
    return segments
  }, [destinations])

  return (
    <>
      <SoftLighting />

      <GlobeMesh
        radius={GLOBE_RADIUS}
        targetQuaternion={targetQuaternion || undefined}
        paused={paused}
        reducedMotion={reducedMotion}
      >
        {/* Numbered Route Destination Pins */}
        {destinations.map((dest, i) => {
          const pos = latLonToVector3(dest.lat, dest.lon, GLOBE_RADIUS)
          return (
            <BackpackingPin
              key={`${dest.code}-${i}`}
              position={pos}
              index={i}
            />
          )
        })}

        {/* Arched connecting flight segments */}
        {routeSegments.map((seg, i) => (
          <TravelRoute
            key={`route-${seg.start.code}-${seg.end.code}-${i}`}
            startLat={seg.start.lat}
            startLon={seg.start.lon}
            endLat={seg.end.lat}
            endLon={seg.end.lon}
            globeRadius={GLOBE_RADIUS}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        ))}
      </GlobeMesh>
    </>
  )
}
