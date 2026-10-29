// Kjernetyper for regeldata og karakterer (D&D 2024 / SRD 5.2.1)

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export type SkillId =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics' | 'deception' | 'history'
  | 'insight' | 'intimidation' | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand' | 'stealth' | 'survival'

export type DamageType =
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic'
  | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'

export type School =
  | 'Abjuration' | 'Conjuration' | 'Divination' | 'Enchantment' | 'Evocation'
  | 'Illusion' | 'Necromancy' | 'Transmutation'

/** 'SRD 5.2' = full offisiell tekst under CC-BY-4.0.
 *  'PHB 2024' = kun navn/mekanikk + kort sammendrag med egne ord (full tekst på D&D Beyond).
 *  'Homebrew' = laget av brukeren. */
/**
 * 'SRD 5.2'          = full offisiell tekst under CC-BY-4.0.
 * 'PHB 2024'         = kun mekanikk + kort sammendrag med egne ord.
 * 'Supplement'       = offisielle tilleggsbøker (Xanathar's, Tasha's …): kun mekanikk + kort sammendrag med egne ord.
 * 'Third-party'      = tredjepart med åpen lisens (OGL 1.0a / CC-BY / ORC) – full tekst, se `sourceBook` og `license`.
 * 'Forgotten Realms' = setting-fakta + egne beskrivelser.
 * 'Homebrew'         = laget av brukeren.
 */
export type Source = 'SRD 5.2' | 'PHB 2024' | 'Supplement' | 'Third-party' | 'Forgotten Realms' | 'Homebrew'

export type EntityKind =
  | 'class' | 'subclass' | 'species' | 'background' | 'feat' | 'spell' | 'weapon'
  | 'armor' | 'gear' | 'tool' | 'magicItem' | 'condition' | 'rule' | 'language' | 'feature' | 'creature' | 'deity'

/**
 * Effect: en mekanisk modifikator som gjør at sheetet oppdaterer seg automatisk.
 *
 * Gyldige targets (strenger):
 *  ability.<ab>            add | set | min           (f.eks. Belt of Giant Strength: min 21)
 *  abilityMax.<ab>         add | set                 (heve maks-grensen 20)
 *  ac                      add                       (Ring of Protection +1)
 *  ac.unarmored            set  value: "10+dex+con"  (alternativ AC-formel uten rustning)
 *  ac.armored              add                       (Defense fighting style: +1 med rustning)
 *  save.<ab> | save.all    add | advantage | proficiency
 *  skill.<id> | skill.all  add | advantage | disadvantage | proficiency | expertise
 *  check.<ab> | check.all  add | advantage           (ability checks)
 *  initiative              add | advantage | set ("prof" for Alert => value 'prof')
 *  speed | speed.fly | speed.swim | speed.climb | speed.burrow   add | set
 *  hp.max                  add
 *  hp.perLevel             add                       (Tough +2, Dwarven Toughness +1)
 *  attack.all | attack.melee | attack.ranged | attack.spell   add
 *  damage.all | damage.melee | damage.ranged                  add
 *  spell.dc | spell.attack add
 *  spell.cantrips.<classId> add                     (flere cantrips, f.eks. Thaumaturge/Magician)
 *  passive.perception      add
 *  darkvision              min
 *  resistance | immunity | vulnerability   grant value: DamageType
 *  conditionImmunity       grant value: condition-id
 *  proficiency.armor       grant value: 'light' | 'medium' | 'heavy' | 'shield'
 *  proficiency.weapon      grant value: 'simple' | 'martial' | weapon-id
 *  proficiency.tool        grant value: tool-id
 *  language                grant value: language-id
 *  sense                   grant value: "Blindsight 10 ft." osv.
 */
export interface Effect {
  target: string
  op: 'add' | 'set' | 'min' | 'advantage' | 'disadvantage' | 'proficiency' | 'expertise' | 'grant'
  value?: number | string
  /** Kort forklaring som vises i breakdown / tooltip */
  note?: string
  /** Bare aktiv når betingelsen er oppfylt, f.eks. 'noArmor', 'armored', 'raging', 'noShield' */
  condition?: string
}

