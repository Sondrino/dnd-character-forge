import type { Character } from '../types'
import { api } from './api'
import { withBundledHomebrew } from './share'
import { useHomebrew } from '../store/settings'
import { baseLookup } from '../data'

/** Eksporter en karakter til fil – med homebrew fra biblioteket som karakteren bruker */
export function exportCharacter(c: Character): Promise<boolean> {
  return api.exportCharacter(withBundledHomebrew(c, useHomebrew.getState().entities, baseLookup))
}
