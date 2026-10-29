import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { useLookup } from '../../store/ui'

/**
 * Conditions som chips (klikk for å fjerne) + en «+»-knapp som åpner en popover med alle conditions.
 * Brukes per deltaker i initiativlista og på kortene i gruppemodus.
 */
export function ConditionChips({ value, onToggle, className }: { value: string[]; onToggle: (id: string) => void; className?: string }) {
  const { t } = useTranslation()
  const L = useLookup()
  const conds = L.all('condition').filter((x) => x.id !== 'exhaustion')
  const name = (id: string): string => L.get('condition', id)?.name ?? id
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pos) return
    const close = (e: MouseEvent): void => {
      const el = e.target as Node
      if (pop.current?.contains(el) || btn.current?.contains(el)) return
      setPos(null)
    }
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setPos(null)
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', esc)
    }
  }, [pos])

  const open = (): void => {
    if (pos) return setPos(null)
    const r = btn.current?.getBoundingClientRect()
    if (!r) return
    // Hold popoveren innenfor vinduet
    const w = 300
    setPos({ x: Math.max(8, Math.min(window.innerWidth - w - 8, r.left)), y: Math.min(r.bottom + 6, window.innerHeight - 220) })
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className ?? ''}`}>
      <AnimatePresence initial={false}>
        {value.map((id) => (
          <motion.button
            key={id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="chip cursor-pointer border-crimson bg-crimson/20 px-1.5 py-0 text-[11px] text-crimson-2 hover:bg-crimson/30"
            title={`${L.get('condition', id)?.summary ?? ''}\n${t('party.removeCondition')}`.trim()}
            onClick={() => onToggle(id)}
          >
            {name(id)} <X size={10} />
          </motion.button>
        ))}
      </AnimatePresence>
      <button ref={btn} className="chip cursor-pointer px-1.5 py-0 text-[11px] text-muted hover:text-ink" title={t('party.addCondition')} onClick={open}>
        <Plus size={10} /> {value.length ? '' : t('party.condition')}
      </button>
      {createPortal(
        <AnimatePresence>
          {pos && (
            <motion.div
              ref={pop}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="panel fixed z-[80] w-[300px] p-2 shadow-xl"
              style={{ left: pos.x, top: pos.y }}
            >
              <div className="panel-title mb-1.5">{t('party.conditions')}</div>
              <div className="flex flex-wrap gap-1">
                {conds.map((x) => {
                  const on = value.includes(x.id)
                  return (
                    <button
                      key={x.id}
                      title={x.summary}
                      className={`chip cursor-pointer text-[11px] ${on ? 'border-crimson bg-crimson/20 text-crimson-2' : ''}`}
                      onClick={() => onToggle(x.id)}
                    >
                      {x.name}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
