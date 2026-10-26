// Equipment rules: weapon properties, mastery properties, coins etc. (SRD 5.2.1, CC-BY-4.0).
import type { RuleDef } from '../types'

const rule = (id: string, name: string, category: string, summary: string, description: string, tags?: string[]): RuleDef => ({
  id,
  name,
  kind: 'rule',
  source: 'SRD 5.2',
  category,
  summary,
  description,
  ...(tags ? { tags } : {})
})

const WP = 'Weapon Property'
const M = 'Mastery'
const EQ = 'Equipment'

export const rules: RuleDef[] = [
  /* ------------------------ Weapon Properties ----------------------- */
  rule(
    'property-ammunition',
    'Ammunition',
    WP,
    'Ranged attacks require and expend ammunition; recover half after a fight.',
    `You can use a weapon that has the Ammunition property to make a ranged attack only if you have ammunition to fire from it. The type of ammunition required is specified with the weapon’s range. Each attack expends one piece of ammunition. Drawing the ammunition is part of the attack (you need a free hand to load a one-handed weapon). After a fight, you can spend 1 minute to recover half the ammunition (round down) you used in the fight; the rest is lost.`
  ),
  rule(
    'property-finesse',
    'Finesse',
    WP,
    'Use Strength or Dexterity (same for attack and damage).',
    `When making an attack with a Finesse weapon, use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.`
  ),
  rule(
    'property-heavy',
    'Heavy',
    WP,
    'Disadvantage on attacks unless Strength 13+ (melee) or Dexterity 13+ (ranged).',
    `You have Disadvantage on attack rolls with a Heavy weapon if it’s a Melee weapon and your Strength score isn’t at least 13 or if it’s a Ranged weapon and your Dexterity score isn’t at least 13.`
  ),
  rule(
    'property-light',
    'Light',
    WP,
    'After attacking with a Light weapon, make one extra attack with a different Light weapon as a Bonus Action (no ability modifier to damage).',
    `When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don’t add your ability modifier to the extra attack’s damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don’t add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative.`
  ),
  rule(
    'property-loading',
    'Loading',
    WP,
    'Fire only one piece of ammunition per action, Bonus Action, or Reaction.',
    `You can fire only one piece of ammunition from a Loading weapon when you use an action, a Bonus Action, or a Reaction to fire it, regardless of the number of attacks you can normally make.`
  ),
  rule(
    'property-range',
    'Range',
    WP,
    'Normal/long range in feet; Disadvantage beyond normal range, no attacks beyond long range.',
    `A Range weapon has a range in parentheses after the Ammunition or Thrown property. The range lists two numbers. The first is the weapon’s normal range in feet, and the second is the weapon’s long range. When attacking a target beyond normal range, you have Disadvantage on the attack roll. You can’t attack a target beyond the long range.`
  ),
  rule(
    'property-reach',
    'Reach',
    WP,
    'Adds 5 feet to your reach, including for Opportunity Attacks.',
    `A Reach weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for Opportunity Attacks with it.`
  ),
  rule(
    'property-thrown',
    'Thrown',
    WP,
    'Throw the weapon for a ranged attack; draw it as part of the attack.',
    `If a weapon has the Thrown property, you can throw the weapon to make a ranged attack, and you can draw that weapon as part of the attack. If the weapon is a Melee weapon, use the same ability modifier for the attack and damage rolls that you use for a melee attack with that weapon.`
  ),
  rule(
    'property-two-handed',
    'Two-Handed',
    WP,
    'Requires two hands to attack.',
    `A Two-Handed weapon requires two hands when you attack with it.`
  ),
  rule(
    'property-versatile',
    'Versatile',
    WP,
    'Use with one or two hands; deals the damage in parentheses when used two-handed.',
    `A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack.`
  ),

  /* ----------------------- Mastery Properties ----------------------- */
  rule(
    'mastery-properties',
    'Mastery Properties',
    M,
    'Each weapon has a mastery property usable only with a feature such as Weapon Mastery.',
    `Each weapon has a mastery property, which is usable only by a character who has a feature, such as Weapon Mastery, that unlocks the property for the character.`
  ),
  rule(
    'mastery-cleave',
    'Cleave',
    M,
    'On a melee hit, make one extra attack against a second creature within 5 feet of the first (no ability modifier to damage). Once per turn.',
    `If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.`
  ),
  rule(
    'mastery-graze',
    'Graze',
    M,
    'On a miss, deal damage equal to the ability modifier used for the attack.',
    `If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.`
  ),
  rule(
    'mastery-nick',
    'Nick',
    M,
    'Make the Light property’s extra attack as part of the Attack action instead of a Bonus Action. Once per turn.',
    `When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.`
  ),
  rule(
    'mastery-push',
    'Push',
    M,
    'On a hit, push a Large or smaller creature up to 10 feet away.',
    `If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.`
  ),
  rule(
    'mastery-sap',
    'Sap',
    M,
    'On a hit, the creature has Disadvantage on its next attack roll before your next turn.',
    `If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.`
  ),
  rule(
    'mastery-slow',
    'Slow',
    M,
    'On a hit that deals damage, reduce the creature’s Speed by 10 feet until your next turn.',
    `If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet.`
  ),
  rule(
    'mastery-topple',
    'Topple',
    M,
    'On a hit, force a Constitution save (DC 8 + ability modifier + PB) or the creature falls Prone.',
    `If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.`
  ),
  rule(
    'mastery-vex',
    'Vex',
    M,
    'On a hit that deals damage, gain Advantage on your next attack roll against that creature before the end of your next turn.',
    `If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn.`
  ),

  /* ---------------------------- Equipment --------------------------- */
  rule(
    'equipment-coins',
    'Coins',
    EQ,
    '1 GP = 10 SP = 100 CP; 1 EP = 1/2 GP; 1 PP = 10 GP. Fifty coins weigh a pound.',
    `Characters often find coins on their adventures and can spend those coins in shops, inns, and other businesses. Coins come in different denominations based on the relative worth of their material. The Coin Values table lists coins and how much they’re worth relative to the Gold Piece, which is the game’s main coin. For example, 100 Copper Pieces are worth 1 Gold Piece.

A coin weighs about a third of an ounce, so fifty coins weigh a pound.

| Coin | Value in GP |
|---|---|
| Copper Piece (CP) | 1/100 |
| Silver Piece (SP) | 1/10 |
| Electrum Piece (EP) | 1/2 |
| Gold Piece (GP) | 1 |
| Platinum Piece (PP) | 10 |`,
    ['coins', 'currency']
  ),
  rule(
    'equipment-selling',
    'Selling Equipment',
    EQ,
    'Equipment sells for half its cost; trade goods and valuables keep full value.',
    `Equipment fetches half its cost when sold. In contrast, trade goods and valuables—like gems and art objects—retain their full value in the marketplace. “Magic Items” has prices for magic items.`
  ),
  rule(
    'equipment-weapon-proficiency',
    'Weapon Proficiency',
    EQ,
    'You add your Proficiency Bonus to attack rolls only with weapons you are proficient with.',
    `Anyone can wield a weapon, but you must have proficiency with it to add your Proficiency Bonus to an attack roll you make with it. A player character’s features can provide weapon proficiencies. A monster is proficient with any weapon in its stat block.`
  ),
  rule(
    'equipment-armor-training',
    'Armor Training',
    EQ,
    'Wearing armor without training gives Disadvantage on Strength/Dexterity D20 Tests and prevents spellcasting; Shields need training for their AC bonus.',
    `Anyone can don armor or hold a Shield, but only those with training can use them effectively, as explained below. A character’s class and other features determine the character’s armor training. A monster has training with any armor in its stat block.

**Light, Medium, or Heavy Armor.** If you wear Light, Medium, or Heavy armor and lack training with it, you have Disadvantage on any D20 Test that involves Strength or Dexterity, and you can’t cast spells.

**Shield.** You gain the Armor Class benefit of a Shield only if you have training with it.

**One at a Time.** A creature can wear only one suit of armor at a time and wield only one Shield at a time.`
  ),
  rule(
    'equipment-tool-proficiency',
    'Tool Proficiency',
    EQ,
    'Add your Proficiency Bonus to checks using a tool you are proficient with; Advantage if a relevant skill also applies.',
    `If you have proficiency with a tool, add your Proficiency Bonus to any ability check you make that uses the tool. If you have proficiency in a skill that’s used with that check, you have Advantage on the check too.

Your features might give you proficiency with a tool. A monster has proficiency with any tool in its stat block.`
  ),
  rule(
    'equipment-crafting',
    'Crafting Nonmagical Items',
    EQ,
    'Craft with a proficient tool, raw materials worth half the cost, and 1 day per 10 GP of cost.',
    `To craft a nonmagical item, you need tools, raw materials, and time, each of which is detailed below. If you meet the requirements, you make the item, and you can use it or sell it at its normal price.

**Tools.** The “Tools” section of “Equipment” lists which tools are required to make certain items. The GM assigns required tools for items not listed there. You must use the required tool to make an item and have proficiency with that tool. Anyone who helps you must also have proficiency with it.

**Raw Materials.** To make an item, you need raw materials worth half its purchase cost (round down). For example, you need 750 GP of raw materials to make Plate Armor, which sells for 1,500 GP. The GM determines whether appropriate raw materials are available.

**Time.** To determine how many days (working 8 hours a day) it takes to make an item, divide its purchase cost in GP by 10 (round a fraction up to a day). For example, you need 5 days to make a Heavy Crossbow, which sells for 50 GP. If an item requires multiple days, the days needn’t be consecutive.

Characters can combine their efforts to shorten the crafting time. Divide the time needed to create an item by the number of characters working on it. Normally, only one other character can assist you, but the GM might allow more assistants.`
  ),
  rule(
    'equipment-brewing-potions-of-healing',
    'Brewing Potions of Healing',
    EQ,
    'With Herbalism Kit proficiency, brew a Potion of Healing with 25 GP of materials in 1 day.',
    `A character who has proficiency with the Herbalism Kit can create a Potion of Healing. Doing so requires using that kit and 25 GP of raw material over the course of 1 day (8 hours of work).`
  )
]
