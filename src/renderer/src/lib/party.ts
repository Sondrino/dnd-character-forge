import type { Character, CombatState, Combatant } from '../types'
import { applyDamage, dropConcentration, freshTurn, initiativeOrder, uidc, type DamageResult } from './combat'

/** Ren logikk for gruppe-/DM-modus (ingen React) – testet i tests/party.test.ts */

/** Felles initiativ for hele gruppen + monstre. Samme form som en vanlig kamp, så lib/combat kan brukes direkte. */
export type PartyEncounter = CombatState

export interface Party {
  id: string
  name: string
  /** Karakter-ids */
  memberIds: string[]
  encounter?: PartyEncounter
  createdAt?: string
}

export function newParty(name: string): Party {
  return { id: `party-${uidc()}${Date.now().toString(36).slice(-4)}`, name: name.trim(), memberIds: [], createdAt: new Date().toISOString() }
}

export function addMembers(p: Party, ids: string[]): void {
  for (const id of ids) if (!p.memberIds.includes(id)) p.memberIds.push(id)
}

/** Fjern et medlem – også fra et pågående møte */
export function removeMember(p: Party, id: string): void {
  p.memberIds = p.memberIds.filter((x) => x !== id)
  if (p.encounter) removeCombatant(p.encounter, (x) => x.characterId === id)
}

/** Medlemmer som fortsatt finnes (slettede karakterer hoppes over) */
export function liveMembers(p: Party, characters: Record<string, Character>): Character[] {
  return p.memberIds.map((id) => characters[id]).filter((c): c is Character => !!c)
}

/** Gyldig lagret data (fra disk) → liste med grupper */
export function normalizeParties(raw: unknown): Party[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p): p is Party => !!p && typeof p === 'object' && typeof (p as Party).id === 'string')
    .map((p) => ({ ...p, name: typeof p.name === 'string' ? p.name : '', memberIds: Array.isArray(p.memberIds) ? p.memberIds.filter((x) => typeof x === 'string') : [] }))
}

/* ------------------------------------------------------------------ */
/* Møte (encounter)                                                    */
/* ------------------------------------------------------------------ */

export function newEncounter(combatants: Combatant[], dice: CombatState['dice'] = 'app'): PartyEncounter {
  return {
    dice,
    round: 1,
    turnIdx: 0,
    combatants,
    turn: freshTurn(),
    effects: [],
    log: [],
    stats: { dealt: 0, taken: 0, healed: 0, spells: 0, crits: 0, hits: 0, misses: 0 },
    startedAt: new Date().toISOString()
  }
}

/** Deltaker for et gruppemedlem */
export function memberCombatant(ch: Pick<Character, 'id' | 'name'>, init: number): Combatant {
  return { uid: `pc-${ch.id}`, name: ch.name || '?', init, characterId: ch.id, ally: true }
}

/** Legg til deltakere uten å endre hvem sin tur det er */
export function addCombatants(e: PartyEncounter, list: Combatant[]): void {
  const curUid = initiativeOrder(e.combatants)[e.turnIdx]?.uid
  e.combatants.push(...list)
  const idx = initiativeOrder(e.combatants).findIndex((x) => x.uid === curUid)
  if (idx >= 0) e.turnIdx = idx
}

/** Fjern deltakere uten å endre hvem sin tur det er (hvis den som har turen blir værende) */
export function removeCombatant(e: PartyEncounter, pred: (x: Combatant) => boolean): void {
  const curUid = initiativeOrder(e.combatants)[e.turnIdx]?.uid
  e.combatants = e.combatants.filter((x) => !pred(x))
  const idx = initiativeOrder(e.combatants).findIndex((x) => x.uid === curUid)
  e.turnIdx = Math.max(0, Math.min(idx >= 0 ? idx : e.turnIdx, e.combatants.length - 1))
}

