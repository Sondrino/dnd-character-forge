import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { computeTips } from '../src/renderer/src/engine/tips'
import { newCharacter } from '../src/renderer/src/store/characters'
import { levelDown, previewLevelDown } from '../src/renderer/src/lib/levels'
import { syncGrantedSpells } from '../src/renderer/src/lib/sync'
import type { Ability, Character, ClassDef } from '../src/renderer/src/types'
import { ABILITIES } from '../src/renderer/src/types'

const cls = (classId: string, level: number, subclassId?: string) => ({ classId, level, hpRolls: [] as (number | null)[], subclassId })

describe('level down', () => {
  it('preview viser HP-tap og features som forsvinner', () => {
    const c = newCharacter({ classes: [cls('fighter', 5)], baseAbilities: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 } })
    const p = previewLevelDown(c, 'fighter', L, 2)!
    expect(p.hpLost).toBe(6 + 2)
    expect(p.removedFeatures).toEqual(expect.arrayContaining(['Extra Attack', 'Tactical Shift']))
    expect(p.toLevel).toBe(4)
  })
  it('fjerner valg fra features over nytt nivå', () => {
    const c = newCharacter({ classes: [cls('rogue', 6)] })
    const exp6 = 'class:rogue:rogue-expertise-6:rogue-expertise-6#expertise'
    const exp1 = 'class:rogue:rogue-expertise:rogue-expertise-1#expertise'
    expect(computeCharacter(c, L).choices.some((p) => p.key === exp6)).toBe(true)
    c.choices[exp1] = ['stealth', 'acrobatics']
    c.choices[exp6] = ['perception', 'insight']
    c.choices['class:rogue:skills#skill'] = ['stealth', 'perception', 'insight', 'acrobatics']
    levelDown(c, 'rogue', L)
    expect(c.classes[0].level).toBe(5)
    expect(c.choices[exp6]).toBeUndefined()
    expect(c.choices[exp1]).toEqual(['stealth', 'acrobatics'])
    expect(c.choices['class:rogue:skills#skill']).toHaveLength(4)
  })
  it('nullstiller brukte slots og reduserer nåværende HP', () => {
    const c = newCharacter({ classes: [cls('wizard', 3)], hp: { current: 14, temp: 0 }, spellSlotsUsed: [2, 1], pactSlotsUsed: 0 })
    levelDown(c, 'wizard', L)
    expect(c.hp.current).toBe(14 - 4)
    expect(c.spellSlotsUsed).toEqual([])
  })
})

describe('multiclassing', () => {
  it('andre class gir bare multiclass-proficiencies', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('wizard', 1), cls('fighter', 1)] }), L)
    expect(d.proficiencies.armor).toEqual(expect.arrayContaining(['light', 'medium', 'shield']))
    expect(d.proficiencies.armor).not.toContain('heavy')
    expect(d.proficiencies.weapons).toContain('martial')
    expect(d.saves.str.proficient).toBe(false)
    expect(d.saves.int.proficient).toBe(true)
    expect(d.pending.some((p) => p.key === 'class:fighter:skills#skill')).toBe(false)
  })
  it('Rogue som andre class gir én skill og Thieves’ Tools', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('fighter', 1), cls('rogue', 1)] }), L)
    expect(d.choices.find((p) => p.key === 'class:rogue:skills#skill')?.count).toBe(1)
    expect(d.proficiencies.tools).toContain('thieves-tools')
  })
  it('HP: maks terning bare på nivå 1 i første class, så gjennomsnitt', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('wizard', 1), cls('barbarian', 2)], baseAbilities: { str: 10, dex: 10, con: 12, int: 10, wis: 10, cha: 10 } }), L)
    expect(d.hpMax.value).toBe(6 + 1 + 2 * (7 + 1))
    expect(d.hitDice).toEqual([{ die: 12, total: 2, used: 0 }, { die: 6, total: 1, used: 0 }])
  })
  it('rullede HP-verdier brukes for senere nivåer', () => {
    const d = computeCharacter(newCharacter({ classes: [{ classId: 'fighter', level: 3, hpRolls: [null, 3, 10] }] }), L)
    expect(d.hpMax.value).toBe(10 + 3 + 10)
  })
  it('Paladin 3 / Warlock 2: pact magic separat fra vanlige slots', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('paladin', 3), cls('warlock', 2)] }), L)
    expect(d.slots.map((s) => s.max)).toEqual([3]) // ceil(3/2) = 2 → 3 level 1-slots
    expect(d.pact).toMatchObject({ count: 2, level: 1 })
  })
})

