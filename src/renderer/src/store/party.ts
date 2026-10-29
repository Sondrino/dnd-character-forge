import { create } from 'zustand'
import { produce } from 'immer'
import { api } from '../lib/api'
import { newParty, normalizeParties, type Party } from '../lib/party'

export type { Party, PartyEncounter } from '../lib/party'

/** Grupper (DM-modus), lagret i parties.json via api.storeGet/storeSet */
interface PartyState {
  parties: Party[]
  loaded: boolean
  load(): Promise<void>
  create(name: string): string
  update(id: string, recipe: (p: Party) => void): void
  remove(id: string): void
}

let saveTimer: ReturnType<typeof setTimeout> | undefined
let pendingSave: Party[] | null = null
function save(list: Party[]): void {
  pendingSave = list
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flushParties, 400)
}

/** Lagre med en gang (når appen lukkes) */
export function flushParties(): void {
  clearTimeout(saveTimer)
  if (pendingSave) api.storeSet('parties', pendingSave)
  pendingSave = null
}
if (typeof window !== 'undefined') window.addEventListener('beforeunload', flushParties)

export const useParties = create<PartyState>((set, get) => ({
  parties: [],
  loaded: false,
  async load() {
    const raw = await api.storeGet('parties')
    set({ parties: normalizeParties(raw), loaded: true })
  },
  create(name) {
    const p = newParty(name)
    const list = [...get().parties, p]
    set({ parties: list })
    save(list)
    return p.id
  },
  update(id, recipe) {
    const list = get().parties.map((p) => (p.id === id ? produce(p, recipe) : p))
    set({ parties: list })
    save(list)
  },
  remove(id) {
    const list = get().parties.filter((p) => p.id !== id)
    set({ parties: list })
    save(list)
  }
}))
