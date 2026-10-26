// Species (SRD 5.2.1, CC-BY-4.0). Text reproduced from the System Reference Document 5.2.1.
import type { DamageType, Feature, SpeciesDef, SpeciesOption } from '../types'

const SRD = 'SRD 5.2' as const

/** Builds the full markdown description from header lines + traits. */
function body(header: string, intro: string, traits: Feature[], extra?: string): string {
  return [header, intro, ...traits.map((t) => `**${t.name}.** ${t.description}`), extra]
    .filter(Boolean)
    .join('\n\n')
}

function header(size: string, speed: string): string {
  return `**Creature Type:** Humanoid  \n**Size:** ${size}  \n**Speed:** ${speed}`
}

/* ------------------------------------------------------------------ */
/* Dragonborn                                                          */
/* ------------------------------------------------------------------ */

const dragons: [string, DamageType][] = [
  ['Black', 'acid'],
  ['Blue', 'lightning'],
  ['Brass', 'fire'],
  ['Bronze', 'lightning'],
  ['Copper', 'acid'],
  ['Gold', 'fire'],
  ['Green', 'poison'],
  ['Red', 'fire'],
  ['Silver', 'cold'],
  ['White', 'cold']
]

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const draconicAncestors: SpeciesOption[] = dragons.map(([dragon, type]) => ({
  id: dragon.toLowerCase(),
  name: `${dragon} Dragon`,
  summary: `${cap(type)} Breath Weapon and Resistance to ${cap(type)} damage.`,
  description: `Your draconic ancestor is a ${dragon} dragon. Your Breath Weapon deals ${cap(type)} damage, and you have Resistance to ${cap(type)} damage.`,
  effects: [{ target: 'resistance', op: 'grant', value: type, note: `Draconic Ancestry (${dragon})` }]
}))

const dragonbornTraits: Feature[] = [
  {
    id: 'draconic-ancestry',
    name: 'Draconic Ancestry',
    level: 1,
    activation: 'passive',
    summary: 'Choose a dragon ancestor; it sets your Breath Weapon and resistance damage type.',
    description: `Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits as well as your appearance.

| Dragon | Damage Type |
|---|---|
| Black | Acid |
| Blue | Lightning |
| Brass | Fire |
| Bronze | Lightning |
| Copper | Acid |
| Gold | Fire |
| Green | Poison |
| Red | Fire |
| Silver | Cold |
| White | Cold |`
  },
  {
    id: 'breath-weapon',
    name: 'Breath Weapon',
    level: 1,
    activation: 'special',
    uses: { count: 'prof', recharge: 'long' },
    summary:
      'Replace one attack with a 15-ft. Cone or 30-ft. Line of energy: Dex save (DC 8 + Con mod + PB), 1d10 damage (scales at levels 5, 11, 17), half on success.',
    description: `When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide (choose the shape each time). Each creature in that area must make a Dexterity saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus). On a failed save, a creature takes 1d10 damage of the type determined by your Draconic Ancestry trait. On a successful save, a creature takes half as much damage. This damage increases by 1d10 when you reach character levels 5 (2d10), 11 (3d10), and 17 (4d10).

You can use this Breath Weapon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.`
  },
  {
    id: 'damage-resistance',
    name: 'Damage Resistance',
    level: 1,
    activation: 'passive',
    summary: 'Resistance to the damage type of your Draconic Ancestry.',
    description: `You have Resistance to the damage type determined by your Draconic Ancestry trait.`
  },
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 60 feet.',
    description: `You have Darkvision with a range of 60 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Dragonborn Darkvision' }]
  },
  {
    id: 'draconic-flight',
    name: 'Draconic Flight',
    level: 5,
    activation: 'bonus',
    uses: { count: 1, recharge: 'long' },
    summary: 'From level 5: Bonus Action to sprout spectral wings for 10 minutes, gaining a Fly Speed equal to your Speed. Once per Long Rest.',
    description: `When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings on your back that last for 10 minutes or until you retract the wings (no action required) or have the Incapacitated condition. During that time, you have a Fly Speed equal to your Speed. Your wings appear to be made of the same energy as your Breath Weapon. Once you use this trait, you can’t use it again until you finish a Long Rest.`
  }
]

/* ------------------------------------------------------------------ */
/* Dwarf                                                               */
/* ------------------------------------------------------------------ */

const dwarfTraits: Feature[] = [
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 120 feet.',
    description: `You have Darkvision with a range of 120 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 120, note: 'Dwarf Darkvision' }]
  },
  {
    id: 'dwarven-resilience',
    name: 'Dwarven Resilience',
    level: 1,
    activation: 'passive',
    summary: 'Resistance to Poison damage; Advantage on saves to avoid or end the Poisoned condition.',
    description: `You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.`,
    effects: [
      { target: 'resistance', op: 'grant', value: 'poison', note: 'Dwarven Resilience' },
      {
        target: 'save.all',
        op: 'advantage',
        condition: 'vsPoisoned',
        note: 'Advantage on saves to avoid or end the Poisoned condition (Dwarven Resilience)'
      }
    ]
  },
  {
    id: 'dwarven-toughness',
    name: 'Dwarven Toughness',
    level: 1,
    activation: 'passive',
    summary: '+1 Hit Point maximum per level.',
    description: `Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.`,
    effects: [{ target: 'hp.perLevel', op: 'add', value: 1, note: 'Dwarven Toughness' }]
  },
  {
    id: 'stonecunning',
    name: 'Stonecunning',
    level: 1,
    activation: 'bonus',
    uses: { count: 'prof', recharge: 'long' },
    summary: 'Bonus Action: Tremorsense 60 ft. for 10 minutes while on or touching stone. Uses = Proficiency Bonus per Long Rest.',
    description: `As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked.

You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.`
  }
]

