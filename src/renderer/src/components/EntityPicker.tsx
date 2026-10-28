import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Info, Search } from 'lucide-react'
import type { AnyEntity, EntityKind, SpellDef } from '../types'
import { Modal, SourceBadge } from './ui'
import { useLookup, useUi } from '../store/ui'
import { entityFacts } from './EntityInfo'
import { matchesQuery } from '../lib/search'
import { sortEntities, sortOptions } from '../lib/sorting'
import { SortSelect, useSortChoice } from './SortSelect'
import { BookFilterBar, BookFilterReset, useBookFilter } from './BookFilter'

export function EntityPicker({
  open, onClose, kinds, title, filter, multi = false, max, selected = [], onConfirm, extra = [], groupBy
}: {
  open: boolean
  onClose: () => void
  kinds: EntityKind[]
  title: string
  filter?: (e: AnyEntity) => boolean
  multi?: boolean
  max?: number
  selected?: string[]
  onConfirm: (ids: string[], entities: AnyEntity[]) => void
  /** Ekstra entities (f.eks. karakterens homebrew) */
  extra?: AnyEntity[]
  groupBy?: (e: AnyEntity) => string
}) {
  const { t } = useTranslation()
  const L0 = useLookup()
  const L = useMemo(() => L0.extend(extra), [L0, extra])
  const openDetail = useUi((s) => s.openDetail)
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string[]>(selected)
  const [level, setLevel] = useState<number | null>(null)
  const [limit, setLimit] = useState(150)
  useEffect(() => setLimit(150), [q, level, open])
  useEffect(() => {
    if (open) {
      setPicked(selected)
      setQ('')
    }
  }, [open])

  const sortKind = kinds.length === 1 ? kinds[0] : 'mixed'
  const sortOpts = sortOptions(sortKind)
  const [sortId, setSortId] = useSortChoice(`picker:${[...kinds].sort().join(',')}`, sortOpts[0].id)
  const all = useMemo(() => sortEntities(kinds.flatMap((k) => L.all(k)).filter((e) => !filter || filter(e)), sortKind, sortId), [L, kinds, filter, sortId])
  // Bokfilteret huskes per type, så «bare PHB» gjelder neste gang også
  const bf = useBookFilter([...kinds].sort().join(','), all)
  const inBooks = bf.filtered
  useEffect(() => setLimit(150), [bf.chosen])
  const isSpell = kinds.length === 1 && kinds[0] === 'spell'
  const levels = isSpell ? [...new Set(inBooks.map((s) => (s as SpellDef).level))].sort((a, b) => a - b) : []
  const shown = inBooks.filter(
    (e) =>
      matchesQuery(e, q) &&
      (level === null || (e as SpellDef).level === level)
  )
  const groups = groupBy ? [...new Set(shown.map(groupBy))] : ['']

  const toggle = (id: string): void => {
    if (!multi) {
      setPicked([id])
      return
    }
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : max && p.length >= max ? p : [...p, id]))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={920}
      footer={
        <>
          {multi && max !== undefined && (
            <span className="mr-auto self-center text-sm text-muted">
              {t('picker.selected', { n: picked.length, max })}
            </span>
          )}
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            disabled={!picked.length && !multi}
            onClick={() => {
              onConfirm(picked, picked.map((id) => all.find((e) => e.id === id)!).filter(Boolean))
              onClose()
            }}
          >
            <Check size={14} /> {t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-3 space-y-2 border-b border-line-soft bg-panel px-5 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input autoFocus className="input pl-9" placeholder={t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {all.length > 8 && <SortSelect options={sortOpts} value={sortId} onChange={setSortId} className="w-52" />}
        </div>
        <BookFilterBar state={bf} />
        {levels.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button className={`btn btn-sm ${level === null ? 'btn-primary' : ''}`} onClick={() => setLevel(null)}>
              {t('common.all')}
            </button>
            {levels.map((l) => (
              <button key={l} className={`btn btn-sm ${level === l ? 'btn-primary' : ''}`} onClick={() => setLevel(l)}>
                {l === 0 ? 'Cantrips' : `Level ${l}`}
              </button>
            ))}
          </div>
        )}
      </div>
      {groups.map((g) => (
        <div key={g} className="mb-4">
          {g && <div className="panel-title mb-2">{g}</div>}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {shown
              .filter((e) => !groupBy || groupBy(e) === g)
              .slice(0, limit)
              .map((e, i) => {
                const on = picked.includes(e.id)
                const facts = entityFacts(e, L).slice(0, 2)
                return (
                  <motion.div
                    key={`${e.kind}:${e.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 20) * 0.015 }}
                    onClick={() => toggle(e.id)}
                    className={`card-hover relative cursor-pointer rounded-xl border p-3 ${on ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel-2'}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[15px] text-gold">{e.name}</div>
                        {facts.map((f) => (
                          <div key={f.label} className="truncate text-[11px] text-muted">
                            {f.value}
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm px-1.5"
                        onClick={(ev) => {
                          ev.stopPropagation()
                          openDetail({ kind: e.kind, id: e.id, entity: extra.includes(e) ? e : undefined })
                        }}
                        title={t('info.more')}
                      >
                        <Info size={14} />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs text-ink/80">{e.summary}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <SourceBadge source={e.source} book={e.sourceBook} />
                      {on && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[#1d1408]">
                          <Check size={12} />
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
      ))}
      {!shown.length && (
        <div className="py-10 text-center text-muted">
          {t('common.noResults')}
          <BookFilterReset state={bf} total={all.length} />
        </div>
      )}
      {groups.some((g) => shown.filter((e) => !groupBy || groupBy(e) === g).length > limit) && (
        <div className="py-3 text-center">
          <button className="btn" onClick={() => setLimit(limit + 300)}>
            {t('picker.showMore', { n: shown.length - limit })}
          </button>
        </div>
      )}
    </Modal>
  )
}
