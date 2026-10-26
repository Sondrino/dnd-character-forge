import type { ClassDef, SubclassDef, ClassOptionGroup } from '../../types'

const ASI_TEXT = `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Monk levels 8, 12, and 16.`

const asi = (level: number) => ({
  id: `monk-asi-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive' as const
})

const MARTIAL_ARTS = ['1d6', '1d6', '1d6', '1d6', '1d8', '1d8', '1d8', '1d8', '1d8', '1d8', '1d10', '1d10', '1d10', '1d10', '1d10', '1d10', '1d12', '1d12', '1d12', '1d12']
const MOVEMENT = ['—', '+10 ft.', '+10 ft.', '+10 ft.', '+10 ft.', '+15 ft.', '+15 ft.', '+15 ft.', '+15 ft.', '+20 ft.', '+20 ft.', '+20 ft.', '+20 ft.', '+25 ft.', '+25 ft.', '+25 ft.', '+25 ft.', '+30 ft.', '+30 ft.', '+30 ft.']
const FEATURES: string[][] = [
  ['Martial Arts', 'Unarmored Defense'],
  ['Monk’s Focus', 'Unarmored Movement', 'Uncanny Metabolism'],
  ['Deflect Attacks', 'Monk Subclass'],
  ['Ability Score Improvement', 'Slow Fall'],
  ['Extra Attack', 'Stunning Strike'],
  ['Empowered Strikes', 'Subclass feature'],
  ['Evasion'],
  ['Ability Score Improvement'],
  ['Acrobatic Movement'],
  ['Heightened Focus', 'Self-Restoration'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Deflect Energy'],
  ['Disciplined Survivor'],
  ['Perfect Focus'],
  ['Ability Score Improvement'],
  ['Subclass feature'],
  ['Superior Defense'],
  ['Epic Boon'],
  ['Body and Mind']
]
const PB = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]

export const monkClass: ClassDef = {
  id: 'monk',
  name: 'Monk',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A fast, unarmored martial artist who strikes with fists and simple weapons and spends Focus Points on flurries, defense and mobility.',
  description: `## Core Monk Traits

| Trait | |
|---|---|
| **Primary Ability** | Dexterity and Wisdom |
| **Hit Point Die** | D8 per Monk level |
| **Saving Throw Proficiencies** | Strength and Dexterity |
| **Skill Proficiencies** | *Choose 2:* Acrobatics, Athletics, History, Insight, Religion, or Stealth |
| **Weapon Proficiencies** | Simple weapons and Martial weapons that have the Light property |
| **Tool Proficiencies** | Choose one type of Artisan’s Tools or Musical Instrument (see “Equipment”) |
| **Armor Training** | None |
| **Starting Equipment** | *Choose A or B:* (A) Spear, 5 Daggers, Artisan’s Tools or Musical Instrument chosen for the tool proficiency above, Explorer’s Pack, and 11 GP; or (B) 50 GP |

### Becoming a Monk …

**As a Level 1 Character**
- Gain all the traits in the Core Monk Traits table.
- Gain the Monk’s level 1 features, which are listed in the Monk Features table.

**As a Multiclass Character**
- Gain the Hit Point Die trait from the Core Monk Traits table.
- Gain the Monk’s level 1 features, which are listed in the Monk Features table.

### Monk Class Features
As a Monk, you gain the following class features when you reach the specified Monk levels. These features are listed in the Monk Features table.`,
  tags: ['martial'],
  hitDie: 8,
  primaryAbility: ['dex', 'wis'],
  savingThrows: ['str', 'dex'],
  skillChoices: {
    count: 2,
    options: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth']
  },
  weaponProficiencies: ['simple', 'martial:light'],
  armorTraining: [],
  toolProficiencies: ['choice:artisan-or-musical:1'],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'spear' },
        { id: 'dagger', qty: 5 },
        { name: 'Artisan’s Tools or Musical Instrument (chosen for the tool proficiency above)' },
        { id: 'explorers-pack' }
      ],
      gp: 11
    },
    { label: 'B', items: [], gp: 50 }
  ],
  subclassLevel: 3,
  table: PB.map((profBonus, i) => ({
    level: i + 1,
    profBonus,
    features: FEATURES[i],
    columns: {
      'Martial Arts': MARTIAL_ARTS[i],
      'Focus Points': i === 0 ? '—' : i + 1,
      'Unarmored Movement': MOVEMENT[i]
    }
  })),
  features: [
    {
      id: 'monk-martial-arts',
      name: 'Martial Arts',
      level: 1,
      summary: 'While unarmored and without a Shield: Unarmed Strike as a Bonus Action, use your Martial Arts die for damage, and use Dexterity for attacks with Unarmed Strikes and Monk weapons.',
      description: `Your practice of martial arts gives you mastery of combat styles that use your Unarmed Strike and Monk weapons, which are the following:
- Simple Melee weapons
- Martial Melee weapons that have the Light property

You gain the following benefits while you are unarmed or wielding only Monk weapons and you aren’t wearing armor or wielding a Shield.

**Bonus Unarmed Strike.** You can make an Unarmed Strike as a Bonus Action.

**Martial Arts Die.** You can roll 1d6 in place of the normal damage of your Unarmed Strike or Monk weapons. This die changes as you gain Monk levels, as shown in the Martial Arts column of the Monk Features table.

**Dexterous Attacks.** You can use your Dexterity modifier instead of your Strength modifier for the attack and damage rolls of your Unarmed Strikes and Monk weapons. In addition, when you use the Grapple or Shove option of your Unarmed Strike, you can use your Dexterity modifier instead of your Strength modifier to determine the save DC.`,
      activation: 'bonus'
    },
    {
      id: 'monk-unarmored-defense',
      name: 'Unarmored Defense',
      level: 1,
      summary: 'Without armor or a Shield, your base AC is 10 + Dexterity modifier + Wisdom modifier.',
      description: `While you aren’t wearing armor or wielding a Shield, your base Armor Class equals 10 plus your Dexterity and Wisdom modifiers.`,
      activation: 'passive',
      effects: [{ target: 'ac.unarmored', op: 'set', value: '10+dex+wis', condition: 'noArmorNoShield', note: 'Monk Unarmored Defense' }]
    },
    {
      id: 'monk-focus',
      name: 'Monk’s Focus',
      level: 2,
      summary: 'Gain Focus Points equal to your Monk level (regained on a Short or Long Rest) to fuel Flurry of Blows, Patient Defense and Step of the Wind. Save DC = 8 + Wis mod + Proficiency Bonus.',
      description: `Your focus and martial training allow you to harness a well of extraordinary energy within yourself. This energy is represented by Focus Points. Your Monk level determines the number of points you have, as shown in the Focus Points column of the Monk Features table.

You can expend these points to enhance or fuel certain Monk features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind, each of which is detailed below.

When you expend a Focus Point, it is unavailable until you finish a Short or Long Rest, at the end of which you regain all your expended points.

Some features that use Focus Points require your target to make a saving throw. The save DC equals 8 plus your Wisdom modifier and Proficiency Bonus.

**Flurry of Blows.** You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action.

**Patient Defense.** You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action.

**Step of the Wind.** You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and your jump distance is doubled for the turn.`,
      uses: { count: 'level', recharge: 'shortOrLong' },
      activation: 'bonus'
    },
    {
      id: 'monk-unarmored-movement',
      name: 'Unarmored Movement',
      level: 2,
      summary: 'Your Speed increases by 10 feet (more at higher levels) while you aren’t wearing armor or wielding a Shield.',
      description: `Your speed increases by 10 feet while you aren’t wearing armor or wielding a Shield. This bonus increases when you reach certain Monk levels, as shown on the Monk Features table.`,
      activation: 'passive',
      effects: [
        {
          target: 'speed',
          op: 'add',
          value: '5+5*floor((level+2)/4)',
          condition: 'noArmorNoShield',
          note: 'Unarmored Movement (see Unarmored Movement column)'
        }
      ]
    },
    {
      id: 'monk-uncanny-metabolism',
      name: 'Uncanny Metabolism',
      level: 2,
      summary: 'When you roll Initiative, regain all Focus Points and heal Monk level + a Martial Arts die roll. Once per Long Rest.',
      description: `When you roll Initiative, you can regain all expended Focus Points. When you do so, roll your Martial Arts die, and regain a number of Hit Points equal to your Monk level plus the number rolled.

Once you use this feature, you can’t use it again until you finish a Long Rest.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'special'
    },
    {
      id: 'monk-deflect-attacks',
      name: 'Deflect Attacks',
      level: 3,
      summary: 'Reaction: reduce bludgeoning, piercing or slashing attack damage by 1d10 + Dex mod + Monk level; if reduced to 0, spend 1 Focus Point to redirect it.',
      description: `When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to reduce the attack’s total damage against you. The reduction equals 1d10 plus your Dexterity modifier and Monk level.

If you reduce the damage to 0, you can expend 1 Focus Point to redirect some of the attack’s force. If you do so, choose a creature you can see within 5 feet of yourself if the attack was a melee attack or a creature you can see within 60 feet of yourself that isn’t behind Total Cover if the attack was a ranged attack. That creature must succeed on a Dexterity saving throw or take damage equal to two rolls of your Martial Arts die plus your Dexterity modifier. The damage is the same type dealt by the attack.`,
      activation: 'reaction'
    },
    {
      id: 'monk-subclass',
      name: 'Monk Subclass',
      level: 3,
      summary: 'Choose a Monk subclass, which grants features at levels 3, 6, 11 and 17.',
      description: `You gain a Monk subclass of your choice. The Warrior of the Open Hand subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Monk levels. For the rest of your career, you gain each of your subclass’s features that are of your Monk level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'monk-slow-fall',
      name: 'Slow Fall',
      level: 4,
      summary: 'Reaction: reduce falling damage by five times your Monk level.',
      description: `You can take a Reaction when you fall to reduce any damage you take from the fall by an amount equal to five times your Monk level.`,
      activation: 'reaction'
    },
    {
      id: 'monk-extra-attack',
      name: 'Extra Attack',
      level: 5,
      summary: 'Attack twice whenever you take the Attack action.',
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    {
      id: 'monk-stunning-strike',
      name: 'Stunning Strike',
      level: 5,
      summary: 'Once per turn on a hit, spend 1 Focus Point: the target makes a Con save or is Stunned until the start of your next turn (on a success, its Speed is halved and the next attack against it has Advantage).',
      description: `Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike, you can expend 1 Focus Point to attempt a stunning strike. The target must make a Constitution saving throw. On a failed save, the target has the Stunned condition until the start of your next turn. On a successful save, the target’s Speed is halved until the start of your next turn, and the next attack roll made against the target before then has Advantage.`,
      activation: 'special'
    },
    {
      id: 'monk-empowered-strikes',
      name: 'Empowered Strikes',
      level: 6,
      summary: 'Your Unarmed Strikes can deal Force damage instead of their normal damage type.',
      description: `Whenever you deal damage with your Unarmed Strike, it can deal your choice of Force damage or its normal damage type.`,
      activation: 'passive'
    },
    {
      id: 'monk-evasion',
      name: 'Evasion',
      level: 7,
      summary: 'On a Dexterity save for half damage, take no damage on a success and half on a failure (not while Incapacitated).',
      description: `When you’re subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail.

You don’t benefit from this feature if you have the Incapacitated condition.`,
      activation: 'passive'
    },
    asi(8),
    {
      id: 'monk-acrobatic-movement',
      name: 'Acrobatic Movement',
      level: 9,
      summary: 'While unarmored and without a Shield, you can move along vertical surfaces and across liquids on your turn.',
      description: `While you aren’t wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the movement.`,
      activation: 'passive'
    },
    {
      id: 'monk-heightened-focus',
      name: 'Heightened Focus',
      level: 10,
      summary: 'Flurry of Blows makes three strikes, Patient Defense grants Temporary HP, and Step of the Wind can carry a willing ally with you.',
      description: `Your Flurry of Blows, Patient Defense, and Step of the Wind gain the following benefits.

**Flurry of Blows.** You can expend 1 Focus Point to use Flurry of Blows and make three Unarmed Strikes with it instead of two.

**Patient Defense.** When you expend a Focus Point to use Patient Defense, you gain a number of Temporary Hit Points equal to two rolls of your Martial Arts die.

**Step of the Wind.** When you expend a Focus Point to use Step of the Wind, you can choose a willing creature within 5 feet of yourself that is Large or smaller. You move the creature with you until the end of your turn. The creature’s movement doesn’t provoke Opportunity Attacks.`,
      activation: 'passive'
    },
    {
      id: 'monk-self-restoration',
      name: 'Self-Restoration',
      level: 10,
      summary: 'At the end of each of your turns, remove Charmed, Frightened, or Poisoned from yourself; going without food and drink doesn’t cause Exhaustion.',
      description: `Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed, Frightened, or Poisoned.

In addition, forgoing food and drink doesn’t give you levels of Exhaustion.`,
      activation: 'passive'
    },
    asi(12),
    {
      id: 'monk-deflect-energy',
      name: 'Deflect Energy',
      level: 13,
      summary: 'Deflect Attacks now works against attacks of any damage type.',
      description: `You can now use your Deflect Attacks feature against attacks that deal any damage type, not just Bludgeoning, Piercing, or Slashing.`,
      activation: 'passive'
    },
    {
      id: 'monk-disciplined-survivor',
      name: 'Disciplined Survivor',
      level: 14,
      summary: 'Proficiency in all saving throws; spend 1 Focus Point to reroll a failed save.',
      description: `Your physical and mental discipline grant you proficiency in all saving throws.

Additionally, whenever you make a saving throw and fail, you can expend 1 Focus Point to reroll it, and you must use the new roll.`,
      activation: 'passive',
      effects: [{ target: 'save.all', op: 'proficiency', note: 'Disciplined Survivor' }]
    },
    {
      id: 'monk-perfect-focus',
      name: 'Perfect Focus',
      level: 15,
      summary: 'When you roll Initiative without using Uncanny Metabolism, you regain Focus Points up to 4 if you have 3 or fewer.',
      description: `When you roll Initiative and don’t use Uncanny Metabolism, you regain expended Focus Points until you have 4 if you have 3 or fewer.`,
      activation: 'passive'
    },
    asi(16),
    {
      id: 'monk-superior-defense',
      name: 'Superior Defense',
      level: 18,
      summary: 'At the start of your turn, spend 3 Focus Points to gain Resistance to all damage except Force for 1 minute.',
      description: `At the start of your turn, you can expend 3 Focus Points to bolster yourself against harm for 1 minute or until you have the Incapacitated condition. During that time, you have Resistance to all damage except Force damage.`,
      activation: 'special'
    },
    {
      id: 'monk-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for (Boon of Irresistible Offense is recommended).',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended.`,
      activation: 'passive'
    },
    {
      id: 'monk-body-and-mind',
      name: 'Body and Mind',
      level: 20,
      summary: 'Your Dexterity and Wisdom scores increase by 4, to a maximum of 25.',
      description: `You have developed your body and mind to new heights. Your Dexterity and Wisdom scores increase by 4, to a maximum of 25.`,
      activation: 'passive',
      effects: [
        { target: 'abilityMax.dex', op: 'set', value: 25, note: 'Body and Mind' },
        { target: 'abilityMax.wis', op: 'set', value: 25, note: 'Body and Mind' },
        { target: 'ability.dex', op: 'add', value: 4, note: 'Body and Mind' },
        { target: 'ability.wis', op: 'add', value: 4, note: 'Body and Mind' }
      ]
    }
  ],
  multiclass: {
    prerequisite: 'Dexterity 13 and Wisdom 13 (plus at least 13 in the primary ability of each of your current classes)',
    proficiencies: 'Hit Point Die only (no weapon, armor, skill or tool proficiencies)'
  },
  quickBuild:
    'Make Dexterity your highest score, followed by Wisdom, since both power your Armor Class and attacks. Constitution is a good third choice. A quiet, introspective background such as Hermit suits the class. Take the spear, daggers and Explorer’s Pack (option A), and do not buy armor: it switches off most of your features.',
  tips: [
    'Never wear armor or carry a Shield. Unarmored Defense, Martial Arts and Unarmored Movement all stop working if you do.',
    'From level 1 you get a free Unarmed Strike as a Bonus Action every turn, so you usually attack twice even before Extra Attack.',
    'Focus Points come back on a Short Rest, so spend them freely and ask the group for short rests.',
    'Uncanny Metabolism refills your Focus Points when you roll Initiative once per Long Rest, so spend points freely in the fight before.',
    'Stunning Strike is your best control tool at level 5+. Aim it at enemies with a weak Constitution, like spellcasters.',
    'Use your speed: Step of the Wind and Patient Defense let you hit a target and then get out of reach without taking Opportunity Attacks.',
    'Deflect Attacks can reduce a hit to 0 damage. With spare Focus, throw the attack back at an enemy.'
  ],
  recommended: {
    species: ['elf', 'human', 'halfling', 'goliath', 'orc', 'dwarf'],
    backgrounds: ['hermit', 'acolyte', 'sage', 'criminal', 'wayfarer', 'artisan'],
    feats: ['alert', 'tough', 'lucky', 'speedy', 'sentinel', 'resilient', 'grappler', 'skulker'],
    weapons: ['spear', 'quarterstaff', 'shortsword', 'scimitar', 'dagger', 'handaxe']
  }
}

