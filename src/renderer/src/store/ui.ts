import { create } from 'zustand'
import { useMemo } from 'react'
import type { AnyEntity, Character, EntityKind } from '../types'
import { baseLookup } from '../data'
import type { Lookup } from '../engine/lookup'
import { computeCharacter, type Derived } from '../engine/compute'
import { useCharacters } from './characters'
import { useHomebrew, useSettings } from './settings'

export interface DetailRef {
  kind: EntityKind | 'item'
  id: string
  /** Hvis entity ikke finnes i lookup (f.eks. en feature), send den direkte */
  entity?: AnyEntity
}

interface UiState {
  detail: DetailRef | null
  history: DetailRef[]
  /** Karakteren som er åpen – gjør at detaljvisningen kan tilby «Legg til» */
  activeCharacterId: string | null
  toast: { id: number; text: string; tone?: 'good' | 'bad' | 'info' } | null
  openDetail(ref: DetailRef): void
  back(): void
  closeDetail(): void
  setActiveCharacter(id: string | null): void
  notify(text: string, tone?: 'good' | 'bad' | 'info'): void
}

export const useUi = create<UiState>((set, get) => ({
  detail: null,
  history: [],
  activeCharacterId: null,
  toast: null,
  openDetail(ref) {
    const cur = get().detail
    set({ detail: ref, history: cur ? [...get().history, cur].slice(-20) : [] })
  },
  back() {
    const h = [...get().history]
    const prev = h.pop() ?? null
    set({ detail: prev, history: h })
  },
  closeDetail() {
    set({ detail: null, history: [] })
  },
  setActiveCharacter(id) {
    set({ activeCharacterId: id })
  },
  notify(text, tone = 'info') {
    const id = Date.now()
    set({ toast: { id, text, tone } })
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 2600)
  }
}))

/** Lookup med globalt homebrew-bibliotek lagt over grunndataene */
export function useLookup(): Lookup {
  const hb = useHomebrew((s) => s.entities)
  const third = useSettings((s) => s.showThirdParty)
  const supp = useSettings((s) => s.showSupplements)
  return useMemo(() => {
    const full = baseLookup.extend(hb)
    if (third && supp) return full
    // Skjulte kilder fjernes bare fra lister/velgere (all); oppslag av allerede valgte ting virker fortsatt
    const visible = (e: AnyEntity): boolean => (third || e.source !== 'Third-party') && (supp || e.source !== 'Supplement')
    const wrap = (L: Lookup): Lookup => ({ ...L, all: (kind) => L.all(kind).filter(visible) as never, extend: (extra) => wrap(L.extend(extra)) })
    return wrap(full)
  }, [hb, third, supp])
}

/** Lookup for en karakter (inkl. karakterens egne entities) */
export function useCharacterLookup(char: Character | undefined): Lookup {
  const L = useLookup()
  return useMemo(() => (char ? L.extend(char.customEntities ?? []) : L), [L, char?.customEntities])
}

export function useCharacter(id: string | undefined): {
  char: Character | undefined
  derived: Derived | undefined
  lookup: Lookup
  update: (recipe: (d: Character) => void) => void
} {
  const char = useCharacters((s) => (id ? s.characters[id] : undefined))
  const updateStore = useCharacters((s) => s.update)
  const L = useLookup()
  const lookup = useCharacterLookup(char)
  const derived = useMemo(() => (char ? computeCharacter(char, L) : undefined), [char, L])
  const update = useMemo(() => (recipe: (d: Character) => void) => id && updateStore(id, recipe), [id, updateStore])
  return { char, derived, lookup, update }
}

export function resolveEntity(L: Lookup, ref: DetailRef): AnyEntity | undefined {
  if (ref.entity) return ref.entity
  if (ref.kind === 'item') return L.item(ref.id)
  return L.get(ref.kind, ref.id) ?? L.any(ref.id)
}
