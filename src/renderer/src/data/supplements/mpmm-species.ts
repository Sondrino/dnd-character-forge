import type { Choice, Effect, Feature, SkillId, SpeciesDef, SpeciesOption } from '../../types'

/**
 * Player species from Mordenkainen Presents: Monsters of the Multiverse (2022).
 * MPMM is NOT open-licensed: only names, game-mechanical facts and short summaries written in our
 * own words. Read the full text in the book or on D&D Beyond.
 *
 * MPMM species already work the 2024 way: they give no ability score increases (2024 backgrounds
 * do) and no fixed languages. Species that the 2024 Player's Handbook reprints (Aasimar, Goliath,
 * Orc) are left out — use the 2024 versions.
 */

export const MPMM = 'Mordenkainen Presents: Monsters of the Multiverse'

const OWN = '*Summary in our own words — see Mordenkainen Presents: Monsters of the Multiverse for the full text.*'
const RULES_2024 =
  '*With 2024 rules: no ability score increases here (take them from your background), and languages come from character creation (Common plus two more).*'
const ONCE = 'Always prepared; once per Long Rest without a spell slot (spell slots can also be used)'

type TraitExtra = Partial<Omit<Feature, 'id' | 'name' | 'summary'>> & { more?: string }

/** Trait: level 1 and passive unless given; description = summary (+ more) unless given */
function tr(id: string, name: string, summary: string, extra: TraitExtra = {}): Feature {
  const { more, description, ...rest } = extra
  return { id, name, level: 1, activation: 'passive', summary, description: description ?? (more ? `${summary} ${more}` : summary), ...rest }
}

const castAbility = (label: string): Choice[] => [
  { id: 'spellcasting-ability', label: `Spellcasting ability for ${label}`, count: 1, type: 'ability', options: ['int', 'wis', 'cha'] }
]

const skillChoice = (label: string, count: number, options?: SkillId[]): Choice[] => [
  { id: 'skill', label, count, type: 'skill', ...(options ? { options } : {}) }
]

const prof = (skill: SkillId, note: string): Effect => ({ target: `skill.${skill}`, op: 'proficiency', note })
const resist = (value: string, note: string): Effect => ({ target: 'resistance', op: 'grant', value, note })
const vs = (cond: string, note: string, target = 'save.all'): Effect => ({ target, op: 'advantage', condition: cond, note })

const PB_LR = 'Uses = Proficiency Bonus per Long Rest.'
const pbUses = { count: 'prof', recharge: 'long' } as const

/* ---------------------------- shared traits ---------------------------- */

const darkvision = (range: number, who: string): Feature =>
  tr('darkvision', 'Darkvision', `Darkvision ${range} feet.`, {
    description: `You can see in dim light within ${range} feet as if it were bright light, and in darkness as if it were dim light (in shades of gray).`,
    effects: [{ target: 'darkvision', op: 'min', value: range, note: `${who} Darkvision` }]
  })

const feyAncestry = (who: string): Feature =>
  tr('fey-ancestry', 'Fey Ancestry', 'Advantage on saves to avoid or end the Charmed condition.', {
    effects: [vs('vsCharmed', `Advantage on saves to avoid or end Charmed (${who} Fey Ancestry)`)]
  })

const keenSenses = (who: string): Feature =>
  tr('keen-senses', 'Keen Senses', 'Proficiency in the Perception skill.', { effects: [prof('perception', `${who} Keen Senses`)] })

const trance = tr('trance', 'Trance', 'No sleep needed; a 4-hour meditative trance finishes a Long Rest and grants two temporary weapon or tool proficiencies.', {
  more: 'Magic can’t put you to sleep. Each time you finish the trance you may pick two weapons or tools you aren’t proficient with and use them proficiently until your next Long Rest — note them on the sheet yourself.'
})

const magicResistance = tr('magic-resistance', 'Magic Resistance', 'Advantage on saving throws against spells.', {
  effects: [vs('vsSpells', 'Advantage on saves against spells (Magic Resistance)')]
})

const psychicResilience = tr('psychic-resilience', 'Psychic Resilience', 'Resistance to Psychic damage.', { effects: [resist('psychic', 'Psychic Resilience')] })

const powerfulBuild = tr('powerful-build', 'Powerful Build', 'You count as one size larger for carrying capacity and for the weight you can push, drag or lift.')

const unarmed = (id: string, name: string, part: string, type: string): Feature =>
  tr(id, name, `Your ${part} make unarmed strikes that deal 1d6 + Strength modifier ${type} damage.`, {
    more: 'The app’s Unarmed Strike line still shows the generic damage — use 1d6 instead.'
  })

const amphibious = tr('amphibious', 'Amphibious', 'You can breathe both air and water.')

const flight = (who: string): Feature =>
  tr('flight', 'Flight', 'Fly Speed equal to your walking Speed, but not while wearing Medium or Heavy armor.', {
    effects: [{ target: 'speed.fly', op: 'set', value: 'speed', note: `${who} Flight (not in Medium or Heavy armor)` }]
  })

/* ------------------------------- builder ------------------------------- */

interface SpeciesInput {
  id: string
  name: string
  summary: string
  intro: string
  creatureType: string
  size: string
  speed: number
  /** Extra speed text for the header, e.g. 'Swim equal to your Speed' */
  speedNote?: string
  darkvision?: number
  traits: Feature[]
  spells?: SpeciesDef['spells']
  options?: SpeciesDef['options']
  effects?: Effect[]
  tags?: string[]
  note?: string
}

function species(o: SpeciesInput): SpeciesDef {
  const { intro, speedNote, note, tags, ...rest } = o
  const header = `**Creature Type:** ${o.creatureType}  \n**Size:** ${o.size}  \n**Speed:** ${o.speed} feet${speedNote ? ` (${speedNote})` : ''}`
  return {
    ...rest,
    kind: 'species',
    source: 'Supplement',
    sourceBook: MPMM,
    description: [header, intro, note, RULES_2024, OWN].filter(Boolean).join('\n\n'),
    tags: ['supplement', 'mpmm', ...(tags ?? [])]
  }
}

/* ------------------------------- species ------------------------------- */

const aarakocra = species({
  id: 'mpmm-aarakocra',
  name: 'Aarakocra',
  summary: 'Winged bird-folk of the Elemental Plane of Air: flight, taloned unarmed strikes, and Gust of Wind from level 3.',
  intro: 'Aarakocra are feathered humanoids who trace their origin to the windswept Plane of Air. They soar over battlefields, rake foes with their talons and can call up a blast of wind once they gain some experience.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  speedNote: 'Fly equal to your Speed',
  traits: [
    flight('Aarakocra'),
    unarmed('talons', 'Talons', 'talons', 'Slashing'),
    tr('wind-caller', 'Wind Caller', 'From level 3: Gust of Wind once per Long Rest without a slot (also castable with slots).', {
      level: 3,
      more: 'Choose Intelligence, Wisdom or Charisma as the spellcasting ability for it.',
      choices: castAbility('Wind Caller')
    })
  ],
  spells: [{ level: 3, spellId: 'gust-of-wind', note: ONCE }]
})

