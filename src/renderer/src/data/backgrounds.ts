// Backgrounds. 'SRD 5.2' entries reproduce SRD 5.2.1 text (CC-BY-4.0).
// 'PHB 2024' entries contain only mechanics plus short summaries written in our own words.
import type { BackgroundDef } from '../types'

const SRD = 'SRD 5.2' as const
const PHB = 'PHB 2024' as const

const gp50 = { label: 'B', items: [], gp: 50 }

export const backgrounds: BackgroundDef[] = [
  /* ---------------------------- SRD 5.2 ---------------------------- */
  {
    id: 'acolyte',
    name: 'Acolyte',
    kind: 'background',
    source: SRD,
    summary: 'You devoted yourself to service in a temple. Insight and Religion, Calligrapher’s Supplies, and Magic Initiate (Cleric).',
    description: `**Ability Scores:** Intelligence, Wisdom, Charisma
**Feat:** Magic Initiate (Cleric) (see “Feats”)
**Skill Proficiencies:** Insight and Religion
**Tool Proficiency:** Calligrapher’s Supplies
**Equipment:** *Choose A or B:* (A) Calligrapher’s Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP; or (B) 50 GP`,
    tags: ['magic-initiate:cleric'],
    abilityScores: ['int', 'wis', 'cha'],
    originFeat: 'magic-initiate',
    skills: ['insight', 'religion'],
    tool: 'calligraphers-supplies',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'calligraphers-supplies' },
          { id: 'book', name: 'Book (prayers)' },
          { id: 'holy-symbol' },
          { id: 'parchment', qty: 10 },
          { id: 'robe' }
        ],
        gp: 8
      },
      gp50
    ]
  },
  {
    id: 'criminal',
    name: 'Criminal',
    kind: 'background',
    source: SRD,
    summary: 'You made a living outside the law. Sleight of Hand and Stealth, Thieves’ Tools, and the Alert feat.',
    description: `**Ability Scores:** Dexterity, Constitution, Intelligence
**Feat:** Alert (see “Feats”)
**Skill Proficiencies:** Sleight of Hand and Stealth
**Tool Proficiency:** Thieves’ Tools
**Equipment:** *Choose A or B:* (A) 2 Daggers, Thieves’ Tools, Crowbar, 2 Pouches, Traveler’s Clothes, 16 GP; or (B) 50 GP`,
    abilityScores: ['dex', 'con', 'int'],
    originFeat: 'alert',
    skills: ['sleightOfHand', 'stealth'],
    tool: 'thieves-tools',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'dagger', qty: 2 },
          { id: 'thieves-tools' },
          { id: 'crowbar' },
          { id: 'pouch', qty: 2 },
          { id: 'travelers-clothes' }
        ],
        gp: 16
      },
      gp50
    ]
  },
  {
    id: 'sage',
    name: 'Sage',
    kind: 'background',
    source: SRD,
    summary: 'You spent your formative years studying lore. Arcana and History, Calligrapher’s Supplies, and Magic Initiate (Wizard).',
    description: `**Ability Scores:** Constitution, Intelligence, Wisdom
**Feat:** Magic Initiate (Wizard) (see “Feats”)
**Skill Proficiencies:** Arcana and History
**Tool Proficiency:** Calligrapher’s Supplies
**Equipment:** *Choose A or B:* (A) Quarterstaff, Calligrapher’s Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP; or (B) 50 GP`,
    tags: ['magic-initiate:wizard'],
    abilityScores: ['con', 'int', 'wis'],
    originFeat: 'magic-initiate',
    skills: ['arcana', 'history'],
    tool: 'calligraphers-supplies',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'quarterstaff' },
          { id: 'calligraphers-supplies' },
          { id: 'book', name: 'Book (history)' },
          { id: 'parchment', qty: 8 },
          { id: 'robe' }
        ],
        gp: 8
      },
      gp50
    ]
  },
  {
    id: 'soldier',
    name: 'Soldier',
    kind: 'background',
    source: SRD,
    summary: 'You trained for war from a young age. Athletics and Intimidation, a Gaming Set, and the Savage Attacker feat.',
    description: `**Ability Scores:** Strength, Dexterity, Constitution
**Feat:** Savage Attacker (see “Feats”)
**Skill Proficiencies:** Athletics and Intimidation
**Tool Proficiency:** Choose one kind of Gaming Set (see “Equipment”)
**Equipment:** *Choose A or B:* (A) Spear, Shortbow, 20 Arrows, Gaming Set (same as above), Healer’s Kit, Quiver, Traveler’s Clothes, 14 GP; or (B) 50 GP`,
    abilityScores: ['str', 'dex', 'con'],
    originFeat: 'savage-attacker',
    skills: ['athletics', 'intimidation'],
    tool: 'choice:gaming',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'spear' },
          { id: 'shortbow' },
          { id: 'arrows', name: 'Arrows (20)', qty: 1 },
          { id: 'gaming-set', name: 'Gaming Set (same as above)' },
          { id: 'healers-kit' },
          { id: 'quiver' },
          { id: 'travelers-clothes' }
        ],
        gp: 14
      },
      gp50
    ]
  },

  /* ---------------------------- PHB 2024 --------------------------- */
  {
    id: 'artisan',
    name: 'Artisan',
    kind: 'background',
    source: PHB,
    summary: 'A trained craftsperson who learned a trade in a workshop. Investigation and Persuasion, one Artisan’s Tools, and the Crafter feat.',
    description: `You grew up apprenticed to a craftsperson, learning to make useful goods and to haggle over their price. Your eye for detail and quality serves you well on the road.

**Ability Scores:** Strength, Dexterity, Intelligence
**Feat:** Crafter
**Skill Proficiencies:** Investigation and Persuasion
**Tool Proficiency:** One kind of Artisan’s Tools
**Equipment:** (A) Artisan’s Tools (same as above), 2 Pouches, Traveler’s Clothes, 32 GP; or (B) 50 GP`,
    abilityScores: ['str', 'dex', 'int'],
    originFeat: 'crafter',
    skills: ['investigation', 'persuasion'],
    tool: 'choice:artisan',
    equipment: [
      {
        label: 'A',
        items: [
          { name: 'Artisan’s Tools (same as above)' },
          { id: 'pouch', qty: 2 },
          { id: 'travelers-clothes' }
        ],
        gp: 32
      },
      gp50
    ]
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    kind: 'background',
    source: PHB,
    summary: 'A swindler who lived by false identities and forged papers. Deception and Sleight of Hand, Forgery Kit, and the Skilled feat.',
    description: `You learned early on how to talk your way into and out of trouble, selling fake remedies, forging documents, and wearing whatever persona the moment demanded.

**Ability Scores:** Dexterity, Constitution, Charisma
**Feat:** Skilled
**Skill Proficiencies:** Deception and Sleight of Hand
**Tool Proficiency:** Forgery Kit
**Equipment:** (A) Forgery Kit, Costume, Fine Clothes, 15 GP; or (B) 50 GP`,
    abilityScores: ['dex', 'con', 'cha'],
    originFeat: 'skilled',
    skills: ['deception', 'sleightOfHand'],
    tool: 'forgery-kit',
    equipment: [
      { label: 'A', items: [{ id: 'forgery-kit' }, { id: 'costume' }, { id: 'fine-clothes' }], gp: 15 },
      gp50
    ]
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    kind: 'background',
    source: PHB,
    summary: 'A performer who grew up on stages and in festivals. Acrobatics and Performance, one Musical Instrument, and the Musician feat.',
    description: `You spent your youth among traveling performers, honing your act before crowds at fairs, taverns, and courts.

**Ability Scores:** Strength, Dexterity, Charisma
**Feat:** Musician
**Skill Proficiencies:** Acrobatics and Performance
**Tool Proficiency:** One kind of Musical Instrument
**Equipment:** (A) Musical Instrument (same as above), 2 Costumes, Mirror, Perfume, Traveler’s Clothes, 11 GP; or (B) 50 GP`,
    abilityScores: ['str', 'dex', 'cha'],
    originFeat: 'musician',
    skills: ['acrobatics', 'performance'],
    tool: 'choice:musical',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'musical-instrument', name: 'Musical Instrument (same as above)' },
          { id: 'costume', qty: 2 },
          { id: 'mirror' },
          { id: 'perfume' },
          { id: 'travelers-clothes' }
        ],
        gp: 11
      },
      gp50
    ]
  },
  {
    id: 'farmer',
    name: 'Farmer',
    kind: 'background',
    source: PHB,
    summary: 'You grew up working the land and tending animals. Animal Handling and Nature, Carpenter’s Tools, and the Tough feat.',
    description: `Years of hard labor in fields and barns made you sturdy, patient, and familiar with the rhythms of nature and livestock.

**Ability Scores:** Strength, Constitution, Wisdom
**Feat:** Tough
**Skill Proficiencies:** Animal Handling and Nature
**Tool Proficiency:** Carpenter’s Tools
**Equipment:** (A) Sickle, Carpenter’s Tools, Healer’s Kit, Iron Pot, Shovel, Traveler’s Clothes, 30 GP; or (B) 50 GP`,
    abilityScores: ['str', 'con', 'wis'],
    originFeat: 'tough',
    skills: ['animalHandling', 'nature'],
    tool: 'carpenters-tools',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'sickle' },
          { id: 'carpenters-tools' },
          { id: 'healers-kit' },
          { id: 'iron-pot' },
          { id: 'shovel' },
          { id: 'travelers-clothes' }
        ],
        gp: 30
      },
      gp50
    ]
  },
  {
    id: 'guard',
    name: 'Guard',
    kind: 'background',
    source: PHB,
    summary: 'You stood watch on walls and gates, alert for trouble. Athletics and Perception, a Gaming Set, and the Alert feat.',
    description: `You served on a watch or garrison, spending long shifts keeping an eye out for intruders and learning to react quickly when trouble came.

**Ability Scores:** Strength, Intelligence, Wisdom
**Feat:** Alert
**Skill Proficiencies:** Athletics and Perception
**Tool Proficiency:** One kind of Gaming Set
**Equipment:** (A) Spear, Light Crossbow, 20 Bolts, Gaming Set (same as above), Hooded Lantern, Manacles, Quiver, Traveler’s Clothes, 12 GP; or (B) 50 GP`,
    abilityScores: ['str', 'int', 'wis'],
    originFeat: 'alert',
    skills: ['athletics', 'perception'],
    tool: 'choice:gaming',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'spear' },
          { id: 'light-crossbow' },
          { id: 'bolts', name: 'Bolts (20)', qty: 1 },
          { id: 'gaming-set', name: 'Gaming Set (same as above)' },
          { id: 'hooded-lantern' },
          { id: 'manacles' },
          { id: 'quiver' },
          { id: 'travelers-clothes' }
        ],
        gp: 12
      },
      gp50
    ]
  },
  {
    id: 'guide',
    name: 'Guide',
    kind: 'background',
    source: PHB,
    summary: 'You led travelers through the wilderness. Stealth and Survival, Cartographer’s Tools, and Magic Initiate (Druid).',
    description: `You came of age outdoors, scouting trails and leading others safely through wild lands, picking up a touch of primal magic along the way.

**Ability Scores:** Dexterity, Constitution, Wisdom
**Feat:** Magic Initiate (Druid)
**Skill Proficiencies:** Stealth and Survival
**Tool Proficiency:** Cartographer’s Tools
**Equipment:** (A) Shortbow, 20 Arrows, Cartographer’s Tools, Bedroll, Quiver, Tent, Traveler’s Clothes, 3 GP; or (B) 50 GP`,
    tags: ['magic-initiate:druid'],
    abilityScores: ['dex', 'con', 'wis'],
    originFeat: 'magic-initiate',
    skills: ['stealth', 'survival'],
    tool: 'cartographers-tools',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'shortbow' },
          { id: 'arrows', name: 'Arrows (20)', qty: 1 },
          { id: 'cartographers-tools' },
          { id: 'bedroll' },
          { id: 'quiver' },
          { id: 'tent' },
          { id: 'travelers-clothes' }
        ],
        gp: 3
      },
      gp50
    ]
  },
  {
    id: 'hermit',
    name: 'Hermit',
    kind: 'background',
    source: PHB,
    summary: 'You lived in seclusion, contemplating mysteries. Medicine and Religion, Herbalism Kit, and the Healer feat.',
    description: `You spent years apart from society in a remote hut or monastery, tending to your own needs and pondering questions of the spirit.

**Ability Scores:** Constitution, Wisdom, Charisma
**Feat:** Healer
**Skill Proficiencies:** Medicine and Religion
**Tool Proficiency:** Herbalism Kit
**Equipment:** (A) Quarterstaff, Herbalism Kit, Bedroll, Book (philosophy), Lamp, Oil (3 flasks), Traveler’s Clothes, 16 GP; or (B) 50 GP`,
    abilityScores: ['con', 'wis', 'cha'],
    originFeat: 'healer',
    skills: ['medicine', 'religion'],
    tool: 'herbalism-kit',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'quarterstaff' },
          { id: 'herbalism-kit' },
          { id: 'bedroll' },
          { id: 'book', name: 'Book (philosophy)' },
          { id: 'lamp' },
          { id: 'oil', qty: 3 },
          { id: 'travelers-clothes' }
        ],
        gp: 16
      },
      gp50
    ]
  },
  {
    id: 'merchant',
    name: 'Merchant',
    kind: 'background',
    source: PHB,
    summary: 'You traded goods along roads and sea lanes. Animal Handling and Persuasion, Navigator’s Tools, and the Lucky feat.',
    description: `You worked for a trading house or caravan, moving goods between markets and learning how to strike a good bargain—and when to trust your luck.

**Ability Scores:** Constitution, Intelligence, Charisma
**Feat:** Lucky
**Skill Proficiencies:** Animal Handling and Persuasion
**Tool Proficiency:** Navigator’s Tools
**Equipment:** (A) Navigator’s Tools, 2 Pouches, Traveler’s Clothes, 22 GP; or (B) 50 GP`,
    abilityScores: ['con', 'int', 'cha'],
    originFeat: 'lucky',
    skills: ['animalHandling', 'persuasion'],
    tool: 'navigators-tools',
    equipment: [
      {
        label: 'A',
        items: [{ id: 'navigators-tools' }, { id: 'pouch', qty: 2 }, { id: 'travelers-clothes' }],
        gp: 22
      },
      gp50
    ]
  },
  {
    id: 'noble',
    name: 'Noble',
    kind: 'background',
    source: PHB,
    summary: 'You were raised among wealth and privilege. History and Persuasion, a Gaming Set, and the Skilled feat.',
    description: `You grew up in a noble household, schooled in etiquette, history, and leadership, and accustomed to the comforts and duties of rank.

**Ability Scores:** Strength, Intelligence, Charisma
**Feat:** Skilled
**Skill Proficiencies:** History and Persuasion
**Tool Proficiency:** One kind of Gaming Set
**Equipment:** (A) Gaming Set (same as above), Fine Clothes, Perfume, 29 GP; or (B) 50 GP`,
    abilityScores: ['str', 'int', 'cha'],
    originFeat: 'skilled',
    skills: ['history', 'persuasion'],
    tool: 'choice:gaming',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'gaming-set', name: 'Gaming Set (same as above)' },
          { id: 'fine-clothes' },
          { id: 'perfume' }
        ],
        gp: 29
      },
      gp50
    ]
  },
  {
    id: 'sailor',
    name: 'Sailor',
    kind: 'background',
    source: PHB,
    summary: 'You lived aboard ships, weathering storms and brawls. Acrobatics and Perception, Navigator’s Tools, and the Tavern Brawler feat.',
    description: `Life on the water taught you to climb rigging, read the weather, and hold your own in a dockside fight.

**Ability Scores:** Strength, Dexterity, Wisdom
**Feat:** Tavern Brawler
**Skill Proficiencies:** Acrobatics and Perception
**Tool Proficiency:** Navigator’s Tools
**Equipment:** (A) Dagger, Navigator’s Tools, Rope, Traveler’s Clothes, 20 GP; or (B) 50 GP`,
    abilityScores: ['str', 'dex', 'wis'],
    originFeat: 'tavern-brawler',
    skills: ['acrobatics', 'perception'],
    tool: 'navigators-tools',
    equipment: [
      {
        label: 'A',
        items: [{ id: 'dagger' }, { id: 'navigators-tools' }, { id: 'rope' }, { id: 'travelers-clothes' }],
        gp: 20
      },
      gp50
    ]
  },
  {
    id: 'scribe',
    name: 'Scribe',
    kind: 'background',
    source: PHB,
    summary: 'You copied texts and kept records with meticulous care. Investigation and Perception, Calligrapher’s Supplies, and the Skilled feat.',
    description: `You trained in a scriptorium or archive, copying documents and spotting the tiny errors others miss.

**Ability Scores:** Dexterity, Intelligence, Wisdom
**Feat:** Skilled
**Skill Proficiencies:** Investigation and Perception
**Tool Proficiency:** Calligrapher’s Supplies
**Equipment:** (A) Calligrapher’s Supplies, Fine Clothes, Lamp, Oil (3 flasks), Parchment (12 sheets), 23 GP; or (B) 50 GP`,
    abilityScores: ['dex', 'int', 'wis'],
    originFeat: 'skilled',
    skills: ['investigation', 'perception'],
    tool: 'calligraphers-supplies',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'calligraphers-supplies' },
          { id: 'fine-clothes' },
          { id: 'lamp' },
          { id: 'oil', qty: 3 },
          { id: 'parchment', qty: 12 }
        ],
        gp: 23
      },
      gp50
    ]
  },
  {
    id: 'wayfarer',
    name: 'Wayfarer',
    kind: 'background',
    source: PHB,
    summary: 'You grew up on the streets, getting by on wits and luck. Insight and Stealth, Thieves’ Tools, and the Lucky feat.',
    description: `You came of age among the poor and overlooked, surviving by keeping your head down, reading people, and trusting that your luck would hold.

**Ability Scores:** Dexterity, Wisdom, Charisma
**Feat:** Lucky
**Skill Proficiencies:** Insight and Stealth
**Tool Proficiency:** Thieves’ Tools
**Equipment:** (A) 2 Daggers, Thieves’ Tools, Gaming Set (any), Bedroll, 2 Pouches, Traveler’s Clothes, 16 GP; or (B) 50 GP`,
    abilityScores: ['dex', 'wis', 'cha'],
    originFeat: 'lucky',
    skills: ['insight', 'stealth'],
    tool: 'thieves-tools',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'dagger', qty: 2 },
          { id: 'thieves-tools' },
          { id: 'gaming-set', name: 'Gaming Set (any)' },
          { id: 'bedroll' },
          { id: 'pouch', qty: 2 },
          { id: 'travelers-clothes' }
        ],
        gp: 16
      },
      gp50
    ]
  }
]
