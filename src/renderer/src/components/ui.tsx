import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X } from 'lucide-react'
import type { Source } from '../types'

export function Markdown({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div className={`prose-dnd ${compact ? 'compact' : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ''}</ReactMarkdown>
    </div>
  )
}

export function Modal({
  open, onClose, title, children, width = 720, footer
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  width?: number
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            className="panel relative flex max-h-[90vh] w-full flex-col overflow-hidden"
            style={{ maxWidth: width }}
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
                <div className="font-display text-lg text-gold">{title}</div>
                <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Lukk">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line-soft px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Tall som «popper» når verdien endres */
export function AnimatedNumber({ value, className, signed }: { value: number | string; className?: string; signed?: boolean }) {
  const display = typeof value === 'number' && signed ? (value >= 0 ? `+${value}` : `${value}`) : String(value)
  const prev = useRef(value)
  const dir = typeof value === 'number' && typeof prev.current === 'number' ? Math.sign(value - prev.current) : 0
  useEffect(() => {
    prev.current = value
  }, [value])
  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          className="inline-block"
          initial={{ y: dir >= 0 ? 10 : -10, opacity: 0, scale: 1.25 }}
          animate={{ y: 0, opacity: 1, scale: 1, color: undefined }}
          exit={{ y: dir >= 0 ? -10 : 10, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Tabs<T extends string>({
  tabs, value, onChange, className, onBadgeClick, badgeTitle
}: {
  tabs: { id: T; label: ReactNode; badge?: number }[]
  value: T
  onChange: (v: T) => void
  className?: string
  /** Klikk på den røde tellen (f.eks. åpne guiden for det som mangler) */
  onBadgeClick?: (id: T) => void
  badgeTitle?: string
}) {
  return (
    <div className={`flex gap-1 rounded-xl border border-line-soft bg-bg-2 p-1 ${className ?? ''}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors ${value === t.id ? 'text-[#1d1408]' : 'text-muted hover:text-ink'}`}
        >
          {value === t.id && (
            <motion.span
              layoutId={`tab-${tabs.map((x) => x.id).join('')}`}
              className="absolute inset-0 rounded-lg bg-gradient-to-b from-gold-2 to-gold"
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {t.label}
            {!!t.badge && (
              <motion.span
                title={badgeTitle}
                whileHover={{ scale: 1.25 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
                onClick={(e) => {
                  if (!onBadgeClick) return
                  e.stopPropagation()
                  onBadgeClick(t.id)
                }}
                className={`rounded-full bg-crimson px-1.5 text-[10px] font-bold leading-4 text-white ${onBadgeClick ? 'cursor-help ring-2 ring-crimson/30' : ''}`}
              >
                {t.badge}
              </motion.span>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

export function SourceBadge({ source }: { source: Source | string }) {
  const cls =
    source === 'SRD 5.2'
      ? 'border-gold/40 text-gold'
      : source === 'Homebrew'
        ? 'border-arcane/50 text-arcane'
        : 'border-sky/40 text-sky'
  return <span className={`chip ${cls}`}>{source}</span>
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2">
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full border transition-colors ${checked ? 'border-gold bg-gold/80' : 'border-line bg-panel-3'}`}
      >
        <motion.span
          className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow"
          animate={{ left: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        />
      </span>
      {label && <span onClick={() => onChange(!checked)}>{label}</span>}
    </label>
  )
}

export function NumberInput({
  value, onChange, min, max, className, width = 64
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
  width?: number
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = (s: string): void => {
    let n = parseInt(s, 10)
    if (!Number.isFinite(n)) n = value
    if (min !== undefined) n = Math.max(min, n)
    if (max !== undefined) n = Math.min(max, n)
    onChange(n)
    setText(String(n))
  }
  return (
    <input
      className={`input text-center ${className ?? ''}`}
      style={{ width }}
      value={text}
      inputMode="numeric"
      onChange={(e) => setText(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
        if (e.key === 'ArrowUp') commit(String(value + 1))
        if (e.key === 'ArrowDown') commit(String(value - 1))
      }}
    />
  )
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {icon && <div className="text-faint">{icon}</div>}
      <div className="font-display text-gold">{title}</div>
      {text && <div className="max-w-md text-muted">{text}</div>}
      {action}
    </div>
  )
}

/** Liten tooltip ved hover */
export function Tip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  return (
    <span
      ref={ref}
      className="inline-flex"
      onMouseEnter={() => {
        const r = ref.current?.getBoundingClientRect()
        if (r) setPos({ x: r.left + r.width / 2, y: r.top })
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {pos &&
        content &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none fixed z-[90] max-w-xs -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-ink shadow-xl"
            style={{ left: pos.x, top: pos.y - 8 }}
          >
            {content}
          </motion.div>,
          document.body
        )}
    </span>
  )
}

export function Section({ title, children, actions, className }: { title: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`panel p-4 ${className ?? ''}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="panel-title">{title}</h3>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      {children}
    </section>
  )
}
