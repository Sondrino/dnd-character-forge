import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { computeTips } from '../src/renderer/src/engine/tips'
import { newCharacter, useCharacters } from '../src/renderer/src/store/characters'
import { featPrereqProblems, meetsMulticlass } from '../src/renderer/src/lib/rules'
import type { ClassDef, FeatDef } from '../src/renderer/src/types'

const L = baseLookup
const mk = (o: Parameters<typeof newCharacter>[0]) => newCharacter({ speciesId: 'human', backgroundId: 'soldier', ...o })
const tipIds = (c: ReturnType<typeof newCharacter>) => computeTips(c, computeCharacter(c, L), L).map((t) => t.id)

describe('rules audit fixes', () => {
  it('flags an illegal background bonus (+2/+2/+2)', () => {
    const c = mk({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], backgroundBonus: { str: 2, dex: 2, con: 2 } })
    expect(tipIds(c)).toContain('bgbonus')
    c.backgroundBonus = { str: 2, con: 1 }
    expect(tipIds(c)).not.toContain('bgbonus')
  })
  it('multiclass: Monk/Paladin/Ranger need both abilities, Fighter either', () => {
    const d = computeCharacter(mk({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], baseAbilities: { str: 8, dex: 14, con: 12, int: 10, wis: 8, cha: 10 } }), L)
    expect(meetsMulticlass(L.get('class', 'fighter') as ClassDef, d)).toBe(true)
    expect(meetsMulticlass(L.get('class', 'monk') as ClassDef, d)).toBe(false)
  })
  it('feat prerequisites: ability scores, level and epic boons', () => {
    const d = computeCharacter(mk({ classes: [{ classId: 'wizard', level: 4, hpRolls: [] }], baseAbilities: { str: 8, dex: 9, con: 12, int: 16, wis: 10, cha: 10 } }), L)
    expect(featPrereqProblems(L.get('feat', 'grappler') as FeatDef, d).length).toBeGreaterThan(0)
    expect(featPrereqProblems(L.get('feat', 'boon-of-combat-prowess') as FeatDef, d)).toContain('Level 19+')
    expect(featPrereqProblems(L.get('feat', 'alert') as FeatDef, d)).toEqual([])
  })
  it('warns about over-preparing, spells above your level, feats above your level and 2H + shield', () => {
    const c = mk({ classes: [{ classId: 'wizard', level: 1, hpRolls: [] }] })
    c.spells = ['magic-missile', 'shield', 'sleep', 'mage-armor', 'burning-hands', 'fireball'].map((id) => ({ spellId: id, source: 'wizard', prepared: true }))
    c.feats.push({ uid: 'x', featId: 'alert', source: 'class:wizard:8' })
    c.inventory = [{ uid: 'g', refId: 'greatsword', qty: 1, equipped: true, attuned: false }, { uid: 's', refId: 'shield', qty: 1, equipped: true, attuned: false }]
    const ids = tipIds(c)
    expect(ids).toContain('overprep:wizard')
    expect(ids).toContain('spelllevel:wizard')
    expect(ids).toContain('featlevel:x')
    expect(ids).toContain('twohandshield')
  })
  it('Magic Initiate spells use the chosen spellcasting ability', () => {
    const c = mk({ classes: [{ classId: 'cleric', level: 1, hpRolls: [] }], baseAbilities: { str: 10, dex: 10, con: 10, int: 8, wis: 16, cha: 10 } })
    c.feats.push({ uid: 'mi', featId: 'magic-initiate', source: 'background', choices: { list: ['wizard'], ability: ['int'] } })
    c.spells.push({ spellId: 'fire-bolt', source: 'feat:mi', prepared: true, alwaysPrepared: true })
    const d = computeCharacter(c, L)
    expect(d.spellSources['feat:mi']).toMatchObject({ ability: 'int', attack: 2 + -1 })
    expect(d.attacks.find((a) => a.key === 'spell:fire-bolt')?.bonus?.value).toBe(1)
  })
  it('Grappled sets Speed to 0; armor without training gives STR/DEX disadvantage', () => {
    const c = mk({ classes: [{ classId: 'wizard', level: 1, hpRolls: [] }] })
    c.conditions = ['grappled']
    c.inventory = [{ uid: 'p', refId: 'plate-armor', qty: 1, equipped: true, attuned: false }]
    const d = computeCharacter(c, L)
    expect(d.speed.value).toBe(0)
    expect(d.saves.dex.disadvantage?.length).toBeGreaterThan(0)
  })
  it('off-hand damage keeps the magic bonus but drops the ability modifier', () => {
    const c = mk({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], baseAbilities: { str: 16, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
    c.inventory = [{ uid: 'w', refId: 'shortsword', qty: 1, equipped: true, attuned: false, bonus: 1 }]
    const a = computeCharacter(c, L).attacks.find((x) => x.key === 'w')!
    expect(a.damage).toBe('1d6+4')
    expect(a.offhandDamage).toBe('1d6+1')
  })
})

describe('undo / redo', () => {
  it('undoes and redoes character edits', () => {
    const c = mk({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }] })
    useCharacters.setState({ characters: { [c.id]: c } })
    const s = useCharacters.getState()
    s.update(c.id, (d) => void (d.name = 'Brann'))
    expect(useCharacters.getState().characters[c.id].name).toBe('Brann')
    expect(s.undo(c.id)).toBe(true)
    expect(useCharacters.getState().characters[c.id].name).toBe('')
    expect(s.redo(c.id)).toBe(true)
    expect(useCharacters.getState().characters[c.id].name).toBe('Brann')
  })
})