const bugbear = species({
  id: 'mpmm-bugbear',
  name: 'Bugbear',
  summary: 'Big, stealthy goblinoids with long reach, Powerful Build and extra damage against foes who haven’t acted yet.',
  intro: 'Bugbears are hulking goblinoids with fey roots, surprisingly quiet for their size. Their long arms let them strike from farther away, and they are at their deadliest in the opening moments of a fight.',
  creatureType: 'Humanoid (goblinoid)',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['goblinoid'],
  traits: [
    darkvision(60, 'Bugbear'),
    feyAncestry('Bugbear'),
    tr('long-limbed', 'Long-Limbed', 'On your turn, your reach for melee attacks is 5 feet greater than normal.'),
    powerfulBuild,
    tr('sneaky', 'Sneaky', 'Proficiency in Stealth; you can move through and stay in spaces sized for a Small creature without squeezing.', {
      effects: [prof('stealth', 'Bugbear Sneaky')]
    }),
    tr('surprise-attack', 'Surprise Attack', 'When you hit a creature with an attack roll and it hasn’t taken a turn yet this combat, it takes an extra 2d6 damage.', {
      activation: 'special',
      roll: { kind: 'damage', dice: '2d6' }
    })
  ]
})

const centaur = species({
  id: 'mpmm-centaur',
  name: 'Centaur',
  summary: 'Fey horse-folk with 40-ft. Speed, hoof attacks, a charging follow-up kick and a nature skill.',
  intro: 'Centaurs combine a humanoid torso with the body of a horse and come from the fey wilds and open plains. They cover ground quickly, trample foes after a running charge and carry heavy loads, though climbing is awkward for them.',
  creatureType: 'Fey',
  size: 'Medium',
  speed: 40,
  traits: [
    tr('charge', 'Charge', 'If you move at least 30 feet straight toward a target and then hit it with a melee weapon attack that turn, you can make a Hooves attack against it as a Bonus Action.', {
      activation: 'bonus',
      roll: { kind: 'damage', dice: '1d6+mod.str', damageType: 'bludgeoning', melee: true }
    }),
    tr('equine-build', 'Equine Build', 'You count as one size larger for carrying capacity and pushing, dragging or lifting; climbs that need hands and feet cost you 4 extra feet per foot moved.', {
      more: 'The app’s carrying capacity does not apply this automatically — adjust it yourself if needed.'
    }),
    unarmed('hooves', 'Hooves', 'hooves', 'Bludgeoning'),
    tr('natural-affinity', 'Natural Affinity', 'Proficiency in one skill: Animal Handling, Medicine, Nature or Survival.', {
      choices: skillChoice('Natural Affinity skill', 1, ['animalHandling', 'medicine', 'nature', 'survival'])
    })
  ]
})

const changeling = species({
  id: 'mpmm-changeling',
  name: 'Changeling',
  summary: 'Fey shapeshifters who can change their appearance and voice at will, with two social skills.',
  intro: 'Changelings can reshape their faces and bodies, slipping between identities as easily as others change clothes. Some keep one true self, others build a whole collection of personas.',
  creatureType: 'Fey',
  size: 'Small or Medium',
  speed: 30,
  traits: [
    tr('changeling-instincts', 'Changeling Instincts', 'Proficiency in two of: Deception, Insight, Intimidation, Performance, Persuasion.', {
      choices: skillChoice('Changeling Instincts skills', 2, ['deception', 'insight', 'intimidation', 'performance', 'persuasion'])
    }),
    tr('shapechanger', 'Shapechanger', 'As an action, change your look and voice (height, weight, features, coloring); your game statistics stay the same.', {
      activation: 'action',
      more: 'You can’t copy a creature you’ve never seen, and the new form must have the same basic body plan; you can switch between Small and Medium. Clothing and gear don’t change. Revert with another action, or when you die.'
    })
  ]
})

const deepGnome = species({
  id: 'mpmm-deep-gnome',
  name: 'Deep Gnome',
  summary: 'Svirfneblin of the Underdark: 120-ft. Darkvision, magic-resistant minds, stealth bursts and illusion magic from level 3.',
  intro: 'Deep gnomes (svirfneblin) are gnomes of the Underdark, hardened by its dangers. They see far in the dark, shrug off mind-affecting magic and know how to vanish against stone.',
  creatureType: 'Humanoid (gnome)',
  size: 'Small',
  speed: 30,
  darkvision: 120,
  tags: ['gnome'],
  traits: [
    darkvision(120, 'Deep Gnome'),
    tr('gift-of-the-svirfneblin', 'Gift of the Svirfneblin', 'Disguise Self from level 3 and Nondetection from level 5, each once per Long Rest without a slot or material components.', {
      level: 3,
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Gift of the Svirfneblin')
    }),
    tr('gnomish-magic-resistance', 'Gnomish Magic Resistance', 'Advantage on Intelligence, Wisdom and Charisma saving throws against spells.', {
      effects: (['int', 'wis', 'cha'] as const).map((a) => vs('vsSpells', 'Advantage against spells (Gnomish Magic Resistance)', `save.${a}`))
    }),
    tr('svirfneblin-camouflage', 'Svirfneblin Camouflage', `Give yourself Advantage on a Dexterity (Stealth) check. ${PB_LR}`, {
      activation: 'special',
      uses: pbUses
    })
  ],
  spells: [
    { level: 3, spellId: 'disguise-self', note: ONCE },
    { level: 5, spellId: 'nondetection', note: `${ONCE}; no material component` }
  ]
})

