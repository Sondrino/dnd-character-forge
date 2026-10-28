import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import type { SpellDef } from '../src/renderer/src/types'
import { newCharacter } from '../src/renderer/src/store/characters'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import {
  addEffect, dropConcentration, endEffects, addDice, advanceTurn, applyDamage, attacksPerAction, castingKind, critDice, deathSave, durationRounds, initiativeOrder,
  movementLeft, newCombat, spellDamageDice, spellHealDice, startOwnTurn, upcastPerLevel
} from '../src/renderer/src/lib/combat'

const spell = (id: string): SpellDef => baseLookup.get('spell', id) as SpellDef
const base = { current: 20, temp: 0, max: 30, resistances: [], immunities: [], vulnerabilities: [], concentrating: false }

describe('damage', () => {
  it('uses temp HP first, then HP', () => {
    const r = applyDamage({ ...base, temp: 5, amount: 8 })
    expect(r).toMatchObject({ final: 8, absorbedByTemp: 5, temp: 0, current: 17 })
  })
  it('applies resistance (round down), immunity and vulnerability', () => {
    expect(applyDamage({ ...base, amount: 9, type: 'fire', resistances: ['fire'] }).final).toBe(4)
    expect(applyDamage({ ...base, amount: 9, type: 'Fire', immunities: ['fire'] })).toMatchObject({ final: 0, modifier: 'immune', current: 20 })
    expect(applyDamage({ ...base, amount: 9, type: 'cold', vulnerabilities: ['cold'] }).final).toBe(18)
    expect(applyDamage({ ...base, amount: 9, type: 'cold', resistances: ['cold'], vulnerabilities: ['cold'] }).final).toBe(8)
  })
  it('asks for a concentration save with DC max(10, half damage), capped at 30', () => {
    expect(applyDamage({ ...base, amount: 7, concentrating: true }).concentrationDC).toBe(10)
    expect(applyDamage({ ...base, current: 200, max: 200, amount: 44, concentrating: true }).concentrationDC).toBe(22)
    expect(applyDamage({ ...base, current: 200, max: 200, amount: 90, concentrating: true }).concentrationDC).toBe(30)
    expect(applyDamage({ ...base, amount: 7, concentrating: false }).concentrationDC).toBeUndefined()
  })
  it('handles dropping to 0, massive damage and damage at 0 HP', () => {
    expect(applyDamage({ ...base, amount: 25 })).toMatchObject({ current: 0, droppedToZero: true, instantDeath: false })
    expect(applyDamage({ ...base, amount: 50 })).toMatchObject({ instantDeath: true })
    expect(applyDamage({ ...base, current: 0, amount: 3 })).toMatchObject({ deathFailures: 1, instantDeath: false })
    expect(applyDamage({ ...base, current: 0, amount: 3, crit: true }).deathFailures).toBe(2)
    expect(applyDamage({ ...base, current: 0, amount: 30 }).instantDeath).toBe(true)
  })
  it('death saves follow the 2024 rules', () => {
    expect(deathSave(20, { successes: 0, failures: 2 }).revived).toBe(true)
    expect(deathSave(1, { successes: 0, failures: 1 })).toMatchObject({ failures: 3, dead: true })
    expect(deathSave(10, { successes: 2, failures: 0 })).toMatchObject({ successes: 3, stable: true })
    expect(deathSave(9, { successes: 0, failures: 0 }).failures).toBe(1)
  })
})

describe('spells in combat', () => {
  it('reads durations as rounds', () => {
    expect(durationRounds('Concentration, up to 1 minute')).toBe(10)
    expect(durationRounds('10 minutes')).toBe(100)
    expect(durationRounds('1 round')).toBe(1)
    expect(durationRounds('Instantaneous')).toBeUndefined()
    expect(castingKind('Bonus Action')).toBe('bonus')
    expect(castingKind('Reaction, which you take when you are hit')).toBe('reaction')
    expect(castingKind('1 minute')).toBe('long')
  })
  it('upcasts damage and healing', () => {
    const fb = spell('fireball')
    expect(upcastPerLevel(fb)).toBe('1d6')
    expect(spellDamageDice(fb, 3, 5)).toBe('8d6')
    expect(spellDamageDice(fb, 5, 9)).toBe('10d6')
    expect(spellHealDice(spell('cure-wounds'), 1, 3)).toBe('2d8+3')
    expect(spellHealDice(spell('cure-wounds'), 3, 3)).toBe('6d8+3')
    expect(spellDamageDice(spell('fire-bolt'), 0, 11)).toBe('3d10')
    expect(addDice('2d8+1d6', '1d6', 2)).toBe('2d8+3d6')
    expect(addDice('4d8', '1d6', 1)).toBe('4d8+1d6')
  })
  it('doubles dice on a crit but not modifiers', () => {
    expect(critDice('1d8+3')).toBe('2d8+3')
    expect(critDice('2d6+1d4+2')).toBe('4d6+2d4+2')
  })
})

