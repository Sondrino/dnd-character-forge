import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, GripVertical } from 'lucide-react'
import type { Combatant } from '../../types'
import { editCombatant, moveCombatant, setInitiative, shiftCombatant, type CombatantPatch, type TurnState } from '../../lib/combat'
import { useSettings } from '../../store/settings'
import { ConditionGrid } from './ConditionChips'

/** Endre initiativlista: kampmodus og gruppemodus sender inn hver sin lagring */
export type MutTurn = (recipe: (e: TurnState) => void) => void

const DRAG_TYPE = 'application/x-combatant'
/** Klikk på disse åpner ikke redigeringen (de har sin egen funksjon) */
const INTERACTIVE = 'button, input, select, textarea, a, label, .entity-link, [data-no-toggle]'

/**
 * Én rad i initiativlista: gløder når det er raden sin tur, kan dras med håndtaket,
 * og et klikk på raden åpner redigering med flytting, navn, HP, AC og conditions.
 */
export function TurnRow({ x, isCur, mutT, editor, children }: { x: Combatant; isCur: boolean; mutT: MutTurn; editor?: ReactNode; children: ReactNode }) {
  const { t } = useTranslation()
  const animations = useSettings((s) => s.animations)
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState<'before' | 'after' | null>(null)
  const row = useRef<HTMLDivElement>(null)
  const placeAt = (clientY: number): 'before' | 'after' => {
    const r = row.current?.getBoundingClientRect()
    return r && clientY > r.top + r.height / 2 ? 'after' : 'before'
  }
  return (
    <motion.div
      ref={row}
      layout="position"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: x.defeated ? 0.45 : 1, x: 0 }}
      data-turn-row={x.uid}
      data-current={isCur || undefined}
      title={editor ? t('tools.initEdit.rowTip') : undefined}
      aria-current={isCur ? 'true' : undefined}
      className={`relative flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-2 py-1.5 text-sm ${editor ? 'cursor-pointer' : ''} ${isCur ? `turn-now ${animations ? '' : 'turn-now-still'}` : 'border-line-soft hover:border-gold/40'}`}
      onClick={(ev) => {
        // Klikk fra popups (portaler) bobler også hit, men hører ikke til raden
        if (editor && ev.currentTarget.contains(ev.target as Node) && !(ev.target as HTMLElement).closest(INTERACTIVE)) setOpen(!open)
      }}
      onDragOver={(ev) => {
        if (!ev.dataTransfer.types.includes(DRAG_TYPE)) return
        ev.preventDefault()
        setDrop(placeAt(ev.clientY))
      }}
      onDragLeave={() => setDrop(null)}
      onDrop={(ev) => {
        const uid = ev.dataTransfer.getData(DRAG_TYPE)
        const place = placeAt(ev.clientY)
        setDrop(null)
        if (uid) mutT((e) => moveCombatant(e, uid, x.uid, place))
      }}
    >
      {drop && <span className={`pointer-events-none absolute inset-x-1 h-0.5 rounded bg-gold ${drop === 'before' ? '-top-1' : '-bottom-1'}`} />}
      <span
        draggable
        data-no-toggle
        className="cursor-grab text-faint hover:text-ink active:cursor-grabbing"
        title={t('tools.initEdit.dragTip')}
        onDragStart={(ev) => {
          ev.dataTransfer.setData(DRAG_TYPE, x.uid)
          ev.dataTransfer.effectAllowed = 'move'
          if (row.current) ev.dataTransfer.setDragImage(row.current, 12, 12)
        }}
      >
        <GripVertical size={14} />
      </span>
      {editor && (
        <button className="text-faint hover:text-ink" title={t('tools.initEdit.rowTip')} aria-label={t('tools.initEdit.rowTip')} aria-expanded={open} onClick={() => setOpen(!open)}>
          <ChevronDown size={14} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
      )}
      {children}
      {open && editor && (
        <div data-no-toggle className="w-full cursor-default">
          {editor}
        </div>
      )}
    </motion.div>
  )
}

/** Tekstfelt som først lagrer på Enter/blur. onCommit kan returnere false for å forkaste verdien. */
function CommitInput({ value, onCommit, className, ...rest }: { value: string; onCommit: (v: string) => boolean | void; className?: string; placeholder?: string; title?: string; 'aria-label'?: string }) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  const commit = (): void => {
    if (v !== value && onCommit(v) === false) setV(value)
  }
  return <input {...rest} className={`input ${className ?? ''}`} value={v} onChange={(ev) => setV(ev.target.value)} onBlur={commit} onKeyDown={(ev) => ev.key === 'Enter' && commit()} />
}