/* ------------------------------------------------------------------ */
/* Elf                                                                 */
/* ------------------------------------------------------------------ */

const elvenLineagesTable = `| Lineage | Level 1 | Level 3 | Level 5 |
|---|---|---|---|
| Drow | The range of your Darkvision increases to 120 feet. You also know the *Dancing Lights* cantrip. | *Faerie Fire* | *Darkness* |
| High Elf | You know the *Prestidigitation* cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Wizard spell list. | *Detect Magic* | *Misty Step* |
| Wood Elf | Your Speed increases to 35 feet. You also know the *Druidcraft* cantrip. | *Longstrider* | *Pass without Trace* |`

const elfTraits: Feature[] = [
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 60 feet.',
    description: `You have Darkvision with a range of 60 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Elf Darkvision' }]
  },
  {
    id: 'elven-lineage',
    name: 'Elven Lineage',
    level: 1,
    activation: 'passive',
    summary: 'Choose Drow, High Elf, or Wood Elf: a level 1 benefit plus spells at levels 3 and 5 (each castable once per Long Rest without a slot).',
    description: `You are part of a lineage that grants you supernatural abilities. Choose a lineage from the Elven Lineages table. You gain the level 1 benefit of that lineage.

When you reach character levels 3 and 5, you learn a higher-level spell, as shown on the table. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level.

Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the lineage).

