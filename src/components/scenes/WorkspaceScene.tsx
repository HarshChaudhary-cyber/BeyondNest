import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'

interface WorkspaceSceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const WorkspaceScene: React.FC<WorkspaceSceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && groupRef.current) {
      groupRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={groupRef} position={[0, -0.3, 0]}>
        {/* Office Desk */}
        <group position={[-0.2, 0, 0]}>
          {/* Wooden Desktop Surface */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.08, 1.0]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
          </mesh>
          {/* Modern Metal Legs */}
          <mesh position={[-0.75, -0.1, 0.35]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0.75, -0.1, 0.35]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[-0.75, -0.1, -0.35]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0.75, -0.1, -0.35]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>

          {/* Open Laptop on Desk */}
          <group position={[0, 0.46, 0]} rotation={[0, 0.1, 0]}>
            {/* Base Keyboard Unit */}
            <mesh castShadow>
              <boxGeometry args={[0.65, 0.02, 0.45]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Open Display Screen */}
            <group position={[0, 0.01, -0.22]} rotation={[-0.3, 0, 0]}>
              <mesh position={[0, 0.22, 0]} castShadow>
                <boxGeometry args={[0.65, 0.42, 0.02]} />
                <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Glowing Display */}
              <mesh position={[0, 0.22, 0.012]}>
                <boxGeometry args={[0.6, 0.38, 0.005]} />
                <meshBasicMaterial color="#38BDF8" />
              </mesh>
            </group>
          </group>

          {/* Ceramic Coffee Mug */}
          <mesh position={[0.55, 0.52, 0.15]}>
            <cylinderGeometry args={[0.08, 0.07, 0.16, 16]} />
            <meshStandardMaterial color={THEME_3D.colors.seaTeal} roughness={0.3} />
          </mesh>
        </group>

        {/* Executive Leather Briefcase Beside Desk */}
        <group position={[1.1, -0.1, 0.2]} rotation={[0, -0.35, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.55, 0.24]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Gold Latches */}
          <mesh position={[-0.2, 0.12, 0.125]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.2, 0.12, 0.125]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Leather Handle */}
          <mesh position={[0, 0.34, 0]}>
            <torusGeometry args={[0.1, 0.02, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>
      </group>
    </>
  )
}
