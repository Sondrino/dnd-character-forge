import type { Ability, DamageType, Effect, Feature, SkillId, SpeciesDef, SpeciesOption } from '../../types'

/**
 * Races from the 2014 Player's Handbook, offered as species for 2024 rules.
 * The 2014 PHB is NOT open-licensed: only names, game-mechanical facts and terse summaries in our
 * own words. Read the full text in the book or on D&D Beyond.
 *
 * 2014 ability score increases are dropped (2024 backgrounds give them), and languages come from
 * 2024 character creation.
 */

export const PHB2014 = "Player's Handbook (2014)"

const OWN = "*Mechanical summary in our own words — see the Player's Handbook (2014) for the full text.*"
const NO_ASI = 'The 2014 ability score increases are not used: under 2024 rules your background gives them.'
const LANG = 'Languages come from 2024 character creation (Common plus two more).'
const ONCE = 'Once per Long Rest without a spell slot'

type TraitExtra = Partial<Omit<Feature, 'id' | 'name' | 'summary'>> & { more?: string }

/** Trait: level 1 and passive unless given; description = summary (+ more) unless given */
function tr(id: string, name: string, summary: string, extra: TraitExtra = {}): Feature {
  const { more, description, ...rest } = extra
  return { id, name, level: 1, activation: 'passive', summary, description: description ?? (more ? `${summary} ${more}` : summary), ...rest }
}

const prof = (skill: SkillId, note: string): Effect => ({ target: `skill.${skill}`, op: 'proficiency', note })
const resist = (value: DamageType, note: string): Effect => ({ target: 'resistance', op: 'grant', value, note })
const vs = (cond: string, note: string, target = 'save.all'): Effect => ({ target, op: 'advantage', condition: cond, note })
const weapons = (ids: string[], note: string): Effect[] => ids.map((value) => ({ target: 'proficiency.weapon', op: 'grant', value, note }))

/* ---------------------------- shared traits ---------------------------- */

const darkvision = (range: number, who: string, name = 'Darkvision'): Feature =>
  tr('darkvision', name, `Darkvision ${range} feet.`, {
    effects: [{ target: 'darkvision', op: 'min', value: range, note: `${who} Darkvision` }]
  })

const feyAncestry = (who: string): Feature =>
  tr('fey-ancestry', 'Fey Ancestry', 'Advantage on saves against being Charmed. Magic can’t put you to sleep.', {
    effects: [vs('vsCharmed', `Advantage on saves against being Charmed (${who} Fey Ancestry)`)]
  })

const cast = (ability: string): string => `${ability} is the spellcasting ability for these spells.`

/* ------------------------------- builder ------------------------------- */

interface SpeciesInput {
  id: string
  name: string
  summary: string
  intro: string
  creatureType?: string
  size: string
  speed: number
  darkvision?: number
  traits: Feature[]
  spells?: SpeciesDef['spells']
  options?: SpeciesDef['options']
  tags?: string[]
  note?: string
}

function species(o: SpeciesInput): SpeciesDef {
  const { intro, note, tags, creatureType = 'Humanoid', ...rest } = o
  const header = `**Creature Type:** ${creatureType}  \n**Size:** ${o.size}  \n**Speed:** ${o.speed} feet`
  return {
    ...rest,
    creatureType,
    kind: 'species',
    source: 'Supplement',
    sourceBook: PHB2014,
    description: [header, intro, note, `*${NO_ASI} ${LANG}*`, OWN].filter(Boolean).join('\n\n'),
    tags: ['supplement', 'phb2014', ...(tags ?? [])]
  }
}

/* -------------------------------- Dwarf -------------------------------- */

