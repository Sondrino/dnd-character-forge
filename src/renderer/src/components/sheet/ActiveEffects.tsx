import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Clock, Sparkles, X } from 'lucide-react'
import type { Character } from '../../types'
import { useChar } from './context'
import { EntityLink } from '../EntityInfo'
import { ROUNDS_PER_HOUR, ROUNDS_PER_MINUTE, dropConcentration, endEffects, tickEffects } from '../../lib/combat'
import { useUi } from '../../store/ui'

/** «12 runder» / «8 min» / «7 t 50 min» */
export function formatRounds(r: number, t: (k: string, o?: Record<string, unknown>) => string): string {
  if (r < ROUNDS_PER_MINUTE) return t('spellsx.rounds', { n: r })
  if (r < ROUNDS_PER_HOUR) return t('spellsx.minutes', { n: Math.ceil(r / ROUNDS_PER_MINUTE) })
  const h = Math.floor(r / ROUNDS_PER_HOUR)
  const m = Math.ceil((r % ROUNDS_PER_HOUR) / ROUNDS_PER_MINUTE)
  return m ? t('spellsx.hoursMinutes', { h, m }) : t('spellsx.hours', { n: h })
}

/**
 * Concentration og aktive effekter på arket (ved HP). Utenfor kamp ligger de på karakteren
 * (spells kastet før/etter en kamp); under en kamp vises kampens egne.
 */
export function ActiveEffects() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const notify = useUi((s) => s.notify)
  const inCombat = !!char.combat
  const effects = (inCombat ? char.combat?.effects : char.effects) ?? []
  const conc = inCombat ? char.combat?.concentration : char.concentration
  if (!effects.length && !conc) return null
  const holder = (ch: Character) => ch.combat ?? ch
  const timed = effects.some((e) => e.rounds !== undefined)
  const pass = (rounds: number): void => {
    let gone: string[] = []
    update((ch) => void (gone = tickEffects(ch, ch, rounds).map((e) => e.name)))
    if (gone.length) notify(t('spellsx.expired', { names: gone.join(', ') }), 'info')
  }
  return (
    <div className="col-span-12 flex flex-wrap items-center gap-2 rounded-xl border border-arcane/30 bg-arcane/5 px-3 py-2 text-xs">
      <AnimatePresence initial={false}>
        {conc && (
          <motion.span key="conc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="chip glow border-arcane/70 text-arcane" title={t('spellsx.concTip')}>
            ◉ {t('combat.concentrating')}:{' '}
            <b>{conc.spellId ? <EntityLink kind="spell" id={conc.spellId}>{conc.name}</EntityLink> : conc.name}</b>
            <button className="ml-1 opacity-70 hover:text-bad hover:opacity-100" title={t('spellsx.endConc')} onClick={() => update((ch) => dropConcentration(holder(ch), ch))}>
              <X size={11} />
            </button>
          </motion.span>
        )}
        {effects.map((e) => (
          <motion.span key={e.uid} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`chip ${e.concentration ? 'border-arcane/50' : 'border-gold/50'}`} title={e.note}>
            <Sparkles size={11} className={e.concentration ? 'text-arcane' : 'text-gold'} />
            {e.spellId ? <EntityLink kind="spell" id={e.spellId}>{e.name}</EntityLink> : e.name}
            {e.note && <span className="text-muted">({e.note})</span>}
            {e.rounds !== undefined && <span className="text-muted">· {formatRounds(Math.max(0, e.rounds), t)}</span>}
            <button className="ml-1 opacity-70 hover:text-bad hover:opacity-100" title={t('spellsx.removeEffect')} onClick={() => update((ch) => void endEffects(holder(ch), ch, (x) => x.uid === e.uid))}>
              <X size={11} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      {!inCombat && timed && (
        <span className="ml-auto flex items-center gap-1 text-muted">
          <Clock size={12} /> {t('spellsx.timePasses')}
          <button className="btn btn-ghost btn-sm px-1.5" onClick={() => pass(1)}>{t('spellsx.plusRound')}</button>
          <button className="btn btn-ghost btn-sm px-1.5" onClick={() => pass(ROUNDS_PER_MINUTE)}>{t('spellsx.plusMinute')}</button>
          <button className="btn btn-ghost btn-sm px-1.5" onClick={() => pass(10 * ROUNDS_PER_MINUTE)}>{t('spellsx.plusTenMinutes')}</button>
          <button className="btn btn-ghost btn-sm px-1.5" onClick={() => pass(ROUNDS_PER_HOUR)}>{t('spellsx.plusHour')}</button>
        </span>
      )}
      {inCombat && <span className="ml-auto text-faint">{t('spellsx.inCombat')}</span>}
    </div>
  )
}
