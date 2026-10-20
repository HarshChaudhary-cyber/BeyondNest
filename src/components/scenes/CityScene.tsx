import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'

interface CitySceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const CityScene: React.FC<CitySceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  const cityGroupRef = useRef<THREE.Group>(null)
  const pinRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion) {
      if (cityGroupRef.current) {
        cityGroupRef.current.rotation.y = state.clock.elapsedTime * 0.15
      }
      if (pinRef.current) {
        pinRef.current.position.y = 1.6 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08
      }
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={cityGroupRef} position={[0, -0.6, 0]}>
        {/* Ground Platform Disc */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.2, 48]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
        </mesh>

        {/* Central Park Green Ring */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 2.0, 32]} />
          <meshStandardMaterial color="#CCFBF1" roughness={0.8} />
        </mesh>

        {/* Skyscraper 1 (Tall Modern Tower, Blue Glass) */}
        <mesh position={[0.4, 0.8, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 1.6, 0.5]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Skyscraper 2 (Teal Step Tower) */}
        <mesh position={[-0.5, 0.65, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.3, 0.5]} />
          <meshStandardMaterial color="#0D9488" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Building 3 (Mid-rise Office, Navy) */}
        <mesh position={[-0.4, 0.45, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.9, 0.5]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Building 4 (Residential Block, Warm Cream) */}
        <mesh position={[0.5, 0.4, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.8, 0.6]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
        </mesh>

        {/* Building 5 (Compact Hub) */}
        <mesh position={[0, 0.3, 0.8]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.6, 0.4]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Building 6 (Terraced Low-rise) */}
        <mesh position={[-0.9, 0.25, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshStandardMaterial color="#14B8A6" roughness={0.4} />
        </mesh>

        {/* Stylized Miniature Trees */}
        <group position={[0.1, 0.15, -0.8]}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#10B981" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
        </group>
        <group position={[-0.2, 0.15, -0.7]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#059669" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Floating 3D City Location Pin */}
      <group ref={pinRef} position={[0, 1.6, 0]}>
        {/* Pin Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={THEME_3D.colors.warmAmber} metalness={0.3} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.18, 0.35, 24]} />
          <meshStandardMaterial color={THEME_3D.colors.warmAmber} metalness={0.3} roughness={0.2} />
        </mesh>
        {/* Pin Center Dot */}
        <mesh position={[0, 0, 0.18]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </>
  )
}