const dwarf = species({
  id: 'phb14-dwarf',
  name: 'Dwarf (2014)',
  summary: '2014 dwarf: Speed 25, Darkvision 60, poison resilience, dwarven weapons and one artisan tool. Hill or Mountain subrace.',
  intro: 'Speed 25 (not reduced by Heavy armor), Darkvision 60, poison resistance, four dwarven weapons and one artisan tool. Choose Hill Dwarf or Mountain Dwarf.',
  size: 'Medium',
  speed: 25,
  darkvision: 60,
  tags: ['dwarf'],
  traits: [
    tr('dwarf-speed', 'Speed', 'Speed 25 feet. Wearing Heavy armor doesn’t lower it.'),
    darkvision(60, 'Dwarf'),
    tr('dwarven-resilience', 'Dwarven Resilience', 'Resistance to Poison damage. Advantage on saves against poison.', {
      effects: [resist('poison', 'Dwarven Resilience'), vs('vsPoisoned', 'Advantage on saves against poison (Dwarven Resilience)')]
    }),
    tr('dwarven-combat-training', 'Dwarven Combat Training', 'Proficiency with Battleaxe, Handaxe, Light Hammer and Warhammer.', {
      effects: weapons(['battleaxe', 'handaxe', 'light-hammer', 'warhammer'], 'Dwarven Combat Training')
    }),
    tr('dwarf-tool-proficiency', 'Tool Proficiency', 'Proficiency with one of Smith’s Tools, Brewer’s Supplies or Mason’s Tools.', {
      choices: [{ id: 'tool', label: 'Tool Proficiency: artisan tool', count: 1, type: 'tool', options: ['smiths-tools', 'brewers-supplies', 'masons-tools'] }]
    }),
    tr('stonecunning', 'Stonecunning', 'History checks about stonework: count as proficient and add double your Proficiency Bonus.', {
      more: 'Apply this yourself when the check comes up.'
    })
  ],
  options: {
    label: 'Subrace',
    choices: [
      {
        id: 'phb14-hill-dwarf',
        name: 'Hill Dwarf',
        summary: 'Dwarven Toughness: +1 Hit Point maximum per level.',
        description: 'Dwarven Toughness: Hit Point maximum +1, and +1 more each level.',
        effects: [{ target: 'hp.perLevel', op: 'add', value: 1, note: 'Hill Dwarf: Dwarven Toughness' }]
      },
      {
        id: 'phb14-mountain-dwarf',
        name: 'Mountain Dwarf',
        summary: 'Dwarven Armor Training: Light and Medium armor.',
        description: 'Dwarven Armor Training: you are trained with Light and Medium armor.',
        effects: [
          { target: 'proficiency.armor', op: 'grant', value: 'light', note: 'Mountain Dwarf: Dwarven Armor Training' },
          { target: 'proficiency.armor', op: 'grant', value: 'medium', note: 'Mountain Dwarf: Dwarven Armor Training' }
        ]
      }
    ]
  }
})

/* --------------------------------- Elf --------------------------------- */

const elfWeaponTraining = (who: string): Effect[] => weapons(['longsword', 'shortsword', 'shortbow', 'longbow'], `${who}: Elf Weapon Training`)

const elfSubraces: SpeciesOption[] = [
  {
    id: 'phb14-high-elf',
    name: 'High Elf',
    summary: 'Elf Weapon Training; one Wizard cantrip (Intelligence); one extra language.',
    description:
      'Elf Weapon Training: Longsword, Shortsword, Shortbow and Longbow. Cantrip: one Wizard cantrip of your choice, cast with Intelligence — add it yourself on the Spells tab. Extra Language: one more language of your choice.',
    effects: elfWeaponTraining('High Elf')
  },
  {
    id: 'phb14-wood-elf',
    name: 'Wood Elf',
    summary: 'Speed 35; Elf Weapon Training; can try to hide when only lightly obscured by nature.',
    description:
      'Fleet of Foot: Speed 35 feet. Elf Weapon Training: Longsword, Shortsword, Shortbow and Longbow. Mask of the Wild: you may try to hide when only lightly obscured by natural weather or plants.',
    effects: [{ target: 'speed', op: 'add', value: 5, note: 'Wood Elf: Fleet of Foot' }, ...elfWeaponTraining('Wood Elf')]
  },
  {
    id: 'phb14-drow',
    name: 'Drow',
    summary: 'Darkvision 120; Sunlight Sensitivity; Dancing Lights, then Faerie Fire (3) and Darkness (5); rapier, shortsword, hand crossbow.',
    description:
      'Superior Darkvision: 120 feet. Sunlight Sensitivity: Disadvantage on attack rolls and sight-based Perception checks when you, the target or the thing you look at is in direct sunlight. Drow Magic: Dancing Lights cantrip; Faerie Fire from level 3 and Darkness from level 5, each once per Long Rest; Charisma is the spellcasting ability. Drow Weapon Training: Rapier, Shortsword and Hand Crossbow.',
    effects: [
      { target: 'darkvision', op: 'min', value: 120, note: 'Drow: Superior Darkvision' },
      ...weapons(['rapier', 'shortsword', 'hand-crossbow'], 'Drow Weapon Training')
    ],
    spells: [
      { level: 1, spellId: 'dancing-lights', note: 'Cantrip (Charisma)' },
      { level: 3, spellId: 'faerie-fire', note: `${ONCE} (Charisma)` },
      { level: 5, spellId: 'darkness', note: `${ONCE} (Charisma)` }
    ]
  }
]

