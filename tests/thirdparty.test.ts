import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup as L } from '../src/renderer/src/data'
import type { MagicItemDef, SpellDef } from '../src/renderer/src/types'

const SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
const CLASSES = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard']
const RARITIES = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies']

describe('tredjepartsinnhold (OGL / CC-BY)', () => {
  const tp = allEntities.filter((e) => e.source === 'Third-party' && e.kind !== 'rule')
  const spells = tp.filter((e) => e.kind === 'spell') as SpellDef[]
  const items = tp.filter((e) => e.kind === 'magicItem') as MagicItemDef[]

  it('er lastet', () => {
    expect(spells.length).toBeGreaterThan(500)
    expect(items.length).toBeGreaterThan(800)
  })
  it('har bok, lisens og unike ids', () => {
    for (const e of tp) {
      expect(e.sourceBook, e.id).toBeTruthy()
      expect(['OGL 1.0a', 'CC-BY-4.0', 'ORC'], e.id).toContain(e.license)
      expect(e.id.startsWith('tp-'), e.id).toBe(true)
    }
    expect(new Set(tp.map((e) => `${e.kind}:${e.id}`)).size).toBe(tp.length)
  })
  it('spells har gyldige felt', () => {
    for (const s of spells) {
      expect(s.level, s.id).toBeGreaterThanOrEqual(0)
      expect(s.level, s.id).toBeLessThanOrEqual(9)
      expect(SCHOOLS, s.id).toContain(s.school)
      for (const c of s.classes) expect(CLASSES, s.id).toContain(c)
    }
  })
  it('magic items har gyldig rarity', () => {
    for (const m of items) expect(RARITIES, m.id).toContain(m.rarity)
  })
  it('ingen navn dupliserer SRD/PHB-innhold', () => {
    const core = new Set(allEntities.filter((e) => (e.source === 'SRD 5.2' || e.source === 'PHB 2024') && (e.kind === 'spell' || e.kind === 'magicItem')).map((e) => `${e.kind}:${e.name.toLowerCase()}`))
    const dups = tp.filter((e) => core.has(`${e.kind}:${e.name.toLowerCase()}`)).map((e) => e.name)
    expect(dups).toEqual([])
  })
  it('lisensoppføringen finnes med OGL-tekst og attribusjon', () => {
    const r = L.get('rule', 'rule-open-content-licenses')
    expect(r?.description).toContain('OPEN GAME LICENSE Version 1.0a')
    expect(r?.description).toContain('15. COPYRIGHT NOTICE')
    expect(r?.description).toContain('Creative Commons Attribution 4.0')
  })
})
