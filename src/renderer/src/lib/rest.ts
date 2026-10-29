import type { Character, CombatEffect } from '../types'
import type { Derived } from '../engine/compute'
import { ROUNDS_PER_HOUR, dropConcentration, tickEffects } from './combat'

/** Ren hvile-logikk (2024) – brukt av RestModal i CharacterPage og testet i tests/spellsx.test.ts */

/** Slots man kan få tilbake på en Short Rest: Arcane Recovery (Wizard) og Natural Recovery (Circle of the Land) */
export interface SlotRecovery {
  id: 'arcane-recovery' | 'natural-recovery'
  name: string
  /** Samlet slot-nivå som kan gjenvinnes: halvparten av class-levelet, rundet opp */
  budget: number
  /** Ingen slots på level 6+ */
  maxLevel: number
  /** featureUses-nøkkel som markerer at den er brukt (lades på Long Rest) */
  useKey: string
  available: boolean
}

/** Halvparten av class-levelet, rundet opp (Arcane Recovery / Natural Recovery) */
export function slotRecoveryBudget(classLevel: number): number {
  return Math.max(0, Math.ceil(classLevel / 2))
}

export function slotRecoveryOptions(ch: Character, d: Derived): SlotRecovery[] {
  const out: SlotRecovery[] = []
  const lvl = (id: string): number => ch.classes.find((c) => c.classId === id)?.level ?? 0
  const arcane = d.features.find((f) => /^arcane recovery$/i.test(f.name))
  if (arcane && lvl('wizard') > 0) {
    out.push({ id: 'arcane-recovery', name: arcane.name, budget: slotRecoveryBudget(lvl('wizard')), maxLevel: 5, useKey: arcane.key, available: arcane.uses ? arcane.uses.used < arcane.uses.max : !ch.featureUses[arcane.key] })
  }
  // Natural Recovery: featurens egen bruk går til gratis-kastet; slot-gjenvinningen har sin egen (1 per Long Rest)
  const natural = d.features.find((f) => /^natural recovery$/i.test(f.name))
  if (natural && lvl('druid') > 0) {
    const key = 'rest:natural-recovery'
    out.push({ id: 'natural-recovery', name: natural.name, budget: slotRecoveryBudget(lvl('druid')), maxLevel: 5, useKey: key, available: !ch.featureUses[key] })
  }
  return out
}

/** Gyldig valg av slots: nivå ≤ maxLevel, ikke flere enn brukt, samlet nivå ≤ budget */
export function recoveryValid(picks: Record<number, number>, r: Pick<SlotRecovery, 'budget' | 'maxLevel'>, slots: { level: number; used: number }[]): boolean {
  let total = 0
  for (const [k, n] of Object.entries(picks)) {
    const level = Number(k)
    if (!n) continue
    if (n < 0 || level > r.maxLevel) return false
    const used = slots.find((s) => s.level === level)?.used ?? 0
    if (n > used) return false
    total += level * n
  }
  return total <= r.budget
}

export function recoveryTotal(picks: Record<number, number>): number {
  return Object.entries(picks).reduce((s, [k, n]) => s + Number(k) * (n || 0), 0)
}

/** Gi tilbake valgte slots og marker evnen som brukt */
export function applySlotRecovery(ch: Character, r: Pick<SlotRecovery, 'useKey'>, picks: Record<number, number>): void {
  let any = false
  for (const [k, n] of Object.entries(picks)) {
    const i = Number(k) - 1
    if (!n || i < 0) continue
    ch.spellSlotsUsed[i] = Math.max(0, (ch.spellSlotsUsed[i] ?? 0) - n)
    any = true
  }
  if (any) ch.featureUses[r.useKey] = (ch.featureUses[r.useKey] ?? 0) + 1
}

/** Magical Cunning (Warlock 2024): 1 minutts ritual, få tilbake brukte Pact slots – maks halvparten av maks (rundet opp) */
export function magicalCunningRegain(pactMax: number, pactUsed: number): number {
  return Math.max(0, Math.min(pactUsed, Math.ceil(pactMax / 2)))
}

/** Resourceful (Human): Heroic Inspiration etter hver Long Rest */
export function grantsInspirationOnLongRest(d: Derived): boolean {
  return d.features.some((f) => f.sourceType === 'species' && /^resourceful$/i.test(f.name))
}

/** Hit Die på Short Rest: terning + CON-modifier, minst 1 HP per terning */
export function hitDieHeal(total: number): number {
  return Math.max(1, Math.floor(total))
}

/** Hvor lenge hvilen varer i runder (Short Rest 1 time, Long Rest 8 timer) */
export const REST_ROUNDS = { short: ROUNDS_PER_HOUR, long: 8 * ROUNDS_PER_HOUR } as const

/** Effekter utenfor kamp som slutter i løpet av hvilen (Long Rest: man sover, så concentration slutter også) */
export function effectsEndingOnRest(ch: Character, kind: 'short' | 'long'): CombatEffect[] {
  return (ch.effects ?? []).filter((e) => (e.rounds !== undefined && e.rounds <= REST_ROUNDS[kind]) || (kind === 'long' && e.concentration))
}

/** Tiden går under hvilen: effekter teller ned; på Long Rest slutter concentration (søvn) */
export function passRestTime(ch: Character, kind: 'short' | 'long'): CombatEffect[] {
  const gone = tickEffects(ch, ch, REST_ROUNDS[kind])
  if (kind === 'long' && (ch.concentration || (ch.effects ?? []).some((e) => e.concentration))) {
    const before = (ch.effects ?? []).filter((e) => e.concentration)
    dropConcentration(ch, ch)
    gone.push(...before)
  }
  return gone
}
