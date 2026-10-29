import { AnimatePresence, motion } from 'framer-motion'
import { useContext, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { ArrowLeft, Coffee, Dices, Flag, Footprints, Hand, Lightbulb, RotateCcw, Sparkles, Swords, Zap } from 'lucide-react'
import type { Character, SpellDef } from '../types'
import { useCharacter } from '../store/ui'
import { useSettings } from '../store/settings'
import { CharCtx } from '../components/sheet/context'
import { Modal, Section } from '../components/ui'
import { RollBox } from '../components/combat/RollBox'
import { Resolver } from '../components/combat/Resolver'
import { InitiativePanel, LogPanel, StatsPanel, StatusPanel, VitalsPanel } from '../components/combat/Panels'
import { combatOptions, signed, useCombat, type CombatOption } from '../components/combat/useCombat'
import { AmmoRecovery, itemCardInfo } from '../components/combat/ItemFlow'
import { addLog, advanceTurn, castingKind, endEffects, freeCasts, handBackEffects, initiativeOrder, movementLeft, newCombat, offhandBlocked, pickUpEffects, rollModeOf, startOwnTurn } from '../lib/combat'

export default function CombatPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t } = useTranslation()
  const { char, derived, lookup, update } = useCharacter(id)
  if (!char || !derived) return <div className="p-10 text-center text-muted">{t('common.loading')}</div>
  return (
    <CharCtx.Provider value={{ char, derived, lookup, update }}>
      {char.combat ? <CombatView /> : <StartCombat onCancel={() => nav(`/character/${char.id}`)} />}
    </CharCtx.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Start: ekte terninger eller app?                                    */
/* ------------------------------------------------------------------ */

function StartCombat({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, update } = useContext(CharCtx)!
  const last = useSettings((s) => s.combatDice)
  const setSettings = useSettings((s) => s.set)
  const [dice, setDice] = useState<'physical' | 'app' | null>(last ?? null)
  const [init, setInit] = useState<number | null>(null)
  const adv = !!d.initiative.advantage?.length
  const initMode = rollModeOf(d.initiative)
  const start = (): void => {
    if (!dice) return
    setSettings({ combatDice: dice })
    update((ch) => {
      const c = newCombat(dice, { uid: 'self', name: ch.name || 'You', init: init ?? 10, self: true })
      addLog(c, 'turn', t('combat.log.start', { n: init ?? 10 }))
      // Spells kastet før kampen (concentration, buffs med varighet) fortsetter i kampen
      if (ch.concentration || ch.effects?.length) addLog(c, 'info', t('spellsx.log.carriedIn', { names: [ch.concentration?.name, ...(ch.effects ?? []).map((e) => e.name)].filter((x, i, a) => x && a.indexOf(x) === i).join(', ') }))
      pickUpEffects(c, ch)
      ch.combat = c
    })
  }
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
        <div className="mb-1 flex items-center gap-2 font-display text-2xl text-gold">
          <Swords size={22} /> {t('combat.startTitle', { name: char.name || t('common.unnamed') })}
        </div>
        <p className="mb-5 text-muted">{t('combat.startIntro')}</p>
        <div className="panel-title mb-2">{t('combat.diceQuestion')}</div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {(['physical', 'app'] as const).map((k) => (
            <motion.button
              key={k}
              whileHover={{ y: -2 }}
              onClick={() => setDice(k)}
              className={`rounded-2xl border p-4 text-left ${dice === k ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel-2'}`}
            >
              <div className="mb-1 flex items-center gap-2 font-display text-lg text-gold">
                {k === 'physical' ? '🎲' : <Dices size={18} />} {t(`combat.dice.${k}`)}
              </div>
              <div className="text-sm text-muted">{t(`combat.dice.${k}Desc`)}</div>
            </motion.button>
          ))}
        </div>
        {dice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-title mb-2">{t('combat.rollInitiative')}</div>
            <RollBox
              label={t('combat.initiative')}
              notation={`1d20${signed(d.initiative.value)}`}
              value={init}
              onValue={(v) => setInit(v)}
              physical={dice === 'physical'}
              d20
              character={char.name}
              hint={adv ? t('combat.initAdv', { src: d.initiative.advantage!.join(', ') }) : undefined}
              initialMode={initMode.mode}
              modeWhy={initMode.mode === 'advantage' ? undefined : initMode.why}
              autoFocus
            />
          </motion.div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" disabled={!dice || init === null} onClick={start}>
            <Swords size={15} /> {t('combat.start')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Kampvisning                                                         */
/* ------------------------------------------------------------------ */

function CombatView() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { char, derived: d, lookup: L, c, mut, physical } = useCombat()
  const [opt, setOpt] = useState<CombatOption | null>(null)
  const [ending, setEnding] = useState(false)
  const groups = useMemo(() => combatOptions(char, d, L), [char, d, L])
  const order = initiativeOrder(c.combatants)
  const ownTurn = !!order[c.turnIdx]?.self

  const next = (): void => {
    mut((cc, ch) => {
      const r = advanceTurn(cc)
      if (r.newRound) addLog(cc, 'turn', t('combat.log.round', { n: cc.round }))
      if (r.ownTurn) {
        for (const e of startOwnTurn(cc, ch)) addLog(cc, 'info', t('combat.log.expired', { name: e.name }))
        addLog(cc, 'turn', t('combat.log.yourTurn'))
      } else addLog(cc, 'turn', t('combat.log.theirTurn', { name: initiativeOrder(cc.combatants)[cc.turnIdx]?.name ?? '' }))
    })
  }

  return (
    <div className="px-6 pb-24 pt-5">
      {/* Topplinje */}
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-ghost" onClick={() => nav(`/character/${char.id}`)} title={t('combat.backToSheet')}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2 font-display text-2xl text-gold">
            <Swords size={20} /> {char.name || t('common.unnamed')}
          </div>
          <div className="text-sm text-muted">{t('combat.roundN', { n: c.round })} · {ownTurn ? t('combat.yourTurn') : t('combat.theirTurn', { name: order[c.turnIdx]?.name ?? '' })}</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-line-soft">
            {(['physical', 'app'] as const).map((k) => (
              <button key={k} className={`px-3 py-1.5 text-sm ${c.dice === k ? 'bg-gold/20 text-gold-2' : 'text-muted hover:text-ink'}`} onClick={() => mut((cc) => void (cc.dice = k))} title={t(`combat.dice.${k}Desc`)}>
                {k === 'physical' ? '🎲 ' : ''}
                {t(`combat.dice.${k}Short`)}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => setEnding(true)}>
            <Flag size={15} /> {t('combat.endCombat')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 xl:col-span-3">
          <VitalsPanel />
          <StatsPanel />
          <StatusPanel />
        </div>
        <div className="col-span-12 space-y-4 lg:col-span-7 xl:col-span-6">
          <TurnPanel groups={groups} onPick={setOpt} ownTurn={ownTurn} />
          <Hints groups={groups} />
          <OptionList title={t('combat.econ.action')} icon={<Swords size={14} />} opts={groups.action} used={c.turn.action && c.turn.attacks === 0} onPick={setOpt} groups={groups} />
          <OptionList title={t('combat.econ.bonus')} icon={<Zap size={14} />} opts={groups.bonus} used={c.turn.bonus} onPick={setOpt} groups={groups} />
          <OptionList title={t('combat.econ.reaction')} icon={<RotateCcw size={14} />} opts={groups.reaction} used={c.turn.reaction} onPick={setOpt} groups={groups} />
          {groups.other.length > 0 && <OptionList title={t('combat.otherOptions')} icon={<Sparkles size={14} />} opts={groups.other} used={false} onPick={setOpt} groups={groups} />}
        </div>
        <div className="col-span-12 space-y-4 lg:col-span-5 xl:col-span-3">
          <InitiativePanel onNext={next} />
          <LogPanel />
        </div>
      </div>
      <Resolver opt={opt} onClose={() => setOpt(null)} />
      <EndCombat open={ending} onClose={() => setEnding(false)} />
      {void physical}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Handlingsøkonomi                                                    */
/* ------------------------------------------------------------------ */

function TurnPanel({ groups, onPick, ownTurn }: { groups: ReturnType<typeof combatOptions>; onPick: (o: CombatOption) => void; ownTurn: boolean }) {
  const { t } = useTranslation()
  const { char, derived: d, c, mut } = useCombat()
  const speed = d.speed.value
  const left = movementLeft(c, speed)
  const total = speed * (c.turn.dashed ? 2 : 1)
  const prone = char.conditions.includes('prone')
  const pip = (on: boolean, label: string, key: 'action' | 'bonus' | 'reaction' | 'interaction', icon: React.ReactNode) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => mut((cc) => void (cc.turn[key] = !cc.turn[key]))}
      className={`flex flex-1 flex-col items-center rounded-xl border px-2 py-2 ${on ? 'border-line-soft bg-panel-3 text-faint line-through' : 'border-gold/60 bg-gold/10 text-gold-2'}`}
      title={t('combat.toggleTip')}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px]">{on ? t('combat.used') : t('combat.available')}</span>
    </motion.button>
  )
  const attacksLeft = c.turn.attacks > 0 ? Math.max(0, groups.attacksPerAction - c.turn.attacks) : 0
  return (
    <Section
      title={ownTurn ? t('combat.yourTurnTitle') : t('combat.turnTitle')}
      actions={
        <button
          className="btn btn-sm"
          title={t('combat.resetTurnTip')}
          onClick={() =>
            mut((cc, ch) => {
              for (const e of startOwnTurn(cc, ch)) addLog(cc, 'info', t('combat.log.expired', { name: e.name }))
              addLog(cc, 'turn', t('combat.log.newTurn'))
            })
          }
        >
          <RotateCcw size={13} /> {t('combat.startTurn')}
        </button>
      }
    >
      <div className="flex gap-2">
        {pip(c.turn.action, t('combat.econ.action'), 'action', <Swords size={16} />)}
        {pip(c.turn.bonus, t('combat.econ.bonus'), 'bonus', <Zap size={16} />)}
        {pip(c.turn.reaction, t('combat.econ.reaction'), 'reaction', <RotateCcw size={16} />)}
        {pip(c.turn.interaction, t('combat.econ.interaction'), 'interaction', <Hand size={16} />)}
      </div>
      {attacksLeft > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 rounded-xl border border-gold/40 bg-gold/5 px-3 py-2 text-sm">
          {t('combat.attacksLeft', { n: attacksLeft })}{' '}
          <button className="btn btn-sm ml-1" onClick={() => onPick(groups.action.find((o) => o.kind === 'attack')!)}>
            <Swords size={12} /> {t('combat.attackAgain')}
          </button>
        </motion.div>
      )}
      <div className="mt-3">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Footprints size={14} className="text-gold" />
          <span>
            {t('combat.movement')}: <b>{left}</b> / {total} ft.
          </span>
          {c.turn.dashed && <span className="chip border-gold/50 text-gold">Dash</span>}
          {c.turn.slotUsed && <span className="chip border-arcane/50 text-arcane">{t('combat.slotUsedChip')}</span>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-panel-3">
          <motion.div className="h-full bg-gold" animate={{ width: `${total ? (left / total) * 100 : 0}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {[5, 10, 15, 20, 30].map((n) => (
            <button key={n} className="btn btn-sm" disabled={left <= 0} onClick={() => mut((cc) => void (cc.turn.movement += n))}>
              −{n} ft.
            </button>
          ))}
          {prone && (
            <button
              className="btn btn-sm border-crimson/50 text-crimson-2"
              onClick={() =>
                mut((cc, ch) => {
                  cc.turn.movement += Math.floor(speed / 2)
                  ch.conditions = ch.conditions.filter((x) => x !== 'prone')
                  addLog(cc, 'action', t('combat.log.standUp'))
                })
              }
            >
              {t('combat.standUp', { n: Math.floor(speed / 2) })}
            </button>
          )}
          <button className="btn btn-ghost btn-sm ml-auto" onClick={() => mut((cc) => void (cc.turn.movement = 0))}>
            {t('combat.resetMove')}
          </button>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* «Hva kan jeg gjøre nå?»                                             */
/* ------------------------------------------------------------------ */

function Hints({ groups }: { groups: ReturnType<typeof combatOptions> }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, c } = useCombat()
  const hints: { tone: 'good' | 'bad' | 'info'; text: string }[] = []
  const names = (os: CombatOption[], n = 4): string =>
    os
      .filter((o) => o.kind !== 'std')
      .slice(0, n)
      .map((o) => (o.kind === 'attack' ? (o.attack?.name ?? t('combat.opportunity')) : o.kind === 'spell' ? o.spell.name : o.kind === 'feature' ? o.feature.name : ''))
      .join(', ')
  if (char.hp.current <= 0) hints.push({ tone: 'bad', text: char.deathSaves.failures >= 3 ? t('combat.hint.dead') : char.deathSaves.successes >= 3 ? t('combat.hint.stable') : t('combat.hint.dying') })
  else {
    if (!c.turn.action) hints.push({ tone: 'good', text: t('combat.hint.action', { n: groups.attacksPerAction, list: names(groups.action) }) })
    const bonusOpts = groups.bonus.filter(
      (o) => (o.kind !== 'feature' || !o.feature.uses || o.feature.uses.used < o.feature.uses.max) && !(o.kind === 'attack' && o.offhand && o.attack && offhandBlocked(c, o.attack.key))
    )
    if (!c.turn.bonus && bonusOpts.length) hints.push({ tone: 'good', text: t('combat.hint.bonus', { list: names(bonusOpts) }) })
    if (!c.turn.bonus && !bonusOpts.length) hints.push({ tone: 'info', text: t('combat.hint.noBonus') })
    if (!c.turn.reaction) hints.push({ tone: 'info', text: t('combat.hint.reaction', { list: names(groups.reaction, 3) }) })
    if (movementLeft(c, d.speed.value) > 0) hints.push({ tone: 'info', text: t('combat.hint.move', { n: movementLeft(c, d.speed.value) }) })
    if (c.turn.slotUsed) hints.push({ tone: 'info', text: t('combat.hint.oneSlot') })
  }
  {
    const frees: string[] = []
    for (const o of [...groups.action, ...groups.bonus, ...groups.reaction, ...groups.other]) {
      if (o.kind !== 'spell') continue
      const fl = freeCasts(char, d, L, o.spell).filter((f) => f.left === null || f.left > 0)
      if (fl.length) frees.push(`${o.spell.name} (${fl.map((f) => (f.left === null ? `${f.label}, ${t('combat.atWill')}` : `${f.label} ${f.left}/${f.max}`)).join('; ')})`)
    }
    if (frees.length && char.hp.current > 0) hints.push({ tone: 'good', text: t('combat.hint.free', { list: frees.join(', ') }) })
  }
  if (c.turn.lightUsed && !c.turn.offhandDone && char.hp.current > 0) hints.push({ tone: 'good', text: t('combat.hint.offhand') })
  if (char.exhaustion > 0) hints.push({ tone: 'bad', text: char.exhaustion >= 6 ? t('combat.hint.exhaustionDead') : t('combat.hint.exhaustion', { n: char.exhaustion, d: 2 * char.exhaustion, s: 5 * char.exhaustion }) })
  if (c.concentration) hints.push({ tone: 'info', text: t('combat.hint.conc', { name: c.concentration.name }) })
  if (char.activeStates.includes('raging')) hints.push({ tone: 'info', text: t('combat.hint.rage') })
  for (const id of char.conditions) {
    const cd = L.get('condition', id)
    if (cd && id !== 'unconscious') hints.push({ tone: 'bad', text: `${cd.name}: ${cd.summary}` })
  }
  const low = d.hpMax.value && char.hp.current > 0 && char.hp.current / d.hpMax.value < 0.3
  if (low) {
    const healOpt = [...groups.action, ...groups.bonus].find((o) => (o.kind === 'spell' && !!o.spell.heal) || (o.kind === 'feature' && /second wind|lay on hands/i.test(o.feature.name)))
    hints.push({ tone: 'bad', text: healOpt ? t('combat.hint.lowHeal', { name: healOpt.kind === 'spell' ? healOpt.spell.name : healOpt.kind === 'feature' ? healOpt.feature.name : '' }) : t('combat.hint.low') })
  }
  return (
    <Section title={<span className="flex items-center gap-2"><Lightbulb size={14} /> {t('combat.whatCanI')}</span>}>
      <ul className="space-y-1 text-sm">
        {hints.map((h, i) => (
          <li key={i} className={h.tone === 'good' ? 'text-ink' : h.tone === 'bad' ? 'text-crimson-2' : 'text-muted'}>
            {h.tone === 'good' ? '✦ ' : '• '}
            {h.text}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Lister med valg                                                     */
/* ------------------------------------------------------------------ */

function OptionList({ title, icon, opts, used, onPick, groups }: { title: string; icon: React.ReactNode; opts: CombatOption[]; used: boolean; onPick: (o: CombatOption) => void; groups: ReturnType<typeof combatOptions> }) {
  const { t } = useTranslation()
  const { derived: d, c } = useCombat()
  const [showStd, setShowStd] = useState(false)
  const main = opts.filter((o) => o.kind !== 'std')
  const std = opts.filter((o) => o.kind === 'std')
  return (
    <Section
      title={<span className={`flex items-center gap-2 ${used ? 'text-faint line-through' : ''}`}>{icon} {title}</span>}
      actions={used ? <span className="chip text-faint">{t('combat.used')}</span> : undefined}
    >
      <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${used ? 'opacity-60' : ''}`}>
        {main.map((o) => (
          <OptionCard key={o.key} o={o} onPick={onPick} />
        ))}
      </div>
      {std.length > 0 && (
        <div className="mt-3">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowStd(!showStd)}>
            {showStd ? '▾' : '▸'} {t('combat.stdActions')} ({std.length})
          </button>
          <AnimatePresence>
            {showStd && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 flex flex-wrap gap-1 overflow-hidden">
                {std.map((o) => (
                  <button key={o.key} className="btn btn-sm" onClick={() => onPick(o)} title={o.kind === 'std' ? t(`combat.stdTip.${o.id}`) : ''}>
                    {o.kind === 'std' && t(`combat.std.${o.id}`)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {!main.length && !std.length && <p className="text-xs text-muted">{t('combat.nothingHere')}</p>}
      {void d}
      {void c}
      {void groups}
    </Section>
  )
}

function OptionCard({ o, onPick }: { o: CombatOption; onPick: (o: CombatOption) => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, c } = useCombat()
  let name = ''
  let sub = ''
  let badge: React.ReactNode = null
  let disabled = false
  if (o.kind === 'attack') {
    name = o.attack?.name ?? t('combat.opportunity')
    // Off-hand uten Two-Weapon Fighting: ingen positiv modifier på skaden
    const dmg = o.attack && o.offhand && !char.feats.some((f) => f.featId === 'two-weapon-fighting') ? (o.attack.offhandDamage ?? o.attack.damage) : o.attack?.damage
    sub = o.attack ? `${o.attack.bonus ? signed(o.attack.bonus.value) : ''} · ${dmg} ${o.attack.damageType} · ${o.attack.range}` : t('combat.opportunityTip')
    if (o.offhand) {
      const bl = o.attack ? offhandBlocked(c, o.attack.key) : 'noLight'
      disabled = !!bl
      badge = <span className={`chip text-[10px] ${bl ? 'text-faint' : 'border-good/60 text-good'}`} title={bl ? t(`combat.offhandBlocked.${bl}`) : ''}>{t('combat.offhand')}</span>
      if (bl) sub = t(`combat.offhandBlocked.${bl}`)
    }
    else if (o.attack?.masteryActive) badge = <span className="chip border-gold/50 text-[10px] text-gold">{o.attack.mastery}</span>
  } else if (o.kind === 'spell') {
    const sp: SpellDef = o.spell
    name = sp.name
    sub = [sp.level === 0 ? t('polish.labels.cantrip') : t('polish.labels.spellLevel', { n: sp.level }), sp.range, sp.damage ? `${sp.damage.dice} ${sp.damage.type}` : sp.heal ? `${t('combat.healing')} ${sp.heal}` : '', sp.concentration ? 'C' : ''].filter(Boolean).join(' · ')
    const free = freeCasts(char, d, L, sp).filter((f) => f.left === null || f.left > 0)
    const canCast = sp.level === 0 || free.length > 0 || d.slots.some((s) => s.level >= sp.level && s.used < s.max) || (!!d.pact && d.pact.level >= sp.level && d.pact.used < d.pact.count)
    if (free.length) badge = <span className="chip border-good/60 text-[10px] text-good" title={free.map((f) => f.label).join(', ')}>{t('combat.freeBadge')}</span>
    else if (!canCast) {
      disabled = true
      badge = <span className="chip border-bad/50 text-[10px] text-bad">{t('combat.noSlots')}</span>
    } else if (castingKind(sp.castingTime) === 'long') badge = <span className="chip text-[10px]">{sp.castingTime}</span>
  } else if (o.kind === 'feature') {
    name = o.feature.name
    sub = o.feature.summary
    if (o.feature.uses) {
      const left = o.feature.uses.max - o.feature.uses.used
      disabled = left <= 0
      badge = <span className={`chip text-[10px] ${left ? 'border-gold/50 text-gold' : 'border-bad/50 text-bad'}`}>{left}/{o.feature.uses.max}</span>
    }
  } else if (o.kind === 'item') ({ name, sub, badge } = itemCardInfo(o, t))
  return (
    <motion.button
      whileHover={{ y: -1 }}
      onClick={() => onPick(o)}
      className={`card-hover rounded-xl border border-line-soft bg-panel-2 p-2.5 text-left ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 truncate font-display text-[15px] text-gold">{name}</span>
        {badge}
      </div>
      <div className="line-clamp-2 text-[11px] text-muted">{sub}</div>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Avslutt kamp                                                        */
/* ------------------------------------------------------------------ */

function EndCombat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { char, c, update } = useCombat()
  const anim = useSettings((s) => s.animations)
  const end = (rest: boolean): void => {
    update((ch: Character) => {
      if (!ch.combat) return
      // Kampeffekter (Rage, Shield, Dodge …) slutter. Spells som varer (Aid, Bless, Mage Armor …) og
      // concentration flyttes tilbake til karakteren og vises på arket med gjenværende tid.
      handBackEffects(ch.combat, ch)
      ch.combat = undefined
    })
    if (anim) confetti({ particleCount: 70, spread: 70, origin: { y: 0.4 } })
    onClose()
    nav(`/character/${char.id}${rest ? '?rest=short' : ''}`)
  }
  const s = c.stats
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('combat.endTitle')}
      width={560}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn" onClick={() => end(true)}>
            <Coffee size={14} /> {t('combat.endAndRest')}
          </button>
          <button className="btn btn-primary" onClick={() => end(false)}>
            <Flag size={14} /> {t('combat.endCombat')}
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">{t('combat.endText', { n: c.round })}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          [t('combat.st.dealtL'), s.dealt],
          [t('combat.st.takenL'), s.taken],
          [t('combat.st.healedL'), s.healed],
          [t('combat.st.hitsL'), `${s.hits}/${s.hits + s.misses}`],
          [t('combat.st.critsL'), s.crits],
          [t('combat.st.spellsL'), s.spells]
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-xl border border-line-soft bg-panel-2 p-2">
            <div className="font-display text-2xl text-gold">{v}</div>
            <div className="text-[11px] text-muted">{k}</div>
          </div>
        ))}
      </div>
      {c.concentration && <p className="mt-3 text-sm text-muted">{t('combat.endConcNote', { name: c.concentration.name })}</p>}
      <AmmoRecovery />
    </Modal>
  )
}

