import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup as L } from '../src/renderer/src/data'
import { PHB2014, phb2014Species } from '../src/renderer/src/data/supplements/phb2014-species'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { syncGrantedSpells } from '../src/renderer/src/lib/sync'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { Character, Feature } from '../src/renderer/src/types'

const BOOK = "Player's Handbook (2014)"
const traits: { sp: string; f: Feature }[] = phb2014Species.flatMap((s) => s.traits.map((f) => ({ sp: s.id, f })))
const ch = (speciesId: string, level = 1, extra: Partial<Character> = {}): Character =>
  newCharacter({ classes: [{ classId: 'fighter', level, hpRolls: [] }], speciesId, ...extra })

describe("Player's Handbook (2014) species", () => {
  it('loads every species with the exact source and book string', () => {
    expect(PHB2014).toBe(BOOK)
    expect(phb2014Species).toHaveLength(10)
    expect(allEntities.filter((e) => e.sourceBook === BOOK && e.kind === 'species')).toHaveLength(phb2014Species.length)
    for (const s of phb2014Species) {
      expect(L.get('species', s.id), s.id).toBeTruthy()
      expect(s.source, s.id).toBe('Supplement')
      expect(s.sourceBook, s.id).toBe(BOOK)
      expect(s.tags, s.id).toEqual(expect.arrayContaining(['supplement', 'phb2014']))
      expect(s.id.startsWith('phb14-'), s.id).toBe(true)
    }
  })

  it('has ids that are unique across all kinds', () => {
    const ids = phb2014Species.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    const others = new Set(allEntities.filter((e) => e.sourceBook !== BOOK).map((e) => e.id))
    for (const id of ids) expect(others.has(id), id).toBe(false)
    for (const s of phb2014Species) {
      const t = s.traits.map((f) => f.id)
      expect(new Set(t).size, s.id).toBe(t.length)
      const o = s.options?.choices.map((x) => x.id) ?? []
      expect(new Set(o).size, s.id).toBe(o.length)
    }
  })

  it('only references spells, tools and weapons that exist', () => {
    for (const s of phb2014Species) {
      for (const g of [...(s.spells ?? []), ...(s.options?.choices.flatMap((o) => o.spells ?? []) ?? [])])
        expect(L.get('spell', g.spellId), `${s.id}: ${g.spellId}`).toBeTruthy()
      const effects = [...s.traits.flatMap((f) => f.effects ?? []), ...(s.options?.choices.flatMap((o) => o.effects ?? []) ?? [])]
      for (const e of effects) {
        if (e.target === 'proficiency.tool') expect(L.get('tool', String(e.value)), `${s.id}: ${e.value}`).toBeTruthy()
        if (e.target === 'proficiency.weapon') expect(L.get('weapon', String(e.value)), `${s.id}: ${e.value}`).toBeTruthy()
      }
      for (const f of s.traits)
        for (const c of f.choices ?? []) for (const id of c.type === 'tool' ? c.options ?? [] : []) expect(L.get('tool', id), `${s.id}: ${id}`).toBeTruthy()
    }
  })

  it('keeps descriptions short and drops the 2014 ability score increases', () => {
    for (const s of phb2014Species) {
      expect(s.description.length, s.id).toBeLessThan(1500)
      expect(s.description, s.id).toContain('ability score increases are not used')
      for (const o of s.options?.choices ?? []) expect(o.description.length, o.id).toBeLessThan(1500)
    }
    for (const { sp, f } of traits) expect(f.description.length, `${sp}/${f.id}`).toBeLessThan(1500)
  })

  it('gives every trait with uses an activation', () => {
    for (const { sp, f } of traits) if (f.uses) expect(f.activation, `${sp}/${f.id}`).toBeTruthy()
  })

  it('uses the 2024 names only where no plain 2024 species clashes', () => {
    const names = phb2014Species.map((s) => s.name)
    for (const n of ['Dwarf', 'Elf', 'Halfling', 'Human', 'Dragonborn', 'Gnome', 'Tiefling']) {
      expect(names).toContain(`${n} (2014)`)
      expect(L.all('species').some((s) => s.name === n), n).toBe(true)
    }
    expect(names).toContain('Half-Elf')
    expect(names).toContain('Half-Orc')
  })
})

describe('2014 species mechanics', () => {
  it('Hill Dwarf: +1 HP per level, Speed 25, poison resistance', () => {
    const base = computeCharacter(ch('phb14-dwarf', 4), L)
    const hill = computeCharacter(ch('phb14-dwarf', 4, { speciesOptionId: 'phb14-hill-dwarf' }), L)
    expect(hill.hpMax.value - base.hpMax.value).toBe(4)
    expect(hill.speed.value).toBe(25)
    expect(hill.resistances).toContain('poison')
  })

  it('Wood Elf gets Speed 35, Drow gets Darkvision 120 and its spells', () => {
    expect(computeCharacter(ch('phb14-elf', 1, { speciesOptionId: 'phb14-wood-elf' }), L).speed.value).toBe(35)
    const drow = ch('phb14-elf', 5, { speciesOptionId: 'phb14-drow' })
    expect(computeCharacter(drow, L).darkvision).toBe(120)
    const spells = (syncGrantedSpells(drow, L) ?? []).map((s) => s.spellId)
    expect(spells).toEqual(expect.arrayContaining(['dancing-lights', 'faerie-fire', 'darkness']))
  })

  it('Tiefling spells follow character level', () => {
    const at1 = (syncGrantedSpells(ch('phb14-tiefling', 1), L) ?? []).map((s) => s.spellId)
    expect(at1).toEqual(['thaumaturgy'])
    const at5 = (syncGrantedSpells(ch('phb14-tiefling', 5), L) ?? []).map((s) => s.spellId)
    expect(at5).toEqual(expect.arrayContaining(['thaumaturgy', 'hellish-rebuke', 'darkness']))
  })

  it('Variant Human asks for a skill and an Origin feat; Half-Elf for two skills', () => {
    const vh = computeCharacter(ch('phb14-variant-human'), L).choices
    expect(vh.some((p) => p.type === 'skill' && p.count === 1)).toBe(true)
    expect(vh.some((p) => p.type === 'feat' && p.filter === 'origin')).toBe(true)
    expect(computeCharacter(ch('phb14-half-elf'), L).choices.some((p) => p.type === 'skill' && p.count === 2)).toBe(true)
  })

  it('Dragonborn breath weapon recharges on a Short or Long Rest and rolls a save', () => {
    const bw = phb2014Species.find((s) => s.id === 'phb14-dragonborn')!.traits.find((f) => f.id === 'breath-weapon')!
    expect(bw.activation).toBe('action')
    expect(bw.uses).toEqual({ count: 1, recharge: 'shortOrLong' })
    expect(bw.roll).toMatchObject({ kind: 'save', dc: '8+prof+mod.con', dice: '2d6' })
    const red = computeCharacter(ch('phb14-dragonborn', 1, { speciesOptionId: 'phb14-dragon-red' }), L)
    expect(red.resistances).toContain('fire')
  })
})
