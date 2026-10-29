import type React from 'react'
import { useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, FlaskConical, Package, ScrollText } from 'lucide-react'
import type { WeaponDef } from '../../types'
import type { DerivedAttack } from '../../engine/compute'
import { Markdown } from '../ui'
import { RollBox } from './RollBox'
import { useCombat, type CombatOption } from './useCombat'
import { addLog } from '../../lib/combat'
import { ammoLeft, ammoTypeOf, consumeOne, healCharacter, recoverableAmmo, recoverAmmo, type ItemOptionData } from '../../lib/items'
import { uid } from '../../store/characters'
import { useUi } from '../../store/ui'

/** Navn, undertekst og merke for et item-valg i kampmodusens lister */
export function itemCardInfo(o: ItemOptionData, t: TFunction): { name: string; sub: string; badge: React.ReactNode } {
  return {
    name: o.name,
    sub: [o.consumable === 'potion' ? 'Bonus Action' : 'Action', o.heal ? `${t('items.healing')} ${o.heal}` : ''].filter(Boolean).join(' · '),
    badge: <span className="chip border-good/50 text-[10px] text-good">×{o.qty}</span>
  }
}

/** Drikk en potion / bruk en scroll i kamp. Potion of Healing ruller healing (ekte eller app-terninger). */
export function ItemFlow({ opt, onDone }: { opt: Extract<CombatOption, { kind: 'item' }>; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, c, mut, physical } = useCombat()
  const it = char.inventory.find((x) => x.uid === opt.uid)
  const def = L.item(it?.refId)
  const [amount, setAmount] = useState<number | null>(null)
  const allies = c.combatants.filter((x) => x.ally && !x.defeated)
  const [target, setTarget] = useState('self')
  if (!it || it.qty <= 0) return <p className="text-muted">{t('items.qtyLeft', { n: 0 })}</p>
  const used = opt.economy === 'bonus' ? c.turn.bonus : c.turn.action
  const Icon = opt.consumable === 'potion' ? FlaskConical : ScrollText
  return (
    <div className="space-y-3">
      {used && (
        <div className="flex items-center gap-2 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson-2">
          <AlertTriangle size={14} /> {t(`combat.alreadyUsed.${opt.economy}`)}
        </div>
      )}
      <p className="text-sm text-muted">{opt.consumable === 'potion' ? t('items.combat.bonusNote') : t('items.combat.scrollNote')}</p>
      {def?.summary && (
        <div className="text-sm">
          <Markdown text={def.summary} compact />
        </div>
      )}
      {opt.consumable === 'potion' && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs text-muted">{t('items.combat.who')}</span>
          <button className={`btn btn-sm ${target === 'self' ? 'btn-primary' : ''}`} onClick={() => setTarget('self')}>
            {char.name || t('items.combat.you')}
          </button>
          {allies.map((a) => (
            <button key={a.uid} className={`btn btn-sm ${target === a.uid ? 'btn-primary' : ''}`} onClick={() => setTarget(a.uid)}>
              {a.name}
            </button>
          ))}
          <button className={`btn btn-sm ${target === 'other' ? 'btn-primary' : ''}`} onClick={() => setTarget('other')}>
            {t('items.combat.other')}
          </button>
        </div>
      )}
      {opt.heal && <RollBox label={t('items.healing')} notation={opt.heal} value={amount} onValue={(v) => setAmount(v)} physical={physical} character={char.name} autoFocus />}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{t('items.qtyLeft', { n: it.qty })}</span>
        <button
          className="btn btn-primary"
          disabled={!!opt.heal && amount === null}
          onClick={() => {
            mut((cc, ch) => {
              if (opt.economy === 'bonus') cc.turn.bonus = true
              else cc.turn.action = true
              const n = amount ?? 0
              if (opt.heal && target === 'self') {
                const healed = healCharacter(ch, n, d.hpMax.value)
                cc.stats.healed += healed
                addLog(cc, 'heal', t('items.combat.logHeal', { name: opt.name, n: healed }))
              } else if (target !== 'self') {
                const a = cc.combatants.find((x) => x.uid === target)
                if (a?.hp !== undefined && n) a.hp = Math.min(a.maxHp ?? Infinity, a.hp + n)
                if (n) cc.stats.healed += n
                addLog(cc, opt.heal ? 'heal' : 'action', `${t('items.combat.logOther', { name: opt.name, who: a?.name ?? t('items.combat.other') })}${n ? ` – +${n} HP` : ''}`)
              } else addLog(cc, 'action', t('items.combat.log', { name: opt.name }))
              consumeOne(ch, opt.uid)
            })
            onDone()
          }}
        >
          <Icon size={14} /> {t(`items.use.${opt.consumable}`)}
        </button>
      </div>
    </div>
  )
}

/** Hvor mye ammunisjon som er igjen til våpenet – med advarsel når det er tomt */
export function AmmoStatus({ attack }: { attack: DerivedAttack }) {
  const { t } = useTranslation()
  const { char, lookup: L } = useCombat()
  const w = L.get('weapon', attack.refId) as WeaponDef | undefined
  const left = ammoLeft(char, L, w)
  if (left === undefined) return null
  const type = ammoTypeOf(w)!
  if (left > 0) return <p className="mb-2 flex items-center gap-1 text-xs text-muted"><Package size={12} /> {t('items.ammoLeft', { name: type, n: left })}</p>
  return (
    <div className="mb-3 rounded-xl border border-bad/50 bg-bad/10 px-3 py-2 text-sm text-bad">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={14} /> {t('items.noAmmo', { type })}
      </div>
      <div className="text-xs">{t('items.noAmmoHint', { type })}</div>
    </div>
  )
}

/** Avslutt kamp: hent igjen halvparten av ammunisjonen som ble brukt */
export function AmmoRecovery() {
  const { t } = useTranslation()
  const { c, mut } = useCombat()
  const notify = useUi((s) => s.notify)
  const list = recoverableAmmo(c)
  if (!list.length) return null
  const total = list.reduce((s, e) => s + e.n, 0)
  const usedList = (c.ammoUsed ?? []).map((e) => `${e.n} ${e.name}`).join(', ')
  return (
    <div className="mt-3 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
      <div className="panel-title mb-1">{t('items.recoverTitle')}</div>
      <p className="mb-2 text-xs text-muted">{t('items.recoverText', { list: usedList })}</p>
      <button
        className="btn btn-sm"
        onClick={() => {
          mut((cc, ch) => void recoverAmmo(ch, cc, uid))
          notify(t('items.recovered', { n: total }), 'good')
        }}
      >
        <Package size={13} /> {t('items.recover', { n: total })}
      </button>
    </div>
  )
}
