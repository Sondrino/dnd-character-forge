import { describe, expect, it } from 'vitest'
import { allEntities } from '../src/renderer/src/data'
import { avgDice, byName, costGp, crValue, sortEntities, sortOptions } from '../src/renderer/src/lib/sorting'
import type { AnyEntity, EntityKind } from '../src/renderer/src/types'

const of = (k: EntityKind) => allEntities.filter((e) => e.kind === k)
const names = (l: AnyEntity[]) => l.map((e) => e.name)

describe('sorting helpers', () => {
  it('parses cost, CR and dice', () => {
    expect(costGp('15 GP')).toBe(15)
    expect(costGp('5 SP')).toBeCloseTo(0.5)
    expect(costGp('2 PP')).toBe(20)
    expect(costGp('1,500 GP')).toBe(1500)
    expect(crValue('1/4')).toBe(0.25)
    expect(crValue('12')).toBe(12)
    expect(avgDice('2d6')).toBe(7)
    expect(byName({ name: 'Level 2' }, { name: 'Level 10' })).toBeLessThan(0)
  })
})

describe('sort options per kind', () => {
  it('spells default to level, then name', () => {
    const s = sortEntities(of('spell'), 'spell')
    for (let i = 1; i < s.length; i++) {
      const a = s[i - 1] as { level: number; name: string }
      const b = s[i] as { level: number; name: string }
      expect(a.level <= b.level).toBe(true)
    }
  })
  it('magic items default to rarity, creatures to CR', () => {
    const items = sortEntities(of('magicItem'), 'magicItem') as { rarity: string }[]
    expect(items[0].rarity).toBe('common')
    expect(items.findIndex((i) => i.rarity === 'legendary')).toBeGreaterThan(items.findIndex((i) => i.rarity === 'rare'))
    const cr = sortEntities(of('creature'), 'creature') as { cr: string }[]
    expect(crValue(cr[0].cr)).toBeLessThanOrEqual(crValue(cr[cr.length - 1].cr))
  })
  it('weapons by category puts simple melee first and martial ranged last; damage sort puts heavy hitters first', () => {
    const w = sortEntities(of('weapon'), 'weapon') as { category: string; weaponType: string; damage: string }[]
    expect(`${w[0].category} ${w[0].weaponType}`).toBe('simple melee')
    expect(`${w[w.length - 1].category} ${w[w.length - 1].weaponType}`).toBe('martial ranged')
    const dmg = sortEntities(of('weapon'), 'weapon', 'damage') as { damage: string }[]
    expect(avgDice(dmg[0].damage)).toBeGreaterThanOrEqual(avgDice(dmg[dmg.length - 1].damage))
  })
  it('name sorts are stable alphabetical and every kind has a default', () => {
    expect(names(sortEntities(of('feat'), 'feat', 'name'))).toEqual(names(of('feat')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })))
    for (const k of ['class', 'subclass', 'species', 'background', 'feat', 'spell', 'weapon', 'armor', 'gear', 'tool', 'magicItem', 'condition', 'rule', 'language', 'creature', 'deity'] as EntityKind[])
      expect(sortOptions(k).length, k).toBeGreaterThan(1)
  })
})
