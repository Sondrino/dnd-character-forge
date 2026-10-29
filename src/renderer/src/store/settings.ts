import { create } from 'zustand'
import { api } from '../lib/api'
import i18n from '../i18n'
import type { AnyEntity } from '../types'
import { sanitizeMacros, type DiceMacro } from '../lib/macros'

/** UI-skala begrenset til 0.8–1.4 (ugyldig = 1) */
export function clampUiScale(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 1
  return Math.round(Math.min(1.4, Math.max(0.8, n)) * 100) / 100
}

export interface Settings {
  language: 'nb' | 'en'
  theme: 'dark' | 'light'
  animations: boolean
  diceSound: boolean
  dndBeyondMode: 'app' | 'browser'
  hpMethod: 'fixed' | 'roll'
  showTips: boolean
  /** Vis tredjepartsinnhold (Kobold Press, Level Up A5E …) i lister og velgere */
  showThirdParty: boolean
  /** Vis sammendrag fra offisielle tilleggsbøker (Xanathar's, Tasha's …) */
  showSupplements: boolean
  /** Bokfilter i velgerne, per type (f.eks. 'spell'); tom/mangler = alle bøker */
  pickerBooks: Record<string, string[]>
  /** Husket sortering per liste */
  sorts?: Record<string, string>
  /** 3D-terninger med fysikk (av = enkel animasjon) */
  dice3d?: boolean
  /** Fargetema for 3D-terningene */
  diceTheme?: string
  /** Sist valgte terningmodus i kampmodus */
  combatDice?: 'physical' | 'app'
  /** Skalering av hele grensesnittet (0.8–1.4), brukt som CSS zoom på rot-elementet */
  uiScale?: number
  /** Egne terningmakroer i terningbrettet */
  macros?: DiceMacro[]
}

const DEFAULTS: Settings = {
  language: 'nb',
  theme: 'dark',
  animations: true,
  diceSound: true,
  dndBeyondMode: 'app',
  hpMethod: 'fixed',
  showTips: true,
  showThirdParty: true,
  showSupplements: true,
  pickerBooks: {}
}

interface SettingsState extends Settings {
  loaded: boolean
  load(): Promise<void>
  set(p: Partial<Settings>): void
}

function applyDom(s: Settings): void {
  document.documentElement.dataset.theme = s.theme
  document.documentElement.classList.toggle('reduce-motion', !s.animations)
  document.documentElement.lang = s.language
  document.documentElement.style.setProperty('zoom', String(clampUiScale(s.uiScale)))
  if (i18n.language !== s.language) i18n.changeLanguage(s.language)
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  loaded: false,
  async load() {
    const saved = ((await api.storeGet('settings')) ?? {}) as Partial<Settings>
    const s = { ...DEFAULTS, ...saved }
    s.macros = sanitizeMacros(saved.macros)
    if (saved.uiScale !== undefined) s.uiScale = clampUiScale(saved.uiScale)
    set({ ...s, loaded: true })
    applyDom(s)
  },
  set(p) {
    set(p)
    const { loaded: _l, load: _a, set: _b, ...rest } = get()
    applyDom(rest)
    api.storeSet('settings', rest)
  }
}))

/* ------------------------------------------------------------------ */
/* Felles homebrew-bibliotek                                           */
/* ------------------------------------------------------------------ */

interface HomebrewState {
  entities: AnyEntity[]
  loaded: boolean
  load(): Promise<void>
  upsert(e: AnyEntity): void
  remove(id: string, kind: string): void
}

export const useHomebrew = create<HomebrewState>((set, get) => ({
  entities: [],
  loaded: false,
  async load() {
    const saved = ((await api.storeGet('homebrew')) ?? []) as AnyEntity[]
    set({ entities: Array.isArray(saved) ? saved : [], loaded: true })
  },
  upsert(e) {
    const list = get().entities.filter((x) => !(x.id === e.id && x.kind === e.kind))
    list.push(e)
    set({ entities: list })
    api.storeSet('homebrew', list)
  },
  remove(id, kind) {
    const list = get().entities.filter((x) => !(x.id === id && x.kind === kind))
    set({ entities: list })
    api.storeSet('homebrew', list)
  }
}))
