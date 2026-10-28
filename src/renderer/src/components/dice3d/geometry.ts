/**
 * Geometri for 3D-terninger: hjørner, sider (CCW sett utenfra) og tall på hver side.
 * Ren matte uten three.js, slik at fysikk og grafikk kan bygge på samme data (og testes).
 */

export type V3 = [number, number, number]

export type DieKind = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface DieDef {
  kind: DieKind
  vertices: V3[]
  /** Hjørne-indekser per side, mot klokka sett utenfra */
  faces: number[][]
  /** Verdien hver side viser (d4: verdien per hjørne – resultatet leses fra hjørnet som peker opp) */
  values: number[]
  /** d4 leses fra hjørner, de andre fra sider */
  vertexValues?: boolean
}

const PHI = (1 + Math.sqrt(5)) / 2

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const len = (a: V3): number => Math.sqrt(dot(a, a))
const norm = (a: V3): V3 => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]

export function centroid(vs: V3[], face: number[]): V3 {
  const c: V3 = [0, 0, 0]
  for (const i of face) for (let k = 0; k < 3; k++) c[k] += vs[i][k] / face.length
  return c
}

export function faceNormal(vs: V3[], face: number[]): V3 {
  // Newell-metoden – robust også for mangekanter
  const n: V3 = [0, 0, 0]
  for (let i = 0; i < face.length; i++) {
    const a = vs[face[i]]
    const b = vs[face[(i + 1) % face.length]]
    n[0] += (a[1] - b[1]) * (a[2] + b[2])
    n[1] += (a[2] - b[2]) * (a[0] + b[0])
    n[2] += (a[0] - b[0]) * (a[1] + b[1])
  }
  return norm(n)
}

/** Sørg for at siden er mot klokka sett utenfra (normal peker bort fra sentrum) */
function orientOutward(vs: V3[], face: number[]): number[] {
  return dot(faceNormal(vs, face), centroid(vs, face)) < 0 ? [...face].reverse() : face
}

/** Sorter hjørnene rundt en normal (mot klokka sett fra normalens side) */
function sortAround(vs: V3[], idx: number[], n: V3): number[] {
  const c = centroid(vs, idx)
  const ref = norm(sub(vs[idx[0]], c))
  const ref2 = cross(n, ref)
  return [...idx].sort((a, b) => {
    const da = sub(vs[a], c)
    const db = sub(vs[b], c)
    return Math.atan2(dot(da, ref2), dot(da, ref)) - Math.atan2(dot(db, ref2), dot(db, ref))
  })
}

/** Skaler slik at alle hjørner ligger på en kule med gitt radius */
function circum(vs: V3[], r: number): V3[] {
  const m = Math.max(...vs.map(len))
  return vs.map((v) => scale(v, r / m))
}

/** Tall for motstående sider: par (a, b) får verdier som summerer til n+1 */
function opposingValues(vs: V3[], faces: number[][]): number[] {
  const normals = faces.map((f) => faceNormal(vs, f))
  const vals = new Array<number>(faces.length).fill(0)
  const n = faces.length
  let next = 1
  // Spre lave/høye tall rundt terningen: velg sider i en fast rekkefølge, gi motsatt side n+1−v
  const order = faces.map((_, i) => i).sort((a, b) => normals[b][2] - normals[a][2] || normals[b][0] - normals[a][0])
  for (const i of order) {
    if (vals[i]) continue
    const opp = normals.findIndex((m, j) => j !== i && !vals[j] && dot(m, normals[i]) < -0.99)
    vals[i] = next
    if (opp >= 0) vals[opp] = n + 1 - next
    next++
  }
  return vals
}

/** Sidene til et konvekst legeme: alle plan gjennom tre hjørner der resten ligger bak, slått sammen */
function hullFaces(vs: V3[]): number[][] {
  const out: number[][] = []
  const seen = new Set<string>()
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++)
      for (let k = j + 1; k < vs.length; k++) {
        let n = cross(sub(vs[j], vs[i]), sub(vs[k], vs[i]))
        if (len(n) < 1e-9) continue
        n = norm(n)
        const d = dot(n, vs[i])
        const side = vs.map((v) => dot(n, v) - d)
        const pos = side.some((x) => x > 1e-6)
        const neg = side.some((x) => x < -1e-6)
        if (pos && neg) continue
        if (pos) n = scale(n, -1)
        const on = side.map((x, idx) => [x, idx] as const).filter(([x]) => Math.abs(x) < 1e-6).map(([, idx]) => idx)
        const key = [...on].sort((a, b) => a - b).join(',')
        if (seen.has(key)) continue
        seen.add(key)
        out.push(sortAround(vs, on, n))
      }
  return out
}

function d4(): DieDef {
  const vs = circum([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], 1.25)
  const faces = [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]].map((f) => orientOutward(vs, f))
  return { kind: 'd4', vertices: vs, faces, values: [1, 2, 3, 4], vertexValues: true }
}

function d6(): DieDef {
  const vs: V3[] = []
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) vs.push([x, y, z])
  const s = circum(vs, 1.08)
  const faces: number[][] = []
  for (let axis = 0; axis < 3; axis++)
    for (const sign of [-1, 1]) {
      const idx = s.map((v, i) => [v, i] as const).filter(([v]) => Math.sign(v[axis]) === sign).map(([, i]) => i)
      const n: V3 = [0, 0, 0]
      n[axis] = sign
      faces.push(sortAround(s, idx, n))
    }
  return { kind: 'd6', vertices: s, faces, values: opposingValues(s, faces) }
}