const duergar = species({
  id: 'mpmm-duergar',
  name: 'Duergar',
  summary: 'Gray dwarves of the Underdark: 120-ft. Darkvision, poison resistance, psionic fortitude and self-only Enlarge and Invisibility.',
  intro: 'Duergar are dwarves reshaped by long captivity under mind flayers. They carry the psionic legacy of that ordeal: tough minds and the power to grow large or vanish.',
  creatureType: 'Humanoid (dwarf)',
  size: 'Medium',
  speed: 30,
  darkvision: 120,
  tags: ['dwarf'],
  traits: [
    darkvision(120, 'Duergar'),
    tr('duergar-magic', 'Duergar Magic', 'From level 3, Enlarge/Reduce on yourself; from level 5, Invisibility on yourself — each once per Long Rest without a slot or material components.', {
      level: 3,
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Duergar Magic')
    }),
    tr('dwarven-resilience', 'Dwarven Resilience', 'Resistance to Poison damage and Advantage on saves to avoid or end the Poisoned condition.', {
      effects: [resist('poison', 'Dwarven Resilience'), vs('vsPoisoned', 'Advantage on saves to avoid or end Poisoned (Dwarven Resilience)')]
    }),
    tr('psionic-fortitude', 'Psionic Fortitude', 'Advantage on saves to avoid or end the Charmed or Stunned condition.', {
      effects: [vs('vsCharmed', 'Advantage vs Charmed (Psionic Fortitude)'), vs('vsStunned', 'Advantage vs Stunned (Psionic Fortitude)')]
    })
  ],
  spells: [
    { level: 3, spellId: 'enlarge-reduce', note: `${ONCE}; self only` },
    { level: 5, spellId: 'invisibility', note: `${ONCE}; self only` }
  ]
})

const eladrinSeasons: SpeciesOption[] = [
  {
    id: 'eladrin-autumn',
    name: 'Autumn',
    summary: 'Fey Step (level 3+): up to two creatures within 10 ft. make a Wisdom save or are Charmed for 1 minute (ends if you or allies damage them).',
    description: 'Season of peace and goodwill. From level 3, right after you Fey Step, up to two creatures you can see within 10 feet of you must succeed on a Wisdom saving throw or be Charmed by you for 1 minute, or until you or your companions damage them.'
  },
  {
    id: 'eladrin-winter',
    name: 'Winter',
    summary: 'Fey Step (level 3+): one creature within 5 ft. of you before you vanish makes a Wisdom save or is Frightened until the end of your next turn.',
    description: 'Season of contemplation and sorrow. From level 3, when you Fey Step, one creature you can see within 5 feet of you before the teleport must succeed on a Wisdom saving throw or be Frightened of you until the end of your next turn.'
  },
  {
    id: 'eladrin-spring',
    name: 'Spring',
    summary: 'Fey Step (level 3+): touch a willing creature within 5 ft.; it teleports instead of you, up to 30 ft.',
    description: 'Season of joy and celebration. From level 3, when you Fey Step you can touch one willing creature within 5 feet of you; that creature teleports instead of you, to an unoccupied space you can see within 30 feet.'
  },
  {
    id: 'eladrin-summer',
    name: 'Summer',
    summary: 'Fey Step (level 3+): each creature of your choice within 5 ft. of your arrival point takes Fire damage equal to your Proficiency Bonus.',
    description: 'Season of boldness and anger. From level 3, right after you Fey Step, each creature of your choice that you can see within 5 feet of you takes Fire damage equal to your Proficiency Bonus.'
  }
]

const eladrin = species({
  id: 'mpmm-eladrin',
  name: 'Eladrin',
  summary: 'Elves of the Feywild whose moods follow the seasons: a Bonus Action teleport that gains a seasonal effect from level 3.',
  intro: 'Eladrin are elves steeped in the Feywild, their temperament shifting with the seasons. Each season colors their signature magic: a short fey teleport that charms, frightens, shares or scorches.',
  creatureType: 'Humanoid (elf)',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['elf'],
  note: 'Pick your current season under Season. You can change it whenever you finish a Long Rest.',
  traits: [
    darkvision(60, 'Eladrin'),
    feyAncestry('Eladrin'),
    tr('fey-step', 'Fey Step', `Bonus Action: teleport up to 30 feet to an unoccupied space you can see. From level 3 your season adds an effect. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses,
      more: 'Seasonal save DC = 8 + Proficiency Bonus + the Intelligence, Wisdom or Charisma modifier you choose. Your season can change whenever you finish a Long Rest.',
      choices: castAbility('Fey Step')
    }),
    keenSenses('Eladrin'),
    trance
  ],
  options: { label: 'Season', choices: eladrinSeasons }
})

const fairy = species({
  id: 'mpmm-fairy',
  name: 'Fairy',
  summary: 'Tiny-winged fey with flight, Druidcraft, and Faerie Fire and Enlarge/Reduce from levels 3 and 5.',
  intro: 'Fairies are small fey who flit on insect-like or butterfly wings and carry a little of the Feywild’s magic everywhere they go.',
  creatureType: 'Fey',
  size: 'Small',
  speed: 30,
  speedNote: 'Fly equal to your Speed',
  traits: [
    tr('fairy-magic', 'Fairy Magic', 'You know Druidcraft; Faerie Fire from level 3 and Enlarge/Reduce from level 5, each once per Long Rest without a slot.', {
      more: 'You can also cast those spells with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Fairy Magic')
    }),
    flight('Fairy')
  ],
  spells: [
    { level: 1, spellId: 'druidcraft', note: 'Cantrip' },
    { level: 3, spellId: 'faerie-fire', note: ONCE },
    { level: 5, spellId: 'enlarge-reduce', note: ONCE }
  ]
})

const firbolg = species({
  id: 'mpmm-firbolg',
  name: 'Firbolg',
  summary: 'Gentle forest giants-kin with Detect Magic and Disguise Self, a vanishing Hidden Step, Powerful Build and a way with beasts and plants.',
  intro: 'Firbolgs are towering, soft-spoken guardians of the wild with a touch of giant and fey blood. They prefer to slip away unseen and talk to the trees rather than fight.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  traits: [
    tr('firbolg-magic', 'Firbolg Magic', 'Detect Magic and Disguise Self, each once per Long Rest without a slot; your disguise can be up to 3 feet shorter or taller.', {
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Firbolg Magic')
    }),
    tr('hidden-step', 'Hidden Step', `Bonus Action: turn Invisible until the start of your next turn, or until you attack, roll damage or force a saving throw. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses
    }),
    powerfulBuild,
    tr('speech-of-beast-and-leaf', 'Speech of Beast and Leaf', 'Beasts and plants understand the gist of what you say (you don’t understand them back), and you have Advantage on Charisma checks to influence them.')
  ],
  spells: [
    { level: 1, spellId: 'detect-magic', note: ONCE },
    { level: 1, spellId: 'disguise-self', note: ONCE }
  ]
})

/* -------------------------------- Genasi -------------------------------- */

const genasiIntro = (element: string, flavor: string): string =>
  `Genasi are mortals with a trace of elemental blood. ${element} genasi ${flavor} MPMM presents the four genasi as separate species; this app lists them the same way.`

