import type { Character, CombatEffect, CombatState, CombatTurn, Combatant, Effect, SpellDef } from '../types'

/** Ren kamplogikk (ingen React) – brukt av kampmodus og testet i tests/combat.test.ts */

export const uidc = (): string => Math.random().toString(36).slice(2, 10)

export function freshTurn(): CombatTurn {
  return { action: false, bonus: false, reaction: false, movement: 0, attacks: 0, slotUsed: false, dashed: false, interaction: false }
}

export function newCombat(dice: CombatState['dice'], self: Combatant): CombatState {
  return {
    dice,
    round: 1,
    turnIdx: 0,
    combatants: [self],
    turn: freshTurn(),
    effects: [],
    log: [],
    stats: { dealt: 0, taken: 0, healed: 0, spells: 0, crits: 0, hits: 0, misses: 0 },
    startedAt: new Date().toISOString()
  }
}

/** Initiativ-rekkefølge: høyest først; ved likt vinner karakteren selv, så navn */
export function initiativeOrder(cs: Combatant[]): Combatant[] {
  return [...cs].sort((a, b) => b.init - a.init || Number(!!b.self) - Number(!!a.self) || a.name.localeCompare(b.name))
}

/**
 * Varighet → runder (1 runde = 6 sekunder). undefined = ikke tidsbegrenset i en kamp
 * (Instantaneous, Until dispelled, timer/dager).
 */
export function durationRounds(duration: string): number | undefined {
  const m = duration.toLowerCase().match(/(\d+)\s*(round|minute|hour)/)
  if (!m) return undefined
  const n = Number(m[1])
  const rounds = m[2] === 'round' ? n : m[2] === 'minute' ? n * 10 : n * 600
  return rounds
}

export type CastKind = 'action' | 'bonus' | 'reaction' | 'long'

export function castingKind(castingTime: string): CastKind {
  const c = castingTime.toLowerCase()
  if (c.startsWith('bonus')) return 'bonus'
  if (c.startsWith('reaction')) return 'reaction'
  if (c.startsWith('action')) return 'action'
  return 'long'
}

/** Ekstra terninger per slot-nivå over spellets nivå, lest fra «Using a Higher-Level Spell Slot» */
export function upcastPerLevel(sp: Pick<SpellDef, 'higherLevels'>): string | undefined {
  const m = sp.higherLevels?.match(/(\d+d\d+)\s+for each (?:spell )?slot level above/i)
  return m?.[1]
}

/** Legg sammen terningsuttrykk: «8d6» + 2×«1d6» = «10d6»; ulike terninger blir «8d6+2d8» */
export function addDice(base: string, extra: string | undefined, times: number): string {
  if (!extra || times <= 0) return base
  const em = extra.match(/^(\d+)d(\d+)$/)
  if (!em) return base
  const n = Number(em[1]) * times
  const die = em[2]
  const re = new RegExp(`(^|[^\\d])(\\d+)d${die}(?!\\d)`)
  if (re.test(base)) return base.replace(re, (_m, pre, cnt) => `${pre}${Number(cnt) + n}d${die}`)
  return `${base}+${n}d${die}`
}

/** Cantrip-skalering på karakternivå 5/11/17 (ikke Eldritch Blast, som får flere stråler) */
export function cantripDice(dice: string, sp: Pick<SpellDef, 'level' | 'damage' | 'id'>, charLevel: number): string {
  if (sp.level !== 0 || sp.damage?.cantripScaling === false || sp.id === 'eldritch-blast') return dice
  const mult = charLevel >= 17 ? 4 : charLevel >= 11 ? 3 : charLevel >= 5 ? 2 : 1
  return dice.replace(/^(\d+)d/, (_m, n) => `${Number(n) * mult}d`)
}

/** Skadeterninger for et spell kastet på et gitt slot-nivå */
export function spellDamageDice(sp: SpellDef, slotLevel: number, charLevel: number): string | undefined {
  if (!sp.damage) return undefined
  if (sp.level === 0) return cantripDice(sp.damage.dice, sp, charLevel)
  return addDice(sp.damage.dice, upcastPerLevel(sp), slotLevel - sp.level)
}

