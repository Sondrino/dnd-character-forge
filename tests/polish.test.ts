import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EMPTY_SPELL_FILTER, filterCharacters, isSpellFilterActive, matchOwnSpell } from '../src/renderer/src/lib/polish'
import { newCharacter, useCharacters } from '../src/renderer/src/store/characters'
import { removeWithUndo, useUi } from '../src/renderer/src/store/ui'
import type { CharacterSpell, SpellDef } from '../src/renderer/src/types'

const spell = (p: Partial<SpellDef>): SpellDef =>
  ({
    id: 'x', kind: 'spell', name: 'Test Spell', source: 'SRD 5.2', summary: '', description: '', level: 1, school: 'Evocation',
    castingTime: 'Action', range: '60 feet', components: { v: true, s: true }, duration: 'Instantaneous', concentration: false, ritual: false, classes: [],
    ...p
  }) as SpellDef
const own = (p: Partial<CharacterSpell> = {}): CharacterSpell => ({ spellId: 'x', source: 'wizard', prepared: false, ...p })

describe('matchOwnSpell', () => {
  it('ingen filter = alt vises', () => {
    expect(isSpellFilterActive(EMPTY_SPELL_FILTER)).toBe(false)
    expect(matchOwnSpell(own(), spell({}), EMPTY_SPELL_FILTER)).toBe(true)
  })
  it('søk i navn og school', () => {
    const f = { ...EMPTY_SPELL_FILTER, query: 'fire' }
    expect(isSpellFilterActive(f)).toBe(true)
    expect(matchOwnSpell(own(), spell({ name: 'Fireball' }), f)).toBe(true)
    expect(matchOwnSpell(own(), spell({ name: 'Shield' }), f)).toBe(false)
    expect(matchOwnSpell(own(), spell({ name: 'Shield', school: 'Abjuration' }), { ...f, query: 'abj' })).toBe(true)
  })
  it('bare prepared – cantrips og alltid prepared teller', () => {
    const f = { ...EMPTY_SPELL_FILTER, preparedOnly: true }
    expect(matchOwnSpell(own(), spell({ level: 1 }), f)).toBe(false)
    expect(matchOwnSpell(own({ prepared: true }), spell({ level: 1 }), f)).toBe(true)
    expect(matchOwnSpell(own({ alwaysPrepared: true }), spell({ level: 3 }), f)).toBe(true)
    expect(matchOwnSpell(own(), spell({ level: 0 }), f)).toBe(true)
  })
  it('ritual, concentration og casting time', () => {
    expect(matchOwnSpell(own(), spell({ ritual: true }), { ...EMPTY_SPELL_FILTER, ritual: true })).toBe(true)
    expect(matchOwnSpell(own(), spell({ ritual: false }), { ...EMPTY_SPELL_FILTER, ritual: true })).toBe(false)
    expect(matchOwnSpell(own(), spell({ concentration: true }), { ...EMPTY_SPELL_FILTER, concentration: true })).toBe(true)
    expect(matchOwnSpell(own(), spell({ castingTime: 'Bonus Action' }), { ...EMPTY_SPELL_FILTER, time: 'bonus' })).toBe(true)
    expect(matchOwnSpell(own(), spell({ castingTime: 'Action' }), { ...EMPTY_SPELL_FILTER, time: 'bonus' })).toBe(false)
    expect(matchOwnSpell(own(), spell({ castingTime: 'Reaction, which you take when …' }), { ...EMPTY_SPELL_FILTER, time: 'reaction' })).toBe(true)
    expect(matchOwnSpell(own(), spell({ castingTime: '1 minute' }), { ...EMPTY_SPELL_FILTER, time: 'action' })).toBe(false)
  })
})

describe('filterCharacters', () => {
  const a = newCharacter({ name: 'Brann', classes: [{ classId: 'fighter', level: 3, hpRolls: [] }] })
  const b = newCharacter({ name: 'Lys', playerName: 'Kari', archived: true })
  const c = newCharacter({ name: 'Skygge', speciesId: 'elf' })
  it('skjuler arkiverte med mindre de skal vises', () => {
    expect(filterCharacters([a, b, c], '', false).map((x) => x.name)).toEqual(['Brann', 'Skygge'])
    expect(filterCharacters([a, b, c], '', true)).toHaveLength(3)
  })
  it('søker i navn, spiller, class, species og beskrivelse', () => {
    expect(filterCharacters([a, b, c], 'bra', false).map((x) => x.name)).toEqual(['Brann'])
    expect(filterCharacters([a, b, c], 'fighter', false).map((x) => x.name)).toEqual(['Brann'])
    expect(filterCharacters([a, b, c], 'kari', true).map((x) => x.name)).toEqual(['Lys'])
    expect(filterCharacters([a, b, c], 'elf', false).map((x) => x.name)).toEqual(['Skygge'])
    expect(filterCharacters([a, b, c], 'high elf', false, (x) => (x.speciesId === 'elf' ? 'High Elf' : '')).map((x) => x.name)).toEqual(['Skygge'])
  })
})

describe('removeWithUndo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  it('sletter, viser melding med Angre-knapp, og angrer', () => {
    const ch = newCharacter({ name: 'Undo', inventory: [{ uid: 'i1', name: 'Rope', qty: 1, equipped: false, attuned: false }] })
    useCharacters.setState({ characters: { [ch.id]: ch } })
    removeWithUndo(ch.id, (d) => void (d.inventory = []), 'Rope slettet')
    expect(useCharacters.getState().characters[ch.id].inventory).toHaveLength(0)
    const toast = useUi.getState().toast
    expect(toast?.text).toBe('Rope slettet')
    expect(toast?.action).toBeDefined()
    toast!.action!.run()
    expect(useCharacters.getState().characters[ch.id].inventory).toHaveLength(1)
  })
  it('angrer ikke en senere endring', () => {
    const ch = newCharacter({ name: 'Stale', feats: [{ uid: 'f1', featId: 'alert', source: 'manual' }] })
    useCharacters.setState({ characters: { [ch.id]: ch } })
    removeWithUndo(ch.id, (d) => void (d.feats = []), 'Alert slettet')
    const action = useUi.getState().toast!.action!
    // Flytt klokka forbi sammenslåingsvinduet uten å kjøre timere (lagring)
    vi.setSystemTime(Date.now() + 2000)
    useCharacters.getState().update(ch.id, (d) => void (d.name = 'Endret'))
    action.run()
    const now = useCharacters.getState().characters[ch.id]
    expect(now.name).toBe('Endret')
    expect(now.feats).toHaveLength(0)
  })
})
