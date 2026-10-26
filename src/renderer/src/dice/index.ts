/** Terningmotor: parser D&D-notasjon som "2d6+3", "1d20+5", "4d6kh3", "d20 adv", "2d20kl1" */

export type RollMode = 'normal' | 'advantage' | 'disadvantage'

export interface DieResult {
  sides: number
  value: number
  kept: boolean
}

export interface TermResult {
  notation: string
  sign: 1 | -1
  dice: DieResult[]
  constant?: number
  subtotal: number
}

export interface RollResult {
  id: string
  label: string
  notation: string
  mode: RollMode
  terms: TermResult[]
  total: number
  /** Nat 20 / nat 1 på en d20-test */
  natural?: number
  crit: boolean
  fumble: boolean
  time: number
}

export type Rng = () => number

let rng: Rng = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const a = new Uint32Array(1)
    crypto.getRandomValues(a)
    return a[0] / 2 ** 32
  }
  return Math.random()
}

/** For tester */
export function setRng(fn: Rng): void {
  rng = fn
}

export function rollDie(sides: number): number {
  return Math.floor(rng() * sides) + 1
}

const TERM_RE = /([+-]?)\s*(?:(\d*)d(\d+|%)(?:(kh|kl|dh|dl)(\d+))?|(\d+))/gi

export function isValidNotation(n: string): boolean {
  const clean = n.replace(/\s+/g, '').replace(/(adv|dis|advantage|disadvantage)$/i, '')
  if (!clean) return false
  return /^([+-]?(\d*d(\d+|%)((kh|kl|dh|dl)\d+)?|\d+))+$/i.test(clean)
}

export function roll(notationIn: string, opts: { label?: string; mode?: RollMode; critDouble?: boolean } = {}): RollResult {
  let notation = notationIn.trim()
  let mode: RollMode = opts.mode ?? 'normal'
  const modeMatch = /\s*(adv|advantage|dis|disadvantage)$/i.exec(notation)
  if (modeMatch) {
    mode = modeMatch[1].toLowerCase().startsWith('adv') ? 'advantage' : 'disadvantage'
    notation = notation.slice(0, modeMatch.index)
  }
  const terms: TermResult[] = []
  let natural: number | undefined
  let firstD20 = true
  TERM_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TERM_RE.exec(notation))) {
    const sign: 1 | -1 = m[1] === '-' ? -1 : 1
    if (m[6] !== undefined) {
      const c = Number(m[6])
      terms.push({ notation: m[0].trim(), sign, dice: [], constant: c, subtotal: sign * c })
      continue
    }
    let count = m[2] ? Number(m[2]) : 1
    const sides = m[3] === '%' ? 100 : Number(m[3])
    let keep = m[4]?.toLowerCase()
    let keepN = m[5] ? Number(m[5]) : undefined
    if (opts.critDouble) count *= 2
    // Advantage/disadvantage på første d20-ledd
    if (sides === 20 && count === 1 && firstD20 && mode !== 'normal' && !keep) {
      count = 2
      keep = mode === 'advantage' ? 'kh' : 'kl'
      keepN = 1
    }
    count = Math.min(count, 200)
    const dice: DieResult[] = Array.from({ length: count }, () => ({ sides, value: rollDie(sides), kept: true }))
    if (keep && keepN !== undefined) {
      const sorted = [...dice].sort((a, b) => a.value - b.value)
      let drop: DieResult[] = []
      if (keep === 'kh') drop = sorted.slice(0, Math.max(0, count - keepN))
      if (keep === 'kl') drop = sorted.slice(keepN)
      if (keep === 'dl') drop = sorted.slice(0, keepN)
      if (keep === 'dh') drop = sorted.slice(count - keepN)
      drop.forEach((d) => (d.kept = false))
    }
    const subtotal = sign * dice.filter((d) => d.kept).reduce((s, d) => s + d.value, 0)
    if (sides === 20 && firstD20) {
      const kept = dice.filter((d) => d.kept)
      if (kept.length === 1) natural = kept[0].value
      firstD20 = false
    }
    terms.push({ notation: m[0].trim(), sign, dice, subtotal })
  }
  const total = terms.reduce((s, t) => s + t.subtotal, 0)
  return {
    id: Math.random().toString(36).slice(2),
    label: opts.label ?? notationIn,
    notation: notationIn,
    mode,
    terms,
    total,
    natural,
    crit: natural === 20,
    fumble: natural === 1,
    time: Date.now()
  }
}

/** 4d6, dropp laveste – returnerer score og terningene */
export function rollAbilityScore(): { total: number; dice: number[]; dropped: number } {
  const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)]
  const min = Math.min(...dice)
  const idx = dice.indexOf(min)
  const total = dice.reduce((s, d, i) => (i === idx ? s : s + d), 0)
  return { total, dice, dropped: idx }
}

/** Lager d20-notasjon fra en bonus */
export function d20(bonus: number): string {
  return bonus === 0 ? '1d20' : `1d20${bonus > 0 ? '+' : ''}${bonus}`
}
