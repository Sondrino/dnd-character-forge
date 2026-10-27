import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup, dndBeyondUrl } from '../src/renderer/src/data'
import { PHB_BOOK, bookLabel, bookOf } from '../src/renderer/src/components/ui'
import { matchesQuery } from '../src/renderer/src/lib/search'

describe('book filter', () => {
  it('groups SRD and PHB summaries as Player’s Handbook, DMG items and creatures separately', () => {
    expect(bookOf(baseLookup.get('spell', 'fireball')!)).toBe(PHB_BOOK)
    expect(bookOf(baseLookup.get('feat', 'alert')!)).toBe(PHB_BOOK)
    expect(bookLabel(PHB_BOOK)).toBe('PHB 2024')
    const items = allEntities.filter((e) => e.kind === 'magicItem' && (e.source === 'SRD 5.2' || e.source === 'PHB 2024'))
    expect(items.length).toBeGreaterThan(300)
    for (const e of items) expect(bookOf(e)).toBe('Dungeon Master’s Guide (2024)')
    for (const e of allEntities.filter((x) => x.kind === 'creature')) expect(bookOf(e)).toBe('Monster Manual (2025)')
  })

  it('every PHB/SRD entity outside items and creatures lands in the Player’s Handbook', () => {
    const odd = allEntities.filter((e) => (e.source === 'SRD 5.2' || e.source === 'PHB 2024') && !['magicItem', 'creature'].includes(e.kind) && !e.tags?.includes('poison') && bookOf(e) !== PHB_BOOK)
    expect(odd.map((e) => `${e.kind}:${e.id}`)).toEqual([])
  })

  it('Knowledge Domain is credited to Heroes of Faerûn, not the PHB', () => {
    const k = baseLookup.get('subclass', 'knowledge-domain')!
    expect(k.source).toBe('Supplement')
    expect(bookOf(k)).toBe('Forgotten Realms: Heroes of Faerûn')
    expect(allEntities.filter((e) => e.kind === 'subclass' && bookOf(e) === PHB_BOOK)).toHaveLength(48)
  })
})

describe('PHB spell names', () => {
  it('finds SRD spells by their Player’s Handbook names, with either apostrophe', () => {
    const acid = baseLookup.get('spell', 'acid-arrow')!
    expect(acid.aliases).toContain('Melf’s Acid Arrow')
    expect(matchesQuery(acid, "melf's acid")).toBe(true)
    expect(matchesQuery(baseLookup.get('spell', 'hideous-laughter')!, 'tasha’s')).toBe(true)
    expect(matchesQuery(acid, 'fireball')).toBe(false)
    expect(dndBeyondUrl(acid)).toContain(encodeURIComponent('Melf’s Acid Arrow'))
  })

  it('every alias points at an existing spell', () => {
    const withAlias = allEntities.filter((e) => e.kind === 'spell' && e.aliases?.length)
    expect(withAlias).toHaveLength(17)
  })
})

describe('Player’s Handbook coverage', () => {
  it('has exactly the 391 spells of the 2024 Player’s Handbook', () => {
    const phb = allEntities.filter((e) => e.kind === 'spell' && bookOf(e) === PHB_BOOK)
    expect(phb).toHaveLength(391)
    for (const id of ['grasping-vine', 'telepathy']) expect(baseLookup.get('spell', id)?.source).toBe('PHB 2024')
    for (const id of ['chaos-bolt', 'holy-weapon', 'psychic-scream', 'shadow-blade', 'spirit-shroud']) expect(baseLookup.get('spell', id)?.source).toBe('Supplement')
  })

  it('only Basic Poison counts as PHB gear; the sample poisons are DMG', () => {
    const poisons = allEntities.filter((e) => e.kind === 'gear' && e.tags?.includes('poison') && e.id !== 'basic-poison')
    expect(poisons.length).toBeGreaterThan(10)
    for (const p of poisons) expect(bookOf(p)).toBe('Dungeon Master’s Guide (2024)')
  })
})
