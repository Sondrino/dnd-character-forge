import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'

const L = baseLookup
const feat = (c: ReturnType<typeof newCharacter>, name: string) => computeCharacter(c, L).features.find((f) => f.name === name)!

describe('2024 recharge rules', () => {
  it('Rage, Second Wind, Wild Shape and Channel Divinity regain one use on a short rest', () => {
    for (const [cls, name] of [['barbarian', 'Rage'], ['fighter', 'Second Wind'], ['druid', 'Wild Shape'], ['cleric', 'Channel Divinity'], ['paladin', 'Channel Divinity']] as const) {
      const c = newCharacter({ classes: [{ classId: cls, level: 3, hpRolls: [] }] })
      expect(feat(c, name).uses?.recharge, `${cls} ${name}`).toBe('shortOne')
    }
  })
  it('Bardic Inspiration recharges on a short rest from level 5 (Font of Inspiration)', () => {
    expect(feat(newCharacter({ classes: [{ classId: 'bard', level: 4, hpRolls: [] }] }), 'Bardic Inspiration').uses?.recharge).toBe('long')
    expect(feat(newCharacter({ classes: [{ classId: 'bard', level: 5, hpRolls: [] }] }), 'Bardic Inspiration').uses?.recharge).toBe('shortOrLong')
  })
  it('skill.all and check.all advantage reach every skill; save disadvantage is tracked', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }] })
    c.customEffects.push({ uid: 'a', label: 'Guidance-ish', active: true, target: 'check.all', op: 'advantage' })
    c.customEffects.push({ uid: 'b', label: 'Curse', active: true, target: 'save.wis', op: 'disadvantage' })
    const d = computeCharacter(c, L)
    expect(d.skills.stealth.advantage?.length).toBeGreaterThan(0)
    expect(d.saves.wis.disadvantage?.length).toBeGreaterThan(0)
  })
})
