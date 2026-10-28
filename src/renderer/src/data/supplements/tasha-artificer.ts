import type { ClassDef, ClassLevelRow, ClassOptionGroup, Feature, SubclassDef } from '../../types'
import { TCE, ft, sub } from './tasha-subclasses'

/**
 * The Artificer class and its four specialists as printed in Tasha's Cauldron of Everything (2020).
 * TCE is not open-licensed: only names, game-mechanical facts and short summaries in our own words.
 * Read the full text in the book or on D&D Beyond.
 */

const OWN = '*Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'

/* ------------------------------ Spell list ------------------------------ */

/** Artificer spell list from Tasha's Cauldron of Everything (ids in this app). data/index.ts adds 'artificer' to these spells. */
export const ARTIFICER_SPELL_IDS: string[] = [
  // Cantrips
  'acid-splash', 'sup-booming-blade', 'sup-create-bonfire', 'dancing-lights', 'fire-bolt', 'sup-frostbite', 'sup-green-flame-blade',
  'guidance', 'light', 'sup-lightning-lure', 'mage-hand', 'sup-magic-stone', 'mending', 'message', 'mind-sliver', 'poison-spray',
  'prestidigitation', 'ray-of-frost', 'resistance', 'shocking-grasp', 'spare-the-dying', 'sup-sword-burst', 'thorn-whip', 'thunderclap',
  // Level 1
  'sup-absorb-elements', 'alarm', 'sup-catapult', 'cure-wounds', 'detect-magic', 'disguise-self', 'expeditious-retreat', 'faerie-fire',
  'false-life', 'feather-fall', 'grease', 'identify', 'jump', 'longstrider', 'purify-food-and-drink', 'sanctuary', 'sup-snare',
  'sup-tashas-caustic-brew',
  // Level 2
  'aid', 'alter-self', 'arcane-lock', 'blur', 'continual-flame', 'darkvision', 'enhance-ability', 'enlarge-reduce', 'heat-metal',
  'invisibility', 'lesser-restoration', 'levitate', 'magic-mouth', 'magic-weapon', 'protection-from-poison', 'sup-pyrotechnics',
  'rope-trick', 'see-invisibility', 'sup-skywrite', 'spider-climb', 'web',
  // Level 3
  'blink', 'sup-catnap', 'create-food-and-water', 'dispel-magic', 'elemental-weapon', 'sup-flame-arrows', 'fly', 'glyph-of-warding',
  'haste', 'sup-intellect-fortress', 'protection-from-energy', 'revivify', 'sup-tiny-servant', 'water-breathing', 'water-walk',
  // Level 4
  'arcane-eye', 'sup-elemental-bane', 'fabricate', 'freedom-of-movement', 'secret-chest', 'faithful-hound', 'private-sanctum',
  'resilient-sphere', 'stone-shape', 'stoneskin', 'summon-construct',
  // Level 5
  'animate-objects', 'arcane-hand', 'creation', 'greater-restoration', 'sup-skill-empowerment', 'sup-transmute-rock', 'wall-of-stone'
]

/* -------------------------------- Table -------------------------------- */

const PB = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
/** Fixed per-level numbers (2024 half-caster style). TCE itself uses Intelligence modifier + half your Artificer level (minimum 1). */
const PREPARED = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]
const CANTRIPS = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4]
const INFUSIONS_KNOWN = [0, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8, 10, 10, 10, 10, 12, 12, 12]
const INFUSED_ITEMS = [0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6]
const SLOTS: number[][] = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]
]
const FEATURES: string[][] = [
  ['Magical Tinkering', 'Spellcasting'],
  ['Infuse Item'],
  ['Artificer Specialist', 'The Right Tool for the Job'],
  ['Ability Score Improvement'],
  ['Artificer Specialist feature'],
  ['Tool Expertise'],
  ['Flash of Genius'],
  ['Ability Score Improvement'],
  ['Artificer Specialist feature'],
  ['Magic Item Adept'],
  ['Spell-Storing Item'],
  ['Ability Score Improvement'],
  [],
  ['Magic Item Savant'],
  ['Artificer Specialist feature'],
  ['Ability Score Improvement'],
  [],
  ['Magic Item Master'],
  ['Ability Score Improvement'],
  ['Soul of Artifice']
]
const SLOT_COLS = ['1st', '2nd', '3rd', '4th', '5th']

