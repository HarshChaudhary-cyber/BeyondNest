import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { RelocationPurpose } from '../../store/types'

interface PurposeSceneProps {
  selectedPurpose?: RelocationPurpose
  paused?: boolean
  reducedMotion?: boolean
}

// 1. Graduation Cap 3D Model
const GraduationCap: React.FC<{ isSelected: boolean; reducedMotion: boolean }> = ({ isSelected, reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetY = isSelected ? 0.45 : 0
    const targetScale = isSelected ? 1.12 : 0.96
    const lerpSpeed = reducedMotion ? 1 : Math.min(delta * 6, 0.2)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpSpeed))

    if (isSelected && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.4
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.35, lerpSpeed)
    }
  })

  return (
    <group ref={groupRef} position={[-1.4, 0.7, 0]}>
      {/* Pedestal & highlight ring */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 24]} />
        <meshStandardMaterial 
          color={isSelected ? THEME_3D.colors.tealLandHighlight : THEME_3D.colors.navy200} 
          roughness={0.4}
          emissive={isSelected ? THEME_3D.colors.tealLand : '#000000'}
          emissiveIntensity={isSelected ? THEME_3D.materials.activeHighlightEmissiveIntensity : 0}
        />
      </mesh>

      {/* Skull cap */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.36, 0.3, 20]} />
        <meshStandardMaterial color={THEME_3D.colors.navy900} roughness={0.3} />
      </mesh>

      {/* Mortarboard flat diamond top */}
      <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.06, 1.2]} />
        <meshStandardMaterial color={THEME_3D.colors.navy800} roughness={0.25} />
      </mesh>

      {/* Center button */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={THEME_3D.colors.amberGold} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* Hanging tassel cord and fringe */}
      <mesh position={[0.35, -0.05, 0.35]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color={THEME_3D.colors.amberGold} />
      </mesh>
      <mesh position={[0.35, -0.25, 0.35]}>
        <coneGeometry args={[0.06, 0.18, 12]} />
        <meshStandardMaterial color={THEME_3D.colors.amberGold} />
      </mesh>
    </group>
  )
}

// 2. Briefcase 3D Model
const Briefcase: React.FC<{ isSelected: boolean; reducedMotion: boolean }> = ({ isSelected, reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetY = isSelected ? 0.45 : 0
    const targetScale = isSelected ? 1.12 : 0.96
    const lerpSpeed = reducedMotion ? 1 : Math.min(delta * 6, 0.2)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpSpeed))

    if (isSelected && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.4
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -0.3, lerpSpeed)
    }
  })

  return (
    <group ref={groupRef} position={[1.4, 0.7, 0]}>
      {/* Pedestal */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 24]} />
        <meshStandardMaterial 
          color={isSelected ? THEME_3D.colors.tealLandHighlight : THEME_3D.colors.navy200} 
          roughness={0.4}
          emissive={isSelected ? THEME_3D.colors.tealLand : '#000000'}
          emissiveIntensity={isSelected ? THEME_3D.materials.activeHighlightEmissiveIntensity : 0}
        />
      </mesh>

      {/* Main Leather Case */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[1.1, 0.75, 0.4]} />
        <meshStandardMaterial color={THEME_3D.colors.amberDark} roughness={0.5} />
      </mesh>

      {/* Center lock latch */}
      <mesh position={[0, -0.05, 0.21]}>
        <boxGeometry args={[0.16, 0.14, 0.04]} />
        <meshStandardMaterial color={THEME_3D.colors.amberGold} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Handle */}
      <mesh position={[0, 0.36, 0]}>
        <torusGeometry args={[0.18, 0.035, 8, 16, Math.PI]} />
        <meshStandardMaterial color={THEME_3D.colors.amberDeep} roughness={0.4} />
      </mesh>

      {/* Luggage tag attached */}
      <mesh position={[0.3, 0.2, 0.2]} rotation={[0.2, 0, -0.4]}>
        <boxGeometry args={[0.12, 0.22, 0.02]} />
        <meshStandardMaterial color={THEME_3D.colors.tealLand} />
      </mesh>
    </group>
  )
}

