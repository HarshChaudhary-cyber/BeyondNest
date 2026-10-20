import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { GlobeMesh } from './shared/GlobeMesh'
import { THEME_3D } from '../../config/theme3d'
import type { CitizenshipAnswer } from '../../store/types'

interface CitizenshipSceneProps {
  citizenship?: CitizenshipAnswer
  paused?: boolean
  reducedMotion?: boolean
}

export const CitizenshipScene: React.FC<CitizenshipSceneProps> = ({
  citizenship,
  paused = false,
  reducedMotion = false
}) => {
  const passportGroupRef = useRef<THREE.Group>(null)
  const isSelected = Boolean(citizenship?.skipped || (citizenship?.codes && citizenship.codes.length > 0))

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && passportGroupRef.current) {
      // Gentle floating levitation
      passportGroupRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.06
      passportGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1 - 0.2
    }
  })

  return (
    <>
      <SoftLighting />

      {/* Background Globe on the left/center */}
      <group position={[-0.8, -0.2, -0.5]}>
        <GlobeMesh radius={1.4} paused={paused} reducedMotion={reducedMotion} />
      </group>

      {/* Floating 3D Passport beside the globe on the right */}
      <group ref={passportGroupRef} position={[1.0, 0.1, 0.6]} rotation={[0.1, -0.3, 0.15]}>
        {/* Passport Leather Cover */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.25, 0.08]} />
          <meshStandardMaterial 
            color={isSelected ? '#0F172A' : '#1E293B'} 
            roughness={0.4} 
            metalness={0.2} 
          />
        </mesh>

        {/* Paper Page Edge */}
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.84, 1.2, 0.06]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.8} />
        </mesh>

        {/* Golden Emblem on Passport Front */}
        <mesh position={[0, 0.15, 0.045]}>
          <cylinderGeometry args={[0.18, 0.18, 0.01, 24]} />
          <meshStandardMaterial 
            color={THEME_3D.colors.warmAmber} 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>

        {/* Gold Title Bars */}
        <mesh position={[0, 0.42, 0.045]}>
          <boxGeometry args={[0.45, 0.04, 0.01]} />
          <meshStandardMaterial color={THEME_3D.colors.warmAmber} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.35, 0.045]}>
          <boxGeometry args={[0.35, 0.03, 0.01]} />
          <meshStandardMaterial color={THEME_3D.colors.warmAmber} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Selection Aura Glow */}
        {isSelected && (
          <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.7, 32]} />
            <meshBasicMaterial 
              color={THEME_3D.colors.seaTeal} 
              transparent 
              opacity={0.4} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}
      </group>
    </>
  )
}
