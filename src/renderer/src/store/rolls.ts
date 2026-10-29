import { create } from 'zustand'
import { roll as doRoll, type RollMode, type RollResult } from '../dice'
import { api } from '../lib/api'
import { MAX_SAVED_ROLLS, sanitizeRollLog } from '../lib/macros'

interface RollState {
  log: RollResult[]
  current: RollResult | null
  /** Øker for hvert kast slik at animasjonen spilles på nytt */
  seq: number
  trayOpen: boolean
  mode: RollMode
  roll(notation: string, label?: string, opts?: { mode?: RollMode; critDouble?: boolean; character?: string }): RollResult
  setMode(m: RollMode): void
  setTray(open: boolean): void
  clear(): void
  dismiss(): void
  /** Hent de siste kastene fra forrige økt */
  load(): Promise<void>
}

/** De siste 100 kastene lagres (litt forsinket, så mange kast på rad gir én skriving) */
let saveTimer: ReturnType<typeof setTimeout> | undefined
function persist(log: RollResult[]): void {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => void api.storeSet('rolls', log.slice(0, MAX_SAVED_ROLLS)).catch(() => {}), 800)
}

export const useRolls = create<RollState>((set, get) => ({
  log: [],
  current: null,
  seq: 0,
  trayOpen: false,
  mode: 'normal',
  roll(notation, label, opts = {}) {
    const mode = opts.mode ?? get().mode
    const r = doRoll(notation, { label, mode, critDouble: opts.critDouble })
    if (opts.character) r.label = `${opts.character}: ${r.label}`
    set((s) => ({ log: [r, ...s.log].slice(0, 200), current: r, seq: s.seq + 1, mode: 'normal' }))
    persist(get().log)
    return r
  },
  setMode(mode) {
    set({ mode })
  },
  setTray(trayOpen) {
    set({ trayOpen })
  },
  clear() {
    set({ log: [] })
    persist([])
  },
  dismiss() {
    set({ current: null })
  },
  async load() {
    const saved = sanitizeRollLog(await api.storeGet('rolls').catch(() => null))
    // Kast gjort før lastingen var ferdig beholdes øverst
    set((s) => ({ log: [...s.log, ...saved.filter((r) => !s.log.some((x) => x.id === r.id))].slice(0, 200) }))
  }
}))
