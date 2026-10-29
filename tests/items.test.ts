import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import type { CombatState, MagicItemDef, WeaponDef } from '../src/renderer/src/types'
import { newCharacter } from '../src/renderer/src/store/characters'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCombat } from '../src/renderer/src/lib/combat'
import { add, applyCurrencyInput, formatCp, fromCp, parseCoins, spend, splitCurrency, toCp, type Currency } from '../src/renderer/src/lib/coins'
import {
  addEntity, ammoLeft, ammoTypeOf, bundleSize, consumableKind, consumeAmmo, consumeOne, healingDice, isAmmoFor, itemCombatOptions,
  parseChargeRegain, rechargeItems, recoverAmmo, recoverableAmmo, sellPriceCp
} from '../src/renderer/src/lib/items'

const cur = (p: Partial<Currency>): Currency => ({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, ...p })
const weapon = (id: string): WeaponDef => L.get('weapon', id) as WeaponDef
let n = 0
const uid = (): string => `u${++n}`

describe('coins', () => {
  it('converts to and from copper', () => {
    expect(toCp(cur({ cp: 3, sp: 2, ep: 1, gp: 4, pp: 1 }))).toBe(3 + 20 + 50 + 400 + 1000)
    expect(fromCp(1234)).toEqual(cur({ gp: 12, sp: 3, cp: 4 }))
    expect(add(cur({ gp: 1 }), 250)).toEqual(cur({ gp: 3, sp: 5 }))
  })
  it('pays exactly with the coins you have, largest first', () => {
    expect(spend(cur({ gp: 10, sp: 5 }), 500)).toEqual(cur({ gp: 5, sp: 5 }))
    expect(spend(cur({ gp: 1, sp: 9 }), 10)).toEqual(cur({ gp: 1, sp: 8 }))
    // Kobber brukes når sølv mangler
    expect(spend(cur({ gp: 1, cp: 100 }), 10)).toEqual(cur({ gp: 1, cp: 90 }))
  })
  it('breaks a larger coin and gives change', () => {
    // 3 SP fra en GP → 7 SP tilbake
    expect(spend(cur({ gp: 2 }), 30)).toEqual(cur({ gp: 1, sp: 7 }))
    // 15 GP fra 2 PP → 5 GP tilbake
    expect(spend(cur({ pp: 2 }), 1500)).toEqual(cur({ pp: 0, gp: 5 }))
    // Bryter den minste mynten som dekker resten: 1 GP heller enn 1 PP
    expect(spend(cur({ pp: 1, gp: 1, sp: 2 }), 50)).toEqual(cur({ pp: 1, gp: 0, sp: 7 }))
    // 4 CP (Sling Bullets) fra en SP → 6 CP tilbake
    expect(spend(cur({ sp: 1 }), 4)).toEqual(cur({ cp: 6 }))
    // Sum er alltid riktig
    const before = cur({ pp: 3, gp: 2, ep: 1, sp: 4, cp: 7 })
    for (const cost of [1, 9, 55, 123, 999, 3000, toCp(before)]) expect(toCp(spend(before, cost)!)).toBe(toCp(before) - cost)
  })
  it('refuses when you cannot afford it', () => {
    expect(spend(cur({ gp: 1 }), 101)).toBeNull()
  })
  it('parses prices', () => {
    expect(parseCoins('15 GP')).toBe(1500)
    expect(parseCoins('5 sp')).toBe(50)
    expect(parseCoins('1,000 gp')).toBe(100000)
    expect(parseCoins('2.5 gp')).toBe(250)
    expect(parseCoins('12')).toBe(1200)
    expect(parseCoins('50 GP each')).toBe(5000)
    expect(parseCoins('hmm')).toBeNull()
    expect(formatCp(1234)).toBe('12 GP 3 SP 4 CP')
  })
})

