import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { PlannedDurationAnswer } from '../../store/types'

interface TimelineSceneProps {
  duration?: PlannedDurationAnswer
  paused?: boolean
  reducedMotion?: boolean
}

const DURATION_TARGET_X: Record<string, number> = {
  under_6_months: -1.2,
  '6_to_12_months': -0.4,
  '1_to_2_years': 0.4,
  more_than_2_years: 1.2,
  not_sure: 0
}

export const TimelineScene: React.FC<TimelineSceneProps> = ({
  duration = 'not_sure',
  paused = false,
  reducedMotion = false
}) => {
  const markerRef = useRef<THREE.Group>(null)
  const targetX = DURATION_TARGET_X[duration] ?? 0

  useFrame((_, delta) => {
    if (paused) return
    if (markerRef.current) {
      if (reducedMotion) {
        markerRef.current.position.x = targetX
      } else {
        // Smooth lerp to target position
        markerRef.current.position.x = THREE.MathUtils.lerp(
          markerRef.current.position.x,
          targetX,
          Math.min(1, delta * 5)
        )
      }
    }
  })

  return (
    <>
      <SoftLighting />

      <group position={[0, -0.2, 0]}>
        {/* Horizontal Timeline Track Bar */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.12, 0.25]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
        </mesh>

        {/* Milestone Node Pedestals */}
        {[-1.2, -0.4, 0.4, 1.2].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.12, 0.14, 0.1, 24]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.28, 0.35, 0.05]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Active Moving Marker Figurine / Beacon */}
        <group ref={markerRef} position={[targetX, 0.2, 0]}>
          {/* Glowing Base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.12, 32]} />
            <meshStandardMaterial color={THEME_3D.colors.seaTeal} roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Milestone Pin Top */}
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial color={THEME_3D.colors.warmAmber} metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Pulse Ring */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.36, 32]} />
            <meshBasicMaterial color={THEME_3D.colors.seaTeal} transparent opacity={0.5} />
          </mesh>
        </group>
      </group>
    </>
  )
}