const airGenasi = species({
  id: 'mpmm-air-genasi',
  name: 'Air Genasi',
  summary: 'Genasi of the wind: 35-ft. Speed, Lightning resistance, endless breath, and Shocking Grasp, Feather Fall and Levitate.',
  intro: genasiIntro('Air', 'carry the restlessness of the sky: quick on their feet, they never run out of breath and can ride the wind.'),
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 35,
  darkvision: 60,
  tags: ['genasi'],
  traits: [
    darkvision(60, 'Air Genasi'),
    tr('unending-breath', 'Unending Breath', 'You can hold your breath indefinitely while you aren’t Incapacitated.'),
    tr('lightning-resistance', 'Lightning Resistance', 'Resistance to Lightning damage.', { effects: [resist('lightning', 'Air Genasi')] }),
    tr('mingle-with-the-wind', 'Mingle with the Wind', 'Shocking Grasp cantrip; Feather Fall from level 3 and Levitate from level 5, each once per Long Rest without a slot or material components.', {
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Mingle with the Wind')
    })
  ],
  spells: [
    { level: 1, spellId: 'shocking-grasp', note: 'Cantrip' },
    { level: 3, spellId: 'feather-fall', note: ONCE },
    { level: 5, spellId: 'levitate', note: ONCE }
  ]
})

const earthGenasi = species({
  id: 'mpmm-earth-genasi',
  name: 'Earth Genasi',
  summary: 'Genasi of stone: ignore earthy difficult terrain, Blade Ward as a Bonus Action, and Pass without Trace from level 3.',
  intro: genasiIntro('Earth', 'are steady as bedrock: rough ground doesn’t slow them, and they can harden their skin against blows.'),
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  darkvision: 60,
  tags: ['genasi'],
  traits: [
    darkvision(60, 'Earth Genasi'),
    tr('earth-walk', 'Earth Walk', 'Difficult terrain made of earth or stone costs you no extra movement when you use your walking Speed.'),
    tr('merge-with-stone', 'Merge with Stone', `You know Blade Ward and can cast it as a Bonus Action. ${PB_LR} From level 3, Pass without Trace once per Long Rest without a slot or material components.`, {
      activation: 'bonus',
      uses: pbUses,
      more: 'You can also cast Pass without Trace with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Merge with Stone')
    })
  ],
  spells: [
    { level: 1, spellId: 'blade-ward', note: 'Cantrip; also castable as a Bonus Action (Proficiency Bonus times per Long Rest)' },
    { level: 3, spellId: 'pass-without-trace', note: ONCE }
  ]
})

const fireGenasi = species({
  id: 'mpmm-fire-genasi',
  name: 'Fire Genasi',
  summary: 'Genasi of flame: Fire resistance, and Produce Flame, Burning Hands and Flame Blade.',
  intro: genasiIntro('Fire', 'burn with passion and temper; flame answers their call and doesn’t hurt them much.'),
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  darkvision: 60,
  tags: ['genasi'],
  traits: [
    darkvision(60, 'Fire Genasi'),
    tr('fire-resistance', 'Fire Resistance', 'Resistance to Fire damage.', { effects: [resist('fire', 'Fire Genasi')] }),
    tr('reach-to-the-blaze', 'Reach to the Blaze', 'Produce Flame cantrip; Burning Hands from level 3 and Flame Blade from level 5, each once per Long Rest without a slot or material components.', {
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Reach to the Blaze')
    })
  ],
  spells: [
    { level: 1, spellId: 'produce-flame', note: 'Cantrip' },
    { level: 3, spellId: 'burning-hands', note: ONCE },
    { level: 5, spellId: 'flame-blade', note: ONCE }
  ]
})

const waterGenasi = species({
  id: 'mpmm-water-genasi',
  name: 'Water Genasi',
  summary: 'Genasi of the sea: Swim Speed, breathe water, Acid resistance, and Acid Splash, Create or Destroy Water and Water Walk.',
  intro: genasiIntro('Water', 'are at home in the depths, as patient or as wild as the tides.'),
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  speedNote: 'Swim equal to your Speed',
  darkvision: 60,
  tags: ['genasi'],
  effects: [{ target: 'speed.swim', op: 'set', value: 'speed', note: 'Water Genasi swim speed' }],
  traits: [
    darkvision(60, 'Water Genasi'),
    tr('acid-resistance', 'Acid Resistance', 'Resistance to Acid damage.', { effects: [resist('acid', 'Water Genasi')] }),
    amphibious,
    tr('call-to-the-wave', 'Call to the Wave', 'Acid Splash cantrip; Create or Destroy Water from level 3 and Water Walk from level 5, each once per Long Rest without a slot or material components.', {
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Call to the Wave')
    })
  ],
  spells: [
    { level: 1, spellId: 'acid-splash', note: 'Cantrip' },
    { level: 3, spellId: 'create-or-destroy-water', note: ONCE },
    { level: 5, spellId: 'water-walk', note: ONCE }
  ]
})

/* --------------------------------- Gith --------------------------------- */

const githyanki = species({
  id: 'mpmm-githyanki',
  name: 'Githyanki',
  summary: 'Astral raiders with Psychic resistance, a daily borrowed skill and weapon/tool, and psionic Mage Hand, Jump and Misty Step.',
  intro: 'Githyanki are warriors of the Astral Plane, descendants of people who broke free of mind flayer rule. Their minds hold echoes of the Astral Sea, and their psionics push, leap and blink.',
  creatureType: 'Humanoid (gith)',
  size: 'Medium',
  speed: 30,
  tags: ['gith'],
  traits: [
    tr('astral-knowledge', 'Astral Knowledge', 'Each time you finish a Long Rest, gain proficiency in one skill and one weapon or tool of your choice until your next Long Rest.', {
      more: 'These change daily, so note them on the sheet yourself.'
    }),
    tr('githyanki-psionics', 'Githyanki Psionics', 'Mage Hand (the hand is invisible); Jump from level 3 and Misty Step from level 5, each once per Long Rest without a slot or components.', {
      more: 'You can also cast Jump and Misty Step with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Githyanki Psionics')
    }),
    psychicResilience
  ],
  spells: [
    { level: 1, spellId: 'mage-hand', note: 'Cantrip; the spectral hand is invisible' },
    { level: 3, spellId: 'jump', note: ONCE },
    { level: 5, spellId: 'misty-step', note: ONCE }
  ]
})