const table: ClassLevelRow[] = PB.map((profBonus, i) => {
  const columns: Record<string, string | number> = {
    'Infusions Known': INFUSIONS_KNOWN[i] || '—',
    'Infused Items': INFUSED_ITEMS[i] || '—',
    Cantrips: CANTRIPS[i],
    'Prepared Spells': PREPARED[i]
  }
  SLOT_COLS.forEach((col, s) => {
    columns[col] = SLOTS[i][s] ?? '—'
  })
  return { level: i + 1, profBonus, features: FEATURES[i], columns }
})

/* ------------------------------- Features ------------------------------- */

const asi = (level: number): Feature =>
  ft(`artificer-asi-${level}`, 'Ability Score Improvement', level, 'Gain the Ability Score Improvement feat or another feat you qualify for.', {
    description: 'You gain the Ability Score Improvement feat or another feat of your choice for which you qualify. The Artificer gains this feature at levels 4, 8, 12, 16 and 19 (TCE has no Epic Boon; level 19 is a regular feat).'
  })

const moreInfusions = (level: number): Feature =>
  ft(`artificer-infusions-${level}`, 'Additional Infusions', level, 'You learn two more artificer infusions (see the Infusions Known column).', {
    choices: [{ id: `artificer-infusions-${level}`, label: 'Artificer infusions (2 more)', count: 2, type: 'option', filter: 'Artificer Infusions' }]
  })

const features: Feature[] = [
  ft('artificer-magical-tinkering', 'Magical Tinkering', 1, 'With Thieves’ Tools or Artisan’s Tools in hand, touch a Tiny nonmagical object as an action to give it one minor magical property: light, a short recorded message, a lingering odor or sound, or a static image.', {
    activation: 'action',
    more: 'You can keep a number of such objects active equal to your Intelligence modifier (minimum 1); making another ends the oldest.'
  }),
  ft('artificer-spellcasting', 'Spellcasting', 1, 'You cast Artificer spells with Intelligence, using Thieves’ Tools, any Artisan’s Tools or an infused item as your focus. You prepare spells from the Artificer list after each Long Rest and can cast prepared ritual spells as rituals.', {
    more: 'The class table shows your cantrips and spell slots (half-caster progression, but with slots from level 1). In TCE your prepared spells equal your Intelligence modifier + half your Artificer level (minimum 1); this app uses fixed per-level numbers like other 2024 half-casters. You must have a tool or infused item in hand when you cast — your magic visibly comes out of your gear.'
  }),
  ft('artificer-infuse-item', 'Infuse Item', 2, 'You learn four infusions and, after a Long Rest, can turn nonmagical objects into magic items with them; the number of infused items you can keep is shown in the Infused Items column.', {
    activation: 'special',
    more: 'Each infusion goes on a different object, the item must meet the infusion’s requirements, and attunement works normally. If you exceed your limit, the oldest infusion ends. You can swap one known infusion whenever you gain an Artificer level.',
    choices: [{ id: 'artificer-infusions-2', label: 'Artificer infusions', count: 4, type: 'option', filter: 'Artificer Infusions' }]
  }),
  ft('artificer-specialist', 'Artificer Specialist', 3, 'Choose your specialization: Alchemist, Armorer, Artillerist or Battle Smith. It grants features at levels 3, 5, 9 and 15.'),
  ft('artificer-right-tool', 'The Right Tool for the Job', 3, 'With Thieves’ Tools or Artisan’s Tools in hand, you can spend 1 hour (during a Short or Long Rest if you like) to magically create one set of Artisan’s Tools; they vanish if you use this feature again.', { activation: 'special' }),
  asi(4),
  moreInfusions(6),
  ft('artificer-tool-expertise', 'Tool Expertise', 6, 'Your Proficiency Bonus is doubled for any ability check that uses a tool you are proficient with.'),
  ft('artificer-flash-of-genius', 'Flash of Genius', 7, 'As a Reaction when you or a creature you can see within 30 feet makes an ability check or saving throw, add your Intelligence modifier to the roll.', {
    activation: 'reaction',
    uses: { count: 'max(1,mod.int)', recharge: 'long' }
  }),
  asi(8),
  moreInfusions(10),
  ft('artificer-magic-item-adept', 'Magic Item Adept', 10, 'You can attune to up to four magic items at once, and crafting a Common or Uncommon magic item takes you a quarter of the normal time and half the usual gold.'),
  ft('artificer-spell-storing-item', 'Spell-Storing Item', 11, 'After a Long Rest, store a level 1 or 2 Artificer spell with a casting time of an action in a weapon or focus you touch; whoever holds it can use an action to produce the spell using your casting ability.', {
    activation: 'action',
    more: 'The item holds the spell for a number of uses equal to twice your Intelligence modifier (minimum 2) or until you store another spell.',
    uses: { count: 'max(2,mod.int*2)', recharge: 'long' }
  }),
  asi(12),
  moreInfusions(14),
  ft('artificer-magic-item-savant', 'Magic Item Savant', 14, 'You can attune to up to five magic items at once and ignore all class, species, spell and level requirements for attuning to or using magic items.'),
  asi(16),
  moreInfusions(18),
  ft('artificer-magic-item-master', 'Magic Item Master', 18, 'You can attune to up to six magic items at once.'),
  asi(19),
  ft('artificer-soul-of-artifice', 'Soul of Artifice', 20, 'You gain +1 to all saving throws for each magic item you are attuned to, and when you drop to 0 Hit Points without dying, you can use your Reaction to end one of your infusions and drop to 1 Hit Point instead.', {
    activation: 'reaction'
  })
]

