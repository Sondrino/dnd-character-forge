import { create } from 'zustand'
import { roll as doRoll, type RollMode, type RollResult } from '../dice'

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
  },
  dismiss() {
    set({ current: null })
  }
}))