export interface Uses {
  /** Tall, eller formel: 'prof' | 'mod.cha' | 'level' | 'mod.wis+0' (minst 1) */
  count: number | string
  /** 'shortOne' = alle på long rest, én bruk tilbake på short rest (Rage, Second Wind, Wild Shape, Channel Divinity – 2024) */
  recharge: 'short' | 'long' | 'turn' | 'dawn' | 'shortOrLong' | 'shortOne'
  /** Fra dette class-levelet lades den på short rest (Bardic Inspiration: Font of Inspiration på level 5) */
  shortFrom?: number
}

/** Et valg en feature/class/species gir (skills, feats, cantrips, osv.) */
export interface Choice {
  id: string
  label: string
  count: number
  type: 'skill' | 'expertise' | 'tool' | 'language' | 'feat' | 'spell' | 'cantrip' | 'option' | 'weaponMastery' | 'ability'
  /** Faste alternativer (ids eller fritekst) */
  options?: string[]
  /** Filter for f.eks. feat-kategori 'origin' eller spell-liste 'wizard' */
  filter?: string
}

export interface BaseEntity {
  id: string
  name: string
  kind: EntityKind
  source: Source
  /** 1–2 setninger: vises i den lille popupen */
  summary: string
  /** Full beskrivelse (markdown). For 'PHB 2024' er dette et kort sammendrag med egne ord. */
  description: string
  tags?: string[]
  /** Andre navn entityen er kjent under, f.eks. PHB-navnet «Melf’s Acid Arrow» for SRD-navnet «Acid Arrow» */
  aliases?: string[]
  /** Direkte lenke om kjent, ellers lages søke-URL automatisk */
  dndBeyondUrl?: string
  effects?: Effect[]
  /** Boktittel for 'Supplement'/'Third-party', f.eks. "Deep Magic 5e (Kobold Press)" eller "Xanathar's Guide to Everything" */
  sourceBook?: string
  /** Lisens for tredjepartsinnhold: 'OGL 1.0a' | 'CC-BY-4.0' | 'ORC' */
  license?: string
}

/** Hva en (egen) evne gjør i kampmodus: angrep, save, skade, healing eller temp HP */
export interface FeatureRoll {
  kind: 'attack' | 'save' | 'damage' | 'heal' | 'temp'
  /** Angrepsbonus som formel, f.eks. 'prof+mod.str' */
  attack?: string
  /** Save DC som formel, f.eks. '8+prof+mod.con' */
  dc?: string
  save?: Ability
  /** Terninger, kan inneholde formler: '2d6+mod.cha', '1d8+level' */
  dice?: string
  damageType?: string
  /** Halv skade ved vellykket save (standard: ja) */
  halfOnSave?: boolean
  melee?: boolean
  range?: string
}

export interface Feature {
  id: string
  name: string
  level?: number
  summary: string
  description: string
  effects?: Effect[]
  choices?: Choice[]
  uses?: Uses
  /** Vises som handling på sheetet */
  activation?: 'action' | 'bonus' | 'reaction' | 'passive' | 'special'
  /** Kampmodus: hva evnen ruller/gjør når den brukes */
  roll?: FeatureRoll
  /** Navn på aktiv tilstand: effects gjelder bare mens evnen er slått på */
  toggle?: string
  /** Varighet i runder når den slås på i kamp */
  duration?: number
}

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield'

export interface ItemGrant {
  /** id fra weapons/armor/gear/tools; ellers fritekst i name */
  id?: string
  name?: string
  qty?: number
}

export interface EquipmentOption {
  label: string // 'A' | 'B' | 'C'
  items: ItemGrant[]
  gp: number
}

export interface ClassLevelRow {
  level: number
  profBonus: number
  /** Navn på features som fås på dette nivået */
  features: string[]
  /** Klassespesifikke kolonner, f.eks. { Rages: 2, 'Rage Damage': '+2', 'Weapon Mastery': 2 } */
  columns: Record<string, string | number>
}

