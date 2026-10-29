import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dices } from 'lucide-react'
import { isValidNotation, type RollMode, type RollResult } from '../../dice'
import { useRolls } from '../../store/rolls'

/**
 * Ett terningkast i kampmodus. Med ekte terninger skriver man inn resultatet (og kan likevel rulle i appen,
 * f.eks. når man mangler terninger). Med app-terninger er «Rull» hovedknappen, men verdien kan alltid overstyres.
 */
export function RollBox({
  label, notation, value, onValue, physical, d20 = false, character, hint, autoFocus, initialMode, modeWhy
}: {
  label: string
  notation: string
  value: number | null
  onValue: (v: number | null, r?: RollResult) => void
  physical: boolean
  /** d20-test: vis advantage/disadvantage og nat 20/nat 1 */
  d20?: boolean
  character?: string
  hint?: string
  autoFocus?: boolean
  /** Forhåndsvalgt advantage/disadvantage (f.eks. fra conditions); kan alltid endres */
  initialMode?: RollMode
  /** Hvorfor modusen er forhåndsvalgt (kilder), vises som liten tekst */
  modeWhy?: string[]
}) {
  const { t } = useTranslation()
  const roll = useRolls((s) => s.roll)
  const [mode, setMode] = useState<RollMode>(initialMode ?? 'normal')
  useEffect(() => setMode(initialMode ?? 'normal'), [initialMode])
  const [last, setLast] = useState<RollResult | null>(null)
  const [text, setText] = useState(value === null ? '' : String(value))
  useEffect(() => setText(value === null ? '' : String(value)), [value])

  const canRoll = isValidNotation(notation)
  const doRoll = (): void => {
    if (!canRoll) return
    const r = roll(notation, label, { mode: d20 ? mode : 'normal', character })
    setLast(r)
    onValue(r.total, r)
  }
  const commit = (s: string): void => {
    const n = parseInt(s, 10)
    setLast(null)
    onValue(Number.isFinite(n) ? n : null)
  }

  return (
    <div className="rounded-xl border border-line-soft bg-panel-2 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="chip font-mono">{notation}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
        {d20 && (
          <span className="ml-auto flex gap-1">
            {(['disadvantage', 'normal', 'advantage'] as RollMode[]).map((m) => (
              <button key={m} className={`btn btn-sm ${mode === m ? (m === 'advantage' ? 'border-good text-good' : m === 'disadvantage' ? 'border-bad text-bad' : 'btn-primary') : ''}`} onClick={() => setMode(m)}>
                {t(`combat.mode.${m}`)}
              </button>
            ))}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          autoFocus={autoFocus && physical}
          className={`input w-28 text-center font-display text-xl ${physical ? 'border-gold/60' : ''}`}
          inputMode="numeric"
          placeholder={physical ? t('combat.enterResult') : '–'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
        />
        {canRoll && (
          <button className={`btn ${physical ? 'btn-sm' : 'btn-primary'}`} onClick={doRoll} title={t('combat.rollInAppTip')}>
            <Dices size={physical ? 13 : 15} /> {physical ? t('combat.rollInApp') : t('combat.roll')}
          </button>
        )}
        {last && (
          <span className={`text-sm ${last.crit ? 'font-bold text-good' : last.fumble ? 'font-bold text-bad' : 'text-muted'}`}>
            {last.terms.map((tm, i) => (
              <span key={i}>
                {i > 0 && (tm.sign < 0 ? ' − ' : ' + ')}
                {tm.dice.length ? (
                  <>
                    [
                    {tm.dice.map((d, j) => (
                      <span key={j} className={d.kept ? '' : 'line-through opacity-50'}>
                        {j > 0 && ', '}
                        {d.value}
                      </span>
                    ))}
                    ]
                  </>
                ) : (
                  Math.abs(tm.subtotal)
                )}
              </span>
            ))}
            {last.crit && ` · ${t('combat.nat20')}`}
            {last.fumble && ` · ${t('combat.nat1')}`}
          </span>
        )}
        {physical && d20 && mode !== 'normal' && <span className="text-xs text-muted">{t(mode === 'advantage' ? 'combat.rollTwoHigh' : 'combat.rollTwoLow')}</span>}
      </div>
      {d20 && !!modeWhy?.length && (
        <div className={`mt-1 text-[11px] ${initialMode === 'advantage' ? 'text-good' : initialMode === 'disadvantage' ? 'text-bad' : 'text-muted'}`}>
          {t(`spellsx.mode.${initialMode ?? 'normal'}`)}: {modeWhy.join(', ')}
        </div>
      )}
    </div>
  )
}
