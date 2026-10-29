import type { Combatant, CreatureDef } from '../types'
import { uidc } from './combat'

/** Rene DM-verktøy for monstre (ingen React) – brukt av initiativlista og gruppemodus, testet i tests/party.test.ts */

/** Gjennomsnittlig HP fra stat blocken: «22 (4d8 + 4)» → 22. undefined hvis det ikke står et tall først. */
export function averageHp(hp: string | number | undefined): number | undefined {
  if (typeof hp === 'number') return Number.isFinite(hp) ? hp : undefined
  const m = String(hp ?? '').match(/^\s*(\d+)/)
  return m ? Number(m[1]) : undefined
}

/**
 * Terningdelen av HP i stat blocken: «22 (4d8 + 4)» → «4d8+4», «1 (1d4 − 1)» → «1d4-1», «9 (2d8)» → «2d8».
 * undefined når det ikke finnes terninger (f.eks. «Half the HP maximum of its summoner»).
 */
export function hpDice(hp: string | number | undefined): string | undefined {
  if (typeof hp !== 'string') return undefined
  const s = hp.replace(/[−–—]/g, '-')
  const m = s.match(/(\d*d\d+(?:\s*[+-]\s*\d+)*)/i)
  if (!m) return undefined
  return m[1].replace(/\s+/g, '').toLowerCase()
}

/** Initiativ-modifier for en skapning: DEX-modifieren */
export function creatureInitMod(cr: Pick<CreatureDef, 'abilities'>): number {
  return Math.floor(((cr.abilities?.dex ?? 10) - 10) / 2)
}

/** Neste ledige navn: «Goblin», så «Goblin 2», «Goblin 3» … */
export function nextCombatantName(existing: Pick<Combatant, 'name'>[], base: string): string {
  const same = existing.filter((x) => x.name === base || x.name.startsWith(`${base} `)).length
  return same ? `${base} ${same + 1}` : base
}

/**
 * Lag en deltaker fra bestiariet. `rollHp` får terningene (f.eks. «4d8+4») og returnerer summen;
 * uten den (eller uten terninger) brukes gjennomsnittet fra stat blocken.
 */
export function creatureCombatant(
  cr: CreatureDef,
  opts: { existing: Pick<Combatant, 'name'>[]; init: number; rollHp?: (dice: string) => number }
): Combatant {
  const dice = hpDice(cr.hp)
  let hp = averageHp(cr.hp)
  if (opts.rollHp && dice) hp = Math.max(1, opts.rollHp(dice))
  return {
    uid: uidc(),
    name: nextCombatantName(opts.existing, cr.name),
    init: opts.init,
    hp,
    maxHp: hp,
    ac: cr.ac,
    note: `CR ${cr.cr}`,
    creatureId: cr.id
  }
}

/** ±HP på en vanlig deltaker (monster/NPC): positivt = skade, negativt = helbredelse. 0 HP = beseiret. */
export function applyCombatantHp(x: Combatant, v: number): void {
  if (x.hp === undefined) x.hp = 0
  x.hp = Math.max(0, x.hp - v)
  if (x.maxHp !== undefined) x.hp = Math.min(x.maxHp, x.hp)
  if (x.hp === 0 && x.maxHp) x.defeated = true
  else if (x.hp > 0 && v < 0) x.defeated = false
}

/** Slå en condition av/på på en deltaker */
export function toggleCombatantCondition(x: Combatant, id: string): boolean {
  const list = x.conditions ?? []
  const on = list.includes(id)
  x.conditions = on ? list.filter((c) => c !== id) : [...list, id]
  return !on
}