export const artificerClass: ClassDef = {
  id: 'artificer',
  name: 'Artificer',
  kind: 'class',
  source: 'Supplement',
  sourceBook: TCE,
  summary: 'A magical inventor who channels spells through tools, infuses everyday objects with magic, and specializes as an alchemist, armorer, artillerist or battle smith.',
  description: `## Core Artificer Traits

| Trait | |
|---|---|
| **Primary Ability** | Intelligence |
| **Hit Point Die** | D8 per Artificer level |
| **Saving Throw Proficiencies** | Constitution and Intelligence |
| **Skill Proficiencies** | *Choose 2:* Arcana, History, Investigation, Medicine, Nature, Perception or Sleight of Hand |
| **Weapon Proficiencies** | Simple weapons |
| **Tool Proficiencies** | Thieves’ Tools, Tinker’s Tools and one type of Artisan’s Tools |
| **Armor Training** | Light and Medium armor and Shields |

Artificers treat magic as an engineering discipline. Instead of prayers or incantations they cast through tools — a spell might come out of a wand-like gadget, a vial or a spray of sparks from tinker’s tools. Their signature trick is infusing mundane gear with temporary magic, and their specialist path decides whether they brew elixirs, wear power armor, build an arcane cannon or fight beside a steel defender.

**Multiclassing:** requires Intelligence 13; you gain Light and Medium armor, Shields, Thieves’ Tools and Tinker’s Tools. For multiclass spell slots, add half your Artificer levels, rounded up.

${OWN}`,
  tags: ['spellcaster', 'half-caster', 'supplement', 'tce'],
  hitDie: 8,
  primaryAbility: ['int'],
  savingThrows: ['con', 'int'],
  skillChoices: { count: 2, options: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleightOfHand'] },
  weaponProficiencies: ['simple'],
  armorTraining: ['light', 'medium', 'shield'],
  toolProficiencies: ['thieves-tools', 'tinkers-tools', 'choice:artisan:1'],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'studded-leather-armor' },
        { id: 'dagger' },
        { id: 'light-crossbow' },
        { id: 'bolts', qty: 20 },
        { id: 'crossbow-bolt-case' },
        { id: 'thieves-tools' },
        { id: 'dungeoneers-pack' }
      ],
      gp: 15
    },
    { label: 'B', items: [], gp: 150 }
  ],
  subclassLevel: 3,
  table,
  features,
  spellcasting: {
    ability: 'int',
    progression: 'half',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'artificer',
    ritualCasting: true,
    focus: 'Thieves’ Tools, any Artisan’s Tools you are proficient with, or an item you infused'
  },
  multiclass: { prerequisite: 'Intelligence 13', proficiencies: 'Light and Medium armor, Shields, Thieves’ Tools and Tinker’s Tools' },
  quickBuild:
    'Put your highest score in Intelligence, then Constitution (or Dexterity if you plan to fight at range). The Artisan or Sage background fits well. Start with Guidance and Mending (or Fire Bolt) as cantrips and prepare Cure Wounds and Faerie Fire. At level 2, Enhanced Defense and Enhanced Weapon (or Enhanced Arcane Focus) are reliable first infusions.',
  tips: [
    'Infusions are your biggest power spike: hand them to party members, not just yourself — a +1 shield or a Bag of Holding helps everyone.',
    'You can wear Medium armor and a Shield; with Enhanced Defense you can be one of the hardest party members to hit.',
    'Flash of Genius at level 7 is a free bonus to a failed save or check for anyone nearby — save some uses for the party.',
    'Your spells need a tool or infused item in hand, so plan which hand holds the focus.',
    'Battle Smith and Armorer want to be in melee; Alchemist and Artillerist play better from the back line.'
  ],
  recommended: {
    species: ['gnome', 'dwarf', 'human', 'goliath', 'halfling'],
    backgrounds: ['artisan', 'sage', 'guide', 'criminal'],
    feats: ['war-caster', 'resilient', 'alert', 'crafter', 'fey-touched', 'lucky'],
    cantrips: ['guidance', 'mending', 'fire-bolt', 'sup-booming-blade', 'mind-sliver'],
    spells: ['cure-wounds', 'faerie-fire', 'grease', 'sup-absorb-elements', 'heat-metal', 'aid', 'web', 'haste', 'revivify'],
    weapons: ['light-crossbow', 'dagger', 'mace', 'spear']
  }
}

