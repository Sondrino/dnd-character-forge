import type { ClassDef, SubclassDef, ClassOptionGroup, ClassLevelRow } from '../../types'

const ASI_TEXT = `You gain the Ability Score Improvement feat (see “Feats”) or another feat of your choice for which you qualify. You gain this feature again at Paladin levels 8, 12, and 16.`

const asi = (level: number) => ({
  id: `paladin-asi-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive' as const
})

const PB = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
const PREPARED = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]
/** Half-caster spell slots (Paladin/Ranger), level 1–5 spells */
const SLOTS: number[][] = [
  [2], [2], [3], [3], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2],
  [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 2],
  [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2]
]
const FEATURES: string[][] = [
  ['Lay On Hands', 'Spellcasting', 'Weapon Mastery'],
  ['Fighting Style', 'Paladin’s Smite'],
  ['Channel Divinity', 'Paladin Subclass'],
  ['Ability Score Improvement'],
  ['Extra Attack', 'Faithful Steed'],
  ['Aura of Protection'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Abjure Foes'],
  ['Aura of Courage'],
  ['Radiant Strikes'],
  ['Ability Score Improvement'],
  [],
  ['Restoring Touch'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  [],
  ['Aura Expansion'],
  ['Epic Boon'],
  ['Subclass feature']
]
const SLOT_COLS = ['1st', '2nd', '3rd', '4th', '5th']

const table: ClassLevelRow[] = PB.map((profBonus, i) => {
  const level = i + 1
  const columns: Record<string, string | number> = {
    'Channel Divinity': level < 3 ? '—' : level >= 11 ? 3 : 2,
    'Prepared Spells': PREPARED[i],
    'Weapon Mastery': 2
  }
  SLOT_COLS.forEach((col, s) => {
    columns[col] = SLOTS[i][s] ?? '—'
  })
  return { level, profBonus, features: FEATURES[i], columns }
})

export const paladinClass: ClassDef = {
  id: 'paladin',
  name: 'Paladin',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A holy warrior bound by a sacred oath, combining heavy armor and weapons with healing, divine smites and protective auras.',
  description: `## Core Paladin Traits

| Trait | |
|---|---|
| **Primary Ability** | Strength and Charisma |
| **Hit Point Die** | D10 per Paladin level |
| **Saving Throw Proficiencies** | Wisdom and Charisma |
| **Skill Proficiencies** | *Choose 2:* Athletics, Insight, Intimidation, Medicine, Persuasion, or Religion |
| **Weapon Proficiencies** | Simple and Martial weapons |
| **Armor Training** | Light, Medium, and Heavy armor and Shields |
| **Starting Equipment** | *Choose A or B:* (A) Chain Mail, Shield, Longsword, 6 Javelins, Holy Symbol, Priest’s Pack, and 9 GP; or (B) 150 GP |

### Becoming a Paladin …

**As a Level 1 Character**
- Gain all the traits in the Core Paladin Traits table.
- Gain the Paladin’s level 1 features, which are listed in the Paladin Features table.

**As a Multiclass Character**
- Gain the following traits from the Core Paladin Traits table: Hit Point Die, proficiency with Martial weapons, and training with Light and Medium armor and Shields.
- Gain the Paladin’s level 1 features, which are listed in the Paladin Features table. See the multiclassing rules in “Character Creation” to determine your available spell slots.

### Paladin Class Features
As a Paladin, you gain the following class features when you reach the specified Paladin levels. These features are listed in the Paladin Features table.

### Breaking Your Oath
A Paladin tries to hold to the highest standards of conduct, but even the most dedicated are fallible. Sometimes a Paladin transgresses their oath.

A Paladin who has broken a vow typically seeks absolution, spending an all-night vigil as a sign of penitence or undertaking a fast. After a rite of forgiveness, the Paladin starts fresh.

If your Paladin unrepentantly violates their oath, talk to your GM. Your Paladin should probably take a more appropriate subclass or even abandon the class and adopt another one.`,
  tags: ['martial', 'spellcaster', 'half-caster'],
  hitDie: 10,
  primaryAbility: ['str', 'cha'],
  savingThrows: ['wis', 'cha'],
  skillChoices: {
    count: 2,
    options: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion']
  },
  weaponProficiencies: ['simple', 'martial'],
  armorTraining: ['light', 'medium', 'heavy', 'shield'],
  toolProficiencies: [],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'chain-mail' },
        { id: 'shield' },
        { id: 'longsword' },
        { id: 'javelin', qty: 6 },
        { id: 'holy-symbol' },
        { id: 'priests-pack' }
      ],
      gp: 9
    },
    { label: 'B', items: [], gp: 150 }
  ],
  subclassLevel: 3,
  table,
  features: [
    {
      id: 'paladin-lay-on-hands',
      name: 'Lay On Hands',
      level: 1,
      summary: 'A healing pool of 5 × Paladin level HP, restored on a Long Rest. Bonus Action: touch a creature to restore HP from the pool, or spend 5 to remove Poisoned.',
      description: `Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you finish a Long Rest. With that pool, you can restore a total number of Hit Points equal to five times your Paladin level.

As a Bonus Action, you can touch a creature (which could be yourself) and draw power from the pool of healing to restore a number of Hit Points to that creature, up to the maximum amount remaining in the pool.

You can also expend 5 Hit Points from the pool of healing power to remove the Poisoned condition from the creature; those points don’t also restore Hit Points to the creature.`,
      uses: { count: 'level*5', recharge: 'long' },
      activation: 'bonus'
    },
    {
      id: 'paladin-spellcasting',
      name: 'Spellcasting',
      level: 1,
      summary: 'Cast Paladin spells using Charisma, with a Holy Symbol as your focus. You prepare spells from the Paladin list and can swap one after each Long Rest.',
      description: `You have learned to cast spells through prayer and meditation. See “Spells” for the rules on spellcasting. The information below details how you use those rules with Paladin spells, which appear in the Paladin spell list later in the class’s description.

**Spell Slots.** The Paladin Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest.

**Prepared Spells of Level 1+.** You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose two level 1 Paladin spells. Heroism and Searing Smite are recommended.

The number of spells on your list increases as you gain Paladin levels, as shown in the Prepared Spells column of the Paladin Features table. Whenever that number increases, choose additional Paladin spells until the number of spells on your list matches the number in the Paladin Features table. The chosen spells must be of a level for which you have spell slots. For example, if you’re a level 5 Paladin, your list of prepared spells can include six Paladin spells of level 1 or 2 in any combination.

If another Paladin feature gives you spells that you always have prepared, those spells don’t count against the number of spells you can prepare with this feature, but those spells otherwise count as Paladin spells for you.

**Changing Your Prepared Spells.** Whenever you finish a Long Rest, you can replace one spell on your list with another Paladin spell for which you have spell slots.

**Spellcasting Ability.** Charisma is your spellcasting ability for your Paladin spells.

**Spellcasting Focus.** You can use a Holy Symbol as a Spellcasting Focus for your Paladin spells.`,
      activation: 'passive'
    },
    {
      id: 'paladin-weapon-mastery',
      name: 'Weapon Mastery',
      level: 1,
      summary: 'Use the mastery properties of two kinds of weapons you are proficient with; you can change them after each Long Rest.',
      description: `Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Longswords and Javelins.

Whenever you finish a Long Rest, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Halberds and Flails.`,
      activation: 'passive'
    },
    {
      id: 'paladin-fighting-style',
      name: 'Fighting Style',
      level: 2,
      summary: 'Gain a Fighting Style feat, or choose Blessed Warrior to learn two Cleric cantrips (Charisma-based).',
      description: `You gain a Fighting Style feat of your choice (see “Feats” for feats). Instead of choosing one of those feats, you can choose the option below.

**Blessed Warrior.** You learn two Cleric cantrips of your choice (see the Cleric class’s section for a list of Cleric spells). Guidance and Sacred Flame are recommended. The chosen cantrips count as Paladin spells for you, and Charisma is your spellcasting ability for them. Whenever you gain a Paladin level, you can replace one of these cantrips with another Cleric cantrip.`,
      activation: 'passive',
      choices: [
        {
          id: 'paladin-fighting-style',
          label: 'Fighting Style feat (or Blessed Warrior: two Cleric cantrips)',
          count: 1,
          type: 'feat',
          filter: 'fightingStyle'
        }
      ]
    },
    {
      id: 'paladin-smite',
      name: 'Paladin’s Smite',
      level: 2,
      summary: 'You always have Divine Smite prepared and can cast it once per Long Rest without a spell slot.',
      description: `You always have the Divine Smite spell prepared. In addition, you can cast it without expending a spell slot, but you must finish a Long Rest before you can cast it in this way again.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'bonus'
    },
    {
      id: 'paladin-channel-divinity',
      name: 'Channel Divinity',
      level: 3,
      summary: 'Two uses (three from level 11) of divine effects such as Divine Sense; regain one use on a Short Rest and all on a Long Rest.',
      description: `You can channel divine energy directly from the Outer Planes, using it to fuel magical effects. You start with one such effect: Divine Sense, which is described below. Other Paladin features give additional Channel Divinity effect options. Each time you use this class’s Channel Divinity, you choose which effect from this class to create.

You can use this class’s Channel Divinity twice. You regain one of its expended uses when you finish a Short Rest, and you regain all expended uses when you finish a Long Rest. You gain an additional use when you reach Paladin level 11.

If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class’s Spellcasting feature.

**Divine Sense.** As a Bonus Action, you can open your awareness to detect Celestials, Fiends, and Undead. For the next 10 minutes or until you have the Incapacitated condition, you know the location of any creature of those types within 60 feet of yourself, and you know its creature type. Within the same radius, you also detect the presence of any place or object that has been consecrated or desecrated, as with the Hallow spell.`,
      uses: { count: 'Channel Divinity', recharge: 'long' },
      activation: 'bonus'
    },
    {
      id: 'paladin-subclass',
      name: 'Paladin Subclass',
      level: 3,
      summary: 'Swear a sacred oath (Paladin subclass), which grants features at levels 3, 7, 15 and 20.',
      description: `You gain a Paladin subclass of your choice. The Oath of Devotion subclass is detailed after this class’s description. A subclass is a specialization that grants you features at certain Paladin levels. For the rest of your career, you gain each of your subclass’s features that are of your Paladin level or lower.`,
      activation: 'passive'
    },
    asi(4),
    {
      id: 'paladin-extra-attack',
      name: 'Extra Attack',
      level: 5,
      summary: 'Attack twice whenever you take the Attack action.',
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
      activation: 'passive'
    },
    {
      id: 'paladin-faithful-steed',
      name: 'Faithful Steed',
      level: 5,
      summary: 'You always have Find Steed prepared and can cast it once per Long Rest without a spell slot.',
      description: `You can call on the aid of an otherworldly steed. You always have the Find Steed spell prepared.

You can also cast the spell once without expending a spell slot, and you regain the ability to do so when you finish a Long Rest.`,
      uses: { count: 1, recharge: 'long' },
      activation: 'action'
    },
    {
      id: 'paladin-aura-of-protection',
      name: 'Aura of Protection',
      level: 6,
      summary: 'You and allies within a 10-foot Emanation add your Charisma modifier (minimum +1) to saving throws while you aren’t Incapacitated.',
      description: `You radiate a protective, unseeable aura in a 10-foot Emanation that originates from you. The aura is inactive while you have the Incapacitated condition.

You and your allies in the aura gain a bonus to saving throws equal to your Charisma modifier (minimum bonus of +1).

If another Paladin is present, a creature can benefit from only one Aura of Protection at a time; the creature chooses which aura while in them.`,
      activation: 'passive',
      effects: [{ target: 'save.all', op: 'add', value: 'max(1,mod.cha)', note: 'Aura of Protection (inactive while Incapacitated)' }]
    },
    asi(8),
    {
      id: 'paladin-abjure-foes',
      name: 'Abjure Foes',
      level: 9,
      summary: 'Magic action, 1 Channel Divinity: up to Cha mod creatures within 60 ft make a Wis save or are Frightened for 1 minute and limited to one action, move or Bonus Action per turn.',
      description: `As a Magic action, you can expend one use of this class’s Channel Divinity to overwhelm foes with awe. As you present your Holy Symbol or weapon, you can target a number of creatures equal to your Charisma modifier (minimum of one creature) that you can see within 60 feet of yourself. Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute or until it takes any damage. While Frightened in this way, a target can do only one of the following on its turns: move, take an action, or take a Bonus Action.`,
      activation: 'action'
    },
    {
      id: 'paladin-aura-of-courage',
      name: 'Aura of Courage',
      level: 10,
      summary: 'You and allies in your Aura of Protection have Immunity to the Frightened condition.',
      description: `You and your allies have Immunity to the Frightened condition while in your Aura of Protection. If a Frightened ally enters the aura, that condition has no effect on that ally while there.`,
      activation: 'passive',
      effects: [{ target: 'conditionImmunity', op: 'grant', value: 'frightened', note: 'Aura of Courage (inactive while Incapacitated)' }]
    },
    {
      id: 'paladin-radiant-strikes',
      name: 'Radiant Strikes',
      level: 11,
      summary: 'Your melee weapon and Unarmed Strike hits deal an extra 1d8 Radiant damage.',
      description: `Your strikes now carry supernatural power. When you hit a target with an attack roll using a Melee weapon or an Unarmed Strike, the target takes an extra 1d8 Radiant damage.`,
      activation: 'passive'
    },
    asi(12),
    {
      id: 'paladin-restoring-touch',
      name: 'Restoring Touch',
      level: 14,
      summary: 'Lay On Hands can also remove Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned at 5 pool points per condition.',
      description: `When you use Lay On Hands on a creature, you can also remove one or more of the following conditions from the creature: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned. You must expend 5 Hit Points from the healing pool of Lay On Hands for each of these conditions you remove; those points don’t also restore Hit Points to the creature.`,
      activation: 'passive'
    },
    asi(16),
    {
      id: 'paladin-aura-expansion',
      name: 'Aura Expansion',
      level: 18,
      summary: 'Your Aura of Protection becomes a 30-foot Emanation.',
      description: `Your Aura of Protection is now a 30-foot Emanation.`,
      activation: 'passive'
    },
    {
      id: 'paladin-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for (Boon of Truesight is recommended).',
      description: `You gain an Epic Boon feat (see “Feats”) or another feat of your choice for which you qualify. Boon of Truesight is recommended.`,
      activation: 'passive'
    }
  ],
  spellcasting: {
    ability: 'cha',
    progression: 'half',
    prepared: PREPARED,
    cantrips: [],
    spellList: 'paladin',
    focus: 'Holy Symbol'
  },
  multiclass: {
    prerequisite: 'Strength 13 and Charisma 13 (plus at least 13 in the primary ability of each of your current classes)',
    proficiencies: 'Hit Point Die, proficiency with Martial weapons, and training with Light and Medium armor and Shields'
  },
  quickBuild:
    'Make Strength your highest score, followed by Charisma, which powers your spells, Aura of Protection and Lay On Hands. Constitution is a good third choice. The Noble background fits the knightly ideal, and Acolyte or Soldier work well too. Take chain mail, a shield and a longsword (option A) and prepare Heroism and Searing Smite as your first spells.',
  tips: [
    'Divine Smite is a spell you cast as a Bonus Action right after you hit. Save it for critical hits or important targets, and remember you get one free cast per Long Rest.',
    'Lay On Hands is a pool of Hit Points you can split however you like. Even 1 point brings a dying ally back to consciousness.',
    'Charisma matters for more than talking: from level 6 your Aura of Protection adds it to your and nearby allies’ saving throws.',
    'Stay near your allies once you have Aura of Protection. Standing within 10 feet of the party is often worth more than chasing an enemy.',
    'Bless and Shield of Faith require Concentration. You can only concentrate on one spell at a time, so pick one to keep running.',
    'Channel Divinity regains one use on a Short Rest, so use Divine Sense and your oath’s options freely.',
    'Find Steed (from level 5) gives you a loyal mount and can be cast for free once per Long Rest.'
  ],
  recommended: {
    species: ['human', 'dragonborn', 'tiefling', 'dwarf', 'goliath', 'orc'],
    backgrounds: ['noble', 'acolyte', 'soldier', 'guard'],
    feats: ['savage-attacker', 'tough', 'alert', 'great-weapon-master', 'sentinel', 'polearm-master', 'war-caster', 'heavy-armor-master'],
    cantrips: ['guidance', 'sacred-flame'],
    spells: ['heroism', 'searing-smite', 'bless', 'shield-of-faith', 'command', 'cure-wounds', 'aid', 'find-steed', 'revivify'],
    weapons: ['longsword', 'greatsword', 'warhammer', 'glaive', 'halberd', 'javelin'],
    fightingStyles: ['defense', 'great-weapon-fighting', 'dueling', 'protection']
  }
}

