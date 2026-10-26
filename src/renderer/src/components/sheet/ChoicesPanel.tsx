import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, AlertCircle, Pencil } from 'lucide-react'
import type { Character } from '../../types'
import type { PendingChoice } from '../../engine/compute'
import type { Lookup } from '../../engine/lookup'
import { skillById, abilityNames } from '../../data/skills'
import { useChar } from './context'
import { ChoiceResolver, getChoiceValues } from './ChoiceResolver'

/** Kort tekst som beskriver hva som er valgt */
export function choiceSummary(p: PendingChoice, char: Character, L: Lookup): string {
  const nameOf = (id: string): string =>
    skillById[id as keyof typeof skillById]?.name ??
    abilityNames[id as keyof typeof abilityNames] ??
    L.any(id)?.name ??
    L.classOptions.flatMap((g) => g.items).find((i) => i.id === id)?.name ??
    id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  if (p.type === 'subclass') return L.get('subclass', char.classes.find((c) => c.classId === p.filter)?.subclassId)?.name ?? ''
  if (p.type === 'speciesOption') return L.get('species', char.speciesId)?.options?.choices.find((o) => o.id === char.speciesOptionId)?.name ?? ''
  if (p.type === 'weaponMastery') return char.weaponMasteries.map(nameOf).join(', ')
  if (p.key === 'background:abilities')
    return Object.entries(char.backgroundBonus)
      .filter(([, v]) => v)
      .map(([a, v]) => `+${v} ${a.toUpperCase()}`)
      .join(', ')
  if (p.key.startsWith('featability:')) {
    const a = char.feats.find((f) => f.uid === p.key.slice(12))?.abilityChoice
    return a ? abilityNames[a] : ''
  }
  if (p.type === 'feat') {
    const src = p.key === 'background:feat' ? 'background' : p.key
    return char.feats
      .filter((f) => f.source === src)
      .map((f) => L.get('feat', f.featId)?.name ?? f.featId)
      .join(', ')
  }
  if (p.area === 'spells') return `${p.chosen}/${p.count}`
  const vals = getChoiceValues(char, p.key)
  // ASI: «STR, STR» → «+2 STR»
  if (p.type === 'ability' && vals.length) {
    const counts = new Map<string, number>()
    vals.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
    return [...counts].map(([a, n]) => (p.key.endsWith(':abilities') ? `+${n} ${a.toUpperCase()}` : nameOf(a))).join(', ')
  }
  return vals.map(nameOf).join(', ')
}

/** Alle valg for karakteren – uløste øverst, tatte valg kan åpnes og endres */
export function ChoicesPanel({ filter }: { filter?: (p: PendingChoice) => boolean }) {
  const { t } = useTranslation()
  const { char, derived, lookup: L, goTo } = useChar()
  const [open, setOpen] = useState<string | null>(null)
  const list = derived.choices.filter((p) => p.area !== 'spells' && (!filter || filter(p)))
  const pending = list.filter((p) => p.chosen < p.count)
  const done = list.filter((p) => p.chosen >= p.count)
  const spellPending = derived.pending.filter((p) => p.area === 'spells')
  return (
    <div className="space-y-2">
      {pending.length > 0 && (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gold">
          <AlertCircle size={13} /> {t('choices.pending', { n: pending.length })}
        </div>
      )}
      {pending.map((p) => (
        <motion.div key={p.key} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl ring-1 ring-gold/40">
          <ChoiceResolver p={p} />
        </motion.div>
      ))}
      {spellPending.length > 0 && (
        <button className="w-full rounded-xl border border-arcane/40 bg-arcane/5 p-3 text-left text-[13px]" onClick={() => goTo?.('spells')}>
          <span className="font-medium text-arcane">{t('choices.spellsPending')}</span>
          <div className="text-xs text-muted">{spellPending.map((p) => `${p.label}: ${p.chosen}/${p.count}`).join(' · ')}</div>
        </button>
      )}
      {done.length > 0 && <div className="pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted">{t('choices.done', { n: done.length })}</div>}
      {done.map((p) => {
        const isOpen = open === p.key
        return (
          <div key={p.key} className="overflow-hidden rounded-xl border border-line-soft bg-panel-2/40">
            <button className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-panel-2" onClick={() => setOpen(isOpen ? null : p.key)}>
              <Check size={13} className="shrink-0 text-good" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px]">{p.label}</div>
                <div className="truncate text-[11px] text-gold">{choiceSummary(p, char, L) || '—'}</div>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Pencil size={11} /> {t('choice.change')}
              </span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                <ChevronDown size={13} className="text-muted" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-line-soft">
                  <div className="p-2">
                    <ChoiceResolver p={p} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
      {list.length === 0 && spellPending.length === 0 && <div className="text-sm text-muted">{t('choices.none')}</div>}
    </div>
  )
}
