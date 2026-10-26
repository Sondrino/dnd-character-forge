import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { Character } from '../src/renderer/src/types'

const item = (refId: string, equipped = true, extra: Partial<Character['inventory'][number]> = {}) => ({ uid: refId + Math.random(), refId, qty: 1, equipped, attuned: false, ...extra })
const cls = (classId: string, level: number, subclassId?: string) => ({ classId, level, hpRolls: [] as number[], subclassId })

describe('Exhaustion (2024): −2 per nivå på D20 Tests', () => {
  const c = newCharacter({
    classes: [cls('fighter', 1)],
    baseAbilities: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 10 },
    inventory: [item('longsword')]
  })
  const base = computeCharacter(c, L)
  const tired = computeCharacter({ ...c, exhaustion: 2 }, L)
  it('saves, skills, initiative og angrep', () => {
    expect(tired.saves.str.value).toBe(base.saves.str.value - 4)
    expect(tired.skills.athletics.value).toBe(base.skills.athletics.value - 4)
    expect(tired.initiative.value).toBe(base.initiative.value - 4)
    const a = (d: typeof base) => d.attacks.find((x) => x.refId === 'longsword')!.bonus!.value
    expect(a(tired)).toBe(a(base) - 4)
    const u = (d: typeof base) => d.attacks.find((x) => x.kind === 'unarmed')!.bonus!.value
    expect(u(tired)).toBe(u(base) - 4)
    expect(tired.saves.str.breakdown.some((b) => /Exhaustion 2/.test(b))).toBe(true)
  })
  it('speed −5 ft per nivå, passive scores påvirkes ikke', () => {
    expect(tired.speed.value).toBe(base.speed.value - 10)
    expect(tired.passive.perception.value).toBe(base.passive.perception.value)
  })
  it('spell attack', () => {
    const w = newCharacter({ classes: [cls('wizard', 1)], baseAbilities: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 } })
    expect(computeCharacter({ ...w, exhaustion: 1 }, L).spellcasting[0].attack.value).toBe(computeCharacter(w, L).spellcasting[0].attack.value - 2)
  })
})

describe('Weapon proficiency med egenskapsfilter', () => {
  it('Rogue er proficient med Rapier (Finesse) og Scimitar (Light), ikke Longsword', () => {
    const c = newCharacter({ classes: [cls('rogue', 1)], inventory: [item('rapier'), item('scimitar'), item('longsword')] })
    const d = computeCharacter(c, L)
    const p = (id: string) => d.attacks.find((a) => a.refId === id)!.proficient
    expect(p('rapier')).toBe(true)
    expect(p('scimitar')).toBe(true)
    expect(p('longsword')).toBe(false)
  })
  it('Monk er proficient med Shortsword (Light), ikke Rapier', () => {
    const c = newCharacter({ classes: [cls('monk', 1)], inventory: [item('shortsword'), item('rapier')] })
    const d = computeCharacter(c, L)
    expect(d.attacks.find((a) => a.refId === 'shortsword')!.proficient).toBe(true)
    expect(d.attacks.find((a) => a.refId === 'rapier')!.proficient).toBe(false)
  })
})

describe('Monk weapons er bare nærkampvåpen', () => {
  it('Martial Arts-terning gjelder Club, men ikke Shortbow', () => {
    const c = newCharacter({ classes: [cls('monk', 5)], baseAbilities: { str: 10, dex: 16, con: 12, int: 8, wis: 16, cha: 10 }, inventory: [item('club'), item('shortbow')] })
    const d = computeCharacter(c, L)
    expect(d.attacks.find((a) => a.refId === 'club')!.damage).toBe('1d8+3')
    expect(d.attacks.find((a) => a.refId === 'shortbow')!.damage).toBe('1d6+3')
  })
})

describe('Dueling', () => {
  const duel = (inv: Character['inventory']) =>
    newCharacter({ classes: [cls('fighter', 1)], baseAbilities: { str: 16, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }, inventory: inv, feats: [{ uid: 'd', featId: 'dueling', source: 'manual' }] })
  it('+2 skade med ett enhånds nærkampvåpen', () => {
    expect(computeCharacter(duel([item('longsword'), item('shield')]), L).attacks.find((a) => a.refId === 'longsword')!.damage).toBe('1d8+5')
  })
  it('ingen bonus med to våpen eller tohåndsvåpen', () => {
    expect(computeCharacter(duel([item('shortsword'), item('dagger')]), L).attacks.find((a) => a.refId === 'shortsword')!.damage).toBe('1d6+3')
    expect(computeCharacter(duel([item('greatsword')]), L).attacks.find((a) => a.refId === 'greatsword')!.damage).toBe('2d6+3')
  })
})

