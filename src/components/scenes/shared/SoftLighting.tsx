import React from 'react'
import { THEME_3D } from '../../../config/theme3d'

export const SoftLighting: React.FC = () => {
  return (
    <>
      {/* Warm gentle ambient light */}
      <ambientLight 
        intensity={THEME_3D.lighting.ambientIntensity} 
        color={THEME_3D.lighting.ambientColor} 
      />
      
      {/* Key light for soft highlights */}
      <directionalLight 
        position={[6, 8, 5]} 
        intensity={THEME_3D.lighting.keyLightIntensity} 
        color={THEME_3D.lighting.keyLightColor} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Sky blue rim light for atmospheric edge glow */}
      <directionalLight 
        position={[-5, 3, -6]} 
        intensity={THEME_3D.lighting.rimLightIntensity} 
        color={THEME_3D.lighting.rimLightColor} 
      />

      {/* Gentle teal bounce light from below */}
      <directionalLight 
        position={[0, -5, 2]} 
        intensity={THEME_3D.lighting.bounceLightIntensity} 
        color={THEME_3D.lighting.bounceLightColor} 
      />
    </>
  )
}
