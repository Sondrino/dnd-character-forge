// Tools (SRD 5.2.1, CC-BY-4.0).
import type { Ability, ToolDef } from '../types'

interface Row {
  id: string
  name: string
  category: ToolDef['category']
  ability: Ability
  utilize: string[]
  craft: string[]
  cost: string
  weight: number
  /** Weight text if it isn't a plain number (e.g. 'Varies') */
  weightText?: string
  variants?: string
  intro?: string
  variantOf?: string
}

const ABILITY_NAME: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
}

const CAT_LABEL: Record<ToolDef['category'], string> = {
  artisan: 'Artisan’s Tools',
  gaming: 'Gaming Set',
  musical: 'Musical Instrument',
  other: 'Other Tool'
}

const ARTISAN_INTRO =
  'Artisan’s Tools are each focused on crafting items and pursuing a trade. Each of these tools requires a separate proficiency.'

const artisan = (
  id: string,
  name: string,
  cost: string,
  ability: Ability,
  weight: number,
  utilize: string[],
  craft: string[]
): Row => ({ id, name, category: 'artisan', ability, utilize, craft, cost, weight, intro: ARTISAN_INTRO })

const GAMING_UTILIZE = ['Discern whether someone is cheating (DC 10)', 'Win the game (DC 20)']
const MUSIC_UTILIZE = ['Play a known tune (DC 10)', 'Improvise a song (DC 15)']
const GAMING_VARIANTS = 'Dice (1 SP), dragonchess (1 GP), playing cards (5 SP), three-dragon ante (1 GP)'
const MUSIC_VARIANTS =
  'Bagpipes (30 GP, 6 lb.), drum (6 GP, 3 lb.), dulcimer (25 GP, 10 lb.), flute (2 GP, 1 lb.), horn (3 GP, 2 lb.), lute (35 GP, 2 lb.), lyre (30 GP, 2 lb.), pan flute (12 GP, 2 lb.), shawm (2 GP, 1 lb.), viol (30 GP, 1 lb.)'

const gaming = (id: string, name: string, cost: string): Row => ({
  id,
  name,
  category: 'gaming',
  ability: 'wis',
  utilize: GAMING_UTILIZE,
  craft: [],
  cost,
  weight: 0,
  variantOf: 'Gaming Set'
})

const instrument = (id: string, name: string, cost: string, weight: number): Row => ({
  id,
  name,
  category: 'musical',
  ability: 'cha',
  utilize: MUSIC_UTILIZE,
  craft: [],
  cost,
  weight,
  variantOf: 'Musical Instrument'
})