export interface SpellcastingDef {
  ability: Ability
  /** full = Bard/Cleric/Druid/Sorcerer/Wizard, half = Paladin/Ranger, pact = Warlock */
  progression: 'full' | 'half' | 'third' | 'pact'
  /** Antall prepared spells per nivå (index 0 = nivå 1) */
  prepared: number[]
  /** Antall cantrips per nivå (index 0 = nivå 1); tom hvis ingen */
  cantrips: number[]
  spellList: string // class-id for spell-listen, f.eks. 'wizard'
  ritualCasting?: boolean
  focus?: string
}

export interface ClassDef extends BaseEntity {
  kind: 'class'
  hitDie: 6 | 8 | 10 | 12
  /** Primary ability; flere = en av dem (f.eks. Fighter: str eller dex) */
  primaryAbility: Ability[]
  savingThrows: Ability[]
  skillChoices: { count: number; options: SkillId[] }
  weaponProficiencies: string[] // 'simple' | 'martial' | 'martial:finesse-or-light' | weapon-ids
  armorTraining: ArmorCategory[]
  toolProficiencies: string[] // fritekst/tool-ids, eller 'choice:musical:3'
  startingEquipment: EquipmentOption[]
  subclassLevel: number
  table: ClassLevelRow[] // 20 rader
  features: Feature[] // alle class features med level
  spellcasting?: SpellcastingDef
  multiclass: { prerequisite: string; proficiencies: string }
  /** 2024 PHB «Quick build»-tips med egne ord */
  quickBuild: string
  tips: string[]
  recommended: {
    species?: string[]
    backgrounds?: string[]
    feats?: string[]
    cantrips?: string[]
    spells?: string[]
    weapons?: string[]
    fightingStyles?: string[]
  }
}

/** Valgbare class-alternativer, f.eks. Eldritch Invocations, Metamagic, Maneuvers */
export interface ClassOptionGroup {
  classId: string
  group: string // 'Eldritch Invocations' | 'Metamagic Options' | ...
  source: Source
  items: (Feature & { prerequisite?: string; source?: Source })[]
}

export interface SubclassDef extends BaseEntity {
  kind: 'subclass'
  classId: string
  features: Feature[]
  /** Spells som alltid er prepared, per class-nivå */
  alwaysPrepared?: { level: number; spells: string[] }[]
}

export interface SpeciesOption {
  id: string
  name: string
  summary: string
  description: string
  effects?: Effect[]
  /** Spells fra lineage/legacy per karakternivå */
  spells?: { level: number; spellId: string; note?: string }[]
}

export interface SpeciesDef extends BaseEntity {
  kind: 'species'
  creatureType: string
  size: string // 'Medium' | 'Small' | 'Small or Medium'
  speed: number
  darkvision?: number
  traits: Feature[]
  /** Spells species-en alltid gir, per karakternivå (f.eks. Aasimar: Light) */
  spells?: { level: number; spellId: string; note?: string }[]
  /** Lineage / ancestry / legacy */
  options?: { label: string; choices: SpeciesOption[] }
}

export interface BackgroundDef extends BaseEntity {
  kind: 'background'
  abilityScores: [Ability, Ability, Ability]
  originFeat: string // feat-id
  skills: [SkillId, SkillId]
  tool: string // tool-id eller 'choice:gaming' / 'choice:artisan' / 'choice:musical'
  equipment: EquipmentOption[]
}

export interface FeatDef extends BaseEntity {
  kind: 'feat'
  category: 'origin' | 'general' | 'fightingStyle' | 'epicBoon'
  prerequisite?: string
  minLevel?: number
  repeatable?: boolean
  /** +1 (eller annet) til en av disse */
  abilityIncrease?: { options: Ability[]; amount: number }
  choices?: Choice[]
}

export interface SpellDef extends BaseEntity {
  kind: 'spell'
  level: number // 0 = cantrip
  school: School
  castingTime: string
  range: string
  components: { v: boolean; s: boolean; m?: string }
  duration: string
  concentration: boolean
  ritual: boolean
  classes: string[] // class-ids
  higherLevels?: string
  /** For angreps-/skadeoversikt */
  attack?: 'melee' | 'ranged'
  save?: Ability
  damage?: { dice: string; type: DamageType | string; cantripScaling?: boolean }
  heal?: string
  /** Temporary Hit Points spellet gir, f.eks. '2d4+4' eller 'spellcasting modifier' */
  tempHp?: string
}