export const paladinSubclasses: SubclassDef[] = [
  {
    id: 'oath-of-devotion',
    name: 'Oath of Devotion',
    kind: 'subclass',
    source: 'SRD 5.2',
    classId: 'paladin',
    summary: 'The classic knight in shining armor, devoted to justice and order, with a radiant Sacred Weapon and an aura against charms.',
    description: `*Uphold the Ideals of Justice and Order*

The Oath of Devotion binds Paladins to the ideals of justice and order. These Paladins meet the archetype of the knight in shining armor. They hold themselves to the highest standards of conduct, and some—for better or worse—hold the rest of the world to the same standards.

Many who swear this oath are devoted to gods of law and good and use their gods’ tenets as the measure of personal devotion. Others hold angels as their ideals and incorporate images of angelic wings into their helmets or coats of arms.

These paladins share the following tenets:
- Let your word be your promise.
- Protect the weak and never fear to act.
- Let your honorable deeds be an example.`,
    alwaysPrepared: [
      { level: 3, spells: ['protection-from-evil-and-good', 'shield-of-faith'] },
      { level: 5, spells: ['aid', 'zone-of-truth'] },
      { level: 9, spells: ['beacon-of-hope', 'dispel-magic'] },
      { level: 13, spells: ['freedom-of-movement', 'guardian-of-faith'] },
      { level: 17, spells: ['commune', 'flame-strike'] }
    ],
    features: [
      {
        id: 'devotion-oath-spells',
        name: 'Oath of Devotion Spells',
        level: 3,
        summary: 'You always have certain spells prepared at Paladin levels 3, 5, 9, 13 and 17.',
        description: `The magic of your oath ensures you always have certain spells ready; when you reach a Paladin level specified in the Oath of Devotion Spells table, you thereafter always have the listed spells prepared.

| Paladin Level | Spells |
|---|---|
| 3 | Protection from Evil and Good, Shield of Faith |
| 5 | Aid, Zone of Truth |
| 9 | Beacon of Hope, Dispel Magic |
| 13 | Freedom of Movement, Guardian of Faith |
| 17 | Commune, Flame Strike |`,
        activation: 'passive'
      },
      {
        id: 'devotion-sacred-weapon',
        name: 'Sacred Weapon',
        level: 3,
        summary: 'When you take the Attack action, spend 1 Channel Divinity: for 10 minutes add your Charisma modifier to attack rolls with a melee weapon, which can deal Radiant damage and sheds light.',
        description: `When you take the Attack action, you can expend one use of your Channel Divinity to imbue one Melee weapon that you are holding with positive energy. For 10 minutes or until you use this feature again, you add your Charisma modifier to attack rolls you make with that weapon (minimum bonus of +1), and each time you hit with it, you cause it to deal its normal damage type or Radiant damage.

The weapon also emits Bright Light in a 20-foot radius and Dim Light 20 feet beyond that.

You can end this effect early (no action required). This effect also ends if you aren’t carrying the weapon.`,
        activation: 'special'
      },
      {
        id: 'devotion-aura-of-devotion',
        name: 'Aura of Devotion',
        level: 7,
        summary: 'You and allies in your Aura of Protection have Immunity to the Charmed condition.',
        description: `You and your allies have Immunity to the Charmed condition while in your Aura of Protection. If a Charmed ally enters the aura, that condition has no effect on that ally while there.`,
        activation: 'passive',
        effects: [{ target: 'conditionImmunity', op: 'grant', value: 'charmed', note: 'Aura of Devotion (inactive while Incapacitated)' }]
      },
      {
        id: 'devotion-smite-of-protection',
        name: 'Smite of Protection',
        level: 15,
        summary: 'Whenever you cast Divine Smite, you and allies in your aura have Half Cover until the start of your next turn.',
        description: `Your magical smite now radiates protective energy. Whenever you cast Divine Smite, you and your allies have Half Cover while in your Aura of Protection. The aura has this benefit until the start of your next turn.`,
        activation: 'passive'
      },
      {
        id: 'devotion-holy-nimbus',
        name: 'Holy Nimbus',
        level: 20,
        summary: 'Bonus Action for 10 minutes: Advantage on saves forced by Fiends or Undead, enemies starting their turn in your aura take Radiant damage, and the aura is filled with sunlight. 1/Long Rest (or spend a level 5 slot).',
        description: `As a Bonus Action, you can imbue your Aura of Protection with holy power, granting the benefits below for 10 minutes or until you end them (no action required). Once you use this feature, you can’t use it again until you finish a Long Rest. You can also restore your use of it by expending a level 5 spell slot (no action required).

**Holy Ward.** You have Advantage on any saving throw you are forced to make by a Fiend or an Undead.

**Radiant Damage.** Whenever an enemy starts its turn in the aura, that creature takes Radiant damage equal to your Charisma modifier plus your Proficiency Bonus.

**Sunlight.** The aura is filled with Bright Light that is sunlight.`,
        uses: { count: 1, recharge: 'long' },
        activation: 'bonus'
      }
    ]
  },
  {
    id: 'oath-of-glory',
    name: 'Oath of Glory',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'paladin',
    summary: 'A paladin who strives for heroic deeds, boosting allies with inspiring smites and outstanding athleticism.',
    description: `Paladins of Glory believe they and their companions are destined for great deeds. Their Channel Divinity options grant Temporary Hit Points to allies after a smite or make them peerless athletes, and their aura increases the party’s speed. At high levels they can deflect attacks and become living legends. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['guiding-bolt', 'heroism'] },
      { level: 5, spells: ['enhance-ability', 'magic-weapon'] },
      { level: 9, spells: ['haste', 'protection-from-energy'] },
      { level: 13, spells: ['compulsion', 'freedom-of-movement'] },
      { level: 17, spells: ['legend-lore', 'yolandes-regal-presence'] }
    ],
    features: [
      { id: 'glory-oath-spells', name: 'Oath of Glory Spells', level: 3, summary: 'You always have certain oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', description: 'You always have certain oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', activation: 'passive' },
      { id: 'glory-inspiring-smite', name: 'Inspiring Smite', level: 3, summary: 'After casting Divine Smite, spend a Channel Divinity use to share Temporary Hit Points among creatures near you.', description: 'After casting Divine Smite, spend a Channel Divinity use to share Temporary Hit Points among creatures near you.', activation: 'special' },
      { id: 'glory-peerless-athlete', name: 'Peerless Athlete', level: 3, summary: 'As a Bonus Action, spend a Channel Divinity use to gain Advantage on Athletics and Acrobatics checks and jump farther for a while.', description: 'As a Bonus Action, spend a Channel Divinity use to gain Advantage on Athletics and Acrobatics checks and jump farther for a while.', activation: 'bonus' },
      { id: 'glory-aura-of-alacrity', name: 'Aura of Alacrity', level: 7, summary: 'Your Speed increases by 10 feet, and allies who enter or start their turn in your aura also move faster.', description: 'Your Speed increases by 10 feet, and allies who enter or start their turn in your aura also move faster.', activation: 'passive', effects: [{ target: 'speed', op: 'add', value: 10, note: 'Aura of Alacrity' }] },
      { id: 'glory-glorious-defense', name: 'Glorious Defense', level: 15, summary: 'As a Reaction, add your Charisma modifier to the AC of yourself or an ally against an attack, and strike back if it misses; limited uses per Long Rest.', description: 'As a Reaction, add your Charisma modifier to the AC of yourself or an ally against an attack, and strike back if it misses; limited uses per Long Rest.', activation: 'reaction', uses: { count: 'mod.cha', recharge: 'long' } },
      { id: 'glory-living-legend', name: 'Living Legend', level: 20, summary: 'As a Bonus Action, become a legend for a short time: you gain Advantage on Charisma checks, can turn a missed attack into a hit and can reroll failed saves. Once per Long Rest (or spend a level 5 slot).', description: 'As a Bonus Action, become a legend for a short time: you gain Advantage on Charisma checks, can turn a missed attack into a hit and can reroll failed saves. Once per Long Rest (or spend a level 5 slot).', activation: 'bonus', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'oath-of-the-ancients',
    name: 'Oath of the Ancients',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'paladin',
    summary: 'A paladin sworn to protect light, life and nature, with entangling vines and an aura against magical damage.',
    description: `Paladins of the Ancients fight to preserve light, joy and the natural world against darkness. Their oath grants nature-themed spells and a Channel Divinity that restrains foes with spectral vines. Their aura shields allies from necrotic, psychic and radiant damage, and at high levels they become nearly impossible to kill. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['ensnaring-strike', 'speak-with-animals'] },
      { level: 5, spells: ['misty-step', 'moonbeam'] },
      { level: 9, spells: ['plant-growth', 'protection-from-energy'] },
      { level: 13, spells: ['ice-storm', 'stoneskin'] },
      { level: 17, spells: ['commune-with-nature', 'tree-stride'] }
    ],
    features: [
      { id: 'ancients-oath-spells', name: 'Oath of the Ancients Spells', level: 3, summary: 'You always have certain nature-themed oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', description: 'You always have certain nature-themed oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', activation: 'passive' },
      { id: 'ancients-natures-wrath', name: 'Nature’s Wrath', level: 3, summary: 'Spend a Channel Divinity use to conjure spectral vines that can Restrain nearby creatures (Strength save).', description: 'Spend a Channel Divinity use to conjure spectral vines that can Restrain nearby creatures (Strength save).', activation: 'action' },
      { id: 'ancients-aura-of-warding', name: 'Aura of Warding', level: 7, summary: 'You and allies in your Aura of Protection have Resistance to Necrotic, Psychic, and Radiant damage.', description: 'You and allies in your Aura of Protection have Resistance to Necrotic, Psychic, and Radiant damage.', activation: 'passive', effects: [{ target: 'resistance', op: 'grant', value: 'necrotic' }, { target: 'resistance', op: 'grant', value: 'psychic' }, { target: 'resistance', op: 'grant', value: 'radiant' }] },
      { id: 'ancients-undying-sentinel', name: 'Undying Sentinel', level: 15, summary: 'Once per Long Rest, when you would drop to 0 Hit Points, you drop to 1 instead and regain a burst of Hit Points; you also stop aging.', description: 'Once per Long Rest, when you would drop to 0 Hit Points, you drop to 1 instead and regain a burst of Hit Points; you also stop aging.', activation: 'special', uses: { count: 1, recharge: 'long' } },
      { id: 'ancients-elder-champion', name: 'Elder Champion', level: 20, summary: 'As a Bonus Action, take on the form of an ancient force of nature for a short time, regenerating Hit Points, casting spells faster and weakening enemies’ saves. Once per Long Rest (or spend a level 5 slot).', description: 'As a Bonus Action, take on the form of an ancient force of nature for a short time, regenerating Hit Points, casting spells faster and weakening enemies’ saves. Once per Long Rest (or spend a level 5 slot).', activation: 'bonus', uses: { count: 1, recharge: 'long' } }
    ]
  },
  {
    id: 'oath-of-vengeance',
    name: 'Oath of Vengeance',
    kind: 'subclass',
    source: 'PHB 2024',
    classId: 'paladin',
    summary: 'A relentless hunter of evildoers who marks a foe with a Vow of Enmity and pursues it without mercy.',
    description: `Paladins of Vengeance swear to punish those who commit grievous wrongs. Their Channel Divinity grants Advantage on attacks against a chosen enemy, and their features help them chase down and pin fleeing foes. At the highest level they take on a terrifying winged form. Full rules text is in the 2024 Player’s Handbook.`,
    alwaysPrepared: [
      { level: 3, spells: ['bane', 'hunters-mark'] },
      { level: 5, spells: ['hold-person', 'misty-step'] },
      { level: 9, spells: ['haste', 'protection-from-energy'] },
      { level: 13, spells: ['banishment', 'dimension-door'] },
      { level: 17, spells: ['hold-monster', 'scrying'] }
    ],
    features: [
      { id: 'vengeance-oath-spells', name: 'Oath of Vengeance Spells', level: 3, summary: 'You always have certain oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', description: 'You always have certain oath spells prepared at Paladin levels 3, 5, 9, 13 and 17.', activation: 'passive' },
      { id: 'vengeance-vow-of-enmity', name: 'Vow of Enmity', level: 3, summary: 'When you take the Attack action, spend a Channel Divinity use to gain Advantage on attacks against a chosen nearby creature for a minute.', description: 'When you take the Attack action, spend a Channel Divinity use to gain Advantage on attacks against a chosen nearby creature for a minute.', activation: 'special' },
      { id: 'vengeance-relentless-avenger', name: 'Relentless Avenger', level: 7, summary: 'When you hit with an Opportunity Attack, you can stop the target’s movement and then move toward it without provoking.', description: 'When you hit with an Opportunity Attack, you can stop the target’s movement and then move toward it without provoking.', activation: 'passive' },
      { id: 'vengeance-soul-of-vengeance', name: 'Soul of Vengeance', level: 15, summary: 'When the target of your Vow of Enmity makes an attack, you can use your Reaction to make a melee attack against it.', description: 'When the target of your Vow of Enmity makes an attack, you can use your Reaction to make a melee attack against it.', activation: 'reaction' },
      { id: 'vengeance-avenging-angel', name: 'Avenging Angel', level: 20, summary: 'As a Bonus Action, sprout spectral wings for a short time, gaining a Fly Speed and a frightening aura that makes enemies easier to hit. Once per Long Rest (or spend a level 5 slot).', description: 'As a Bonus Action, sprout spectral wings for a short time, gaining a Fly Speed and a frightening aura that makes enemies easier to hit. Once per Long Rest (or spend a level 5 slot).', activation: 'bonus', uses: { count: 1, recharge: 'long' } }
    ]
  }
]

export const paladinOptions: ClassOptionGroup[] = []