describe('relative currency input', () => {
  const wallet = cur({ cp: 10, sp: 5, gp: 20 })
  const ok = (field: keyof Currency, s: string): Currency => {
    const r = applyCurrencyInput(wallet, field, s)
    if (!r.ok) throw new Error(r.error)
    return r.currency
  }
  it('sets absolute values', () => {
    expect(ok('gp', '35').gp).toBe(35)
  })
  it('adds and subtracts in the field', () => {
    expect(ok('gp', '+35').gp).toBe(55)
    expect(ok('gp', '-4').gp).toBe(16)
    expect(ok('sp', '−2').sp).toBe(3)
  })
  it('understands a coin suffix, whatever field it is typed in', () => {
    expect(ok('cp', '+2 gp')).toEqual(cur({ cp: 10, sp: 5, gp: 22 }))
    expect(ok('gp', '-5 sp')).toEqual(cur({ cp: 10, sp: 0, gp: 20 }))
    expect(ok('gp', '+2.5 gp')).toEqual(cur({ cp: 10, sp: 10, gp: 22 }))
  })
  it('makes change when the field runs out', () => {
    // 8 SP, men bare 5 SP: resten (3 SP) betales med 10 CP + en vekslet GP (8 SP tilbake)
    const r = ok('sp', '-8')
    expect(r).toEqual(cur({ cp: 0, sp: 8, gp: 19 }))
    expect(toCp(r)).toBe(toCp(wallet) - 80)
  })
  it('rejects nonsense and overspending', () => {
    expect(applyCurrencyInput(wallet, 'gp', 'abc')).toEqual({ ok: false, error: 'invalid' })
    expect(applyCurrencyInput(wallet, 'gp', '-500')).toEqual({ ok: false, error: 'insufficient' })
  })
  it('splits loot', () => {
    const { share, remainder } = splitCurrency(cur({ gp: 100, sp: 7 }), 3)
    expect(share).toEqual(cur({ gp: 33, sp: 2 }))
    expect(remainder).toEqual(cur({ gp: 1, sp: 1 }))
  })
})

describe('charges', () => {
  it('parses how many charges an item regains', () => {
    expect(parseChargeRegain('The wand regains 1d6 + 1 expended charges daily at dawn.')).toEqual({ kind: 'dice', dice: '1d6+1' })
    expect(parseChargeRegain('It regains 1d3 expended charges daily at dawn.')).toEqual({ kind: 'dice', dice: '1d3' })
    expect(parseChargeRegain('The rod regains 1 expended charge daily at dawn.')).toEqual({ kind: 'dice', dice: '1' })
    expect(parseChargeRegain('Regains all charges at dawn.')).toEqual({ kind: 'all' })
    expect(parseChargeRegain('The staff regains 2d8 + 4 expended charges daily at dawn.')).toEqual({ kind: 'dice', dice: '2d8+4' })
    // Ingen regel: alle tilbake – men Scarab of Protection lades ikke opp
    expect(parseChargeRegain('')).toEqual({ kind: 'all' })
    expect(parseChargeRegain('The scarab has 12 charges. It crumbles into powder when its last charge is expended.')).toEqual({ kind: 'none' })
  })
  it('reads every SRD item with charges', () => {
    const wand = L.get('magicItem', 'wand-of-fireballs') as MagicItemDef
    expect(parseChargeRegain(wand.description)).toEqual({ kind: 'dice', dice: '1d6+1' })
  })
  it('recharges on a long rest with the rolled amount', () => {
    const c = newCharacter()
    c.inventory.push({ uid: 'w', refId: 'wand-of-fireballs', qty: 1, equipped: true, attuned: true, chargesUsed: 5 })
    c.inventory.push({ uid: 's', refId: 'scarab-of-protection', qty: 1, equipped: true, attuned: true, chargesUsed: 3 })
    const rolled: string[] = []
    const out = rechargeItems(c, L, (dice) => (rolled.push(dice), 3))
    expect(rolled).toEqual(['1d6+1'])
    expect(c.inventory[0].chargesUsed).toBe(2)
    expect(c.inventory[1].chargesUsed).toBe(3)
    expect(out).toEqual([{ name: 'Wand of Fireballs', regained: 3 }])
  })
})

describe('consumables', () => {
  it('knows potions, scrolls and food', () => {
    expect(consumableKind(L.item('potion-of-healing'))).toBe('potion')
    expect(consumableKind(L.get('magicItem', 'potion-of-healing-greater'))).toBe('potion')
    expect(consumableKind(L.item('rations'))).toBe('food')
    expect(consumableKind(L.item('spell-scroll-level-1'))).toBe('scroll')
    expect(consumableKind(L.item('longsword'))).toBeUndefined()
    expect(consumableKind(L.item('rope'))).toBeUndefined()
  })
  it('rolls the right healing for each potion', () => {
    expect(healingDice(L.item('potion-of-healing'))).toBe('2d4+2')
    expect(healingDice(L.get('magicItem', 'potion-of-healing-greater'))).toBe('4d4+4')
    expect(healingDice(L.get('magicItem', 'potion-of-healing-superior'))).toBe('8d4+8')
    expect(healingDice(L.get('magicItem', 'potion-of-healing-supreme'))).toBe('10d4+20')
    expect(healingDice(undefined, 'Potion of Greater Healing')).toBe('4d4+4')
    expect(healingDice({ id: 'x', name: 'Elixir', kind: 'gear', source: 'Homebrew', summary: 'You regain 3d6 + 3 hit points.', description: '', cost: '10 GP', weight: 1 })).toBe('3d6+3')
  })
  it('offers potions as a Bonus Action in combat and uses them up', () => {
    const c = newCharacter()
    c.inventory.push({ uid: 'p', refId: 'potion-of-healing', qty: 2, equipped: false, attuned: false })
    const opts = itemCombatOptions(c, L)
    expect(opts).toHaveLength(1)
    expect(opts[0]).toMatchObject({ economy: 'bonus', heal: '2d4+2', qty: 2 })
    consumeOne(c, 'p')
    expect(c.inventory[0].qty).toBe(1)
    consumeOne(c, 'p')
    expect(c.inventory).toHaveLength(0)
  })
})

