import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import type { Character, ClassOptionGroup } from '../src/renderer/src/types'
import { newCharacter, normalizeCharacter } from '../src/renderer/src/store/characters'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { computeTips } from '../src/renderer/src/engine/tips'
import {
  addEffect, dropConcentration, handBackEffects, lastsBeyondCombat, newCombat, pickUpEffects, rollModeOf, settleVirtualCombat, tickEffects, virtualCombat
} from '../src/renderer/src/lib/combat'
import { optionPrereqProblems, parseOptionPrereq } from '../src/renderer/src/lib/rules'
import {
  applySlotRecovery, grantsInspirationOnLongRest, hitDieHeal, magicalCunningRegain, passRestTime, recoveryValid, slotRecoveryBudget, slotRecoveryOptions
} from '../src/renderer/src/lib/rest'
import { CONDITION_EFFECTS } from '../src/renderer/src/data/conditionEffects'

const L = baseLookup
const fighter = (p: Partial<Character> = {}): Character =>
  newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier', baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 }, ...p })

describe('conditions change rolls automatically', () => {
  it('Poisoned: disadvantage on attack rolls, ability checks, skills and initiative', () => {
    const d = computeCharacter(fighter({ conditions: ['poisoned'] }), L)
    const unarmed = d.attacks.find((a) => a.kind === 'unarmed')!
    expect(unarmed.bonus?.disadvantage).toContain('Condition: Poisoned')
    expect(d.checks.str.disadvantage).toContain('Condition: Poisoned')
    expect(d.skills.athletics.disadvantage).toContain('Condition: Poisoned')
    expect(d.initiative.disadvantage).toContain('Condition: Poisoned')
    expect(d.saves.dex.disadvantage ?? []).not.toContain('Condition: Poisoned')
    expect(rollModeOf(unarmed.bonus).mode).toBe('disadvantage')
  })
  it('Restrained: disadvantage on attacks and DEX saves, Speed 0 (Grappled too)', () => {
    const d = computeCharacter(fighter({ conditions: ['restrained'] }), L)
    expect(d.saves.dex.disadvantage).toContain('Condition: Restrained')
    expect(d.attacks.find((a) => a.kind === 'unarmed')!.bonus?.disadvantage).toContain('Condition: Restrained')
    expect(d.speed.value).toBe(0)
    expect(computeCharacter(fighter({ conditions: ['grappled'] }), L).speed.value).toBe(0)
  })
  it('Invisible gives advantage; Invisible + Prone cancel out to a normal roll', () => {
    const inv = computeCharacter(fighter({ conditions: ['invisible'] }), L).attacks.find((a) => a.kind === 'unarmed')!.bonus
    expect(rollModeOf(inv).mode).toBe('advantage')
    const both = computeCharacter(fighter({ conditions: ['invisible', 'prone'] }), L).attacks.find((a) => a.kind === 'unarmed')!.bonus
    expect(rollModeOf(both).mode).toBe('normal')
    expect(rollModeOf(both).why.length).toBe(2)
  })
  it('Blinded, Frightened and Prone affect attacks; spell attacks too', () => {
    for (const c of ['blinded', 'frightened', 'prone']) {
      const d = computeCharacter(fighter({ conditions: [c] }), L)
      expect(rollModeOf(d.attacks.find((a) => a.kind === 'unarmed')!.bonus).mode, c).toBe('disadvantage')
    }
    expect(computeCharacter(fighter({ conditions: ['frightened'] }), L).checks.wis.disadvantage?.length).toBeGreaterThan(0)
    const wiz = newCharacter({ classes: [{ classId: 'wizard', level: 1, hpRolls: [] }], conditions: ['blinded'], spells: [{ spellId: 'fire-bolt', source: 'wizard', prepared: true }] })
    const d = computeCharacter(wiz, L)
    expect(d.spellcasting[0].attack.disadvantage).toContain('Condition: Blinded')
    expect(d.attacks.find((a) => a.kind === 'spell')?.bonus?.disadvantage).toContain('Condition: Blinded')
  })
  it('the map only uses supported targets', () => {
    for (const list of Object.values(CONDITION_EFFECTS)) for (const e of list) expect(['attack.all', 'check.all', 'save.dex', 'initiative']).toContain(e.target)
  })
})