const githzerai = species({
  id: 'mpmm-githzerai',
  name: 'Githzerai',
  summary: 'Disciplined monastics of Limbo with Psychic resistance, Advantage against charm and fear, and psionic Mage Hand, Shield and Detect Thoughts.',
  intro: 'Githzerai split from their githyanki kin to pursue order and inner focus in the chaos of Limbo. Their trained minds resist manipulation, and their psionics guard and read others.',
  creatureType: 'Humanoid (gith)',
  size: 'Medium',
  speed: 30,
  tags: ['gith'],
  traits: [
    tr('githzerai-psionics', 'Githzerai Psionics', 'Mage Hand (the hand is invisible); Shield from level 3 and Detect Thoughts from level 5, each once per Long Rest without a slot or components.', {
      more: 'You can also cast Shield and Detect Thoughts with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Githzerai Psionics')
    }),
    tr('mental-discipline', 'Mental Discipline', 'Advantage on saves to avoid or end the Charmed or Frightened condition.', {
      effects: [vs('vsCharmed', 'Advantage vs Charmed (Mental Discipline)'), vs('vsFrightened', 'Advantage vs Frightened (Mental Discipline)')]
    }),
    psychicResilience
  ],
  spells: [
    { level: 1, spellId: 'mage-hand', note: 'Cantrip; the spectral hand is invisible' },
    { level: 3, spellId: 'shield', note: ONCE },
    { level: 5, spellId: 'detect-thoughts', note: ONCE }
  ]
})

/* ----------------------------- Goblinoids etc. ----------------------------- */

const goblin = species({
  id: 'mpmm-goblin',
  name: 'Goblin',
  summary: 'Small, slippery goblinoids: Darkvision, Fey Ancestry, extra damage against bigger foes and a Bonus Action Disengage or Hide.',
  intro: 'Goblins are small goblinoids with fey origins, survivors who get out of trouble fast and hit above their weight against larger enemies.',
  creatureType: 'Humanoid (goblinoid)',
  size: 'Small',
  speed: 30,
  darkvision: 60,
  tags: ['goblinoid'],
  traits: [
    darkvision(60, 'Goblin'),
    feyAncestry('Goblin'),
    tr('fury-of-the-small', 'Fury of the Small', `Once per turn, when you damage a larger creature with an attack or spell, add extra damage equal to your Proficiency Bonus. ${PB_LR}`, {
      activation: 'special',
      uses: pbUses,
      roll: { kind: 'damage', dice: 'prof' }
    }),
    tr('nimble-escape', 'Nimble Escape', 'You can take the Disengage or Hide action as a Bonus Action on each of your turns.', { activation: 'bonus' })
  ]
})

const harengon = species({
  id: 'mpmm-harengon',
  name: 'Harengon',
  summary: 'Rabbit-folk with lightning reflexes: Proficiency Bonus to Initiative, Perception, a lucky dodge and a long Bonus Action hop.',
  intro: 'Harengons are rabbit-like folk born of the Feywild’s wild places. They are quick to react, alert to danger and able to bound away from trouble.',
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  traits: [
    tr('hare-trigger', 'Hare-Trigger', 'Add your Proficiency Bonus to your Initiative rolls.', {
      effects: [{ target: 'initiative', op: 'set', value: 'prof', note: 'Hare-Trigger' }]
    }),
    tr('leporine-senses', 'Leporine Senses', 'Proficiency in the Perception skill.', { effects: [prof('perception', 'Leporine Senses')] }),
    tr('lucky-footwork', 'Lucky Footwork', 'Reaction when you fail a Dexterity saving throw: roll a d4 and add it to the save, possibly turning it into a success.', {
      activation: 'reaction',
      more: 'Not usable while you’re Prone or your Speed is 0.'
    }),
    tr('rabbit-hop', 'Rabbit Hop', `Bonus Action: jump a number of feet equal to 5 × your Proficiency Bonus without provoking Opportunity Attacks. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses,
      more: 'Only possible while your Speed is above 0.'
    })
  ]
})

const hobgoblin = species({
  id: 'mpmm-hobgoblin',
  name: 'Hobgoblin',
  summary: 'Disciplined goblinoids: Darkvision, Fey Ancestry, a Bonus Action Help with fey blessings, and a boost from nearby allies on a miss.',
  intro: 'Hobgoblins are goblinoids whose fey ancestry shows in their gift for teamwork. They lift up their allies and draw strength from the group when they falter.',
  creatureType: 'Humanoid (goblinoid)',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['goblinoid'],
  traits: [
    darkvision(60, 'Hobgoblin'),
    feyAncestry('Hobgoblin'),
    tr('fey-gift', 'Fey Gift', `Take the Help action as a Bonus Action. ${PB_LR} From level 3, each use also grants one extra benefit of your choice.`, {
      activation: 'bonus',
      uses: pbUses,
      description: `You can take the Help action as a Bonus Action. ${PB_LR}

From level 3, choose one extra benefit each time you use it:
- **Hospitality:** both of you gain Temporary Hit Points equal to 1d6 + your Proficiency Bonus.
- **Passage:** both of you get +10 feet walking Speed until your next turn starts.
- **Spite:** before your next turn starts, the first creature your ally hits with an attack roll suffers Disadvantage on its next attack roll made within 1 minute.`
    }),
    tr('fortune-from-the-many', 'Fortune from the Many', `When you miss an attack or fail an ability check or saving throw, add a bonus equal to the number of allies you can see within 30 feet (max +3). ${PB_LR}`, {
      activation: 'special',
      uses: pbUses
    })
  ]
})

const kenku = species({
  id: 'mpmm-kenku',
  name: 'Kenku',
  summary: 'Feathered mimics with two skills of choice, Advantage on demand with known skills, flawless sound mimicry and perfect copying.',
  intro: 'Kenku are flightless bird-folk with a gift for imitation and an uncanny memory. They echo voices and sounds perfectly and recall what they have seen in detail.',
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  traits: [
    tr('expert-duplication', 'Expert Duplication', 'Advantage on ability checks to make an exact copy of writing or craftwork, your own or someone else’s.'),
    tr('kenku-recall', 'Kenku Recall', `Proficiency in two skills of your choice. Before making a check with a skill you’re proficient in, you can give yourself Advantage. ${PB_LR}`, {
      activation: 'special',
      uses: pbUses,
      choices: skillChoice('Kenku Recall skills', 2)
    }),
    tr('mimicry', 'Mimicry', 'You can copy sounds and voices you have heard; a listener sees through it with a Wisdom (Insight) check against DC 8 + Proficiency Bonus + Charisma modifier.')
  ]
})

const KOBOLD_CRAFT: [SkillId, string][] = [
  ['arcana', 'Arcana'],
  ['investigation', 'Investigation'],
  ['medicine', 'Medicine'],
  ['sleightOfHand', 'Sleight of Hand'],
  ['survival', 'Survival']
]

const koboldLegacies: SpeciesOption[] = [
  ...KOBOLD_CRAFT.map(([skill, label]) => ({
    id: `kobold-craftiness-${skill.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
    name: `Craftiness (${label})`,
    summary: `Proficiency in ${label}.`,
    description: `Craftiness: you gain proficiency in one of Arcana, Investigation, Medicine, Sleight of Hand or Survival — here, ${label}.`,
    effects: [prof(skill, 'Kobold Legacy: Craftiness')]
  })),
  {
    id: 'kobold-defiance',
    name: 'Defiance',
    summary: 'Advantage on saves to avoid or end the Frightened condition.',
    description: 'Defiance: you have Advantage on saving throws to avoid or end the Frightened condition.',
    effects: [vs('vsFrightened', 'Advantage vs Frightened (Kobold Defiance)')]
  },
  {
    id: 'kobold-draconic-sorcery',
    name: 'Draconic Sorcery',
    summary: 'You know one cantrip of your choice from the Sorcerer spell list (Intelligence, Wisdom or Charisma).',
    description:
      'Draconic Sorcery: you learn one cantrip of your choice from the Sorcerer spell list, using Intelligence, Wisdom or Charisma (your choice) as the spellcasting ability. The app can’t offer this pick automatically yet — add the cantrip yourself on the Spells tab.'
  }
]

const kobold = species({
  id: 'mpmm-kobold',
  name: 'Kobold',
  summary: 'Small draconic tricksters: Darkvision, a Bonus Action cry that gives allies Advantage, and a Kobold Legacy (skill, fearlessness or a Sorcerer cantrip).',
  intro: 'Kobolds are small reptilian humanoids who feel a deep bond with dragons. They win by teamwork and cunning, and a kobold’s roar can rally allies against a shaken foe.',
  creatureType: 'Humanoid',
  size: 'Small',
  speed: 30,
  darkvision: 60,
  traits: [
    darkvision(60, 'Kobold'),
    tr('draconic-cry', 'Draconic Cry', `Bonus Action: roar at enemies within 10 feet; until the start of your next turn, you and your allies have Advantage on attack rolls against any of them who could hear you. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses
    }),
    tr('kobold-legacy', 'Kobold Legacy', 'Choose one legacy: Craftiness (a skill), Defiance (Advantage against fear) or Draconic Sorcery (a Sorcerer cantrip).', {
      more: 'Craftiness is split per skill in the Kobold Legacy picker so the proficiency is applied automatically.'
    })
  ],
  options: { label: 'Kobold Legacy', choices: koboldLegacies }
})

const lizardfolk = species({
  id: 'mpmm-lizardfolk',
  name: 'Lizardfolk',
  summary: 'Cold-blooded survivors: Swim Speed, natural armor (13 + Dex), a biting Bonus Action that grants Temporary Hit Points, and two nature skills.',
  intro: 'Lizardfolk are reptilian humanoids who see the world in practical terms of survival. Their scales protect them, their jaws are weapons, and they can stay underwater for a long time.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  speedNote: 'Swim equal to your Speed',
  effects: [{ target: 'speed.swim', op: 'set', value: 'speed', note: 'Lizardfolk swim speed' }],
  traits: [
    unarmed('bite', 'Bite', 'fanged jaws', 'Slashing'),
    tr('hold-breath', 'Hold Breath', 'You can hold your breath for up to 15 minutes.'),
    tr('hungry-jaws', 'Hungry Jaws', `Bonus Action: make a special Bite attack; on a hit you also gain Temporary Hit Points equal to your Proficiency Bonus. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses,
      roll: { kind: 'attack', attack: 'prof+mod.str', dice: '1d6+mod.str', damageType: 'slashing', melee: true }
    }),
    tr('natural-armor', 'Natural Armor', 'Without armor, your base AC is 13 + your Dexterity modifier (a Shield still adds its bonus).', {
      effects: [{ target: 'ac.unarmored', op: 'set', value: '13+dex', note: 'Lizardfolk Natural Armor' }]
    }),
    tr('natures-intuition', 'Nature’s Intuition', 'Proficiency in two of: Animal Handling, Medicine, Nature, Perception, Stealth, Survival.', {
      choices: skillChoice('Nature’s Intuition skills', 2, ['animalHandling', 'medicine', 'nature', 'perception', 'stealth', 'survival'])
    })
  ]
})

