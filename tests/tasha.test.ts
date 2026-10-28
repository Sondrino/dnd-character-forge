import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup as L } from '../src/renderer/src/data'
import { tashaSubclasses } from '../src/renderer/src/data/supplements/tasha-subclasses'
import { ARTIFICER_SPELL_IDS, artificerClass, artificerInfusions, artificerSubclasses, armorerModels } from '../src/renderer/src/data/supplements/tasha-artificer'
import { tashaFeats } from '../src/renderer/src/data/supplements/tasha-feats'
import { tashaInvocations, tashaManeuvers, tashaOptionalFeatures } from '../src/renderer/src/data/supplements/tasha-options'
import { customLineage, tashaRules } from '../src/renderer/src/data/supplements/tasha-rules'
import { tashaRuneOptions } from '../src/renderer/src/data/supplements/tasha-subclasses'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { AnyEntity, Feature } from '../src/renderer/src/types'

const BOOK = "Tasha's Cauldron of Everything"
const ITEM_KINDS = new Set(['weapon', 'armor', 'gear', 'tool', 'magicItem'])
const ns = (kind: string): string => (ITEM_KINDS.has(kind) ? 'item' : kind)

const tceEntities = allEntities.filter((e) => e.sourceBook === BOOK)
const newEntities: AnyEntity[] = [...tashaSubclasses, artificerClass, ...artificerSubclasses, ...tashaFeats, customLineage, ...tashaRules]
const groups = [artificerInfusions, armorerModels, tashaRuneOptions, tashaInvocations, tashaManeuvers, ...tashaOptionalFeatures]

