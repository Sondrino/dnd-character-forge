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

const CANTRIPS = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
const PREPARED = [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]

const FEATURES_BY_LEVEL: string[][] = [
  ['Spellcasting', 'Innate Sorcery'],
  ['Font of Magic', 'Metamagic'],
  ['Sorcerer Subclass'],
  ['Ability Score Improvement'],
  ['Sorcerous Restoration'],
  ['Subclass feature'],
  ['Sorcery Incarnate'],
  ['Ability Score Improvement'],
  [],
  ['Metamagic'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  ['Metamagic'],
  ['Subclass feature'],
  ['Epic Boon'],
  ['Arcane Apotheosis']
]

const METAMAGIC_IDS = [
  'careful-spell', 'distant-spell', 'empowered-spell', 'extended-spell', 'heightened-spell',
  'quickened-spell', 'seeking-spell', 'subtle-spell', 'transmuted-spell', 'twinned-spell'
]

const ASI_TEXT = `You gain the Ability Score Improvement feat (see "Feats") or another feat of your choice for which you qualify. You gain this feature again at Sorcerer levels 8, 12, and 16.`

const asi = (level: number): Feature => ({
  id: `sorcerer-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive',
  choices: [
    { id: `sorcerer-asi-${level}`, label: 'Ability Score Improvement or feat', count: 1, type: 'feat', filter: 'general' }
  ]
})

const METAMAGIC_TEXT = `Because your magic flows from within, you can alter your spells to suit your needs; you gain two Metamagic options of your choice from "Metamagic Options" later in this class's description. You use the chosen options to temporarily modify spells you cast. To use an option, you must spend the number of Sorcery Points that it costs.

You can use only one Metamagic option on a spell when you cast it unless otherwise noted in one of those options.

Whenever you gain a Sorcerer level, you can replace one of your Metamagic options with one you don't know. You gain two more options at Sorcerer level 10 and two more at Sorcerer level 17.`

const metamagicMore = (level: number): Feature => ({
  id: `sorcerer-metamagic-${level}`,
  name: 'Metamagic',
  level,
  summary: 'Gain two more Metamagic options.',
  description: `You gain two more Metamagic options of your choice (see the level 2 Metamagic feature).`,
  activation: 'passive',
  choices: [
    { id: `sorcerer-metamagic-${level}`, label: 'Metamagic options (2 more)', count: 2, type: 'option', filter: 'Metamagic Options', options: METAMAGIC_IDS }
  ]
})

export const sorcererClass: ClassDef = {
  id: 'sorcerer',
  name: 'Sorcerer',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'An innate spellcaster whose magic flows from within, fueled by Sorcery Points and shaped with Metamagic.',
  description: `**Core Sorcerer Traits**

| Trait | |
|---|---|
| Primary Ability | Charisma |
| Hit Point Die | D6 per Sorcerer level |
| Saving Throw Proficiencies | Constitution and Charisma |
| Skill Proficiencies | *Choose 2:* Arcana, Deception, Insight, Intimidation, Persuasion, or Religion |
| Weapon Proficiencies | Simple weapons |
| Armor Training | None |
| Starting Equipment | *Choose A or B:* (A) Spear, 2 Daggers, Arcane Focus (crystal), Dungeoneer's Pack, and 28 GP; or (B) 50 GP |

**Becoming a Sorcerer ...**

*As a Level 1 Character*
- Gain all the traits in the Core Sorcerer Traits table.
- Gain the Sorcerer's level 1 features, which are listed in the Sorcerer Features table.

*As a Multiclass Character*
- Gain the Hit Point Die from the Core Sorcerer Traits table.
- Gain the Sorcerer's level 1 features, which are listed in the Sorcerer Features table. See the multiclassing rules in "Character Creation" to determine your available spell slots.`,
  tags: ['spellcaster', 'full-caster', 'arcane'],
  hitDie: 6,
  primaryAbility: ['cha'],
  savingThrows: ['con', 'cha'],
  skillChoices: {
    count: 2,
    options: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion']
  },
  weaponProficiencies: ['simple'],
  armorTraining: [],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'spear' },
        { id: 'dagger', qty: 2 },
        { id: 'arcane-focus', name: 'Arcane Focus (crystal)' },
        { id: 'dungeoneers-pack' }
      ],
      gp: 28
    },
    { label: 'B', items: [], gp: 50 }
  ],
  subclassLevel: 3,
  table: FEATURES_BY_LEVEL.map((features, i) => {
    const columns: Record<string, string | number> = {
      'Sorcery Points': i === 0 ? '—' : i + 1,
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
      id: 'sorcerer-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary: 'Cast Sorcerer spells using Charisma; you know cantrips and prepare a list of level 1+ spells.',
      description: `Drawing from your innate magic, you can cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Sorcerer spells, which appear in the Sorcerer spell list later in the class's description.

**Cantrips.** You know four Sorcerer cantrips of your choice. Light, Prestidigitation, Shocking Grasp, and Sorcerous Burst are recommended. Whenever you gain a Sorcerer level, you can replace one of your cantrips from this feature with another Sorcerer cantrip of your choice.

When you reach Sorcerer levels 4 and 10, you learn another Sorcerer cantrip of your choice, as shown in the Cantrips column of the Sorcerer Features table.

**Spell Slots.** The Sorcerer Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Sorcerer spells. Burning Hands and Detect Magic are recommended.

The number of spells on your list increases as you gain Sorcerer levels, as shown in the Prepared Spells column of the Sorcerer Features table. Whenever that number increases, choose additional Sorcerer spells until the number of spells on your list matches the number in the Sorcerer Features table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Sorcerer, your list of prepared spells can include six Sorcerer spells of level 1 or 2 in any combination.

If another Sorcerer feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Sorcerer spells for you.

**Changing Your Prepared Spells.** Whenever you gain a Sorcerer level, you can replace one spell on your list with another Sorcerer spell for which you have spell slots.

**Spellcasting Ability.** Charisma is your spellcasting ability for your Sorcerer spells.

**Spellcasting Focus.** You can use an Arcane Focus as a Spellcasting Focus for your Sorcerer spells.`,
      activation: 'passive'
    },
    {
      id: 'sorcerer-innate-sorcery',
      name: 'Innate Sorcery',
      level: 1,
      summary: 'As a Bonus Action, for 1 minute gain +1 spell save DC and Advantage on Sorcerer spell attacks. Twice per Long Rest.',
      description: `An event in your past left an indelible mark on you, infusing you with simmering magic. As a Bonus Action, you can unleash that magic for 1 minute, during which you gain the following benefits:

- The spell save DC of your Sorcerer spells increases by 1.
- You have Advantage on the attack rolls of Sorcerer spells you cast.

You can use this feature twice, and you regain all expended uses of it when you finish a Long Rest.`,
      activation: 'bonus',
      uses: { count: 2, recharge: 'long' }
    },
    {
      id: 'sorcerer-font-of-magic',
      name: 'Font of Magic',
      level: 2,
      summary: 'Gain Sorcery Points equal to your Sorcerer level; convert between spell slots and Sorcery Points.',
      description: `You can tap into the wellspring of magic within yourself. This wellspring is represented by Sorcery Points, which allow you to create a variety of magical effects.

You have 2 Sorcery Points, and you gain more as you reach higher levels, as shown in the Sorcery Points column of the Sorcerer Features table. You can't have more Sorcery Points than the number shown in the table for your level. You regain all expended Sorcery Points when you finish a Long Rest.

You can use your Sorcery Points to fuel the options below, along with other features, such as Metamagic, that use those points.

**Converting Spell Slots to Sorcery Points.** You can expend a spell slot to gain a number of Sorcery Points equal to the slot's level (no action required).

**Creating Spell Slots.** As a Bonus Action, you can transform unexpended Sorcery Points into one spell slot. The Creating Spell Slots table shows the cost of creating a spell slot of a given level, and it lists the minimum Sorcerer level you must be to create a slot. You can create a spell slot no higher than level 5.

Any spell slot you create with this feature vanishes when you finish a Long Rest.

**Creating Spell Slots**

| Spell Slot Level | Sorcery Point Cost | Min. Sorcerer Level |
|---|---|---|
| 1 | 2 | 2 |
| 2 | 3 | 3 |
| 3 | 5 | 5 |
| 4 | 6 | 7 |
| 5 | 7 | 9 |`,
      activation: 'bonus',
      uses: { count: 'Sorcery Points', recharge: 'long' }
    },
    {
      id: 'sorcerer-metamagic',
      name: 'Metamagic',
      level: 2,
      summary: 'Gain two Metamagic options to modify your spells by spending Sorcery Points (more at levels 10 and 17).',
      description: METAMAGIC_TEXT,
      activation: 'special',
      choices: [
        { id: 'sorcerer-metamagic-2', label: 'Metamagic options', count: 2, type: 'option', filter: 'Metamagic Options', options: METAMAGIC_IDS }
      ]
    },
    {
      id: 'sorcerer-subclass',
      name: 'Sorcerer Subclass',
      level: 3,
      summary: 'Choose a Sorcerer subclass, which grants features at Sorcerer levels 3, 6, 14, and 18.',
      description: `You gain a Sorcerer subclass of your choice. The Draconic Sorcery subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Sorcerer levels. For the rest of your career, you gain each of your subclass's features that are of your Sorcerer level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'sorcerer-sorcerous-restoration',
      name: 'Sorcerous Restoration',
      level: 5,
      summary: 'When you finish a Short Rest, regain Sorcery Points up to half your Sorcerer level. Once per Long Rest.',
      description: `When you finish a Short Rest, you can regain expended Sorcery Points, but no more than a number equal to half your Sorcerer level (round down). Once you use this feature, you can't do so again until you finish a Long Rest.`,
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    },
    {
      id: 'sorcerer-sorcery-incarnate',
      name: 'Sorcery Incarnate',
      level: 7,
      summary: 'Spend 2 Sorcery Points to activate Innate Sorcery with no uses left; while it is active, use two Metamagic options per spell.',
      description: `If you have no uses of Innate Sorcery left, you can use it if you spend 2 Sorcery Points when you take the Bonus Action to activate it.

In addition, while your Innate Sorcery feature is active, you can use up to two of your Metamagic options on each spell you cast.`,
      activation: 'passive'
    },
    asi(8),
    metamagicMore(10),
    asi(12),
    asi(16),
    metamagicMore(17),
    {
      id: 'sorcerer-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for.',
      description: `You gain an Epic Boon feat (see "Feats") or another feat of your choice for which you qualify. Boon of Dimensional Travel is recommended.`,
      activation: 'passive',
      choices: [{ id: 'sorcerer-epic-boon', label: 'Epic Boon feat', count: 1, type: 'feat', filter: 'epicBoon' }]
    },
    {
      id: 'sorcerer-arcane-apotheosis',
      name: 'Arcane Apotheosis',
      level: 20,
      summary: 'While Innate Sorcery is active, use one Metamagic option each turn for free.',
      description: `While your Innate Sorcery feature is active, you can use one Metamagic option on each of your turns without spending Sorcery Points on it.`,
      activation: 'passive'
    }
  ],
  spellcasting: {
    ability: 'cha',
    progression: 'full',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'sorcerer',
    focus: 'Arcane Focus'
  },
  multiclass: {
    prerequisite: 'Charisma 13+',
    proficiencies: 'Hit Point Die only (no armor, weapon, skill, or tool proficiencies).'
  },
  quickBuild: `Make Charisma your highest score, since it powers your spell attacks and save DCs, then put your next-best score in Constitution to keep your Concentration and low Hit Points safe; Dexterity is a good third choice for AC. A background like Noble or Sage fits well. Start with Sorcerous Burst, Fire Bolt or Shocking Grasp, Light, and Prestidigitation as cantrips, and Burning Hands and Detect Magic (or Shield and Magic Missile) as your first prepared spells.`,
  tips: [
    'Innate Sorcery (two uses per Long Rest) gives Advantage on your spell attacks and +1 to your save DC for a minute: activate it at the start of a tough fight.',
    'From level 2 you can turn Sorcery Points into spell slots and back again; convert leftover slots into points before a Long Rest is wasted.',
    'Quickened Spell lets you cast an action spell as a Bonus Action, but you still can\'t cast two level 1+ spells in the same turn.',
    'Twinned Spell works on spells that target an extra creature when upcast (Hold Person, Charm Person, Haste on two allies with care).',
    'You have the lowest Hit Point Die and no armor; Mage Armor and Shield are excellent early picks, and Draconic Sorcery gives natural AC.',
    'Take Constitution saving throw advantage seriously: War Caster or Resilient helps keep Concentration on big spells.',
    'You only swap one prepared spell per level up, so choose spells that stay useful (Shield, Misty Step, Fireball, Counterspell).'
  ],
  recommended: {
    species: ['dragonborn', 'tiefling', 'human', 'elf', 'gnome'],
    backgrounds: ['noble', 'sage', 'hermit', 'charlatan'],
    feats: ['war-caster', 'resilient', 'elemental-adept', 'alert', 'lucky', 'magic-initiate'],
    cantrips: ['sorcerous-burst', 'fire-bolt', 'shocking-grasp', 'light', 'prestidigitation', 'mage-hand', 'minor-illusion'],
    spells: ['shield', 'magic-missile', 'burning-hands', 'detect-magic', 'chromatic-orb', 'sleep', 'mage-armor', 'misty-step', 'scorching-ray', 'fireball', 'counterspell', 'haste'],
    weapons: ['dagger', 'spear', 'light-crossbow']
  }
}

