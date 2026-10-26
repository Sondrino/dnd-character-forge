import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow } from '../../types'

const ASI_TEXT = `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Ranger levels 8, 12, and 16.`

const asi = (level: number) => ({
  id: `ranger-asi-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive' as const
})

const PB = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
const FAVORED_ENEMY = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
const PREPARED = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]
/** Half-caster spell slots (Paladin/Ranger), level 1–5 spells */
const SLOTS: number[][] = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]
]
const FEATURES: string[][] = [
  ['Spellcasting', 'Favored Enemy', 'Weapon Mastery'],
  ['Deft Explorer', 'Fighting Style'],
  ['Ranger Subclass'],
  ['Ability Score Improvement'],
  ['Extra Attack'],
  ['Roving'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Expertise'],
  ['Tireless'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Relentless Hunter'],
  ['Nature’s Veil'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Precise Hunter'],
  ['Feral Senses'],
  ['Epic Boon'],
  ['Foe Slayer']
]
const SLOT_COLS = ['1st', '2nd', '3rd', '4th', '5th']

const table: ClassLevelRow[] = PB.map((profBonus, i) => {
  const columns: Record<string, string | number> = {
    'Favored Enemy': FAVORED_ENEMY[i],
    'Prepared Spells': PREPARED[i],
    'Weapon Mastery': 2
  }
  SLOT_COLS.forEach((col, s) => {
    columns[col] = SLOTS[i][s] ?? '—'
  })
  return { level: i + 1, profBonus, features: FEATURES[i], columns }
})

export const rangerClass: ClassDef = {
  id: 'ranger',
  name: 'Ranger',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A wilderness warrior and tracker who mixes weapon skill with nature magic, marking prey with Hunter’s Mark.',
  description: `## Core Ranger Traits

| Trait | |
|---|---|
| **Primary Ability** | Dexterity and Wisdom |
| **Hit Point Die** | D10 per Ranger level |
| **Saving Throw Proficiencies** | Strength and Dexterity |
| **Skill Proficiencies** | *Choose 3:* Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, or Survival |
| **Weapon Proficiencies** | Simple and Martial weapons |
| **Armor Training** | Light and Medium armor and Shields |
| **Starting Equipment** | *Choose A or B:* (A) Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Druidic Focus (sprig of mistletoe), Explorer’s Pack, and 7 GP; or (B) 150 GP |

### Becoming a Ranger …

**As a Level 1 Character**
- Gain all the traits in the Core Ranger Traits table.
- Gain the Ranger’s level 1 features, which are listed in the Ranger Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Ranger Traits table: Hit Point Die, proficiency with Martial weapons, proficiency in one skill of your choice from the Ranger’s skill list, and training with Light and Medium armor and Shields.
- Gain the Ranger’s level 1 features, which are listed in the Ranger Features table. See the multiclassing rules in “Character Creation” to determine your available spell slots.

### Ranger Class Features
As a Ranger, you gain the following class features when you reach the specified Ranger levels. These features are listed in the Ranger Features table.`,
  tags: ['martial', 'spellcaster', 'half-caster'],
  hitDie: 10,
  primaryAbility: ['dex', 'wis'],
  savingThrows: ['str', 'dex'],
  skillChoices: {
    count: 3,
    options: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival']
  },
  weaponProficiencies: ['simple', 'martial'],
  armorTraining: ['light', 'medium', 'shield'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'studded-leather-armor' },
        { id: 'scimitar' },
        { id: 'shortsword' },
        { id: 'longbow' },
        { id: 'arrows', qty: 20 },
        { id: 'quiver' },
        { id: 'druidic-focus', name: 'Druidic Focus (sprig of mistletoe)' },
        { id: 'explorers-pack' }
      ],
      gp: 7
    },
    { label: 'B', items: [], gp: 150 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'ranger-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary: 'Cast Ranger spells using Wisdom, with a Druidic Focus as your focus. You prepare spells from the Ranger list and can swap one after each Long Rest.',
      description: `You have learned to channel the magical essence of nature to cast spells. See “Spells” for the rules on spellcasting. The information below details how you use those rules with Ranger spells, which appear in the Ranger spell list later in the class’s description.

**Spell Slots.** The Ranger Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Ranger spells. Cure Wounds and Ensnaring Strike are recommended.

The number of spells on your list increases as you gain Ranger levels, as shown in the Prepared Spells column of the Ranger Features table. Whenever that number increases, choose additional Ranger spells until the number of spells on your list matches the number in the Ranger Features table. The chosen spells must be of a level for which you have spell slots. For example, if you’re a level 5 Ranger, your list of prepared spells can include six Ranger spells of level 1 or 2 in any combination.

If another Ranger feature gives you spells that you always have prepared, those spells don’t count against the number of spells you can prepare with this feature, but those spells otherwise count as Ranger spells for you.

**Changing Your Prepared Spells.** Whenever you finish a Long Rest, you can replace one spell on your list with another Ranger spell for which you have spell slots.

**Spellcasting Ability.** Wisdom is your spellcasting ability for your Ranger spells.

**Spellcasting Focus.** You can use a Druidic Focus as a Spellcasting Focus for your Ranger spells.`,
      activation: 'passive'
    },
    {
      id: 'ranger-favored-enemy',
      name: 'Favored Enemy',
      level: 1,
      summary: 'You always have Hunter’s Mark prepared and can cast it without a spell slot a number of times per Long Rest (see Favored Enemy column).',
      description: `You always have the Hunter’s Mark spell prepared. You can cast it twice without expending a spell slot, and you regain all expended uses of this ability when you finish a Long Rest.

The number of times you can cast the spell without a spell slot increases when you reach certain Ranger levels, as shown in the Favored Enemy column of the Ranger Features table.`,
      uses: { count: 'Favored Enemy', recharge: 'long' },
      activation: 'bonus'
    },
    {
      id: 'ranger-weapon-mastery',
      name: 'Weapon Mastery',
      level: 1,
      summary: 'Use the mastery properties of two kinds of weapons you are proficient with; you can change them after each Long Rest.',
      description: `Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Longbows and Shortswords.

Whenever you finish a Long Rest, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Scimitars and Longswords.`,
      activation: 'passive'
    },
    {
      id: 'ranger-deft-explorer',
      name: 'Deft Explorer',
      level: 2,
      summary: 'Gain Expertise in one skill you are proficient in, and learn two languages.',
      description: `Thanks to your travels, you gain the following benefits.

**Expertise.** Choose one of your skill proficiencies with which you lack Expertise. You gain Expertise in that skill.

**Languages.** You know two languages of your choice from the language tables in “Character Creation.”`,
      activation: 'passive',
      choices: [
        { id: 'ranger-deft-explorer-expertise', label: 'Expertise', count: 1, type: 'expertise' },
        { id: 'ranger-deft-explorer-languages', label: 'Languages', count: 2, type: 'language' }
      ]
    },
    {
      id: 'ranger-fighting-style',
      name: 'Fighting Style',
      level: 2,
      summary: 'Gain a Fighting Style feat, or choose Druidic Warrior to learn two Druid cantrips (Wisdom-based).',
      description: `You gain a Fighting Style feat of your choice (see “Feats”). Instead of choosing one of those feats, you can choose the option below.

**Druidic Warrior.** You learn two Druid cantrips of your choice (see the Druid class’s section for a list of Druid spells). Guidance and Starry Wisp are recommended. The chosen cantrips count as Ranger spells for you, and Wisdom is your spellcasting ability for them. Whenever you gain a Ranger level, you can replace one of these cantrips with another Druid cantrip.`,
      activation: 'passive',
      choices: [
        {
          id: 'ranger-fighting-style',
          label: 'Fighting Style feat (or Druidic Warrior: two Druid cantrips)',
          count: 1,
          type: 'feat',
          filter: 'fightingStyle'
        }
      ]
    },
    {
      id: 'ranger-subclass',
      name: 'Ranger Subclass',
      level: 3,
      summary: 'Choose a Ranger subclass, which grants features at levels 3, 7, 11 and 15.',
      description: `You gain a Ranger subclass of your choice. The Hunter subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Ranger levels. For the rest of your career, you gain each of your subclass’s features that are of your Ranger level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'ranger-extra-attack',
      name: 'Extra Attack',
      level: 5,
      summary: 'Attack twice whenever you take the Attack action.',
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    {
      id: 'ranger-roving',
      name: 'Roving',
      level: 6,
      summary: 'Your Speed increases by 10 feet while you aren’t wearing Heavy armor, and you gain a Climb Speed and Swim Speed equal to your Speed.',
      description: `Your Speed increases by 10 feet while you aren’t wearing Heavy armor. You also have a Climb Speed and a Swim Speed equal to your Speed.`,
      activation: 'passive',
      effects: [
        { target: 'speed', op: 'add', value: 10, condition: 'noHeavyArmor', note: 'Roving' },
        { target: 'speed.climb', op: 'set', value: 'speed', note: 'Roving: equal to your Speed' },
        { target: 'speed.swim', op: 'set', value: 'speed', note: 'Roving: equal to your Speed' }
      ]
    },
    asi(8),
    {
      id: 'ranger-expertise',
      name: 'Expertise',
      level: 9,
      summary: 'Gain Expertise in two more skills you are proficient in.',
      description: `Choose two of your skill proficiencies with which you lack Expertise. You gain Expertise in those skills.`,
      activation: 'passive',
      choices: [{ id: 'ranger-expertise-9', label: 'Expertise', count: 2, type: 'expertise' }]
    },
    {
      id: 'ranger-tireless',
      name: 'Tireless',
      level: 10,
      summary: 'Magic action: gain 1d8 + Wis mod Temporary HP (Wis mod uses per Long Rest); each Short Rest reduces your Exhaustion by 1.',
      description: `Primal forces now help fuel you on your journeys, granting you the following benefits.

**Temporary Hit Points.** As a Magic action, you can give yourself a number of Temporary Hit Points equal to 1d8 plus your Wisdom modifier (minimum of 1). You can use this action a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a Long Rest.

**Decrease Exhaustion.** Whenever you finish a Short Rest, your Exhaustion level, if any, decreases by 1.`,
      uses: { count: 'mod.wis', recharge: 'long' },
      activation: 'action'
    },
    asi(12),
    {
      id: 'ranger-relentless-hunter',
      name: 'Relentless Hunter',
      level: 13,
      summary: 'Taking damage can’t break your Concentration on Hunter’s Mark.',
      description: `Taking damage can’t break your Concentration on Hunter’s Mark.`,
      activation: 'passive'
    },
    {
      id: 'ranger-natures-veil',
      name: 'Nature’s Veil',
      level: 14,
      summary: 'Bonus Action: become Invisible until the end of your next turn. Wis mod uses per Long Rest.',
      description: `You invoke spirits of nature to magically hide yourself. As a Bonus Action, you can give yourself the Invisible condition until the end of your next turn.

You can use this feature a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a Long Rest.`,
      uses: { count: 'mod.wis', recharge: 'long' },
      activation: 'bonus'
    },
    asi(16),
    {
      id: 'ranger-precise-hunter',
      name: 'Precise Hunter',
      level: 17,
      summary: 'You have Advantage on attack rolls against the creature marked by your Hunter’s Mark.',
      description: `You have Advantage on attack rolls against the creature currently marked by your Hunter’s Mark.`,
      activation: 'passive'
    },
    {
      id: 'ranger-feral-senses',
      name: 'Feral Senses',
      level: 18,
      summary: 'You gain Blindsight with a range of 30 feet.',
      description: `Your connection to the forces of nature grants you Blindsight with a range of 30 feet.`,
      activation: 'passive',
      effects: [{ target: 'sense', op: 'grant', value: 'Blindsight 30 ft.', note: 'Feral Senses' }]
    },
    {
      id: 'ranger-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for (Boon of Dimensional Travel is recommended).',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Dimensional Travel is recommended.`,
      activation: 'passive'
    },
    {
      id: 'ranger-foe-slayer',
      name: 'Foe Slayer',
      level: 20,
      summary: 'Your Hunter’s Mark damage die becomes a d10 instead of a d6.',
      description: `The damage die of your Hunter’s Mark is a d10 rather than a d6.`,
      activation: 'passive'
    }
  ],
  spellcasting: {
    ability: 'wis',
    progression: 'half',
    prepared: PREPARED,
    cantrips: [],
    spellList: 'ranger',
    focus: 'Druidic Focus'
  },
  multiclass: {
    prerequisite: 'Dexterity 13 and Wisdom 13 (plus at least 13 in the primary ability of each of your current classes)',
    proficiencies: 'Hit Point Die, proficiency with Martial weapons, proficiency in one skill of your choice from the Ranger’s skill list, and training with Light and Medium armor and Shields'
  },
  quickBuild:
    'Make Dexterity your highest score, followed by Wisdom, which powers your spells and several features. Constitution is a good third choice. A background tied to travel and the outdoors, such as Guide or Wayfarer, fits well. Take the studded leather, longbow and two blades (option A), and prepare Cure Wounds and Ensnaring Strike as your first spells.',
  tips: [
    'Hunter’s Mark is your bread and butter: cast it as a Bonus Action at the start of a fight and move it to a new target when the first one drops. Your free casts per Long Rest save spell slots.',
    'Hunter’s Mark needs Concentration, so casting another Concentration spell such as Ensnaring Strike ends it. Choose which one matters more.',
    'A longbow lets you fight safely from range; keep the scimitar and shortsword for when enemies get close.',
    'Pick Weapon Mastery for the weapons you use most: Slow on the longbow and Vex on the shortsword are strong choices.',
    'Use Deft Explorer’s Expertise on Survival, Perception or Stealth to become the party’s scout.',
    'Archery is the simplest Fighting Style for a bow Ranger. Druidic Warrior is a good alternative if you want utility cantrips like Guidance.',
    'From level 6, Roving gives you +10 Speed and Climb and Swim Speeds, which makes you very mobile outdoors.'
  ],
  recommended: {
    species: ['elf', 'halfling', 'human', 'goliath', 'orc', 'gnome'],
    backgrounds: ['guide', 'wayfarer', 'hermit', 'farmer', 'criminal', 'sailor'],
    feats: ['alert', 'magic-initiate', 'tough', 'sharpshooter', 'crossbow-expert', 'skulker', 'speedy'],
    cantrips: ['guidance', 'starry-wisp'],
    spells: ['hunters-mark', 'cure-wounds', 'ensnaring-strike', 'goodberry', 'fog-cloud', 'pass-without-trace', 'spike-growth', 'conjure-animals'],
    weapons: ['longbow', 'shortsword', 'scimitar', 'rapier', 'hand-crossbow', 'heavy-crossbow'],
    fightingStyles: ['archery', 'two-weapon-fighting', 'defense', 'dueling']
  }
}

export const rangerSubclasses: SubclassDef[] = [
  {
    id: 'hunter',
    name: 'Hunter',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'ranger',
    summary: 'A versatile monster slayer who chooses offensive and defensive techniques and spreads Hunter’s Mark damage between foes.',
    description: `*Protect Nature and People from Destruction*

You stalk prey in the wilds and elsewhere, using your abilities as a Hunter to protect nature and people everywhere from forces that would destroy them.`,
    features: [
      {
        id: 'hunter-lore',
        name: 'Hunter’s Lore',
        level: 3,
        summary: 'While a creature is marked by your Hunter’s Mark, you know its Immunities, Resistances, and Vulnerabilities.',
        description: `You can call on the forces of nature to reveal certain strengths and weaknesses of your prey. While a creature is marked by your Hunter’s Mark, you know whether that creature has any Immunities, Resistances, or Vulnerabilities, and if the creature has any, you know what they are.`,
        activation: 'passive'
      },
      {
        id: 'hunter-prey',
        name: 'Hunter’s Prey',
        level: 3,
        summary: 'Choose Colossus Slayer (extra 1d8 once per turn vs. a wounded target) or Horde Breaker (extra attack against a second adjacent creature); swap on a Short or Long Rest.',
        description: `You gain one of the following feature options of your choice. Whenever you finish a Short or Long Rest, you can replace the chosen option with the other one.

**Colossus Slayer.** Your tenacity can wear down even the most resilient foes. When you hit a creature with a weapon, the weapon deals an extra 1d8 damage to the target if it’s missing any of its Hit Points. You can deal this extra damage only once per turn.

**Horde Breaker.** Once on each of your turns when you make an attack with a weapon, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target, that is within the weapon’s range, and that you haven’t attacked this turn.`,
        activation: 'passive',
        choices: [{ id: 'hunter-prey', label: 'Hunter’s Prey option', count: 1, type: 'option', options: ['Colossus Slayer', 'Horde Breaker'] }]
      },
      {
        id: 'hunter-defensive-tactics',
        name: 'Defensive Tactics',
        level: 7,
        summary: 'Choose Escape the Horde (Opportunity Attacks against you have Disadvantage) or Multiattack Defense; swap on a Short or Long Rest.',
        description: `You gain one of the following feature options of your choice. Whenever you finish a Short or Long Rest, you can replace the chosen option with the other one.

**Escape the Horde.** Opportunity Attacks have Disadvantage against you.

**Multiattack Defense.** When a creature hits you with an attack roll, that creature has Disadvantage on all other attack rolls against you this turn.`,
        activation: 'passive',
        choices: [{ id: 'hunter-defensive-tactics', label: 'Defensive Tactics option', count: 1, type: 'option', options: ['Escape the Horde', 'Multiattack Defense'] }]
      },
      {
        id: 'hunter-superior-prey',
        name: 'Superior Hunter’s Prey',
        level: 11,
        summary: 'Once per turn when you damage your Hunter’s Mark target, deal the spell’s extra damage to another creature within 30 feet of it.',
        description: `Once per turn when you deal damage to a creature marked by your Hunter’s Mark, you can also deal that spell’s extra damage to a different creature that you can see within 30 feet of the first creature.`,
        activation: 'passive'
      },
      {
        id: 'hunter-superior-defense',
        name: 'Superior Hunter’s Defense',
        level: 15,
        summary: 'Reaction when you take damage: gain Resistance to that damage type until the end of the turn.',
        description: `When you take damage, you can take a Reaction to give yourself Resistance to that damage and any other damage of the same type until the end of the current turn.`,
        activation: 'reaction'
      }
    ]
  },
  {
    id: 'beast-master',
    name: 'Beast Master',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'ranger',
    summary: 'A ranger bonded with a primal beast companion that fights alongside them.',
    description: `Beast Masters form a mystical bond with a primal beast of the land, sea or sky. The companion uses its own stat block that scales with your level, acts on your turn and attacks when you command it with a Bonus Action. Over time it becomes better trained, strikes more often and can share the benefit of your spells. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'beast-master-primal-companion', name: 'Primal Companion', level: 3, summary: 'You summon a primal beast companion (land, sea, or sky) that obeys your commands and attacks when you direct it with a Bonus Action.', description: 'You summon a primal beast companion (land, sea, or sky) that obeys your commands and attacks when you direct it with a Bonus Action.', activation: 'bonus' },
      { id: 'beast-master-exceptional-training', name: 'Exceptional Training', level: 7, summary: 'When you command your beast, it can also take a defensive or mobility action, and its attacks can deal Force damage.', description: 'When you command your beast, it can also take a defensive or mobility action, and its attacks can deal Force damage.', activation: 'passive' },
      { id: 'beast-master-bestial-fury', name: 'Bestial Fury', level: 11, summary: 'Your beast can attack twice when commanded and deals extra damage to the target of your Hunter’s Mark.', description: 'Your beast can attack twice when commanded and deals extra damage to the target of your Hunter’s Mark.', activation: 'passive' },
      { id: 'beast-master-share-spells', name: 'Share Spells', level: 15, summary: 'When you cast a spell that targets only yourself, it can also affect your nearby beast companion.', description: 'When you cast a spell that targets only yourself, it can also affect your nearby beast companion.', activation: 'passive' }
    ]
  },
  {
    id: 'fey-wanderer',
    name: 'Fey Wanderer',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'ranger',
    summary: 'A ranger touched by the Feywild who adds psychic damage to strikes and charms or frightens foes.',
    description: `Fey Wanderers carry the magic of the Feywild. Their weapon strikes deal extra psychic damage, their Wisdom adds to their Charisma checks, and they learn fey-themed spells. At higher levels they turn enemies’ resistance to charm and fear against them, summon fey allies and teleport with ease. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['charm-person'] },
      { level: 5, spells: ['misty-step'] },
      { level: 9, spells: ['summon-fey'] },
      { level: 13, spells: ['dimension-door'] },
      { level: 17, spells: ['mislead'] }
    ],
    features: [
      { id: 'fey-wanderer-dreadful-strikes', name: 'Dreadful Strikes', level: 3, summary: 'Once per turn, your weapon hits can deal extra Psychic damage; the die increases at higher levels.', description: 'Once per turn, your weapon hits can deal extra Psychic damage; the die increases at higher levels.', activation: 'passive' },
      { id: 'fey-wanderer-spells', name: 'Fey Wanderer Spells', level: 3, summary: 'You always have certain fey-themed spells prepared at Ranger levels 3, 5, 9, 13 and 17.', description: 'You always have certain fey-themed spells prepared at Ranger levels 3, 5, 9, 13 and 17.', activation: 'passive' },
      { id: 'fey-wanderer-otherworldly-glamour', name: 'Otherworldly Glamour', level: 3, summary: 'Add your Wisdom modifier to Charisma checks, and gain proficiency in Deception, Performance, or Persuasion.', description: 'Add your Wisdom modifier to Charisma checks, and gain proficiency in Deception, Performance, or Persuasion.', activation: 'passive', effects: [{ target: 'check.cha', op: 'add', value: 'max(1,mod.wis)', note: 'Otherworldly Glamour (minimum +1)' }], choices: [{ id: 'fey-wanderer-otherworldly-glamour', label: 'Skill proficiency', count: 1, type: 'skill', options: ['deception', 'performance', 'persuasion'] }] },
      { id: 'fey-wanderer-beguiling-twist', name: 'Beguiling Twist', level: 7, summary: 'You have Advantage on saves against being Charmed or Frightened, and when a creature resists such an effect you can redirect it at another creature.', description: 'You have Advantage on saves against being Charmed or Frightened, and when a creature resists such an effect you can redirect it at another creature.', activation: 'reaction' },
      { id: 'fey-wanderer-fey-reinforcements', name: 'Fey Reinforcements', level: 11, summary: 'You can cast Summon Fey more easily, including once per Long Rest without a spell slot, and optionally without Concentration for a shorter duration.', description: 'You can cast Summon Fey more easily, including once per Long Rest without a spell slot, and optionally without Concentration for a shorter duration.', activation: 'action', uses: { count: 1, recharge: 'long' } },
      { id: 'fey-wanderer-misty-wanderer', name: 'Misty Wanderer', level: 15, summary: 'You can cast Misty Step without a spell slot several times per Long Rest and bring a willing creature with you.', description: 'You can cast Misty Step without a spell slot several times per Long Rest and bring a willing creature with you.', activation: 'bonus', uses: { count: 'mod.wis', recharge: 'long' } }
    ]
  },
  {
    id: 'gloom-stalker',
    name: 'Gloom Stalker',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'ranger',
    summary: 'An ambusher at home in darkness who acts early in combat and strikes with dread-filled attacks.',
    description: `Gloom Stalkers hunt in places of shadow. They add Wisdom to Initiative, move and strike harder at the start of combat, and can see in the dark while being hidden from creatures relying on darkvision. Later they gain mental resilience, extra effects on their Dreadful Strike and a teleporting dodge. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['disguise-self'] },
      { level: 5, spells: ['rope-trick'] },
      { level: 9, spells: ['fear'] },
      { level: 13, spells: ['greater-invisibility'] },
      { level: 17, spells: ['seeming'] }
    ],
    features: [
      { id: 'gloom-stalker-dread-ambusher', name: 'Dread Ambusher', level: 3, summary: 'Add your Wisdom modifier to Initiative, move faster on your first turn, and deal extra Psychic damage with Dreadful Strike a limited number of times per Long Rest.', description: 'Add your Wisdom modifier to Initiative, move faster on your first turn, and deal extra Psychic damage with Dreadful Strike a limited number of times per Long Rest.', activation: 'passive', effects: [{ target: 'initiative', op: 'add', value: 'mod.wis', note: 'Dread Ambusher' }], uses: { count: 'mod.wis', recharge: 'long' } },
      { id: 'gloom-stalker-spells', name: 'Gloom Stalker Spells', level: 3, summary: 'You always have certain shadow-themed spells prepared at Ranger levels 3, 5, 9, 13 and 17.', description: 'You always have certain shadow-themed spells prepared at Ranger levels 3, 5, 9, 13 and 17.', activation: 'passive' },
      { id: 'gloom-stalker-umbral-sight', name: 'Umbral Sight', level: 3, summary: 'You gain Darkvision (or extend it), and while in darkness you are Invisible to creatures that rely on Darkvision to see you.', description: 'You gain Darkvision (or extend it), and while in darkness you are Invisible to creatures that rely on Darkvision to see you.', activation: 'passive', effects: [{ target: 'darkvision', op: 'add', value: 60, note: 'Umbral Sight (+60 ft. if you already have Darkvision)' }] },
      { id: 'gloom-stalker-iron-mind', name: 'Iron Mind', level: 7, summary: 'You gain proficiency in Wisdom saving throws (or another mental save if you already have it).', description: 'You gain proficiency in Wisdom saving throws (or another mental save if you already have it).', activation: 'passive', effects: [{ target: 'save.wis', op: 'proficiency', note: 'Iron Mind (Int or Cha instead if already proficient)' }] },
      { id: 'gloom-stalker-stalkers-flurry', name: 'Stalker’s Flurry', level: 11, summary: 'Your Dreadful Strike deals more damage and can trigger an extra attack or spread fear.', description: 'Your Dreadful Strike deals more damage and can trigger an extra attack or spread fear.', activation: 'passive' },
      { id: 'gloom-stalker-shadowy-dodge', name: 'Shadowy Dodge', level: 15, summary: 'As a Reaction when attacked, impose Disadvantage on the attack and then teleport a short distance.', description: 'As a Reaction when attacked, impose Disadvantage on the attack and then teleport a short distance.', activation: 'reaction' }
    ]
  }
]

export const rangerOptions: ClassOptionGroup[] = []
