import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup } from '../src/renderer/src/data'
import { groupEntities } from '../src/renderer/src/lib/compendiumGroups'
import type { EntityKind } from '../src/renderer/src/types'

const of = (k: EntityKind) => allEntities.filter((e) => e.kind === k)

describe('compendium groups', () => {
  it('groups subclasses by class, with Warlock holding all warlock subclasses', () => {
    const g = groupEntities('subclass', of('subclass'), baseLookup)
    const warlock = g.find((x) => x.label === 'Warlock')!
    expect(warlock.items.length).toBe(of('subclass').filter((s) => (s as { classId: string }).classId === 'warlock').length)
    expect(g.map((x) => x.label)).toEqual([...g.map((x) => x.label)].sort((a, b) => a.localeCompare(b)))
  })
  it('orders spells by level and feats by category', () => {
    expect(groupEntities('spell', of('spell'), baseLookup).map((x) => x.label).slice(0, 3)).toEqual(['Cantrips', 'Level 1', 'Level 2'])
    expect(groupEntities('feat', of('feat'), baseLookup)[0].label).toBe('Origin Feats')
    expect(groupEntities('weapon', of('weapon'), baseLookup).map((x) => x.label)).toEqual(['Simple Melee Weapons', 'Simple Ranged Weapons', 'Martial Melee Weapons', 'Martial Ranged Weapons'])
    expect(groupEntities('magicItem', of('magicItem'), baseLookup)[0].label).toBe('Common')
  })
  it('keeps every entity exactly once', () => {
    for (const k of ['subclass', 'spell', 'feat', 'weapon', 'armor', 'gear', 'tool', 'magicItem', 'rule', 'language', 'creature', 'deity', 'species', 'background', 'class', 'condition'] as EntityKind[]) {
      const list = of(k)
      expect(groupEntities(k, list, baseLookup).reduce((s, g) => s + g.items.length, 0), k).toBe(list.length)
    }
  })
})
