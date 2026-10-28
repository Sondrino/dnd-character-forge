import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow, Feature } from '../../types'

// Bard — SRD 5.2.1 (CC-BY-4.0) + PHB 2024-subclasses (kun sammendrag med egne ord)

const profBonus = (level: number): number => Math.ceil(level / 4) + 1

const FULL_CASTER_SLOTS: number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1]
]
const SLOT_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
const slotColumns = (level: number): Record<string, string | number> => {
  const out: Record<string, string | number> = {}
  SLOT_NAMES.forEach((n, i) => (out[n] = FULL_CASTER_SLOTS[level - 1][i] ?? '—'))
  return out
}

const FEATURES_BY_LEVEL: string[][] = [
  ['Bardic Inspiration', 'Spellcasting'],
  ['Expertise', 'Jack of All Trades'],
  ['Bard Subclass'],
  ['Ability Score Improvement'],
  ['Font of Inspiration'],
  ['Subclass feature'],
  ['Countercharm'],
  ['Ability Score Improvement'],
  ['Expertise'],
  ['Magical Secrets'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Superior Inspiration'],
  ['Epic Boon'],
  ['Words of Creation']
]

const BARDIC_DIE = ['D6', 'D6', 'D6', 'D6', 'D8', 'D8', 'D8', 'D8', 'D8', 'D10', 'D10', 'D10', 'D10', 'D10', 'D12', 'D12', 'D12', 'D12', 'D12', 'D12']
const CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]

const table: ClassLevelRow[] = FEATURES_BY_LEVEL.map((features, i) => ({
  level: i + 1,
  profBonus: profBonus(i + 1),
  features,
  columns: {
    'Bardic Die': BARDIC_DIE[i],
    Cantrips: CANTRIPS[i],
    'Prepared Spells': PREPARED[i],
    ...slotColumns(i + 1)
  }
}))

