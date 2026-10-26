import { motion } from 'framer-motion'
import { useMemo, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Info, RefreshCw, Search, Sparkles, Sun, Trash2 } from 'lucide-react'
import type { Character, DeityDef } from '../types'
import type { Lookup } from '../engine/lookup'
import { Modal, SourceBadge } from './ui'
import { EntityLink } from './EntityInfo'
import { useUi } from '../store/ui'
import { FAITH_CLASSES } from '../data/deities'

/** Subclass-ids karakteren har (domains, oaths, patrons) */
function subclassIds(char: Character): string[] {
  return char.classes.map((c) => c.subclassId).filter((x): x is string => !!x)
}

/** Hvilken type tro passer for karakterens classes */
export function faithMode(char: Character): 'god' | 'patron' | 'both' | null {
  const ids = char.classes.map((c) => c.classId)
  const god = ids.includes('cleric') || ids.includes('paladin')
  const pat = ids.includes('warlock')
  if (god && pat) return 'both'
  if (god) return 'god'
  if (pat) return 'patron'
  return null
}

/** Anbefalte guder/patrons ut fra subclass, ellers ut fra class */
export function recommendedDeities(char: Character, L: Lookup): DeityDef[] {
  const subs = subclassIds(char)
  const mode = faithMode(char)
  const all = L.all('deity')
  const bySub = all.filter((d) => d.suggested.some((s) => subs.includes(s)))
  if (bySub.length) return bySub
  if (mode === 'patron') return all.filter((d) => d.category === 'patron').slice(0, 6)
  // Uten subclass: populære gode guder for helter
  return ['tymora', 'lathander', 'tyr', 'torm', 'selune', 'helm', 'mystra', 'tempus'].map((id) => L.get('deity', id)).filter((d): d is DeityDef => !!d)
}

