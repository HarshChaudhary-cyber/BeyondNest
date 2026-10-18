import React from 'react'

interface AirplaneMeshProps {
  scale?: number
}

export const AirplaneMesh: React.FC<AirplaneMeshProps> = ({ scale = 0.25 }) => {
  return (
    <group scale={scale}>
      {/* Fuselage body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 2.2, 16]} />
        <meshStandardMaterial 
          color="#FAF9F5" 
          roughness={0.4} 
          metalness={0.2} 
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial 
          color="#0D9488" 
          roughness={0.3} 
          metalness={0.3} 
        />
      </mesh>

      {/* Cockpit windshield */}
      <mesh position={[0, 0.85, 0.22]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.32, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#0F172A" 
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>

      {/* Main Wings */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[3.2, 0.08, 0.65]} />
        <meshStandardMaterial 
          color="#F1F5F9" 
          roughness={0.4} 
        />
      </mesh>

      {/* Teal wingtips */}
      <mesh position={[1.55, 0.18, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.1, 0.25, 0.4]} />
        <meshStandardMaterial color="#0D9488" />
      </mesh>
      <mesh position={[-1.55, 0.18, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.1, 0.25, 0.4]} />
        <meshStandardMaterial color="#0D9488" />
      </mesh>

      {/* Jet Engines */}
      <mesh position={[0.7, -0.2, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-0.7, -0.2, -0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.55, 12]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Tail fin (Vertical Stabilizer) */}
      <mesh position={[0, -0.95, 0.45]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.6, 0.5]} />
        <meshStandardMaterial color="#0D9488" roughness={0.3} />
      </mesh>

      {/* Horizontal Stabilizers */}
      <mesh position={[0, -1.0, 0.1]} castShadow>
        <boxGeometry args={[1.1, 0.05, 0.35]} />
        <meshStandardMaterial color="#FAF9F5" roughness={0.4} />
      </mesh>
    </group>
  )
}