const minotaur = species({
  id: 'mpmm-minotaur',
  name: 'Minotaur',
  summary: 'Horned powerhouses: horn attacks, a Bonus Action gore after a Dash, a Bonus Action shove after a hit, and an unerring sense of direction.',
  intro: 'Minotaurs are bull-headed humanoids, strong and direct. They charge horns-first into battle, toss enemies aside and never lose their way in a maze.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  traits: [
    unarmed('horns', 'Horns', 'horns', 'Piercing'),
    tr('goring-rush', 'Goring Rush', 'Right after you take the Dash action and move at least 20 feet, you can make one Horns attack as a Bonus Action.', {
      activation: 'bonus',
      roll: { kind: 'attack', attack: 'prof+mod.str', dice: '1d6+mod.str', damageType: 'piercing', melee: true }
    }),
    tr('hammering-horns', 'Hammering Horns', 'Right after you hit with a melee attack as part of the Attack action, you can try to shove that target with your horns as a Bonus Action.', {
      activation: 'bonus',
      more: 'The target must be within 5 feet and no more than one size larger than you. It makes a Strength save (DC 8 + Proficiency Bonus + Strength modifier) or is pushed up to 10 feet away.',
      roll: { kind: 'save', save: 'str', dc: '8+prof+mod.str' }
    }),
    tr('labyrinthine-recall', 'Labyrinthine Recall', 'You always know which way is north, and you have Advantage on Wisdom (Survival) checks to navigate or track.', {
      effects: [vs('vsNavigateOrTrack', 'Advantage to navigate or track (Labyrinthine Recall)', 'skill.survival')]
    })
  ]
})

const satyr = species({
  id: 'mpmm-satyr',
  name: 'Satyr',
  summary: 'Goat-legged fey revelers: 35-ft. Speed, Magic Resistance, a head-butt, longer jumps, and Performance, Persuasion and an instrument.',
  intro: 'Satyrs are fey with the legs and horns of a goat, made for music, dancing and mischief. Their fey nature shields them from magic, and they bound around a fight with ease.',
  creatureType: 'Fey',
  size: 'Medium',
  speed: 35,
  traits: [
    unarmed('ram', 'Ram', 'head and horns', 'Bludgeoning'),
    magicResistance,
    tr('mirthful-leaps', 'Mirthful Leaps', 'Whenever you make a Long or High Jump, roll a d8 and add that many feet to the distance (even from a standstill); this uses movement as normal.'),
    tr('reveler', 'Reveler', 'Proficiency in Performance and Persuasion, and with one musical instrument of your choice.', {
      effects: [prof('performance', 'Satyr Reveler'), prof('persuasion', 'Satyr Reveler')],
      choices: [{ id: 'instrument', label: 'Reveler: musical instrument', count: 1, type: 'tool', filter: 'musical' }]
    })
  ]
})

/* --------------------------------- Elves --------------------------------- */