/** Endre initiativ på en deltaker uten å endre hvem sin tur det er */
export function setInitiative(e: PartyEncounter, uid: string, init: number): void {
  const curUid = initiativeOrder(e.combatants)[e.turnIdx]?.uid
  const x = e.combatants.find((y) => y.uid === uid)
  if (!x) return
  x.init = init
  const idx = initiativeOrder(e.combatants).findIndex((y) => y.uid === curUid)
  if (idx >= 0) e.turnIdx = idx
}

/* ------------------------------------------------------------------ */
/* HP på ekte karakterer (samme regler som arket og kampmodus)          */
/* ------------------------------------------------------------------ */

export interface HpDefenses {
  max: number
  resistances: string[]
  immunities: string[]
  vulnerabilities: string[]
}

export interface HpChange {
  kind: 'damage' | 'heal' | 'temp'
  amount: number
  type?: string
  crit?: boolean
}

export interface HpOutcome {
  /** Endring i HP (skade etter resistance o.l., helbredet, eller ny temp HP) */
  n: number
  damage?: DamageResult
  /** Karakteren mistet concentration (0 HP) */
  concentrationLost?: string
}

/**
 * Bruk skade/helbredelse/temp HP på en karakter (Immer-draft eller vanlig objekt):
 * temp HP først, resistance/immunity/vulnerability, 0 HP = Unconscious og concentration slutter,
 * skade på 0 HP = death save failures (2 ved kritisk treff), helbredelse over 0 nullstiller death saves.
 */
export function applyHpChange(ch: Character, change: HpChange, def: HpDefenses): HpOutcome {
  const amount = Math.max(0, Math.floor(change.amount))
  if (!amount) return { n: 0 }
  if (change.kind === 'temp') {
    // Temp HP stables ikke – den høyeste gjelder
    const before = ch.hp.temp
    ch.hp.temp = Math.max(ch.hp.temp, amount)
    return { n: ch.hp.temp - before }
  }
  if (change.kind === 'heal') {
    const before = Math.max(0, ch.hp.current)
    ch.hp.current = Math.min(def.max, before + amount)
    if (ch.hp.current > 0) {
      ch.deathSaves = { successes: 0, failures: 0 }
      ch.conditions = ch.conditions.filter((x) => x !== 'unconscious')
    }
    return { n: Math.max(0, ch.hp.current - before) }
  }
  const conc = ch.combat?.concentration
  const r = applyDamage({
    current: ch.hp.current, temp: ch.hp.temp, max: def.max, amount, type: change.type, crit: change.crit,
    resistances: def.resistances, immunities: def.immunities, vulnerabilities: def.vulnerabilities, concentrating: !!conc
  })
  ch.hp.current = r.current
  ch.hp.temp = r.temp
  const out: HpOutcome = { n: r.final, damage: r }
  if (r.droppedToZero) {
    if (!ch.conditions.includes('unconscious')) ch.conditions.push('unconscious')
    if (ch.combat && conc) {
      out.concentrationLost = conc.name
      dropConcentration(ch.combat, ch)
    }
  }
  if (r.deathFailures) {
    // Skade på 0 HP: ikke lenger stabil
    if (ch.deathSaves.successes >= 3) ch.deathSaves.successes = 0
    ch.deathSaves.failures = Math.min(3, ch.deathSaves.failures + r.deathFailures)
  }
  return out
}

/** Conditions som gjør deg Incapacitated og dermed avslutter concentration */
export const INCAPACITATING = ['incapacitated', 'unconscious', 'stunned', 'paralyzed', 'petrified']

/** Slå en condition av/på på en karakter; Incapacitated o.l. avslutter concentration i en pågående kamp */
export function toggleCharacterCondition(ch: Character, id: string): { on: boolean; concentrationLost?: string } {
  const on = !ch.conditions.includes(id)
  ch.conditions = on ? [...ch.conditions, id] : ch.conditions.filter((x) => x !== id)
  if (on && INCAPACITATING.includes(id) && ch.combat?.concentration) {
    const name = ch.combat.concentration.name
    dropConcentration(ch.combat, ch)
    return { on, concentrationLost: name }
  }
  return { on }
}