describe('Ability-grenser', () => {
  it('Epic Boon kan heve en score over 20 (maks 30)', () => {
    const c = newCharacter({
      classes: [cls('fighter', 19)],
      baseAbilities: { str: 15, dex: 10, con: 14, int: 10, wis: 10, cha: 10 },
      backgroundBonus: { str: 2, con: 1 },
      feats: [
        { uid: 'a', featId: 'ability-score-improvement', source: 'class:fighter:4', choices: { abilities: ['str', 'str'] } },
        { uid: 'b', featId: 'ability-score-improvement', source: 'class:fighter:6', choices: { abilities: ['str', 'str'] } },
        { uid: 'c', featId: 'boon-of-combat-prowess', source: 'class:fighter:19', abilityChoice: 'str' }
      ]
    })
    expect(computeCharacter(c, L).abilities.str.score.value).toBe(21)
  })
  it('vanlige ASI stopper på 20', () => {
    const c = newCharacter({
      classes: [cls('fighter', 6)], baseAbilities: { str: 17, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }, backgroundBonus: { str: 2 },
      feats: [{ uid: 'a', featId: 'ability-score-improvement', source: 'class:fighter:4', choices: { abilities: ['str', 'str'] } }]
    })
    expect(computeCharacter(c, L).abilities.str.score.value).toBe(20)
  })
  it('Primal Champion: +4 til maks 25', () => {
    const c = newCharacter({ classes: [cls('barbarian', 20)], baseAbilities: { str: 20, dex: 10, con: 18, int: 10, wis: 10, cha: 10 } })
    const d = computeCharacter(c, L)
    expect(d.abilities.str.score.value).toBe(24)
    expect(d.abilities.con.score.value).toBe(22)
    // 20 + boon 1 = 21, +4 = 25 (maks 25)
    c.feats = [{ uid: 'b', featId: 'boon-of-combat-prowess', source: 'class:barbarian:19', abilityChoice: 'str' }]
    expect(computeCharacter(c, L).abilities.str.score.value).toBe(25)
  })
  it('Ioun Stone +2 til maks 20', () => {
    const c = newCharacter({ classes: [cls('fighter', 1)], baseAbilities: { str: 10, dex: 19, con: 10, int: 10, wis: 10, cha: 10 }, inventory: [item('ioun-stone-of-agility', true, { attuned: true })] })
    expect(computeCharacter(c, L).abilities.dex.score.value).toBe(20)
  })
})

describe('Draconic Resilience teller Sorcerer-nivåer', () => {
  it('Fighter 2 / Sorcerer 3 (Draconic) får +3 HP, ikke +5', () => {
    const base = newCharacter({ classes: [cls('fighter', 2), cls('sorcerer', 3)] })
    const drac = { ...base, classes: [cls('fighter', 2), cls('sorcerer', 3, 'draconic-sorcery')] }
    expect(computeCharacter(drac, L).hpMax.value - computeCharacter(base, L).hpMax.value).toBe(3)
  })
})

describe('One-third casters (Eldritch Knight / Arcane Trickster)', () => {
  it('Eldritch Knight 3: INT-caster med 2 level 1-slots, 2 cantrips, 3 prepared', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('fighter', 3, 'eldritch-knight')] }), L)
    expect(d.spellcasting).toHaveLength(1)
    expect(d.spellcasting[0]).toMatchObject({ classId: 'fighter', ability: 'int', cantripsMax: 2, preparedMax: 3, spellList: 'wizard', maxSpellLevel: 1 })
    expect(d.slots.map((s) => s.max)).toEqual([2])
  })
  it('enkelt-class bruker egen tabell (runder opp): EK 4 = 3 slots, EK 19 = 4/3/3/1', () => {
    expect(computeCharacter(newCharacter({ classes: [cls('fighter', 4, 'eldritch-knight')] }), L).slots.map((s) => s.max)).toEqual([3])
    expect(computeCharacter(newCharacter({ classes: [cls('fighter', 19, 'eldritch-knight')] }), L).slots.map((s) => s.max)).toEqual([4, 3, 3, 1])
  })
  it('Arcane Trickster 10: 4 cantrips, 7 prepared, 4/3 slots', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('rogue', 10, 'arcane-trickster')] }), L)
    expect(d.spellcasting[0]).toMatchObject({ cantripsMax: 4, preparedMax: 7 })
    expect(d.slots.map((s) => s.max)).toEqual([4, 3])
  })
  it('multiclass runder ned: Wizard 2 / EK 4 = caster level 3', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('wizard', 2), cls('fighter', 4, 'eldritch-knight')] }), L)
    expect(d.slots.map((s) => s.max)).toEqual([4, 2])
  })
  it('Champion får ingen spellcasting', () => {
    expect(computeCharacter(newCharacter({ classes: [cls('fighter', 5, 'champion')] }), L).spellcasting).toHaveLength(0)
  })
})

