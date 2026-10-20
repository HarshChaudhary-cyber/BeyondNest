import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'

interface CalendarSuitcaseSceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const CalendarSuitcaseScene: React.FC<CalendarSuitcaseSceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  const sceneGroupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && sceneGroupRef.current) {
      sceneGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.05
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={sceneGroupRef} position={[0, -0.2, 0]}>
        {/* Desk Calendar (Left) */}
        <group position={[-0.7, 0, 0]} rotation={[0.08, 0.25, 0]}>
          {/* Calendar Body Block */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.1, 1.3, 0.2]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Top Header Bar (Navy/Teal) */}
          <mesh position={[0, 0.5, 0.02]} castShadow>
            <boxGeometry args={[1.1, 0.3, 0.2]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
          </mesh>
          {/* Calendar Spiral Rings */}
          <mesh position={[-0.35, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 12, 24]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 12, 24]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>
          <mesh position={[0.35, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 12, 24]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>

          {/* Target Month Highlight Dot */}
          <mesh position={[0.15, -0.05, 0.11]}>
            <circleGeometry args={[0.14, 24]} />
            <meshBasicMaterial color={THEME_3D.colors.warmAmber} />
          </mesh>
        </group>

        {/* Rolling Travel Suitcase (Right) */}
        <group position={[0.8, -0.15, 0.2]} rotation={[-0.05, -0.35, 0]}>
          {/* Main Hard Shell */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.85, 1.25, 0.45]} />
            <meshStandardMaterial color="#0D9488" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Ribbed Grooves on Luggage */}
          <mesh position={[0, 0, 0.23]}>
            <boxGeometry args={[0.65, 0.04, 0.02]} />
            <meshStandardMaterial color="#0F766E" />
          </mesh>
          <mesh position={[0, 0.25, 0.23]}>
            <boxGeometry args={[0.65, 0.04, 0.02]} />
            <meshStandardMaterial color="#0F766E" />
          </mesh>
          <mesh position={[0, -0.25, 0.23]}>
            <boxGeometry args={[0.65, 0.04, 0.02]} />
            <meshStandardMaterial color="#0F766E" />
          </mesh>

          {/* Telescopic Handle */}
          <mesh position={[-0.15, 0.8, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.5, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0.15, 0.8, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.5, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.36, 0.05, 0.04]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>

          {/* Luggage Wheels */}
          <mesh position={[-0.3, -0.68, 0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0.3, -0.68, 0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[-0.3, -0.68, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0.3, -0.68, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
        </group>
      </group>
    </>
  )
}
