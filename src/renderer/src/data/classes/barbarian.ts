import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow, Feature } from '../../types'

// Barbarian — SRD 5.2.1 (CC-BY-4.0) + PHB 2024-subclasses (kun sammendrag med egne ord)

const profBonus = (level: number): number => Math.ceil(level / 4) + 1

const FEATURES_BY_LEVEL: string[][] = [
  ['Rage', 'Unarmored Defense', 'Weapon Mastery'],
  ['Danger Sense', 'Reckless Attack'],
  ['Barbarian Subclass', 'Primal Knowledge'],
  ['Ability Score Improvement'],
  ['Extra Attack', 'Fast Movement'],
  ['Subclass feature'],
  ['Feral Instinct', 'Instinctive Pounce'],
  ['Ability Score Improvement'],
  ['Brutal Strike'],
  ['Subclass feature'],
  ['Relentless Rage'],
  ['Ability Score Improvement'],
  ['Improved Brutal Strike'],
  ['Subclass feature'],
  ['Persistent Rage'],
  ['Ability Score Improvement'],
  ['Improved Brutal Strike'],
  ['Indomitable Might'],
  ['Epic Boon'],
  ['Primal Champion']
]

const RAGES = [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6]
const RAGE_DAMAGE = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]
const WEAPON_MASTERY = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]

const table: ClassLevelRow[] = FEATURES_BY_LEVEL.map((features, i) => ({
  level: i + 1,
  profBonus: profBonus(i + 1),
  features,
  columns: {
    Rages: RAGES[i],
    'Rage Damage': `+${RAGE_DAMAGE[i]}`,
    'Weapon Mastery': WEAPON_MASTERY[i]
  }
}))

const ASI_TEXT = `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Barbarian levels 8, 12, and 16.`