${elvenLineagesTable}`,
    choices: [
      {
        id: 'spellcasting-ability',
        label: 'Spellcasting ability for Elven Lineage',
        count: 1,
        type: 'ability',
        options: ['int', 'wis', 'cha']
      }
    ]
  },
  {
    id: 'fey-ancestry',
    name: 'Fey Ancestry',
    level: 1,
    activation: 'passive',
    summary: 'Advantage on saves to avoid or end the Charmed condition.',
    description: `You have Advantage on saving throws you make to avoid or end the Charmed condition.`,
    effects: [
      {
        target: 'save.all',
        op: 'advantage',
        condition: 'vsCharmed',
        note: 'Advantage on saves to avoid or end the Charmed condition (Fey Ancestry)'
      }
    ]
  },
  {
    id: 'keen-senses',
    name: 'Keen Senses',
    level: 1,
    activation: 'passive',
    summary: 'Proficiency in Insight, Perception, or Survival.',
    description: `You have proficiency in the Insight, Perception, or Survival skill.`,
    choices: [
      {
        id: 'skill',
        label: 'Keen Senses skill',
        count: 1,
        type: 'skill',
        options: ['insight', 'perception', 'survival']
      }
    ]
  },
  {
    id: 'trance',
    name: 'Trance',
    level: 1,
    activation: 'passive',
    summary: 'You don’t need sleep, can’t be magically slept, and finish a Long Rest in 4 hours of meditation.',
    description: `You don’t need to sleep, and magic can’t put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.`
  }
]

const elvenLineages: SpeciesOption[] = [
  {
    id: 'drow',
    name: 'Drow',
    summary: 'Darkvision 120 ft. and Dancing Lights; Faerie Fire at level 3, Darkness at level 5.',
    description: `The range of your Darkvision increases to 120 feet. You also know the *Dancing Lights* cantrip.

**Level 3:** *Faerie Fire*
**Level 5:** *Darkness*`,
    effects: [{ target: 'darkvision', op: 'min', value: 120, note: 'Drow lineage' }],
    spells: [
      { level: 1, spellId: 'dancing-lights', note: 'Cantrip' },
      { level: 3, spellId: 'faerie-fire', note: 'Always prepared; once per Long Rest without a slot' },
      { level: 5, spellId: 'darkness', note: 'Always prepared; once per Long Rest without a slot' }
    ]
  },
  {
    id: 'high-elf',
    name: 'High Elf',
    summary: 'Prestidigitation (swappable for any Wizard cantrip each Long Rest); Detect Magic at level 3, Misty Step at level 5.',
    description: `You know the *Prestidigitation* cantrip. Whenever you finish a Long Rest, you can replace that cantrip with a different cantrip from the Wizard spell list.

**Level 3:** *Detect Magic*
**Level 5:** *Misty Step*`,
    spells: [
      {
        level: 1,
        spellId: 'prestidigitation',
        note: 'Cantrip; can be replaced with another Wizard cantrip after a Long Rest'
      },
      { level: 3, spellId: 'detect-magic', note: 'Always prepared; once per Long Rest without a slot' },
      { level: 5, spellId: 'misty-step', note: 'Always prepared; once per Long Rest without a slot' }
    ]
  },
  {
    id: 'wood-elf',
    name: 'Wood Elf',
    summary: 'Speed 35 ft. and Druidcraft; Longstrider at level 3, Pass without Trace at level 5.',
    description: `Your Speed increases to 35 feet. You also know the *Druidcraft* cantrip.

