import { create } from 'zustand'
import { produce } from 'immer'
import type { Character } from '../types'
import { api } from '../lib/api'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function newCharacter(partial: Partial<Character> = {}): Character {
  const now = new Date().toISOString()
  return {
    id: uid(),
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    name: '',
    playerName: '',
    alignment: '',
    xp: 0,
    classes: [],
    speciesId: '',
    backgroundId: '',
    abilityMethod: 'standard',
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    backgroundBonus: {},
    abilityIncreases: [],
    choices: {},
    feats: [],
    spells: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    weaponMasteries: [],
    hp: { current: 0, temp: 0 },
    hitDiceUsed: {},
    deathSaves: { successes: 0, failures: 0 },
    spellSlotsUsed: [],
    pactSlotsUsed: 0,
    featureUses: {},
    conditions: [],
    exhaustion: 0,
    activeStates: [],
    heroicInspiration: false,
    extra: { skills: [], expertise: [], saves: [], armor: [], weapons: [], tools: [], languages: [] },
    details: {
      gender: '', age: '', height: '', weight: '', eyes: '', hair: '', skin: '', faith: '',
      appearance: '', personality: '', ideals: '', bonds: '', flaws: '', backstory: '', allies: '', notes: ''
    },
    customEntities: [],
    customFeatures: [],
    overrides: {},
    adjustments: {},
    customEffects: [],
    settings: { hpMethod: 'fixed' },
    ...partial
  }
}

/** Fyller inn manglende felt på eldre/importerte karakterer */
export function normalizeCharacter(raw: Partial<Character>): Character {
  const base = newCharacter()
  const c = { ...base, ...raw } as Character
  c.extra = { ...base.extra, ...(raw.extra ?? {}) }
  c.details = { ...base.details, ...(raw.details ?? {}) }
  c.currency = { ...base.currency, ...(raw.currency ?? {}) }
  c.hp = { ...base.hp, ...(raw.hp ?? {}) }
  c.deathSaves = { ...base.deathSaves, ...(raw.deathSaves ?? {}) }
  c.settings = { ...base.settings, ...(raw.settings ?? {}) }
  c.activeStates = raw.activeStates ?? []
  c.adjustments = raw.adjustments ?? {}
  return c
}

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
const pending = new Map<string, Character>()
function scheduleSave(c: Character): void {
  clearTimeout(saveTimers.get(c.id))
  pending.set(c.id, c)
  saveTimers.set(
    c.id,
    setTimeout(() => {
      api.saveCharacter(c)
      saveTimers.delete(c.id)
      pending.delete(c.id)
      useCharacters.setState({ lastSaved: Date.now() })
    }, 500)
  )
}

/** Lagre alt som venter med en gang (når appen lukkes) */
export function flushSaves(): void {
  for (const [id, c] of pending) {
    clearTimeout(saveTimers.get(id))
    api.saveCharacter(c)
  }
  saveTimers.clear()
  pending.clear()
}
if (typeof window !== 'undefined') window.addEventListener('beforeunload', flushSaves)

interface CharactersState {
  characters: Record<string, Character>
  loaded: boolean
  lastSaved: number
  load(): Promise<void>
  add(c: Character): void
  update(id: string, recipe: (draft: Character) => void): void
  remove(id: string): Promise<void>
  duplicate(id: string): string | undefined
  importFiles(): Promise<number>
  /** Gjenopprett en slettet karakter fra papirkurven */
  restore(file: string): Promise<boolean>
  /** Angre/gjør om siste endring på en karakter */
  undo(id: string): boolean
  redo(id: string): boolean
  canUndo(id: string): boolean
  canRedo(id: string): boolean
  /** Øker ved hver angre/gjør om, så knapper oppdateres */
  historySeq: number
}

/** Historikk per karakter. Endringer tett etter hverandre (skriving i et felt) slås sammen til ett steg. */
const past = new Map<string, Character[]>()
const future = new Map<string, Character[]>()
const lastChange = new Map<string, number>()
const HISTORY = 60
const MERGE_MS = 900

