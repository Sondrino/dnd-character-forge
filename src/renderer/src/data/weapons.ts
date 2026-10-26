// Weapons (SRD 5.2.1, CC-BY-4.0). Property and mastery definitions live in rules.ts.
import type { DamageType, MasteryId, WeaponDef, WeaponProperty } from '../types'

interface Row {
  id: string
  name: string
  category: 'simple' | 'martial'
  weaponType: 'melee' | 'ranged'
  damage: string
  damageType: DamageType
  properties: WeaponProperty[]
  versatile?: string
  range?: string
  ammunition?: string
  mastery: MasteryId
  weight: number
  cost: string
  /** Extra note shown in the property text, e.g. Lance */
  note?: string
}

const rows: Row[] = [
  // Simple Melee
  { id: 'club', name: 'Club', category: 'simple', weaponType: 'melee', damage: '1d4', damageType: 'bludgeoning', properties: ['light'], mastery: 'slow', weight: 2, cost: '1 SP' },
  { id: 'dagger', name: 'Dagger', category: 'simple', weaponType: 'melee', damage: '1d4', damageType: 'piercing', properties: ['finesse', 'light', 'thrown'], range: '20/60', mastery: 'nick', weight: 1, cost: '2 GP' },
  { id: 'greatclub', name: 'Greatclub', category: 'simple', weaponType: 'melee', damage: '1d8', damageType: 'bludgeoning', properties: ['two-handed'], mastery: 'push', weight: 10, cost: '2 SP' },
  { id: 'handaxe', name: 'Handaxe', category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'slashing', properties: ['light', 'thrown'], range: '20/60', mastery: 'vex', weight: 2, cost: '5 GP' },
  { id: 'javelin', name: 'Javelin', category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'piercing', properties: ['thrown'], range: '30/120', mastery: 'slow', weight: 2, cost: '5 SP' },
  { id: 'light-hammer', name: 'Light Hammer', category: 'simple', weaponType: 'melee', damage: '1d4', damageType: 'bludgeoning', properties: ['light', 'thrown'], range: '20/60', mastery: 'nick', weight: 2, cost: '2 GP' },
  { id: 'mace', name: 'Mace', category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'bludgeoning', properties: [], mastery: 'sap', weight: 4, cost: '5 GP' },
  { id: 'quarterstaff', name: 'Quarterstaff', category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'bludgeoning', properties: ['versatile'], versatile: '1d8', mastery: 'topple', weight: 4, cost: '2 SP' },
  { id: 'sickle', name: 'Sickle', category: 'simple', weaponType: 'melee', damage: '1d4', damageType: 'slashing', properties: ['light'], mastery: 'nick', weight: 2, cost: '1 GP' },
  { id: 'spear', name: 'Spear', category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], range: '20/60', versatile: '1d8', mastery: 'sap', weight: 3, cost: '1 GP' },

  // Simple Ranged
  { id: 'dart', name: 'Dart', category: 'simple', weaponType: 'ranged', damage: '1d4', damageType: 'piercing', properties: ['finesse', 'thrown'], range: '20/60', mastery: 'vex', weight: 0.25, cost: '5 CP' },
  { id: 'light-crossbow', name: 'Light Crossbow', category: 'simple', weaponType: 'ranged', damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'loading', 'two-handed'], range: '80/320', ammunition: 'Bolt', mastery: 'slow', weight: 5, cost: '25 GP' },
  { id: 'shortbow', name: 'Shortbow', category: 'simple', weaponType: 'ranged', damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'two-handed'], range: '80/320', ammunition: 'Arrow', mastery: 'vex', weight: 2, cost: '25 GP' },
  { id: 'sling', name: 'Sling', category: 'simple', weaponType: 'ranged', damage: '1d4', damageType: 'bludgeoning', properties: ['ammunition'], range: '30/120', ammunition: 'Bullet', mastery: 'slow', weight: 0, cost: '1 SP' },

  // Martial Melee
  { id: 'battleaxe', name: 'Battleaxe', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatile: '1d10', mastery: 'topple', weight: 4, cost: '10 GP' },
  { id: 'flail', name: 'Flail', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'bludgeoning', properties: [], mastery: 'sap', weight: 2, cost: '10 GP' },
  { id: 'glaive', name: 'Glaive', category: 'martial', weaponType: 'melee', damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], mastery: 'graze', weight: 6, cost: '20 GP' },
  { id: 'greataxe', name: 'Greataxe', category: 'martial', weaponType: 'melee', damage: '1d12', damageType: 'slashing', properties: ['heavy', 'two-handed'], mastery: 'cleave', weight: 7, cost: '30 GP' },
  { id: 'greatsword', name: 'Greatsword', category: 'martial', weaponType: 'melee', damage: '2d6', damageType: 'slashing', properties: ['heavy', 'two-handed'], mastery: 'graze', weight: 6, cost: '50 GP' },
  { id: 'halberd', name: 'Halberd', category: 'martial', weaponType: 'melee', damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], mastery: 'cleave', weight: 6, cost: '20 GP' },
  { id: 'lance', name: 'Lance', category: 'martial', weaponType: 'melee', damage: '1d10', damageType: 'piercing', properties: ['heavy', 'reach', 'two-handed'], mastery: 'topple', weight: 6, cost: '10 GP', note: 'Two-Handed (unless mounted)' },
  { id: 'longsword', name: 'Longsword', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatile: '1d10', mastery: 'sap', weight: 3, cost: '15 GP' },
  { id: 'maul', name: 'Maul', category: 'martial', weaponType: 'melee', damage: '2d6', damageType: 'bludgeoning', properties: ['heavy', 'two-handed'], mastery: 'topple', weight: 10, cost: '10 GP' },
  { id: 'morningstar', name: 'Morningstar', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'piercing', properties: [], mastery: 'sap', weight: 4, cost: '15 GP' },
  { id: 'pike', name: 'Pike', category: 'martial', weaponType: 'melee', damage: '1d10', damageType: 'piercing', properties: ['heavy', 'reach', 'two-handed'], mastery: 'push', weight: 18, cost: '5 GP' },
  { id: 'rapier', name: 'Rapier', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'piercing', properties: ['finesse'], mastery: 'vex', weight: 2, cost: '25 GP' },
  { id: 'scimitar', name: 'Scimitar', category: 'martial', weaponType: 'melee', damage: '1d6', damageType: 'slashing', properties: ['finesse', 'light'], mastery: 'nick', weight: 3, cost: '25 GP' },
  { id: 'shortsword', name: 'Shortsword', category: 'martial', weaponType: 'melee', damage: '1d6', damageType: 'piercing', properties: ['finesse', 'light'], mastery: 'vex', weight: 2, cost: '10 GP' },
  { id: 'trident', name: 'Trident', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'piercing', properties: ['thrown', 'versatile'], range: '20/60', versatile: '1d10', mastery: 'topple', weight: 4, cost: '5 GP' },
  { id: 'warhammer', name: 'Warhammer', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'bludgeoning', properties: ['versatile'], versatile: '1d10', mastery: 'push', weight: 5, cost: '15 GP' },
  { id: 'war-pick', name: 'War Pick', category: 'martial', weaponType: 'melee', damage: '1d8', damageType: 'piercing', properties: ['versatile'], versatile: '1d10', mastery: 'sap', weight: 2, cost: '5 GP' },
  { id: 'whip', name: 'Whip', category: 'martial', weaponType: 'melee', damage: '1d4', damageType: 'slashing', properties: ['finesse', 'reach'], mastery: 'slow', weight: 3, cost: '2 GP' },

  // Martial Ranged
  { id: 'blowgun', name: 'Blowgun', category: 'martial', weaponType: 'ranged', damage: '1', damageType: 'piercing', properties: ['ammunition', 'loading'], range: '25/100', ammunition: 'Needle', mastery: 'vex', weight: 1, cost: '10 GP' },
  { id: 'hand-crossbow', name: 'Hand Crossbow', category: 'martial', weaponType: 'ranged', damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'light', 'loading'], range: '30/120', ammunition: 'Bolt', mastery: 'vex', weight: 3, cost: '75 GP' },
  { id: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'martial', weaponType: 'ranged', damage: '1d10', damageType: 'piercing', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], range: '100/400', ammunition: 'Bolt', mastery: 'push', weight: 18, cost: '50 GP' },
  { id: 'longbow', name: 'Longbow', category: 'martial', weaponType: 'ranged', damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'heavy', 'two-handed'], range: '150/600', ammunition: 'Arrow', mastery: 'slow', weight: 2, cost: '50 GP' },
  { id: 'musket', name: 'Musket', category: 'martial', weaponType: 'ranged', damage: '1d12', damageType: 'piercing', properties: ['ammunition', 'loading', 'two-handed'], range: '40/120', ammunition: 'Bullet', mastery: 'slow', weight: 10, cost: '500 GP' },
  { id: 'pistol', name: 'Pistol', category: 'martial', weaponType: 'ranged', damage: '1d10', damageType: 'piercing', properties: ['ammunition', 'loading'], range: '30/90', ammunition: 'Bullet', mastery: 'vex', weight: 3, cost: '250 GP' }
]

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

