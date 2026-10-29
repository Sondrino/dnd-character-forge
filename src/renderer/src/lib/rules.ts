import type { Ability, Character, ClassDef, ClassOptionGroup, FeatDef, SpellDef } from '../types'
import type { Derived } from '../engine/compute'
import type { Lookup } from '../engine/lookup'

/** Regelkontroller (2024) som brukes både til advarsler (tips) og til å filtrere valg */

const ABILITY_BY_NAME: Record<string, Ability> = { strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha' }

/**
 * Multiclassing (PHB 2024): 13 i primary ability for både ny og nåværende classes.
 * Fighter krever STR eller DEX; Monk, Paladin og Ranger krever begge sine.
 */
export function meetsMulticlass(c: ClassDef, d: Derived): boolean {
  const ok = (a: Ability): boolean => d.abilities[a].score.value >= 13
  return c.id === 'fighter' ? c.primaryAbility.some(ok) : c.primaryAbility.every(ok)
}

/** Forutsetninger for et feat som ikke er oppfylt (tom liste = ok). Leser «Level 4+», «Strength or Dexterity 13+», «Heavy Armor Training», «Spellcasting Feature» … */
export function featPrereqProblems(f: FeatDef, d: Derived): string[] {
  const text = f.prerequisite ?? ''
  const out: string[] = []
  const lvl = Math.max(f.minLevel ?? 0, Number(/Level (\d+)\+/i.exec(text)?.[1] ?? 0), f.category === 'epicBoon' ? 19 : 0)
  if (lvl && d.totalLevel < lvl) out.push(`Level ${lvl}+`)
  const abil = /((?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)(?:(?:,\s*|\s+or\s+|\s+and\s+)(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma))*)\s+(\d+)\+/i.exec(text)
  if (abil) {
    const abs = abil[1].split(/,\s*|\s+or\s+|\s+and\s+/i).map((s) => ABILITY_BY_NAME[s.trim().toLowerCase()]).filter(Boolean)
    const need = Number(abil[2])
    const all = /\sand\s/i.test(abil[1])
    const ok = (a: Ability): boolean => d.abilities[a].score.value >= need
    if (!(all ? abs.every(ok) : abs.some(ok))) out.push(`${abil[1]} ${need}+`)
  }
  if (/spellcasting|pact magic/i.test(text) && !d.spellcasting.length && !d.pact) out.push('Spellcasting Feature')
  for (const [label, cat] of [['Heavy Armor Training', 'heavy'], ['Medium Armor Training', 'medium'], ['Light Armor Training', 'light'], ['Shield Training', 'shield']] as const)
    if (text.includes(label) && !d.proficiencies.armor.includes(cat)) out.push(label)
  if (/fighting style feature/i.test(text) && !d.features.some((x) => /fighting style/i.test(x.name))) out.push('Fighting Style Feature')
  return out
}

/** Feats fra class-levels du ikke lenger har (f.eks. etter å ha senket start-level i veiviseren) */
export function featsAboveLevel(char: Character): { uid: string; featId: string; source: string }[] {
  return char.feats.filter((f) => {
    const m = /^class:([^:]+):(\d+)/.exec(f.source)
    if (!m) return false
    const ce = char.classes.find((c) => c.classId === m[1])
    return !ce || Number(m[2]) > ce.level
  })
}

/* ------------------------------------------------------------------ */
/* Forutsetninger for class-alternativer (Eldritch Invocations o.l.)   */
/* ------------------------------------------------------------------ */

type OptionItem = ClassOptionGroup['items'][number]

/** Lest fra prerequisite-teksten, f.eks. «Level 5+ Warlock, Pact of the Blade Invocation» */
export interface OptionPrereq {
  level: number
  /** Class-navnet i «Level N+ Warlock» (små bokstaver) */
  classId?: string
  /** Andre alternativer som må være valgt: hver gruppe er «ett av» (Pact of the Blade/Chain) */
  options: { anyOf: string[]; label: string }[]
  /** 'damage' = en Warlock-cantrip som gjør skade; 'attack' = … som gjør skade via et Attack Roll */
  cantrip?: 'damage' | 'attack'
}

const slug = (s: string): string => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function parseOptionPrereq(text: string | undefined): OptionPrereq {
  const out: OptionPrereq = { level: 0, options: [] }
  for (const raw of (text ?? '').split(/,|;/)) {
    const part = raw.trim().replace(/\.$/, '')
    if (!part) continue
    const lvl = /^Level (\d+)\+(?:\s+([A-Za-z]+))?$/i.exec(part)
    if (lvl) {
      out.level = Math.max(out.level, Number(lvl[1]))
      if (lvl[2]) out.classId = lvl[2].toLowerCase()
      continue
    }
    if (/cantrip that deals damage/i.test(part)) {
      out.cantrip = /attack roll/i.test(part) ? 'attack' : 'damage'
      continue
    }
    // «Pact of the Blade/Chain/Tome», «Thirsting Blade Invocation», «Pact of the Chain or Tome Invocation»
    const name = part.replace(/^(?:the|an?)\s+/i, '').replace(/\s+Invocations?$/i, '').trim()
    const pact = /^Pact of the (.+)$/i.exec(name)
    if (pact) {
      const kinds = pact[1].split(/\s*\/\s*|\s+or\s+/i).filter(Boolean)
      out.options.push({ anyOf: kinds.map((k) => `pact-of-the-${slug(k)}`), label: `Pact of the ${kinds.join('/')}` })
    } else if (/invocations?$/i.test(part)) out.options.push({ anyOf: name.split(/\s+or\s+/i).map(slug), label: name })
  }
  return out
}

/** Valgte class-alternativer (invocations o.l.) – fra class-valg og fra feats (Eldritch Adept) */
export function chosenOptionIds(char: Character, L: Lookup): Set<string> {
  const known = new Set(L.classOptions.flatMap((g) => g.items.map((it) => it.id)))
  const out = new Set<string>()
  for (const [k, v] of Object.entries(char.choices ?? {})) if (k.endsWith('#option')) for (const x of v) out.add(x)
  for (const cf of char.feats ?? []) for (const v of Object.values(cf.choices ?? {})) for (const x of v) if (known.has(x)) out.add(x)
  return out
}

/**
 * Forutsetninger for et class-alternativ som ikke er oppfylt (tom liste = ok): class-level,
 * andre invocations (Pact of the Blade, Thirsting Blade …) og «a Warlock Cantrip That Deals Damage».
 */
export function optionPrereqProblems(item: OptionItem, groupClassId: string, char: Character, L: Lookup, chosen: Set<string> = chosenOptionIds(char, L)): string[] {
  const p = parseOptionPrereq(item.prerequisite)
  const out: string[] = []
  const classId = p.classId && L.get('class', p.classId) ? p.classId : groupClassId
  const lvl = (char.classes ?? []).find((c) => c.classId === classId)?.level ?? 0
  if (p.level && lvl < p.level) out.push(`Level ${p.level}+ ${L.get('class', classId)?.name ?? classId}`)
  for (const g of p.options) if (!g.anyOf.some((id) => id !== item.id && chosen.has(id))) out.push(g.label)
  if (p.cantrip) {
    const ok = (char.spells ?? []).some((cs) => {
      const sp = L.get('spell', cs.spellId) as SpellDef | undefined
      if (!sp || sp.level !== 0 || !sp.damage) return false
      if (cs.source !== groupClassId && !sp.classes.includes(groupClassId)) return false
      return p.cantrip === 'attack' ? !!sp.attack : true
    })
    if (!ok) out.push(p.cantrip === 'attack' ? 'a Warlock cantrip that deals damage via an attack roll' : 'a Warlock cantrip that deals damage')
  }
  return out
}
