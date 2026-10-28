import { describe, expect, it } from 'vitest'
import { dieDef, faceNormal, centroid, topIndex, relabel, helpers, type DieKind } from '../src/renderer/src/components/dice3d/geometry'

const KINDS: [DieKind, number, number][] = [['d4', 4, 4], ['d6', 6, 6], ['d8', 8, 8], ['d10', 10, 10], ['d12', 12, 12], ['d20', 20, 20], ['d100', 10, 10]]

describe('3D dice geometry', () => {
  for (const [kind, faces, values] of KINDS) {
    it(`${kind}: ${faces} outward, planar faces and unique values`, () => {
      const d = dieDef(kind)
      expect(d.faces).toHaveLength(faces)
      expect(new Set(d.values).size).toBe(values)
      for (const f of d.faces) {
        const n = faceNormal(d.vertices, f)
        const c = centroid(d.vertices, f)
        expect(helpers.dot(n, c)).toBeGreaterThan(0)
        // Alle hjørner i samme plan
        for (const i of f) expect(Math.abs(helpers.dot(helpers.sub(d.vertices[i], c), n))).toBeLessThan(1e-3)
      }
    })
  }
  it('opposite faces sum like real dice (d6=7, d8=9, d12=13, d20=21)', () => {
    for (const [kind, sum] of [['d6', 7], ['d8', 9], ['d12', 13], ['d20', 21]] as const) {
      const d = dieDef(kind)
      const ns = d.faces.map((f) => faceNormal(d.vertices, f))
      ns.forEach((n, i) => {
        const j = ns.findIndex((m) => helpers.dot(m, n) < -0.99)
        expect(d.values[i] + d.values[j], kind).toBe(sum)
      })
    }
  })
  it('finds the face pointing up and relabels it to the wanted value', () => {
    const d = dieDef('d20')
    const top = topIndex(d, [0, 0, 0, 1])
    const n = faceNormal(d.vertices, d.faces[top])
    expect(n[2]).toBe(Math.max(...d.faces.map((f) => faceNormal(d.vertices, f)[2])))
    const vals = relabel(d, top, 20)
    expect(vals[top]).toBe(20)
    expect(new Set(vals).size).toBe(20)
    // 180° rundt x: siden som pekte ned peker nå opp
    const flipped = topIndex(d, [1, 0, 0, 0])
    expect(faceNormal(d.vertices, d.faces[flipped])[2]).toBeLessThan(0)
  })
})