describe("Tasha's Cauldron of Everything", () => {
  it('loads every new entity and option group', () => {
    const loaded = new Set(allEntities.map((e) => `${e.kind}:${e.id}`))
    for (const e of newEntities) expect(loaded.has(`${e.kind}:${e.id}`), e.id).toBe(true)
    for (const g of groups) expect(L.classOptions, g.group).toContain(g)
  })

  it('marks all TCE entities as Supplement with the exact book string', () => {
    expect(tceEntities.length).toBeGreaterThanOrEqual(80)
    for (const e of [...tceEntities, ...newEntities]) {
      expect(e.source, e.id).toBe('Supplement')
      expect(e.sourceBook, e.id).toBe(BOOK)
    }
    for (const g of groups) {
      expect(g.source, g.group).toBe('Supplement')
      for (const it of g.items) expect(it.source, it.id).toBe('Supplement')
    }
  })

  it('has unique ids per namespace', () => {
    const seen = new Map<string, number>()
    for (const e of allEntities) seen.set(`${ns(e.kind)}:${e.id}`, (seen.get(`${ns(e.kind)}:${e.id}`) ?? 0) + 1)
    for (const e of tceEntities) expect(seen.get(`${ns(e.kind)}:${e.id}`), e.id).toBe(1)
    const optionIds = L.classOptions.flatMap((g) => g.items.map((it) => `${g.group}:${it.id}`))
    expect(new Set(optionIds).size).toBe(optionIds.length)
    const featureIds = [...tashaSubclasses, ...artificerSubclasses].flatMap((s) => s.features.map((f) => f.id)).concat(artificerClass.features.map((f) => f.id))
    expect(new Set(featureIds).size).toBe(featureIds.length)
  })

  it('references only existing spells', () => {
    const bad: string[] = []
    for (const s of [...tashaSubclasses, ...artificerSubclasses])
      for (const g of s.alwaysPrepared ?? []) for (const id of g.spells) if (!L.get('spell', id)) bad.push(`${s.id}: ${id}`)
    for (const id of ARTIFICER_SPELL_IDS) if (!L.get('spell', id)) bad.push(`artificer list: ${id}`)
    for (const id of [...(artificerClass.recommended.cantrips ?? []), ...(artificerClass.recommended.spells ?? [])]) if (!L.get('spell', id)) bad.push(`recommended: ${id}`)
    expect(bad).toEqual([])
  })

  it('puts every subclass on an existing class', () => {
    for (const s of [...tashaSubclasses, ...artificerSubclasses]) expect(L.get('class', s.classId), s.id).toBeTruthy()
    expect(tashaSubclasses).toHaveLength(18)
    expect(artificerSubclasses.map((s) => s.id).sort()).toEqual(['alchemist', 'armorer', 'artillerist', 'battle-smith'])
  })

  it('keeps descriptions short (own-words summaries)', () => {
    for (const e of newEntities) {
      expect(e.summary.length, e.id).toBeGreaterThan(10)
      expect(e.description.length, e.id).toBeLessThan(1500)
    }
    const feats: Feature[] = [...tashaSubclasses, ...artificerSubclasses].flatMap((s) => s.features).concat(artificerClass.features, groups.flatMap((g) => g.items))
    for (const f of feats) expect(f.description.length, f.id).toBeLessThan(1500)
  })

  it('adapts 2014 subclasses so no feature comes before level 3', () => {
    for (const s of tashaSubclasses) for (const f of s.features) expect(f.level ?? 3, `${s.id}/${f.id}`).toBeGreaterThanOrEqual(3)
    for (const s of tashaSubclasses) for (const g of s.alwaysPrepared ?? []) expect(g.level, s.id).toBeGreaterThanOrEqual(3)
  })

  it('has a complete Artificer class', () => {
    const a = L.get('class', 'artificer')!
    expect(a.table).toHaveLength(20)
    expect(a.table.map((r) => r.profBonus)).toEqual([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6])
    expect(a.table[1].columns['Infusions Known']).toBe(4)
    expect(a.table[17].columns['Infused Items']).toBe(6)
    expect(a.spellcasting?.progression).toBe('half')
    expect(a.spellcasting?.prepared).toHaveLength(20)
    expect(a.spellcasting?.cantrips).toHaveLength(20)
    expect(a.subclassLevel).toBe(3)
    expect(L.all('subclass').filter((s) => s.classId === 'artificer')).toHaveLength(4)
  })

  it('gives the Artificer spell slots and its own spell list from level 1', () => {
    const d = computeCharacter(newCharacter({ classes: [{ classId: 'artificer', level: 1, hpRolls: [] }] }), L)
    expect(d.slots).toEqual([{ level: 1, max: 2, used: 0 }])
    const d5 = computeCharacter(newCharacter({ classes: [{ classId: 'artificer', level: 5, hpRolls: [] }] }), L)
    expect(d5.slots.map((s) => s.max)).toEqual([4, 2])
    const list = L.all('spell').filter((s) => s.classes.includes('artificer'))
    expect(list.length).toBe(ARTIFICER_SPELL_IDS.length)
    // Shared class arrays must not leak 'artificer' into unrelated spells
    expect(L.get('spell', 'fireball')!.classes).not.toContain('artificer')
    expect(L.get('spell', 'sup-shadow-blade')?.classes ?? []).not.toContain('artificer')
  })

  it('infusion counts follow the Infusions Known column', () => {
    const d = computeCharacter(newCharacter({ classes: [{ classId: 'artificer', level: 18, hpRolls: [] }] }), L)
    const total = d.choices.filter((p) => p.type === 'option' && p.filter === 'Artificer Infusions').reduce((s, p) => s + p.count, 0)
    expect(total).toBe(artificerClass.table[17].columns['Infusions Known'])
    expect(artificerInfusions.items.length).toBeGreaterThanOrEqual(total)
  })

  it('Bladesong adds Intelligence to AC only while active', () => {
    const c = newCharacter({ classes: [{ classId: 'wizard', level: 3, hpRolls: [], subclassId: 'bladesinging' }], baseAbilities: { str: 8, dex: 14, con: 12, int: 16, wis: 10, cha: 10 } })
    const before = computeCharacter(c, L).ac.value
    c.activeStates = ['bladesong']
    expect(computeCharacter(c, L).ac.value).toBe(before + 3)
  })

  it('Rune Knight runes resolve from the Rune Knight Runes group', () => {
    const rk = L.get('subclass', 'rune-knight')!
    const choices = rk.features.flatMap((f) => f.choices ?? []).filter((c) => c.filter === 'Rune Knight Runes')
    expect(choices.reduce((s, c) => s + c.count, 0)).toBe(5)
    expect(tashaRuneOptions.items).toHaveLength(6)
  })

  it('has the five new TCE feats and Superior Technique', () => {
    const ids = tashaFeats.map((f) => f.id).sort()
    expect(ids).toEqual(['artificer-initiate', 'eldritch-adept', 'fighting-initiate', 'gunner', 'metamagic-adept', 'superior-technique'])
    for (const f of tashaFeats.filter((x) => x.category === 'general')) {
      expect(f.minLevel, f.id).toBe(4)
      expect(f.abilityIncrease?.amount, f.id).toBe(1)
    }
    expect(L.get('feat', 'superior-technique')!.category).toBe('fightingStyle')
  })

  it('Custom Lineage is a Small or Medium species with an Origin feat', () => {
    const s = L.get('species', 'custom-lineage')!
    expect(s.size).toBe('Small or Medium')
    expect(s.speed).toBe(30)
    expect(s.traits.some((t) => t.choices?.some((c) => c.type === 'feat' && c.filter === 'origin'))).toBe(true)
    const d = computeCharacter(newCharacter({ speciesId: 'custom-lineage', speciesOptionId: 'custom-lineage-darkvision' }), L)
    expect(d.darkvision).toBe(60)
  })
})