const asi = (level: number): Feature => ({
  id: `barbarian-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat of your choice for which you qualify.',
  description: ASI_TEXT,
  activation: 'passive'
})

export const barbarianClass: ClassDef = {
  id: 'barbarian',
  name: 'Barbarian',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A fierce warrior of primal might who enters a Rage in battle, shrugging off blows and hitting harder with Strength-based attacks.',
  description: `## Core Barbarian Traits

| Trait | Value |
|---|---|
| **Primary Ability** | Strength |
| **Hit Point Die** | D12 per Barbarian level |
| **Saving Throw Proficiencies** | Strength and Constitution |
| **Skill Proficiencies** | Choose 2: Animal Handling, Athletics, Intimidation, Nature, Perception, or Survival |
| **Weapon Proficiencies** | Simple and Martial weapons |
| **Armor Training** | Light and Medium armor and Shields |
| **Starting Equipment** | Choose A or B: (A) Greataxe, 4 Handaxes, Explorer’s Pack, and 15 GP; or (B) 75 GP |

### Becoming a Barbarian …

**As a Level 1 Character**
- Gain all the traits in the Core Barbarian Traits table.
- Gain the Barbarian’s level 1 features, which are listed in the Barbarian Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Barbarian Traits table: Hit Point Die, proficiency with Martial weapons, and training with Shields.
- Gain the Barbarian’s level 1 features, which are listed in the Barbarian Features table.

### Barbarian Class Features
As a Barbarian, you gain the following class features when you reach the specified Barbarian levels. These features are listed in the Barbarian Features table.`,
  tags: ['martial', 'melee', 'tank'],
  hitDie: 12,
  primaryAbility: ['str'],
  savingThrows: ['str', 'con'],
  skillChoices: {
    count: 2,
    options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival']
  },
  weaponProficiencies: ['simple', 'martial'],
  armorTraining: ['light', 'medium', 'shield'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [{ id: 'greataxe' }, { id: 'handaxe', qty: 4 }, { id: 'explorers-pack' }],
      gp: 15
    },
    { label: 'B', items: [], gp: 75 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'barbarian-rage',
      name: 'Rage',
      level: 1,
      summary:
        'As a Bonus Action (not in Heavy armor), enter a Rage: Resistance to Bludgeoning, Piercing, and Slashing damage, bonus damage on Strength attacks, and Advantage on Strength checks and saves.',
      description: `You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren’t wearing Heavy armor.

You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest.

While active, your Rage follows the rules below.

**Damage Resistance.** You have Resistance to Bludgeoning, Piercing, and Slashing damage.

**Rage Damage.** When you make an attack using Strength—with either a weapon or an Unarmed Strike—and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table.

**Strength Advantage.** You have Advantage on Strength checks and Strength saving throws.

**No Concentration or Spells.** You can’t maintain Concentration, and you can’t cast spells.

**Duration.** The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following:
- Make an attack roll against an enemy.
- Force an enemy to make a saving throw.
- Take a Bonus Action to extend your Rage.

Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes.`,
      uses: { count: 'Rages', recharge: 'long' },
      activation: 'bonus',
      effects: [
        { target: 'resistance', op: 'grant', value: 'bludgeoning', condition: 'raging', note: 'Rage' },
        { target: 'resistance', op: 'grant', value: 'piercing', condition: 'raging', note: 'Rage' },
        { target: 'resistance', op: 'grant', value: 'slashing', condition: 'raging', note: 'Rage' },
        { target: 'check.str', op: 'advantage', condition: 'raging', note: 'Rage' },
        { target: 'save.str', op: 'advantage', condition: 'raging', note: 'Rage' }
      ]
    },
    {
      id: 'barbarian-unarmored-defense',
      name: 'Unarmored Defense',
      level: 1,
      summary: 'While wearing no armor, your base AC equals 10 + Dexterity modifier + Constitution modifier. A Shield still works.',
      description: `While you aren’t wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit.`,
      activation: 'passive',
      effects: [{ target: 'ac.unarmored', op: 'set', value: '10+dex+con', condition: 'noArmor', note: 'Unarmored Defense' }]
    },
    {
      id: 'barbarian-weapon-mastery',
      name: 'Weapon Mastery',
      level: 1,
      summary: 'Use the mastery properties of two kinds of Simple or Martial Melee weapons (more at higher levels); swap one after a Long Rest.',
      description: `Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxes and Handaxes. Whenever you finish a Long Rest, you can practice weapon drills and change one of those weapon choices.

When you reach certain Barbarian levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Barbarian Features table.`,
      activation: 'passive'
    },
    {
      id: 'barbarian-danger-sense',
      name: 'Danger Sense',
      level: 2,
      summary: 'You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.',
      description: `You gain an uncanny sense of when things aren’t as they should be, giving you an edge when you dodge perils. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.`,
      activation: 'passive',
      effects: [{ target: 'save.dex', op: 'advantage', note: 'Danger Sense (not while Incapacitated)' }]
    },
    {
      id: 'barbarian-reckless-attack',
      name: 'Reckless Attack',
      level: 2,
      summary:
        'On your first attack roll of a turn, you can gain Advantage on Strength attack rolls until your next turn, but attack rolls against you also have Advantage.',
      description: `You can throw aside all concern for defense to attack with increased ferocity. When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you have Advantage during that time.`,
      activation: 'special'
    },
    {
      id: 'barbarian-subclass',
      name: 'Barbarian Subclass',
      level: 3,
      summary: 'Choose a Barbarian subclass, which grants features at Barbarian levels 3, 6, 10, and 14.',
      description: `You gain a Barbarian subclass of your choice. The Path of the Berserker subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Barbarian levels. For the rest of your career, you gain each of your subclass’s features that are of your Barbarian level or lower.`,
      activation: 'passive'
    },
    {
      id: 'barbarian-primal-knowledge',
      name: 'Primal Knowledge',
      level: 3,
      summary:
        'Gain one more Barbarian skill proficiency. While raging, you can make Acrobatics, Intimidation, Perception, Stealth, or Survival checks as Strength checks.',
      description: `You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1.

In addition, while your Rage is active, you can channel primal power when you attempt certain tasks; whenever you make an ability check using one of the following skills, you can make it as a Strength check even if it normally uses a different ability: Acrobatics, Intimidation, Perception, Stealth, or Survival. When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses.`,
      activation: 'passive',
      choices: [
        {
          id: 'barbarian-primal-knowledge-skill',
          label: 'Primal Knowledge skill',
          count: 1,
          type: 'skill',
          options: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival']
        }
      ]
    },
    asi(4),
    {
      id: 'barbarian-extra-attack',
      name: 'Extra Attack',
      level: 5,
      summary: 'You can attack twice instead of once whenever you take the Attack action on your turn.',
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    {
      id: 'barbarian-fast-movement',
      name: 'Fast Movement',
      level: 5,
      summary: 'Your Speed increases by 10 feet while you aren’t wearing Heavy armor.',
      description: `Your speed increases by 10 feet while you aren’t wearing Heavy armor.`,
      activation: 'passive',
      effects: [{ target: 'speed', op: 'add', value: 10, condition: 'noHeavyArmor', note: 'Fast Movement' }]
    },
    {
      id: 'barbarian-feral-instinct',
      name: 'Feral Instinct',
      level: 7,
      summary: 'You have Advantage on Initiative rolls.',
      description: `Your instincts are so honed that you have Advantage on Initiative rolls.`,
      activation: 'passive',
      effects: [{ target: 'initiative', op: 'advantage', note: 'Feral Instinct' }]
    },
    {
      id: 'barbarian-instinctive-pounce',
      name: 'Instinctive Pounce',
      level: 7,
      summary: 'As part of the Bonus Action to enter your Rage, you can move up to half your Speed.',
      description: `As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed.`,
      activation: 'special'
    },
    asi(8),
    {
      id: 'barbarian-brutal-strike',
      name: 'Brutal Strike',
      level: 9,
      summary:
        'When using Reckless Attack, forgo Advantage on one Strength attack; if it hits, deal an extra 1d10 damage and apply a Forceful Blow or Hamstring Blow.',
      description: `If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn’t have Disadvantage. If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike, and you can cause one Brutal Strike effect of your choice. You have the following effect options.

**Forceful Blow.** The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks.

**Hamstring Blow.** The target’s Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time—the most recent one.`,
      activation: 'special'
    },
    {
      id: 'barbarian-relentless-rage',
      name: 'Relentless Rage',
      level: 11,
      summary:
        'If you drop to 0 HP while raging, make a DC 10 Constitution save (DC +5 per later use) to instead have HP equal to twice your Barbarian level.',
      description: `Your Rage can keep you fighting despite grievous wounds. If you drop to 0 Hit Points while your Rage is active and don’t die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level.

Each time you use this feature after the first, the DC increases by 5. When you finish a Short or Long Rest, the DC resets to 10.`,
      activation: 'special'
    },
    asi(12),
    {
      id: 'barbarian-improved-brutal-strike-13',
      name: 'Improved Brutal Strike',
      level: 13,
      summary: 'Staggering Blow and Sundering Blow are added to your Brutal Strike options.',
      description: `You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options.

**Staggering Blow.** The target has Disadvantage on the next saving throw it makes, and it can’t make Opportunity Attacks until the start of your next turn.

**Sundering Blow.** Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus.`,
      activation: 'special'
    },
    {
      id: 'barbarian-persistent-rage',
      name: 'Persistent Rage',
      level: 15,
      summary:
        'Once per Long Rest, regain all Rage uses when you roll Initiative. Your Rage now lasts 10 minutes without needing to be extended.',
      description: `When you roll Initiative, you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can’t do so again until you finish a Long Rest.

In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round. Your Rage ends early if you have the Unconscious condition (not just the Incapacitated condition) or don Heavy armor.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'special'
    },
    asi(16),
    {
      id: 'barbarian-improved-brutal-strike-17',
      name: 'Improved Brutal Strike',
      level: 17,
      summary: 'Brutal Strike’s extra damage increases to 2d10, and you can apply two different Brutal Strike effects.',
      description: `The extra damage of your Brutal Strike increases to 2d10. In addition, you can use two different Brutal Strike effects whenever you use your Brutal Strike feature.`,
      activation: 'special'
    },
    {
      id: 'barbarian-indomitable-might',
      name: 'Indomitable Might',
      level: 18,
      summary: 'If a Strength check or Strength save totals less than your Strength score, use the score instead.',
      description: `If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total.`,
      activation: 'passive'
    },
    {
      id: 'barbarian-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for. Boon of Irresistible Offense is recommended.',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended.`,
      activation: 'passive'
    },
    {
      id: 'barbarian-primal-champion',
      name: 'Primal Champion',
      level: 20,
      summary: 'Your Strength and Constitution scores increase by 4, to a maximum of 25.',
      description: `You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25.`,
      activation: 'passive',
      effects: [
        { target: 'ability.str', op: 'add', value: 4, note: 'Primal Champion' },
        { target: 'ability.con', op: 'add', value: 4, note: 'Primal Champion' },
        { target: 'abilityMax.str', op: 'set', value: 25, note: 'Primal Champion (max 25)' },
        { target: 'abilityMax.con', op: 'set', value: 25, note: 'Primal Champion (max 25)' }
      ]
    }
  ],
  multiclass: {
    prerequisite: 'Strength 13',
    proficiencies: 'Hit Point Die, proficiency with Martial weapons, and training with Shields'
  },
  quickBuild: `Put your highest score in Strength, since it powers your attacks and Rage bonuses, and your next-highest in Constitution for Hit Points and Unarmored Defense. Dexterity is a good third choice for AC and Initiative. The Soldier background is a natural fit, giving Athletics and Intimidation and a combat-focused Origin feat. Pick the Greataxe and Handaxes starting package: wield the Greataxe two-handed and throw Handaxes at enemies you can’t reach.`,
  tips: [
    'Enter Rage as a Bonus Action at the start of a fight, then attack every turn (or use a Bonus Action) to keep it going.',
    'Rage halves Bludgeoning, Piercing, and Slashing damage, so you can safely stand in front and soak hits for the party.',
    'You can’t cast or concentrate on spells while raging, so avoid feats or items that depend on that during fights.',
    'Reckless Attack gives you Advantage but also lets enemies hit you more easily; use it when you are raging and the payoff is worth it.',
    'Unarmored Defense uses Dexterity and Constitution; compare it to Medium armor (plus a Shield) and pick whichever gives the higher AC.',
    'Pick Weapon Mastery choices that match your gear, e.g. Greataxe (Cleave) and Handaxe (Vex).',
    'Rage regains one use on a Short Rest, so ask the group for short breaks during long adventuring days.'
  ],
  recommended: {
    species: ['goliath', 'orc', 'dwarf', 'human', 'dragonborn'],
    backgrounds: ['soldier', 'farmer', 'guard', 'sailor', 'wayfarer'],
    feats: ['great-weapon-master', 'tough', 'savage-attacker', 'alert', 'grappler', 'boon-of-irresistible-offense'],
    weapons: ['greataxe', 'handaxe', 'greatsword', 'maul', 'javelin', 'battleaxe']
  }
}

export const barbarianSubclasses: SubclassDef[] = [
  {
    id: 'path-of-the-berserker',
    name: 'Path of the Berserker',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'barbarian',
    summary: 'Channel Rage into Violent Fury: a Barbarian who directs their Rage toward relentless violence and extra damage.',
    description: `*Channel Rage into Violent Fury*

Barbarians who walk the Path of the Berserker direct their Rage primarily toward violence. Their path is one of untrammeled fury, and they thrill in the chaos of battle as they allow their Rage to seize and empower them.`,
    features: [
      {
        id: 'path-of-the-berserker-frenzy',
        name: 'Frenzy',
        level: 3,
        summary:
          'While raging and using Reckless Attack, the first target you hit each turn with a Strength attack takes extra damage: a number of d6s equal to your Rage Damage bonus.',
        description: `If you use Reckless Attack while your Rage is active, you deal extra damage to the first target you hit on your turn with a Strength-based attack. To determine the extra damage, roll a number of d6s equal to your Rage Damage bonus, and add them together. The damage has the same type as the weapon or Unarmed Strike used for the attack.`,
        activation: 'passive'
      },
      {
        id: 'path-of-the-berserker-mindless-rage',
        name: 'Mindless Rage',
        level: 6,
        summary: 'Immunity to the Charmed and Frightened conditions while raging; entering Rage ends those conditions.',
        description: `You have Immunity to the Charmed and Frightened conditions while your Rage is active. If you’re Charmed or Frightened when you enter your Rage, the condition ends on you.`,
        activation: 'passive',
        effects: [
          { target: 'conditionImmunity', op: 'grant', value: 'charmed', condition: 'raging', note: 'Mindless Rage' },
          { target: 'conditionImmunity', op: 'grant', value: 'frightened', condition: 'raging', note: 'Mindless Rage' }
        ]
      },
      {
        id: 'path-of-the-berserker-retaliation',
        name: 'Retaliation',
        level: 10,
        summary: 'When a creature within 5 feet damages you, you can take a Reaction to make one melee attack against it.',
        description: `When you take damage from a creature that is within 5 feet of you, you can take a Reaction to make one melee attack against that creature, using a weapon or an Unarmed Strike.`,
        activation: 'reaction'
      },
      {
        id: 'path-of-the-berserker-intimidating-presence',
        name: 'Intimidating Presence',
        level: 14,
        summary:
          'As a Bonus Action, creatures of your choice in a 30-foot Emanation must succeed on a Wisdom save or be Frightened for 1 minute. Once per Long Rest, or expend a Rage use.',
        description: `As a Bonus Action, you can strike terror into others with your menacing presence and primal power. When you do so, each creature of your choice in a 30-foot Emanation originating from you must make a Wisdom saving throw (DC 8 plus your Strength modifier and Proficiency Bonus). On a failed save, a creature has the Frightened condition for 1 minute. At the end of each of the Frightened creature’s turns, the creature repeats the save, ending the effect on itself on a success.

Once you use this feature, you can’t use it again until you finish a Long Rest unless you expend a use of your Rage (no action required) to restore your use of it.`,
        uses: { count: 1, recharge: 'long' },
        activation: 'bonus'
      }
    ]
  },
  {
    id: 'path-of-the-wild-heart',
    name: 'Path of the Wild Heart',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'barbarian',
    summary: 'A Barbarian who draws on the spirits of animals, choosing an animal aspect each time they Rage.',
    description: `Barbarians on this path see themselves as kin to the beasts of the wild. They can talk with animals, and each time they Rage they take on the power of an animal spirit such as the bear, eagle, or wolf. At higher levels they gain lasting animal traits and even more potent bestial powers. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      {
        id: 'path-of-the-wild-heart-animal-speaker',
        name: 'Animal Speaker',
        level: 3,
        summary: 'You can cast Beast Sense and Speak with Animals, but only as Rituals.',
        description: 'You can cast Beast Sense and Speak with Animals, but only as Rituals.'
      },
      {
        id: 'path-of-the-wild-heart-rage-of-the-wilds',
        name: 'Rage of the Wilds',
        level: 3,
        summary:
          'Whenever you Rage, choose Bear (broad damage Resistance), Eagle (Dash and Disengage as part of the Bonus Action), or Wolf (allies gain Advantage against enemies next to you).',
        description:
          'Whenever you Rage, choose Bear (broad damage Resistance), Eagle (Dash and Disengage as part of the Bonus Action), or Wolf (allies gain Advantage against enemies next to you).'
      },
      {
        id: 'path-of-the-wild-heart-aspect-of-the-wilds',
        name: 'Aspect of the Wilds',
        level: 6,
        summary: 'Gain a lasting animal trait of your choice—Owl (Darkvision), Panther (Climb Speed), or Salmon (Swim Speed)—changeable after a Long Rest.',
        description:
          'Gain a lasting animal trait of your choice—Owl (Darkvision), Panther (Climb Speed), or Salmon (Swim Speed)—changeable after a Long Rest.'
      },
      {
        id: 'path-of-the-wild-heart-nature-speaker',
        name: 'Nature Speaker',
        level: 10,
        summary: 'You can cast Commune with Nature, but only as a Ritual.',
        description: 'You can cast Commune with Nature, but only as a Ritual.'
      },
      {
        id: 'path-of-the-wild-heart-power-of-the-wilds',
        name: 'Power of the Wilds',
        level: 14,
        summary: 'When you Rage, you can also gain a stronger animal power, such as a Falcon’s flight, a Lion’s menace, or a Ram’s ability to knock foes Prone.',
        description:
          'When you Rage, you can also gain a stronger animal power, such as a Falcon’s flight, a Lion’s menace, or a Ram’s ability to knock foes Prone.'
      }
    ]
  },
  {
    id: 'path-of-the-world-tree',
    name: 'Path of the World Tree',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'barbarian',
    summary: 'A Barbarian connected to the cosmic tree Yggdrasil, who shares vitality with allies and pulls or teleports creatures across the battlefield.',
    description: `These Barbarians tap into the life force of the World Tree that links the planes. Their Rage grants them and their allies Temporary Hit Points, and spectral branches let them drag enemies closer, extend their reach, and eventually teleport across the battlefield. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      {
        id: 'path-of-the-world-tree-vitality-of-the-tree',
        name: 'Vitality of the Tree',
        level: 3,
        summary: 'Entering Rage gives you Temporary Hit Points, and while raging you can hand out Temporary Hit Points to a nearby ally each turn.',
        description:
          'Entering Rage gives you Temporary Hit Points, and while raging you can hand out Temporary Hit Points to a nearby ally each turn.'
      },
      {
        id: 'path-of-the-world-tree-branches-of-the-tree',
        name: 'Branches of the Tree',
        level: 6,
        summary: 'While raging, you can use your Reaction to try to teleport a creature you can see next to you and reduce its Speed to 0.',
        description: 'While raging, you can use your Reaction to try to teleport a creature you can see next to you and reduce its Speed to 0.'
      },
      {
        id: 'path-of-the-world-tree-battering-roots',
        name: 'Battering Roots',
        level: 10,
        summary: 'Your reach with Heavy or Versatile melee weapons grows by 10 feet, and you can apply the Push or Topple mastery in addition to the weapon’s own.',
        description:
          'Your reach with Heavy or Versatile melee weapons grows by 10 feet, and you can apply the Push or Topple mastery in addition to the weapon’s own.'
      },
      {
        id: 'path-of-the-world-tree-travel-along-the-tree',
        name: 'Travel Along the Tree',
        level: 14,
        summary: 'While raging you can teleport short distances, and once per Rage make a long teleport that can bring willing allies with you.',
        description: 'While raging you can teleport short distances, and once per Rage make a long teleport that can bring willing allies with you.'
      }
    ]
  },
  {
    id: 'path-of-the-zealot',
    name: 'Path of the Zealot',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'barbarian',
    summary: 'A Barbarian fueled by divine fury, dealing radiant or necrotic damage and shrugging off death.',
    description: `Zealots channel the power of a god into their Rage. Their strikes carry divine energy, a reserve of healing dice keeps them on their feet, and their fervor can inspire allies. At the peak of the path they take on a divine form. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      {
        id: 'path-of-the-zealot-divine-fury',
        name: 'Divine Fury',
        level: 3,
        summary: 'While raging, the first creature you hit each turn takes extra Necrotic or Radiant damage that scales with your Barbarian level.',
        description: 'While raging, the first creature you hit each turn takes extra Necrotic or Radiant damage that scales with your Barbarian level.'
      },
      {
        id: 'path-of-the-zealot-warrior-of-the-gods',
        name: 'Warrior of the Gods',
        level: 3,
        summary: 'You have a pool of healing dice (d12s) that you can spend as a Bonus Action to heal yourself; the pool grows at higher levels.',
        description: 'You have a pool of healing dice (d12s) that you can spend as a Bonus Action to heal yourself; the pool grows at higher levels.'
      },
      {
        id: 'path-of-the-zealot-fanatical-focus',
        name: 'Fanatical Focus',
        level: 6,
        summary: 'Once per Rage, you can reroll a failed saving throw with a bonus equal to your Rage Damage.',
        description: 'Once per Rage, you can reroll a failed saving throw with a bonus equal to your Rage Damage.'
      },
      {
        id: 'path-of-the-zealot-zealous-presence',
        name: 'Zealous Presence',
        level: 10,
        summary: 'As a Bonus Action, you give up to ten allies Advantage on attack rolls and saving throws until your next turn; usable once per Long Rest or by spending a Rage.',
        description:
          'As a Bonus Action, you give up to ten allies Advantage on attack rolls and saving throws until your next turn; usable once per Long Rest or by spending a Rage.'
      },
      {
        id: 'path-of-the-zealot-rage-of-the-gods',
        name: 'Rage of the Gods',
        level: 14,
        summary: 'When you Rage you can take on a divine form for a minute, gaining flight, resistances, and the power to keep nearby allies from dropping.',
        description: 'When you Rage you can take on a divine form for a minute, gaining flight, resistances, and the power to keep nearby allies from dropping.'
      }
    ]
  }
]

export const barbarianOptions: ClassOptionGroup[] = []