const elf = species({
  id: 'phb14-elf',
  name: 'Elf (2014)',
  summary: '2014 elf: Darkvision 60, Perception, Advantage against charm, 4-hour Trance. High Elf, Wood Elf or Drow subrace.',
  intro: 'Speed 30, Darkvision 60, Perception proficiency, Advantage on saves against being Charmed, and a 4-hour trance in place of sleep. Choose High Elf, Wood Elf or Drow.',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['elf'],
  traits: [
    darkvision(60, 'Elf'),
    tr('keen-senses', 'Keen Senses', 'Proficiency in Perception.', { effects: [prof('perception', 'Elf Keen Senses')] }),
    feyAncestry('Elf'),
    tr('trance', 'Trance', 'No sleep needed: 4 hours of meditation gives the benefit of 8 hours of sleep.')
  ],
  options: { label: 'Subrace', choices: elfSubraces }
})

/* ------------------------------- Halfling ------------------------------- */

const halfling = species({
  id: 'phb14-halfling',
  name: 'Halfling (2014)',
  summary: '2014 halfling: Small, Speed 25, Lucky, Brave and Nimbleness. Lightfoot or Stout subrace.',
  intro: 'Small, Speed 25. Reroll natural 1s on d20 tests, Advantage against fear, and move through larger creatures’ spaces. Choose Lightfoot or Stout.',
  size: 'Small',
  speed: 25,
  tags: ['halfling'],
  traits: [
    tr('lucky', 'Lucky', 'Roll a 1 on the d20 for an attack roll, ability check or saving throw: reroll and use the new roll.'),
    tr('brave', 'Brave', 'Advantage on saves against being Frightened.', {
      effects: [vs('vsFrightened', 'Advantage on saves against being Frightened (Brave)')]
    }),
    tr('halfling-nimbleness', 'Halfling Nimbleness', 'You can move through the space of any creature one size larger than you.')
  ],
  options: {
    label: 'Subrace',
    choices: [
      {
        id: 'phb14-lightfoot',
        name: 'Lightfoot',
        summary: 'Naturally Stealthy: can try to hide behind a creature one size larger.',
        description: 'Naturally Stealthy: you may try to hide when only a creature at least one size larger than you blocks the view.'
      },
      {
        id: 'phb14-stout',
        name: 'Stout',
        summary: 'Stout Resilience: Poison resistance and Advantage on saves against poison.',
        description: 'Stout Resilience: Resistance to Poison damage and Advantage on saves against poison.',
        effects: [resist('poison', 'Stout Resilience'), vs('vsPoisoned', 'Advantage on saves against poison (Stout Resilience)')]
      }
    ]
  }
})

/* -------------------------------- Human -------------------------------- */

const human = species({
  id: 'phb14-human',
  name: 'Human (2014)',
  summary: '2014 human: Speed 30 and no other traits — its +1 to every score is replaced by the 2024 background.',
  intro: 'Speed 30. The standard 2014 human’s only benefits were +1 to every ability score and one extra language, so under 2024 rules it has no traits left. Consider Variant Human or the 2024 Human instead.',
  size: 'Medium',
  speed: 30,
  tags: ['human'],
  traits: [
    tr('human-2014-scores', 'Ability Score Increase (unused)', 'The 2014 +1 to every ability score is not applied; your 2024 background gives ability increases instead.')
  ]
})

const variantHuman = species({
  id: 'phb14-variant-human',
  name: 'Variant Human',
  summary: '2014 variant human: one skill of your choice and one feat (an Origin feat under 2024 rules).',
  intro: 'Speed 30. Gains one skill proficiency and one feat. Because 2024 rules have no general feats at level 1, the feat pick here is an Origin feat.',
  size: 'Medium',
  speed: 30,
  tags: ['human'],
  traits: [
    tr('skills', 'Skills', 'Proficiency in one skill of your choice.', {
      choices: [{ id: 'skill', label: 'Skills: choose a skill', count: 1, type: 'skill' }]
    }),
    tr('feat', 'Feat', 'One feat of your choice; with 2024 rules pick an Origin feat.', {
      choices: [{ id: 'feat', label: 'Feat: choose an Origin feat', count: 1, type: 'feat', filter: 'origin' }]
    })
  ]
})

