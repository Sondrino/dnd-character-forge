import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow, Feature } from '../../types'

// Druid — SRD 5.2.1 (CC-BY-4.0) + PHB 2024-subclasses (kun sammendrag med egne ord)

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
  ['Spellcasting', 'Druidic', 'Primal Order'],
  ['Wild Shape', 'Wild Companion'],
  ['Druid Subclass'],
  ['Ability Score Improvement'],
  ['Wild Resurgence'],
  ['Subclass feature'],
  ['Elemental Fury'],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  [],
  ['Ability Score Improvement'],
  [],
  ['Subclass feature'],
  ['Improved Elemental Fury'],
  ['Ability Score Improvement'],
  [],
  ['Beast Spells'],
  ['Epic Boon'],
  ['Archdruid']
]

const WILD_SHAPE = [0, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]
const CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]

const table: ClassLevelRow[] = FEATURES_BY_LEVEL.map((features, i) => ({
  level: i + 1,
  profBonus: profBonus(i + 1),
  features,
  columns: {
    'Wild Shape': WILD_SHAPE[i] || '—',
    Cantrips: CANTRIPS[i],
    'Prepared Spells': PREPARED[i],
    ...slotColumns(i + 1)
  }
}))

const asi = (level: number): Feature => ({
  id: `druid-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat of your choice for which you qualify.',
  description: `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Druid levels 8, 12, and 16.`,
  activation: 'passive'
})

export const druidClass: ClassDef = {
  id: 'druid',
  name: 'Druid',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A priest of nature who casts primal magic, speaks with animals, and can shape-shift into beasts with Wild Shape.',
  description: `## Core Druid Traits

| Trait | Value |
|---|---|
| **Primary Ability** | Wisdom |
| **Hit Point Die** | D8 per Druid level |
| **Saving Throw Proficiencies** | Intelligence and Wisdom |
| **Skill Proficiencies** | Choose 2: Animal Handling, Arcana, Insight, Medicine, Nature, Perception, Religion, or Survival |
| **Weapon Proficiencies** | Simple weapons |
| **Tool Proficiencies** | Herbalism Kit |
| **Armor Training** | Light armor and Shields |
| **Starting Equipment** | Choose A or B: (A) Leather Armor, Shield, Sickle, Druidic Focus (Quarterstaff), Explorer’s Pack, Herbalism Kit, and 9 GP; or (B) 50 GP |

### Becoming a Druid …

**As a Level 1 Character**
- Gain all the traits in the Core Druid Traits table.
- Gain the Druid’s level 1 features, which are listed in the Druid Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Druid Traits table: Hit Point Die and training with Light armor and Shields.
- Gain the Druid’s level 1 features, which are listed in the Druid Features table. See the multiclassing rules in “Character Creation” to determine your available spell slots.

### Druid Class Features
As a Druid, you gain the following class features when you reach the specified Druid levels. These features are listed in the Druid Features table.`,
  tags: ['spellcaster', 'nature', 'shapeshifter', 'support'],
  hitDie: 8,
  primaryAbility: ['wis'],
  savingThrows: ['int', 'wis'],
  skillChoices: {
    count: 2,
    options: ['animalHandling', 'arcana', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival']
  },
  weaponProficiencies: ['simple'],
  armorTraining: ['light', 'shield'],
  toolProficiencies: ['herbalism-kit'],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'leather-armor' },
        { id: 'shield' },
        { id: 'sickle' },
        { id: 'quarterstaff', name: 'Druidic Focus (Quarterstaff)' },
        { id: 'explorers-pack' },
        { id: 'herbalism-kit' }
      ],
      gp: 9
    },
    { label: 'B', items: [], gp: 50 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'druid-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary:
        'Cast Druid spells using Wisdom, with a Druidic Focus. You can change your prepared spells after each Long Rest.',
      description: `You have learned to cast spells through studying the mystical forces of nature. See “Spells” for the rules on spellcasting. The information below details how you use those rules with Druid spells, which appear on the Druid spell list later in the class’s description.

**Cantrips.** You know two cantrips of your choice from the Druid spell list. Druidcraft and Produce Flame are recommended.

Whenever you gain a Druid level, you can replace one of your cantrips with another cantrip of your choice from the Druid spell list.

When you reach Druid levels 4 and 10, you learn another cantrip of your choice from the Druid spell list, as shown in the Cantrips column of the Druid Features table.

**Spell Slots.** The Druid Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Druid spell list. Animal Friendship, Cure Wounds, Faerie Fire, and Thunderwave are recommended.

The number of spells on your list increases as you gain Druid levels, as shown in the Prepared Spells column of the Druid Features table. Whenever that number increases, choose additional spells from the Druid spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you’re a level 3 Druid, your list of prepared spells can include six spells of levels 1 and 2 in any combination.

If another Druid feature gives you spells that you always have prepared, those spells don’t count against the number of spells you can prepare with this feature, but those spells otherwise count as Druid spells for you.

**Changing Your Prepared Spells.** Whenever you finish a Long Rest, you can change your list of prepared spells, replacing any of the spells with other Druid spells for which you have spell slots.

**Spellcasting Ability.** Wisdom is your spellcasting ability for your Druid spells.

**Spellcasting Focus.** You can use a Druidic Focus as a Spellcasting Focus for your Druid spells.`,
      activation: 'passive'
    },
    {
      id: 'druid-druidic',
      name: 'Druidic',
      level: 1,
      summary: 'You know Druidic, the secret language of Druids, and you always have Speak with Animals prepared.',
      description: `You know Druidic, the secret language of Druids. While learning this ancient tongue, you also unlocked the magic of communicating with animals; you always have the Speak with Animals spell prepared.

You can use Druidic to leave hidden messages. You and others who know Druidic automatically spot such a message. Others spot the message’s presence with a successful DC 15 Intelligence (Investigation) check but can’t decipher it without magic.`,
      activation: 'passive',
      effects: [{ target: 'language', op: 'grant', value: 'druidic', note: 'Druidic' }]
    },
    {
      id: 'druid-primal-order',
      name: 'Primal Order',
      level: 1,
      summary:
        'Choose a sacred role: Magician (an extra cantrip and a Wisdom bonus to Arcana and Nature checks) or Warden (Martial weapons and Medium armor).',
      description: `You have dedicated yourself to one of the following sacred roles of your choice.

**Magician.** You know one extra cantrip from the Druid spell list. In addition, your mystical connection to nature gives you a bonus to your Intelligence (Arcana or Nature) checks. The bonus equals your Wisdom modifier (minimum bonus of +1).

**Warden.** Trained for battle, you gain proficiency with Martial weapons and training with Medium armor.`,
      activation: 'passive',
      choices: [
        {
          id: 'druid-primal-order',
          label: 'Primal Order',
          count: 1,
          type: 'option',
          filter: 'Primal Order',
          options: ['druid-primal-order-magician', 'druid-primal-order-warden']
        }
      ]
    },
    {
      id: 'druid-wild-shape',
      name: 'Wild Shape',
      level: 2,
      summary:
        'As a Bonus Action, shape-shift into a known Beast form for hours equal to half your Druid level, gaining Temporary Hit Points equal to your Druid level.',
      description: `The power of nature allows you to assume the form of an animal. As a Bonus Action, you shape-shift into a Beast form that you have learned for this feature (see “Known Forms” below). You stay in that form for a number of hours equal to half your Druid level or until you use Wild Shape again, have the Incapacitated condition, or die. You can also leave the form early as a Bonus Action.

**Number of Uses.** You can use Wild Shape twice. You regain one expended use when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest.

You gain additional uses when you reach certain Druid levels, as shown in the Wild Shape column of the Druid Features table.

**Known Forms.** You know four Beast forms for this feature, chosen from among Beast stat blocks that have a maximum Challenge Rating of 1/4 and that lack a Fly Speed (see “Animals” in “Monsters” for stat block options). The Rat, Riding Horse, Spider, and Wolf are recommended. Whenever you finish a Long Rest, you can replace one of your known forms with another eligible form.

When you reach certain Druid levels, your number of known forms and the maximum Challenge Rating for those forms increases, as shown in the Beast Shapes table. In addition, starting at level 8, you can adopt a form that has a Fly Speed.

When choosing known forms, you may look in other sources for eligible Beasts if the Game Master permits you to do so.

**Beast Shapes**

| Druid Level | Known Forms | Max CR | Fly Speed |
|---|---|---|---|
| 2 | 4 | 1/4 | No |
| 4 | 6 | 1/2 | No |
| 8 | 8 | 1 | Yes |

**Rules While Shape-Shifted.** While in a form, you retain your personality, memories, and ability to speak, and the following rules apply:

**Temporary Hit Points.** When you assume a Wild Shape form, you gain a number of Temporary Hit Points equal to your Druid level.

**Game Statistics.** Your game statistics are replaced by the Beast’s stat block, but you retain your creature type; Hit Points; Hit Point Dice; Intelligence, Wisdom, and Charisma scores; class features; languages; and feats. You also retain your skill and saving throw proficiencies and use your Proficiency Bonus for them, in addition to gaining the proficiencies of the creature. If a skill or saving throw modifier in the Beast’s stat block is higher than yours, use the one in the stat block.

**No Spellcasting.** You can’t cast spells, but shapeshifting doesn’t break your Concentration or otherwise interfere with a spell you’ve already cast.

**Objects.** Your ability to handle objects is determined by the form’s limbs rather than your own. In addition, you choose whether your equipment falls in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the GM decides whether it’s practical for the new form to wear a piece of equipment based on the creature’s size and shape. Your equipment doesn’t change size or shape to match the new form, and any equipment that the new form can’t wear must either fall to the ground or merge with the form. Equipment that merges with the form has no effect while you’re in that form.`,
      uses: { count: 'Wild Shape', recharge: 'shortOne' },
      activation: 'bonus'
    },
    {
      id: 'druid-wild-companion',
      name: 'Wild Companion',
      level: 2,
      summary: 'As a Magic action, expend a spell slot or a Wild Shape use to cast Find Familiar without Material components; the familiar is Fey.',
      description: `You can summon a nature spirit that assumes an animal form to aid you. As a Magic action, you can expend a spell slot or a use of Wild Shape to cast the Find Familiar spell without Material components.

When you cast the spell in this way, the familiar is Fey and disappears when you finish a Long Rest.`,
      activation: 'action'
    },
    {
      id: 'druid-subclass',
      name: 'Druid Subclass',
      level: 3,
      summary: 'Choose a Druid subclass (Druid Circle), which grants features at Druid levels 3, 6, 10, and 14.',
      description: `You gain a Druid subclass of your choice. The Circle of the Land subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Druid levels. For the rest of your career, you gain each of your subclass’s features that are of your Druid level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'druid-wild-resurgence',
      name: 'Wild Resurgence',
      level: 5,
      summary:
        'Once per turn, expend a spell slot to regain a Wild Shape use if you have none; once per Long Rest, expend a Wild Shape use to gain a level 1 spell slot.',
      description: `Once on each of your turns, if you have no uses of Wild Shape left, you can give yourself one use by expending a spell slot (no action required).

In addition, you can expend one use of Wild Shape (no action required) to give yourself a level 1 spell slot, but you can’t do so again until you finish a Long Rest.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'special'
    },
    {
      id: 'druid-elemental-fury',
      name: 'Elemental Fury',
      level: 7,
      summary:
        'Choose Potent Spellcasting (add Wisdom modifier to Druid cantrip damage) or Primal Strike (extra 1d8 Cold, Fire, Lightning, or Thunder damage once per turn).',
      description: `The might of the elements flows through you. You gain one of the following options of your choice.

**Potent Spellcasting.** Add your Wisdom modifier to the damage you deal with any Druid cantrip.

**Primal Strike.** Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form’s attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage (choose when you hit).`,
      activation: 'passive',
      choices: [
        {
          id: 'druid-elemental-fury',
          label: 'Elemental Fury',
          count: 1,
          type: 'option',
          filter: 'Elemental Fury',
          options: ['druid-elemental-fury-potent-spellcasting', 'druid-elemental-fury-primal-strike']
        }
      ]
    },
    asi(8),
    asi(12),
    {
      id: 'druid-improved-elemental-fury',
      name: 'Improved Elemental Fury',
      level: 15,
      summary:
        'Potent Spellcasting extends the range of your ranged Druid cantrips by 300 feet, or Primal Strike’s extra damage increases to 2d8.',
      description: `The option you chose for Elemental Fury grows more powerful, as detailed below.

**Potent Spellcasting.** When you cast a Druid cantrip with a range of 10 feet or greater, the spell’s range increases by 300 feet.

**Primal Strike.** The extra damage of your Primal Strike increases to 2d8.`,
      activation: 'passive'
    },
    asi(16),
    {
      id: 'druid-beast-spells',
      name: 'Beast Spells',
      level: 18,
      summary: 'You can cast spells while in Wild Shape, except those with costly or consumed Material components.',
      description: `While using Wild Shape, you can cast spells in Beast form, except for any spell that has a Material component with a cost specified or that consumes its Material component.`,
      activation: 'passive'
    },
    {
      id: 'druid-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for. Boon of Dimensional Travel is recommended.',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Dimensional Travel is recommended.`,
      activation: 'passive'
    },
    {
      id: 'druid-archdruid',
      name: 'Archdruid',
      level: 20,
      summary:
        'Regain a Wild Shape use when you roll Initiative with none left, convert Wild Shape uses into a spell slot once per Long Rest, and age only one year per ten.',
      description: `The vitality of nature constantly blooms within you, granting you the following benefits.

**Evergreen Wild Shape.** Whenever you roll Initiative and have no uses of Wild Shape left, you regain one expended use of it.

**Nature Magician.** You can convert uses of Wild Shape into a spell slot (no action required). Choose a number of your unexpended uses of Wild Shape and convert them into a single spell slot, with each use contributing 2 spell levels. For example, if you convert two uses of Wild Shape, you produce a level 4 spell slot. Once you use this benefit, you can’t do so again until you finish a Long Rest.

**Longevity.** The primal magic that you wield causes you to age more slowly. For every ten years that pass, your body ages only one year.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'special'
    }
  ],
  spellcasting: {
    ability: 'wis',
    progression: 'full',
    prepared: PREPARED,
    cantrips: CANTRIPS,
    spellList: 'druid',
    ritualCasting: true,
    focus: 'Druidic Focus'
  },
  multiclass: {
    prerequisite: 'Wisdom 13',
    proficiencies: 'Hit Point Die and training with Light armor and Shields'
  },
  quickBuild: `Make Wisdom your highest score to power your spells, then put Constitution second so you can hold Concentration and survive; Dexterity is a good third pick for AC. A nature-flavored background such as Guide or Hermit fits the class well. Druidcraft and Produce Flame are good first cantrips, and Animal Friendship, Cure Wounds, Faerie Fire, and Thunderwave make a balanced starting spell list.`,
  tips: [
    'Wild Shape gives you Temporary Hit Points equal to your Druid level, so it doubles as an emergency shield and a scouting tool.',
    'You can’t cast spells in Wild Shape (until level 18), but a Concentration spell you cast before shifting keeps running.',
    'Choose Warden for Medium armor and Martial weapons if you want to fight up close, or Magician for an extra cantrip and better Arcana and Nature checks.',
    'You can change your prepared spells after every Long Rest—swap in utility spells when exploring and battlefield control before big fights.',
    'Entangle, Faerie Fire, and later Spike Growth and Moonbeam control the battlefield and help the whole party.',
    'Druids traditionally avoid metal armor in the stories; Leather armor and a wooden Shield are your usual protection.',
    'Wild Companion lets you spend a Wild Shape use to summon a familiar, which is great for scouting and the Help action.'
  ],
  recommended: {
    species: ['elf', 'human', 'halfling', 'gnome', 'dwarf', 'goliath'],
    backgrounds: ['guide', 'hermit', 'farmer', 'sage', 'acolyte'],
    feats: ['magic-initiate', 'alert', 'war-caster', 'tough', 'resilient', 'boon-of-dimensional-travel'],
    cantrips: ['druidcraft', 'produce-flame', 'guidance', 'shillelagh', 'starry-wisp', 'elementalism'],
    spells: [
      'animal-friendship', 'cure-wounds', 'faerie-fire', 'thunderwave', 'entangle', 'healing-word', 'goodberry',
      'moonbeam', 'spike-growth', 'pass-without-trace', 'call-lightning', 'conjure-animals'
    ],
    weapons: ['quarterstaff', 'sickle', 'sling', 'spear', 'dagger']
  }
}

export const druidSubclasses: SubclassDef[] = [
  {
    id: 'circle-of-the-land',
    name: 'Circle of the Land',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'druid',
    summary: 'Celebrate Connection to the Natural World: mystic Druids who draw spells from a chosen land type and recover magic quickly.',
    description: `*Celebrate Connection to the Natural World*

The Circle of the Land comprises mystics and sages who safeguard ancient knowledge and rites. These Druids meet within sacred circles of trees or standing stones to whisper primal secrets in Druidic. The circle’s wisest members preside as the chief priests of their communities.`,
    features: [
      {
        id: 'circle-of-the-land-spells',
        name: 'Circle of the Land Spells',
        level: 3,
        summary:
          'After each Long Rest, choose arid, polar, temperate, or tropical land; you have that land’s spells for your Druid level and lower prepared.',
        description: `Whenever you finish a Long Rest, choose one type of land: arid, polar, temperate, or tropical. Consult the table below that corresponds to the chosen type; you have the spells listed for your Druid level and lower prepared.

**Arid Land**

| Druid Level | Circle Spells |
|---|---|
| 3 | Blur, Burning Hands, Fire Bolt |
| 5 | Fireball |
| 7 | Blight |
| 9 | Wall of Stone |

**Polar Land**

| Druid Level | Circle Spells |
|---|---|
| 3 | Fog Cloud, Hold Person, Ray of Frost |
| 5 | Sleet Storm |
| 7 | Ice Storm |
| 9 | Cone of Cold |

**Temperate Land**

| Druid Level | Circle Spells |
|---|---|
| 3 | Misty Step, Shocking Grasp, Sleep |
| 5 | Lightning Bolt |
| 7 | Freedom of Movement |
| 9 | Tree Stride |

**Tropical Land**

| Druid Level | Circle Spells |
|---|---|
| 3 | Acid Splash, Ray of Sickness, Web |
| 5 | Stinking Cloud |
| 7 | Polymorph |
| 9 | Insect Plague |`,
        activation: 'passive',
        choices: [
          {
            id: 'circle-of-the-land-land-type',
            label: 'Land type (change after each Long Rest)',
            count: 1,
            type: 'option',
            options: ['Arid', 'Polar', 'Temperate', 'Tropical']
          }
        ]
      },
      {
        id: 'circle-of-the-land-lands-aid',
        name: 'Land’s Aid',
        level: 3,
        summary:
          'As a Magic action, expend a Wild Shape use: creatures of your choice in a 10-foot Sphere take 2d6 Necrotic (Con save halves), and one creature there regains 2d6 HP.',
        description: `As a Magic action, you can expend a use of your Wild Shape and choose a point within 60 feet of yourself. Vitality-giving flowers and life-draining thorns appear for a moment in a 10-foot-radius Sphere centered on that point. Each creature of your choice in the Sphere must make a Constitution saving throw against your spell save DC, taking 2d6 Necrotic damage on a failed save or half as much damage on a successful one. One creature of your choice in that area regains 2d6 Hit Points.

The damage and healing increase by 1d6 when you reach Druid levels 10 (3d6) and 14 (4d6).`,
        activation: 'action'
      },
      {
        id: 'circle-of-the-land-natural-recovery',
        name: 'Natural Recovery',
        level: 6,
        summary:
          'Once per Long Rest, cast a level 1+ Circle spell without a slot; and once per Long Rest, recover spell slots totaling half your Druid level (round up) on a Short Rest.',
        description: `You can cast one of the level 1+ spells that you have prepared from your Circle Spells feature without expending a spell slot, and you must finish a Long Rest before you do so again.

In addition, when you finish a Short Rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your Druid level (round up), and none of them can be level 6+. For example, if you’re a level 6 Druid, you can recover up to three levels’ worth of spell slots. You can recover a level 3 spell slot, a level 2 and a level 1 spell slot, or three level 1 spell slots. Once you recover spell slots with this feature, you can’t do so again until you finish a Long Rest.`,
        uses: { count: 1, recharge: 'long' },
        activation: 'special'
      },
      {
        id: 'circle-of-the-land-natures-ward',
        name: 'Nature’s Ward',
        level: 10,
        summary:
          'Immunity to the Poisoned condition, plus Resistance tied to your land: Arid (Fire), Polar (Cold), Temperate (Lightning), Tropical (Poison).',
        description: `You are immune to the Poisoned condition, and you have Resistance to a damage type associated with your current land choice in the Circle Spells feature, as shown in the Nature’s Ward table.

**Nature’s Ward**

| Land Type | Resistance |
|---|---|
| Arid | Fire |
| Polar | Cold |
| Temperate | Lightning |
| Tropical | Poison |`,
        activation: 'passive',
        effects: [{ target: 'conditionImmunity', op: 'grant', value: 'poisoned', note: 'Nature’s Ward' }]
      },
      {
        id: 'circle-of-the-land-natures-sanctuary',
        name: 'Nature’s Sanctuary',
        level: 14,
        summary:
          'As a Magic action, expend a Wild Shape use to create a 15-foot Cube of spectral trees for 1 minute that gives you and allies Half Cover and shares your Nature’s Ward Resistance.',
        description: `As a Magic action, you can expend a use of your Wild Shape and cause spectral trees and vines to appear in a 15-foot Cube on the ground within 120 feet of yourself. They last there for 1 minute or until you have the Incapacitated condition or die. You and your allies have Half Cover while in that area, and your allies gain the current Resistance of your Nature’s Ward while there.

As a Bonus Action, you can move the Cube up to 60 feet to ground within 120 feet of yourself.`,
        activation: 'action'
      }
    ]
  },
  {
    id: 'circle-of-the-moon',
    name: 'Circle of the Moon',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'druid',
    summary: 'A shape-shifting Druid who takes on tougher beast forms and channels lunar magic while transformed.',
    description: `Moon Druids are masters of Wild Shape. They can become stronger beasts than other Druids, gain extra durability and AC while transformed, and can cast certain moon-themed spells even in beast form. Later they gain radiant power and a moonlit teleport. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['cure-wounds', 'moonbeam', 'starry-wisp'] },
      { level: 5, spells: ['conjure-animals'] },
      { level: 7, spells: ['fount-of-moonlight'] },
      { level: 9, spells: ['mass-cure-wounds'] }
    ],
    features: [
      {
        id: 'circle-of-the-moon-circle-forms',
        name: 'Circle Forms',
        level: 3,
        summary: 'Your Wild Shape forms can have a higher Challenge Rating, and you get a minimum AC and extra Temporary Hit Points while transformed.',
        description:
          'Your Wild Shape forms can have a higher Challenge Rating, and you get a minimum AC and extra Temporary Hit Points while transformed.'
      },
      {
        id: 'circle-of-the-moon-spells',
        name: 'Circle of the Moon Spells',
        level: 3,
        summary: 'You always have certain moon-themed spells prepared, and you can cast them while in Wild Shape.',
        description: 'You always have certain moon-themed spells prepared, and you can cast them while in Wild Shape.'
      },
      {
        id: 'circle-of-the-moon-improved-circle-forms',
        name: 'Improved Circle Forms',
        level: 6,
        summary: 'While in Wild Shape, your attacks can deal Radiant damage and you add your Wisdom modifier to Constitution saving throws.',
        description: 'While in Wild Shape, your attacks can deal Radiant damage and you add your Wisdom modifier to Constitution saving throws.'
      },
      {
        id: 'circle-of-the-moon-moonlight-step',
        name: 'Moonlight Step',
        level: 10,
        summary: 'As a Bonus Action, teleport a short distance and gain Advantage on your next attack; limited uses per Long Rest.',
        description: 'As a Bonus Action, teleport a short distance and gain Advantage on your next attack; limited uses per Long Rest.',
        activation: 'bonus',
        uses: { count: 'mod.wis', recharge: 'long' }
      },
      {
        id: 'circle-of-the-moon-lunar-form',
        name: 'Lunar Form',
        level: 14,
        summary: 'Your Wild Shape attacks deal extra Radiant damage, and Moonlight Step can bring a willing creature along.',
        description: 'Your Wild Shape attacks deal extra Radiant damage, and Moonlight Step can bring a willing creature along.'
      }
    ]
  },
  {
    id: 'circle-of-the-sea',
    name: 'Circle of the Sea',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'druid',
    summary: 'A Druid of oceans and storms who surrounds themself with a churning aura of sea spray and thunder.',
    description: `Sea Druids embody the tides and the tempest. They gain water- and storm-themed spells and can spend Wild Shape to wreathe themselves in an aura that batters and pushes away nearby foes. Later the aura grows, they gain swimming and flight, resist storm damage, and can share the aura with an ally. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['fog-cloud', 'gust-of-wind', 'ray-of-frost', 'shatter', 'thunderwave'] },
      { level: 5, spells: ['lightning-bolt', 'water-breathing'] },
      { level: 7, spells: ['control-water', 'ice-storm'] },
      { level: 9, spells: ['conjure-elemental', 'hold-monster'] }
    ],
    features: [
      {
        id: 'circle-of-the-sea-spells',
        name: 'Circle of the Sea Spells',
        level: 3,
        summary: 'You always have certain sea- and storm-themed spells prepared.',
        description: 'You always have certain sea- and storm-themed spells prepared.'
      },
      {
        id: 'circle-of-the-sea-wrath-of-the-sea',
        name: 'Wrath of the Sea',
        level: 3,
        summary: 'Spend a Wild Shape use to create an aura around you; as a Bonus Action, you can lash a creature in it with Cold damage and push it away.',
        description: 'Spend a Wild Shape use to create an aura around you; as a Bonus Action, you can lash a creature in it with Cold damage and push it away.',
        activation: 'bonus'
      },
      {
        id: 'circle-of-the-sea-aquatic-affinity',
        name: 'Aquatic Affinity',
        level: 6,
        summary: 'Your Wrath of the Sea aura grows larger, and you gain a Swim Speed.',
        description: 'Your Wrath of the Sea aura grows larger, and you gain a Swim Speed.'
      },
      {
        id: 'circle-of-the-sea-stormborn',
        name: 'Stormborn',
        level: 10,
        summary: 'While your aura is active, you gain a Fly Speed and Resistance to Cold, Lightning, and Thunder damage.',
        description: 'While your aura is active, you gain a Fly Speed and Resistance to Cold, Lightning, and Thunder damage.'
      },
      {
        id: 'circle-of-the-sea-oceanic-gift',
        name: 'Oceanic Gift',
        level: 14,
        summary: 'You can place your Wrath of the Sea aura on a willing ally instead of yourself, or on both of you at a higher cost.',
        description: 'You can place your Wrath of the Sea aura on a willing ally instead of yourself, or on both of you at a higher cost.'
      }
    ]
  },
  {
    id: 'circle-of-the-stars',
    name: 'Circle of the Stars',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'druid',
    summary: 'A Druid who reads the constellations, using a star map and a radiant starry form to heal, shoot, or focus.',
    description: `Star Druids draw power from the night sky. A star map gives them extra guidance and free castings of Guiding Bolt, and instead of turning into a beast they can spend Wild Shape to take on a starry form—the Archer, the Chalice, or the Dragon—each with its own benefit. Later they read omens to aid allies and gain resistance while shining. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [{ level: 3, spells: ['guidance', 'guiding-bolt'] }],
    features: [
      {
        id: 'circle-of-the-stars-star-map',
        name: 'Star Map',
        level: 3,
        summary: 'You gain a star chart that gives you Guidance and Guiding Bolt, and you can cast Guiding Bolt without a slot a few times per Long Rest.',
        description:
          'You gain a star chart that gives you Guidance and Guiding Bolt, and you can cast Guiding Bolt without a slot a few times per Long Rest.',
        uses: { count: 'mod.wis', recharge: 'long' }
      },
      {
        id: 'circle-of-the-stars-starry-form',
        name: 'Starry Form',
        level: 3,
        summary: 'Spend a Wild Shape use to take on a glowing constellation form: Archer (radiant ranged attacks), Chalice (bonus healing), or Dragon (reliable Concentration and mental checks).',
        description:
          'Spend a Wild Shape use to take on a glowing constellation form: Archer (radiant ranged attacks), Chalice (bonus healing), or Dragon (reliable Concentration and mental checks).',
        activation: 'bonus'
      },
      {
        id: 'circle-of-the-stars-cosmic-omen',
        name: 'Cosmic Omen',
        level: 6,
        summary: 'After a Long Rest you receive an omen (Weal or Woe) that lets you use your Reaction to add to or subtract from nearby creatures’ D20 Tests.',
        description: 'After a Long Rest you receive an omen (Weal or Woe) that lets you use your Reaction to add to or subtract from nearby creatures’ D20 Tests.',
        activation: 'reaction',
        uses: { count: 'mod.wis', recharge: 'long' }
      },
      {
        id: 'circle-of-the-stars-twinkling-constellations',
        name: 'Twinkling Constellations',
        level: 10,
        summary: 'Your Starry Form gets stronger: Archer and Chalice deal or heal more, the Dragon grants flight, and you can switch constellations each turn.',
        description:
          'Your Starry Form gets stronger: Archer and Chalice deal or heal more, the Dragon grants flight, and you can switch constellations each turn.'
      },
      {
        id: 'circle-of-the-stars-full-of-stars',
        name: 'Full of Stars',
        level: 14,
        summary: 'While in Starry Form, you have Resistance to Bludgeoning, Piercing, and Slashing damage.',
        description: 'While in Starry Form, you have Resistance to Bludgeoning, Piercing, and Slashing damage.',
        effects: [
          { target: 'resistance', op: 'grant', value: 'bludgeoning', condition: 'starryForm', note: 'Full of Stars' },
          { target: 'resistance', op: 'grant', value: 'piercing', condition: 'starryForm', note: 'Full of Stars' },
          { target: 'resistance', op: 'grant', value: 'slashing', condition: 'starryForm', note: 'Full of Stars' }
        ]
      }
    ]
  }
]

