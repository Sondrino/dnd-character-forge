import type {
  Ability, AnyEntity, ArmorCategory, ArmorDef, Character, ClassDef, Effect, Feature, FeatDef, MagicItemDef,
  SkillId, SpellDef, SubclassDef, Uses, WeaponDef
} from '../types'
import { ABILITIES } from '../types'
import { skills as SKILLS, skillById } from '../data/skills'
import type { Lookup } from './lookup'
import { abilityMod, averageHitDie, MULTICLASS_PROFS, PACT_SLOTS, proficiencyBonus, signed, SPELL_SLOTS, SUBCLASS_SPELLCASTING } from './tables'
import { evalFormula, type FormulaContext } from './formula'
import { qtyDivisor } from '../lib/items'

/* ------------------------------------------------------------------ */
/* Typer for beregnet ark                                              */
/* ------------------------------------------------------------------ */

export interface Stat {
  value: number
  computed: number
  overridden: boolean
  breakdown: string[]
  advantage?: string[]
  disadvantage?: string[]
}

export interface DerivedFeature {
  key: string
  id: string
  name: string
  source: string
  sourceType: 'class' | 'subclass' | 'species' | 'feat' | 'background' | 'custom' | 'item' | 'option'
  level?: number
  summary: string
  description: string
  activation?: Feature['activation']
  uses?: { max: number; used: number; recharge: Uses['recharge'] }
  roll?: Feature['roll']
  toggle?: string
  duration?: number
  entityKind?: string
  entityId?: string
}

export interface DerivedAttack {
  /** Skade for ekstra-angrepet med Light-våpen: uten positiv ability-modifier, men med magisk bonus */
  offhandDamage?: string
  key: string
  name: string
  kind: 'weapon' | 'unarmed' | 'spell'
  bonus: Stat | null
  save?: { ability: Ability; dc: number }
  damage: string
  damageType: string
  properties: string[]
  range: string
  mastery?: string
  masteryActive: boolean
  proficient: boolean
  notes: string[]
  refId?: string
  inventoryUid?: string
}

export interface DerivedSpellcasting {
  classId: string
  className: string
  ability: Ability
  mod: number
  dc: Stat
  attack: Stat
  preparedMax: number
  cantripsMax: number
  preparedCount: number
  cantripCount: number
  spellList: string
  maxSpellLevel: number
}

export interface PendingChoice {
  key: string
  label: string
  /** Hvor i appen dette løses */
  area: 'class' | 'species' | 'background' | 'abilities' | 'feats' | 'spells' | 'equipment' | 'details' | 'skills'
  type: string
  count: number
  chosen: number
  options?: string[]
  filter?: string
  source: string
}

export interface Derived {
  totalLevel: number
  classLabel: string
  pb: Stat
  abilities: Record<Ability, { score: Stat; mod: number }>
  /** Ability checks uten skill (f.eks. Strength check): mod + check-effekter + Exhaustion */
  checks: Record<Ability, Stat>
  /** Exhaustion-nivå 0–6 (6 = død) */
  exhaustion: number
  saves: Record<Ability, Stat & { proficient: boolean }>
  skills: Record<SkillId, Stat & { proficient: boolean; expertise: boolean; ability: Ability }>
  passive: { perception: Stat; insight: Stat; investigation: Stat }
  initiative: Stat
  ac: Stat
  speed: Stat & { fly?: number; swim?: number; climb?: number; burrow?: number }
  hpMax: Stat
  hitDice: { die: number; total: number; used: number }[]
  spellcasting: DerivedSpellcasting[]
  slots: { level: number; max: number; used: number }[]
  pact: { count: number; level: number; used: number } | null
  attacks: DerivedAttack[]
  features: DerivedFeature[]
  proficiencies: { armor: ArmorCategory[]; weapons: string[]; tools: string[]; languages: string[] }
  resistances: string[]
  immunities: string[]
  vulnerabilities: string[]
  conditionImmunities: string[]
  senses: string[]
  darkvision: number
  size: string
  carry: { weight: number; capacity: number; dragLift: number }
  weaponMasteryMax: number
  /** Spellcasting for spells fra feats/species (Magic Initiate, lineages): kilde → evne, DC og angrep */
  spellSources: Record<string, { ability: Ability; mod: number; dc: number; attack: number }>
  attunedCount: number
  armorWorn?: ArmorDef
  shieldWorn: boolean
  armorNotProficient: boolean
  strengthTooLow: boolean
  stealthDisadvantage: boolean
  /** Uløste valg */
  pending: PendingChoice[]
  /** Alle valg (også de som er tatt) – brukes for å endre valg senere */
  choices: PendingChoice[]
  effects: { source: string; effect: Effect; classLevel?: number }[]
  /** Effektive (ikke-overstyrte) feats */
  feats: { uid: string; def?: FeatDef; source: string }[]
}

/* ------------------------------------------------------------------ */

function stat(value: number, breakdown: string[] = []): Stat {
  return { value, computed: value, overridden: false, breakdown }
}

const normCond = (c: string): string => c.toLowerCase().replace(/[^a-z]/g, '')

interface EffectCtx {
  /** Dueling: nøyaktig ett utstyrt våpen, et enhånds nærkampvåpen */
  oneHandedMelee: boolean
  armor: boolean
  heavy: boolean
  shield: boolean
  states: Set<string>
}

function conditionActive(cond: string | undefined, ctx: EffectCtx): boolean {
  if (!cond) return true
  const c = normCond(cond)
  switch (c) {
    case 'noarmor':
    case 'unarmored':
    case 'notwearingarmor':
      return !ctx.armor
    case 'noshield':
      return !ctx.shield
    case 'noarmornoshield':
    case 'noarmorandnoshield':
    case 'noarmororshield':
    case 'unarmoredandnoshield':
      return !ctx.armor && !ctx.shield
    case 'armored':
    case 'wearingarmor':
    case 'armor':
      return ctx.armor
    case 'noheavyarmor':
    case 'notheavyarmor':
      return !ctx.heavy
    case 'shield':
    case 'wieldingshield':
      return ctx.shield
    case 'onehandedmeleeonly':
    case 'onehandedmelee':
      return ctx.oneHandedMelee
    default:
      // Situasjonsbetingede fordeler ("vsPoisoned") vises alltid, med notat
      if (c.startsWith('vs')) return true
      return ctx.states.has(c) || ctx.states.has(cond)
  }
}

/** Nøkler i char.choices har formen '<kilde>#<type>' */
export function choiceKey(source: string, choiceId: string, type: string): string {
  return `${source}:${choiceId}#${type}`
}

function valuesOfType(char: Character, type: string): string[] {
  const out: string[] = []
  for (const [k, v] of Object.entries(char.choices ?? {})) {
    if (k.endsWith(`#${type}`)) out.push(...v)
  }
  return out
}

const isSkill = (s: string): s is SkillId => s in skillById

/* ------------------------------------------------------------------ */