describe('persistent concentration and effects', () => {
  it('casting outside combat stores effects and concentration on the character', () => {
    const ch = fighter()
    const vc = virtualCombat(ch)
    addEffect(vc, ch, { name: 'Shield of Faith', rounds: 100, concentration: true, spellId: 'shield-of-faith' })
    vc.concentration = { name: 'Shield of Faith', spellId: 'shield-of-faith', since: 0 }
    settleVirtualCombat(vc, ch, '2026-01-01T00:00:00.000Z')
    expect(ch.effects?.map((e) => e.name)).toEqual(['Shield of Faith'])
    expect(ch.concentration).toEqual({ name: 'Shield of Faith', spellId: 'shield-of-faith', since: '2026-01-01T00:00:00.000Z' })
    const before = computeCharacter(fighter(), L).ac.value
    expect(computeCharacter(ch, L).ac.value).toBe(before + 2)
  })
  it('combat start picks them up, combat end hands lasting ones back', () => {
    const ch = fighter()
    addEffect(ch, ch, { name: 'Bless', rounds: 10, concentration: true, spellId: 'bless' })
    ch.concentration = { name: 'Bless', spellId: 'bless' }
    addEffect(ch, ch, { name: 'Mage Armor', rounds: 4800, spellId: 'mage-armor' })
    const c = newCombat('app', { uid: 'me', name: 'Hero', init: 10, self: true })
    pickUpEffects(c, ch)
    expect(c.effects.map((e) => e.name)).toEqual(['Bless', 'Mage Armor'])
    expect(c.concentration?.name).toBe('Bless')
    expect(ch.effects).toEqual([])
    expect(ch.concentration).toBeUndefined()
    // Under kampen: Shield (1 runde), Dodge og Rage slutter når kampen slutter
    addEffect(c, ch, { name: 'Shield', rounds: 1, spellId: 'shield' })
    addEffect(c, ch, { name: 'Dodge', rounds: 1 })
    addEffect(c, ch, { name: 'Rage', rounds: 100, state: 'raging' })
    expect(ch.activeStates).toContain('raging')
    const ended = handBackEffects(c, ch)
    expect(ended.map((e) => e.name).sort()).toEqual(['Dodge', 'Rage', 'Shield'])
    expect(ch.effects?.map((e) => e.name)).toEqual(['Bless', 'Mage Armor'])
    expect(ch.concentration?.name).toBe('Bless')
    expect(ch.activeStates).not.toContain('raging')
    expect(ch.customEffects.some((x) => x.label.startsWith('Shield'))).toBe(false)
    expect(c.effects).toEqual([])
  })
  it('lastsBeyondCombat: spells with time left, not one-round or non-spell effects', () => {
    expect(lastsBeyondCombat({ uid: 'a', name: 'Aid', rounds: 4000, spellId: 'aid' })).toBe(true)
    expect(lastsBeyondCombat({ uid: 'b', name: 'Hex', concentration: true })).toBe(true)
    expect(lastsBeyondCombat({ uid: 'c', name: 'Shield', rounds: 1, spellId: 'shield' })).toBe(false)
    expect(lastsBeyondCombat({ uid: 'd', name: 'Hidden' })).toBe(false)
  })
  it('time passing outside combat ends effects; dropping concentration ends its effects', () => {
    const ch = fighter()
    addEffect(ch, ch, { name: 'Shield of Faith', rounds: 100, concentration: true, spellId: 'shield-of-faith' })
    ch.concentration = { name: 'Shield of Faith' }
    addEffect(ch, ch, { name: 'Longstrider', rounds: 600, spellId: 'longstrider' })
    expect(tickEffects(ch, ch, 10).length).toBe(0)
    expect(ch.effects?.find((e) => e.name === 'Longstrider')?.rounds).toBe(590)
    const gone = tickEffects(ch, ch, 90)
    expect(gone.map((e) => e.name)).toEqual(['Shield of Faith'])
    expect(ch.concentration).toBeUndefined()
    addEffect(ch, ch, { name: 'Hex', concentration: true })
    ch.concentration = { name: 'Hex' }
    dropConcentration(ch, ch)
    expect(ch.effects?.map((e) => e.name)).toEqual(['Longstrider'])
  })
  it('a long rest ends concentration and effects shorter than 8 hours', () => {
    const ch = fighter()
    addEffect(ch, ch, { name: 'Aid', rounds: 4800, spellId: 'aid' }, 2)
    addEffect(ch, ch, { name: 'Hex', concentration: true })
    ch.concentration = { name: 'Hex' }
    addEffect(ch, ch, { name: 'Long buff', rounds: 14400 })
    passRestTime(ch, 'long')
    expect(ch.effects?.map((e) => [e.name, e.rounds])).toEqual([['Long buff', 9600]])
    expect(ch.concentration).toBeUndefined()
  })
  it('older characters without the new fields are normalized', () => {
    const raw = { ...fighter() } as Partial<Character>
    delete raw.effects
    expect(normalizeCharacter(raw).effects).toEqual([])
  })
})

