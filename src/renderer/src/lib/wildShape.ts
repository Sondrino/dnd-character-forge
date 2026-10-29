import type { Character, CreatureDef } from '../types'

/**
 * Wild Shape (Druid, 2024-reglene) – ren logikk, testet i tests/tools.test.ts.
 *
 * Beast Shapes-tabellen: level 2 = 4 former, maks CR 1/4, ingen fly speed ·
 * level 4 = 6 former, CR 1/2 · level 8 = 8 former, CR 1, fly speed tillatt.
 * Circle of the Moon (Circle Forms): maks CR = druid-level / 3 (rundet ned) fra level 3,
 * temp HP = 3 × druid-level og AC minst 13 + WIS-modifier.
 */

export const WILD_SHAPE_STATE = 'wildShaped'
export const MOON_SUBCLASS = 'circle-of-the-moon'

export interface WildShapeLimits {
  forms: number
  /** Maks CR som tall (1/4 = 0.25) */
  maxCr: number
  fly: boolean
}

const TABLE: { level: number; forms: number; maxCr: number; fly: boolean }[] = [
  { level: 2, forms: 4, maxCr: 0.25, fly: false },
  { level: 4, forms: 6, maxCr: 0.5, fly: false },
  { level: 8, forms: 8, maxCr: 1, fly: true }
]

/** Grenser for kjente former på et druid-level; null før level 2 */
export function wildShapeLimits(druidLevel: number, moon = false): WildShapeLimits | null {
  const row = [...TABLE].reverse().find((r) => druidLevel >= r.level)
  if (!row) return null
  const maxCr = moon && druidLevel >= 3 ? Math.max(row.maxCr, Math.floor(druidLevel / 3)) : row.maxCr
  return { forms: row.forms, maxCr, fly: row.fly }
}

/** '1/4' → 0.25, '2' → 2; ukjent → Infinity */
export function crValue(cr: string | number | undefined): number {
  if (typeof cr === 'number') return cr
  const s = String(cr ?? '').trim()
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(s)
  if (m) return Number(m[1]) / Number(m[2])
  const n = Number(s)
  return Number.isFinite(n) && s !== '' ? n : Infinity
}

/** Formatér CR-tall tilbake som tekst: 0.25 → '1/4' */
export function crLabel(n: number): string {
  if (n === 0.125) return '1/8'
  if (n === 0.25) return '1/4'
  if (n === 0.5) return '1/2'
  return String(n)
}

export function hasFlySpeed(speed: string | undefined): boolean {
  return /\bfly\b/i.test(speed ?? '')
}

export function isBeast(c: Pick<CreatureDef, 'creatureType'>): boolean {
  return /^beast\b/i.test(c.creatureType ?? '')
}

/** Kan denne skapningen være en kjent Wild Shape-form? */
export function isEligibleForm(c: CreatureDef, limits: WildShapeLimits | null): boolean {
  if (!limits || !isBeast(c)) return false
  if (crValue(c.cr) > limits.maxCr) return false
  if (!limits.fly && hasFlySpeed(c.speed)) return false
  return true
}

export function druidLevel(c: Pick<Character, 'classes'>): number {
  return c.classes.find((x) => x.classId === 'druid')?.level ?? 0
}

export function isMoonDruid(c: Pick<Character, 'classes'>): boolean {
  return c.classes.some((x) => x.classId === 'druid' && x.subclassId === MOON_SUBCLASS)
}

/** Temp HP når du tar en form: druid-level (Moon: 3 × druid-level) */
export function wildShapeTempHp(level: number, moon = false): number {
  return moon ? level * 3 : level
}

/** Første tall i HP-teksten: '13 (2d8 + 4)' → 13 */
export function creatureHp(hp: string | number | undefined): number | undefined {
  const n = parseInt(String(hp ?? ''), 10)
  return Number.isFinite(n) ? n : undefined
}

export interface CreatureAttack {
  name: string
  /** '+4' */
  toHit?: string
  /** '1d6 + 2' */
  damage?: string
  damageType?: string
  /** Hele teksten etter navnet */
  text: string
}

/** Angrep fra stat block-markdown («### Actions»: **Bite.** *Melee Attack Roll:* +4 … *Hit:* 5 (1d6 + 2) Piercing damage.) */
export function parseCreatureAttacks(description: string | undefined): CreatureAttack[] {
  const out: CreatureAttack[] = []
  const text = description ?? ''
  const start = text.search(/^###\s*Actions\s*$/im)
  if (start < 0) return out
  const rest = text.slice(start).split(/\n(?=###\s)/)[0]
  for (const line of rest.split('\n')) {
    const m = /^\*\*(.+?)\.\*\*\s*(.*)$/.exec(line.trim())
    if (!m || !/Attack Roll/i.test(m[2])) continue
    const hit = /Attack Roll:\*?\s*([+-]\d+)/i.exec(m[2])
    const dmg = /\*Hit:\*\s*\d+\s*\(([^)]+)\)\s*([A-Za-z]+)/i.exec(m[2])
    out.push({ name: m[1], toHit: hit?.[1], damage: dmg?.[1], damageType: dmg?.[2], text: m[2] })
  }
  return out
}

/** Wild Shape-featuren på karakteren (bruk/uses ligger i featureUses under denne nøkkelen) */
export interface WildShapeUses {
  key: string
  max: number
  used: number
}

/**
 * Ta en form: bruker én Wild Shape-bruk, gir temp HP (høyeste gjelder – temp HP stables ikke),
 * slår på tilstanden «wildShaped» og husker formen. Returnerer false hvis ingen bruk er igjen.
 */
export function enterWildShape(ch: Character, formId: string, uses: WildShapeUses | undefined, tempHp: number): boolean {
  if (uses && uses.used >= uses.max) return false
  if (uses) ch.featureUses[uses.key] = Math.min(uses.max, (ch.featureUses[uses.key] ?? 0) + 1)
  ch.hp.temp = Math.max(ch.hp.temp ?? 0, tempHp)
  if (!ch.activeStates.includes(WILD_SHAPE_STATE)) ch.activeStates.push(WILD_SHAPE_STATE)
  ch.wildShape = { knownForms: ch.wildShape?.knownForms ?? [], activeForm: formId }
  return true
}

/** Gå tilbake til normal form */
export function revertWildShape(ch: Character): void {
  ch.activeStates = ch.activeStates.filter((s) => s !== WILD_SHAPE_STATE)
  if (ch.wildShape) ch.wildShape.activeForm = undefined
}
