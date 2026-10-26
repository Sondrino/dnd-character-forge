import { useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Pencil, RotateCcw, Minus, Plus, X } from 'lucide-react'
import type { Character } from '../types'
import type { Stat } from '../engine/compute'
import { AnimatedNumber, Tip } from './ui'
import { useRolls } from '../store/rolls'
import { d20 } from '../dice'
import { CharCtx } from './sheet/context'

export function Breakdown({ stat }: { stat: Stat }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-0.5">
      {stat.breakdown.map((b, i) => (
        <div key={i} className={b.startsWith('Custom:') ? 'text-arcane' : ''}>
          {b.startsWith('Custom:') ? b.replace('Custom:', `${t('stat.custom')}:`) : b}
        </div>
      ))}
      {stat.advantage && stat.advantage.length > 0 && <div className="text-good">{t('stat.advantage')}: {stat.advantage.join(', ')}</div>}
      {stat.disadvantage && stat.disadvantage.length > 0 && <div className="text-bad">{t('stat.disadvantage')}: {stat.disadvantage.join(', ')}</div>}
      {stat.overridden && <div className="mt-1 text-gold">{t('stat.overridden', { v: stat.computed })}</div>}
    </div>
  )
}

/** Les/skriv justering og fast verdi for en nøkkel */
export function useStatEdit(okey: string, update: (r: (d: Character) => void) => void) {
  const ctx = useContext(CharCtx)
  const adjustment = ctx?.char.adjustments?.[okey] ?? 0
  const override = ctx?.char.overrides?.[okey]
  return {
    adjustment,
    override: typeof override === 'number' ? override : undefined,
    setAdjustment: (v: number) =>
      update((d) => {
        d.adjustments ??= {}
        if (!v) delete d.adjustments[okey]
        else d.adjustments[okey] = v
      }),
    setOverride: (v: number | undefined) =>
      update((d) => {
        if (v === undefined || !Number.isFinite(v)) delete d.overrides[okey]
        else d.overrides[okey] = v
      }),
    reset: () =>
      update((d) => {
        delete d.overrides[okey]
        if (d.adjustments) delete d.adjustments[okey]
      })
  }
}

