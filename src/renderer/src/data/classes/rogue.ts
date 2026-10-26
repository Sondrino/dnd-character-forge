import type { ClassDef, SubclassDef, ClassOptionGroup, Feature } from '../../types'

const PROF = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]

const FEATURES_BY_LEVEL: string[][] = [
  ['Expertise', 'Sneak Attack', "Thieves' Cant", 'Weapon Mastery'],
  ['Cunning Action'],
  ['Rogue Subclass', 'Steady Aim'],
  ['Ability Score Improvement'],
  ['Cunning Strike', 'Uncanny Dodge'],
  ['Expertise'],
  ['Evasion', 'Reliable Talent'],
  ['Ability Score Improvement'],
  ['Subclass feature'],
  ['Ability Score Improvement'],
  ['Improved Cunning Strike'],
  ['Ability Score Improvement'],
  ['Subclass feature'],
  ['Devious Strikes'],
  ['Slippery Mind'],
  ['Ability Score Improvement'],
  ['Subclass feature'],
  ['Elusive'],
  ['Epic Boon'],
  ['Stroke of Luck']
]

const ASI_TEXT = `You gain the Ability Score Improvement feat (see "Feats") or another feat of your choice for which you qualify. You gain this feature again at Rogue levels 8, 10, 12, and 16.`

const asi = (level: number): Feature => ({
  id: `rogue-ability-score-improvement-${level}`,
  name: 'Ability Score Improvement',
  level,
  summary: 'Gain the Ability Score Improvement feat or another feat you qualify for.',
  description: ASI_TEXT,
  activation: 'passive',
  choices: [
    { id: `rogue-asi-${level}`, label: 'Ability Score Improvement or feat', count: 1, type: 'feat', filter: 'general' }
  ]
})

