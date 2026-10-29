import { describe, expect, it } from 'vitest'
import { baseLookup } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter, normalizeCharacter } from '../src/renderer/src/store/characters'
import type { AnyEntity, CreatureDef, FeatDef, SubclassDef } from '../src/renderer/src/types'
import {
  WILD_SHAPE_STATE, crValue, enterWildShape, isEligibleForm, parseCreatureAttacks, revertWildShape, wildShapeLimits, wildShapeTempHp
} from '../src/renderer/src/lib/wildShape'
import { awardXp, levelForXp, levelsAvailable, nextLevelXp, sortedJournal, xpForLevel } from '../src/renderer/src/lib/xp'
import { homebrewToImport, selectBundledHomebrew, withBundledHomebrew } from '../src/renderer/src/lib/share'
import { cleanMacro, macroError, sanitizeMacros, sanitizeRollLog } from '../src/renderer/src/lib/macros'
import { companionCombatants, companionFromCreature, damageCompanion, syncCompanionsFromCombat } from '../src/renderer/src/lib/companions'
import { hotkeyFor, isTypingTarget } from '../src/renderer/src/lib/hotkeys'
import { newCombat } from '../src/renderer/src/lib/combat'
import { roll } from '../src/renderer/src/dice'
import { clampUiScale } from '../src/renderer/src/store/settings'
import { toolsEn, toolsNb } from '../src/renderer/src/i18n/tools'

const creature = (id: string): CreatureDef => baseLookup.get('creature', id) as CreatureDef

describe('Wild Shape (2024 Beast Shapes table)', () => {
  it('gives known forms, max CR and fly speed by druid level', () => {
    expect(wildShapeLimits(1)).toBeNull()
    expect(wildShapeLimits(2)).toEqual({ forms: 4, maxCr: 0.25, fly: false })
    expect(wildShapeLimits(3)).toEqual({ forms: 4, maxCr: 0.25, fly: false })
    expect(wildShapeLimits(4)).toEqual({ forms: 6, maxCr: 0.5, fly: false })
    expect(wildShapeLimits(7)).toEqual({ forms: 6, maxCr: 0.5, fly: false })
    expect(wildShapeLimits(8)).toEqual({ forms: 8, maxCr: 1, fly: true })
    expect(wildShapeLimits(20)).toEqual({ forms: 8, maxCr: 1, fly: true })
  })

  it('Circle of the Moon raises max CR to druid level / 3', () => {
    expect(wildShapeLimits(3, true)!.maxCr).toBe(1)
    expect(wildShapeLimits(6, true)!.maxCr).toBe(2)
    expect(wildShapeLimits(2, true)!.maxCr).toBe(0.25)
    expect(wildShapeTempHp(5)).toBe(5)
    expect(wildShapeTempHp(5, true)).toBe(15)
  })

  it('parses CR and checks eligibility (Beast, CR, Fly Speed)', () => {
    expect(crValue('1/4')).toBe(0.25)
    expect(crValue('1/8')).toBe(0.125)
    expect(crValue('2')).toBe(2)
    expect(crValue('0')).toBe(0)
    const wolf = creature('wolf')
    expect(isEligibleForm(wolf, wildShapeLimits(2))).toBe(true)
    const flyer = baseLookup.all('creature').find((c) => /^beast/i.test(c.creatureType) && /fly/i.test(c.speed) && crValue(c.cr) <= 0.25)!
    expect(flyer).toBeTruthy()
    expect(isEligibleForm(flyer, wildShapeLimits(4))).toBe(false)
    expect(isEligibleForm(flyer, wildShapeLimits(8))).toBe(true)
    const big = baseLookup.all('creature').find((c) => /^beast/i.test(c.creatureType) && crValue(c.cr) === 2)!
    expect(isEligibleForm(big, wildShapeLimits(8))).toBe(false)
    const notBeast = baseLookup.all('creature').find((c) => !/^beast/i.test(c.creatureType) && crValue(c.cr) <= 0.25)!
    expect(isEligibleForm(notBeast, wildShapeLimits(8))).toBe(false)
  })

  it('reads attacks from the stat block', () => {
    const atk = parseCreatureAttacks(creature('wolf').description)
    expect(atk[0]).toMatchObject({ name: 'Bite', toHit: '+4', damage: '1d6 + 2', damageType: 'Piercing' })
  })

  it('using Wild Shape spends a use, grants temp HP and sets wildShaped; reverting clears it', () => {
    const c = newCharacter({ classes: [{ classId: 'druid', level: 4, hpRolls: [] }], speciesId: 'human', backgroundId: 'sage' })
    const d = computeCharacter(c, baseLookup)
    const f = d.features.find((x) => x.id === 'druid-wild-shape')!
    expect(f.uses?.max).toBe(2)
    const uses = { key: f.key, max: f.uses!.max, used: f.uses!.used }
    c.hp.temp = 2
    expect(enterWildShape(c, 'wolf', uses, wildShapeTempHp(4))).toBe(true)
    expect(c.featureUses[f.key]).toBe(1)
    expect(c.hp.temp).toBe(4)
    expect(c.activeStates).toContain(WILD_SHAPE_STATE)
    expect(c.wildShape?.activeForm).toBe('wolf')
    revertWildShape(c)
    expect(c.activeStates).not.toContain(WILD_SHAPE_STATE)
    expect(c.wildShape?.activeForm).toBeUndefined()
    expect(enterWildShape(c, 'wolf', { ...uses, used: 2 }, 4)).toBe(false)
  })
})

