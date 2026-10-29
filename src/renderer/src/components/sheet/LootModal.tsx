import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Gem, Plus, Trash2, Users } from 'lucide-react'
import type { AnyEntity } from '../../types'
import { useChar } from './context'
import { Modal, NumberInput } from '../ui'
import { EntityPicker } from '../EntityPicker'
import { uid } from '../../store/characters'
import { useUi } from '../../store/ui'
import { COINS, addCurrency, emptyCurrency, splitCurrency, toCp, formatCp, type Currency } from '../../lib/coins'
import { addEntity } from '../../lib/items'

interface LootItem {
  key: string
  entity?: AnyEntity
  name: string
  qty: number
  take: boolean
}

/** Funnet skatt: mynter og gjenstander, delt på N – bare din andel legges i sekken */
export function LootModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const notify = useUi((s) => s.notify)
  const [coins, setCoins] = useState<Currency>(emptyCurrency())
  const [items, setItems] = useState<LootItem[]>([])
  const [n, setN] = useState(1)
  const [takeRest, setTakeRest] = useState(false)
  const [picker, setPicker] = useState(false)
  const [quick, setQuick] = useState('')
  useEffect(() => {
    if (!open) return
    setCoins(emptyCurrency())
    setItems([])
    setN(1)
    setTakeRest(false)
    setQuick('')
  }, [open])

  const { share, remainder } = splitCurrency(coins, n)
  const mine = takeRest ? addCurrency(share, remainder) : share
  const hasRest = toCp(remainder) > 0
  const take = (): void => {
    update((c) => {
      c.currency = addCurrency(c.currency, mine)
      for (const it of items.filter((x) => x.take && x.qty > 0)) {
        if (it.entity) addEntity(c, it.entity, it.qty, uid)
        else c.inventory.push({ uid: uid(), name: it.name, qty: it.qty, equipped: false, attuned: false })
      }
    })
    notify(t('items.lootDone'), 'good')
    onClose()
  }
  const coinRow = (cur: Currency): string =>
    COINS.filter((c) => cur[c])
      .map((c) => `${cur[c]} ${c.toUpperCase()}`)
      .join(' · ') || '–'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="flex items-center gap-2"><Gem size={16} /> {t('items.lootTitle')}</span>}
      width={640}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" disabled={!toCp(mine) && !items.some((x) => x.take)} onClick={take}>
            {t('items.lootTake')}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <div className="panel-title mb-2">{t('items.lootCoins')}</div>
          <div className="grid grid-cols-5 gap-2">
            {COINS.map((c) => (
              <label key={c} className="text-center">
                <span className="mb-1 block text-[11px] font-bold text-muted">{c.toUpperCase()}</span>
                <NumberInput value={coins[c]} min={0} width={70} className="px-1 py-0.5 text-xs" onChange={(v) => setCoins((x) => ({ ...x, [c]: Math.max(0, v) }))} />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-title mb-2">{t('items.lootItems')}</div>
          {items.length === 0 ? (
            <p className="text-xs text-muted">{t('items.lootNoItems')}</p>
          ) : (
            <>
              <p className="mb-1 text-[11px] text-muted">{t('items.lootItemsHint')}</p>
              <div className="divide-y divide-line-soft">
                {items.map((it) => (
                  <div key={it.key} className="flex items-center gap-2 py-1">
                    <input type="checkbox" checked={it.take} onChange={(e) => setItems((l) => l.map((x) => (x.key === it.key ? { ...x, take: e.target.checked } : x)))} />
                    <span className="flex-1">{it.name}</span>
                    <NumberInput value={it.qty} min={1} width={54} className="py-0.5" onChange={(v) => setItems((l) => l.map((x) => (x.key === it.key ? { ...x, qty: Math.max(1, v) } : x)))} />
                    <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => setItems((l) => l.filter((x) => x.key !== it.key))}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn btn-sm" onClick={() => setPicker(true)}>
              <Plus size={13} /> {t('items.lootAddItem')}
            </button>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!quick.trim()) return
                setItems((l) => [...l, { key: uid(), name: quick.trim(), qty: 1, take: true }])
                setQuick('')
              }}
            >
              <input className="input input-sm w-52 py-1 text-xs" placeholder={t('items.lootQuick')} value={quick} onChange={(e) => setQuick(e.target.value)} />
              <button className="btn btn-sm" type="submit">
                <Plus size={13} />
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-line-soft bg-panel-2 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Users size={14} className="text-gold" />
            <span>{t('items.splitAmong')}</span>
            <NumberInput value={n} min={1} max={20} width={54} className="py-0.5" onChange={(v) => setN(Math.max(1, Math.min(20, v)))} />
            <span>{t('items.people')}</span>
          </div>
          <div className="grid gap-1 text-xs">
            <div>
              <span className="text-muted">{n > 1 ? t('items.eachGets') : t('items.share')}:</span> <b className="text-gold">{coinRow(share)}</b>{' '}
              {toCp(share) > 0 && <span className="text-faint">(≈ {formatCp(toCp(share))})</span>}
            </div>
            {hasRest && (
              <>
                <div>
                  <span className="text-muted">{t('items.remainder')}:</span> {coinRow(remainder)}
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={takeRest} onChange={(e) => setTakeRest(e.target.checked)} /> {t('items.takeRemainder')}
                </label>
              </>
            )}
            {n > 1 && (
              <div className="mt-1 border-t border-line-soft pt-1">
                <span className="text-muted">{t('items.share')}:</span> <b className="text-good">{coinRow(mine)}</b>
              </div>
            )}
          </div>
        </div>
        {void char}
      </div>

      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['weapon', 'armor', 'gear', 'tool', 'magicItem']}
        title={t('items.lootAddItem')}
        multi
        extra={char.customEntities}
        onConfirm={(_ids, ents) => setItems((l) => [...l, ...ents.map((e) => ({ key: uid(), entity: e, name: e.name, qty: 1, take: true }))])}
      />
    </Modal>
  )
}