export function computeCharacter(char: Character, baseLookup: Lookup): Derived {
  const L = baseLookup.extend(char.customEntities ?? [])
  const effects: { source: string; effect: Effect; classLevel?: number }[] = []
  const features: DerivedFeature[] = []
  const ov = char.overrides ?? {}
  const adjMap = char.adjustments ?? {}
  const adj = (key: string): number => (typeof adjMap[key] === 'number' ? adjMap[key] : 0)
  // Valg registreres alltid; pending = de som ikke er fullført
  const allChoices: PendingChoice[] = []
  const choice = (c: PendingChoice): void => void allChoices.push(c)
  const masteryFromChoices = new Map<string, number>()
  let masteryFromFeats = 0

  /* ---------- Classes ---------- */
  const classEntries = (char.classes ?? [])
    .map((ce) => ({ ce, def: L.get('class', ce.classId), sub: L.get('subclass', ce.subclassId) }))
    .filter((x): x is { ce: typeof x.ce; def: ClassDef; sub: SubclassDef | undefined } => !!x.def)
  const totalLevel = Math.max(1, classEntries.reduce((s, x) => s + x.ce.level, 0) || 1)
  const pbComputed = proficiencyBonus(totalLevel)
  const pb = stat(pbComputed, [`Level ${totalLevel}: ${signed(pbComputed)}`])
  {
    const a = adj('pb')
    if (a) {
      pb.value += a
      pb.computed += a
      pb.breakdown.push(`Custom: ${signed(a)}`)
    }
  }
  if (typeof ov['pb'] === 'number') Object.assign(pb, { value: ov['pb'], overridden: true })
  const P = pb.value
  // Exhaustion (2024): hver D20 Test (ability check, attack roll, saving throw) får −2 per nivå
  const exhaustionLevel = Math.max(0, Math.min(6, Number(char.exhaustion) || 0))
  const exhaustionPenalty = (bd: string[]): number => {
    if (!exhaustionLevel) return 0
    bd.push(`Exhaustion ${exhaustionLevel}: ${signed(-2 * exhaustionLevel)}`)
    return -2 * exhaustionLevel
  }

  const species = L.get('species', char.speciesId)
  const speciesOpt = species?.options?.choices.find((o) => o.id === char.speciesOptionId)
  const background = L.get('background', char.backgroundId)

  /* ---------- Inventory / armor ---------- */
  type ResolvedItem = { item: Character['inventory'][number]; def?: AnyEntity; base?: AnyEntity; magic?: MagicItemDef }
  const resolved: ResolvedItem[] = (char.inventory ?? []).map((item) => {
    const def = L.item(item.refId)
    const magic = def?.kind === 'magicItem' ? (def as MagicItemDef) : undefined
    const base = magic ? L.item(item.baseId) : def
    return { item, def, base, magic }
  })
  const wornArmor = resolved.find((r) => r.item.equipped && r.base?.kind === 'armor' && (r.base as ArmorDef).category !== 'shield')
  const wornShield = resolved.find((r) => r.item.equipped && r.base?.kind === 'armor' && (r.base as ArmorDef).category === 'shield')
  const armorDef = wornArmor?.base as ArmorDef | undefined
  const ectx: EffectCtx = {
    oneHandedMelee: false,
    armor: !!armorDef,
    heavy: armorDef?.category === 'heavy',
    shield: !!wornShield,
    states: new Set([...(char.activeStates ?? []), ...(char.activeStates ?? []).map(normCond)])
  }
  {
    // Dueling: nøyaktig ett utstyrt våpen, og det er et nærkampvåpen uten Two-Handed
    const eqWeapons = resolved.filter((r) => r.item.equipped && r.base?.kind === 'weapon').map((r) => r.base as WeaponDef)
    if (eqWeapons.length === 1 && eqWeapons[0].weaponType === 'melee' && !eqWeapons[0].properties.includes('two-handed'))
      ectx.oneHandedMelee = true
  }

  /** classLevel: nivå i classen effekten kommer fra (hp.perLevel teller da class-nivå, f.eks. Draconic Resilience) */
  const addEffects = (list: Effect[] | undefined, source: string, classLevel?: number): void => {
    for (const e of list ?? []) effects.push({ source, effect: e, classLevel })
  }

  /* ---------- Features ---------- */
  const featureChoices: { feature: Feature; source: string; keyBase: string; area: PendingChoice['area']; columns?: Record<string, string | number> }[] = []

  classEntries.forEach(({ ce, def, sub }, idx) => {
    const row = def.table?.find((r) => r.level === ce.level)
    for (const f of def.features ?? []) {
      if ((f.level ?? 1) > ce.level) continue
      // Ved multiclass: hopp over nivå-1 class-proficiency-features er ikke nødvendig – features vises
      const key = `class:${def.id}:${f.id}`
      features.push({
        key, id: f.id, name: f.name, source: `${def.name} ${f.level ?? 1}`, sourceType: 'class', level: f.level,
        summary: f.summary, description: f.description, activation: f.activation, roll: f.roll, toggle: f.toggle, duration: f.duration,
        uses: undefined
      })
      addEffects(f.effects, `${def.name}: ${f.name}`, ce.level)
      featureChoices.push({ feature: f, source: `${def.name}: ${f.name}`, keyBase: `class:${def.id}:${f.id}`, area: 'class', columns: row?.columns })
    }
    if (sub && sub.classId === def.id) {
      for (const f of sub.features ?? []) {
        if ((f.level ?? def.subclassLevel) > ce.level) continue
        const key = `subclass:${sub.id}:${f.id}`
        features.push({
          key, id: f.id, name: f.name, source: `${sub.name} ${f.level ?? def.subclassLevel}`, sourceType: 'subclass', level: f.level,
          summary: f.summary, description: f.description, activation: f.activation, roll: f.roll, toggle: f.toggle, duration: f.duration,
          uses: undefined
        })
        addEffects(f.effects, `${sub.name}: ${f.name}`, ce.level)
        featureChoices.push({ feature: f, source: `${sub.name}: ${f.name}`, keyBase: `subclass:${sub.id}:${f.id}`, area: 'class', columns: row?.columns })
      }
    }
    // Valgfrie tool proficiencies fra første class (Bard: 3 instrumenter, Monk, Artificer …)
    if (idx === 0) {
      for (const tp of def.toolProficiencies ?? []) {
        const m = /^choice:([^:]+):(\d+)$/.exec(tp)
        if (!m) continue
        const k = `class:${def.id}:tools#tool`
        choice({ key: k, label: `${def.name}: tool proficiencies`, area: 'class', type: 'tool', count: Number(m[2]), chosen: (char.choices?.[k] ?? []).length, filter: m[1], source: def.name })
      }
    }
    if (ce.level >= def.subclassLevel) {
      choice({ key: `subclass:${def.id}`, label: `${def.name} subclass`, area: 'class', type: 'subclass', count: 1, chosen: sub ? 1 : 0, filter: def.id, source: def.name })
    }
    // Skills
    const skillCount = idx === 0 ? def.skillChoices?.count ?? 0 : MULTICLASS_PROFS[def.id]?.skills ?? 0
    if (skillCount > 0) {
      const k = `class:${def.id}:skills#skill`
      const chosen = (char.choices?.[k] ?? []).length
      choice({ key: k, label: `Choose ${skillCount} ${def.name} skill${skillCount > 1 ? 's' : ''}`, area: 'skills', type: 'skill', count: skillCount, chosen, options: def.skillChoices.options, source: def.name })
    }
    // ASI / Epic Boon-plasser
    for (const f of def.features ?? []) {
      if ((f.level ?? 1) > ce.level) continue
      const isAsi = /ability score improvement/i.test(f.name)
      const isBoon = /epic boon/i.test(f.name)
      if (!isAsi && !isBoon) continue
      const src = `class:${def.id}:${f.level}`
      const has = (char.feats ?? []).some((cf) => cf.source === src)
      choice({ key: src, label: `${def.name} level ${f.level}: ${isBoon ? 'Epic Boon feat' : 'Ability Score Improvement or a feat'}`, area: 'feats', type: 'feat', count: 1, chosen: has ? 1 : 0, filter: isBoon ? 'epicBoon' : 'general', source: def.name })
    }
  })

  // Species traits
  if (species) {
    for (const t of species.traits ?? []) {
      if ((t.level ?? 1) > totalLevel) continue
      const key = `species:${species.id}:${t.id}`
      features.push({
        key, id: t.id, name: t.name, source: species.name, sourceType: 'species', summary: t.summary, description: t.description,
        activation: t.activation, uses: undefined, roll: t.roll, toggle: t.toggle, duration: t.duration
      })
      addEffects(t.effects, `${species.name}: ${t.name}`)
      featureChoices.push({ feature: t, source: `${species.name}: ${t.name}`, keyBase: `species:${species.id}:${t.id}`, area: 'species' })
    }
    addEffects(species.effects, species.name)
    if (species.options) {
      choice({ key: 'species:option', label: `${species.name}: ${species.options.label}`, area: 'species', type: 'speciesOption', count: 1, chosen: speciesOpt ? 1 : 0, source: species.name })
    }
    if (speciesOpt) {
      features.push({
        key: `species-option:${speciesOpt.id}`, id: speciesOpt.id, name: speciesOpt.name, source: `${species.name} (${species.options?.label})`,
        sourceType: 'option', summary: speciesOpt.summary, description: speciesOpt.description
      })
      addEffects(speciesOpt.effects, speciesOpt.name)
    }
  }

  // Feats (background, class, species, manuelle)
  const featsOut: Derived['feats'] = []
  for (const cf of char.feats ?? []) {
    const def = L.get('feat', cf.featId)
    featsOut.push({ uid: cf.uid, def, source: cf.source })
    if (!def) continue
    const key = `feat:${cf.uid}`
    features.push({
      key, id: def.id, name: def.name, source: featSourceLabel(cf.source, L), sourceType: 'feat', summary: def.summary,
      description: def.description, entityKind: 'feat', entityId: def.id
    })
    addEffects(def.effects, `Feat: ${def.name}`)
    for (const ch of def.choices ?? []) {
      // Weapon Mastery fra feats legges til den felles mastery-telleren
      if (ch.type === 'weaponMastery') {
        masteryFromFeats += ch.count
        continue
      }
      const chosen = cf.choices?.[ch.id]?.length ?? 0
      choice({ key: `featchoice:${cf.uid}:${ch.id}`, label: `${def.name}: ${ch.label}`, area: 'feats', type: ch.type, count: ch.count, chosen, options: ch.options, filter: ch.filter, source: def.name })
    }
    if (def.abilityIncrease && def.id !== 'ability-score-improvement') {
      choice({ key: `featability:${cf.uid}`, label: `${def.name}: ability to increase (+${def.abilityIncrease.amount})`, area: 'feats', type: 'ability', count: 1, chosen: cf.abilityChoice ? 1 : 0, options: def.abilityIncrease.options, source: def.name })
    }
  }

  // Background
  if (background) {
    const bbSum = Object.values(char.backgroundBonus ?? {}).reduce((s, v) => s + (v ?? 0), 0)
    choice({ key: 'background:abilities', label: `Assign background ability bonuses (+2/+1 or +1/+1/+1)`, area: 'abilities', type: 'ability', count: 3, chosen: bbSum, options: background.abilityScores, source: background.name })
    if (background.originFeat)
      choice({ key: 'background:feat', label: `${background.name}: origin feat`, area: 'background', type: 'feat', count: 1, chosen: (char.feats ?? []).some((f) => f.source === 'background') ? 1 : 0, filter: 'origin', options: [background.originFeat], source: background.name })
    if (background.tool?.startsWith('choice:')) {
      const k = 'background:tool#tool'
      const c = (char.choices?.[k] ?? []).length
      choice({ key: k, label: `${background.name}: tool proficiency`, area: 'background', type: 'tool', count: 1, chosen: c, filter: background.tool.slice(7), source: background.name })
    }
  }

  // Generiske feature-valg
  for (const fc of featureChoices) {
    // ASI / Epic Boon håndteres eget sted (unngå doble valg)
    if (/ability score improvement|epic boon/i.test(fc.feature.name)) continue
    const chs = fc.feature.choices ?? inferChoices(fc.feature)
    const lbl = (l: string): string => (l.toLowerCase().startsWith(fc.feature.name.toLowerCase()) ? `${fc.source.split(':')[0]}: ${l}` : `${fc.source}: ${l}`)
    for (const ch0 of chs) {
      // Antall kan følge en kolonne i class-tabellen (f.eks. Eldritch Invocations)
      const colVal = ch0.filter && fc.columns ? Object.entries(fc.columns).find(([k]) => k.toLowerCase() === ch0.filter!.toLowerCase())?.[1] : undefined
      const ch = colVal !== undefined && Number.isFinite(parseInt(String(colVal), 10)) ? { ...ch0, count: parseInt(String(colVal), 10) } : ch0
      if (ch.type === 'weaponMastery') {
        const cid = /^class:([^:]+):/.exec(fc.keyBase)?.[1]
        if (cid) masteryFromChoices.set(cid, (masteryFromChoices.get(cid) ?? 0) + ch.count)
        else masteryFromFeats += ch.count
        continue
      }
      if (ch.type === 'feat') {
        const src = choiceKey(fc.keyBase, ch.id, ch.type)
        const chosen = (char.feats ?? []).filter((f) => f.source === src).length
        choice({ key: src, label: lbl(ch.label), area: fc.area === 'species' ? 'species' : 'feats', type: 'feat', count: ch.count, chosen, options: ch.options, filter: ch.filter, source: fc.source })
        continue
      }
      if (ch.type === 'spell' || ch.type === 'cantrip') continue // håndteres i spell-fanen
      const k = choiceKey(fc.keyBase, ch.id, ch.type)
      const chosen = (char.choices?.[k] ?? []).length
      choice({ key: k, label: lbl(ch.label), area: fc.area === 'species' ? 'species' : ch.type === 'skill' || ch.type === 'expertise' ? 'skills' : 'class', type: ch.type, count: ch.count, chosen, options: ch.options, filter: ch.filter, source: fc.source })
    }
  }

  // Valgte class-alternativer (Divine Order, Metamagic, Invocations ...) gir features og effects
  {
    const optionItems = new Map<string, { item: Feature; group: string }>()
    for (const g of L.classOptions) for (const it of g.items) optionItems.set(it.id, { item: it, group: g.group })
    // Alternativer valgt via feats (Eldritch Adept, Metamagic Adept, Superior Technique …)
    const fromFeats = (char.feats ?? []).flatMap((cf) => {
      const fd = L.get('feat', cf.featId) as FeatDef | undefined
      return (fd?.choices ?? []).filter((ch) => ch.type === 'option').flatMap((ch) => cf.choices?.[ch.id] ?? [])
    })
    for (const v of new Set([...valuesOfType(char, 'option'), ...fromFeats])) {
      const hit = optionItems.get(v)
      if (!hit) continue
      const key = `option:${hit.item.id}`
      features.push({ key, id: hit.item.id, name: hit.item.name, source: hit.group, sourceType: 'option', summary: hit.item.summary, description: hit.item.description, activation: hit.item.activation })
      addEffects(hit.item.effects, `${hit.group}: ${hit.item.name}`)
    }
  }

  // Språk ved opprettelse: Common + 2 valgfrie
  {
    const k = 'origin:languages#language'
    const c = (char.choices?.[k] ?? []).length
    choice({ key: k, label: 'Languages (2 in addition to Common)', area: 'background', type: 'language', count: 2, chosen: c, source: 'Character Origin' })
  }

  // Custom features
  for (const f of char.customFeatures ?? []) {
    const key = `custom:${f.id}`
    features.push({ key, id: f.id, name: f.name, source: 'Custom', sourceType: 'custom', summary: f.summary, description: f.description, activation: f.activation, roll: f.roll, toggle: f.toggle, duration: f.duration })
    addEffects(f.effects, f.name)
  }

  // Utstyr
  let attunedCount = 0
  for (const r of resolved) {
    const def = r.def
    if (!def) continue
    const needsAttune = !!r.magic?.attunement
    if (r.item.attuned) attunedCount++
    const active = needsAttune ? r.item.attuned : r.item.equipped
    if (!active) continue
    if (def.kind === 'magicItem' || def.source === 'Homebrew') {
      addEffects(def.effects, def.name)
      if (def.effects?.length || def.kind === 'magicItem')
        features.push({ key: `item:${r.item.uid}`, id: def.id, name: def.name, source: 'Item', sourceType: 'item', summary: def.summary, description: def.description, entityKind: def.kind, entityId: def.id })
    } else addEffects(def.effects, def.name)
  }

  // Mage Armor (kjent spell): base AC 13 + DEX uten rustning mens tilstanden «mageArmor» er slått på
  if ((char.spells ?? []).some((s) => s.spellId === 'mage-armor'))
    effects.push({ source: 'Mage Armor', effect: { target: 'ac.unarmored', op: 'set', value: '13+dex', condition: 'mageArmor', note: 'Mage Armor' } })

  // Manuelle effects
  for (const ce of char.customEffects ?? []) if (ce.active) effects.push({ source: ce.label || 'Custom', effect: ce })

  const activeEffects = effects.filter((e) => conditionActive(e.effect.condition, ectx))
  const eff = (target: string, op?: Effect['op']): { source: string; effect: Effect; classLevel?: number }[] =>
    activeEffects.filter((e) => e.effect.target === target && (!op || e.effect.op === op))
  const sumAdd = (targets: string[], bd: string[]): number => {
    let s = 0
    for (const t of targets)
      for (const e of eff(t, 'add')) {
        // Formler fra class-features regnes med class-nivået (f.eks. Unarmored Movement ved multiclass)
        const v = typeof e.effect.value === 'number' ? e.effect.value : evalFormula(e.effect.value, fctxBase(e.classLevel ?? totalLevel)) ?? 0
        s += v
        bd.push(`${e.effect.note ?? e.source}: ${signed(v)}`)
      }
    return s
  }

  /* ---------- Abilities ---------- */
  const abilities = {} as Derived['abilities']
  const mods = {} as Record<Ability, number>
  for (const a of ABILITIES) {
    const bd: string[] = []
    const base = char.baseAbilities?.[a] ?? 10
    bd.push(`Base: ${base}`)
    let score = base
    const bb = char.backgroundBonus?.[a] ?? 0
    if (bb) {
      score += bb
      bd.push(`Background: ${signed(bb)}`)
    }
    for (const inc of char.abilityIncreases ?? []) {
      if (inc.ability !== a) continue
      score += inc.amount
      bd.push(`${incLabel(inc.source, char, L)}: ${signed(inc.amount)}`)
    }
    // Epic Boon-feats kan heve en score til maks 30 (SRD 5.2.1 Epic Boon Feats)
    const boonIncreases: { label: string; amount: number }[] = []
    for (const cf of char.feats ?? []) {
      if (cf.featId === 'ability-score-improvement') {
        const n = (cf.choices?.abilities ?? []).filter((x) => x === a).length
        if (n) {
          score += n
          bd.push(`Ability Score Improvement (${featSourceLabel(cf.source, L)}): ${signed(n)}`)
        }
        continue
      }
      const def = L.get('feat', cf.featId)
      if (def?.abilityIncrease && cf.abilityChoice === a) {
        if (def.category === 'epicBoon') {
          boonIncreases.push({ label: def.name, amount: def.abilityIncrease.amount })
          continue
        }
        score += def.abilityIncrease.amount
        bd.push(`${def.name}: ${signed(def.abilityIncrease.amount)}`)
      }
    }
    // Vanlige økninger (background, ASI, feats) har alltid maks 20
    if (score > 20) {
      bd.push(`Capped at 20`)
      score = 20
    }
    // abilityMax-effekter (Primal Champion, Body and Mind) gjelder egne "øk med N, maks M"-effekter
    let max = 20
    for (const e of eff(`abilityMax.${a}`)) max = e.effect.op === 'set' ? Number(e.effect.value) : max + Number(e.effect.value)
    for (const b of boonIncreases) {
      const before = score
      score = Math.max(score, Math.min(30, score + b.amount))
      bd.push(`${b.label}: ${signed(score - before)}${score - before < b.amount ? ' (max 30)' : ''}`)
    }
    // "Øk med N, til maks M" (Ioun Stone, Primal Champion, Body and Mind): add-effekter følger maks-grensen,
    // men senker aldri en score som allerede er høyere (f.eks. via Epic Boon)
    const addCap = Math.max(max, score)
    for (const e of eff(`ability.${a}`)) {
      const v = Number(e.effect.value)
      if (e.effect.op === 'add') {
        const before = score
        score = v > 0 ? Math.max(score, Math.min(addCap, score + v)) : score + v
        bd.push(`${e.source}: ${signed(score - before)}${score - before !== v ? ` (max ${addCap})` : ''}`)
      } else if (e.effect.op === 'min' && score < v) {
        score = v
        bd.push(`${e.source}: becomes ${v}`)
      } else if (e.effect.op === 'set') {
        score = v
        bd.push(`${e.source}: set to ${v}`)
      }
    }
    const ad = adj(`ability.${a}`)
    if (ad) {
      score += ad
      bd.push(`Custom: ${signed(ad)}`)
    }
    const s = stat(score, bd)
    const o = ov[`ability.${a}`]
    if (typeof o === 'number') Object.assign(s, { value: o, overridden: true })
    abilities[a] = { score: s, mod: abilityMod(s.value) }
    mods[a] = abilityMod(s.value)
  }

  function fctxBase(level = totalLevel, columns?: Record<string, string | number>): FormulaContext {
    return { mods, pb: P, level, totalLevel, columns }
  }

  function usesOf(u: Uses | undefined, key: string, cls: ClassDef | undefined, level: number, columns?: Record<string, string | number>): DerivedFeature['uses'] {
    if (!u) return undefined
    const max = evalFormula(u.count, { mods: mods ?? ({} as never), pb: P, level, totalLevel, columns })
    if (max === null) return undefined
    const recharge = u.shortFrom && level >= u.shortFrom ? 'shortOrLong' : u.recharge
    return { max: Math.max(1, max), used: char.featureUses?.[key] ?? 0, recharge }
  }
  // Bruk (uses) regnes ut etter at modifiers er kjent
  recomputeUses()
  function recomputeUses(): void {
    for (const fc of features) {
      const src = findFeatureDef(fc)
      if (!src?.uses) continue
      const ce = classEntries.find((x) => fc.key.startsWith(`class:${x.def.id}:`) || (x.sub && fc.key.startsWith(`subclass:${x.sub.id}:`)))
      const lvl = ce ? ce.ce.level : totalLevel
      const row = ce?.def.table?.find((r) => r.level === lvl)
      fc.uses = usesOf(src.uses, fc.key, ce?.def, lvl, row?.columns)
    }
  }
  function findFeatureDef(fc: DerivedFeature): Feature | undefined {
    if (fc.sourceType === 'class') return classEntries.flatMap((x) => x.def.features ?? []).find((f) => f.id === fc.id)
    if (fc.sourceType === 'subclass') return classEntries.flatMap((x) => x.sub?.features ?? []).find((f) => f.id === fc.id)
    if (fc.sourceType === 'species') return species?.traits.find((t) => t.id === fc.id)
    if (fc.sourceType === 'custom') return char.customFeatures?.find((f) => f.id === fc.id)
    if (fc.sourceType === 'option') return L.classOptions.flatMap((g) => g.items).find((f) => f.id === fc.id)
    return undefined
  }

  /* ---------- Proficiencies ---------- */
  const armorProf = new Set<ArmorCategory>(char.extra?.armor ?? [])
  const weaponProf = new Set<string>(char.extra?.weapons ?? [])
  const toolProf = new Set<string>(char.extra?.tools ?? [])
  const langs = new Set<string>(['common', ...(char.extra?.languages ?? [])])
  classEntries.forEach(({ def }, idx) => {
    if (idx === 0) {
      def.armorTraining?.forEach((a) => armorProf.add(a))
      def.weaponProficiencies?.forEach((w) => weaponProf.add(w))
      def.toolProficiencies?.filter((t) => !t.startsWith('choice')).forEach((t) => toolProf.add(t))
    } else {
      const mc = MULTICLASS_PROFS[def.id]
      mc?.armor.forEach((a) => armorProf.add(a))
      mc?.weapons.forEach((w) => weaponProf.add(w))
      mc?.tools?.forEach((t) => toolProf.add(t))
    }
  })
  if (background?.tool && !background.tool.startsWith('choice')) toolProf.add(background.tool)
  valuesOfType(char, 'tool').forEach((t) => toolProf.add(t))
  valuesOfType(char, 'language').forEach((l) => langs.add(l))
  for (const e of activeEffects) {
    const v = String(e.effect.value ?? '')
    if (e.effect.op !== 'grant' && e.effect.op !== 'proficiency') continue
    if (e.effect.target === 'proficiency.armor') armorProf.add(v as ArmorCategory)
    if (e.effect.target === 'proficiency.weapon') weaponProf.add(v)
    if (e.effect.target === 'proficiency.tool') toolProf.add(v)
    if (e.effect.target === 'language') langs.add(v)
  }

  // Skill-/expertise-kilder
  const skillProf = new Set<SkillId>(char.extra?.skills ?? [])
  const skillExp = new Set<SkillId>(char.extra?.expertise ?? [])
  background?.skills?.forEach((s) => skillProf.add(s))
  valuesOfType(char, 'skill').forEach((s) => (isSkill(s) ? skillProf.add(s) : toolProf.add(s)))
  valuesOfType(char, 'expertise').forEach((s) => isSkill(s) && skillExp.add(s))
  for (const cf of char.feats ?? []) {
    const def = L.get('feat', cf.featId)
    for (const ch of def?.choices ?? []) {
      const vals = cf.choices?.[ch.id] ?? []
      if (ch.type === 'skill') vals.forEach((v) => (isSkill(v) ? skillProf.add(v) : toolProf.add(v)))
      if (ch.type === 'expertise') vals.forEach((v) => isSkill(v) && skillExp.add(v))
      if (ch.type === 'tool') vals.forEach((v) => toolProf.add(v))
      if (ch.type === 'language') vals.forEach((v) => langs.add(v))
    }
  }
  for (const e of activeEffects) {
    const m = /^skill\.(\w+)$/.exec(e.effect.target)
    if (m?.[1] === 'all') {
      // Boon of Skill: proficiency i alle skills
      if (e.effect.op === 'proficiency') SKILLS.forEach((sk) => skillProf.add(sk.id))
      continue
    }
    if (!m || !isSkill(m[1])) continue
    if (e.effect.op === 'proficiency') skillProf.add(m[1])
    if (e.effect.op === 'expertise') skillExp.add(m[1])
  }

  const hasFeature = (re: RegExp): boolean => features.some((f) => re.test(f.name))
  const jackOfAllTrades = hasFeature(/jack of all trades/i)

  /* ---------- Saves ---------- */
  const firstClass = classEntries[0]?.def
  const saves = {} as Derived['saves']
  for (const a of ABILITIES) {
    const bd = [`${abilityNamesShort[a]} mod: ${signed(mods[a])}`]
    const prof =
      !!firstClass?.savingThrows?.includes(a) ||
      (char.extra?.saves ?? []).includes(a) ||
      eff(`save.${a}`, 'proficiency').length > 0 ||
      eff('save.all', 'proficiency').length > 0 ||
      // Resilient: saving throw-proficiency i den valgte ability-en
      (char.feats ?? []).some((cf) => cf.featId === 'resilient' && cf.abilityChoice === a)
    let v = mods[a]
    if (prof) {
      v += P
      bd.push(`Proficiency: ${signed(P)}`)
    }
    v += sumAdd([`save.${a}`, 'save.all'], bd)
    v += exhaustionPenalty(bd)
    const s = { ...stat(v, bd), proficient: prof }
    s.advantage = [...eff(`save.${a}`, 'advantage'), ...eff('save.all', 'advantage')].map((e) => e.effect.note ?? e.source)
    s.disadvantage = [...eff(`save.${a}`, 'disadvantage'), ...eff('save.all', 'disadvantage')].map((e) => e.effect.note ?? e.source)
    applyOverride(s, `save.${a}`)
    saves[a] = s
  }

  /* ---------- Ability checks ---------- */
  const checks = {} as Derived['checks']
  for (const a of ABILITIES) {
    const bd = [`${abilityNamesShort[a]} mod: ${signed(mods[a])}`]
    let v = mods[a]
    v += sumAdd([`check.${a}`, 'check.all'], bd)
    v += exhaustionPenalty(bd)
    const s = stat(v, bd)
    s.advantage = [...eff(`check.${a}`, 'advantage'), ...eff('check.all', 'advantage')].map((e) => e.effect.note ?? e.source)
    applyOverride(s, `check.${a}`)
    checks[a] = s
  }

  /* ---------- Skills ---------- */
  const skillsOut = {} as Derived['skills']
  for (const sk of SKILLS) {
    const a = sk.ability
    const bd = [`${abilityNamesShort[a]} mod: ${signed(mods[a])}`]
    const expertise = skillExp.has(sk.id)
    const prof = expertise || skillProf.has(sk.id)
    let v = mods[a]
    // Satt for hånd på arket (prikkene) merkes som egendefinert, så det skilles fra regel-kilder
    const customSkill = (char.extra?.expertise ?? []).includes(sk.id) || (char.extra?.skills ?? []).includes(sk.id)
    if (expertise) {
      v += P * 2
      bd.push(`${customSkill && (char.extra?.expertise ?? []).includes(sk.id) ? 'Custom expertise' : 'Expertise'}: ${signed(P * 2)}`)
    } else if (prof) {
      v += P
      bd.push(`${customSkill ? 'Custom proficiency' : 'Proficiency'}: ${signed(P)}`)
    } else if (jackOfAllTrades) {
      const h = Math.floor(P / 2)
      v += h
      bd.push(`Jack of All Trades: ${signed(h)}`)
    }
    v += sumAdd([`skill.${sk.id}`, 'skill.all', `check.${a}`, 'check.all'], bd)
    v += exhaustionPenalty(bd)
    const s = { ...stat(v, bd), proficient: prof, expertise, ability: a }
    s.advantage = [...eff(`skill.${sk.id}`, 'advantage'), ...eff('skill.all', 'advantage'), ...eff(`check.${a}`, 'advantage'), ...eff('check.all', 'advantage')].map((e) => e.effect.note ?? e.source)
    s.disadvantage = [...eff(`skill.${sk.id}`, 'disadvantage'), ...eff('skill.all', 'disadvantage'), ...eff(`check.${a}`, 'disadvantage'), ...eff('check.all', 'disadvantage')].map((e) => e.effect.note ?? e.source)
    if (sk.id === 'stealth' && armorDef?.stealthDisadvantage) s.disadvantage.push(`${armorDef.name}`)
    applyOverride(s, `skill.${sk.id}`)
    skillsOut[sk.id] = s
  }

  const passive = (id: SkillId, extraTarget?: string): Stat => {
    const sk = skillsOut[id]
    const bd = [`10 + ${skillById[id].name} ${signed(sk.value)}`]
    let v = 10 + sk.value
    if (exhaustionLevel && !sk.overridden) {
      // Passive scores er ikke D20 Tests: Exhaustion-straffen i skillverdien trekkes ut igjen
      v += 2 * exhaustionLevel
      bd.push(`Not a D20 Test (Exhaustion ignored): ${signed(2 * exhaustionLevel)}`)
    }
    if (sk.advantage?.length) {
      v += 5
      bd.push('Advantage: +5')
    }
    if (sk.disadvantage?.length) {
      v -= 5
      bd.push('Disadvantage: −5')
    }
    if (extraTarget) v += sumAdd([extraTarget], bd)
    const s = stat(v, bd)
    applyOverride(s, `passive.${id}`)
    return s
  }

  /* ---------- Initiative ---------- */
  const initBd = [`DEX mod: ${signed(mods.dex)}`]
  let init = mods.dex
  for (const e of eff('initiative')) {
    if (e.effect.op === 'set' && String(e.effect.value).toLowerCase().includes('prof')) {
      init += P
      initBd.push(`${e.effect.note ?? e.source}: ${signed(P)}`)
    }
  }
  init += sumAdd(['initiative'], initBd)
  init += exhaustionPenalty(initBd)
  const initiative = stat(init, initBd)
  initiative.advantage = eff('initiative', 'advantage').map((e) => e.effect.note ?? e.source)
  applyOverride(initiative, 'initiative')

  /* ---------- AC ---------- */
  const acBd: string[] = []
  let ac: number
  if (armorDef) {
    // Medium Armor Master: maks +3 fra DEX i Medium armor med DEX 16+
    const mam = armorDef.category === 'medium' && abilities.dex.score.value >= 16 && (char.feats ?? []).some((cf) => cf.featId === 'medium-armor-master')
    const dexCap = armorDef.dexCap !== null && mam ? Math.max(armorDef.dexCap, 3) : armorDef.dexCap
    const dex = dexCap === null ? mods.dex : Math.min(mods.dex, dexCap)
    ac = armorDef.baseAC + dex
    acBd.push(`${armorDef.name}: ${armorDef.baseAC}`)
    if (dexCap !== 0) acBd.push(`DEX${dexCap !== null ? ` (max ${dexCap})` : ''}${mam ? ' (Medium Armor Master)' : ''}: ${signed(dex)}`)
    const mb = (wornArmor?.item.bonus ?? 0) + (wornArmor?.magic?.bonus ?? 0)
    if (mb) {
      ac += mb
      acBd.push(`${wornArmor?.magic?.name ?? 'Magic'}: ${signed(mb)}`)
    }
    ac += sumAdd(['ac.armored'], acBd)
  } else {
    ac = 10 + mods.dex
    let label = `Unarmored: 10 + DEX (${signed(mods.dex)})`
    for (const e of eff('ac.unarmored')) {
      const v = evalFormula(e.effect.value, fctxBase())
      if (v !== null && v > ac) {
        ac = v
        label = `${e.source}: ${e.effect.value} = ${v}`
      }
    }
    acBd.push(label)
  }
  if (wornShield) {
    const sd = wornShield.base as ArmorDef
    const sb = sd.baseAC + (wornShield.item.bonus ?? 0) + (wornShield.magic?.bonus ?? 0)
    ac += sb
    acBd.push(`${wornShield.magic?.name ?? sd.name}: ${signed(sb)}`)
  }
  ac += sumAdd(['ac'], acBd)
  const acStat = stat(ac, acBd)
  applyOverride(acStat, 'ac')

  const armorNotProficient = (!!armorDef && !armorProf.has(armorDef.category)) || (!!wornShield && !armorProf.has('shield'))
  if (armorNotProficient) {
    const why = `${armorDef && !armorProf.has(armorDef.category) ? armorDef.name : 'Shield'} (no training)`
    for (const ab of ['str', 'dex'] as const) saves[ab].disadvantage = [...(saves[ab].disadvantage ?? []), why]
    for (const sk of SKILLS) if (sk.ability === 'str' || sk.ability === 'dex') skillsOut[sk.id].disadvantage = [...(skillsOut[sk.id].disadvantage ?? []), why]
  }
  const strengthTooLow = !!armorDef?.strength && abilities.str.score.value < armorDef.strength

  /* ---------- Speed ---------- */
  const spBd: string[] = []
  let speed = species?.speed ?? 30
  spBd.push(`${species?.name ?? 'Base'}: ${speed} ft.`)
  for (const e of eff('speed', 'set')) {
    const v = Number(e.effect.value)
    if (v > speed) {
      speed = v
      spBd.push(`${e.source}: ${v} ft.`)
    }
  }
  speed += sumAdd(['speed'], spBd)
  if (strengthTooLow) {
    speed -= 10
    spBd.push(`Armor STR ${armorDef?.strength} required: −10 ft.`)
  }
  if (exhaustionLevel) {
    speed -= 5 * exhaustionLevel
    spBd.push(`Exhaustion ${exhaustionLevel}: −${5 * exhaustionLevel} ft.`)
  }
  const speedStat: Derived['speed'] = stat(Math.max(0, speed), spBd)
  for (const m of ['fly', 'swim', 'climb', 'burrow'] as const) {
    let v = 0
    let fromSpeed = false
    for (const e of eff(`speed.${m}`)) {
      const isSpeed = String(e.effect.value).toLowerCase() === 'speed'
      fromSpeed ||= isSpeed
      const n = isSpeed ? speed : Number(e.effect.value)
      v = e.effect.op === 'add' ? v + n : Math.max(v, n)
    }
    // Exhaustion senker alle bevegelsestyper (lik Speed er allerede redusert)
    if (v && exhaustionLevel && !fromSpeed) v = Math.max(0, v - 5 * exhaustionLevel)
    if (v) speedStat[m] = v
  }
  // Grappled, Restrained, Paralyzed, Petrified, Stunned og Unconscious: Speed 0 (2024)
  {
    const zero = (char.conditions ?? []).find((c) => ['grappled', 'restrained', 'paralyzed', 'petrified', 'stunned', 'unconscious'].includes(c))
    if (zero) {
      speedStat.value = speedStat.computed = 0
      speedStat.breakdown.push(`${zero[0].toUpperCase()}${zero.slice(1)}: Speed 0`)
      for (const m of ['fly', 'swim', 'climb', 'burrow'] as const) if (speedStat[m]) speedStat[m] = 0
    }
  }
  applyOverride(speedStat, 'speed')

  /* ---------- HP ---------- */
  const hpBd: string[] = []
  let hp = 0
  classEntries.forEach(({ ce, def }, idx) => {
    for (let lvl = 1; lvl <= ce.level; lvl++) {
      let v: number
      if (idx === 0 && lvl === 1) {
        v = def.hitDie
      } else {
        const r = ce.hpRolls?.[lvl - 1]
        v = typeof r === 'number' ? r : averageHitDie(def.hitDie)
      }
      hp += Math.max(1, v + mods.con)
    }
    const desc = idx === 0 ? `${def.name}: d${def.hitDie} max at 1st` : `${def.name}: d${def.hitDie}`
    hpBd.push(`${desc} × ${ce.level} levels`)
  })
  if (!classEntries.length) hp = 10 + mods.con
  hpBd.push(`CON ${signed(mods.con)} per level`)
  for (const e of eff('hp.perLevel', 'add')) {
    const v = Number(e.effect.value) * (e.classLevel ?? totalLevel)
    hp += v
    hpBd.push(`${e.effect.note ?? e.source}: ${signed(v)}`)
  }
  hp += sumAdd(['hp.max'], hpBd)
  const hpMax = stat(Math.max(1, hp), hpBd)
  applyOverride(hpMax, 'hp.max')

  const dice = new Map<number, number>()
  classEntries.forEach(({ ce, def }) => dice.set(def.hitDie, (dice.get(def.hitDie) ?? 0) + ce.level))
  const hitDice = [...dice.entries()].sort((a, b) => b[0] - a[0]).map(([die, total]) => ({ die, total, used: char.hitDiceUsed?.[String(die)] ?? 0 }))

  /* ---------- Spellcasting ---------- */
  const spellcasting: DerivedSpellcasting[] = []
  let casterLevel = 0
  let casterClasses = 0
  let pact: Derived['pact'] = null
  // Spellcasting fra class eller subclass (Eldritch Knight / Arcane Trickster)
  const casterOf = (x: (typeof classEntries)[number]): ClassDef['spellcasting'] =>
    x.def.spellcasting ?? (x.sub && x.sub.classId === x.def.id ? SUBCLASS_SPELLCASTING[x.sub.id] : undefined)
  // "Spellcasting from only one class": bruk classens egen tabell (one-third casters runder da opp)
  const singleSpellcaster = classEntries.filter((x) => { const s = casterOf(x); return !!s && s.progression !== 'pact' }).length === 1
  for (const x of classEntries) {
    const { ce, def } = x
    const sc = casterOf(x)
    if (!sc) continue
    const m = mods[sc.ability]
    const dcBd = [`8 + PB ${signed(P)} + ${abilityNamesShort[sc.ability]} ${signed(m)}`]
    const dc = stat(8 + P + m, dcBd)
    dc.value = dc.computed = dc.value + sumAdd(['spell.dc'], dcBd)
    applyOverride(dc, `spell.dc.${def.id}`)
    const atBd = [`PB ${signed(P)} + ${abilityNamesShort[sc.ability]} ${signed(m)}`]
    const at = stat(P + m, atBd)
    at.value = at.computed = at.value + sumAdd(['spell.attack', 'attack.spell'], atBd) + exhaustionPenalty(atBd)
    applyOverride(at, `spell.attack.${def.id}`)
    const mine = (char.spells ?? []).filter((s) => s.source === def.id)
    const spellDefs = mine.map((s) => ({ s, d: L.get('spell', s.spellId) }))
    let maxLvl = 0
    if (sc.progression === 'pact') {
      const [count, level] = PACT_SLOTS[Math.min(20, ce.level) - 1]
      pact = { count, level, used: char.pactSlotsUsed ?? 0 }
      maxLvl = level
      if (ce.level >= 11) maxLvl = Math.min(9, Math.floor((ce.level + 1) / 2)) // Mystic Arcanum
    } else {
      const cl = sc.progression === 'full' ? ce.level : sc.progression === 'half' ? Math.ceil(ce.level / 2) : singleSpellcaster ? Math.ceil(ce.level / 3) : Math.floor(ce.level / 3)
      casterLevel += cl
      casterClasses++
      // Høyeste spell-nivå classen selv kan forberede (egen class-tabell)
      const own = sc.progression === 'third' ? Math.ceil(ce.level / 3) : cl
      maxLvl = own > 0 ? SPELL_SLOTS[Math.min(20, own) - 1].length : 0
    }
    spellcasting.push({
      classId: def.id, className: def.name, ability: sc.ability, mod: m, dc, attack: at,
      preparedMax: sc.prepared?.[ce.level - 1] ?? 0,
      // Ekstra cantrips (Thaumaturge, Magician): effect 'spell.cantrips.<classId>'
      cantripsMax: (sc.cantrips?.[ce.level - 1] ?? 0) + sumAdd([`spell.cantrips.${def.id}`], []),
      preparedCount: spellDefs.filter((x) => x.d && x.d.level > 0 && !x.s.alwaysPrepared && x.s.prepared).length,
      cantripCount: spellDefs.filter((x) => x.d && x.d.level === 0).length,
      spellList: sc.spellList, maxSpellLevel: maxLvl
    })
  }
  const slotRow = [...(casterLevel > 0 ? SPELL_SLOTS[Math.min(20, casterLevel) - 1] : [])]
  // Egne justeringer/overstyringer kan gi slots også på nivåer classen ikke har
  for (let i = 9; i >= 1; i--) {
    if (adj(`slots.${i}`) > 0 || (typeof ov[`slots.${i}`] === 'number' && (ov[`slots.${i}`] as number) > 0)) {
      while (slotRow.length < i) slotRow.push(0)
      break
    }
  }
  const slots = slotRow
    .map((max, i) => ({ level: i + 1, max: typeof ov[`slots.${i + 1}`] === 'number' ? (ov[`slots.${i + 1}`] as number) : Math.max(0, max + adj(`slots.${i + 1}`)), used: char.spellSlotsUsed?.[i] ?? 0 }))
  void casterClasses

  for (const sc of spellcasting) {
    if (sc.cantripsMax > 0)
      choice({ key: `spells:${sc.classId}:cantrips`, label: `${sc.className}: cantrips`, area: 'spells', type: 'cantrip', count: sc.cantripsMax, chosen: sc.cantripCount, filter: sc.spellList, source: sc.className })
    if (sc.preparedMax > 0)
      choice({ key: `spells:${sc.classId}:prepared`, label: `${sc.className}: prepared spells`, area: 'spells', type: 'spell', count: sc.preparedMax, chosen: sc.preparedCount, filter: sc.spellList, source: sc.className })
  }

  /* ---------- Weapon Mastery ---------- */
  let weaponMasteryMax = 0
  for (const { ce, def } of classEntries) {
    const row = def.table?.find((r) => r.level === ce.level)
    const col = row && Object.entries(row.columns ?? {}).find(([k]) => /weapon mastery/i.test(k))
    if (col) weaponMasteryMax += parseInt(String(col[1]), 10) || 0
    else if (masteryFromChoices.has(def.id)) weaponMasteryMax += masteryFromChoices.get(def.id)!
    else if ((def.features ?? []).some((f) => /^weapon mastery$/i.test(f.name) && (f.level ?? 1) <= ce.level)) weaponMasteryMax += 2
  }
  weaponMasteryMax += masteryFromFeats + adj('weaponMastery')
  if (typeof ov['weaponMastery'] === 'number') weaponMasteryMax = ov['weaponMastery'] as number
  weaponMasteryMax = Math.max(0, weaponMasteryMax)
  if (weaponMasteryMax > 0)
    choice({ key: 'weaponMastery', label: 'Weapon Mastery weapons', area: 'equipment', type: 'weaponMastery', count: weaponMasteryMax, chosen: (char.weaponMasteries ?? []).length, source: 'Weapon Mastery' })

  /* ---------- Attacks ---------- */
  const attacks: DerivedAttack[] = []
  const meleeBonusTargets = ['attack.all', 'attack.melee']
  const rangedBonusTargets = ['attack.all', 'attack.ranged']
  const monk = classEntries.find((x) => x.def.id === 'monk')
  const martialArtsDie = monk ? String(monk.def.table?.find((r) => r.level === monk.ce.level)?.columns?.['Martial Arts'] ?? '') : ''

  for (const r of resolved) {
    const w = r.base?.kind === 'weapon' ? (r.base as WeaponDef) : undefined
    if (!w) continue
    if (!r.item.equipped && !r.item.showAsAttack) continue
    const ranged = w.weaponType === 'ranged'
    const useDex = ranged || (w.properties.includes('finesse') && mods.dex > mods.str) || (!!monk && isMonkWeapon(w) && mods.dex > mods.str)
    const ab: Ability = useDex ? 'dex' : 'str'
    const proficient = weaponProficient(w, weaponProf)
    const magicBonus = (r.item.bonus ?? 0) + (r.magic?.bonus ?? 0)
    const bd = [`${abilityNamesShort[ab]} mod: ${signed(mods[ab])}`]
    let b = mods[ab]
    if (proficient) {
      b += P
      bd.push(`Proficiency: ${signed(P)}`)
    }
    if (magicBonus) {
      b += magicBonus
      bd.push(`Magic: ${signed(magicBonus)}`)
    }
    b += sumAdd(ranged ? rangedBonusTargets : meleeBonusTargets, bd)
    b += exhaustionPenalty(bd)
    const bonus = stat(b, bd)
    applyOverride(bonus, `attack.${r.item.uid}.bonus`)
    const dmgBd: string[] = []
    let dmgMod = mods[ab] + magicBonus + sumAdd(['damage.all', ranged ? 'damage.ranged' : 'damage.melee'], dmgBd)
    let die = w.damage
    if (monk && isMonkWeapon(w) && martialArtsDie && dieSize(martialArtsDie) > dieSize(die)) die = martialArtsDie
    let damage = dmgMod ? `${die}${signed(dmgMod)}` : die
    {
      const da = adj(`attack.${r.item.uid}.damage`)
      if (da) damage = `${die}${signed(dmgMod + da)}`
    }
    if (typeof ov[`attack.${r.item.uid}.damage`] === 'string') damage = ov[`attack.${r.item.uid}.damage`] as string
    const notes: string[] = []
    if (w.versatile) notes.push(`Versatile (${w.versatile}${dmgMod ? signed(dmgMod) : ''} two-handed)`)
    if (!proficient) notes.push('Not proficient')
    const name = r.magic ? `${r.magic.name}` : r.item.name || w.name
    const offMod = dmgMod - Math.max(0, mods[ab])
    attacks.push({
      offhandDamage: offMod ? `${die}${signed(offMod)}` : die,
      key: r.item.uid, name: name.includes(w.name) ? name : `${name} (${w.name})`, kind: 'weapon', bonus, damage, damageType: w.damageType,
      properties: w.properties, range: w.range ? `${w.range} ft.` : w.properties.includes('reach') ? '10 ft.' : '5 ft.',
      mastery: w.mastery, masteryActive: (char.weaponMasteries ?? []).includes(w.id), proficient, notes, refId: w.id, inventoryUid: r.item.uid
    })
    dmgMod = 0
  }
  // Unarmed Strike
  {
    const ab: Ability = monk && mods.dex > mods.str ? 'dex' : 'str'
    const bd = [`${abilityNamesShort[ab]} mod: ${signed(mods[ab])}`, `Proficiency: ${signed(P)}`]
    const b = mods[ab] + P + sumAdd(meleeBonusTargets, bd) + exhaustionPenalty(bd)
    const bonus = stat(b, bd)
    applyOverride(bonus, 'attack.unarmed.bonus')
    const dmg = martialArtsDie ? `${martialArtsDie}${signed(mods[ab])}` : `${Math.max(0, 1 + mods[ab])}`
    attacks.push({ key: 'unarmed', name: 'Unarmed Strike', kind: 'unarmed', bonus, damage: dmg, damageType: 'bludgeoning', properties: [], range: '5 ft.', masteryActive: false, proficient: true, notes: [] })
  }
  // Spellcasting ability for spells fra feats (Magic Initiate o.l.) og species-lineages
  const spellSources: Derived['spellSources'] = {}
  {
    const isCast = (v: unknown): v is Ability => v === 'int' || v === 'wis' || v === 'cha'
    const speciesAb = Object.entries(char.choices ?? {}).find(([k, v]) => k.startsWith('species') && v.length === 1 && isCast(v[0]))?.[1][0] as Ability | undefined
    for (const cs of char.spells ?? []) {
      if (spellSources[cs.source]) continue
      let ab: Ability | undefined
      if (cs.source.startsWith('feat:')) {
        const cf = (char.feats ?? []).find((f) => `feat:${f.uid}` === cs.source)
        const v = cf?.choices?.ability?.[0]
        ab = isCast(v) ? v : undefined
      } else if (cs.source === 'species') ab = speciesAb
      if (!ab) continue
      const dcBd: string[] = []
      const atBd: string[] = []
      const dc = 8 + P + mods[ab] + sumAdd(['spell.dc'], dcBd)
      const attack = P + mods[ab] + sumAdd(['spell.attack', 'attack.spell'], atBd) + exhaustionPenalty(atBd)
      spellSources[cs.source] = { ability: ab, mod: mods[ab], dc, attack }
    }
  }
  // Damage cantrips og angreps-spells
  for (const cs of char.spells ?? []) {
    const sp = L.get('spell', cs.spellId) as SpellDef | undefined
    if (!sp || !sp.damage || (sp.level > 0 && !cs.prepared && !cs.alwaysPrepared)) continue
    const src = spellSources[cs.source]
    const caster = spellcasting.find((s) => s.classId === cs.source) ?? (src ? { ...bestCaster([], mods, P), ability: src.ability, mod: src.mod, dc: stat(src.dc), attack: stat(src.attack) } : bestCaster(spellcasting, mods, P))
    let dice = sp.damage.dice
    const spellNotes: string[] = []
    const mult = totalLevel >= 17 ? 4 : totalLevel >= 11 ? 3 : totalLevel >= 5 ? 2 : 1
    if (sp.level === 0 && sp.damage.cantripScaling !== false) {
      dice = dice.replace(/^(\d+)d/, (_m, n) => `${Number(n) * mult}d`)
    } else if (sp.id === 'eldritch-blast' && mult > 1) {
      // Eldritch Blast skalerer med antall stråler, ikke terninger
      spellNotes.push(`${mult} beams (separate attack rolls)`)
    }
    attacks.push({
      key: `spell:${sp.id}`, name: sp.name, kind: 'spell',
      bonus: sp.attack ? caster.attack : null,
      save: sp.save ? { ability: sp.save, dc: caster.dc.value } : undefined,
      damage: dice, damageType: String(sp.damage.type), properties: [sp.level === 0 ? 'Cantrip' : `Level ${sp.level}`],
      range: sp.range, masteryActive: false, proficient: true, notes: spellNotes, refId: sp.id
    })
  }

  /* ---------- Forsvar og sanser ---------- */
  const grants = (t: string): string[] => {
    const out = activeEffects.filter((e) => e.effect.target === t).map((e) => String(e.effect.value))
    // Feat-valg som gir resistance (Boon of Energy Resistance: 'resistances')
    if (t === 'resistance')
      for (const cf of char.feats ?? []) if (L.get('feat', cf.featId)) out.push(...(cf.choices?.['resistances'] ?? []))
    return [...new Set(out)]
  }
  let darkvision = species?.darkvision ?? 0
  for (const e of eff('darkvision')) if (e.effect.op !== 'add') darkvision = Math.max(darkvision, Number(e.effect.value) || 0)
  // add: "gain Darkvision 60 ft., or +60 ft. if you already have it" (Umbral Sight)
  for (const e of eff('darkvision', 'add')) darkvision += Number(e.effect.value) || 0
  const senses = grants('sense')
  if (darkvision) senses.unshift(`Darkvision ${darkvision} ft.`)

  /* ---------- Bæreevne ---------- */
  let weight = 0
  for (const r of resolved) {
    const w = (r.base as { weight?: number } | undefined)?.weight ?? (r.def as { weight?: number } | undefined)?.weight ?? 0
    // Ammunisjon telles i stykk, men vekten i dataene gjelder hele bunten (20 Arrows = 1 lb.)
    weight += ((w || 0) * (r.item.qty || 1)) / qtyDivisor(r.def, r.item)
  }
  const coins = Object.values(char.currency ?? {}).reduce((s, n) => s + (n || 0), 0)
  weight += coins / 50
  const size = char.size || (species?.size?.includes(' or ') ? 'Medium' : species?.size) || 'Medium'
  // Bæreevne per størrelse (Tiny ×½, Small/Medium ×1, Large ×2, Huge ×4, Gargantuan ×8); Powerful Build teller én størrelse større
  const SIZE_STEPS = ['tiny', 'medium', 'large', 'huge', 'gargantuan']
  const found = SIZE_STEPS.findIndex((x) => size.toLowerCase().includes(x))
  const sizeIdx = found === -1 ? 1 : found // Small og ukjent = Medium
  const effIdx = Math.min(SIZE_STEPS.length - 1, sizeIdx + (hasFeature(/powerful build|equine build/i) ? 1 : 0))
  const sizeMult = [0.5, 1, 2, 4, 8][effIdx]
  const capacity = abilities.str.score.value * 15 * sizeMult

  // Weapon mastery og andre
  const classLabel = classEntries.map((x) => `${x.def.name} ${x.ce.level}${x.sub ? ` (${x.sub.name})` : ''}`).join(' / ') || 'No class'

  return {
    totalLevel,
    classLabel,
    pb,
    abilities,
    checks,
    exhaustion: exhaustionLevel,
    saves,
    skills: skillsOut,
    passive: { perception: passive('perception', 'passive.perception'), insight: passive('insight'), investigation: passive('investigation') },
    initiative,
    ac: acStat,
    speed: speedStat,
    hpMax,
    hitDice,
    spellcasting,
    slots,
    pact,
    attacks,
    spellSources,
    features,
    proficiencies: { armor: [...armorProf], weapons: [...weaponProf], tools: [...toolProf], languages: [...langs] },
    resistances: grants('resistance'),
    immunities: grants('immunity'),
    vulnerabilities: grants('vulnerability'),
    conditionImmunities: grants('conditionImmunity'),
    senses,
    darkvision,
    size,
    carry: { weight: Math.round(weight * 10) / 10, capacity, dragLift: capacity * 2 },
    weaponMasteryMax,
    attunedCount,
    armorWorn: armorDef,
    shieldWorn: !!wornShield,
    armorNotProficient,
    strengthTooLow,
    stealthDisadvantage: !!armorDef?.stealthDisadvantage,
    pending: allChoices.filter((c) => c.chosen < c.count),
    choices: allChoices,
    effects,
    feats: featsOut
  }

  function applyOverride(s: Stat, key: string): void {
    const a = adj(key)
    if (a) {
      s.value += a
      s.computed += a
      s.breakdown.push(`Custom: ${signed(a)}`)
    }
    const o = ov[key]
    if (typeof o === 'number') {
      s.value = o
      s.overridden = true
    }
  }
}

