import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { CompanionsAnswer } from '../../store/types'

interface CompanionsSceneProps {
  companions?: CompanionsAnswer
  paused?: boolean
  reducedMotion?: boolean
}

const Figurine: React.FC<{
  position: [number, number, number]
  scale?: number
  color?: string
  backpackColor?: string
}> = ({ position, scale = 1, color = '#0D9488', backpackColor = '#F59E0B' }) => {
  return (
    <group position={position} scale={scale}>
      {/* Head */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.65, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Backpack on Figure */}
      <mesh position={[0, 0.28, -0.22]} castShadow>
        <boxGeometry args={[0.26, 0.35, 0.16]} />
        <meshStandardMaterial color={backpackColor} roughness={0.5} />
      </mesh>
      {/* Ground Shadow Disc */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color="#CBD5E1" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export const CompanionsScene: React.FC<CompanionsSceneProps> = ({
  companions = 'solo',
  paused = false,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && groupRef.current) {
      groupRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.04
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={groupRef} position={[0, -0.3, 0]}>
        {/* Base Grass Platform */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <cylinderGeometry args={[1.8, 1.9, 0.15, 32]} />
          <meshStandardMaterial color="#CCFBF1" roughness={0.8} />
        </mesh>

        {/* 1. Solo */}
        {companions === 'solo' && (
          <Figurine position={[0, 0, 0]} color={THEME_3D.colors.seaTeal} />
        )}

        {/* 2. Partner */}
        {companions === 'partner' && (
          <>
            <Figurine position={[-0.45, 0, 0]} color={THEME_3D.colors.seaTeal} backpackColor="#0284C7" />
            <Figurine position={[0.45, 0, 0]} color="#0284C7" backpackColor="#F59E0B" />
          </>
        )}

        {/* 3. Family */}
        {companions === 'family' && (
          <>
            <Figurine position={[-0.7, 0, 0]} color={THEME_3D.colors.seaTeal} />
            <Figurine position={[0, 0, 0.2]} scale={0.7} color="#E11D48" backpackColor="#14B8A6" />
            <Figurine position={[0.7, 0, 0]} color="#0284C7" />
          </>
        )}

        {/* 4. Friends */}
        {companions === 'friends' && (
          <>
            <Figurine position={[-0.75, 0, 0]} color={THEME_3D.colors.seaTeal} />
            <Figurine position={[0, 0, 0.2]} color="#0284C7" />
            <Figurine position={[0.75, 0, 0]} color="#F59E0B" backpackColor="#0D9488" />
          </>
        )}
      </group>
    </>
  )
}
