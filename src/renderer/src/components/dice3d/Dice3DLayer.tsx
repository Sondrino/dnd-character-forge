import { useEffect, useRef } from 'react'
import { useRolls } from '../../store/rolls'
import { useSettings } from '../../store/settings'
import type { DiceScene } from './DiceScene'
import { playClack } from '../Dice'

import { DICE_SETTLED } from './themes'

/**
 * Gjennomsiktig 3D-lag over hele appen. Ved hvert kast simuleres terningene med fysikk og
 * spilles av; three.js lastes først ved første kast.
 */
export function Dice3DLayer() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<DiceScene | null>(null)
  const seq = useRolls((s) => s.seq)
  const enabled = useSettings((s) => s.dice3d !== false && s.animations)

  useEffect(() => {
    const onResize = (): void => scene.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      scene.current?.dispose()
      scene.current = null
    }
  }, [])

  useEffect(() => {
    const r = useRolls.getState().current
    if (!r || !seq) return
    if (!enabled || !canvas.current) {
      window.dispatchEvent(new CustomEvent(DICE_SETTLED, { detail: r.id }))
      return
    }
    const dice = r.terms.filter((t) => t.dice.length).flatMap((t) => t.dice.map((d) => ({ sides: d.sides, value: d.value, kept: d.kept })))
    if (!dice.length) {
      window.dispatchEvent(new CustomEvent(DICE_SETTLED, { detail: r.id }))
      return
    }
    let cancelled = false
    import('./DiceScene')
      .then(({ DiceScene }) => {
        if (cancelled || !canvas.current) return
        scene.current ??= new DiceScene(canvas.current)
        const sc = scene.current
        const sound = useSettings.getState().diceSound
        sc.onImpact = (v) => sound && playClack(v)
        sc.onSettled = () => window.dispatchEvent(new CustomEvent(DICE_SETTLED, { detail: r.id }))
        sc.throw(dice, useSettings.getState().diceTheme ?? 'obsidian')
      })
      .catch(() => window.dispatchEvent(new CustomEvent(DICE_SETTLED, { detail: r.id })))
    return () => {
      cancelled = true
    }
  }, [seq])

  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[80] h-full w-full" style={{ display: 'none', transition: 'opacity .2s' }} />
}
