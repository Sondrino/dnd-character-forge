import type { ClassOptionGroup, Effect, Feature, SubclassDef } from '../../types'

/**
 * Subclasses introduced in Tasha's Cauldron of Everything (2020) that were NOT reprinted in the
 * 2024 Player's Handbook. TCE is not open-licensed: only names, game-mechanical facts and short
 * summaries written in our own words. Read the full text in the book or on D&D Beyond.
 *
 * Adapted to the 2024 classes (official compatibility approach): every subclass starts at class
 * level 3, so features the 2014 subclass granted at levels 1–2 are gained at level 3; later
 * features keep their original levels. Domain/oath/circle/patron spells become always-prepared
 * spells. The 2014 cleric level-8 Divine Strike / Potent Spellcasting features are omitted because
 * the 2024 Cleric's Blessed Strikes replaces them.
 */

export const TCE = "Tasha's Cauldron of Everything"

type FeatureExtra = Partial<Omit<Feature, 'id' | 'name' | 'level' | 'summary'>> & { more?: string }

/** Feature: description = summary (+ more) unless a description is given */
export function ft(id: string, name: string, level: number, summary: string, extra: FeatureExtra = {}): Feature {
  const { more, description, ...rest } = extra
  return { id, name, level, summary, description: description ?? (more ? `${summary}\n\n${more}` : summary), activation: 'passive', ...rest }
}

export function sub(o: Omit<SubclassDef, 'kind' | 'source' | 'sourceBook'>): SubclassDef {
  return {
    ...o,
    kind: 'subclass',
    source: 'Supplement',
    sourceBook: TCE,
    tags: ['supplement', 'tce', ...(o.tags ?? [])]
  }
}

const ADAPT = '*Adapted to the 2024 class: subclass features from levels 1–2 arrive at level 3. Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'
const ADAPT_CLERIC =
  '*Adapted to the 2024 Cleric: level 1–2 features arrive at level 3, domain spells are always prepared, and the 2014 level-8 Divine Strike/Potent Spellcasting is left out because Blessed Strikes replaces it. Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'
const OWN = '*Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'

const spellsFeature = (id: string, name: string, levels: string, table: [number, string][]): Feature =>
  ft(id, name, 3, `You always have certain spells prepared at ${levels}; they don’t count against your number of prepared spells.`, {
    description: `You always have the listed spells prepared once you reach the class level shown; they don’t count against your prepared spells.\n\n| Level | Spells |\n|---|---|\n${table.map(([l, s]) => `| ${l} | ${s} |`).join('\n')}`
  })

const res = (value: string, note: string, condition?: string): Effect => ({ target: 'resistance', op: 'grant', value, note, ...(condition ? { condition } : {}) })

/* ============================== Barbarian ============================== */

