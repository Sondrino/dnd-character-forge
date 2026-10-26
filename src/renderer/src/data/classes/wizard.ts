import type { ClassDef, SubclassDef, ClassOptionGroup, Feature } from '../../types'

const PROF = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]

const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1]
]
const SLOT_KEYS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']

const CANTRIPS = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
const PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25]

const FEATURES_BY_LEVEL: string[][] = [
  ['Spellcasting', 'Ritual Adept', 'Arcane Recovery'],
  ['Scholar'],
  ['Wizard Subclass'],
  ['Ability Score Improvement'],
  ['Memorize Spell'],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Spell Mastery'],
  ['Epic Boon'],
  ['Signature Spells']
]

const ASI_TEXT = `You gain the Ability Score Improvement feat (see "Feats") or another feat of your choice for which you qualify. You gain this feature again at Wizard levels 8, 12, and 16.`

const asi = (level: number): Feature => ({
  id: `wizard-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive',
  choices: [
    { id: `wizard-asi-${level}`, label: 'Ability Score Improvement or feat', count: 1, type: 'feat', filter: 'general' }
  ]
})

export const wizardClass: ClassDef = {
  id: 'wizard',
  name: 'Wizard',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A scholarly spellcaster who records spells in a spellbook and prepares the perfect magic for every situation.',
  description: `**Core Wizard Traits**

| Trait | |
|---|---|
| Primary Ability | Intelligence |
| Hit Point Die | D6 per Wizard level |
| Saving Throw Proficiencies | Intelligence and Wisdom |
| Skill Proficiencies | *Choose 2:* Arcana, History, Insight, Investigation, Medicine, Nature, or Religion |
| Weapon Proficiencies | Simple weapons |
| Armor Training | None |
| Starting Equipment | *Choose A or B:* (A) 2 Daggers, Arcane Focus (Quarterstaff), Robe, Spellbook, Scholar's Pack, and 5 GP; or (B) 55 GP |

**Becoming a Wizard ...**

*As a Level 1 Character*
- Gain all the traits in the Core Wizard Traits table.
- Gain the Wizard's level 1 features, which are listed in the Wizard Features table.

*As a Multiclass Character*
- Gain the Hit Point Die from the Core Wizard Traits table.
- Gain the Wizard's level 1 features, which are listed in the Wizard Features table. See the multiclassing rules in "Character Creation" to determine your available spell slots.`,
  tags: ['spellcaster', 'full-caster', 'arcane'],
  hitDie: 6,
  primaryAbility: ['int'],
  savingThrows: ['int', 'wis'],
  skillChoices: {
    count: 2,
    options: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion']
  },
  weaponProficiencies: ['simple'],
  armorTraining: [],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'dagger', qty: 2 },
        { id: 'quarterstaff', name: 'Quarterstaff (Arcane Focus)' },
        { id: 'robe' },
        { id: 'spellbook' },
        { id: 'scholars-pack' }
      ],
      gp: 5
    },
    { label: 'B', items: [], gp: 55 }
  ],
  subclassLevel: 3,
  table: FEATURES_BY_LEVEL.map((features, i) => {
    const columns: Record<string, string | number> = {
      Cantrips: CANTRIPS[i],
      'Prepared Spells': PREPARED[i]
    }
    FULL_CASTER_SLOTS[i].forEach((n, s) => {
      columns[SLOT_KEYS[s]] = n
    })
    return { level: i + 1, profBonus: PROF[i], features, columns }
  }),
  features: [
    {
      id: 'wizard-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary: 'Cast Wizard spells using Intelligence; keep known spells in a spellbook and prepare a list from it after each Long Rest.',
      description: `As a student of arcane magic, you have learned to cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Wizard spells, which appear in the Wizard spell list later in the class's description.

**Cantrips.** You know three Wizard cantrips of your choice. Light, Mage Hand, and Ray of Frost are recommended. Whenever you finish a Long Rest, you can replace one of your cantrips from this feature with another Wizard cantrip of your choice.

When you reach Wizard levels 4 and 10, you learn another Wizard cantrip of your choice, as shown in the Cantrips column of the Wizard Features table.

**Spellbook.** Your wizardly apprenticeship culminated in the creation of a unique book: your spellbook. It is a Tiny object that weighs 3 pounds, contains 100 pages, and can be read only by you or someone casting Identify. You determine the book's appearance and materials, such as a gilt-edged tome or a collection of vellum bound with twine.

The book contains the level 1+ spells you know. It starts with six level 1 Wizard spells of your choice. Detect Magic, Feather Fall, Mage Armor, Magic Missile, Sleep, and Thunderwave are recommended.

Whenever you gain a Wizard level after 1, add two Wizard spells of your choice to your spellbook. Each of these spells must be of a level for which you have spell slots, as shown in the Wizard Features table. The spells are the culmination of arcane research you do regularly.

**Spell Slots.** The Wizard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To do so, choose four spells from your spellbook. The chosen spells must be of a level for which you have spell slots.

The number of spells on your list increases as you gain Wizard levels, as shown in the Prepared Spells column of the Wizard Features table. Whenever that number increases, choose additional Wizard spells until the number of spells on your list matches the number in the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Wizard, your list of prepared spells can include six spells of levels 1 and 2 in any combination, chosen from your spellbook.

If another Wizard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Wizard spells for you.

**Changing Your Prepared Spells.** Whenever you finish a Long Rest, you can change your list of prepared spells, replacing any of the spells there with spells from your spellbook.

**Spellcasting Ability.** Intelligence is your spellcasting ability for your Wizard spells.

**Spellcasting Focus.** You can use an Arcane Focus or your spellbook as a Spellcasting Focus for your Wizard spells.

---

**Expanding and Replacing a Spellbook**

The spells you add to your spellbook as you gain levels reflect your ongoing magical research, but you might find other spells during your adventures that you can add to the book. You could discover a Wizard spell on a Spell Scroll, for example, and then copy it into your spellbook.

**Copying a Spell into the Book.** When you find a level 1+ Wizard spell, you can copy it into your spellbook if it's of a level you can prepare and if you have time to copy it. For each level of the spell, the transcription takes 2 hours and costs 50 GP. Afterward you can prepare the spell like the other spells in your spellbook.

**Copying the Book.** You can copy a spell from your spellbook into another book. This is like copying a new spell into your spellbook but faster, since you already know how to cast the spell. You need spend only 1 hour and 10 GP for each level of the copied spell.

If you lose your spellbook, you can use the same procedure to transcribe the Wizard spells that you have prepared into a new spellbook. Filling out the remainder of the new book requires you to find new spells to do so. For this reason, many wizards keep a backup spellbook.`,
      activation: 'passive',
      choices: [
        { id: 'wizard-spellbook-initial', label: 'Spellbook: six level 1 Wizard spells', count: 6, type: 'spell', filter: 'wizard:1' }
      ]
    },
    {
      id: 'wizard-ritual-adept',
      name: 'Ritual Adept',
      level: 1,
      summary: 'Cast any Ritual spell in your spellbook as a Ritual without having it prepared.',
      description: `You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook. You needn't have the spell prepared, but you must read from the book to cast a spell in this way.`,
      activation: 'passive'
    },
    {
      id: 'wizard-arcane-recovery',
      name: 'Arcane Recovery',
      level: 1,
      summary: 'After a Short Rest, recover spell slots with a combined level up to half your Wizard level (round up), none level 6+. Once per Long Rest.',
      description: `You can regain some of your magical energy by studying your spellbook. When you finish a Short Rest, you can choose expended spell slots to recover. The spell slots can have a combined level equal to no more than half your Wizard level (round up), and none of the slots can be level 6 or higher. For example, if you're a level 4 Wizard, you can recover up to two levels' worth of spell slots, regaining either one level 2 spell slot or two level 1 spell slots.

Once you use this feature, you can't do so again until you finish a Long Rest.`,
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    },
    {
      id: 'wizard-scholar',
      name: 'Scholar',
      level: 2,
      summary: 'Gain Expertise in one of Arcana, History, Investigation, Medicine, Nature, or Religion that you are proficient in.',
      description: `While studying magic, you also specialized in another field of study. Choose one of the following skills in which you have proficiency: Arcana, History, Investigation, Medicine, Nature, or Religion. You have Expertise in the chosen skill.`,
      activation: 'passive',
      choices: [
        { id: 'wizard-scholar', label: 'Scholar Expertise', count: 1, type: 'expertise', options: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'religion'] }
      ]
    },
    {
      id: 'wizard-subclass',
      name: 'Wizard Subclass',
      level: 3,
      summary: 'Choose a Wizard subclass, which grants features at Wizard levels 3, 6, 10, and 14.',
      description: `You gain a Wizard subclass of your choice. The Evoker subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Wizard levels. For the rest of your career, you gain each of your subclass's features that are of your Wizard level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'wizard-memorize-spell',
      name: 'Memorize Spell',
      level: 5,
      summary: 'After a Short Rest, swap one prepared level 1+ spell for another spell in your spellbook.',
      description: `Whenever you finish a Short Rest, you can study your spellbook and replace one of the level 1+ Wizard spells you have prepared for your Spellcasting feature with another level 1+ spell from the book.`,
      activation: 'special'
    },
    asi(8),
    asi(12),
    asi(16),
    {
      id: 'wizard-spell-mastery',
      name: 'Spell Mastery',
      level: 18,
      summary: 'Choose a level 1 and a level 2 spell from your spellbook that you can cast at their lowest level without a slot.',
      description: `You have achieved such mastery over certain spells that you can cast them at will. Choose a level 1 and a level 2 spell in your spellbook that have a casting time of an action. You always have those spells prepared, and you can cast them at their lowest level without expending a spell slot. To cast either spell at a higher level, you must expend a spell slot.

Whenever you finish a Long Rest, you can study your spellbook and replace one of those spells with an eligible spell of the same level from the book.`,
      activation: 'passive',
      choices: [
        { id: 'wizard-spell-mastery-1', label: 'Spell Mastery (level 1 spell)', count: 1, type: 'spell', filter: 'wizard:1' },
        { id: 'wizard-spell-mastery-2', label: 'Spell Mastery (level 2 spell)', count: 1, type: 'spell', filter: 'wizard:2' }
      ]
    },
    {
      id: 'wizard-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for.',
      description: `You gain an Epic Boon feat (see "Feats") or another feat of your choice for which you qualify. Boon of Spell Recall is recommended.`,
      activation: 'passive',
      choices: [{ id: 'wizard-epic-boon', label: 'Epic Boon feat', count: 1, type: 'feat', filter: 'epicBoon' }]
    },
    {
      id: 'wizard-signature-spells',
      name: 'Signature Spells',
      level: 20,
      summary: 'Two level 3 spells are always prepared, and you can cast each once at level 3 without a slot per Short or Long Rest.',
      description: `Choose two level 3 spells in your spellbook as your signature spells. You always have these spells prepared, and you can cast each of them once at level 3 without expending a spell slot. When you do so, you can't cast them in this way again until you finish a Short or Long Rest. To cast either spell at a higher level, you must expend a spell slot.`,
      activation: 'special',
      uses: { count: 2, recharge: 'shortOrLong' },
      choices: [
        { id: 'wizard-signature-spells', label: 'Signature Spells (two level 3 spells)', count: 2, type: 'spell', filter: 'wizard:3' }
      ]
    }
  ],
  spellcasting: {
    ability: 'int',
    progression: 'full',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'wizard',
    ritualCasting: true,
    focus: 'Arcane Focus or spellbook'
  },
  multiclass: {
    prerequisite: 'Intelligence 13+',
    proficiencies: 'Hit Point Die only (no armor, weapon, skill, or tool proficiencies).'
  },
  quickBuild: `Make Intelligence your highest score, then Constitution to survive and hold Concentration, with Dexterity close behind for AC and Initiative. The Sage background is the classic choice, giving Arcana, History, and Magic Initiate. Pick Fire Bolt or Ray of Frost, Mage Hand, and Light as cantrips, and fill your spellbook with Detect Magic, Feather Fall, Mage Armor, Magic Missile, Shield, and Sleep or Thunderwave, preparing the four you expect to need most.`,
  tips: [
    'Your spellbook can hold far more spells than you can prepare; copy every Wizard spell scroll you find (2 hours and 50 GP per spell level).',
    'You can change all your prepared spells after every Long Rest, so prepare for the adventure ahead — exploration days and dungeon days call for different spells.',
    'Ritual Adept lets you cast ritual spells (Detect Magic, Find Familiar, Identify, Alarm) straight from your book without preparing them; save prepared slots for combat.',
    'Use Arcane Recovery after your first Short Rest each day to regain spell slots.',
    'Shield (as a Reaction for +5 AC) and Mage Armor make up for your lack of armor; keep Shield prepared at all times.',
    'Find Familiar gives you a scout and lets your familiar take the Help action, granting allies Advantage.',
    'Stay behind the front line: your d6 Hit Die makes you fragile, so use range and terrain to your advantage.'
  ],
  recommended: {
    species: ['gnome', 'elf', 'human', 'tiefling', 'dwarf'],
    backgrounds: ['sage', 'scribe', 'hermit', 'noble'],
    feats: ['alert', 'war-caster', 'resilient', 'magic-initiate', 'lucky', 'elemental-adept'],
    cantrips: ['fire-bolt', 'ray-of-frost', 'mage-hand', 'light', 'prestidigitation', 'minor-illusion', 'shocking-grasp'],
    spells: ['shield', 'magic-missile', 'mage-armor', 'find-familiar', 'detect-magic', 'sleep', 'feather-fall', 'thunderwave', 'misty-step', 'web', 'fireball', 'counterspell'],
    weapons: ['quarterstaff', 'dagger', 'light-crossbow']
  }
}

