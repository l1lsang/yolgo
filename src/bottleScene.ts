import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export type BottleScene = {
  setProgress: (progress: number) => void
  setPointer: (x: number, y: number) => void
  setActive: (active: boolean) => void
  dispose: () => void
}

type Pose = { at: number; x: number; y: number; rotX: number; rotY: number; rotZ: number; scale: number }

// x / y are fractions of the visible half-width / half-height; rotations in radians.
// Holds (0.12–0.34, 0.52–0.7, 0.86–1) line up with the copy chapters in App.tsx; the bottle only travels between them.
const desktopPoses: Pose[] = [
  { at: 0, x: 0.62, y: -0.42, rotX: 0.1, rotY: -1.1, rotZ: 0.16, scale: 0.8 },
  { at: 0.12, x: 0.46, y: -0.02, rotX: 0.03, rotY: -0.38, rotZ: 0.05, scale: 1 },
  { at: 0.34, x: 0.44, y: 0, rotX: 0, rotY: -0.16, rotZ: 0.02, scale: 1.02 },
  { at: 0.52, x: -0.46, y: -0.02, rotX: -0.02, rotY: Math.PI * 2 + 0.34, rotZ: -0.05, scale: 1 },
  { at: 0.7, x: -0.44, y: 0, rotX: 0, rotY: Math.PI * 2 + 0.46, rotZ: -0.03, scale: 1.02 },
  { at: 0.86, x: 0.42, y: -0.05, rotX: -0.08, rotY: Math.PI * 2 - 0.3, rotZ: 0.04, scale: 1.03 },
  { at: 1, x: 0.42, y: -0.05, rotX: -0.08, rotY: Math.PI * 2 - 0.2, rotZ: 0.04, scale: 1.03 },
]

const mobilePoses: Pose[] = [
  { at: 0, x: 0.3, y: -0.05, rotX: 0.1, rotY: -1.1, rotZ: 0.14, scale: 0.8 },
  { at: 0.12, x: 0.1, y: 0.36, rotX: 0.03, rotY: -0.34, rotZ: 0.04, scale: 1 },
  { at: 0.34, x: 0.1, y: 0.38, rotX: 0, rotY: -0.14, rotZ: 0.02, scale: 1 },
  { at: 0.52, x: -0.1, y: 0.36, rotX: -0.02, rotY: Math.PI * 2 + 0.3, rotZ: -0.04, scale: 1 },
  { at: 0.7, x: -0.1, y: 0.38, rotX: 0, rotY: Math.PI * 2 + 0.4, rotZ: -0.03, scale: 1 },
  { at: 0.86, x: 0, y: 0.36, rotX: -0.08, rotY: Math.PI * 2 - 0.26, rotZ: 0.03, scale: 1.04 },
  { at: 1, x: 0, y: 0.36, rotX: -0.08, rotY: Math.PI * 2 - 0.2, rotZ: 0.03, scale: 1.04 },
]

const poseKeys = ['x', 'y', 'rotX', 'rotY', 'rotZ', 'scale'] as const

// The real bottle's label is taller relative to its width than in the source render (checked against product photos).
const labelStretch = 1.15