/** Liten editor: egen justering (+/−) oppå utregningen, eller fast verdi */
export function StatEditor({
  stat, okey, update, anchor, onClose, label, signed = true
}: {
  stat: Stat
  okey: string
  update: (r: (d: Character) => void) => void
  anchor: DOMRect | null
  onClose: () => void
  label?: string
  signed?: boolean
}) {
  const { t } = useTranslation()
  const ed = useStatEdit(okey, update)
  const boxRef = useRef<HTMLDivElement>(null)
  const [fixed, setFixed] = useState(ed.override !== undefined ? String(ed.override) : '')
  useEffect(() => {
    if (anchor) setFixed(ed.override !== undefined ? String(ed.override) : '')
  }, [anchor])
  useEffect(() => {
    if (!anchor) return
    const h = (e: MouseEvent): void => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose()
    }
    const k = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    setTimeout(() => window.addEventListener('mousedown', h), 0)
    window.addEventListener('keydown', k)
    return () => {
      window.removeEventListener('mousedown', h)
      window.removeEventListener('keydown', k)
    }
  }, [anchor, onClose])
  const auto = stat.computed - ed.adjustment
  const fmt = (n: number): string => (signed && n >= 0 ? `+${n}` : String(n))
  const W = 280
  const left = anchor ? Math.min(window.innerWidth - W - 12, Math.max(12, anchor.left - 40)) : 0
  const below = anchor ? anchor.bottom + 260 < window.innerHeight : true
  return createPortal(
    <AnimatePresence>
      {anchor && (
        <motion.div
          ref={boxRef}
          className="panel fixed z-[90] p-4"
          style={{ left, width: W, top: below ? anchor.bottom + 6 : undefined, bottom: below ? undefined : window.innerHeight - anchor.top + 6 }}
          initial={{ opacity: 0, scale: 0.95, y: below ? -6 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-gold">{label ?? t('stat.editTitle')}</span>
            <button className="btn btn-ghost btn-sm px-1" onClick={onClose}>
              <X size={13} />
            </button>
          </div>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-panel-2 px-3 py-2 text-sm">
            <span className="text-muted">{t('stat.auto')}</span>
            <span className="font-display">{fmt(auto)}</span>
          </div>
          <label className="label">{t('stat.adjustment')}</label>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm px-2" onClick={() => ed.setAdjustment(ed.adjustment - 1)}>
              <Minus size={13} />
            </button>
            <AdjInput value={ed.adjustment} onChange={ed.setAdjustment} />
            <button className="btn btn-sm px-2" onClick={() => ed.setAdjustment(ed.adjustment + 1)}>
              <Plus size={13} />
            </button>
            <span className="ml-auto text-sm text-muted">=</span>
            <span className="font-display text-lg text-gold-2">{fmt(auto + ed.adjustment)}</span>
          </div>
          <p className="mt-1 text-[11px] text-faint">{t('stat.adjustmentHint')}</p>
          <div className="divider my-3" />
          <label className="label">{t('stat.fixed')}</label>
          <div className="flex gap-2">
            <input
              className="input py-1"
              placeholder={t('stat.fixedPlaceholder')}
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
              onBlur={() => ed.setOverride(fixed.trim() === '' ? undefined : parseInt(fixed, 10))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ed.setOverride(fixed.trim() === '' ? undefined : parseInt(fixed, 10))
              }}
            />
          </div>
          <p className="mt-1 text-[11px] text-faint">{t('stat.fixedHint')}</p>
          {(ed.adjustment !== 0 || ed.override !== undefined) && (
            <button
              className="btn btn-sm mt-3 w-full justify-center"
              onClick={() => {
                ed.reset()
                setFixed('')
              }}
            >
              <RotateCcw size={12} /> {t('stat.resetAll')}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * Viser en beregnet verdi som kan:
 *  – rulles (klikk), – justeres eller overstyres (blyant), – tilbakestilles.
 */
export function StatValue({
  stat, okey, update, signed = true, rollLabel, className, rollable = true, characterName
}: {
  stat: Stat
  okey: string
  update: (r: (d: Character) => void) => void
  signed?: boolean
  rollLabel?: string
  className?: string
  rollable?: boolean
  characterName?: string
}) {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const roll = useRolls((s) => s.roll)
  const ctx = useContext(CharCtx)
  const adjusted = !!ctx?.char.adjustments?.[okey]
  const mode = stat.advantage?.length && !stat.disadvantage?.length ? 'advantage' : stat.disadvantage?.length && !stat.advantage?.length ? 'disadvantage' : undefined
  const custom = stat.overridden || adjusted
  return (
    <span ref={ref} className={`group/stat relative inline-flex items-center gap-1 ${className ?? ''}`}>
      <Tip content={<Breakdown stat={stat} />}>
        <button
          className={`rounded-md px-1 transition-colors ${rollable ? 'cursor-pointer hover:bg-gold/15 hover:text-gold-2' : 'cursor-default'} ${stat.overridden ? 'text-gold-2 underline decoration-dotted' : adjusted ? 'text-arcane' : ''}`}
          onClick={() => {
            if (rollable) roll(d20(stat.value), rollLabel ?? okey, { mode: useRolls.getState().mode !== 'normal' ? undefined : mode, character: characterName })
            else setAnchor(ref.current!.getBoundingClientRect())
          }}
        >
          <AnimatedNumber value={stat.value} signed={signed} />
        </button>
      </Tip>
      <button
        className={`absolute -right-5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-panel-3 ${custom ? 'flex text-arcane' : 'hidden text-faint hover:text-ink group-hover/stat:flex'}`}
        title={t('stat.edit')}
        onClick={(e) => {
          e.stopPropagation()
          setAnchor(ref.current!.getBoundingClientRect())
        }}
      >
        <Pencil size={11} />
      </button>
      <StatEditor stat={stat} okey={okey} update={update} anchor={anchor} onClose={() => setAnchor(null)} label={rollLabel} signed={signed} />
    </span>
  )
}

/** Stor boks (AC, Initiative, Speed …) */
export function BigStat({
  label, children, sub, icon, className
}: {
  label: string
  children: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-xl border border-line-soft bg-panel-2 px-3 py-2 text-center ${className ?? ''}`}>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        {icon}
        {label}
      </div>
      <div className="font-display text-2xl font-bold leading-tight">{children}</div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  )
}

/** Tallfelt for justering: godtar «+2», «-1», «3» – lagres ved Enter/blur */
export function AdjInput({ value, onChange, className }: { value: number; onChange: (v: number) => void; className?: string }) {
  const show = (n: number): string => (n > 0 ? `+${n}` : String(n))
  const [text, setText] = useState(show(value))
  useEffect(() => setText(show(value)), [value])
  const commit = (): void => {
    const n = parseInt(text.replace('+', ''), 10)
    onChange(Number.isFinite(n) ? n : 0)
    if (!Number.isFinite(n)) setText('0')
  }
  return (
    <input
      className={`input w-16 py-1 text-center font-display ${value ? 'border-arcane/60 text-arcane' : ''} ${className ?? ''}`}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'ArrowUp') onChange(value + 1)
        if (e.key === 'ArrowDown') onChange(value - 1)
      }}
    />
  )
}
