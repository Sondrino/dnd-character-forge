import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { useSettings } from '../store/settings'
import type { Source } from '../types'

export function Markdown({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div className={`prose-dnd ${compact ? 'compact' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Lenker åpnes aldri i appvinduet – bare http(s) via D&D Beyond-vinduet/nettleseren
          a: ({ href, children }) => (
            <a
              href={href}
              rel="noopener noreferrer"
              className="entity-link"
              onClick={(e) => {
                e.preventDefault()
                if (href && /^https?:\/\//i.test(href)) api.openDndBeyond(href, useSettings.getState().dndBeyondMode)
              }}
            >
              {children}
            </a>
          ),
          img: () => null
        }}
      >
        {text || ''}
      </ReactMarkdown>
    </div>
  )
}

export function Modal({
  open, onClose, title, children, width = 720, footer, dismissable = true, confirmClose
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  width?: number
  footer?: ReactNode
  /** false: klikk utenfor lukker ikke (for flerstegs-dialoger der man ellers mister fremdrift) */
  dismissable?: boolean
  /** Spør før lukking (X, Esc, klikk utenfor) med denne teksten. Knapper i footer kaller onClose direkte. */
  confirmClose?: string | false
}) {
  const { t } = useTranslation()
  const [asking, setAsking] = useState(false)
  useEffect(() => {
    if (!open) setAsking(false)
  }, [open])
  const requestClose = (): void => {
    if (confirmClose) setAsking(true)
    else onClose()
  }
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      if (asking) setAsking(false)
      else if (confirmClose) setAsking(true)
      else onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose, confirmClose, asking])
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={dismissable ? requestClose : undefined} />
          <motion.div
            className="panel relative flex max-h-[90vh] w-full flex-col overflow-hidden"
            style={{ maxWidth: width }}
            role="dialog"
            aria-modal="true"
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {title !== undefined && (
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
                <div className="font-display text-lg text-gold">{title}</div>
                <button className="btn btn-ghost btn-sm" onClick={requestClose} aria-label={t('polish.modal.close')} title={t('polish.modal.close')}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line-soft px-5 py-3">{footer}</div>}
            {asking && confirmClose && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 p-6" role="alertdialog">
                <div className="panel max-w-sm p-4 text-sm">
                  <p className="mb-3">{confirmClose}</p>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-sm" autoFocus onClick={() => setAsking(false)}>
                      {t('polish.modal.stay')}
                    </button>
                    <button
                      className="btn btn-sm border-bad/60 text-bad"
                      onClick={() => {
                        setAsking(false)
                        onClose()
                      }}
                    >
                      {t('polish.modal.closeAnyway')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Liten «⋯»-meny. Lukkes ved klikk utenfor, Esc eller valg. */
export function MenuButton({
  label, icon, items, className
}: {
  label: string
  icon: ReactNode
  items: { label: ReactNode; icon?: ReactNode; onClick: () => void; disabled?: boolean; title?: string }[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
      }
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button className={`btn ${className ?? ''}`} aria-haspopup="menu" aria-expanded={open} aria-label={label} title={label} onClick={() => setOpen(!open)}>
        {icon}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="panel absolute right-0 top-full z-50 mt-1 min-w-[200px] p-1 shadow-xl"
          >
            {items.map((it, i) => (
              <button
                key={i}
                role="menuitem"
                disabled={it.disabled}
                title={it.title}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm hover:bg-panel-3 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => {
                  setOpen(false)
                  it.onClick()
                }}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

/** Vanlige forkortelser for offisielle tilleggsbøker */
const BOOK_ABBR: Record<string, string> = {
  "Xanathar's Guide to Everything": 'XGE',
  'Xanathar’s Guide to Everything': 'XGE',
  "Tasha's Cauldron of Everything": 'TCE',
  'Tasha’s Cauldron of Everything': 'TCE',
  "Sword Coast Adventurer's Guide": 'SCAG',
  'Sword Coast Adventurer’s Guide': 'SCAG',
  "Fizban's Treasury of Dragons": 'Fizban’s',
  'Fizban’s Treasury of Dragons': 'Fizban’s',
  'Strixhaven: A Curriculum of Chaos': 'Strixhaven',
  "Explorer's Guide to Wildemount": 'Wildemount',
  'Explorer’s Guide to Wildemount': 'Wildemount',
  'Acquisitions Incorporated': 'Acq. Inc.',
  'Spelljammer: Adventures in Space': 'Spelljammer',
  'Dungeon Master’s Guide (2024)': 'DMG 2024',
  'Monster Manual (2025)': 'MM 2025',
  'Forgotten Realms: Heroes of Faerûn': 'Heroes of Faerûn',
  'Mordenkainen Presents: Monsters of the Multiverse': 'MPMM',
  "Player's Handbook (2014)": 'PHB 2014',
  'Player’s Handbook (2014)': 'PHB 2014'
}

export const PHB_BOOK = 'Player’s Handbook (2024)'

/**
 * Hvilken bok en entity kommer fra. SRD-innhold står også i kjernebøkene:
 * magic items i Dungeon Master’s Guide, creatures i Monster Manual, resten i Player’s Handbook.
 */
export function bookOf(e: { source: Source | string; sourceBook?: string; kind?: string }): string {
  if (e.sourceBook) return e.sourceBook
  if (e.source === 'SRD 5.2' || e.source === 'PHB 2024') {
    if (e.kind === 'magicItem') return 'Dungeon Master’s Guide (2024)'
    if (e.kind === 'creature') return 'Monster Manual (2025)'
    return PHB_BOOK
  }
  return e.source
}

/** Kort visningsnavn for en bok */
export function bookLabel(book: string): string {
  if (book === PHB_BOOK) return 'PHB 2024'
  return BOOK_ABBR[book] ?? book.split(' (')[0]
}

export function SourceBadge({ source, book }: { source: Source | string; book?: string }) {
  const cls =
    source === 'SRD 5.2'
      ? 'border-gold/40 text-gold'
      : source === 'Homebrew'
        ? 'border-arcane/50 text-arcane'
        : source === 'Third-party'
          ? 'border-good/40 text-good'
          : source === 'Supplement'
            ? 'border-crimson/40 text-crimson-2'
            : 'border-sky/40 text-sky'
  return (
    <span className={`chip ${cls}`} title={book}>
      {source === 'Third-party' && book ? book.split(' (')[0] : (source === 'Supplement' || source === 'PHB 2024') && book ? BOOK_ABBR[book] ?? book.slice(0, 22) : source}
    </span>
  )
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