export const sorcererSubclasses: SubclassDef[] = [
  {
    id: 'draconic-sorcery',
    name: 'Draconic Sorcery',
    kind: 'subclass',
    classId: 'sorcerer',
    source: 'SRD 5.2',
    summary: 'Breathe the Magic of Dragons: draconic magic grants scales, elemental power, and eventually wings.',
    description: `*Breathe the Magic of Dragons*

Your innate magic comes from the gift of a dragon. Perhaps an ancient dragon facing death bequeathed some of its magical power to you or your ancestor. You might have absorbed magic from a site infused with dragons' power. Or perhaps you handled a treasure taken from a dragon's hoard that was steeped in draconic power. Or you might have a dragon for an ancestor.`,
    alwaysPrepared: [
      { level: 3, spells: ['alter-self', 'chromatic-orb', 'command', 'dragons-breath'] },
      { level: 5, spells: ['fear', 'fly'] },
      { level: 7, spells: ['arcane-eye', 'charm-monster'] },
      { level: 9, spells: ['legend-lore', 'summon-dragon'] }
    ],
    features: [
      {
        id: 'draconic-sorcery-draconic-resilience',
        name: 'Draconic Resilience',
        level: 3,
        summary: 'Your Hit Point maximum increases by 1 per Sorcerer level, and your unarmored AC is 10 + Dexterity + Charisma modifiers.',
        description: `The magic in your body manifests physical traits of your draconic gift. Your Hit Point maximum increases by 3, and it increases by 1 whenever you gain another Sorcerer level.

Parts of you are also covered by dragon-like scales. While you aren't wearing armor, your base Armor Class equals 10 plus your Dexterity and Charisma modifiers.`,
        activation: 'passive',
        effects: [
          { target: 'hp.perLevel', op: 'add', value: 1, note: 'Draconic Resilience (+1 per Sorcerer level)' },
          { target: 'ac.unarmored', op: 'set', value: '10+dex+cha', note: 'Draconic Resilience', condition: 'noArmor' }
        ]
      },
      {
        id: 'draconic-sorcery-draconic-spells',
        name: 'Draconic Spells',
        level: 3,
        summary: 'You always have certain draconic spells prepared as you gain Sorcerer levels.',
        description: `When you reach a Sorcerer level specified in the Draconic Spells table, you thereafter always have the listed spells prepared.

**Draconic Spells**

| Sorcerer Level | Spells |
|---|---|
| 3 | Alter Self, Chromatic Orb, Command, Dragon's Breath |
| 5 | Fear, Fly |
| 7 | Arcane Eye, Charm Monster |
| 9 | Legend Lore, Summon Dragon |`,
        activation: 'passive'
      },
      {
        id: 'draconic-sorcery-elemental-affinity',
        name: 'Elemental Affinity',
        level: 6,
        summary: 'Choose Acid, Cold, Fire, Lightning, or Poison: gain Resistance to it and add your Charisma modifier to one damage roll of spells dealing that type.',
        description: `Your draconic magic has an affinity with a damage type associated with dragons. Choose one of those types: Acid, Cold, Fire, Lightning, or Poison.

You have Resistance to that damage type, and when you cast a spell that deals damage of that type, you can add your Charisma modifier to one damage roll of that spell.`,
        activation: 'passive',
        choices: [
          { id: 'draconic-sorcery-elemental-affinity', label: 'Elemental Affinity damage type', count: 1, type: 'option', options: ['acid', 'cold', 'fire', 'lightning', 'poison'] }
        ]
      },
      {
        id: 'draconic-sorcery-dragon-wings',
        name: 'Dragon Wings',
        level: 14,
        summary: 'As a Bonus Action, sprout wings for 1 hour and gain a Fly Speed of 60 feet. Once per Long Rest (or spend 3 Sorcery Points).',
        description: `As a Bonus Action, you can cause draconic wings to appear on your back. The wings last for 1 hour or until you dismiss them (no action required). For the duration, you have a Fly Speed of 60 feet.

Once you use this feature, you can't use it again until you finish a Long Rest unless you spend 3 Sorcery Points (no action required) to restore your use of it.`,
        activation: 'bonus',
        uses: { count: 1, recharge: 'long' }
      },
      {
        id: 'draconic-sorcery-dragon-companion',
        name: 'Dragon Companion',
        level: 18,
        summary: 'Cast Summon Dragon without a Material component, once per Long Rest without a slot, and optionally without Concentration.',
        description: `You can cast Summon Dragon without a Material component. You can also cast it once without a spell slot, and you regain the ability to cast it in this way when you finish a Long Rest.

Whenever you start casting the spell, you can modify it so that it doesn't require Concentration. If you do so, the spell's duration becomes 1 minute for that casting.`,
        activation: 'action',
        uses: { count: 1, recharge: 'long' }
      }
    ]
  },
  {
    id: 'aberrant-sorcery',
    name: 'Aberrant Sorcery',
    kind: 'subclass',
    classId: 'sorcerer',
    source: 'PHB 2024',
    summary: 'A sorcerer whose power comes from an alien, psionic influence, granting telepathy and mind-bending spells.',
    description: `Aberrant Sorcerers draw their magic from a strange, otherworldly source such as the Far Realm or contact with aberrant creatures. They gain psionic spells that are always prepared, speak telepathically, and can cast those spells subtly by spending Sorcery Points. Later they gain mental defenses, can reshape their flesh into alien forms, and finally warp space to teleport and crush foes. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['psionic'],
    alwaysPrepared: [
      { level: 3, spells: ['arms-of-hadar', 'calm-emotions', 'detect-thoughts', 'dissonant-whispers', 'mind-sliver'] },
      { level: 5, spells: ['hunger-of-hadar', 'sending'] },
      { level: 7, spells: ['black-tentacles', 'summon-aberration'] },
      { level: 9, spells: ['telepathic-bond', 'telekinesis'] }
    ],
    features: [
      { id: 'aberrant-sorcery-psionic-spells', name: 'Psionic Spells', level: 3, summary: 'You always have a set of psionic-themed spells prepared as you gain Sorcerer levels.', description: 'You always have a set of psionic-themed spells prepared as you gain Sorcerer levels.' },
      { id: 'aberrant-sorcery-telepathic-speech', name: 'Telepathic Speech', level: 3, summary: 'You can form a telepathic link with a creature and speak to it mind-to-mind.', description: 'You can form a telepathic link with a creature and speak to it mind-to-mind.', activation: 'bonus' },
      { id: 'aberrant-sorcery-psionic-sorcery', name: 'Psionic Sorcery', level: 6, summary: 'You can cast your psionic spells by spending Sorcery Points instead of slots, without most components.', description: 'You can cast your psionic spells by spending Sorcery Points instead of slots, without most components.' },
      { id: 'aberrant-sorcery-psychic-defenses', name: 'Psychic Defenses', level: 6, summary: 'You gain Resistance to Psychic damage and resist being charmed or frightened.', description: 'You gain Resistance to Psychic damage and resist being charmed or frightened.', effects: [{ target: 'resistance', op: 'grant', value: 'psychic', note: 'Psychic Defenses' }] },
      { id: 'aberrant-sorcery-revelation-in-flesh', name: 'Revelation in Flesh', level: 14, summary: 'Spend Sorcery Points to transform your body, gaining abilities such as flight, swimming, or seeing the invisible.', description: 'Spend Sorcery Points to transform your body, gaining abilities such as flight, swimming, or seeing the invisible.', activation: 'bonus' },
      { id: 'aberrant-sorcery-warping-implosion', name: 'Warping Implosion', level: 18, summary: 'You teleport and leave behind a space-warping implosion that damages and pulls nearby creatures.', description: 'You teleport and leave behind a space-warping implosion that damages and pulls nearby creatures.', activation: 'action', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'clockwork-sorcery',
    name: 'Clockwork Sorcery',
    kind: 'subclass',
    classId: 'sorcerer',
    source: 'PHB 2024',
    summary: 'A sorcerer infused with the cosmic order of Mechanus, able to cancel out chance and shield allies.',
    description: `Clockwork Sorcerers channel the orderly power of the plane of Mechanus. They gain always-prepared spells of protection and restoration, and can cancel Advantage or Disadvantage on a nearby roll to restore balance. Later they create protective wards from Sorcery Points, enter a trance where their d20 rolls cannot fall below 10, and finally unleash a burst of order that heals, repairs, and dispels. Full rules text is in the 2024 Player's Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['aid', 'alarm', 'lesser-restoration', 'protection-from-evil-and-good'] },
      { level: 5, spells: ['dispel-magic', 'protection-from-energy'] },
      { level: 7, spells: ['freedom-of-movement', 'summon-construct'] },
      { level: 9, spells: ['greater-restoration', 'wall-of-force'] }
    ],
    features: [
      { id: 'clockwork-sorcery-clockwork-spells', name: 'Clockwork Spells', level: 3, summary: 'You always have a set of order-themed spells prepared as you gain Sorcerer levels.', description: 'You always have a set of order-themed spells prepared as you gain Sorcerer levels.' },
      { id: 'clockwork-sorcery-restore-balance', name: 'Restore Balance', level: 3, summary: 'As a Reaction, you can cancel Advantage or Disadvantage on a nearby creature\'s d20 roll.', description: 'As a Reaction, you can cancel Advantage or Disadvantage on a nearby creature\'s d20 roll.', activation: 'reaction', uses: { count: 'mod.cha', recharge: 'long' } },
      { id: 'clockwork-sorcery-bastion-of-law', name: 'Bastion of Law', level: 6, summary: 'Spend Sorcery Points to give a creature a ward of dice that reduces damage it takes.', description: 'Spend Sorcery Points to give a creature a ward of dice that reduces damage it takes.', activation: 'action' },
      { id: 'clockwork-sorcery-trance-of-order', name: 'Trance of Order', level: 14, summary: 'You enter a state where attacks against you lose Advantage and your low d20 rolls count as 10.', description: 'You enter a state where attacks against you lose Advantage and your low d20 rolls count as 10.', activation: 'bonus', uses: { count: 1, recharge: 'long' } },
      { id: 'clockwork-sorcery-clockwork-cavalcade', name: 'Clockwork Cavalcade', level: 18, summary: 'You summon spirits of order that heal, repair objects, and end spells in an area.', description: 'You summon spirits of order that heal, repair objects, and end spells in an area.', activation: 'action', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'wild-magic-sorcery',
    name: 'Wild Magic Sorcery',
    kind: 'subclass',
    classId: 'sorcerer',
    source: 'PHB 2024',
    summary: 'A sorcerer whose chaotic magic can surge unpredictably, with a knack for bending luck.',
    description: `Wild Magic Sorcerers wield magic born of chaos. Casting spells can trigger random Wild Magic Surges, and they can grant themselves Advantage through Tides of Chaos, which often provokes a surge. With higher levels they spend Sorcery Points to bend other creatures' rolls, gain more control over surge results, and eventually choose a surge effect outright. Full rules text is in the 2024 Player's Handbook.`,
    features: [
      { id: 'wild-magic-sorcery-wild-magic-surge', name: 'Wild Magic Surge', level: 3, summary: 'Casting a spell can trigger a random magical effect from the Wild Magic Surge table.', description: 'Casting a spell can trigger a random magical effect from the Wild Magic Surge table.' },
      { id: 'wild-magic-sorcery-tides-of-chaos', name: 'Tides of Chaos', level: 3, summary: 'You can give yourself Advantage on a D20 Test, which may later cause a Wild Magic Surge.', description: 'You can give yourself Advantage on a D20 Test, which may later cause a Wild Magic Surge.', uses: { count: 1, recharge: 'long' } },
      { id: 'wild-magic-sorcery-bend-luck', name: 'Bend Luck', level: 6, summary: 'Spend Sorcery Points to add or subtract a die from another creature\'s D20 roll.', description: 'Spend Sorcery Points to add or subtract a die from another creature\'s D20 roll.', activation: 'reaction' },
      { id: 'wild-magic-sorcery-controlled-chaos', name: 'Controlled Chaos', level: 14, summary: 'When you roll on the Wild Magic Surge table, you roll twice and pick the result.', description: 'When you roll on the Wild Magic Surge table, you roll twice and pick the result.' },
      { id: 'wild-magic-sorcery-tamed-surge', name: 'Tamed Surge', level: 18, summary: 'You can choose a specific Wild Magic Surge effect when you cast a spell.', description: 'You can choose a specific Wild Magic Surge effect when you cast a spell.', uses: { count: 1, recharge: 'long' } }
    ]
  }
]

const mm = (id: string, name: string, cost: string, summary: string, text: string) => ({
  id,
  name,
  summary,
  description: `*Cost: ${cost}*

${text}`,
  activation: 'special' as const,
  source: 'SRD 5.2' as const
})

export const sorcererOptions: ClassOptionGroup[] = [
  {
    classId: 'sorcerer',
    group: 'Metamagic Options',
    source: 'SRD 5.2',
    items: [
      mm('careful-spell', 'Careful Spell', '1 Sorcery Point',
        'Chosen creatures automatically succeed on saves against your spell and take no damage on a half-damage save.',
        `When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. To do so, spend 1 Sorcery Point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell, and it takes no damage if it would normally take half damage on a successful save.`),
      mm('distant-spell', 'Distant Spell', '1 Sorcery Point',
        'Double a spell\'s range, or make a Touch spell\'s range 30 feet.',
        `When you cast a spell that has a range of at least 5 feet, you can spend 1 Sorcery Point to double the spell's range. Or when you cast a spell that has a range of Touch, you can spend 1 Sorcery Point to make the spell's range 30 feet.`),
      mm('empowered-spell', 'Empowered Spell', '1 Sorcery Point',
        'Reroll up to your Charisma modifier in damage dice; can combine with another Metamagic option.',
        `When you roll damage for a spell, you can spend 1 Sorcery Point to reroll a number of the damage dice up to your Charisma modifier (minimum of one), and you must use the new rolls.

You can use Empowered Spell even if you've already used a different Metamagic option during the casting of the spell.`),
      mm('extended-spell', 'Extended Spell', '1 Sorcery Point',
        'Double a spell\'s duration (max 24 hours) and gain Advantage on Concentration saves for it.',
        `When you cast a spell that has a duration of 1 minute or longer, you can spend 1 Sorcery Point to double its duration to a maximum duration of 24 hours.

If the affected spell requires Concentration, you have Advantage on any saving throw you make to maintain that Concentration.`),
      mm('heightened-spell', 'Heightened Spell', '2 Sorcery Points',
        'One target of your spell has Disadvantage on saves against it.',
        `When you cast a spell that forces a creature to make a saving throw, you can spend 2 Sorcery Points to give one target of the spell Disadvantage on saves against the spell.`),
      mm('quickened-spell', 'Quickened Spell', '2 Sorcery Points',
        'Cast a spell that takes an action as a Bonus Action instead (no other level 1+ spell that turn).',
        `When you cast a spell that has a casting time of an action, you can spend 2 Sorcery Points to change the casting time to a Bonus Action for this casting. You can't modify a spell in this way if you've already cast a level 1+ spell on the current turn, nor can you cast a level 1+ spell on this turn after modifying a spell in this way.`),
      mm('seeking-spell', 'Seeking Spell', '1 Sorcery Point',
        'Reroll a missed spell attack roll; can combine with another Metamagic option.',
        `If you make an attack roll for a spell and miss, you can spend 1 Sorcery Point to reroll the d20, and you must use the new roll.

You can use Seeking Spell even if you've already used a different Metamagic option during the casting of the spell.`),
      mm('subtle-spell', 'Subtle Spell', '1 Sorcery Point',
        'Cast a spell without Verbal, Somatic, or non-costly Material components.',
        `When you cast a spell, you can spend 1 Sorcery Point to cast it without any Verbal, Somatic, or Material components, except Material components that are consumed by the spell or that have a cost specified in the spell.`),
      mm('transmuted-spell', 'Transmuted Spell', '1 Sorcery Point',
        'Change a spell\'s Acid, Cold, Fire, Lightning, Poison, or Thunder damage to another of those types.',
        `When you cast a spell that deals a type of damage from the following list, you can spend 1 Sorcery Point to change that damage type to one of the other listed types: Acid, Cold, Fire, Lightning, Poison, Thunder.`),
      mm('twinned-spell', 'Twinned Spell', '1 Sorcery Point',
        'Increase a spell\'s effective level by 1 when upcasting it would add another target.',
        `When you cast a spell, such as Charm Person, that can be cast with a higher-level spell slot to target an additional creature, you can spend 1 Sorcery Point to increase the spell's effective level by 1.`)
    ]
  }
]