const seaElf = species({
  id: 'mpmm-sea-elf',
  name: 'Sea Elf',
  summary: 'Ocean-dwelling elves: Swim Speed, water breathing, Cold resistance, Perception, Trance and a way with sea creatures.',
  intro: 'Sea elves fell in love with the open sea long ago and made the ocean their home. They swim as easily as they walk and befriend the creatures of the deep.',
  creatureType: 'Humanoid (elf)',
  size: 'Medium',
  speed: 30,
  speedNote: 'Swim equal to your Speed',
  darkvision: 60,
  tags: ['elf'],
  traits: [
    tr('child-of-the-sea', 'Child of the Sea', 'Swim Speed equal to your walking Speed; you breathe air and water and have Resistance to Cold damage.', {
      effects: [{ target: 'speed.swim', op: 'set', value: 'speed', note: 'Child of the Sea' }, resist('cold', 'Child of the Sea')]
    }),
    darkvision(60, 'Sea Elf'),
    feyAncestry('Sea Elf'),
    tr('friend-of-the-sea', 'Friend of the Sea', 'You can share simple ideas with any Beast, Elemental or Monstrosity that has a Swim Speed; it understands you, but you don’t understand it.'),
    keenSenses('Sea Elf'),
    trance
  ]
})

const shadarKai = species({
  id: 'mpmm-shadar-kai',
  name: 'Shadar-kai',
  summary: 'Elves of the Shadowfell: Necrotic resistance, Perception, Trance, and a Bonus Action teleport that makes you resistant to all damage from level 3.',
  intro: 'Shadar-kai are elves bound to the Raven Queen and the gloom of the Shadowfell. Her blessing lets them step through shadow, briefly becoming ghostly and hard to hurt.',
  creatureType: 'Humanoid (elf)',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  tags: ['elf'],
  traits: [
    tr('blessing-of-the-raven-queen', 'Blessing of the Raven Queen', `Bonus Action: teleport up to 30 feet to an unoccupied space you can see. From level 3 you also have Resistance to all damage until the start of your next turn. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses
    }),
    darkvision(60, 'Shadar-kai'),
    feyAncestry('Shadar-kai'),
    keenSenses('Shadar-kai'),
    tr('necrotic-resistance', 'Necrotic Resistance', 'Resistance to Necrotic damage.', { effects: [resist('necrotic', 'Shadar-kai')] }),
    trance
  ]
})

/* -------------------------------- Shifter -------------------------------- */

const shifterOptions: SpeciesOption[] = [
  {
    id: 'shifter-beasthide',
    name: 'Beasthide',
    summary: 'When you shift: +1d6 extra Temporary Hit Points, and +1 AC while shifted.',
    description: 'Tough and stubborn. When you shift you gain an extra 1d6 Temporary Hit Points, and you have a +1 bonus to AC while shifted. (Turn on the “Shifted” state on the sheet to apply the AC.)',
    effects: [{ target: 'ac', op: 'add', value: 1, condition: 'shifted', note: 'Beasthide (while shifted)' }]
  },
  {
    id: 'shifter-longtooth',
    name: 'Longtooth',
    summary: 'While shifted: a Bonus Action fang unarmed strike for 1d6 + Strength modifier Piercing damage.',
    description: 'Fierce and aggressive. When you shift, and as a Bonus Action on your later turns while shifted, you can make an unarmed strike with your fangs that deals 1d6 + Strength modifier Piercing damage.'
  },
  {
    id: 'shifter-swiftstride',
    name: 'Swiftstride',
    summary: 'While shifted: +10 feet Speed, and a Reaction to move 10 feet when an enemy ends its turn next to you.',
    description: 'Graceful and quick. While shifted your walking Speed increases by 10 feet, and when a creature ends its turn within 5 feet of you, you can use your Reaction to move up to 10 feet without provoking Opportunity Attacks. (Turn on the “Shifted” state on the sheet to apply the Speed.)',
    effects: [{ target: 'speed', op: 'add', value: 10, condition: 'shifted', note: 'Swiftstride (while shifted)' }]
  },
  {
    id: 'shifter-wildhunt',
    name: 'Wildhunt',
    summary: 'While shifted: Advantage on Wisdom checks, and no creature within 30 feet can attack you with Advantage unless you’re Incapacitated.',
    description: 'Sharp-sensed hunters. While shifted you have Advantage on Wisdom checks, and no creature within 30 feet of you can make an attack roll with Advantage against you unless you have the Incapacitated condition. (Turn on the “Shifted” state on the sheet to apply the Advantage.)',
    effects: [{ target: 'check.wis', op: 'advantage', condition: 'shifted', note: 'Wildhunt (while shifted)' }]
  }
]

const shifter = species({
  id: 'mpmm-shifter',
  name: 'Shifter',
  summary: 'Lycanthrope-touched folk who briefly take on bestial traits: Darkvision, a wild skill, and Shifting with a Beasthide, Longtooth, Swiftstride or Wildhunt bonus.',
  intro: 'Shifters carry a trace of lycanthropy in their blood. They can’t fully change shape, but for a short while they become more beast than person, each according to their inner animal.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  darkvision: 60,
  traits: [
    tr('bestial-instincts', 'Bestial Instincts', 'Proficiency in one of: Acrobatics, Athletics, Intimidation, Survival.', {
      choices: skillChoice('Bestial Instincts skill', 1, ['acrobatics', 'athletics', 'intimidation', 'survival'])
    }),
    darkvision(60, 'Shifter'),
    tr('shifting', 'Shifting', `Bonus Action: shift for 1 minute, gaining Temporary Hit Points equal to 2 × your Proficiency Bonus plus your shifter option’s benefit. ${PB_LR}`, {
      activation: 'bonus',
      uses: pbUses,
      toggle: 'shifted',
      duration: 10,
      roll: { kind: 'temp', dice: '2*prof' },
      more: 'The shift ends early if you die or end it as a Bonus Action. Turn on the “Shifted” state on the sheet so your option’s bonuses apply.'
    })
  ],
  options: { label: 'Shifter Option', choices: shifterOptions }
})

const tabaxi = species({
  id: 'mpmm-tabaxi',
  name: 'Tabaxi',
  summary: 'Curious cat-folk: Climb Speed, claws, Darkvision, Perception and Stealth, and bursts of double Speed.',
  intro: 'Tabaxi are feline humanoids driven by curiosity and wanderlust. They climb with ease, move silently and can put on a sudden burst of speed.',
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  speedNote: 'Climb equal to your Speed',
  darkvision: 60,
  traits: [
    tr('cats-claws', 'Cat’s Claws', 'Climb Speed equal to your walking Speed; your claws make unarmed strikes for 1d6 + Strength modifier Slashing damage.', {
      effects: [{ target: 'speed.climb', op: 'set', value: 'speed', note: 'Cat’s Claws' }],
      more: 'The app’s Unarmed Strike line still shows the generic damage — use 1d6 instead.'
    }),
    tr('cats-talent', 'Cat’s Talent', 'Proficiency in Perception and Stealth.', {
      effects: [prof('perception', 'Cat’s Talent'), prof('stealth', 'Cat’s Talent')]
    }),
    darkvision(60, 'Tabaxi'),
    tr('feline-agility', 'Feline Agility', 'When you move on your turn in combat, you can double your Speed until the end of that turn; you can do it again after a turn in which you move 0 feet.', {
      activation: 'special'
    })
  ]
})

const tortle = species({
  id: 'mpmm-tortle',
  name: 'Tortle',
  summary: 'Shelled wanderers: base AC 17 from the shell (no armor), claws, long breath-holding, a nature skill and a protective Shell Defense.',
  intro: 'Tortles are turtle-like humanoids who carry their home on their backs and roam coasts and wilds. Their shell is armor enough, and they can retreat into it when things get rough.',
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  traits: [
    unarmed('claws', 'Claws', 'claws', 'Slashing'),
    tr('hold-breath', 'Hold Breath', 'You can hold your breath for up to 1 hour.'),
    tr('natural-armor', 'Natural Armor', 'Your shell gives you a base AC of 17 that ignores Dexterity; you can’t wear Light, Medium or Heavy armor, but a Shield works normally.', {
      effects: [{ target: 'ac.unarmored', op: 'set', value: '17', note: 'Tortle Natural Armor (base AC 17)' }]
    }),
    tr('natures-intuition', 'Nature’s Intuition', 'Proficiency in one of: Animal Handling, Medicine, Nature, Perception, Stealth, Survival.', {
      choices: skillChoice('Nature’s Intuition skill', 1, ['animalHandling', 'medicine', 'nature', 'perception', 'stealth', 'survival'])
    }),
    tr('shell-defense', 'Shell Defense', 'Action: withdraw into your shell for +4 AC and Advantage on Strength and Constitution saves; emerge with a Bonus Action.', {
      activation: 'action',
      toggle: 'shellDefense',
      more: 'While inside you are Prone, your Speed is 0, you have Disadvantage on Dexterity saves, you can’t take Reactions, and the only action you can take is the Bonus Action to come out. Turn on the “Shell Defense” state on the sheet to apply the AC and saves.',
      effects: [
        { target: 'ac', op: 'add', value: 4, condition: 'shellDefense', note: 'Shell Defense' },
        { target: 'save.str', op: 'advantage', condition: 'shellDefense', note: 'Shell Defense' },
        { target: 'save.con', op: 'advantage', condition: 'shellDefense', note: 'Shell Defense' }
      ]
    })
  ]
})

const triton = species({
  id: 'mpmm-triton',
  name: 'Triton',
  summary: 'Guardians of the deep: Swim Speed, water breathing, Cold resistance, and Fog Cloud, Gust of Wind and Water Walk.',
  intro: 'Tritons are sea folk who long guarded the ocean depths against elemental threats. They command a little of the wind and waves and speak with sea creatures.',
  creatureType: 'Humanoid',
  size: 'Medium',
  speed: 30,
  speedNote: 'Swim 30 feet',
  darkvision: 60,
  effects: [{ target: 'speed.swim', op: 'set', value: 30, note: 'Triton swim speed' }],
  traits: [
    amphibious,
    tr('control-air-and-water', 'Control Air and Water', 'Fog Cloud; Gust of Wind from level 3 and Water Walk from level 5 — each once per Long Rest without a slot.', {
      more: 'You can also cast them with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Control Air and Water')
    }),
    darkvision(60, 'Triton'),
    tr('emissary-of-the-sea', 'Emissary of the Sea', 'You can share simple ideas with Beasts, Elementals and Monstrosities that have a Swim Speed; they understand you, but you don’t understand them.'),
    tr('guardian-of-the-depths', 'Guardian of the Depths', 'Resistance to Cold damage.', { effects: [resist('cold', 'Guardian of the Depths')] })
  ],
  spells: [
    { level: 1, spellId: 'fog-cloud', note: ONCE },
    { level: 3, spellId: 'gust-of-wind', note: ONCE },
    { level: 5, spellId: 'water-walk', note: ONCE }
  ]
})

const yuanTi = species({
  id: 'mpmm-yuan-ti',
  name: 'Yuan-ti',
  summary: 'Serpent-blooded humanoids: Darkvision, Magic Resistance, Poison resistance, and Poison Spray, snake-only Animal Friendship and Suggestion.',
  intro: 'Yuan-ti are descendants of humans transformed by serpent gods, often marked by scales or serpentine eyes. Their blood resists poison and magic, and they speak easily with snakes.',
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  darkvision: 60,
  traits: [
    darkvision(60, 'Yuan-ti'),
    magicResistance,
    tr('poison-resilience', 'Poison Resilience', 'Resistance to Poison damage and Advantage on saves to avoid or end the Poisoned condition.', {
      effects: [resist('poison', 'Poison Resilience'), vs('vsPoisoned', 'Advantage on saves to avoid or end Poisoned (Poison Resilience)')]
    }),
    tr('serpentine-spellcasting', 'Serpentine Spellcasting', 'Poison Spray cantrip; Animal Friendship at will on snakes only; Suggestion from level 3 once per Long Rest without a slot.', {
      more: 'You can also cast Suggestion with spell slots. Choose Intelligence, Wisdom or Charisma as the spellcasting ability.',
      choices: castAbility('Serpentine Spellcasting')
    })
  ],
  spells: [
    { level: 1, spellId: 'poison-spray', note: 'Cantrip' },
    { level: 1, spellId: 'animal-friendship', note: 'Unlimited casts with this trait, but only targeting snakes' },
    { level: 3, spellId: 'suggestion', note: ONCE }
  ]
})

export const mpmmSpecies: SpeciesDef[] = [
  aarakocra,
  bugbear,
  centaur,
  changeling,
  deepGnome,
  duergar,
  eladrin,
  fairy,
  firbolg,
  airGenasi,
  earthGenasi,
  fireGenasi,
  waterGenasi,
  githyanki,
  githzerai,
  goblin,
  harengon,
  hobgoblin,
  kenku,
  kobold,
  lizardfolk,
  minotaur,
  satyr,
  seaElf,
  shadarKai,
  shifter,
  tabaxi,
  tortle,
  triton,
  yuanTi
]

/** 2024 Player's Handbook species also in MPMM — use the 2024 versions instead */
export const MPMM_SKIPPED_SPECIES = ['Aasimar', 'Goliath', 'Orc'] as const
