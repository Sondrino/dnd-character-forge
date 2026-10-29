import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import type { CreatureDef } from '../src/renderer/src/types'
import { newCharacter } from '../src/renderer/src/store/characters'
import { addEffect, advanceTurn, initiativeOrder, newCombat } from '../src/renderer/src/lib/combat'
import {
  addCombatants, addMembers, applyHpChange, liveMembers, memberCombatant, newEncounter, newParty, normalizeParties, removeCombatant, removeMember, setInitiative,
  toggleCharacterCondition
} from '../src/renderer/src/lib/party'
import { applyCombatantHp, averageHp, creatureCombatant, creatureInitMod, hpDice, nextCombatantName, toggleCombatantCondition } from '../src/renderer/src/lib/monsters'

const def = { max: 30, resistances: [] as string[], immunities: [] as string[], vulnerabilities: [] as string[] }
const hero = (hp = 20) => newCharacter({ name: 'Hero', hp: { current: hp, temp: 0 } })

describe('party helpers', () => {
  it('creates parties and adds members without duplicates', () => {
    const p = newParty('  The Gang ')
    expect(p.name).toBe('The Gang')
    expect(p.id).toMatch(/^party-/)
    addMembers(p, ['a', 'b', 'a'])
    addMembers(p, ['b', 'c'])
    expect(p.memberIds).toEqual(['a', 'b', 'c'])
  })
  it('removing a member also removes them from the encounter', () => {
    const p = newParty('P')
    addMembers(p, ['a', 'b'])
    p.encounter = newEncounter([memberCombatant({ id: 'a', name: 'A' }, 15), memberCombatant({ id: 'b', name: 'B' }, 10)])
    removeMember(p, 'a')
    expect(p.memberIds).toEqual(['b'])
    expect(p.encounter.combatants.map((x) => x.characterId)).toEqual(['b'])
  })
  it('skips deleted characters', () => {
    const a = newCharacter({ name: 'A' })
    const p = newParty('P')
    addMembers(p, [a.id, 'gone'])
    expect(liveMembers(p, { [a.id]: a }).map((c) => c.name)).toEqual(['A'])
  })
  it('normalizes stored data', () => {
    expect(normalizeParties(null)).toEqual([])
    expect(normalizeParties({})).toEqual([])
    const list = normalizeParties([{ id: 'x', name: 'X', memberIds: ['a', 3] }, { name: 'no id' }, null])
    expect(list).toHaveLength(1)
    expect(list[0].memberIds).toEqual(['a'])
  })
})

describe('party encounter', () => {
  it('links members to their characters and keeps the turn when combatants are added or re-ordered', () => {
    const e = newEncounter([memberCombatant({ id: 'a', name: 'A' }, 12), memberCombatant({ id: 'b', name: 'B' }, 8)])
    expect(e.combatants[0]).toMatchObject({ characterId: 'a', ally: true, init: 12 })
    advanceTurn(e)
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('B')
    addCombatants(e, [{ uid: 'm', name: 'Goblin', init: 20 }])
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('B')
    setInitiative(e, 'pc-a', 1)
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('B')
    removeCombatant(e, (x) => x.uid === 'm')
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('B')
    expect(advanceTurn(e).newRound).toBe(false)
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('A')
    const r = advanceTurn(e)
    expect(r.newRound).toBe(true)
    expect(e.round).toBe(2)
  })
  it('skips defeated monsters on next turn', () => {
    const e = newEncounter([memberCombatant({ id: 'a', name: 'A' }, 20), { uid: 'g', name: 'Goblin', init: 15, defeated: true }, memberCombatant({ id: 'b', name: 'B' }, 5)])
    advanceTurn(e)
    expect(initiativeOrder(e.combatants)[e.turnIdx].name).toBe('B')
  })
})

