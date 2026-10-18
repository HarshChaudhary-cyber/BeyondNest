import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import type { JourneyStage } from '../../store/types'

interface JourneyPathSceneProps {
  selectedStage?: JourneyStage
  paused?: boolean
  reducedMotion?: boolean
}

const STAGE_ORDER: JourneyStage[] = [
  'exploring',
  'preparing_apps',
  'accepted_offer',
  'preparing_leave',
  'already_abroad'
]

// 3D coordinates for each of the 5 milestone stations
const MILESTONE_POINTS: [number, number, number][] = [
  [-2.2, -1.0, 0.4],
  [-1.1, -0.3, 0.1],
  [0.0, 0.3, -0.2],
  [1.1, 0.8, 0.1],
  [2.2, 1.4, 0.4]
]

// 3D Traveller Figurine
const TravellerMarker: React.FC<{
  targetIndex: number
  paused: boolean
  reducedMotion: boolean
}> = ({ targetIndex, paused, reducedMotion }) => {
  const travellerRef = useRef<THREE.Group>(null)
  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...MILESTONE_POINTS[0]))

  useFrame((state, delta) => {
    if (paused) return
    const marker = travellerRef.current
    if (!marker) return

    const clampedIndex = Math.max(0, Math.min(targetIndex, MILESTONE_POINTS.length - 1))
    const targetPos = new THREE.Vector3(...MILESTONE_POINTS[clampedIndex])
    // Elevated slightly above the milestone pedestal
    targetPos.y += 0.55

    const lerpSpeed = reducedMotion ? 1 : Math.min(delta * 4.5, 0.2)
    currentPosRef.current.lerp(targetPos, lerpSpeed)
    marker.position.copy(currentPosRef.current)

    // Gentle bobbing bounce
    if (!reducedMotion) {
      marker.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.04
      marker.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
  })

  return (
    <group ref={travellerRef} position={[...MILESTONE_POINTS[0]]}>
      {/* Explorer Hat */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.04, 16]} />
        <meshStandardMaterial color="#B45309" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#B45309" roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#FFE4E6" roughness={0.4} />
      </mesh>

      {/* Torso / Teal Travel Parka */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.32, 16]} />
        <meshStandardMaterial color="#0D9488" roughness={0.5} />
      </mesh>

      {/* Backpack on back */}
      <mesh position={[0, 0.26, -0.16]} castShadow>
        <boxGeometry args={[0.2, 0.26, 0.14]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>

      {/* Walking Staff in hand */}
      <mesh position={[0.22, 0.22, 0.08]} rotation={[0.1, 0, -0.1]}>
        <cylinderGeometry args={[0.015, 0.015, 0.65, 8]} />
        <meshStandardMaterial color="#D97706" />
      </mesh>
    </group>
  )
}

export const JourneyPathScene: React.FC<JourneyPathSceneProps> = ({
  selectedStage,
  paused = false,
  reducedMotion = false
}) => {
  const activeIndex = useMemo(() => {
    if (!selectedStage) return 0
    const idx = STAGE_ORDER.indexOf(selectedStage)
    return idx >= 0 ? idx : 0
  }, [selectedStage])

  // Generate smooth 3D pathway curve
  const curve = useMemo(() => {
    const points = MILESTONE_POINTS.map(p => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2)
  }, [])

  const pathLineGeometry = useMemo(() => {
    const sampled = curve.getPoints(80)
    return new THREE.BufferGeometry().setFromPoints(sampled)
  }, [curve])

  return (
    <>
      <SoftLighting />

      <group position={[0, 0, 0]}>
        {/* Curved Path Trail */}
        {/* @ts-expect-error Three line JSX */}
        <line geometry={pathLineGeometry}>
          <lineBasicMaterial color="#38BDF8" linewidth={3} transparent opacity={0.7} />
        </line>

        {/* 5 Milestone Pedestals & Markers */}
        {MILESTONE_POINTS.map((pos, idx) => {
          const isReached = idx <= activeIndex
          const isCurrent = idx === activeIndex

          return (
            <group key={idx} position={pos}>
              {/* Stepping Stone Pedestal */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <cylinderGeometry args={[0.42, 0.46, 0.14, 20]} />
                <meshStandardMaterial 
                  color={isCurrent ? '#14B8A6' : isReached ? '#CCFBF1' : '#F1F5F9'} 
                  roughness={0.4}
                  emissive={isCurrent ? '#0D9488' : '#000000'}
                  emissiveIntensity={isCurrent ? 0.35 : 0}
                />
              </mesh>

              {/* Milestone Pillar / Pin */}
              <mesh position={[0, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.35, 12]} />
                <meshStandardMaterial color={isCurrent ? '#0D9488' : '#94A3B8'} />
              </mesh>

              {/* Numbered / Glowing Top Bead */}
              <mesh position={[0, 0.42, 0]} castShadow>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshStandardMaterial 
                  color={isCurrent ? '#F59E0B' : isReached ? '#0D9488' : '#CBD5E1'} 
                  roughness={0.2}
                  metalness={0.4}
                />
              </mesh>
            </group>
          )
        })}

        {/* Animated Traveller Figurine gliding to selected stage */}
        <TravellerMarker 
          targetIndex={activeIndex} 
          paused={paused} 
          reducedMotion={reducedMotion} 
        />
      </group>
    </>
  )
}
