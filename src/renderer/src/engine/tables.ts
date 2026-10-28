import type { SpellcastingDef } from '../types'

/** Spell slots for (multiclass) spellcaster-nivå 1–20, SRD 5.2.1. Index [level-1][slotLevel-1] */
export const SPELL_SLOTS: number[][] = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1]
]

/** Warlock Pact Magic: [antall slots, slot-nivå] per warlock-nivå */
export const PACT_SLOTS: [number, number][] = [
  [1, 1], [2, 1], [2, 2], [2, 2], [2, 3], [2, 3], [2, 4], [2, 4], [2, 5], [2, 5],
  [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5]
]

export function proficiencyBonus(level: number): number {
  return Math.ceil(Math.max(1, level) / 4) + 1
}

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

/** Multiclass-proficiencies (SRD 5.2.1 Multiclassing) når classen ikke er startclassen */
export const MULTICLASS_PROFS: Record<string, { armor: ('light' | 'medium' | 'heavy' | 'shield')[]; weapons: string[]; tools?: string[]; skills?: number; note?: string }> = {
  barbarian: { armor: ['shield'], weapons: ['martial'] },
  bard: { armor: ['light'], weapons: [], skills: 1, note: 'One skill of your choice and one Musical Instrument' },
  cleric: { armor: ['light', 'medium', 'shield'], weapons: [] },
  druid: { armor: ['light', 'shield'], weapons: [] },
  fighter: { armor: ['light', 'medium', 'shield'], weapons: ['martial'] },
  monk: { armor: [], weapons: [] },
  paladin: { armor: ['light', 'medium', 'shield'], weapons: ['martial'] },
  ranger: { armor: ['light', 'medium', 'shield'], weapons: ['martial'], skills: 1, note: 'One skill from the Ranger skill list' },
  rogue: { armor: ['light'], weapons: [], tools: ['thieves-tools'], skills: 1, note: 'One skill from the Rogue skill list and Thieves’ Tools' },
  sorcerer: { armor: [], weapons: [] },
  warlock: { armor: ['light'], weapons: [] },
  wizard: { armor: [], weapons: [] },
  artificer: { armor: ['light', 'medium', 'shield'], weapons: [], tools: ['thieves-tools', 'tinkers-tools'] }
}

/** Gjennomsnittlig HP per nivå etter nivå 1 (2024: fast verdi) */
export function averageHitDie(die: number): number {
  return Math.floor(die / 2) + 1
}

/**
 * Subclasses med egen Spellcasting-feature (one-third casters, PHB 2024): Eldritch Knight og Arcane Trickster.
 * Tallene er spillmekaniske fakta (antall cantrips/prepared spells per class-nivå 1–20).
 * Slots: én class alene bruker ceil(nivå/3) i Multiclass Spellcaster-tabellen (gir class-tabellen),
 * ved multiclassing teller en tredjedel av nivåene (rundet ned).
 */
const THIRD_PREPARED = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
export const SUBCLASS_SPELLCASTING: Record<string, SpellcastingDef> = {
  'eldritch-knight': {
    ability: 'int', progression: 'third', spellList: 'wizard',
    cantrips: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    prepared: THIRD_PREPARED
  },
  'arcane-trickster': {
    ability: 'int', progression: 'third', spellList: 'wizard',
    cantrips: [0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    prepared: THIRD_PREPARED
  }
}