export const useCharacters = create<CharactersState>((set, get) => ({
  characters: {},
  loaded: false,
  lastSaved: 0,
  historySeq: 0,
  async load() {
    const list = (await api.listCharacters()) as Partial<Character>[]
    const characters: Record<string, Character> = {}
    for (const raw of list) {
      if (!raw?.id) continue
      characters[raw.id] = normalizeCharacter(raw)
    }
    set({ characters, loaded: true })
  },
  add(c) {
    set((s) => ({ characters: { ...s.characters, [c.id]: c } }))
    api.saveCharacter(c)
  },
  update(id, recipe) {
    const cur = get().characters[id]
    if (!cur) return
    const next = produce(cur, (d) => {
      recipe(d)
      d.updatedAt = new Date().toISOString()
    })
    // Lagre forrige tilstand for angre (Immer gir uforanderlige objekter, så referansen er nok)
    const now = Date.now()
    const stack = past.get(id) ?? []
    if (now - (lastChange.get(id) ?? 0) > MERGE_MS || !stack.length) {
      stack.push(cur)
      if (stack.length > HISTORY) stack.shift()
      past.set(id, stack)
    }
    lastChange.set(id, now)
    future.delete(id)
    set((s) => ({ characters: { ...s.characters, [id]: next }, historySeq: s.historySeq + 1 }))
    scheduleSave(next)
  },
  async remove(id) {
    const { [id]: _gone, ...rest } = get().characters
    set({ characters: rest })
    await api.deleteCharacter(id)
  },
  duplicate(id) {
    const cur = get().characters[id]
    if (!cur) return
    const copy = normalizeCharacter(JSON.parse(JSON.stringify(cur)))
    copy.id = uid()
    copy.name = `${cur.name || 'Character'} (copy)`
    copy.createdAt = copy.updatedAt = new Date().toISOString()
    get().add(copy)
    return copy.id
  },
  undo(id) {
    const stack = past.get(id)
    const cur = get().characters[id]
    if (!stack?.length || !cur) return false
    const prev = stack.pop()!
    future.set(id, [...(future.get(id) ?? []), cur])
    lastChange.set(id, 0)
    set((s) => ({ characters: { ...s.characters, [id]: prev }, historySeq: s.historySeq + 1 }))
    scheduleSave(prev)
    return true
  },
  redo(id) {
    const stack = future.get(id)
    const cur = get().characters[id]
    if (!stack?.length || !cur) return false
    const next = stack.pop()!
    past.set(id, [...(past.get(id) ?? []), cur])
    lastChange.set(id, 0)
    set((s) => ({ characters: { ...s.characters, [id]: next }, historySeq: s.historySeq + 1 }))
    scheduleSave(next)
    return true
  },
  canUndo(id) {
    return !!past.get(id)?.length
  },
  canRedo(id) {
    return !!future.get(id)?.length
  },
  async restore(file) {
    const raw = (await api.restoreCharacter(file)) as Partial<Character> | null
    if (!raw?.id) return false
    const c = normalizeCharacter(raw)
    set((s) => ({ characters: { ...s.characters, [c.id]: c } }))
    return true
  },
  async importFiles() {
    const list = (await api.importCharacters()) as Partial<Character>[]
    let n = 0
    for (const raw of list) {
      if (!raw || typeof raw !== 'object' || !('baseAbilities' in raw)) continue
      const c = normalizeCharacter(raw)
      const existing = get().characters[c.id]
      // Samme karakter importert på nytt: en nyere versjon erstatter den gamle, en eldre blir en kopi
      if (existing && c.updatedAt <= existing.updatedAt) {
        c.id = uid()
        c.name = `${c.name || 'Character'} (import)`
      }
      get().add(c)
      n++
    }
    return n
  }
}))
