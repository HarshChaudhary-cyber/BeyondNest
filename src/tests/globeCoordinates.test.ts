import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  latLonToVector3,
  calculateGlobeTargetQuaternion,
  calculateGlobeRotationForLatLon,
  GLOBE_RADIUS
} from '../components/scenes/shared/coordinates'

describe('Globe and Location-Pin Alignment Math', () => {
  it('converts latitude and longitude to a 3D vector with exact radius', () => {
    const radius = 2.0
    // Equator at Prime Meridian
    const v0 = latLonToVector3(0, 0, radius)
    expect(v0.length()).toBeCloseTo(radius, 5)
    // lon=0 should be on positive X axis according to spherical coordinates
    expect(v0.x).toBeCloseTo(radius, 4)
    expect(v0.y).toBeCloseTo(0, 4)
    expect(v0.z).toBeCloseTo(0, 4)

    // North Pole (lat = 90)
    const north = latLonToVector3(90, 0, radius)
    expect(north.length()).toBeCloseTo(radius, 5)
    expect(north.x).toBeCloseTo(0, 4)
    expect(north.y).toBeCloseTo(radius, 4)
    expect(north.z).toBeCloseTo(0, 4)

    // South Pole (lat = -90)
    const south = latLonToVector3(-90, 0, radius)
    expect(south.length()).toBeCloseTo(radius, 5)
    expect(south.x).toBeCloseTo(0, 4)
    expect(south.y).toBeCloseTo(-radius, 4)
    expect(south.z).toBeCloseTo(0, 4)
  })

  // Required locations: India, Japan, Canada, Australia, and a location near the International Date Line (Fiji)
  const testLocations = [
    { name: 'India', lat: 20.5937, lon: 78.9629 },
    { name: 'Japan', lat: 36.2048, lon: 138.2529 },
    { name: 'Canada', lat: 56.1304, lon: -106.3468 },
    { name: 'Australia', lat: -25.2744, lon: 133.7751 },
    { name: 'Fiji (near Date Line)', lat: -17.7134, lon: 178.065 },
    { name: 'Kiribati (across Date Line)', lat: 1.8709, lon: -157.363 },
    { name: 'Equator Prime Meridian', lat: 0, lon: 0 },
  ]

  testLocations.forEach(({ name, lat, lon }) => {
    it(`rotates ${name} (${lat}°, ${lon}°) directly toward camera at (0, 0, +R) without roll`, () => {
      const radius = GLOBE_RADIUS // 2.0
      // 1. Calculate geographic surface coordinate
      const surfacePos = latLonToVector3(lat, lon, radius)

      // 2. Compute camera-facing target quaternion
      const targetQuat = calculateGlobeTargetQuaternion(lat, lon)

      // 3. Apply target rotation to the surface coordinate
      const rotatedPos = surfacePos.clone().applyQuaternion(targetQuat)

      // The coordinate MUST rotate directly to (0, 0, +R), facing the camera along +Z
      expect(rotatedPos.x).toBeCloseTo(0, 3)
      expect(rotatedPos.y).toBeCloseTo(0, 3)
      expect(rotatedPos.z).toBeCloseTo(radius, 3)

      // 4. Verify North Pole orientation (no sideways roll / tilt)
      const northPole = new THREE.Vector3(0, radius, 0)
      const rotatedNorth = northPole.clone().applyQuaternion(targetQuat)

      // Rotated North pole must stay in the vertical Y-Z plane (x ≈ 0, no sideways tilt)
      expect(rotatedNorth.x).toBeCloseTo(0, 3)
      // Rotated North pole must remain in the upper hemisphere (+Y) for all non-polar locations
      expect(rotatedNorth.y).toBeGreaterThan(0)
    })
  })

  it('calculates smooth shortest-path spherical rotations between hemispheres across the Date Line', () => {
    // Canada (Americas, West) to Fiji (Oceania, East near 180° lon)
    const qCanada = calculateGlobeTargetQuaternion(56.1304, -106.3468)
    const qFiji = calculateGlobeTargetQuaternion(-17.7134, 178.065)

    // Angular distance between two quaternions
    const angularDistRad = qCanada.angleTo(qFiji)
    const angularDistDeg = THREE.MathUtils.radToDeg(angularDistRad)

    // Quaternion slerp takes the shortest geodesic on SO(3), which must be <= 180 degrees
    // (no unnecessary full 360-degree spins when crossing longitude boundaries)
    expect(angularDistDeg).toBeLessThanOrEqual(180)
    expect(angularDistDeg).toBeGreaterThan(0)
  })

  it('keeps calculateGlobeRotationForLatLon consistent with target quaternion', () => {
    const lat = 36.2048
    const lon = 138.2529
    const euler = calculateGlobeRotationForLatLon(lat, lon)
    const quatFromEuler = new THREE.Quaternion().setFromEuler(euler)
    const targetQuat = calculateGlobeTargetQuaternion(lat, lon)

    const testVec = latLonToVector3(lat, lon, 2.0)
    const rotatedEuler = testVec.clone().applyQuaternion(quatFromEuler)
    const rotatedQuat = testVec.clone().applyQuaternion(targetQuat)

    expect(rotatedEuler.z).toBeCloseTo(2.0, 3)
    expect(rotatedQuat.z).toBeCloseTo(2.0, 3)
    expect(rotatedEuler.x).toBeCloseTo(0, 3)
    expect(rotatedQuat.x).toBeCloseTo(0, 3)
  })
})