describe('ammunition', () => {
  it('knows which ammunition a weapon uses', () => {
    expect(ammoTypeOf(weapon('longbow'))).toBe('Arrow')
    expect(ammoTypeOf(weapon('light-crossbow'))).toBe('Bolt')
    expect(ammoTypeOf(weapon('longsword'))).toBeUndefined()
  })
  it('matches ammunition names sensibly', () => {
    expect(isAmmoFor(weapon('longbow'), 'Arrows')).toBe(true)
    expect(isAmmoFor(weapon('shortbow'), 'Arrows (20)')).toBe(true)
    expect(isAmmoFor(weapon('longbow'), '+1 Arrow')).toBe(true)
    expect(isAmmoFor(weapon('longbow'), 'Bolts')).toBe(false)
    expect(isAmmoFor(weapon('hand-crossbow'), 'Bolts')).toBe(true)
    expect(isAmmoFor(weapon('longbow'), 'Quiver')).toBe(false)
    expect(isAmmoFor(weapon('sling'), 'Sling Bullets')).toBe(true)
    expect(isAmmoFor(weapon('sling'), 'Firearm Bullets')).toBe(false)
    expect(isAmmoFor(weapon('pistol'), 'Firearm Bullets')).toBe(true)
    expect(isAmmoFor(weapon('musket'), 'Sling Bullets')).toBe(false)
    expect(isAmmoFor(weapon('blowgun'), 'Needles')).toBe(true)
    expect(isAmmoFor(weapon('longsword'), 'Arrows')).toBe(false)
  })
  it('buys ammunition in bundles and weighs it per piece', () => {
    expect(bundleSize(L.item('arrows'))).toBe(20)
    const c = newCharacter()
    addEntity(c, L.item('arrows')!, 2, uid)
    expect(c.inventory[0].qty).toBe(40)
    // 20 Arrows = 1 lb.
    expect(computeCharacter(c, L).carry.weight).toBe(2)
    // Selges for halv pris: 1 GP / 20 / 2 = 2 CP per pil
    expect(sellPriceCp(L.item('arrows'), c.inventory[0])).toBe(2)
  })
  it('uses one per attack, unpacks bundles and recovers half after combat', () => {
    const c = newCharacter()
    c.inventory.push({ uid: 'q', refId: 'arrows', name: 'Arrows (20)', qty: 1, equipped: false, attuned: false })
    const bow = weapon('longbow')
    expect(ammoLeft(c, L, bow)).toBe(20)
    const combat: CombatState = newCombat('app', { uid: 'me', name: 'Me', init: 10, self: true })
    for (let i = 0; i < 5; i++) consumeAmmo(c, L, bow, combat)
    expect(c.inventory[0]).toMatchObject({ qty: 15, name: undefined })
    expect(ammoLeft(c, L, bow)).toBe(15)
    expect(combat.ammoUsed).toEqual([{ uid: 'q', refId: 'arrows', name: 'Arrows', n: 5 }])
    expect(recoverableAmmo(combat)).toEqual([{ uid: 'q', name: 'Arrows', n: 2 }])
    expect(recoverAmmo(c, combat, uid)).toBe(2)
    expect(c.inventory[0].qty).toBe(17)
    expect(combat.ammoUsed).toEqual([])
  })
  it('returns null when out of ammunition', () => {
    const c = newCharacter()
    c.inventory.push({ uid: 'b', refId: 'bolts', qty: 1, equipped: false, attuned: false })
    expect(consumeAmmo(c, L, weapon('longbow'))).toBeNull()
    expect(consumeAmmo(c, L, weapon('light-crossbow'))).toMatchObject({ left: 0 })
    expect(consumeAmmo(c, L, weapon('light-crossbow'))).toBeNull()
  })
})
