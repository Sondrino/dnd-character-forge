import { isValidNotation, type RollMode, type RollResult } from '../dice'

/** Terningmakroer og lagret kastlogg – ren logikk, testet i tests/tools.test.ts */

export interface DiceMacro {
  label: string
  notation: string
  mode?: RollMode
}

export const MAX_MACROS = 40
export const MAX_SAVED_ROLLS = 100
const MODES: RollMode[] = ['normal', 'advantage', 'disadvantage']

/** Feil i en makro, eller null hvis den er gyldig */
export function macroError(m: Partial<DiceMacro>): 'label' | 'notation' | 'mode' | null {
  const label = (m.label ?? '').trim()
  if (!label || label.length > 40) return 'label'
  const n = (m.notation ?? '').trim()
  if (!n || n.length > 60 || !isValidNotation(n)) return 'notation'
  if (m.mode !== undefined && !MODES.includes(m.mode)) return 'mode'
  return null
}

export function cleanMacro(m: Partial<DiceMacro>): DiceMacro | null {
  if (macroError(m)) return null
  const out: DiceMacro = { label: m.label!.trim(), notation: m.notation!.trim() }
  if (m.mode && m.mode !== 'normal') out.mode = m.mode
  return out
}

/** Gyldige makroer fra lagrede innstillinger (ugyldige hoppes over) */
export function sanitizeMacros(raw: unknown): DiceMacro[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((m) => (m && typeof m === 'object' ? cleanMacro(m as Partial<DiceMacro>) : null))
    .filter((m): m is DiceMacro => !!m)
    .slice(0, MAX_MACROS)
}

/** Kastloggen som lastes ved oppstart: bare velformede resultater, maks 100 */
export function sanitizeRollLog(raw: unknown): RollResult[] {
  if (!Array.isArray(raw)) return []
  const ok = (r: unknown): r is RollResult => {
    if (!r || typeof r !== 'object') return false
    const o = r as Record<string, unknown>
    return typeof o.id === 'string' && typeof o.label === 'string' && typeof o.notation === 'string' && typeof o.total === 'number' && Array.isArray(o.terms) && o.terms.every((t) => !!t && typeof t === 'object' && Array.isArray((t as { dice?: unknown }).dice)) && typeof o.time === 'number'
  }
  return raw.filter(ok).slice(0, MAX_SAVED_ROLLS)
}
