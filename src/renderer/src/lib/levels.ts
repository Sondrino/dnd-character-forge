import type { Character } from '../types'
import type { Lookup } from '../engine/lookup'
import { averageHitDie } from '../engine/tables'
import { computeCharacter } from '../engine/compute'

export interface LevelDownPreview {
  className: string
  fromLevel: number
  toLevel: number
  hpLost: number
  removedFeatures: string[]
  removedFeats: string[]
  removesSubclass?: string
  removesClass: boolean
}

/** Hva skjer hvis vi tar bort ett level i en class? */
export function previewLevelDown(c: Character, classId: string, L: Lookup, conMod: number): LevelDownPreview | null {
  const ce = c.classes.find((x) => x.classId === classId)
  const def = L.get('class', classId)
  if (!ce || !def) return null
  const total = c.classes.reduce((s, x) => s + x.level, 0)
  if (total <= 1) return null
  const lvl = ce.level
  const isFirst = c.classes[0]?.classId === classId
  const roll = ce.hpRolls?.[lvl - 1]
  const die = isFirst && lvl === 1 ? def.hitDie : typeof roll === 'number' ? roll : averageHitDie(def.hitDie)
  const sub = L.get('subclass', ce.subclassId)
  const removedFeatures = [
    ...def.features.filter((f) => (f.level ?? 1) === lvl).map((f) => f.name),
    ...(sub?.features.filter((f) => (f.level ?? def.subclassLevel) === lvl).map((f) => f.name) ?? [])
  ]
  const removedFeats = c.feats
    .filter((f) => featBelongsAbove(f.source, classId, lvl - 1, L, sub?.id))
    .map((f) => L.get('feat', f.featId)?.name ?? f.featId)
  return {
    className: def.name,
    fromLevel: lvl,
    toLevel: lvl - 1,
    hpLost: Math.max(1, die + conMod),
    removedFeatures,
    removedFeats,
    removesSubclass: sub && lvl - 1 < def.subclassLevel ? sub.name : undefined,
    removesClass: lvl - 1 === 0
  }
}

/** Er en feat-kilde knyttet til et class-/subclass-nivå over `maxLevel`? */
function featBelongsAbove(source: string, classId: string, maxLevel: number, L: Lookup, subId?: string): boolean {
  const def = L.get('class', classId)
  if (!def) return false
  // ASI/Epic Boon: 'class:fighter:4'
  const asi = new RegExp(`^class:${classId}:(\\d+)$`).exec(source)
  if (asi) return Number(asi[1]) > maxLevel
  // Feature-valg: 'class:fighter:<featureId>:<choiceId>#feat'
  const fm = new RegExp(`^class:${classId}:([^:#]+):`).exec(source)
  if (fm) {
    const f = def.features.find((x) => x.id === fm[1])
    return maxLevel === 0 || (f?.level ?? 1) > maxLevel
  }
  if (subId) {
    const sm = new RegExp(`^subclass:${subId}:([^:#]+):`).exec(source)
    if (sm) {
      const sub = L.get('subclass', subId)
      const f = sub?.features.find((x) => x.id === sm[1])
      return maxLevel < def.subclassLevel || (f?.level ?? def.subclassLevel) > maxLevel
    }
  }
  return false
}

/** Fjerner ett level fra en class (angre level up). Muterer utkastet. */
export function levelDown(c: Character, classId: string, L: Lookup): void {
  const ce = c.classes.find((x) => x.classId === classId)
  const def = L.get('class', classId)
  if (!ce || !def) return
  const total = c.classes.reduce((s, x) => s + x.level, 0)
  if (total <= 1) return
  // CON-modifier fra hele beregningen (inkl. ASI, feats og magiske gjenstander)
  const conMod = computeCharacter(c, L).abilities.con.mod
  const preview = previewLevelDown(c, classId, L, conMod)
  const newLevel = ce.level - 1
  const sub = L.get('subclass', ce.subclassId)

  // Feats fra nivåer som forsvinner
  const goneFeats = c.feats.filter((f) => featBelongsAbove(f.source, classId, newLevel, L, sub?.id)).map((f) => f.uid)
  c.feats = c.feats.filter((f) => !goneFeats.includes(f.uid))
  c.spells = c.spells.filter((s) => !goneFeats.some((u) => s.source === `feat:${u}`))

  // Valg knyttet til features over nytt nivå
  for (const k of Object.keys(c.choices)) {
    const m = new RegExp(`^class:${classId}:([^:#]+):`).exec(k)
    if (m) {
      const f = def.features.find((x) => x.id === m[1])
      if (newLevel === 0 || (f && (f.level ?? 1) > newLevel)) delete c.choices[k]
    }
    if (sub) {
      const sm = new RegExp(`^subclass:${sub.id}:([^:#]+):`).exec(k)
      if (sm) {
        const f = sub.features.find((x) => x.id === sm[1])
        if (newLevel < def.subclassLevel || (f && (f.level ?? def.subclassLevel) > newLevel)) delete c.choices[k]
      }
    }
  }

  // Subclass forsvinner under subclass-nivå
  if (sub && newLevel < def.subclassLevel) ce.subclassId = undefined

  if (newLevel <= 0) {
    c.classes = c.classes.filter((x) => x.classId !== classId)
    c.spells = c.spells.filter((s) => s.source !== classId)
    delete c.choices[`class:${classId}:skills#skill`]
  } else {
    ce.level = newLevel
    ce.hpRolls = ce.hpRolls.slice(0, newLevel)
  }
  c.hp.current = Math.max(0, c.hp.current - (preview?.hpLost ?? 0))
  // Brukte ressurser kan ikke overstige nytt maks
  c.spellSlotsUsed = []
  c.pactSlotsUsed = 0
}
