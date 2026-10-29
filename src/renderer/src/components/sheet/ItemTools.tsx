import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Coins, FlaskConical, Pencil, ScrollText, ShoppingCart, Utensils } from 'lucide-react'
import type { AnyEntity, InventoryItem } from '../../types'
import { useChar } from './context'
import { Markdown, Modal, NumberInput, Tip } from '../ui'
import { RollBox } from '../combat/RollBox'
import { uid } from '../../store/characters'
import { useUi } from '../../store/ui'
import { useSettings } from '../../store/settings'
import { add, applyCurrencyInput, formatCp, parseCoins, spend, toCp, type Coin } from '../../lib/coins'
import { addEntity, bundleSize, consumableKind, consumeOne, healCharacter, healingDice, maxCharges, sellPriceCp } from '../../lib/items'
import { addLog } from '../../lib/combat'

/* ------------------------------------------------------------------ */
/* Myntfelt som forstår «+35», «-4», «+2 gp», «-5 sp»                  */
/* ------------------------------------------------------------------ */

export function CoinInput({ coin }: { coin: Coin }) {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const notify = useUi((s) => s.notify)
  const value = char.currency[coin] ?? 0
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = (s: string): void => {
    if (s.trim() === String(value) || !s.trim()) return setText(String(value))
    const r = applyCurrencyInput(char.currency, coin, s)
    if (!r.ok) {
      notify(r.error === 'insufficient' ? t('items.coinInsufficient') : t('items.coinInvalid', { v: s }), 'bad')
      setText(String(value))
      return
    }
    update((c) => void (c.currency = r.currency))
    setText(String(r.currency[coin]))
  }
  return (
    <input
      className="input w-full px-1 py-0.5 text-center text-xs"
      style={{ maxWidth: 58 }}
      title={t('items.coinHint')}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Handlinger på en utstyrsrad: charges, bruk, selg, navn/notater      */
/* ------------------------------------------------------------------ */

export function ItemRowActions({ it, idx, def }: { it: InventoryItem; idx: number; def?: AnyEntity }) {
  const { t } = useTranslation()
  const [modal, setModal] = useState<'use' | 'sell' | 'edit' | null>(null)
  const max = maxCharges(def)
  const kind = consumableKind(def, it.name)
  const Icon = kind === 'potion' ? FlaskConical : kind === 'scroll' ? ScrollText : Utensils
  return (
    <>
      {max > 0 && <ChargesTracker it={it} idx={idx} max={max} />}
      {kind && it.qty > 0 && (
        <button className="chip cursor-pointer border-good/50 text-good" onClick={() => setModal('use')}>
          <Icon size={11} /> {t(`items.use.${kind}`)}
        </button>
      )}
      <Tip content={t('items.sell')}>
        <button className="btn btn-ghost btn-sm text-faint hover:text-gold" onClick={() => setModal('sell')} disabled={it.qty <= 0}>
          <Coins size={13} />
        </button>
      </Tip>
      <Tip content={t('items.edit')}>
        <button className={`btn btn-ghost btn-sm ${it.notes || (it.name && def) ? 'text-arcane' : 'text-faint'} hover:text-ink`} onClick={() => setModal('edit')}>
          <Pencil size={12} />
        </button>
      </Tip>
      {modal === 'use' && kind && <UseItemModal it={it} def={def} onClose={() => setModal(null)} />}
      {modal === 'sell' && <SellModal it={it} idx={idx} def={def} onClose={() => setModal(null)} />}
      {modal === 'edit' && <EditItemModal it={it} idx={idx} def={def} onClose={() => setModal(null)} />}
    </>
  )
}

/** Pips (≤ 12) eller teller for charges. Fylt pip = charge igjen. */
export function ChargesTracker({ it, idx, max }: { it: InventoryItem; idx: number; max: number }) {
  const { t } = useTranslation()
  const { update } = useChar()
  const used = Math.min(max, it.chargesUsed ?? 0)
  const left = max - used
  const set = (l: number): void => update((c) => void (c.inventory[idx].chargesUsed = max - Math.max(0, Math.min(max, l))))
  return (
    <Tip content={t('items.chargeTip')}>
      <span className="inline-flex items-center gap-1 rounded-full border border-arcane/40 px-1.5 py-0.5 text-[10px] text-arcane">
        {max <= 12 ? (
          Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              aria-label={i < left ? t('items.useCharge') : t('items.regainCharge')}
              className={`h-2.5 w-2.5 rounded-full border border-arcane ${i < left ? 'bg-arcane' : 'bg-transparent'}`}
              onClick={() => set(i < left ? i : i + 1)}
            />
          ))
        ) : (
          <>
            <button className="px-1" onClick={() => set(left - 1)} aria-label={t('items.useCharge')}>
              −
            </button>
            <span className="font-mono">{t('items.chargesLeft', { n: left, max })}</span>
            <button className="px-1" onClick={() => set(left + 1)} aria-label={t('items.regainCharge')}>
              +
            </button>
          </>
        )}
        {max <= 12 && <span className="ml-0.5 font-mono">{left}/{max}</span>}
      </span>
    </Tip>
  )
}