export const rogueClass: ClassDef = {
  id: 'rogue',
  name: 'Rogue',
  kind: 'class',
  source: 'SRD 5.2',
  summary:
    'A dexterous expert who relies on stealth, skill, and precise Sneak Attacks to overcome obstacles and enemies.',
  description: `**Core Rogue Traits**

| Trait | |
|---|---|
| Primary Ability | Dexterity |
| Hit Point Die | D8 per Rogue level |
| Saving Throw Proficiencies | Dexterity and Intelligence |
| Skill Proficiencies | *Choose 4:* Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Persuasion, Sleight of Hand, or Stealth |
| Weapon Proficiencies | Simple weapons and Martial weapons that have the Finesse or Light property |
| Tool Proficiencies | Thieves' Tools |
| Armor Training | Light armor |
| Starting Equipment | *Choose A or B:* (A) Leather Armor, 2 Daggers, Shortsword, Shortbow, 20 Arrows, Quiver, Thieves' Tools, Burglar's Pack, and 8 GP; or (B) 100 GP |

**Becoming a Rogue ...**

*As a Level 1 Character*
- Gain all the traits in the Core Rogue Traits table.
- Gain the Rogue's level 1 features, which are listed in the Rogue Features table.

*As a Multiclass Character*
- Gain the following traits from the Core Rogue Traits table: Hit Point Die, proficiency in one skill of your choice from the Rogue's skill list, proficiency with Thieves' Tools, and training with Light armor.
- Gain the Rogue's level 1 features, which are listed in the Rogue Features table.`,
  tags: ['martial', 'skills', 'stealth'],
  hitDie: 8,
  primaryAbility: ['dex'],
  savingThrows: ['dex', 'int'],
  skillChoices: {
    count: 4,
    options: [
      'acrobatics', 'athletics', 'deception', 'insight', 'intimidation',
      'investigation', 'perception', 'persuasion', 'sleightOfHand', 'stealth'
    ]
  },
  weaponProficiencies: ['simple', 'martial:finesse-or-light'],
  armorTraining: ['light'],
  toolProficiencies: ['thieves-tools'],
  startingEquipment: [
    {
      label: 'A',
      items: [
        { id: 'leather-armor' },
        { id: 'dagger', qty: 2 },
        { id: 'shortsword' },
        { id: 'shortbow' },
        { id: 'arrows', qty: 20 },
        { id: 'quiver' },
        { id: 'thieves-tools' },
        { id: 'burglars-pack' }
      ],
      gp: 8
    },
    { label: 'B', items: [], gp: 100 }
  ],
  subclassLevel: 3,
  table: FEATURES_BY_LEVEL.map((features, i) => ({
    level: i + 1,
    profBonus: PROF[i],
    features,
    columns: { 'Sneak Attack': `${Math.ceil((i + 1) / 2)}d6` }
  })),
  features: [
    {
      id: 'rogue-expertise',
      name: 'Expertise',
      level: 1,
      summary: 'Gain Expertise in two of your skill proficiencies (two more at Rogue level 6).',
      description: `You gain Expertise in two of your skill proficiencies of your choice. Sleight of Hand and Stealth are recommended if you have proficiency in them.

At Rogue level 6, you gain Expertise in two more of your skill proficiencies of your choice.`,
      activation: 'passive',
      choices: [{ id: 'rogue-expertise-1', label: 'Expertise (2 skills)', count: 2, type: 'expertise' }]
    },
    {
      id: 'rogue-sneak-attack',
      name: 'Sneak Attack',
      level: 1,
      summary:
        'Once per turn, deal extra damage (see the Sneak Attack column) when you hit with a Finesse or Ranged weapon and have Advantage or an ally next to the target.',
      description: `You know how to strike subtly and exploit a foe's distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or a Ranged weapon. The extra damage's type is the same as the weapon's type.

You don't need Advantage on the attack roll if at least one of your allies is within 5 feet of the target, the ally doesn't have the Incapacitated condition, and you don't have Disadvantage on the attack roll.

The extra damage increases as you gain Rogue levels, as shown in the Sneak Attack column of the Rogue Features table.`,
      activation: 'special',
      uses: { count: 1, recharge: 'turn' }
    },
    {
      id: 'rogue-thieves-cant',
      name: "Thieves' Cant",
      level: 1,
      summary: "You know Thieves' Cant and one other language of your choice.",
      description: `You picked up various languages in the communities where you plied your roguish talents. You know Thieves' Cant and one other language of your choice, which you choose from the language tables in "Character Creation."`,
      activation: 'passive',
      effects: [{ target: 'language', op: 'grant', value: 'thieves-cant', note: "Thieves' Cant" }],
      choices: [{ id: 'rogue-thieves-cant-language', label: 'Extra language', count: 1, type: 'language' }]
    },
    {
      id: 'rogue-weapon-mastery',
      name: 'Weapon Mastery',
      level: 1,
      summary: 'Use the mastery properties of two kinds of weapons you are proficient with; swap them after a Long Rest.',
      description: `Your training with weapons allows you to use the mastery properties of two kinds of weapons of your choice with which you have proficiency, such as Daggers and Shortbows.

Whenever you finish a Long Rest, you can change the kinds of weapons you chose. For example, you could switch to using the mastery properties of Scimitars and Shortswords.`,
      activation: 'passive',
      choices: [{ id: 'rogue-weapon-mastery', label: 'Weapon Mastery (2 weapons)', count: 2, type: 'weaponMastery' }]
    },
    {
      id: 'rogue-cunning-action',
      name: 'Cunning Action',
      level: 2,
      summary: 'Take the Dash, Disengage, or Hide action as a Bonus Action.',
      description: `Your quick thinking and agility allow you to move and act quickly. On your turn, you can take one of the following actions as a Bonus Action: Dash, Disengage, or Hide.`,
      activation: 'bonus'
    },
    {
      id: 'rogue-subclass',
      name: 'Rogue Subclass',
      level: 3,
      summary: 'Choose a Rogue subclass, which grants features at Rogue levels 3, 9, 13, and 17.',
      description: `You gain a Rogue subclass of your choice. The Thief subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Rogue levels. For the rest of your career, you gain each of your subclass's features that are of your Rogue level or lower.`,
      activation: 'passive'
    },
    {
      id: 'rogue-steady-aim',
      name: 'Steady Aim',
      level: 3,
      summary: "As a Bonus Action, gain Advantage on your next attack roll this turn if you haven't moved; your Speed becomes 0.",
      description: `As a Bonus Action, you give yourself Advantage on your next attack roll on the current turn. You can use this feature only if you haven't moved during this turn, and after you use it, your Speed is 0 until the end of the current turn.`,
      activation: 'bonus'
    },
    asi(4),
    {
      id: 'rogue-cunning-strike',
      name: 'Cunning Strike',
      level: 5,
      summary: 'Forgo Sneak Attack dice to add Poison, Trip, or Withdraw effects to your hit.',
      description: `You've developed cunning ways to use your Sneak Attack. When you deal Sneak Attack damage, you can add one of the following Cunning Strike effects. Each effect has a die cost, which is the number of Sneak Attack damage dice you must forgo to add the effect. You remove the die before rolling, and the effect occurs immediately after the attack's damage is dealt. For example, if you add the Poison effect, remove 1d6 from the Sneak Attack's damage before rolling.

If a Cunning Strike effect requires a saving throw, the DC equals 8 plus your Dexterity modifier and Proficiency Bonus.

**Poison (Cost: 1d6).** You add a toxin to your strike, forcing the target to make a Constitution saving throw. On a failed save, the target has the Poisoned condition for 1 minute. At the end of each of its turns, the Poisoned target repeats the save, ending the effect on itself on a success.

To use this effect, you must have a Poisoner's Kit on your person.

**Trip (Cost: 1d6).** If the target is Large or smaller, it must succeed on a Dexterity saving throw or have the Prone condition.

**Withdraw (Cost: 1d6).** Immediately after the attack, you move up to half your Speed without provoking Opportunity Attacks.`,
      activation: 'special'
    },
    {
      id: 'rogue-uncanny-dodge',
      name: 'Uncanny Dodge',
      level: 5,
      summary: 'Use your Reaction to halve the damage of an attack that hits you from an attacker you can see.',
      description: `When an attacker that you can see hits you with an attack roll, you can take a Reaction to halve the attack's damage against you (round down).`,
      activation: 'reaction'
    },
    {
      id: 'rogue-expertise-6',
      name: 'Expertise',
      level: 6,
      summary: 'Gain Expertise in two more of your skill proficiencies.',
      description: `At Rogue level 6, you gain Expertise in two more of your skill proficiencies of your choice. (See the level 1 Expertise feature.)`,
      activation: 'passive',
      choices: [{ id: 'rogue-expertise-6', label: 'Expertise (2 more skills)', count: 2, type: 'expertise' }]
    },
    {
      id: 'rogue-evasion',
      name: 'Evasion',
      level: 7,
      summary: 'On Dexterity saves for half damage, take no damage on a success and half on a failure.',
      description: `You can nimbly dodge out of the way of certain dangers. When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You can't use this feature if you have the Incapacitated condition.`,
      activation: 'passive'
    },
    {
      id: 'rogue-reliable-talent',
      name: 'Reliable Talent',
      level: 7,
      summary: 'On ability checks using a skill or tool proficiency, treat a d20 roll of 9 or lower as a 10.',
      description: `Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10.`,
      activation: 'passive'
    },
    asi(8),
    asi(10),
    {
      id: 'rogue-improved-cunning-strike',
      name: 'Improved Cunning Strike',
      level: 11,
      summary: 'Use up to two Cunning Strike effects on one Sneak Attack, paying each cost.',
      description: `You can use up to two Cunning Strike effects when you deal Sneak Attack damage, paying the die cost for each effect.`,
      activation: 'passive'
    },
    asi(12),
    {
      id: 'rogue-devious-strikes',
      name: 'Devious Strikes',
      level: 14,
      summary: 'Adds Daze, Knock Out, and Obscure to your Cunning Strike options.',
      description: `You've practiced new ways to use your Sneak Attack deviously. The following effects are now among your Cunning Strike options.

**Daze (Cost: 2d6).** The target must succeed on a Constitution saving throw, or on its next turn, it can do only one of the following: move or take an action or a Bonus Action.

**Knock Out (Cost: 6d6).** The target must succeed on a Constitution saving throw, or it has the Unconscious condition for 1 minute or until it takes any damage. The Unconscious target repeats the save at the end of each of its turns, ending the effect on itself on a success.

**Obscure (Cost: 3d6).** The target must succeed on a Dexterity saving throw, or it has the Blinded condition until the end of its next turn.`,
      activation: 'special'
    },
    {
      id: 'rogue-slippery-mind',
      name: 'Slippery Mind',
      level: 15,
      summary: 'Gain proficiency in Wisdom and Charisma saving throws.',
      description: `Your cunning mind is exceptionally difficult to control. You gain proficiency in Wisdom and Charisma saving throws.`,
      activation: 'passive',
      effects: [
        { target: 'save.wis', op: 'proficiency', note: 'Slippery Mind' },
        { target: 'save.cha', op: 'proficiency', note: 'Slippery Mind' }
      ]
    },
    asi(16),
    {
      id: 'rogue-elusive',
      name: 'Elusive',
      level: 18,
      summary: "No attack roll has Advantage against you unless you're Incapacitated.",
      description: `You're so evasive that attackers rarely gain the upper hand against you. No attack roll can have Advantage against you unless you have the Incapacitated condition.`,
      activation: 'passive'
    },
    {
      id: 'rogue-epic-boon',
      name: 'Epic Boon',
      level: 19,
      summary: 'Gain an Epic Boon feat or another feat you qualify for.',
      description: `You gain an Epic Boon feat (see "Feats") or another feat of your choice for which you qualify. Boon of the Night Spirit is recommended.`,
      activation: 'passive',
      choices: [{ id: 'rogue-epic-boon', label: 'Epic Boon feat', count: 1, type: 'feat', filter: 'epicBoon' }]
    },
    {
      id: 'rogue-stroke-of-luck',
      name: 'Stroke of Luck',
      level: 20,
      summary: 'Turn a failed D20 Test into a 20 once per Short or Long Rest.',
      description: `You have a marvelous knack for succeeding when you need to. If you fail a D20 Test, you can turn the roll into a 20.

Once you use this feature, you can't use it again until you finish a Short or Long Rest.`,
      activation: 'special',
      uses: { count: 1, recharge: 'shortOrLong' }
    }
  ],
  multiclass: {
    prerequisite: 'Dexterity 13+',
    proficiencies:
      "Hit Point Die, proficiency in one skill of your choice from the Rogue's skill list, proficiency with Thieves' Tools, and training with Light armor."
  },
  quickBuild: `Put your highest score in Dexterity, since it drives your attacks, AC, and stealth. Make Intelligence your second-best score if you plan to become an Arcane Trickster; otherwise Constitution (for Hit Points) or Charisma (for social skills) are good picks. The Criminal background fits the class perfectly, giving you Stealth, Sleight of Hand, Thieves' Tools, and the Alert feat. Take the starting equipment for a shortsword, shortbow, and leather armor, and use Expertise on Stealth plus one skill your party relies on.`,
  tips: [
    'Sneak Attack works once per turn, not once per round: a Reaction attack (like an Opportunity Attack) on another creature\'s turn can trigger it again.',
    'You only need an ally within 5 feet of the target (and no Disadvantage) to Sneak Attack, so fight next to your frontliners.',
    'Cunning Action lets you Hide or Disengage as a Bonus Action every turn: shoot from range, then duck behind cover.',
    'Steady Aim gives Advantage when you stay still, which is ideal for ranged rogues behind cover.',
    'Choose Weapon Mastery for weapons you actually use; Vex (Shortsword, Shortbow) gives Advantage on your next attack, which helps you land Sneak Attack.',
    'Uncanny Dodge halves a big hit; save your Reaction for it when you are in melee.',
    'Expertise doubles your Proficiency Bonus on a skill; pick skills your party lacks, like Perception or Stealth.',
    "Keep Thieves' Tools handy and volunteer to scout, pick locks, and disarm traps — this is where you shine outside combat."
  ],
  recommended: {
    species: ['halfling', 'elf', 'human', 'gnome', 'tiefling'],
    backgrounds: ['criminal', 'charlatan', 'wayfarer', 'guide'],
    feats: ['alert', 'lucky', 'skilled', 'magic-initiate'],
    weapons: ['shortsword', 'shortbow', 'dagger', 'rapier', 'scimitar', 'hand-crossbow']
  }
}

