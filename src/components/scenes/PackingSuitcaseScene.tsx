import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SoftLighting } from './shared/SoftLighting'
import { THEME_3D } from '../../config/theme3d'
import type { PreparationItem } from '../../store/types'

interface PackingSuitcaseSceneProps {
  selectedItems?: PreparationItem[]
  paused?: boolean
  reducedMotion?: boolean
}

export const PackingSuitcaseScene: React.FC<PackingSuitcaseSceneProps> = ({
  selectedItems = [],
  paused = false,
  reducedMotion = false
}) => {
  const suitcaseRef = useRef<THREE.Group>(null)

  const has = (item: PreparationItem) => selectedItems.includes(item)

  useFrame((state) => {
    if (paused) return
    if (!reducedMotion && suitcaseRef.current) {
      suitcaseRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03
    }
  })

  return (
    <>
      <SoftLighting />

      <group ref={suitcaseRef} position={[0, -0.3, 0]}>
        {/* Open Suitcase Lower Half (Flat on floor) */}
        <group position={[0, 0, 0]}>
          {/* Bottom Shell */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.25, 1.1]} />
            <meshStandardMaterial color="#0D9488" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Inner Lining */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.4, 0.1, 1.0]} />
            <meshStandardMaterial color="#CCFBF1" roughness={0.6} />
          </mesh>

          {/* Open Top Lid (Angled up at back) */}
          <group position={[0, 0.12, -0.55]} rotation={[-1.1, 0, 0]}>
            <mesh position={[0, 0, -0.55]} castShadow>
              <boxGeometry args={[1.5, 0.15, 1.1]} />
              <meshStandardMaterial color="#0F766E" roughness={0.4} metalness={0.2} />
            </mesh>
            <mesh position={[0, -0.04, -0.55]}>
              <boxGeometry args={[1.4, 0.08, 1.0]} />
              <meshStandardMaterial color="#99F6E4" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Packed Items appearing inside the suitcase based on selections */}

        {/* 1. Visa / Passport Booklet */}
        {has('visa_permission') && (
          <mesh position={[-0.4, 0.18, -0.2]} rotation={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.35, 0.05, 0.45]} />
            <meshStandardMaterial color="#0F172A" metalness={0.4} roughness={0.3} />
          </mesh>
        )}

        {/* 2. Housing Keys */}
        {has('housing') && (
          <group position={[0.35, 0.16, -0.2]} rotation={[0, -0.3, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.15]} castShadow>
              <boxGeometry args={[0.04, 0.02, 0.2]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {/* 3. Insurance Shield Badge */}
        {has('insurance') && (
          <group position={[-0.35, 0.16, 0.25]} rotation={[0, 0.1, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.04, 6]} />
              <meshStandardMaterial color="#0284C7" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        )}

        {/* 4. Travel Booking Boarding Pass */}
        {has('travel_booking') && (
          <mesh position={[0.25, 0.16, 0.25]} rotation={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.55, 0.02, 0.24]} />
            <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
          </mesh>
        )}

        {/* 5. Admission / Enrolment Document */}
        {has('admission_enrolment') && (
          <mesh position={[0, 0.2, -0.1]} rotation={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
          </mesh>
        )}

        {/* 6. Job Offer Contract */}
        {has('job_offer') && (
          <mesh position={[0, 0.17, 0.15]} rotation={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.45, 0.03, 0.35]} />
            <meshStandardMaterial color="#E0F2FE" roughness={0.4} />
          </mesh>
        )}

        {/* Empty state: Waiting tag */}
        {selectedItems.length === 0 && (
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
            <meshStandardMaterial color={THEME_3D.colors.seaTeal} transparent opacity={0.4} />
          </mesh>
        )}
      </group>
    </>
  )
}
