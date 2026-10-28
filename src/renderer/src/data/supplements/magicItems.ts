import type { MagicItemDef } from '../../types'

/**
 * Magic items from official D&D 5e supplement books (Tasha's, Fizban's, Spelljammer …).
 * These books are NOT open-licensed: only names, game-mechanical facts and short summaries
 * written in our own words. Read the full text in the book or on D&D Beyond.
 */

const BOOKS = {
  tce: "Tasha's Cauldron of Everything",
  ftod: "Fizban's Treasury of Dragons",
  saas: 'Spelljammer: Adventures in Space'
} as const

type BookKey = keyof typeof BOOKS
type Rarity = MagicItemDef['rarity']

function item(
  book: BookKey,
  name: string,
  itemType: string,
  rarity: Rarity,
  attunement: boolean | string,
  summary: string,
  extra: Partial<Pick<MagicItemDef, 'bonus' | 'charges' | 'effects'>> & { more?: string; tags?: string[] } = {}
): MagicItemDef {
  const { more, tags, ...rest } = extra
  const id = 'sup-' + name.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id,
    name,
    kind: 'magicItem',
    source: 'Supplement',
    sourceBook: BOOKS[book],
    itemType,
    rarity,
    attunement,
    summary,
    description: more ? `${summary} ${more}` : summary,
    tags: ['supplement', book, ...(tags ?? [])],
    ...rest
  }
}

const BONUS_TIERS = 'Uncommon (+1), rare (+2) or very rare (+3).'

