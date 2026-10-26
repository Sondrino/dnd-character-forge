// Feats. 'SRD 5.2' entries reproduce SRD 5.2.1 text (CC-BY-4.0).
// 'PHB 2024' entries contain only names/mechanics and short summaries in our own words.
import type { Ability, FeatDef } from '../types'

const SRD = 'SRD 5.2' as const
const PHB = 'PHB 2024' as const

const ALL: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const MENTAL: Ability[] = ['int', 'wis', 'cha']
const STR_DEX: Ability[] = ['str', 'dex']

const L4 = 'Level 4+'
const L19 = 'Level 19+'
const FS = 'Fighting Style Feature'

/* ------------------------------------------------------------------ */
/* SRD 5.2 feats                                                       */
/* ------------------------------------------------------------------ */

const srdFeats: FeatDef[] = [
  // Origin
  {
    id: 'alert',
    name: 'Alert',
    kind: 'feat',
    source: SRD,
    category: 'origin',
    summary: 'Add your Proficiency Bonus to Initiative, and swap Initiative with a willing ally.',
    description: `*Origin Feat*

You gain the following benefits.

**Initiative Proficiency.** When you roll Initiative, you can add your Proficiency Bonus to the roll.

**Initiative Swap.** Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can’t make this swap if you or the ally has the Incapacitated condition.`,
    effects: [{ target: 'initiative', op: 'set', value: 'prof', note: 'Alert: add Proficiency Bonus to Initiative' }]
  },
  {
    id: 'magic-initiate',
    name: 'Magic Initiate',
    kind: 'feat',
    source: SRD,
    category: 'origin',
    repeatable: true,
    summary: 'Learn two cantrips and one level 1 spell from the Cleric, Druid, or Wizard list; cast the spell once per Long Rest without a slot.',
    description: `*Origin Feat*

You gain the following benefits.

**Two Cantrips.** You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat’s spells (choose when you select this feat).

**Level 1 Spell.** Choose a level 1 spell from the same list you selected for this feat’s cantrips. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have.

**Spell Change.** Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list.

**Repeatable.** You can take this feat more than once, but you must choose a different spell list each time.`,
    choices: [
      { id: 'list', label: 'Spell list', count: 1, type: 'option', options: ['cleric', 'druid', 'wizard'] },
      { id: 'ability', label: 'Spellcasting ability', count: 1, type: 'ability', options: ['int', 'wis', 'cha'] },
      { id: 'cantrips', label: 'Cantrips (from the chosen list)', count: 2, type: 'cantrip', filter: 'list' },
      { id: 'spell', label: 'Level 1 spell (from the chosen list)', count: 1, type: 'spell', filter: 'list:1' }
    ]
  },
  {
    id: 'savage-attacker',
    name: 'Savage Attacker',
    kind: 'feat',
    source: SRD,
    category: 'origin',
    summary: 'Once per turn when you hit with a weapon, roll its damage dice twice and use either roll.',
    description: `*Origin Feat*

You’ve trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon’s damage dice twice and use either roll against the target.`
  },
  {
    id: 'skilled',
    name: 'Skilled',
    kind: 'feat',
    source: SRD,
    category: 'origin',
    repeatable: true,
    summary: 'Gain proficiency in any combination of three skills or tools.',
    description: `*Origin Feat*

You gain proficiency in any combination of three skills or tools of your choice.

**Repeatable.** You can take this feat more than once.`,
    choices: [
      { id: 'proficiencies', label: 'Skills or tools (any combination)', count: 3, type: 'skill', filter: 'skillOrTool' }
    ]
  },

  // General
  {
    id: 'ability-score-improvement',
    name: 'Ability Score Improvement',
    kind: 'feat',
    source: SRD,
    category: 'general',
    prerequisite: L4,
    minLevel: 4,
    repeatable: true,
    summary: 'Increase one ability score by 2, or two ability scores by 1 (maximum 20).',
    description: `*General Feat (Prerequisite: Level 4+)*

Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can’t increase an ability score above 20.

**Repeatable.** You can take this feat more than once.`,
    choices: [{ id: 'abilities', label: '+2 to one ability, or +1 to two abilities', count: 2, type: 'ability', options: ALL }]
  },
  {
    id: 'grappler',
    name: 'Grappler',
    kind: 'feat',
    source: SRD,
    category: 'general',
    prerequisite: 'Level 4+, Strength or Dexterity 13+',
    minLevel: 4,
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Damage and grapple with one Unarmed Strike, Advantage against creatures you grapple, and move grappled creatures freely.',
    description: `*General Feat (Prerequisite: Level 4+, Strength or Dexterity 13+)*

You gain the following benefits.

**Ability Score Increase.** Increase your Strength or Dexterity score by 1, to a maximum of 20.

**Punch and Grab.** When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn.

**Attack Advantage.** You have Advantage on attack rolls against a creature Grappled by you.

**Fast Wrestler.** You don’t have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller.`
  },

  // Fighting Style
  {
    id: 'archery',
    name: 'Archery',
    kind: 'feat',
    source: SRD,
    category: 'fightingStyle',
    prerequisite: FS,
    summary: '+2 bonus to attack rolls with Ranged weapons.',
    description: `*Fighting Style Feat (Prerequisite: Fighting Style Feature)*

You gain a +2 bonus to attack rolls you make with Ranged weapons.`,
    effects: [{ target: 'attack.ranged', op: 'add', value: 2, note: 'Archery (Ranged weapons)' }]
  },
  {
    id: 'defense',
    name: 'Defense',
    kind: 'feat',
    source: SRD,
    category: 'fightingStyle',
    prerequisite: FS,
    summary: '+1 AC while wearing Light, Medium, or Heavy armor.',
    description: `*Fighting Style Feat (Prerequisite: Fighting Style Feature)*

While you’re wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.`,
    effects: [{ target: 'ac.armored', op: 'add', value: 1, note: 'Defense fighting style' }]
  },
  {
    id: 'great-weapon-fighting',
    name: 'Great Weapon Fighting',
    kind: 'feat',
    source: SRD,
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Treat 1s and 2s on damage dice as 3s with two-handed melee weapons (Two-Handed or Versatile).',
    description: `*Fighting Style Feat (Prerequisite: Fighting Style Feature)*

When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit.`
  },
  {
    id: 'two-weapon-fighting',
    name: 'Two-Weapon Fighting',
    kind: 'feat',
    source: SRD,
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Add your ability modifier to the damage of the extra attack from the Light property.',
    description: `*Fighting Style Feat (Prerequisite: Fighting Style Feature)*

When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren’t already adding it to the damage.`
  },

  // Epic Boons
  {
    id: 'boon-of-combat-prowess',
    name: 'Boon of Combat Prowess',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'When you miss with an attack roll, you can hit instead (once per turn cycle).',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase one ability score of your choice by 1, to a maximum of 30.

**Peerless Aim.** When you miss with an attack roll, you can hit instead. Once you use this benefit, you can’t use it again until the start of your next turn.`
  },
  {
    id: 'boon-of-dimensional-travel',
    name: 'Boon of Dimensional Travel',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Teleport up to 30 feet immediately after taking the Attack or Magic action.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase one ability score of your choice by 1, to a maximum of 30.

**Blink Steps.** Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see.`
  },
  {
    id: 'boon-of-fate',
    name: 'Boon of Fate',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Add or subtract 2d4 to a D20 Test made by you or a creature within 60 feet; recharges on Initiative or a rest.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase one ability score of your choice by 1, to a maximum of 30.

**Improve Fate.** When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll. Once you use this benefit, you can’t use it again until you roll Initiative or finish a Short or Long Rest.`
  },
  {
    id: 'boon-of-irresistible-offense',
    name: 'Boon of Irresistible Offense',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Your Bludgeoning, Piercing, and Slashing damage ignores Resistance; natural 20s deal extra damage.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase your Strength or Dexterity score by 1, to a maximum of 30.

**Overcome Defenses.** The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.

**Overwhelming Strike.** When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage’s type is the same as the attack’s type.`
  },
  {
    id: 'boon-of-spell-recall',
    name: 'Boon of Spell Recall',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: 'Level 19+, Spellcasting Feature',
    minLevel: 19,
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'When you cast with a level 1–4 slot, roll 1d4; if it matches the slot level, the slot isn’t expended.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+, Spellcasting Feature)*

You gain the following benefits.

**Ability Score Increase.** Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30.

**Free Casting.** Whenever you cast a spell with a level 1–4 spell slot, roll 1d4. If the number you roll is the same as the slot’s level, the slot isn’t expended.`
  },
  {
    id: 'boon-of-the-night-spirit',
    name: 'Boon of the Night Spirit',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'In Dim Light or Darkness: turn Invisible as a Bonus Action and resist all damage except Psychic and Radiant.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase one ability score of your choice by 1, to a maximum of 30.

**Merge with Shadows.** While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction.

**Shadowy Form.** While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant.`
  },
  {
    id: 'boon-of-truesight',
    name: 'Boon of Truesight',
    kind: 'feat',
    source: SRD,
    category: 'epicBoon',
    prerequisite: L19,
    minLevel: 19,
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'You gain Truesight with a range of 60 feet.',
    description: `*Epic Boon Feat (Prerequisite: Level 19+)*

You gain the following benefits.

**Ability Score Increase.** Increase one ability score of your choice by 1, to a maximum of 30.

**Truesight.** You have Truesight with a range of 60 feet.`,
    effects: [{ target: 'sense', op: 'grant', value: 'Truesight 60 ft.', note: 'Boon of Truesight' }]
  }
]

