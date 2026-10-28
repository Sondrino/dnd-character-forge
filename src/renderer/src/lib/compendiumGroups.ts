import type { AnyEntity, ArmorDef, CreatureDef, DeityDef, EntityKind, FeatDef, GearDef, LanguageDef, MagicItemDef, RuleDef, SpellDef, ToolDef, WeaponDef } from '../types'
import type { Lookup } from '../engine/lookup'
import { bookLabel, bookOf, PHB_BOOK } from '../components/ui'

export interface EntityGroup {
  id: string
  label: string
  items: AnyEntity[]
}

/** Grupper etter en nøkkel; `order` gir rekkefølgen (ukjente nøkler havner alfabetisk til slutt) */
function groupBy(list: AnyEntity[], key: (e: AnyEntity) => string, label: (k: string) => string = (k) => k, order: string[] = []): EntityGroup[] {
  const map = new Map<string, AnyEntity[]>()
  for (const e of list) {
    const k = key(e) || 'Other'
    map.set(k, [...(map.get(k) ?? []), e])
  }
  const rank = (k: string): number => {
    const i = order.indexOf(k)
    return i < 0 ? order.length : i
  }
  return [...map.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || label(a).localeCompare(label(b)))
    .map(([k, items]) => ({ id: k.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: label(k), items }))
}

const cap = (s: string): string => s.replace(/(^|\s)\S/g, (m) => m.toUpperCase())

/**
 * Del oppslaget inn i grupper som er lette å skanne: subclasses per class, spells per nivå,
 * feats per kategori, våpen per type, magic items per rarity osv. Én gruppe = ingen inndeling.
 */
export function groupEntities(kind: EntityKind, list: AnyEntity[], L: Lookup): EntityGroup[] {
  switch (kind) {
    case 'subclass':
      return groupBy(list, (e) => (e as { classId: string }).classId, (k) => L.get('class', k)?.name ?? cap(k))
    case 'spell':
      return groupBy(
        list,
        (e) => String((e as SpellDef).level),
        (k) => (k === '0' ? 'Cantrips' : `Level ${k}`),
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      )
    case 'feat':
      return groupBy(
        list,
        (e) => (e as FeatDef).category,
        (k) => ({ origin: 'Origin Feats', general: 'General Feats', fightingStyle: 'Fighting Style Feats', epicBoon: 'Epic Boon Feats' })[k] ?? cap(k),
        ['origin', 'general', 'fightingStyle', 'epicBoon']
      )
    case 'weapon':
      return groupBy(
        list,
        (e) => `${(e as WeaponDef).category} ${(e as WeaponDef).weaponType}`,
        (k) => `${cap(k)} Weapons`,
        ['simple melee', 'simple ranged', 'martial melee', 'martial ranged']
      )
    case 'armor':
      return groupBy(
        list,
        (e) => (e as ArmorDef).category,
        (k) => (k === 'shield' ? 'Shields' : `${cap(k)} Armor`),
        ['light', 'medium', 'heavy', 'shield']
      )
    case 'gear':
      return groupBy(list, (e) => (e as GearDef).category ?? 'Adventuring Gear', (k) => k, ['Adventuring Gear', 'Ammunition', 'Arcane Focus', 'Druidic Focus', 'Holy Symbol', 'Container', 'Pack'])
    case 'tool':
      return groupBy(
        list,
        (e) => (e as ToolDef).category,
        (k) => ({ artisan: 'Artisan’s Tools', gaming: 'Gaming Sets', musical: 'Musical Instruments', other: 'Other Tools' })[k] ?? cap(k),
        ['artisan', 'other', 'gaming', 'musical']
      )
    case 'magicItem':
      return groupBy(list, (e) => (e as MagicItemDef).rarity, cap, ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies'])
    case 'rule':
      return groupBy(list, (e) => (e as RuleDef).category)
    case 'language':
      return groupBy(list, (e) => (e as LanguageDef).rarity, (k) => (k === 'standard' ? 'Standard Languages' : 'Rare Languages'), ['standard', 'rare'])
    case 'creature':
      return groupBy(list, (e) => cap((e as CreatureDef).creatureType ?? 'Other'))
    case 'deity':
      return groupBy(
        list,
        (e) => `${(e as DeityDef).category}|${(e as DeityDef).pantheon}`,
        (k) => {
          const [cat, pantheon] = k.split('|')
          return cat === 'patron' ? `Patrons – ${pantheon}` : `${pantheon} Gods`
        },
        []
      ).sort((a, b) => Number(a.label.startsWith('Patrons')) - Number(b.label.startsWith('Patrons')))
    case 'species':
    case 'background':
    case 'class':
      return groupBy(list, (e) => bookOf(e), bookLabelLong, [PHB_BOOK])
    default:
      return [{ id: 'all', label: '', items: list }]
  }
}

function bookLabelLong(book: string): string {
  return book === PHB_BOOK ? 'Player’s Handbook (2024)' : book.length > 40 ? bookLabel(book) : book
}