export const supplementMagicItems: MagicItemDef[] = [
  /* ===================== Tasha's Cauldron of Everything ===================== */
  item('tce', 'All-Purpose Tool', 'Wondrous Item', 'varies', 'by an Artificer',
    'A simple tool that can shift into any artisan’s tool and adds its bonus to the spell attack rolls and spell save DCs of your Artificer spells; it can also briefly grant you a cantrip.',
    { more: BONUS_TIERS }),
  item('tce', 'Alchemical Compendium', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A wizard’s tome of transmutation magic that works as a spellbook and an arcane focus, and lets you magically reshape a small nonmagical object.'),
  item('tce', 'Astromancy Archive', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A brass disc of star charts that works as a spellbook and arcane focus for divination magic; it holds charges you can spend to nudge a nearby creature’s roll up or down with a d4.',
    { charges: 3 }),
  item('tce', 'Atlas of Endless Horizons', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A book of maps that works as a spellbook and arcane focus with teleportation spells; when you are hit by an attack, it can whisk you a short distance away once per day.'),
  item('tce', 'Crystalline Chronicle', 'Wondrous Item', 'very rare', 'by a Wizard',
    'A crystal sphere that serves as a wizard’s spellbook and arcane focus, teaches a few psychic cantrips, and stores charges for casting telepathic spells.'),
  item('tce', 'Duplicitous Manuscript', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A spellbook and arcane focus for illusion magic that can disguise its own contents as a mundane book and helps your illusions fool those who would see through them.'),
  item('tce', 'Fulminating Treatise', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A scorched spellbook and arcane focus for evocation magic; its charges let your evocation spells blast a target with extra force.'),
  item('tce', 'Heart Weaver’s Primer', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A spellbook and arcane focus for enchantment magic that can make a creature struggle to resist one of your enchantment spells.'),
  item('tce', 'Planecaller’s Codex', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A spellbook and arcane focus for conjuration magic that strengthens creatures you summon with your spells.'),
  item('tce', 'Protective Verses', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A spellbook and arcane focus for abjuration magic that helps you shield yourself when you cast protective spells.'),

  item('tce', 'Astral Shard', 'Wondrous Item', 'rare', 'by a Sorcerer',
    'A crystal from the Astral Plane that works as a sorcerer focus; when you use Metamagic on a spell, you can teleport a short distance.'),
  item('tce', 'Elemental Essence Shard', 'Wondrous Item', 'rare', 'by a Sorcerer',
    'A crackling crystal of elemental power that works as a sorcerer focus; using Metamagic triggers an elemental burst whose effect depends on the shard’s element.'),
  item('tce', 'Far Realm Shard', 'Wondrous Item', 'rare', 'by a Sorcerer',
    'A writhing crystal from the Far Realm that works as a sorcerer focus; using Metamagic can unleash psychic horror on a creature you target.'),
  item('tce', 'Feywild Shard', 'Wondrous Item', 'uncommon', 'by a Sorcerer',
    'A shimmering crystal from the Feywild that works as a sorcerer focus; using Metamagic lets you roll on the Wild Magic Surge table.'),
  item('tce', 'Outer Essence Shard', 'Wondrous Item', 'rare', 'by a Sorcerer',
    'A crystal from an Outer Plane that works as a sorcerer focus; using Metamagic lets you heal allies or harm foes depending on whether the shard is lawful or chaotic.'),
  item('tce', 'Shadowfell Shard', 'Wondrous Item', 'rare', 'by a Sorcerer',
    'A cold, gloomy crystal that works as a sorcerer focus; using Metamagic can weaken a creature’s ability checks with one ability of your choice.'),

  item('tce', 'Bell Branch', 'Wondrous Item', 'rare', 'by a Druid or Warlock',
    'A silver branch hung with bells that works as a spellcasting focus; it chimes when certain otherworldly creatures are near and holds charges for protective magic.'),
  item('tce', 'Devotee’s Censer', 'Weapon (Flail)', 'rare', 'by a Cleric or Paladin',
    'A flail whose head is a censer; it deals extra radiant damage, and once per day it can release incense that heals creatures around you for a short time.'),
  item('tce', 'Guardian Emblem', 'Wondrous Item', 'uncommon', 'by a Cleric or Paladin',
    'An emblem you attach to armor or a shield; it holds charges you can spend as a reaction to turn a critical hit against a nearby creature into a normal hit.',
    { charges: 3 }),
  item('tce', 'Reveler’s Concertina', 'Wondrous Item (Musical Instrument)', 'rare', 'by a Bard',
    'While holding this concertina, you gain a +2 bonus to the save DCs of your Bard spells, and you can use it as a spellcasting focus.',
    { bonus: 2, effects: [{ target: 'spell.dc', op: 'add', value: 2, note: 'Reveler’s Concertina: Bard spells only' }] }),
  item('tce', 'Cauldron of Rebirth', 'Wondrous Item', 'very rare', 'by a Druid or Warlock',
    'A Tiny pot that can grow into a large cauldron; it works as a spellcasting focus, can be used for scrying, brews healing potions and can return the dead to life.'),

  item('tce', 'Absorbing Tattoo', 'Wondrous Item (Tattoo)', 'very rare', true,
    'A magical tattoo tied to one damage type: you resist that type, and once per day you can use a reaction to become immune to an instance of it and heal instead.'),
  item('tce', 'Barrier Tattoo', 'Wondrous Item (Tattoo)', 'varies', true,
    'A protective tattoo that sets your Armor Class to a higher base while you aren’t wearing armor; stronger versions grant a better AC.',
    { more: 'Uncommon, rare or very rare.' }),
  item('tce', 'Blood Fury Tattoo', 'Wondrous Item (Tattoo)', 'legendary', true,
    'A tattoo of violent power: your hits drain extra life from foes to heal you, and you can strike back at creatures that hurt you.'),
  item('tce', 'Coiling Grasp Tattoo', 'Wondrous Item (Tattoo)', 'uncommon', true,
    'Tattooed tendrils that let you reach out and grapple a creature from a distance, damaging it as they squeeze.'),
  item('tce', 'Eldritch Claw Tattoo', 'Wondrous Item (Tattoo)', 'uncommon', true,
    'Your Unarmed Strikes become magical with a +1 bonus, and once per day you can make your weapon attacks reach farther and deal extra force damage for a minute.'),
  item('tce', 'Ghost Step Tattoo', 'Wondrous Item (Tattoo)', 'very rare', true,
    'A shifting tattoo with charges; spend one as a Bonus Action to become ghostly for a moment, slipping through creatures and objects and avoiding attacks.',
    { charges: 3 }),
  item('tce', 'Illuminator’s Tattoo', 'Wondrous Item (Tattoo)', 'common', true,
    'A calligraphy tattoo that makes the words you write glow, lets you make them fade or disappear, and helps you read magical script.'),
  item('tce', 'Masquerade Tattoo', 'Wondrous Item (Tattoo)', 'common', true,
    'A tattoo you can reshape or hide at will, which also lets you change your appearance with disguise magic once per day.'),
  item('tce', 'Shadowfell Brand Tattoo', 'Wondrous Item (Tattoo)', 'rare', true,
    'A dark tattoo that grants Darkvision and stealth advantages, and once per day lets you use a reaction to weaken the damage of an attack against you.'),

  item('tce', 'Demonomicon of Iggwilv', 'Wondrous Item (Book)', 'artifact', true,
    'The infamous tome of demonology written by the archmage Iggwilv; it holds fiendish lore and spells, aids binding and interrogating fiends, and is dangerous to its owner.'),
  item('tce', 'Teeth of Dahlver-Nar', 'Wondrous Item', 'artifact', true,
    'A pouch of teeth from an ancient hero; implanting one in your mouth calls upon the power of a legendary figure, each tooth granting a different magic.'),

  item('tce', 'Libram of Souls and Flesh', 'Wondrous Item (Book)', 'rare', 'by a Wizard',
    'A necromancer’s tome that works as a spellbook and arcane focus; its charges let you swap a prepared spell for one of its necromancy spells or take on a deathly look that makes Undead ignore you for a while.',
    { charges: 3 }),
  item('tce', 'Lyre of Building', 'Wondrous Item (Musical Instrument)', 'rare', 'by a Bard',
    'A builder’s lyre: cast Mending at will, protect nearby objects and structures from a damage type with your Reaction, and once per day cast Fabricate, Move Earth, Passwall or Summon Construct.'),
  item('tce', 'Lifewell Tattoo', 'Wondrous Item (Tattoo)', 'very rare', true,
    'A tattoo of life-giving symbols: you have Resistance to necrotic damage, and once per day when you would drop to 0 Hit Points you drop to 1 instead.',
    { effects: [{ target: 'resistance', op: 'grant', value: 'necrotic', note: 'Lifewell Tattoo' }] }),
  item('tce', 'Baba Yaga’s Mortar and Pestle', 'Wondrous Item', 'artifact', true,
    'The legendary witch Baba Yaga’s tools: the mortar can carry its owner through the air like a vehicle, and the pestle can grind nearly anything into fine powder; together they aid potion-making and grant other witchy magic.'),
  item('tce', 'Crook of Rao', 'Wondrous Item', 'artifact', true,
    'The shepherd’s crook of the god Rao, which can banish fiends and other extraplanar creatures en masse in a mighty ritual, but each use strains its magic.'),
  item('tce', 'Luba’s Tarokka of Souls', 'Wondrous Item', 'artifact', true,
    'A deck of tarokka cards that holds the souls of powerful beings; its owner can draw on the cards for divination and powerful, unpredictable magic, at a risk.'),
  item('tce', 'Mighty Servant of Leuk-o', 'Wondrous Item', 'artifact', true,
    'A colossal construct of ancient make piloted from a compartment inside: its crew can walk, fight and smash fortifications with it, and it is nearly indestructible.'),

  /* ===================== Fizban's Treasury of Dragons ===================== */
  item('ftod', 'Dragon-Touched Focus', 'Wondrous Item', 'varies', 'by a Spellcaster',
    'A hoard-touched spellcasting focus that grows stronger as its draconic magic awakens; at its weakest it grants Advantage on Initiative rolls, and later stages add spells and damage boosts.',
    { more: 'Slumbering (uncommon) through Ascendant (legendary).', tags: ['hoard-item'] }),
  item('ftod', 'Dragon Vessel', 'Wondrous Item', 'varies', false,
    'A drinking vessel touched by a dragon’s hoard that can fill itself with drinks, and at higher stages with more potent brews, including magic potions.',
    { more: 'Slumbering (uncommon) through Ascendant (legendary).', tags: ['hoard-item'] }),
  item('ftod', 'Dragon Wing Bow', 'Weapon (Any Bow)', 'rare', true,
    'A bow tied to a draconic damage type; ammunition fired from it deals extra damage of that type.'),

  /* ===================== Spelljammer: Adventures in Space ===================== */
  item('saas', 'Spelljamming Helm', 'Wondrous Item', 'uncommon', 'by a Spellcaster',
    'An ornate chair that lets an attuned spellcaster seated in it pilot the ship it is installed on, through air and through wildspace.')
]