describe('Eldritch Invocation prerequisites', () => {
  it('parses levels, pact boons, other invocations and cantrip requirements', () => {
    expect(parseOptionPrereq('Level 5+ Warlock, Pact of the Blade Invocation')).toEqual({ level: 5, classId: 'warlock', options: [{ anyOf: ['pact-of-the-blade'], label: 'Pact of the Blade' }] })
    expect(parseOptionPrereq('Level 12+ Warlock, Thirsting Blade Invocation').options).toEqual([{ anyOf: ['thirsting-blade'], label: 'Thirsting Blade' }])
    expect(parseOptionPrereq('Pact of the Blade/Chain/Tome').options[0].anyOf).toEqual(['pact-of-the-blade', 'pact-of-the-chain', 'pact-of-the-tome'])
    expect(parseOptionPrereq('Level 2+ Warlock, a Warlock Cantrip That Deals Damage').cantrip).toBe('damage')
    expect(parseOptionPrereq('Level 2+ Warlock, a Warlock Cantrip That Deals Damage via an Attack Roll').cantrip).toBe('attack')
    expect(parseOptionPrereq('Battle Master')).toEqual({ level: 0, options: [] })
    expect(parseOptionPrereq(undefined)).toEqual({ level: 0, options: [] })
  })
  const groups = L.classOptions.filter((g: ClassOptionGroup) => g.group === 'Eldritch Invocations')
  const item = (id: string) => groups.flatMap((g) => g.items).find((x) => x.id === id)!
  const warlock = (level: number, invocations: string[], cantrips: string[] = []): Character =>
    newCharacter({
      classes: [{ classId: 'warlock', level, hpRolls: [] }],
      choices: { 'class:warlock:warlock-eldritch-invocations#option': invocations },
      spells: cantrips.map((spellId) => ({ spellId, source: 'warlock', prepared: true }))
    })
  it('checks pact boons, other invocations, cantrips and level', () => {
    expect(optionPrereqProblems(item('thirsting-blade'), 'warlock', warlock(5, []), L)).toEqual(['Pact of the Blade'])
    expect(optionPrereqProblems(item('thirsting-blade'), 'warlock', warlock(5, ['pact-of-the-blade']), L)).toEqual([])
    expect(optionPrereqProblems(item('devouring-blade'), 'warlock', warlock(12, ['pact-of-the-blade']), L)).toEqual(['Thirsting Blade'])
    expect(optionPrereqProblems(item('agonizing-blast'), 'warlock', warlock(2, []), L)).toHaveLength(1)
    expect(optionPrereqProblems(item('agonizing-blast'), 'warlock', warlock(2, [], ['eldritch-blast']), L)).toEqual([])
    expect(optionPrereqProblems(item('eldritch-smite'), 'warlock', warlock(3, ['pact-of-the-blade']), L)).toEqual(['Level 5+ Warlock'])
  })
  it('warns about chosen invocations whose prerequisites are no longer met', () => {
    const ch = warlock(5, ['thirsting-blade', 'pact-of-the-tome'])
    const tips = computeTips(ch, computeCharacter(ch, L), L, 'en')
    expect(tips.some((t) => t.id === 'optprereq:thirsting-blade' && t.level === 'warning')).toBe(true)
    const ok = warlock(5, ['thirsting-blade', 'pact-of-the-blade'])
    expect(computeTips(ok, computeCharacter(ok, L), L, 'en').some((t) => t.id.startsWith('optprereq:'))).toBe(false)
  })
})