/* ------------------------------------------------------------------ */
/* PHB 2024 feats (own-words summaries)                                */
/* ------------------------------------------------------------------ */

type PhbInput = Omit<FeatDef, 'kind' | 'source' | 'description'> & { description?: string }

function phb(f: PhbInput): FeatDef {
  const catLabel =
    f.category === 'origin'
      ? 'Origin Feat'
      : f.category === 'general'
        ? 'General Feat'
        : f.category === 'fightingStyle'
          ? 'Fighting Style Feat'
          : 'Epic Boon Feat'
  const prereq = f.prerequisite ? ` (Prerequisite: ${f.prerequisite})` : ''
  const asi = f.abilityIncrease
    ? `\n\n**Ability Score Increase:** +${f.abilityIncrease.amount} to ${f.abilityIncrease.options
        .map((a) => a.toUpperCase())
        .join(', ')
        .replace(/, ([A-Z]+)$/, ' or $1')} (max ${f.category === 'epicBoon' ? 30 : 20}).`
    : ''
  return {
    ...f,
    kind: 'feat',
    source: PHB,
    description: `*${catLabel}${prereq}*\n\n${f.description ?? f.summary}${asi}\n\n*Summary in our own words — see the 2024 Player’s Handbook for the full text.*`
  }
}

const gen = (prerequisite?: string): { prerequisite: string; minLevel: number; category: 'general' } => ({
  category: 'general',
  minLevel: 4,
  prerequisite: prerequisite ? `${L4}, ${prerequisite}` : L4
})

