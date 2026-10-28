import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup as L } from '../src/renderer/src/data'
import { MPMM, MPMM_SKIPPED_SPECIES, mpmmSpecies } from '../src/renderer/src/data/supplements/mpmm-species'
import { mpmmRules } from '../src/renderer/src/data/supplements/mpmm-rules'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { syncGrantedSpells } from '../src/renderer/src/lib/sync'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { AnyEntity, Character, Feature } from '../src/renderer/src/types'

const BOOK = 'Mordenkainen Presents: Monsters of the Multiverse'
const ITEM_KINDS = new Set(['weapon', 'armor', 'gear', 'tool', 'magicItem'])
const ns = (kind: string): string => (ITEM_KINDS.has(kind) ? 'item' : kind)
const newEntities: AnyEntity[] = [...mpmmSpecies, ...mpmmRules]
const traits: { sp: string; f: Feature }[] = mpmmSpecies.flatMap((s) => s.traits.map((f) => ({ sp: s.id, f })))
const base = { str: 14, dex: 14, con: 12, int: 10, wis: 12, cha: 10 }
const ch = (speciesId: string, level = 1, extra: Partial<Character> = {}): Character =>
  newCharacter({ classes: [{ classId: 'fighter', level, hpRolls: [] }], speciesId, baseAbilities: { ...base }, ...extra })

describe('Mordenkainen Presents: Monsters of the Multiverse', () => {
  it('loads all 30 species and the overview rule', () => {
    expect(MPMM).toBe(BOOK)
    expect(mpmmSpecies).toHaveLength(30)
    const loaded = new Set(allEntities.map((e) => `${e.kind}:${e.id}`))
    for (const e of newEntities) expect(loaded.has(`${e.kind}:${e.id}`), e.id).toBe(true)
    expect(mpmmRules[0].category).toBe('Monsters of the Multiverse')
  })

  it('marks every MPMM entity as Supplement with the exact book string', () => {
    const fromBook = allEntities.filter((e) => e.sourceBook === BOOK)
    expect(fromBook.length).toBe(newEntities.length)
    for (const e of newEntities) {
      expect(e.source, e.id).toBe('Supplement')
      expect(e.sourceBook, e.id).toBe(BOOK)
      expect(e.tags, e.id).toContain('mpmm')
    }
  })

  it('has unique ids that do not collide with any other entity', () => {
    const ids = newEntities.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const others = allEntities.filter((e) => e.sourceBook !== BOOK)
    const sameKind = new Set(others.map((e) => `${ns(e.kind)}:${e.id}`))
    const anyKind = new Set(others.map((e) => e.id))
    for (const e of newEntities) {
      expect(sameKind.has(`${ns(e.kind)}:${e.id}`), e.id).toBe(false)
      expect(anyKind.has(e.id), e.id).toBe(false)
    }
    for (const s of mpmmSpecies) {
      const t = s.traits.map((f) => f.id)
      expect(new Set(t).size, s.id).toBe(t.length)
      const o = s.options?.choices.map((x) => x.id) ?? []
      expect(new Set(o).size, s.id).toBe(o.length)
    }
  })

  it('skips the species the 2024 Player’s Handbook already has', () => {
    const names = new Set(mpmmSpecies.map((s) => s.name))
    for (const n of MPMM_SKIPPED_SPECIES) {
      expect(names.has(n), n).toBe(false)
      expect(L.all('species').some((s) => s.name === n && s.sourceBook !== BOOK), n).toBe(true)
    }
  })

  it('references only existing spells', () => {
    const bad: string[] = []
    for (const s of mpmmSpecies) {
      for (const g of s.spells ?? []) if (!L.get('spell', g.spellId)) bad.push(`${s.id}: ${g.spellId}`)
      for (const o of s.options?.choices ?? []) for (const g of o.spells ?? []) if (!L.get('spell', g.spellId)) bad.push(`${s.id}/${o.id}: ${g.spellId}`)
    }
    expect(bad).toEqual([])
  })

  it('keeps text short (own-words summaries)', () => {
    for (const e of newEntities) {
      expect(e.summary.length, e.id).toBeGreaterThan(10)
      expect(e.description.length, e.id).toBeLessThan(1500)
    }
    for (const e of newEntities) expect(e.description.length, e.id).toBeLessThan(1200)
    for (const { sp, f } of traits) {
      expect(f.summary.length, `${sp}/${f.id}`).toBeGreaterThan(5)
      expect(f.description.length, `${sp}/${f.id}`).toBeLessThan(1500)
    }
    for (const s of mpmmSpecies) for (const o of s.options?.choices ?? []) expect(o.description.length, `${s.id}/${o.id}`).toBeLessThan(1500)
  })

  it('gives every trait an activation, and every trait with uses a non-passive one', () => {
    for (const { sp, f } of traits) {
      expect(f.activation, `${sp}/${f.id}`).toBeTruthy()
      if (f.uses) expect(f.activation, `${sp}/${f.id}`).not.toBe('passive')
    }
  })

  it('has valid sizes, speeds and creature types', () => {
    for (const s of mpmmSpecies) {
      expect(['Small', 'Medium', 'Small or Medium'], s.id).toContain(s.size)
      expect(s.speed, s.id).toBeGreaterThanOrEqual(30)
      expect(['Humanoid', 'Fey'].some((t) => s.creatureType.startsWith(t)), s.id).toBe(true)
    }
  })
})