/* ------------------------------------------------------------------ */

const abilityNamesShort: Record<Ability, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

/** Monk weapons (2024): Simple Melee weapons og Martial Melee weapons med Light */
function isMonkWeapon(w: WeaponDef): boolean {
  if (w.weaponType !== 'melee') return false
  return w.category === 'simple' || (w.category === 'martial' && w.properties.includes('light'))
}

/**
 * Proficiency med et våpen. Støtter 'simple' | 'martial', våpen-id, våpennavn og
 * kategori med egenskapsfilter: 'martial:light', 'martial:finesse-or-light' (Monk/Rogue 2024).
 */
export function weaponProficient(w: WeaponDef, profs: Iterable<string>): boolean {
  for (const raw of profs) {
    const p = String(raw).toLowerCase().trim()
    if (!p) continue
    if (p === w.category || p === w.id) return true
    const m = /^(simple|martial)(?:\s*weapons?)?\s*:\s*(.+)$/.exec(p)
    if (m) {
      if (m[1] !== w.category) continue
      const props = m[2].split(/-or-|\s+or\s+|,|\|/).map((x) => x.trim()).filter(Boolean)
      if (props.some((pr) => (w.properties as string[]).includes(pr))) return true
      continue
    }
    if (p.replace(/s$/, '') === w.name.toLowerCase() || p === `${w.name.toLowerCase()}s`) return true
  }
  return false
}