/** Helbredelse for et spell: «2d8 + spellcasting modifier» → «2d8+3», med oppskalering */
export function spellHealDice(sp: SpellDef, slotLevel: number, mod: number): string | undefined {
  if (!sp.heal || !/\d/.test(sp.heal)) return undefined
  let h = sp.heal.replace(/\s*\+\s*(your )?spellcasting (ability )?modifier/i, mod ? (mod > 0 ? `+${mod}` : `${mod}`) : '').replace(/\s+/g, '')
  h = addDice(h, upcastPerLevel(sp), slotLevel - sp.level)
  return h
}

/** Kritisk treff: dobbelt så mange skadeterninger, modifikatorer én gang */
export function critDice(notation: string): string {
  return notation.replace(/(\d*)d(\d+)/g, (_m, n, d) => `${(Number(n) || 1) * 2}d${d}`)
}

/** Antall angrep i Attack-handlingen ut fra features */
export function attacksPerAction(featureNames: string[]): number {
  const has = (n: string): boolean => featureNames.some((f) => f.toLowerCase() === n.toLowerCase())
  if (has('Three Extra Attacks')) return 4
  if (has('Two Extra Attacks')) return 3
  if (has('Extra Attack')) return 2
  return 1
}

export interface DamageInput {
  current: number
  temp: number
  max: number
  amount: number
  type?: string
  resistances: string[]
  immunities: string[]
  vulnerabilities: string[]
  concentrating: boolean
  /** Treffet var kritisk (gir 2 death save failures ved 0 HP) */
  crit?: boolean
}

export interface DamageResult {
  /** Skade etter resistance/immunity/vulnerability */
  final: number
  modifier: 'resistant' | 'immune' | 'vulnerable' | null
  absorbedByTemp: number
  current: number
  temp: number
  /** Gikk fra over 0 til 0 HP */
  droppedToZero: boolean
  /** Massive damage: restskaden når 0 HP er minst maks HP */
  instantDeath: boolean
  /** Skade mens man allerede er på 0 HP: antall death save failures */
  deathFailures: number
  /** DC for Constitution save for å beholde concentration (undefined = ingen sjekk) */
  concentrationDC?: number
}

/** 2024-regler for skade: immunity → 0, resistance halverer, vulnerability dobler; temp HP først */
export function applyDamage(i: DamageInput): DamageResult {
  const t = (i.type ?? '').toLowerCase()
  const has = (list: string[]): boolean => !!t && list.some((x) => x.toLowerCase() === t)
  let final = Math.max(0, Math.floor(i.amount))
  let modifier: DamageResult['modifier'] = null
  if (has(i.immunities)) {
    final = 0
    modifier = 'immune'
  } else {
    if (has(i.resistances)) {
      final = Math.floor(final / 2)
      modifier = 'resistant'
    }
    if (has(i.vulnerabilities)) {
      final *= 2
      modifier = modifier === 'resistant' ? null : 'vulnerable'
    }
  }
  const absorbedByTemp = Math.min(i.temp, final)
  const rest = final - absorbedByTemp
  const wasUp = i.current > 0
  const current = Math.max(0, i.current - rest)
  const droppedToZero = wasUp && current === 0
  const overflow = rest - i.current
  const instantDeath = rest > 0 && (wasUp ? current === 0 && overflow >= i.max : rest >= i.max)
  const deathFailures = !wasUp && rest > 0 && !instantDeath ? (i.crit ? 2 : 1) : 0
  const concentrationDC = i.concentrating && final > 0 && current > 0 ? Math.min(30, Math.max(10, Math.floor(final / 2))) : undefined
  return { final, modifier, absorbedByTemp, current, temp: i.temp - absorbedByTemp, droppedToZero, instantDeath, deathFailures, concentrationDC }
}

/** Death save: nat 20 = 1 HP og våken, nat 1 = 2 failures, ≥10 success */
export function deathSave(roll: number, saves: { successes: number; failures: number }): { successes: number; failures: number; revived: boolean; stable: boolean; dead: boolean } {
  if (roll >= 20) return { successes: 0, failures: 0, revived: true, stable: false, dead: false }
  const s = { ...saves }
  if (roll <= 1) s.failures = Math.min(3, s.failures + 2)
  else if (roll >= 10) s.successes = Math.min(3, s.successes + 1)
  else s.failures = Math.min(3, s.failures + 1)
  return { ...s, revived: false, stable: s.successes >= 3, dead: s.failures >= 3 }
}

/**
 * Start på din tur: handling, bonus, reaction og bevegelse fornyes, og effekter teller ned én runde.
 * Utløpte effekter avsluttes (med opprydding på karakteren). Returnerer dem.
 */
