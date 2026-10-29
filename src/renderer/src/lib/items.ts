import type { AnyEntity, Character, CombatState, GearDef, InventoryItem, MagicItemDef, WeaponDef } from '../types'
import type { Lookup } from '../engine/lookup'
import { parseCoins } from './coins'

/* ------------------------------------------------------------------ */
/* Navn og grunnleggende                                               */
/* ------------------------------------------------------------------ */

/** Navnet som vises for en rad: eget navn, ellers databasenavnet */
export function itemName(it: InventoryItem, L: Lookup): string {
  return it.name || L.item(it.refId)?.name || ''
}

/** «Arrows (20)» → 20 (antall per enhet i navnet), ellers undefined */
export function packOf(name: string | undefined): number | undefined {
  const m = (name ?? '').match(/\((\d+)\)\s*$/)
  return m ? Number(m[1]) : undefined
}

/** Ammunisjon selges i bunter: «20 arrows (1 GP)» → 20. Andre ting: 1 */
export function bundleSize(def: AnyEntity | undefined): number {
  if (def?.kind !== 'gear' || (def as GearDef).category !== 'Ammunition') return 1
  const m = def.summary.match(/^(\d+)\s/)
  return m ? Number(m[1]) : 1
}

/**
 * Hvor mange enheter av vekt/pris i dataene én qty tilsvarer. Ammunisjon telles i stykk («20 Arrows»),
 * mens vekt og pris i dataene gjelder hele bunten – med mindre raden selv er en bunt («Arrows (20)»).
 */
export function qtyDivisor(def: AnyEntity | undefined, it: Pick<InventoryItem, 'name'>): number {
  return packOf(it.name) ? 1 : bundleSize(def)
}

/** Pris i cp for én qty av raden (undefined når ukjent) */
export function unitCostCp(def: AnyEntity | undefined, it: Pick<InventoryItem, 'name'>): number | undefined {
  const cp = parseCoins((def as { cost?: string } | undefined)?.cost)
  if (cp === null || !(cp > 0)) return undefined
  return cp / qtyDivisor(def, it)
}

/** Standard salgspris (halv pris, 2024) for én qty, i hele cp */
export function sellPriceCp(def: AnyEntity | undefined, it: Pick<InventoryItem, 'name'>): number | undefined {
  const c = unitCostCp(def, it)
  return c === undefined ? undefined : Math.floor(c / 2)
}

/** Legg en database-entity i utstyret (ammunisjon kommer i bunter, utstyr stables) */
export function addEntity(c: Character, e: AnyEntity, qty = 1, uid: () => string): void {
  const n = qty * bundleSize(e)
  const ex = e.kind === 'gear' ? c.inventory.find((i) => i.refId === e.id && !packOf(i.name)) : undefined
  if (ex) ex.qty += n
  else c.inventory.push({ uid: uid(), refId: e.id, qty: n, equipped: false, attuned: false })
}

/* ------------------------------------------------------------------ */
/* Forbruksvarer: potions, scrolls, mat                                */
/* ------------------------------------------------------------------ */

export type ConsumableKind = 'potion' | 'scroll' | 'food'

export function consumableKind(def: AnyEntity | undefined, name = ''): ConsumableKind | undefined {
  const type = def?.kind === 'magicItem' ? (def as MagicItemDef).itemType : ''
  if (/^potion/i.test(type)) return 'potion'
  if (/^scroll/i.test(type)) return 'scroll'
  if (def && def.kind !== 'gear' && def.kind !== 'magicItem') return undefined
  const n = `${name} ${def?.name ?? ''}`.toLowerCase()
  if (/\b(potion|elixir|philter|antitoxin)\b/.test(n)) return 'potion'
  if (/\bscroll\b/.test(n) && !/\bcase\b/.test(n)) return 'scroll'
  if (/\b(rations?|food|trail mix|bread|cheese|meal|feast|goodberr(y|ies))\b/.test(n)) return 'food'
  return undefined
}

/** Potion of Healing-familien (2024): terninger etter styrke */
const HEALING: [RegExp, string][] = [
  [/supreme/i, '10d4+20'],
  [/superior/i, '8d4+8'],
  [/greater/i, '4d4+4'],
  [/.*/, '2d4+2']
]

/** Terninger for HP en drikk gir: Potion of Healing-tabellen, ellers «regain(s) XdY + Z Hit Points» i teksten */
export function healingDice(def: AnyEntity | undefined, name = ''): string | undefined {
  const n = `${def?.id ?? ''} ${def?.name ?? ''} ${name}`
  if (/potion[- ]of[- ](\w+[- ])?healing|healing[- ]potion/i.test(n)) return HEALING.find(([re]) => re.test(n))![1]
  for (const text of [def?.summary, def?.description]) {
    const m = (text ?? '').match(/regains?\s+(\d+d\d+(?:\s*\+\s*\d+)?|\d+)\s+hit points/i)
    if (m) return m[1].replace(/\s+/g, '')
  }
  return undefined
}

