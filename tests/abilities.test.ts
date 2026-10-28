import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import { evalAbility, resolveDice } from '../src/renderer/src/lib/combat'
import { combatOptions } from '../src/renderer/src/components/combat/useCombat'
import { stateName } from '../src/renderer/src/components/sheet/SpecialAbilityEditor'

const L = baseLookup
const hero = () =>
  newCharacter({ classes: [{ classId: 'fighter', level: 5, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier', baseAbilities: { str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 15 } })

describe('formulas in special abilities', () => {
  it('evaluates DC and attack formulas from the character', () => {
    const d = computeCharacter(hero(), L)
    expect(evalAbility('8+prof+mod.con', d)).toBe(8 + 3 + 2)
    expect(evalAbility('prof+mod.str', d)).toBe(3 + 3)
    expect(evalAbility('nonsense', d)).toBeNull()
  })
  it('turns dice formulas into rollable notation', () => {
    const d = computeCharacter(hero(), L)
    expect(resolveDice('2d6+mod.cha', d)).toBe('2d6+2')
    expect(resolveDice('1d10 + level', d)).toBe('1d10+5')
    expect(resolveDice('1d8+mod.int', d)).toBe('1d8-1')
    expect(resolveDice('2d6+1d4+prof', d)).toBe('2d6+1d4+3')
    expect(resolveDice('mod.cha+prof', d)).toBe('5')
  })
  it('makes readable state names', () => {
    expect(stateName('Frost Breath')).toBe('frostBreath')
    expect(stateName('Drakens Vinger!')).toBe('drakensVinger')
  })
})

describe('special abilities on the sheet and in combat', () => {
  it('toggle effects only apply while the ability is on', () => {
    const c = hero()
    c.customFeatures.push({ id: 'ability-x', name: 'Stone Skin', summary: '+2 AC', description: '', activation: 'bonus', toggle: 'stoneSkin', effects: [{ target: 'ac', op: 'add', value: 2, condition: 'stoneSkin' }] })
    const base = computeCharacter(c, L).ac.value
    c.activeStates.push('stoneSkin')
    expect(computeCharacter(c, L).ac.value).toBe(base + 2)
  })
  it('uses formulas and shows up in combat with its roll', () => {
    const c = hero()
    c.customFeatures.push({ id: 'ability-b', name: 'Frost Breath', summary: 'Cone of cold', description: '', activation: 'action', uses: { count: 'prof', recharge: 'long' }, roll: { kind: 'save', save: 'dex', dc: '8+prof+mod.con', dice: '2d6', damageType: 'cold' } })
    c.customFeatures.push({ id: 'ability-p', name: 'Lucky Charm', summary: 'Passive with uses', description: '', activation: 'passive', roll: { kind: 'heal', dice: '1d4' } })
    const d = computeCharacter(c, L)
    const f = d.features.find((x) => x.key === 'custom:ability-b')!
    expect(f.uses).toMatchObject({ max: 3, used: 0 })
    expect(f.roll?.kind).toBe('save')
    const g = combatOptions(c, d, L)
    expect(g.action.some((o) => o.kind === 'feature' && o.feature.id === 'ability-b')).toBe(true)
    expect(g.other.some((o) => o.kind === 'feature' && o.feature.id === 'ability-p')).toBe(true)
  })
})
