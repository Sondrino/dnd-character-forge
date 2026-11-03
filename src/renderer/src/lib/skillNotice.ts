import type { Derived, PendingChoice } from '../engine/compute'

/** Tekster som handler om skill proficiencies (ikke bare «Proficiency Bonus») */
const MENTIONS_SKILL_PROFICIENCY = /skill proficienc|proficien(?:t|cy|cies)\b(?! bonus)[^.\n|]*\bskills?\b|\bskills?\b[^.\n|]*\bproficien(?:t|cy|cies)\b(?! bonus)/i

/** Det som trengs fra en entity eller feature for å avgjøre om den handler om skill-valg */
export interface SkillNoticeTarget {
  kind: string
  id: string
  name: string
  summary?: string
  description?: string
}

/**
 * Uløste skill proficiency-valg som er relevante for det brukeren ser på:
 * classen/species-en selv, en feature med eget skill-valg, eller en feature som omtaler skill proficiencies.
 */
export function pendingSkillChoices(e: SkillNoticeTarget, d: Pick<Derived, 'pending' | 'features'>): PendingChoice[] {
  const pending = d.pending.filter((p) => p.type === 'skill')
  if (!pending.length) return []
  if (e.kind === 'class') return pending.filter((p) => p.source === e.name)
  if (e.kind === 'subclass' || e.kind === 'species') return pending.filter((p) => p.source.startsWith(`${e.name}: `))
  if (e.kind !== 'feature' || !d.features.some((f) => f.id === e.id)) return []
  const own = pending.filter((p) => p.source.endsWith(`: ${e.name}`))
  if (own.length) return own
  return MENTIONS_SKILL_PROFICIENCY.test(`${e.summary ?? ''}\n${e.description ?? ''}`) ? pending : []
}
