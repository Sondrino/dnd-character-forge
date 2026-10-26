// Adventuring gear, packs, foci, mounts and vehicles (SRD 5.2.1, CC-BY-4.0).
import type { GearDef, ItemGrant, Source } from '../types'

interface Row {
  id: string
  name: string
  category: string
  cost: string
  weight: number
  /** Weight text if not a plain number */
  weightText?: string
  description: string
  summary?: string
  contents?: ItemGrant[]
  source?: Source
}

const AMMO_TEXT =
  'Ammunition is required by a weapon that has the Ammunition property. A weapon’s description specifies the type of ammunition used by the weapon. The Ammunition table lists the different types and the amount you get when you buy them. The table also lists the item that is typically used to store each type; storage must be bought separately.'

const ARCANE_TEXT =
  'An Arcane Focus takes one of the forms in the Arcane Focuses table and is bejeweled or carved to channel arcane magic. A Sorcerer, Warlock, or Wizard can use such an item as a Spellcasting Focus.'

const DRUIDIC_TEXT =
  'A Druidic Focus takes one of the forms in the Druidic Focuses table and is carved, tied with ribbon, or painted to channel primal magic. A Druid or Ranger can use such an object as a Spellcasting Focus.'

const HOLY_TEXT =
  'A Holy Symbol takes one of the forms in the Holy Symbol table and is bejeweled or painted to channel divine magic. A Cleric or Paladin can use a Holy Symbol as a Spellcasting Focus.\n\nThe table indicates whether a Holy Symbol needs to be held, worn, or borne on fabric (such as a tabard or banner) or a Shield.'

const MOUNT_TEXT =
  'A mount can help you move more quickly through the wilderness, but its primary purpose is to carry gear that would otherwise slow you down. See “Monsters” for the animals’ stat blocks.\n\nAn animal pulling a carriage, cart, chariot, sled, or wagon can move weight up to five times its base carrying capacity, including the weight of the vehicle. If multiple animals pull the same vehicle, add their carrying capacities together.'

const SADDLE_TEXT =
  'A saddle comes with a bit, a bridle, reins, and any other equipment needed to use the saddle. A Military Saddle gives Advantage on any ability check you make to remain mounted. An Exotic Saddle is required for riding an aquatic or a flying mount.'

const SHIP_TEXT =
  'A ship sailing against a strong wind moves at half speed. In a dead calm (no wind), waterborne ships can’t move under sail and must be rowed. A ship larger than a Keelboat or Rowboat needs a crew of skilled hirelings to function.'

const ammo = (id: string, name: string, amount: number, storage: string, weight: number, weightText: string, cost: string): Row => ({
  id,
  name,
  category: 'Ammunition',
  cost,
  weight,
  weightText,
  summary: `${amount} ${name.toLowerCase()} (${cost}); usually stored in a ${storage}.`,
  description: `${AMMO_TEXT}\n\n| Type | Amount | Storage | Weight | Cost |\n|---|---|---|---|---|\n| ${name} | ${amount} | ${storage} | ${weightText} | ${cost} |`
})

const focus = (
  id: string,
  name: string,
  category: string,
  base: string,
  weight: number,
  cost: string,
  extra = ''
): Row => ({
  id,
  name,
  category,
  cost,
  weight,
  summary: `${category} (${name.toLowerCase()})${extra ? `, ${extra}` : ''}.`,
  description: `${base}\n\n**Form:** ${name}${extra ? ` (${extra})` : ''} — ${weight ? `${weight} lb.` : '—'}, ${cost}`
})

const mount = (id: string, name: string, capacity: string, cost: string): Row => ({
  id,
  name,
  category: 'Mount',
  cost,
  weight: 0,
  summary: `Mount or animal with a carrying capacity of ${capacity}.`,
  description: `**Carrying Capacity:** ${capacity}  \n**Cost:** ${cost}\n\n${MOUNT_TEXT}`
})

const ship = (id: string, name: string, speed: string, crew: string, passengers: string, cargo: string, ac: number, hp: number, threshold: string, cost: string, extra = ''): Row => ({
  id,
  name,
  category: 'Vehicle',
  cost,
  weight: 0,
  summary: `Large vehicle: ${speed}, crew ${crew}, AC ${ac}, ${hp} HP.`,
  description: `| Speed | Crew | Passengers | Cargo (Tons) | AC | HP | Damage Threshold | Cost |\n|---|---|---|---|---|---|---|---|\n| ${speed} | ${crew} | ${passengers} | ${cargo} | ${ac} | ${hp} | ${threshold} | ${cost} |\n\n${SHIP_TEXT}${extra ? `\n\n${extra}` : ''}`
})

