import * as THREE from 'three'

/**
 * Converts geographic latitude and longitude to a 3D Cartesian Vector3 on a sphere of radius R.
 * 
 * Geographic convention:
 * - Latitude: -90° (South Pole) to +90° (North Pole)
 * - Longitude: -180° (West) to +180° (East), 0° is Prime Meridian
 * 
 * Aligns precisely with Three.js SphereGeometry UV mapping:
 * - u = (lon + 180) / 360
 * - v = (lat + 90) / 180 (v = 1 at North Pole, v = 0 at South Pole)
 */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

/**
 * Calculates the exact target rotation quaternion so that the given (lat, lon)
 * directly faces the front camera at (0, 0, +distance) while maintaining
 * the Earth's North Pole upright (in the positive Y direction without sideways tilt).
 * 
 * Uses an orthonormal frame inversion:
 * - Forward vector (faces camera +Z): normalized surface position P
 * - Right vector: WorldUp (0, 1, 0) x Forward
 * - Up vector: Forward x Right
 */
export function calculateGlobeTargetQuaternion(lat: number, lon: number): THREE.Quaternion {
  const p = latLonToVector3(lat, lon, 1.0)
  const pNorm = p.clone().normalize()
  const worldUp = new THREE.Vector3(0, 1, 0)

  let right = new THREE.Vector3().crossVectors(worldUp, pNorm)
  if (right.lengthSq() < 1e-6) {
    // Exactly at poles (lat = +90 or -90)
    right = new THREE.Vector3(1, 0, 0)
  } else {
    right.normalize()
  }

  const up = new THREE.Vector3().crossVectors(pNorm, right).normalize()

  // Frame matrix whose transpose/inverse maps pNorm to (0, 0, 1) and up to (0, 1, 0)
  const matrix = new THREE.Matrix4().set(
    right.x, right.y, right.z, 0,
    up.x, up.y, up.z, 0,
    pNorm.x, pNorm.y, pNorm.z, 0,
    0, 0, 0, 1
  )

  return new THREE.Quaternion().setFromRotationMatrix(matrix)
}

export const GLOBE_RADIUS = 2.0

/**
 * Legacy compatibility helper returning Euler angles if needed.
 */
export function calculateGlobeRotationForLatLon(lat: number, lon: number): THREE.Euler {
  const q = calculateGlobeTargetQuaternion(lat, lon)
  return new THREE.Euler().setFromQuaternion(q, 'YXZ')
}
