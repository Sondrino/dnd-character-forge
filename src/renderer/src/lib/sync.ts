import type { Character, CharacterSpell } from '../types'
import type { Lookup } from '../engine/lookup'

/**
 * Spells som gis automatisk (subclass «always prepared», species lineage/legacy).
 * Returnerer ny spell-liste hvis noe må endres, ellers null.
 */
export function syncGrantedSpells(char: Character, L0: Lookup): CharacterSpell[] | null {
  const L = L0.extend(char.customEntities ?? [])
  const total = char.classes.reduce((s, c) => s + c.level, 0) || 1
  const desired: CharacterSpell[] = []
  for (const ce of char.classes) {
    const sub = L.get('subclass', ce.subclassId)
    for (const g of sub?.alwaysPrepared ?? []) {
      if (g.level > ce.level) continue
      for (const id of g.spells) if (L.get('spell', id)) desired.push({ spellId: id, source: ce.classId, prepared: true, alwaysPrepared: true })
    }
  }
  const sp = L.get('species', char.speciesId)
  const opt = sp?.options?.choices.find((o) => o.id === char.speciesOptionId)
  for (const s of [...(sp?.spells ?? []), ...(opt?.spells ?? [])]) {
    if (s.level > total) continue
    if (L.get('spell', s.spellId)) desired.push({ spellId: s.spellId, source: 'species', prepared: true, alwaysPrepared: true })
  }

  const isGranted = (s: CharacterSpell): boolean => !!s.alwaysPrepared && (s.source === 'species' || char.classes.some((c) => c.classId === s.source))
  const kept = char.spells.filter((s) => !isGranted(s) || desired.some((d) => d.spellId === s.spellId && d.source === s.source))
  const add = desired.filter((d) => !kept.some((s) => s.spellId === d.spellId && s.source === d.source))
  // Unngå duplikater: en granted spell erstatter en manuelt valgt av samme class
  const next = [...kept.filter((s) => !(add.some((a) => a.spellId === s.spellId && a.source === s.source))), ...add]
  if (next.length === char.spells.length && add.length === 0) return null
  return next
}
