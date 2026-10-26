import type { ClassDef, SubclassDef, ClassOptionGroup, Feature } from '../../types'

const PROF = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]

const INVOCATIONS = [1, 3, 3, 3, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10]
const CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const PREPARED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
const SLOTS = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]
const SLOT_LEVEL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

const FEATURES_BY_LEVEL: string[][] = [
  ['Eldritch Invocations', 'Pact Magic'],
  ['Magical Cunning'],
  ['Warlock Subclass'],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  ['Contact Patron'],
  ['Subclass feature'],
  ['Mystic Arcanum (level 6 spell)'],
  ['Ability Score Improvement'],
  ['Mystic Arcanum (level 7 spell)'],
  ['Subclass feature'],
  ['Mystic Arcanum (level 8 spell)'],
  ['Ability Score Improvement'],
  ['Mystic Arcanum (level 9 spell)'],
  [],
  ['Epic Boon'],
  ['Eldritch Master']
]

const ASI_TEXT = `You gain the Ability Score Improvement feat (see "Feats") or another feat of your choice for which you qualify. You gain this feature again at Warlock levels 8, 12, and 16.`

const asi = (level: number): Feature => ({
  id: `warlock-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive',
  choices: [
    { id: `warlock-asi-${level}`, label: 'Ability Score Improvement or feat', count: 1, type: 'feat', filter: 'general' }
  ]
})

const MYSTIC_ARCANUM_TEXT = `Your patron grants you a magical secret called an arcanum. Choose one level 6 Warlock spell as this arcanum.

You can cast your arcanum spell once without expending a spell slot, and you must finish a Long Rest before you can cast it in this way again.

As shown in the Warlock Features table, you gain another Warlock spell of your choice that can be cast in this way when you reach Warlock levels 13 (level 7 spell), 15 (level 8 spell), and 17 (level 9 spell). You regain all uses of your Mystic Arcanum when you finish a Long Rest.

Whenever you gain a Warlock level, you can replace one of your arcanum spells with another Warlock spell of the same level.`

const arcanum = (level: number, spellLevel: number): Feature => ({
  id: `warlock-mystic-arcanum-${spellLevel}`,
  name: `Mystic Arcanum (level ${spellLevel} spell)`,
  level,
  summary: `Choose a level ${spellLevel} Warlock spell you can cast once per Long Rest without a spell slot.`,
  description:
    spellLevel === 6
      ? MYSTIC_ARCANUM_TEXT
      : `You gain another Mystic Arcanum: choose one level ${spellLevel} Warlock spell. You can cast it once without expending a spell slot, and you regain the ability to do so when you finish a Long Rest. (See the level 11 Mystic Arcanum feature.)`,
  activation: 'special',
  uses: { count: 1, recharge: 'long' },
  choices: [
    { id: `warlock-mystic-arcanum-${spellLevel}`, label: `Mystic Arcanum (level ${spellLevel})`, count: 1, type: 'spell', filter: `warlock:${spellLevel}` }
  ]
})

export const warlockClass: ClassDef = {
  id: 'warlock',
  name: 'Warlock',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A seeker of forbidden knowledge whose pact with a mysterious patron grants Pact Magic and Eldritch Invocations.',
  description: `**Core Warlock Traits**

| Trait | |
|---|---|
| Primary Ability | Charisma |
| Hit Point Die | D8 per Warlock level |
| Saving Throw Proficiencies | Wisdom and Charisma |
| Skill Proficiencies | *Choose 2:* Arcana, Deception, History, Intimidation, Investigation, Nature, or Religion |
| Weapon Proficiencies | Simple weapons |
| Armor Training | Light armor |
| Starting Equipment | *Choose A or B:* (A) Leather Armor, Sickle, 2 Daggers, Arcane Focus (orb), Book (occult lore), Scholar's Pack, and 15 GP; or (B) 100 GP |

**Becoming a Warlock ...**

*As a Level 1 Character*
- Gain all the traits in the Core Warlock Traits table.
- Gain the Warlock's level 1 features, which are listed in the Warlock Features table.

*As a Multiclass Character*
- Gain the following traits from the Core Warlock Traits table: Hit Point Die and training with Light armor.
- Gain the Warlock's level 1 features, which are listed in the Warlock Features table. See the multiclassing rules in "Character Creation" to determine your available spell slots.`,
  tags: ['spellcaster', 'pact-magic', 'arcane'],
  hitDie: 8,
  primaryAbility: ['cha'],
  savingThrows: ['wis', 'cha'],
  skillChoices: {
    count: 2,
    options: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion']
  },
  weaponProficiencies: ['simple'],
  armorTraining: ['light'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'leather-armor' },
        { id: 'sickle' },
        { id: 'dagger', qty: 2 },
        { id: 'arcane-focus', name: 'Arcane Focus (orb)' },
        { id: 'book', name: 'Book (occult lore)' },
        { id: 'scholars-pack' }
      ],
      gp: 15
    },
    { label: 'B', items: [], gp: 100 }
  ],
  subclassLevel: 3,
  table: FEATURES_BY_LEVEL.map((features, i) => ({
    level: i + 1,
    profBonus: PROF[i],
    features,
    columns: {
      'Eldritch Invocations': INVOCATIONS[i],
      Cantrips: CANTRIPS[i],
      'Prepared Spells': PREPARED[i],
      'Spell Slots': SLOTS[i],
      'Slot Level': SLOT_LEVEL[i]
    }
  })),
  features: [
    {
      id: 'warlock-eldritch-invocations',
      name: 'Eldritch Invocations',
      level: 1,
      summary: 'Gain Eldritch Invocations (one at level 1, more as shown in the Eldritch Invocations column).',
      description: `You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons. You gain one invocation of your choice, such as Pact of the Tome. Invocations are described in the "Eldritch Invocation Options" section later in this class's description.

**Prerequisites.** If an invocation has a prerequisite, you must meet it to learn that invocation. For example, if an invocation requires you to be a level 5+ Warlock, you can select the invocation once you reach Warlock level 5.

**Replacing and Gaining Invocations.** Whenever you gain a Warlock level, you can replace one of your invocations with another one for which you qualify. You can't replace an invocation if it's a prerequisite for another invocation that you have.

When you gain certain Warlock levels, you gain more invocations of your choice, as shown in the Invocations column of the Warlock Features table.

You can't pick the same invocation more than once unless its description says otherwise.`,
      activation: 'passive',
      choices: [
        { id: 'warlock-eldritch-invocations', label: 'Eldritch Invocations (see Eldritch Invocations column)', count: 1, type: 'option', filter: 'Eldritch Invocations' }
      ]
    },
    {
      id: 'warlock-pact-magic',
      name: 'Pact Magic',
      level: 1,
      summary: 'Cast Warlock spells using Charisma with a few spell slots that are all the same level and recharge on a Short Rest.',
      description: `Through occult ceremony, you have formed a pact with a mysterious entity to gain magical powers. The entity is a voice in the shadows—its identity unclear—but its boon to you is concrete: the ability to cast spells. See "Spells" for the rules on spellcasting. The information below details how you use those rules with Warlock spells, which appear in the Warlock spell list later in the class's description.

**Cantrips.** You know two Warlock cantrips of your choice. Eldritch Blast and Prestidigitation are recommended. Whenever you gain a Warlock level, you can replace one of your cantrips from this feature with another Warlock cantrip of your choice.

When you reach Warlock levels 4 and 10, you learn another Warlock cantrip of your choice, as shown in the Cantrips column of the Warlock Features table.

**Spell Slots.** The Warlock Features table shows how many spell slots you have to cast your Warlock spells of levels 1–5. The table also shows the level of those slots, all of which are the same level. You regain all expended Pact Magic spell slots when you finish a Short or Long Rest.

For example, when you're a level 5 Warlock, you have two level 3 spell slots. To cast the level 1 spell Charm Person, you must spend one of those slots, and you cast it as a level 3 spell.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Warlock spells. Charm Person and Hex are recommended.

The number of spells on your list increases as you gain Warlock levels, as shown in the Prepared Spells column of the Warlock Features table. Whenever that number increases, choose additional Warlock spells until the number of spells on your list matches the number in the table. The chosen spells must be of a level no higher than what's shown in the table's Slot Level column for your level. When you reach level 6, for example, you learn a new Warlock spell, which can be of levels 1–3.

If another Warlock feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Warlock spells for you.

**Changing Your Prepared Spells.** Whenever you gain a Warlock level, you can replace one spell on your list with another Warlock spell of an eligible level.

**Spellcasting Ability.** Charisma is the spellcasting ability for your Warlock spells.

**Spellcasting Focus.** You can use an Arcane Focus as a Spellcasting Focus for your Warlock spells.`,
      activation: 'passive'
    },
    {
      id: 'warlock-magical-cunning',
      name: 'Magical Cunning',
      level: 2,
      summary: 'Perform a 1-minute rite to regain up to half your Pact Magic slots (round up). Once per Long Rest.',
      description: `You can perform an esoteric rite for 1 minute. At the end of it, you regain expended Pact Magic spell slots but no more than a number equal to half your maximum (round up). Once you use this feature, you can't do so again until you finish a Long Rest.`,
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    },
    {
      id: 'warlock-subclass',
      name: 'Warlock Subclass',
      level: 3,
      summary: 'Choose a Warlock subclass (patron), which grants features at Warlock levels 3, 6, 10, and 14.',
      description: `You gain a Warlock subclass of your choice. The Fiend Patron subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Warlock levels. For the rest of your career, you gain each of your subclass's features that are of your Warlock level or lower.`,
      activation: 'passive'
    },
    asi(4),
    asi(8),
    {
      id: 'warlock-contact-patron',
      name: 'Contact Patron',
      level: 9,
      summary: 'You always have Contact Other Plane prepared and can cast it once per Long Rest without a slot to contact your patron.',
      description: `In the past, you usually contacted your patron through intermediaries. Now you can communicate directly; you always have the Contact Other Plane spell prepared. With this feature, you can cast the spell without expending a spell slot to contact your patron, and you automatically succeed on the spell's saving throw.

Once you cast the spell with this feature, you can't do so in this way again until you finish a Long Rest.`,
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    },
    arcanum(11, 6),
    asi(12),
    arcanum(13, 7),
    arcanum(15, 8),
    asi(16),
    arcanum(17, 9),
    {
      id: 'warlock-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for.',
      description: `You gain an Epic Boon feat (see "Feats") or another feat of your choice for which you qualify. Boon of Fate is recommended.`,
      activation: 'passive',
      choices: [{ id: 'warlock-epic-boon', label: 'Epic Boon feat', count: 1, type: 'feat', filter: 'epicBoon' }]
    },
    {
      id: 'warlock-eldritch-master',
      name: 'Eldritch Master',
      level: 20,
      summary: 'Magical Cunning restores all your expended Pact Magic spell slots.',
      description: `When you use your Magical Cunning feature, you regain all your expended Pact Magic spell slots.`,
      activation: 'passive'
    }
  ],
  spellcasting: {
    ability: 'cha',
    progression: 'pact',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'warlock',
    focus: 'Arcane Focus'
  },
  multiclass: {
    prerequisite: 'Charisma 13+',
    proficiencies: 'Hit Point Die and training with Light armor.'
  },
  quickBuild: `Put your highest score in Charisma, then Constitution for Hit Points and Concentration; Dexterity helps your AC in light armor. The Charlatan background is a natural fit, though Sage or Acolyte also work. Take Eldritch Blast and Prestidigitation as cantrips, Hex and Charm Person (or Protection from Evil and Good) as your first spells, and Pact of the Tome or Agonizing Blast-ready options as you pick invocations.`,
  tips: [
    'Your Pact Magic slots come back on a Short Rest, so ask the party for Short Rests and spend slots freely.',
    'All your slots are cast at your highest Slot Level, so pick spells that scale well when upcast (Hold Person, Hex lasts longer, Invisibility).',
    'Eldritch Blast is your bread-and-butter attack; take Agonizing Blast at level 2 to add your Charisma modifier to each beam.',
    'Hex adds 1d6 to every Eldritch Blast beam that hits, but it uses Concentration; don\'t stack it with another Concentration spell.',
    'Magical Cunning recovers half your slots once per Long Rest — use it after a fight when no Short Rest is possible.',
    'Pact of the Blade turns you into a capable melee fighter that uses Charisma for attacks; pair it with Thirsting Blade at level 5.',
    'Mystic Arcanum gives you one high-level spell per Long Rest from level 11 — pick a game-changer, not just more damage.'
  ],
  recommended: {
    species: ['tiefling', 'human', 'elf', 'dragonborn', 'halfling'],
    backgrounds: ['charlatan', 'sage', 'acolyte', 'hermit'],
    feats: ['war-caster', 'resilient', 'magic-initiate', 'alert', 'lucky'],
    cantrips: ['eldritch-blast', 'prestidigitation', 'mage-hand', 'minor-illusion'],
    spells: ['hex', 'charm-person', 'protection-from-evil-and-good', 'hellish-rebuke', 'misty-step', 'hold-person', 'invisibility', 'counterspell', 'hypnotic-pattern', 'fly', 'dimension-door'],
    weapons: ['dagger', 'sickle', 'light-crossbow']
  }
}