const epic = (extra?: string): { prerequisite: string; minLevel: number; category: 'epicBoon' } => ({
  category: 'epicBoon',
  minLevel: 19,
  prerequisite: extra ? `${L19}, ${extra}` : L19
})

const phbFeats: FeatDef[] = [
  // Origin
  phb({
    id: 'crafter',
    name: 'Crafter',
    category: 'origin',
    summary: 'Gain proficiency with three Artisan’s Tools, a 20% discount on nonmagical items, and the ability to craft simple gear during a Long Rest.',
    description:
      'You gain proficiency with three kinds of Artisan’s Tools of your choice. You get a 20 percent discount when buying nonmagical items, and when you finish a Long Rest you can quickly craft a temporary piece of basic gear tied to one of your tools.',
    choices: [{ id: 'tools', label: 'Artisan’s Tools', count: 3, type: 'tool', filter: 'artisan' }]
  }),
  phb({
    id: 'healer',
    name: 'Healer',
    category: 'origin',
    summary: 'Use a Healer’s Kit to let a creature spend a Hit Die and heal (plus your Proficiency Bonus), and reroll 1s on healing dice.',
    description:
      'With a Healer’s Kit you can, as a Utilize action, expend a use to let an adjacent creature spend one of its Hit Dice; it regains that roll plus your Proficiency Bonus in Hit Points. Whenever you roll dice to restore Hit Points with a spell or this feat, you can reroll any 1s.'
  }),
  phb({
    id: 'lucky',
    name: 'Lucky',
    category: 'origin',
    summary: 'You have Luck Points equal to your Proficiency Bonus (regained on a Long Rest) to gain Advantage on your D20 Tests or impose Disadvantage on attacks against you.'
  }),
  phb({
    id: 'musician',
    name: 'Musician',
    category: 'origin',
    summary: 'Gain proficiency with three Musical Instruments; after a rest, a song can grant Heroic Inspiration to allies (up to your Proficiency Bonus).',
    description:
      'You gain proficiency with three Musical Instruments of your choice. When you finish a Short or Long Rest, you can play a song and give Heroic Inspiration to a number of allies who hear it equal to your Proficiency Bonus.',
    choices: [{ id: 'instruments', label: 'Musical Instruments', count: 3, type: 'tool', filter: 'musical' }]
  }),
  phb({
    id: 'tavern-brawler',
    name: 'Tavern Brawler',
    category: 'origin',
    summary: 'Unarmed Strikes deal 1d4 + Strength damage, you reroll 1s on their damage, you are proficient with improvised weapons, and you can shove 5 feet on a hit once per turn.',
    effects: [{ target: 'proficiency.weapon', op: 'grant', value: 'improvised', note: 'Tavern Brawler' }]
  }),
  phb({
    id: 'tough',
    name: 'Tough',
    category: 'origin',
    summary: 'Your Hit Point maximum increases by twice your character level.',
    description: 'Your Hit Point maximum increases by 2 for each of your character levels, including levels gained later.',
    effects: [{ target: 'hp.perLevel', op: 'add', value: 2, note: 'Tough' }]
  }),

  // General
  phb({
    id: 'actor',
    name: 'Actor',
    ...gen('Charisma 13+'),
    abilityIncrease: { options: ['cha'], amount: 1 },
    summary: 'Advantage on Deception and Performance checks while disguised, and you can mimic voices and sounds you have heard.'
  }),
  phb({
    id: 'athlete',
    name: 'Athlete',
    ...gen('Strength or Dexterity 13+'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Gain a Climb Speed equal to your Speed, stand up from Prone using only 5 feet of movement, and make running jumps after moving just 5 feet.'
  }),
  phb({
    id: 'charger',
    name: 'Charger',
    ...gen('Strength or Dexterity 13+'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Dashing adds 10 feet to your Speed, and after moving at least 10 feet straight toward a target, a melee hit can deal an extra 1d8 damage or push it 10 feet (once per turn).'
  }),
  phb({
    id: 'chef',
    name: 'Chef',
    ...gen(),
    abilityIncrease: { options: ['con', 'wis'], amount: 1 },
    summary: 'Gain proficiency with Cook’s Utensils; your meals boost healing on Short Rests, and treats you bake grant Temporary Hit Points.',
    effects: [{ target: 'proficiency.tool', op: 'grant', value: 'cooks-utensils', note: 'Chef' }]
  }),
  phb({
    id: 'crossbow-expert',
    name: 'Crossbow Expert',
    ...gen('Dexterity 13+'),
    abilityIncrease: { options: ['dex'], amount: 1 },
    summary: 'Ignore the Loading property of crossbows, suffer no Disadvantage firing them in melee, and add your modifier to the extra Light attack with a crossbow.'
  }),
  phb({
    id: 'crusher',
    name: 'Crusher',
    ...gen(),
    abilityIncrease: { options: ['str', 'con'], amount: 1 },
    summary: 'Once per turn, a Bludgeoning hit can push the target 5 feet; a Bludgeoning critical hit grants Advantage on attacks against the target until your next turn.'
  }),
  phb({
    id: 'defensive-duelist',
    name: 'Defensive Duelist',
    ...gen('Dexterity 13+'),
    abilityIncrease: { options: ['dex'], amount: 1 },
    summary: 'While holding a Finesse weapon, use your Reaction when hit by a melee attack to add your Proficiency Bonus to your AC until the start of your next turn.'
  }),
  phb({
    id: 'dual-wielder',
    name: 'Dual Wielder',
    ...gen('Strength or Dexterity 13+'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Make the extra Bonus Action attack even when the weapon isn’t Light (as long as it isn’t Two-Handed), and draw or stow two weapons at once.'
  }),
  phb({
    id: 'durable',
    name: 'Durable',
    ...gen(),
    abilityIncrease: { options: ['con'], amount: 1 },
    summary: 'Advantage on Death Saving Throws, and you can spend a Hit Die to heal as a Bonus Action.'
  }),
  phb({
    id: 'elemental-adept',
    name: 'Elemental Adept',
    ...gen('Spellcasting or Pact Magic Feature'),
    repeatable: true,
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Choose Acid, Cold, Fire, Lightning, or Thunder: your spells ignore Resistance to it, and you treat 1s on its damage dice as 2s. Repeatable with a different type.',
    choices: [
      {
        id: 'damage-type',
        label: 'Damage type',
        count: 1,
        type: 'option',
        options: ['acid', 'cold', 'fire', 'lightning', 'thunder']
      }
    ]
  }),
  phb({
    id: 'fey-touched',
    name: 'Fey-Touched',
    ...gen(),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Learn Misty Step and one level 1 Divination or Enchantment spell; each is always prepared and castable once per Long Rest without a slot.',
    choices: [
      { id: 'spell', label: 'Level 1 Divination or Enchantment spell', count: 1, type: 'spell', filter: 'level:1;school:Divination,Enchantment' }
    ]
  }),
  phb({
    id: 'great-weapon-master',
    name: 'Great Weapon Master',
    ...gen('Strength 13+'),
    abilityIncrease: { options: ['str'], amount: 1 },
    summary: 'Hits with a Heavy weapon as part of the Attack action deal extra damage equal to your Proficiency Bonus, and a critical hit or kill lets you make a Bonus Action attack.'
  }),
  phb({
    id: 'heavily-armored',
    name: 'Heavily Armored',
    ...gen('Medium Armor Training'),
    abilityIncrease: { options: ['str', 'con'], amount: 1 },
    summary: 'You gain training with Heavy armor.',
    effects: [{ target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Heavily Armored' }]
  }),
  phb({
    id: 'heavy-armor-master',
    name: 'Heavy Armor Master',
    ...gen('Heavy Armor Training'),
    abilityIncrease: { options: ['str', 'con'], amount: 1 },
    summary: 'While wearing Heavy armor, Bludgeoning, Piercing, and Slashing damage you take is reduced by your Proficiency Bonus.'
  }),
  phb({
    id: 'inspiring-leader',
    name: 'Inspiring Leader',
    ...gen('Wisdom or Charisma 13+'),
    abilityIncrease: { options: ['wis', 'cha'], amount: 1 },
    summary: 'After a Short or Long Rest, give up to six allies Temporary Hit Points equal to your character level plus your Wisdom or Charisma modifier.'
  }),
  phb({
    id: 'keen-mind',
    name: 'Keen Mind',
    ...gen('Intelligence 13+'),
    abilityIncrease: { options: ['int'], amount: 1 },
    summary: 'Gain proficiency (or Expertise if already proficient) in Arcana, History, Investigation, Nature, or Religion, and take the Study action as a Bonus Action.',
    choices: [
      {
        id: 'skill',
        label: 'Lore skill',
        count: 1,
        type: 'skill',
        options: ['arcana', 'history', 'investigation', 'nature', 'religion']
      }
    ]
  }),
  phb({
    id: 'lightly-armored',
    name: 'Lightly Armored',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'You gain training with Light armor and Shields.',
    effects: [
      { target: 'proficiency.armor', op: 'grant', value: 'light', note: 'Lightly Armored' },
      { target: 'proficiency.armor', op: 'grant', value: 'shield', note: 'Lightly Armored' }
    ]
  }),
  phb({
    id: 'mage-slayer',
    name: 'Mage Slayer',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Creatures you damage have Disadvantage on Concentration saves, and once per rest you can turn a failed Intelligence, Wisdom, or Charisma save into a success.'
  }),
  phb({
    id: 'martial-weapon-training',
    name: 'Martial Weapon Training',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'You gain proficiency with Martial weapons.',
    effects: [{ target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Martial Weapon Training' }]
  }),
  phb({
    id: 'medium-armor-master',
    name: 'Medium Armor Master',
    ...gen('Medium Armor Training'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'With Dexterity 16 or higher, you can add up to +3 (instead of +2) from Dexterity to AC in Medium armor.'
  }),
  phb({
    id: 'moderately-armored',
    name: 'Moderately Armored',
    ...gen('Light Armor Training'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'You gain training with Medium armor and Shields.',
    effects: [
      { target: 'proficiency.armor', op: 'grant', value: 'medium', note: 'Moderately Armored' },
      { target: 'proficiency.armor', op: 'grant', value: 'shield', note: 'Moderately Armored' }
    ]
  }),
  phb({
    id: 'mounted-combatant',
    name: 'Mounted Combatant',
    ...gen(),
    abilityIncrease: { options: ['str', 'dex', 'wis'], amount: 1 },
    summary: 'While mounted, gain Advantage on attacks against smaller unmounted foes nearby, protect your mount from area effects, and redirect attacks aimed at it to yourself.'
  }),
  phb({
    id: 'observant',
    name: 'Observant',
    ...gen('Intelligence or Wisdom 13+'),
    abilityIncrease: { options: ['int', 'wis'], amount: 1 },
    summary: 'Gain proficiency (or Expertise if already proficient) in Insight, Investigation, or Perception, and take the Search action as a Bonus Action.',
    choices: [
      { id: 'skill', label: 'Skill', count: 1, type: 'skill', options: ['insight', 'investigation', 'perception'] }
    ]
  }),
  phb({
    id: 'piercer',
    name: 'Piercer',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Once per turn, reroll one Piercing damage die; Piercing critical hits roll one extra damage die.'
  }),
  phb({
    id: 'poisoner',
    name: 'Poisoner',
    ...gen(),
    abilityIncrease: { options: ['dex', 'int'], amount: 1 },
    summary: 'Your Poison damage ignores Resistance, you gain proficiency with the Poisoner’s Kit, and you can brew potent poison doses.',
    effects: [{ target: 'proficiency.tool', op: 'grant', value: 'poisoners-kit', note: 'Poisoner' }]
  }),
  phb({
    id: 'polearm-master',
    name: 'Polearm Master',
    ...gen('Strength or Dexterity 13+'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Make a Bonus Action haft attack (1d4 Bludgeoning) with a Quarterstaff, Spear, or Heavy Reach weapon, and make an Opportunity Attack when a creature enters your reach.'
  }),
  phb({
    id: 'resilient',
    name: 'Resilient',
    ...gen(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Increase one ability score by 1 and gain saving throw proficiency in that ability.',
    description:
      'Choose an ability in which you lack saving throw proficiency. Increase that score by 1 (max 20) and gain saving throw proficiency with it.'
  }),
  phb({
    id: 'ritual-caster',
    name: 'Ritual Caster',
    ...gen('Intelligence, Wisdom, or Charisma 13+'),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Learn a number of level 1 Ritual spells equal to your Proficiency Bonus, and once per Long Rest cast one as a Ritual at normal casting time.'
  }),
  phb({
    id: 'sentinel',
    name: 'Sentinel',
    ...gen('Strength or Dexterity 13+'),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Make Opportunity Attacks against creatures that Disengage or attack others near you, and creatures you hit with them have their Speed reduced to 0.'
  }),
  phb({
    id: 'shadow-touched',
    name: 'Shadow-Touched',
    ...gen(),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Learn Invisibility and one level 1 Illusion or Necromancy spell; each is always prepared and castable once per Long Rest without a slot.',
    choices: [
      { id: 'spell', label: 'Level 1 Illusion or Necromancy spell', count: 1, type: 'spell', filter: 'level:1;school:Illusion,Necromancy' }
    ]
  }),
  phb({
    id: 'sharpshooter',
    name: 'Sharpshooter',
    ...gen('Dexterity 13+'),
    abilityIncrease: { options: ['dex'], amount: 1 },
    summary: 'Ranged weapon attacks ignore Half and Three-Quarters Cover, have no Disadvantage at long range, and have no Disadvantage in melee.'
  }),
  phb({
    id: 'shield-master',
    name: 'Shield Master',
    ...gen('Shield Training'),
    abilityIncrease: { options: ['str'], amount: 1 },
    summary: 'When you hit with a melee weapon, you can bash with your Shield to push or knock Prone the target, and you can use your Shield to take no damage on a successful Dexterity save.'
  }),
  phb({
    id: 'skill-expert',
    name: 'Skill Expert',
    ...gen(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Gain proficiency in one skill and Expertise in one skill you are proficient in.',
    choices: [
      { id: 'skill', label: 'Skill proficiency', count: 1, type: 'skill' },
      { id: 'expertise', label: 'Expertise', count: 1, type: 'expertise' }
    ]
  }),
  phb({
    id: 'skulker',
    name: 'Skulker',
    ...gen('Dexterity 13+'),
    abilityIncrease: { options: ['dex'], amount: 1 },
    summary: 'Gain Blindsight 10 ft., Advantage on Stealth checks made to Hide during combat, and missed attacks while hidden don’t reveal you.',
    effects: [{ target: 'sense', op: 'grant', value: 'Blindsight 10 ft.', note: 'Skulker' }]
  }),
  phb({
    id: 'slasher',
    name: 'Slasher',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Once per turn, a Slashing hit reduces the target’s Speed by 10 feet; Slashing critical hits give the target Disadvantage on attack rolls until your next turn.'
  }),
  phb({
    id: 'speedy',
    name: 'Speedy',
    ...gen('Dexterity or Constitution 13+'),
    abilityIncrease: { options: ['dex', 'con'], amount: 1 },
    summary: 'Your Speed increases by 10 feet, Difficult Terrain doesn’t slow your Dash, and Opportunity Attacks against you have Disadvantage.',
    effects: [{ target: 'speed', op: 'add', value: 10, note: 'Speedy' }]
  }),
  phb({
    id: 'spell-sniper',
    name: 'Spell Sniper',
    ...gen('Spellcasting or Pact Magic Feature'),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Spell attacks ignore Half and Three-Quarters Cover and have no Disadvantage in melee, and attack spells with a range of 10+ feet gain 60 feet of range.'
  }),
  phb({
    id: 'telekinetic',
    name: 'Telekinetic',
    ...gen(),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Learn an improved, invisible Mage Hand, and as a Bonus Action telekinetically shove a creature 5 feet (Strength save).'
  }),
  phb({
    id: 'telepathic',
    name: 'Telepathic',
    ...gen(),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Speak telepathically to creatures within 60 feet, and cast Detect Thoughts once per Long Rest without a slot.'
  }),
  phb({
    id: 'war-caster',
    name: 'War Caster',
    ...gen('Spellcasting or Pact Magic Feature'),
    abilityIncrease: { options: MENTAL, amount: 1 },
    summary: 'Advantage on Constitution saves to maintain Concentration, cast a spell instead of an Opportunity Attack, and perform Somatic components with your hands full.'
  }),
  phb({
    id: 'weapon-master',
    name: 'Weapon Master',
    ...gen(),
    abilityIncrease: { options: STR_DEX, amount: 1 },
    summary: 'Use the mastery property of one Simple or Martial weapon you are proficient with; you can change the weapon after a Long Rest.',
    choices: [{ id: 'mastery', label: 'Weapon Mastery', count: 1, type: 'weaponMastery' }]
  }),

  // Fighting Style
  phb({
    id: 'blind-fighting',
    name: 'Blind Fighting',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'You have Blindsight with a range of 10 feet.',
    effects: [{ target: 'sense', op: 'grant', value: 'Blindsight 10 ft.', note: 'Blind Fighting' }]
  }),
  phb({
    id: 'dueling',
    name: 'Dueling',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: '+2 damage with a melee weapon held in one hand when you wield no other weapons.',
    effects: [{ target: 'damage.melee', op: 'add', value: 2, condition: 'oneHandedMeleeOnly', note: 'Dueling (one-handed, no other weapons)' }]
  }),
  phb({
    id: 'interception',
    name: 'Interception',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Reaction while holding a Shield or a Simple or Martial weapon: reduce damage to a nearby ally by 1d10 + your Proficiency Bonus.'
  }),
  phb({
    id: 'protection',
    name: 'Protection',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Reaction while holding a Shield: impose Disadvantage on an attack against a nearby ally (and further attacks on them until your next turn).'
  }),
  phb({
    id: 'thrown-weapon-fighting',
    name: 'Thrown Weapon Fighting',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Draw Thrown weapons as part of the attack, and gain +2 damage on ranged attacks with them.'
  }),
  phb({
    id: 'unarmed-fighting',
    name: 'Unarmed Fighting',
    category: 'fightingStyle',
    prerequisite: FS,
    summary: 'Your Unarmed Strikes deal 1d6 + Strength damage (1d8 with no weapons or Shield held), and you deal 1d4 damage to creatures you grapple at the start of your turn.'
  }),

  // Epic Boons
  phb({
    id: 'boon-of-energy-resistance',
    name: 'Boon of Energy Resistance',
    ...epic(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Gain Resistance to two damage types of your choice (from Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, Thunder), and redirect that energy at a foe as a Reaction.',
    choices: [
      {
        id: 'resistances',
        label: 'Resistances',
        count: 2,
        type: 'option',
        options: ['acid', 'cold', 'fire', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder']
      }
    ]
  }),
  phb({
    id: 'boon-of-fortitude',
    name: 'Boon of Fortitude',
    ...epic(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Your Hit Point maximum increases by 40, and once per turn when you regain Hit Points you regain extra equal to your Constitution modifier.',
    effects: [{ target: 'hp.max', op: 'add', value: 40, note: 'Boon of Fortitude' }]
  }),
  phb({
    id: 'boon-of-recovery',
    name: 'Boon of Recovery',
    ...epic(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Once per Long Rest, drop to 1 HP instead of 0 and regain half your Hit Points; you also have a pool of d10s to heal yourself as a Bonus Action.'
  }),
  phb({
    id: 'boon-of-skill',
    name: 'Boon of Skill',
    ...epic(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'You gain proficiency in all skills, and Expertise in one skill of your choice.',
    effects: [{ target: 'skill.all', op: 'proficiency', note: 'Boon of Skill' }],
    choices: [{ id: 'expertise', label: 'Expertise', count: 1, type: 'expertise' }]
  }),
  phb({
    id: 'boon-of-speed',
    name: 'Boon of Speed',
    ...epic(),
    abilityIncrease: { options: ALL, amount: 1 },
    summary: 'Your Speed increases by 30 feet, and as a Bonus Action you can Disengage and end the Grappled condition on yourself.',
    effects: [{ target: 'speed', op: 'add', value: 30, note: 'Boon of Speed' }]
  })
]

export const feats: FeatDef[] = [...srdFeats, ...phbFeats]