export function DeityPicker({
  open, onClose, char, L, onPick
}: {
  open: boolean
  onClose: () => void
  char: Character
  L: Lookup
  onPick: (d: DeityDef) => void
}) {
  const { t } = useTranslation()
  const openDetail = useUi((s) => s.openDetail)
  const [q, setQ] = useState('')
  const mode = faithMode(char) ?? 'both'
  const [cat, setCat] = useState<'god' | 'patron'>(mode === 'patron' ? 'patron' : 'god')
  const rec = useMemo(() => new Set(recommendedDeities(char, L).map((d) => d.id)), [char, L])
  const all = L.all('deity')
    .filter((d) => d.category === cat)
    .filter((d) => !q || `${d.name} ${d.title} ${d.portfolio} ${d.domains.join(' ')} ${d.pantheon}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
  const recommended = all.filter((d) => rec.has(d.id))
  const groups = [...new Set(all.map((d) => d.pantheon))]
  const card = (d: DeityDef, i: number): ReactElement => (
    <motion.button
      key={d.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i, 20) * 0.015 }}
      onClick={() => {
        onPick(d)
        onClose()
      }}
      className={`card-hover relative rounded-xl border p-3 text-left ${char.deityId === d.id ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel-2'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-[15px] text-gold">{d.name}</div>
          <div className="truncate text-[11px] italic text-muted">{d.title}</div>
        </div>
        <span
          className="btn btn-ghost btn-sm px-1.5"
          onClick={(e) => {
            e.stopPropagation()
            openDetail({ kind: 'deity', id: d.id })
          }}
        >
          <Info size={13} />
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted">
        {d.alignment}
        {d.domains.length > 0 && ` · ${d.domains.join(', ')}`}
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-ink/80">{d.portfolio}</div>
      {char.deityId === d.id && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[#1d1408]">
          <Check size={12} />
        </span>
      )}
    </motion.button>
  )
  return (
    <Modal open={open} onClose={onClose} width={960} title={cat === 'patron' ? t('faith.pickPatron') : t('faith.pickGod')}>
      <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-3 flex flex-wrap items-center gap-2 border-b border-line-soft bg-panel px-5 py-3">
        <div className="relative min-w-60 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input autoFocus className="input pl-9" placeholder={t('faith.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className={`btn btn-sm ${cat === 'god' ? 'btn-primary' : ''}`} onClick={() => setCat('god')}>
          <Sun size={13} /> {t('faith.gods')}
        </button>
        <button className={`btn btn-sm ${cat === 'patron' ? 'btn-primary' : ''}`} onClick={() => setCat('patron')}>
          <Sparkles size={13} /> {t('faith.patrons')}
        </button>
      </div>
      {recommended.length > 0 && (
        <div className="mb-5">
          <div className="panel-title mb-2">★ {t('faith.recommended')}</div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{recommended.map(card)}</div>
        </div>
      )}
      {groups.map((g) => (
        <div key={g} className="mb-5">
          <div className="panel-title mb-2">{g}</div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{all.filter((d) => d.pantheon === g).map(card)}</div>
        </div>
      ))}
      {!all.length && <div className="py-10 text-center text-muted">{t('common.noResults')}</div>}
      <p className="mt-2 text-[11px] text-faint">{t('faith.note')}</p>
    </Modal>
  )
}

/** Panel som viser valgt gud/patron og lar deg velge/bytte */
export function FaithPanel({ char, L, update, compact }: { char: Character; L: Lookup; update: (f: (d: Character) => void) => void; compact?: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const deity = L.get('deity', char.deityId)
  const mode = faithMode(char)
  const rec = recommendedDeities(char, L).slice(0, 6)
  const pick = (d: DeityDef): void =>
    update((c) => {
      c.deityId = d.id
      c.details.faith = d.name
    })
  const label = mode === 'patron' ? t('faith.patron') : mode === 'both' ? t('faith.godOrPatron') : t('faith.god')
  return (
    <div className={compact ? '' : 'panel p-4'}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="panel-title flex items-center gap-1.5">
          <Sun size={13} /> {label}
        </div>
        <SourceBadge source="Forgotten Realms" />
      </div>
      {mode && !compact && <p className="mb-3 text-sm text-muted">{t(`faith.why.${mode}`)}</p>}
      {deity ? (
        <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/5 p-3">
          <div className="min-w-0 flex-1">
            <EntityLink kind="deity" id={deity.id} className="font-display text-lg" />
            <div className="text-xs italic text-muted">{deity.title}</div>
            <div className="mt-1 text-xs text-muted">
              {deity.alignment}
              {deity.domains.length > 0 && ` · ${t('faith.domains')}: ${deity.domains.join(', ')}`}
            </div>
            {deity.symbol !== '—' && <div className="text-xs text-muted">{t('faith.symbol')}: {deity.symbol}</div>}
          </div>
          <div className="flex flex-col gap-1">
            <button className="btn btn-sm" onClick={() => setOpen(true)}>
              <RefreshCw size={12} /> {t('choice.change')}
            </button>
            <button
              className="btn btn-ghost btn-sm text-faint hover:text-bad"
              onClick={() =>
                update((c) => {
                  c.deityId = undefined
                })
              }
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {rec.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] text-muted">★ {t('faith.recommendedFor')}</div>
              <div className="flex flex-wrap gap-1.5">
                {rec.map((d) => (
                  <button key={d.id} className="chip cursor-pointer px-2.5 py-1 text-[12px] hover:border-gold hover:text-ink" onClick={() => pick(d)} title={d.summary}>
                    {d.name}
                    <span className="text-faint">· {d.alignment.split(' ').map((w) => w[0]).join('')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Sun size={13} /> {mode === 'patron' ? t('faith.pickPatron') : t('faith.pickGod')}
          </button>
        </div>
      )}
      <DeityPicker open={open} onClose={() => setOpen(false)} char={char} L={L} onPick={pick} />
    </div>
  )
}

export { FAITH_CLASSES }