describe('turns', () => {
  it('counts attacks per Attack action', () => {
    expect(attacksPerAction(['Second Wind'])).toBe(1)
    expect(attacksPerAction(['Extra Attack'])).toBe(2)
    expect(attacksPerAction(['Extra Attack', 'Two Extra Attacks'])).toBe(3)
    expect(attacksPerAction(['Three Extra Attacks'])).toBe(4)
  })
  it('advances initiative, skips defeated foes and starts new rounds', () => {
    const c = newCombat('physical', { uid: 'me', name: 'Hero', init: 12, self: true })
    c.combatants.push({ uid: 'g1', name: 'Goblin', init: 15 }, { uid: 'g2', name: 'Orc', init: 8, defeated: true })
    expect(initiativeOrder(c.combatants).map((x) => x.uid)).toEqual(['g1', 'me', 'g2'])
    expect(advanceTurn(c)).toEqual({ ownTurn: true, newRound: false })
    expect(advanceTurn(c)).toEqual({ ownTurn: false, newRound: true })
    expect(c.round).toBe(2)
  })
  it('refreshes the turn and ticks effects at the start of your turn', () => {
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 12, self: true })
    c.turn.action = true
    c.turn.movement = 30
    c.effects.push({ uid: 'a', name: 'Bless', rounds: 1, concentration: true }, { uid: 'b', name: 'Rage', rounds: 5, state: 'raging' })
    c.concentration = { name: 'Bless', since: 1 }
    const expired = startOwnTurn(c, newCharacter())
    expect(expired.map((e) => e.name)).toEqual(['Bless'])
    expect(c.concentration).toBeUndefined()
    expect(c.effects[0].rounds).toBe(4)
    expect(c.turn.action).toBe(false)
    c.turn.dashed = true
    c.turn.movement = 35
    expect(movementLeft(c, 30)).toBe(25)
  })
})

describe('effects on the sheet', () => {
  const fighter = () =>
    newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier', baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 } })

  it('Shield adds +5 AC while it lasts and is cleaned up when it ends', () => {
    const ch = fighter()
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 10, self: true })
    const before = computeCharacter(ch, baseLookup).ac.value
    addEffect(c, ch, { name: 'Shield', rounds: 1, spellId: 'shield' })
    expect(computeCharacter(ch, baseLookup).ac.value).toBe(before + 5)
    startOwnTurn(c, ch)
    expect(c.effects).toHaveLength(0)
    expect(ch.customEffects).toHaveLength(0)
    expect(computeCharacter(ch, baseLookup).ac.value).toBe(before)
  })

  it('losing concentration ends the concentration effects and their states', () => {
    const ch = fighter()
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 10, self: true })
    addEffect(c, ch, { name: 'Shield of Faith', rounds: 100, concentration: true, spellId: 'shield-of-faith' })
    addEffect(c, ch, { name: 'Rage', rounds: 100, state: 'raging' })
    c.concentration = { name: 'Shield of Faith', since: 1 }
    expect(ch.activeStates).toContain('raging')
    dropConcentration(c, ch)
    expect(c.concentration).toBeUndefined()
    expect(c.effects.map((e) => e.name)).toEqual(['Rage'])
    expect(ch.customEffects).toHaveLength(0)
    endEffects(c, ch, () => true)
    expect(ch.activeStates).not.toContain('raging')
  })

  it('Rage gives resistance through the active state', () => {
    const ch = newCharacter({ classes: [{ classId: 'barbarian', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' })
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 10, self: true })
    expect(computeCharacter(ch, baseLookup).resistances).not.toContain('slashing')
    addEffect(c, ch, { name: 'Rage', rounds: 100, state: 'raging' })
    expect(computeCharacter(ch, baseLookup).resistances).toContain('slashing')
  })
})