/* ------------------------------ Infusions ------------------------------ */

type OptionItem = ClassOptionGroup['items'][number]

const inf = (id: string, name: string, item: string, summary: string, extra: { level?: number; attunement?: boolean; more?: string; effects?: OptionItem['effects'] } = {}): OptionItem => {
  const pre = extra.level ? `Level ${extra.level}+ Artificer` : undefined
  return {
    id,
    name,
    summary,
    description: `${pre ? `*Prerequisite: ${pre}*\n\n` : ''}*Item: ${item}${extra.attunement ? ' (requires attunement)' : ''}*\n\n${summary}${extra.more ? `\n\n${extra.more}` : ''}\n\n${OWN}`,
    activation: 'passive',
    source: 'Supplement',
    ...(pre ? { prerequisite: pre, level: extra.level } : { level: 2 }),
    ...(extra.effects ? { effects: extra.effects } : {})
  }
}

export const artificerInfusions: ClassOptionGroup = {
  classId: 'artificer',
  group: 'Artificer Infusions',
  source: 'Supplement',
  items: [
    inf('infusion-arcane-propulsion-armor', 'Arcane Propulsion Armor', 'A suit of armor', 'Your Speed increases by 5 feet, the armor’s gauntlets become magic weapons that deal 1d8 force damage and can be thrown 20/60 feet before flying back, and the armor can’t be removed against your will and replaces missing limbs.', { level: 14, attunement: true }),
    inf('infusion-armor-of-magical-strength', 'Armor of Magical Strength', 'A suit of armor', 'The armor has 6 charges (regaining 1d6 at dawn). Spend one to add your Intelligence modifier to a Strength check or save, or as a Reaction to avoid being knocked Prone.', { level: 10, attunement: true }),
    inf('infusion-boots-of-the-winding-path', 'Boots of the Winding Path', 'A pair of boots', 'As a Bonus Action, teleport up to 15 feet back to an unoccupied space you occupied earlier this turn.', { level: 6, attunement: true }),
    inf('infusion-enhanced-arcane-focus', 'Enhanced Arcane Focus', 'A rod, staff or wand', 'While holding it, you gain +1 to spell attack rolls (+2 from Artificer level 10), and your spell attacks ignore Half Cover.', { attunement: true }),
    inf('infusion-enhanced-defense', 'Enhanced Defense', 'A suit of armor or a Shield', 'The armor or Shield grants +1 AC while worn (+2 from Artificer level 10).'),
    inf('infusion-enhanced-weapon', 'Enhanced Weapon', 'A simple or martial weapon', 'The weapon becomes magical with +1 to attack and damage rolls (+2 from Artificer level 10).'),
    inf('infusion-helm-of-awareness', 'Helm of Awareness', 'A helmet', 'You have Advantage on Initiative rolls and can’t be surprised while you aren’t Incapacitated.', {
      level: 10, attunement: true, effects: [{ target: 'initiative', op: 'advantage', note: 'Helm of Awareness' }]
    }),
    inf('infusion-homunculus-servant', 'Homunculus Servant', 'A gem or crystal worth at least 100 GP', 'Create a loyal Tiny homunculus companion that acts after you on your Initiative, can deliver your touch spells and fights with a force-damage strike; its stat block scales with your level.'),
    inf('infusion-mind-sharpener', 'Mind Sharpener', 'A suit of armor or robes', 'The item has 4 charges (regaining 1d4 at dawn). When you fail a Constitution save to keep Concentration, spend a charge as a Reaction to succeed instead.', { attunement: true }),
    inf('infusion-radiant-weapon', 'Radiant Weapon', 'A simple or martial weapon', 'The weapon is +1, sheds light on command, and has 4 charges (regaining 1d4 at dawn): as a Reaction when hit by an attack, spend one to try to Blind the attacker (Con save).', { level: 6, attunement: true }),
    inf('infusion-repeating-shot', 'Repeating Shot', 'A simple or martial weapon with the Ammunition property', 'The weapon is +1, ignores the Loading property and creates its own magical ammunition when fired.', { attunement: true }),
    inf('infusion-replicate-magic-item', 'Replicate Magic Item', 'Varies', 'Learn the plans for one magic item from the Replicable Magic Items tables and make it with this infusion; you can learn this infusion several times, choosing a different item each time.', {
      more: 'Items unlock by Artificer level — for example Bag of Holding, Goggles of Night or Sending Stones from level 2, Boots of Elvenkind or Lantern of Revealing from level 6, Bracers of Archery or Cloak of Protection from level 10, and Boots of Speed or Ring of Protection from level 14.'
    }),
    inf('infusion-repulsion-shield', 'Repulsion Shield', 'A Shield', 'The shield grants an extra +1 AC and has 4 charges (regaining 1d4 at dawn): as a Reaction when a creature hits you with a melee attack, push it up to 15 feet away.', { level: 6, attunement: true }),
    inf('infusion-resistant-armor', 'Resistant Armor', 'A suit of armor', 'While wearing it you have Resistance to one damage type chosen when you infuse it (acid, cold, fire, force, lightning, necrotic, poison, psychic, radiant or thunder).', { level: 6, attunement: true }),
    inf('infusion-returning-weapon', 'Returning Weapon', 'A simple or martial weapon with the Thrown property', 'The weapon is +1 and flies back to your hand right after you use it for a ranged attack.'),
    inf('infusion-spell-refueling-ring', 'Spell-Refueling Ring', 'A ring', 'As an action, regain one expended spell slot of level 3 or lower; usable once per day (dawn).', { level: 6, attunement: true })
  ]
}