export function startOwnTurn(c: CombatState, ch: Character): CombatEffect[] {
  c.turn = freshTurn()
  for (const e of c.effects) if (e.rounds !== undefined) e.rounds -= 1
  return endEffects(c, ch, (e) => e.rounds !== undefined && e.rounds <= 0)
}

/**
 * Neste i initiativ-rekkefølgen. Ny runde når rekkefølgen starter på nytt.
 * Returnerer om det nå er karakterens egen tur.
 */
export function advanceTurn(c: CombatState): { ownTurn: boolean; newRound: boolean } {
  const order = initiativeOrder(c.combatants)
  if (!order.length) return { ownTurn: true, newRound: true }
  let idx = c.turnIdx
  let newRound = false
  for (let i = 0; i < order.length; i++) {
    idx += 1
    if (idx >= order.length) {
      idx = 0
      newRound = true
      c.round += 1
    }
    if (!order[idx].defeated) break
  }
  c.turnIdx = idx
  return { ownTurn: !!order[idx]?.self, newRound }
}

/** Bevegelse igjen denne turen (Dash gir like mye til) */
export function movementLeft(c: CombatState, speed: number): number {
  return Math.max(0, speed * (c.turn.dashed ? 2 : 1) - c.turn.movement)
}

/** Mekaniske effekter av vanlige buff-spells mens de varer (legges som midlertidige custom effects på arket) */
export const SPELL_BUFFS: Record<string, { effects: Effect[]; note?: string }> = {
  shield: { effects: [{ target: 'ac', op: 'add', value: 5 }], note: '+5 AC' },
  'shield-of-faith': { effects: [{ target: 'ac', op: 'add', value: 2 }], note: '+2 AC' },
  haste: { effects: [{ target: 'ac', op: 'add', value: 2 }, { target: 'save.dex', op: 'advantage' }], note: '+2 AC, advantage on DEX saves, double Speed, one extra limited action' },
  longstrider: { effects: [{ target: 'speed', op: 'add', value: 10 }], note: '+10 ft. Speed' },
  bless: { effects: [], note: '+1d4 to attack rolls and saving throws' },
  'blade-ward': { effects: [], note: 'attackers subtract 1d4 from attack rolls against you' }
}

/** Legg til en effekt; buff-spells får sine mekaniske effekter på arket så lenge effekten varer */
export function addEffect(c: CombatState, ch: Character, e: Omit<CombatEffect, 'uid'>): CombatEffect {
  const eff: CombatEffect = { uid: uidc(), ...e }
  const buff = e.spellId ? SPELL_BUFFS[e.spellId] : undefined
  if (buff) {
    eff.note = eff.note ?? buff.note
    eff.charEffects = buff.effects.map((x) => {
      const uid = `combat-${eff.uid}-${uidc()}`
      ch.customEffects.push({ ...x, uid, label: `${e.name} (${x.note ?? buff.note ?? 'combat'})`, active: true })
      return uid
    })
  }
  if (e.state && !ch.activeStates.includes(e.state)) ch.activeStates.push(e.state)
  c.effects.push(eff)
  return eff
}

/** Avslutt effekter (utløpt, fjernet, mistet concentration): rydder tilstander og midlertidige effekter */
export function endEffects(c: CombatState, ch: Character, pred: (e: CombatEffect) => boolean): CombatEffect[] {
  const gone = c.effects.filter(pred)
  if (!gone.length) return gone
  c.effects = c.effects.filter((e) => !pred(e))
  const uids = new Set(gone.flatMap((e) => e.charEffects ?? []))
  ch.customEffects = ch.customEffects.filter((x) => !uids.has(x.uid))
  const states = new Set(gone.map((e) => e.state).filter(Boolean))
  // Behold en tilstand hvis en annen aktiv effekt fortsatt gir den
  for (const e of c.effects) if (e.state) states.delete(e.state)
  ch.activeStates = ch.activeStates.filter((s) => !states.has(s))
  if (gone.some((e) => e.concentration)) c.concentration = undefined
  return gone
}

/** Mist/avslutt concentration: spellet og effektene det ga, slutter */
export function dropConcentration(c: CombatState, ch: Character): void {
  endEffects(c, ch, (e) => !!e.concentration)
  c.concentration = undefined
}

export function addLog(c: CombatState, kind: CombatState['log'][number]['kind'], text: string): void {
  c.log.unshift({ uid: uidc(), round: c.round, kind, text })
  if (c.log.length > 300) c.log.length = 300
}
