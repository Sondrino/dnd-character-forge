import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow, Feature } from '../../types'

// Cleric — SRD 5.2.1 (CC-BY-4.0) + PHB 2024-subclasses (kun sammendrag med egne ord)

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
  ['Spellcasting', 'Divine Order'],
  ['Channel Divinity'],
  ['Cleric Subclass'],
  ['Ability Score Improvement'],
  ['Sear Undead'],
  ['Subclass feature'],
  ['Blessed Strikes'],
  ['Ability Score Improvement'],
  [],
  ['Divine Intervention'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Improved Blessed Strikes'],
  [],
  ['Ability Score Improvement'],
  ['Subclass feature'],
  [],
  ['Epic Boon'],
  ['Greater Divine Intervention']
]

const CHANNEL_DIVINITY = [0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4]
const CANTRIPS = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
const PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]

const table: ClassLevelRow[] = FEATURES_BY_LEVEL.map((features, i) => ({
  level: i + 1,
  profBonus: profBonus(i + 1),
  features,
  columns: {
    'Channel Divinity': CHANNEL_DIVINITY[i] || '—',
    Cantrips: CANTRIPS[i],
    'Prepared Spells': PREPARED[i],
    ...slotColumns(i + 1)
  }
}))

const asi = (level: number): Feature => ({
  id: `cleric-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat of your choice for which you qualify.',
  description: `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Cleric levels 8, 12, and 16.`,
  activation: 'passive'
})

export const clericClass: ClassDef = {
  id: 'cleric',
  name: 'Cleric',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A divine spellcaster who channels the power of the gods to heal, protect, and smite, wearing armor and wielding holy magic.',
  description: `## Core Cleric Traits

| Trait | Value |
|---|---|
| **Primary Ability** | Wisdom |
| **Hit Point Die** | D8 per Cleric level |
| **Saving Throw Proficiencies** | Wisdom and Charisma |
| **Skill Proficiencies** | Choose 2: History, Insight, Medicine, Persuasion, or Religion |
| **Weapon Proficiencies** | Simple weapons |
| **Armor Training** | Light and Medium armor and Shields |
| **Starting Equipment** | Choose A or B: (A) Chain Shirt, Shield, Mace, Holy Symbol, Priest’s Pack, and 7 GP; or (B) 110 GP |

### Becoming a Cleric …

**As a Level 1 Character**
- Gain all the traits in the Core Cleric Traits table.
- Gain the Cleric’s level 1 features, which are listed in the Cleric Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Cleric Traits table: Hit Point Die and training with Light and Medium armor and Shields.
- Gain the Cleric’s level 1 features, which are listed in the Cleric Features table. See the multiclassing rules in “Character Creation” to determine your available spell slots.

### Cleric Class Features
As a Cleric, you gain the following class features when you reach the specified Cleric levels. These features are listed in the Cleric Features table.`,
  tags: ['spellcaster', 'healer', 'support', 'divine'],
  hitDie: 8,
  primaryAbility: ['wis'],
  savingThrows: ['wis', 'cha'],
  skillChoices: { count: 2, options: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
  weaponProficiencies: ['simple'],
  armorTraining: ['light', 'medium', 'shield'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [{ id: 'chain-shirt' }, { id: 'shield' }, { id: 'mace' }, { id: 'holy-symbol' }, { id: 'priests-pack' }],
      gp: 7
    },
    { label: 'B', items: [], gp: 110 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'cleric-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary:
        'Cast Cleric spells using Wisdom, with a Holy Symbol as your focus. You can change your prepared spells after each Long Rest.',
      description: `You have learned to cast spells through prayer and meditation. See “Spells” for the rules on spellcasting. The information below details how you use those rules with Cleric spells, which appear on the Cleric spell list later in the class’s description.

**Cantrips.** You know three cantrips of your choice from the Cleric spell list. Guidance, Sacred Flame, and Thaumaturgy are recommended.

Whenever you gain a Cleric level, you can replace one of your cantrips with another cantrip of your choice from the Cleric spell list.

When you reach Cleric levels 4 and 10, you learn another cantrip of your choice from the Cleric spell list, as shown in the Cantrips column of the Cleric Features table.

**Spell Slots.** The Cleric Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Cleric spell list. Bless, Cure Wounds, Guiding Bolt, and Shield of Faith are recommended.

The number of spells on your list increases as you gain Cleric levels, as shown in the Prepared Spells column of the Cleric Features table. Whenever that number increases, choose additional spells from the Cleric spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you’re a level 3 Cleric, your list of prepared spells can include six spells of levels 1 and 2 in any combination.

If another Cleric feature gives you spells that you always have prepared, those spells don’t count against the number of spells you can prepare with this feature, but those spells otherwise count as Cleric spells for you.

**Changing Your Prepared Spells.** Whenever you finish a Long Rest, you can change your list of prepared spells, replacing any of the spells there with other Cleric spells for which you have spell slots.

**Spellcasting Ability.** Wisdom is your spellcasting ability for your Cleric spells.

**Spellcasting Focus.** You can use a Holy Symbol as a Spellcasting Focus for your Cleric spells.`,
      activation: 'passive'
    },
    {
      id: 'cleric-divine-order',
      name: 'Divine Order',
      level: 1,
      summary:
        'Choose a sacred role: Protector (Martial weapons and Heavy armor) or Thaumaturge (an extra cantrip and a Wisdom bonus to Arcana and Religion checks).',
      description: `You have dedicated yourself to one of the following sacred roles of your choice.

**Protector.** Trained for battle, you gain proficiency with Martial weapons and training with Heavy armor.

**Thaumaturge.** You know one extra cantrip from the Cleric spell list. In addition, your mystical connection to the divine gives you a bonus to your Intelligence (Arcana or Religion) checks. The bonus equals your Wisdom modifier (minimum of +1).`,
      activation: 'passive',
      choices: [
        {
          id: 'cleric-divine-order',
          label: 'Divine Order',
          count: 1,
          type: 'option',
          filter: 'Divine Order',
          options: ['cleric-divine-order-protector', 'cleric-divine-order-thaumaturge']
        }
      ]
    },
    {
      id: 'cleric-channel-divinity',
      name: 'Channel Divinity',
      level: 2,
      summary:
        'Channel divine energy to create Divine Spark (heal or harm 1d8 + Wisdom modifier) or Turn Undead. Regain one use on a Short Rest, all on a Long Rest.',
      description: `You can channel divine energy directly from the Outer Planes to fuel magical effects. You start with two such effects: Divine Spark and Turn Undead, each of which is described below. Each time you use this class’s Channel Divinity, choose which Channel Divinity effect from this class to create. You gain additional effect options at higher Cleric levels.

You can use this class’s Channel Divinity twice. You regain one of its expended uses when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest. You gain additional uses when you reach certain Cleric levels, as shown in the Channel Divinity column of the Cleric Features table.

If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class’s Spellcasting feature.

**Divine Spark.** As a Magic action, you point your Holy Symbol at another creature you can see within 30 feet of yourself and focus divine energy at it. Roll 1d8 and add your Wisdom modifier. You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw. On a failed save, the creature takes Necrotic or Radiant damage (your choice) equal to that total. On a successful save, the creature takes half as much damage (round down).

You roll an additional d8 when you reach Cleric levels 7 (2d8), 13 (3d8), and 18 (4d8).

**Turn Undead.** As a Magic action, you present your Holy Symbol and censure Undead creatures. Each Undead of your choice within 30 feet of you must make a Wisdom saving throw. If the creature fails its save, it has the Frightened and Incapacitated conditions for 1 minute. For that duration, it tries to move as far from you as it can on its turns. This effect ends early on the creature if it takes any damage, if you have the Incapacitated condition, or if you die.`,
      uses: { count: 'Channel Divinity', recharge: 'shortOne' },
      activation: 'action'
    },
    {
      id: 'cleric-subclass',
      name: 'Cleric Subclass',
      level: 3,
      summary: 'Choose a Cleric subclass (Divine Domain), which grants features at Cleric levels 3, 6, and 17.',
      description: `You gain a Cleric subclass of your choice. The Life Domain subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Cleric levels. For the rest of your career, you gain each of your subclass’s features that are of your Cleric level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'cleric-sear-undead',
      name: 'Sear Undead',
      level: 5,
      summary: 'When you use Turn Undead, Undead that fail the save also take Radiant damage: d8s equal to your Wisdom modifier (minimum 1d8).',
      description: `Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier (minimum of 1d8) and add the rolls together. Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll’s total. This damage doesn’t end the turn effect.`,
      activation: 'passive'
    },
    {
      id: 'cleric-blessed-strikes',
      name: 'Blessed Strikes',
      level: 7,
      summary:
        'Choose Divine Strike (extra 1d8 Necrotic or Radiant damage once per turn with a weapon) or Potent Spellcasting (add Wisdom modifier to Cleric cantrip damage).',
      description: `Divine power infuses you in battle. You gain one of the following options of your choice (if you get either option from a Cleric subclass in an older book, use only the option you choose for this feature).

**Divine Strike.** Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage (your choice).

**Potent Spellcasting.** Add your Wisdom modifier to the damage you deal with any Cleric cantrip.`,
      activation: 'passive',
      choices: [
        {
          id: 'cleric-blessed-strikes',
          label: 'Blessed Strikes',
          count: 1,
          type: 'option',
          filter: 'Blessed Strikes',
          options: ['cleric-blessed-strikes-divine-strike', 'cleric-blessed-strikes-potent-spellcasting']
        }
      ]
    },
    asi(8),
    {
      id: 'cleric-divine-intervention',
      name: 'Divine Intervention',
      level: 10,
      summary:
        'Once per Long Rest, as a Magic action, cast any Cleric spell of level 5 or lower (no Reaction spells) without a spell slot or Material components.',
      description: `You can call on your deity or pantheon to intervene on your behalf. As a Magic action, choose any Cleric spell of level 5 or lower that doesn’t require a Reaction to cast. As part of the same action, you cast that spell without expending a spell slot or needing Material components. You can’t use this feature again until you finish a Long Rest.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'action'
    },
    asi(12),
    {
      id: 'cleric-improved-blessed-strikes',
      name: 'Improved Blessed Strikes',
      level: 14,
      summary:
        'Divine Strike deals 2d8, or Potent Spellcasting lets your damaging cantrips grant Temporary Hit Points equal to twice your Wisdom modifier.',
      description: `The option you chose for Blessed Strikes grows more powerful.

**Divine Strike.** The extra damage of your Divine Strike increases to 2d8.

**Potent Spellcasting.** When you cast a Cleric cantrip and deal damage to a creature with it, you can give vitality to yourself or another creature within 60 feet of yourself, granting a number of Temporary Hit Points equal to twice your Wisdom modifier.`,
      activation: 'passive'
    },
    asi(16),
    {
      id: 'cleric-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for. Boon of Fate is recommended.',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Fate is recommended.`,
      activation: 'passive'
    },
    {
      id: 'cleric-greater-divine-intervention',
      name: 'Greater Divine Intervention',
      level: 20,
      summary: 'Divine Intervention can now cast Wish; if you do, you can’t use Divine Intervention again until you finish 2d4 Long Rests.',
      description: `You can call on even more powerful divine intervention. When you use your Divine Intervention feature, you can choose Wish when you select a spell. If you do so, you can’t use Divine Intervention again until you finish 2d4 Long Rests.`,
      activation: 'special'
    }
  ],
  spellcasting: {
    ability: 'wis',
    progression: 'full',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'cleric',
    ritualCasting: true,
    focus: 'Holy Symbol'
  },
  multiclass: {
    prerequisite: 'Wisdom 13',
    proficiencies: 'Hit Point Die and training with Light and Medium armor and Shields'
  },
  quickBuild: `Wisdom should be your highest score since it drives your spells and Channel Divinity. Put your next-best score in Strength if you plan to wade into melee (especially as a Protector), or in Constitution to stay sturdy and keep Concentration. Acolyte is the classic background. Start with Guidance, Sacred Flame, and Thaumaturgy as cantrips, and prepare Bless, Cure Wounds, Guiding Bolt, and Shield of Faith.`,
  tips: [
    'You can swap your whole list of prepared spells after every Long Rest—pick spells that fit the day’s challenges.',
    'Bless is one of the best low-level spells: it boosts attack rolls and saving throws for up to three allies.',
    'Healing Word works at range as a Bonus Action; save big heals for after combat and use small heals to revive fallen allies.',
    'Choose Protector for Heavy armor and Martial weapons if you want to fight in front, or Thaumaturge for an extra cantrip and better Arcana and Religion checks.',
    'Divine Spark from Channel Divinity can heal or damage, and Channel Divinity uses partly return on a Short Rest.',
    'Guidance adds 1d4 to an ally’s ability check—cast it before skill checks out of combat.',
    'Spirit Guardians (level 3 spell) is a powerful area-damage spell; protect your Concentration with good Constitution or the War Caster feat.'
  ],
  recommended: {
    species: ['dwarf', 'human', 'goliath', 'halfling', 'aasimar'],
    backgrounds: ['acolyte', 'sage', 'guard', 'hermit', 'noble'],
    feats: ['magic-initiate', 'alert', 'war-caster', 'tough', 'resilient', 'heavy-armor-master', 'boon-of-fate'],
    cantrips: ['guidance', 'sacred-flame', 'thaumaturgy', 'toll-the-dead', 'spare-the-dying', 'light'],
    spells: [
      'bless', 'cure-wounds', 'guiding-bolt', 'shield-of-faith', 'healing-word', 'sanctuary', 'aid', 'spiritual-weapon',
      'lesser-restoration', 'spirit-guardians', 'revivify', 'mass-healing-word'
    ],
    weapons: ['mace', 'light-crossbow', 'spear', 'warhammer']
  }
}

