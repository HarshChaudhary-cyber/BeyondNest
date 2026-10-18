import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { latLonToVector3 } from './coordinates'
import { AirplaneMesh } from './AirplaneMesh'

interface TravelRouteProps {
  startLat: number
  startLon: number
  endLat: number
  endLon: number
  globeRadius: number
  paused?: boolean
  reducedMotion?: boolean
}

export const TravelRoute: React.FC<TravelRouteProps> = ({
  startLat,
  startLon,
  endLat,
  endLon,
  globeRadius,
  paused = false,
  reducedMotion = false
}) => {
  const planeRef = useRef<THREE.Group>(null)
  const progressRef = useRef<number>(0.2)

  const { curve, routePoints } = useMemo(() => {
    const vStart = latLonToVector3(startLat, startLon, globeRadius)
    const vEnd = latLonToVector3(endLat, endLon, globeRadius)

    // Compute arched midpoint elevated above surface
    const vMid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5)
    // Distance between endpoints affects arch height
    const dist = vStart.distanceTo(vEnd)
    const archHeight = globeRadius + Math.max(0.6, dist * 0.35)
    vMid.normalize().multiplyScalar(archHeight)

    const quadraticCurve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd)
    const points = quadraticCurve.getPoints(50)

    return { curve: quadraticCurve, routePoints: points }
  }, [startLat, startLon, endLat, endLon, globeRadius])

  // Route line geometry
  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(routePoints)
  }, [routePoints])

  useFrame((_, delta) => {
    if (paused) return
    const plane = planeRef.current
    if (!plane) return

    if (!reducedMotion) {
      progressRef.current = (progressRef.current + delta * 0.12) % 1
    }

    const t = progressRef.current
    const pos = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)

    plane.position.copy(pos)

    // Align airplane with flight vector
    const matrix = new THREE.Matrix4()
    // Normal vector perpendicular to surface
    const up = pos.clone().normalize()
    matrix.lookAt(pos, pos.clone().add(tangent), up)
    plane.quaternion.setFromRotationMatrix(matrix)
    // Rotate 90deg so nose faces flight direction (our airplane is oriented along Y)
    plane.rotateX(Math.PI / 2)
  })

  return (
    <group>
      {/* Flight Path Arc Line */}
      {/* @ts-expect-error Three line JSX element */}
      <line geometry={lineGeometry}>
        <lineDashedMaterial 
          color="#38BDF8" 
          dashSize={0.15} 
          gapSize={0.08} 
          linewidth={2} 
          transparent 
          opacity={0.85} 
        />
      </line>

      {/* Start Location Glowing Pin */}
      <mesh position={routePoints[0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#14B8A6" />
      </mesh>

      {/* End Location Glowing Pin */}
      <mesh position={routePoints[routePoints.length - 1]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>

      {/* Travelling Airplane */}
      <group ref={planeRef}>
        <AirplaneMesh scale={0.15} />
      </group>
    </group>
  )
}
