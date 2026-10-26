import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { Dices, Trash2, X, ChevronsUp, ChevronsDown } from 'lucide-react'
import { useRolls } from '../store/rolls'
import { useSettings } from '../store/settings'
import { isValidNotation, type RollResult } from '../dice'

/* ------------------------------------------------------------------ */
/* Terningform (SVG) per antall sider                                  */
/* ------------------------------------------------------------------ */

export function DieShape({ sides, size = 40, value, highlight, dim }: { sides: number; size?: number; value?: number | string; highlight?: 'crit' | 'fumble'; dim?: boolean }) {
  const shapes: Record<number, string> = {
    4: '50,6 94,88 6,88',
    6: '12,12 88,12 88,88 12,88',
    8: '50,4 94,50 50,96 6,50',
    10: '50,4 92,40 76,92 24,92 8,40',
    12: '50,4 90,30 90,72 50,96 10,72 10,30',
    20: '50,3 93,27 93,73 50,97 7,73 7,27',
    100: '50,4 92,40 76,92 24,92 8,40'
  }
  const pts = shapes[sides] ?? shapes[20]
  const color = highlight === 'crit' ? 'var(--gold-2)' : highlight === 'fumble' ? 'var(--crimson)' : 'var(--gold)'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: dim ? 0.35 : 1 }}>
      <polygon points={pts} fill="var(--panel-3)" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      {sides === 20 && <path d="M50,3 L30,62 L70,62 Z M30,62 L7,73 M70,62 L93,73 M30,62 L50,97 L70,62" fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={2} />}
      {value !== undefined && (
        <text x="50" y={sides === 4 ? 70 : 58} textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontWeight={700} fontSize={String(value).length > 2 ? 26 : 34} fill="var(--ink)">
          {value}
        </text>
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Animert resultat (toast) som vises ved hvert kast                   */
/* ------------------------------------------------------------------ */

export function RollToast() {
  const { t } = useTranslation()
  const current = useRolls((s) => s.current)
  const seq = useRolls((s) => s.seq)
  const dismiss = useRolls((s) => s.dismiss)
  const animations = useSettings((s) => s.animations)
  const sound = useSettings((s) => s.diceSound)
  const [phase, setPhase] = useState<'rolling' | 'done'>('done')
  const [flicker, setFlicker] = useState(1)

  useEffect(() => {
    if (!current) return
    setPhase(animations ? 'rolling' : 'done')
    if (sound) playClack()
    const sides = current.terms.find((x) => x.dice.length)?.dice[0]?.sides ?? 20
    const iv = setInterval(() => setFlicker(1 + Math.floor(Math.random() * sides)), 55)
    const to = setTimeout(
      () => {
        clearInterval(iv)
        setPhase('done')
        if (current.crit && animations) {
          confetti({ particleCount: 140, spread: 80, origin: { x: 0.85, y: 0.85 }, colors: ['#f0cd7a', '#d6a84c', '#ffffff', '#c0392b'] })
        }
      },
      animations ? 650 : 0
    )
    const hide = setTimeout(dismiss, 6500)
    return () => {
      clearInterval(iv)
      clearTimeout(to)
      clearTimeout(hide)
    }
  }, [seq])

  const firstSides = current?.terms.find((x) => x.dice.length)?.dice[0]?.sides ?? 20
  return (
    <div className="pointer-events-none fixed bottom-24 right-6 z-[85] flex flex-col items-end">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            className={`panel pointer-events-auto w-[300px] overflow-hidden ${current.crit && phase === 'done' ? 'glow' : ''}`}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <div className="flex items-center gap-4 p-4">
              <motion.div
                animate={phase === 'rolling' ? { rotate: [0, 120, 260, 360], scale: [1, 1.15, 0.95, 1], x: [0, -6, 6, 0] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                <DieShape
                  sides={firstSides}
                  size={64}
                  value={phase === 'rolling' ? flicker : current.natural ?? current.total}
                  highlight={phase === 'done' ? (current.crit ? 'crit' : current.fumble ? 'fumble' : undefined) : undefined}
                />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-muted">{current.label}</div>
                <motion.div
                  key={phase}
                  initial={{ scale: phase === 'done' ? 1.5 : 1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`font-display text-4xl font-bold ${current.crit ? 'text-gold-2' : current.fumble ? 'text-crimson-2' : 'text-ink'}`}
                >
                  {phase === 'rolling' ? '…' : current.total}
                </motion.div>
                {phase === 'done' && (
                  <div className="text-xs text-muted">
                    <RollBreakdown r={current} />
                  </div>
                )}
              </div>
              <button className="btn btn-ghost btn-sm self-start" onClick={dismiss}>
                <X size={14} />
              </button>
            </div>
            {phase === 'done' && (current.crit || current.fumble) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 pb-3 font-display text-sm tracking-widest ${current.crit ? 'text-gold-2' : 'text-crimson-2'}`}
              >
                {current.crit ? t('dice.nat20') : t('dice.nat1')}
              </motion.div>
            )}
            {current.mode !== 'normal' && <div className="bg-panel-2 px-4 py-1 text-[11px] text-muted">{current.mode === 'advantage' ? t('dice.advantage') : t('dice.disadvantage')}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RollBreakdown({ r }: { r: RollResult }) {
  return (
    <span>
      {r.terms.map((term, i) => (
        <span key={i}>
          {i > 0 && (term.sign < 0 ? ' − ' : ' + ')}
          {term.dice.length > 0 ? (
            <>
              [
              {term.dice.map((d, j) => (
                <span key={j} className={d.kept ? (d.sides === 20 && d.value === 20 ? 'text-gold-2' : d.sides === 20 && d.value === 1 ? 'text-crimson-2' : '') : 'line-through opacity-50'}>
                  {j > 0 && ', '}
                  {d.value}
                </span>
              ))}
              ]
            </>
          ) : (
            term.constant
          )}
        </span>
      ))}
    </span>
  )
}

let audioCtx: AudioContext | null = null
function playClack(): void {
  try {
    audioCtx ??= new AudioContext()
    const ctx = audioCtx
    const now = ctx.currentTime
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 900 + Math.random() * 900
      g.gain.setValueAtTime(0.0001, now + i * 0.09)
      g.gain.exponentialRampToValueAtTime(0.12, now + i * 0.09 + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.06)
      osc.connect(g).connect(ctx.destination)
      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + 0.07)
    }
  } catch {
    /* lyd ikke tilgjengelig */
  }
}

/* ------------------------------------------------------------------ */
/* Terningbrett                                                        */
/* ------------------------------------------------------------------ */

export function DiceTray() {
  const { t } = useTranslation()
  const open = useRolls((s) => s.trayOpen)
  const setOpen = useRolls((s) => s.setTray)
  const log = useRolls((s) => s.log)
  const roll = useRolls((s) => s.roll)
  const clear = useRolls((s) => s.clear)
  const mode = useRolls((s) => s.mode)
  const setMode = useRolls((s) => s.setMode)
  const [pool, setPool] = useState<Record<number, number>>({})
  const [mod, setMod] = useState(0)
  const [custom, setCustom] = useState('')

  const poolNotation = Object.entries(pool)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n}d${s}`)
    .join('+')
  const notation = poolNotation ? `${poolNotation}${mod ? (mod > 0 ? `+${mod}` : mod) : ''}` : ''

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-[86] flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-gradient-to-b from-gold-2 to-gold text-[#1d1408] shadow-xl"
        whileHover={{ rotate: 20, scale: 1.08 }}
        whileTap={{ scale: 0.9, rotate: 180 }}
        onClick={() => setOpen(!open)}
        title={t('dice.tray')}
      >
        <Dices size={26} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="panel fixed bottom-24 right-6 z-[84] flex max-h-[70vh] w-[360px] flex-col overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
              <span className="font-display text-gold">{t('dice.tray')}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-7 gap-1">
                {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.85, rotate: 30 }}
                    className="relative flex flex-col items-center rounded-lg py-1 hover:bg-panel-2"
                    onClick={() => setPool((p) => ({ ...p, [s]: (p[s] ?? 0) + 1 }))}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setPool((p) => ({ ...p, [s]: Math.max(0, (p[s] ?? 0) - 1) }))
                    }}
                    title={t('dice.addHint')}
                  >
                    <DieShape sides={s} size={34} />
                    <span className="text-[10px] text-muted">d{s === 100 ? '%' : s}</span>
                    {!!pool[s] && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-crimson px-1.5 text-[10px] font-bold text-white">{pool[s]}</span>}
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={() => setMod(mod - 1)}>
                  −
                </button>
                <span className="w-10 text-center font-display">{mod >= 0 ? `+${mod}` : mod}</span>
                <button className="btn btn-sm" onClick={() => setMod(mod + 1)}>
                  +
                </button>
                <div className="ml-auto flex gap-1">
                  <button className={`btn btn-sm ${mode === 'advantage' ? 'btn-primary' : ''}`} onClick={() => setMode(mode === 'advantage' ? 'normal' : 'advantage')} title={t('dice.advantage')}>
                    <ChevronsUp size={13} /> ADV
                  </button>
                  <button className={`btn btn-sm ${mode === 'disadvantage' ? 'btn-primary' : ''}`} onClick={() => setMode(mode === 'disadvantage' ? 'normal' : 'disadvantage')} title={t('dice.disadvantage')}>
                    <ChevronsDown size={13} /> DIS
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1 justify-center"
                  disabled={!notation}
                  onClick={() => {
                    roll(notation, notation)
                    setPool({})
                    setMod(0)
                  }}
                >
                  <Dices size={15} /> {notation ? t('dice.rollX', { x: notation }) : t('dice.pick')}
                </button>
                {notation && (
                  <button className="btn" onClick={() => (setPool({}), setMod(0))}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (isValidNotation(custom)) roll(custom, custom)
                }}
              >
                <input className={`input ${custom && !isValidNotation(custom) ? 'border-bad' : ''}`} placeholder="2d6+3, 4d6kh3, 1d20 adv" value={custom} onChange={(e) => setCustom(e.target.value)} />
                <button className="btn" type="submit" disabled={!isValidNotation(custom)}>
                  {t('dice.roll')}
                </button>
              </form>
            </div>
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-2">
              <span className="panel-title">{t('dice.history')}</span>
              {log.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clear}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {log.length === 0 && <div className="px-2 py-4 text-center text-xs text-faint">{t('dice.noHistory')}</div>}
              <AnimatePresence initial={false}>
                {log.map((r) => (
                  <motion.div key={r.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-panel-2">
                    <span className={`w-9 text-right font-display text-lg ${r.crit ? 'text-gold-2' : r.fumble ? 'text-crimson-2' : ''}`}>{r.total}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs">{r.label}</div>
                      <div className="truncate text-[11px] text-muted">
                        {r.notation} · <RollBreakdown r={r} />
                      </div>
                    </div>
                    <span className="text-[10px] text-faint">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