describe('XP thresholds (2024)', () => {
  it('maps XP to level and next threshold', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(xpForLevel(2)).toBe(300)
    expect(xpForLevel(5)).toBe(6500)
    expect(xpForLevel(20)).toBe(355000)
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(299)).toBe(1)
    expect(levelForXp(300)).toBe(2)
    expect(levelForXp(6500)).toBe(5)
    expect(levelForXp(1e7)).toBe(20)
    expect(nextLevelXp(1)).toBe(300)
    expect(nextLevelXp(4)).toBe(6500)
    expect(nextLevelXp(20)).toBeNull()
    expect(levelsAvailable(900, 1)).toBe(2)
    expect(levelsAvailable(899, 2)).toBe(0)
  })

  it('awarding XP adds a journal entry and updates xp', () => {
    const c = newCharacter({ xp: 250 })
    const e = awardXp(c, 75.9, 'Goblins', '', '2026-10-01')
    expect(e.xp).toBe(75)
    expect(c.xp).toBe(325)
    expect(c.journal?.[0].title).toBe('Goblins')
    expect(levelsAvailable(c.xp, 1)).toBe(1)
    c.journal!.push({ id: 'x', date: '2026-10-20', title: 'Later', text: '' })
    expect(sortedJournal(c.journal)[0].title).toBe('Later')
  })
})

describe('Homebrew bundling on export/import', () => {
  const hbFeat = { id: 'hb-feat', name: 'Homebrew Feat', kind: 'feat', source: 'Homebrew', summary: '', description: '', category: 'general' } as FeatDef
  const hbClass = { id: 'hb-class', name: 'Homebrew Class', kind: 'class', source: 'Homebrew', summary: '', description: '' } as unknown as AnyEntity
  const hbSub = { id: 'hb-sub', name: 'HB Sub', kind: 'subclass', classId: 'hb-class', source: 'Homebrew', summary: '', description: '', features: [] } as SubclassDef
  const hbItem = { id: 'hb-sword', name: 'Sword of HB', kind: 'magicItem', source: 'Homebrew', summary: '', description: '', itemType: 'Weapon', rarity: 'rare', attunement: false } as AnyEntity
  const unused = { id: 'hb-unused', name: 'Unused', kind: 'spell', source: 'Homebrew', summary: '', description: '' } as unknown as AnyEntity
  // Homebrew som overstyrer grunndata (samme id) skal ikke med
  const override = { ...(baseLookup.get('spell', 'fire-bolt') as AnyEntity), name: 'My Fire Bolt' }
  const library = [hbFeat, hbClass, hbSub, hbItem, unused, override]

  it('selects only referenced homebrew that is not in the base data', () => {
    const c = newCharacter({
      classes: [{ classId: 'hb-class', level: 3, subclassId: 'hb-sub', hpRolls: [] }],
      feats: [{ uid: 'f1', featId: 'hb-feat', source: 'manual' }],
      spells: [{ spellId: 'fire-bolt', source: 'wizard', prepared: true }],
      inventory: [{ uid: 'i1', refId: 'hb-sword', qty: 1, equipped: false, attuned: false }]
    })
    const ids = selectBundledHomebrew(c, library, baseLookup).map((e) => e.id).sort()
    expect(ids).toEqual(['hb-class', 'hb-feat', 'hb-sub', 'hb-sword'])
    expect(withBundledHomebrew(newCharacter(), library, baseLookup).bundledHomebrew).toBeUndefined()
  })

  it('a homebrew subclass of a homebrew class brings the class along', () => {
    const c = newCharacter({ classes: [{ classId: 'hb-class', level: 3, subclassId: 'hb-sub', hpRolls: [] }] })
    const only = selectBundledHomebrew(c, [hbSub, hbClass], baseLookup)
    expect(only.map((e) => e.id).sort()).toEqual(['hb-class', 'hb-sub'])
  })

  it('import adds missing bundled homebrew and skips invalid, duplicate and base entries', () => {
    const toAdd = homebrewToImport([hbFeat, hbItem, hbItem, { id: 'x' }, null, override, 'junk'], [hbFeat], baseLookup)
    expect(toAdd.map((e) => e.id)).toEqual(['hb-sword'])
    expect(homebrewToImport('nope', [], baseLookup)).toEqual([])
    // normalizeCharacter fjerner bundledHomebrew fra selve karakteren
    const n = normalizeCharacter({ ...newCharacter(), bundledHomebrew: [hbFeat] } as never)
    expect('bundledHomebrew' in n).toBe(false)
    expect(n.journal).toEqual([])
    expect(n.companions).toEqual([])
    expect(n.wildShape).toEqual({ knownForms: [], activeForm: undefined })
  })
})

