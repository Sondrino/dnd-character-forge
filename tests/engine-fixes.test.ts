import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'

const L = baseLookup

describe('class tool choices', () => {
  it('Bard asks for 3 musical instruments and grants them', () => {
    const c = newCharacter({ classes: [{ classId: 'bard', level: 1, hpRolls: [] }] })
    const p = computeCharacter(c, L).pending.find((x) => x.key === 'class:bard:tools#tool')
    expect(p).toMatchObject({ type: 'tool', count: 3, chosen: 0, filter: 'musical' })
    c.choices['class:bard:tools#tool'] = ['lute', 'flute', 'drum']
    const d = computeCharacter(c, L)
    expect(d.pending.some((x) => x.key === 'class:bard:tools#tool')).toBe(false)
    expect(d.proficiencies.tools).toEqual(expect.arrayContaining(['lute', 'flute', 'drum']))
  })
  it('Artificer gets thieves’ and tinker’s tools plus one artisan’s tool choice', () => {
    const c = newCharacter({ classes: [{ classId: 'artificer', level: 1, hpRolls: [] }] })
    const d = computeCharacter(c, L)
    expect(d.proficiencies.tools).toEqual(expect.arrayContaining(['thieves-tools', 'tinkers-tools']))
    expect(d.pending.find((x) => x.key === 'class:artificer:tools#tool')).toMatchObject({ count: 1, filter: 'artisan' })
  })
  it('only the first class gives tool choices', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }, { classId: 'bard', level: 1, hpRolls: [] }] })
    expect(computeCharacter(c, L).pending.some((x) => x.key === 'class:bard:tools#tool')).toBe(false)
  })
})

describe('options picked through feats', () => {
  it('Eldritch Adept adds the chosen invocation as a feature', () => {
    const inv = L.classOptions.find((g) => g.group === 'Eldritch Invocations')!.items.find((i) => !i.prerequisite)!
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 4, hpRolls: [] }] })
    c.feats.push({ uid: 'f1', featId: 'eldritch-adept', source: 'manual', choices: { invocation: [inv.id] } })
    expect(computeCharacter(c, L).features.some((f) => f.key === `option:${inv.id}`)).toBe(true)
  })
})
