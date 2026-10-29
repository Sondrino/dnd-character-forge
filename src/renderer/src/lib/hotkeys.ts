import { useEffect, useRef } from 'react'

/**
 * Hurtigtaster. useHotkeys (montert i App) oversetter tastetrykk til handlinger og sender dem som
 * et vindu-event, så sidene som er åpne (karakterside, kampmodus) kan reagere med useHotkeyListener.
 *
 *  Ctrl/Cmd+K  åpne/lukke hurtigsøk     D    terningbrett
 *  1–8         bytte fane på karaktersiden   N    neste tur i kampmodus
 *  Esc         lukke hurtigsøk
 */

export type HotkeyAction =
  | { type: 'palette' }
  | { type: 'dice' }
  | { type: 'tab'; index: number }
  | { type: 'next' }
  | { type: 'escape' }

const EVENT = 'forge:hotkey'

/** Skriver brukeren i et felt? Da ignoreres enkelttast-snarveier. */
export function isTypingTarget(el: EventTarget | null): boolean {
  const e = el as HTMLElement | null
  if (!e || typeof e !== 'object' || !('tagName' in e)) return false
  const tag = String(e.tagName).toUpperCase()
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') {
    const type = String((e as HTMLInputElement).type ?? 'text').toLowerCase()
    return !['checkbox', 'radio', 'button', 'submit', 'range', 'color', 'file', 'reset'].includes(type)
  }
  return !!e.isContentEditable
}

/** Tast → handling (ren funksjon, testet i tests/tools.test.ts) */
export function hotkeyFor(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>, typing: boolean): HotkeyAction | null {
  const k = e.key.toLowerCase()
  if ((e.ctrlKey || e.metaKey) && !e.altKey && k === 'k') return { type: 'palette' }
  if (k === 'escape') return { type: 'escape' }
  if (typing || e.ctrlKey || e.metaKey || e.altKey) return null
  if (k === 'd') return { type: 'dice' }
  if (k === 'n') return { type: 'next' }
  if (/^[1-8]$/.test(k)) return { type: 'tab', index: Number(k) - 1 }
  return null
}

export function dispatchHotkey(a: HotkeyAction): void {
  window.dispatchEvent(new CustomEvent<HotkeyAction>(EVENT, { detail: a }))
}

/** Lytt etter én type hurtigtast-handling */
export function useHotkeyListener<T extends HotkeyAction['type']>(type: T, fn: (a: Extract<HotkeyAction, { type: T }>) => void): void {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const h = (e: Event): void => {
      const a = (e as CustomEvent<HotkeyAction>).detail
      if (a?.type === type) ref.current(a as Extract<HotkeyAction, { type: T }>)
    }
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [type])
}

/** Åpne modaler (dialoger) – da skal ikke fane-/tur-snarveier slå inn bak dem */
function modalOpen(): boolean {
  return typeof document !== 'undefined' && !!document.querySelector('.fixed.inset-0.z-\\[60\\]')
}

/** Globale hurtigtaster (monteres én gang i App) */
export function useHotkeys(handlers: { palette: () => void; dice: () => void; escape: () => boolean }): void {
  const ref = useRef(handlers)
  ref.current = handlers
  useEffect(() => {
    const h = (e: KeyboardEvent): void => {
      if (e.repeat) return
      const a = hotkeyFor(e, isTypingTarget(e.target))
      if (!a) return
      if (a.type === 'palette') {
        e.preventDefault()
        ref.current.palette()
      } else if (a.type === 'escape') {
        if (ref.current.escape()) e.preventDefault()
      } else if (a.type === 'dice') {
        e.preventDefault()
        ref.current.dice()
      } else if (!modalOpen()) {
        e.preventDefault()
        dispatchHotkey(a)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
}
