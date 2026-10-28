import type { AnyEntity, ClassOptionGroup } from '../types'
import { createLookup, type Lookup } from '../engine/lookup'
import { SPELL_ALIASES } from './aliases'
import { ARTIFICER_SPELL_IDS } from './supplements/tasha-artificer'

/**
 * Samler all regeldata automatisk fra filene i denne mappen.
 * Hver datafil eksporterer entities (objekter med `kind`) eller arrays av dem,
 * og class-filer kan i tillegg eksportere ClassOptionGroup-arrays.
 */
const modules = {
  ...import.meta.glob('./*.ts', { eager: true }),
  ...import.meta.glob('./*/*.ts', { eager: true })
} as Record<string, Record<string, unknown>>

const entities: AnyEntity[] = []
const classOptions: ClassOptionGroup[] = []

function collect(v: unknown): void {
  if (Array.isArray(v)) {
    for (const x of v) collect(x)
    return
  }
  if (!v || typeof v !== 'object') return
  const o = v as Record<string, unknown>
  if (typeof o.kind === 'string' && typeof o.id === 'string') entities.push(o as unknown as AnyEntity)
  else if (typeof o.group === 'string' && Array.isArray(o.items) && typeof o.classId === 'string') classOptions.push(o as unknown as ClassOptionGroup)
}

for (const [path, mod] of Object.entries(modules)) {
  if (path === './index.ts' || path === './skills.ts') continue
  for (const v of Object.values(mod)) collect(v)
}

for (const e of entities) if (e.kind === 'spell' && SPELL_ALIASES[e.id]) e.aliases = [...(e.aliases ?? []), ...SPELL_ALIASES[e.id]]

// Artificer-spell-listen (Tasha's Cauldron of Everything): legg 'artificer' til classes (ny array – noen spells deler class-arrays)
{
  const artificer = new Set(ARTIFICER_SPELL_IDS)
  for (const e of entities) if (e.kind === 'spell' && artificer.has(e.id) && !e.classes.includes('artificer')) e.classes = [...e.classes, 'artificer']
}

export const allEntities = entities
export const baseLookup: Lookup = createLookup(entities, classOptions)

export const ATTRIBUTION =
  'This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.'

export const DISCLAIMER_PHB =
  'Entries marked "PHB 2024" contain only game-mechanical facts and short summaries written for this app. Read the full text in the Player’s Handbook or on D&D Beyond. Compatible with fifth edition.'

const DDB = 'https://www.dndbeyond.com'

/** D&D Beyond-lenke for en entity: direkte URL hvis kjent, ellers søk */
export function dndBeyondUrl(e: { name: string; kind?: string; dndBeyondUrl?: string; aliases?: string[] }): string {
  if (e.dndBeyondUrl) return e.dndBeyondUrl
  // D&D Beyond bruker PHB-navnene (f.eks. «Melf’s Acid Arrow»)
  const q = encodeURIComponent((e.aliases?.[0] ?? e.name).replace(/\s*\(.*?\)\s*/g, ' ').trim())
  switch (e.kind) {
    case 'spell':
      return `${DDB}/spells?filter-search=${q}`
    case 'magicItem':
      return `${DDB}/magic-items?filter-search=${q}`
    case 'feat':
      return `${DDB}/feats?filter-search=${q}`
    case 'species':
      return `${DDB}/species?filter-search=${q}`
    case 'background':
      return `${DDB}/backgrounds?filter-search=${q}`
    case 'weapon':
    case 'armor':
    case 'gear':
    case 'tool':
      return `${DDB}/equipment?filter-search=${q}`
    default:
      return `${DDB}/search?q=${q}`
  }
}
