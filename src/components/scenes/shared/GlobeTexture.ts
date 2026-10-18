import * as THREE from 'three'

/**
 * Creates a high-fidelity procedural world map texture for the 3D globe.
 * Landmasses are rendered with recognizable continental contours in soft teal
 * against a warm deep navy ocean with subtle latitude/longitude grid lines.
 */
let cachedTexture: THREE.CanvasTexture | null = null

export function getOrCreateGlobeTexture(): THREE.CanvasTexture {
  if (cachedTexture) return cachedTexture

  const width = 2048
  const height = 1024
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    // Fallback basic texture
    return new THREE.CanvasTexture(canvas)
  }

  // 1. Ocean Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height)
  oceanGrad.addColorStop(0, '#0B1329')
  oceanGrad.addColorStop(0.5, '#0F1E36')
  oceanGrad.addColorStop(1, '#0B1329')
  ctx.fillStyle = oceanGrad
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle coordinate grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
  ctx.lineWidth = 1

  // Parallels (latitude)
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Meridians (longitude)
  for (let lon = -180; lon <= 180; lon += 45) {
    const x = ((lon + 180) / 360) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Helper to convert (lon, lat) to (x, y)
  const mapPoint = (lon: number, lat: number): [number, number] => {
    const x = ((lon + 180) / 360) * width
    const y = ((90 - lat) / 180) * height
    return [x, y]
  }

  const drawPolygon = (points: [number, number][], fill = '#14B8A6', stroke = '#2DD4BF') => {
    if (points.length < 3) return
    ctx.beginPath()
    const [startLon, startLat] = points[0]
    const [startX, startY] = mapPoint(startLon, startLat)
    ctx.moveTo(startX, startY)

    for (let i = 1; i < points.length; i++) {
      const [lon, lat] = points[i]
      const [x, y] = mapPoint(lon, lat)
      ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // Draw Continents with recognizable outlines

  // North America
  drawPolygon([
    [-168, 66], [-140, 70], [-125, 75], [-95, 76], [-80, 68], [-60, 50],
    [-65, 43], [-75, 35], [-80, 25], [-82, 23], [-90, 21], [-97, 20],
    [-105, 23], [-117, 32], [-124, 38], [-125, 50], [-135, 58], [-150, 60],
    [-165, 60], [-168, 66]
  ], '#0D9488', '#2DD4BF')

  // Greenland
  drawPolygon([
    [-50, 60], [-40, 65], [-20, 75], [-25, 82], [-45, 83], [-55, 78], [-50, 60]
  ], '#0F766E', '#5EEAD4')

  // South America
  drawPolygon([
    [-77, 10], [-60, 8], [-50, -2], [-35, -5], [-37, -12], [-42, -22],
    [-50, -30], [-60, -40], [-68, -54], [-74, -52], [-74, -40], [-72, -30],
    [-80, -5], [-81, 4], [-77, 10]
  ], '#0D9488', '#2DD4BF')

  // Europe
  drawPolygon([
    [-10, 36], [0, 38], [15, 40], [25, 38], [30, 42], [30, 46], [24, 54],
    [32, 60], [30, 70], [18, 70], [10, 60], [5, 54], [-4, 48], [-8, 44],
    [-10, 36]
  ], '#14B8A6', '#5EEAD4')

  // British Isles
  drawPolygon([
    [-10, 51], [-5, 50], [-1, 53], [-2, 58], [-7, 58], [-10, 54], [-10, 51]
  ], '#14B8A6', '#5EEAD4')

  // Africa
  drawPolygon([
    [-6, 35], [10, 37], [25, 32], [33, 30], [35, 22], [43, 12], [51, 12],
    [45, 2], [40, -10], [35, -20], [32, -30], [25, -34], [18, -34], [15, -25],
    [10, -10], [8, 4], [-2, 5], [-15, 12], [-17, 15], [-10, 30], [-6, 35]
  ], '#0D9488', '#2DD4BF')

  // Madagascar
  drawPolygon([
    [45, -12], [50, -15], [48, -25], [44, -25], [45, -12]
  ], '#0F766E', '#5EEAD4')

  // Asia
  drawPolygon([
    [30, 42], [40, 45], [50, 40], [60, 40], [70, 42], [75, 35], [78, 28],
    [80, 15], [82, 8], [90, 15], [98, 20], [105, 10], [104, 1], [110, 20],
    [120, 25], [122, 32], [125, 40], [130, 42], [140, 50], [160, 55],
    [170, 65], [175, 70], [140, 75], [100, 76], [70, 73], [60, 60],
    [50, 55], [35, 50], [30, 42]
  ], '#0D9488', '#2DD4BF')

  // India
  drawPolygon([
    [70, 24], [78, 28], [88, 22], [82, 10], [78, 8], [74, 15], [70, 24]
  ], '#14B8A6', '#5EEAD4')

  // Japan
  drawPolygon([
    [130, 32], [135, 34], [140, 40], [142, 44], [140, 45], [135, 38], [130, 32]
  ], '#14B8A6', '#5EEAD4')

  // Southeast Asia & Indonesia
  drawPolygon([[100, 5], [105, -5], [115, -8], [120, -5], [110, 2], [100, 5]], '#14B8A6', '#5EEAD4')
  drawPolygon([[110, -5], [118, -4], [115, -8], [110, -5]], '#14B8A6', '#5EEAD4')

  // Australia
  drawPolygon([
    [114, -22], [124, -15], [135, -12], [142, -11], [148, -20], [153, -28],
    [150, -36], [140, -38], [130, -32], [120, -34], [115, -30], [114, -22]
  ], '#0D9488', '#2DD4BF')

  // New Zealand
  drawPolygon([
    [172, -35], [176, -38], [174, -42], [170, -44], [168, -46], [167, -44], [172, -35]
  ], '#14B8A6', '#5EEAD4')

  // Soft atmospheric clouds overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  for (let i = 0; i < 20; i++) {
    const cx = (i * 105) % width
    const cy = 200 + (Math.sin(i * 1.7) * 250) + 100
    const rx = 60 + (i % 4) * 20
    const ry = 15 + (i % 3) * 8
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  cachedTexture = texture

  return texture
}
