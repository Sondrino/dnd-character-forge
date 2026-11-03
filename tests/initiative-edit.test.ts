import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { editCombatant, initiativeOrder, moveCombatant, newCombat, setInitiative, shiftCombatant } from '../src/renderer/src/lib/combat'
import { companionCombatants, customCompanion, defaultCompanionKind, syncCombatFromCompanion, syncCompanionsFromCombat } from '../src/renderer/src/lib/companions'
import { pendingSkillChoices } from '../src/renderer/src/lib/skillNotice'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { Combatant } from '../src/renderer/src/types'

const fight = (): { combatants: Combatant[]; turnIdx: number } => ({
  turnIdx: 1,
  combatants: [
    { uid: 'a', name: 'Ann', init: 20 },
    { uid: 'b', name: 'Bob', init: 15 },
    { uid: 'c', name: 'Cid', init: 10 },
    { uid: 'd', name: 'Dee', init: 5 }
  ]
})
const names = (e: { combatants: Combatant[] }): string => initiativeOrder(e.combatants).map((x) => x.uid).join('')
const current = (e: { combatants: Combatant[]; turnIdx: number }): string => initiativeOrder(e.combatants)[e.turnIdx].uid

describe('flytting i initiativlista', () => {
  it('flytter ett steg og øverst/nederst', () => {
    const e = fight()
    shiftCombatant(e, 'c', 'up')
    expect(names(e)).toBe('acbd')
    shiftCombatant(e, 'c', 'down')
    expect(names(e)).toBe('abcd')
    shiftCombatant(e, 'd', 'top')
    expect(names(e)).toBe('dabc')
    shiftCombatant(e, 'd', 'bottom')
    expect(names(e)).toBe('abcd')
  })

  it('holder tallene synkende, så lista ikke hopper tilbake ved neste sortering', () => {
    const e = fight()
    shiftCombatant(e, 'd', 'top')
    const order = initiativeOrder(e.combatants)
    expect(order.map((x) => x.init)).toEqual([...order.map((x) => x.init)].sort((a, b) => b - a))
    expect(order[0].init).toBe(20)
  })

  it('beholder hvem sin tur det er, også når den som har turen flyttes', () => {
    const e = fight()
    expect(current(e)).toBe('b')
    shiftCombatant(e, 'd', 'top')
    expect(current(e)).toBe('b')
    shiftCombatant(e, 'b', 'bottom')
    expect(current(e)).toBe('b')
    setInitiative(e, 'a', 1)
    expect(current(e)).toBe('b')
  })

  it('drar før og etter en bestemt deltaker', () => {
    const e = fight()
    moveCombatant(e, 'a', 'c', 'after')
    expect(names(e)).toBe('bcad')
    moveCombatant(e, 'd', 'b', 'before')
    expect(names(e)).toBe('dbca')
    moveCombatant(e, 'a', 'a', 'before')
    expect(names(e)).toBe('dbca')
  })

  it('tre på samme tall kan stokkes om, og nytt initiativ tar deltakeren ut av den manuelle rekkefølgen', () => {
    const e = fight()
    shiftCombatant(e, 'c', 'up')
    shiftCombatant(e, 'd', 'up')
    shiftCombatant(e, 'd', 'up')
    expect(names(e)).toBe('adcb')
    setInitiative(e, 'd', 3)
    expect(initiativeOrder(e.combatants).find((x) => x.uid === 'd')?.tie).toBeUndefined()
    expect(names(e)).toBe('acbd')
  })

  it('ukjente deltakere og kanter gjør ingenting', () => {
    const e = fight()
    shiftCombatant(e, 'a', 'up')
    shiftCombatant(e, 'd', 'down')
    shiftCombatant(e, 'nope', 'top')
    moveCombatant(e, 'a', 'nope', 'after')
    expect(names(e)).toBe('abcd')
  })

  it('uten manuell flytting gjelder de gamle reglene ved likt initiativ', () => {
    const order = initiativeOrder([
      { uid: 'x', name: 'Zed', init: 10 },
      { uid: 'y', name: 'Amy', init: 10 },
      { uid: 'z', name: 'Me', init: 10, self: true }
    ])
    expect(order.map((x) => x.uid)).toEqual(['z', 'y', 'x'])
  })
})

describe('redigering av deltakere', () => {
  it('endrer navn, men ignorerer tomt navn', () => {
    const x: Combatant = { uid: 'a', name: 'Goblin', init: 5 }
    editCombatant(x, { name: '  Sjefen ' })
    expect(x.name).toBe('Sjefen')
    editCombatant(x, { name: '   ' })
    expect(x.name).toBe('Sjefen')
  })

  it('holder HP innenfor maks og oppdaterer defeated', () => {
    const x: Combatant = { uid: 'a', name: 'Goblin', init: 5, hp: 7, maxHp: 7 }
    editCombatant(x, { maxHp: 5 })
    expect(x.hp).toBe(5)
    editCombatant(x, { hp: 0 })
    expect(x.defeated).toBe(true)
    editCombatant(x, { hp: 3 })
    expect(x.defeated).toBe(false)
    editCombatant(x, { hp: -4 })
    expect(x.hp).toBe(0)
  })

  it('tømmer tallfelt med null, og AC-endring vekker ikke en beseiret deltaker', () => {
    const x: Combatant = { uid: 'a', name: 'Goblin', init: 5, hp: 0, maxHp: 7, ac: 15, defeated: true }
    editCombatant(x, { ac: 12 })
    expect(x.defeated).toBe(true)
    editCombatant(x, { ac: null })
    expect(x.ac).toBeUndefined()
  })
})

