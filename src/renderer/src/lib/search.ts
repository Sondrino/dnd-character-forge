import type { AnyEntity } from '../types'

const norm = (s: string): string => s.toLowerCase().replace(/[’‘`´]/g, "'")

/** Fritekstsøk i navn, andre navn (aliases), sammendrag og ev. tags. Apostrofer ' og ’ regnes som like. */
export function matchesQuery(e: AnyEntity, q: string, withTags = false): boolean {
  if (!q.trim()) return true
  const hay = norm([e.name, ...(e.aliases ?? []), e.summary ?? '', ...(withTags ? (e.tags ?? []) : [])].join(' '))
  return norm(q.trim()).split(/\s+/).every((w) => hay.includes(w))
}