describe('languages at creation', () => {
  it('warns when a rare language is chosen', () => {
    const rare = L.all('language').find((l) => l.rarity === 'rare')!
    const std = L.all('language').find((l) => l.rarity === 'standard' && l.id !== 'common')!
    const ch = fighter({ choices: { 'origin:languages#language': [std.id, rare.id] } })
    expect(computeTips(ch, computeCharacter(ch, L), L, 'en').some((t) => t.id === 'rarelang')).toBe(true)
    const ok = fighter({ choices: { 'origin:languages#language': [std.id] } })
    expect(computeTips(ok, computeCharacter(ok, L), L, 'en').some((t) => t.id === 'rarelang')).toBe(false)
  })
})

describe('rests with class rules', () => {
  it('slot recovery budget is half the class level, rounded up', () => {
    expect([1, 2, 3, 4, 5, 6, 20].map(slotRecoveryBudget)).toEqual([1, 1, 2, 2, 3, 3, 10])
  })
  it('Arcane Recovery: wizard 4 recovers one level 2 or two level 1 slots, none of level 6+', () => {
    const ch = newCharacter({ classes: [{ classId: 'wizard', level: 4, hpRolls: [] }], spellSlotsUsed: [2, 1] })
    const d = computeCharacter(ch, L)
    const [r] = slotRecoveryOptions(ch, d)
    expect(r).toMatchObject({ id: 'arcane-recovery', budget: 2, maxLevel: 5, available: true })
    expect(recoveryValid({ 2: 1 }, r, d.slots)).toBe(true)
    expect(recoveryValid({ 1: 2 }, r, d.slots)).toBe(true)
    expect(recoveryValid({ 1: 1, 2: 1 }, r, d.slots)).toBe(false)
    expect(recoveryValid({ 1: 3 }, { budget: 3, maxLevel: 5 }, d.slots)).toBe(false) // bare 2 brukt
    expect(recoveryValid({ 6: 1 }, { budget: 10, maxLevel: 5 }, [{ level: 6, used: 1 }])).toBe(false)
    applySlotRecovery(ch, r, { 2: 1 })
    expect(ch.spellSlotsUsed).toEqual([2, 0])
    expect(slotRecoveryOptions(ch, computeCharacter(ch, L))[0].available).toBe(false)
  })
  it('Natural Recovery (Circle of the Land) has its own once-per-long-rest use', () => {
    const ch = newCharacter({ classes: [{ classId: 'druid', level: 6, subclassId: 'circle-of-the-land', hpRolls: [] }] })
    const r = slotRecoveryOptions(ch, computeCharacter(ch, L)).find((x) => x.id === 'natural-recovery')
    expect(r).toMatchObject({ budget: 3, available: true, useKey: 'rest:natural-recovery' })
  })
  it('Magical Cunning regains half the pact slots (rounded up), Resourceful grants inspiration, Hit Dice heal at least 1', () => {
    expect(magicalCunningRegain(2, 2)).toBe(1)
    expect(magicalCunningRegain(3, 3)).toBe(2)
    expect(magicalCunningRegain(4, 1)).toBe(1)
    expect(magicalCunningRegain(2, 0)).toBe(0)
    expect(grantsInspirationOnLongRest(computeCharacter(fighter(), L))).toBe(true)
    expect(grantsInspirationOnLongRest(computeCharacter(fighter({ speciesId: 'dwarf' }), L))).toBe(false)
    expect(hitDieHeal(-2)).toBe(1)
    expect(hitDieHeal(7)).toBe(7)
  })
})