export const druidOptions: ClassOptionGroup[] = [
  {
    classId: 'druid',
    group: 'Primal Order',
    source: 'SRD 5.2',
    items: [
      {
        id: 'druid-primal-order-magician',
        name: 'Magician',
        level: 1,
        summary: 'Learn one extra Druid cantrip and add your Wisdom modifier (minimum +1) to Intelligence (Arcana or Nature) checks.',
        description: `You know one extra cantrip from the Druid spell list. In addition, your mystical connection to nature gives you a bonus to your Intelligence (Arcana or Nature) checks. The bonus equals your Wisdom modifier (minimum bonus of +1).`,
        choices: [{ id: 'magician-cantrip', label: 'Extra Druid cantrip', count: 1, type: 'cantrip', filter: 'druid' }],
        effects: [
          { target: 'skill.arcana', op: 'add', value: 'max(1,mod.wis)', note: 'Primal Order: Magician' },
          { target: 'skill.nature', op: 'add', value: 'max(1,mod.wis)', note: 'Primal Order: Magician' },
          { target: 'spell.cantrips.druid', op: 'add', value: 1, note: 'Primal Order: Magician (extra cantrip)' }
        ]
      },
      {
        id: 'druid-primal-order-warden',
        name: 'Warden',
        level: 1,
        summary: 'Gain proficiency with Martial weapons and training with Medium armor.',
        description: `Trained for battle, you gain proficiency with Martial weapons and training with Medium armor.`,
        effects: [
          { target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Primal Order: Warden' },
          { target: 'proficiency.armor', op: 'grant', value: 'medium', note: 'Primal Order: Warden' }
        ]
      }
    ]
  },
  {
    classId: 'druid',
    group: 'Elemental Fury',
    source: 'SRD 5.2',
    items: [
      {
        id: 'druid-elemental-fury-potent-spellcasting',
        name: 'Potent Spellcasting',
        level: 7,
        summary: 'Add your Wisdom modifier to Druid cantrip damage; at level 15, ranged Druid cantrips gain +300 feet of range.',
        description: `Add your Wisdom modifier to the damage you deal with any Druid cantrip.

*Improved (Druid level 15):* When you cast a Druid cantrip with a range of 10 feet or greater, the spell’s range increases by 300 feet.`
      },
      {
        id: 'druid-elemental-fury-primal-strike',
        name: 'Primal Strike',
        level: 7,
        summary: 'Once per turn, a weapon or Beast-form hit deals an extra 1d8 Cold, Fire, Lightning, or Thunder damage (2d8 at Druid level 15).',
        description: `Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form’s attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage (choose when you hit).

*Improved (Druid level 15):* The extra damage of your Primal Strike increases to 2d8.`
      }
    ]
  }
]