**Level 3:** *Longstrider*
**Level 5:** *Pass without Trace*`,
    effects: [{ target: 'speed', op: 'set', value: 35, note: 'Wood Elf lineage' }],
    spells: [
      { level: 1, spellId: 'druidcraft', note: 'Cantrip' },
      { level: 3, spellId: 'longstrider', note: 'Always prepared; once per Long Rest without a slot' },
      { level: 5, spellId: 'pass-without-trace', note: 'Always prepared; once per Long Rest without a slot' }
    ]
  }
]

/* ------------------------------------------------------------------ */
/* Gnome                                                               */
/* ------------------------------------------------------------------ */

const forestGnomeText = `You know the *Minor Illusion* cantrip. You also always have the *Speak with Animals* spell prepared. You can cast it without a spell slot a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest. You can also use any spell slots you have to cast the spell.`

const rockGnomeText = `You know the *Mending* and *Prestidigitation* cantrips. In addition, you can spend 10 minutes casting *Prestidigitation* to create a Tiny clockwork device (AC 5, 1 HP), such as a toy, fire starter, or music box. When you create the device, you determine its function by choosing one effect from *Prestidigitation*; the device produces that effect whenever you or another creature takes a Bonus Action to activate it with a touch. If the chosen effect has options within it, you choose one of those options for the device when you create it. For example, if you choose the spell’s ignite-extinguish effect, you determine whether the device ignites or extinguishes fire; the device doesn’t do both. You can have three such devices in existence at a time, and each falls apart 8 hours after its creation or when you dismantle it with a touch as a Utilize action.`

const gnomeTraits: Feature[] = [
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 60 feet.',
    description: `You have Darkvision with a range of 60 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Gnome Darkvision' }]
  },
  {
    id: 'gnomish-cunning',
    name: 'Gnomish Cunning',
    level: 1,
    activation: 'passive',
    summary: 'Advantage on Intelligence, Wisdom, and Charisma saving throws.',
    description: `You have Advantage on Intelligence, Wisdom, and Charisma saving throws.`,
    effects: [
      { target: 'save.int', op: 'advantage', note: 'Gnomish Cunning' },
      { target: 'save.wis', op: 'advantage', note: 'Gnomish Cunning' },
      { target: 'save.cha', op: 'advantage', note: 'Gnomish Cunning' }
    ]
  },
  {
    id: 'gnomish-lineage',
    name: 'Gnomish Lineage',
    level: 1,
    activation: 'passive',
    summary: 'Choose Forest Gnome (Minor Illusion + Speak with Animals) or Rock Gnome (Mending + Prestidigitation + clockwork devices).',
    description: `You are part of a lineage that grants you supernatural abilities. Choose one of the following options; whichever one you choose, Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the lineage):

**Forest Gnome.** ${forestGnomeText}

**Rock Gnome.** ${rockGnomeText}`,
    choices: [
      {
        id: 'spellcasting-ability',
        label: 'Spellcasting ability for Gnomish Lineage',
        count: 1,
        type: 'ability',
        options: ['int', 'wis', 'cha']
      }
    ]
  }
]

const gnomishLineages: SpeciesOption[] = [
  {
    id: 'forest-gnome',
    name: 'Forest Gnome',
    summary: 'Minor Illusion cantrip; Speak with Animals always prepared and castable without a slot (Proficiency Bonus times per Long Rest).',
    description: forestGnomeText,
    spells: [
      { level: 1, spellId: 'minor-illusion', note: 'Cantrip' },
      {
        level: 1,
        spellId: 'speak-with-animals',
        note: 'Always prepared; cast without a slot a number of times equal to your Proficiency Bonus per Long Rest'
      }
    ]
  },
  {
    id: 'rock-gnome',
    name: 'Rock Gnome',
    summary: 'Mending and Prestidigitation cantrips; build up to three Tiny clockwork devices.',
    description: rockGnomeText,
    spells: [
      { level: 1, spellId: 'mending', note: 'Cantrip' },
      { level: 1, spellId: 'prestidigitation', note: 'Cantrip' }
    ]
  }
]

/* ------------------------------------------------------------------ */
/* Goliath                                                             */
/* ------------------------------------------------------------------ */

const giantAncestries: SpeciesOption[] = [
  {
    id: 'cloud-giant',
    name: 'Cloud’s Jaunt (Cloud Giant)',
    summary: 'Bonus Action: teleport up to 30 feet to an unoccupied space you can see.',
    description: `As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see.`
  },
  {
    id: 'fire-giant',
    name: 'Fire’s Burn (Fire Giant)',
    summary: 'When you hit with an attack roll and deal damage, deal an extra 1d10 Fire damage.',
    description: `When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target.`
  },
  {
    id: 'frost-giant',
    name: 'Frost’s Chill (Frost Giant)',
    summary: 'When you hit with an attack roll and deal damage, deal an extra 1d6 Cold damage and reduce the target’s Speed by 10 feet.',
    description: `When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn.`
  },
  {
    id: 'hill-giant',
    name: 'Hill’s Tumble (Hill Giant)',
    summary: 'When you hit a Large or smaller creature with an attack roll and deal damage, you can knock it Prone.',
    description: `When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition.`
  },
  {
    id: 'stone-giant',
    name: 'Stone’s Endurance (Stone Giant)',
    summary: 'Reaction when you take damage: reduce it by 1d12 + Constitution modifier.',
    description: `When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total.`
  },
  {
    id: 'storm-giant',
    name: 'Storm’s Thunder (Storm Giant)',
    summary: 'Reaction when a creature within 60 feet damages you: deal 1d8 Thunder damage to it.',
    description: `When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature.`
  }
]

