import type { ClassDef, SubclassDef, ClassOptionGroup } from '../../types'

const ASI_TEXT = `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Fighter levels 6, 8, 12, 14, and 16.`

const asi = (level: number) => ({
  id: `fighter-asi-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive' as const
})

export const fighterClass: ClassDef = {
  id: 'fighter',
  name: 'Fighter',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A master of weapons and armor who wins fights through training, toughness and tactics. Fighters get the most attacks, the most feats and reliable self-healing.',
  description: `## Core Fighter Traits

| Trait | |
|---|---|
| **Primary Ability** | Strength or Dexterity |
| **Hit Point Die** | D10 per Fighter level |
| **Saving Throw Proficiencies** | Strength and Constitution |
| **Skill Proficiencies** | *Choose 2:* Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Persuasion, Perception, or Survival |
| **Weapon Proficiencies** | Simple and Martial weapons |
| **Armor Training** | Light, Medium, and Heavy armor and Shields |
| **Starting Equipment** | *Choose A, B, or C:* (A) Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer’s Pack, and 4 GP; (B) Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer’s Pack, and 11 GP; or (C) 155 GP |

### Becoming a Fighter …

**As a Level 1 Character**
- Gain all the traits in the Core Fighter Traits table.
- Gain the Fighter’s level 1 features, which are listed in the Fighter Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Fighter Traits table: Hit Point Die, proficiency with Martial weapons, and training with Light and Medium armor and Shields.
- Gain the Fighter’s level 1 features, which are listed in the Fighter Features table.

### Fighter Class Features
As a Fighter, you gain the following class features when you reach the specified Fighter levels. These features are listed on the Fighter Features table.`,
  tags: ['martial'],
  hitDie: 10,
  primaryAbility: ['str', 'dex'],
  savingThrows: ['str', 'con'],
  skillChoices: {
    count: 2,
    options: [
      'acrobatics', 'animalHandling', 'athletics', 'history', 'insight',
      'intimidation', 'persuasion', 'perception', 'survival'
    ]
  },
  weaponProficiencies: ['simple', 'martial'],
  armorTraining: ['light', 'medium', 'heavy', 'shield'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'chain-mail' },
        { id: 'greatsword' },
        { id: 'flail' },
        { id: 'javelin', qty: 8 },
        { id: 'dungeoneers-pack' }
      ],
      gp: 4
    },
    {
      label: 'B',
      items: [
        { id: 'studded-leather-armor' },
        { id: 'scimitar' },
        { id: 'shortsword' },
        { id: 'longbow' },
        { id: 'arrows', qty: 20 },
        { id: 'quiver' },
        { id: 'dungeoneers-pack' }
      ],
      gp: 11
    },
    { label: 'C', items: [], gp: 155 }
  ],
  subclassLevel: 3,
  table: [
    { level: 1, profBonus: 2, features: ['Fighting Style', 'Second Wind', 'Weapon Mastery'], columns: { 'Second Wind': 2, 'Weapon Mastery': 3 } },
    { level: 2, profBonus: 2, features: ['Action Surge (one use)', 'Tactical Mind'], columns: { 'Second Wind': 2, 'Weapon Mastery': 3 } },
    { level: 3, profBonus: 2, features: ['Fighter Subclass'], columns: { 'Second Wind': 2, 'Weapon Mastery': 3 } },
    { level: 4, profBonus: 2, features: ['Ability Score Improvement'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 5, profBonus: 3, features: ['Extra Attack', 'Tactical Shift'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 6, profBonus: 3, features: ['Ability Score Improvement'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 7, profBonus: 3, features: ['Subclass feature'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 8, profBonus: 3, features: ['Ability Score Improvement'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 9, profBonus: 4, features: ['Indomitable (one use)', 'Tactical Master'], columns: { 'Second Wind': 3, 'Weapon Mastery': 4 } },
    { level: 10, profBonus: 4, features: ['Subclass feature'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 11, profBonus: 4, features: ['Two Extra Attacks'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 12, profBonus: 4, features: ['Ability Score Improvement'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 13, profBonus: 5, features: ['Indomitable (two uses)', 'Studied Attacks'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 14, profBonus: 5, features: ['Ability Score Improvement'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 15, profBonus: 5, features: ['Subclass feature'], columns: { 'Second Wind': 4, 'Weapon Mastery': 5 } },
    { level: 16, profBonus: 5, features: ['Ability Score Improvement'], columns: { 'Second Wind': 4, 'Weapon Mastery': 6 } },
    { level: 17, profBonus: 6, features: ['Action Surge (two uses)', 'Indomitable (three uses)'], columns: { 'Second Wind': 4, 'Weapon Mastery': 6 } },
    { level: 18, profBonus: 6, features: ['Subclass feature'], columns: { 'Second Wind': 4, 'Weapon Mastery': 6 } },
    { level: 19, profBonus: 6, features: ['Epic Boon'], columns: { 'Second Wind': 4, 'Weapon Mastery': 6 } },
    { level: 20, profBonus: 6, features: ['Three Extra Attacks'], columns: { 'Second Wind': 4, 'Weapon Mastery': 6 } }
  ],
  features: [
    {
      id: 'fighter-fighting-style',
      name: 'Fighting Style',
      level: 1,
      summary: 'Gain a Fighting Style feat of your choice (Defense is recommended); you can swap it whenever you gain a Fighter level.',
      description: `You have honed your martial prowess and gain a Fighting Style feat of your choice (see “Feats”). Defense is recommended.

Whenever you gain a Fighter level, you can replace the feat you chose with a different Fighting Style feat.`,
      activation: 'passive',
      choices: [{ id: 'fighter-fighting-style', label: 'Fighting Style feat', count: 1, type: 'feat', filter: 'fightingStyle' }]
    },
    {
      id: 'fighter-second-wind',
      name: 'Second Wind',
      level: 1,
      summary: 'Bonus Action: regain 1d10 + Fighter level Hit Points. Regain one use on a Short Rest, all uses on a Long Rest.',
      description: `You have a limited well of physical and mental stamina that you can draw on. As a Bonus Action, you can use it to regain Hit Points equal to 1d10 plus your Fighter level.

You can use this feature twice. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest.

When you reach certain Fighter levels, you gain more uses of this feature, as shown in the Second Wind column of the Fighter Features table.`,
      uses: { count: 'Second Wind', recharge: 'shortOne' },
      activation: 'bonus'
    },
    {
      id: 'fighter-weapon-mastery',
      name: 'Weapon Mastery',
      level: 1,
      summary: 'Use the mastery properties of three kinds of weapons (more at higher levels); change one choice after each Long Rest.',
      description: `Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial weapons of your choice. Whenever you finish a Long Rest, you can practice weapon drills and change one of those weapon choices.

When you reach certain Fighter levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Fighter Features table.`,
      activation: 'passive'
    },
    {
      id: 'fighter-action-surge',
      name: 'Action Surge',
      level: 2,
      summary: 'On your turn, take one additional action (not the Magic action). Recharges on a Short or Long Rest; two uses from level 17.',
      description: `You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the Magic action.

Once you use this feature, you can’t do so again until you finish a Short or Long Rest. Starting at level 17, you can use it twice before a rest but only once on a turn.`,
      uses: { count: '1+floor(level/17)', recharge: 'shortOrLong' },
      activation: 'special'
    },
    {
      id: 'fighter-tactical-mind',
      name: 'Tactical Mind',
      level: 2,
      summary: 'When you fail an ability check, spend a Second Wind use to add 1d10 to it; the use is kept if the check still fails.',
      description: `You have a mind for tactics on and off the battlefield. When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn’t expended.`,
      activation: 'special'
    },
    {
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
      summary: 'Choose a Fighter subclass, which grants features at levels 3, 7, 10, 15 and 18.',
      description: `You gain a Fighter subclass of your choice. The Champion subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Fighter levels. For the rest of your career, you gain each of your subclass’s features that are of your Fighter level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'fighter-extra-attack',
      name: 'Extra Attack',
      level: 5,
      summary: 'Attack twice whenever you take the Attack action.',
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    {
      id: 'fighter-tactical-shift',
      name: 'Tactical Shift',
      level: 5,
      summary: 'When you use Second Wind as a Bonus Action, you can also move up to half your Speed without provoking Opportunity Attacks.',
      description: `Whenever you activate your Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks.`,
      activation: 'passive'
    },
    asi(6),
    asi(8),
    {
      id: 'fighter-indomitable',
      name: 'Indomitable',
      level: 9,
      summary: 'Reroll a failed saving throw with a bonus equal to your Fighter level. 1/Long Rest (2 at level 13, 3 at level 17).',
      description: `If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can’t use this feature again until you finish a Long Rest.

You can use this feature twice before a Long Rest starting at level 13 and three times before a Long Rest starting at level 17.`,
      uses: { count: '1+floor(level/13)+floor(level/17)', recharge: 'long' },
      activation: 'special'
    },
    {
      id: 'fighter-tactical-master',
      name: 'Tactical Master',
      level: 9,
      summary: 'When attacking with a weapon whose mastery you can use, you can swap its mastery property for Push, Sap, or Slow.',
      description: `When you attack with a weapon whose mastery property you can use, you can replace that property with the Push, Sap, or Slow property for that attack.`,
      activation: 'passive'
    },
    {
      id: 'fighter-two-extra-attacks',
      name: 'Two Extra Attacks',
      level: 11,
      summary: 'Attack three times whenever you take the Attack action.',
      description: `You can attack three times instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    asi(12),
    {
      id: 'fighter-studied-attacks',
      name: 'Studied Attacks',
      level: 13,
      summary: 'When you miss a creature with an attack roll, you have Advantage on your next attack roll against it before the end of your next turn.',
      description: `You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn.`,
      activation: 'passive'
    },
    asi(14),
    asi(16),
    {
      id: 'fighter-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for (Boon of Combat Prowess is recommended).',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Combat Prowess is recommended.`,
      activation: 'passive'
    },
    {
      id: 'fighter-three-extra-attacks',
      name: 'Three Extra Attacks',
      level: 20,
      summary: 'Attack four times whenever you take the Attack action.',
      description: `You can attack four times instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    }
  ],
  multiclass: {
    prerequisite: 'Strength 13 or Dexterity 13 (plus at least 13 in the primary ability of each of your current classes)',
    proficiencies: 'Hit Point Die, proficiency with Martial weapons, and training with Light and Medium armor and Shields'
  },
  quickBuild:
    'Put your highest score in Strength if you want to fight in melee with heavy weapons, or in Dexterity if you prefer bows or finesse weapons. Make Constitution your next-highest score so you can take hits. The Soldier background fits naturally and gives you the Savage Attacker origin feat. Take chain mail and a greatsword (option A) for a frontline build, or the longbow kit (option B) for a Dexterity build.',
  tips: [
    'Second Wind is a Bonus Action, so you can heal and still attack in the same turn. You get one use back on every Short Rest.',
    'Save Action Surge for the turn it matters most: an extra Attack action at level 5+ is a big burst of damage, but it can also be a Dash or Help.',
    'Pick Weapon Mastery weapons you will actually carry. Graze (greatsword), Topple (quarterstaff, maul), Vex (shortsword) and Sap (longsword) are strong early choices.',
    'Defense (+1 AC in armor) is the safe Fighting Style for beginners; Great Weapon Fighting or Archery add damage instead.',
    'Fighters get extra feats at levels 6 and 14. Use them to raise your main ability to 20 or to take powerful combat feats.',
    'Tactical Mind lets you use Second Wind on a failed ability check, and you only lose the use if the check still fails, so do not be afraid to try it.',
    'Indomitable adds your Fighter level to a reroll, which makes it very likely to save you from a failed saving throw.'
  ],
  recommended: {
    species: ['human', 'goliath', 'orc', 'dwarf', 'dragonborn', 'halfling', 'elf'],
    backgrounds: ['soldier', 'guard', 'farmer', 'sailor', 'wayfarer'],
    feats: ['savage-attacker', 'tough', 'alert', 'great-weapon-master', 'sentinel', 'polearm-master', 'sharpshooter', 'crossbow-expert', 'heavy-armor-master'],
    weapons: ['greatsword', 'longsword', 'maul', 'glaive', 'halberd', 'flail', 'longbow', 'heavy-crossbow', 'shortsword', 'rapier'],
    fightingStyles: ['defense', 'great-weapon-fighting', 'archery', 'dueling', 'protection', 'two-weapon-fighting']
  }
}

export const fighterSubclasses: SubclassDef[] = [
  {
    id: 'champion',
    name: 'Champion',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'fighter',
    summary: 'A straightforward warrior who scores Critical Hits more often, excels at athletics and keeps fighting long after others fall.',
    description: `*Pursue Physical Excellence in Combat*

A Champion focuses on the development of martial prowess in a relentless pursuit of victory. Champions combine rigorous training with physical excellence to deal devastating blows, withstand peril, and garner glory. Whether in athletic contests or bloody battle, Champions strive for the crown of the victor.`,
    features: [
      {
        id: 'champion-improved-critical',
        name: 'Improved Critical',
        level: 3,
        summary: 'Your weapon and Unarmed Strike attacks score a Critical Hit on a 19 or 20.',
        description: `Your attack rolls with weapons and Unarmed Strikes can score a Critical Hit on a roll of 19 or 20 on the d20.`,
        activation: 'passive'
      },
      {
        id: 'champion-remarkable-athlete',
        name: 'Remarkable Athlete',
        level: 3,
        summary: 'Advantage on Initiative and Strength (Athletics) checks; after a Critical Hit, move half your Speed without provoking Opportunity Attacks.',
        description: `Thanks to your athleticism, you have Advantage on Initiative rolls and Strength (Athletics) checks.

In addition, immediately after you score a Critical Hit, you can move up to half your Speed without provoking Opportunity Attacks.`,
        activation: 'passive',
        effects: [
          { target: 'initiative', op: 'advantage', note: 'Remarkable Athlete' },
          { target: 'skill.athletics', op: 'advantage', note: 'Remarkable Athlete' }
        ]
      },
      {
        id: 'champion-additional-fighting-style',
        name: 'Additional Fighting Style',
        level: 7,
        summary: 'Gain another Fighting Style feat of your choice.',
        description: `You gain another Fighting Style feat of your choice.`,
        activation: 'passive',
        choices: [{ id: 'champion-additional-fighting-style', label: 'Fighting Style feat', count: 1, type: 'feat', filter: 'fightingStyle' }]
      },
      {
        id: 'champion-heroic-warrior',
        name: 'Heroic Warrior',
        level: 10,
        summary: 'During combat, you gain Heroic Inspiration whenever you start your turn without it.',
        description: `The thrill of battle drives you toward victory. During combat, you can give yourself Heroic Inspiration whenever you start your turn without it.`,
        activation: 'passive'
      },
      {
        id: 'champion-superior-critical',
        name: 'Superior Critical',
        level: 15,
        summary: 'Your weapon and Unarmed Strike attacks score a Critical Hit on an 18–20.',
        description: `Your attack rolls with weapons and Unarmed Strikes can now score a Critical Hit on a roll of 18–20 on the d20.`,
        activation: 'passive'
      },
      {
        id: 'champion-survivor',
        name: 'Survivor',
        level: 18,
        summary: 'Advantage on Death Saving Throws (18–20 counts as a 20), and regain 5 + Con modifier HP at the start of each turn while Bloodied.',
        description: `You attain the pinnacle of resilience in battle, giving you these benefits.

**Defy Death.** You have Advantage on Death Saving Throws. Moreover, when you roll 18–20 on a Death Saving Throw, you gain the benefit of rolling a 20 on it.

**Heroic Rally.** At the start of each of your turns, you regain Hit Points equal to 5 plus your Constitution modifier if you are Bloodied and have at least 1 Hit Point.`,
        activation: 'passive'
      }
    ]
  },
  {
    id: 'battle-master',
    name: 'Battle Master',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'fighter',
    summary: 'A tactician who fuels special combat maneuvers with Superiority Dice.',
    description: `Battle Masters treat combat as a craft to be studied. They learn maneuvers that add tricks to their attacks, such as tripping, disarming or frightening a foe, and power them with a small pool of Superiority Dice that return on a Short or Long Rest. The dice grow larger and more numerous as the Fighter levels up. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'battle-master-combat-superiority', name: 'Combat Superiority', level: 3, summary: 'You learn maneuvers and gain Superiority Dice (d8s) to fuel them, regained on a Short or Long Rest; you learn more maneuvers at higher levels.', description: 'You learn maneuvers and gain Superiority Dice (d8s) to fuel them, regained on a Short or Long Rest; you learn more maneuvers at higher levels.', activation: 'special' },
      { id: 'battle-master-student-of-war', name: 'Student of War', level: 3, summary: 'You gain proficiency with one type of Artisan’s Tools and one skill from the Fighter skill list.', description: 'You gain proficiency with one type of Artisan’s Tools and one skill from the Fighter skill list.', activation: 'passive' },
      { id: 'battle-master-know-your-enemy', name: 'Know Your Enemy', level: 7, summary: 'As a Bonus Action, you can study a nearby creature to learn about its defenses (immunities, resistances, vulnerabilities); limited uses, renewable with a Superiority Die.', description: 'As a Bonus Action, you can study a nearby creature to learn about its defenses (immunities, resistances, vulnerabilities); limited uses, renewable with a Superiority Die.', activation: 'bonus' },
      { id: 'battle-master-improved-combat-superiority', name: 'Improved Combat Superiority', level: 10, summary: 'Your Superiority Dice become d10s.', description: 'Your Superiority Dice become d10s.', activation: 'passive' },
      { id: 'battle-master-relentless', name: 'Relentless', level: 15, summary: 'Once per turn, you can fuel a maneuver with a free d8 instead of spending a Superiority Die.', description: 'Once per turn, you can fuel a maneuver with a free d8 instead of spending a Superiority Die.', activation: 'passive' },
      { id: 'battle-master-ultimate-combat-superiority', name: 'Ultimate Combat Superiority', level: 18, summary: 'Your Superiority Dice become d12s.', description: 'Your Superiority Dice become d12s.', activation: 'passive' }
    ]
  },
  {
    id: 'eldritch-knight',
    name: 'Eldritch Knight',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'fighter',
    summary: 'A warrior who blends weapon skill with Wizard spells, using Intelligence to cast.',
    description: `Eldritch Knights study arcane magic alongside martial training. They gain a small selection of Wizard cantrips and spells (a one-third caster progression using Intelligence), focused on protection and battlefield utility, and learn to weave spells into their weapon attacks. They can also bond with their weapons so they can't easily lose them. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'eldritch-knight-spellcasting', name: 'Spellcasting', level: 3, summary: 'You learn Wizard cantrips and prepare a small number of Wizard spells, using Intelligence as your spellcasting ability.', description: 'You learn Wizard cantrips and prepare a small number of Wizard spells, using Intelligence as your spellcasting ability.', activation: 'passive' },
      { id: 'eldritch-knight-war-bond', name: 'War Bond', level: 3, summary: 'You can magically bond with weapons so they can’t be knocked from your grasp and can be summoned to your hand as a Bonus Action.', description: 'You can magically bond with weapons so they can’t be knocked from your grasp and can be summoned to your hand as a Bonus Action.', activation: 'bonus' },
      { id: 'eldritch-knight-war-magic', name: 'War Magic', level: 7, summary: 'When you take the Attack action, you can replace one of the attacks with casting a Wizard cantrip.', description: 'When you take the Attack action, you can replace one of the attacks with casting a Wizard cantrip.', activation: 'passive' },
      { id: 'eldritch-knight-eldritch-strike', name: 'Eldritch Strike', level: 10, summary: 'When you hit a creature with a weapon, it has Disadvantage on its next saving throw against your spells before the end of your next turn.', description: 'When you hit a creature with a weapon, it has Disadvantage on its next saving throw against your spells before the end of your next turn.', activation: 'passive' },
      { id: 'eldritch-knight-arcane-charge', name: 'Arcane Charge', level: 15, summary: 'When you use Action Surge, you can also teleport a short distance.', description: 'When you use Action Surge, you can also teleport a short distance.', activation: 'passive' },
      { id: 'eldritch-knight-improved-war-magic', name: 'Improved War Magic', level: 18, summary: 'When you take the Attack action, you can replace two of the attacks with casting a level 1 or 2 Wizard spell.', description: 'When you take the Attack action, you can replace two of the attacks with casting a level 1 or 2 Wizard spell.', activation: 'passive' }
    ]
  },
  {
    id: 'psi-warrior',
    name: 'Psi Warrior',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'fighter',
    summary: 'A fighter who channels psionic power to shield allies, add force damage and move things with the mind.',
    description: `Psi Warriors awaken the power of their minds to augment their fighting. They gain a pool of Psionic Energy Dice that grow in size and number with Fighter level and spend them on protective fields, telekinetic strikes and movement tricks. At high levels they can leap, shove foes with force and even master telekinesis. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'psi-warrior-psionic-power', name: 'Psionic Power', level: 3, summary: 'You gain Psionic Energy Dice and use them to reduce damage to allies (Protective Field), add Force damage to hits (Psionic Strike) or move objects (Telekinetic Movement).', description: 'You gain Psionic Energy Dice and use them to reduce damage to allies (Protective Field), add Force damage to hits (Psionic Strike) or move objects (Telekinetic Movement).', activation: 'special' },
      { id: 'psi-warrior-telekinetic-adept', name: 'Telekinetic Adept', level: 7, summary: 'You can spend psionic energy for a brief burst of flight (Psi-Powered Leap) and can shove or knock creatures Prone when you use Psionic Strike (Telekinetic Thrust).', description: 'You can spend psionic energy for a brief burst of flight (Psi-Powered Leap) and can shove or knock creatures Prone when you use Psionic Strike (Telekinetic Thrust).', activation: 'special' },
      { id: 'psi-warrior-guarded-mind', name: 'Guarded Mind', level: 10, summary: 'You gain Resistance to Psychic damage and can spend psionic energy to end the Charmed or Frightened condition on yourself.', description: 'You gain Resistance to Psychic damage and can spend psionic energy to end the Charmed or Frightened condition on yourself.', activation: 'passive', effects: [{ target: 'resistance', op: 'grant', value: 'psychic', note: 'Guarded Mind' }] },
      { id: 'psi-warrior-bulwark-of-force', name: 'Bulwark of Force', level: 15, summary: 'As a Bonus Action, you can give yourself and several nearby creatures Half Cover for a short time.', description: 'As a Bonus Action, you can give yourself and several nearby creatures Half Cover for a short time.', activation: 'bonus' },
      { id: 'psi-warrior-telekinetic-master', name: 'Telekinetic Master', level: 18, summary: 'You can cast Telekinesis using this feature and make a weapon attack as a Bonus Action while concentrating on it.', description: 'You can cast Telekinesis using this feature and make a weapon attack as a Bonus Action while concentrating on it.', activation: 'action' }
    ]
  }
]

