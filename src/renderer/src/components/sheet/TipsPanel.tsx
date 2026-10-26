import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightbulb, AlertTriangle, ListTodo, Info, ChevronRight, X } from 'lucide-react'
import { useChar } from './context'
import { computeTips, type Tip } from '../../engine/tips'
import { useSettings } from '../../store/settings'
import { EntityLink } from '../EntityInfo'

const ICON = {
  warning: <AlertTriangle size={14} className="text-bad" />,
  todo: <ListTodo size={14} className="text-gold" />,
  suggestion: <Lightbulb size={14} className="text-gold-2" />,
  info: <Info size={14} className="text-sky" />
}
const AREA_TAB: Record<string, string> = { spells: 'spells', equipment: 'inventory', feats: 'features', class: 'features', species: 'features', background: 'features', skills: 'features', abilities: 'build', details: 'details' }

export function TipsPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { char, derived, lookup, goTo, openGuide } = useChar()
  const lang = useSettings((s) => s.language)
  const tips = useMemo(() => computeTips(char, derived, lookup, lang), [char, derived, lookup, lang])
  const [filter, setFilter] = useState<Tip['level'] | 'all'>('all')
  const [dismissed, setDismissed] = useState<string[]>([])
  const order: Tip['level'][] = ['warning', 'todo', 'suggestion', 'info']
  const shown = tips.filter((x) => !dismissed.includes(x.id) && (filter === 'all' || x.level === filter)).sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))
  const count = (l: Tip['level']): number => tips.filter((x) => x.level === l && !dismissed.includes(x.id)).length
  return (
    <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} className="panel sticky top-4 flex max-h-[calc(100vh-180px)] w-[320px] shrink-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <span className="flex items-center gap-2 font-display text-gold">
          <Lightbulb size={16} /> {t('tips.title')}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-1 border-b border-line-soft px-3 py-2">
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>
          {t('common.all')}
        </button>
        {order.map((l) => (
          <button key={l} className={`btn btn-sm ${filter === l ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(l)} title={t(`tips.${l}`)}>
            {ICON[l]} {count(l)}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {shown.map((tip, i) => (
            <motion.div
              key={tip.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i, 10) * 0.03 } }}
              exit={{ opacity: 0, x: 30, height: 0 }}
              className={`group rounded-xl border p-3 ${tip.level === 'warning' ? 'border-bad/40 bg-bad/5' : tip.level === 'todo' ? 'border-gold/40 bg-gold/5' : 'border-line-soft bg-panel-2/50'}`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{ICON[tip.level]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium leading-snug">{tip.title}</div>
                  {tip.text && <div className="mt-0.5 text-xs leading-relaxed text-muted">{tip.text}</div>}
                  {tip.links && tip.links.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                      {tip.links.map((l) => (
                        <span key={l.id} className="chip">
                          <EntityLink kind={l.kind as never} id={l.id}>
                            {l.name}
                          </EntityLink>
                        </span>
                      ))}
                    </div>
                  )}
                  {tip.area && AREA_TAB[tip.area] && (
                    <button
                      className="mt-1.5 flex items-center gap-0.5 text-[11px] text-gold hover:underline"
                      onClick={() => (tip.id.startsWith('pending:') && openGuide ? openGuide(tip.id.slice(8)) : goTo?.(AREA_TAB[tip.area!]))}
                    >
                      {t('tips.fix')} <ChevronRight size={11} />
                    </button>
                  )}
                </div>
                {tip.level !== 'warning' && tip.level !== 'todo' && (
                  <button className="opacity-0 transition-opacity group-hover:opacity-100" onClick={() => setDismissed((d) => [...d, tip.id])}>
                    <X size={12} className="text-faint" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!shown.length && <div className="py-8 text-center text-sm text-muted">{t('tips.none')}</div>}
      </div>
    </motion.aside>
  )
}