describe('koblede companions', () => {
  const withCompanion = () => {
    const ch = newCharacter({ name: 'Hero' })
    ch.companions = [customCompanion('Ulv', 10, 13, 'companion')]
    ch.combat = newCombat('app', { uid: 'self', name: 'Hero', init: 10, self: true })
    ch.combat.combatants.push(...companionCombatants(ch, () => 8))
    return ch
  }

  it('nytt navn, AC og maks HP i initiativlista følger med tilbake til companionen', () => {
    const ch = withCompanion()
    const x = ch.combat!.combatants.find((y) => y.companionUid)!
    editCombatant(x, { name: 'Fenris', ac: 15, maxHp: 20, hp: 18 })
    syncCompanionsFromCombat(ch)
    expect(ch.companions![0]).toMatchObject({ name: 'Fenris', ac: 15, maxHp: 20, hp: 18 })
  })

  it('nytt navn på arket følger med inn i kampen', () => {
    const ch = withCompanion()
    ch.companions![0].name = 'Fenris'
    syncCombatFromCompanion(ch, ch.companions![0].uid)
    expect(ch.combat!.combatants.find((y) => y.companionUid)!.name).toBe('Fenris')
  })

  it('gjetter type ut fra classen', () => {
    expect(defaultCompanionKind({ classes: [{ classId: 'wizard', level: 1, hpRolls: [] }] })).toBe('familiar')
    expect(defaultCompanionKind({ classes: [{ classId: 'paladin', level: 5, hpRolls: [] }] })).toBe('steed')
    expect(defaultCompanionKind({ classes: [{ classId: 'ranger', level: 3, hpRolls: [] }] })).toBe('companion')
  })
})

describe('varsel om skill proficiencies', () => {
  const human = () => newCharacter({ name: 'Hero', speciesId: 'human', classes: [{ classId: 'rogue', level: 7, hpRolls: [] }] })
  const L = baseLookup

  it('class-en varsler om sine egne valg, ikke andre class-er sine', () => {
    const d = computeCharacter(human(), L)
    const rogue = L.get('class', 'rogue')!
    const wizard = L.get('class', 'wizard')!
    expect(pendingSkillChoices(rogue, d).map((p) => p.source)).toEqual(['Rogue'])
    expect(pendingSkillChoices(wizard, d)).toEqual([])
  })

  it('species og species-feature med eget skill-valg varsler om det valget', () => {
    const d = computeCharacter(human(), L)
    const species = L.get('species', 'human')!
    expect(pendingSkillChoices(species, d).map((p) => p.source)).toEqual(['Human: Skillful'])
    const skillful = d.features.find((f) => f.name === 'Skillful')!
    expect(pendingSkillChoices({ ...skillful, kind: 'feature' }, d).map((p) => p.source)).toEqual(['Human: Skillful'])
  })

  it('en feature som omtaler skill proficiencies varsler; andre features gjør det ikke', () => {
    const d = computeCharacter(human(), L)
    const reliable = d.features.find((f) => f.name === 'Reliable Talent')!
    expect(pendingSkillChoices({ ...reliable, kind: 'feature' }, d).length).toBeGreaterThan(0)
    const sneak = d.features.find((f) => f.name === 'Sneak Attack')!
    expect(pendingSkillChoices({ ...sneak, kind: 'feature' }, d)).toEqual([])
  })

  it('features karakteren ikke har gir ikke varsel', () => {
    const d = computeCharacter(human(), L)
    expect(pendingSkillChoices({ kind: 'feature', id: 'jack-of-all-trades-x', name: 'Jack of All Trades', description: 'skills you aren’t proficient in' }, d)).toEqual([])
  })

  it('varselet forsvinner når valget er tatt', () => {
    const ch = human()
    ch.choices['class:rogue:skills#skill'] = ['stealth', 'acrobatics', 'deception', 'insight']
    const d = computeCharacter(ch, L)
    expect(pendingSkillChoices(L.get('class', 'rogue')!, d)).toEqual([])
  })
})

describe('prepared spells', () => {
  it('always prepared teller ikke mot maks, men vises for seg', () => {
    const ch = newCharacter({ name: 'Drake', classes: [{ classId: 'sorcerer', level: 3, subclassId: 'draconic-sorcery', hpRolls: [] }] })
    ch.spells = [
      { spellId: 'magic-missile', source: 'sorcerer', prepared: true },
      { spellId: 'alter-self', source: 'sorcerer', prepared: true, alwaysPrepared: true },
      { spellId: 'chromatic-orb', source: 'sorcerer', prepared: true, alwaysPrepared: true },
      { spellId: 'fire-bolt', source: 'sorcerer', prepared: true }
    ]
    const sc = computeCharacter(ch, baseLookup).spellcasting[0]
    expect(sc.preparedCount).toBe(1)
    expect(sc.alwaysPreparedCount).toBe(2)
    expect(sc.cantripCount).toBe(1)
    expect(sc.preparedMax).toBe(6)
  })

  it('tabellene følger 2024-reglene: prepared er ikke det samme som slots', () => {
    const at = (classId: string, level: number) => computeCharacter(newCharacter({ name: 'X', classes: [{ classId, level, hpRolls: [] }] }), baseLookup)
    const sorc2 = at('sorcerer', 2)
    expect(sorc2.spellcasting[0].preparedMax).toBe(4)
    expect(sorc2.slots.reduce((n, s) => n + s.max, 0)).toBe(3)
    const lock5 = at('warlock', 5)
    expect(lock5.spellcasting[0].preparedMax).toBe(6)
    expect(lock5.pact?.count).toBe(2)
  })
})