export const wizardSubclasses: SubclassDef[] = [
  {
    id: 'evoker',
    name: 'Evoker',
    kind: 'subclass',
    classId: 'wizard',
    source: 'SRD 5.2',
    summary: 'Create Explosive Elemental Effects: a master of evocation who sculpts blasts around allies and maximizes damage.',
    description: `*Create Explosive Elemental Effects*

Your studies focus on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Some Evokers find employment in military forces, serving as artillery to blast armies from afar. Others use their power to protect others, while some seek their own gain.`,
    features: [
      {
        id: 'evoker-evocation-savant',
        name: 'Evocation Savant',
        level: 3,
        summary: 'Add two Evocation spells (level 2 or lower) to your spellbook for free, plus one each time you gain a new spell slot level.',
        description: `Choose two Wizard spells from the Evocation school, each of which must be no higher than level 2, and add them to your spellbook for free.

In addition, whenever you gain access to a new level of spell slots in this class, you can add one Wizard spell from the Evocation school to your spellbook for free. The chosen spell must be of a level for which you have spell slots.`,
        activation: 'passive',
        choices: [
          { id: 'evoker-evocation-savant', label: 'Evocation spells for your spellbook (level 2 or lower)', count: 2, type: 'spell', filter: 'wizard:evocation:2' }
        ]
      },
      {
        id: 'evoker-potent-cantrip',
        name: 'Potent Cantrip',
        level: 3,
        summary: 'Targets that dodge or save against your damaging cantrips still take half damage.',
        description: `Your damaging cantrips affect even creatures that avoid the brunt of the effect. When you cast a cantrip at a creature and you miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip.`,
        activation: 'passive'
      },
      {
        id: 'evoker-sculpt-spells',
        name: 'Sculpt Spells',
        level: 6,
        summary: 'Protect 1 + spell level chosen creatures from your Evocation spells: they auto-succeed and take no damage on a half-damage save.',
        description: `You can create pockets of relative safety within the effects of your evocations. When you cast an Evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 plus the spell's level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.`,
        activation: 'passive'
      },
      {
        id: 'evoker-empowered-evocation',
        name: 'Empowered Evocation',
        level: 10,
        summary: 'Add your Intelligence modifier to one damage roll of your Wizard Evocation spells.',
        description: `Whenever you cast a Wizard spell from the Evocation school, you can add your Intelligence modifier to one damage roll of that spell.`,
        activation: 'passive'
      },
      {
        id: 'evoker-overchannel',
        name: 'Overchannel',
        level: 14,
        summary: 'Deal maximum damage with a level 1–5 damaging Wizard spell; repeated use before a Long Rest deals escalating Necrotic damage to you.',
        description: `You can increase the power of your spells. When you cast a Wizard spell with a spell slot of levels 1–5 that deals damage, you can deal maximum damage with that spell on the turn you cast it.

The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a Long Rest, you take 2d12 Necrotic damage for each level of the spell slot immediately after you cast it. This damage ignores Resistance and Immunity.

Each time you use this feature again before finishing a Long Rest, the Necrotic damage per spell level increases by 1d12.`,
        activation: 'special',
        uses: { count: 1, recharge: 'long' }
      }
    ]
  },
  {
    id: 'abjurer',
    name: 'Abjurer',
    kind: 'subclass',
    classId: 'wizard',
    source: 'PHB 2024',
    summary: 'A wizard specialising in protective magic who wraps themselves and allies in an arcane ward.',
    description: `Abjurers study magic that blocks, banishes, and protects. Their signature feature is a magical ward that absorbs damage and is recharged by casting Abjuration spells. They can later extend the ward to protect allies, become expert at dispelling and countering enemy magic, and gain strong resistance against spells. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['defense'],
    alwaysPrepared: [{ level: 10, spells: ['counterspell', 'dispel-magic'] }],
    features: [
      { id: 'abjurer-abjuration-savant', name: 'Abjuration Savant', level: 3, summary: 'You add Abjuration spells to your spellbook for free as you gain levels.', description: 'You add Abjuration spells to your spellbook for free as you gain levels.' },
      { id: 'abjurer-arcane-ward', name: 'Arcane Ward', level: 3, summary: 'Casting Abjuration spells creates and recharges a ward that absorbs damage you would take.', description: 'Casting Abjuration spells creates and recharges a ward that absorbs damage you would take.' },
      { id: 'abjurer-projected-ward', name: 'Projected Ward', level: 6, summary: 'As a Reaction, your Arcane Ward can absorb damage dealt to a nearby creature.', description: 'As a Reaction, your Arcane Ward can absorb damage dealt to a nearby creature.', activation: 'reaction' },
      { id: 'abjurer-spell-breaker', name: 'Spell Breaker', level: 10, summary: 'You always have Counterspell and Dispel Magic prepared and are better at ending enemy magic.', description: 'You always have Counterspell and Dispel Magic prepared and are better at ending enemy magic.' },
      { id: 'abjurer-spell-resistance', name: 'Spell Resistance', level: 14, summary: 'You have Advantage on saving throws against spells and Resistance to the damage of spells.', description: 'You have Advantage on saving throws against spells and Resistance to the damage of spells.' }
    ]
  },
  {
    id: 'diviner',
    name: 'Diviner',
    kind: 'subclass',
    classId: 'wizard',
    source: 'PHB 2024',
    summary: 'A wizard who glimpses the future, replacing rolls with foreseen results.',
    description: `Diviners study magic that reveals secrets and the future. Their Portent feature lets them roll d20s after a Long Rest and later substitute those results for any roll they can see. As they grow, casting Divination spells refunds spell slots, they gain supernatural senses through the Third Eye, and they foresee even more of the future. Full rules text is in the 2024 Player's Handbook.`,
    features: [
      { id: 'diviner-divination-savant', name: 'Divination Savant', level: 3, summary: 'You add Divination spells to your spellbook for free as you gain levels.', description: 'You add Divination spells to your spellbook for free as you gain levels.' },
      { id: 'diviner-portent', name: 'Portent', level: 3, summary: 'After a Long Rest, roll two d20s and later replace any D20 Test you can see with one of those results.', description: 'After a Long Rest, roll two d20s and later replace any D20 Test you can see with one of those results.', activation: 'special', uses: { count: 2, recharge: 'long' } },
      { id: 'diviner-expert-divination', name: 'Expert Divination', level: 6, summary: 'Casting a Divination spell with a level 2+ slot lets you regain a lower-level spell slot.', description: 'Casting a Divination spell with a level 2+ slot lets you regain a lower-level spell slot.' },
      { id: 'diviner-the-third-eye', name: 'The Third Eye', level: 10, summary: 'As a Bonus Action, gain a special sense such as Darkvision, the ability to read any language, or seeing the invisible.', description: 'As a Bonus Action, gain a special sense such as Darkvision, the ability to read any language, or seeing the invisible.', activation: 'bonus', uses: { count: 1, recharge: 'shortOrLong' } },
      { id: 'diviner-greater-portent', name: 'Greater Portent', level: 14, summary: 'You roll three d20s for Portent instead of two.', description: 'You roll three d20s for Portent instead of two.' }
    ]
  },
  {
    id: 'illusionist',
    name: 'Illusionist',
    kind: 'subclass',
    classId: 'wizard',
    source: 'PHB 2024',
    summary: 'A wizard who weaves convincing illusions and eventually makes them partly real.',
    description: `Illusionists master magic that deceives the senses. Their illusions are easier to cast, reach farther, and they gain Minor Illusion with improved use. As they advance, they can summon illusory creatures, use an illusory duplicate to make an attack miss them, and finally make parts of their illusions real for a short time. Full rules text is in the 2024 Player's Handbook.`,
    alwaysPrepared: [{ level: 6, spells: ['summon-beast', 'summon-fey'] }],
    features: [
      { id: 'illusionist-illusion-savant', name: 'Illusion Savant', level: 3, summary: 'You add Illusion spells to your spellbook for free as you gain levels.', description: 'You add Illusion spells to your spellbook for free as you gain levels.' },
      { id: 'illusionist-improved-illusions', name: 'Improved Illusions', level: 3, summary: 'Your illusion spells need fewer components and reach farther, and you gain a stronger Minor Illusion.', description: 'Your illusion spells need fewer components and reach farther, and you gain a stronger Minor Illusion.' },
      { id: 'illusionist-phantasmal-creatures', name: 'Phantasmal Creatures', level: 6, summary: 'You always have Summon Beast and Summon Fey prepared and can cast them as illusions, sometimes without a slot.', description: 'You always have Summon Beast and Summon Fey prepared and can cast them as illusions, sometimes without a slot.' },
      { id: 'illusionist-illusory-self', name: 'Illusory Self', level: 10, summary: 'As a Reaction, an illusory duplicate makes an attack against you miss.', description: 'As a Reaction, an illusory duplicate makes an attack against you miss.', activation: 'reaction', uses: { count: 1, recharge: 'shortOrLong' } },
      { id: 'illusionist-illusory-reality', name: 'Illusory Reality', level: 14, summary: 'You can make an inanimate object from one of your illusion spells real for a short time.', description: 'You can make an inanimate object from one of your illusion spells real for a short time.', activation: 'bonus' }
    ]
  }
]

export const wizardOptions: ClassOptionGroup[] = []