const rows: Row[] = [
  {
    id: 'acid',
    name: 'Acid',
    category: 'Adventuring Gear',
    cost: '25 GP',
    weight: 1,
    summary: 'Replace an attack to throw a vial (20 ft.): Dex save or 2d6 Acid damage.',
    description: `When you take the Attack action, you can replace one of your attacks with throwing a vial of Acid. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 2d6 Acid damage.`
  },
  {
    id: 'alchemists-fire',
    name: 'Alchemist’s Fire',
    category: 'Adventuring Gear',
    cost: '50 GP',
    weight: 1,
    summary: 'Replace an attack to throw a flask (20 ft.): Dex save or 1d4 Fire damage and start burning.',
    description: `When you take the Attack action, you can replace one of your attacks with throwing a flask of Alchemist’s Fire. Target one creature or object you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 1d4 Fire damage and start burning (see “Rules Glossary”).`
  },
  ammo('arrows', 'Arrows', 20, 'Quiver', 1, '1 lb.', '1 GP'),
  ammo('bolts', 'Bolts', 20, 'Case', 1.5, '1½ lb.', '1 GP'),
  ammo('firearm-bullets', 'Firearm Bullets', 10, 'Pouch', 2, '2 lb.', '3 GP'),
  ammo('sling-bullets', 'Sling Bullets', 20, 'Pouch', 1.5, '1½ lb.', '4 CP'),
  ammo('needles', 'Needles', 50, 'Pouch', 1, '1 lb.', '1 GP'),
  {
    id: 'antitoxin',
    name: 'Antitoxin',
    category: 'Adventuring Gear',
    cost: '50 GP',
    weight: 0,
    summary: 'Bonus Action: Advantage on saves against the Poisoned condition for 1 hour.',
    description: `As a Bonus Action, you can drink a vial of Antitoxin to gain Advantage on saving throws to avoid or end the Poisoned condition for 1 hour.`
  },
  {
    id: 'arcane-focus',
    name: 'Arcane Focus',
    category: 'Arcane Focus',
    cost: 'Varies',
    weight: 0,
    weightText: 'Varies',
    summary: 'A spellcasting focus for Sorcerers, Warlocks, and Wizards (crystal, orb, rod, staff, or wand).',
    description: `${ARCANE_TEXT}

| Focus | Weight | Cost |
|---|---|---|
| Crystal | 1 lb. | 10 GP |
| Orb | 3 lb. | 20 GP |
| Rod | 2 lb. | 10 GP |
| Staff (also a Quarterstaff) | 4 lb. | 5 GP |
| Wand | 1 lb. | 10 GP |`
  },
  focus('crystal', 'Crystal', 'Arcane Focus', ARCANE_TEXT, 1, '10 GP'),
  focus('orb', 'Orb', 'Arcane Focus', ARCANE_TEXT, 3, '20 GP'),
  focus('rod', 'Rod', 'Arcane Focus', ARCANE_TEXT, 2, '10 GP'),
  focus('staff', 'Staff', 'Arcane Focus', ARCANE_TEXT, 4, '5 GP', 'also a Quarterstaff'),
  focus('wand', 'Wand', 'Arcane Focus', ARCANE_TEXT, 1, '10 GP'),
  {
    id: 'backpack',
    name: 'Backpack',
    category: 'Container',
    cost: '2 GP',
    weight: 5,
    description: `A Backpack holds up to 30 pounds within 1 cubic foot. It can also serve as a saddlebag.`
  },
  {
    id: 'ball-bearings',
    name: 'Ball Bearings',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 2,
    summary: 'Utilize action: cover a 10-ft. square; creatures entering must make a DC 10 Dex save or fall Prone.',
    description: `As a Utilize action, you can spill Ball Bearings from their pouch. They spread to cover a level, 10-foot-square area within 10 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a DC 10 Dexterity saving throw or have the Prone condition. It takes 10 minutes to recover the Ball Bearings.`
  },
  {
    id: 'barrel',
    name: 'Barrel',
    category: 'Container',
    cost: '2 GP',
    weight: 70,
    description: `A Barrel holds up to 40 gallons of liquid or up to 4 cubic feet of dry goods.`
  },
  {
    id: 'basket',
    name: 'Basket',
    category: 'Container',
    cost: '4 SP',
    weight: 2,
    description: `A Basket holds up to 40 pounds within 2 cubic feet.`
  },
  {
    id: 'bedroll',
    name: 'Bedroll',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 7,
    description: `A Bedroll sleeps one Small or Medium creature. While in a Bedroll, you automatically succeed on saving throws against extreme cold (see “Gameplay Toolbox”).`
  },
  {
    id: 'bell',
    name: 'Bell',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 0,
    description: `When rung as a Utilize action, a Bell produces a sound that can be heard up to 60 feet away.`
  },
  {
    id: 'blanket',
    name: 'Blanket',
    category: 'Adventuring Gear',
    cost: '5 SP',
    weight: 3,
    description: `While wrapped in a blanket, you have Advantage on saving throws against extreme cold (see “Gameplay Toolbox”).`
  },
  {
    id: 'block-and-tackle',
    name: 'Block and Tackle',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 5,
    description: `A Block and Tackle allows you to hoist up to four times the weight you can normally lift.`
  },
  {
    id: 'book',
    name: 'Book',
    category: 'Adventuring Gear',
    cost: '25 GP',
    weight: 5,
    summary: 'Fiction or nonfiction; an accurate nonfiction Book gives +5 to related Intelligence checks.',
    description: `A Book contains fiction or nonfiction. If you consult an accurate nonfiction Book about its topic, you gain a +5 bonus to Intelligence (Arcana, History, Nature, or Religion) checks you make about that topic.`
  },
  {
    id: 'glass-bottle',
    name: 'Glass Bottle',
    category: 'Container',
    cost: '2 GP',
    weight: 2,
    description: `A Glass Bottle holds up to 1½ pints.`
  },
  {
    id: 'bucket',
    name: 'Bucket',
    category: 'Container',
    cost: '5 CP',
    weight: 2,
    description: `A Bucket holds up to half a cubic foot of contents.`
  },
  {
    id: 'burglars-pack',
    name: 'Burglar’s Pack',
    category: 'Pack',
    cost: '16 GP',
    weight: 42,
    summary: 'Backpack, Ball Bearings, Bell, 10 Candles, Crowbar, Hooded Lantern, 7 Oil, 5 Rations, Rope, Tinderbox, Waterskin.',
    description: `A Burglar’s Pack contains the following items: Backpack, Ball Bearings, Bell, 10 Candles, Crowbar, Hooded Lantern, 7 flasks of Oil, 5 days of Rations, Rope, Tinderbox, and Waterskin.`,
    contents: [
      { id: 'backpack' },
      { id: 'ball-bearings' },
      { id: 'bell' },
      { id: 'candle', qty: 10 },
      { id: 'crowbar' },
      { id: 'hooded-lantern' },
      { id: 'oil', qty: 7 },
      { id: 'rations', qty: 5 },
      { id: 'rope' },
      { id: 'tinderbox' },
      { id: 'waterskin' }
    ]
  },
  {
    id: 'caltrops',
    name: 'Caltrops',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 2,
    summary: 'Utilize action: cover a 5-ft. square; DC 15 Dex save or 1 Piercing damage and Speed 0.',
    description: `As a Utilize action, you can spread Caltrops from their bag to cover a 5-foot-square area within 5 feet of yourself. A creature that enters this area for the first time on a turn must succeed on a DC 15 Dexterity saving throw or take 1 Piercing damage and have its Speed reduced to 0 until the start of its next turn. It takes 10 minutes to recover the Caltrops.`
  },
  {
    id: 'candle',
    name: 'Candle',
    category: 'Adventuring Gear',
    cost: '1 CP',
    weight: 0,
    description: `For 1 hour, a lit Candle sheds Bright Light in a 5-foot radius and Dim Light for an additional 5 feet.`
  },
  {
    id: 'crossbow-bolt-case',
    name: 'Crossbow Bolt Case',
    category: 'Container',
    cost: '1 GP',
    weight: 1,
    description: `A Crossbow Bolt Case holds up to 20 Bolts.`
  },
  {
    id: 'map-or-scroll-case',
    name: 'Map or Scroll Case',
    category: 'Container',
    cost: '1 GP',
    weight: 1,
    description: `A Map or Scroll Case holds up to 10 sheets of paper or 5 sheets of parchment.`
  },
  {
    id: 'chain',
    name: 'Chain',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 10,
    summary: 'Bind a Grappled, Incapacitated, or Restrained creature with a DC 13 Athletics check.',
    description: `As a Utilize action, you can wrap a Chain around an unwilling creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a DC 13 Strength (Athletics) check. If the creature’s legs are bound, the creature has the Restrained condition until it escapes. Escaping the Chain requires the creature to make a successful DC 18 Dexterity (Acrobatics) check as an action. Bursting the Chain requires a successful DC 20 Strength (Athletics) check as an action.`
  },
  {
    id: 'chest',
    name: 'Chest',
    category: 'Container',
    cost: '5 GP',
    weight: 25,
    description: `A Chest holds up to 12 cubic feet of contents.`
  },
  {
    id: 'climbers-kit',
    name: 'Climber’s Kit',
    category: 'Adventuring Gear',
    cost: '25 GP',
    weight: 12,
    summary: 'Anchor yourself so you can’t fall more than 25 feet from the anchor point.',
    description: `A Climber’s Kit includes boot tips, gloves, pitons, and a harness. As a Utilize action, you can use the Climber’s Kit to anchor yourself; when you do, you can’t fall more than 25 feet from the anchor point, and you can’t move more than 25 feet from there without undoing the anchor as a Bonus Action.`
  },
  {
    id: 'fine-clothes',
    name: 'Fine Clothes',
    category: 'Adventuring Gear',
    cost: '15 GP',
    weight: 6,
    description: `Fine Clothes are made of expensive fabrics and adorned with expertly crafted details. Some events and locations admit only people wearing these clothes.`
  },
  {
    id: 'travelers-clothes',
    name: 'Traveler’s Clothes',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 4,
    description: `Traveler’s Clothes are resilient garments designed for travel in various environments.`
  },
  {
    id: 'component-pouch',
    name: 'Component Pouch',
    category: 'Adventuring Gear',
    cost: '25 GP',
    weight: 2,
    summary: 'A watertight pouch holding all the free Material components of your spells.',
    description: `A Component Pouch is watertight and filled with compartments that hold all the free Material components of your spells.`
  },
  {
    id: 'costume',
    name: 'Costume',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 4,
    description: `While wearing a Costume, you have Advantage on any ability check you make to impersonate the person or type of person it represents.`
  },
  {
    id: 'crowbar',
    name: 'Crowbar',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 5,
    description: `Using a Crowbar gives you Advantage on Strength checks where the Crowbar’s leverage can be applied.`
  },
  {
    id: 'diplomats-pack',
    name: 'Diplomat’s Pack',
    category: 'Pack',
    cost: '39 GP',
    weight: 39,
    summary: 'Chest, Fine Clothes, Ink, 5 Ink Pens, Lamp, 2 Map or Scroll Cases, 4 Oil, 5 Paper, 5 Parchment, Perfume, Tinderbox.',
    description: `A Diplomat’s Pack contains the following items: Chest, Fine Clothes, Ink, 5 Ink Pens, Lamp, 2 Map or Scroll Cases, 4 flasks of Oil, 5 sheets of Paper, 5 sheets of Parchment, Perfume, and Tinderbox.`,
    contents: [
      { id: 'chest' },
      { id: 'fine-clothes' },
      { id: 'ink' },
      { id: 'ink-pen', qty: 5 },
      { id: 'lamp' },
      { id: 'map-or-scroll-case', qty: 2 },
      { id: 'oil', qty: 4 },
      { id: 'paper', qty: 5 },
      { id: 'parchment', qty: 5 },
      { id: 'perfume' },
      { id: 'tinderbox' }
    ]
  },
  {
    id: 'druidic-focus',
    name: 'Druidic Focus',
    category: 'Druidic Focus',
    cost: 'Varies',
    weight: 0,
    weightText: 'Varies',
    summary: 'A spellcasting focus for Druids and Rangers (sprig of mistletoe, wooden staff, or yew wand).',
    description: `${DRUIDIC_TEXT}

| Focus | Weight | Cost |
|---|---|---|
| Sprig of mistletoe | — | 1 GP |
| Wooden staff (also a Quarterstaff) | 4 lb. | 5 GP |
| Yew wand | 1 lb. | 10 GP |`
  },
  focus('sprig-of-mistletoe', 'Sprig of Mistletoe', 'Druidic Focus', DRUIDIC_TEXT, 0, '1 GP'),
  focus('wooden-staff', 'Wooden Staff', 'Druidic Focus', DRUIDIC_TEXT, 4, '5 GP', 'also a Quarterstaff'),
  focus('yew-wand', 'Yew Wand', 'Druidic Focus', DRUIDIC_TEXT, 1, '10 GP'),
  {
    id: 'dungeoneers-pack',
    name: 'Dungeoneer’s Pack',
    category: 'Pack',
    cost: '12 GP',
    weight: 55,
    summary: 'Backpack, Caltrops, Crowbar, 2 Oil, 10 Rations, Rope, Tinderbox, 10 Torches, Waterskin.',
    description: `A Dungeoneer’s Pack contains the following items: Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and Waterskin.`,
    contents: [
      { id: 'backpack' },
      { id: 'caltrops' },
      { id: 'crowbar' },
      { id: 'oil', qty: 2 },
      { id: 'rations', qty: 10 },
      { id: 'rope' },
      { id: 'tinderbox' },
      { id: 'torch', qty: 10 },
      { id: 'waterskin' }
    ]
  },
  {
    id: 'entertainers-pack',
    name: 'Entertainer’s Pack',
    category: 'Pack',
    cost: '40 GP',
    weight: 58.5,
    weightText: '58½ lb.',
    summary: 'Backpack, Bedroll, Bell, Bullseye Lantern, 3 Costumes, Mirror, 8 Oil, 9 Rations, Tinderbox, Waterskin.',
    description: `An Entertainer’s Pack contains the following items: Backpack, Bedroll, Bell, Bullseye Lantern, 3 Costumes, Mirror, 8 flasks of Oil, 9 days of Rations, Tinderbox, and Waterskin.`,
    contents: [
      { id: 'backpack' },
      { id: 'bedroll' },
      { id: 'bell' },
      { id: 'bullseye-lantern' },
      { id: 'costume', qty: 3 },
      { id: 'mirror' },
      { id: 'oil', qty: 8 },
      { id: 'rations', qty: 9 },
      { id: 'tinderbox' },
      { id: 'waterskin' }
    ]
  },
  {
    id: 'explorers-pack',
    name: 'Explorer’s Pack',
    category: 'Pack',
    cost: '10 GP',
    weight: 55,
    summary: 'Backpack, Bedroll, 2 Oil, 10 Rations, Rope, Tinderbox, 10 Torches, Waterskin.',
    description: `An Explorer’s Pack contains the following items: Backpack, Bedroll, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and Waterskin.`,
    contents: [
      { id: 'backpack' },
      { id: 'bedroll' },
      { id: 'oil', qty: 2 },
      { id: 'rations', qty: 10 },
      { id: 'rope' },
      { id: 'tinderbox' },
      { id: 'torch', qty: 10 },
      { id: 'waterskin' }
    ]
  },
  {
    id: 'flask',
    name: 'Flask',
    category: 'Container',
    cost: '2 CP',
    weight: 1,
    description: `A Flask holds up to 1 pint.`
  },
  {
    id: 'grappling-hook',
    name: 'Grappling Hook',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 4,
    summary: 'Throw at a catch within 50 feet (DC 13 Acrobatics) and climb an attached Rope.',
    description: `As a Utilize action, you can throw the Grappling Hook at a railing, a ledge, or another catch within 50 feet of yourself, and the hook catches on if you succeed on a DC 13 Dexterity (Acrobatics) check. If you tied a Rope to the hook, you can then climb it.`
  },
  {
    id: 'healers-kit',
    name: 'Healer’s Kit',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 3,
    summary: 'Ten uses; stabilize a creature at 0 HP without a Medicine check.',
    description: `A Healer’s Kit has ten uses. As a Utilize action, you can expend one of its uses to stabilize an Unconscious creature that has 0 Hit Points without needing to make a Wisdom (Medicine) check.`
  },
  {
    id: 'holy-symbol',
    name: 'Holy Symbol',
    category: 'Holy Symbol',
    cost: 'Varies',
    weight: 0,
    weightText: 'Varies',
    summary: 'A spellcasting focus for Clerics and Paladins (amulet, emblem, or reliquary).',
    description: `${HOLY_TEXT}

| Symbol | Weight | Cost |
|---|---|---|
| Amulet (worn or held) | 1 lb. | 5 GP |
| Emblem (borne on fabric or a Shield) | — | 5 GP |
| Reliquary (held) | 2 lb. | 5 GP |`
  },
  focus('amulet', 'Amulet', 'Holy Symbol', HOLY_TEXT, 1, '5 GP', 'worn or held'),
  focus('emblem', 'Emblem', 'Holy Symbol', HOLY_TEXT, 0, '5 GP', 'borne on fabric or a Shield'),
  focus('reliquary', 'Reliquary', 'Holy Symbol', HOLY_TEXT, 2, '5 GP', 'held'),
  {
    id: 'holy-water',
    name: 'Holy Water',
    category: 'Adventuring Gear',
    cost: '25 GP',
    weight: 1,
    summary: 'Replace an attack to throw a flask (20 ft.): Dex save or 2d8 Radiant damage to a Fiend or Undead.',
    description: `When you take the Attack action, you can replace one of your attacks with throwing a flask of Holy Water. Target one creature you can see within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or take 2d8 Radiant damage if it is a Fiend or an Undead.`
  },
  {
    id: 'hunting-trap',
    name: 'Hunting Trap',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 25,
    summary: 'A set trap: DC 13 Dex save or 1d4 Piercing damage and Speed 0; DC 13 Athletics to break free.',
    description: `As a Utilize action, you can set a Hunting Trap, which is a sawtooth steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object, such as a tree or a spike driven into the ground. A creature that steps on the plate must succeed on a DC 13 Dexterity saving throw or take 1d4 Piercing damage and have its Speed reduced to 0 until the start of its next turn. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet). A creature can use its action to make a DC 13 Strength (Athletics) check, freeing itself or another creature within its reach on a success. Each failed check deals 1 Piercing damage to the trapped creature.`
  },
  {
    id: 'ink',
    name: 'Ink',
    category: 'Adventuring Gear',
    cost: '10 GP',
    weight: 0,
    description: `Ink comes in a 1-ounce bottle, which provides enough ink to write about 500 pages.`
  },
  {
    id: 'ink-pen',
    name: 'Ink Pen',
    category: 'Adventuring Gear',
    cost: '2 CP',
    weight: 0,
    description: `Using Ink, an Ink Pen is used to write or draw.`
  },
  {
    id: 'jug',
    name: 'Jug',
    category: 'Container',
    cost: '2 CP',
    weight: 4,
    description: `A Jug holds up to 1 gallon.`
  },
  {
    id: 'ladder',
    name: 'Ladder',
    category: 'Adventuring Gear',
    cost: '1 SP',
    weight: 25,
    description: `A Ladder is 10 feet tall. You must climb to move up or down it.`
  },
  {
    id: 'lamp',
    name: 'Lamp',
    category: 'Adventuring Gear',
    cost: '5 SP',
    weight: 1,
    description: `A Lamp burns Oil as fuel to cast Bright Light in a 15-foot radius and Dim Light for an additional 30 feet.`
  },
  {
    id: 'bullseye-lantern',
    name: 'Bullseye Lantern',
    category: 'Adventuring Gear',
    cost: '10 GP',
    weight: 2,
    description: `A Bullseye Lantern burns Oil as fuel to cast Bright Light in a 60-foot Cone and Dim Light for an additional 60 feet.`
  },
  {
    id: 'hooded-lantern',
    name: 'Hooded Lantern',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 2,
    description: `A Hooded Lantern burns Oil as fuel to cast Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. As a Bonus Action, you can lower the hood, reducing the light to Dim Light in a 5-foot radius, or raise it again.`
  },
  {
    id: 'lock',
    name: 'Lock',
    category: 'Adventuring Gear',
    cost: '10 GP',
    weight: 1,
    description: `A Lock comes with a key. Without the key, a creature can use Thieves’ Tools to pick this Lock with a successful DC 15 Dexterity (Sleight of Hand) check.`
  },
  {
    id: 'magnifying-glass',
    name: 'Magnifying Glass',
    category: 'Adventuring Gear',
    cost: '100 GP',
    weight: 0,
    summary: 'Advantage on checks to appraise or inspect highly detailed items.',
    description: `A Magnifying Glass grants Advantage on any ability check made to appraise or inspect a highly detailed item. Lighting a fire with a Magnifying Glass requires light as bright as sunlight to focus, tinder to ignite, and about 5 minutes for the fire to ignite.`
  },
  {
    id: 'manacles',
    name: 'Manacles',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 6,
    summary: 'Bind a Small or Medium Grappled, Incapacitated, or Restrained creature (DC 13 Sleight of Hand).',
    description: `As a Utilize action, you can use Manacles to bind an unwilling Small or Medium creature within 5 feet of yourself that has the Grappled, Incapacitated, or Restrained condition if you succeed on a DC 13 Dexterity (Sleight of Hand) check. While bound, a creature has Disadvantage on attack rolls, and the creature is Restrained if the Manacles are attached to a chain or hook that is fixed in place. Escaping the Manacles requires a successful DC 20 Dexterity (Sleight of Hand) check as an action. Bursting them requires a successful DC 25 Strength (Athletics) check as an action.

Each set of Manacles comes with a key. Without the key, a creature can use Thieves’ Tools to pick the Manacles’ lock with a successful DC 15 Dexterity (Sleight of Hand) check.`
  },
  {
    id: 'map',
    name: 'Map',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 0,
    description: `If you consult an accurate Map, you gain a +5 bonus to Wisdom (Survival) checks you make to find your way in the place represented on it.`
  },
  {
    id: 'mirror',
    name: 'Mirror',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 0.5,
    weightText: '1/2 lb.',
    description: `A handheld steel Mirror is useful for personal cosmetics but also for peeking around corners and reflecting light as a signal.`
  },
  {
    id: 'net',
    name: 'Net',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 3,
    summary: 'Replace an attack to throw a Net (15 ft.): Dex save or Restrained.',
    description: `When you take the Attack action, you can replace one of your attacks with throwing a Net. Target a creature you can see within 15 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or have the Restrained condition until it escapes. The target succeeds automatically if it is Huge or larger.

To escape, the target or a creature within 5 feet of it must take an action to make a DC 10 Strength (Athletics) check, freeing the Restrained creature on a success. Destroying the Net (AC 10; 5 HP; Immunity to Bludgeoning, Poison, and Psychic damage) also frees the target, ending the effect.`
  },
  {
    id: 'oil',
    name: 'Oil',
    category: 'Adventuring Gear',
    cost: '1 SP',
    weight: 1,
    summary: 'Douse a creature or area for extra Fire damage, or fuel a Lamp or Lantern for 6 hours.',
    description: `You can douse a creature, object, or space with Oil or use it as fuel, as detailed below.

**Dousing a Creature or an Object.** When you take the Attack action, you can replace one of your attacks with throwing an Oil flask. Target one creature or object within 20 feet of yourself. The target must succeed on a Dexterity saving throw (DC 8 plus your Dexterity modifier and Proficiency Bonus) or be covered in oil. If the target takes Fire damage before the oil dries (after 1 minute), the target takes an extra 5 Fire damage from burning oil.

**Dousing a Space.** You can take the Utilize action to pour an Oil flask on level ground to cover a 5-foot-square area within 5 feet of yourself. If lit, the oil burns until the end of the turn 2 rounds from when the oil was lit (or 12 seconds) and deals 5 Fire damage to any creature that enters the area or ends its turn there. A creature can take this damage only once per turn.

**Fuel.** Oil serves as fuel for Lamps and Lanterns. Once lit, a flask of Oil burns for 6 hours in a Lamp or Lantern. That duration doesn’t need to be consecutive; you can extinguish the burning Oil (as a Utilize action) and rekindle it again until it has burned for a total of 6 hours.`
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'Adventuring Gear',
    cost: '2 SP',
    weight: 0,
    description: `One sheet of Paper can hold about 250 handwritten words.`
  },
  {
    id: 'parchment',
    name: 'Parchment',
    category: 'Adventuring Gear',
    cost: '1 SP',
    weight: 0,
    description: `One sheet of Parchment can hold about 250 handwritten words.`
  },
  {
    id: 'perfume',
    name: 'Perfume',
    category: 'Adventuring Gear',
    cost: '5 GP',
    weight: 0,
    summary: 'For 1 hour, Advantage on Persuasion checks to influence an Indifferent Humanoid within 5 feet.',
    description: `Perfume comes in a 4-ounce vial. For 1 hour after applying Perfume to yourself, you have Advantage on Charisma (Persuasion) checks made to influence an Indifferent Humanoid within 5 feet of yourself.`
  },
  {
    id: 'basic-poison',
    name: 'Basic Poison',
    category: 'Adventuring Gear',
    cost: '100 GP',
    weight: 0,
    summary: 'Bonus Action: coat a weapon or 3 ammunition; Piercing/Slashing hits deal an extra 1d4 Poison damage for 1 minute.',
    description: `As a Bonus Action, you can use a vial of Basic Poison to coat one weapon or up to three pieces of ammunition. A creature that takes Piercing or Slashing damage from the poisoned weapon or ammunition takes an extra 1d4 Poison damage. Once applied, the poison retains potency for 1 minute or until its damage is dealt, whichever comes first.`
  },
  {
    id: 'pole',
    name: 'Pole',
    category: 'Adventuring Gear',
    cost: '5 CP',
    weight: 7,
    description: `A Pole is 10 feet long. You can use it to touch something up to 10 feet away. If you must make a Strength (Athletics) check as part of a High or Long Jump, you can use the Pole to vault, giving yourself Advantage on the check.`
  },
  {
    id: 'iron-pot',
    name: 'Iron Pot',
    category: 'Container',
    cost: '2 GP',
    weight: 10,
    description: `An Iron Pot holds up to 1 gallon.`
  },
  {
    id: 'potion-of-healing',
    name: 'Potion of Healing',
    category: 'Adventuring Gear',
    cost: '50 GP',
    weight: 0.5,
    weightText: '1/2 lb.',
    summary: 'Bonus Action to drink or administer: regain 2d4 + 2 Hit Points.',
    description: `This potion is a magic item. As a Bonus Action, you can drink it or administer it to another creature within 5 feet of yourself. The creature that drinks the magical red fluid in this vial regains 2d4 + 2 Hit Points.`
  },
  {
    id: 'pouch',
    name: 'Pouch',
    category: 'Container',
    cost: '5 SP',
    weight: 1,
    description: `A Pouch holds up to 6 pounds within one-fifth of a cubic foot.`
  },
  {
    id: 'priests-pack',
    name: 'Priest’s Pack',
    category: 'Pack',
    cost: '33 GP',
    weight: 29,
    summary: 'Backpack, Blanket, Holy Water, Lamp, 7 Rations, Robe, Tinderbox.',
    description: `A Priest’s Pack contains the following items: Backpack, Blanket, Holy Water, Lamp, 7 days of Rations, Robe, and Tinderbox.`,
    contents: [
      { id: 'backpack' },
      { id: 'blanket' },
      { id: 'holy-water' },
      { id: 'lamp' },
      { id: 'rations', qty: 7 },
      { id: 'robe' },
      { id: 'tinderbox' }
    ]
  },
  {
    id: 'quiver',
    name: 'Quiver',
    category: 'Container',
    cost: '1 GP',
    weight: 1,
    description: `A Quiver holds up to 20 Arrows.`
  },
  {
    id: 'portable-ram',
    name: 'Portable Ram',
    category: 'Adventuring Gear',
    cost: '4 GP',
    weight: 35,
    description: `You can use a Portable Ram to break down doors. When doing so, you gain a +4 bonus to the Strength check. One other character can help you use the ram, giving you Advantage on this check.`
  },
  {
    id: 'rations',
    name: 'Rations',
    category: 'Adventuring Gear',
    cost: '5 SP',
    weight: 2,
    summary: 'One day of travel-ready food.',
    description: `Rations consist of travel-ready food, including jerky, dried fruit, hardtack, and nuts. See “Malnutrition” in “Rules Glossary” for the risks of not eating.`
  },
  {
    id: 'robe',
    name: 'Robe',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 4,
    description: `A Robe has vocational or ceremonial significance. Some events and locations admit only people wearing a Robe bearing certain colors or symbols.`
  },
  {
    id: 'rope',
    name: 'Rope',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 5,
    summary: 'Tie knots (DC 10 Sleight of Hand) or bind a Grappled, Incapacitated, or Restrained creature.',
    description: `As a Utilize action, you can tie a knot with Rope if you succeed on a DC 10 Dexterity (Sleight of Hand) check. The Rope can be burst with a successful DC 20 Strength (Athletics) check.

You can bind an unwilling creature with the Rope only if the creature has the Grappled, Incapacitated, or Restrained condition. If the creature’s legs are bound, the creature has the Restrained condition until it escapes. Escaping the Rope requires the creature to make a successful DC 15 Dexterity (Acrobatics) check as an action.`
  },
  {
    id: 'sack',
    name: 'Sack',
    category: 'Container',
    cost: '1 CP',
    weight: 0.5,
    weightText: '1/2 lb.',
    description: `A Sack holds up to 30 pounds within 1 cubic foot.`
  },
  {
    id: 'scholars-pack',
    name: 'Scholar’s Pack',
    category: 'Pack',
    cost: '40 GP',
    weight: 22,
    summary: 'Backpack, Book, Ink, Ink Pen, Lamp, 10 Oil, 10 Parchment, Tinderbox.',
    description: `A Scholar’s Pack contains the following items: Backpack, Book, Ink, Ink Pen, Lamp, 10 flasks of Oil, 10 sheets of Parchment, and Tinderbox.`,
    contents: [
      { id: 'backpack' },
      { id: 'book' },
      { id: 'ink' },
      { id: 'ink-pen' },
      { id: 'lamp' },
      { id: 'oil', qty: 10 },
      { id: 'parchment', qty: 10 },
      { id: 'tinderbox' }
    ]
  },
  {
    id: 'shovel',
    name: 'Shovel',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 5,
    description: `Working for 1 hour, you can use a Shovel to dig a hole that is 5 feet on each side in soil or similar material.`
  },
  {
    id: 'signal-whistle',
    name: 'Signal Whistle',
    category: 'Adventuring Gear',
    cost: '5 CP',
    weight: 0,
    description: `When blown as a Utilize action, a Signal Whistle produces a sound that can be heard up to 600 feet away.`
  },
  {
    id: 'spell-scroll-cantrip',
    name: 'Spell Scroll (Cantrip)',
    category: 'Adventuring Gear',
    cost: '30 GP',
    weight: 0,
    summary: 'A magic scroll bearing a cantrip; save DC 13, attack bonus +5.',
    description: `A Spell Scroll (Cantrip) or Spell Scroll (Level 1) is a magic item that bears the words of a cantrip or level 1 spell, respectively, determined by the scroll’s creator. If the spell is on your class’s spell list, you can read the scroll and cast the spell using its normal casting time and without providing any Material components.

If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is +5. The scroll disintegrates when the casting is completed.`
  },
  {
    id: 'spell-scroll-level-1',
    name: 'Spell Scroll (Level 1)',
    category: 'Adventuring Gear',
    cost: '50 GP',
    weight: 0,
    summary: 'A magic scroll bearing a level 1 spell; save DC 13, attack bonus +5.',
    description: `A Spell Scroll (Cantrip) or Spell Scroll (Level 1) is a magic item that bears the words of a cantrip or level 1 spell, respectively, determined by the scroll’s creator. If the spell is on your class’s spell list, you can read the scroll and cast the spell using its normal casting time and without providing any Material components.

If the spell requires a saving throw or an attack roll, the spell save DC is 13, and the attack bonus is +5. The scroll disintegrates when the casting is completed.`
  },
  {
    id: 'iron-spikes',
    name: 'Iron Spikes',
    category: 'Adventuring Gear',
    cost: '1 GP',
    weight: 5,
    description: `Iron Spikes come in bundles of ten. As a Utilize action, you can use a blunt object, such as a Light Hammer, to hammer a spike into wood, earth, or a similar material. You can do so to jam a door shut or to then tie a Rope or Chain to the Spike.`
  },
  {
    id: 'spyglass',
    name: 'Spyglass',
    category: 'Adventuring Gear',
    cost: '1,000 GP',
    weight: 1,
    description: `Objects viewed through a Spyglass are magnified to twice their size.`
  },
  {
    id: 'string',
    name: 'String',
    category: 'Adventuring Gear',
    cost: '1 SP',
    weight: 0,
    description: `String is 10 feet long. You can tie a knot in it as a Utilize action.`
  },
  {
    id: 'tent',
    name: 'Tent',
    category: 'Adventuring Gear',
    cost: '2 GP',
    weight: 20,
    description: `A Tent sleeps up to two Small or Medium creatures.`
  },
  {
    id: 'tinderbox',
    name: 'Tinderbox',
    category: 'Adventuring Gear',
    cost: '5 SP',
    weight: 1,
    summary: 'Light a Candle, Lamp, Lantern, or Torch as a Bonus Action; other fires take 1 minute.',
    description: `A Tinderbox is a small container holding flint, fire steel, and tinder (usually dry cloth soaked in light oil) used to kindle a fire. Using it to light a Candle, Lamp, Lantern, or Torch—or anything else with exposed fuel—takes a Bonus Action. Lighting any other fire takes 1 minute.`
  },
  {
    id: 'torch',
    name: 'Torch',
    category: 'Adventuring Gear',
    cost: '1 CP',
    weight: 1,
    summary: 'Burns for 1 hour (Bright Light 20 ft.); can be used as a Simple Melee weapon dealing 1 Fire damage.',
    description: `A Torch burns for 1 hour, casting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. When you take the Attack action, you can attack with the Torch, using it as a Simple Melee weapon. On a hit, the target takes 1 Fire damage.`
  },
  {
    id: 'vial',
    name: 'Vial',
    category: 'Container',
    cost: '1 GP',
    weight: 0,
    description: `A Vial holds up to 4 ounces.`
  },
  {
    id: 'waterskin',
    name: 'Waterskin',
    category: 'Container',
    cost: '2 SP',
    weight: 5,
    weightText: '5 lb. (full)',
    description: `A Waterskin holds up to 4 pints. If you don’t drink sufficient water, you risk dehydration (see “Rules Glossary”).`
  },
  {
    id: 'spellbook',
    name: 'Spellbook',
    category: 'Adventuring Gear',
    cost: '50 GP',
    weight: 3,
    source: 'PHB 2024',
    summary: 'A Wizard’s book of spells: a Tiny 100-page tome that holds the spells the Wizard can prepare.',
    description: `A Wizard records known spells in a spellbook—a Tiny object weighing 3 pounds with 100 pages. Copying a new spell into it takes time and costly inks; see the Wizard class for details.

*The cost listed is from the 2024 Player’s Handbook; the SRD covers spellbooks only in the Wizard class description.*`
  },

  /* ----------------------- Mounts and Vehicles ---------------------- */
  mount('camel', 'Camel', '450 lb.', '50 GP'),
  mount('elephant', 'Elephant', '1,320 lb.', '200 GP'),
  mount('draft-horse', 'Draft Horse', '540 lb.', '50 GP'),
  mount('riding-horse', 'Riding Horse', '480 lb.', '75 GP'),
  mount('mastiff', 'Mastiff', '195 lb.', '25 GP'),
  mount('mule', 'Mule', '420 lb.', '8 GP'),
  mount('pony', 'Pony', '225 lb.', '30 GP'),
  mount('warhorse', 'Warhorse', '540 lb.', '400 GP'),
  {
    id: 'carriage',
    name: 'Carriage',
    category: 'Vehicle',
    cost: '100 GP',
    weight: 600,
    summary: 'A drawn vehicle (600 lb.).',
    description: `A drawn vehicle. ${MOUNT_TEXT.split('\n\n')[1]}`
  },
  {
    id: 'cart',
    name: 'Cart',
    category: 'Vehicle',
    cost: '15 GP',
    weight: 200,
    summary: 'A drawn vehicle (200 lb.).',
    description: `A drawn vehicle. ${MOUNT_TEXT.split('\n\n')[1]}`
  },
  {
    id: 'chariot',
    name: 'Chariot',
    category: 'Vehicle',
    cost: '250 GP',
    weight: 100,
    summary: 'A drawn vehicle (100 lb.).',
    description: `A drawn vehicle. ${MOUNT_TEXT.split('\n\n')[1]}`
  },
  {
    id: 'sled',
    name: 'Sled',
    category: 'Vehicle',
    cost: '20 GP',
    weight: 300,
    summary: 'A drawn vehicle (300 lb.).',
    description: `A drawn vehicle. ${MOUNT_TEXT.split('\n\n')[1]}`
  },
  {
    id: 'wagon',
    name: 'Wagon',
    category: 'Vehicle',
    cost: '35 GP',
    weight: 400,
    summary: 'A drawn vehicle (400 lb.).',
    description: `A drawn vehicle. ${MOUNT_TEXT.split('\n\n')[1]}`
  },
  {
    id: 'feed',
    name: 'Feed (per day)',
    category: 'Tack',
    cost: '5 CP',
    weight: 10,
    description: `One day of feed for a mount or other animal.`
  },
  {
    id: 'stabling',
    name: 'Stabling (per day)',
    category: 'Tack',
    cost: '5 SP',
    weight: 0,
    description: `One day of stabling for a mount or other animal.`
  },
  {
    id: 'exotic-saddle',
    name: 'Exotic Saddle',
    category: 'Tack',
    cost: '60 GP',
    weight: 40,
    summary: 'Required for riding an aquatic or a flying mount.',
    description: SADDLE_TEXT
  },
  {
    id: 'military-saddle',
    name: 'Military Saddle',
    category: 'Tack',
    cost: '20 GP',
    weight: 30,
    summary: 'Advantage on ability checks to remain mounted.',
    description: SADDLE_TEXT
  },
  {
    id: 'riding-saddle',
    name: 'Riding Saddle',
    category: 'Tack',
    cost: '10 GP',
    weight: 25,
    summary: 'A standard saddle with bit, bridle, and reins.',
    description: SADDLE_TEXT
  },
  {
    id: 'barding',
    name: 'Barding',
    category: 'Tack',
    cost: 'Varies',
    weight: 0,
    weightText: 'Varies',
    summary: 'Armor for a mount: four times the normal cost and twice the weight.',
    description: `Barding is armor designed for a mount. Any type of armor on the Armor table in “Equipment” can be purchased as barding. The cost is four times the normal cost, and it weighs twice as much.`
  },
  ship('airship', 'Airship', '8 mph', '10', '20', '1', 13, 300, '—', '40,000 GP'),
  ship('galley', 'Galley', '4 mph', '80', '—', '150', 15, 500, '20', '30,000 GP'),
  ship('keelboat', 'Keelboat', '1 mph', '1', '6', '1/2', 15, 100, '10', '3,000 GP', 'Keelboats and Rowboats are used on lakes and rivers. If going downstream, add the speed of the current (typically 3 miles per hour) to the speed of the vehicle.'),
  ship('longship', 'Longship', '3 mph', '40', '150', '10', 15, 300, '15', '10,000 GP'),
  ship('rowboat', 'Rowboat', '1½ mph', '1', '3', '—', 11, 50, '—', '50 GP', 'Keelboats and Rowboats are used on lakes and rivers. A Rowboat can be carried and weighs 100 pounds.'),
  ship('sailing-ship', 'Sailing Ship', '2 mph', '20', '20', '100', 15, 300, '15', '10,000 GP'),
  ship('warship', 'Warship', '2½ mph', '60', '60', '200', 15, 500, '20', '25,000 GP')
]

function firstSentence(text: string): string {
  const m = text.match(/^(.+?[.!?])(\s|$)/)
  return m ? m[1] : text
}

export const gear: GearDef[] = rows.map((r) => {
  const weight = r.weightText ?? (r.weight ? `${r.weight} lb.` : '—')
  return {
    id: r.id,
    name: r.name,
    kind: 'gear',
    source: r.source ?? 'SRD 5.2',
    tags: [r.category],
    summary: r.summary ?? firstSentence(r.description),
    description: `*${r.category} — ${r.cost}, ${weight}*\n\n${r.description}`,
    category: r.category,
    cost: r.cost,
    weight: r.weight,
    ...(r.contents ? { contents: r.contents } : {})
  }
})