export const warlockSubclasses: SubclassDef[] = [
  {
    id: 'fiend-patron',
    name: 'Fiend Patron',
    kind: 'subclass',
    classId: 'warlock',
    source: 'SRD 5.2',
    summary: 'Make a Deal with the Lower Planes: fiery spells, temporary Hit Points on kills, and fiendish luck.',
    description: `*Make a Deal with the Lower Planes*

Your pact draws on the Lower Planes, the realms of perdition. You might forge a bargain with a demon lord, an archdevil, or another fiend that is especially mighty. That patron's aims are evil—the corruption or destruction of all things, ultimately including you—and your path is defined by the extent to which you strive against those aims.`,
    alwaysPrepared: [
      { level: 3, spells: ['burning-hands', 'command', 'scorching-ray', 'suggestion'] },
      { level: 5, spells: ['fireball', 'stinking-cloud'] },
      { level: 7, spells: ['fire-shield', 'wall-of-fire'] },
      { level: 9, spells: ['geas', 'insect-plague'] }
    ],
    features: [
      {
        id: 'fiend-patron-dark-ones-blessing',
        name: "Dark One's Blessing",
        level: 3,
        summary: 'When you (or someone near you) reduce an enemy to 0 HP, gain Temporary Hit Points equal to your Charisma modifier + Warlock level.',
        description: `When you reduce an enemy to 0 Hit Points, you gain Temporary Hit Points equal to your Charisma modifier plus your Warlock level (minimum of 1 Temporary Hit Point). You also gain this benefit if someone else reduces an enemy within 10 feet of you to 0 Hit Points.`,
        activation: 'special'
      },
      {
        id: 'fiend-patron-fiend-spells',
        name: 'Fiend Spells',
        level: 3,
        summary: 'You always have certain fiendish spells prepared as you gain Warlock levels.',
        description: `The magic of your patron ensures you always have certain spells ready; when you reach a Warlock level specified in the Fiend Spells table, you thereafter always have the listed spells prepared.

**Fiend Spells**

| Warlock Level | Spells |
|---|---|
| 3 | Burning Hands, Command, Scorching Ray, Suggestion |
| 5 | Fireball, Stinking Cloud |
| 7 | Fire Shield, Wall of Fire |
| 9 | Geas, Insect Plague |`,
        activation: 'passive'
      },
      {
        id: 'fiend-patron-dark-ones-own-luck',
        name: "Dark One's Own Luck",
        level: 6,
        summary: 'Add 1d10 to an ability check or saving throw after seeing the roll. Uses equal to your Charisma modifier per Long Rest.',
        description: `You can call on your fiendish patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add 1d10 to your roll. You can do so after seeing the roll but before any of the roll's effects occur.

You can use this feature a number of times equal to your Charisma modifier (minimum of once), but you can use it no more than once per roll. You regain all expended uses when you finish a Long Rest.`,
        activation: 'special',
        uses: { count: 'mod.cha', recharge: 'long' }
      },
      {
        id: 'fiend-patron-fiendish-resilience',
        name: 'Fiendish Resilience',
        level: 10,
        summary: 'After each Short or Long Rest, choose a damage type other than Force to have Resistance to.',
        description: `Choose one damage type, other than Force, whenever you finish a Short or Long Rest. You have Resistance to that damage type until you choose a different one with this feature.`,
        activation: 'passive'
      },
      {
        id: 'fiend-patron-hurl-through-hell',
        name: 'Hurl Through Hell',
        level: 14,
        summary: 'When you hit with an attack, the target must make a Charisma save or take 8d10 Psychic damage and be Incapacitated. Once per Long Rest (or spend a Pact Magic slot).',
        description: `Once per turn when you hit a creature with an attack roll, you can try to instantly transport the target through the Lower Planes. The target must succeed on a Charisma saving throw against your spell save DC, or the target disappears and hurtles through a nightmare landscape. The target takes 8d10 Psychic damage if it isn't a Fiend, and it has the Incapacitated condition until the end of your next turn, when it returns to the space it previously occupied or the nearest unoccupied space.

Once you use this feature, you can't use it again until you finish a Long Rest unless you expend a Pact Magic spell slot (no action required) to restore your use of it.`,
        activation: 'special',
        uses: { count: 1, recharge: 'long' }
      }
    ]
  },
  {
    id: 'archfey-patron',
    name: 'Archfey Patron',
    kind: 'subclass',
    classId: 'warlock',
    source: 'PHB 2024',
    summary: 'A warlock bound to a lord or lady of the Feywild, blending teleportation with charm and illusion.',
    description: `Archfey warlocks serve a powerful fey being of the Feywild. Their signature trick is fey teleportation: they can cast Misty Step for free several times per day and add extra effects when they teleport, such as healing or hindering foes. Later they can vanish when harmed, resist being charmed, and weave teleportation into their other spells. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['teleportation'],
    alwaysPrepared: [
      { level: 3, spells: ['calm-emotions', 'faerie-fire', 'misty-step', 'phantasmal-force', 'sleep'] },
      { level: 5, spells: ['blink', 'plant-growth'] },
      { level: 7, spells: ['dominate-beast', 'greater-invisibility'] },
      { level: 9, spells: ['dominate-person', 'seeming'] }
    ],
    features: [
      { id: 'archfey-patron-archfey-spells', name: 'Archfey Spells', level: 3, summary: 'You always have a set of fey-themed spells prepared as you gain Warlock levels.', description: 'You always have a set of fey-themed spells prepared as you gain Warlock levels.' },
      { id: 'archfey-patron-steps-of-the-fey', name: 'Steps of the Fey', level: 3, summary: 'You can cast Misty Step without a slot a number of times per Long Rest and add a fey effect when you do.', description: 'You can cast Misty Step without a slot a number of times per Long Rest and add a fey effect when you do.', activation: 'bonus', uses: { count: 'mod.cha', recharge: 'long' } },
      { id: 'archfey-patron-misty-escape', name: 'Misty Escape', level: 6, summary: 'You can Misty Step as a Reaction when you take damage, and your fey steps gain new options.', description: 'You can Misty Step as a Reaction when you take damage, and your fey steps gain new options.', activation: 'reaction' },
      { id: 'archfey-patron-beguiling-defenses', name: 'Beguiling Defenses', level: 10, summary: 'You are immune to the Charmed condition and can use your Reaction to lessen a hit against you and turn psychic harm back on the attacker.', description: 'You are immune to the Charmed condition and can use your Reaction to lessen a hit against you and turn psychic harm back on the attacker.', effects: [{ target: 'conditionImmunity', op: 'grant', value: 'charmed', note: 'Beguiling Defenses' }] },
      { id: 'archfey-patron-bewitching-magic', name: 'Bewitching Magic', level: 14, summary: 'When you cast an enchantment or illusion spell with a slot, you can also cast Misty Step for free.', description: 'When you cast an enchantment or illusion spell with a slot, you can also cast Misty Step for free.' }
    ]
  },
  {
    id: 'celestial-patron',
    name: 'Celestial Patron',
    kind: 'subclass',
    classId: 'warlock',
    source: 'PHB 2024',
    summary: 'A warlock empowered by a being of the Upper Planes, wielding healing and radiant fire.',
    description: `Celestial warlocks draw on a patron such as an empyrean, unicorn, or other being of light. They gain healing and radiant spells, and a pool of healing dice they can spend as a Bonus Action. As they grow, they add their Charisma to radiant and fire damage, grant Temporary Hit Points to the party after rests, and can rise from near-death in a burst of searing light. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['healing'],
    alwaysPrepared: [
      { level: 3, spells: ['aid', 'cure-wounds', 'guiding-bolt', 'lesser-restoration', 'light', 'sacred-flame'] },
      { level: 5, spells: ['daylight', 'revivify'] },
      { level: 7, spells: ['guardian-of-faith', 'wall-of-fire'] },
      { level: 9, spells: ['greater-restoration', 'summon-celestial'] }
    ],
    features: [
      { id: 'celestial-patron-celestial-spells', name: 'Celestial Spells', level: 3, summary: 'You always have a set of healing and radiant spells prepared as you gain Warlock levels.', description: 'You always have a set of healing and radiant spells prepared as you gain Warlock levels.' },
      { id: 'celestial-patron-healing-light', name: 'Healing Light', level: 3, summary: 'You have a pool of d6s you can spend as a Bonus Action to heal a creature you can see.', description: 'You have a pool of d6s you can spend as a Bonus Action to heal a creature you can see.', activation: 'bonus' },
      { id: 'celestial-patron-radiant-soul', name: 'Radiant Soul', level: 6, summary: 'You gain Resistance to Radiant damage and add your Charisma modifier to one radiant or fire damage roll of your spells.', description: 'You gain Resistance to Radiant damage and add your Charisma modifier to one radiant or fire damage roll of your spells.', effects: [{ target: 'resistance', op: 'grant', value: 'radiant', note: 'Radiant Soul' }] },
      { id: 'celestial-patron-celestial-resilience', name: 'Celestial Resilience', level: 10, summary: 'You and your allies gain Temporary Hit Points when you finish a rest or use Magical Cunning.', description: 'You and your allies gain Temporary Hit Points when you finish a rest or use Magical Cunning.' },
      { id: 'celestial-patron-searing-vengeance', name: 'Searing Vengeance', level: 14, summary: 'When you or an ally makes a Death Saving Throw, you can restore them with a radiant burst that damages and blinds nearby enemies.', description: 'When you or an ally makes a Death Saving Throw, you can restore them with a radiant burst that damages and blinds nearby enemies.', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'great-old-one-patron',
    name: 'Great Old One Patron',
    kind: 'subclass',
    classId: 'warlock',
    source: 'PHB 2024',
    summary: 'A warlock touched by an unknowable entity from beyond reality, gaining telepathy and mind-warping magic.',
    description: `Great Old One warlocks serve an alien, often incomprehensible entity. They gain telepathy, mind-affecting spells that can be cast subtly and deal psychic damage, and insight into the minds of their enemies. Later they curse foes more effectively with Hex, shield their own thoughts, and can bind a summoned aberration to their will. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['psionic'],
    alwaysPrepared: [
      { level: 3, spells: ['detect-thoughts', 'dissonant-whispers', 'phantasmal-force', 'hideous-laughter'] },
      { level: 5, spells: ['clairvoyance', 'hunger-of-hadar'] },
      { level: 7, spells: ['confusion', 'summon-aberration'] },
      { level: 9, spells: ['modify-memory', 'telekinesis'] }
    ],
    features: [
      { id: 'great-old-one-patron-great-old-one-spells', name: 'Great Old One Spells', level: 3, summary: 'You always have a set of mind-warping spells prepared as you gain Warlock levels.', description: 'You always have a set of mind-warping spells prepared as you gain Warlock levels.' },
      { id: 'great-old-one-patron-awakened-mind', name: 'Awakened Mind', level: 3, summary: 'You can form a telepathic connection with a creature you can see.', description: 'You can form a telepathic connection with a creature you can see.', activation: 'bonus' },
      { id: 'great-old-one-patron-psychic-spells', name: 'Psychic Spells', level: 3, summary: 'Your damaging Warlock spells can deal Psychic damage, and enchantment/illusion spells can be cast without Verbal or Somatic components.', description: 'Your damaging Warlock spells can deal Psychic damage, and enchantment/illusion spells can be cast without Verbal or Somatic components.' },
      { id: 'great-old-one-patron-clairvoyant-combatant', name: 'Clairvoyant Combatant', level: 6, summary: 'Through your telepathic link, you can gain the upper hand on attacks against the linked creature and impose Disadvantage on its attacks against you.', description: 'Through your telepathic link, you can gain the upper hand on attacks against the linked creature and impose Disadvantage on its attacks against you.' },
      { id: 'great-old-one-patron-eldritch-hex', name: 'Eldritch Hex', level: 10, summary: 'Your Hex also gives its target Disadvantage on saving throws of the chosen ability.', description: 'Your Hex also gives its target Disadvantage on saving throws of the chosen ability.' },
      { id: 'great-old-one-patron-thought-shield', name: 'Thought Shield', level: 10, summary: 'Your thoughts can\'t be read, you resist Psychic damage, and creatures that deal psychic damage to you take it too.', description: 'Your thoughts can\'t be read, you resist Psychic damage, and creatures that deal psychic damage to you take it too.', effects: [{ target: 'resistance', op: 'grant', value: 'psychic', note: 'Thought Shield' }] },
      { id: 'great-old-one-patron-create-thrall', name: 'Create Thrall', level: 14, summary: 'Aberrations you summon with Summon Aberration are tougher and can be summoned without Concentration.', description: 'Aberrations you summon with Summon Aberration are tougher and can be summoned without Concentration.' }
    ]
  }
]

type Invocation = ClassOptionGroup['items'][number]

const inv = (
  id: string,
  name: string,
  summary: string,
  description: string,
  extra: Partial<Invocation> = {}
): Invocation => ({
  id,
  name,
  summary,
  description: extra.prerequisite ? `*Prerequisite: ${extra.prerequisite}*\n\n${description}` : description,
  source: 'SRD 5.2',
  activation: 'passive',
  ...extra
})

export const warlockOptions: ClassOptionGroup[] = [
  {
    classId: 'warlock',
    group: 'Eldritch Invocations',
    source: 'SRD 5.2',
    items: [
      inv('agonizing-blast', 'Agonizing Blast',
        'Add your Charisma modifier to the damage rolls of one damaging Warlock cantrip.',
        `Choose one of your known Warlock cantrips that deals damage. You can add your Charisma modifier to that spell's damage rolls.

**Repeatable.** You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip.`,
        { prerequisite: 'Level 2+ Warlock, a Warlock Cantrip That Deals Damage', level: 2 }),
      inv('armor-of-shadows', 'Armor of Shadows',
        'Cast Mage Armor on yourself at will without a spell slot.',
        `You can cast Mage Armor on yourself without expending a spell slot.`,
        { activation: 'action' }),
      inv('ascendant-step', 'Ascendant Step',
        'Cast Levitate on yourself at will without a spell slot.',
        `You can cast Levitate on yourself without expending a spell slot.`,
        { prerequisite: 'Level 5+ Warlock', level: 5, activation: 'action' }),
      inv('devils-sight', "Devil's Sight",
        'See normally in Dim Light and magical or nonmagical Darkness within 120 feet.',
        `You can see normally in Dim Light and Darkness—both magical and nonmagical—within 120 feet of yourself.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, effects: [{ target: 'sense', op: 'grant', value: "Devil's Sight 120 ft.", note: "Devil's Sight" }] }),
      inv('devouring-blade', 'Devouring Blade',
        'Thirsting Blade grants two extra attacks instead of one.',
        `The Extra Attack of your Thirsting Blade invocation confers two extra attacks rather than one.`,
        { prerequisite: 'Level 12+ Warlock, Thirsting Blade Invocation', level: 12 }),
      inv('eldritch-mind', 'Eldritch Mind',
        'Advantage on Constitution saving throws to maintain Concentration.',
        `You have Advantage on Constitution saving throws that you make to maintain Concentration.`),
      inv('eldritch-smite', 'Eldritch Smite',
        'Expend a Pact Magic slot when you hit with your pact weapon for extra Force damage and possibly knock the target Prone.',
        `Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra 1d8 Force damage to the target, plus another 1d8 per level of the spell slot, and you can give the target the Prone condition if it is Huge or smaller.`,
        { prerequisite: 'Level 5+ Warlock, Pact of the Blade Invocation', level: 5, activation: 'special' }),
      inv('eldritch-spear', 'Eldritch Spear',
        'Increase the range of one damaging Warlock cantrip by 30 feet times your Warlock level.',
        `Choose one of your known Warlock cantrips that deals damage and has a range of 10+ feet. When you cast that spell, its range increases by a number of feet equal to 30 times your Warlock level.

**Repeatable.** You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip.`,
        { prerequisite: 'Level 2+ Warlock, a Warlock Cantrip That Deals Damage', level: 2 }),
      inv('fiendish-vigor', 'Fiendish Vigor',
        'Cast False Life on yourself at will without a slot, getting the maximum Temporary Hit Points.',
        `You can cast False Life on yourself without expending a spell slot. When you cast the spell with this feature, you don't roll the die for the Temporary Hit Points; you automatically get the highest number on the die.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, activation: 'action' }),
      inv('gaze-of-two-minds', 'Gaze of Two Minds',
        'Touch a willing creature to perceive through its senses and cast spells from its space.',
        `You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn. As long as the creature is on the same plane of existence as you, you can take a Bonus Action on subsequent turns to maintain this connection, extending the duration until the end of your next turn. The connection ends if you don't maintain it in this way.

While perceiving through the other creature's senses, you benefit from any special senses possessed by that creature, and you can cast spells as if you were in your space or the other creature's space if the two of you are within 60 feet of each other.`,
        { prerequisite: 'Level 5+ Warlock', level: 5, activation: 'bonus' }),
      inv('gift-of-the-depths', 'Gift of the Depths',
        'Breathe underwater, gain a Swim Speed, and cast Water Breathing once per Long Rest without a slot.',
        `You can breathe underwater, and you gain a Swim Speed equal to your Speed.

You can also cast Water Breathing once without expending a spell slot. You regain the ability to cast it in this way again when you finish a Long Rest.`,
        { prerequisite: 'Level 5+ Warlock', level: 5, uses: { count: 1, recharge: 'long' }, effects: [{ target: 'speed.swim', op: 'set', value: 'speed', note: 'Gift of the Depths' }] }),
      inv('gift-of-the-protectors', 'Gift of the Protectors',
        'Creatures named in your Book of Shadows drop to 1 Hit Point instead of 0, once per Long Rest.',
        `A new page appears in your Book of Shadows when you conjure it. With your permission, a creature can take an action to write its name on that page, which can contain a number of names equal to your Charisma modifier (minimum of one name).

When any creature whose name is on the page is reduced to 0 Hit Points but not killed outright, the creature magically drops to 1 Hit Point instead. Once this magic is triggered, no creature can benefit from it until you finish a Long Rest.

As a Magic action, you can erase a name on the page by touching it.`,
        { prerequisite: 'Level 9+ Warlock, Pact of the Tome Invocation', level: 9, uses: { count: 1, recharge: 'long' } }),
      inv('investment-of-the-chain-master', 'Investment of the Chain Master',
        'Your Find Familiar familiar gains flight or swimming, quick attacks, your save DC, and more.',
        `When you cast Find Familiar, you infuse the summoned familiar with a measure of your eldritch power, granting the creature the following benefits.

**Aerial or Aquatic.** The familiar gains either a Fly Speed or a Swim Speed (your choice) of 40 feet.

**Quick Attack.** As a Bonus Action, you can command the familiar to take the Attack action.

**Necrotic or Radiant Damage.** Whenever the familiar deals Bludgeoning, Piercing, or Slashing damage, you can make it deal Necrotic or Radiant damage instead.

**Your Save DC.** If the familiar forces a creature to make a saving throw, it uses your spell save DC.

**Resistance.** When the familiar takes damage, you can take a Reaction to grant it Resistance against that damage.`,
        { prerequisite: 'Level 5+ Warlock, Pact of the Chain Invocation', level: 5 }),
      inv('lessons-of-the-first-ones', 'Lessons of the First Ones',
        'Gain one Origin feat of your choice (repeatable).',
        `You have received knowledge from an elder entity of the multiverse, allowing you to gain one Origin feat of your choice (see "Feats").

**Repeatable.** You can gain this invocation more than once. Each time you do so, choose a different Origin feat.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, choices: [{ id: 'lessons-of-the-first-ones-feat', label: 'Origin feat', count: 1, type: 'feat', filter: 'origin' }] }),
      inv('lifedrinker', 'Lifedrinker',
        'Your pact weapon deals an extra 1d6 Necrotic, Psychic, or Radiant damage once per turn, and you can spend a Hit Point Die to heal.',
        `Once per turn when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic, Psychic, or Radiant damage (your choice) to the creature, and you can expend one of your Hit Point Dice to roll it and regain a number of Hit Points equal to the roll plus your Constitution modifier (minimum of 1 Hit Point).`,
        { prerequisite: 'Level 9+ Warlock, Pact of the Blade Invocation', level: 9, activation: 'special' }),
      inv('mask-of-many-faces', 'Mask of Many Faces',
        'Cast Disguise Self at will without a spell slot.',
        `You can cast Disguise Self without expending a spell slot.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, activation: 'action' }),
      inv('master-of-myriad-forms', 'Master of Myriad Forms',
        'Cast Alter Self at will without a spell slot.',
        `You can cast Alter Self without expending a spell slot.`,
        { prerequisite: 'Level 5+ Warlock', level: 5, activation: 'action' }),
      inv('misty-visions', 'Misty Visions',
        'Cast Silent Image at will without a spell slot.',
        `You can cast Silent Image without expending a spell slot.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, activation: 'action' }),
      inv('one-with-shadows', 'One with Shadows',
        'While in Dim Light or Darkness, cast Invisibility on yourself without a spell slot.',
        `While you're in an area of Dim Light or Darkness, you can cast Invisibility on yourself without expending a spell slot.`,
        { prerequisite: 'Level 5+ Warlock', level: 5, activation: 'action' }),
      inv('otherworldly-leap', 'Otherworldly Leap',
        'Cast Jump on yourself at will without a spell slot.',
        `You can cast Jump on yourself without expending a spell slot.`,
        { prerequisite: 'Level 2+ Warlock', level: 2, activation: 'bonus' }),
      inv('pact-of-the-blade', 'Pact of the Blade',
        'Conjure or bond with a melee pact weapon that you can attack with using Charisma.',
        `As a Bonus Action, you can conjure a pact weapon in your hand—a Simple or Martial Melee weapon of your choice with which you bond—or create a bond with a magic weapon you touch; you can't bond with a magic weapon if someone else is attuned to it or another Warlock is bonded with it. Until the bond ends, you have proficiency with the weapon, and you can use it as a Spellcasting Focus.

Whenever you attack with the bonded weapon, you can use your Charisma modifier for the attack and damage rolls instead of using Strength or Dexterity; and you can cause the weapon to deal Necrotic, Psychic, or Radiant damage or its normal damage type.

Your bond with the weapon ends if you use this feature's Bonus Action again, if the weapon is more than 5 feet away from you for 1 minute or more, or if you die. A conjured weapon disappears when the bond ends.`,
        { activation: 'bonus' }),
      inv('pact-of-the-chain', 'Pact of the Chain',
        'Learn Find Familiar, cast it without a slot, and choose special familiar forms such as an Imp or Pseudodragon.',
        `You learn the Find Familiar spell and can cast it as a Magic action without expending a spell slot.

When you cast the spell, you choose one of the normal forms for your familiar or one of the following special forms: Imp, Pseudodragon, Quasit, Skeleton, Sphinx of Wonder, Sprite, or Venomous Snake (see "Monsters" for the familiar's stat block).

Additionally, when you take the Attack action, you can forgo one of your own attacks to allow your familiar to make one attack of its own with its Reaction.`,
        { activation: 'action' }),
      inv('pact-of-the-tome', 'Pact of the Tome',
        'Conjure a Book of Shadows that gives you three extra cantrips and two level 1 ritual spells from any class.',
        `Stitching together strands of shadow, you conjure forth a book in your hand at the end of a Short or Long Rest. This Book of Shadows (you determine its appearance) contains eldritch magic that only you can access, granting you the benefits below. The book disappears if you conjure another book with this feature or if you die.

**Cantrips and Rituals.** When the book appears, choose three cantrips, and choose two level 1 spells that have the Ritual tag. The spells can be from any class's spell list, and they must be spells you don't already have prepared. While the book is on your person, you have the chosen spells prepared, and they function as Warlock spells for you.

**Spellcasting Focus.** You can use the book as a Spellcasting Focus.`,
        {
          choices: [
            { id: 'pact-of-the-tome-cantrips', label: 'Book of Shadows cantrips (any class)', count: 3, type: 'cantrip' },
            { id: 'pact-of-the-tome-rituals', label: 'Book of Shadows level 1 rituals (any class)', count: 2, type: 'spell', filter: 'ritual:1' }
          ]
        }),
      inv('repelling-blast', 'Repelling Blast',
        'When an attack-roll Warlock cantrip hits a Large or smaller creature, push it up to 10 feet away.',
        `Choose one of your known Warlock cantrips that requires an attack roll. When you hit a Large or smaller creature with that cantrip, you can push the creature up to 10 feet straight away from you.

**Repeatable.** You can gain this invocation more than once. Each time you do so, choose a different eligible cantrip.`,
        { prerequisite: 'Level 2+ Warlock, a Warlock Cantrip That Deals Damage via an Attack Roll', level: 2 }),
      inv('thirsting-blade', 'Thirsting Blade',
        'Gain Extra Attack with your pact weapon.',
        `You gain the Extra Attack feature for your pact weapon only. With that feature, you can attack twice with the weapon instead of once when you take the Attack action on your turn.`,
        { prerequisite: 'Level 5+ Warlock, Pact of the Blade Invocation', level: 5 }),
      inv('visions-of-distant-realms', 'Visions of Distant Realms',
        'Cast Arcane Eye at will without a spell slot.',
        `You can cast Arcane Eye without expending a spell slot.`,
        { prerequisite: 'Level 9+ Warlock', level: 9, activation: 'action' }),
      inv('whispers-of-the-grave', 'Whispers of the Grave',
        'Cast Speak with Dead at will without a spell slot.',
        `You can cast Speak with Dead without expending a spell slot.`,
        { prerequisite: 'Level 7+ Warlock', level: 7, activation: 'action' }),
      inv('witch-sight', 'Witch Sight',
        'Gain Truesight with a range of 30 feet.',
        `You have Truesight with a range of 30 feet.`,
        { prerequisite: 'Level 15+ Warlock', level: 15, effects: [{ target: 'sense', op: 'grant', value: 'Truesight 30 ft.', note: 'Witch Sight' }] })
    ]
  }
]
