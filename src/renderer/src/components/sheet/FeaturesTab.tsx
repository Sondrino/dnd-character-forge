import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Plus, Trash2, Star, ExternalLink } from 'lucide-react'
import { useChar } from './context'
import { SpecialAbilityEditor } from './SpecialAbilityEditor'
import { Markdown, Section } from '../ui'
import { UsesTracker } from './SheetTab'
import { FeatSlot } from './ChoiceResolver'
import { ChoicesPanel } from './ChoicesPanel'
import type { DerivedFeature } from '../../engine/compute'
import type { Uses } from '../../types'
import { openDndBeyond } from '../EntityInfo'

export function FeaturesTab() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const [adding, setAdding] = useState(false)
  const bySource = new Map<string, DerivedFeature[]>()
  for (const f of d.features) {
    const k = f.sourceType === 'class' || f.sourceType === 'subclass' ? f.source.replace(/ \d+$/, '') : f.sourceType === 'feat' ? 'Feats' : f.source
    bySource.set(k, [...(bySource.get(k) ?? []), f])
  }
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-8">
        {[...bySource.entries()].map(([src, list]) => (
          <Section key={src} title={src}>
            <div className="space-y-2">
              {list.map((f) => (
                <FeatureCard key={f.key} f={f} />
              ))}
            </div>
          </Section>
        ))}
      </div>
      <div className="col-span-12 space-y-4 lg:col-span-4">
        <Section title={t('choices.title')}>
          <ChoicesPanel />
        </Section>
        <Section
          title={t('features.feats')}
          actions={
            <FeatSlot p={{ key: 'manual', label: t('features.addFeat'), area: 'feats', type: 'feat', count: 1, chosen: 0, source: 'manual' }} />
          }
        >
          <div className="space-y-1">
            {char.feats.map((cf) => {
              const def = d.feats.find((f) => f.uid === cf.uid)?.def
              return (
                <div key={cf.uid} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-panel-2">
                  <Star size={12} className="text-gold" />
                  <span>{def?.name ?? cf.featId}</span>
                  <span className="text-[11px] text-faint">{cf.source.replace(/^class:(\w+):(\d+)$/, '$1 $2').split('#')[0]}</span>
                  <button className="btn btn-ghost btn-sm ml-auto text-faint hover:text-bad" onClick={() => update((c) => {
                    c.feats = c.feats.filter((x) => x.uid !== cf.uid)
                    c.spells = c.spells.filter((s) => s.source !== `feat:${cf.uid}`)
                  })}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
            {!char.feats.length && <div className="text-sm text-muted">—</div>}
          </div>
        </Section>
        <Section
          title={t('features.custom')}
          actions={
            <button className="btn btn-sm" onClick={() => setAdding(true)}>
              <Plus size={13} /> {t('features.addCustom')}
            </button>
          }
        >
          <p className="text-xs text-muted">{t('features.customHint')}</p>
        </Section>
      </div>
      <SpecialAbilityEditor open={adding} onClose={() => setAdding(false)} initial={null} />
    </div>
  )
}

function FeatureCard({ f }: { f: DerivedFeature }) {
  const [open, setOpen] = useState(false)
  const { update } = useChar()
  return (
    <div className="overflow-hidden rounded-xl border border-line-soft bg-panel-2/40">
      <div className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-panel-2" onClick={() => setOpen(!open)}>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={14} className="text-muted" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] text-gold">{f.name}</span>
            {f.level !== undefined && <span className="chip py-0 text-[10px]">Lvl {f.level}</span>}
            {f.activation && f.activation !== 'passive' && <span className="chip py-0 text-[9px] uppercase">{f.activation}</span>}
          </div>
          {!open && <div className="truncate text-xs text-muted">{f.summary}</div>}
        </div>
        <span onClick={(e) => e.stopPropagation()}>
          <UsesTracker f={f} />
        </span>
        {f.uses && <span className="text-[10px] text-faint">{rechargeLabel(f.uses.recharge)}</span>}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-line-soft px-4 py-3">
              <Markdown text={f.description || f.summary} compact />
              <div className="mt-2 flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => openDndBeyond({ name: f.name })}>
                  <ExternalLink size={12} /> D&D Beyond
                </button>
                {f.sourceType === 'custom' && (
                  <button className="btn btn-ghost btn-sm btn-danger" onClick={() => update((c) => void (c.customFeatures = c.customFeatures.filter((x) => x.id !== f.id)))}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function rechargeLabel(r: Uses['recharge']): string {
  return { short: 'Short Rest', long: 'Long Rest', turn: 'Turn', dawn: 'Dawn', shortOrLong: 'Short/Long Rest' }[r] ?? r
}