/* ------------------------------ Dragonborn ------------------------------ */

const ANCESTRIES: [string, DamageType, 'line' | 'cone', Ability][] = [
  ['Black', 'acid', 'line', 'dex'],
  ['Blue', 'lightning', 'line', 'dex'],
  ['Brass', 'fire', 'line', 'dex'],
  ['Bronze', 'lightning', 'line', 'dex'],
  ['Copper', 'acid', 'line', 'dex'],
  ['Gold', 'fire', 'cone', 'dex'],
  ['Green', 'poison', 'cone', 'con'],
  ['Red', 'fire', 'cone', 'dex'],
  ['Silver', 'cold', 'cone', 'con'],
  ['White', 'cold', 'cone', 'con']
]

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
const AREA = { line: '5 by 30 ft. line', cone: '15 ft. cone' } as const
const SAVE = { dex: 'Dexterity', con: 'Constitution' } as Record<Ability, string>

const dragonAncestries: SpeciesOption[] = ANCESTRIES.map(([dragon, type, shape, save]) => ({
  id: `phb14-dragon-${dragon.toLowerCase()}`,
  name: `${dragon} Dragon`,
  summary: `${cap(type)} resistance; breath: ${AREA[shape]}, ${SAVE[save]} save, ${cap(type)} damage.`,
  description: `Damage Resistance: ${cap(type)}. Breath Weapon: ${AREA[shape]}, ${SAVE[save]} saving throw, ${cap(type)} damage.`,
  effects: [resist(type, `Draconic Ancestry (${dragon})`)]
}))

const dragonborn = species({
  id: 'phb14-dragonborn',
  name: 'Dragonborn (2014)',
  summary: '2014 dragonborn: breath weapon once per Short or Long Rest (2d6, scaling to 5d6) and a resistance set by draconic ancestry.',
  intro: 'Speed 30, no Darkvision. Choose a draconic ancestry: it sets your resistance and the damage type, area and save of your breath weapon.',
  size: 'Medium',
  speed: 30,
  tags: ['dragonborn'],
  note: 'The combat roll uses a Dexterity save and no fixed damage type; for Green, Silver and White ancestry the target makes a Constitution save instead.',
  traits: [
    tr('draconic-ancestry', 'Draconic Ancestry', 'Pick a dragon colour; it sets your resistance and breath weapon (type, area, save).'),
    tr(
      'breath-weapon',
      'Breath Weapon',
      'Action: exhale in your ancestry’s area; save DC 8 + Con mod + Proficiency Bonus, 2d6 damage, half on a success. Once per Short or Long Rest.',
      {
        activation: 'action',
        uses: { count: 1, recharge: 'shortOrLong' },
        more: 'Damage: 2d6 at level 1, 3d6 at 6, 4d6 at 11, 5d6 at 16 — roll the extra dice yourself.',
        roll: { kind: 'save', save: 'dex', dc: '8+prof+mod.con', dice: '2d6', halfOnSave: true }
      }
    ),
    tr('damage-resistance', 'Damage Resistance', 'Resistance to your draconic ancestry’s damage type.')
  ],
  options: { label: 'Draconic Ancestry', choices: dragonAncestries }
})

/* -------------------------------- Gnome -------------------------------- */