const rows: Row[] = [
  // Artisan's Tools
  artisan('alchemists-supplies', 'Alchemist’s Supplies', '50 GP', 'int', 8, ['Identify a substance (DC 15)', 'Start a fire (DC 15)'], ['Acid', 'Alchemist’s Fire', 'Component Pouch', 'Oil', 'Paper', 'Perfume']),
  artisan('brewers-supplies', 'Brewer’s Supplies', '20 GP', 'int', 9, ['Detect poisoned drink (DC 15)', 'Identify alcohol (DC 10)'], ['Antitoxin']),
  artisan('calligraphers-supplies', 'Calligrapher’s Supplies', '10 GP', 'dex', 5, ['Write text with impressive flourishes that guard against forgery (DC 15)'], ['Ink', 'Spell Scroll']),
  artisan('carpenters-tools', 'Carpenter’s Tools', '8 GP', 'str', 6, ['Seal or pry open a door or container (DC 20)'], ['Club', 'Greatclub', 'Quarterstaff', 'Barrel', 'Chest', 'Ladder', 'Pole', 'Portable Ram', 'Torch']),
  artisan('cartographers-tools', 'Cartographer’s Tools', '15 GP', 'wis', 6, ['Draft a map of a small area (DC 15)'], ['Map']),
  artisan('cobblers-tools', 'Cobbler’s Tools', '5 GP', 'dex', 5, ['Modify footwear to give Advantage on the wearer’s next Dexterity (Acrobatics) check (DC 10)'], ['Climber’s Kit']),
  artisan('cooks-utensils', 'Cook’s Utensils', '1 GP', 'wis', 8, ['Improve food’s flavor (DC 10)', 'Detect spoiled or poisoned food (DC 15)'], ['Rations']),
  artisan('glassblowers-tools', 'Glassblower’s Tools', '30 GP', 'int', 5, ['Discern what a glass object held in the past 24 hours (DC 15)'], ['Glass Bottle', 'Magnifying Glass', 'Spyglass', 'Vial']),
  artisan('jewelers-tools', 'Jeweler’s Tools', '25 GP', 'int', 2, ['Discern a gem’s value (DC 15)'], ['Arcane Focus', 'Holy Symbol']),
  artisan('leatherworkers-tools', 'Leatherworker’s Tools', '5 GP', 'dex', 5, ['Add a design to a leather item (DC 10)'], ['Sling', 'Whip', 'Hide Armor', 'Leather Armor', 'Studded Leather Armor', 'Backpack', 'Crossbow Bolt Case', 'Map or Scroll Case', 'Parchment', 'Pouch', 'Quiver', 'Waterskin']),
  artisan('masons-tools', 'Mason’s Tools', '10 GP', 'str', 8, ['Chisel a symbol or hole in stone (DC 10)'], ['Block and Tackle']),
  artisan('painters-supplies', 'Painter’s Supplies', '10 GP', 'wis', 5, ['Paint a recognizable image of something you’ve seen (DC 10)'], ['Druidic Focus', 'Holy Symbol']),
  artisan('potters-tools', 'Potter’s Tools', '10 GP', 'int', 3, ['Discern what a ceramic object held in the past 24 hours (DC 15)'], ['Jug', 'Lamp']),
  artisan('smiths-tools', 'Smith’s Tools', '20 GP', 'str', 8, ['Pry open a door or container (DC 20)'], ['Any Melee weapon (except Club, Greatclub, Quarterstaff, and Whip)', 'Medium armor (except Hide)', 'Heavy armor', 'Ball Bearings', 'Bucket', 'Caltrops', 'Chain', 'Crowbar', 'Firearm Bullets', 'Grappling Hook', 'Iron Pot', 'Iron Spikes', 'Sling Bullets']),
  artisan('tinkers-tools', 'Tinker’s Tools', '50 GP', 'dex', 10, ['Assemble a Tiny item composed of scrap, which falls apart in 1 minute (DC 20)'], ['Musket', 'Pistol', 'Bell', 'Bullseye Lantern', 'Flask', 'Hooded Lantern', 'Hunting Trap', 'Lock', 'Manacles', 'Mirror', 'Shovel', 'Signal Whistle', 'Tinderbox']),
  artisan('weavers-tools', 'Weaver’s Tools', '1 GP', 'dex', 5, ['Mend a tear in clothing (DC 10)', 'Sew a Tiny design (DC 10)'], ['Padded Armor', 'Basket', 'Bedroll', 'Blanket', 'Fine Clothes', 'Net', 'Robe', 'Rope', 'Sack', 'String', 'Tent', 'Traveler’s Clothes']),
  artisan('woodcarvers-tools', 'Woodcarver’s Tools', '1 GP', 'dex', 5, ['Carve a pattern in wood (DC 10)'], ['Club', 'Greatclub', 'Quarterstaff', 'Ranged weapons (except Pistol, Musket, and Sling)', 'Arcane Focus', 'Arrows', 'Bolts', 'Druidic Focus', 'Ink Pen', 'Needles']),

  // Other Tools
  { id: 'disguise-kit', name: 'Disguise Kit', category: 'other', ability: 'cha', utilize: ['Apply makeup (DC 10)'], craft: ['Costume'], cost: '25 GP', weight: 3 },
  { id: 'forgery-kit', name: 'Forgery Kit', category: 'other', ability: 'dex', utilize: ['Mimic 10 or fewer words of someone else’s handwriting (DC 15)', 'Duplicate a wax seal (DC 20)'], craft: [], cost: '15 GP', weight: 5 },
  { id: 'gaming-set', name: 'Gaming Set', category: 'gaming', ability: 'wis', utilize: GAMING_UTILIZE, craft: [], cost: 'Varies', weight: 0, variants: GAMING_VARIANTS },
  gaming('dice-set', 'Dice Set', '1 SP'),
  gaming('dragonchess-set', 'Dragonchess Set', '1 GP'),
  gaming('playing-card-set', 'Playing Card Set', '5 SP'),
  gaming('three-dragon-ante-set', 'Three-Dragon Ante Set', '1 GP'),
  { id: 'herbalism-kit', name: 'Herbalism Kit', category: 'other', ability: 'int', utilize: ['Identify a plant (DC 10)'], craft: ['Antitoxin', 'Candle', 'Healer’s Kit', 'Potion of Healing'], cost: '5 GP', weight: 3 },
  { id: 'musical-instrument', name: 'Musical Instrument', category: 'musical', ability: 'cha', utilize: MUSIC_UTILIZE, craft: [], cost: 'Varies', weight: 0, weightText: 'Varies', variants: MUSIC_VARIANTS },
  instrument('bagpipes', 'Bagpipes', '30 GP', 6),
  instrument('drum', 'Drum', '6 GP', 3),
  instrument('dulcimer', 'Dulcimer', '25 GP', 10),
  instrument('flute', 'Flute', '2 GP', 1),
  instrument('horn', 'Horn', '3 GP', 2),
  instrument('lute', 'Lute', '35 GP', 2),
  instrument('lyre', 'Lyre', '30 GP', 2),
  instrument('pan-flute', 'Pan Flute', '12 GP', 2),
  instrument('shawm', 'Shawm', '2 GP', 1),
  instrument('viol', 'Viol', '30 GP', 1),
  { id: 'navigators-tools', name: 'Navigator’s Tools', category: 'other', ability: 'wis', utilize: ['Plot a course (DC 10)', 'Determine position by stargazing (DC 15)'], craft: [], cost: '25 GP', weight: 2 },
  { id: 'poisoners-kit', name: 'Poisoner’s Kit', category: 'other', ability: 'int', utilize: ['Detect a poisoned object (DC 10)'], craft: ['Basic Poison'], cost: '50 GP', weight: 2 },
  { id: 'thieves-tools', name: 'Thieves’ Tools', category: 'other', ability: 'dex', utilize: ['Pick a lock (DC 15)', 'Disarm a trap (DC 15)'], craft: [], cost: '25 GP', weight: 1 }
]

