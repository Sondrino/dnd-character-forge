import type {
  AnyEntity, ArmorDef, BackgroundDef, ClassDef, ClassOptionGroup, ConditionDef, EntityKind, FeatDef, GearDef,
  LanguageDef, MagicItemDef, CreatureDef, DeityDef, RuleDef, SpeciesDef, SpellDef, SubclassDef, ToolDef, WeaponDef
} from '../types'

export interface KindMap {
  class: ClassDef
  subclass: SubclassDef
  species: SpeciesDef
  background: BackgroundDef
  feat: FeatDef
  spell: SpellDef
  weapon: WeaponDef
  armor: ArmorDef
  gear: GearDef
  tool: ToolDef
  magicItem: MagicItemDef
  condition: ConditionDef
  rule: RuleDef
  language: LanguageDef
  creature: CreatureDef
  deity: DeityDef
  feature: Extract<AnyEntity, { kind: 'feature' }>
}

export const ITEM_KINDS: EntityKind[] = ['weapon', 'armor', 'gear', 'tool', 'magicItem']

export interface Lookup {
  get<K extends EntityKind>(kind: K, id: string | undefined): KindMap[K] | undefined
  /** Søker blant våpen, rustning, utstyr, verktøy og magiske gjenstander */
  item(id: string | undefined): AnyEntity | undefined
  all<K extends EntityKind>(kind: K): KindMap[K][]
  /** Finn entity uansett type (første treff) */
  any(id: string | undefined): AnyEntity | undefined
  classOptions: ClassOptionGroup[]
  /** Ny lookup med ekstra (homebrew) entities lagt over */
  extend(extra: AnyEntity[]): Lookup
}

export function createLookup(entities: AnyEntity[], classOptions: ClassOptionGroup[] = []): Lookup {
  const byKind = new Map<EntityKind, Map<string, AnyEntity>>()
  for (const e of entities) {
    if (!e || !e.kind) continue
    let m = byKind.get(e.kind)
    if (!m) byKind.set(e.kind, (m = new Map()))
    m.set(e.id, e) // senere vinner (homebrew overstyrer)
  }
  const lookup: Lookup = {
    get(kind, id) {
      if (!id) return undefined
      return byKind.get(kind)?.get(id) as never
    },
    item(id) {
      if (!id) return undefined
      // Homebrew lagt sist skal vinne; men innen kinds søkes i fast rekkefølge
      for (const k of ITEM_KINDS) {
        const hit = byKind.get(k)?.get(id)
        if (hit) return hit
      }
      return undefined
    },
    all(kind) {
      return [...(byKind.get(kind)?.values() ?? [])] as never
    },
    any(id) {
      if (!id) return undefined
      for (const m of byKind.values()) {
        const hit = m.get(id)
        if (hit) return hit
      }
      return undefined
    },
    classOptions,
    extend(extra) {
      if (!extra.length) return lookup
      return createLookup([...entities, ...extra], classOptions)
    }
  }
  return lookup
}