const gnome = species({
  id: 'phb14-gnome',
  name: 'Gnome (2014)',
  summary: '2014 gnome: Small, Speed 25, Darkvision 60, Advantage on mental saves against magic. Forest or Rock subrace.',
  intro: 'Small, Speed 25, Darkvision 60, and Advantage on Intelligence, Wisdom and Charisma saves against magic. Choose Forest Gnome or Rock Gnome.',
  size: 'Small',
  speed: 25,
  darkvision: 60,
  tags: ['gnome'],
  traits: [
    darkvision(60, 'Gnome'),
    tr('gnome-cunning', 'Gnome Cunning', 'Advantage on Intelligence, Wisdom and Charisma saves against magic.', {
      effects: (['int', 'wis', 'cha'] as const).map((a) => vs('vsMagic', 'Advantage against magic (Gnome Cunning)', `save.${a}`))
    })
  ],
  options: {
    label: 'Subrace',
    choices: [
      {
        id: 'phb14-forest-gnome',
        name: 'Forest Gnome',
        summary: 'Minor Illusion cantrip (Intelligence); simple communication with Small or smaller beasts.',
        description:
          'Natural Illusionist: Minor Illusion cantrip, cast with Intelligence. Speak with Small Beasts: you can share simple ideas with beasts of Small size or smaller.',
        spells: [{ level: 1, spellId: 'minor-illusion', note: 'Cantrip (Intelligence)' }]
      },
      {
        id: 'phb14-rock-gnome',
        name: 'Rock Gnome',
        summary: 'Double Proficiency Bonus on History about magic items and devices; Tinker’s Tools and tiny clockwork gadgets.',
        description:
          'Artificer’s Lore: History checks about magic items, alchemical objects or devices add double your Proficiency Bonus. Tinker: proficiency with Tinker’s Tools, and you can build up to three Tiny clockwork gadgets (AC 5, 1 HP) that last 24 hours.',
        effects: [{ target: 'proficiency.tool', op: 'grant', value: 'tinkers-tools', note: 'Rock Gnome: Tinker' }]
      }
    ]
  }
})

/* ------------------------------- Half-Elf ------------------------------- */

const halfElf = species({
  id: 'phb14-half-elf',
  name: 'Half-Elf',
  summary: '2014 half-elf: Darkvision 60, Advantage against charm, and two skills of your choice.',
  intro: 'Speed 30, Darkvision 60, Advantage on saves against being Charmed (and immune to magical sleep), plus proficiency in two skills of your choice.',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['elf', 'human'],
  traits: [
    darkvision(60, 'Half-Elf'),
    feyAncestry('Half-Elf'),
    tr('skill-versatility', 'Skill Versatility', 'Proficiency in two skills of your choice.', {
      choices: [{ id: 'skill', label: 'Skill Versatility: choose two skills', count: 2, type: 'skill' }]
    })
  ]
})

/* ------------------------------- Half-Orc ------------------------------- */

const halfOrc = species({
  id: 'phb14-half-orc',
  name: 'Half-Orc',
  summary: '2014 half-orc: Darkvision 60, Intimidation, drop to 1 HP instead of 0 once per Long Rest, extra die on melee crits.',
  intro: 'Speed 30, Darkvision 60, Intimidation proficiency, Relentless Endurance and Savage Attacks.',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['orc'],
  traits: [
    darkvision(60, 'Half-Orc'),
    tr('menacing', 'Menacing', 'Proficiency in Intimidation.', { effects: [prof('intimidation', 'Half-Orc Menacing')] }),
    tr('relentless-endurance', 'Relentless Endurance', 'When you drop to 0 HP but aren’t killed outright, go to 1 HP instead. Once per Long Rest.', {
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    }),
    tr('savage-attacks', 'Savage Attacks', 'On a melee weapon critical hit, roll one of the weapon’s damage dice one extra time and add it.')
  ]
})

/* ------------------------------- Tiefling ------------------------------- */

const tiefling = species({
  id: 'phb14-tiefling',
  name: 'Tiefling (2014)',
  summary: '2014 tiefling: Darkvision 60, Fire resistance, Thaumaturgy, then Hellish Rebuke (3) and Darkness (5).',
  intro: 'Speed 30, Darkvision 60, Fire resistance, and innate Charisma spells: Thaumaturgy, Hellish Rebuke from level 3 and Darkness from level 5.',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['tiefling'],
  traits: [
    darkvision(60, 'Tiefling'),
    tr('hellish-resistance', 'Hellish Resistance', 'Resistance to Fire damage.', { effects: [resist('fire', 'Hellish Resistance')] }),
    tr('infernal-legacy', 'Infernal Legacy', 'Thaumaturgy cantrip; Hellish Rebuke (as a 2nd-level spell) from level 3 and Darkness from level 5, each once per Long Rest.', {
      more: cast('Charisma')
    })
  ],
  spells: [
    { level: 1, spellId: 'thaumaturgy', note: 'Cantrip (Charisma)' },
    { level: 3, spellId: 'hellish-rebuke', note: `${ONCE}; cast at 2nd level (Charisma)` },
    { level: 5, spellId: 'darkness', note: `${ONCE} (Charisma)` }
  ]
})

export const phb2014Species: SpeciesDef[] = [dwarf, elf, halfling, human, variantHuman, dragonborn, gnome, halfElf, halfOrc, tiefling]