const armorModel = (id: string, name: string, summary: string, effects: OptionItem['effects']): OptionItem => ({
  id, name, summary, description: `${summary}\n\n${OWN}`, activation: 'passive', source: 'Supplement', prerequisite: 'Armorer', effects
})

export const armorerModels: ClassOptionGroup = {
  classId: 'artificer',
  group: 'Armor Model',
  source: 'Supplement',
  items: [
    armorModel('armor-model-guardian', 'Guardian', 'Thunder Gauntlets (1d8 thunder; a creature you hit has Disadvantage on attacks against anyone but you until your next turn) and Defensive Field (Bonus Action: Temporary Hit Points equal to your Artificer level, Proficiency Bonus times per Long Rest).', []),
    armorModel('armor-model-infiltrator', 'Infiltrator', 'Lightning Launcher (ranged 90/300, 1d6 lightning, once per turn +1d6 lightning on a hit), Powered Steps (+5 feet Speed) and Dampening Field (Advantage on Stealth; the armor imposes no Stealth Disadvantage).', [
      { target: 'speed', op: 'add', value: 5, condition: 'arcaneArmor', note: 'Infiltrator: Powered Steps' },
      { target: 'skill.stealth', op: 'advantage', condition: 'arcaneArmor', note: 'Infiltrator: Dampening Field' }
    ])
  ]
}

/* ------------------------------ Subclasses ------------------------------ */

const toolProf = (id: string, name: string, toolId: string, toolName: string): Feature =>
  ft(id, name, 3, `You gain proficiency with ${toolName}; if you already have it, choose another type of Artisan’s Tools.`, {
    effects: [{ target: 'proficiency.tool', op: 'grant', value: toolId, note: name }]
  })