/** 2024: å drikke en potion er en Bonus Action; scrolls brukes med en handling */
export function consumableEconomy(k: ConsumableKind): 'bonus' | 'action' {
  return k === 'potion' ? 'bonus' : 'action'
}

/** Bruk én: qty −1, fjernes ved 0 */
export function consumeOne(c: Character, uid: string): void {
  const i = c.inventory.findIndex((x) => x.uid === uid)
  if (i < 0) return
  c.inventory[i].qty -= 1
  if (c.inventory[i].qty <= 0) c.inventory.splice(i, 1)
}

/** Helbred karakteren (fra 0 HP våkner man, death saves nullstilles). Returnerer faktisk helbredet HP. */
export function healCharacter(ch: Character, n: number, max: number): number {
  if (n <= 0) return 0
  const before = Math.max(0, ch.hp.current)
  ch.hp.current = Math.min(max, before + n)
  if (ch.hp.current > 0) {
    ch.deathSaves = { successes: 0, failures: 0 }
    ch.conditions = ch.conditions.filter((x) => x !== 'unconscious')
  }
  return ch.hp.current - before
}

export interface ItemOptionData {
  kind: 'item'
  key: string
  uid: string
  name: string
  consumable: ConsumableKind
  economy: 'bonus' | 'action'
  qty: number
  heal?: string
}