function propLabel(r: Row, p: WeaponProperty): string {
  switch (p) {
    case 'ammunition':
      return `Ammunition (Range ${r.range}; ${r.ammunition})`
    case 'thrown':
      return `Thrown (Range ${r.range})`
    case 'versatile':
      return `Versatile (${r.versatile})`
    case 'two-handed':
      return r.note ?? 'Two-Handed'
    default:
      return cap(p)
  }
}

function propText(r: Row): string {
  return r.properties.length ? r.properties.map((p) => propLabel(r, p)).join(', ') : '—'
}

function weightText(w: number): string {
  if (w === 0) return '—'
  if (w === 0.25) return '1/4 lb.'
  return `${w} lb.`
}

export const weapons: WeaponDef[] = rows.map((r) => {
  const cat = `${cap(r.category)} ${cap(r.weaponType)} Weapon`
  const dmg = `${r.damage} ${cap(r.damageType)}`
  const props = propText(r)
  return {
    id: r.id,
    name: r.name,
    kind: 'weapon',
    source: 'SRD 5.2',
    tags: [r.category, r.weaponType, ...r.properties, `mastery:${r.mastery}`],
    summary: `${cat}: ${dmg}${r.versatile ? ` (${r.versatile} two-handed)` : ''}${r.range ? `, range ${r.range} ft` : ''}. Mastery: ${cap(r.mastery)}.`,
    description: `*${cat}*

| Damage | Properties | Mastery | Weight | Cost |
|---|---|---|---|---|
| ${dmg} | ${props} | ${cap(r.mastery)} | ${weightText(r.weight)} | ${r.cost} |`,
    category: r.category,
    weaponType: r.weaponType,
    damage: r.damage,
    damageType: r.damageType,
    properties: r.properties,
    ...(r.versatile ? { versatile: r.versatile } : {}),
    ...(r.range ? { range: r.range } : {}),
    ...(r.ammunition ? { ammunition: r.ammunition } : {}),
    mastery: r.mastery,
    weight: r.weight,
    cost: r.cost
  }
})
