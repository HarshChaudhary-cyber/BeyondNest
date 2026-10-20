import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { PriorityArea } from '../../store/types'

interface NeighbourhoodPrioritiesSceneProps {
  selectedPriorities?: PriorityArea[]
  paused?: boolean
  reducedMotion?: boolean
}

export const NeighbourhoodPrioritiesScene: React.FC<NeighbourhoodPrioritiesSceneProps> = ({
  selectedPriorities = [],
  paused = false,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const beaconRef = useRef<THREE.Group>(null)

  const hasSelections = selectedPriorities.length > 0

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion) {
      if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.12
      }
      if (beaconRef.current) {
        beaconRef.current.position.y = 1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      }
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={groupRef} position={[0, -0.4, 0]}>
        {/* Neighborhood Ground Platform */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[2.0, 2.1, 0.18, 36]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
        </mesh>

        {/* Winding Cobblestone Pathway */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 1.7, 32]} />
          <meshStandardMaterial color="#CCFBF1" roughness={0.8} />
        </mesh>

        {/* Cottage 1 (Housing / Teal) */}
        <group position={[-0.7, 0.3, 0.4]} rotation={[0, 0.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.5, 0.6]} />
            <meshStandardMaterial color="#0D9488" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.55, 0.35, 4]} />
            <meshStandardMaterial color="#0F766E" roughness={0.5} />
          </mesh>
        </group>

        {/* Cottage 2 (Community / Blue) */}
        <group position={[0.7, 0.35, 0.3]} rotation={[0, -0.4, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.65, 0.6, 0.65]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.6, 0.4, 4]} />
            <meshStandardMaterial color="#0369A1" roughness={0.5} />
          </mesh>
        </group>

        {/* Town Hall / Hub (Back) */}
        <group position={[0, 0.4, -0.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.7, 0.6]} />
            <meshStandardMaterial color="#1E293B" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.65, 0.45, 4]} />
            <meshStandardMaterial color={THEME_3D.colors.warmAmber} roughness={0.4} />
          </mesh>
        </group>

        {/* Neighborhood Trees */}
        <group position={[-0.3, 0.25, 0.8]}>
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#10B981" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
        </group>

        {/* Priority Beacon Floating Above */}
        <group ref={beaconRef} position={[0, 1.3, 0]}>
          <mesh castShadow>
            <octahedronGeometry args={[0.22]} />
            <meshStandardMaterial 
              color={hasSelections ? THEME_3D.colors.warmAmber : THEME_3D.colors.seaTeal} 
              metalness={0.7} 
              roughness={0.2} 
            />
          </mesh>
          {/* Beacon Glow Pulse */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.55, 24]} />
            <meshBasicMaterial 
              color={hasSelections ? '#F59E0B' : '#14B8A6'} 
              transparent 
              opacity={0.5} 
            />
          </mesh>
        </group>
      </group>
    </>
  )
}