export const monkSubclasses: SubclassDef[] = [
  {
    id: 'warrior-of-the-open-hand',
    name: 'Warrior of the Open Hand',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'monk',
    summary: 'A master of unarmed combat whose Flurry of Blows pushes, trips and hinders foes, with self-healing and a deadly Quivering Palm.',
    description: `*Master Unarmed Combat Techniques*

Warriors of the Open Hand are masters of unarmed combat. They learn techniques to push and trip their opponents and manipulate their own energy to protect themselves from harm.`,
    features: [
      {
        id: 'open-hand-technique',
        name: 'Open Hand Technique',
        level: 3,
        summary: 'When you hit with a Flurry of Blows attack, impose Addle (no Opportunity Attacks), Push (Str save or pushed 15 ft) or Topple (Dex save or Prone).',
        description: `Whenever you hit a creature with an attack granted by your Flurry of Blows, you can impose one of the following effects on that target.

**Addle.** The target can’t make Opportunity Attacks until the start of its next turn.

**Push.** The target must succeed on a Strength saving throw or be pushed up to 15 feet away from you.

**Topple.** The target must succeed on a Dexterity saving throw or have the Prone condition.`,
        activation: 'passive'
      },
      {
        id: 'open-hand-wholeness-of-body',
        name: 'Wholeness of Body',
        level: 6,
        summary: 'Bonus Action: heal your Martial Arts die + Wisdom modifier. Uses equal to your Wisdom modifier per Long Rest.',
        description: `You gain the ability to heal yourself. As a Bonus Action, you can roll your Martial Arts die. You regain a number of Hit Points equal to the number rolled plus your Wisdom modifier (minimum of 1 Hit Point regained).

You can use this feature a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a Long Rest.`,
        uses: { count: 'mod.wis', recharge: 'long' },
        activation: 'bonus'
      },
      {
        id: 'open-hand-fleet-step',
        name: 'Fleet Step',
        level: 11,
        summary: 'When you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind right after it.',
        description: `When you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind immediately after that Bonus Action.`,
        activation: 'passive'
      },
      {
        id: 'open-hand-quivering-palm',
        name: 'Quivering Palm',
        level: 17,
        summary: 'Spend 4 Focus Points on an Unarmed Strike hit to plant vibrations; end them later to force a Con save for 10d12 Force damage (half on success).',
        description: `You gain the ability to set up lethal vibrations in someone’s body. When you hit a creature with an Unarmed Strike, you can expend 4 Focus Points to start these imperceptible vibrations, which last for a number of days equal to your Monk level. The vibrations are harmless unless you take an action to end them. Alternatively, when you take the Attack action on your turn, you can forgo one of the attacks to end the vibrations. To end them, you and the target must be on the same plane of existence. When you end them, the target must make a Constitution saving throw, taking 10d12 Force damage on a failed save or half as much damage on a successful one.

You can have only one creature under the effect of this feature at a time. You can end the vibrations harmlessly (no action required).`,
        activation: 'special'
      }
    ]
  },
  {
    id: 'warrior-of-mercy',
    name: 'Warrior of Mercy',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'monk',
    summary: 'A monk who uses Focus Points both to heal allies and to harm enemies with necrotic touches.',
    description: `Warriors of Mercy manipulate life force, mending the wounded with one hand and wounding foes with the other. They can weave healing into their Flurry of Blows and add necrotic damage to their strikes. At the highest level they can even bring the recently dead back to life. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'mercy-hand-of-harm', name: 'Hand of Harm', level: 3, summary: 'Spend a Focus Point when you hit with an Unarmed Strike to deal extra Necrotic damage.', description: 'Spend a Focus Point when you hit with an Unarmed Strike to deal extra Necrotic damage.', activation: 'special' },
      { id: 'mercy-hand-of-healing', name: 'Hand of Healing', level: 3, summary: 'Spend a Focus Point to heal a creature you touch, including in place of one of your Flurry of Blows strikes.', description: 'Spend a Focus Point to heal a creature you touch, including in place of one of your Flurry of Blows strikes.', activation: 'action' },
      { id: 'mercy-implements-of-mercy', name: 'Implements of Mercy', level: 3, summary: 'You gain proficiency in Insight and Medicine and with the Herbalism Kit.', description: 'You gain proficiency in Insight and Medicine and with the Herbalism Kit.', activation: 'passive', effects: [{ target: 'skill.insight', op: 'proficiency' }, { target: 'skill.medicine', op: 'proficiency' }, { target: 'proficiency.tool', op: 'grant', value: 'herbalism-kit' }] },
      { id: 'mercy-physicians-touch', name: 'Physician’s Touch', level: 6, summary: 'Hand of Harm can also poison the target, and Hand of Healing can also end certain conditions.', description: 'Hand of Harm can also poison the target, and Hand of Healing can also end certain conditions.', activation: 'passive' },
      { id: 'mercy-flurry-of-healing-and-harm', name: 'Flurry of Healing and Harm', level: 11, summary: 'You can combine Flurry of Blows with Hand of Healing and Hand of Harm more efficiently, with less Focus Point cost.', description: 'You can combine Flurry of Blows with Hand of Healing and Hand of Harm more efficiently, with less Focus Point cost.', activation: 'passive' },
      { id: 'mercy-hand-of-ultimate-mercy', name: 'Hand of Ultimate Mercy', level: 17, summary: 'Spend Focus Points to return a creature that died recently to life; usable once per Long Rest.', description: 'Spend Focus Points to return a creature that died recently to life; usable once per Long Rest.', activation: 'action', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'warrior-of-shadow',
    name: 'Warrior of Shadow',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'monk',
    summary: 'A stealthy monk who wields magical darkness and teleports from shadow to shadow.',
    description: `Warriors of Shadow practice arts of stealth and subterfuge. They can conjure magical darkness they see through, step between shadows to reposition and strike, and eventually become nearly impossible to pin down in dim light. They are ideal for scouting and ambush tactics. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'shadow-shadow-arts', name: 'Shadow Arts', level: 3, summary: 'Spend a Focus Point to create magical Darkness you can see through, and gain improved Darkvision and the Minor Illusion cantrip.', description: 'Spend a Focus Point to create magical Darkness you can see through, and gain improved Darkvision and the Minor Illusion cantrip.', activation: 'special' },
      { id: 'shadow-shadow-step', name: 'Shadow Step', level: 6, summary: 'As a Bonus Action, teleport from dim light or darkness to another shadowy spot you can see and gain Advantage on your next melee attack.', description: 'As a Bonus Action, teleport from dim light or darkness to another shadowy spot you can see and gain Advantage on your next melee attack.', activation: 'bonus' },
      { id: 'shadow-improved-shadow-step', name: 'Improved Shadow Step', level: 11, summary: 'By spending a Focus Point, Shadow Step works without needing shadows and you can make an Unarmed Strike right after teleporting.', description: 'By spending a Focus Point, Shadow Step works without needing shadows and you can make an Unarmed Strike right after teleporting.', activation: 'bonus' },
      { id: 'shadow-cloak-of-shadows', name: 'Cloak of Shadows', level: 17, summary: 'Spend Focus Points to shroud yourself in shadow, becoming Invisible in dim light and darkness and able to pass through creatures and objects for a short time.', description: 'Spend Focus Points to shroud yourself in shadow, becoming Invisible in dim light and darkness and able to pass through creatures and objects for a short time.', activation: 'action' }
    ]
  },
  {
    id: 'warrior-of-the-elements',
    name: 'Warrior of the Elements',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'monk',
    summary: 'A monk who channels elemental power to extend their reach, blast areas and eventually fly.',
    description: `Warriors of the Elements attune themselves to the elemental planes. By spending Focus Points they extend the reach of their strikes with elemental energy, change their damage type, and hurl explosive bursts. At higher levels they gain flight and become living embodiments of elemental force. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      { id: 'elements-elemental-attunement', name: 'Elemental Attunement', level: 3, summary: 'Spend a Focus Point to become attuned for a while: your Unarmed Strikes gain extra reach, can deal elemental damage and can push or pull targets.', description: 'Spend a Focus Point to become attuned for a while: your Unarmed Strikes gain extra reach, can deal elemental damage and can push or pull targets.', activation: 'special' },
      { id: 'elements-manipulate-elements', name: 'Manipulate Elements', level: 3, summary: 'You learn the Elementalism cantrip.', description: 'You learn the Elementalism cantrip.', activation: 'passive' },
      { id: 'elements-elemental-burst', name: 'Elemental Burst', level: 6, summary: 'Spend Focus Points to unleash an explosion of elemental energy at a distance that damages creatures in an area (Dexterity save).', description: 'Spend Focus Points to unleash an explosion of elemental energy at a distance that damages creatures in an area (Dexterity save).', activation: 'action' },
      { id: 'elements-stride-of-the-elements', name: 'Stride of the Elements', level: 11, summary: 'While Elemental Attunement is active, you gain a Fly Speed and Swim Speed equal to your Speed.', description: 'While Elemental Attunement is active, you gain a Fly Speed and Swim Speed equal to your Speed.', activation: 'passive' },
      { id: 'elements-elemental-epitome', name: 'Elemental Epitome', level: 17, summary: 'While attuned, you gain damage Resistance, deal extra elemental damage with strikes and damage creatures you pass with Step of the Wind.', description: 'While attuned, you gain damage Resistance, deal extra elemental damage with strikes and damage creatures you pass with Step of the Wind.', activation: 'passive' }
    ]
  }
]

export const monkOptions: ClassOptionGroup[] = []
