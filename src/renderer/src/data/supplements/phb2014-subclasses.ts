import type { ClassOptionGroup, Effect, Feature, SubclassDef } from '../../types'
import { ft } from './tasha-subclasses'

/**
 * Subclasses from the 2014 Player's Handbook that have no 2024 counterpart.
 * Not open-licensed: only names, game-mechanical facts and terse summaries in our own words.
 *
 * Adapted to the 2024 classes: subclasses start at level 3, so 2014 features from levels 1–2 arrive
 * at level 3. Domain spells become always-prepared spells at Cleric levels 3/5/7/9. The 2014 cleric
 * level-8 Divine Strike / Potent Spellcasting is omitted (the 2024 Blessed Strikes replaces it).
 * 2014 ki points are the 2024 Monk's Focus Points.
 */

export const PHB14 = "Player's Handbook (2014)"

export function sub14(o: Omit<SubclassDef, 'kind' | 'source' | 'sourceBook'>): SubclassDef {
  return {
    ...o,
    kind: 'subclass',
    source: 'Supplement',
    sourceBook: PHB14,
    tags: ['supplement', 'phb2014', ...(o.tags ?? [])]
  }
}

const ADAPT = '*2024 conversion: 2014 features from levels 1–2 arrive at level 3. Own-words summary; see the 2014 Player’s Handbook for the full text.*'
const ADAPT_CLERIC =
  '*2024 conversion: level 1–2 features arrive at level 3 and domain spells are always prepared. The 2014 level-8 Divine Strike/Potent Spellcasting is omitted because 2024 Blessed Strikes replaces it. Own-words summary; see the 2014 Player’s Handbook.*'

const spellsFeature = (id: string, name: string, table: [number, string][]): Feature =>
  ft(id, name, 3, 'Domain spells are always prepared from the Cleric levels shown and don’t count against your prepared spells.', {
    description: `Always prepared; they don’t count against your prepared spells.\n\n| Cleric level | Spells |\n|---|---|\n${table.map(([l, s]) => `| ${l} | ${s} |`).join('\n')}`
  })

const res = (value: string, note: string, condition?: string): Effect => ({ target: 'resistance', op: 'grant', value, note, ...(condition ? { condition } : {}) })

/* ============================== Barbarian ============================== */

const TOTEM = ['Totem Spirit', 'Aspect of the Beast', 'Totemic Attunement'] as const

const pathOfTheTotemWarrior = sub14({
  id: 'phb14-path-of-the-totem-warrior',
  name: 'Path of the Totem Warrior',
  classId: 'barbarian',
  summary: 'A barbarian who picks a Bear, Eagle or Wolf benefit at levels 3, 6 and 14 (mix freely) and casts a few nature rituals.',
  description: `Choose Bear, Eagle or Wolf separately at levels 3, 6 and 14. Ritual spells come from Spirit Seeker (3) and Spirit Walker (10).\n\n${ADAPT}`,
  features: [
    ft('phb14-totem-spirit-seeker', 'Spirit Seeker', 3, 'You can cast Beast Sense and Speak with Animals, as rituals only.'),
    ft('phb14-totem-spirit', 'Totem Spirit', 3, 'Choose Bear, Eagle or Wolf; its benefit applies while you rage.', {
      choices: [{ id: 'phb14-totem-spirit-choice', label: 'Totem Spirit (level 3)', count: 1, type: 'option', filter: TOTEM[0] }]
    }),
    ft('phb14-totem-aspect', 'Aspect of the Beast', 6, 'Choose Bear, Eagle or Wolf for an always-on utility benefit.', {
      choices: [{ id: 'phb14-totem-aspect-choice', label: 'Aspect of the Beast (level 6)', count: 1, type: 'option', filter: TOTEM[1] }]
    }),
    ft('phb14-totem-spirit-walker', 'Spirit Walker', 10, 'You can cast Commune with Nature, as a ritual only.'),
    ft('phb14-totem-attunement', 'Totemic Attunement', 14, 'Choose Bear, Eagle or Wolf for a stronger benefit while you rage.', {
      choices: [{ id: 'phb14-totem-attunement-choice', label: 'Totemic Attunement (level 14)', count: 1, type: 'option', filter: TOTEM[2] }]
    })
  ]
})