const poseAt = (poses: Pose[], progress: number) => {
  const next = poses.findIndex((pose) => pose.at >= progress)
  if (next <= 0) return poses[next === 0 ? 0 : poses.length - 1]
  const from = poses[next - 1]
  const to = poses[next]
  const t = (progress - from.at) / (to.at - from.at)
  const eased = t * t * (3 - 2 * t)
  const pose = { ...from }
  for (const key of poseKeys) pose[key] = from[key] + (to[key] - from[key]) * eased
  return pose
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${url}`))
    image.src = url
  })

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

// Reads the bottle silhouette from the PNG alpha (per-row axis centre and radius) and finds where the printed label starts and ends.
function readSilhouette(image: HTMLImageElement) {
  const width = image.naturalWidth
  const height = image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('2D canvas를 사용할 수 없습니다.')
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, width, height).data

  const left = new Array<number>(height).fill(-1)
  const right = new Array<number>(height).fill(-1)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 128) continue
      if (left[y] < 0) left[y] = x
      right[y] = x
    }
  }
  const top = left.findIndex((value) => value >= 0)
  const bottom = height - 1 - [...left].reverse().findIndex((value) => value >= 0)

  // Walk up from the base. Near the top, a row whose left edge jumps far past the row below is the spray nozzle:
  // the pump head keeps its radius from the right edge and the nozzle is modelled separately. The check is limited
  // to the top of the bottle so the rounded base can never be mistaken for it.
  const center = new Array<number>(height).fill(0)
  const radius = new Array<number>(height).fill(0)
  const spoutZone = top + (bottom - top) * 0.2
  let spoutLeft = width
  let spoutTop = -1
  let spoutBottom = -1
  let lastLeft = left[bottom]
  let lastCenter = (left[bottom] + right[bottom]) / 2
  for (let y = bottom; y >= top; y--) {
    if (y < spoutZone && left[y] < lastLeft - 12) {
      center[y] = lastCenter
      radius[y] = Math.max(0, right[y] - lastCenter + 0.5)
      spoutLeft = Math.min(spoutLeft, left[y])
      spoutTop = y
      if (spoutBottom < 0) spoutBottom = y
      continue
    }
    center[y] = (left[y] + right[y] + 1) / 2
    radius[y] = (right[y] - left[y] + 1) / 2
    lastLeft = left[y]
    lastCenter = center[y]
  }

  // Above the pump head's flat top only the nozzle's upper face shows in the render; the head ends where it is
  // almost full width again, so the lathe gets a flat top instead of tapering to a point.
  let headTop = top
  if (spoutBottom >= 0) {
    const headRadius = radius[Math.min(bottom, spoutBottom + 1)]
    headTop = spoutTop
    while (headTop < spoutBottom && radius[headTop] < headRadius - 20) headTop++
  }

  const smooth = (values: number[]) => values.map((_, y) => {
    let sum = 0
    let count = 0
    for (let k = Math.max(headTop, y - 4); k <= Math.min(bottom, y + 4); k++) { sum += values[k]; count++ }
    return y < headTop || y > bottom ? 0 : sum / count
  })
  const smoothCenter = smooth(center)
  const smoothRadius = smooth(radius)

  // The label is the coloured band between the black cap and the black base.
  const isPrinted = (y: number) => {
    const index = (y * width + Math.round(smoothCenter[y])) * 4
    return Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) > 70
  }
  const widest = Math.max(...smoothRadius)
  let labelTop = headTop
  while (labelTop < bottom && !(smoothRadius[labelTop] > widest * 0.95 && isPrinted(labelTop))) labelTop++
  let labelBottom = bottom
  while (labelBottom > labelTop && !isPrinted(labelBottom)) labelBottom--

  // Back-of-label colour per row, sampled just inside each silhouette edge so the seam with the photo stays invisible.
  const back = document.createElement('canvas')
  back.width = 2
  back.height = height
  const backContext = back.getContext('2d')
  if (!backContext) throw new Error('2D canvas를 사용할 수 없습니다.')
  const edges = [0, 1].map(() => [0, 1, 2].map(() => new Float32Array(height)))
  for (let y = labelTop; y <= labelBottom; y++) {
    const r = smoothRadius[y]
    for (const [side, sign] of [[0, -1], [1, 1]] as const) {
      const channels: number[][] = [[], [], []]
      const from = Math.round(smoothCenter[y] + sign * r * 0.93)
      const to = Math.round(smoothCenter[y] + sign * r * 0.975)
      for (let x = Math.min(from, to); x <= Math.max(from, to); x++) {
        const index = (y * width + Math.min(width - 1, Math.max(0, x))) * 4
        if (pixels[index + 3] < 128) continue
        for (let c = 0; c < 3; c++) channels[c].push(pixels[index + c])
      }
      for (let c = 0; c < 3; c++) edges[side][c][y] = median(channels[c])
    }
  }
  // Blend each colour over neighbouring rows so stray text pixels near the edge don't streak across the back.
  const backPixels = backContext.createImageData(2, height)
  for (let y = labelTop; y <= labelBottom; y++) {
    const from = Math.max(labelTop, y - 10)
    const to = Math.min(labelBottom, y + 10)
    for (let side = 0; side < 2; side++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let k = from; k <= to; k++) sum += edges[side][c][k]
        backPixels.data[(y * 2 + side) * 4 + c] = sum / (to - from + 1)
      }
      backPixels.data[(y * 2 + side) * 4 + 3] = 255
    }
  }
  backContext.putImageData(backPixels, 0, 0)

  return {
    width,
    height,
    top: headTop,
    bottom,
    labelTop,
    labelBottom,
    center: smoothCenter,
    radius: smoothRadius,
    back,
    spout: spoutTop >= 0 ? { left: spoutLeft, top: spoutTop, bottom: spoutBottom, axis: center[spoutBottom] } : null,
  }
}

const radialTexture = (inner: string, outer: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, inner)
    gradient.addColorStop(1, outer)
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }
  return new CanvasTexture(canvas)
}

export async function createBottleScene(canvas: HTMLCanvasElement, imageUrl: string, { still = false } = {}): Promise<BottleScene> {
  const image = await loadImage(imageUrl)
  const silhouette = readSilhouette(image)
  const { width, height, top, bottom, labelTop, labelBottom, center, radius } = silhouette

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment

  const camera = new PerspectiveCamera(26, 1, 0.1, 100)
  const unit = 1 / 250

  // Image row -> height on the bottle, with the label band stretched to the real proportions.
  const baseHeight = (bottom - labelBottom) * unit
  const labelHeight = (labelBottom - labelTop) * unit * labelStretch
  const capHeight = (labelTop - top) * unit
  const bodyHeight = baseHeight + labelHeight + capHeight
  const rowY = (row: number) => {
    const y = row >= labelBottom
      ? (bottom - row) * unit
      : row >= labelTop
        ? baseHeight + (labelBottom - row) * unit * labelStretch
        : baseHeight + labelHeight + (labelTop - row) * unit
    return y - bodyHeight / 2
  }

  const lathe = (from: number, to: number, closeBottom: boolean, closeTop: boolean, phiStart = 0, phiLength = Math.PI * 2) => {
    const rows: number[] = []
    for (let y = from; y > to; y -= 3) rows.push(y)
    rows.push(to)
    const points = rows.map((y) => new Vector2(Math.max(radius[y], 0.001) * unit, rowY(y)))
    if (closeBottom) { points.unshift(new Vector2(0, rowY(from) - 0.001)); rows.unshift(from) }
    if (closeTop) { points.push(new Vector2(0, rowY(to) + 0.001)); rows.push(to) }
    return { geometry: new LatheGeometry(points, 96, phiStart, phiLength), rows }
  }

  const frontTexture = new Texture(image)
  frontTexture.colorSpace = SRGBColorSpace
  frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  frontTexture.needsUpdate = true
  const backTexture = new CanvasTexture(silhouette.back)
  backTexture.colorSpace = SRGBColorSpace
  backTexture.magFilter = LinearFilter
  backTexture.minFilter = LinearFilter
  backTexture.generateMipmaps = false

  // Label: the printed artwork unlit (emissive) under a thin gloss, so it reads exactly as designed.
  const label = (map: Texture) => new MeshPhysicalMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: map,
    roughness: 0.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.22,
    envMapIntensity: 0.4,
  })
  const frontMaterial = label(frontTexture)
  const backMaterial = label(backTexture)
  // Cap, shoulder and base: dark smoky glossy plastic lit by the environment, so highlights move as it turns.
  const plasticMaterial = new MeshPhysicalMaterial({
    color: 0x110b0c,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 0.75,
  })
  const orificeMaterial = new MeshStandardMaterial({ color: 0x050405, roughness: 0.9 })

  const front = lathe(labelBottom, labelTop, false, false, -Math.PI / 2, Math.PI)
  const back = lathe(labelBottom, labelTop, false, false, Math.PI / 2, Math.PI)
  const mapLabelUVs = ({ geometry, rows }: ReturnType<typeof lathe>, isBack: boolean) => {
    const position = geometry.getAttribute('position')
    const uv = geometry.getAttribute('uv')
    for (let i = 0; i < position.count; i++) {
      const row = rows[i % rows.length]
      const v = 1 - (row + 0.5) / height
      if (isBack) {
        let angle = Math.atan2(position.getX(i), position.getZ(i))
        if (angle < 0) angle += Math.PI * 2
        uv.setXY(i, 0.75 - 0.5 * ((angle - Math.PI / 2) / Math.PI), v)
      } else {
        uv.setXY(i, (center[row] + (position.getX(i) / unit) * 0.985) / width, v)
      }
    }
    uv.needsUpdate = true
  }
  mapLabelUVs(front, false)
  mapLabelUVs(back, true)
  const cap = lathe(labelTop, top, false, true)
  const base = lathe(bottom, labelBottom, true, false)

  const bottle = new Group()
  bottle.add(
    new Mesh(front.geometry, frontMaterial),
    new Mesh(back.geometry, backMaterial),
    new Mesh(cap.geometry, plasticMaterial),
    new Mesh(base.geometry, plasticMaterial),
  )

  // Spray nozzle: a short bar running from the middle of the pump head's flat top out past its side, with the
  // spray hole at the tip. Only the tip sticks out; the rest is a low ridge on the head. The render's outline also
  // includes the bar's top face seen from above, so the bar itself is shorter than that outline.
  const geometries: BufferGeometry[] = [front.geometry, back.geometry, cap.geometry, base.geometry]
  if (silhouette.spout) {
    const { left, top: spoutTop, bottom: spoutBottom, axis } = silhouette.spout
    const length = (axis - left) * unit
    const barHeight = (spoutBottom - spoutTop + 1) * unit * 0.72
    const depth = barHeight * 0.95
    const nozzleGeometry = new RoundedBoxGeometry(length, barHeight, depth, 4, barHeight * 0.24)
    const orificeGeometry = new RoundedBoxGeometry(barHeight * 0.14, barHeight * 0.38, depth * 0.38, 2, barHeight * 0.06)
    const barTop = rowY(top) + barHeight * 0.18
    const nozzle = new Mesh(nozzleGeometry, plasticMaterial)
    nozzle.position.set(-length / 2, barTop - barHeight / 2, 0)
    const orifice = new Mesh(orificeGeometry, orificeMaterial)
    orifice.position.set(-length - barHeight * 0.03, barTop - barHeight / 2, 0)
    bottle.add(nozzle, orifice)
    geometries.push(nozzleGeometry, orificeGeometry)
  }
  scene.add(bottle)
  const bodyDiameter = radius[Math.round((labelTop + labelBottom) / 2)] * 2 * unit
  const bottleHeight = bodyHeight

  const shadowTexture = radialTexture('rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0)')
  const shadowMaterial = new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
  const shadowGeometry = new PlaneGeometry(1, 1)
  const shadow = new Mesh(shadowGeometry, shadowMaterial)
  shadow.rotation.x = -Math.PI / 2
  scene.add(shadow)

  // Drifting star field in front of and behind the bottle sells the depth as it moves.
  const starTexture = radialTexture('rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)')
  const starGeometry = new BufferGeometry()
  const starPositions: number[] = []
  const starColors: number[] = []
  const palette = [[1, 0.86, 0.45], [0.82, 0.66, 1], [1, 1, 1]]
  for (let i = 0; i < 260; i++) {
    starPositions.push((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 9, -7 + Math.random() * 9)
    starColors.push(...palette[i % palette.length])
  }
  starGeometry.setAttribute('position', new Float32BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('color', new Float32BufferAttribute(starColors, 3))
  const starMaterial = new PointsMaterial({
    size: 0.07,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const stars = new Points(starGeometry, starMaterial)
  scene.add(stars)

  let viewWidth = 1
  let viewHeight = 1
  let poses = desktopPoses
  let fill = 0.78
  let targetProgress = 0
  let progress = 0
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
  let active = false
  let frame = 0

  const render = (time: number) => {
    const ease = still ? 1 : 0.075
    progress += (targetProgress - progress) * ease
    pointer.x += (pointer.targetX - pointer.x) * 0.06
    pointer.y += (pointer.targetY - pointer.y) * 0.06

    const pose = poseAt(poses, progress)
    const scale = ((viewHeight * fill) / bottleHeight) * pose.scale
    const float = still ? 0 : Math.sin(time / 900) * viewHeight * 0.008
    const sway = still ? 0 : Math.sin(time / 1700) * 0.03
    bottle.scale.setScalar(scale)
    bottle.position.set(pose.x * viewWidth * 0.5, pose.y * viewHeight * 0.5 + float, 0)
    bottle.rotation.set(pose.rotX + pointer.y * 0.08, pose.rotY + pointer.x * 0.22 + sway, pose.rotZ)

    const baseY = bottle.position.y - (bodyHeight * scale) / 2
    shadow.position.set(bottle.position.x, baseY - 0.02 - float, 0)
    shadow.scale.set(bodyDiameter * scale * 2.6, bodyDiameter * scale * 1, 1)
    shadowMaterial.opacity = 0.8 - float * 4

    stars.rotation.y = progress * 0.7 + pointer.x * 0.05
    stars.position.y = (progress - 0.5) * 0.8

    renderer.render(scene, camera)
    frame = active && !still ? requestAnimationFrame(render) : 0
  }
  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render)
  }

  const resize = () => {
    const parent = canvas.parentElement
    const w = parent?.clientWidth || canvas.clientWidth || 1
    const h = parent?.clientHeight || canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const distance = 9
    camera.position.set(0, 0.55, distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance
    viewWidth = viewHeight * camera.aspect
    const mobile = w < 820
    poses = mobile ? mobilePoses : desktopPoses
    fill = mobile ? 0.44 : 0.78
    requestRender()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

  return {
    setProgress: (value) => {
      targetProgress = Math.min(1, Math.max(0, value))
      if (still) requestRender()
    },
    setPointer: (x, y) => {
      if (still) return
      pointer.targetX = x
      pointer.targetY = y
    },
    setActive: (value) => {
      if (value === active) return
      active = value
      if (active) requestRender()
    },
    dispose: () => {
      active = false
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      const disposables = [
        ...geometries, shadowGeometry, starGeometry,
        frontMaterial, backMaterial, plasticMaterial, orificeMaterial, shadowMaterial, starMaterial,
        frontTexture, backTexture, shadowTexture, starTexture, environment,
      ]
      for (const disposable of disposables) disposable.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