const maneuver = (name: string, summary: string) => ({
  id: `maneuver-${name.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  name,
  summary,
  description: summary,
  source: 'PHB 2024' as const,
  prerequisite: 'Battle Master'
})

export const fighterOptions: ClassOptionGroup[] = [
  {
    classId: 'fighter',
    group: 'Maneuvers',
    source: 'PHB 2024',
    items: [
      maneuver('Ambush', 'Add a Superiority Die to a Stealth check or an Initiative roll.'),
      maneuver('Bait and Switch', 'Swap places with a willing nearby ally and boost one of your Armor Classes by the die roll.'),
      maneuver('Commander’s Strike', 'Give up one of your attacks so an ally can use its Reaction to attack, adding the die to its damage.'),
      maneuver('Commanding Presence', 'Add a Superiority Die to an Intimidation, Performance, or Persuasion check.'),
      maneuver('Disarming Attack', 'Add the die to damage and force the target to save or drop an object it is holding.'),
      maneuver('Distracting Strike', 'Add the die to damage and give the next attack against that target by someone else Advantage.'),
      maneuver('Evasive Footwork', 'Take the Disengage action as a Bonus Action and add the die to your AC until your next turn.'),
      maneuver('Feinting Attack', 'As a Bonus Action, gain Advantage on your next attack against a nearby creature and add the die to its damage.'),
      maneuver('Goading Attack', 'Add the die to damage and force the target to save or have Disadvantage on attacks against anyone but you.'),
      maneuver('Lunging Attack', 'Dash as a Bonus Action, and add the die to damage if you hit after moving straight toward the target.'),
      maneuver('Maneuvering Attack', 'Add the die to damage and let an ally move up to half its Speed without provoking Opportunity Attacks from the target.'),
      maneuver('Menacing Attack', 'Add the die to damage and force the target to save or become Frightened of you.'),
      maneuver('Parry', 'As a Reaction when hit by a melee attack, reduce the damage by the die roll plus your Strength or Dexterity modifier.'),
      maneuver('Precision Attack', 'Add a Superiority Die to an attack roll, possibly turning a miss into a hit.'),
      maneuver('Pushing Attack', 'Add the die to damage and force the target to save or be pushed away from you.'),
      maneuver('Rally', 'As a Bonus Action, give an ally Temporary Hit Points based on the die roll.'),
      maneuver('Riposte', 'As a Reaction when a creature misses you with a melee attack, attack it back and add the die to damage.'),
      maneuver('Sweeping Attack', 'When you hit with a melee attack, deal damage equal to the die roll to a second creature next to the target.'),
      maneuver('Tactical Assessment', 'Add a Superiority Die to a History, Investigation, or Insight check.'),
      maneuver('Trip Attack', 'Add the die to damage and force a Large or smaller target to save or be knocked Prone.')
    ]
  }
]