import { freeCasts, spellTempDice, featureGrantedSpells } from '../src/renderer/src/lib/combat'

describe('temp HP and flat upcasting', () => {
  it('reads flat per-level increases', () => {
    expect(spellTempDice(spell('false-life'), 1, 3)).toBe('2d4+4')
    expect(spellTempDice(spell('false-life'), 3, 3)).toBe('2d4+14')
    expect(spellTempDice(spell('armor-of-agathys'), 2, 3)).toBe('10')
    expect(spellTempDice(spell('heroism'), 1, 4)).toBe('4')
    expect(spellHealDice(spell('heal'), 7, 3)).toBe('80')
    expect(spell('power-word-fortify').heal).toBeUndefined()
    expect(spell('power-word-fortify').tempHp).toBe('120')
  })
  it('Heroism refreshes temp HP at the start of your turn, Aid raises max HP', () => {
    const ch = newCharacter({ classes: [{ classId: 'paladin', level: 3, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' })
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 10, self: true })
    addEffect(c, ch, { name: 'Heroism', rounds: 10, spellId: 'heroism', tempEachTurn: 3 })
    ch.hp.temp = 0
    startOwnTurn(c, ch)
    expect(ch.hp.temp).toBe(3)
    const before = computeCharacter(ch, baseLookup).hpMax.value
    addEffect(c, ch, { name: 'Aid', rounds: 4800, spellId: 'aid' }, 3)
    expect(computeCharacter(ch, baseLookup).hpMax.value).toBe(before + 10)
  })
})

describe('free casts', () => {
  it('Magic Initiate gives one free cast per long rest, Ritual Caster does not', () => {
    const ch = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' })
    ch.feats.push({ uid: 'mi', featId: 'magic-initiate', source: 'background' }, { uid: 'rc', featId: 'ritual-caster', source: 'manual' })
    ch.spells.push({ spellId: 'shield', source: 'feat:mi', prepared: true, alwaysPrepared: true }, { spellId: 'find-familiar', source: 'feat:rc', prepared: true, alwaysPrepared: true })
    const d = computeCharacter(ch, baseLookup)
    const f = freeCasts(ch, d, baseLookup, spell('shield'))
    expect(f).toEqual([expect.objectContaining({ label: 'Magic Initiate', left: 1, max: 1, useKey: 'free:feat:mi:shield' })])
    ch.featureUses['free:feat:mi:shield'] = 1
    expect(freeCasts(ch, computeCharacter(ch, baseLookup), baseLookup, spell('shield'))[0].left).toBe(0)
    expect(freeCasts(ch, d, baseLookup, spell('find-familiar'))).toEqual([])
  })
  it('Favored Enemy gives free Hunter’s Mark casts and adds the spell to combat', () => {
    const ch = newCharacter({ classes: [{ classId: 'ranger', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' })
    const d = computeCharacter(ch, baseLookup)
    expect(featureGrantedSpells(d)).toContain('hunters-mark')
    const f = freeCasts(ch, d, baseLookup, spell('hunters-mark'))
    expect(f[0]).toMatchObject({ label: 'Favored Enemy', left: 2, max: 2 })
  })
  it('Armor of Shadows lets a warlock cast Mage Armor at will', () => {
    const ch = newCharacter({ classes: [{ classId: 'warlock', level: 2, hpRolls: [] }], speciesId: 'human', backgroundId: 'sage' })
    ch.choices['class:warlock:warlock-eldritch-invocations#option'] = ['armor-of-shadows']
    const d = computeCharacter(ch, baseLookup)
    expect(d.features.some((x) => x.key === 'option:armor-of-shadows')).toBe(true)
    expect(featureGrantedSpells(d)).toContain('mage-armor')
    expect(freeCasts(ch, d, baseLookup, spell('mage-armor'))[0]).toMatchObject({ left: null })
  })
  it('species spells are free once per long rest', () => {
    const ch = newCharacter({ classes: [{ classId: 'fighter', level: 3, hpRolls: [] }], speciesId: 'tiefling', backgroundId: 'soldier' })
    ch.spells.push({ spellId: 'hellish-rebuke', source: 'species', prepared: true, alwaysPrepared: true })
    const f = freeCasts(ch, computeCharacter(ch, baseLookup), baseLookup, spell('hellish-rebuke'))
    expect(f[0]).toMatchObject({ useKey: 'free:species:hellish-rebuke', left: 1 })
  })
})
