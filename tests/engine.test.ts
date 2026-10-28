import { describe, expect, it } from 'vitest'
import { baseLookup, allEntities } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { evalFormula } from '../src/renderer/src/engine/formula'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { Character } from '../src/renderer/src/types'
import { spellFilter } from '../src/renderer/src/lib/spellFilter'

const L = baseLookup
const item = (refId: string, equipped = true, extra: Partial<Character['inventory'][number]> = {}) => ({ uid: refId + Math.random(), refId, qty: 1, equipped, attuned: false, ...extra })

function fighter(): Character {
  return newCharacter({
    classes: [{ classId: 'fighter', level: 1, hpRolls: [] }],
    speciesId: 'human',
    backgroundId: 'soldier',
    baseAbilities: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
    backgroundBonus: { str: 1, con: 2 },
    inventory: [item('chain-mail'), item('shield'), item('longsword')],
    weaponMasteries: ['longsword']
  })
}

describe('data', () => {
  it('har lastet regeldata', () => {
    const count = (k: string) => allEntities.filter((e) => e.kind === k).length
    expect(count('class')).toBe(13) // 12 PHB + Artificer (TCE)
    expect(count('species')).toBe(41) // 9 SRD + Aasimar (PHB 2024) + Custom Lineage (TCE) + 30 MPMM
    expect(count('spell')).toBeGreaterThan(300)
    expect(count('weapon')).toBeGreaterThan(30)
    expect(count('magicItem')).toBeGreaterThan(200)
    expect(count('subclass')).toBeGreaterThanOrEqual(48)
  })
  it('alle class-tabeller har 20 rader', () => {
    for (const c of L.all('class')) expect(c.table.length, c.id).toBe(20)
  })
  it('alle background-feats finnes', () => {
    for (const b of L.all('background')) expect(L.get('feat', b.originFeat), b.id).toBeTruthy()
  })
})

describe('Fighter 1', () => {
  const d = computeCharacter(fighter(), L)
  it('ability scores med background-bonus', () => {
    expect(d.abilities.str.score.value).toBe(16)
    expect(d.abilities.con.score.value).toBe(16)
    expect(d.abilities.str.mod).toBe(3)
  })
  it('PB, HP, AC', () => {
    expect(d.pb.value).toBe(2)
    expect(d.hpMax.value).toBe(13) // d10 + 3
    expect(d.ac.value).toBe(18) // Chain Mail 16 + Shield 2
  })
  it('saves og skills', () => {
    expect(d.saves.str.value).toBe(5)
    expect(d.saves.con.proficient).toBe(true)
    expect(d.saves.dex.proficient).toBe(false)
    expect(d.skills.athletics.proficient).toBe(true) // Soldier
    expect(d.skills.athletics.value).toBe(5)
    expect(d.skills.stealth.disadvantage?.length).toBeGreaterThan(0) // Chain Mail
  })
  it('angrep', () => {
    const ls = d.attacks.find((a) => a.refId === 'longsword')!
    expect(ls.bonus!.value).toBe(5)
    expect(ls.damage).toBe('1d8+3')
    expect(ls.masteryActive).toBe(true)
  })
  it('speed og weapon mastery', () => {
    expect(d.speed.value).toBe(30)
    expect(d.weaponMasteryMax).toBe(3)
  })
})

describe('AC-varianter og effects', () => {
  it('Barbarian Unarmored Defense', () => {
    const c = newCharacter({ classes: [{ classId: 'barbarian', level: 1, hpRolls: [] }], baseAbilities: { str: 16, dex: 14, con: 16, int: 8, wis: 10, cha: 10 } })
    expect(computeCharacter(c, L).ac.value).toBe(15)
  })
  it('Monk Unarmored Defense forsvinner med skjold', () => {
    const c = newCharacter({ classes: [{ classId: 'monk', level: 1, hpRolls: [] }], baseAbilities: { str: 10, dex: 16, con: 12, int: 8, wis: 16, cha: 10 } })
    expect(computeCharacter(c, L).ac.value).toBe(16)
    c.inventory = [item('shield')]
    expect(computeCharacter(c, L).ac.value).toBe(15) // 10 + DEX 3 + shield 2
  })
  it('Ring of Protection krever attunement', () => {
    const c = fighter()
    c.inventory.push(item('ring-of-protection', true))
    expect(computeCharacter(c, L).ac.value).toBe(18)
    c.inventory[c.inventory.length - 1].attuned = true
    const d = computeCharacter(c, L)
    expect(d.ac.value).toBe(19)
    expect(d.saves.str.value).toBe(6)
  })
  it('homebrew-item med effekt oppdaterer arket', () => {
    const c = fighter()
    c.customEntities.push({ id: 'hb-amulet', name: 'Amulet', kind: 'gear', source: 'Homebrew', summary: '', description: '', cost: '1 GP', weight: 0, effects: [{ target: 'ac', op: 'add', value: 1 }, { target: 'speed', op: 'add', value: 10 }] })
    c.inventory.push(item('hb-amulet'))
    const d = computeCharacter(c, L)
    expect(d.ac.value).toBe(19)
    expect(d.speed.value).toBe(40)
  })
  it('manuell overstyring', () => {
    const c = fighter()
    c.overrides['ac'] = 21
    c.overrides['ability.str'] = 10
    const d = computeCharacter(c, L)
    expect(d.ac.value).toBe(21)
    expect(d.ac.overridden).toBe(true)
    expect(d.ac.computed).toBe(18)
    expect(d.skills.athletics.value).toBe(2) // STR 10 → +0 + PB
  })
})

