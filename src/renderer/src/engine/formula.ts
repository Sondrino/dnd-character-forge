import type { Ability } from '../types'

export interface FormulaContext {
  mods: Record<Ability, number>
  pb: number
  /** Nivå i aktuell class (eller totalnivå) */
  level: number
  totalLevel: number
  /** Kolonner fra class-tabellen på aktuelt nivå */
  columns?: Record<string, string | number>
}

/**
 * Evaluerer enkle formler: tall, 'prof'/'pb', 'level', 'totalLevel', 'str'..'cha', 'mod.cha',
 * kolonnenavn fra class-tabellen, og + - * / ( ) samt min()/max()/floor()/ceil().
 * Returnerer null hvis uttrykket ikke kan tolkes.
 */
export function evalFormula(expr: string | number | undefined, ctx: FormulaContext): number | null {
  if (expr === undefined || expr === null) return null
  if (typeof expr === 'number') return expr
  const raw = String(expr).trim().replace(/^table:/i, '')
  if (!raw) return null
  if (/^-?\d+$/.test(raw)) return Number(raw)

  // Kolonne fra class-tabell (f.eks. "Rages", "Second Wind")
  if (ctx.columns) {
    const col = Object.entries(ctx.columns).find(([k]) => k.toLowerCase() === raw.toLowerCase())
    if (col) {
      const n = parseInt(String(col[1]).replace(/[^\d-]/g, ''), 10)
      return Number.isFinite(n) ? n : null
    }
  }

  let s = raw.toLowerCase()
  s = s.replace(/mod\.(str|dex|con|int|wis|cha)/g, (_m, a: Ability) => `(${ctx.mods[a]})`)
  s = s.replace(/\b(proficiency bonus|proficiency|prof|pb)\b/g, `(${ctx.pb})`)
  s = s.replace(/\btotallevel\b/g, `(${ctx.totalLevel})`)
  s = s.replace(/\b(class level|level)\b/g, `(${ctx.level})`)
  s = s.replace(/\b(str|dex|con|int|wis|cha)\b/g, (_m, a: Ability) => `(${ctx.mods[a]})`)
  s = s.replace(/×/g, '*').replace(/\s+/g, '')
  if (!/^(min|max|floor|ceil|[\d+\-*/().,])+$/.test(s)) return null
  try {
    const v = parseArithmetic(s)
    return Number.isFinite(v) ? Math.floor(v) : null
  } catch {
    return null
  }
}

/** Liten rekursiv parser for + - * / ( ) og min/max/floor/ceil – ingen eval. */
function parseArithmetic(src: string): number {
  let i = 0
  const peek = (): string => src[i]
  const expr = (): number => {
    let v = term()
    while (peek() === '+' || peek() === '-') {
      const op = src[i++]
      const r = term()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  const term = (): number => {
    let v = factor()
    while (peek() === '*' || peek() === '/') {
      const op = src[i++]
      const r = factor()
      v = op === '*' ? v * r : v / r
    }
    return v
  }
  const factor = (): number => {
    if (peek() === '-') {
      i++
      return -factor()
    }
    if (peek() === '+') {
      i++
      return factor()
    }
    const fn = /^(min|max|floor|ceil)\(/.exec(src.slice(i))
    if (fn) {
      i += fn[1].length + 1
      const args = [expr()]
      while (peek() === ',') {
        i++
        args.push(expr())
      }
      if (src[i++] !== ')') throw new Error('expected )')
      return Math[fn[1] as 'min' | 'max' | 'floor' | 'ceil'](...(args as [number]))
    }
    if (peek() === '(') {
      i++
      const v = expr()
      if (src[i++] !== ')') throw new Error('expected )')
      return v
    }
    const m = /^\d+(\.\d+)?/.exec(src.slice(i))
    if (!m) throw new Error('number expected')
    i += m[0].length
    return Number(m[0])
  }
  const v = expr()
  if (i !== src.length) throw new Error('trailing input')
  return v
}