const specSpells = (id: string, name: string, rows: [number, string][]): Feature =>
  ft(id, name, 3, 'You always have certain spells prepared at Artificer levels 3, 5, 9, 13 and 17; they don’t count against your prepared spells.', {
    description: `You always have these spells prepared once you reach the Artificer level shown; they don’t count against your prepared spells.\n\n| Level | Spells |\n|---|---|\n${rows.map(([l, s]) => `| ${l} | ${s} |`).join('\n')}`
  })

const extraAttack = (id: string): Feature => ft(id, 'Extra Attack', 5, 'You can attack twice instead of once whenever you take the Attack action on your turn.')

const alchemist = sub({
  id: 'alchemist',
  name: 'Alchemist',
  classId: 'artificer',
  summary: 'An artificer who brews daily experimental elixirs and empowers healing and acid, fire, necrotic or poison spells.',
  description: `Alchemists combine reagents to produce magical effects. Every day they brew free elixirs with random benefits, add their Intelligence to healing and caustic spells, and eventually cure conditions and resist acid and poison.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['healing-word', 'ray-of-sickness'] },
    { level: 5, spells: ['flaming-sphere', 'acid-arrow'] },
    { level: 9, spells: ['gaseous-form', 'mass-healing-word'] },
    { level: 13, spells: ['blight', 'death-ward'] },
    { level: 17, spells: ['cloudkill', 'raise-dead'] }
  ],
  features: [
    toolProf('alchemist-tool-proficiency', 'Tool Proficiency', 'alchemists-supplies', 'Alchemist’s Supplies'),
    specSpells('alchemist-spells', 'Alchemist Spells', [[3, 'Healing Word, Ray of Sickness'], [5, 'Flaming Sphere, Melf’s Acid Arrow'], [9, 'Gaseous Form, Mass Healing Word'], [13, 'Blight, Death Ward'], [17, 'Cloudkill, Raise Dead']]),
    ft('alchemist-experimental-elixir', 'Experimental Elixir', 3, 'After each Long Rest, produce one free elixir with a random effect (d6); you can make more by expending spell slots (one elixir per slot, effect of your choice). Drinking or administering one takes an action.', {
      activation: 'action',
      more: 'Effects: 1 Healing (2d4 + Int mod HP), 2 Swiftness (+10 ft Speed for 1 hour), 3 Resilience (+1 AC for 10 minutes), 4 Boldness (+1d4 to attack rolls and saves for 1 minute), 5 Flight (Fly Speed 10 ft for 10 minutes), 6 Transformation (Alter Self for 10 minutes). Free elixirs per Long Rest: 1, 2 at level 6, 3 at level 15. Unused elixirs lose potency after your next Long Rest.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('alchemist-alchemical-savant', 'Alchemical Savant', 5, 'When you cast a spell using Alchemist’s Supplies as your focus, add your Intelligence modifier (minimum +1) to one roll that restores Hit Points or deals acid, fire, necrotic or poison damage.'),
    ft('alchemist-restorative-reagents', 'Restorative Reagents', 9, 'Your elixirs also grant 2d6 + your Intelligence modifier Temporary Hit Points, and you can cast Lesser Restoration without a slot or preparing it, using Alchemist’s Supplies.', {
      activation: 'action',
      uses: { count: 'max(1,mod.int)', recharge: 'long' }
    }),
    ft('alchemist-chemical-mastery', 'Chemical Mastery', 15, 'You have Resistance to acid and poison damage and immunity to the Poisoned condition, and once per Long Rest each you can cast Greater Restoration and Heal without a slot or preparing them.', {
      uses: { count: 2, recharge: 'long' },
      effects: [
        { target: 'resistance', op: 'grant', value: 'acid', note: 'Chemical Mastery' },
        { target: 'resistance', op: 'grant', value: 'poison', note: 'Chemical Mastery' },
        { target: 'conditionImmunity', op: 'grant', value: 'poisoned', note: 'Chemical Mastery' }
      ]
    })
  ]
})

const armorer = sub({
  id: 'armorer',
  name: 'Armorer',
  classId: 'artificer',
  summary: 'An artificer who turns their armor into a magical power suit, built either as a sturdy Guardian or a stealthy, lightning-shooting Infiltrator.',
  description: `Armorers rebuild their armor into Arcane Armor that serves as a spellcasting focus, ignores Strength requirements and can’t be pulled off. The Guardian model taunts foes with thunder gauntlets and shields itself; the Infiltrator model fires lightning and moves silently. Later the armor holds extra infusions and gains a signature trick.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['magic-missile', 'thunderwave'] },
    { level: 5, spells: ['mirror-image', 'shatter'] },
    { level: 9, spells: ['hypnotic-pattern', 'lightning-bolt'] },
    { level: 13, spells: ['fire-shield', 'greater-invisibility'] },
    { level: 17, spells: ['passwall', 'wall-of-force'] }
  ],
  features: [
    ft('armorer-tools-of-the-trade', 'Tools of the Trade', 3, 'You gain training with Heavy armor and proficiency with Smith’s Tools (or another Artisan’s Tools if you already have them).', {
      effects: [
        { target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Tools of the Trade' },
        { target: 'proficiency.tool', op: 'grant', value: 'smiths-tools', note: 'Tools of the Trade' }
      ]
    }),
    specSpells('armorer-spells', 'Armorer Spells', [[3, 'Magic Missile, Thunderwave'], [5, 'Mirror Image, Shatter'], [9, 'Hypnotic Pattern, Lightning Bolt'], [13, 'Fire Shield, Greater Invisibility'], [17, 'Passwall, Wall of Force']]),
    ft('armorer-arcane-armor', 'Arcane Armor', 3, 'As an action with Smith’s Tools, turn armor you wear into Arcane Armor: it ignores Strength requirements, works as a spellcasting focus, covers your whole body, replaces missing limbs and can’t be removed against your will. You can don or doff it as an action.', { activation: 'action' }),
    ft('armorer-armor-model', 'Armor Model', 3, 'Choose Guardian or Infiltrator; the model grants special built-in weapons that use Intelligence, and you can switch models after a Short or Long Rest with Smith’s Tools.', {
      choices: [{ id: 'armorer-armor-model', label: 'Armor Model', count: 1, type: 'option', filter: 'Armor Model', options: ['armor-model-guardian', 'armor-model-infiltrator'] }]
    }),
    extraAttack('armorer-extra-attack'),
    ft('armorer-armor-modifications', 'Armor Modifications', 9, 'Your Arcane Armor counts as four separate items for infusions — armor, boots, helmet and the special weapon — and your Infused Items limit rises by 2 for infusions placed on these parts.'),
    ft('armorer-perfected-armor', 'Perfected Armor', 15, 'Guardian: as a Reaction, pull a Huge or smaller creature that ends its turn within 30 feet up to 30 feet toward you (Str save) and strike it with your gauntlets. Infiltrator: creatures hit by your Lightning Launcher glimmer, granting Advantage on the next attack against them, which deals an extra 1d6 lightning damage.', {
      activation: 'special',
      uses: { count: 'prof', recharge: 'long' }
    })
  ]
})

