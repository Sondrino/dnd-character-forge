import { createContext, useContext } from 'react'
import type { Character } from '../../types'
import type { Derived } from '../../engine/compute'
import type { Lookup } from '../../engine/lookup'

export interface CharCtxValue {
  char: Character
  derived: Derived
  lookup: Lookup
  update: (recipe: (d: Character) => void) => void
  /** Bytt fane i karaktervisningen */
  goTo?: (tab: string) => void
  /** Åpne guiden for det som mangler (valgfritt: start på et bestemt valg eller begrens til spells/annet) */
  openGuide?: (key?: string, area?: 'spells' | 'other') => void
}

export const CharCtx = createContext<CharCtxValue | null>(null)

export function useChar(): CharCtxValue {
  const v = useContext(CharCtx)
  if (!v) throw new Error('useChar utenfor CharCtx')
  return v
}