const goliathTraits: Feature[] = [
  {
    id: 'giant-ancestry',
    name: 'Giant Ancestry',
    level: 1,
    activation: 'special',
    uses: { count: 'prof', recharge: 'long' },
    summary: 'Choose a giant boon (Cloud, Fire, Frost, Hill, Stone, or Storm). Uses = Proficiency Bonus per Long Rest.',
    description: `You are descended from Giants. Choose one of the following benefits—a supernatural boon from your ancestry; you can use the chosen benefit a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest:

${giantAncestries.map((g) => `**${g.name}.** ${g.description}`).join('\n\n')}`
  },
  {
    id: 'large-form',
    name: 'Large Form',
    level: 5,
    activation: 'bonus',
    uses: { count: 1, recharge: 'long' },
    summary: 'From level 5: Bonus Action to become Large for 10 minutes, with Advantage on Strength checks and +10 ft. Speed. Once per Long Rest.',
    description: `Starting at character level 5, you can change your size to Large as a Bonus Action if you’re in a big enough space. This transformation lasts for 10 minutes or until you end it (no action required). For that duration, you have Advantage on Strength checks, and your Speed increases by 10 feet. Once you use this trait, you can’t use it again until you finish a Long Rest.`,
    effects: [
      { target: 'check.str', op: 'advantage', condition: 'largeForm', note: 'Large Form' },
      { target: 'speed', op: 'add', value: 10, condition: 'largeForm', note: 'Large Form' }
    ]
  },
  {
    id: 'powerful-build',
    name: 'Powerful Build',
    level: 1,
    activation: 'passive',
    summary: 'Advantage on checks to end the Grappled condition; count as one size larger for carrying capacity.',
    description: `You have Advantage on any ability check you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity.`
  }
]

/* ------------------------------------------------------------------ */
/* Halfling                                                            */
/* ------------------------------------------------------------------ */

const halflingTraits: Feature[] = [
  {
    id: 'brave',
    name: 'Brave',
    level: 1,
    activation: 'passive',
    summary: 'Advantage on saves to avoid or end the Frightened condition.',
    description: `You have Advantage on saving throws you make to avoid or end the Frightened condition.`,
    effects: [
      {
        target: 'save.all',
        op: 'advantage',
        condition: 'vsFrightened',
        note: 'Advantage on saves to avoid or end the Frightened condition (Brave)'
      }
    ]
  },
  {
    id: 'halfling-nimbleness',
    name: 'Halfling Nimbleness',
    level: 1,
    activation: 'passive',
    summary: 'You can move through the space of any creature a size larger than you.',
    description: `You can move through the space of any creature that is a size larger than you, but you can’t stop in the same space.`
  },
  {
    id: 'luck',
    name: 'Luck',
    level: 1,
    activation: 'passive',
    summary: 'Reroll a 1 on the d20 of a D20 Test (must use the new roll).',
    description: `When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.`
  },
  {
    id: 'naturally-stealthy',
    name: 'Naturally Stealthy',
    level: 1,
    activation: 'passive',
    summary: 'You can Hide when obscured only by a creature at least one size larger than you.',
    description: `You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.`
  }
]

/* ------------------------------------------------------------------ */
/* Human                                                               */
/* ------------------------------------------------------------------ */

