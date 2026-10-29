import type { Character, JournalEntry } from '../types'
import { XP_TABLE } from '../data/skills'

/** XP og sesjonsdagbok (2024-reglene: Character Advancement-tabellen) – ren logikk, testet i tests/tools.test.ts */

/** XP som trengs for å nå et level (1–20) */
export function xpForLevel(level: number): number {
  return XP_TABLE[Math.max(1, Math.min(20, level)) - 1]
}

/** Level XP-en tilsvarer (1–20) */
export function levelForXp(xp: number): number {
  let lvl = 1
  for (let i = 0; i < XP_TABLE.length; i++) if (xp >= XP_TABLE[i]) lvl = i + 1
  return lvl
}

/** XP-grensen for neste level, eller null på level 20 */
export function nextLevelXp(level: number): number | null {
  return level >= 20 ? null : XP_TABLE[level]
}

/** Antall level karakteren kan gå opp basert på XP (0 = ingen) */
export function levelsAvailable(xp: number, level: number): number {
  if (level < 1) return 0
  return Math.max(0, levelForXp(xp) - level)
}

export function todayIso(now = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

/** Lag en dagbokoppføring (XP rundes ned til heltall ≥ 0) */
export function journalEntry(p: { title: string; text?: string; xp?: number; date?: string; id?: string }): JournalEntry {
  const xp = p.xp !== undefined && Number.isFinite(p.xp) ? Math.max(0, Math.floor(p.xp)) : undefined
  return {
    id: p.id ?? Math.random().toString(36).slice(2, 10),
    date: p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : todayIso(),
    title: p.title.trim(),
    text: p.text ?? '',
    ...(xp ? { xp } : {})
  }
}

/** Gi XP: legger til en oppføring øverst i dagboken og øker char.xp. Returnerer oppføringen. */
export function awardXp(ch: Character, amount: number, title: string, text = '', date?: string): JournalEntry {
  const e = journalEntry({ title, text, xp: amount, date })
  ch.journal = [e, ...(ch.journal ?? [])]
  ch.xp = Math.max(0, (ch.xp ?? 0) + (e.xp ?? 0))
  return e
}

/** Dagboken sortert nyest først (dato, så rekkefølge) */
export function sortedJournal(list: JournalEntry[] | undefined): JournalEntry[] {
  return (list ?? []).map((e, i) => ({ e, i })).sort((a, b) => b.e.date.localeCompare(a.e.date) || a.i - b.i).map((x) => x.e)
}

export function journalXpTotal(list: JournalEntry[] | undefined): number {
  return (list ?? []).reduce((s, e) => s + (e.xp ?? 0), 0)
}
