/** Små rene hjelpefunksjoner for søk/filtre i UI-et (spells-fanen og forsiden) */
import type { Character, CharacterSpell, SpellDef } from '../types'
import { castingKind } from './combat'

export interface OwnSpellFilter {
  query: string
  /** Bare spells du kan kaste nå: cantrips, prepared og alltid prepared */
  preparedOnly: boolean
  ritual: boolean
  concentration: boolean
  /** Casting time: alle, action, bonus action eller reaction */
  time: 'all' | 'action' | 'bonus' | 'reaction'
}

export const EMPTY_SPELL_FILTER: OwnSpellFilter = { query: '', preparedOnly: false, ritual: false, concentration: false, time: 'all' }

export function isSpellFilterActive(f: OwnSpellFilter): boolean {
  return !!f.query.trim() || f.preparedOnly || f.ritual || f.concentration || f.time !== 'all'
}

/** Treffer en av karakterens egne spells filteret? */
export function matchOwnSpell(s: CharacterSpell, sp: SpellDef, f: OwnSpellFilter): boolean {
  const q = f.query.trim().toLowerCase()
  if (q && !sp.name.toLowerCase().includes(q) && !(sp.school ?? '').toLowerCase().includes(q)) return false
  if (f.preparedOnly && sp.level > 0 && !s.prepared && !s.alwaysPrepared) return false
  if (f.ritual && !sp.ritual) return false
  if (f.concentration && !sp.concentration) return false
  if (f.time !== 'all' && castingKind(sp.castingTime ?? '') !== f.time) return false
  return true
}

/** Forsiden: søk i navn, class, species og spiller – arkiverte skjules med mindre showArchived */
export function filterCharacters(
  list: Character[],
  query: string,
  showArchived: boolean,
  describe: (c: Character) => string = () => ''
): Character[] {
  const q = query.trim().toLowerCase()
  return list.filter((c) => {
    if (c.archived && !showArchived) return false
    if (!q) return true
    const hay = [c.name, c.playerName, describe(c), ...c.classes.map((x) => x.classId), c.speciesId].join(' ').toLowerCase()
    return q.split(/\s+/).every((w) => hay.includes(w))
  })
}
