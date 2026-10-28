import type { Character, CombatState, SpellDef } from '../../types'
import type { DerivedAttack, DerivedFeature, Derived } from '../../engine/compute'
import type { Lookup } from '../../engine/lookup'
import { useChar, type CharCtxValue } from '../sheet/context'
import { AT_WILL_INVOCATIONS, attacksPerAction, castingKind, featureGrantedSpells } from '../../lib/combat'

export interface CombatCtx extends CharCtxValue {
  c: CombatState
  physical: boolean
  /** Endre kamptilstanden (og ev. karakteren) i én operasjon */
  mut: (recipe: (c: CombatState, ch: Character) => void) => void
}

export function useCombat(): CombatCtx {
  const ctx = useChar()
  const c = ctx.char.combat!
  const mut = (recipe: (c: CombatState, ch: Character) => void): void =>
    ctx.update((ch) => {
      if (ch.combat) recipe(ch.combat, ch)
    })
  return { ...ctx, c, physical: c.dice === 'physical', mut }
}

export const signed = (n: number): string => (n >= 0 ? `+${n}` : `${n}`)

export type Economy = 'action' | 'bonus' | 'reaction' | 'free'

/** Standardhandlinger i 2024-reglene (beskrivelser hentes fra Rules Glossary: rule-<id>) */
export const STD_ACTIONS: { id: string; economy: Economy }[] = [
  { id: 'dash', economy: 'action' },
  { id: 'disengage', economy: 'action' },
  { id: 'dodge', economy: 'action' },
  { id: 'help', economy: 'action' },
  { id: 'hide', economy: 'action' },
  { id: 'influence', economy: 'action' },
  { id: 'magic', economy: 'action' },
  { id: 'ready', economy: 'action' },
  { id: 'search', economy: 'action' },
  { id: 'study', economy: 'action' },
  { id: 'utilize', economy: 'action' },
  { id: 'grapple', economy: 'action' },
  { id: 'shove', economy: 'action' }
]

export type CombatOption =
  | { kind: 'attack'; key: string; attack?: DerivedAttack; via: Economy; offhand?: boolean }
  | { kind: 'spell'; key: string; spell: SpellDef; source: string }
  | { kind: 'feature'; key: string; feature: DerivedFeature }
  | { kind: 'std'; key: string; id: string; economy: Economy }

export interface OptionGroups {
  action: CombatOption[]
  bonus: CombatOption[]
  reaction: CombatOption[]
  other: CombatOption[]
  attacksPerAction: number
}

/** Alt karakteren kan gjøre i kamp, gruppert etter handlingstype */
export function combatOptions(char: Character, d: Derived, L: Lookup): OptionGroups {
  const g: OptionGroups = { action: [], bonus: [], reaction: [], other: [], attacksPerAction: attacksPerAction(d.features.map((f) => f.name)) }
  // Våpen og Unarmed Strike i Attack-handlingen
  for (const a of d.attacks.filter((x) => x.kind !== 'spell')) g.action.push({ kind: 'attack', key: `atk:${a.key}`, attack: a, via: 'action' })
  // Ekstra-angrep (Light): etter et angrep med et Light-våpen i Attack-handlingen, med et annet Light-våpen.
  // Dual Wielder: det andre våpenet kan være et hvilket som helst nærkampvåpen uten Two-Handed.
  const weapons = d.attacks.filter((a) => a.kind === 'weapon')
  const light = weapons.filter((a) => a.properties.includes('light'))
  const dualWielder = char.feats.some((f) => f.featId === 'dual-wielder')
  const isMelee = (a: (typeof weapons)[number]): boolean => (L.get('weapon', a.refId ?? '') as { weaponType?: string } | undefined)?.weaponType !== 'ranged'
  const second = dualWielder ? weapons.filter((a) => isMelee(a) && !a.properties.includes('two-handed')) : light
  if (light.length && second.length >= 2) for (const a of second) g.bonus.push({ kind: 'attack', key: `off:${a.key}`, attack: a, via: 'bonus', offhand: true })
  // Spells
  const seen = new Set<string>()
  for (const cs of char.spells) {
    const sp = L.get('spell', cs.spellId) as SpellDef | undefined
    if (!sp || seen.has(sp.id)) continue
    if (sp.level > 0 && !cs.prepared && !cs.alwaysPrepared) continue
    seen.add(sp.id)
    const k = castingKind(sp.castingTime)
    const opt: CombatOption = { kind: 'spell', key: `sp:${sp.id}`, spell: sp, source: cs.source }
    if (k === 'long') g.other.push(opt)
    else g[k].push(opt)
  }
  // Spells som features lar deg kaste gratis (Hunter’s Mark, invocations «at will» …)
  for (const id of featureGrantedSpells(d)) {
    const sp = L.get('spell', id) as SpellDef | undefined
    if (!sp || seen.has(sp.id)) continue
    seen.add(sp.id)
    const k = castingKind(sp.castingTime)
    const opt: CombatOption = { kind: 'spell', key: `sp:${sp.id}`, spell: sp, source: 'feature' }
    if (k === 'long') g.other.push(opt)
    else g[k].push(opt)
  }
  // Features med handlingstype eller begrensede bruk
  for (const f of d.features) {
    // Invocations som bare gir et gratis spell vises som spellet
    if (f.key.startsWith('option:') && AT_WILL_INVOCATIONS[f.key.slice(7)]) continue
    const a = f.activation
    const opt: CombatOption = { kind: 'feature', key: `ft:${f.key}`, feature: f }
    if (a === 'action' || a === 'bonus' || a === 'reaction') g[a].push(opt)
    else if (f.uses || f.roll || f.toggle) g.other.push(opt)
  }
  // Standardhandlinger + Opportunity Attack
  for (const s of STD_ACTIONS) g.action.push({ kind: 'std', key: `std:${s.id}`, id: s.id, economy: s.economy })
  g.reaction.unshift({ kind: 'attack', key: 'opportunity', via: 'reaction' })
  const order = (o: CombatOption): number => (o.kind === 'attack' ? 0 : o.kind === 'feature' ? 1 : o.kind === 'spell' ? 2 + o.spell.level / 10 : 3)
  for (const k of ['action', 'bonus', 'reaction', 'other'] as const) g[k].sort((a, b) => order(a) - order(b))
  return g
}

/** Effekt-tilstander (f.eks. 'raging') som en feature slår på, lest fra effects med betingelse */
export function featureStates(d: Derived, f: DerivedFeature): string[] {
  const states = d.effects
    .filter((e) => e.effect.condition && (e.source.endsWith(`: ${f.name}`) || e.source === f.name))
    .map((e) => e.effect.condition!)
    .filter((c) => !/^(no|armored|shield|vs|wearing|unarmored|onehanded|mageArmor)/i.test(c))
  return [...new Set(states)]
}

/** Klassekolonne på nåværende nivå, f.eks. 'Sneak Attack' → '3d6' eller 'Rage Damage' → 2 */
export function classColumn(char: Character, L: Lookup, classId: string, column: string): string | number | undefined {
  const ce = char.classes.find((x) => x.classId === classId)
  if (!ce) return undefined
  const def = L.get('class', classId)
  return def?.table.find((r) => r.level === ce.level)?.columns?.[column]
}
