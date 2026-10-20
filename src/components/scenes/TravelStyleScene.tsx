import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { TravelStyleAnswer } from '../../store/types'

interface TravelStyleSceneProps {
  style?: TravelStyleAnswer
  paused?: boolean
  reducedMotion?: boolean
}

export const TravelStyleScene: React.FC<TravelStyleSceneProps> = ({
  style = 'not_sure',
  paused = false,
  reducedMotion = false
}) => {
  const backpackRef = useRef<THREE.Group>(null)
  const suitcaseRef = useRef<THREE.Group>(null)

  const isBackpackActive = style === 'backpacking' || style === 'mix'
  const isSuitcaseActive = style === 'settling' || style === 'mix'

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion) {
      if (backpackRef.current) {
        const targetY = isBackpackActive ? 0.35 : 0
        backpackRef.current.position.y = THREE.MathUtils.lerp(
          backpackRef.current.position.y,
          targetY + Math.sin(state.clock.elapsedTime * 2) * 0.04,
          0.1
        )
      }
      if (suitcaseRef.current) {
        const targetY = isSuitcaseActive ? 0.35 : 0
        suitcaseRef.current.position.y = THREE.MathUtils.lerp(
          suitcaseRef.current.position.y,
          targetY + Math.cos(state.clock.elapsedTime * 2) * 0.04,
          0.1
        )
      }
    }
  })

  return (
    <>
      <SoftLighting />

      <group position={[0, -0.3, 0]}>
        {/* Hiking Backpack (Left) */}
        <group ref={backpackRef} position={[-0.8, 0, 0]} rotation={[0.05, 0.3, 0]}>
          {/* Main pack body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.4, 1.1, 24]} />
            <meshStandardMaterial 
              color={isBackpackActive ? '#0D9488' : '#64748B'} 
              roughness={0.6} 
            />
          </mesh>
          {/* Front pocket */}
          <mesh position={[0, -0.1, 0.3]} castShadow>
            <boxGeometry args={[0.45, 0.4, 0.2]} />
            <meshStandardMaterial 
              color={isBackpackActive ? '#14B8A6' : '#94A3B8'} 
              roughness={0.5} 
            />
          </mesh>
          {/* Top flap */}
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color={isBackpackActive ? '#0F766E' : '#475569'} />
          </mesh>
          {/* Backpack Straps */}
          <mesh position={[0, 0, -0.3]}>
            <boxGeometry args={[0.4, 0.7, 0.08]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>

          {isBackpackActive && (
            <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.65, 32]} />
              <meshBasicMaterial color={THEME_3D.colors.seaTeal} transparent opacity={0.4} />
            </mesh>
          )}
        </group>

        {/* Rolling Suitcase (Right) */}
        <group ref={suitcaseRef} position={[0.8, 0, 0]} rotation={[-0.05, -0.3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.2, 0.45]} />
            <meshStandardMaterial 
              color={isSuitcaseActive ? '#0284C7' : '#64748B'} 
              roughness={0.3} 
              metalness={0.2} 
            />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.04]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[-0.12, 0.65, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>
          <mesh position={[0.12, 0.65, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>

          {isSuitcaseActive && (
            <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.7, 32]} />
              <meshBasicMaterial color={THEME_3D.colors.skyAtmosphere} transparent opacity={0.4} />
            </mesh>
          )}
        </group>

        {/* Connecting Ribbon when Mix is chosen */}
        {style === 'mix' && (
          <mesh position={[0, 0.5, 0]}>
            <torusGeometry args={[0.8, 0.02, 16, 48]} />
            <meshBasicMaterial color={THEME_3D.colors.warmAmber} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    </>
  )
}
