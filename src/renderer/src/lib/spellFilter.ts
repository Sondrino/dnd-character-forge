import type { SpellDef } from '../types'

const SCHOOLS = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']

/**
 * Tolker filter-strenger fra data:
 *  'wizard' | 'cleric,druid,wizard' | 'wizard:1' | 'wizard:evocation:2' (nivå ≤ 2) | 'list' | 'list:1'
 *  'level:1;school:Divination,Enchantment' | 'ritual:1'
 */
export function spellFilter(filter: string | undefined, opts: { cantrip?: boolean; list?: string; maxLevel?: number } = {}): (s: SpellDef) => boolean {
  const preds: ((s: SpellDef) => boolean)[] = []
  if (opts.cantrip) preds.push((s) => s.level === 0)
  else if (opts.cantrip === false) preds.push((s) => s.level > 0)
  if (opts.maxLevel !== undefined) preds.push((s) => s.level <= opts.maxLevel!)
  for (const part of (filter ?? '').split(';').map((p) => p.trim()).filter(Boolean)) {
    const [head, ...rest] = part.split(':')
    if (head === 'level') {
      const n = Number(rest[0])
      preds.push((s) => s.level === n)
      continue
    }
    if (head === 'school') {
      const list = (rest[0] ?? '').toLowerCase().split(',')
      preds.push((s) => list.includes(s.school.toLowerCase()))
      continue
    }
    if (head === 'ritual') {
      const n = rest[0] ? Number(rest[0]) : undefined
      preds.push((s) => s.ritual && (n === undefined || s.level === n))
      continue
    }
    const classes = (head === 'list' ? opts.list ?? '' : head).split(',').filter(Boolean)
    if (classes.length && head !== 'any') preds.push((s) => s.classes.some((c) => classes.includes(c)))
    let exact = true
    for (const r of rest) {
      if (SCHOOLS.includes(r.toLowerCase())) {
        preds.push((s) => s.school.toLowerCase() === r.toLowerCase())
        exact = false
      } else if (/^\d+$/.test(r)) {
        const n = Number(r)
        preds.push(exact ? (s) => s.level === n : (s) => s.level <= n && s.level > 0)
      }
    }
  }
  return (s) => preds.every((p) => p(s))
}