describe('Dice macros and roll log', () => {
  it('validates macro label, notation and mode', () => {
    expect(macroError({ label: 'Longsword', notation: '1d20+5' })).toBeNull()
    expect(macroError({ label: '', notation: '1d20' })).toBe('label')
    expect(macroError({ label: 'x'.repeat(41), notation: '1d20' })).toBe('label')
    expect(macroError({ label: 'Bad', notation: '2x6' })).toBe('notation')
    expect(macroError({ label: 'Bad', notation: '' })).toBe('notation')
    expect(macroError({ label: 'Mode', notation: '1d20', mode: 'sideways' as never })).toBe('mode')
    expect(cleanMacro({ label: ' Stealth ', notation: ' 1d20+7 ', mode: 'advantage' })).toEqual({ label: 'Stealth', notation: '1d20+7', mode: 'advantage' })
    expect(cleanMacro({ label: 'Normal', notation: '4d6kh3', mode: 'normal' })).toEqual({ label: 'Normal', notation: '4d6kh3' })
    expect(sanitizeMacros([{ label: 'A', notation: '1d6' }, { label: 'B', notation: 'nope' }, 7, null])).toEqual([{ label: 'A', notation: '1d6' }])
    expect(sanitizeMacros('x')).toEqual([])
  })

  it('keeps only well-formed saved rolls, max 100', () => {
    const r = roll('2d6+3', { label: 'Test' })
    const list = sanitizeRollLog([r, { id: 'x' }, null, { ...r, terms: [null] }, ...Array.from({ length: 120 }, () => r)])
    expect(list.length).toBe(100)
    expect(list[0].label).toBe('Test')
    expect(sanitizeRollLog({})).toEqual([])
  })

  it('clamps the UI scale', () => {
    expect(clampUiScale(1.2)).toBe(1.2)
    expect(clampUiScale(3)).toBe(1.4)
    expect(clampUiScale(0.1)).toBe(0.8)
    expect(clampUiScale('big')).toBe(1)
  })
})

describe('Companions', () => {
  it('creates from a creature, takes damage through temp HP and syncs HP back from combat', () => {
    const cp = companionFromCreature(creature('wolf'), 'companion')
    expect(cp).toMatchObject({ name: 'Wolf', hp: 11, maxHp: 11, ac: 12, creatureId: 'wolf' })
    cp.temp = 3
    damageCompanion(cp, 5)
    expect(cp.temp).toBe(0)
    expect(cp.hp).toBe(9)
    const c = newCharacter({ companions: [cp] })
    c.combat = newCombat('app', { uid: 'self', name: 'Me', init: 10, self: true })
    const added = companionCombatants(c, () => 12)
    expect(added).toHaveLength(1)
    expect(added[0]).toMatchObject({ companionUid: cp.uid, hp: 9, maxHp: 11, ally: true, init: 12 })
    c.combat.combatants.push(...added)
    expect(companionCombatants(c, () => 1)).toHaveLength(0)
    c.combat.combatants[1].hp = 4
    syncCompanionsFromCombat(c)
    expect(c.companions![0].hp).toBe(4)
  })
})

describe('Hotkeys', () => {
  const key = (k: string, mods: Partial<KeyboardEvent> = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods })
  it('maps keys to actions and ignores single keys while typing', () => {
    expect(hotkeyFor(key('k', { ctrlKey: true }), true)).toEqual({ type: 'palette' })
    expect(hotkeyFor(key('d'), false)).toEqual({ type: 'dice' })
    expect(hotkeyFor(key('d'), true)).toBeNull()
    expect(hotkeyFor(key('N'), false)).toEqual({ type: 'next' })
    expect(hotkeyFor(key('3'), false)).toEqual({ type: 'tab', index: 2 })
    expect(hotkeyFor(key('9'), false)).toBeNull()
    expect(hotkeyFor(key('d', { ctrlKey: true }), false)).toBeNull()
    expect(hotkeyFor(key('Escape'), true)).toEqual({ type: 'escape' })
    expect(isTypingTarget({ tagName: 'INPUT', type: 'text' } as never)).toBe(true)
    expect(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' } as never)).toBe(false)
    expect(isTypingTarget({ tagName: 'TEXTAREA' } as never)).toBe(true)
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: false } as never)).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})

describe('tools i18n', () => {
  it('has the same keys in nb and en', () => {
    const keys = (o: object, p = ''): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    expect(keys(toolsEn).sort()).toEqual(keys(toolsNb).sort())
  })
})
