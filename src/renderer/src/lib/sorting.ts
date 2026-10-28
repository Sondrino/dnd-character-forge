import type { AnyEntity, ArmorDef, CreatureDef, DeityDef, EntityKind, FeatDef, GearDef, MagicItemDef, SpellDef, ToolDef, WeaponDef } from '../types'
import { bookOf, PHB_BOOK } from '../components/ui'

/** Sammenligning som forstår tall i tekst («Level 2» før «Level 10») og ignorerer store/små bokstaver */
export const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' })

/** «15 GP», «2 SP», «5 CP» → verdi i GP */
export function costGp(cost: unknown): number {
  const m = String(cost ?? '').replace(/,/g, '').match(/([\d.]+)\s*(cp|sp|ep|gp|pp)/i)
  if (!m) return Number.POSITIVE_INFINITY
  const n = Number(m[1])
  return n * ({ cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 }[m[2].toLowerCase() as 'gp'] ?? 1)
}

/** «1/4» → 0.25, «2» → 2 */
export function crValue(cr: unknown): number {
  const s = String(cr ?? '').trim()
  const f = s.match(/^(\d+)\/(\d+)$/)
  if (f) return Number(f[1]) / Number(f[2])
  const n = Number(s)
  return Number.isFinite(n) ? n : 99
}

/** Gjennomsnittlig skade for «1d8», «2d6» */
export function avgDice(dice: unknown): number {
  const m = String(dice ?? '').match(/(\d*)d(\d+)/)
  if (!m) return Number(dice) || 0
  return (Number(m[1]) || 1) * ((Number(m[2]) + 1) / 2)
}

const RARITY = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies']
const FEAT_CAT = ['origin', 'general', 'fightingStyle', 'epicBoon']
const ARMOR_CAT = ['light', 'medium', 'heavy', 'shield']
const TOOL_CAT = ['artisan', 'other', 'gaming', 'musical']
const SOURCE_RANK: Record<string, number> = { 'SRD 5.2': 0, 'PHB 2024': 0, Supplement: 1, 'Forgotten Realms': 2, 'Third-party': 3, Homebrew: 4 }

const idx = (list: string[], v: unknown): number => {
  const i = list.indexOf(String(v))
  return i < 0 ? list.length : i
}
const then = (...cmps: ((a: AnyEntity, b: AnyEntity) => number)[]) => (a: AnyEntity, b: AnyEntity): number => {
  for (const c of cmps) {
    const r = c(a, b)
    if (r) return r
  }
  return 0
}
const bookCmp = (a: AnyEntity, b: AnyEntity): number =>
  (SOURCE_RANK[a.source] ?? 3) - (SOURCE_RANK[b.source] ?? 3) || (bookOf(a) === PHB_BOOK ? -1 : bookOf(b) === PHB_BOOK ? 1 : bookOf(a).localeCompare(bookOf(b)))

export interface SortOption {
  id: string
  /** i18n-nøkkel under «sort.» */
  label: string
  cmp: (a: AnyEntity, b: AnyEntity) => number
}

const NAME: SortOption = { id: 'name', label: 'name', cmp: byName }
const NAME_DESC: SortOption = { id: 'nameDesc', label: 'nameDesc', cmp: (a, b) => byName(b, a) }
const BOOK: SortOption = { id: 'book', label: 'book', cmp: then(bookCmp, byName) }
const COST: SortOption = { id: 'cost', label: 'cost', cmp: then((a, b) => costGp((a as GearDef).cost) - costGp((b as GearDef).cost), byName) }
const WEIGHT: SortOption = { id: 'weight', label: 'weight', cmp: then((a, b) => ((a as GearDef).weight ?? 0) - ((b as GearDef).weight ?? 0), byName) }

