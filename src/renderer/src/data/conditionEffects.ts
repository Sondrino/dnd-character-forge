import type { Effect } from '../types'

/**
 * Mekaniske følger av conditions (2024 / SRD 5.2.1) som påvirker dine egne terningkast.
 * Brukes av engine/compute.ts som effects med kilde «Condition: X», så Advantage/Disadvantage
 * vises på arket og forhåndsvelges i kampmodus.
 *
 * Ikke med her (håndteres andre steder eller gjelder andres kast mot deg):
 *  - Grappled/Restrained/Paralyzed/Petrified/Stunned/Unconscious: Speed 0 (compute.ts)
 *  - Exhaustion: −2 per nivå på D20 Tests og −5 ft. Speed (compute.ts)
 *  - «Attack rolls against you have Advantage» o.l.
 */
export const CONDITION_EFFECTS: Record<string, Effect[]> = {
  blinded: [{ target: 'attack.all', op: 'disadvantage' }],
  frightened: [
    { target: 'attack.all', op: 'disadvantage' },
    { target: 'check.all', op: 'disadvantage' }
  ],
  // Incapacitated (2024): Disadvantage på Initiative
  incapacitated: [{ target: 'initiative', op: 'disadvantage' }],
  // Invisible (2024): Advantage på angrep og på Initiative (Surprise)
  invisible: [
    { target: 'attack.all', op: 'advantage' },
    { target: 'initiative', op: 'advantage' }
  ],
  poisoned: [
    { target: 'attack.all', op: 'disadvantage' },
    { target: 'check.all', op: 'disadvantage' }
  ],
  prone: [{ target: 'attack.all', op: 'disadvantage' }],
  restrained: [
    { target: 'attack.all', op: 'disadvantage' },
    { target: 'save.dex', op: 'disadvantage' }
  ]
}

/** «poisoned» → «Poisoned» */
export function conditionLabel(id: string): string {
  return id ? id[0].toUpperCase() + id.slice(1) : id
}
