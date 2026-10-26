import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { ArrowLeft, ArrowRight, Check, CircleHelp, ExternalLink, PartyPopper, Plus, Sparkles, Wand2 } from 'lucide-react'
import type { SpellDef } from '../../types'
import type { PendingChoice } from '../../engine/compute'
import { Modal } from '../ui'
import { useChar } from './context'
import { ChoiceResolver } from './ChoiceResolver'
import { EntityPicker } from '../EntityPicker'
import { spellFilter } from '../../lib/spellFilter'
import { useSettings } from '../../store/settings'

/** Hvilken fane et uløst valg hører hjemme i */
export function tabForChoice(p: PendingChoice): string {
  if (p.area === 'spells') return 'spells'
  if (p.type === 'weaponMastery') return 'inventory'
  return 'features'
}

/**
 * Guide som tar deg gjennom alt som mangler, ett steg om gangen.
 * Hvert steg forklarer hva som skal velges og lar deg løse det direkte.
 */
export function FixGuide({
  open, onClose, startKey, onlyArea
}: {
  open: boolean
  onClose: () => void
  /** Start på dette valget */
  startKey?: string
  /** Begrens til spells ('spells') eller alt annet ('other') */
  onlyArea?: 'spells' | 'other'
}) {
  const { t } = useTranslation()
  const { char, derived, goTo } = useChar()
  const animations = useSettings((s) => s.animations)
  const all = derived.pending.filter((p) => !onlyArea || (onlyArea === 'spells' ? p.area === 'spells' : p.area !== 'spells'))
  // Rekkefølgen låses når guiden åpnes, så stegene ikke hopper rundt mens man velger
  const [order, setOrder] = useState<string[]>([])
  const [idx, setIdx] = useState(0)
  const [justDone, setJustDone] = useState<string | null>(null)
  const celebrated = useRef(false)

  useEffect(() => {
    if (!open) return
    const keys = sortKeys(all).map((p) => p.key)
    setOrder(keys)
    setIdx(Math.max(0, startKey ? keys.indexOf(startKey) : 0))
    celebrated.current = false
  }, [open])

  const pendingKeys = useMemo(() => new Set(all.map((p) => p.key)), [all])
  const steps = order.map((k) => derived.choices.find((c) => c.key === k) ?? all.find((c) => c.key === k)).filter((x): x is PendingChoice => !!x)
  const cur = steps[idx]
  const curDone = cur ? !pendingKeys.has(cur.key) : true
  const remaining = steps.filter((s) => pendingKeys.has(s.key)).length
  const allDone = open && order.length > 0 && remaining === 0

  // Gå automatisk videre når et steg blir løst
  useEffect(() => {
    if (!cur || !curDone || justDone === cur.key) return
    setJustDone(cur.key)
    const next = steps.findIndex((s, i) => i > idx && pendingKeys.has(s.key))
    const wrap = steps.findIndex((s) => pendingKeys.has(s.key))
    const target = next >= 0 ? next : wrap
    if (target >= 0) {
      const to = setTimeout(() => setIdx(target), 700)
      return () => clearTimeout(to)
    }
  }, [curDone, cur?.key])

  useEffect(() => {
    if (allDone && !celebrated.current) {
      celebrated.current = true
      if (animations) confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#f0cd7a', '#d6a84c', '#5fb37a', '#8b7cf0'] })
    }
  }, [allDone])

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={720}
      title={
        <span className="flex items-center gap-2">
          <Wand2 size={18} /> {t('guide.title')}
        </span>
      }
    >
      {allDone || !cur ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 text-center">
          <PartyPopper className="mx-auto mb-3 text-gold" size={44} />
          <div className="font-display text-2xl text-gold">{t('guide.allDone')}</div>
          <p className="mt-1 text-muted">{t('guide.allDoneText')}</p>
          <button className="btn btn-primary mt-5" onClick={onClose}>
            {t('common.done')}
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Fremdrift */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>{t('guide.step', { n: idx + 1, total: steps.length })}</span>
              <span>{t('guide.remaining', { n: remaining })}</span>
            </div>
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  title={s.label}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${!pendingKeys.has(s.key) ? 'bg-good' : i === idx ? 'bg-gold' : 'bg-line'}`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={cur.key} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-3">
              <div className="flex items-start gap-3">
                <motion.span
                  animate={curDone ? { scale: [1, 1.3, 1] } : {}}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${curDone ? 'bg-good text-white' : 'bg-gold/20 text-gold'}`}
                >
                  {curDone ? <Check size={16} /> : <span className="font-display">{idx + 1}</span>}
                </motion.span>
                <div className="min-w-0">
                  <div className="font-display text-xl text-gold">{cur.label}</div>
                  <div className="text-xs text-muted">
                    {t('guide.from')}: {cur.source}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 rounded-xl border border-sky/30 bg-sky/5 p-3 text-sm">
                <CircleHelp size={16} className="mt-0.5 shrink-0 text-sky" />
                <span>{explain(cur, t)}</span>
              </div>
              {curDone ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 rounded-xl border border-good/40 bg-good/10 p-3 text-good">
                  <Check size={16} /> {t('guide.stepDone')}
                </motion.div>
              ) : cur.area === 'spells' ? (
                <ClassSpellStep p={cur} />
              ) : (
                <ChoiceResolver p={cur} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-line-soft pt-3">
            <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
              <ArrowLeft size={14} /> {t('common.back')}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                onClose()
                goTo?.(tabForChoice(cur))
              }}
            >
              <ExternalLink size={13} /> {t('guide.showInTab')}
            </button>
            {idx < steps.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setIdx(idx + 1)}>
                {curDone ? t('common.next') : t('guide.skip')} <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onClose}>
                {t('common.done')}
              </button>
            )}
          </div>
        </div>
      )}
      {void char}
    </Modal>
  )
}

