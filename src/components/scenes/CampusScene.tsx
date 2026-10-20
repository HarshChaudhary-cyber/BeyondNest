import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'

interface CampusSceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const CampusScene: React.FC<CampusSceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  const capRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && capRef.current) {
      capRef.current.position.y = 1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.06
      capRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    }
  })

  return (
    <>
      <SoftLighting />

      <group position={[0, -0.4, 0]}>
        {/* Classical Campus Building Facade */}
        <group position={[0, 0, -0.2]}>
          {/* Base Stone Steps */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[2.2, 0.15, 1.2]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[1.9, 0.1, 1.0]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>

          {/* Classical Columns (4 columns) */}
          {[-0.7, -0.23, 0.23, 0.7].map((x, i) => (
            <mesh key={i} position={[x, 0.6, 0.2]} castShadow>
              <cylinderGeometry args={[0.08, 0.09, 1.1, 16]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
            </mesh>
          ))}

          {/* Architrave Beam */}
          <mesh position={[0, 1.2, 0.2]} castShadow>
            <boxGeometry args={[1.9, 0.14, 0.35]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
          </mesh>

          {/* Triangular Pediment (Gable Roof) */}
          <mesh position={[0, 1.5, 0.2]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0, 1.05, 0.5, 3]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
          </mesh>

          {/* Building Back Wall & Doorway */}
          <mesh position={[0, 0.6, -0.1]} receiveShadow>
            <boxGeometry args={[1.7, 1.2, 0.2]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.4, 0.01]}>
            <boxGeometry args={[0.4, 0.8, 0.04]} />
            <meshStandardMaterial color="#0F172A" roughness={0.2} />
          </mesh>
        </group>

        {/* Floating Academic Graduation Cap */}
        <group ref={capRef} position={[0, 1.1, 0.5]} rotation={[0.2, 0.3, -0.1]}>
          {/* Mortarboard Diamond Top */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.05, 0.9]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} />
          </mesh>
          {/* Skull Cap Base */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.32, 0.35, 0.28, 24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} />
          </mesh>
          {/* Gold Button on Top */}
          <mesh position={[0, 0.035, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Gold Tassel Ribbon */}
          <mesh position={[0.25, -0.1, 0.25]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.015, 0.03, 0.35, 8]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Glow Ring */}
          <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.65, 32]} />
            <meshBasicMaterial color={THEME_3D.colors.seaTeal} transparent opacity={0.4} />
          </mesh>
        </group>
      </group>
    </>
  )
}