export const rogueSubclasses: SubclassDef[] = [
  {
    id: 'thief',
    name: 'Thief',
    kind: 'subclass',
    classId: 'rogue',
    source: 'SRD 5.2',
    summary: 'Hunt for Treasure as a Classic Adventurer: a burglar, treasure hunter, and explorer who excels with magic items.',
    description: `*Hunt for Treasure as a Classic Adventurer*

A mix of burglar, treasure hunter, and explorer, you are the epitome of an adventurer. In addition to improving your agility and stealth, you gain abilities useful for delving into ruins and getting maximum benefit from the magic items you find there.`,
    features: [
      {
        id: 'thief-fast-hands',
        name: 'Fast Hands',
        level: 3,
        summary: 'As a Bonus Action, make a Sleight of Hand check, use Thieves\' Tools, take the Utilize action, or use a magic item that takes the Magic action.',
        description: `As a Bonus Action, you can do one of the following.

**Sleight of Hand.** Make a Dexterity (Sleight of Hand) check to pick a lock or disarm a trap with Thieves' Tools or to pick a pocket.

**Use an Object.** Take the Utilize action, or take the Magic action to use a magic item that requires that action.`,
        activation: 'bonus'
      },
      {
        id: 'thief-second-story-work',
        name: 'Second-Story Work',
        level: 3,
        summary: 'Gain a Climb Speed equal to your Speed, and use Dexterity for your jump distance.',
        description: `You've trained to get into especially hard-to-reach places, granting you these benefits.

**Climber.** You gain a Climb Speed equal to your Speed.

**Jumper.** You can determine your jump distance using your Dexterity rather than your Strength.`,
        activation: 'passive',
        effects: [{ target: 'speed.climb', op: 'set', value: 'speed', note: 'Second-Story Work' }]
      },
      {
        id: 'thief-supreme-sneak',
        name: 'Supreme Sneak',
        level: 9,
        summary: 'Gain the Stealth Attack Cunning Strike option, letting you stay Invisible from Hide after attacking from cover.',
        description: `You gain the following Cunning Strike option.

**Stealth Attack (Cost: 1d6).** If you have the Hide action's Invisible condition, this attack doesn't end that condition on you if you end the turn behind Three-Quarters Cover or Total Cover.`,
        activation: 'special'
      },
      {
        id: 'thief-use-magic-device',
        name: 'Use Magic Device',
        level: 13,
        summary: 'Attune to four magic items, sometimes save charges, and use any Spell Scroll.',
        description: `You've learned how to maximize use of magic items, granting you the following benefits.

**Attunement.** You can attune to up to four magic items at once.

**Charges.** Whenever you use a magic item property that expends charges, roll 1d6. On a roll of 6, you use the property without expending the charges.

**Scrolls.** You can use any Spell Scroll, using Intelligence as your spellcasting ability for the spell. If the spell is a cantrip or a level 1 spell, you can cast it reliably. If the scroll contains a higher-level spell, you must first succeed on an Intelligence (Arcana) check (DC 10 plus the spell's level). On a successful check, you cast the spell from the scroll. On a failed check, the scroll disintegrates.`,
        activation: 'passive'
      },
      {
        id: 'thief-thiefs-reflexes',
        name: "Thief's Reflexes",
        level: 17,
        summary: 'Take two turns in the first round of combat: at your Initiative and at your Initiative minus 10.',
        description: `You are adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat. You take your first turn at your normal Initiative and your second turn at your Initiative minus 10.`,
        activation: 'passive'
      }
    ]
  },
  {
    id: 'arcane-trickster',
    name: 'Arcane Trickster',
    kind: 'subclass',
    classId: 'rogue',
    source: 'PHB 2024',
    summary: 'A rogue who blends stealth and skill with arcane spells, using an invisible spectral hand for mischief.',
    description: `Arcane Tricksters learn to cast a limited number of Wizard spells using Intelligence, focusing on illusion, enchantment, and utility magic that supports sneaking and trickery. Their Mage Hand becomes invisible and can perform roguish tasks at a distance. As they advance, they use their spells to set up ambushes, combine their spectral hand with their Cunning Actions, and eventually steal spells from enemy casters. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['spellcasting', 'third-caster'],
    features: [
      { id: 'arcane-trickster-spellcasting', name: 'Spellcasting', level: 3, summary: 'You learn cantrips and a small number of Wizard spells, using Intelligence as your spellcasting ability.', description: 'You learn cantrips and a small number of Wizard spells, using Intelligence as your spellcasting ability.' },
      { id: 'arcane-trickster-mage-hand-legerdemain', name: 'Mage Hand Legerdemain', level: 3, summary: 'Your Mage Hand is invisible and can be used for roguish tasks like stealing or picking locks from a distance.', description: 'Your Mage Hand is invisible and can be used for roguish tasks like stealing or picking locks from a distance.' },
      { id: 'arcane-trickster-magical-ambush', name: 'Magical Ambush', level: 9, summary: 'Creatures have a harder time resisting spells you cast while hidden from them.', description: 'Creatures have a harder time resisting spells you cast while hidden from them.' },
      { id: 'arcane-trickster-versatile-trickster', name: 'Versatile Trickster', level: 13, summary: 'You can use your spectral hand to distract a nearby creature and gain Advantage against it.', description: 'You can use your spectral hand to distract a nearby creature and gain Advantage against it.' },
      { id: 'arcane-trickster-spell-thief', name: 'Spell Thief', level: 17, summary: 'You can negate a spell cast at you and temporarily steal the knowledge of it for yourself.', description: 'You can negate a spell cast at you and temporarily steal the knowledge of it for yourself.', activation: 'reaction' }
    ]
  },
  {
    id: 'assassin',
    name: 'Assassin',
    kind: 'subclass',
    classId: 'rogue',
    source: 'PHB 2024',
    summary: 'A rogue specialised in ambushes, disguises, and poison, striking hard before enemies can react.',
    description: `Assassins excel at striking first and decisively. They gain bonuses to Initiative and on attacks in the opening round of a fight, and they are trained with disguises and poisons. Higher-level features let them impersonate others, make their poisons more lethal, and deliver devastating killing blows to surprised foes. Full rules text is in the 2024 Player's Handbook.`,
    features: [
      { id: 'assassin-assassinate', name: 'Assassinate', level: 3, summary: 'You excel at the start of combat, with Advantage on Initiative and bonus effects against creatures that have not acted yet.', description: 'You excel at the start of combat, with Advantage on Initiative and bonus effects against creatures that have not acted yet.' },
      { id: 'assassin-assassins-tools', name: "Assassin's Tools", level: 3, summary: "You gain a Disguise Kit and a Poisoner's Kit and proficiency with both.", description: "You gain a Disguise Kit and a Poisoner's Kit and proficiency with both.", effects: [{ target: 'proficiency.tool', op: 'grant', value: 'disguise-kit' }, { target: 'proficiency.tool', op: 'grant', value: 'poisoners-kit' }] },
      { id: 'assassin-infiltration-expertise', name: 'Infiltration Expertise', level: 9, summary: 'You can mimic voices and handwriting convincingly, and Steady Aim no longer reduces your Speed to 0.', description: 'You can mimic voices and handwriting convincingly, and Steady Aim no longer reduces your Speed to 0.' },
      { id: 'assassin-envenom-weapons', name: 'Envenom Weapons', level: 13, summary: 'Your Poison Cunning Strike deals extra Poison damage that ignores Resistance.', description: 'Your Poison Cunning Strike deals extra Poison damage that ignores Resistance.' },
      { id: 'assassin-death-strike', name: 'Death Strike', level: 17, summary: 'Your Sneak Attacks in the first round of combat can force a save to avoid taking double damage.', description: 'Your Sneak Attacks in the first round of combat can force a save to avoid taking double damage.' }
    ]
  },
  {
    id: 'soulknife',
    name: 'Soulknife',
    kind: 'subclass',
    classId: 'rogue',
    source: 'PHB 2024',
    summary: 'A rogue with psionic power who manifests blades of psychic energy and bolsters skills with the mind.',
    description: `Soulknives tap a reserve of Psionic Energy Dice to boost failed skill checks and speak telepathically with allies. They can manifest psychic blades from their hands at will, which never need to be carried or hidden. Later they can guide missed blade attacks to their mark, teleport by throwing a blade, turn invisible through psychic veiling, and stun enemies by tearing at their minds. Full rules text is in the 2024 Player's Handbook.`,
    tags: ['psionic'],
    features: [
      { id: 'soulknife-psionic-power', name: 'Psionic Power', level: 3, summary: 'You gain Psionic Energy Dice that fuel psionic abilities, such as boosting a failed ability check or communicating telepathically.', description: 'You gain Psionic Energy Dice that fuel psionic abilities, such as boosting a failed ability check or communicating telepathically.' },
      { id: 'soulknife-psychic-blades', name: 'Psychic Blades', level: 3, summary: 'You can manifest blades of psychic energy to make melee or thrown attacks, including a quick follow-up blade.', description: 'You can manifest blades of psychic energy to make melee or thrown attacks, including a quick follow-up blade.' },
      { id: 'soulknife-soul-blades', name: 'Soul Blades', level: 9, summary: 'You can spend Psionic Energy to turn missed blade attacks into hits and to teleport by throwing a blade.', description: 'You can spend Psionic Energy to turn missed blade attacks into hits and to teleport by throwing a blade.' },
      { id: 'soulknife-psychic-veil', name: 'Psychic Veil', level: 13, summary: 'You can become Invisible for an extended time by weaving a psychic veil.', description: 'You can become Invisible for an extended time by weaving a psychic veil.' },
      { id: 'soulknife-rend-mind', name: 'Rend Mind', level: 17, summary: 'Your Sneak Attack with a psychic blade can leave the target Stunned.', description: 'Your Sneak Attack with a psychic blade can leave the target Stunned.' }
    ]
  }
]

export const rogueOptions: ClassOptionGroup[] = []
