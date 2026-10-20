import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { DestinationPriority } from '../../store/types'

interface PrioritiesCompassSceneProps {
  selectedPriorities?: DestinationPriority[]
  paused?: boolean
  reducedMotion?: boolean
}

export const PrioritiesCompassScene: React.FC<PrioritiesCompassSceneProps> = ({
  selectedPriorities = [],
  paused = false,
  reducedMotion = false
}) => {
  const needleRef = useRef<THREE.Group>(null)
  const orbitGroupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion) {
      if (needleRef.current) {
        needleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.4
      }
      if (orbitGroupRef.current) {
        orbitGroupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      }
    }
  })

  const isSelected = (id: DestinationPriority) => selectedPriorities.includes(id)

  return (
    <>
      <SoftLighting />

      {/* Central 3D Compass */}
      <group position={[0, -0.2, 0]}>
        {/* Compass Outer Brass Ring */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.1, 1.15, 0.12, 48]} />
          <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Compass Inner Dial */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 0.02, 48]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>

        {/* Cardinal Markers on Dial */}
        <mesh position={[0, 0.035, -0.85]}>
          <boxGeometry args={[0.06, 0.01, 0.15]} />
          <meshStandardMaterial color="#E11D48" />
        </mesh>
        <mesh position={[0, 0.035, 0.85]}>
          <boxGeometry args={[0.06, 0.01, 0.15]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-0.85, 0.035, 0]}>
          <boxGeometry args={[0.15, 0.01, 0.06]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0.85, 0.035, 0]}>
          <boxGeometry args={[0.15, 0.01, 0.06]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Needle */}
        <group ref={needleRef} position={[0, 0.05, 0]}>
          {/* North Needle Tip (Red) */}
          <mesh position={[0, 0, -0.38]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.75, 4]} />
            <meshStandardMaterial color="#E11D48" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* South Needle Tip (Navy) */}
          <mesh position={[0, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.75, 4]} />
            <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Central Pivot Cap */}
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Surrounding Themed Objects */}
      <group ref={orbitGroupRef} position={[0, 0, 0]}>
        {/* 1. Study (Graduation Cap) - North East */}
        <group position={[1.4, isSelected('study_opportunities') ? 0.35 : 0.05, -0.8]} scale={isSelected('study_opportunities') ? 1.25 : 1}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.45, 0.04, 0.45]} />
            <meshStandardMaterial color={isSelected('study_opportunities') ? THEME_3D.colors.seaTeal : '#0284C7'} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.15, 16]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
        </group>

        {/* 2. Work (Briefcase) - East */}
        <group position={[1.7, isSelected('work_opportunities') ? 0.35 : 0.05, 0.4]} scale={isSelected('work_opportunities') ? 1.25 : 1}>
          <mesh>
            <boxGeometry args={[0.42, 0.32, 0.14]} />
            <meshStandardMaterial color={isSelected('work_opportunities') ? THEME_3D.colors.seaTeal : '#334155'} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.16, 0.08, 0.03]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} />
          </mesh>
        </group>

        {/* 3. Living Costs (Coins) - South East */}
        <group position={[0.7, isSelected('living_costs') ? 0.35 : 0.05, 1.4]} scale={isSelected('living_costs') ? 1.25 : 1}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 24]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* 4. Language (Alphabet/Speech Cube) - South West */}
        <group position={[-0.8, isSelected('language') ? 0.35 : 0.05, 1.3]} scale={isSelected('language') ? 1.25 : 1}>
          <mesh>
            <boxGeometry args={[0.34, 0.34, 0.34]} />
            <meshStandardMaterial color={isSelected('language') ? THEME_3D.colors.seaTeal : '#38BDF8'} roughness={0.3} />
          </mesh>
        </group>

        {/* 5. Family (Mini Home) - West */}
        <group position={[-1.6, isSelected('family_connections') ? 0.35 : 0.05, 0.2]} scale={isSelected('family_connections') ? 1.25 : 1}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.34, 0.28, 0.34]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.3, 0.22, 4]} />
            <meshStandardMaterial color={isSelected('family_connections') ? '#E11D48' : '#EA580C'} roughness={0.4} />
          </mesh>
        </group>

        {/* 6. Lifestyle & Community (Tree/Sun) - North West */}
        <group position={[-1.2, isSelected('lifestyle_community') ? 0.35 : 0.05, -1.0]} scale={isSelected('lifestyle_community') ? 1.25 : 1}>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshStandardMaterial color={isSelected('lifestyle_community') ? '#10B981' : '#14B8A6'} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.2, 8]} />
            <meshStandardMaterial color="#78350F" />
          </mesh>
        </group>
      </group>
    </>
  )
}