/** Initiativ-feltet: lagrer når du er ferdig å skrive, og beholder hvem sin tur det er */
export function InitInput({ x, mutT }: { x: Combatant; mutT: MutTurn }) {
  const { t } = useTranslation()
  return (
    <CommitInput
      className="w-12 px-1 text-center font-display"
      aria-label={t('combat.initiative')}
      value={String(x.init)}
      onCommit={(v) => {
        const n = parseInt(v, 10)
        if (!Number.isFinite(n)) return false
        mutT((e) => setInitiative(e, x.uid, n))
      }}
    />
  )
}

/** Tomt felt = null (fjern verdien); ugyldig tekst forkastes */
function numberField(apply: (n: number | null) => void): (v: string) => boolean | void {
  return (v) => {
    if (!v.trim()) return apply(null)
    const n = parseInt(v, 10)
    if (!Number.isFinite(n)) return false
    apply(n)
  }
}

/**
 * Innholdet når en rad er åpen. `editable` er av for ekte karakterer: navn, HP og AC hører til karakterarket,
 * men de kan fortsatt flyttes og få conditions.
 */
export function CombatantEditor({
  x, index, total, mutT, editable, conditions, onToggleCondition
}: {
  x: Combatant
  index: number
  total: number
  mutT: MutTurn
  editable: boolean
  conditions: string[]
  onToggleCondition: (id: string) => void
}) {
  const { t } = useTranslation()
  const patch = (p: CombatantPatch): void =>
    mutT((e) => {
      const y = e.combatants.find((z) => z.uid === x.uid)
      if (y) editCombatant(y, p)
    })
  const shift = (to: 'up' | 'down' | 'top' | 'bottom'): void => mutT((e) => shiftCombatant(e, x.uid, to))
  const first = index <= 0
  const last = index >= total - 1
  return (
    <div className="mt-1 space-y-2 rounded-lg border border-line-soft bg-panel-2/60 p-2 text-xs">
      {editable ? (
        <div className="flex flex-wrap items-center gap-2 text-muted">
          <label className="flex items-center gap-1">
            {t('combat.name')}
            <CommitInput className="w-32 py-0.5" value={x.name} onCommit={(v) => (v.trim() ? patch({ name: v }) : false)} />
          </label>
          <label className="flex items-center gap-1">
            AC
            <CommitInput className="w-11 px-1 py-0.5 text-center" value={x.ac === undefined ? '' : String(x.ac)} onCommit={numberField((n) => patch({ ac: n }))} />
          </label>
          <label className="flex items-center gap-1">
            HP
            <CommitInput className="w-11 px-1 py-0.5 text-center" value={x.hp === undefined ? '' : String(x.hp)} onCommit={numberField((n) => patch({ hp: n }))} />
          </label>
          <label className="flex items-center gap-1">
            {t('tools.companions.maxHp')}
            <CommitInput className="w-11 px-1 py-0.5 text-center" value={x.maxHp === undefined ? '' : String(x.maxHp)} onCommit={numberField((n) => patch({ maxHp: n }))} />
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="checkbox" checked={!!x.ally} onChange={(ev) => patch({ ally: ev.target.checked })} /> {t('combat.ally')}
          </label>
        </div>
      ) : (
        <p className="text-muted">{t('tools.initEdit.linked')}</p>
      )}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-muted">{t('tools.initEdit.move')}</span>
        <button className="btn btn-sm px-1.5" disabled={first} onClick={() => shift('top')}>
          <ChevronsUp size={12} /> {t('tools.initEdit.top')}
        </button>
        <button className="btn btn-sm px-1.5" disabled={first} title={t('tools.initEdit.up')} aria-label={t('tools.initEdit.up')} onClick={() => shift('up')}>
          <ChevronUp size={12} />
        </button>
        <button className="btn btn-sm px-1.5" disabled={last} title={t('tools.initEdit.down')} aria-label={t('tools.initEdit.down')} onClick={() => shift('down')}>
          <ChevronDown size={12} />
        </button>
        <button className="btn btn-sm px-1.5" disabled={last} onClick={() => shift('bottom')}>
          <ChevronsDown size={12} /> {t('tools.initEdit.bottom')}
        </button>
      </div>
      <div>
        <div className="mb-1 text-muted">{t('party.conditions')}</div>
        <ConditionGrid value={conditions} onToggle={onToggleCondition} />
      </div>
    </div>
  )
}