describe('Feat-effekter', () => {
  const lvl = (feats: Character['feats'], extra: Partial<Character> = {}) =>
    newCharacter({ classes: [cls('fighter', 19)], baseAbilities: { str: 10, dex: 16, con: 10, int: 10, wis: 12, cha: 10 }, feats, ...extra })
  it('Resilient gir save-proficiency i valgt ability', () => {
    const d = computeCharacter(lvl([{ uid: 'r', featId: 'resilient', source: 'class:fighter:4', abilityChoice: 'wis' }]), L)
    expect(d.saves.wis.proficient).toBe(true)
    expect(d.abilities.wis.score.value).toBe(13)
  })
  it('Boon of Skill gir proficiency i alle skills', () => {
    const d = computeCharacter(lvl([{ uid: 's', featId: 'boon-of-skill', source: 'class:fighter:19', abilityChoice: 'dex' }]), L)
    expect(d.skills.arcana.proficient).toBe(true)
    expect(d.skills.stealth.proficient).toBe(true)
  })
  it('Boon of Energy Resistance gir valgte resistances', () => {
    const d = computeCharacter(lvl([{ uid: 'e', featId: 'boon-of-energy-resistance', source: 'class:fighter:19', abilityChoice: 'con', choices: { resistances: ['fire', 'cold'] } }]), L)
    expect(d.resistances).toEqual(expect.arrayContaining(['fire', 'cold']))
  })
  it('Medium Armor Master: DEX-maks 3 med DEX 16+', () => {
    const inv = [item('breastplate')]
    expect(computeCharacter(lvl([], { inventory: inv }), L).ac.value).toBe(16)
    expect(computeCharacter(lvl([{ uid: 'm', featId: 'medium-armor-master', source: 'class:fighter:4', abilityChoice: 'str' }], { inventory: inv }), L).ac.value).toBe(17)
  })
  it('Alert legger PB til initiative', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('fighter', 5)], baseAbilities: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 }, feats: [{ uid: 'a', featId: 'alert', source: 'background' }] }), L)
    expect(d.initiative.value).toBe(2 + 3)
  })
  it('Defense: +1 AC bare med rustning', () => {
    const f = [{ uid: 'd', featId: 'defense', source: 'class:fighter:fighting-style#feat' }]
    expect(computeCharacter(lvl(f, { inventory: [item('chain-mail')] }), L).ac.value).toBe(17)
    expect(computeCharacter(lvl(f), L).ac.value).toBe(13)
  })
})

describe('Class-feature-effekter', () => {
  it('Aura of Protection: +CHA (min +1) på alle saves fra Paladin 6', () => {
    const base = { str: 16, dex: 10, con: 14, int: 8, wis: 10, cha: 14 }
    const p5 = computeCharacter(newCharacter({ classes: [cls('paladin', 5)], baseAbilities: base }), L)
    const p6 = computeCharacter(newCharacter({ classes: [cls('paladin', 6)], baseAbilities: base }), L)
    expect(p6.saves.dex.value - p5.saves.dex.value).toBe(2)
    const low = computeCharacter(newCharacter({ classes: [cls('paladin', 6)], baseAbilities: { ...base, cha: 8 } }), L)
    expect(low.saves.dex.value).toBe(0 + 1)
  })
  it('Unarmored Movement bruker Monk-nivå ved multiclass', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('monk', 2), cls('fighter', 8)] }), L)
    expect(d.speed.value).toBe(30 + 10)
  })
  it('Thaumaturge gir én ekstra cantrip', () => {
    const c = newCharacter({ classes: [cls('cleric', 1)], choices: { 'class:cleric:cleric-divine-order:cleric-divine-order#option': ['cleric-divine-order-thaumaturge'] } })
    expect(computeCharacter(c, L).spellcasting[0].cantripsMax).toBe(4)
  })
  it('Umbral Sight: +60 ft. Darkvision hvis du har det fra før', () => {
    const d = computeCharacter(newCharacter({ classes: [cls('ranger', 3, 'gloom-stalker')], speciesId: 'dwarf' }), L)
    expect(d.darkvision).toBe(180)
    const h = computeCharacter(newCharacter({ classes: [cls('ranger', 3, 'gloom-stalker')], speciesId: 'human' }), L)
    expect(h.darkvision).toBe(60)
  })
  it('Eldritch Blast skalerer med stråler, ikke terninger', () => {
    const c = newCharacter({ classes: [cls('warlock', 5)], spells: [{ spellId: 'eldritch-blast', source: 'warlock', prepared: true }] })
    const eb = computeCharacter(c, L).attacks.find((a) => a.refId === 'eldritch-blast')!
    expect(eb.damage).toBe('1d10')
    expect(eb.notes.join(' ')).toMatch(/2 beams/)
  })
  it('Wish har ingen skadeangrep; Chromatic Orb og Sorcerous Burst har', () => {
    expect(L.get('spell', 'wish')?.damage).toBeUndefined()
    expect(L.get('spell', 'chromatic-orb')?.damage?.dice).toBe('3d8')
    expect(L.get('spell', 'sorcerous-burst')?.damage?.dice).toBe('1d8')
  })
})