export type WeaponProperty =
  | 'ammunition' | 'finesse' | 'heavy' | 'light' | 'loading' | 'range' | 'reach' | 'thrown' | 'two-handed' | 'versatile'

export type MasteryId = 'cleave' | 'graze' | 'nick' | 'push' | 'sap' | 'slow' | 'topple' | 'vex'

export interface WeaponDef extends BaseEntity {
  kind: 'weapon'
  category: 'simple' | 'martial'
  weaponType: 'melee' | 'ranged'
  damage: string // '1d8'
  damageType: DamageType
  properties: WeaponProperty[]
  versatile?: string // '1d10'
  range?: string // '80/320'
  ammunition?: string
  mastery: MasteryId
  weight: number // lb
  cost: string // '15 GP'
}

export interface ArmorDef extends BaseEntity {
  kind: 'armor'
  category: ArmorCategory
  baseAC: number // skjold: 2
  dexCap: number | null // null = ubegrenset (light), 2 = medium, 0 = heavy
  strength?: number
  stealthDisadvantage: boolean
  weight: number
  cost: string
  donDoff: string
}

export interface GearDef extends BaseEntity {
  kind: 'gear'
  category?: string // 'Adventuring Gear' | 'Ammunition' | 'Arcane Focus' | 'Druidic Focus' | 'Holy Symbol' | 'Pack' | 'Container'
  cost: string
  weight: number
  /** Innhold for packs */
  contents?: ItemGrant[]
}

export interface ToolDef extends BaseEntity {
  kind: 'tool'
  category: 'artisan' | 'gaming' | 'musical' | 'other'
  ability: Ability
  utilize: string[]
  craft: string[]
  cost: string
  weight: number
}

export interface MagicItemDef extends BaseEntity {
  kind: 'magicItem'
  itemType: string // 'Armor (Any Medium or Heavy)', 'Wondrous Item', 'Weapon (Any Simple or Martial)', 'Potion', 'Ring', 'Wand' ...
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact' | 'varies'
  attunement: boolean | string
  /** Bonus på våpen/rustning for +1/+2/+3-varianter */
  bonus?: number
  charges?: number
}

export interface ConditionDef extends BaseEntity {
  kind: 'condition'
}

export interface RuleDef extends BaseEntity {
  kind: 'rule'
  category: string // 'Glossary' | 'Weapon Property' | 'Mastery' | 'Action' | 'Combat' | 'Character Creation' ...
}

/** Skapning/monster (SRD stat block) – brukes for Wild Shape, familiars, summons, companions */
export interface CreatureDef extends BaseEntity {
  kind: 'creature'
  size: string // 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan'
  creatureType: string // 'Beast', 'Dragon', 'Fiend' ...
  alignment?: string
  ac: number
  hp: string // '13 (2d8 + 4)'
  speed: string // '30 ft., Swim 30 ft.'
  cr: string // '1/4'
  abilities: Record<Ability, number>
  /** description = hele stat blocken som markdown */
}

/**
 * Gud eller warlock-patron (Forgotten Realms). Kun fakta (navn, tittel, alignment, domains, symbol)
 * og korte beskrivelser med egne ord – ikke SRD-innhold.
 */
export interface DeityDef extends BaseEntity {
  kind: 'deity'
  category: 'god' | 'patron'
  /** 'Faerûnian', 'Dwarven', 'Elven', 'Drow', 'Gnomish', 'Halfling', 'Orc', 'Draconic', 'Archdevil', 'Demon Lord', 'Archfey', 'Great Old One', 'Celestial' */
  pantheon: string
  title: string
  alignment: string
  /** Tradisjonelle domains (også de som ikke finnes i 2024 PHB, f.eks. Nature, Tempest, Death) */
  domains: string[]
  symbol: string
  portfolio: string
  /** Subclass-ids dette passer godt med: cleric domains, paladin oaths, warlock patrons */
  suggested: string[]
}

export interface LanguageDef extends BaseEntity {
  kind: 'language'
  rarity: 'standard' | 'rare'
  origin?: string
}