/** Sorteringsvalg per type; det første er standard */
export function sortOptions(kind: EntityKind | 'mixed'): SortOption[] {
  switch (kind) {
    case 'spell':
      return [
        { id: 'level', label: 'level', cmp: then((a, b) => (a as SpellDef).level - (b as SpellDef).level, byName) },
        NAME,
        { id: 'school', label: 'school', cmp: then((a, b) => (a as SpellDef).school.localeCompare((b as SpellDef).school), (a, b) => (a as SpellDef).level - (b as SpellDef).level, byName) },
        BOOK,
        NAME_DESC
      ]
    case 'magicItem':
      return [
        { id: 'rarity', label: 'rarity', cmp: then((a, b) => idx(RARITY, (a as MagicItemDef).rarity) - idx(RARITY, (b as MagicItemDef).rarity), byName) },
        NAME,
        { id: 'type', label: 'type', cmp: then((a, b) => (a as MagicItemDef).itemType.localeCompare((b as MagicItemDef).itemType), byName) },
        BOOK,
        NAME_DESC
      ]
    case 'creature':
      return [
        { id: 'cr', label: 'cr', cmp: then((a, b) => crValue((a as CreatureDef).cr) - crValue((b as CreatureDef).cr), byName) },
        NAME,
        { id: 'type', label: 'type', cmp: then((a, b) => (a as CreatureDef).creatureType.localeCompare((b as CreatureDef).creatureType), byName) },
        NAME_DESC
      ]
    case 'weapon':
      return [
        {
          id: 'category',
          label: 'category',
          cmp: then(
            (a, b) => Number((a as WeaponDef).category === 'martial') - Number((b as WeaponDef).category === 'martial'),
            (a, b) => Number((a as WeaponDef).weaponType === 'ranged') - Number((b as WeaponDef).weaponType === 'ranged'),
            byName
          )
        },
        NAME,
        { id: 'damage', label: 'damage', cmp: then((a, b) => avgDice((b as WeaponDef).damage) - avgDice((a as WeaponDef).damage), byName) },
        COST,
        WEIGHT
      ]
    case 'armor':
      return [
        { id: 'ac', label: 'ac', cmp: then((a, b) => idx(ARMOR_CAT, (a as ArmorDef).category) - idx(ARMOR_CAT, (b as ArmorDef).category), (a, b) => (a as ArmorDef).baseAC - (b as ArmorDef).baseAC, byName) },
        NAME,
        COST,
        WEIGHT
      ]
    case 'gear':
      return [NAME, COST, WEIGHT, NAME_DESC]
    case 'tool':
      return [{ id: 'category', label: 'category', cmp: then((a, b) => idx(TOOL_CAT, (a as ToolDef).category) - idx(TOOL_CAT, (b as ToolDef).category), byName) }, NAME, COST, WEIGHT]
    case 'feat':
      return [{ id: 'category', label: 'category', cmp: then((a, b) => idx(FEAT_CAT, (a as FeatDef).category) - idx(FEAT_CAT, (b as FeatDef).category), byName) }, NAME, BOOK, NAME_DESC]
    case 'subclass':
      return [{ id: 'class', label: 'class', cmp: then((a, b) => (a as { classId: string }).classId.localeCompare((b as { classId: string }).classId), bookCmp, byName) }, NAME, BOOK]
    case 'deity':
      return [NAME, { id: 'pantheon', label: 'pantheon', cmp: then((a, b) => (a as DeityDef).pantheon.localeCompare((b as DeityDef).pantheon), byName) }]
    case 'language':
      return [{ id: 'rarity', label: 'rarity', cmp: then((a, b) => Number((a as { rarity: string }).rarity === 'rare') - Number((b as { rarity: string }).rarity === 'rare'), byName) }, NAME]
    case 'species':
    case 'background':
    case 'class':
      return [NAME, BOOK, NAME_DESC]
    case 'mixed':
      return [
        { id: 'kind', label: 'kind', cmp: then((a, b) => a.kind.localeCompare(b.kind), byName) },
        NAME,
        COST,
        WEIGHT
      ]
    default:
      return [NAME, NAME_DESC]
  }
}

/** Sorter en liste med valgt (eller standard) sortering */
export function sortEntities<T extends AnyEntity>(list: T[], kind: EntityKind | 'mixed', sortId?: string): T[] {
  const opts = sortOptions(kind)
  const opt = opts.find((o) => o.id === sortId) ?? opts[0]
  return [...list].sort(opt.cmp as (a: T, b: T) => number)
}