/** Forbruksvarer som kan brukes i kamp (potions og scrolls) */
export function itemCombatOptions(char: Character, L: Lookup): ItemOptionData[] {
  const out: ItemOptionData[] = []
  for (const it of char.inventory) {
    if (it.qty <= 0) continue
    const def = L.item(it.refId)
    const k = consumableKind(def, it.name)
    if (!k || k === 'food') continue
    const name = it.name || def?.name || ''
    out.push({ kind: 'item', key: `it:${it.uid}`, uid: it.uid, name, consumable: k, economy: consumableEconomy(k), qty: it.qty, heal: k === 'potion' ? healingDice(def, name) : undefined })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Charges                                                             */
/* ------------------------------------------------------------------ */

export type ChargeRegain = { kind: 'dice'; dice: string } | { kind: 'all' } | { kind: 'none' }

/** «regains 1d6 + 1 expended charges daily at dawn» → 1d6+1. Ingen regel → alle (med mindre teksten tydelig ikke lader opp). */
export function parseChargeRegain(text: string | undefined): ChargeRegain {
  const s = text ?? ''
  const m = s.match(/regains?\s+(all|\d+d\d+(?:\s*[+−-]\s*\d+)?|\d+)\s+(?:of\s+its\s+)?(?:expended\s+)?charges?\b/i)
  if (m) {
    if (/^all$/i.test(m[1])) return { kind: 'all' }
    return { kind: 'dice', dice: m[1].replace(/\s+/g, '').replace(/−/g, '-') }
  }
  // Teksten beskriver charges, men sier ingenting om å lade opp (Scarab of Protection) → lades ikke opp
  if (/\bcharges?\b/i.test(s) && !/regain|recharge/i.test(s)) return { kind: 'none' }
  return { kind: 'all' }
}

/** Maks charges for en rad (magiske gjenstander med charges) */
export function maxCharges(def: AnyEntity | undefined): number {
  return def?.kind === 'magicItem' ? ((def as MagicItemDef).charges ?? 0) : 0
}

/**
 * Long rest («daily at dawn»): gjenvinn charges. `roll` ruller terningene (f.eks. via useRolls).
 * Returnerer hva hver gjenstand fikk tilbake.
 */
export function rechargeItems(c: Character, L: Lookup, roll: (dice: string, label: string) => number): { name: string; regained: number }[] {
  const out: { name: string; regained: number }[] = []
  for (const it of c.inventory) {
    const used = it.chargesUsed ?? 0
    if (used <= 0) continue
    const def = L.item(it.refId)
    const max = maxCharges(def)
    const name = it.name || def?.name || ''
    const r = parseChargeRegain(def?.description || def?.summary)
    if (r.kind === 'none') continue
    const n = r.kind === 'all' ? used : Math.max(0, roll(r.dice, `${name}: charges`))
    it.chargesUsed = Math.max(0, Math.min(max || used, used - n))
    out.push({ name, regained: used - it.chargesUsed })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Ammunisjon                                                          */
/* ------------------------------------------------------------------ */

/** Ammunisjonstypen et våpen bruker («Arrow», «Bolt», «Bullet», «Needle») */
export function ammoTypeOf(w: WeaponDef | undefined): string | undefined {
  if (!w || !w.properties?.includes('ammunition')) return undefined
  if (w.ammunition) return w.ammunition
  const n = w.name.toLowerCase()
  if (/crossbow/.test(n)) return 'Bolt'
  if (/bow/.test(n)) return 'Arrow'
  if (/blowgun/.test(n)) return 'Needle'
  if (/sling|musket|pistol|rifle|firearm|gun/.test(n)) return 'Bullet'
  return undefined
}

const normName = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[+-]\d+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Passer gjenstanden (navn) som ammunisjon til våpenet? Sling Bullets ≠ Firearm Bullets. */
export function isAmmoFor(w: WeaponDef | undefined, ...names: (string | undefined)[]): boolean {
  const type = ammoTypeOf(w)
  if (!type || !w) return false
  const stem = type.toLowerCase().replace(/s$/, '')
  const re = new RegExp(`\\b${stem}s?\\b`)
  const slingWeapon = /sling/i.test(w.name) || w.id === 'sling'
  return names.some((raw) => {
    if (!raw) return false
    const n = normName(raw)
    if (!re.test(n)) return false
    if (stem === 'bullet') {
      if (slingWeapon && /firearm|musket|pistol/.test(n)) return false
      if (!slingWeapon && /sling/.test(n)) return false
    }
    return true
  })
}

/** Antall stykk ammunisjon i en rad («Arrows (20)» × 2 = 40) */
export function ammoPieces(it: InventoryItem): number {
  return Math.max(0, it.qty) * (packOf(it.name) ?? 1)
}

/** Rader i utstyret som er ammunisjon til våpenet */
export function ammoRows(c: Character, L: Lookup, w: WeaponDef | undefined): InventoryItem[] {
  if (!ammoTypeOf(w)) return []
  return c.inventory.filter((it) => {
    const def = L.item(it.refId)
    const base = def?.kind === 'magicItem' ? L.item(it.baseId) : undefined
    if (def && def.kind !== 'gear' && def.kind !== 'magicItem') return false
    return isAmmoFor(w, it.name, def?.name, base?.name)
  })
}

/** Hvor mye ammunisjon som er igjen til våpenet (undefined: våpenet bruker ikke ammunisjon) */
export function ammoLeft(c: Character, L: Lookup, w: WeaponDef | undefined): number | undefined {
  if (!ammoTypeOf(w)) return undefined
  return ammoRows(c, L, w).reduce((s, it) => s + ammoPieces(it), 0)
}

/**
 * Bruk ett stykk ammunisjon til våpenet. En bunt («Arrows (20)») gjøres om til stykk første gang.
 * Telles i kampen (for å hente igjen halvparten etterpå). Returnerer null når det er tomt.
 */
export function consumeAmmo(c: Character, L: Lookup, w: WeaponDef | undefined, combat?: CombatState): { name: string; left: number } | null {
  const it = ammoRows(c, L, w).find((x) => ammoPieces(x) > 0)
  if (!it) return null
  const def = L.item(it.refId)
  const pack = packOf(it.name)
  if (pack) {
    it.qty *= pack
    const plain = it.name!.replace(/\s*\(\d+\)\s*$/, '')
    it.name = def && plain === def.name ? undefined : plain
  }
  it.qty -= 1
  const name = it.name || def?.name || ''
  if (combat) {
    combat.ammoUsed ??= []
    const e = combat.ammoUsed.find((x) => x.uid === it.uid)
    if (e) e.n += 1
    else combat.ammoUsed.push({ uid: it.uid, refId: it.refId, name, n: 1 })
  }
  return { name, left: ammoLeft(c, L, w) ?? 0 }
}

/** Halvparten av ammunisjonen som ble brukt i kampen (rundet ned), per type */
export function recoverableAmmo(combat: CombatState | undefined): { uid: string; name: string; n: number }[] {
  return (combat?.ammoUsed ?? []).map((e) => ({ uid: e.uid, name: e.name, n: Math.floor(e.n / 2) })).filter((e) => e.n > 0)
}

/** Legg halvparten av brukt ammunisjon tilbake i utstyret. Returnerer antall stykk. */
export function recoverAmmo(c: Character, combat: CombatState, uid: () => string): number {
  let total = 0
  for (const e of combat.ammoUsed ?? []) {
    const n = Math.floor(e.n / 2)
    if (n <= 0) continue
    const it = c.inventory.find((x) => x.uid === e.uid)
    if (it) it.qty += n
    else c.inventory.push({ uid: uid(), refId: e.refId, name: e.refId ? undefined : e.name, qty: n, equipped: false, attuned: false })
    total += n
  }
  combat.ammoUsed = []
  return total
}