describe('Spellcasting', () => {
  it('Wizard 5', () => {
    const c = newCharacter({ classes: [{ classId: 'wizard', level: 5, hpRolls: [] }], baseAbilities: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 }, backgroundBonus: { int: 2, con: 1 } })
    const d = computeCharacter(c, L)
    expect(d.pb.value).toBe(3)
    expect(d.slots.map((s) => s.max)).toEqual([4, 3, 2])
    expect(d.spellcasting[0].dc.value).toBe(15) // 8 + 3 + 4
    expect(d.spellcasting[0].attack.value).toBe(7)
    expect(d.hpMax.value).toBe(6 + 2 + 4 * (4 + 2)) // 32
  })
  it('Paladin 5 (half caster)', () => {
    const c = newCharacter({ classes: [{ classId: 'paladin', level: 5, hpRolls: [] }] })
    expect(computeCharacter(c, L).slots.map((s) => s.max)).toEqual([4, 2])
  })
  it('Multiclass Wizard 3 / Cleric 2 = caster level 5', () => {
    const c = newCharacter({ classes: [{ classId: 'wizard', level: 3, hpRolls: [] }, { classId: 'cleric', level: 2, hpRolls: [] }] })
    const d = computeCharacter(c, L)
    expect(d.slots.map((s) => s.max)).toEqual([4, 3, 2])
    expect(d.saves.int.proficient).toBe(true)
    expect(d.saves.cha.proficient).toBe(false) // Cleric-saves (WIS/CHA) gis ikke ved multiclass
  })
  it('Warlock pact magic', () => {
    const c = newCharacter({ classes: [{ classId: 'warlock', level: 5, hpRolls: [] }] })
    const d = computeCharacter(c, L)
    expect(d.pact).toMatchObject({ count: 2, level: 3 })
    expect(d.slots.length).toBe(0)
  })
  it('cantrip-skalering', () => {
    const c = newCharacter({ classes: [{ classId: 'wizard', level: 5, hpRolls: [] }], spells: [{ spellId: 'fire-bolt', source: 'wizard', prepared: true }] })
    const fb = computeCharacter(c, L).attacks.find((a) => a.refId === 'fire-bolt')!
    expect(fb.damage).toBe('2d10')
  })
})

describe('Skills og feats', () => {
  it('Rogue expertise', () => {
    const c = newCharacter({
      classes: [{ classId: 'rogue', level: 1, hpRolls: [] }],
      baseAbilities: { str: 8, dex: 16, con: 12, int: 10, wis: 12, cha: 14 },
      extra: { skills: ['stealth'], expertise: ['stealth'], saves: [], armor: [], weapons: [], tools: [], languages: [] }
    })
    expect(computeCharacter(c, L).skills.stealth.value).toBe(3 + 4)
  })
  it('Ability Score Improvement-feat', () => {
    const c = fighter()
    c.classes[0].level = 4
    c.feats.push({ uid: 'x', featId: 'ability-score-improvement', source: 'class:fighter:4', choices: { abilities: ['str', 'str'] } })
    const d = computeCharacter(c, L)
    expect(d.abilities.str.score.value).toBe(18)
    expect(d.pending.some((p) => p.key === 'class:fighter:4')).toBe(false)
  })
  it('Tough gir +2 HP per level', () => {
    const c = fighter()
    c.feats.push({ uid: 't', featId: 'tough', source: 'manual' })
    expect(computeCharacter(c, L).hpMax.value).toBe(15)
  })
  it('uløste valg vises', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 3, hpRolls: [] }] })
    const keys = computeCharacter(c, L).pending.map((p) => p.key)
    expect(keys).toContain('subclass:fighter')
    expect(keys).toContain('class:fighter:skills#skill')
  })
})

describe('formel og spell-filter', () => {
  const ctx = { mods: { str: 3, dex: 2, con: 1, int: 0, wis: -1, cha: 4 }, pb: 3, level: 5, totalLevel: 5, columns: { Rages: 3 } }
  it('evalFormula', () => {
    expect(evalFormula('10+dex+con', ctx)).toBe(13)
    expect(evalFormula('prof', ctx)).toBe(3)
    expect(evalFormula('mod.cha', ctx)).toBe(4)
    expect(evalFormula('Rages', ctx)).toBe(3)
    expect(evalFormula('max(1,mod.wis)', ctx)).toBe(1)
    expect(evalFormula('level*5', ctx)).toBe(25)
    expect(evalFormula('alert(1)', ctx)).toBe(null)
  })
  it('spellFilter', () => {
    const fb = L.get('spell', 'fire-bolt')!
    const mm = L.get('spell', 'magic-missile')!
    expect(spellFilter('wizard', { cantrip: true })(fb)).toBe(true)
    expect(spellFilter('wizard:1')(mm)).toBe(true)
    expect(spellFilter('cleric:1')(mm)).toBe(false)
    expect(spellFilter('list:1', { list: 'wizard' })(mm)).toBe(true)
  })
})
