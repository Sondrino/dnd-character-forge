// Magic items from the 2024 Dungeon Master's Guide that are not in the SRD 5.2.1.
// Only names, game-mechanical facts (rarity, type, attunement, charges, bonuses) and
// short summaries written in our own words. Source is tagged 'PHB 2024' (app convention for non-SRD books).
import type { Effect, MagicItemDef } from '../types'

const PHB = 'PHB 2024' as const

type Rarity = MagicItemDef['rarity']

function item(
  id: string,
  name: string,
  itemType: string,
  rarity: Rarity,
  attunement: boolean | string,
  summary: string,
  extra: Partial<MagicItemDef> & { more?: string } = {}
): MagicItemDef {
  const { more, ...rest } = extra
  return {
    id,
    name,
    kind: 'magicItem',
    source: PHB,
    itemType,
    rarity,
    attunement,
    summary,
    description: more ? `${summary}\n\n${more}` : summary,
    tags: ['dmg-2024'],
    ...rest
  }
}

const RAR: Rarity[] = ['uncommon', 'rare', 'very rare']

/** +1/+2/+3 spellcasting focus items: bonus to spell attack rolls and spell save DC */
function focusVariants(
  baseId: string,
  baseName: string,
  itemType: string,
  attunement: string,
  classLabel: string,
  perk: string,
  weapon = false
): MagicItemDef[] {
  return [1, 2, 3].map((n) => {
    const effects: Effect[] = [
      { target: 'spell.attack', op: 'add', value: n, note: `${baseName}: ${classLabel} spells only` },
      { target: 'spell.dc', op: 'add', value: n, note: `${baseName}: ${classLabel} spells only` }
    ]
    return item(
      `${baseId}-plus-${n}`,
      `${baseName}, +${n}`,
      itemType,
      RAR[n - 1],
      attunement,
      `While holding it, you gain a +${n} bonus to spell attack rolls and to the saving throw DCs of your ${classLabel} spells${weapon ? `, and a +${n} bonus to attack and damage rolls made with it` : ''}.`,
      { bonus: n, effects, tags: ['dmg-2024', `variant:${baseId}`], more: perk }
    )
  })
}

