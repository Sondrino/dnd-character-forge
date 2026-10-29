import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Package, Swords, Shield, Gem, Coins, Weight, Sparkles, ShoppingCart } from 'lucide-react'
import type { AnyEntity, GearDef, MagicItemDef } from '../../types'
import { useChar } from './context'
import { Empty, NumberInput, Section, Tip, Toggle } from '../ui'
import { EntityLink } from '../EntityInfo'
import { EntityPicker } from '../EntityPicker'
import { uid } from '../../store/characters'
import { SortSelect, useSortChoice } from '../SortSelect'
import { costGp } from '../../lib/sorting'
import { ChoiceResolver } from './ChoiceResolver'
import { BuyModal, CoinInput, ItemRowActions } from './ItemTools'
import { LootModal } from './LootModal'
import { addEntity, qtyDivisor } from '../../lib/items'

const COINS = ['cp', 'sp', 'ep', 'gp', 'pp'] as const
const COIN_COLORS: Record<string, string> = { cp: '#b87333', sp: '#c0c0c0', ep: '#9fb4c7', gp: '#d6a84c', pp: '#e5e4e2' }

export function InventoryTab() {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, update } = useChar()
  const [picker, setPicker] = useState(false)
  const [customName, setCustomName] = useState('')
  const [buyMode, setBuyMode] = useState(false)
  const [buying, setBuying] = useState<AnyEntity[] | null>(null)
  const [loot, setLoot] = useState(false)
  const wmPending = d.pending.find((p) => p.key === 'weaponMastery')

  const items = char.inventory.map((it, idx) => {
    const def = L.item(it.refId)
    const magic = def?.kind === 'magicItem' ? (def as MagicItemDef) : undefined
    const base = magic ? L.item(it.baseId) : def
    return { it, idx, def, magic, base }
  })
  const groups: { id: string; label: string; icon: React.ReactElement; filter: (x: (typeof items)[number]) => boolean }[] = [
    { id: 'weapons', label: t('inv.weapons'), icon: <Swords size={13} />, filter: (x) => x.base?.kind === 'weapon' },
    { id: 'armor', label: t('inv.armor'), icon: <Shield size={13} />, filter: (x) => x.base?.kind === 'armor' },
    { id: 'magic', label: t('inv.magic'), icon: <Gem size={13} />, filter: (x) => !!x.magic && x.base?.kind !== 'weapon' && x.base?.kind !== 'armor' },
    { id: 'gear', label: t('inv.gear'), icon: <Package size={13} />, filter: (x) => !x.magic && x.base?.kind !== 'weapon' && x.base?.kind !== 'armor' }
  ]
  const carryPct = Math.min(1, d.carry.weight / Math.max(1, d.carry.capacity))
  const [sortId, setSortId] = useSortChoice('inventory', 'manual')
  const nameOf = (x: (typeof items)[number]): string => x.it.name || x.magic?.name || x.def?.name || ''
  const valueOf = (x: (typeof items)[number]): number => {
    const c = costGp((x.def as { cost?: string } | undefined)?.cost)
    return Number.isFinite(c) ? (c * x.it.qty) / qtyDivisor(x.def, x.it) : 0
  }
  const weightOf = (x: (typeof items)[number]): number => (((x.def as { weight?: number } | undefined)?.weight ?? 0) * x.it.qty) / qtyDivisor(x.def, x.it)
  const sortItems = (list: typeof items): typeof items =>
    sortId === 'manual'
      ? list
      : [...list].sort((a, b) =>
          sortId === 'name'
            ? nameOf(a).localeCompare(nameOf(b), 'en', { sensitivity: 'base' })
            : sortId === 'weight'
              ? weightOf(b) - weightOf(a) || nameOf(a).localeCompare(nameOf(b))
              : sortId === 'value'
                ? valueOf(b) - valueOf(a) || nameOf(a).localeCompare(nameOf(b))
                : Number(b.it.equipped || b.it.attuned) - Number(a.it.equipped || a.it.attuned) || nameOf(a).localeCompare(nameOf(b))
        )

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={() => setPicker(true)}>
            <Plus size={15} /> {t('inv.add')}
          </button>
          <Tip content={t('items.buyModeTip')}>
            <span>
              <Toggle checked={buyMode} onChange={setBuyMode} label={<span className="flex items-center gap-1 text-xs"><ShoppingCart size={12} /> {t('items.buyMode')}</span>} />
            </span>
          </Tip>
          <Tip content={t('items.lootTip')}>
            <button className="btn" onClick={() => setLoot(true)}>
              <Gem size={14} /> {t('items.loot')}
            </button>
          </Tip>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!customName.trim()) return
              update((c) => void c.inventory.push({ uid: uid(), name: customName.trim(), qty: 1, equipped: false, attuned: false }))
              setCustomName('')
            }}
          >
            <input className="input w-56" placeholder={t('inv.quickAdd')} value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <button className="btn" type="submit">
              <Plus size={14} />
            </button>
          </form>
          {items.length > 1 && (
            <SortSelect
              className="ml-auto w-52"
              value={sortId}
              onChange={setSortId}
              options={[
                { id: 'manual', label: 'manual' },
                { id: 'equipped', label: 'equipped' },
                { id: 'name', label: 'name' },
                { id: 'value', label: 'value' },
                { id: 'weight', label: 'weight' }
              ]}
            />
          )}
        </div>
        {items.length === 0 && (
          <div className="panel">
            <Empty icon={<Package size={36} />} title={t('inv.empty')} text={t('inv.emptyText')} />
          </div>
        )}
        {groups.map((g) => {
          const list = sortItems(items.filter(g.filter))
          if (!list.length) return null
          return (
            <Section key={g.id} title={<span className="flex items-center gap-1.5">{g.icon} {g.label}</span>}>
              <div className="divide-y divide-line-soft">
                <AnimatePresence initial={false}>
                  {list.map(({ it, idx, def, magic, base }) => {
                    const needsAttune = !!magic?.attunement
                    const isWeapon = base?.kind === 'weapon'
                    const equipable = base?.kind === 'weapon' || base?.kind === 'armor' || !!magic || def?.source === 'Homebrew'
                    const w = (base as { weight?: number } | undefined)?.weight
                    const needsBase = magic && /weapon|armor/i.test(magic.itemType) && !base
                    return (
                      <motion.div key={it.uid} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="flex flex-wrap items-center gap-3 py-2">
                        <div className="min-w-[180px] flex-1">
                          <div className="flex items-center gap-2">
                            {def ? <EntityLink kind="item" id={def.id} className="font-medium">{it.name || def.name}</EntityLink> : <span className="font-medium">{it.name}</span>}
                            {magic && <span className="chip py-0 text-[9px] capitalize text-arcane">{magic.rarity}</span>}
                            {(it.bonus ?? 0) !== 0 && <span className="chip py-0 text-[9px]">+{it.bonus}</span>}
                          </div>
                          {it.notes && <div className="whitespace-pre-wrap text-[11px] italic text-muted">{it.notes}</div>}
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                            {magic && base && <span>{base.name}</span>}
                            {w ? <span>{Math.round(((w * it.qty) / qtyDivisor(def, it)) * 100) / 100} lb.</span> : null}
                            {(base as GearDef | undefined)?.cost && <span>{(base as GearDef).cost}</span>}
                            {needsBase && <BasePicker magic={magic!} onPick={(id) => update((c) => void (c.inventory[idx].baseId = id))} />}
                          </div>
                        </div>
                        <NumberInput value={it.qty} min={0} width={54} className="py-0.5" onChange={(v) => update((c) => void (c.inventory[idx].qty = v))} />
                        {equipable && <Toggle checked={it.equipped} onChange={(v) => update((c) => equip(c, idx, v, L))} label={<span className="text-xs">{t('inv.equipped')}</span>} />}
                        {needsAttune && (
                          <Tip content={typeof magic!.attunement === 'string' ? `Attunement ${magic!.attunement}` : 'Attunement'}>
                            <button
                              className={`chip cursor-pointer ${it.attuned ? 'border-arcane bg-arcane/20 text-arcane' : ''}`}
                              onClick={() => update((c) => void (c.inventory[idx].attuned = !c.inventory[idx].attuned))}
                            >
                              <Sparkles size={11} /> {t('inv.attuned')}
                            </button>
                          </Tip>
                        )}
                        {isWeapon && !it.equipped && (
                          <button className={`chip cursor-pointer ${it.showAsAttack ? 'border-gold text-gold' : ''}`} onClick={() => update((c) => void (c.inventory[idx].showAsAttack = !c.inventory[idx].showAsAttack))}>
                            <Swords size={11} /> {t('inv.showAttack')}
                          </button>
                        )}
                        {(isWeapon || base?.kind === 'armor') && (
                          <Tip content={t('inv.bonusTip')}>
                            <select className="input w-16 px-1 py-0.5 text-xs" value={it.bonus ?? 0} onChange={(e) => update((c) => void (c.inventory[idx].bonus = Number(e.target.value)))}>
                              {[0, 1, 2, 3].map((n) => (
                                <option key={n} value={n}>
                                  {n ? `+${n}` : '+0'}
                                </option>
                              ))}
                            </select>
                          </Tip>
                        )}
                        <ItemRowActions it={it} idx={idx} def={def} />
                        <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => update((c) => void c.inventory.splice(idx, 1))}>
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </Section>
          )
        })}
      </div>

      <div className="col-span-12 space-y-4 lg:col-span-4">
        <Section title={<span className="flex items-center gap-1.5"><Coins size={13} /> {t('inv.coins')}</span>}>
          <div className="grid grid-cols-5 gap-2">
            {COINS.map((c) => (
              <div key={c} className="text-center">
                <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.5 }} className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-black shadow" style={{ background: `radial-gradient(circle at 35% 35%, #fff8, ${COIN_COLORS[c]})` }}>
                  {c.toUpperCase()}
                </motion.div>
                <CoinInput coin={c} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-xs text-muted">
            ≈ {(char.currency.cp / 100 + char.currency.sp / 10 + char.currency.ep / 2 + char.currency.gp + char.currency.pp * 10).toFixed(2)} GP
          </div>
          <div className="mt-1 text-[10px] text-faint">{t('items.coinHint')}</div>
        </Section>
        <Section title={<span className="flex items-center gap-1.5"><Weight size={13} /> {t('inv.carry')}</span>}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{d.carry.weight} lb.</span>
            <span className="text-muted">/ {d.carry.capacity} lb.</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-panel-3">
            <motion.div className="h-full rounded-full" style={{ background: carryPct >= 1 ? 'var(--bad)' : carryPct > 0.75 ? 'var(--gold)' : 'var(--good)' }} animate={{ width: `${carryPct * 100}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted">{t('inv.carryHint', { n: d.carry.dragLift })}</div>
          <div className="mt-2 text-[11px] text-muted">{t('inv.attunement', { n: d.attunedCount })}</div>
        </Section>
        {d.weaponMasteryMax > 0 && (
          <Section title={`Weapon Mastery (${char.weaponMasteries.length}/${d.weaponMasteryMax})`}>
            {wmPending ? <ChoiceResolver p={wmPending} compact /> : <ChoiceResolver p={{ key: 'weaponMastery', label: '', area: 'equipment', type: 'weaponMastery', count: d.weaponMasteryMax, chosen: char.weaponMasteries.length, source: '' }} compact />}
          </Section>
        )}
      </div>

      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['weapon', 'armor', 'gear', 'tool', 'magicItem']}
        title={t('inv.add')}
        multi
        extra={char.customEntities}
        groupBy={(e) => ({ weapon: 'Weapons', armor: 'Armor', gear: 'Gear', tool: 'Tools', magicItem: 'Magic Items' })[e.kind as 'weapon'] ?? e.kind}
        onConfirm={(ids, ents) =>
          buyMode
            ? setBuying(ents)
            : update((c) => {
                ents.forEach((e) => addItem(c, e))
                void ids
              })
        }
      />
      <BuyModal ents={buying} onClose={() => setBuying(null)} />
      <LootModal open={loot} onClose={() => setLoot(false)} />
    </div>
  )
}

/** Ammunisjon legges til i bunter (20 Arrows), annet utstyr stables */
function addItem(c: import('../../types').Character, e: AnyEntity): void {
  addEntity(c, e, 1, uid)
}

/** Utstyr: bare én body armor og ett skjold om gangen */
function equip(c: import('../../types').Character, idx: number, v: boolean, L: import('../../engine/lookup').Lookup): void {
  const item = c.inventory[idx]
  item.equipped = v
  if (!v) return
  const kindOf = (refId?: string, baseId?: string): string | undefined => {
    const d = L.item(refId)
    const b = d?.kind === 'magicItem' ? L.item(baseId) : d
    if (b?.kind !== 'armor') return undefined
    return (b as { category: string }).category === 'shield' ? 'shield' : 'body'
  }
  const k = kindOf(item.refId, item.baseId)
  if (!k) return
  c.inventory.forEach((o, i) => {
    if (i !== idx && o.equipped && kindOf(o.refId, o.baseId) === k) o.equipped = false
  })
}

function BasePicker({ magic, onPick }: { magic: MagicItemDef; onPick: (id: string) => void }) {
  const { t } = useTranslation()
  const { lookup: L } = useChar()
  const isWeapon = /weapon/i.test(magic.itemType)
  const opts = isWeapon ? L.all('weapon') : L.all('armor')
  return (
    <select className="input w-44 border-gold/60 px-1 py-0.5 text-xs" defaultValue="" onChange={(e) => onPick(e.target.value)}>
      <option value="" disabled>
        {t('inv.pickBase')}
      </option>
      {opts.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  )
}

export { addItem }