function dieSize(d: string): number {
  const m = /d(\d+)/.exec(d)
  return m ? Number(m[1]) : 0
}

function bestCaster(list: DerivedSpellcasting[], mods: Record<Ability, number>, pb: number): DerivedSpellcasting {
  if (list.length) return [...list].sort((a, b) => b.mod - a.mod)[0]
  const ab = (['int', 'wis', 'cha'] as Ability[]).sort((a, b) => mods[b] - mods[a])[0]
  const m = mods[ab]
  return {
    classId: '', className: '', ability: ab, mod: m, dc: stat(8 + pb + m), attack: stat(pb + m), preparedMax: 0, cantripsMax: 0,
    preparedCount: 0, cantripCount: 0, spellList: '', maxSpellLevel: 0
  }
}

/** Utleder standardvalg for kjente features når data mangler eksplisitte choices */
function inferChoices(f: Feature): NonNullable<Feature['choices']> {
  if (/^fighting style$/i.test(f.name)) return [{ id: 'style', label: 'Choose a Fighting Style feat', count: 1, type: 'feat', filter: 'fightingStyle' }]
  if (/^expertise$/i.test(f.name)) return [{ id: 'expertise', label: 'Choose 2 skills for Expertise', count: 2, type: 'expertise' }]
  return []
}

function featSourceLabel(source: string, L: Lookup): string {
  if (source === 'background') return 'Background'
  if (source === 'manual') return 'Feat'
  const m = /^class:([\w-]+):(\d+)$/.exec(source)
  if (m) return `${L.get('class', m[1])?.name ?? m[1]} ${m[2]}`
  if (source.startsWith('species')) return 'Species'
  return 'Feat'
}

function incLabel(source: string, char: Character, L: Lookup): string {
  const m = /^feat:(.+)$/.exec(source)
  if (m) {
    const cf = char.feats?.find((f) => f.uid === m[1])
    return cf ? L.get('feat', cf.featId)?.name ?? 'Feat' : 'Feat'
  }
  return source
}