export const magicItemsDmg: MagicItemDef[] = [
  /* ---------------- class spellcasting foci (+1/+2/+3) ---------------- */
  ...focusVariants(
    'rod-of-the-pact-keeper',
    'Rod of the Pact Keeper',
    'Rod',
    'by a Warlock',
    'Warlock',
    'Once per Long Rest, you can take a Magic action while holding the rod to regain one expended Pact Magic spell slot.'
  ),
  ...focusVariants(
    'arcane-grimoire',
    'Arcane Grimoire',
    'Wondrous Item (Book)',
    'by a Wizard',
    'Wizard',
    'The tome can serve as your spellbook and as a spellcasting focus for Wizard spells, and it boosts your Arcane Recovery slightly.'
  ),
  ...focusVariants(
    'bloodwell-vial',
    'Bloodwell Vial',
    'Wondrous Item',
    'by a Sorcerer',
    'Sorcerer',
    'The vial holds a drop of your blood and works as a spellcasting focus; once per Long Rest it helps you recover Sorcery Points when you spend Hit Point Dice during a Short Rest.'
  ),
  ...focusVariants(
    'amulet-of-the-devout',
    'Amulet of the Devout',
    'Wondrous Item',
    'by a Cleric or Paladin',
    'Cleric and Paladin',
    'It works as a Holy Symbol, and once per Long Rest you can use Channel Divinity without spending one of its uses.'
  ),
  ...focusVariants(
    'rhythm-makers-drum',
    'Rhythm-Maker’s Drum',
    'Wondrous Item',
    'by a Bard',
    'Bard',
    'It works as a musical-instrument spellcasting focus, and once per Long Rest you can play it to regain one expended use of Bardic Inspiration.'
  ),
  ...focusVariants(
    'moon-sickle',
    'Moon Sickle',
    'Weapon (Sickle)',
    'by a Druid or Ranger',
    'Druid and Ranger',
    'The silver-bladed sickle works as a spellcasting focus; when you cast a spell that restores Hit Points, you can roll a d4 and add it to the healing.',
    true
  ),
  ...[1, 2, 3].map((n) =>
    item(
      `dragonhide-belt-plus-${n}`,
      `Dragonhide Belt, +${n}`,
      'Wondrous Item',
      RAR[n - 1],
      'by a Monk',
      `While wearing this belt, you add +${n} to the save DC of your Monk features that use Focus Points.`,
      { bonus: n, tags: ['dmg-2024', 'variant:dragonhide-belt'], more: 'Once per Long Rest, you can use a Bonus Action to regain some expended Focus Points.' }
    )
  ),
  ...[1, 2, 3].map((n) =>
    item(
      `wraps-of-unarmed-power-plus-${n}`,
      `Wraps of Unarmed Power, +${n}`,
      'Wondrous Item',
      RAR[n - 1],
      false,
      `While wearing these hand wraps, your Unarmed Strikes gain a +${n} bonus to attack and damage rolls and count as magical.`,
      { bonus: n, tags: ['dmg-2024', 'variant:wraps-of-unarmed-power'] }
    )
  ),

  /* ---------------- uncommon / rare / legendary ---------------- */
  item('alchemy-jug', 'Alchemy Jug', 'Wondrous Item', 'uncommon', false,
    'A ceramic jug that, on command, fills with a liquid you name — such as water, wine, oil, or acid — in a set quantity once per dawn.'),
  item('cap-of-water-breathing', 'Cap of Water Breathing', 'Wondrous Item', 'uncommon', false,
    'While wearing this cap underwater, you can take a Magic action to surround your head with a bubble of air that lets you breathe normally until you remove it.'),
  item('driftglobe', 'Driftglobe', 'Wondrous Item', 'uncommon', false,
    'A small glass sphere that can cast Light on itself, or Daylight once per dawn, and can float along after you at a short distance.'),
  item('keoghtoms-ointment', 'Keoghtom’s Ointment', 'Wondrous Item', 'uncommon', false,
    'A jar holding 1d4 + 1 doses of salve. Applying a dose heals some Hit Points and cures poison and disease.'),
  item('mariners-armor', 'Mariner’s Armor', 'Armor (Any Light, Medium, or Heavy)', 'uncommon', false,
    'Armor decorated with sea motifs that gives you a Swim Speed equal to your Speed and keeps you rising toward the surface if you drop unconscious underwater.',
    { effects: [{ target: 'speed.swim', op: 'set', value: 'speed', note: 'Mariner’s Armor' }] }),
  item('natures-mantle', 'Nature’s Mantle', 'Wondrous Item', 'uncommon', 'by a Druid or Ranger',
    'A cloak that shifts color to match its surroundings. It works as a spellcasting focus for your Druid and Ranger spells, and you can take the Hide action as a Bonus Action while in a Lightly Obscured area.'),
  item('potion-of-fire-breath', 'Potion of Fire Breath', 'Potion', 'uncommon', false,
    'After drinking it, for a short while you can use a Bonus Action to exhale fire at a creature within 30 feet, forcing a Dexterity save against fire damage; the effect ends after a few breaths.'),
  item('saddle-of-the-cavalier', 'Saddle of the Cavalier', 'Wondrous Item', 'uncommon', false,
    'While you sit in this saddle on a mount, you can’t be dismounted against your will while conscious, and attack rolls against your mount have Disadvantage.'),
  item('tentacle-rod', 'Tentacle Rod', 'Rod', 'rare', true,
    'A rod ending in three rubbery tentacles. As a Magic action you lash a creature within 15 feet with them, dealing bludgeoning damage and potentially slowing and hindering it.'),
  /* ---------------- common ---------------- */
  item('moon-touched-sword', 'Moon-Touched Sword', 'Weapon (Any Sword)', 'common', false,
    'In darkness, the unsheathed blade sheds moonlight: Bright Light in a 15-foot radius and Dim Light for an additional 15 feet.'),
  item('cloak-of-many-fashions', 'Cloak of Many Fashions', 'Wondrous Item', 'common', false,
    'While wearing it, you can take a Bonus Action to change the cloak’s style, color, and apparent quality, though not its weight.'),
  item('cloak-of-billowing', 'Cloak of Billowing', 'Wondrous Item', 'common', false,
    'As a Bonus Action, you can make this cloak billow dramatically for a moment, even without wind.'),
  item('pipe-of-smoke-monsters', 'Pipe of Smoke Monsters', 'Wondrous Item', 'common', false,
    'While smoking this pipe, you can take a Magic action to exhale a puff of smoke shaped like a creature of your choice. The shape is harmless and soon dissipates.'),
  item('wand-of-pyrotechnics', 'Wand of Pyrotechnics', 'Wand', 'common', false,
    'Spend 1 charge as a Magic action to set off a harmless, loud and colorful burst of light at a point you can see. Regains 1d6 + 1 charges daily at dawn.', { charges: 7 }),
  item('wand-of-conducting', 'Wand of Conducting', 'Wand', 'common', false,
    'Spend a charge while waving the wand to produce orchestral music that follows your gestures. Regains all charges at dawn.', { charges: 3 }),
  item('wand-of-scowls', 'Wand of Scowls', 'Wand', 'common', false,
    'Spend a charge to make a creature you can see within range scowl unless it succeeds on a Charisma saving throw (DC 10).', { charges: 3 }),
  item('wand-of-smiles', 'Wand of Smiles', 'Wand', 'common', false,
    'Spend a charge to make a creature you can see within range smile unless it succeeds on a Charisma saving throw (DC 10).', { charges: 3 }),
  item('clockwork-amulet', 'Clockwork Amulet', 'Wondrous Item', 'common', false,
    'Once per dawn, when you make an attack roll while wearing it, you can skip rolling the d20 and treat the roll as a 10.'),
  item('ruby-of-the-war-mage', 'Ruby of the War Mage', 'Wondrous Item', 'common', 'by a Spellcaster',
    'Affix this gem to a Simple or Martial weapon; you can then use that weapon as a spellcasting focus for your spells.'),
  item('dark-shard-amulet', 'Dark Shard Amulet', 'Wondrous Item', 'common', 'by a Warlock',
    'A fragment of your patron’s realm that works as a spellcasting focus for Warlock spells. Once per Long Rest you can try to cast a Warlock cantrip you don’t know (Intelligence (Arcana) check, DC 10).'),
  item('mystery-key', 'Mystery Key', 'Wondrous Item', 'common', false,
    'A question mark is worked into its head. Each time it is used on a lock there is a small chance (5 percent) it opens; once it succeeds, the key vanishes.'),
  item('orb-of-direction', 'Orb of Direction', 'Wondrous Item', 'common', false,
    'While holding the orb, you can take a Magic action to learn which way is north.'),
  item('orb-of-time', 'Orb of Time', 'Wondrous Item', 'common', false,
    'While holding the orb, you can take a Magic action to learn whether it is morning, afternoon, evening, or nighttime outdoors.'),
  item('pot-of-awakening', 'Pot of Awakening', 'Wondrous Item', 'common', false,
    'A shrub planted in this clay pot and left to grow for 30 days becomes an Awakened Shrub that is friendly to you.'),
  item('rope-of-mending', 'Rope of Mending', 'Wondrous Item', 'common', false,
    'If this 50-foot coil of hempen rope is cut, you can touch the two cut ends together to magically rejoin them.'),
  item('shield-of-expression', 'Shield of Expression', 'Armor (Shield)', 'common', false,
    'A face is carved on the front of this shield. As a Bonus Action you can change its expression.'),
  item('smoldering-armor', 'Smoldering Armor', 'Armor (Any Light, Medium, or Heavy)', 'common', false,
    'Harmless wisps of smoke rise from this armor while it is worn.'),
  item('staff-of-adornment', 'Staff of Adornment', 'Staff', 'common', false,
    'You can make a small object float just above the tip of this staff, where it hovers until you take it or move it.'),
  item('staff-of-birdcalls', 'Staff of Birdcalls', 'Staff', 'common', false,
    'Spend a charge to make the staff produce bird sounds of your choice. Regains charges at dawn.', { charges: 10 }),
  item('staff-of-flowers', 'Staff of Flowers', 'Staff', 'common', false,
    'Spend a charge to make a flower sprout from the ground or the staff itself. Regains charges at dawn.', { charges: 10 }),
  item('tankard-of-sobriety', 'Tankard of Sobriety', 'Wondrous Item', 'common', false,
    'Anything alcoholic you drink from this tankard can’t make you intoxicated.'),
  item('unbreakable-arrow', 'Unbreakable Arrow', 'Weapon (Arrow)', 'common', false,
    'This arrow can’t be broken except within an antimagic field.'),
  item('veterans-cane', 'Veteran’s Cane', 'Wondrous Item', 'common', false,
    'As a Bonus Action you can turn this walking cane into an ordinary Longsword; it stays that way until you turn it back.'),
  item('walloping-ammunition', 'Walloping Ammunition', 'Weapon (Any Ammunition)', 'common', false,
    'A creature hit by this ammunition must succeed on a Strength saving throw (DC 10) or have the Prone condition. The ammunition loses its magic once it hits.'),
  item('charlatans-die', 'Charlatan’s Die', 'Wondrous Item', 'common', true,
    'Whenever you roll this six-sided die, you choose which number comes up.'),
  item('enduring-spellbook', 'Enduring Spellbook', 'Wondrous Item', 'common', false,
    'A spellbook that resists fire and water damage and doesn’t deteriorate with age.'),
  item('hat-of-vermin', 'Hat of Vermin', 'Wondrous Item', 'common', false,
    'Spend a charge as a Magic action to pull a harmless bat, frog, or rat from the hat; it vanishes after an hour. Regains charges at dawn.', { charges: 3 }),
  item('hewards-handy-spice-pouch', 'Heward’s Handy Spice Pouch', 'Wondrous Item', 'common', false,
    'Spend a charge to pull out a pinch of any nonmagical seasoning you like. Regains charges at dawn.', { charges: 10 }),
  item('prosthetic-limb', 'Prosthetic Limb', 'Wondrous Item', 'common', false,
    'Replaces a lost hand, arm, foot, or leg and works just like the body part it replaces; you can attach or detach it as an action.'),
  item('spellwrought-tattoo', 'Spellwrought Tattoo', 'Wondrous Item (Tattoo)', 'varies', false,
    'Magical ink that holds a single spell. Once applied to your skin, you can cast the spell from it once, after which the tattoo fades. Rarity depends on the spell level (cantrip/level 1 common, up to level 5 rare).')
]