/** Drikk/les/spis fra utstyret (utenfor eller i kamp) */
function UseItemModal({ it, def, onClose }: { it: InventoryItem; def?: AnyEntity; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const notify = useUi((s) => s.notify)
  const physical = (char.combat?.dice ?? useSettings.getState().combatDice) === 'physical'
  const name = it.name || def?.name || ''
  const kind = consumableKind(def, it.name)!
  const dice = kind === 'potion' ? healingDice(def, name) : undefined
  const [amount, setAmount] = useState<number | null>(null)
  const use = (): void => {
    let healed = 0
    update((c) => {
      if (dice && amount) healed = healCharacter(c, amount, d.hpMax.value)
      if (c.combat) {
        if (healed) c.combat.stats.healed += healed
        addLog(c.combat, healed ? 'heal' : 'action', healed ? t('items.combat.logHeal', { name, n: healed }) : t('items.combat.log', { name }))
      }
      consumeOne(c, it.uid)
    })
    const used = it.qty - 1 > 0 ? t('items.usedUp', { name, n: it.qty - 1 }) : t('items.usedLast', { name })
    notify(healed ? `${t('items.healed', { name, n: healed })} · ${used}` : used, healed ? 'good' : 'info')
    onClose()
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={name}
      width={560}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" disabled={!!dice && amount === null} onClick={use}>
            {t(`items.use.${kind}`)}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-muted">{t(`items.useHint.${kind}`)}</p>
        {def?.summary && <Markdown text={def.summary} />}
        {dice ? (
          <RollBox label={t('items.healing')} notation={dice} value={amount} onValue={(v) => setAmount(v)} physical={physical} character={char.name} autoFocus />
        ) : (
          kind === 'potion' && <p className="text-xs text-muted">{t('items.noDice')}</p>
        )}
        <p className="text-xs text-muted">{t('items.qtyLeft', { n: it.qty })}</p>
      </div>
    </Modal>
  )
}

function SellModal({ it, idx, def, onClose }: { it: InventoryItem; idx: number; def?: AnyEntity; onClose: () => void }) {
  const { t } = useTranslation()
  const { update } = useChar()
  const notify = useUi((s) => s.notify)
  const name = it.name || def?.name || ''
  const dflt = sellPriceCp(def, it)
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(dflt !== undefined ? formatCp(dflt) : '')
  const each = parseCoins(price)
  const total = each === null ? null : Math.floor(each * qty)
  return (
    <Modal
      open
      onClose={onClose}
      title={t('items.sellTitle', { name })}
      width={480}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            disabled={total === null || qty < 1}
            onClick={() => {
              update((c) => {
                const row = c.inventory[idx]
                if (!row || row.uid !== it.uid) return
                c.currency = add(c.currency, total ?? 0)
                row.qty -= qty
                if (row.qty <= 0) c.inventory.splice(idx, 1)
              })
              notify(t('items.sold', { n: qty, name, price: formatCp(total ?? 0) }), 'good')
              onClose()
            }}
          >
            <Coins size={14} /> {t('items.sell')}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1 block text-xs text-muted">{t('items.sellQty')}</span>
            <NumberInput value={qty} min={1} max={it.qty} onChange={(v) => setQty(Math.max(1, Math.min(it.qty, v)))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-muted">{t('items.sellPrice')}</span>
            <input className="input w-36" value={price} placeholder={t('items.noPrice')} onChange={(e) => setPrice(e.target.value)} autoFocus />
          </label>
          <div className="ml-auto text-right">
            <div className="text-xs text-muted">{t('items.sellTotal')}</div>
            <div className="font-display text-xl text-gold">{total === null ? '–' : formatCp(total)}</div>
          </div>
        </div>
        <p className="text-xs text-muted">{t('items.sellHint')}</p>
      </div>
    </Modal>
  )
}

function EditItemModal({ it, idx, def, onClose }: { it: InventoryItem; idx: number; def?: AnyEntity; onClose: () => void }) {
  const { t } = useTranslation()
  const { update } = useChar()
  const [name, setName] = useState(it.name ?? '')
  const [notes, setNotes] = useState(it.notes ?? '')
  const save = (): void => {
    update((c) => {
      const row = c.inventory[idx]
      if (!row || row.uid !== it.uid) return
      // Rader uten database-referanse må ha et navn
      row.name = name.trim() || (def ? undefined : row.name)
      row.notes = notes.trim() || undefined
    })
    onClose()
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={t('items.edit')}
      width={520}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={save}>
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">{t('items.customName')}</span>
          <input className="input w-full" value={name} placeholder={def?.name} onChange={(e) => setName(e.target.value)} autoFocus />
          {def && <span className="mt-1 block text-[11px] text-faint">{t('items.dbName', { name: def.name })}</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">{t('items.notes')}</span>
          <textarea className="input min-h-[90px] w-full" value={notes} placeholder={t('items.notesPlaceholder')} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Kjøp: velg antall, se pris og trekk fra pengene                     */
/* ------------------------------------------------------------------ */

export function BuyModal({ ents, onClose }: { ents: AnyEntity[] | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const notify = useUi((s) => s.notify)
  const [qty, setQty] = useState<Record<string, number>>({})
  useEffect(() => setQty({}), [ents])
  const rows = useMemo(
    () => (ents ?? []).map((e) => ({ e, price: parseCoins((e as { cost?: string }).cost) ?? undefined, bundle: bundleSize(e), n: qty[e.id] ?? 1 })),
    [ents, qty]
  )
  const total = rows.reduce((s, r) => s + Math.round((r.price ?? 0) * r.n), 0)
  const have = toCp(char.currency)
  const after = spend(char.currency, total)
  const addAll = (pay: boolean): void => {
    update((c) => {
      if (pay) {
        const paid = spend(c.currency, total)
        if (!paid) return
        c.currency = paid
      }
      for (const r of rows) if (r.n > 0) addEntity(c, r.e, r.n, uid)
    })
    if (pay && total) notify(t('items.bought', { price: formatCp(total) }), 'good')
    onClose()
  }
  return (
    <Modal
      open={!!ents}
      onClose={onClose}
      title={t('items.buyTitle')}
      width={600}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn" onClick={() => addAll(false)}>
            {t('items.addFree')}
          </button>
          <button className="btn btn-primary" disabled={!after} onClick={() => addAll(true)}>
            <ShoppingCart size={14} /> {t('items.buy')} ({formatCp(total)})
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="divide-y divide-line-soft">
          {rows.map((r) => (
            <div key={r.e.id} className="flex items-center gap-3 py-1.5">
              <span className="flex-1">
                {r.e.name}
                {r.bundle > 1 && <span className="ml-1 text-[11px] text-muted">({t('items.bundle', { n: r.bundle })})</span>}
              </span>
              <span className="text-xs text-muted">{r.price === undefined ? t('items.unknownPrice') : `${formatCp(r.price)} ${t('items.each')}`}</span>
              <NumberInput value={r.n} min={0} width={54} className="py-0.5" onChange={(v) => setQty((q) => ({ ...q, [r.e.id]: Math.max(0, v) }))} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
            <div className="text-[11px] text-muted">{t('items.total')}</div>
            <div className="font-display text-lg text-gold">{formatCp(total)}</div>
          </div>
          <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
            <div className="text-[11px] text-muted">{t('items.have')}</div>
            <div className="font-display text-lg">{formatCp(have)}</div>
          </div>
          <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
            <div className="text-[11px] text-muted">{t('items.afterBuy')}</div>
            <div className={`font-display text-lg ${after ? '' : 'text-bad'}`}>{after ? formatCp(toCp(after)) : '–'}</div>
          </div>
        </div>
        {!after && (
          <div className="flex items-center gap-2 rounded-xl border border-bad/50 bg-bad/10 px-3 py-2 text-bad">
            <AlertTriangle size={14} /> {t('items.notEnough', { n: formatCp(total - have) })}
          </div>
        )}
      </div>
    </Modal>
  )
}
