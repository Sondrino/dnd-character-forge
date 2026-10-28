import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import { syncGrantedSpells } from '../src/renderer/src/lib/sync'
import { blankEntity } from '../src/renderer/src/components/HomebrewEditor'
import { validateHomebrew } from '../src/renderer/src/components/homebrew/KindForms'
import type { BackgroundDef, SpeciesDef, SubclassDef } from '../src/renderer/src/types'

const sub: SubclassDef = {
  ...(blankEntity('subclass') as SubclassDef),
  id: 'hb-oath-of-ash', name: 'Oath of Ash', classId: 'paladin', summary: 'Ash knights', description: '',
  features: [
    { id: 'ash-aura', name: 'Cinder Aura', level: 3, summary: 'Fire resistance', description: '', activation: 'passive', effects: [{ target: 'resistance', op: 'grant', value: 'fire' }] },
    { id: 'ash-burst', name: 'Ash Burst', level: 3, summary: 'Cone of ash', description: '', activation: 'action', uses: { count: 'prof', recharge: 'long' }, roll: { kind: 'save', save: 'con', dc: '8+prof+mod.cha', dice: '2d8', damageType: 'fire' } },
    { id: 'ash-late', name: 'Phoenix Rite', level: 15, summary: 'Later', description: '' }
  ],
  alwaysPrepared: [{ level: 3, spells: ['burning-hands', 'shield'] }]
}

describe('homebrew subclass', () => {
  it('works like an official subclass: features by level, effects, uses, combat roll and always-prepared spells', () => {
    const L = baseLookup.extend([sub])
    const c = newCharacter({ classes: [{ classId: 'paladin', level: 3, subclassId: sub.id, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' })
    const d = computeCharacter(c, L)
    expect(d.features.some((f) => f.name === 'Cinder Aura')).toBe(true)
    expect(d.features.some((f) => f.name === 'Phoenix Rite')).toBe(false)
    expect(d.resistances).toContain('fire')
    const burst = d.features.find((f) => f.name === 'Ash Burst')!
    expect(burst.uses?.max).toBe(2)
    expect(burst.roll?.kind).toBe('save')
    const spells = syncGrantedSpells(c, L)!
    expect(spells.filter((s) => s.alwaysPrepared).map((s) => s.spellId).sort()).toEqual(['burning-hands', 'shield'])
  })
  it('appears among the class’s subclasses', () => {
    const L = baseLookup.extend([sub])
    expect(L.all('subclass').filter((s) => s.classId === 'paladin').map((s) => s.id)).toContain(sub.id)
  })
})

describe('homebrew species and background', () => {
  it('species: speed, darkvision, trait effects and innate spells', () => {
    const sp: SpeciesDef = {
      ...(blankEntity('species') as SpeciesDef), id: 'hb-ember', name: 'Emberkin', summary: '', description: '', speed: 35, darkvision: 60,
      traits: [{ id: 'ember-skin', name: 'Ember Skin', summary: '', description: '', effects: [{ target: 'ac', op: 'add', value: 1 }] }],
      spells: [{ level: 1, spellId: 'produce-flame' }]
    }
    const L = baseLookup.extend([sp])
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: sp.id, backgroundId: 'soldier' })
    const base = computeCharacter(newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: 'soldier' }), L)
    const d = computeCharacter(c, L)
    expect(d.speed.value).toBe(35)
    expect(d.darkvision).toBe(60)
    expect(d.ac.value).toBe(base.ac.value + 1)
    expect(syncGrantedSpells(c, L)!.some((s) => s.spellId === 'produce-flame' && s.source === 'species')).toBe(true)
  })
  it('background: needs exactly 3 abilities and 2 skills, then offers its bonuses and feat', () => {
    const bg = { ...(blankEntity('background') as BackgroundDef), id: 'hb-ashwalker', name: 'Ashwalker', summary: '', description: '' }
    expect(validateHomebrew({ ...bg, abilityScores: ['str', 'dex'] as never })).toBe('hb.err.abilities')
    expect(validateHomebrew({ ...bg, skills: ['athletics'] as never })).toBe('hb.err.skills')
    expect(validateHomebrew(bg)).toBeNull()
    const L = baseLookup.extend([bg])
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'human', backgroundId: bg.id })
    const d = computeCharacter(c, L)
    expect(d.pending.find((p) => p.key === 'background:abilities')?.options).toEqual(['str', 'dex', 'con'])
    expect(d.pending.some((p) => p.key === 'background:tool#tool')).toBe(true)
  })
  it('every homebrew kind has a valid blank entity', () => {
    for (const k of ['subclass', 'species', 'background', 'feat', 'spell', 'magicItem', 'weapon', 'armor', 'gear', 'tool', 'creature', 'language'] as const) {
      const e = blankEntity(k)
      expect(e.kind, k).toBe(k)
      expect(validateHomebrew({ ...e, name: 'X' }), k).toBeNull()
    }
  })
})