const artillerist = sub({
  id: 'artillerist',
  name: 'Artillerist',
  classId: 'artificer',
  summary: 'An artificer specializing in explosive magic: builds an Eldritch Cannon that blasts, pushes or shields and channels spells through an arcane firearm.',
  description: `Artillerists build a small magical cannon that can spray fire, fire bolts of force or shield allies with Temporary Hit Points, and they boost damaging spells cast through a wand, staff or rod turned into an arcane firearm. Later the cannon can explode, and they can run two at once.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['shield', 'thunderwave'] },
    { level: 5, spells: ['scorching-ray', 'shatter'] },
    { level: 9, spells: ['fireball', 'wind-wall'] },
    { level: 13, spells: ['ice-storm', 'wall-of-fire'] },
    { level: 17, spells: ['cone-of-cold', 'wall-of-force'] }
  ],
  features: [
    toolProf('artillerist-tool-proficiency', 'Tool Proficiency', 'woodcarvers-tools', 'Woodcarver’s Tools'),
    specSpells('artillerist-spells', 'Artillerist Spells', [[3, 'Shield, Thunderwave'], [5, 'Scorching Ray, Shatter'], [9, 'Fireball, Wind Wall'], [13, 'Ice Storm, Wall of Fire'], [17, 'Cone of Cold, Wall of Force']]),
    ft('artillerist-eldritch-cannon', 'Eldritch Cannon', 3, 'As an action with Woodcarver’s or Smith’s Tools, create a Small or Tiny cannon for 1 hour (AC 18, 5 × Artificer level HP). As a Bonus Action within 60 feet, fire it as a Flamethrower, Force Ballista or Protector.', {
      activation: 'action',
      more: 'Flamethrower: 15-foot cone, Dex save, 2d8 fire. Force Ballista: ranged spell attack within 120 feet, 2d8 force and a 5-foot push. Protector: you and creatures within 10 feet gain 1d8 + Int mod Temporary Hit Points. Regain the use after a Long Rest or by expending a spell slot.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('artillerist-arcane-firearm', 'Arcane Firearm', 5, 'Carve sigils into a wand, staff or rod to make it your arcane firearm; when you cast an Artificer spell through it, add 1d8 to one of the spell’s damage rolls.'),
    ft('artillerist-explosive-cannon', 'Explosive Cannon', 9, 'Your cannon’s damage rolls increase by 1d8, and as an action you can detonate a cannon within 60 feet: creatures within 20 feet of it make a Dexterity save or take 3d8 force damage (half on a success).', { activation: 'action' }),
    ft('artillerist-fortified-position', 'Fortified Position', 15, 'You and your allies have Half Cover within 10 feet of your cannon, and you can keep two cannons at once, creating both with one action and activating both with one Bonus Action.')
  ]
})

const battleSmith = sub({
  id: 'battle-smith',
  name: 'Battle Smith',
  classId: 'artificer',
  summary: 'A front-line artificer who fights with Intelligence-powered magic weapons alongside a loyal Steel Defender construct.',
  description: `Battle Smiths are soldiers, medics and engineers in one. They swing magic weapons with Intelligence, build a Steel Defender that guards and repairs, attack twice from level 5, and later jolt foes with force or heal allies through their strikes.\n\nThe 2014 spell Branding Smite became Shining Smite in the 2024 Player’s Handbook, so that is the always-prepared spell here.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['heroism', 'shield'] },
    { level: 5, spells: ['shining-smite', 'warding-bond'] },
    { level: 9, spells: ['aura-of-vitality', 'conjure-barrage'] },
    { level: 13, spells: ['aura-of-purity', 'fire-shield'] },
    { level: 17, spells: ['banishing-smite', 'mass-cure-wounds'] }
  ],
  features: [
    toolProf('battle-smith-tool-proficiency', 'Tool Proficiency', 'smiths-tools', 'Smith’s Tools'),
    specSpells('battle-smith-spells', 'Battle Smith Spells', [[3, 'Heroism, Shield'], [5, 'Shining Smite (Branding Smite), Warding Bond'], [9, 'Aura of Vitality, Conjure Barrage'], [13, 'Aura of Purity, Fire Shield'], [17, 'Banishing Smite, Mass Cure Wounds']]),
    ft('battle-smith-battle-ready', 'Battle Ready', 3, 'You gain proficiency with Martial weapons, and you can use Intelligence instead of Strength or Dexterity for attack and damage rolls with magic weapons.', {
      effects: [{ target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Battle Ready' }]
    }),
    ft('battle-smith-steel-defender', 'Steel Defender', 3, 'You build a Medium construct companion that acts after you on your Initiative, Dodges unless you command it with a Bonus Action, and can use its Reaction to impose Disadvantage on an attack against a nearby creature.', {
      activation: 'bonus',
      more: 'Its stat block scales with your level and Intelligence; it can repair itself or other constructs, and if it dies you can revive it with an action and a spell slot within an hour, or build a new one after a Long Rest.'
    }),
    extraAttack('battle-smith-extra-attack'),
    ft('battle-smith-arcane-jolt', 'Arcane Jolt', 9, 'Once per turn when you hit with a magic weapon or your Steel Defender hits, channel magic to deal an extra 2d6 force damage or restore 2d6 Hit Points to a creature within 30 feet of the target.', {
      activation: 'special',
      uses: { count: 'max(1,mod.int)', recharge: 'long' }
    }),
    ft('battle-smith-improved-defender', 'Improved Defender', 15, 'Arcane Jolt becomes 4d6, your Steel Defender gains +2 AC, and its deflecting Reaction also deals 1d4 + your Intelligence modifier force damage to the attacker.')
  ]
})

export const artificerSubclasses: SubclassDef[] = [alchemist, armorer, artillerist, battleSmith]
