import type { SpellDef } from '../types'

/**
 * Spells fra 2024 Player's Handbook som ikke finnes i SRD 5.2.1.
 * Kun spillmekaniske fakta + korte sammendrag skrevet med egne ord (ikke boktekst).
 */
type SpellIn = Omit<SpellDef, 'kind' | 'source' | 'concentration' | 'ritual' | 'description'> & {
  ritual?: boolean
  description?: string
}

const BONUS_MELEE_HIT = 'Bonus Action, which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike'
const CONC_1MIN = 'Concentration, up to 1 minute'
const CONC_10MIN = 'Concentration, up to 10 minutes'
const CONC_1H = 'Concentration, up to 1 hour'

function sp(o: SpellIn): SpellDef {
  return {
    kind: 'spell',
    source: 'PHB 2024',
    concentration: o.duration.startsWith('Concentration'),
    ritual: o.ritual ?? false,
    ...o,
    description: o.description ?? o.summary,
    tags: [...(o.tags ?? []), 'phb-2024']
  }
}

const SUMMON_NOTE =
  'The spirit shares your Initiative but acts right after you, obeys your verbal commands, and uses the stat block from the Player’s Handbook scaled to the slot level.'

export const spellsPhb: SpellDef[] = [
  /* ----------------------------- Cantrips ----------------------------- */
  sp({
    id: 'blade-ward', name: 'Blade Ward', level: 0, school: 'Abjuration', castingTime: 'Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'Protective magic makes attacks against you less accurate.',
    description: 'For the duration, whenever a creature makes an attack roll against you, it subtracts 1d4 from the roll.'
  }),
  sp({
    id: 'friends', name: 'Friends', level: 0, school: 'Enchantment', castingTime: 'Action', range: '10 feet',
    components: { v: false, s: true, m: 'some makeup' }, duration: CONC_1MIN, classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'You magically make a nearby Humanoid feel friendly toward you.',
    description:
      'One Humanoid you can see makes a Wisdom save or has the Charmed condition for the duration. The effect ends early if the target takes damage or if you attack it or cast a spell on it, and the target realizes afterward that it was charmed.',
    save: 'wis'
  }),
  sp({
    id: 'mind-sliver', name: 'Mind Sliver', level: 0, school: 'Enchantment', castingTime: 'Action', range: '60 feet',
    components: { v: true, s: false }, duration: '1 round', classes: ['sorcerer', 'warlock', 'wizard'],
    summary: 'A psychic jab hurts a creature and weakens its next saving throw.',
    description:
      'The target makes an Intelligence save. On a failure it takes 1d6 Psychic damage and subtracts 1d4 from the next saving throw it makes before the end of your next turn.',
    higherLevels: 'The damage increases by 1d6 at levels 5, 11 and 17.',
    save: 'int', damage: { dice: '1d6', type: 'psychic', cantripScaling: true }
  }),
  sp({
    id: 'thorn-whip', name: 'Thorn Whip', level: 0, school: 'Transmutation', castingTime: 'Action', range: '30 feet',
    components: { v: true, s: true, m: 'the stem of a thorny plant' }, duration: 'Instantaneous', classes: ['druid'],
    summary: 'A thorny vine lashes a creature and can drag it toward you.',
    description:
      'Make a melee spell attack against a creature in range. On a hit it takes 1d6 Piercing damage, and if it is Large or smaller you can pull it up to 10 feet closer to you.',
    higherLevels: 'The damage increases by 1d6 at levels 5, 11 and 17.',
    attack: 'melee', damage: { dice: '1d6', type: 'piercing', cantripScaling: true }
  }),
  sp({
    id: 'thunderclap', name: 'Thunderclap', level: 0, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: false, s: true }, duration: 'Instantaneous', classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'],
    summary: 'A deafening boom bursts out from you, hurting creatures adjacent to you.',
    description: 'Each creature within 5 feet of you makes a Constitution save or takes 1d6 Thunder damage. The sound can be heard from far away.',
    higherLevels: 'The damage increases by 1d6 at levels 5, 11 and 17.',
    save: 'con', damage: { dice: '1d6', type: 'thunder', cantripScaling: true }
  }),
  sp({
    id: 'toll-the-dead', name: 'Toll the Dead', level: 0, school: 'Necromancy', castingTime: 'Action', range: '60 feet',
    components: { v: true, s: true }, duration: 'Instantaneous', classes: ['cleric', 'warlock', 'wizard'],
    summary: 'A mournful bell tolls for a creature, hitting harder if it is already wounded.',
    description:
      'The target makes a Wisdom save or takes 1d8 Necrotic damage, or 1d12 instead if it is missing any of its Hit Points.',
    higherLevels: 'The damage increases by one die at levels 5, 11 and 17.',
    save: 'wis', damage: { dice: '1d8', type: 'necrotic', cantripScaling: true }
  }),
  sp({
    id: 'word-of-radiance', name: 'Word of Radiance', level: 0, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false, m: 'a sunburst token' }, duration: 'Instantaneous', classes: ['cleric'],
    summary: 'You speak a holy word that sears chosen enemies next to you.',
    description: 'Each creature of your choice within 5 feet of you makes a Constitution save or takes 1d6 Radiant damage.',
    higherLevels: 'The damage increases by 1d6 at levels 5, 11 and 17.',
    save: 'con', damage: { dice: '1d6', type: 'radiant', cantripScaling: true }
  }),

  /* ----------------------------- Level 1 ------------------------------ */
  sp({
    id: 'armor-of-agathys', name: 'Armor of Agathys', level: 1, school: 'Abjuration', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true, m: 'a shard of blue glass' }, duration: '1 hour', classes: ['warlock'],
    summary: 'Frosty armor grants you Temporary Hit Points and chills anyone who hits you in melee.',
    description:
      'You gain 5 Temporary Hit Points. While you still have them, a creature that hits you with a melee attack takes 5 Cold damage.',
    higherLevels: 'Both the Temporary Hit Points and the Cold damage increase by 5 for each slot level above 1.',
    damage: { dice: '5', type: 'cold' }
  }),
  sp({
    id: 'arms-of-hadar', name: 'Arms of Hadar', level: 1, school: 'Conjuration', castingTime: 'Action', range: 'Self',
    components: { v: true, s: true }, duration: 'Instantaneous', classes: ['warlock'],
    summary: 'Dark tendrils burst out around you, harming nearby creatures and stopping their reactions.',
    description:
      'Each creature within 10 feet of you makes a Strength save, taking 2d6 Necrotic damage on a failure (half on a success). A creature that fails also cannot take Reactions until the start of its next turn.',
    higherLevels: 'The damage increases by 1d6 for each slot level above 1.',
    save: 'str', damage: { dice: '2d6', type: 'necrotic' }
  }),
  sp({
    id: 'chaos-bolt', name: 'Chaos Bolt', level: 1, school: 'Evocation', castingTime: 'Action', range: '120 feet',
    components: { v: true, s: true }, duration: 'Instantaneous', classes: ['sorcerer'],
    summary: 'A bolt of unpredictable energy whose damage type is determined by the dice, and which may leap to another target.',
    description:
      'Make a ranged spell attack. On a hit the target takes 2d8 + 1d6 damage, with the type chosen from one of the d8 results. If both d8s show the same number, the bolt can jump to another creature within 30 feet of the target.',
    higherLevels: 'Each target takes an extra 1d6 damage for each slot level above 1.',
    attack: 'ranged', damage: { dice: '2d8 + 1d6', type: 'varies' }
  }),
  sp({
    id: 'compelled-duel', name: 'Compelled Duel', level: 1, school: 'Enchantment', castingTime: 'Bonus Action', range: '30 feet',
    components: { v: true, s: false }, duration: CONC_1MIN, classes: ['paladin'],
    summary: 'You magically challenge a creature, forcing it to focus on you.',
    description:
      'The target makes a Wisdom save. On a failure it has Disadvantage on attacks against creatures other than you and is magically discouraged from moving far away from you. The spell ends early if you attack or target other creatures, or if an ally harms the target.',
    save: 'wis'
  }),
  sp({
    id: 'hail-of-thorns', name: 'Hail of Thorns', level: 1, school: 'Conjuration',
    castingTime: 'Bonus Action, which you take immediately after hitting a creature with a Ranged weapon', range: 'Self',
    components: { v: true, s: false }, duration: 'Instantaneous', classes: ['ranger'],
    summary: 'Your ranged hit bursts into a spray of thorns around the target.',
    description: 'The target and each creature within 5 feet of it make a Dexterity save, taking 1d10 Piercing damage on a failure or half on a success.',
    higherLevels: 'The damage increases by 1d10 for each slot level above 1.',
    save: 'dex', damage: { dice: '1d10', type: 'piercing' }
  }),
  sp({
    id: 'thunderous-smite', name: 'Thunderous Smite', level: 1, school: 'Evocation', castingTime: BONUS_MELEE_HIT, range: 'Self',
    components: { v: true, s: false }, duration: 'Instantaneous', classes: ['paladin'],
    summary: 'Your strike rings out with thunder, damaging the target and possibly knocking it back and down.',
    description:
      'The target takes an extra 2d6 Thunder damage. If it is a creature, it makes a Strength save or is pushed 10 feet away and has the Prone condition.',
    higherLevels: 'The damage increases by 1d6 for each slot level above 1.',
    save: 'str', damage: { dice: '2d6', type: 'thunder' }
  }),
  sp({
    id: 'wrathful-smite', name: 'Wrathful Smite', level: 1, school: 'Necromancy', castingTime: BONUS_MELEE_HIT, range: 'Self',
    components: { v: true, s: false }, duration: '1 minute', classes: ['paladin'],
    summary: 'Your strike deals extra Necrotic damage and can fill the target with dread.',
    description:
      'The target takes an extra 1d6 Necrotic damage and makes a Wisdom save or has the Frightened condition until the spell ends. It repeats the save at the end of each of its turns, ending the effect on a success.',
    higherLevels: 'The damage increases by 1d6 for each slot level above 1.',
    save: 'wis', damage: { dice: '1d6', type: 'necrotic' }
  }),
  sp({
    id: 'witch-bolt', name: 'Witch Bolt', level: 1, school: 'Evocation', castingTime: 'Action', range: '60 feet',
    components: { v: true, s: true, m: 'a twig struck by lightning' }, duration: CONC_1MIN, classes: ['sorcerer', 'warlock', 'wizard'],
    summary: 'A crackling beam of lightning links you to a target, letting you keep shocking it.',
    description:
      'Make a ranged spell attack; on a hit the target takes 2d12 Lightning damage. On later turns you can use a Bonus Action to deal 1d12 Lightning damage to it automatically while it remains in range and not behind total cover.',
    higherLevels: 'The initial damage increases by 1d12 for each slot level above 1.',
    attack: 'ranged', damage: { dice: '2d12', type: 'lightning' }
  }),

  /* ----------------------------- Level 2 ------------------------------ */
  sp({
    id: 'arcane-vigor', name: 'Arcane Vigor', level: 2, school: 'Abjuration', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true }, duration: 'Instantaneous', classes: ['sorcerer', 'wizard'],
    summary: 'You channel magic into your body to spend Hit Point Dice and heal immediately.',
    description:
      'Spend one or two of your unexpended Hit Point Dice, roll them, and regain Hit Points equal to the total plus your spellcasting ability modifier.',
    higherLevels: 'You can spend one additional Hit Die for each slot level above 2.',
    heal: '1–2 Hit Dice + spellcasting modifier'
  }),
  sp({
    id: 'beast-sense', name: 'Beast Sense', level: 2, school: 'Divination', castingTime: 'Action', range: 'Touch', ritual: true,
    components: { v: false, s: true }, duration: CONC_1H, classes: ['druid', 'ranger'],
    summary: 'You borrow the senses of a willing Beast.',
    description: 'You touch a willing Beast and can perceive through its senses for the duration, though you are blinded and deafened to your own surroundings while doing so.'
  }),
  sp({
    id: 'cloud-of-daggers', name: 'Cloud of Daggers', level: 2, school: 'Conjuration', castingTime: 'Action', range: '60 feet',
    components: { v: true, s: true, m: 'a sliver of glass' }, duration: CONC_1MIN, classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'A small cube of whirling magical daggers slashes anything inside it.',
    description: 'You fill a 5-foot cube with spinning blades. Creatures in the area take 4d4 Slashing damage, including when they enter it or end their turn there.',
    higherLevels: 'The damage increases by 2d4 for each slot level above 2.',
    damage: { dice: '4d4', type: 'slashing' }
  }),
  sp({
    id: 'cordon-of-arrows', name: 'Cordon of Arrows', level: 2, school: 'Transmutation', castingTime: 'Action', range: '5 feet',
    components: { v: true, s: true, m: 'four or more arrows or bolts' }, duration: '8 hours', classes: ['ranger'],
    summary: 'You plant enchanted ammunition in the ground that fires at intruders.',
    description: 'Ammunition you plant nearby guards the area, launching itself at creatures that come close (they can make a Dexterity save to avoid it). You can designate creatures the ammunition ignores.',
    save: 'dex'
  }),
  sp({
    id: 'crown-of-madness', name: 'Crown of Madness', level: 2, school: 'Enchantment', castingTime: 'Action', range: '120 feet',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'A twisted crown of iron spikes charms a Humanoid and drives it to attack those you choose.',
    description:
      'The target makes a Wisdom save or is Charmed, and on its turns it must attack a creature you mentally choose near it. You must use your action each turn to maintain control, and the target repeats the save at the end of its turns.',
    save: 'wis'
  }),
  sp({
    id: 'shadow-blade', name: 'Shadow Blade', level: 2, school: 'Illusion', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['sorcerer', 'warlock', 'wizard'],
    summary: 'You form a sword of solid shadow that deals psychic damage.',
    description:
      'The shadowy blade counts as a Simple Melee weapon you are proficient with, deals 2d8 Psychic damage, and has the Finesse, Light and Thrown properties. Attacks with it have Advantage when the target is in Dim Light or Darkness.',
    higherLevels: 'The damage increases by 1d8 for each slot level above 2.',
    attack: 'melee', damage: { dice: '2d8', type: 'psychic' }
  }),
  sp({
    id: 'summon-beast', name: 'Summon Beast', level: 2, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a feather, tuft of fur, and fish tail inside a gilded acorn worth 200+ GP' }, duration: CONC_1H,
    classes: ['druid', 'ranger'],
    summary: 'You call a bestial spirit of the air, land or water to fight alongside you.',
    description: `You summon a Bestial Spirit in an Air, Land or Water form. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),

  /* ----------------------------- Level 3 ------------------------------ */
  sp({
    id: 'aura-of-vitality', name: 'Aura of Vitality', level: 3, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false }, duration: CONC_1MIN, classes: ['cleric', 'druid', 'paladin'],
    summary: 'A healing aura surrounds you, letting you mend allies each turn.',
    description: 'Until the spell ends, you can use a Bonus Action on each of your turns to restore 2d6 Hit Points to one creature within 30 feet of you.',
    heal: '2d6'
  }),
  sp({
    id: 'blinding-smite', name: 'Blinding Smite', level: 3, school: 'Evocation', castingTime: BONUS_MELEE_HIT, range: 'Self',
    components: { v: true, s: false }, duration: '1 minute', classes: ['paladin'],
    summary: 'Your strike flares with radiance that can blind the target.',
    description:
      'The target takes an extra 3d8 Radiant damage and has the Blinded condition until the spell ends. It makes a Constitution save at the end of each of its turns, ending the effect on a success.',
    higherLevels: 'The damage increases by 1d8 for each slot level above 3.',
    save: 'con', damage: { dice: '3d8', type: 'radiant' }
  }),
  sp({
    id: 'conjure-barrage', name: 'Conjure Barrage', level: 3, school: 'Conjuration', castingTime: 'Action', range: 'Self (60-foot cone)',
    components: { v: true, s: true, m: 'a Melee or Ranged weapon worth at least 1 CP' }, duration: 'Instantaneous', classes: ['ranger'],
    summary: 'Your weapon multiplies into a cone of spectral copies that strike everything in front of you.',
    description: 'Each creature in a 60-foot cone makes a Dexterity save, taking 5d8 Force damage on a failure or half on a success.',
    higherLevels: 'The damage increases by 1d8 for each slot level above 3.',
    save: 'dex', damage: { dice: '5d8', type: 'force' }
  }),
  sp({
    id: 'crusaders-mantle', name: 'Crusader’s Mantle', level: 3, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false }, duration: CONC_1MIN, classes: ['paladin'],
    summary: 'A holy aura empowers the attacks of you and your allies with radiant energy.',
    description: 'You and allies within 30 feet of you deal an extra 1d4 Radiant damage when you hit with a weapon or an Unarmed Strike.',
    damage: { dice: '1d4', type: 'radiant' }
  }),
  sp({
    id: 'elemental-weapon', name: 'Elemental Weapon', level: 3, school: 'Transmutation', castingTime: 'Action', range: 'Touch',
    components: { v: true, s: true }, duration: CONC_1H, classes: ['paladin', 'ranger'],
    summary: 'You infuse a nonmagical weapon with elemental power.',
    description:
      'A nonmagical weapon you touch becomes magical. Choose Acid, Cold, Fire, Lightning or Thunder; the weapon deals an extra 1d4 damage of that type on a hit.',
    higherLevels: 'The extra damage increases with higher slot levels.',
    damage: { dice: '1d4', type: 'varies' }
  }),
  sp({
    id: 'feign-death', name: 'Feign Death', level: 3, school: 'Necromancy', castingTime: 'Action', range: 'Touch', ritual: true,
    components: { v: true, s: true, m: 'a pinch of graveyard dirt' }, duration: '1 hour', classes: ['bard', 'cleric', 'druid', 'wizard'],
    summary: 'A willing creature falls into a deathlike state that fools observers.',
    description:
      'The target appears dead to all inspection. It is Blinded and Incapacitated, its Speed is 0, and it has Resistance to all damage except Psychic damage.'
  }),
  sp({
    id: 'hunger-of-hadar', name: 'Hunger of Hadar', level: 3, school: 'Conjuration', castingTime: 'Action', range: '150 feet',
    components: { v: true, s: true, m: 'a pickled tentacle' }, duration: CONC_1MIN, classes: ['warlock'],
    summary: 'You open a gateway to a freezing void full of unseen, grasping mouths.',
    description:
      'A 20-foot-radius sphere of magical Darkness that is Difficult Terrain appears. Creatures starting their turn inside take 2d6 Cold damage, and those ending their turn inside must make a Dexterity save or take 2d6 Acid damage.',
    higherLevels: 'The Cold or Acid damage (your choice) increases by 1d6 for each slot level above 3.',
    save: 'dex', damage: { dice: '2d6', type: 'cold' }
  }),
  sp({
    id: 'lightning-arrow', name: 'Lightning Arrow', level: 3, school: 'Transmutation', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['ranger'],
    summary: 'Your next ranged weapon attack becomes a bolt of lightning that also blasts nearby creatures.',
    description:
      'The next time you make a ranged weapon attack, the target takes 4d8 Lightning damage on a hit (half on a miss) instead of the weapon’s damage, and creatures within 10 feet of it must make a Dexterity save or take 2d8 Lightning damage.',
    higherLevels: 'Both damage amounts increase by 1d8 for each slot level above 3.',
    save: 'dex', damage: { dice: '4d8', type: 'lightning' }
  }),
  sp({
    id: 'spirit-shroud', name: 'Spirit Shroud', level: 3, school: 'Necromancy', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['cleric', 'paladin', 'warlock', 'wizard'],
    summary: 'Spirits swirl around you, adding damage to your attacks and hindering nearby foes.',
    description:
      'Your attacks against creatures within 10 feet of you deal an extra 1d8 Cold, Necrotic or Radiant damage (your choice), and a creature you damage cannot regain Hit Points until your next turn. Enemies that start their turn near you also have their Speed reduced.',
    higherLevels: 'The extra damage increases by 1d8 for every two slot levels above 3.',
    damage: { dice: '1d8', type: 'varies' }
  }),
  sp({
    id: 'summon-fey', name: 'Summon Fey', level: 3, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a gilded flower worth 300+ GP' }, duration: CONC_1H, classes: ['druid', 'ranger', 'warlock', 'wizard'],
    summary: 'You call a Fey spirit in a mood of your choice to aid you.',
    description: `You summon a Fey Spirit in a Fuming, Mirthful or Tricksy mood, which can teleport around the battlefield. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),
  sp({
    id: 'summon-undead', name: 'Summon Undead', level: 3, school: 'Necromancy', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a gilded skull worth 300+ GP' }, duration: CONC_1H, classes: ['warlock', 'wizard'],
    summary: 'You call forth an undead spirit to serve you.',
    description: `You summon an Undead Spirit in a Ghostly, Putrid or Skeletal form. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),

  /* ----------------------------- Level 4 ------------------------------ */
  sp({
    id: 'aura-of-purity', name: 'Aura of Purity', level: 4, school: 'Abjuration', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false }, duration: CONC_10MIN, classes: ['paladin'],
    summary: 'A purifying aura protects you and nearby allies from poison and debilitating conditions.',
    description:
      'You and allies within 30 feet of you have Resistance to Poison damage and Advantage on saves against several harmful conditions, such as being Poisoned, Frightened or Charmed.'
  }),
  sp({
    id: 'fount-of-moonlight', name: 'Fount of Moonlight', level: 4, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_10MIN, classes: ['bard', 'druid'],
    summary: 'Cool moonlight wreathes you, empowering your melee attacks and protecting you.',
    description:
      'You shed light, gain Resistance to Radiant damage, and your melee attacks deal an extra 2d6 Radiant damage. When a creature damages you, you can use your Reaction to try to blind it.',
    damage: { dice: '2d6', type: 'radiant' }
  }),
  sp({
    id: 'staggering-smite', name: 'Staggering Smite', level: 4, school: 'Enchantment', castingTime: BONUS_MELEE_HIT, range: 'Self',
    components: { v: true, s: false }, duration: 'Instantaneous', classes: ['paladin'],
    summary: 'Your strike assaults the target’s mind and can leave it stunned.',
    description: 'The target takes an extra 4d6 Psychic damage and must make a Wisdom save or have the Stunned condition until the end of your next turn.',
    higherLevels: 'The damage increases by 1d6 for each slot level above 4.',
    save: 'wis', damage: { dice: '4d6', type: 'psychic' }
  }),
  sp({
    id: 'summon-aberration', name: 'Summon Aberration', level: 4, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a pickled tentacle and an eyeball in a platinum-inlaid vial worth 400+ GP' }, duration: CONC_1H,
    classes: ['warlock', 'wizard'],
    summary: 'You call an aberrant spirit from the Far Realm.',
    description: `You summon an Aberrant Spirit in a Beholderkin, Mind Flayer or Slaad form. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),
  sp({
    id: 'summon-construct', name: 'Summon Construct', level: 4, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a lockbox worth 400+ GP' }, duration: CONC_1H, classes: ['wizard'],
    summary: 'You call the spirit of a construct made of clay, metal or stone.',
    description: `You summon a Construct Spirit made of Clay, Metal or Stone. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),
  sp({
    id: 'summon-elemental', name: 'Summon Elemental', level: 4, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'air, a pebble, ash, and water inside a gold-inlaid vial worth 400+ GP' }, duration: CONC_1H,
    classes: ['druid', 'ranger', 'wizard'],
    summary: 'You call an elemental spirit of air, earth, fire or water.',
    description: `You summon an Elemental Spirit of Air, Earth, Fire or Water. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),

  /* ----------------------------- Level 5 ------------------------------ */
  sp({
    id: 'banishing-smite', name: 'Banishing Smite', level: 5, school: 'Conjuration', castingTime: BONUS_MELEE_HIT, range: 'Self',
    components: { v: true, s: false }, duration: CONC_1MIN, classes: ['paladin'],
    summary: 'Your strike deals heavy Force damage and can banish a weakened foe.',
    description: 'The target takes an extra 5d10 Force damage. If this leaves it with 50 Hit Points or fewer, it is banished to a harmless demiplane until the spell ends.',
    damage: { dice: '5d10', type: 'force' }
  }),
  sp({
    id: 'circle-of-power', name: 'Circle of Power', level: 5, school: 'Abjuration', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false }, duration: CONC_10MIN, classes: ['paladin'],
    summary: 'An aura of protective energy shields you and your allies from spells.',
    description:
      'You and allies within 30 feet of you have Advantage on saves against spells and other magical effects, and when an affected creature succeeds on a save that would deal half damage, it takes no damage instead.'
  }),
  sp({
    id: 'conjure-volley', name: 'Conjure Volley', level: 5, school: 'Conjuration', castingTime: 'Action', range: '150 feet',
    components: { v: true, s: true, m: 'a Melee or Ranged weapon worth at least 1 CP' }, duration: 'Instantaneous', classes: ['ranger'],
    summary: 'You rain down a storm of spectral weapons on a wide area.',
    description: 'Creatures in a 40-foot-radius cylinder make a Dexterity save, taking 8d8 Force damage on a failure or half on a success.',
    save: 'dex', damage: { dice: '8d8', type: 'force' }
  }),
  sp({
    id: 'destructive-wave', name: 'Destructive Wave', level: 5, school: 'Evocation', castingTime: 'Action', range: 'Self',
    components: { v: true, s: false }, duration: 'Instantaneous', classes: ['paladin'],
    summary: 'You strike the ground and release a shockwave of divine power.',
    description:
      'Creatures of your choice within 30 feet of you make a Constitution save. On a failure they take 5d6 Thunder damage plus 5d6 Radiant or Necrotic damage (your choice) and have the Prone condition; on a success they take half damage.',
    save: 'con', damage: { dice: '5d6 + 5d6', type: 'thunder + radiant/necrotic' }
  }),
  sp({
    id: 'holy-weapon', name: 'Holy Weapon', level: 5, school: 'Evocation', castingTime: 'Bonus Action', range: 'Touch',
    components: { v: true, s: true }, duration: CONC_1H, classes: ['cleric', 'paladin'],
    summary: 'A weapon glows with holy light and deals extra Radiant damage.',
    description:
      'The touched weapon sheds light and deals an extra 2d8 Radiant damage on a hit. You can end the spell early to release a burst of radiance that damages and can blind creatures of your choice nearby.',
    damage: { dice: '2d8', type: 'radiant' }
  }),
  sp({
    id: 'jallarzis-storm-of-radiance', name: 'Jallarzi’s Storm of Radiance', level: 5, school: 'Evocation', castingTime: 'Action', range: '120 feet',
    components: { v: true, s: true, m: 'a pinch of phosphorus' }, duration: CONC_1MIN, classes: ['warlock', 'wizard'],
    summary: 'A column of blinding light and thunder blasts an area.',
    description:
      'Creatures inside the storm are Blinded and Deafened and cannot cast spells with Verbal components. A creature that enters or ends its turn inside takes 2d10 Radiant and 2d10 Thunder damage (half on a successful Constitution save).',
    higherLevels: 'The Radiant and Thunder damage each increase by 1d10 for each slot level above 5.',
    save: 'con', damage: { dice: '2d10 + 2d10', type: 'radiant + thunder' }
  }),
  sp({
    id: 'steel-wind-strike', name: 'Steel Wind Strike', level: 5, school: 'Conjuration', castingTime: 'Action', range: '30 feet',
    components: { v: false, s: true, m: 'a Melee weapon worth 1+ SP' }, duration: 'Instantaneous', classes: ['ranger', 'wizard'],
    summary: 'You flash between up to five foes, striking each, then teleport next to one of them.',
    description: 'Make a melee spell attack against each of up to five creatures in range; each hit deals 6d10 Force damage. You can then teleport to a space next to one of the targets.',
    attack: 'melee', damage: { dice: '6d10', type: 'force' }
  }),
  sp({
    id: 'summon-celestial', name: 'Summon Celestial', level: 5, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a reliquary worth 500+ GP' }, duration: CONC_1H, classes: ['cleric', 'paladin'],
    summary: 'You call a Celestial spirit as an avenger or defender.',
    description: `You summon a Celestial Spirit in an Avenger or Defender form; it can also heal. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),
  sp({
    id: 'swift-quiver', name: 'Swift Quiver', level: 5, school: 'Transmutation', castingTime: 'Bonus Action', range: 'Self',
    components: { v: true, s: true, m: 'a quiver worth 1+ GP' }, duration: CONC_1MIN, classes: ['ranger'],
    summary: 'Your ammunition magically replenishes and you can fire extra shots each turn.',
    description: 'Until the spell ends, you can use a Bonus Action on each of your turns to make two extra attacks with a weapon that fires ammunition or a thrown weapon.'
  }),
  sp({
    id: 'synaptic-static', name: 'Synaptic Static', level: 5, school: 'Enchantment', castingTime: 'Action', range: '120 feet',
    components: { v: true, s: true }, duration: 'Instantaneous', classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'A burst of psychic noise damages minds in an area and scrambles their thinking.',
    description:
      'Creatures in a 20-foot-radius sphere make an Intelligence save, taking 8d6 Psychic damage on a failure or half on a success. Those that fail are left muddled for a while, subtracting a die from their attack rolls, ability checks and Concentration saves.',
    save: 'int', damage: { dice: '8d6', type: 'psychic' }
  }),
  sp({
    id: 'yolandes-regal-presence', name: 'Yolande’s Regal Presence', level: 5, school: 'Enchantment', castingTime: 'Action', range: 'Self',
    components: { v: true, s: true }, duration: CONC_1MIN, classes: ['bard', 'wizard'],
    summary: 'You project a commanding royal aura that punishes and humbles nearby foes.',
    description:
      'Creatures of your choice in a 10-foot emanation around you make a Wisdom save when they enter or start their turn there. On a failure they take 4d6 Psychic damage and are knocked Prone or pushed away from you; on a success they take half damage.',
    save: 'wis', damage: { dice: '4d6', type: 'psychic' }
  }),

  /* ----------------------------- Level 6+ ----------------------------- */
  sp({
    id: 'arcane-gate', name: 'Arcane Gate', level: 6, school: 'Conjuration', castingTime: 'Action', range: '500 feet',
    components: { v: true, s: true }, duration: CONC_10MIN, classes: ['sorcerer', 'warlock', 'wizard'],
    summary: 'You create two linked portals that creatures can step through to travel instantly between them.',
    description: 'Two circular portals appear in range, connected to each other. Anything that enters one exits from the other, and you can rotate the portals with a Bonus Action.'
  }),
  sp({
    id: 'summon-fiend', name: 'Summon Fiend', level: 6, school: 'Conjuration', castingTime: 'Action', range: '90 feet',
    components: { v: true, s: true, m: 'a bloody vial worth 600+ GP' }, duration: CONC_1H, classes: ['warlock', 'wizard'],
    summary: 'You call a fiendish spirit – a demon, devil or yugoloth – to fight for you.',
    description: `You summon a Fiendish Spirit in a Demon, Devil or Yugoloth form. ${SUMMON_NOTE}`,
    higherLevels: 'Use the slot level for the spell level in the stat block.'
  }),
  sp({
    id: 'tashas-bubbling-cauldron', name: 'Tasha’s Bubbling Cauldron', level: 6, school: 'Conjuration', castingTime: 'Action', range: '5 feet',
    components: { v: true, s: true, m: 'a gilded ladle worth 500+ GP' }, duration: '10 minutes', classes: ['warlock', 'wizard'],
    summary: 'You conjure a cauldron that bubbles with copies of a common potion you know.',
    description: 'A magical cauldron appears filled with a common potion of your choice, from which several bottles can be drawn and kept for a limited time.'
  }),
  sp({
    id: 'power-word-fortify', name: 'Power Word Fortify', level: 7, school: 'Enchantment', castingTime: 'Action', range: '60 feet',
    components: { v: true, s: false }, duration: 'Instantaneous', classes: ['bard', 'cleric'],
    summary: 'A word of power bolsters a group of allies with a large pool of Temporary Hit Points.',
    description: 'Divide 120 Temporary Hit Points as you like among up to six creatures you can see in range.',
    heal: '120 Temporary Hit Points (divided)'
  }),
  sp({
    id: 'psychic-scream', name: 'Psychic Scream', level: 9, school: 'Enchantment', castingTime: 'Action', range: '90 feet',
    components: { v: false, s: true }, duration: 'Instantaneous', classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    summary: 'You unleash a mental shriek that devastates the minds of up to ten creatures.',
    description:
      'Up to ten creatures in range make an Intelligence save. On a failure they take 14d6 Psychic damage and are Stunned (repeating the save each turn); on a success they take half damage.',
    save: 'int', damage: { dice: '14d6', type: 'psychic' }
  })
]