const totemItem = (id: string, name: string, level: number, summary: string, extra: Partial<Feature> = {}): ClassOptionGroup['items'][number] => ({
  id,
  name,
  level,
  summary,
  description: `${summary}\n\n*Path of the Totem Warrior, level ${level}. Own-words summary; see the 2014 Player’s Handbook.*`,
  prerequisite: `Level ${level}+ Path of the Totem Warrior`,
  activation: 'passive',
  source: 'Supplement',
  ...extra
})

const BEAR_RES = ['acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'radiant', 'thunder']

export const phb14TotemOptions: ClassOptionGroup[] = [
  {
    classId: 'barbarian',
    group: TOTEM[0],
    source: 'Supplement',
    items: [
      totemItem('phb14-totem-spirit-bear', 'Bear Spirit', 3, 'While raging, you have Resistance to every damage type except psychic.', {
        effects: BEAR_RES.map((d) => res(d, 'Totem Spirit: Bear', 'raging'))
      }),
      totemItem('phb14-totem-spirit-eagle', 'Eagle Spirit', 3, 'While raging without Heavy armor, Opportunity Attacks against you have Disadvantage, and you can Dash as a Bonus Action.', { activation: 'bonus' }),
      totemItem('phb14-totem-spirit-wolf', 'Wolf Spirit', 3, 'While raging, your allies have Advantage on melee attack rolls against enemies within 5 feet of you.')
    ]
  },
  {
    classId: 'barbarian',
    group: TOTEM[1],
    source: 'Supplement',
    items: [
      totemItem('phb14-totem-aspect-bear', 'Bear Aspect', 6, 'Your carrying capacity doubles, and you have Advantage on Strength checks to push, pull, lift or break things.'),
      totemItem('phb14-totem-aspect-eagle', 'Eagle Aspect', 6, 'You see clearly up to 1 mile away, and Dim Light doesn’t give Disadvantage on your Wisdom (Perception) checks.'),
      totemItem('phb14-totem-aspect-wolf', 'Wolf Aspect', 6, 'You can track at a fast pace and move stealthily at a normal pace.')
    ]
  },
  {
    classId: 'barbarian',
    group: TOTEM[2],
    source: 'Supplement',
    items: [
      totemItem('phb14-totem-attunement-bear', 'Bear Attunement', 14, 'While raging, enemies within 5 feet of you have Disadvantage on attacks against anyone but you (not if they can’t see or hear you or can’t be Frightened).'),
      totemItem('phb14-totem-attunement-eagle', 'Eagle Attunement', 14, 'While raging, you have a Fly Speed equal to your Speed; you fall if you end your turn in the air.', {
        effects: [{ target: 'speed.fly', op: 'set', value: 'speed', condition: 'raging', note: 'Totemic Attunement: Eagle' }]
      }),
      totemItem('phb14-totem-attunement-wolf', 'Wolf Attunement', 14, 'While raging, after you hit a Large or smaller creature with a melee weapon attack, you can knock it Prone as a Bonus Action.', { activation: 'bonus' })
    ]
  }
]

/* =============================== Cleric =============================== */

const natureDomain = sub14({
  id: 'phb14-nature-domain',
  name: 'Nature Domain',
  classId: 'cleric',
  summary: 'A cleric of the wilds with Heavy armor, a Druid cantrip, a Channel Divinity that charms beasts and plants, and elemental warding.',
  description: ADAPT_CLERIC,
  alwaysPrepared: [
    { level: 3, spells: ['animal-friendship', 'speak-with-animals', 'barkskin', 'spike-growth'] },
    { level: 5, spells: ['plant-growth', 'wind-wall'] },
    { level: 7, spells: ['dominate-beast', 'grasping-vine'] },
    { level: 9, spells: ['insect-plague', 'tree-stride'] }
  ],
  features: [
    spellsFeature('phb14-nature-domain-spells', 'Nature Domain Spells', [
      [3, 'Animal Friendship, Speak with Animals, Barkskin, Spike Growth'], [5, 'Plant Growth, Wind Wall'], [7, 'Dominate Beast, Grasping Vine'], [9, 'Insect Plague, Tree Stride']
    ]),
    ft('phb14-nature-acolyte', 'Acolyte of Nature', 3, 'Learn one Druid cantrip (counts as a Cleric spell for you) and gain proficiency in Animal Handling, Nature or Survival.', {
      more: 'Add the cantrip on the Spells tab as a manual spell.',
      choices: [
        { id: 'phb14-nature-acolyte-cantrip', label: 'Druid cantrip', count: 1, type: 'cantrip', filter: 'druid' },
        { id: 'phb14-nature-acolyte-skill', label: 'Acolyte of Nature skill', count: 1, type: 'skill', options: ['animalHandling', 'nature', 'survival'] }
      ]
    }),
    ft('phb14-nature-heavy-armor', 'Bonus Proficiency', 3, 'You gain training with Heavy armor.', {
      effects: [{ target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Nature Domain' }]
    }),
    ft('phb14-nature-charm', 'Channel Divinity: Charm Animals and Plants', 3, 'Magic action, one Channel Divinity use: each Beast or Plant creature of your choice within 30 feet makes a Wisdom save or is Charmed by you for 1 minute or until it takes damage.', {
      activation: 'action',
      roll: { kind: 'save', save: 'wis', dc: '8+prof+mod.wis' }
    }),
    ft('phb14-nature-dampen-elements', 'Dampen Elements', 6, 'Reaction when you or a creature within 30 feet takes acid, cold, fire, lightning or thunder damage: grant Resistance to that instance.', { activation: 'reaction' }),
    ft('phb14-nature-master', 'Master of Nature', 17, 'Bonus Action: give verbal commands to creatures charmed by your Charm Animals and Plants; they obey on their next turn.', { activation: 'bonus' })
  ]
})

const tempestDomain = sub14({
  id: 'phb14-tempest-domain',
  name: 'Tempest Domain',
  classId: 'cleric',
  summary: 'A storm cleric with martial weapons and Heavy armor who shocks attackers, maximizes lightning and thunder damage and later flies outdoors.',
  description: ADAPT_CLERIC,
  alwaysPrepared: [
    { level: 3, spells: ['fog-cloud', 'thunderwave', 'gust-of-wind', 'shatter'] },
    { level: 5, spells: ['call-lightning', 'sleet-storm'] },
    { level: 7, spells: ['control-water', 'ice-storm'] },
    { level: 9, spells: ['destructive-wave', 'insect-plague'] }
  ],
  features: [
    spellsFeature('phb14-tempest-domain-spells', 'Tempest Domain Spells', [
      [3, 'Fog Cloud, Thunderwave, Gust of Wind, Shatter'], [5, 'Call Lightning, Sleet Storm'], [7, 'Control Water, Ice Storm'], [9, 'Destructive Wave, Insect Plague']
    ]),
    ft('phb14-tempest-proficiencies', 'Bonus Proficiencies', 3, 'You gain proficiency with Martial weapons and training with Heavy armor.', {
      effects: [
        { target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Tempest Domain' },
        { target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Tempest Domain' }
      ]
    }),
    ft('phb14-tempest-wrath', 'Wrath of the Storm', 3, 'Reaction when a creature within 5 feet hits you: it makes a Dexterity save, taking 2d8 lightning or thunder damage (your choice) on a fail, half on a success.', {
      activation: 'reaction',
      uses: { count: 'mod.wis', recharge: 'long' },
      roll: { kind: 'save', save: 'dex', dc: '8+prof+mod.wis', dice: '2d8', damageType: 'lightning' }
    }),
    ft('phb14-tempest-destructive-wrath', 'Channel Divinity: Destructive Wrath', 3, 'When you roll lightning or thunder damage, spend one Channel Divinity use to deal the maximum instead of rolling.', { activation: 'special' }),
    ft('phb14-tempest-thunderbolt', 'Thunderbolt Strike', 6, 'When you deal lightning damage to a Large or smaller creature, you can push it up to 10 feet away from you.', { activation: 'special' }),
    ft('phb14-tempest-stormborn', 'Stormborn', 17, 'You have a Fly Speed equal to your Speed whenever you are not underground or indoors.', {
      toggle: 'stormborn',
      effects: [{ target: 'speed.fly', op: 'set', value: 'speed', condition: 'stormborn', note: 'Stormborn (outdoors)' }]
    })
  ]
})

/* ================================ Monk ================================ */

const DISC_NOTE = 'Spell disciplines use your Focus save DC; each extra Focus Point raises the spell’s level by 1. Max Focus Points on one discipline: 2 (levels 3–4), 3 (5–8), 4 (9–12), 5 (13–16), 6 (17+).'
const DISC_3 = ['Fangs of the Fire Snake', 'Fist of Four Thunders', 'Fist of Unbroken Air', 'Rush of the Gale Spirits', 'Shape the Flowing River', 'Sweeping Cinder Strike', 'Water Whip']
const DISC_6 = [...DISC_3, 'Clench of the North Wind', 'Gong of the Summit']
const DISC_11 = [...DISC_6, 'Eternal Mountain Defense', 'Flames of the Phoenix', 'Mist Stance', 'Ride the Wind']
const DISC_17 = [...DISC_11, 'Breath of Winter', 'River of Hungry Flame', 'Wave of Rolling Earth']

const wayOfTheFourElements = sub14({
  id: 'phb14-way-of-the-four-elements',
  name: 'Way of the Four Elements',
  classId: 'monk',
  summary: 'A monk who spends Focus Points on elemental disciplines, most of which cast a spell such as Burning Hands, Shatter or Fireball.',
  description: `You learn Elemental Attunement plus one discipline at level 3 and one more at levels 6, 11 and 17; when you learn one you may swap a known discipline. 2014 ki points are Focus Points.\n\n${ADAPT}`,
  features: [
    ft('phb14-four-elements-attunement', 'Elemental Attunement', 3, 'Magic action: make a harmless elemental effect, light or snuff a small flame, chill or warm up to 1 lb of nonliving material for 1 hour, or shape a 1-foot cube of earth, fire, water or mist for 1 minute.', {
      activation: 'action'
    }),
    ft('phb14-four-elements-disciplines', 'Disciplines of the Elements', 3, 'Learn one elemental discipline; each costs Focus Points to use.', {
      activation: 'special',
      description: `Learn one discipline now (one more at levels 6, 11 and 17). ${DISC_NOTE}\n\n- **Fangs of the Fire Snake** (1 FP): this turn your Unarmed Strikes reach 10 feet and deal fire damage; 1 more FP adds 1d10 fire on a hit.\n- **Fist of Four Thunders** (2): Thunderwave.\n- **Fist of Unbroken Air** (2): action, a creature within 30 feet makes a Str save: 3d10 bludgeoning (+1d10 per extra FP), pushed 20 feet and Prone; half only on a success.\n- **Rush of the Gale Spirits** (2): Gust of Wind.\n- **Shape the Flowing River** (1): action, shape, freeze or thaw water or ice in a 30-foot cube within 120 feet.\n- **Sweeping Cinder Strike** (2): Burning Hands.\n- **Water Whip** (2): a creature within 30 feet makes a Dex save: 3d10 bludgeoning (+1d10 per extra FP) and pulled 25 feet or knocked Prone; half only on a success.`,
      choices: [{ id: 'phb14-four-elements-disc-3', label: 'Elemental discipline (level 3)', count: 1, type: 'option', options: DISC_3 }]
    }),
    ft('phb14-four-elements-disc-6', 'Elemental Discipline (Level 6)', 6, 'Learn one more discipline; two new ones are available.', {
      activation: 'special',
      description: `Learn one more discipline. ${DISC_NOTE}\n\n- **Clench of the North Wind** (3 FP): Hold Person.\n- **Gong of the Summit** (3): Shatter.`,
      choices: [{ id: 'phb14-four-elements-disc-6-choice', label: 'Elemental discipline (level 6)', count: 1, type: 'option', options: DISC_6 }]
    }),
    ft('phb14-four-elements-disc-11', 'Elemental Discipline (Level 11)', 11, 'Learn one more discipline; four new ones are available.', {
      activation: 'special',
      description: `Learn one more discipline. ${DISC_NOTE}\n\n- **Eternal Mountain Defense** (5 FP): Stoneskin on yourself.\n- **Flames of the Phoenix** (4): Fireball.\n- **Mist Stance** (4): Gaseous Form on yourself.\n- **Ride the Wind** (4): Fly on yourself.`,
      choices: [{ id: 'phb14-four-elements-disc-11-choice', label: 'Elemental discipline (level 11)', count: 1, type: 'option', options: DISC_11 }]
    }),
    ft('phb14-four-elements-disc-17', 'Elemental Discipline (Level 17)', 17, 'Learn one more discipline; three new ones are available.', {
      activation: 'special',
      description: `Learn one more discipline. ${DISC_NOTE}\n\n- **Breath of Winter** (6 FP): Cone of Cold.\n- **River of Hungry Flame** (5): Wall of Fire.\n- **Wave of Rolling Earth** (6): Wall of Stone.`,
      choices: [{ id: 'phb14-four-elements-disc-17-choice', label: 'Elemental discipline (level 17)', count: 1, type: 'option', options: DISC_17 }]
    })
  ]
})

/* =============================== Wizard =============================== */

const savant = (id: string, school: string): Feature =>
  ft(id, `${school} Savant`, 3, `Copying ${school} spells into your spellbook costs half the usual gold and time.`)

const schoolOfConjuration = sub14({
  id: 'phb14-school-of-conjuration',
  name: 'School of Conjuration',
  classId: 'wizard',
  summary: 'A wizard who conjures small objects, teleports short distances and keeps concentration and summons sturdy.',
  description: ADAPT,
  features: [
    savant('phb14-conjuration-savant', 'Conjuration'),
    ft('phb14-conjuration-minor', 'Minor Conjuration', 3, 'Magic action: create a nonmagical object up to 3 feet on a side and 10 lb within 10 feet; it lasts 1 hour or until it takes damage or you use this again.', { activation: 'action' }),
    ft('phb14-conjuration-transposition', 'Benign Transposition', 6, 'Magic action: teleport up to 30 feet, or swap places with a willing Small or Medium creature within 30 feet. Regained on a Long Rest or when you cast a level 1+ Conjuration spell.', {
      activation: 'action',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('phb14-conjuration-focused', 'Focused Conjuration', 10, 'Taking damage can’t break your Concentration on a Conjuration spell.'),
    ft('phb14-conjuration-durable', 'Durable Summons', 14, 'Creatures you summon or create with a Conjuration spell gain 30 Temporary Hit Points.')
  ]
})

const schoolOfEnchantment = sub14({
  id: 'phb14-school-of-enchantment',
  name: 'School of Enchantment',
  classId: 'wizard',
  summary: 'A wizard who stuns with a hypnotic gaze, redirects attacks, splits enchantments between two targets and edits memories.',
  description: ADAPT,
  features: [
    savant('phb14-enchantment-savant', 'Enchantment'),
    ft('phb14-enchantment-gaze', 'Hypnotic Gaze', 3, 'Magic action: a creature within 5 feet that sees or hears you makes a Wisdom save or is Charmed, Incapacitated and at Speed 0 until the end of your next turn; spend an action each turn to extend it.', {
      activation: 'action',
      more: 'Ends if you move more than 5 feet away, it can’t see or hear you, or it takes damage. A creature that succeeds is immune until your next Long Rest.',
      roll: { kind: 'save', save: 'wis', dc: '8+prof+mod.int' }
    }),
    ft('phb14-enchantment-instinctive', 'Instinctive Charm', 6, 'Reaction when a creature within 30 feet attacks you: it makes a Wisdom save or must target the nearest other creature instead (or waste the attack). A success makes it immune until your Long Rest.', {
      activation: 'reaction',
      roll: { kind: 'save', save: 'wis', dc: '8+prof+mod.int' }
    }),
    ft('phb14-enchantment-split', 'Split Enchantment', 10, 'An Enchantment spell of level 1+ that targets one creature can target a second creature.'),
    ft('phb14-enchantment-alter-memories', 'Alter Memories', 14, 'A creature you charm with an Enchantment spell can be left unaware of it; as an action before the spell ends, it makes an Intelligence save or forgets up to 1 + your Charisma modifier hours.', {
      activation: 'action',
      roll: { kind: 'save', save: 'int', dc: '8+prof+mod.int' }
    })
  ]
})

const schoolOfNecromancy = sub14({
  id: 'phb14-school-of-necromancy',
  name: 'School of Necromancy',
  classId: 'wizard',
  summary: 'A wizard who heals by killing with spells, raises tougher undead, resists necrotic damage and can seize control of undead.',
  description: ADAPT,
  features: [
    savant('phb14-necromancy-savant', 'Necromancy'),
    ft('phb14-necromancy-grim-harvest', 'Grim Harvest', 3, 'Once per turn, when a level 1+ spell kills a creature (not a Construct or Undead), regain Hit Points equal to twice the spell’s level, or three times for a Necromancy spell.', { activation: 'special' }),
    ft('phb14-necromancy-thralls', 'Undead Thralls', 6, 'Animate Dead is added to your spellbook and raises one extra corpse. Undead you create with Necromancy spells add your Wizard level to their Hit Point maximum and your Proficiency Bonus to weapon damage.'),
    ft('phb14-necromancy-inured', 'Inured to Undeath', 10, 'You have Resistance to necrotic damage, and your Hit Point maximum can’t be reduced.', {
      effects: [res('necrotic', 'Inured to Undeath')]
    }),
    ft('phb14-necromancy-command', 'Command Undead', 14, 'Magic action: an Undead within 60 feet makes a Charisma save or obeys you indefinitely. Intelligence 8+ gives it Advantage; Intelligence 12+ lets it repeat the save every hour.', {
      activation: 'action',
      roll: { kind: 'save', save: 'cha', dc: '8+prof+mod.int' }
    })
  ]
})

const schoolOfTransmutation = sub14({
  id: 'phb14-school-of-transmutation',
  name: 'School of Transmutation',
  classId: 'wizard',
  summary: 'A wizard who swaps base materials, crafts a Transmuter’s Stone, turns into a beast and can spend the stone on a major transformation.',
  description: ADAPT,
  features: [
    savant('phb14-transmutation-savant', 'Transmutation'),
    ft('phb14-transmutation-minor-alchemy', 'Minor Alchemy', 3, 'Over 10 minutes per cubic foot, change an object of wood, stone, iron, copper or silver into another of those materials for 1 hour (while you concentrate).', { activation: 'special' }),
    ft('phb14-transmutation-stone', 'Transmuter’s Stone', 6, 'Spend 8 hours to make a stone that gives its holder one benefit; you can change it when you cast a level 1+ Transmutation spell. Only one stone at a time.', {
      more: 'Benefits: Darkvision 60 feet; +10 feet Speed while unencumbered; proficiency in Constitution saves; or Resistance to acid, cold, fire, lightning or thunder (pick one).',
      choices: [{ id: 'phb14-transmutation-stone-benefit', label: 'Transmuter’s Stone benefit', count: 1, type: 'option', options: ['Darkvision 60 ft', 'Speed +10 ft', 'Constitution save proficiency', 'Resistance (acid, cold, fire, lightning or thunder)'] }]
    }),
    ft('phb14-transmutation-shapechanger', 'Shapechanger', 10, 'Polymorph is added to your spellbook; cast it without a slot to turn only yourself into a Beast of CR 1 or lower.', {
      activation: 'action',
      uses: { count: 1, recharge: 'shortOrLong' }
    }),
    ft('phb14-transmutation-master', 'Master Transmuter', 14, 'Magic action, destroying your stone: transform a nonmagical object up to a 5-foot cube; cure a touched creature of curses, diseases and poison and restore all its Hit Points; cast Raise Dead without a slot; or cut a creature’s apparent age by 3d10 years.', {
      activation: 'action',
      uses: { count: 1, recharge: 'long' }
    })
  ]
})

export const phb2014Subclasses: SubclassDef[] = [
  pathOfTheTotemWarrior,
  natureDomain,
  tempestDomain,
  wayOfTheFourElements,
  schoolOfConjuration,
  schoolOfEnchantment,
  schoolOfNecromancy,
  schoolOfTransmutation
]
