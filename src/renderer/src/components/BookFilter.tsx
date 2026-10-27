import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import type { AnyEntity } from '../types'
import { bookLabel, bookOf } from './ui'
import { useSettings } from '../store/settings'

const SOURCE_RANK: Record<string, number> = { 'SRD 5.2': 0, 'PHB 2024': 0, Supplement: 1, 'Forgotten Realms': 2, 'Third-party': 3, Homebrew: 4 }

export interface BookFilterState<T extends AnyEntity = AnyEntity> {
  /** Bøkene som finnes i lista, sortert (PHB først), med antall */
  books: { book: string; n: number }[]
  /** Valgte bøker; tom = alle */
  chosen: string[]
  setChosen(b: string[]): void
  toggle(b: string): void
  /** Lista filtrert på valgte bøker */
  filtered: T[]
}

/**
 * Bokfilter som huskes per nøkkel (f.eks. 'spell' eller 'compendium:feat').
 * Første klikk på en bok viser bare den boka; flere klikk legger til.
 */
export function useBookFilter<T extends AnyEntity>(key: string, all: T[]): BookFilterState<T> {
  const saved = useSettings((s) => s.pickerBooks?.[key])
  const set = useSettings((s) => s.set)
  const chosen = useMemo(() => saved ?? [], [saved])
  const setChosen = (b: string[]): void => set({ pickerBooks: { ...useSettings.getState().pickerBooks, [key]: b } })

  const books = useMemo(() => {
    const rank = new Map<string, number>()
    const count = new Map<string, number>()
    for (const e of all) {
      const b = bookOf(e)
      if (!rank.has(b)) rank.set(b, SOURCE_RANK[e.source] ?? 3)
      count.set(b, (count.get(b) ?? 0) + 1)
    }
    for (const b of chosen) if (!rank.has(b)) rank.set(b, 5)
    return [...rank.keys()]
      .sort((a, b) => rank.get(a)! - rank.get(b)! || a.localeCompare(b))
      .map((b) => ({ book: b, n: count.get(b) ?? 0 }))
  }, [all, chosen])

  const filtered = useMemo(() => (chosen.length ? all.filter((e) => chosen.includes(bookOf(e))) : all), [all, chosen])
  const toggle = (b: string): void => setChosen(!chosen.length ? [b] : chosen.includes(b) ? chosen.filter((x) => x !== b) : [...chosen, b])
  return { books, chosen, setChosen, toggle, filtered }
}

/** Rad med bok-knapper. Vises bare når lista har mer enn én bok. */
export function BookFilterBar({ state, className = '' }: { state: BookFilterState<AnyEntity>; className?: string }) {
  const { t } = useTranslation()
  const { books, chosen, setChosen, toggle } = state
  if (books.length < 2) return null
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <span className="mr-1 flex items-center gap-1 text-xs text-muted" title={t('picker.booksHint')}>
        <BookOpen size={13} /> {t('picker.books')}
      </span>
      <button className={`btn btn-sm ${!chosen.length ? 'btn-primary' : ''}`} onClick={() => setChosen([])}>
        {t('picker.allBooks')}
      </button>
      {books.map(({ book, n }) => (
        <button
          key={book}
          title={book}
          className={`btn btn-sm ${chosen.includes(book) ? 'btn-primary' : ''} ${!n ? 'opacity-50' : ''}`}
          onClick={() => toggle(book)}
        >
          {bookLabel(book)} <span className="text-[10px] opacity-70">{n}</span>
        </button>
      ))}
    </div>
  )
}

/** «Ingen treff»-hjelp: knapp som viser alle bøker igjen når filteret skjuler noe */
export function BookFilterReset({ state, total }: { state: BookFilterState<AnyEntity>; total: number }) {
  const { t } = useTranslation()
  if (!state.chosen.length || state.filtered.length >= total) return null
  return (
    <div className="mt-3">
      <button className="btn btn-sm" onClick={() => state.setChosen([])}>
        {t('picker.clearBooks', { n: total - state.filtered.length })}
      </button>
    </div>
  )
}
