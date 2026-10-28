import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { DICE_THEMES } from './themes'
import { dieDef, faceNormal, centroid, helpers, labelFor, relabel, topIndex, type DieDef, type DieKind, type V3 } from './geometry'

export { DICE_THEMES }

export interface ThrowDie {
  sides: number
  value: number
  kept: boolean
}

interface Live {
  mesh: THREE.Group
  frames: Float32Array
  kept: boolean
  crit: boolean
  fumble: boolean
}

const STEP = 1 / 60
const MAX_STEPS = 420
const TEX = 256

/* ------------------------------------------------------------------ */
/* Teksturer                                                           */
/* ------------------------------------------------------------------ */

const texCache = new Map<string, THREE.Texture>()

/** Én tekstur per side: bakgrunn i terningfargen og tallet midt på (d4: tre tall mot hjørnene) */
function faceTexture(theme: string, labels: string[], d4Corners: { x: number; y: number }[] | null, sizeFactor: number): THREE.Texture {
  const key = `${theme}|${labels.join(',')}|${d4Corners ? 'd4' : sizeFactor.toFixed(2)}`
  const hit = texCache.get(key)
  if (hit) return hit
  const th = DICE_THEMES[theme] ?? DICE_THEMES.obsidian
  const c = document.createElement('canvas')
  c.width = c.height = TEX
  const g = c.getContext('2d')!
  // Litt dybde i fargen: radial gradient fra midten
  const grad = g.createRadialGradient(TEX / 2, TEX / 2, TEX * 0.05, TEX / 2, TEX / 2, TEX * 0.7)
  grad.addColorStop(0, shade(th.body, 0.18))
  grad.addColorStop(1, shade(th.body, -0.12))
  g.fillStyle = grad
  g.fillRect(0, 0, TEX, TEX)
  g.fillStyle = th.text
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,0.45)'
  g.shadowBlur = 6
  if (d4Corners) {
    // d4: tallet ved hvert hjørne, rotert så det «står» mot hjørnet
    g.font = `700 ${Math.round(TEX * 0.17)}px Cinzel, Georgia, serif`
    d4Corners.forEach((p, i) => {
      const cx = TEX / 2 + (p.x - 0.5) * TEX * 0.62
      const cy = TEX / 2 - (p.y - 0.5) * TEX * 0.62
      g.save()
      g.translate(cx, cy)
      g.rotate(Math.atan2(p.x - 0.5, p.y - 0.5))
      g.fillText(labels[i], 0, 0)
      g.restore()
    })
  } else {
    const text = labels[0]
    const size = TEX * sizeFactor * (text.length > 2 ? 0.62 : text.length > 1 ? 0.8 : 1)
    g.font = `700 ${Math.round(size)}px Cinzel, Georgia, serif`
    g.fillText(text, TEX / 2, TEX / 2 + size * 0.04)
    // 6 og 9 får strek under
    if (text === '6' || text === '9') g.fillRect(TEX / 2 - size * 0.22, TEX / 2 + size * 0.42, size * 0.44, Math.max(3, size * 0.06))
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  texCache.set(key, tex)
  return tex
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number): number => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) * amt : v * amt))))
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`
}

/* ------------------------------------------------------------------ */
/* Mesh                                                                */
/* ------------------------------------------------------------------ */

/** Hvor stort tallet kan være i forhold til siden (innsirkel / omsirkel) */
const SIZE_FACTOR: Record<string, number> = { d6: 0.62, d8: 0.38, d10: 0.36, d100: 0.36, d12: 0.46, d20: 0.36 }

function buildMesh(def: DieDef, values: number[], theme: string): THREE.Group {
  const kind = def.kind
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const geo = new THREE.BufferGeometry()
  const mats: THREE.Material[] = []
  let start = 0
  def.faces.forEach((f, fi) => {
    const vs = f.map((i) => def.vertices[i])
    const n = faceNormal(def.vertices, f)
    const c = centroid(def.vertices, f)
    const e1 = helpers.norm(helpers.sub(vs[0], c))
    // Høyre = opp × normal (sett utenfra) – ellers blir tallene speilvendt
    const e2 = helpers.cross(e1, n)
    const R = Math.max(...vs.map((v) => helpers.len(helpers.sub(v, c))))
    const uvOf = (p: V3): [number, number] => {
      const d = helpers.sub(p, c)
      return [0.5 + helpers.dot(d, e2) / (2 * R), 0.5 + helpers.dot(d, e1) / (2 * R)]
    }
    let count = 0
    for (let k = 1; k < vs.length - 1; k++) {
      for (const p of [vs[0], vs[k], vs[k + 1]]) {
        pos.push(...p)
        nor.push(...n)
        uv.push(...uvOf(p))
        count++
      }
    }
    geo.addGroup(start, count, fi)
    start += count
    let tex: THREE.Texture
    if (def.vertexValues) {
      // d4: hvert hjørne på siden viser verdien til det hjørnet
      const labels = f.map((vi) => labelFor(kind, values[vi]))
      const corners = vs.map((p) => {
        const [x, y] = uvOf(p)
        return { x, y }
      })
      tex = faceTexture(theme, labels, corners, 0)
    } else tex = faceTexture(theme, [labelFor(kind, values[fi])], null, SIZE_FACTOR[kind] ?? 0.4)
    mats.push(
      new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: 0.5,
        metalness: theme === 'gold' ? 0.45 : 0.0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.45,
        specularIntensity: 0.35
      })
    )
  })
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  const mesh = new THREE.Mesh(geo, mats)
  mesh.castShadow = true
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 10),
    new THREE.LineBasicMaterial({ color: (DICE_THEMES[theme] ?? DICE_THEMES.obsidian).edge, transparent: true, opacity: 0.55 })
  )
  const group = new THREE.Group()
  group.add(mesh, edges)
  return group
}

function kindOf(sides: number): DieKind {
  return sides === 4 ? 'd4' : sides === 6 ? 'd6' : sides === 8 ? 'd8' : sides === 10 ? 'd10' : sides === 12 ? 'd12' : sides === 100 ? 'd100' : 'd20'
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export class DiceScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 1, 200)
  private live: Live[] = []
  private raf = 0
  private t0 = 0
  private steps = 0
  private impacts: { step: number; v: number }[] = []
  private nextImpact = 0
  private halfW = 10
  private halfH = 10
  private glow: THREE.PointLight[] = []
  onImpact: (strength: number) => void = () => {}
  onSettled: () => void = () => {}
  onDone: () => void = () => {}

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.95
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // Svakt, rotert miljø for refleksjoner uten at taklyset speiles rett i kameraet
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.12
    this.scene.environmentRotation.set(Math.PI / 2.4, 0, 0)
    this.camera.position.set(0, -6, 40)
    this.camera.lookAt(0, 0, 0)
    this.scene.add(new THREE.HemisphereLight(0xfff4e0, 0x202030, 0.35))
    const key = new THREE.DirectionalLight(0xffe2b0, 1.5)
    key.position.set(-14, 16, 18)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = key.shadow.camera.bottom = -26
    key.shadow.camera.right = key.shadow.camera.top = 26
    key.shadow.radius = 6
    key.shadow.bias = -0.0005
    this.scene.add(key)
    const rim = new THREE.DirectionalLight(0x9db7ff, 0.6)
    rim.position.set(10, -8, 10)
    this.scene.add(rim)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.38 }))
    ground.receiveShadow = true
    this.scene.add(ground)
    this.resize()
  }

  resize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const dist = this.camera.position.length()
    this.halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * dist * 0.92
    this.halfW = this.halfH * this.camera.aspect
  }

  /** Kast terningene: fysikken simuleres først, så merkes sidene om slik at riktig verdi havner opp */
  throw(dice: ThrowDie[], theme: string): number {
    this.clear()
    this.resize()
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, -70) })
    world.allowSleep = true
    world.broadphase = new CANNON.SAPBroadphase(world)
    const dieMat = new CANNON.Material('die')
    const floorMat = new CANNON.Material('floor')
    world.addContactMaterial(new CANNON.ContactMaterial(dieMat, floorMat, { friction: 0.35, restitution: 0.38 }))
    world.addContactMaterial(new CANNON.ContactMaterial(dieMat, dieMat, { friction: 0.2, restitution: 0.45 }))
    const floor = new CANNON.Body({ mass: 0, material: floorMat, shape: new CANNON.Plane() })
    world.addBody(floor)
    const wall = (pos: [number, number], axis: CANNON.Vec3, angle: number): void => {
      const b = new CANNON.Body({ mass: 0, material: floorMat, shape: new CANNON.Plane() })
      b.position.set(pos[0], pos[1], 0)
      b.quaternion.setFromAxisAngle(axis, angle)
      world.addBody(b)
    }
    wall([this.halfW, 0], new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
    wall([-this.halfW, 0], new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    wall([0, this.halfH], new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    wall([0, -this.halfH], new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    // d100 blir to d10: tiere og enere
    const list: { def: DieDef; value: number; kept: boolean; crit: boolean; fumble: boolean }[] = []
    for (const d of dice.slice(0, 24)) {
      if (d.sides === 100) {
        const v = d.value % 100
        list.push({ def: dieDef('d100'), value: Math.floor(v / 10) * 10 || 100, kept: d.kept, crit: false, fumble: false })
        list.push({ def: dieDef('d10'), value: v % 10 || 10, kept: d.kept, crit: false, fumble: false })
      } else {
        const def = dieDef(kindOf(d.sides))
        list.push({ def, value: d.value, kept: d.kept, crit: d.sides === 20 && d.value === 20 && d.kept, fumble: d.sides === 20 && d.value === 1 && d.kept })
      }
    }

    const bodies = list.map((d, i) => {
      const shape = new CANNON.ConvexPolyhedron({ vertices: d.def.vertices.map((v) => new CANNON.Vec3(...v)), faces: d.def.faces })
      const b = new CANNON.Body({ mass: 1, material: dieMat, shape, linearDamping: 0.22, angularDamping: 0.28 })
      b.allowSleep = true
      b.sleepSpeedLimit = 0.5
      b.sleepTimeLimit = 0.2
      // Kastes inn fra nederkanten mot midten av skjermen
      const col = i % 6
      const row = Math.floor(i / 6)
      b.position.set(-this.halfW * 0.25 + col * 2.2 + Math.random() * 0.6, -this.halfH + 1.6 + row * 2, 3 + Math.random() * 3)
      b.velocity.set((Math.random() - 0.6) * 10, 16 + Math.random() * 8, 2 + Math.random() * 3)
      b.angularVelocity.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 26)
      b.quaternion.setFromEuler(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28)
      b.addEventListener('collide', (e: { contact: CANNON.ContactEquation }) => {
        const v = Math.abs(e.contact.getImpactVelocityAlongNormal())
        if (v > 2.5) this.impacts.push({ step: this.steps, v })
      })
      world.addBody(b)
      return b
    })

    // Simuler hele kastet på forhånd og ta opp posisjoner
    const frames = bodies.map(() => new Float32Array(MAX_STEPS * 7))
    this.impacts = []
    this.steps = 0
    for (; this.steps < MAX_STEPS; this.steps++) {
      world.step(STEP)
      bodies.forEach((b, i) => {
        const o = this.steps * 7
        frames[i].set([b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w], o)
      })
      if (this.steps > 30 && bodies.every((b) => b.sleepState === CANNON.Body.SLEEPING)) {
        this.steps++
        break
      }
    }

    // Merk om sidene slik at verdien appen rullet havner opp
    this.live = list.map((d, i) => {
      const o = (this.steps - 1) * 7
      const q: [number, number, number, number] = [frames[i][o + 3], frames[i][o + 4], frames[i][o + 5], frames[i][o + 6]]
      const top = topIndex(d.def, q)
      const values = relabel(d.def, top, d.value)
      const mesh = buildMesh(d.def, values, theme)
      this.scene.add(mesh)
      return { mesh, frames: frames[i], kept: d.kept, crit: d.crit, fumble: d.fumble }
    })
    this.nextImpact = 0
    this.canvas.style.opacity = '1'
    this.canvas.style.display = 'block'
    this.t0 = performance.now()
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(this.tick)
    return (this.steps * STEP * 1000) | 0
  }

  private settled = false
  private settleTime = 0

  private tick = (now: number): void => {
    const f = Math.min(this.steps - 1, Math.floor(((now - this.t0) / 1000) * 60))
    for (const l of this.live) {
      const o = f * 7
      l.mesh.position.set(l.frames[o], l.frames[o + 1], l.frames[o + 2])
      l.mesh.quaternion.set(l.frames[o + 3], l.frames[o + 4], l.frames[o + 5], l.frames[o + 6])
    }
    let played = 0
    while (this.nextImpact < this.impacts.length && this.impacts[this.nextImpact].step <= f) {
      if (played < 2) this.onImpact(Math.min(1, this.impacts[this.nextImpact].v / 25))
      played++
      this.nextImpact++
    }
    if (f >= this.steps - 1 && !this.settled) {
      this.settled = true
      this.settleTime = now
      this.markResults()
      this.onSettled()
    }
    if (this.settled) {
      const held = now - this.settleTime
      const pulse = 0.5 + 0.5 * Math.sin(held / 160)
      for (const g of this.glow) g.intensity = 25 + 35 * pulse
      if (held > 2600) this.canvas.style.opacity = String(Math.max(0, 1 - (held - 2600) / 600))
      if (held > 3200) {
        this.clear()
        this.onDone()
        return
      }
    }
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  /** Dim terninger som ikke teller (advantage/kh), og la nat 20 / nat 1 gløde */
  private markResults(): void {
    for (const l of this.live) {
      if (!l.kept) {
        l.mesh.traverse((o) => {
          const m = (o as THREE.Mesh).material
          for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
            const mm = mat as THREE.Material
            mm.transparent = true
            mm.opacity = 0.35
            mm.needsUpdate = true
          }
        })
      }
      if (l.crit || l.fumble) {
        const light = new THREE.PointLight(l.crit ? 0xffd27a : 0xff3b3b, 40, 8, 1.6)
        light.position.set(l.mesh.position.x, l.mesh.position.y, l.mesh.position.z + 2.2)
        this.scene.add(light)
        this.glow.push(light)
      }
    }
  }

  clear(): void {
    cancelAnimationFrame(this.raf)
    for (const l of this.live) {
      this.scene.remove(l.mesh)
      l.mesh.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material
        for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) x.dispose()
      })
    }
    for (const g of this.glow) this.scene.remove(g)
    this.glow = []
    this.live = []
    this.settled = false
    this.renderer.clear()
    this.canvas.style.display = 'none'
  }

  dispose(): void {
    this.clear()
    this.renderer.dispose()
  }
}
