import type { AnyEntity, Character, EntityKind } from '../types'
import type { Lookup } from '../engine/lookup'
import { ITEM_KINDS } from '../engine/lookup'

/**
 * Deling av karakterer med homebrew: ved eksport legges homebrew-entities fra det felles biblioteket
 * som karakteren bruker (og som ikke finnes i grunndataene) ved siden av karakteren som `bundledHomebrew`.
 * Ren logikk – testet i tests/tools.test.ts.
 */

const KINDS: EntityKind[] = [
  'class', 'subclass', 'species', 'background', 'feat', 'spell', 'weapon', 'armor', 'gear', 'tool', 'magicItem',
  'condition', 'rule', 'language', 'feature', 'creature', 'deity'
]

/** Alle referanser (kind + id) fra karakteren til regeldata */
export function characterRefs(c: Character): { kinds: EntityKind[]; id: string }[] {
  const out: { kinds: EntityKind[]; id: string }[] = []
  const add = (kinds: EntityKind[], id: string | undefined): void => {
    if (id) out.push({ kinds, id })
  }
  for (const ce of c.classes ?? []) {
    add(['class'], ce.classId)
    add(['subclass'], ce.subclassId)
  }
  add(['species'], c.speciesId)
  add(['background'], c.backgroundId)
  add(['deity'], c.deityId)
  for (const f of c.feats ?? []) add(['feat'], f.featId)
  for (const s of c.spells ?? []) add(['spell'], s.spellId)
  for (const it of c.inventory ?? []) {
    add(ITEM_KINDS, it.refId)
    add(ITEM_KINDS, it.baseId)
  }
  for (const id of c.wildShape?.knownForms ?? []) add(['creature'], id)
  for (const cp of c.companions ?? []) add(['creature'], cp.creatureId)
  return out
}

/** Homebrew fra biblioteket som karakteren refererer til, og som ikke finnes i grunndataene */
export function selectBundledHomebrew(c: Character, homebrew: AnyEntity[], base: Lookup): AnyEntity[] {
  const picked = new Map<string, AnyEntity>()
  const take = (e: AnyEntity): void => void picked.set(`${e.kind}:${e.id}`, e)
  for (const ref of characterRefs(c)) {
    const hit = homebrew.find((e) => ref.kinds.includes(e.kind) && e.id === ref.id)
    if (!hit) continue
    if (ref.kinds.some((k) => base.get(k, ref.id))) continue
    take(hit)
  }
  // En homebrew-subclass til en homebrew-class: ta med classen også
  for (const e of [...picked.values()]) {
    if (e.kind !== 'subclass' || base.get('class', e.classId)) continue
    const cls = homebrew.find((x) => x.kind === 'class' && x.id === e.classId)
    if (cls) take(cls)
  }
  return [...picked.values()]
}

/** Gyldig nok entity til å legges i biblioteket */
function isEntity(e: unknown): e is AnyEntity {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return typeof o.id === 'string' && !!o.id && typeof o.name === 'string' && typeof o.kind === 'string' && KINDS.includes(o.kind as EntityKind)
}

/** Ved import: hvilke medfølgende homebrew-entities som mangler i biblioteket (og ikke er grunndata) */
export function homebrewToImport(bundled: unknown, existing: AnyEntity[], base: Lookup): AnyEntity[] {
  if (!Array.isArray(bundled)) return []
  const out: AnyEntity[] = []
  for (const e of bundled.slice(0, 500)) {
    if (!isEntity(e)) continue
    if (base.get(e.kind, e.id)) continue
    if (existing.some((x) => x.kind === e.kind && x.id === e.id)) continue
    if (out.some((x) => x.kind === e.kind && x.id === e.id)) continue
    out.push(e)
  }
  return out
}

/** Karakteren slik den skrives til fil: med `bundledHomebrew` når den bruker homebrew */
export function withBundledHomebrew(c: Character, homebrew: AnyEntity[], base: Lookup): Character & { bundledHomebrew?: AnyEntity[] } {
  const bundled = selectBundledHomebrew(c, homebrew, base)
  return bundled.length ? { ...c, bundledHomebrew: bundled } : c
}
