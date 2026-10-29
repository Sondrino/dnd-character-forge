import type { Character, CombatEffect, CombatState, CombatTurn, Combatant, Effect, FeatDef, SpellDef } from '../types'
import type { Derived } from '../engine/compute'
import type { Lookup } from '../engine/lookup'
import { evalFormula, type FormulaContext } from '../engine/formula'

/** Ren kamplogikk (ingen React) – brukt av kampmodus og testet i tests/combat.test.ts */

export const uidc = (): string => Math.random().toString(36).slice(2, 10)

export function freshTurn(): CombatTurn {
  return { action: false, bonus: false, reaction: false, movement: 0, attacks: 0, slotUsed: false, dashed: false, interaction: false, lightUsed: undefined, offhandDone: false }
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

/**
 * Ekstra per slot-nivå over spellets nivå, lest fra «Using a Higher-Level Spell Slot»:
 * terninger («1d6 for each …») eller faste tall («increases by 10 for each …», «5 additional Temporary Hit Points for each …»)
 */
export function upcastPerLevel(sp: Pick<SpellDef, 'higherLevels'>): string | undefined {
  const m = sp.higherLevels?.match(/(\d+(?:d\d+)?)\s+(?:additional\s+)?(?:temporary hit points\s+)?for each (?:spell )?slot level above/i)
  return m?.[1]
}

/** Legg sammen terningsuttrykk: «8d6» + 2×«1d6» = «10d6»; ulike terninger blir «8d6+2d8»; faste tall legges til konstanten */
export function addDice(base: string, extra: string | undefined, times: number): string {
  if (!extra || times <= 0) return base
  if (/^\d+$/.test(extra)) {
    const add = Number(extra) * times
    if (/^\d+$/.test(base)) return String(Number(base) + add)
    const cm = base.match(/([+-])(\d+)$/)
    if (cm) {
      const v = (cm[1] === '-' ? -1 : 1) * Number(cm[2]) + add
      return base.slice(0, -cm[0].length) + (v >= 0 ? `+${v}` : `${v}`)
    }
    return `${base}+${add}`
  }
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

/** Temp HP fra et spell: «2d4+4» med oppskalering, «spellcasting modifier» → modifieren */
export function spellTempDice(sp: SpellDef, slotLevel: number, mod: number): string | undefined {
  if (!sp.tempHp) return undefined
  const h = sp.tempHp.replace(/(your )?spellcasting (ability )?modifier/i, String(Math.max(1, mod))).replace(/\s+/g, '')
  return addDice(h, upcastPerLevel(sp), slotLevel - sp.level)
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
  const gone = endEffects(c, ch, (e) => e.rounds !== undefined && e.rounds <= 0)
  // Heroism o.l.: temp HP i starten av turen (temp HP stables ikke – høyeste gjelder)
  for (const e of c.effects) if (e.tempEachTurn) ch.hp.temp = Math.max(ch.hp.temp, e.tempEachTurn)
  return gone
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

/**
 * Ekstra-angrep med Light-våpen (2024): bare etter at du har angrepet med et Light-våpen i Attack-handlingen
 * denne turen, og med et annet våpen. Returnerer grunnen hvis det ikke er lov.
 */
export function offhandBlocked(c: CombatState, attackKey: string): 'noLight' | 'sameWeapon' | 'done' | null {
  if (c.turn.offhandDone) return 'done'
  if (!c.turn.lightUsed) return 'noLight'
  if (c.turn.lightUsed === attackKey) return 'sameWeapon'
  return null
}

/** Bevegelse igjen denne turen (Dash gir like mye til) */
export function movementLeft(c: CombatState, speed: number): number {
  return Math.max(0, speed * (c.turn.dashed ? 2 : 1) - c.turn.movement)
}

/** Mekaniske effekter av vanlige buff-spells mens de varer (legges som midlertidige custom effects på arket) */
export const SPELL_BUFFS: Record<string, { effects: Effect[] | ((slot: number) => Effect[]); note?: string }> = {
  aid: { effects: (slot) => [{ target: 'hp.max', op: 'add', value: 5 * (slot - 1) }], note: '+HP max' },
  shield: { effects: [{ target: 'ac', op: 'add', value: 5 }], note: '+5 AC' },
  'shield-of-faith': { effects: [{ target: 'ac', op: 'add', value: 2 }], note: '+2 AC' },
  haste: { effects: [{ target: 'ac', op: 'add', value: 2 }, { target: 'save.dex', op: 'advantage' }], note: '+2 AC, advantage on DEX saves, double Speed, one extra limited action' },
  longstrider: { effects: [{ target: 'speed', op: 'add', value: 10 }], note: '+10 ft. Speed' },
  bless: { effects: [], note: '+1d4 to attack rolls and saving throws' },
  'blade-ward': { effects: [], note: 'attackers subtract 1d4 from attack rolls against you' }
}

/**
 * Hvor effekter og concentration ligger: kampen (CombatState) under en kamp, ellers karakteren selv
 * (Character.effects / Character.concentration) – så spells kastet før/etter en kamp varer.
 */
export interface EffectHolder {
  effects?: CombatEffect[]
  concentration?: { name: string; spellId?: string }
}

/** Legg til en effekt; buff-spells får sine mekaniske effekter på arket så lenge effekten varer */
export function addEffect(c: EffectHolder, ch: Character, e: Omit<CombatEffect, 'uid'>, slotLevel = 1): CombatEffect {
  const eff: CombatEffect = { uid: uidc(), ...e }
  const buff = e.spellId ? SPELL_BUFFS[e.spellId] : undefined
  if (buff) {
    eff.note = eff.note ?? buff.note
    const list = typeof buff.effects === 'function' ? buff.effects(slotLevel) : buff.effects
    eff.charEffects = list.map((x) => {
      const uid = `combat-${eff.uid}-${uidc()}`
      ch.customEffects.push({ ...x, uid, label: `${e.name} (${x.note ?? buff.note ?? 'combat'})`, active: true })
      return uid
    })
  }
  if (e.state && !ch.activeStates.includes(e.state)) ch.activeStates.push(e.state)
  ;(c.effects ??= []).push(eff)
  return eff
}

/** Avslutt effekter (utløpt, fjernet, mistet concentration): rydder tilstander og midlertidige effekter */
export function endEffects(c: EffectHolder, ch: Character, pred: (e: CombatEffect) => boolean): CombatEffect[] {
  const all = c.effects ?? []
  const gone = all.filter(pred)
  if (!gone.length) return gone
  c.effects = all.filter((e) => !pred(e))
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
export function dropConcentration(c: EffectHolder, ch: Character): void {
  endEffects(c, ch, (e) => !!e.concentration)
  c.concentration = undefined
}

/* ------------------------------------------------------------------ */
/* Effekter og concentration utenfor kamp                              */
/* ------------------------------------------------------------------ */

/** Runder per minutt / time (1 runde = 6 sekunder) */
export const ROUNDS_PER_MINUTE = 10
export const ROUNDS_PER_HOUR = 600

/** Tiden går utenfor kamp: effekter teller ned `rounds` runder, utløpte avsluttes og returneres */
export function tickEffects(h: EffectHolder, ch: Character, rounds: number): CombatEffect[] {
  for (const e of h.effects ?? []) if (e.rounds !== undefined) e.rounds -= rounds
  return endEffects(h, ch, (e) => e.rounds !== undefined && e.rounds <= 0)
}

/** Kampstart: effekter og concentration fra karakteren flyttes inn i kampen */
export function pickUpEffects(c: CombatState, ch: Character): void {
  if (ch.effects?.length) c.effects.push(...ch.effects)
  if (ch.concentration) c.concentration = { name: ch.concentration.name, spellId: ch.concentration.spellId, since: c.round }
  ch.effects = []
  ch.concentration = undefined
}

/** Varer effekten etter kampen? Spells/concentration med mer enn én runde igjen (Shield, Dodge, Rage, Hidden … slutter) */
export function lastsBeyondCombat(e: CombatEffect): boolean {
  return !!(e.spellId || e.concentration) && (e.rounds === undefined || e.rounds > 1)
}

/** Kampslutt: kortvarige kampeffekter slutter, varige effekter og concentration flyttes tilbake til karakteren */
export function handBackEffects(c: CombatState, ch: Character, now = new Date().toISOString()): CombatEffect[] {
  const ended = endEffects(c, ch, (e) => !lastsBeyondCombat(e))
  ch.effects = [...(ch.effects ?? []), ...c.effects]
  if (c.concentration) ch.concentration = { name: c.concentration.name, spellId: c.concentration.spellId, since: now }
  c.effects = []
  c.concentration = undefined
  return ended
}

/**
 * Midlertidig kamptilstand utenfor kamp, bygget rundt karakterens egne effekter og concentration,
 * slik at spell-/feature-flytene fra kampmodus kan brukes fra arket. Skriv tilbake med settleVirtualCombat.
 */
export function virtualCombat(ch: Character, dice: CombatState['dice'] = 'app'): CombatState {
  const c = newCombat(dice, { uid: 'self', name: ch.name || 'You', init: 0, self: true })
  c.round = 0
  c.effects = ch.effects ?? []
  if (ch.concentration) c.concentration = { name: ch.concentration.name, spellId: ch.concentration.spellId, since: 0 }
  return c
}

/** Skriv effekter og concentration fra en midlertidig kamptilstand tilbake til karakteren */
export function settleVirtualCombat(c: CombatState, ch: Character, now = new Date().toISOString()): void {
  ch.effects = c.effects
  const prev = ch.concentration
  ch.concentration = c.concentration
    ? { name: c.concentration.name, spellId: c.concentration.spellId, since: prev && prev.name === c.concentration.name && prev.since ? prev.since : now }
    : undefined
}

/** Advantage/Disadvantage fra en beregnet verdi: begge = vanlig kast (2024) */
export function rollModeOf(s?: { advantage?: string[]; disadvantage?: string[] } | null): { mode: 'normal' | 'advantage' | 'disadvantage'; why: string[] } {
  const adv = s?.advantage ?? []
  const dis = s?.disadvantage ?? []
  if (adv.length && dis.length) return { mode: 'normal', why: [...adv, ...dis] }
  if (adv.length) return { mode: 'advantage', why: adv }
  if (dis.length) return { mode: 'disadvantage', why: dis }
  return { mode: 'normal', why: [] }
}

/* ------------------------------------------------------------------ */
/* Gratis-kast (uten spell slot)                                       */
/* ------------------------------------------------------------------ */

/** Invocations som lar deg kaste et spell «at will» uten slot (2024) */
export const AT_WILL_INVOCATIONS: Record<string, string> = {
  'armor-of-shadows': 'mage-armor',
  'ascendant-step': 'levitate',
  'fiendish-vigor': 'false-life',
  'mask-of-many-faces': 'disguise-self',
  'master-of-myriad-forms': 'alter-self',
  'misty-visions': 'silent-image',
  'one-with-shadows': 'invisibility',
  'otherworldly-leap': 'jump',
  'visions-of-distant-realms': 'arcane-eye',
  'whispers-of-the-grave': 'speak-with-dead',
  'pact-of-the-chain': 'find-familiar'
}

/** Class features som gir gratis-kast ved å bruke featurens (eller en annen features) bruk */
const FEATURE_FREE: { name: RegExp; spell?: string; match?: (sp: SpellDef, ch: Character) => boolean; usesFrom?: RegExp }[] = [
  { name: /^favored enemy$/i, spell: 'hunters-mark' },
  { name: /^paladin['’]s smite$/i, spell: 'divine-smite' },
  { name: /^faithful steed$/i, spell: 'find-steed' },
  { name: /^wild companion$/i, spell: 'find-familiar', usesFrom: /^wild shape$/i },
  { name: /^divine intervention$/i, match: (sp) => sp.classes.includes('cleric') && sp.level <= 5 },
  { name: /^natural recovery$/i, match: (sp, ch) => ch.spells.some((s) => s.spellId === sp.id && s.alwaysPrepared && s.source === 'druid') }
]

export interface FreeCast {
  id: string
  label: string
  /** null = ubegrenset (at will) */
  left: number | null
  max: number | null
  /** featureUses-nøkkel som telles opp når kastet brukes */
  useKey?: string
}

/** Alle måter å kaste et spell på uten å bruke en spell slot */
export function freeCasts(ch: Character, d: Derived, L: Lookup, sp: SpellDef): FreeCast[] {
  const out: FreeCast[] = []
  if (sp.level === 0) return out
  const feature = (re: RegExp) => d.features.find((f) => re.test(f.name))
  // Invocations «at will»
  for (const [inv, spellId] of Object.entries(AT_WILL_INVOCATIONS)) {
    if (spellId !== sp.id) continue
    const f = d.features.find((x) => x.key === `option:${inv}`)
    if (f) out.push({ id: `atwill:${inv}`, label: f.name, left: null, max: null })
  }
  // Class features
  for (const r of FEATURE_FREE) {
    const f = feature(r.name)
    if (!f) continue
    if (r.spell ? r.spell !== sp.id : !r.match?.(sp, ch)) continue
    const src = r.usesFrom ? feature(r.usesFrom) : f
    if (!src?.uses) continue
    out.push({ id: `feature:${src.key}`, label: r.usesFrom ? `${f.name} (${src.name})` : f.name, left: src.uses.max - src.uses.used, max: src.uses.max, useKey: src.key })
  }
  // Spells fra feats (Magic Initiate, Fey Touched …), species og Mystic Arcanum: 1 gang per long rest
  const once = (key: string, label: string): void => {
    if (out.some((o) => o.useKey === key)) return
    const used = ch.featureUses?.[key] ?? 0
    out.push({ id: key, label, left: Math.max(0, 1 - used), max: 1, useKey: key })
  }
  for (const cs of ch.spells.filter((s) => s.spellId === sp.id)) {
    if (cs.source.startsWith('feat:')) {
      const cf = ch.feats.find((f) => `feat:${f.uid}` === cs.source)
      const fd = L.get('feat', cf?.featId ?? '') as FeatDef | undefined
      if (fd && fd.id !== 'ritual-caster') once(`free:${cs.source}:${sp.id}`, fd.name)
    } else if (cs.source === 'species') {
      once(`free:species:${sp.id}`, L.get('species', ch.speciesId)?.name ?? 'Species')
    } else if (cs.source === 'warlock' && d.pact && sp.level > d.pact.level) {
      once(`free:arcanum:${sp.level}`, `Mystic Arcanum (${sp.level})`)
    }
  }
  return out
}

/** Spells som features gir gratis-kast av, men som ikke nødvendigvis står i spell-lista (Hunter’s Mark, invocations …) */
export function featureGrantedSpells(d: Derived): string[] {
  const ids = new Set<string>()
  for (const [inv, spellId] of Object.entries(AT_WILL_INVOCATIONS)) if (d.features.some((f) => f.key === `option:${inv}`)) ids.add(spellId)
  for (const r of FEATURE_FREE) if (r.spell && d.features.some((f) => r.name.test(f.name))) ids.add(r.spell)
  return [...ids]
}

export function addLog(c: CombatState, kind: CombatState['log'][number]['kind'], text: string): void {
  c.log.unshift({ uid: uidc(), round: c.round, kind, text })
  if (c.log.length > 300) c.log.length = 300
}

/* ------------------------------------------------------------------ */
/* Formler i egne evner                                                */
/* ------------------------------------------------------------------ */

/** Formel-kontekst fra en beregnet karakter */
export function formulaCtx(d: Derived): FormulaContext {
  const mods = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } as FormulaContext['mods']
  for (const ab of Object.keys(mods) as (keyof typeof mods)[]) mods[ab] = d.abilities[ab].mod
  return { mods, pb: d.pb.value, level: d.totalLevel, totalLevel: d.totalLevel }
}

/** Regn ut en tallformel (f.eks. '8+prof+mod.con'); null hvis ugyldig */
export function evalAbility(expr: string | undefined, d: Derived): number | null {
  return evalFormula(expr?.trim() || undefined, formulaCtx(d))
}

/** Terninger med formler: '2d6+mod.cha' → '2d6+3', '1d8+level' → '1d8+5' */
export function resolveDice(dice: string, d: Derived): string {
  const ctx = formulaCtx(d)
  const num = (n: number): string => `(${n})`
  let s = dice.toLowerCase().replace(/\s+/g, '')
  s = s.replace(/mod\.(str|dex|con|int|wis|cha)/g, (_m, a: keyof FormulaContext['mods']) => num(ctx.mods[a]))
  s = s.replace(/\b(proficiency|prof|pb)\b/g, num(ctx.pb))
  s = s.replace(/\b(totallevel|level)\b/g, num(ctx.level))
  // Fjern parenteser rundt tall og rydd fortegn: «+(-1)» → «-1»
  s = s.replace(/\(([+-]?\d+)\)/g, '$1').replace(/\+-/g, '-').replace(/--/g, '+').replace(/\+\+/g, '+')
  // Slå sammen konstanter: «2d6+3+2» → «2d6+5»
  const parts = s.match(/[+-]?[^+-]+/g) ?? []
  const dicePart: string[] = []
  let k = 0
  for (const p of parts) {
    const sign = p.startsWith('-') ? -1 : 1
    const body = p.replace(/^[+-]/, '').replace(/[()]/g, '')
    if (/^\d*d\d+$/.test(body)) dicePart.push(`${sign < 0 ? '-' : dicePart.length ? '+' : ''}${body}`)
    else if (/^-?\d+$/.test(body)) k += sign * Number(body)
    else return dice
  }
  const out = dicePart.join('') + (k ? (k > 0 ? (dicePart.length ? `+${k}` : `${k}`) : `${k}`) : '')
  return out || '0'
}
