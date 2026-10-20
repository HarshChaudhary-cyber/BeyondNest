import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'

interface BudgetWalletSceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const BudgetWalletScene: React.FC<BudgetWalletSceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  const walletRef = useRef<THREE.Group>(null)
  const tokensGroupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion) {
      if (walletRef.current) {
        walletRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
        walletRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1 - 0.2
      }
      if (tokensGroupRef.current) {
        tokensGroupRef.current.rotation.y = state.clock.elapsedTime * 0.4
      }
    }
  })

  return (
    <>
      <SoftLighting />

      <group position={[0, -0.2, 0]}>
        {/* Leather Bifold Wallet */}
        <group ref={walletRef} position={[0, 0, 0]} rotation={[0.2, -0.2, 0.1]}>
          {/* Main Leather Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.95, 0.3]} />
            <meshStandardMaterial color="#0F766E" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Leather Interior Fold Accent */}
          <mesh position={[0, 0.05, 0.16]}>
            <boxGeometry args={[1.3, 0.7, 0.05]} />
            <meshStandardMaterial color="#14B8A6" roughness={0.5} />
          </mesh>
          {/* Gold Clasp / Buckle */}
          <mesh position={[0.55, 0, 0.18]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Credit Card edge sticking out */}
          <mesh position={[-0.2, 0.35, 0.12]} rotation={[0, 0, 0.05]}>
            <boxGeometry args={[0.8, 0.3, 0.02]} />
            <meshStandardMaterial color="#0284C7" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>

        {/* Floating Coin / Expense Tokens */}
        <group ref={tokensGroupRef} position={[0, 0.4, 0]}>
          <mesh position={[1.1, 0.3, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-1.1, -0.1, 0.4]} rotation={[0.2, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
            <meshStandardMaterial color={THEME_3D.colors.seaTeal} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.6, -0.8]} rotation={[0.4, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
            <meshStandardMaterial color="#38BDF8" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </>
  )
}