export type AnyEntity =
  | ClassDef | SubclassDef | SpeciesDef | BackgroundDef | FeatDef | SpellDef | WeaponDef
  | ArmorDef | GearDef | ToolDef | MagicItemDef | ConditionDef | RuleDef | LanguageDef | CreatureDef | DeityDef
  | (BaseEntity & { kind: 'feature'; level?: number; uses?: Uses; activation?: Feature['activation'] })

/* ------------------------------------------------------------------ */
/* Karakter                                                            */
/* ------------------------------------------------------------------ */

export interface ClassEntry {
  classId: string
  level: number
  subclassId?: string
  /** HP-resultat per nivå i denne classen; null = bruk snitt (fast verdi) */
  hpRolls: (number | null)[]
}

export interface InventoryItem {
  uid: string
  /** Referanse til entity (data eller customEntities) */
  refId?: string
  /** Navn for fritekst-items uten referanse */
  name?: string
  qty: number
  equipped: boolean
  attuned: boolean
  notes?: string
  /** Våpen: gjør dette til et angrep på sheetet */
  showAsAttack?: boolean
  /** For magiske våpen/rustninger: underliggende våpen- eller rustnings-id */
  baseId?: string
  /** Manuell magisk bonus (+1/+2/+3) */
  bonus?: number
}

export interface CharacterFeat {
  uid: string
  featId: string
  /** 'background' | 'species' | 'class:fighter:4' | 'manual' */
  source: string
  abilityChoice?: Ability
  choices?: Record<string, string[]>
}

export interface CharacterSpell {
  spellId: string
  /** class-id, 'species', 'feat:<id>', 'item', 'manual' */
  source: string
  prepared: boolean
  alwaysPrepared?: boolean
}

export interface AbilityIncrease {
  /** f.eks. 'class:fighter:4' */
  source: string
  ability: Ability
  amount: number
}

/* ------------------------------------------------------------------ */
/* Kampmodus                                                           */
/* ------------------------------------------------------------------ */

/** Effekt med varighet i runder (spells, Rage, Dodge …). rounds = undefined: varer til den fjernes */
export interface CombatEffect {
  uid: string
  name: string
  rounds?: number
  note?: string
  /** Slår på en aktiv tilstand (f.eks. 'raging') mens effekten varer */
  state?: string
  concentration?: boolean
  spellId?: string
  /** uid-er i character.customEffects som denne effekten la til (fjernes når effekten slutter) */
  charEffects?: string[]
  /** Temp HP i starten av hver av dine turer (Heroism) */
  tempEachTurn?: number
}

export interface Combatant {
  uid: string
  name: string
  init: number
  /** Karakteren selv */
  self?: boolean
  ally?: boolean
  hp?: number
  maxHp?: number
  ac?: number
  conditions?: string[]
  defeated?: boolean
  note?: string
  /** Koblet til en companion på karakteren: HP-endringer skrives tilbake dit */
  companionUid?: string
}

export interface CombatLogEntry {
  uid: string
  round: number
  kind: 'attack' | 'damage' | 'heal' | 'spell' | 'save' | 'feature' | 'turn' | 'info' | 'death' | 'action'
  text: string
}

export interface CombatTurn {
  action: boolean
  bonus: boolean
  reaction: boolean
  /** Fot brukt av bevegelsen denne turen */
  movement: number
  /** Antall angrep brukt i Attack-handlingen */
  attacks: number
  /** 2024: maks én spell slot per tur */
  slotUsed: boolean
  dashed: boolean
  interaction: boolean
  /** Light-våpenet (angreps-nøkkel) du angrep med i Attack-handlingen – åpner for ekstra-angrep med et annet våpen */
  lightUsed?: string
  /** Ekstra-angrepet (Light/Nick/Dual Wielder) er brukt denne turen */
  offhandDone?: boolean
  /** Sneak Attack er brukt denne turen */
  sneakUsed?: boolean
}