describe('MPMM species in the engine', () => {
  it('applies speeds', () => {
    expect(computeCharacter(ch('mpmm-centaur'), L).speed.value).toBe(40)
    expect(computeCharacter(ch('mpmm-air-genasi'), L).speed.value).toBe(35)
    expect(computeCharacter(ch('mpmm-fairy'), L).speed.fly).toBe(30)
    expect(computeCharacter(ch('mpmm-aarakocra'), L).speed.fly).toBe(30)
    expect(computeCharacter(ch('mpmm-tabaxi'), L).speed.climb).toBe(30)
    expect(computeCharacter(ch('mpmm-triton'), L).speed.swim).toBe(30)
    expect(computeCharacter(ch('mpmm-lizardfolk'), L).speed.swim).toBe(30)
    expect(computeCharacter(ch('mpmm-sea-elf'), L).speed.swim).toBe(30)
  })

  it('applies natural armor', () => {
    expect(computeCharacter(ch('mpmm-lizardfolk'), L).ac.value).toBe(15) // 13 + Dex 2
    expect(computeCharacter(ch('mpmm-tortle'), L).ac.value).toBe(17)
  })

  it('applies resistances, darkvision and proficiencies', () => {
    expect(computeCharacter(ch('mpmm-githyanki'), L).resistances.join(' ').toLowerCase()).toContain('psychic')
    expect(computeCharacter(ch('mpmm-shadar-kai'), L).resistances.join(' ').toLowerCase()).toContain('necrotic')
    expect(computeCharacter(ch('mpmm-deep-gnome'), L).darkvision).toBe(120)
    const tabaxi = computeCharacter(ch('mpmm-tabaxi'), L)
    expect(tabaxi.skills.perception.proficient && tabaxi.skills.stealth.proficient).toBe(true)
    const c = ch('mpmm-kobold', 1, { speciesOptionId: 'kobold-craftiness-sleight-of-hand' })
    expect(computeCharacter(c, L).skills.sleightOfHand.proficient).toBe(true)
  })

  it('Harengon adds Proficiency Bonus to Initiative', () => {
    const d = computeCharacter(ch('mpmm-harengon'), L)
    expect(d.initiative.value).toBe(2 + 2)
  })

  it('Shifter option bonuses apply only while shifted', () => {
    const c = ch('mpmm-shifter', 1, { speciesOptionId: 'shifter-beasthide' })
    expect(computeCharacter(c, L).ac.value).toBe(12)
    c.activeStates = ['shifted']
    expect(computeCharacter(c, L).ac.value).toBe(13)
  })

  it('tracks Proficiency Bonus uses per Long Rest', () => {
    const d = computeCharacter(ch('mpmm-firbolg', 5), L)
    const f = d.features.find((x) => x.id === 'hidden-step')
    expect(f?.activation).toBe('bonus')
    expect(f?.uses?.max).toBe(3)
  })

  it('grants species spells by character level', () => {
    const at = (id: string, lvl: number): string[] => (syncGrantedSpells(ch(id, lvl), L) ?? []).map((s) => s.spellId)
    expect(at('mpmm-fire-genasi', 1)).toEqual(['produce-flame'])
    expect(at('mpmm-fire-genasi', 5)).toEqual(expect.arrayContaining(['produce-flame', 'burning-hands', 'flame-blade']))
    expect(at('mpmm-githzerai', 3)).toEqual(expect.arrayContaining(['mage-hand', 'shield']))
    expect(at('mpmm-githzerai', 3)).not.toContain('detect-thoughts')
    expect(at('mpmm-aarakocra', 2)).toEqual([])
    expect(at('mpmm-aarakocra', 3)).toEqual(['gust-of-wind'])
  })

  it('offers the expected species choices', () => {
    const keys = (id: string, opt?: string): string[] => computeCharacter(ch(id, 5, { speciesOptionId: opt }), L).choices.map((p) => `${p.type}:${p.count}`)
    expect(keys('mpmm-changeling')).toContain('skill:2')
    expect(keys('mpmm-lizardfolk')).toContain('skill:2')
    expect(keys('mpmm-satyr')).toContain('tool:1')
    expect(keys('mpmm-shifter')).toContain('speciesOption:1')
  })
})

import { combatOptions } from '../src/renderer/src/components/combat/useCombat'
import { newCharacter as mk } from '../src/renderer/src/store/characters'
import { computeCharacter as cc } from '../src/renderer/src/engine/compute'
import { baseLookup as BL } from '../src/renderer/src/data'

describe('MPMM traits in combat mode', () => {
  it('Tortle Shell Defense and Shifter Shifting reach the combat screen with their toggle/roll', () => {
    for (const [sp, name] of [['mpmm-tortle', 'Shell Defense'], ['mpmm-shifter', 'Shifting']] as const) {
      const ch = mk({ classes: [{ classId: 'fighter', level: 3, hpRolls: [] }], speciesId: sp, backgroundId: 'soldier' })
      const d = cc(ch, BL)
      const f = d.features.find((x) => x.name === name)!
      expect(f, name).toBeTruthy()
      expect(f.toggle, name).toBeTruthy()
      const g = combatOptions(ch, d, BL)
      expect([...g.action, ...g.bonus, ...g.reaction, ...g.other].some((o) => o.kind === 'feature' && o.feature.name === name), name).toBe(true)
    }
  })
})
