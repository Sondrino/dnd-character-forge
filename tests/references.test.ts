import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import type { EntityKind } from '../src/renderer/src/types'

/**
 * Alle id-er som data refererer til (always prepared, species-spells, startutstyr, recommended,
 * origin feats, verktøy) må peke på en entity som finnes.
 */
type Ref = { from: string; kind: EntityKind | 'item'; id: string }

function collectRefs(): Ref[] {
  const refs: Ref[] = []
  const add = (from: string, kind: Ref['kind'], ids: (string | undefined)[] | undefined): void => {
    for (const id of ids ?? []) if (id) refs.push({ from, kind, id })
  }
  for (const c of L.all('class')) {
    for (const o of c.startingEquipment ?? []) add(`${c.id} startingEquipment ${o.label}`, 'item', o.items.map((i) => i.id))
    const r = c.recommended ?? {}
    add(`${c.id} recommended.species`, 'species', r.species)
    add(`${c.id} recommended.backgrounds`, 'background', r.backgrounds)
    add(`${c.id} recommended.feats`, 'feat', r.feats)
    add(`${c.id} recommended.fightingStyles`, 'feat', r.fightingStyles)
    add(`${c.id} recommended.cantrips`, 'spell', r.cantrips)
    add(`${c.id} recommended.spells`, 'spell', r.spells)
    add(`${c.id} recommended.weapons`, 'item', r.weapons)
    add(`${c.id} toolProficiencies`, 'tool', c.toolProficiencies?.filter((t) => !t.startsWith('choice')))
  }
  for (const s of L.all('subclass')) {
    if (!L.get('class', s.classId)) refs.push({ from: `${s.id} classId`, kind: 'class', id: s.classId })
    for (const g of s.alwaysPrepared ?? []) add(`${s.id} alwaysPrepared L${g.level}`, 'spell', g.spells)
  }
  for (const sp of L.all('species')) for (const o of sp.options?.choices ?? []) add(`${sp.id}/${o.id} spells`, 'spell', o.spells?.map((x) => x.spellId))
  for (const b of L.all('background')) {
    add(`${b.id} originFeat`, 'feat', [b.originFeat])
    if (b.tool && !b.tool.startsWith('choice')) add(`${b.id} tool`, 'tool', [b.tool])
    for (const o of b.equipment ?? []) add(`${b.id} equipment ${o.label}`, 'item', o.items.map((i) => i.id))
  }
  return refs
}

const resolves = (r: Ref): boolean => (r.kind === 'item' ? !!L.item(r.id) : !!L.get(r.kind, r.id))

describe('referanser i data', () => {
  const refs = collectRefs()
  it('fant referanser å sjekke', () => {
    expect(refs.length).toBeGreaterThan(200)
  })
  it('alle ikke-spell-referanser finnes', () => {
    const bad = refs.filter((r) => r.kind !== 'spell' && !resolves(r)).map((r) => `${r.from} → ${r.kind}:${r.id}`)
    expect(bad).toEqual([])
  })
  it('alle spell-referanser finnes', () => {
    const bad = refs.filter((r) => r.kind === 'spell' && !resolves(r)).map((r) => `${r.from} → ${r.id}`)
    expect(bad).toEqual([])
  })
})