describe('Magiske gjenstander', () => {
  it('+1 Armor og +1 Shield telles bare én gang', () => {
    const c = newCharacter({
      classes: [cls('fighter', 1)],
      inventory: [item('plus-1-armor', true, { baseId: 'chain-mail' }), item('plus-1-shield', true, { baseId: 'shield' })]
    })
    expect(computeCharacter(c, L).ac.value).toBe(16 + 1 + 2 + 1)
  })
  it('navngitte magiske våpen har bonus (Vorpal Sword +3)', () => {
    const c = newCharacter({ classes: [cls('fighter', 1)], baseAbilities: { str: 16, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, inventory: [item('vorpal-sword', true, { baseId: 'longsword', attuned: true })] })
    const a = computeCharacter(c, L).attacks.find((x) => x.refId === 'longsword')!
    expect(a.bonus!.value).toBe(3 + 2 + 3)
    expect(a.damage).toBe('1d8+6')
  })
  it('Goggles of Night: +60 ft. Darkvision', () => {
    const c = newCharacter({ speciesId: 'elf', inventory: [item('goggles-of-night')] })
    expect(computeCharacter(c, L).darkvision).toBe(120)
  })
})

describe('Mage Armor via tilstand', () => {
  it('13 + DEX uten rustning når «mageArmor» er aktiv, skjold tillatt', () => {
    const c = newCharacter({ classes: [cls('wizard', 1)], baseAbilities: { str: 8, dex: 14, con: 12, int: 16, wis: 10, cha: 10 }, spells: [{ spellId: 'mage-armor', source: 'wizard', prepared: true }] })
    expect(computeCharacter(c, L).ac.value).toBe(12)
    c.activeStates = ['mageArmor']
    expect(computeCharacter(c, L).ac.value).toBe(15)
    c.inventory = [item('shield')]
    expect(computeCharacter(c, L).ac.value).toBe(17)
    c.inventory = [item('leather-armor')]
    expect(computeCharacter(c, L).ac.value).toBe(13)
  })
  it('Dueling kan ikke tvinges på med tilstand når man har tohåndsvåpen', () => {
    const c = newCharacter({ classes: [cls('fighter', 1)], baseAbilities: { str: 16, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }, inventory: [item('greatsword')], feats: [{ uid: 'd', featId: 'dueling', source: 'manual' }], activeStates: ['oneHandedMeleeOnly'] })
    expect(computeCharacter(c, L).attacks.find((a) => a.refId === 'greatsword')!.damage).toBe('2d6+3')
  })
})

describe('Bæreevne', () => {
  it('STR × 15, Powerful Build dobler, Small = Medium', () => {
    const base = { str: 14, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    expect(computeCharacter(newCharacter({ speciesId: 'human', baseAbilities: base }), L).carry.capacity).toBe(210)
    expect(computeCharacter(newCharacter({ speciesId: 'halfling', baseAbilities: base }), L).carry.capacity).toBe(210)
    expect(computeCharacter(newCharacter({ speciesId: 'goliath', baseAbilities: base }), L).carry.capacity).toBe(420)
    expect(computeCharacter(newCharacter({ speciesId: 'human', baseAbilities: base, size: 'Huge' } as never), L).carry.capacity).toBe(840)
  })
})