// 3. House 3D Model
const House: React.FC<{ isSelected: boolean; reducedMotion: boolean }> = ({ isSelected, reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetY = isSelected ? -0.75 : -1.2
    const targetScale = isSelected ? 1.12 : 0.96
    const lerpSpeed = reducedMotion ? 1 : Math.min(delta * 6, 0.2)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpSpeed))

    if (isSelected && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.4
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.35, lerpSpeed)
    }
  })

  return (
    <group ref={groupRef} position={[-1.4, -1.2, 0]}>
      {/* Pedestal */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 24]} />
        <meshStandardMaterial 
          color={isSelected ? THEME_3D.colors.tealLandHighlight : THEME_3D.colors.navy200} 
          roughness={0.4}
          emissive={isSelected ? THEME_3D.colors.tealLand : '#000000'}
          emissiveIntensity={isSelected ? THEME_3D.materials.activeHighlightEmissiveIntensity : 0}
        />
      </mesh>

      {/* House Body */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.9, 0.75, 0.85]} />
        <meshStandardMaterial color={THEME_3D.colors.warmWhite} roughness={0.3} />
      </mesh>

      {/* Pitched Roof */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.75, 0.75, 0.95]} />
        <meshStandardMaterial color={THEME_3D.colors.tealDeep} roughness={0.4} />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.25, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.35, 8]} />
        <meshStandardMaterial color={THEME_3D.colors.amberDark} />
      </mesh>

      {/* Arched Entrance Door */}
      <mesh position={[0, -0.28, 0.44]}>
        <boxGeometry args={[0.26, 0.48, 0.03]} />
        <meshStandardMaterial color={THEME_3D.colors.amberDark} roughness={0.4} />
      </mesh>

      {/* Warm Window */}
      <mesh position={[-0.24, -0.05, 0.44]}>
        <boxGeometry args={[0.18, 0.18, 0.02]} />
        <meshStandardMaterial 
          color={THEME_3D.colors.windowGlow} 
          emissive={THEME_3D.colors.amberGold} 
          emissiveIntensity={0.6} 
        />
      </mesh>
    </group>
  )
}

// 4. Compass 3D Model
const Compass: React.FC<{ isSelected: boolean; reducedMotion: boolean }> = ({ isSelected, reducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null)
  const needleRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetY = isSelected ? -0.75 : -1.2
    const targetScale = isSelected ? 1.12 : 0.96
    const lerpSpeed = reducedMotion ? 1 : Math.min(delta * 6, 0.2)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, lerpSpeed))

    if (needleRef.current && !reducedMotion) {
      needleRef.current.rotation.z += delta * (isSelected ? 2.5 : 0.6)
    }

    if (isSelected && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.4
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -0.3, lerpSpeed)
    }
  })

  return (
    <group ref={groupRef} position={[1.4, -1.2, 0]}>
      {/* Pedestal */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 24]} />
        <meshStandardMaterial 
          color={isSelected ? THEME_3D.colors.tealLandHighlight : THEME_3D.colors.navy200} 
          roughness={0.4}
          emissive={isSelected ? THEME_3D.colors.tealLand : '#000000'}
          emissiveIntensity={isSelected ? THEME_3D.materials.activeHighlightEmissiveIntensity : 0}
        />
      </mesh>

      {/* Brass compass casing */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.58, 0.2, 24]} />
        <meshStandardMaterial color={THEME_3D.colors.brassCasing} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Compass Dial Face */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.02, 24]} />
        <meshStandardMaterial color={THEME_3D.colors.warmWhite} roughness={0.2} />
      </mesh>

      {/* Rotating Magnetic Needle */}
      <group ref={needleRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* North needle tip (Red) */}
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.07, 0.38, 4]} />
          <meshStandardMaterial color={THEME_3D.colors.pinRed} />
        </mesh>
        {/* South needle tip (Teal) */}
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.07, 0.38, 4]} />
          <meshStandardMaterial color={THEME_3D.colors.tealLand} />
        </mesh>
        {/* Center pivot pin */}
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={THEME_3D.colors.amberGold} metalness={0.8} />
        </mesh>
      </group>

      {/* Top hanger ring */}
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color={THEME_3D.colors.brassCasing} metalness={0.7} />
      </mesh>
    </group>
  )
}

export const PurposeScene: React.FC<PurposeSceneProps> = ({
  selectedPurpose,
  reducedMotion = false
}) => {
  return (
    <>
      <SoftLighting />
      <group position={[0, 0.2, 0]}>
        <GraduationCap isSelected={selectedPurpose === 'study'} reducedMotion={reducedMotion} />
        <Briefcase isSelected={selectedPurpose === 'work'} reducedMotion={reducedMotion} />
        <House isSelected={selectedPurpose === 'family'} reducedMotion={reducedMotion} />
        <Compass isSelected={selectedPurpose === 'explore'} reducedMotion={reducedMotion} />
      </group>
    </>
  )
}