const humanTraits: Feature[] = [
  {
    id: 'resourceful',
    name: 'Resourceful',
    level: 1,
    activation: 'passive',
    summary: 'You gain Heroic Inspiration whenever you finish a Long Rest.',
    description: `You gain Heroic Inspiration whenever you finish a Long Rest.`
  },
  {
    id: 'skillful',
    name: 'Skillful',
    level: 1,
    activation: 'passive',
    summary: 'Proficiency in one skill of your choice.',
    description: `You gain proficiency in one skill of your choice.`,
    choices: [{ id: 'skill', label: 'Skillful: choose a skill', count: 1, type: 'skill' }]
  },
  {
    id: 'versatile',
    name: 'Versatile',
    level: 1,
    activation: 'passive',
    summary: 'You gain an Origin feat of your choice (Skilled is recommended).',
    description: `You gain an Origin feat of your choice (see “Feats”). Skilled is recommended.`,
    choices: [{ id: 'feat', label: 'Versatile: choose an Origin feat', count: 1, type: 'feat', filter: 'origin' }]
  }
]

/* ------------------------------------------------------------------ */
/* Orc                                                                 */
/* ------------------------------------------------------------------ */

const orcTraits: Feature[] = [
  {
    id: 'adrenaline-rush',
    name: 'Adrenaline Rush',
    level: 1,
    activation: 'bonus',
    uses: { count: 'prof', recharge: 'shortOrLong' },
    summary: 'Dash as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus. Uses = Proficiency Bonus per Short or Long Rest.',
    description: `You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus.

You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Short or Long Rest.`
  },
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 120 feet.',
    description: `You have Darkvision with a range of 120 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 120, note: 'Orc Darkvision' }]
  },
  {
    id: 'relentless-endurance',
    name: 'Relentless Endurance',
    level: 1,
    activation: 'special',
    uses: { count: 1, recharge: 'long' },
    summary: 'When reduced to 0 HP but not killed, drop to 1 HP instead. Once per Long Rest.',
    description: `When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can’t do so again until you finish a Long Rest.`
  }
]

/* ------------------------------------------------------------------ */
/* Tiefling                                                            */
/* ------------------------------------------------------------------ */

const fiendishLegaciesTable = `| Legacy | Level 1 | Level 3 | Level 5 |
|---|---|---|---|
| Abyssal | You have Resistance to Poison damage. You also know the *Poison Spray* cantrip. | *Ray of Sickness* | *Hold Person* |
| Chthonic | You have Resistance to Necrotic damage. You also know the *Chill Touch* cantrip. | *False Life* | *Ray of Enfeeblement* |
| Infernal | You have Resistance to Fire damage. You also know the *Fire Bolt* cantrip. | *Hellish Rebuke* | *Darkness* |`

const tieflingTraits: Feature[] = [
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision 60 feet.',
    description: `You have Darkvision with a range of 60 feet.`,
    effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Tiefling Darkvision' }]
  },
  {
    id: 'fiendish-legacy',
    name: 'Fiendish Legacy',
    level: 1,
    activation: 'passive',
    summary: 'Choose Abyssal, Chthonic, or Infernal: a resistance and cantrip, plus spells at levels 3 and 5 (each castable once per Long Rest without a slot).',
    description: `You are the recipient of a legacy that grants you supernatural abilities. Choose a legacy from the Fiendish Legacies table. You gain the level 1 benefit of the chosen legacy.

When you reach character levels 3 and 5, you learn a higher-level spell, as shown on the table. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have of the appropriate level.

Intelligence, Wisdom, or Charisma is your spellcasting ability for the spells you cast with this trait (choose the ability when you select the legacy).

${fiendishLegaciesTable}`,
    choices: [
      {
        id: 'spellcasting-ability',
        label: 'Spellcasting ability for Fiendish Legacy',
        count: 1,
        type: 'ability',
        options: ['int', 'wis', 'cha']
      }
    ]
  },
  {
    id: 'otherworldly-presence',
    name: 'Otherworldly Presence',
    level: 1,
    activation: 'passive',
    summary: 'You know the Thaumaturgy cantrip, using your Fiendish Legacy spellcasting ability.',
    description: `You know the *Thaumaturgy* cantrip. When you cast it with this trait, the spell uses the same spellcasting ability you use for your Fiendish Legacy trait.`
  }
]

const legacyNote = 'Always prepared; once per Long Rest without a slot'

const fiendishLegacies: SpeciesOption[] = [
  {
    id: 'abyssal',
    name: 'Abyssal',
    summary: 'Poison resistance and Poison Spray; Ray of Sickness at level 3, Hold Person at level 5.',
    description: `You have Resistance to Poison damage. You also know the *Poison Spray* cantrip.

**Level 3:** *Ray of Sickness*
**Level 5:** *Hold Person*`,
    effects: [{ target: 'resistance', op: 'grant', value: 'poison', note: 'Abyssal legacy' }],
    spells: [
      { level: 1, spellId: 'poison-spray', note: 'Cantrip' },
      { level: 1, spellId: 'thaumaturgy', note: 'Cantrip (Otherworldly Presence)' },
      { level: 3, spellId: 'ray-of-sickness', note: legacyNote },
      { level: 5, spellId: 'hold-person', note: legacyNote }
    ]
  },
  {
    id: 'chthonic',
    name: 'Chthonic',
    summary: 'Necrotic resistance and Chill Touch; False Life at level 3, Ray of Enfeeblement at level 5.',
    description: `You have Resistance to Necrotic damage. You also know the *Chill Touch* cantrip.

**Level 3:** *False Life*
**Level 5:** *Ray of Enfeeblement*`,
    effects: [{ target: 'resistance', op: 'grant', value: 'necrotic', note: 'Chthonic legacy' }],
    spells: [
      { level: 1, spellId: 'chill-touch', note: 'Cantrip' },
      { level: 1, spellId: 'thaumaturgy', note: 'Cantrip (Otherworldly Presence)' },
      { level: 3, spellId: 'false-life', note: legacyNote },
      { level: 5, spellId: 'ray-of-enfeeblement', note: legacyNote }
    ]
  },
  {
    id: 'infernal',
    name: 'Infernal',
    summary: 'Fire resistance and Fire Bolt; Hellish Rebuke at level 3, Darkness at level 5.',
    description: `You have Resistance to Fire damage. You also know the *Fire Bolt* cantrip.

**Level 3:** *Hellish Rebuke*
**Level 5:** *Darkness*`,
    effects: [{ target: 'resistance', op: 'grant', value: 'fire', note: 'Infernal legacy' }],
    spells: [
      { level: 1, spellId: 'fire-bolt', note: 'Cantrip' },
      { level: 1, spellId: 'thaumaturgy', note: 'Cantrip (Otherworldly Presence)' },
      { level: 3, spellId: 'hellish-rebuke', note: legacyNote },
      { level: 5, spellId: 'darkness', note: legacyNote }
    ]
  }
]

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const species: SpeciesDef[] = [
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    kind: 'species',
    source: SRD,
    summary: 'Draconic humanoids with a Breath Weapon, resistance tied to their dragon ancestor, Darkvision, and spectral wings from level 5.',
    description: body(
      header('Medium (about 5–7 feet tall)', '30 feet'),
      'As a Dragonborn, you have these special traits.',
      dragonbornTraits
    ),
    creatureType: 'Humanoid',
    size: 'Medium',
    speed: 30,
    darkvision: 60,
    traits: dragonbornTraits,
    options: { label: 'Draconic Ancestry', choices: draconicAncestors }
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    kind: 'species',
    source: SRD,
    summary: 'Hardy folk with 120-ft. Darkvision, poison resistance, extra Hit Points every level, and stone-sensing Tremorsense.',
    description: body(
      header('Medium (about 4–5 feet tall)', '30 feet'),
      'As a Dwarf, you have these special traits.',
      dwarfTraits
    ),
    creatureType: 'Humanoid',
    size: 'Medium',
    speed: 30,
    darkvision: 120,
    traits: dwarfTraits
  },
  {
    id: 'elf',
    name: 'Elf',
    kind: 'species',
    source: SRD,
    summary: 'Graceful, long-lived people with Darkvision, Fey Ancestry, Trance, a skill from Keen Senses, and a magical lineage (Drow, High Elf, or Wood Elf).',
    description: body(
      header('Medium (about 5–6 feet tall)', '30 feet'),
      'As an Elf, you have these special traits.',
      elfTraits
    ),
    creatureType: 'Humanoid',
    size: 'Medium',
    speed: 30,
    darkvision: 60,
    traits: elfTraits,
    options: { label: 'Elven Lineage', choices: elvenLineages }
  },
  {
    id: 'gnome',
    name: 'Gnome',
    kind: 'species',
    source: SRD,
    summary: 'Small, clever folk with Darkvision, Advantage on mental saving throws, and a Forest or Rock Gnome lineage.',
    description: body(
      header('Small (about 3–4 feet tall)', '30 feet'),
      'As a Gnome, you have these special traits.',
      gnomeTraits
    ),
    creatureType: 'Humanoid',
    size: 'Small',
    speed: 30,
    darkvision: 60,
    traits: gnomeTraits,
    options: { label: 'Gnomish Lineage', choices: gnomishLineages }
  },
  {
    id: 'goliath',
    name: 'Goliath',
    kind: 'species',
    source: SRD,
    summary: 'Towering descendants of giants with 35-ft. Speed, a giant boon, Powerful Build, and Large Form from level 5.',
    description: body(
      header('Medium (about 7–8 feet tall)', '35 feet'),
      'As a Goliath, you have these special traits.',
      goliathTraits
    ),
    creatureType: 'Humanoid',
    size: 'Medium',
    speed: 35,
    traits: goliathTraits,
    options: { label: 'Giant Ancestry', choices: giantAncestries }
  },
  {
    id: 'halfling',
    name: 'Halfling',
    kind: 'species',
    source: SRD,
    summary: 'Small, lucky, and brave folk who reroll natural 1s and slip past larger creatures.',
    description: body(
      header('Small (about 2–3 feet tall)', '30 feet'),
      'As a Halfling, you have these special traits.',
      halflingTraits
    ),
    creatureType: 'Humanoid',
    size: 'Small',
    speed: 30,
    traits: halflingTraits
  },
  {
    id: 'human',
    name: 'Human',
    kind: 'species',
    source: SRD,
    summary: 'Adaptable and ambitious: Heroic Inspiration every Long Rest, an extra skill, and an extra Origin feat.',
    description: body(
      header('Medium (about 4–7 feet tall) or Small (about 2–4 feet tall), chosen when you select this species', '30 feet'),
      'As a Human, you have these special traits.',
      humanTraits
    ),
    creatureType: 'Humanoid',
    size: 'Small or Medium',
    speed: 30,
    traits: humanTraits
  },
  {
    id: 'orc',
    name: 'Orc',
    kind: 'species',
    source: SRD,
    summary: 'Powerful and relentless: 120-ft. Darkvision, a Bonus Action Dash with Temporary Hit Points, and Relentless Endurance.',
    description: body(
      header('Medium (about 6–7 feet tall)', '30 feet'),
      'As an Orc, you have these special traits.',
      orcTraits
    ),
    creatureType: 'Humanoid',
    size: 'Medium',
    speed: 30,
    darkvision: 120,
    traits: orcTraits
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    kind: 'species',
    source: SRD,
    summary: 'Bearers of a fiendish legacy (Abyssal, Chthonic, or Infernal) granting a resistance, innate spells, and Thaumaturgy.',
    description: body(
      header('Medium (about 4–7 feet tall) or Small (about 3–4 feet tall), chosen when you select this species', '30 feet'),
      'As a Tiefling, you have the following special traits.',
      tieflingTraits
    ),
    creatureType: 'Humanoid',
    size: 'Small or Medium',
    speed: 30,
    darkvision: 60,
    traits: tieflingTraits,
    options: { label: 'Fiendish Legacy', choices: fiendishLegacies }
  }
]