/** Pågående kamp – lagres på karakteren så den overlever omstart */
export interface CombatState {
  /** 'physical' = ekte terninger (skriv inn resultater), 'app' = rull i appen */
  dice: 'physical' | 'app'
  round: number
  /** Indeks i initiativ-rekkefølgen (sortert) */
  turnIdx: number
  combatants: Combatant[]
  turn: CombatTurn
  effects: CombatEffect[]
  concentration?: { name: string; spellId?: string; since: number }
  log: CombatLogEntry[]
  stats: { dealt: number; taken: number; healed: number; spells: number; crits: number; hits: number; misses: number }
  startedAt: string
}

export interface Character {
  id: string
  schemaVersion: 1
  createdAt: string
  updatedAt: string

  name: string
  playerName: string
  portrait?: string // data-URL
  alignment: string
  xp: number

  classes: ClassEntry[]
  speciesId: string
  speciesOptionId?: string
  /** Gud (cleric/paladin) eller patron (warlock) – id i deities-dataene */
  deityId?: string
  /** Størrelse når species tillater valg (Human/Tiefling: Small eller Medium) */
  size?: string
  backgroundId: string

  abilityMethod: 'standard' | 'pointBuy' | 'roll' | 'manual'
  baseAbilities: Record<Ability, number>
  /** Background-bonus: +2/+1 eller +1/+1/+1 */
  backgroundBonus: Partial<Record<Ability, number>>
  abilityIncreases: AbilityIncrease[]

  /** Generelle valg, nøkkel = choice-id med prefiks, f.eks. 'class:fighter:skills' */
  choices: Record<string, string[]>
  feats: CharacterFeat[]
  spells: CharacterSpell[]
  inventory: InventoryItem[]
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number }
  /** Våpen-ids man har valgt Weapon Mastery for */
  weaponMasteries: string[]

  hp: { current: number; temp: number }
  hitDiceUsed: Record<string, number> // '10' -> brukt
  deathSaves: { successes: number; failures: number }
  spellSlotsUsed: number[] // index 0 = 1st level
  pactSlotsUsed: number
  featureUses: Record<string, number> // feature-id -> brukt
  conditions: string[]
  exhaustion: number
  /** Aktive tilstander som slår på betingede effects, f.eks. 'raging', 'mage-armor' */
  activeStates: string[]
  heroicInspiration: boolean

  /** Ekstra proficiencies lagt inn manuelt */
  extra: {
    skills: SkillId[]
    expertise: SkillId[]
    saves: Ability[]
    armor: ArmorCategory[]
    weapons: string[]
    tools: string[]
    languages: string[]
  }

  details: {
    gender: string
    age: string
    height: string
    weight: string
    eyes: string
    hair: string
    skin: string
    faith: string
    appearance: string
    personality: string
    ideals: string
    bonds: string
    flaws: string
    backstory: string
    allies: string
    notes: string
  }

  /** Homebrew som bare gjelder denne karakteren */
  customEntities: AnyEntity[]
  /** Egne features (fritekst) */
  customFeatures: Feature[]
  /** Manuelle overstyringer av beregnede felt: 'ac' | 'initiative' | 'skill.stealth' | 'save.dex' | 'hp.max' ... */
  overrides: Record<string, number | string>
  /** Egne justeringer som legges OPPÅ den automatiske utregningen (f.eks. 'ability.str': 2). Samme nøkler som overrides. */
  adjustments?: Record<string, number>
  /** Manuelle effects (f.eks. "+1 AC fra velsignelse") */
  customEffects: (Effect & { uid: string; label: string; active: boolean })[]

  settings: { hpMethod: 'fixed' | 'roll' }
  /** Pågående kamp (kampmodus) */
  combat?: CombatState
  /** Druid Wild Shape: kjente beast-former (creature-ids) og ev. aktiv form */
  wildShape?: { knownForms: string[]; activeForm?: string }
  /** Familiars, dyrevenner, steeds, summons */
  companions?: Companion[]
  /** Sesjonsdagbok (med XP) */
  journal?: JournalEntry[]
}

export interface Companion {
  uid: string
  creatureId?: string
  name: string
  hp: number
  maxHp: number
  temp: number
  ac?: number
  kind: 'familiar' | 'companion' | 'steed' | 'summon' | 'other'
  notes?: string
}

export interface JournalEntry {
  id: string
  /** ISO-dato (YYYY-MM-DD) */
  date: string
  title: string
  text: string
  xp?: number
}