export const clericSubclasses: SubclassDef[] = [
  {
    id: 'life-domain',
    name: 'Life Domain',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'cleric',
    summary: 'Soothe the Hurts of the World: a Cleric devoted to positive energy and healing, whose healing spells are greatly empowered.',
    description: `*Soothe the Hurts of the World*

The Life Domain focuses on the positive energy that helps sustain all life in the multiverse. Clerics who tap into this domain are masters of healing, using that life force to cure many hurts.

Existence itself relies on the positive energy associated with this domain, so a Cleric of almost any religious tradition might choose it. This domain is particularly associated with agricultural deities, gods of healing or endurance, and gods of home and community. Religious orders of healing also seek the magic of this domain.`,
    alwaysPrepared: [
      { level: 3, spells: ['aid', 'bless', 'cure-wounds', 'lesser-restoration'] },
      { level: 5, spells: ['mass-healing-word', 'revivify'] },
      { level: 7, spells: ['aura-of-life', 'death-ward'] },
      { level: 9, spells: ['greater-restoration', 'mass-cure-wounds'] }
    ],
    features: [
      {
        id: 'life-domain-disciple-of-life',
        name: 'Disciple of Life',
        level: 3,
        summary: 'When a spell you cast with a spell slot restores Hit Points, the creature regains an extra 2 + the slot’s level.',
        description: `When a spell you cast with a spell slot restores Hit Points to a creature, that creature regains additional Hit Points on the turn you cast the spell. The additional Hit Points equal 2 plus the spell slot’s level.`,
        activation: 'passive'
      },
      {
        id: 'life-domain-spells',
        name: 'Life Domain Spells',
        level: 3,
        summary: 'You always have certain healing and protective spells prepared, gaining more at Cleric levels 5, 7, and 9.',
        description: `Your connection to this divine domain ensures you always have certain spells ready. When you reach a Cleric level specified in the Life Domain Spells table, you thereafter always have the listed spells prepared.

**Life Domain Spells**

| Cleric Level | Prepared Spells |
|---|---|
| 3 | Aid, Bless, Cure Wounds, Lesser Restoration |
| 5 | Mass Healing Word, Revivify |
| 7 | Aura of Life, Death Ward |
| 9 | Greater Restoration, Mass Cure Wounds |`,
        activation: 'passive'
      },
      {
        id: 'life-domain-preserve-life',
        name: 'Preserve Life',
        level: 3,
        summary:
          'As a Magic action, expend Channel Divinity to divide healing equal to five times your Cleric level among Bloodied creatures within 30 feet (up to half their HP maximum).',
        description: `As a Magic action, you present your Holy Symbol and expend a use of your Channel Divinity to evoke healing energy that can restore a number of Hit Points equal to five times your Cleric level. Choose Bloodied creatures within 30 feet of yourself (which can include you), and divide those Hit Points among them. This feature can restore a creature to no more than half its Hit Point maximum.`,
        activation: 'action'
      },
      {
        id: 'life-domain-blessed-healer',
        name: 'Blessed Healer',
        level: 6,
        summary: 'When you heal others with a spell slot, you also regain Hit Points equal to 2 + the slot’s level.',
        description: `The healing spells you cast on others heal you as well. Immediately after you cast a spell with a spell slot that restores Hit Points to one or more creatures other than yourself, you regain Hit Points equal to 2 plus the spell slot’s level.`,
        activation: 'passive'
      },
      {
        id: 'life-domain-supreme-healing',
        name: 'Supreme Healing',
        level: 17,
        summary: 'Healing dice from your spells and Channel Divinity always roll their maximum value.',
        description: `When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity, don’t roll those dice for the healing; instead use the highest number possible for each die. For example, instead of restoring 2d6 Hit Points to a creature with a spell, you restore 12.`,
        activation: 'passive'
      }
    ]
  },
  {
    id: 'knowledge-domain',
    name: 'Knowledge Domain',
    kind: 'subclass',
    source: 'Supplement',
    sourceBook: 'Forgotten Realms: Heroes of Faerûn',
    classId: 'cleric',
    summary: 'A Cleric devoted to learning and understanding, gifted with expert scholarship and mind-reading magic.',
    description: `Knowledge Clerics serve gods of lore, secrets, and wisdom. They become experts in scholarly skills, gain domain spells focused on divination and the mind, can communicate telepathically, and eventually glimpse the future to gain an edge on their rolls. Full rules text is in Forgotten Realms: Heroes of Faerûn (2025).`,
    features: [
      {
        id: 'knowledge-domain-blessings-of-knowledge',
        name: 'Blessings of Knowledge',
        level: 3,
        summary: 'You gain proficiency, with Expertise, in two knowledge skills chosen from Arcana, History, Nature, and Religion.',
        description:
          'You gain proficiency, with Expertise, in two knowledge skills chosen from Arcana, History, Nature, and Religion.'
      },
      {
        id: 'knowledge-domain-spells',
        name: 'Knowledge Domain Spells',
        level: 3,
        summary: 'You always have a set of divination- and mind-related domain spells prepared, gaining more at higher Cleric levels.',
        description: 'You always have a set of divination- and mind-related domain spells prepared, gaining more at higher Cleric levels.'
      },
      {
        id: 'knowledge-domain-mind-magic',
        name: 'Mind Magic',
        level: 3,
        summary: 'You can spend Channel Divinity to empower your mind-focused domain magic for a short time.',
        description: 'You can spend Channel Divinity to empower your mind-focused domain magic for a short time.'
      },
      {
        id: 'knowledge-domain-unfettered-mind',
        name: 'Unfettered Mind',
        level: 6,
        summary: 'You gain telepathy, letting you communicate mind-to-mind with nearby creatures.',
        description: 'You gain telepathy, letting you communicate mind-to-mind with nearby creatures.'
      },
      {
        id: 'knowledge-domain-divine-foreknowledge',
        name: 'Divine Foreknowledge',
        level: 17,
        summary: 'You can peer into the future to gain Advantage on your D20 Tests for a while; this recharges on a Long Rest or by spending a high-level spell slot.',
        description:
          'You can peer into the future to gain Advantage on your D20 Tests for a while; this recharges on a Long Rest or by spending a high-level spell slot.'
      }
    ]
  },
  {
    id: 'light-domain',
    name: 'Light Domain',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'cleric',
    summary: 'A Cleric of the sun and fire who burns away darkness and protects allies with dazzling flares.',
    description: `Light Clerics wield radiant and fiery power. They gain fire- and light-themed domain spells, use Channel Divinity to unleash a burst of dawn light that dispels darkness and damages foes, and can blind attackers with a flare of light to protect themselves and their allies. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['burning-hands', 'faerie-fire', 'scorching-ray', 'see-invisibility'] },
      { level: 5, spells: ['daylight', 'fireball'] },
      { level: 7, spells: ['arcane-eye', 'wall-of-fire'] },
      { level: 9, spells: ['flame-strike', 'scrying'] }
    ],
    features: [
      {
        id: 'light-domain-spells',
        name: 'Light Domain Spells',
        level: 3,
        summary: 'You always have fire- and light-themed spells prepared, such as Burning Hands, Faerie Fire, and later Fireball and Flame Strike.',
        description: 'You always have fire- and light-themed spells prepared, such as Burning Hands, Faerie Fire, and later Fireball and Flame Strike.'
      },
      {
        id: 'light-domain-radiance-of-the-dawn',
        name: 'Radiance of the Dawn',
        level: 3,
        summary: 'Spend Channel Divinity to dispel magical Darkness around you and deal Radiant damage to nearby enemies.',
        description: 'Spend Channel Divinity to dispel magical Darkness around you and deal Radiant damage to nearby enemies.',
        activation: 'action'
      },
      {
        id: 'light-domain-warding-flare',
        name: 'Warding Flare',
        level: 3,
        summary: 'As a Reaction, impose Disadvantage on an attack roll against you or a nearby creature; uses are based on your Wisdom modifier.',
        description: 'As a Reaction, impose Disadvantage on an attack roll against you or a nearby creature; uses are based on your Wisdom modifier.',
        activation: 'reaction',
        uses: { count: 'mod.wis', recharge: 'long' }
      },
      {
        id: 'light-domain-improved-warding-flare',
        name: 'Improved Warding Flare',
        level: 6,
        summary: 'Warding Flare recovers on a Short Rest too, and it also grants the protected creature Temporary Hit Points.',
        description: 'Warding Flare recovers on a Short Rest too, and it also grants the protected creature Temporary Hit Points.'
      },
      {
        id: 'light-domain-corona-of-light',
        name: 'Corona of Light',
        level: 17,
        summary: 'You can emit a blazing aura of sunlight that makes enemies worse at resisting your fire and radiant effects.',
        description: 'You can emit a blazing aura of sunlight that makes enemies worse at resisting your fire and radiant effects.',
        activation: 'action'
      }
    ]
  },
  {
    id: 'trickery-domain',
    name: 'Trickery Domain',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'cleric',
    summary: 'A Cleric of mischief and deception who uses stealth blessings and illusory duplicates to outwit foes.',
    description: `Trickery Clerics serve gods of thieves, pranksters, and rebels. They can grant stealthy blessings, create an illusory double of themselves to cast spells from and confuse enemies, and later swap places with that double. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['charm-person', 'disguise-self', 'invisibility', 'pass-without-trace'] },
      { level: 5, spells: ['hypnotic-pattern', 'nondetection'] },
      { level: 7, spells: ['confusion', 'dimension-door'] },
      { level: 9, spells: ['dominate-person', 'modify-memory'] }
    ],
    features: [
      {
        id: 'trickery-domain-blessing-of-the-trickster',
        name: 'Blessing of the Trickster',
        level: 3,
        summary: 'You can give yourself or a willing ally Advantage on Dexterity (Stealth) checks for a long period.',
        description: 'You can give yourself or a willing ally Advantage on Dexterity (Stealth) checks for a long period.',
        activation: 'action'
      },
      {
        id: 'trickery-domain-spells',
        name: 'Trickery Domain Spells',
        level: 3,
        summary: 'You always have deception-themed spells prepared, such as Disguise Self, Invisibility, and Pass without Trace.',
        description: 'You always have deception-themed spells prepared, such as Disguise Self, Invisibility, and Pass without Trace.'
      },
      {
        id: 'trickery-domain-invoke-duplicity',
        name: 'Invoke Duplicity',
        level: 3,
        summary: 'Spend Channel Divinity to create an illusory duplicate of yourself that you can move, cast spells through, and use to distract enemies.',
        description:
          'Spend Channel Divinity to create an illusory duplicate of yourself that you can move, cast spells through, and use to distract enemies.',
        activation: 'bonus'
      },
      {
        id: 'trickery-domain-tricksters-transposition',
        name: 'Trickster’s Transposition',
        level: 6,
        summary: 'When you create or move your illusory duplicate, you can teleport to swap places with it.',
        description: 'When you create or move your illusory duplicate, you can teleport to swap places with it.'
      },
      {
        id: 'trickery-domain-improved-duplicity',
        name: 'Improved Duplicity',
        level: 17,
        summary: 'Your illusory duplicate becomes more potent, helping your allies as well as you.',
        description: 'Your illusory duplicate becomes more potent, helping your allies as well as you.'
      }
    ]
  },
  {
    id: 'war-domain',
    name: 'War Domain',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'cleric',
    summary: 'A battle priest who grants divine accuracy, makes extra attacks, and eventually shrugs off weapon damage.',
    description: `War Clerics serve gods of battle and valor. They get combat-focused domain spells, can use Channel Divinity to turn a near-miss into a hit, make bonus weapon attacks, and later cast key battle spells for free. At the pinnacle they become resistant to common weapon damage. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['guiding-bolt', 'magic-weapon', 'shield-of-faith', 'spiritual-weapon'] },
      { level: 5, spells: ['crusaders-mantle', 'spirit-guardians'] },
      { level: 7, spells: ['fire-shield', 'freedom-of-movement'] },
      { level: 9, spells: ['hold-monster', 'steel-wind-strike'] }
    ],
    features: [
      {
        id: 'war-domain-guided-strike',
        name: 'Guided Strike',
        level: 3,
        summary: 'Spend Channel Divinity to add a large bonus to an attack roll made by you or an ally near you, potentially turning a miss into a hit.',
        description: 'Spend Channel Divinity to add a large bonus to an attack roll made by you or an ally near you, potentially turning a miss into a hit.',
        activation: 'special'
      },
      {
        id: 'war-domain-spells',
        name: 'War Domain Spells',
        level: 3,
        summary: 'You always have battle spells prepared, such as Guiding Bolt, Shield of Faith, Spiritual Weapon, and later Spirit Guardians.',
        description: 'You always have battle spells prepared, such as Guiding Bolt, Shield of Faith, Spiritual Weapon, and later Spirit Guardians.'
      },
      {
        id: 'war-domain-war-priest',
        name: 'War Priest',
        level: 3,
        summary: 'As a Bonus Action, make a weapon attack or Unarmed Strike a limited number of times (based on your Wisdom modifier) per rest.',
        description: 'As a Bonus Action, make a weapon attack or Unarmed Strike a limited number of times (based on your Wisdom modifier) per rest.',
        activation: 'bonus',
        uses: { count: 'mod.wis', recharge: 'shortOrLong' }
      },
      {
        id: 'war-domain-war-gods-blessing',
        name: 'War God’s Blessing',
        level: 6,
        summary: 'You can spend Channel Divinity to cast Shield of Faith or Spiritual Weapon without a spell slot.',
        description: 'You can spend Channel Divinity to cast Shield of Faith or Spiritual Weapon without a spell slot.'
      },
      {
        id: 'war-domain-avatar-of-battle',
        name: 'Avatar of Battle',
        level: 17,
        summary: 'You gain Resistance to Bludgeoning, Piercing, and Slashing damage.',
        description: 'You gain Resistance to Bludgeoning, Piercing, and Slashing damage.',
        effects: [
          { target: 'resistance', op: 'grant', value: 'bludgeoning', note: 'Avatar of Battle' },
          { target: 'resistance', op: 'grant', value: 'piercing', note: 'Avatar of Battle' },
          { target: 'resistance', op: 'grant', value: 'slashing', note: 'Avatar of Battle' }
        ]
      }
    ]
  }
]

export const clericOptions: ClassOptionGroup[] = [
  {
    classId: 'cleric',
    group: 'Divine Order',
    source: 'SRD 5.2',
    items: [
      {
        id: 'cleric-divine-order-protector',
        name: 'Protector',
        level: 1,
        summary: 'Gain proficiency with Martial weapons and training with Heavy armor.',
        description: `Trained for battle, you gain proficiency with Martial weapons and training with Heavy armor.`,
        effects: [
          { target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Divine Order: Protector' },
          { target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Divine Order: Protector' }
        ]
      },
      {
        id: 'cleric-divine-order-thaumaturge',
        name: 'Thaumaturge',
        level: 1,
        summary: 'Learn one extra Cleric cantrip and add your Wisdom modifier (minimum +1) to Intelligence (Arcana or Religion) checks.',
        description: `You know one extra cantrip from the Cleric spell list. In addition, your mystical connection to the divine gives you a bonus to your Intelligence (Arcana or Religion) checks. The bonus equals your Wisdom modifier (minimum of +1).`,
        choices: [{ id: 'thaumaturge-cantrip', label: 'Extra Cleric cantrip', count: 1, type: 'cantrip', filter: 'cleric' }],
        effects: [
          { target: 'skill.arcana', op: 'add', value: 'max(1,mod.wis)', note: 'Divine Order: Thaumaturge' },
          { target: 'skill.religion', op: 'add', value: 'max(1,mod.wis)', note: 'Divine Order: Thaumaturge' },
          { target: 'spell.cantrips.cleric', op: 'add', value: 1, note: 'Divine Order: Thaumaturge (extra cantrip)' }
        ]
      }
    ]
  },
  {
    classId: 'cleric',
    group: 'Blessed Strikes',
    source: 'SRD 5.2',
    items: [
      {
        id: 'cleric-blessed-strikes-divine-strike',
        name: 'Divine Strike',
        level: 7,
        summary: 'Once per turn, a weapon hit deals an extra 1d8 Necrotic or Radiant damage (2d8 at Cleric level 14).',
        description: `Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage (your choice).

*Improved (Cleric level 14):* The extra damage of your Divine Strike increases to 2d8.`
      },
      {
        id: 'cleric-blessed-strikes-potent-spellcasting',
        name: 'Potent Spellcasting',
        level: 7,
        summary: 'Add your Wisdom modifier to Cleric cantrip damage; at level 14, damaging cantrips also grant Temporary Hit Points.',
        description: `Add your Wisdom modifier to the damage you deal with any Cleric cantrip.

*Improved (Cleric level 14):* When you cast a Cleric cantrip and deal damage to a creature with it, you can give vitality to yourself or another creature within 60 feet of yourself, granting a number of Temporary Hit Points equal to twice your Wisdom modifier.`
      }
    ]
  }
]
