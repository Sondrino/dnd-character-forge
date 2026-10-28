import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { Dices, Trash2, X, ChevronsUp, ChevronsDown, Box, Sparkles } from 'lucide-react'
import { useRolls } from '../store/rolls'
import { useSettings } from '../store/settings'
import { isValidNotation, type RollResult } from '../dice'
import { DICE_SETTLED, DICE_THEMES } from './dice3d/themes'

/* ------------------------------------------------------------------ */
/* Terningikon (SVG med fasetter og lys)                               */
/* ------------------------------------------------------------------ */

function mix(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number): number => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))))
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`
}

/** Fasetter per terning: ytre form, «forsiden» (lysest) og linjer mellom fasettene */
const SHAPES: Record<number, { outer: string; front: string; lines?: string; text: [number, number] }> = {
  4: { outer: '50,5 95,88 5,88', front: '50,5 50,62 5,88', lines: 'M50,62 L95,88', text: [50, 70] },
  6: { outer: '14,10 86,10 92,16 92,86 86,92 14,92 8,86 8,16', front: '18,18 82,18 84,20 84,82 82,84 18,84 16,82 16,20', text: [50, 52] },
  8: { outer: '50,4 93,50 50,96 7,50', front: '50,4 82,63 18,63', lines: 'M18,63 L50,96 L82,63', text: [50, 46] },
  10: { outer: '50,4 95,44 50,96 5,44', front: '50,4 76,52 50,68 24,52', lines: 'M24,52 L5,44 M76,52 L95,44 M50,68 L50,96', text: [50, 44] },
  12: { outer: '50,3 94,30 89,77 50,97 11,77 6,30', front: '50,24 74,40 66,68 34,68 26,40', lines: 'M50,24 L50,3 M74,40 L94,30 M66,68 L89,77 M34,68 L11,77 M26,40 L6,30', text: [50, 50] },
  20: { outer: '50,3 93,27 93,73 50,97 7,73 7,27', front: '50,22 80,70 20,70', lines: 'M50,22 L50,3 M50,22 L93,27 M50,22 L7,27 M80,70 L93,27 M80,70 L93,73 M80,70 L50,97 M20,70 L7,27 M20,70 L7,73 M20,70 L50,97', text: [50, 54] },
  100: { outer: '50,4 95,44 50,96 5,44', front: '50,4 76,52 50,68 24,52', lines: 'M24,52 L5,44 M76,52 L95,44 M50,68 L50,96', text: [50, 44] }
}

export function DieShape({ sides, size = 40, value, highlight, dim, theme }: { sides: number; size?: number; value?: number | string; highlight?: 'crit' | 'fumble'; dim?: boolean; theme?: string }) {
  const id = useId().replace(/:/g, '')
  const themeKey = useSettings((s) => s.diceTheme)
  const th = DICE_THEMES[theme ?? themeKey ?? 'obsidian'] ?? DICE_THEMES.obsidian
  const sh = SHAPES[sides] ?? SHAPES[20]
  const edge = highlight === 'crit' ? '#ffd76a' : highlight === 'fumble' ? '#ff4d4d' : th.edge
  const text = String(value ?? '')
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: dim ? 0.35 : 1, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mix(th.body, 0.12)} />
          <stop offset="1" stopColor={mix(th.body, -0.35)} />
        </linearGradient>
        <linearGradient id={`f${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={mix(th.body, 0.38)} />
          <stop offset="1" stopColor={mix(th.body, 0.02)} />
        </linearGradient>
        <filter id={`s${id}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
          {highlight && <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={edge} floodOpacity="0.9" />}
        </filter>
      </defs>
      <g filter={`url(#s${id})`}>
        <polygon points={sh.outer} fill={`url(#b${id})`} stroke={edge} strokeWidth={3} strokeLinejoin="round" />
        <polygon points={sh.front} fill={`url(#f${id})`} stroke={edge} strokeOpacity={0.6} strokeWidth={1.6} strokeLinejoin="round" />
        {sh.lines && <path d={sh.lines} fill="none" stroke={edge} strokeOpacity={0.45} strokeWidth={1.6} />}
        {/* Glans */}
        <polygon points={sh.front} fill="white" opacity={0.08} transform="translate(-2,-2)" />
      </g>
      {value !== undefined && (
        <text
          x={sh.text[0]}
          y={sh.text[1]}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Cinzel, serif"
          fontWeight={700}
          fontSize={text.length > 2 ? 22 : text.length > 1 ? 28 : 32}
          fill={highlight === 'crit' ? '#ffe7a3' : highlight === 'fumble' ? '#ffb3b3' : th.text}
          style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,.35)', strokeWidth: 2 }}
        >
          {text}
        </text>
      )}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Resultat (toast) – venter på 3D-terningene før tallet vises         */
/* ------------------------------------------------------------------ */

export function RollToast() {
  const { t } = useTranslation()
  const current = useRolls((s) => s.current)
  const seq = useRolls((s) => s.seq)
  const dismiss = useRolls((s) => s.dismiss)
  const animations = useSettings((s) => s.animations)
  const sound = useSettings((s) => s.diceSound)
  const use3d = useSettings((s) => s.dice3d !== false && s.animations)
  const [phase, setPhase] = useState<'rolling' | 'done'>('done')
  const [flicker, setFlicker] = useState(1)

  useEffect(() => {
    if (!current) return
    setPhase(animations ? 'rolling' : 'done')
    if (sound && !use3d) playClacks()
    const sides = current.terms.find((x) => x.dice.length)?.dice[0]?.sides ?? 20
    const iv = setInterval(() => setFlicker(1 + Math.floor(Math.random() * sides)), 55)
    let finished = false
    const finish = (): void => {
      if (finished) return
      finished = true
      clearInterval(iv)
      setPhase('done')
      if (current.crit && animations) confetti({ particleCount: 160, spread: 85, origin: { x: 0.82, y: 0.8 }, colors: ['#f0cd7a', '#d6a84c', '#ffffff', '#c0392b'] })
    }
    const onSettled = (e: Event): void => {
      if ((e as CustomEvent).detail === current.id) finish()
    }
    window.addEventListener(DICE_SETTLED, onSettled)
    // Uten 3D: kort animasjon. Med 3D: venter på at terningene har lagt seg (med sikkerhetsnett)
    const to = setTimeout(finish, !animations ? 0 : use3d ? 8000 : 650)
    const hide = setTimeout(dismiss, use3d ? 11000 : 6500)
    return () => {
      clearInterval(iv)
      clearTimeout(to)
      clearTimeout(hide)
      window.removeEventListener(DICE_SETTLED, onSettled)
    }
  }, [seq])

  const firstSides = current?.terms.find((x) => x.dice.length)?.dice[0]?.sides ?? 20
  return (
    <div className="pointer-events-none fixed bottom-24 right-6 z-[85] flex flex-col items-end">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            className={`panel pointer-events-auto w-[310px] overflow-hidden ${current.crit && phase === 'done' ? 'glow' : ''}`}
            style={{ background: 'linear-gradient(160deg, var(--panel-2), var(--panel))' }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <div className="flex items-center gap-4 p-4">
              <motion.div
                animate={phase === 'rolling' && !use3d ? { rotate: [0, 120, 260, 360], scale: [1, 1.15, 0.95, 1], x: [0, -6, 6, 0] } : phase === 'done' ? { rotate: 0, scale: [1.25, 1] } : { rotate: [0, 8, -8, 0] }}
                transition={phase === 'rolling' && use3d ? { duration: 0.6, repeat: Infinity } : { duration: 0.6, ease: 'easeOut' }}
              >
                <DieShape
                  sides={firstSides}
                  size={66}
                  value={phase === 'rolling' ? (use3d ? '?' : flicker) : current.natural ?? current.total}
                  highlight={phase === 'done' ? (current.crit ? 'crit' : current.fumble ? 'fumble' : undefined) : undefined}
                />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-muted">{current.label}</div>
                <motion.div
                  key={phase}
                  initial={{ scale: phase === 'done' ? 1.6 : 1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
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

/* ------------------------------------------------------------------ */
/* Lyd                                                                 */
/* ------------------------------------------------------------------ */

let audioCtx: AudioContext | null = null
let lastClack = 0

/** Ett «klakk» – styrke 0–1 (fra 3D-terningenes sammenstøt) */
export function playClack(strength = 0.6): void {
  try {
    const nowMs = performance.now()
    if (nowMs - lastClack < 35) return
    lastClack = nowMs
    audioCtx ??= new AudioContext()
    const ctx = audioCtx
    const now = ctx.currentTime
    // Kort støyburst gjennom et båndpassfilter = tre/resin mot bord
    const len = Math.floor(ctx.sampleRate * 0.05)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1800 + Math.random() * 1600
    bp.Q.value = 3.5
    const g = ctx.createGain()
    g.gain.value = 0.08 + 0.32 * Math.min(1, strength)
    src.connect(bp).connect(g).connect(ctx.destination)
    src.start(now)
  } catch {
    /* lyd ikke tilgjengelig */
  }
}

function playClacks(): void {
  for (let i = 0; i < 4; i++) setTimeout(() => playClack(0.7 - i * 0.12), i * 90)
}

/* ------------------------------------------------------------------ */
/* Terningbrett                                                        */
/* ------------------------------------------------------------------ */

const PRESETS: { label: string; notation: string; mode?: 'advantage' | 'disadvantage' }[] = [
  { label: 'd20', notation: '1d20' },
  { label: 'Advantage', notation: '1d20', mode: 'advantage' },
  { label: 'Disadvantage', notation: '1d20', mode: 'disadvantage' },
  { label: '2d6', notation: '2d6' },
  { label: '4d6 drop lowest', notation: '4d6kh3' },
  { label: 'Fireball 8d6', notation: '8d6' },
  { label: 'd100', notation: '1d100' }
]

export function DiceTray() {
  const { t } = useTranslation()
  const open = useRolls((s) => s.trayOpen)
  const setOpen = useRolls((s) => s.setTray)
  const log = useRolls((s) => s.log)
  const roll = useRolls((s) => s.roll)
  const clear = useRolls((s) => s.clear)
  const mode = useRolls((s) => s.mode)
  const setMode = useRolls((s) => s.setMode)
  const theme = useSettings((s) => s.diceTheme ?? 'obsidian')
  const dice3d = useSettings((s) => s.dice3d !== false)
  const setSettings = useSettings((s) => s.set)
  const [pool, setPool] = useState<Record<number, number>>({})
  const [mod, setMod] = useState(0)
  const [custom, setCustom] = useState('')

  const poolNotation = Object.entries(pool)
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([s, n]) => `${n}d${s}`)
    .join('+')
  const notation = poolNotation ? `${poolNotation}${mod ? (mod > 0 ? `+${mod}` : mod) : ''}` : ''
  const total = Object.values(pool).reduce((s, n) => s + n, 0)

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-[86] flex h-14 w-14 items-center justify-center rounded-full border border-gold text-[#1d1408] shadow-xl"
        style={{ background: 'radial-gradient(circle at 35% 30%, var(--gold-2), var(--gold) 60%, #8a6420)' }}
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
            className="panel fixed bottom-24 right-6 z-[84] flex max-h-[80vh] w-[420px] flex-col overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {/* Topp */}
            <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3" style={{ background: 'linear-gradient(180deg, var(--panel-2), transparent)' }}>
              <Dices size={16} className="text-gold" />
              <span className="font-display text-lg text-gold">{t('dice.tray')}</span>
              <div className="ml-auto flex items-center gap-1">
                {Object.entries(DICE_THEMES).map(([k, th]) => (
                  <button
                    key={k}
                    title={th.name}
                    onClick={() => setSettings({ diceTheme: k })}
                    className={`h-4 w-4 rounded-full border transition-transform ${theme === k ? 'scale-125 border-white' : 'border-black/40 hover:scale-110'}`}
                    style={{ background: `radial-gradient(circle at 35% 30%, ${th.edge}, ${th.body} 65%)` }}
                  />
                ))}
                <button
                  className={`btn btn-ghost btn-sm ml-1 px-1.5 ${dice3d ? 'text-gold' : 'text-faint'}`}
                  title={dice3d ? t('dice.3dOn') : t('dice.3dOff')}
                  onClick={() => setSettings({ dice3d: !dice3d })}
                >
                  <Box size={14} />
                </button>
                <button className="btn btn-ghost btn-sm px-1.5" onClick={() => setOpen(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto p-4">
              {/* Filtbrettet */}
              <div
                className="relative rounded-2xl border border-gold/25 p-3 shadow-inner"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 30%, rgba(214,168,76,.10), transparent 60%), radial-gradient(ellipse at 50% 120%, rgba(0,0,0,.45), transparent 60%), repeating-linear-gradient(45deg, rgba(255,255,255,.015) 0 2px, transparent 2px 4px), #241913'
                }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ y: -4, rotate: -6 }}
                      whileTap={{ scale: 0.82, rotate: 40 }}
                      className={`relative flex flex-col items-center rounded-xl py-1.5 ${s === 20 ? 'col-span-1' : ''} hover:bg-white/5`}
                      onClick={() => setPool((p) => ({ ...p, [s]: Math.min(30, (p[s] ?? 0) + 1) }))}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setPool((p) => ({ ...p, [s]: Math.max(0, (p[s] ?? 0) - 1) }))
                      }}
                      title={t('dice.addHint')}
                    >
                      <DieShape sides={s} size={s === 20 ? 58 : 50} value={s === 100 ? '%' : s} />
                      <span className="mt-0.5 text-[11px] font-semibold text-muted">d{s === 100 ? '%' : s}</span>
                      <AnimatePresence>
                        {!!pool[s] && (
                          <motion.span
                            key={pool[s]}
                            initial={{ scale: 0.4 }}
                            animate={{ scale: 1 }}
                            className="absolute right-1 top-0 rounded-full bg-crimson px-1.5 text-[11px] font-bold text-white shadow"
                          >
                            ×{pool[s]}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                  {/* Modifier */}
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl">
                    <div className="flex items-center gap-1">
                      <button className="btn btn-sm px-2" onClick={() => setMod(mod - 1)}>
                        −
                      </button>
                      <button className="btn btn-sm px-2" onClick={() => setMod(mod + 1)}>
                        +
                      </button>
                    </div>
                    <span className="font-display text-xl text-gold">{mod >= 0 ? `+${mod}` : mod}</span>
                    <span className="text-[10px] text-muted">{t('dice.modifier')}</span>
                  </div>
                </div>
              </div>

              {/* Advantage */}
              <div className="flex overflow-hidden rounded-xl border border-line-soft text-sm">
                {(['disadvantage', 'normal', 'advantage'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex flex-1 items-center justify-center gap-1 py-1.5 ${mode === m ? (m === 'advantage' ? 'bg-good/20 text-good' : m === 'disadvantage' ? 'bg-bad/20 text-bad' : 'bg-gold/15 text-gold-2') : 'text-muted hover:text-ink'}`}
                    title={m === 'normal' ? '' : t(`dice.${m}`)}
                  >
                    {m === 'advantage' ? <ChevronsUp size={13} /> : m === 'disadvantage' ? <ChevronsDown size={13} /> : null}
                    {m === 'advantage' ? 'ADV' : m === 'disadvantage' ? 'DIS' : 'Normal'}
                  </button>
                ))}
              </div>

              {/* Rull */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={notation ? { scale: 1.02 } : undefined}
                  whileTap={notation ? { scale: 0.96 } : undefined}
                  className={`btn btn-primary flex-1 justify-center py-2.5 text-base ${notation ? 'glow' : ''}`}
                  disabled={!notation}
                  onClick={() => {
                    roll(notation, notation)
                    setPool({})
                    setMod(0)
                  }}
                >
                  <Dices size={17} /> {notation ? t('dice.rollX', { x: notation }) : t('dice.pick')}
                </motion.button>
                {notation && (
                  <button className="btn" onClick={() => (setPool({}), setMod(0))} title={t('dice.clearPool', { n: total })}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Hurtigvalg */}
              <div>
                <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  <Sparkles size={11} /> {t('dice.quick')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className={`chip cursor-pointer hover:border-gold hover:text-gold ${p.mode === 'advantage' ? 'text-good' : p.mode === 'disadvantage' ? 'text-bad' : ''}`}
                      onClick={() => roll(p.notation, p.label, { mode: p.mode ?? 'normal' })}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
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

            {/* Historikk */}
            <div className="flex items-center justify-between border-t border-line-soft px-4 py-2">
              <span className="panel-title">{t('dice.history')}</span>
              {log.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clear}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto px-2 pb-2">
              {log.length === 0 && <div className="px-2 py-4 text-center text-xs text-faint">{t('dice.noHistory')}</div>}
              <AnimatePresence initial={false}>
                {log.map((r) => {
                  const sides = r.terms.find((x) => x.dice.length)?.dice[0]?.sides ?? 20
                  return (
                    <motion.div key={r.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-panel-2">
                      <DieShape sides={sides} size={30} value={r.total} highlight={r.crit ? 'crit' : r.fumble ? 'fumble' : undefined} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs">{r.label}</div>
                        <div className="truncate text-[11px] text-muted">
                          {r.notation} · <RollBreakdown r={r} />
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm px-1 text-[10px]" title={t('dice.reroll')} onClick={() => roll(r.notation, r.label, { mode: r.mode })}>
                        ↻
                      </button>
                      <span className="text-[10px] text-faint">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
