import * as THREE from 'three'

/**
 * Converts geographic latitude and longitude to a 3D Cartesian Vector3 on a sphere of radius R.
 * 
 * Geographic convention:
 * - Latitude: -90° (South Pole) to +90° (North Pole)
 * - Longitude: -180° (West) to +180° (East), 0° is Prime Meridian
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
 * Calculates target Euler angles (x, y, z) to rotate a sphere so that the given (lat, lon)
 * directly faces the camera at (0, 0, distance).
 */
export function calculateGlobeRotationForLatLon(lat: number, lon: number): { x: number; y: number } {
  // To bring lat to the equator (facing z+): rotate around X by -lat
  const rotX = (lat * Math.PI) / 180
  // To bring lon to face the front (facing z+): rotate around Y
  const rotY = -((lon + 90) * Math.PI) / 180

  return { x: rotX, y: rotY }
}
