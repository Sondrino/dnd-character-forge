import { describe, expect, it } from 'vitest'
import { allEntities } from '../src/renderer/src/data'
import { creatures } from '../src/renderer/src/data/creatures'
import { spellsPhb } from '../src/renderer/src/data/spellsPhb'
import { speciesPhb } from '../src/renderer/src/data/speciesPhb'
import { magicItemsDmg } from '../src/renderer/src/data/magicItemsDmg'
import { magicItemsDmg2 } from '../src/renderer/src/data/magicItemsDmg2'
import { rulesSrd } from '../src/renderer/src/data/rulesSrd'
import { poisonsSrd } from '../src/renderer/src/data/poisonsSrd'
import { ABILITIES } from '../src/renderer/src/types'
import type { School } from '../src/renderer/src/types'

const SCHOOLS: School[] = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
const CLASS_IDS = new Set(allEntities.filter((e) => e.kind === 'class').map((e) => e.id))

/** Item-ids deler navnerom på tvers av weapon/armor/gear/tool/magicItem */
const ITEM_KINDS = new Set(['weapon', 'armor', 'gear', 'tool', 'magicItem'])
const ns = (kind: string): string => (ITEM_KINDS.has(kind) ? 'item' : kind)

describe('new content', () => {
  it('loads the new files into allEntities', () => {
    const ids = new Set(allEntities.map((e) => `${e.kind}:${e.id}`))
    for (const e of [...creatures, ...spellsPhb, ...speciesPhb, ...magicItemsDmg, ...magicItemsDmg2, ...rulesSrd, ...poisonsSrd]) {
      expect(ids.has(`${e.kind}:${e.id}`), e.id).toBe(true)
    }
  })

  it('has the expected counts', () => {
    expect(creatures.length).toBeGreaterThanOrEqual(330)
    expect(creatures.filter((c) => c.tags?.includes('summon')).length).toBe(6)
    expect(creatures.filter((c) => c.tags?.includes('wild-shape')).length).toBeGreaterThan(40)
    expect(creatures.filter((c) => c.tags?.includes('familiar')).length).toBeGreaterThanOrEqual(15)
    expect(spellsPhb.length).toBeGreaterThanOrEqual(50)
    expect(speciesPhb.map((s) => s.id)).toContain('aasimar')
    expect(magicItemsDmg.length).toBeGreaterThanOrEqual(30)
    expect(rulesSrd.length).toBeGreaterThanOrEqual(100)
    expect(poisonsSrd.length).toBe(14)
  })

  it('has no duplicate ids per kind (items share one namespace)', () => {
    const seen = new Map<string, number>()
    for (const e of allEntities) {
      const k = `${ns(e.kind)}:${e.id}`
      seen.set(k, (seen.get(k) ?? 0) + 1)
    }
    const fresh = new Set(
      [...creatures, ...spellsPhb, ...speciesPhb, ...magicItemsDmg, ...magicItemsDmg2, ...rulesSrd, ...poisonsSrd].map((e) => `${ns(e.kind)}:${e.id}`)
    )
    // Only duplicates involving the new content (pre-existing overlaps such as potion-of-healing in gear + magicItems are out of scope here)
    const dups = [...seen].filter(([k, n]) => n > 1 && fresh.has(k)).map(([k]) => k)
    expect(dups).toEqual([])
  })

  it('every creature has a complete stat block', () => {
    for (const c of creatures) {
      expect(c.kind).toBe('creature')
      expect(Object.keys(c.abilities).sort(), c.id).toEqual([...ABILITIES].sort())
      for (const a of ABILITIES) expect(c.abilities[a], `${c.id}.${a}`).toBeGreaterThan(0)
      expect(c.ac, c.id).toBeGreaterThan(0)
      if (!c.tags?.includes('summon')) expect(c.hp, c.id).toMatch(/^\d+ \(/)
      expect(c.cr, c.id).toMatch(/^(\d+|1\/[248]|—)$/)
      expect(c.size, c.id).toMatch(/Tiny|Small|Medium|Large|Huge|Gargantuan/)
      expect(c.speed, c.id).toMatch(/ft\./)
    }
  })

  it('spot-checks well-known creatures', () => {
    const by = new Map(creatures.map((c) => [c.id, c]))
    const check = (id: string, cr: string, ac: number, hp: string): void => {
      const c = by.get(id)
      expect(c, id).toBeDefined()
      expect(c!.cr, id).toBe(cr)
      expect(c!.ac, id).toBe(ac)
      expect(c!.hp.startsWith(hp), id).toBe(true)
    }
    check('wolf', '1/4', 12, '11 (2d8 + 2)')
    check('owl', '0', 11, '1 ')
    check('giant-spider', '1', 14, '26 ')
    check('adult-red-dragon', '17', 19, '256 ')
    check('goblin-warrior', '1/4', 15, '10 ')
    check('brown-bear', '1', 11, '22 ')
    check('cat', '0', 12, '2 ')
    check('riding-horse', '1/4', 11, '13 ')
    check('lich', '21', 20, '315 ')
    check('imp', '1', 13, '21 ')
    expect(by.get('wolf')!.tags).toContain('wild-shape')
    expect(by.get('owl')!.tags).toContain('familiar')
    expect(by.get('imp')!.tags).toContain('familiar')
    expect(by.get('wolf')!.abilities).toEqual({ str: 14, dex: 15, con: 12, int: 3, wis: 12, cha: 6 })
  })

  it('every new spell has a valid level, school and classes', () => {
    for (const s of spellsPhb) {
      expect(s.kind).toBe('spell')
      expect(['PHB 2024', 'Supplement']).toContain(s.source)
      expect(Number.isInteger(s.level) && s.level >= 0 && s.level <= 9, s.id).toBe(true)
      expect(SCHOOLS, s.id).toContain(s.school)
      expect(s.classes.length, s.id).toBeGreaterThan(0)
      for (const c of s.classes) expect(CLASS_IDS.has(c), `${s.id}: ${c}`).toBe(true)
      expect(s.summary.length, s.id).toBeGreaterThan(10)
      expect(s.concentration, s.id).toBe(s.duration.startsWith('Concentration'))
    }
  })

  it('PHB/DMG entries carry the right source and only short own-words text', () => {
    for (const e of [...spellsPhb, ...magicItemsDmg, ...magicItemsDmg2]) {
      // Ikke-SRD offisielt innhold: PHB/DMG eller tilleggsbok (med boktittel)
      expect(e.source === 'PHB 2024' || (e.source === 'Supplement' && !!e.sourceBook), e.id).toBe(true)
      expect(e.description.length, e.id).toBeLessThan(1500)
    }
    for (const e of speciesPhb) expect(e.source, e.id).toBe('PHB 2024')
    for (const e of [...creatures, ...rulesSrd, ...poisonsSrd]) expect(e.source, e.id).toBe('SRD 5.2')
  })

  it('Aasimar grants necrotic and radiant resistance and darkvision', () => {
    const a = speciesPhb.find((s) => s.id === 'aasimar')!
    const effects = [...(a.effects ?? []), ...a.traits.flatMap((t) => t.effects ?? [])]
    const res = effects.filter((e) => e.target === 'resistance').map((e) => e.value)
    expect(res).toEqual(expect.arrayContaining(['necrotic', 'radiant']))
    expect(a.darkvision).toBe(60)
    expect(a.speed).toBe(30)
  })
})