const pathOfTheBeast = sub({
  id: 'path-of-the-beast',
  name: 'Path of the Beast',
  classId: 'barbarian',
  summary: 'A barbarian whose rage unleashes a bestial transformation: bite, claws or tail, then animal adaptations and a fury that spreads to allies.',
  description: `Barbarians of this path carry a beast inside them, whether from a curse, an ancestor or a bargain. Each time they rage they grow natural weapons, later adapt their body for swimming, climbing or leaping, and at high level let their savagery infect foes and rouse their allies into a pack.\n\n${ADAPT}`,
  features: [
    ft('beast-form-of-the-beast', 'Form of the Beast', 3, 'Whenever you enter a Rage, sprout a natural weapon until the Rage ends: a Bite, Claws or a Tail.', {
      activation: 'special',
      more: `You count as proficient with these weapons and use Strength for them.\n\n- **Bite** (1d8 piercing): once per turn, if you hit while below half your Hit Points, you regain Hit Points equal to your Proficiency Bonus.\n- **Claws** (1d6 slashing each): when you attack with a claw as part of the Attack action, you can make one extra claw attack (once per turn).\n- **Tail** (1d8 piercing, Reach): as a Reaction when a creature within 10 feet hits you, roll a d8 and add it to your AC against that attack.`
    }),
    ft('beast-bestial-soul', 'Bestial Soul', 6, 'Your natural weapons count as magical, and after each Short or Long Rest you choose an adaptation: swimming, climbing or jumping.', {
      more: 'Swimming gives a Swim Speed equal to your Speed and lets you breathe underwater. Climbing gives a Climb Speed equal to your Speed and lets you scale difficult surfaces, even upside down, without a check. Jumping lets you make a Strength (Athletics) check once per turn when you jump and add the result to the distance.',
      choices: [{ id: 'beast-bestial-soul-adaptation', label: 'Bestial Soul adaptation (change after each Short or Long Rest)', count: 1, type: 'option', options: ['Swimming', 'Climbing', 'Jumping'] }]
    }),
    ft('beast-infectious-fury', 'Infectious Fury', 10, 'When you hit with your natural weapons while raging, the target makes a Wisdom save or must either strike another creature you pick with its Reaction or take 2d12 psychic damage.', {
      activation: 'special',
      more: 'Save DC = 8 + your Constitution modifier + your Proficiency Bonus.',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('beast-call-the-hunt', 'Call the Hunt', 14, 'When you enter a Rage, rally willing creatures within 30 feet (up to your Constitution modifier, minimum 1): you gain 5 Temporary Hit Points per creature, and each adds 1d6 to one damage roll per turn for the Rage.', {
      activation: 'special',
      uses: { count: 'prof', recharge: 'long' }
    })
  ]
})

const pathOfWildMagic = sub({
  id: 'path-of-wild-magic',
  name: 'Path of Wild Magic',
  classId: 'barbarian',
  summary: 'A barbarian infused with untamed magic: each Rage triggers a random magical surge, and you can sense and share magic.',
  description: `These barbarians were touched by wild magic, perhaps in a place where the Feywild or a chaotic plane bleeds into the world. Their Rage sets off unpredictable magical effects, and they learn to sense magic, bolster allies’ spellcasting and eventually steer their surges.\n\n${ADAPT}`,
  features: [
    ft('wild-magic-magic-awareness', 'Magic Awareness', 3, 'As an action, sense the location of spells and magic items within 60 feet (not behind total cover) until the end of your next turn, including each spell’s school.', {
      activation: 'action',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('wild-magic-wild-surge', 'Wild Surge', 3, 'When you enter a Rage, roll a d8 on the Wild Magic table; the effect lasts until the Rage ends. Save DC = 8 + Proficiency Bonus + Constitution modifier.', {
      activation: 'special',
      more: `Wild Magic table (summary):\n\n1. Shadowy tendrils lash creatures you choose within 30 feet (Con save or 1d12 necrotic); you gain 1d12 Temporary Hit Points.\n2. Teleport up to 30 feet; repeat as a Bonus Action each turn.\n3. A spirit appears next to a creature within 30 feet and bursts at the end of the turn (Dex save or 1d6 force); summon it again as a Bonus Action.\n4. A weapon you hold deals force damage, gains Light and Thrown (20/60) and flies back to your hand.\n5. Creatures that hit you take 1d6 force damage.\n6. You and allies within 10 feet gain +1 AC.\n7. Ground within 15 feet becomes Difficult Terrain for your enemies.\n8. A bolt of light hits a creature within 30 feet (Con save or 1d6 radiant and Blinded until your next turn); repeat as a Bonus Action.`
    }),
    ft('wild-magic-bolstering-magic', 'Bolstering Magic', 6, 'As an action, touch a creature to give it either +1d3 to attack rolls and ability checks for 10 minutes, or the return of an expended spell slot of level 1d3 or lower.', {
      activation: 'action',
      more: 'A creature can regain a spell slot from this feature only once per Long Rest.',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('wild-magic-unstable-backlash', 'Unstable Backlash', 10, 'While raging, when you take damage or fail a saving throw, you can use your Reaction to roll on the Wild Magic table again, replacing your current effect.', { activation: 'reaction' }),
    ft('wild-magic-controlled-surge', 'Controlled Surge', 14, 'Whenever you roll on the Wild Magic table, roll twice and pick either result; if both dice match, you may choose any effect on the table.')
  ]
})

/* ================================ Bard ================================ */

const collegeOfCreation = sub({
  id: 'college-of-creation',
  name: 'College of Creation',
  classId: 'bard',
  summary: 'A bard who sings the Song of Creation: Bardic Inspiration gains extra motes of power, and performances conjure and animate objects.',
  description: `Bards of Creation believe the multiverse was sung into being and that echoes of that song still linger. Their inspiration carries little motes of creative power, their performances conjure useful items out of nothing, and later they can make an object dance and fight for them.\n\n${ADAPT}`,
  features: [
    ft('creation-mote-of-potential', 'Mote of Potential', 3, 'When you give Bardic Inspiration, a Tiny mote of potential orbits the creature and changes how the die works.', {
      more: 'Ability check: roll the Inspiration die twice and keep either result. Attack roll: after a hit, thunder bursts from the target; creatures of your choice within 5 feet of it make a Constitution save or take thunder damage equal to the die roll. Saving throw: the creature also gains Temporary Hit Points equal to the die roll + your Charisma modifier (minimum 1).'
    }),
    ft('creation-performance-of-creation', 'Performance of Creation', 3, 'As an action, create one nonmagical item worth up to 20 GP × your Bard level within 10 feet; it lasts for a number of hours equal to your Proficiency Bonus.', {
      activation: 'action',
      more: 'The item can be Medium or smaller (Large at Bard level 6, Huge at 14) and you can have only one at a time. You regain the use after a Long Rest or by expending a level 2+ spell slot.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('creation-animating-performance', 'Animating Performance', 6, 'As an action, animate a Large or smaller nonmagical object within 30 feet as a Dancing Item for 1 hour; it acts after you and obeys your Bonus Action commands.', {
      activation: 'action',
      more: 'The Dancing Item has AC 16 and 10 + 5 × your Bard level Hit Points, and you can use it to deliver Bardic Inspiration. Regain the use after a Long Rest or by expending a level 3+ spell slot.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('creation-creative-crescendo', 'Creative Crescendo', 14, 'Performance of Creation can make several items at once (up to your Charisma modifier, minimum 2), with no GP limit; one can be your maximum size, the rest Small or smaller.')
  ]
})

const collegeOfEloquence = sub({
  id: 'college-of-eloquence',
  name: 'College of Eloquence',
  classId: 'bard',
  summary: 'A master orator whose persuasive words never fall flat and whose Bardic Inspiration rarely goes to waste.',
  description: `Eloquence bards study rhetoric and the art of being heard. Their Persuasion and Deception never roll poorly, they can use Inspiration to undermine an enemy’s resolve, their inspiration isn’t lost when an ally fails, and they can make any creature understand them.\n\n${ADAPT}`,
  features: [
    ft('eloquence-silver-tongue', 'Silver Tongue', 3, 'When you make a Charisma (Persuasion) or Charisma (Deception) check, you can treat a d20 roll of 9 or lower as a 10.'),
    ft('eloquence-unsettling-words', 'Unsettling Words', 3, 'As a Bonus Action, expend a Bardic Inspiration use and roll the die: one creature within 60 feet subtracts the roll from the next saving throw it makes before the start of your next turn.', { activation: 'bonus' }),
    ft('eloquence-unfailing-inspiration', 'Unfailing Inspiration', 6, 'When a creature adds your Bardic Inspiration die to a roll and still fails, it keeps the die.'),
    ft('eloquence-universal-speech', 'Universal Speech', 6, 'As an action, let a number of creatures up to your Charisma modifier (minimum 1) within 60 feet understand you for 1 hour, whatever language you speak.', {
      activation: 'action',
      more: 'Regain the use after a Long Rest or by expending any spell slot.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('eloquence-infectious-inspiration', 'Infectious Inspiration', 14, 'When a creature within 60 feet succeeds on a roll using your Bardic Inspiration, you can use your Reaction to give another creature within 60 feet an Inspiration die without expending a use.', {
      activation: 'reaction',
      uses: { count: 'max(1,mod.cha)', recharge: 'long' }
    })
  ]
})

/* =============================== Cleric =============================== */

const orderDomain = sub({
  id: 'order-domain',
  name: 'Order Domain',
  classId: 'cleric',
  summary: 'A cleric of law and authority whose spells let allies strike on command and whose Channel Divinity compels obedience.',
  description: `The Order Domain represents discipline, hierarchy and devotion to law, whether of a god, a society or a strict code. These clerics wear heavy armor, turn their supportive spells into openings for allied attacks, and can force crowds to submit.\n\nThe 2014 level-17 Order’s Wrath originally triggered on Divine Strike; here it triggers on the damage of your Blessed Strikes (Divine Strike option).\n\n${ADAPT_CLERIC}`,
  alwaysPrepared: [
    { level: 3, spells: ['command', 'heroism', 'hold-person', 'zone-of-truth'] },
    { level: 5, spells: ['mass-healing-word', 'slow'] },
    { level: 7, spells: ['compulsion', 'locate-creature'] },
    { level: 9, spells: ['commune', 'dominate-person'] }
  ],
  features: [
    spellsFeature('order-domain-spells', 'Order Domain Spells', 'Cleric levels 3, 5, 7 and 9', [
      [3, 'Command, Heroism, Hold Person, Zone of Truth'], [5, 'Mass Healing Word, Slow'], [7, 'Compulsion, Locate Creature'], [9, 'Commune, Dominate Person']
    ]),
    ft('order-bonus-proficiencies', 'Bonus Proficiencies', 3, 'You gain training with Heavy armor and proficiency in Intimidation or Persuasion.', {
      effects: [{ target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Order Domain' }],
      choices: [{ id: 'order-skill', label: 'Order Domain skill', count: 1, type: 'skill', options: ['intimidation', 'persuasion'] }]
    }),
    ft('order-voice-of-authority', 'Voice of Authority', 3, 'When you cast a level 1+ spell with a spell slot that targets an ally, one targeted ally can use its Reaction to make one weapon attack against a creature you choose that it can see.', { activation: 'special' }),
    ft('order-orders-demand', 'Channel Divinity: Order’s Demand', 3, 'As a Magic action, spend a Channel Divinity use: creatures of your choice within 30 feet make a Wisdom save or are Charmed by you until the end of your next turn or until they take damage; you can also make them drop what they hold.', { activation: 'action' }),
    ft('order-embodiment-of-the-law', 'Embodiment of the Law', 6, 'When you cast a level 1+ Enchantment spell with a casting time of an action, you can cast it as a Bonus Action instead.', {
      activation: 'bonus',
      uses: { count: 'max(1,mod.wis)', recharge: 'long' }
    }),
    ft('order-orders-wrath', 'Order’s Wrath', 17, 'Once per turn, when you deal Divine Strike damage, you can curse the target until the start of your next turn; the next time an ally hits it, the attack deals an extra 2d8 psychic damage and the curse ends.', { activation: 'special' })
  ]
})

const peaceDomain = sub({
  id: 'peace-domain',
  name: 'Peace Domain',
  classId: 'cleric',
  summary: 'A cleric of harmony who binds allies together with magical bonds that boost their rolls and let them shield one another.',
  description: `Peace clerics serve gods of concord and fellowship. They link companions with an emboldening bond, heal while slipping through a battlefield, and later let bonded allies teleport to take a blow for one another.\n\n${ADAPT_CLERIC}`,
  alwaysPrepared: [
    { level: 3, spells: ['heroism', 'sanctuary', 'aid', 'warding-bond'] },
    { level: 5, spells: ['beacon-of-hope', 'sending'] },
    { level: 7, spells: ['aura-of-purity', 'resilient-sphere'] },
    { level: 9, spells: ['greater-restoration', 'telepathic-bond'] }
  ],
  features: [
    spellsFeature('peace-domain-spells', 'Peace Domain Spells', 'Cleric levels 3, 5, 7 and 9', [
      [3, 'Heroism, Sanctuary, Aid, Warding Bond'], [5, 'Beacon of Hope, Sending'], [7, 'Aura of Purity, Otiluke’s Resilient Sphere'], [9, 'Greater Restoration, Rary’s Telepathic Bond']
    ]),
    ft('peace-implement-of-peace', 'Implement of Peace', 3, 'You gain proficiency in Insight, Performance or Persuasion.', {
      choices: [{ id: 'peace-skill', label: 'Implement of Peace skill', count: 1, type: 'skill', options: ['insight', 'performance', 'persuasion'] }]
    }),
    ft('peace-emboldening-bond', 'Emboldening Bond', 3, 'As an action, bond a number of willing creatures within 30 feet (you can include yourself) equal to your Proficiency Bonus for 10 minutes; once per turn, a bonded creature near another can add 1d4 to an attack roll, ability check or saving throw.', {
      activation: 'action',
      more: 'The bonus applies while the creature is within 30 feet of another bonded creature.',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('peace-balm-of-peace', 'Channel Divinity: Balm of Peace', 3, 'As a Magic action, spend a Channel Divinity use to move up to your Speed without provoking Opportunity Attacks; each creature of your choice you pass within 5 feet of regains 2d6 + your Wisdom modifier Hit Points (once each).', { activation: 'action' }),
    ft('peace-protective-bond', 'Protective Bond', 6, 'When a bonded creature is about to take damage, another bonded creature within 30 feet can use its Reaction to teleport next to it and take all of that damage instead.', { activation: 'reaction' }),
    ft('peace-expansive-bond', 'Expansive Bond', 17, 'Your Emboldening Bond and Protective Bond work at 60 feet, and a creature that takes damage for an ally through Protective Bond has Resistance to it.')
  ]
})

const twilightDomain = sub({
  id: 'twilight-domain',
  name: 'Twilight Domain',
  classId: 'cleric',
  summary: 'A guardian of the night who sees far into darkness, grants allies a head start and shelters them in a sphere of soothing twilight.',
  description: `Twilight clerics protect travelers from the dangers of the night and ease the passage to rest. They wear heavy armor, have extraordinary Darkvision they can share, and their Channel Divinity creates a sphere of dim light that grants Temporary Hit Points or ends fear and charm.\n\n${ADAPT_CLERIC}`,
  alwaysPrepared: [
    { level: 3, spells: ['faerie-fire', 'sleep', 'moonbeam', 'see-invisibility'] },
    { level: 5, spells: ['aura-of-vitality', 'tiny-hut'] },
    { level: 7, spells: ['aura-of-life', 'greater-invisibility'] },
    { level: 9, spells: ['circle-of-power', 'mislead'] }
  ],
  features: [
    spellsFeature('twilight-domain-spells', 'Twilight Domain Spells', 'Cleric levels 3, 5, 7 and 9', [
      [3, 'Faerie Fire, Sleep, Moonbeam, See Invisibility'], [5, 'Aura of Vitality, Leomund’s Tiny Hut'], [7, 'Aura of Life, Greater Invisibility'], [9, 'Circle of Power, Mislead']
    ]),
    ft('twilight-bonus-proficiencies', 'Bonus Proficiencies', 3, 'You gain proficiency with Martial weapons and training with Heavy armor.', {
      effects: [
        { target: 'proficiency.weapon', op: 'grant', value: 'martial', note: 'Twilight Domain' },
        { target: 'proficiency.armor', op: 'grant', value: 'heavy', note: 'Twilight Domain' }
      ]
    }),
    ft('twilight-eyes-of-night', 'Eyes of Night', 3, 'You have Darkvision out to 300 feet. As an action, you can share it for 1 hour with willing creatures within 10 feet (up to your Wisdom modifier, minimum 1).', {
      activation: 'action',
      more: 'Regain the sharing use after a Long Rest or by expending any spell slot.',
      uses: { count: 1, recharge: 'long' },
      effects: [{ target: 'darkvision', op: 'min', value: 300, note: 'Eyes of Night' }]
    }),
    ft('twilight-vigilant-blessing', 'Vigilant Blessing', 3, 'As an action, give one creature (possibly yourself) Advantage on its next Initiative roll; the blessing ends after that roll or when you use this again.', { activation: 'action' }),
    ft('twilight-twilight-sanctuary', 'Channel Divinity: Twilight Sanctuary', 3, 'As an action, spend a Channel Divinity use to surround yourself with a 30-foot sphere of dim light for 1 minute; when a creature ends its turn inside, you can grant it 1d6 + your Cleric level Temporary Hit Points or end one Charmed or Frightened effect on it.', { activation: 'action' }),
    ft('twilight-steps-of-night', 'Steps of Night', 6, 'As a Bonus Action while in dim light or darkness, gain a Fly Speed equal to your Speed for 1 minute.', {
      activation: 'bonus',
      effects: [{ target: 'speed.fly', op: 'set', value: 'speed', condition: 'stepsOfNight', note: 'Steps of Night' }],
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('twilight-twilight-shroud', 'Twilight Shroud', 17, 'You and your allies have Half Cover while inside the sphere of your Twilight Sanctuary.')
  ]
})

/* ================================ Druid ================================ */

const circleOfSpores = sub({
  id: 'circle-of-spores',
  name: 'Circle of Spores',
  classId: 'druid',
  summary: 'A druid of decay and rebirth wreathed in necrotic spores, who can trade Wild Shape for a fungal symbiosis and raise the dead as fungal zombies.',
  description: `Spore druids see beauty in rot and the cycle that turns death into new life. An invisible halo of spores harms nearby foes, a Wild Shape use can be spent to bond with a fungal entity for Temporary Hit Points and necrotic strikes, and later they animate corpses and become nearly immune to debilitating conditions.\n\n${ADAPT}`,
  alwaysPrepared: [
    { level: 3, spells: ['chill-touch', 'blindness-deafness', 'gentle-repose'] },
    { level: 5, spells: ['animate-dead', 'gaseous-form'] },
    { level: 7, spells: ['blight', 'confusion'] },
    { level: 9, spells: ['cloudkill', 'contagion'] }
  ],
  features: [
    spellsFeature('spores-circle-spells', 'Circle of Spores Spells', 'Druid levels 3, 5, 7 and 9', [
      [3, 'Chill Touch, Blindness/Deafness, Gentle Repose'], [5, 'Animate Dead, Gaseous Form'], [7, 'Blight, Confusion'], [9, 'Cloudkill, Contagion']
    ]),
    ft('spores-halo-of-spores', 'Halo of Spores', 3, 'As a Reaction when a creature you can see moves into a space within 10 feet of you or starts its turn there, it makes a Constitution save against your spell save DC or takes 1d4 necrotic damage.', {
      activation: 'reaction',
      more: 'The damage becomes 1d6 at Druid level 6, 1d8 at level 10 and 1d10 at level 14.'
    }),
    ft('spores-symbiotic-entity', 'Symbiotic Entity', 3, 'As a Magic action, expend a Wild Shape use to gain 4 Temporary Hit Points per Druid level for 10 minutes; while they last, Halo of Spores rolls its damage die twice and your melee weapon attacks deal an extra 1d6 necrotic damage.', {
      activation: 'action',
      more: 'The effect ends early when the Temporary Hit Points are gone or when you use Wild Shape again.'
    }),
    ft('spores-fungal-infestation', 'Fungal Infestation', 6, 'As a Reaction when a Small or Medium Beast or Humanoid dies within 10 feet of you, animate it as a zombie with 1 Hit Point that obeys your mental commands for 1 hour.', {
      activation: 'reaction',
      uses: { count: 'max(1,mod.wis)', recharge: 'long' }
    }),
    ft('spores-spreading-spores', 'Spreading Spores', 10, 'While Symbiotic Entity is active, as a Bonus Action fill a 10-foot cube within 30 feet with spores for 1 minute; creatures moving into it or starting their turn there risk your Halo of Spores damage (Con save).', {
      activation: 'bonus',
      more: 'While the cube exists you can’t use the Halo of Spores Reaction.'
    }),
    ft('spores-fungal-body', 'Fungal Body', 14, 'You are immune to the Blinded, Deafened, Frightened and Poisoned conditions, and critical hits against you count as normal hits unless you are Incapacitated.', {
      effects: ['blinded', 'deafened', 'frightened', 'poisoned'].map((c) => ({ target: 'conditionImmunity', op: 'grant' as const, value: c, note: 'Fungal Body' }))
    })
  ]
})

const circleOfWildfire = sub({
  id: 'circle-of-wildfire',
  name: 'Circle of Wildfire',
  classId: 'druid',
  summary: 'A druid of destruction and renewal who summons a wildfire spirit companion and empowers fire and healing magic.',
  description: `Wildfire druids understand that fire clears the way for new growth. They spend Wild Shape to call a fiery spirit that fights beside them and teleports allies, add extra power to their fire and healing spells, and at high level the spirit can rekindle the druid from the brink of death.\n\n${ADAPT}`,
  alwaysPrepared: [
    { level: 3, spells: ['burning-hands', 'cure-wounds', 'flaming-sphere', 'scorching-ray'] },
    { level: 5, spells: ['plant-growth', 'revivify'] },
    { level: 7, spells: ['aura-of-life', 'fire-shield'] },
    { level: 9, spells: ['flame-strike', 'mass-cure-wounds'] }
  ],
  features: [
    spellsFeature('wildfire-circle-spells', 'Circle of Wildfire Spells', 'Druid levels 3, 5, 7 and 9', [
      [3, 'Burning Hands, Cure Wounds, Flaming Sphere, Scorching Ray'], [5, 'Plant Growth, Revivify'], [7, 'Aura of Life, Fire Shield'], [9, 'Flame Strike, Mass Cure Wounds']
    ]),
    ft('wildfire-summon-wildfire-spirit', 'Summon Wildfire Spirit', 3, 'As a Magic action, expend a Wild Shape use to summon a wildfire spirit within 30 feet for 1 hour; creatures other than you within 10 feet of where it appears make a Dexterity save or take 2d6 fire damage.', {
      activation: 'action',
      more: 'The spirit (AC 13, 5 + 5 × Druid level HP) acts on your Initiative after you and obeys your Bonus Action commands. It can hurl a Flame Seed (1d6 + Proficiency Bonus fire) or use Fiery Teleportation to move itself and willing allies, scorching creatures it leaves behind.'
    }),
    ft('wildfire-enhanced-bond', 'Enhanced Bond', 6, 'While your spirit is summoned, add a d8 to one damage or healing roll of any spell you cast that deals fire damage or restores Hit Points, and you can cast spells as if from the spirit’s space.'),
    ft('wildfire-cauterizing-flames', 'Cauterizing Flames', 10, 'When a Small or larger creature dies within 30 feet of you or your spirit, a spectral flame lingers in its space for 1 minute; as a Reaction when a creature enters that space, you can use the flame to heal it or burn it for 2d10 + your Wisdom modifier.', {
      activation: 'reaction',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('wildfire-blazing-revival', 'Blazing Revival', 14, 'If you drop to 0 Hit Points while your spirit is within 120 feet, you can make the spirit drop to 0 Hit Points instead; you regain half your Hit Points and stand up.', {
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    })
  ]
})

/* =============================== Fighter =============================== */

const RUNE_DC = 'Save DC = 8 + your Proficiency Bonus + your Constitution modifier. Each rune’s invoked effect can be used once per Short or Long Rest (twice from Fighter level 15).'

const runeKnight = sub({
  id: 'rune-knight',
  name: 'Rune Knight',
  classId: 'fighter',
  summary: 'A fighter who carves giant runes into gear for passive boons and invoked powers, and can grow to giant size in battle.',
  description: `Rune Knights learned the ancient rune magic of giants. Runes inscribed on their weapons and armor grant constant benefits and can be invoked for powerful effects, and the knight can swell to Large size, later growing taller and eventually Huge.\n\nRunes are chosen from the Rune Knight Runes options (Cloud, Fire, Frost, Stone; Hill and Storm from level 7). ${RUNE_DC}\n\n${OWN}`,
  features: [
    ft('rune-knight-bonus-proficiencies', 'Bonus Proficiencies', 3, 'You gain proficiency with Smith’s Tools and learn the Giant language.', {
      effects: [
        { target: 'proficiency.tool', op: 'grant', value: 'smiths-tools', note: 'Rune Knight' },
        { target: 'language', op: 'grant', value: 'giant', note: 'Rune Knight' }
      ]
    }),
    ft('rune-knight-rune-carver', 'Rune Carver', 3, 'You learn two runes and can inscribe each on a weapon, armor or other object you wear or carry after a Long Rest. You learn more runes at levels 7, 10 and 15.', {
      more: RUNE_DC,
      choices: [{ id: 'rune-knight-runes-3', label: 'Runes (2)', count: 2, type: 'option', filter: 'Rune Knight Runes' }]
    }),
    ft('rune-knight-giants-might', 'Giant’s Might', 3, 'As a Bonus Action, for 1 minute you become Large (if there is room), have Advantage on Strength checks and saving throws, and once per turn deal an extra 1d6 damage with a weapon or Unarmed Strike.', {
      activation: 'bonus',
      uses: { count: 'prof', recharge: 'long' },
      effects: [
        { target: 'check.str', op: 'advantage', condition: 'giantsMight', note: 'Giant’s Might' },
        { target: 'save.str', op: 'advantage', condition: 'giantsMight', note: 'Giant’s Might' }
      ]
    }),
    ft('rune-knight-runic-shield', 'Runic Shield', 7, 'As a Reaction when a creature you can see within 60 feet is hit by an attack, force the attacker to reroll the d20 and use the new roll.', {
      activation: 'reaction',
      uses: { count: 'prof', recharge: 'long' },
      choices: [{ id: 'rune-knight-runes-7', label: 'Rune learned at level 7', count: 1, type: 'option', filter: 'Rune Knight Runes' }]
    }),
    ft('rune-knight-great-stature', 'Great Stature', 10, 'You grow 3d4 inches taller, and the extra damage of Giant’s Might becomes 1d8.', {
      choices: [{ id: 'rune-knight-runes-10', label: 'Rune learned at level 10', count: 1, type: 'option', filter: 'Rune Knight Runes' }]
    }),
    ft('rune-knight-master-of-runes', 'Master of Runes', 15, 'You can invoke each of your runes twice instead of once per Short or Long Rest.', {
      choices: [{ id: 'rune-knight-runes-15', label: 'Rune learned at level 15', count: 1, type: 'option', filter: 'Rune Knight Runes' }]
    }),
    ft('rune-knight-runic-juggernaut', 'Runic Juggernaut', 18, 'Giant’s Might’s extra damage becomes 1d10, you can become Huge instead of Large, and your reach increases by 5 feet while enlarged.')
  ]
})

const rune = (id: string, name: string, level: number, summary: string, effects?: Effect[]): ClassOptionGroup['items'][number] => ({
  id,
  name,
  level,
  summary,
  description: `${level > 3 ? `*Prerequisite: Level ${level}+ Rune Knight*\n\n` : ''}${summary}\n\n${RUNE_DC}`,
  prerequisite: level > 3 ? `Level ${level}+ Rune Knight` : 'Rune Knight',
  activation: 'special',
  uses: { count: 1, recharge: 'shortOrLong' },
  source: 'Supplement',
  ...(effects ? { effects } : {})
})

export const tashaRuneOptions: ClassOptionGroup = {
  classId: 'fighter',
  group: 'Rune Knight Runes',
  source: 'Supplement',
  items: [
    rune('rune-cloud', 'Cloud Rune', 3, 'Advantage on Sleight of Hand and Deception checks. Invoke as a Reaction when you or a creature within 30 feet is hit by an attack to redirect the hit to another creature within 30 feet of you.', [
      { target: 'skill.sleightOfHand', op: 'advantage', note: 'Cloud Rune' },
      { target: 'skill.deception', op: 'advantage', note: 'Cloud Rune' }
    ]),
    rune('rune-fire', 'Fire Rune', 3, 'Double your Proficiency Bonus on checks with tools you are proficient with. Invoke when you hit with a weapon attack: the target takes an extra 2d6 fire damage and makes a Strength save or is Restrained by fiery shackles for 1 minute, burning 2d6 each turn until it escapes.'),
    rune('rune-frost', 'Frost Rune', 3, 'Advantage on Animal Handling and Intimidation checks. Invoke as a Bonus Action to gain +2 to Strength and Constitution checks and saving throws for 10 minutes.', [
      { target: 'skill.animalHandling', op: 'advantage', note: 'Frost Rune' },
      { target: 'skill.intimidation', op: 'advantage', note: 'Frost Rune' }
    ]),
    rune('rune-stone', 'Stone Rune', 3, 'Advantage on Insight checks and Darkvision 120 feet. Invoke as a Reaction when a creature you can see ends its turn within 30 feet: it makes a Wisdom save or is Charmed, Incapacitated and at Speed 0 in a dreamy stupor for 1 minute.', [
      { target: 'skill.insight', op: 'advantage', note: 'Stone Rune' },
      { target: 'darkvision', op: 'min', value: 120, note: 'Stone Rune' }
    ]),
    rune('rune-hill', 'Hill Rune', 7, 'Advantage on saves against being Poisoned and Resistance to poison damage. Invoke as a Bonus Action to gain Resistance to bludgeoning, piercing and slashing damage for 1 minute.', [
      res('poison', 'Hill Rune')
    ]),
    rune('rune-storm', 'Storm Rune', 7, 'Advantage on Arcana checks, and you can’t be surprised while not Incapacitated. Invoke as a Bonus Action to enter a prophetic state for 1 minute, using your Reaction to give Advantage or Disadvantage on a roll by a creature within 60 feet.', [
      { target: 'skill.arcana', op: 'advantage', note: 'Storm Rune' }
    ])
  ]
}

/* ================================= Monk ================================= */

const wayOfTheAstralSelf = sub({
  id: 'way-of-the-astral-self',
  name: 'Way of the Astral Self',
  classId: 'monk',
  summary: 'A monk who manifests a translucent astral form — spectral arms, a visage and eventually a full body — fighting with Wisdom-powered force.',
  description: `These monks believe their true self lives on the Astral Plane and learn to project it. Spectral arms strike with force using Wisdom, an astral visage sharpens their senses and voice, and at higher levels the full astral body protects them and lets them strike more often.\n\nThe 2014 “ki points” are the 2024 Monk’s Focus Points.\n\n${ADAPT}`,
  features: [
    ft('astral-self-arms', 'Arms of the Astral Self', 3, 'As a Bonus Action, spend 1 Focus Point to summon spectral arms for 10 minutes; creatures of your choice within 10 feet make a Dexterity save or take force damage equal to two rolls of your Martial Arts die.', {
      activation: 'bonus',
      more: 'While the arms are present you use Wisdom instead of Strength for Strength checks and saves, your Unarmed Strikes with the arms have 5 feet of extra reach, use Wisdom for attack and damage, and deal force damage.'
    }),
    ft('astral-self-visage', 'Visage of the Astral Self', 6, 'As a Bonus Action, spend 1 Focus Point to don an astral mask for 10 minutes: you see normally in darkness out to 120 feet, have Advantage on Insight and Intimidation, and can speak privately to one creature within 60 feet or boom out to 600 feet.', {
      activation: 'bonus',
      effects: [
        { target: 'darkvision', op: 'min', value: 120, condition: 'astralVisage', note: 'Visage of the Astral Self' },
        { target: 'skill.insight', op: 'advantage', condition: 'astralVisage', note: 'Visage of the Astral Self' },
        { target: 'skill.intimidation', op: 'advantage', condition: 'astralVisage', note: 'Visage of the Astral Self' }
      ]
    }),
    ft('astral-self-body', 'Body of the Astral Self', 11, 'While both arms and visage are summoned, you can use a Reaction to reduce acid, cold, fire, force, lightning or thunder damage by 1d10 + your Wisdom modifier, and once per turn your astral arms deal an extra Martial Arts die of damage.', { activation: 'reaction' }),
    ft('astral-self-awakened', 'Awakened Astral Self', 17, 'As a Bonus Action, spend 5 Focus Points to summon your arms, visage and body together for 10 minutes; you gain +2 AC and can make three astral-arm attacks instead of two when you take the Attack action.', {
      activation: 'bonus',
      effects: [{ target: 'ac', op: 'add', value: 2, condition: 'awakenedAstralSelf', note: 'Awakened Astral Self' }]
    })
  ]
})

/* =============================== Paladin =============================== */

const oathOfTheWatchers = sub({
  id: 'oath-of-the-watchers',
  name: 'Oath of the Watchers',
  classId: 'paladin',
  summary: 'A sentinel sworn to guard the mortal world against extraplanar threats, with mind-shielding auras and a talent for banishing intruders.',
  description: `Watchers stand guard against aberrations, fiends, fey, celestials and elementals that would meddle with the Material Plane. They protect their allies’ minds, make the whole party quicker to act, punish creatures that try to bend their will, and at the peak of their power can hurl planar intruders back where they came from.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['alarm', 'detect-magic'] },
    { level: 5, spells: ['moonbeam', 'see-invisibility'] },
    { level: 9, spells: ['counterspell', 'nondetection'] },
    { level: 13, spells: ['aura-of-purity', 'banishment'] },
    { level: 17, spells: ['hold-monster', 'scrying'] }
  ],
  features: [
    spellsFeature('watchers-oath-spells', 'Oath of the Watchers Spells', 'Paladin levels 3, 5, 9, 13 and 17', [
      [3, 'Alarm, Detect Magic'], [5, 'Moonbeam, See Invisibility'], [9, 'Counterspell, Nondetection'], [13, 'Aura of Purity, Banishment'], [17, 'Hold Monster, Scrying']
    ]),
    ft('watchers-watchers-will', 'Channel Divinity: Watcher’s Will', 3, 'As an action, spend a Channel Divinity use: you and creatures of your choice within 30 feet (up to your Charisma modifier, minimum 1) have Advantage on Intelligence, Wisdom and Charisma saving throws for 1 minute.', { activation: 'action' }),
    ft('watchers-abjure-the-extraplanar', 'Channel Divinity: Abjure the Extraplanar', 3, 'As an action, spend a Channel Divinity use: each Aberration, Celestial, Elemental, Fey or Fiend within 30 feet that can hear you makes a Wisdom save or is Turned for 1 minute or until it takes damage.', { activation: 'action' }),
    ft('watchers-aura-of-the-sentinel', 'Aura of the Sentinel', 7, 'You and creatures of your choice in your Aura of Protection add your Proficiency Bonus to Initiative rolls.', {
      more: 'In 2014 this aura had its own 10-foot radius (30 feet at level 18); with the 2024 Paladin it uses your Aura of Protection, which grows with Aura Expansion.',
      effects: [{ target: 'initiative', op: 'set', value: 'prof', note: 'Aura of the Sentinel' }]
    }),
    ft('watchers-vigilant-rebuke', 'Vigilant Rebuke', 15, 'As a Reaction when you or a creature you can see within 30 feet succeeds on an Intelligence, Wisdom or Charisma save, the creature that forced it takes 2d8 + your Charisma modifier force damage.', { activation: 'reaction' }),
    ft('watchers-mortal-bulwark', 'Mortal Bulwark', 20, 'As a Bonus Action, for 1 minute gain Truesight 120 feet and Advantage on attacks against Aberrations, Celestials, Elementals, Fey and Fiends; a creature of those types you hit makes a Charisma save or is banished to its native plane.', {
      activation: 'bonus',
      more: 'Regain the use after a Long Rest or by expending a level 5 spell slot.',
      uses: { count: 1, recharge: 'long' }
    })
  ]
})

/* =============================== Ranger =============================== */

const swarmkeeper = sub({
  id: 'swarmkeeper',
  name: 'Swarmkeeper',
  classId: 'ranger',
  summary: 'A ranger bonded to a swarm of nature spirits — insects, birds, pixies or petals — that harry foes, move you around and later carry you aloft.',
  description: `Swarmkeepers share their body with a cloud of tiny spirits. Once per turn the swarm adds damage to a hit, shoves the target or nudges you out of the way; later it lifts you into the air, grows mightier, and lets you scatter into the swarm to avoid harm.\n\n${OWN}`,
  alwaysPrepared: [
    { level: 3, spells: ['mage-hand', 'faerie-fire'] },
    { level: 5, spells: ['web'] },
    { level: 9, spells: ['gaseous-form'] },
    { level: 13, spells: ['arcane-eye'] },
    { level: 17, spells: ['insect-plague'] }
  ],
  features: [
    ft('swarmkeeper-gathered-swarm', 'Gathered Swarm', 3, 'Once on each of your turns after you hit a creature with an attack, the swarm can deal 1d6 piercing damage to it, push it 10 feet (Strength save), or move you 5 feet.', {
      activation: 'special',
      more: 'Save DC = your spell save DC. Movement from the swarm doesn’t provoke Opportunity Attacks.'
    }),
    spellsFeature('swarmkeeper-magic', 'Swarmkeeper Magic', 'Ranger levels 3, 5, 9, 13 and 17 (including the Mage Hand cantrip, shaped as the swarm)', [
      [3, 'Mage Hand, Faerie Fire'], [5, 'Web'], [9, 'Gaseous Form'], [13, 'Arcane Eye'], [17, 'Insect Plague']
    ]),
    ft('swarmkeeper-writhing-tide', 'Writhing Tide', 7, 'As a Bonus Action, the swarm lifts you: you gain a Fly Speed of 10 feet and can hover for 1 minute.', {
      activation: 'bonus',
      effects: [{ target: 'speed.fly', op: 'set', value: 10, condition: 'writhingTide', note: 'Writhing Tide' }],
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('swarmkeeper-mighty-swarm', 'Mighty Swarm', 11, 'Gathered Swarm’s damage becomes 1d8, a pushed creature can also be knocked Prone, and when the swarm moves you, you gain Half Cover until your next turn.'),
    ft('swarmkeeper-swarming-dispersal', 'Swarming Dispersal', 15, 'As a Reaction when you take damage, gain Resistance to it and teleport up to 30 feet as you dissolve into the swarm.', {
      activation: 'reaction',
      uses: { count: 'prof', recharge: 'long' }
    })
  ]
})

/* ================================ Rogue ================================ */

const phantom = sub({
  id: 'phantom',
  name: 'Phantom',
  classId: 'rogue',
  summary: 'A rogue who walks with the dead: borrowed skills from spirits, sneak attacks that wail through a second foe, and soul trinkets.',
  description: `Phantoms are haunted by death and draw power from the spirits around them. Whispering ghosts lend them a skill, their Sneak Attacks send necrotic wails into a second target, souls of the fallen become trinkets that protect them, and eventually they can turn partly incorporeal.\n\n${OWN}`,
  features: [
    ft('phantom-whispers-of-the-dead', 'Whispers of the Dead', 3, 'Whenever you finish a Short or Long Rest, gain proficiency in one skill or tool of your choice, replacing the one gained earlier with this feature.', {
      choices: [{ id: 'phantom-whispers', label: 'Whispers of the Dead: skill or tool (change after each rest)', count: 1, type: 'skill', filter: 'skillOrTool' }]
    }),
    ft('phantom-wails-from-the-grave', 'Wails from the Grave', 3, 'Right after you deal Sneak Attack damage, a second creature within 30 feet of the first takes necrotic damage equal to half your Sneak Attack dice (round up).', {
      activation: 'special',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('phantom-tokens-of-the-departed', 'Tokens of the Departed', 9, 'As a Reaction when a creature you can see dies within 30 feet, catch its soul as a trinket (maximum = Proficiency Bonus). While you carry one you have Advantage on Death Saving Throws and Constitution saves.', {
      activation: 'reaction',
      more: 'Destroy a trinket after a Sneak Attack to use Wails from the Grave without spending a use, or as an action to ask the departed spirit one question.'
    }),
    ft('phantom-ghost-walk', 'Ghost Walk', 13, 'As a Bonus Action, become ghostly for 10 minutes: Fly Speed 10 feet (hover), attacks against you have Disadvantage, and you can pass through creatures and objects (1d10 force damage if you end your turn inside one).', {
      activation: 'bonus',
      effects: [{ target: 'speed.fly', op: 'set', value: 10, condition: 'ghostWalk', note: 'Ghost Walk' }],
      more: 'Regain the use after a Long Rest or by destroying a soul trinket.',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('phantom-deaths-friend', 'Death’s Friend', 17, 'Wails from the Grave damages both the first and the second creature, and if you have no soul trinkets at the end of a Long Rest, one appears in your hand.')
  ]
})

/* =============================== Warlock =============================== */

const fathomlessPatron = sub({
  id: 'fathomless-patron',
  name: 'The Fathomless',
  classId: 'warlock',
  summary: 'A warlock bound to a power of the ocean depths, who conjures a spectral tentacle, swims like a sea creature and can vanish into any body of water.',
  description: `Fathomless patrons include krakens, ancient water elementals and forgotten sea gods. Their warlocks attack and shield with a spectral tentacle, gain a Swim Speed and water breathing, resist cold, always have Evard’s Black Tentacles ready, and can drag their allies through the depths to distant waters.\n\nThe 2014 expanded spell list is converted to always-prepared Patron spells at Warlock levels 3, 5, 7 and 9 (Summon Elemental as water only; Bigby’s Hand looks like a tentacle).\n\n${ADAPT}`,
  alwaysPrepared: [
    { level: 3, spells: ['create-or-destroy-water', 'thunderwave', 'gust-of-wind', 'silence'] },
    { level: 5, spells: ['lightning-bolt', 'sleet-storm'] },
    { level: 7, spells: ['control-water', 'summon-elemental'] },
    { level: 9, spells: ['arcane-hand', 'cone-of-cold'] },
    { level: 10, spells: ['black-tentacles'] }
  ],
  features: [
    spellsFeature('fathomless-spells', 'Fathomless Spells', 'Warlock levels 3, 5, 7 and 9', [
      [3, 'Create or Destroy Water, Thunderwave, Gust of Wind, Silence'], [5, 'Lightning Bolt, Sleet Storm'], [7, 'Control Water, Summon Elemental (water only)'], [9, 'Bigby’s Hand (as a tentacle), Cone of Cold']
    ]),
    ft('fathomless-tentacle-of-the-deeps', 'Tentacle of the Deeps', 3, 'As a Bonus Action, conjure a 10-foot spectral tentacle within 60 feet for 1 minute and make a melee spell attack against a creature within 10 feet of it: 1d8 cold damage and the target’s Speed drops by 10 feet until your next turn.', {
      activation: 'bonus',
      more: 'On later turns you can move the tentacle up to 30 feet and attack again as a Bonus Action. The damage becomes 2d8 at Warlock level 10.',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('fathomless-gift-of-the-sea', 'Gift of the Sea', 3, 'You gain a Swim Speed of 40 feet and can breathe underwater.', {
      effects: [{ target: 'speed.swim', op: 'min', value: 40, note: 'Gift of the Sea' }]
    }),
    ft('fathomless-oceanic-soul', 'Oceanic Soul', 6, 'You have Resistance to cold damage, and while fully submerged you and any submerged creature can understand each other’s speech.', {
      effects: [res('cold', 'Oceanic Soul')]
    }),
    ft('fathomless-guardian-coil', 'Guardian Coil', 6, 'As a Reaction when you or a creature you can see within 10 feet of your tentacle takes damage, reduce that damage by 1d8 (2d8 from Warlock level 10).', { activation: 'reaction' }),
    ft('fathomless-grasping-tentacles', 'Grasping Tentacles', 10, 'You always have Evard’s Black Tentacles prepared and can cast it once per Long Rest without a spell slot; when you cast it you gain Temporary Hit Points equal to your Warlock level, and damage can’t break your Concentration on it.', {
      activation: 'action',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('fathomless-fathomless-plunge', 'Fathomless Plunge', 14, 'As an action, teleport yourself and up to five willing creatures within 30 feet to the shore of a body of water you have seen within 1 mile.', {
      activation: 'action',
      uses: { count: 1, recharge: 'shortOrLong' }
    })
  ]
})

const geniePatron = sub({
  id: 'genie-patron',
  name: 'The Genie',
  classId: 'warlock',
  summary: 'A warlock serving a noble genie — dao, djinni, efreeti or marid — who carries the patron’s vessel, strikes with elemental wrath and can grant a limited wish.',
  description: `Genie warlocks receive a vessel from their patron (a lamp, ring, bottle or similar) that they can hide inside. Their attacks carry the genie’s element, they learn to fly and resist that element, can shelter their friends in the vessel, and finally borrow a sliver of their patron’s wish-granting magic.\n\nThe 2014 expanded spells become always-prepared Patron spells: Detect Evil and Good, Phantasmal Force, Create Food and Water, Phantasmal Killer and Creation for every kind, plus one spell per spell level for your kind (see Genie’s Vessel). TCE also adds Wish to your Warlock spell list (reachable through Mystic Arcanum).\n\n${ADAPT}`,
  alwaysPrepared: [
    { level: 3, spells: ['detect-evil-and-good', 'phantasmal-force'] },
    { level: 5, spells: ['create-food-and-water'] },
    { level: 7, spells: ['phantasmal-killer'] },
    { level: 9, spells: ['creation'] }
  ],
  features: [
    spellsFeature('genie-spells', 'Genie Spells', 'Warlock levels 3, 5, 7 and 9 (plus kind spells)', [
      [3, 'Detect Evil and Good, Phantasmal Force + kind spells of levels 1–2'], [5, 'Create Food and Water + kind spell'], [7, 'Phantasmal Killer + kind spell'], [9, 'Creation + kind spell']
    ]),
    ft('genie-genies-vessel', 'Genie’s Vessel', 3, 'Your patron gives you a Tiny vessel (AC = your spell save DC, HP = Warlock level + Proficiency Bonus) that works as a Spellcasting Focus. Choose your genie kind.', {
      activation: 'special',
      more: `**Bottled Respite.** As a Magic action, vanish into the vessel’s extradimensional space (20-foot radius) for up to twice your Proficiency Bonus in hours; once per Long Rest.\n\n**Genie’s Wrath.** Once on each of your turns when you hit with an attack roll, deal extra damage equal to your Proficiency Bonus.\n\n| Kind | Damage | Kind spells (1st–5th) |\n|---|---|---|\n| Dao | Bludgeoning | Sanctuary, Spike Growth, Meld into Stone, Stone Shape, Wall of Stone |\n| Djinni | Thunder | Thunderwave, Gust of Wind, Wind Wall, Greater Invisibility, Seeming |\n| Efreeti | Fire | Burning Hands, Scorching Ray, Fireball, Fire Shield, Flame Strike |\n| Marid | Cold | Fog Cloud, Blur, Sleet Storm, Control Water, Cone of Cold |`,
      uses: { count: 1, recharge: 'long' },
      choices: [{ id: 'genie-kind', label: 'Genie kind', count: 1, type: 'option', options: ['Dao', 'Djinni', 'Efreeti', 'Marid'] }]
    }),
    ft('genie-elemental-gift', 'Elemental Gift', 6, 'You gain Resistance to your genie’s damage type, and as a Bonus Action you can gain a Fly Speed of 30 feet (hover) for 10 minutes.', {
      activation: 'bonus',
      effects: [{ target: 'speed.fly', op: 'set', value: 30, condition: 'elementalGift', note: 'Elemental Gift' }],
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('genie-sanctuary-vessel', 'Sanctuary Vessel', 10, 'Bottled Respite can bring up to five willing creatures within 30 feet into the vessel; spending 10 minutes inside grants the benefits of a Short Rest, and creatures spending Hit Dice there add your Proficiency Bonus to the Hit Points regained.'),
    ft('genie-limited-wish', 'Limited Wish', 14, 'As an action, ask your patron for a spell of level 6 or lower from any class list with a casting time of an action, and cast it without components or a spell slot.', {
      activation: 'action',
      more: 'Afterward you can’t use this again until you finish 1d4 Long Rests.',
      uses: { count: 1, recharge: 'long' }
    })
  ]
})

/* ================================ Wizard ================================ */

const bladesinging = sub({
  id: 'bladesinging',
  name: 'Bladesinging',
  classId: 'wizard',
  summary: 'An elven-style tradition blending swordplay, dance and spellcasting: the Bladesong makes you fast, agile and hard to hit.',
  description: `Bladesingers fight with a weapon in hand and spells on their lips. Their Bladesong adds their Intelligence to AC and speeds them up, and they learn to attack twice (swapping one attack for a cantrip), turn spell slots into protection and add Intelligence to their melee damage.\n\nOriginally printed in the Sword Coast Adventurer’s Guide; this is the revised Tasha’s Cauldron version (open to any species).\n\n${ADAPT}`,
  features: [
    ft('bladesinging-training-in-war-and-song', 'Training in War and Song', 3, 'You gain training with Light armor, proficiency with one one-handed melee weapon of your choice, and proficiency in Performance.', {
      effects: [
        { target: 'proficiency.armor', op: 'grant', value: 'light', note: 'Training in War and Song' },
        { target: 'skill.performance', op: 'proficiency', note: 'Training in War and Song' }
      ],
      choices: [{ id: 'bladesinging-weapon', label: 'One-handed melee weapon', count: 1, type: 'option', options: ['Dagger', 'Handaxe', 'Light Hammer', 'Mace', 'Sickle', 'Spear', 'Battleaxe', 'Flail', 'Longsword', 'Morningstar', 'Rapier', 'Scimitar', 'Shortsword', 'Trident', 'War Pick', 'Warhammer', 'Whip'] }]
    }),
    ft('bladesinging-bladesong', 'Bladesong', 3, 'As a Bonus Action while not wearing Medium or Heavy armor or using a Shield, start the Bladesong for 1 minute: add your Intelligence modifier (minimum +1) to AC, gain 10 feet of Speed, Advantage on Acrobatics, and add your Intelligence modifier to Concentration saves.', {
      activation: 'bonus',
      more: 'It ends early if you are Incapacitated, don Medium or Heavy armor or a Shield, or use two hands to attack with a weapon.',
      uses: { count: 'prof', recharge: 'long' },
      effects: [
        { target: 'ac', op: 'add', value: 'max(1,mod.int)', condition: 'bladesong', note: 'Bladesong' },
        { target: 'speed', op: 'add', value: 10, condition: 'bladesong', note: 'Bladesong' },
        { target: 'skill.acrobatics', op: 'advantage', condition: 'bladesong', note: 'Bladesong' }
      ]
    }),
    ft('bladesinging-extra-attack', 'Extra Attack', 6, 'You can attack twice when you take the Attack action, and you can replace one of the attacks with casting a cantrip.'),
    ft('bladesinging-song-of-defense', 'Song of Defense', 10, 'While your Bladesong is active, as a Reaction when you take damage, expend a spell slot to reduce the damage by five times the slot’s level.', { activation: 'reaction' }),
    ft('bladesinging-song-of-victory', 'Song of Victory', 14, 'While your Bladesong is active, add your Intelligence modifier (minimum +1) to the damage of your melee weapon attacks.', {
      effects: [{ target: 'damage.melee', op: 'add', value: 'max(1,mod.int)', condition: 'bladesong', note: 'Song of Victory' }]
    })
  ]
})

const orderOfScribes = sub({
  id: 'order-of-scribes',
  name: 'Order of Scribes',
  classId: 'wizard',
  summary: 'A wizard whose spellbook awakens as a sentient companion: a magic quill, swappable damage types, spells cast through a spectral mind and quick scrolls.',
  description: `Scribes treat the written word as the heart of magic. Their quill copies spells in minutes, their awakened spellbook lets them change a spell’s damage type and speed up rituals, its spectral mind can deliver spells from afar, and eventually they create a free scroll every day and can sacrifice pages to avoid harm.\n\n${ADAPT}`,
  features: [
    ft('scribes-wizardly-quill', 'Wizardly Quill', 3, 'As a Bonus Action, conjure a magic quill that needs no ink; with it, copying a spell into your spellbook takes 2 minutes per spell level, and you can erase writing you made with it.', { activation: 'bonus' }),
    ft('scribes-awakened-spellbook', 'Awakened Spellbook', 3, 'Your spellbook is a Spellcasting Focus. When you cast a Wizard spell with a slot, you can swap its damage type for one from another spell of the same level in your book, and once per Long Rest you can cast a ritual in its normal casting time.', {
      activation: 'special',
      uses: { count: 1, recharge: 'long' }
    }),
    ft('scribes-manifest-mind', 'Manifest Mind', 6, 'As a Bonus Action, project your spellbook’s spectral mind (Tiny, dim light 10 feet, Darkvision 60 feet) within 60 feet; you can see and hear through it and cast Wizard spells as if from its space.', {
      activation: 'bonus',
      more: 'Casting through it is possible a number of times equal to your Proficiency Bonus per Long Rest (you can also restore a use by expending a spell slot). Move it up to 30 feet as a Bonus Action.',
      uses: { count: 'prof', recharge: 'long' }
    }),
    ft('scribes-master-scrivener', 'Master Scrivener', 10, 'After a Long Rest you can create a magic scroll of a level 1 or 2 spell (casting time of an action) from your spellbook; it casts at one level higher, only you can read it, and it vanishes after your next Long Rest. Crafting spell scrolls with your quill takes half the time and gold.'),
    ft('scribes-one-with-the-word', 'One with the Word', 14, 'You have Advantage on Arcana checks. As a Reaction when you take damage while your spectral mind is manifested, dismiss it to prevent all of that damage; you lose spells totaling 3d6 levels from your book for 1d6 Long Rests.', {
      activation: 'reaction',
      uses: { count: 1, recharge: 'long' },
      effects: [{ target: 'skill.arcana', op: 'advantage', note: 'One with the Word' }]
    })
  ]
})

export const tashaSubclasses: SubclassDef[] = [
  pathOfTheBeast,
  pathOfWildMagic,
  collegeOfCreation,
  collegeOfEloquence,
  orderDomain,
  peaceDomain,
  twilightDomain,
  circleOfSpores,
  circleOfWildfire,
  runeKnight,
  wayOfTheAstralSelf,
  oathOfTheWatchers,
  swarmkeeper,
  phantom,
  fathomlessPatron,
  geniePatron,
  bladesinging,
  orderOfScribes
]
