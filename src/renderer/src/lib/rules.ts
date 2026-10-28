import type { Ability, Character, ClassDef, FeatDef } from '../types'
import type { Derived } from '../engine/compute'

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
