import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import { syncGrantedSpells } from '../src/renderer/src/lib/sync'

describe('species-traits og spells', () => {
  it('Draconic Flight (level 5) vises ikke på level 1', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'dragonborn' })
    const names = (lvl: number): string[] => {
      c.classes[0].level = lvl
      return computeCharacter(c, L).features.filter((f) => f.sourceType === 'species').map((f) => f.name)
    }
    expect(names(1)).not.toContain('Draconic Flight')
    expect(names(5)).toContain('Draconic Flight')
  })
  it('Aasimar får Light automatisk', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], speciesId: 'aasimar' })
    const spells = syncGrantedSpells(c, L)
    expect(spells?.some((s) => s.spellId === 'light' && s.source === 'species')).toBe(true)
  })
})

describe('fighting style-alternativer', () => {
  it('Blessed Warrior og Druidic Warrior finnes som valg med cantrips', () => {
    for (const id of ['blessed-warrior', 'druidic-warrior']) {
      const f = L.get('feat', id)
      expect(f?.category).toBe('fightingStyle')
      expect(f?.choices?.[0].type).toBe('cantrip')
    }
  })
  it('Paladin med Blessed Warrior må velge 2 cleric cantrips', () => {
    const c = newCharacter({ classes: [{ classId: 'paladin', level: 2, hpRolls: [] }] })
    c.feats.push({ uid: 'bw', featId: 'blessed-warrior', source: 'manual' })
    const p = computeCharacter(c, L).pending.find((x) => x.key === 'featchoice:bw:cantrips')
    expect(p?.count).toBe(2)
    expect(p?.filter).toBe('cleric')
  })
})
