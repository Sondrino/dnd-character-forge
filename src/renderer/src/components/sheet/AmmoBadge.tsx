import type React from 'react'
import { useTranslation } from 'react-i18next'
import type { WeaponDef } from '../../types'
import type { DerivedAttack } from '../../engine/compute'
import { useChar } from './context'
import { Tip } from '../ui'
import { useUi } from '../../store/ui'
import { addLog } from '../../lib/combat'
import { ammoLeft, ammoTypeOf, consumeAmmo } from '../../lib/items'

/**
 * Ammunisjon for et angrep på arket: et merke med hvor mye som er igjen, og `onRoll` som bruker ett stykk
 * når angrepet rulles (og advarer når det er tomt).
 */
export function useAmmo(a: DerivedAttack): { badge: React.ReactNode; onRoll?: () => void } {
  const { t } = useTranslation()
  const { char, lookup: L, update } = useChar()
  const notify = useUi((s) => s.notify)
  const w = a.kind === 'weapon' ? (L.get('weapon', a.refId) as WeaponDef | undefined) : undefined
  const left = ammoLeft(char, L, w)
  if (left === undefined) return { badge: null }
  const type = ammoTypeOf(w)!
  const badge = (
    <Tip content={left > 0 ? t('items.ammoLeft', { name: type, n: left }) : t('items.noAmmoHint', { type })}>
      <span className={`chip ml-1.5 py-0 text-[9px] ${left > 0 ? '' : 'border-bad/60 text-bad'}`}>
        {type} ×{left}
      </span>
    </Tip>
  )
  const onRoll = (): void => {
    if (left <= 0) {
      notify(t('items.noAmmo', { type }), 'bad')
      return
    }
    let res: ReturnType<typeof consumeAmmo> = null
    update((c) => {
      res = consumeAmmo(c, L, w, c.combat)
      if (res && c.combat) addLog(c.combat, 'info', t('items.ammoLog', { name: res.name, n: res.left }))
    })
    const r = res as ReturnType<typeof consumeAmmo>
    if (r && r.left === 0) notify(t('items.noAmmo', { type }), 'bad')
  }
  return { badge, onRoll }
}