describe('syncGrantedSpells', () => {
  it('legger til always prepared ved riktig nivå og fjerner dem ved level down', () => {
    const c = newCharacter({ classes: [cls('cleric', 3, 'life-domain')] })
    const s1 = syncGrantedSpells(c, L)!
    expect(s1.filter((s) => s.alwaysPrepared).map((s) => s.spellId).sort()).toEqual(['aid', 'bless', 'cure-wounds', 'lesser-restoration'])
    c.spells = s1
    expect(syncGrantedSpells(c, L)).toBeNull() // stabil
    c.classes[0].level = 5
    c.spells = syncGrantedSpells(c, L)!
    expect(c.spells.some((s) => s.spellId === 'revivify')).toBe(true)
    c.classes[0].level = 3
    c.spells = syncGrantedSpells(c, L)!
    expect(c.spells.some((s) => s.spellId === 'revivify')).toBe(false)
  })
  it('species-lineage-spells følger totalnivå', () => {
    const c = newCharacter({ classes: [cls('fighter', 3)], speciesId: 'tiefling', speciesOptionId: 'infernal' })
    const ids = syncGrantedSpells(c, L)!.map((s) => s.spellId)
    expect(ids).toEqual(expect.arrayContaining(['fire-bolt', 'thaumaturgy', 'hellish-rebuke']))
    expect(ids).not.toContain('darkness')
  })
  it('always prepared teller ikke mot prepared-grensen', () => {
    const c = newCharacter({ classes: [cls('cleric', 3, 'life-domain')] })
    c.spells = syncGrantedSpells(c, L)!
    expect(computeCharacter(c, L).spellcasting[0].preparedCount).toBe(0)
  })
})

describe('adjustments og overrides', () => {
  it('adjustment legges oppå beregningen, override erstatter den', () => {
    const c = newCharacter({ classes: [cls('fighter', 1)], baseAbilities: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 } })
    c.adjustments = { initiative: 2, 'save.dex': 1, 'passive.perception': 1 }
    let d = computeCharacter(c, L)
    expect(d.initiative.value).toBe(4)
    expect(d.initiative.overridden).toBe(false)
    expect(d.saves.dex.value).toBe(3)
    expect(d.passive.perception.value).toBe(11)
    c.overrides = { initiative: 9 }
    d = computeCharacter(c, L)
    expect(d.initiative.value).toBe(9)
    expect(d.initiative.overridden).toBe(true)
    expect(d.initiative.computed).toBe(4)
  })
  it('PB-justering slår gjennom på skills, saves og DC', () => {
    const c = newCharacter({ classes: [cls('wizard', 1)], baseAbilities: { str: 10, dex: 10, con: 10, int: 16, wis: 10, cha: 10 }, adjustments: { pb: 1 } })
    const d = computeCharacter(c, L)
    expect(d.pb.value).toBe(3)
    expect(d.saves.int.value).toBe(6)
    expect(d.spellcasting[0].dc.value).toBe(8 + 3 + 3)
  })
  it('override av spell slots og weapon mastery', () => {
    const c = newCharacter({ classes: [cls('wizard', 3)], overrides: { 'slots.2': 5, weaponMastery: 1 } })
    const d = computeCharacter(c, L)
    expect(d.slots.find((s) => s.level === 2)?.max).toBe(5)
    expect(d.weaponMasteryMax).toBe(1)
  })
})

/** Bygger en korrekt nivå 1-karakter med startutstyr A og standard array */
function level1(def: ClassDef): Character {
  const order: Ability[] = [...new Set<Ability>([...def.primaryAbility, ...(def.spellcasting ? [def.spellcasting.ability] : []), 'con', 'dex', 'wis', 'str', 'cha', 'int'])]
  const arr = [15, 14, 13, 12, 10, 8]
  const base = Object.fromEntries(ABILITIES.map((a) => [a, arr[order.indexOf(a)] ?? 8])) as Record<Ability, number>
  const opt = def.startingEquipment[0]
  const inventory = opt.items
    .filter((i) => i.id && L.item(i.id))
    .map((i, n) => ({ uid: `${i.id}-${n}`, refId: i.id!, qty: i.qty ?? 1, equipped: true, attuned: false }))
  return newCharacter({
    name: 'Test',
    classes: [cls(def.id, 1)],
    speciesId: 'human',
    backgroundId: 'soldier',
    baseAbilities: base,
    backgroundBonus: { [order[0]]: 2, con: order[0] === 'con' ? 0 : 1 },
    inventory,
    hp: { current: 10, temp: 0 }
  })
}

describe('tips gir ingen falske advarsler', () => {
  for (const def of L.all('class')) {
    it(`${def.id} nivå 1 med startutstyr A`, () => {
      const c = level1(def)
      const d = computeCharacter(c, L)
      const warnings = computeTips(c, d, L, 'en').filter((t) => t.level === 'warning').map((t) => `${t.id}: ${t.title}`)
      expect(warnings).toEqual([])
    })
  }
})

describe('level down bruker faktisk CON-modifier', () => {
  it('ASI til CON telles med i HP-tapet', () => {
    const c = newCharacter({
      classes: [cls('fighter', 5)], baseAbilities: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }, hp: { current: 50, temp: 0 },
      feats: [{ uid: 'a', featId: 'ability-score-improvement', source: 'class:fighter:4', choices: { abilities: ['con', 'con'] } }]
    })
    levelDown(c, 'fighter', L)
    expect(c.hp.current).toBe(50 - (6 + 3))
  })
})
