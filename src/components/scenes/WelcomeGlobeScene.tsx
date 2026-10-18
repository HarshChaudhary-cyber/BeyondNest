import React from 'react'
import { SoftLighting } from './shared/SoftLighting'
import { GlobeMesh } from './shared/GlobeMesh'
import { TravelRoute } from './shared/TravelRoute'

interface WelcomeGlobeSceneProps {
  paused?: boolean
  reducedMotion?: boolean
}

export const WelcomeGlobeScene: React.FC<WelcomeGlobeSceneProps> = ({
  paused = false,
  reducedMotion = false
}) => {
  return (
    <>
      <SoftLighting />

      {/* Floating 3D Globe with recognizable geography and clouds */}
      <GlobeMesh 
        radius={2.0} 
        autoRotate={!reducedMotion} 
        rotationSpeed={0.002}
        paused={paused}
        reducedMotion={reducedMotion}
      />

      {/* International travel route with airplane flying between continents */}
      <TravelRoute
        startLat={48.8566}   // Paris / London
        startLon={2.3522}
        endLat={35.6762}     // Tokyo
        endLon={139.6503}
        globeRadius={2.0}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    </>
  )
}
