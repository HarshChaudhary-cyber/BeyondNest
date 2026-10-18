import React from 'react'

export const SoftLighting: React.FC = () => {
  return (
    <>
      {/* Warm gentle ambient light */}
      <ambientLight intensity={1.1} color="#FAF9F5" />
      
      {/* Key light for soft highlights */}
      <directionalLight 
        position={[6, 8, 5]} 
        intensity={1.4} 
        color="#FFFFFF" 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Sky blue rim light for atmospheric edge glow */}
      <directionalLight 
        position={[-5, 3, -6]} 
        intensity={0.8} 
        color="#38BDF8" 
      />

      {/* Gentle teal bounce light from below */}
      <directionalLight 
        position={[0, -5, 2]} 
        intensity={0.4} 
        color="#2DD4BF" 
      />
    </>
  )
}