/** Logisk rekkefølge: class → origin → evner → feats → resten → spells */
function sortKeys(list: PendingChoice[]): PendingChoice[] {
  const rank = (p: PendingChoice): number => {
    if (p.type === 'subclass') return 0
    if (p.area === 'skills' && p.key.startsWith('class:')) return 1
    if (p.area === 'class') return 2
    if (p.area === 'background' || p.area === 'abilities') return 3
    if (p.area === 'species') return 4
    if (p.area === 'feats') return 5
    if (p.area === 'skills') return 6
    if (p.area === 'equipment') return 7
    if (p.area === 'spells') return 9
    return 8
  }
  return [...list].sort((a, b) => rank(a) - rank(b))
}

function explain(p: PendingChoice, t: (k: string, o?: Record<string, unknown>) => string): string {
  if (p.key === 'background:abilities') return t('guide.why.bgAbilities')
  if (p.key === 'background:feat') return t('guide.why.bgFeat')
  if (p.key === 'origin:languages#language') return t('guide.why.languages')
  if (p.key.startsWith('featability:')) return t('guide.why.featAbility')
  if (/^class:[^:]+:\d+$/.test(p.key)) return p.filter === 'epicBoon' ? t('guide.why.epicBoon') : t('guide.why.asi')
  if (p.key.endsWith(':cantrips')) return t('guide.why.cantrips', { n: p.count - p.chosen })
  if (p.key.endsWith(':prepared')) return t('guide.why.prepared', { n: p.count - p.chosen })
  const known = ['skill', 'expertise', 'tool', 'language', 'option', 'ability', 'subclass', 'speciesOption', 'feat', 'weaponMastery', 'spell', 'cantrip']
  return known.includes(p.type) ? t(`guide.why.${p.type}`, { n: p.count - p.chosen }) : t('guide.why.generic')
}

/** Velg cantrips/prepared spells for en class direkte i guiden */
function ClassSpellStep({ p }: { p: PendingChoice }) {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const [open, setOpen] = useState(false)
  const classId = p.key.split(':')[1]
  const cantrip = p.key.endsWith(':cantrips')
  const sc = derived.spellcasting.find((c) => c.classId === classId)
  const isC = (id: string): boolean => ((L.get('spell', id) as SpellDef | undefined)?.level ?? 0) === 0
  const current = char.spells.filter((s) => s.source === classId && isC(s.spellId) === cantrip && !s.alwaysPrepared).map((s) => s.spellId)
  const recommended = L.get('class', classId)?.recommended
  const recIds = new Set([...(recommended?.cantrips ?? []), ...(recommended?.spells ?? [])])
  return (
    <div className="space-y-2 rounded-xl border border-line-soft bg-panel-2/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">
          {cantrip ? t('spells.cantrips') : t('spells.prepared')}: <b>{p.chosen}</b> / {p.count}
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
          <Plus size={13} /> {cantrip ? t('spells.addCantrip') : t('spells.addSpell')}
        </button>
      </div>
      {recIds.size > 0 && (
        <div className="text-xs text-muted">
          <Sparkles size={12} className="mr-1 inline text-gold" />
          {t('guide.recommendedSpells')}:{' '}
          {[...recIds]
            .map((id) => L.get('spell', id))
            .filter((s): s is SpellDef => !!s && (s.level === 0) === cantrip)
            .map((s) => s.name)
            .join(', ') || '—'}
        </div>
      )}
      <EntityPicker
        open={open}
        onClose={() => setOpen(false)}
        kinds={['spell']}
        title={cantrip ? t('spells.addCantrip') : t('spells.addSpell')}
        multi
        selected={current}
        filter={(e) => spellFilter(sc?.spellList, { cantrip: cantrip ? true : false, maxLevel: cantrip ? 0 : sc?.maxSpellLevel })(e as SpellDef)}
        onConfirm={(ids) =>
          update((c) => {
            c.spells = c.spells.filter((s) => s.source !== classId || s.alwaysPrepared || isC(s.spellId) !== cantrip || ids.includes(s.spellId))
            for (const id of ids) if (!c.spells.some((s) => s.source === classId && s.spellId === id)) c.spells.push({ spellId: id, source: classId, prepared: true })
          })
        }
      />
    </div>
  )
}
