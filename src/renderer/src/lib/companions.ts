import type { Character, Combatant, Companion, CreatureDef } from '../types'
import { creatureHp } from './wildShape'

/** Companions (familiar, dyrevenn, steed, summon) – ren logikk, testet i tests/tools.test.ts */

export const COMPANION_KINDS: Companion['kind'][] = ['familiar', 'companion', 'steed', 'summon', 'other']

const uidc = (): string => Math.random().toString(36).slice(2, 10)

export function companionFromCreature(cr: CreatureDef, kind: Companion['kind'] = 'companion'): Companion {
  const hp = creatureHp(cr.hp) ?? 1
  return { uid: uidc(), creatureId: cr.id, name: cr.name, hp, maxHp: hp, temp: 0, ac: cr.ac, kind }
}

export function customCompanion(name: string, maxHp: number, ac: number | undefined, kind: Companion['kind']): Companion {
  const hp = Math.max(1, Math.floor(maxHp) || 1)
  return { uid: uidc(), name: name.trim() || 'Companion', hp, maxHp: hp, temp: 0, ac, kind }
}

/** Skade på en companion: temp HP først, så HP (aldri under 0) */
export function damageCompanion(cp: Companion, n: number): void {
  let left = Math.max(0, Math.floor(n))
  const fromTemp = Math.min(cp.temp, left)
  cp.temp -= fromTemp
  left -= fromTemp
  cp.hp = Math.max(0, cp.hp - left)
}

export function healCompanion(cp: Companion, n: number): void {
  cp.hp = Math.min(cp.maxHp, cp.hp + Math.max(0, Math.floor(n)))
}

/** Combatants for companions som ikke allerede er med i kampen (initiativ rulles av kalleren) */
export function companionCombatants(ch: Character, rollInit: (cp: Companion) => number): Combatant[] {
  const inFight = new Set((ch.combat?.combatants ?? []).map((x) => x.companionUid).filter(Boolean))
  return (ch.companions ?? [])
    .filter((cp) => !inFight.has(cp.uid))
    .map((cp) => ({
      uid: uidc(),
      name: cp.name,
      init: rollInit(cp),
      ally: true,
      hp: cp.hp,
      maxHp: cp.maxHp,
      ac: cp.ac,
      defeated: cp.hp <= 0,
      companionUid: cp.uid,
      note: cp.kind
    }))
}

/** Skriv HP fra koblede combatants tilbake til companions (kalles etter hver endring i kampmodus) */
export function syncCompanionsFromCombat(ch: Character): void {
  if (!ch.combat || !ch.companions?.length) return
  for (const x of ch.combat.combatants) {
    if (!x.companionUid || x.hp === undefined) continue
    const cp = ch.companions.find((c) => c.uid === x.companionUid)
    if (cp && cp.hp !== x.hp) cp.hp = Math.max(0, Math.min(cp.maxHp, x.hp))
  }
}

/** Motsatt vei: endringer på arket oppdaterer den koblede combatanten */
export function syncCombatFromCompanion(ch: Character, uid: string): void {
  const cp = ch.companions?.find((c) => c.uid === uid)
  if (!cp || !ch.combat) return
  for (const x of ch.combat.combatants) {
    if (x.companionUid !== uid) continue
    x.hp = cp.hp
    x.maxHp = cp.maxHp
    x.ac = cp.ac
    x.defeated = cp.hp <= 0
  }
}