function d8(): DieDef {
  const vs = circum([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], 1.15)
  const faces: number[][] = []
  for (const x of [0, 1]) for (const y of [2, 3]) for (const z of [4, 5]) faces.push(orientOutward(vs, [x, y, z]))
  return { kind: 'd8', vertices: vs, faces, values: opposingValues(vs, faces) }
}

function d10(tens = false): DieDef {
  // Pentagonal trapezohedron med plane drageformede sider: h = z1 (1+cos36°)/(1−cos36°)
  const c36 = Math.cos(Math.PI / 5)
  const z1 = 0.106
  const h = (z1 * (1 + c36)) / (1 - c36)
  const vs: V3[] = [[0, 0, h], [0, 0, -h]]
  for (let k = 0; k < 5; k++) {
    const a = (2 * Math.PI * k) / 5
    vs.push([Math.cos(a), Math.sin(a), z1])
  }
  for (let k = 0; k < 5; k++) {
    const a = (2 * Math.PI * k) / 5 + Math.PI / 5
    vs.push([Math.cos(a), Math.sin(a), -z1])
  }
  const U = (k: number): number => 2 + ((k + 5) % 5)
  const Lo = (k: number): number => 7 + ((k + 5) % 5)
  const faces: number[][] = []
  for (let k = 0; k < 5; k++) faces.push(orientOutward(vs, [0, U(k), Lo(k), U(k + 1)]))
  for (let k = 0; k < 5; k++) faces.push(orientOutward(vs, [1, Lo(k), U(k + 1), Lo(k + 1)]))
  const s = circum(vs, 1.12)
  // Øvre sider 1,3,5,7,9 og nedre 2,4,6,8,10 (10 vises som 0); d100-tiere 10…100 (vises 10…90, 00)
  const values = [1, 7, 3, 9, 5, 4, 8, 2, 6, 10].map((v) => (tens ? v * 10 : v))
  return { kind: tens ? 'd100' : 'd10', vertices: s, faces, values }
}

function d12(): DieDef {
  const ip = 1 / PHI
  const raw: V3[] = []
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) raw.push([x, y, z])
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      raw.push([0, a * ip, b * PHI])
      raw.push([a * ip, b * PHI, 0])
      raw.push([a * PHI, 0, b * ip])
    }
  const vs = circum(raw, 1.12)
  const faces = hullFaces(vs)
  return { kind: 'd12', vertices: vs, faces, values: opposingValues(vs, faces) }
}

function d20(): DieDef {
  const raw: V3[] = []
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      raw.push([0, a, b * PHI])
      raw.push([a, b * PHI, 0])
      raw.push([a * PHI, 0, b])
    }
  const vs = circum(raw, 1.18)
  const edge = Math.min(...vs.slice(1).map((v) => len(sub(v, vs[0]))))
  const near = (i: number, j: number): boolean => Math.abs(len(sub(vs[i], vs[j])) - edge) < 1e-6
  const faces: number[][] = []
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) if (near(i, j) && near(j, k) && near(i, k)) faces.push(orientOutward(vs, [i, j, k]))
  return { kind: 'd20', vertices: vs, faces, values: opposingValues(vs, faces) }
}

const CACHE = new Map<string, DieDef>()

export function dieDef(kind: DieKind | 'd100tens'): DieDef {
  const key = kind
  if (!CACHE.has(key)) {
    const def = kind === 'd4' ? d4() : kind === 'd6' ? d6() : kind === 'd8' ? d8() : kind === 'd10' ? d10() : kind === 'd12' ? d12() : kind === 'd20' ? d20() : d10(true)
    CACHE.set(key, def)
  }
  return CACHE.get(key)!
}

/** Tekst som vises for en verdi */
export function labelFor(kind: DieKind, v: number): string {
  if (kind === 'd10') return v === 10 ? '0' : String(v)
  if (kind === 'd100') return v === 100 ? '00' : String(v)
  return String(v)
}

/** Hvilken side (eller hjørne for d4) som peker opp etter en rotasjon (kvaternion x,y,z,w) */
export function topIndex(def: DieDef, q: [number, number, number, number]): number {
  const rot = (v: V3): V3 => {
    const [x, y, z, w] = q
    const ix = w * v[0] + y * v[2] - z * v[1]
    const iy = w * v[1] + z * v[0] - x * v[2]
    const iz = w * v[2] + x * v[1] - y * v[0]
    const iw = -x * v[0] - y * v[1] - z * v[2]
    return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]
  }
  const dirs = def.vertexValues ? def.vertices.map(norm) : def.faces.map((f) => faceNormal(def.vertices, f))
  let best = 0
  let bestZ = -Infinity
  dirs.forEach((d, i) => {
    const z = rot(d)[2]
    if (z > bestZ) {
      bestZ = z
      best = i
    }
  })
  return best
}

/**
 * Bytt om tallene slik at siden (eller hjørnet) som havnet opp viser ønsket verdi.
 * Returnerer ny verdiliste (samme lengde som def.values).
 */
export function relabel(def: DieDef, top: number, wanted: number): number[] {
  const vals = [...def.values]
  const j = vals.indexOf(wanted)
  if (j < 0 || j === top) return vals
  ;[vals[top], vals[j]] = [vals[j], vals[top]]
  return vals
}

export const helpers = { sub, dot, cross, len, norm, scale }