/** Joins utilize options in SRD style: "A, or B" */
function joinOr(list: string[]): string {
  if (list.length <= 1) return list.join('')
  const lower = list.map((s, i) => (i === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1)))
  return `${lower.slice(0, -1).join(', ')}, or ${lower[lower.length - 1]}`
}

export const tools: ToolDef[] = rows.map((r) => {
  const weight = r.weightText ?? (r.weight ? `${r.weight} lb.` : '—')
  const lines = [
    `**Ability:** ${ABILITY_NAME[r.ability]}`,
    `**Weight:** ${weight}`,
    `**Utilize:** ${joinOr(r.utilize)}`
  ]
  if (r.craft.length) lines.push(`**Craft:** ${r.craft.join(', ')}`)
  if (r.variants) lines.push(`**Variants:** ${r.variants}. Each requires a separate proficiency.`)
  const header = r.variantOf
    ? `*${r.variantOf} variant (${r.cost}${r.weight ? `, ${r.weight} lb.` : ''}). Requires its own proficiency.*`
    : `*${CAT_LABEL[r.category]} (${r.cost})*`
  return {
    id: r.id,
    name: r.name,
    kind: 'tool',
    source: 'SRD 5.2',
    tags: [r.category],
    summary: `${CAT_LABEL[r.category]} (${ABILITY_NAME[r.ability]}). Utilize: ${joinOr(r.utilize)}.`,
    description: [header, r.intro, lines.join('  \n')].filter(Boolean).join('\n\n'),
    category: r.category,
    ability: r.ability,
    utilize: r.utilize,
    craft: r.craft,
    cost: r.cost,
    weight: r.weight
  }
})