describe('HP on linked members', () => {
  it('uses temp HP first and applies resistance', () => {
    const ch = hero()
    ch.hp.temp = 5
    const r = applyHpChange(ch, { kind: 'damage', amount: 9 }, def)
    expect(r.n).toBe(9)
    expect(ch.hp).toEqual({ current: 16, temp: 0 })
    applyHpChange(ch, { kind: 'damage', amount: 9, type: 'fire' }, { ...def, resistances: ['fire'] })
    expect(ch.hp.current).toBe(12)
  })
  it('0 HP = unconscious, damage at 0 HP adds death save failures (2 on crit), healing wakes up', () => {
    const ch = hero(5)
    const r = applyHpChange(ch, { kind: 'damage', amount: 8 }, def)
    expect(r.damage?.droppedToZero).toBe(true)
    expect(ch.hp.current).toBe(0)
    expect(ch.conditions).toContain('unconscious')
    applyHpChange(ch, { kind: 'damage', amount: 3 }, def)
    expect(ch.deathSaves.failures).toBe(1)
    applyHpChange(ch, { kind: 'damage', amount: 3, crit: true }, def)
    expect(ch.deathSaves.failures).toBe(3)
    const h = applyHpChange(ch, { kind: 'heal', amount: 50 }, def)
    expect(h.n).toBe(30)
    expect(ch.hp.current).toBe(30)
    expect(ch.deathSaves).toEqual({ successes: 0, failures: 0 })
    expect(ch.conditions).not.toContain('unconscious')
  })
  it('damage at 0 HP makes a stable character unstable', () => {
    const ch = hero(0)
    ch.deathSaves = { successes: 3, failures: 1 }
    applyHpChange(ch, { kind: 'damage', amount: 2 }, def)
    expect(ch.deathSaves).toEqual({ successes: 0, failures: 2 })
  })
  it('massive damage is flagged', () => {
    const ch = hero(10)
    expect(applyHpChange(ch, { kind: 'damage', amount: 40 }, def).damage?.instantDeath).toBe(true)
  })
  it('temp HP does not stack – highest wins', () => {
    const ch = hero()
    ch.hp.temp = 6
    expect(applyHpChange(ch, { kind: 'temp', amount: 4 }, def).n).toBe(0)
    expect(ch.hp.temp).toBe(6)
    applyHpChange(ch, { kind: 'temp', amount: 9 }, def)
    expect(ch.hp.temp).toBe(9)
  })
  it('asks for a concentration save when the character concentrates in an active combat, and drops it at 0 HP', () => {
    const ch = hero(20)
    ch.combat = newCombat('app', { uid: 'self', name: 'Hero', init: 10, self: true })
    ch.combat.concentration = { name: 'Bless', spellId: 'bless', since: 1 }
    addEffect(ch.combat, ch, { name: 'Bless', spellId: 'bless', concentration: true, rounds: 10 })
    const r = applyHpChange(ch, { kind: 'damage', amount: 7 }, def)
    expect(r.damage?.concentrationDC).toBe(10)
    const r2 = applyHpChange(ch, { kind: 'damage', amount: 30 }, def)
    expect(r2.concentrationLost).toBe('Bless')
    expect(ch.combat.concentration).toBeUndefined()
    expect(ch.combat.effects).toHaveLength(0)
  })
  it('incapacitating conditions end concentration', () => {
    const ch = hero()
    ch.combat = newCombat('app', { uid: 'self', name: 'Hero', init: 10, self: true })
    ch.combat.concentration = { name: 'Bless', since: 1 }
    expect(toggleCharacterCondition(ch, 'prone')).toEqual({ on: true })
    expect(ch.combat.concentration).toBeDefined()
    expect(toggleCharacterCondition(ch, 'stunned')).toEqual({ on: true, concentrationLost: 'Bless' })
    expect(ch.combat.concentration).toBeUndefined()
    expect(toggleCharacterCondition(ch, 'stunned').on).toBe(false)
    expect(ch.conditions).toEqual(['prone'])
  })
})

describe('monster tools', () => {
  it('parses the dice part of a stat block HP string', () => {
    expect(hpDice('22 (4d8 + 4)')).toBe('4d8+4')
    expect(hpDice('1 (1d4 − 1)')).toBe('1d4-1')
    expect(hpDice('9 (2d8)')).toBe('2d8')
    expect(hpDice('256 (19d12 + 133)')).toBe('19d12+133')
    expect(hpDice('Half the HP maximum of its summoner')).toBeUndefined()
    expect(hpDice(undefined)).toBeUndefined()
    expect(averageHp('22 (4d8 + 4)')).toBe(22)
    expect(averageHp('Half the HP')).toBeUndefined()
  })
  it('every SRD creature with dice in its HP parses to valid notation', () => {
    for (const cr of baseLookup.all('creature') as CreatureDef[]) {
      const d = hpDice(cr.hp)
      if (/\d+d\d+/.test(String(cr.hp))) expect(d, cr.name).toMatch(/^\d*d\d+([+-]\d+)*$/)
    }
  })
  it('creates bestiary combatants with creatureId, average or rolled HP and unique names', () => {
    const goblin = (baseLookup.all('creature') as CreatureDef[]).find((c) => hpDice(c.hp))!
    const a = creatureCombatant(goblin, { existing: [], init: 12 })
    expect(a).toMatchObject({ name: goblin.name, creatureId: goblin.id, ac: goblin.ac, hp: averageHp(goblin.hp), maxHp: averageHp(goblin.hp), init: 12 })
    let seen = ''
    const b = creatureCombatant(goblin, { existing: [a], init: 5, rollHp: (dice) => ((seen = dice), 0) })
    expect(seen).toBe(hpDice(goblin.hp))
    expect(b.hp).toBe(1) // minst 1 HP
    expect(b.name).toBe(`${goblin.name} 2`)
    expect(nextCombatantName([{ name: 'Orc' }, { name: 'Orc 2' }], 'Orc')).toBe('Orc 3')
    expect(creatureInitMod({ abilities: { str: 10, dex: 15, con: 10, int: 10, wis: 10, cha: 10 } })).toBe(2)
  })
  it('applies ±HP and toggles conditions on monsters', () => {
    const m = { uid: 'm', name: 'Ogre', init: 8, hp: 10, maxHp: 10 }
    applyCombatantHp(m, 4)
    expect(m.hp).toBe(6)
    applyCombatantHp(m, -10)
    expect(m.hp).toBe(10)
    applyCombatantHp(m, 15)
    expect(m).toMatchObject({ hp: 0, defeated: true })
    applyCombatantHp(m, -3)
    expect(m).toMatchObject({ hp: 3, defeated: false })
    expect(toggleCombatantCondition(m, 'prone')).toBe(true)
    expect(toggleCombatantCondition(m, 'grappled')).toBe(true)
    expect(toggleCombatantCondition(m, 'prone')).toBe(false)
    expect((m as { conditions?: string[] }).conditions).toEqual(['grappled'])
  })
})