const asi = (level: number): Feature => ({
  id: `bard-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat of your choice for which you qualify.',
  description: `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Bard levels 8, 12, and 16.`,
  activation: 'passive'
})

export const bardClass: ClassDef = {
  id: 'bard',
  name: 'Bard',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A versatile performer whose music, words, or dance inspire allies and weave magic—skilled at almost everything and a strong support spellcaster.',
  description: `## Core Bard Traits

| Trait | Value |
|---|---|
| **Primary Ability** | Charisma |
| **Hit Point Die** | D8 per Bard level |
| **Saving Throw Proficiencies** | Dexterity and Charisma |
| **Skill Proficiencies** | Choose any 3 skills (see “Playing the Game”) |
| **Weapon Proficiencies** | Simple weapons |
| **Tool Proficiencies** | Choose 3 Musical Instruments (see “Equipment”) |
| **Armor Training** | Light armor |
| **Starting Equipment** | Choose A or B: (A) Leather Armor, 2 Daggers, Musical Instrument of your choice, Entertainer’s Pack, and 19 GP; or (B) 90 GP |

### Becoming a Bard …

**As a Level 1 Character**
- Gain all the traits in the Core Bard Traits table.
- Gain the Bard’s level 1 features, which are listed in the Bard Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Bard Traits table: Hit Point Die, proficiency in one skill of your choice, proficiency with one Musical Instrument of your choice, and training with Light armor.
- Gain the Bard’s level 1 features, which are listed in the Bard Features table. See the multiclassing rules in “Character Creation” to determine your available spell slots.

### Bard Class Features
As a Bard, you gain the following class features when you reach the specified Bard levels. These features are listed in the Bard Features table.`,
  tags: ['spellcaster', 'support', 'skills', 'face'],
  hitDie: 8,
  primaryAbility: ['cha'],
  savingThrows: ['dex', 'cha'],
  skillChoices: {
    count: 3,
    options: [
      'acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation',
      'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand',
      'stealth', 'survival'
    ]
  },
  weaponProficiencies: ['simple'],
  armorTraining: ['light'],
  toolProficiencies: ['choice:musical:3'],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'leather-armor' },
        { id: 'dagger', qty: 2 },
        { id: 'musical-instrument', name: 'Musical Instrument of your choice' },
        { id: 'entertainers-pack' }
      ],
      gp: 19
    },
    { label: 'B', items: [], gp: 90 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'bard-bardic-inspiration',
      name: 'Bardic Inspiration',
      level: 1,
      summary:
        'As a Bonus Action, give a creature within 60 feet a Bardic Inspiration die it can add to a failed D20 Test within the next hour. Uses equal your Charisma modifier (minimum 1).',
      description: `You can supernaturally inspire others through words, music, or dance. This inspiration is represented by your Bardic Inspiration die, which is a d6.

**Using Bardic Inspiration.** As a Bonus Action, you can inspire another creature within 60 feet of yourself who can see or hear you. That creature gains one of your Bardic Inspiration dice. A creature can have only one Bardic Inspiration die at a time.

Once within the next hour when the creature fails a D20 Test, the creature can roll the Bardic Inspiration die and add the number rolled to the d20, potentially turning the failure into a success. A Bardic Inspiration die is expended when it’s rolled.

**Number of Uses.** You can confer a Bardic Inspiration die a number of times equal to your Charisma modifier (minimum of once), and you regain all expended uses when you finish a Long Rest.

**At Higher Levels.** Your Bardic Inspiration die changes when you reach certain Bard levels, as shown in the Bardic Die column of the Bard Features table. The die becomes a d8 at level 5, a d10 at level 10, and a d12 at level 15.`,
      uses: { count: 'mod.cha', recharge: 'long', shortFrom: 5 },
      activation: 'bonus'
    },
    {
      id: 'bard-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary:
        'Cast Bard spells using Charisma, with a Musical Instrument as your focus. You know cantrips and prepare level 1+ spells as shown in the Bard Features table.',
      description: `You have learned to cast spells through your bardic arts. See “Spells” for the rules on spellcasting. The information below details how you use those rules with Bard spells, which appear in the Bard spell list later in the class’s description.

**Cantrips.** You know two cantrips of your choice from the Bard spell list. Dancing Lights and Vicious Mockery are recommended.

Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list.

When you reach Bard levels 4 and 10, you learn another cantrip of your choice from the Bard spell list, as shown in the Cantrips column of the Bard Features table.

**Spell Slots.** The Bard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Bard spell list. Charm Person, Color Spray, Dissonant Whispers, and Healing Word are recommended.

The number of spells on your list increases as you gain Bard levels, as shown in the Prepared Spells column of the Bard Features table. Whenever that number increases, choose additional spells from the Bard spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you’re a level 3 Bard, your list of prepared spells can include six spells of levels 1 and 2 in any combination.

If another Bard feature gives you spells that you always have prepared, those spells don’t count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you.

**Changing Your Prepared Spells.** Whenever you gain a Bard level, you can replace one spell on your list with another Bard spell for which you have spell slots.

**Spellcasting Ability.** Charisma is your spellcasting ability for your Bard spells.

**Spellcasting Focus.** You can use a Musical Instrument as a Spellcasting Focus for your Bard spells.`,
      activation: 'passive'
    },
    {
      id: 'bard-expertise',
      name: 'Expertise',
      level: 2,
      summary: 'Gain Expertise in two of your skill proficiencies (two more at Bard level 9).',
      description: `You gain Expertise (see “Rules Glossary”) in two of your skill proficiencies of your choice. Performance and Persuasion are recommended if you have proficiency in them.

At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice.`,
      activation: 'passive',
      choices: [{ id: 'bard-expertise-2', label: 'Expertise (2 skills)', count: 2, type: 'expertise' }]
    },
    {
      id: 'bard-jack-of-all-trades',
      name: 'Jack of All Trades',
      level: 2,
      summary: 'Add half your Proficiency Bonus (round down) to ability checks using skills you aren’t proficient in.',
      description: `You can add half your Proficiency Bonus (round down) to any ability check you make that uses a skill proficiency you lack and that doesn’t otherwise use your Proficiency Bonus.

For example, if you make a Strength (Athletics) check and lack Athletics proficiency, you can add half your Proficiency Bonus to the check.`,
      activation: 'passive'
    },
    {
      id: 'bard-subclass',
      name: 'Bard Subclass',
      level: 3,
      summary: 'Choose a Bard subclass, which grants features at Bard levels 3, 6, and 14.',
      description: `You gain a Bard subclass of your choice. The College of Lore subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Bard levels. For the rest of your career, you gain each of your subclass’s features that are of your Bard level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'bard-font-of-inspiration',
      name: 'Font of Inspiration',
      level: 5,
      summary:
        'You regain all Bardic Inspiration uses on a Short or Long Rest, and you can expend a spell slot to regain one use.',
      description: `You now regain all your expended uses of Bardic Inspiration when you finish a Short or Long Rest.

In addition, you can expend a spell slot (no action required) to regain one expended use of Bardic Inspiration.`,
      activation: 'special'
    },
    {
      id: 'bard-countercharm',
      name: 'Countercharm',
      level: 7,
      summary:
        'When you or a creature within 30 feet fails a save against being Charmed or Frightened, use your Reaction to have it rerolled with Advantage.',
      description: `You can use musical notes or words of power to disrupt mind-influencing effects. If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage.`,
      activation: 'reaction'
    },
    asi(8),
    {
      id: 'bard-expertise-9',
      name: 'Expertise',
      level: 9,
      summary: 'Gain Expertise in two more of your skill proficiencies.',
      description: `At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice.`,
      activation: 'passive',
      choices: [{ id: 'bard-expertise-9', label: 'Expertise (2 more skills)', count: 2, type: 'expertise' }]
    },
    {
      id: 'bard-magical-secrets',
      name: 'Magical Secrets',
      level: 10,
      summary: 'Your new prepared spells (and replacements) can come from the Bard, Cleric, Druid, and Wizard spell lists.',
      description: `You’ve learned secrets from various magical traditions. Whenever you reach a Bard level (including this level) and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard, Cleric, Druid, and Wizard spell lists, and the chosen spells count as Bard spells for you (see a class’s section for its spell list). In addition, whenever you replace a spell prepared for this class, you can replace it with a spell from those lists.`,
      activation: 'passive'
    },
    asi(12),
    asi(16),
    {
      id: 'bard-superior-inspiration',
      name: 'Superior Inspiration',
      level: 18,
      summary: 'When you roll Initiative, you regain Bardic Inspiration uses until you have at least two.',
      description: `When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that.`,
      activation: 'special'
    },
    {
      id: 'bard-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for. Boon of Spell Recall is recommended.',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Spell Recall is recommended.`,
      activation: 'passive'
    },
    {
      id: 'bard-words-of-creation',
      name: 'Words of Creation',
      level: 20,
      summary:
        'You always have Power Word Heal and Power Word Kill prepared, and each can target a second creature within 10 feet of the first.',
      description: `You have mastered two of the Words of Creation: the words of life and death. You therefore always have the Power Word Heal and Power Word Kill spells prepared. When you cast either spell, you can target a second creature with it if that creature is within 10 feet of the first target.`,
      activation: 'passive'
    }
  ],
  spellcasting: {
    ability: 'cha',
    progression: 'full',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'bard',
    ritualCasting: true,
    focus: 'Musical Instrument'
  },
  multiclass: {
    prerequisite: 'Charisma 13',
    proficiencies: 'Hit Point Die, one skill of your choice, one Musical Instrument of your choice, and training with Light armor'
  },
  quickBuild: `Make Charisma your highest score, because it fuels your spells and Bardic Inspiration; Dexterity comes next for AC and Initiative, followed by Constitution. The Entertainer background suits the class well. For cantrips, Dancing Lights and Vicious Mockery are good starting picks, and Charm Person, Color Spray, Dissonant Whispers, and Healing Word make a solid first set of prepared spells.`,
  tips: [
    'Hand out Bardic Inspiration early and often—unused dice are wasted, and from level 5 they come back on a Short Rest.',
    'Healing Word is a Bonus Action spell with range: use it to get a downed ally back on their feet from a distance.',
    'Vicious Mockery deals damage and gives the target Disadvantage on its next attack roll, making it a great default cantrip.',
    'Put Expertise in the skills you use most, such as Persuasion, Deception, or Perception, to become the party’s go-to talker.',
    'Jack of All Trades makes you decent at every skill, so don’t be afraid to try checks you aren’t proficient in.',
    'You only have Light armor and Simple weapons; stay a little behind the front line and let your spells do the work.',
    'At level 10, Magical Secrets lets you take spells from the Cleric, Druid, and Wizard lists—plan which big spells you want.'
  ],
  recommended: {
    species: ['human', 'halfling', 'elf', 'tiefling', 'gnome'],
    backgrounds: ['entertainer', 'charlatan', 'noble', 'sage', 'merchant'],
    feats: ['alert', 'musician', 'skilled', 'war-caster', 'magic-initiate', 'lucky', 'boon-of-spell-recall'],
    cantrips: ['vicious-mockery', 'dancing-lights', 'minor-illusion', 'mage-hand', 'prestidigitation', 'starry-wisp'],
    spells: [
      'healing-word', 'dissonant-whispers', 'charm-person', 'color-spray', 'faerie-fire', 'sleep', 'heroism',
      'hold-person', 'invisibility', 'hypnotic-pattern', 'dispel-magic'
    ],
    weapons: ['dagger', 'light-crossbow', 'shortbow', 'quarterstaff']
  }
}

export const bardSubclasses: SubclassDef[] = [
  {
    id: 'college-of-lore',
    name: 'College of Lore',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'bard',
    summary: 'Plumb the Depths of Magical Knowledge: Bards who collect spells and secrets, with extra skills and cutting wit.',
    description: `*Plumb the Depths of Magical Knowledge*

Bards of the College of Lore collect spells and secrets from diverse sources, such as scholarly tomes, mystical rites, and peasant tales. The college’s members gather in libraries and universities to share their lore with one another. They also meet at festivals or affairs of state, where they can expose corruption, unravel lies, and poke fun at self-important figures of authority.`,
    features: [
      {
        id: 'college-of-lore-bonus-proficiencies',
        name: 'Bonus Proficiencies',
        level: 3,
        summary: 'You gain proficiency with three skills of your choice.',
        description: `You gain proficiency with three skills of your choice.`,
        activation: 'passive',
        choices: [{ id: 'college-of-lore-skills', label: 'Bonus Proficiencies (3 skills)', count: 3, type: 'skill' }]
      },
      {
        id: 'college-of-lore-cutting-words',
        name: 'Cutting Words',
        level: 3,
        summary:
          'As a Reaction, expend Bardic Inspiration to subtract the die from a visible creature’s damage roll, or from a successful ability check or attack roll.',
        description: `You learn to use your wit to supernaturally distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of yourself makes a damage roll or succeeds on an ability check or attack roll, you can take a Reaction to expend one use of your Bardic Inspiration; roll your Bardic Inspiration die, and subtract the number rolled from the creature’s roll, reducing the damage or potentially turning the success into a failure.`,
        activation: 'reaction'
      },
      {
        id: 'college-of-lore-magical-discoveries',
        name: 'Magical Discoveries',
        level: 6,
        summary: 'Learn two spells from the Cleric, Druid, or Wizard lists; they are always prepared for you.',
        description: `You learn two spells of your choice. These spells can come from the Cleric, Druid, or Wizard spell list or any combination thereof (see a class’s section for its spell list). A spell you choose must be a cantrip or a spell for which you have spell slots, as shown in the Bard Features table.

You always have the chosen spells prepared, and whenever you gain a Bard level, you can replace one of the spells with another spell that meets these requirements.`,
        activation: 'passive',
        choices: [
          { id: 'college-of-lore-magical-discoveries', label: 'Magical Discoveries (Cleric, Druid, or Wizard spells)', count: 2, type: 'spell', filter: 'cleric,druid,wizard' }
        ]
      },
      {
        id: 'college-of-lore-peerless-skill',
        name: 'Peerless Skill',
        level: 14,
        summary: 'When you fail an ability check or attack roll, expend Bardic Inspiration to add the die; it isn’t expended if you still fail.',
        description: `When you make an ability check or attack roll and fail, you can expend one use of Bardic Inspiration; roll the Bardic Inspiration die, and add the number rolled to the d20, potentially turning a failure into a success. On a failure, the Bardic Inspiration isn’t expended.`,
        activation: 'special'
      }
    ]
  },
  {
    id: 'college-of-dance',
    name: 'College of Dance',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'bard',
    summary: 'A Bard who fights and inspires through graceful movement, using unarmored footwork and Bardic Inspiration-fueled strikes.',
    description: `Dancers of this college channel the rhythm of the cosmos into motion. Without armor they are hard to hit, their Unarmed Strikes are powered by their Bardic Inspiration die, and they help allies move and react faster in combat. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      {
        id: 'college-of-dance-dazzling-footwork',
        name: 'Dazzling Footwork',
        level: 3,
        summary:
          'While unarmored and without a Shield, you get an AC formula using Dexterity and Charisma, Advantage on dance Performance checks, and Unarmed Strikes that use your Bardic Inspiration die.',
        description:
          'While unarmored and without a Shield, you get an AC formula using Dexterity and Charisma, Advantage on dance Performance checks, and Unarmed Strikes that use your Bardic Inspiration die.',
        effects: [{ target: 'ac.unarmored', op: 'set', value: '10+dex+cha', condition: 'noArmorNoShield', note: 'Dazzling Footwork' }]
      },
      {
        id: 'college-of-dance-inspiring-movement',
        name: 'Inspiring Movement',
        level: 6,
        summary: 'When an enemy ends its turn near you, you can spend Bardic Inspiration to reposition yourself and an ally without provoking Opportunity Attacks.',
        description:
          'When an enemy ends its turn near you, you can spend Bardic Inspiration to reposition yourself and an ally without provoking Opportunity Attacks.',
        activation: 'reaction'
      },
      {
        id: 'college-of-dance-tandem-footwork',
        name: 'Tandem Footwork',
        level: 6,
        summary: 'When you roll Initiative, you can spend Bardic Inspiration to boost the Initiative of yourself and nearby allies.',
        description: 'When you roll Initiative, you can spend Bardic Inspiration to boost the Initiative of yourself and nearby allies.'
      },
      {
        id: 'college-of-dance-leading-evasion',
        name: 'Leading Evasion',
        level: 14,
        summary: 'You gain an Evasion-like benefit on Dexterity saves against area effects and can share it with creatures right next to you.',
        description: 'You gain an Evasion-like benefit on Dexterity saves against area effects and can share it with creatures right next to you.'
      }
    ]
  },
  {
    id: 'college-of-glamour',
    name: 'College of Glamour',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'bard',
    summary: 'A Bard touched by the Feywild who beguiles foes and empowers allies with dazzling fey magic.',
    description: `Glamour Bards learned their craft from the fey. Their enchantment and illusion spells can leave enemies Charmed or Frightened, their performances grant allies Temporary Hit Points and free movement, and they can command others with regal presence. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['charm-person', 'mirror-image'] },
      { level: 6, spells: ['command'] }
    ],
    features: [
      {
        id: 'college-of-glamour-beguiling-magic',
        name: 'Beguiling Magic',
        level: 3,
        summary: 'You always have Charm Person and Mirror Image prepared, and after casting an enchantment or illusion spell you can try to Charm or Frighten a nearby creature.',
        description:
          'You always have Charm Person and Mirror Image prepared, and after casting an enchantment or illusion spell you can try to Charm or Frighten a nearby creature.'
      },
      {
        id: 'college-of-glamour-mantle-of-inspiration',
        name: 'Mantle of Inspiration',
        level: 3,
        summary: 'As a Bonus Action, spend Bardic Inspiration to give several allies Temporary Hit Points and let them move without provoking Opportunity Attacks.',
        description:
          'As a Bonus Action, spend Bardic Inspiration to give several allies Temporary Hit Points and let them move without provoking Opportunity Attacks.',
        activation: 'bonus'
      },
      {
        id: 'college-of-glamour-mantle-of-majesty',
        name: 'Mantle of Majesty',
        level: 6,
        summary: 'You always have Command prepared and can take on a majestic aura that lets you cast it repeatedly as a Bonus Action for a short time.',
        description: 'You always have Command prepared and can take on a majestic aura that lets you cast it repeatedly as a Bonus Action for a short time.',
        activation: 'bonus'
      },
      {
        id: 'college-of-glamour-unbreakable-majesty',
        name: 'Unbreakable Majesty',
        level: 14,
        summary: 'You can assume a majestic presence that makes creatures struggle to attack you, possibly wasting their attacks.',
        description: 'You can assume a majestic presence that makes creatures struggle to attack you, possibly wasting their attacks.',
        activation: 'bonus'
      }
    ]
  },
  {
    id: 'college-of-valor',
    name: 'College of Valor',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'bard',
    summary: 'A warrior-skald who mixes weapons and spells on the front line and inspires allies to fight harder.',
    description: `Valor Bards keep alive the deeds of heroes by joining them in battle. They gain martial weapon and armor training, their Bardic Inspiration can boost damage or AC, and they gain Extra Attack and the ability to weave weapon attacks between their spells. Full rules text is in the 2024 Player’s Handbook.`,
    features: [
      {
        id: 'college-of-valor-combat-inspiration',
        name: 'Combat Inspiration',
        level: 3,
        summary: 'A creature holding your Bardic Inspiration die can also use it to add to a damage roll or to its AC against an attack.',
        description: 'A creature holding your Bardic Inspiration die can also use it to add to a damage roll or to its AC against an attack.'
      },
      {
        id: 'college-of-valor-martial-training',
        name: 'Martial Training',
        level: 3,
        summary: 'You gain proficiency with Martial weapons and training with Medium armor and Shields, and can use a weapon as a Spellcasting Focus.',
        description:
          'You gain proficiency with Martial weapons and training with Medium armor and Shields, and can use a weapon as a Spellcasting Focus.',
        effects: [
          { target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Martial Training' },
          { target: 'proficiency.armor', op: 'grant', value: 'medium', note: 'Martial Training' },
          { target: 'proficiency.armor', op: 'grant', value: 'shield', note: 'Martial Training' }
        ]
      },
      {
        id: 'college-of-valor-extra-attack',
        name: 'Extra Attack',
        level: 6,
        summary: 'You can attack twice when you take the Attack action, and you can cast a cantrip in place of one of those attacks.',
        description: 'You can attack twice when you take the Attack action, and you can cast a cantrip in place of one of those attacks.'
      },
      {
        id: 'college-of-valor-battle-magic',
        name: 'Battle Magic',
        level: 14,
        summary: 'After you cast a spell that takes an action, you can make a weapon attack as a Bonus Action.',
        description: 'After you cast a spell that takes an action, you can make a weapon attack as a Bonus Action.',
        activation: 'bonus'
      }
    ]
  }
]

export const bardOptions: ClassOptionGroup[] = []
