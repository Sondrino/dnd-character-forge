import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Brain, ChevronDown, ChevronUp, Copy, Heart, HeartCrack, Plus, Shield, Skull, Sparkles, Trash2, UserPlus, X } from 'lucide-react'
import type { Ability, DamageType } from '../../types'
import { ABILITIES } from '../../types'
import { Modal, NumberInput, Section } from '../ui'
import { EntityLink } from '../EntityInfo'
import { RollBox } from './RollBox'
import { healSelf } from './Resolver'
import { signed, useCombat } from './useCombat'
import { addEffect, addLog, applyDamage, deathSave, dropConcentration, endEffects, initiativeOrder, rollModeOf, uidc } from '../../lib/combat'
import { useRolls } from '../../store/rolls'
import { EntityPicker } from '../EntityPicker'
import type { CreatureDef } from '../../types'

const DAMAGE_TYPES: DamageType[] = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']
const ABIL: Record<Ability, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

/* ------------------------------------------------------------------ */
/* HP, skade og helbredelse                                            */
/* ------------------------------------------------------------------ */

export function VitalsPanel() {
  const { t } = useTranslation()
  const { char, derived: d, c, mut } = useCombat()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<string>('')
  const [crit, setCrit] = useState(false)
  const [concDC, setConcDC] = useState<number | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const max = d.hpMax.value
  const pct = max ? Math.max(0, Math.min(1, char.hp.current / max)) : 0
  const n = Math.max(0, parseInt(amount, 10) || 0)

  const damage = (): void => {
    if (!n) return
    const r = applyDamage({
      current: char.hp.current, temp: char.hp.temp, max, amount: n, type: type || undefined, crit,
      resistances: d.resistances, immunities: d.immunities, vulnerabilities: d.vulnerabilities, concentrating: !!c.concentration
    })
    mut((cc, ch) => {
      ch.hp.current = r.current
      ch.hp.temp = r.temp
      cc.stats.taken += r.final
      const mod = r.modifier ? ` (${t(`combat.dmgMod.${r.modifier}`)})` : ''
      addLog(cc, 'damage', t('combat.log.took', { n: r.final, type: type || '' }) + mod + (r.absorbedByTemp ? ` – ${t('combat.log.tempAbsorbed', { n: r.absorbedByTemp })}` : ''))
      if (r.droppedToZero) {
        if (!ch.conditions.includes('unconscious')) ch.conditions.push('unconscious')
        if (cc.concentration) addLog(cc, 'info', t('combat.log.concLost', { name: cc.concentration.name }))
        dropConcentration(cc, ch)
        addLog(cc, 'death', t('combat.log.down'))
      }
      if (r.deathFailures) {
        // Skade på 0 HP: ikke lenger stabil
        if (ch.deathSaves.successes >= 3) ch.deathSaves.successes = 0
        ch.deathSaves.failures = Math.min(3, ch.deathSaves.failures + r.deathFailures)
        addLog(cc, 'death', t('combat.log.deathFail', { n: r.deathFailures }))
      }
      if (r.instantDeath) addLog(cc, 'death', t('combat.log.massive'))
    })
    setFlash(r.instantDeath ? t('combat.massive') : r.modifier ? t(`combat.dmgMod.${r.modifier}`) : null)
    setTimeout(() => setFlash(null), 2500)
    if (r.concentrationDC) setConcDC(r.concentrationDC)
    setAmount('')
    setCrit(false)
  }
  const heal = (): void => {
    if (!n) return
    mut((cc, ch) => {
      const healed = healSelf(cc, ch, n, max)
      cc.stats.healed += healed
      addLog(cc, 'heal', t('combat.log.healed', { n: healed }))
    })
    setAmount('')
  }
  const temp = (): void => {
    if (!n) return
    mut((cc, ch) => {
      ch.hp.temp = Math.max(ch.hp.temp, n)
      addLog(cc, 'heal', t('combat.log.temp', { n }))
    })
    setAmount('')
  }

  return (
    <Section title={t('combat.hp')}>
      <div className="flex items-end gap-3">
        <motion.div key={char.hp.current} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={`font-display text-5xl ${char.hp.current <= 0 ? 'text-bad' : pct < 0.34 ? 'text-crimson-2' : 'text-ink'}`}>
          {char.hp.current}
        </motion.div>
        <div className="pb-1 text-muted">/ {max}</div>
        {char.hp.temp > 0 && <span className="mb-1 chip border-sky/50 text-sky">+{char.hp.temp} temp</span>}
        <AnimatePresence>
          {flash && (
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-1 ml-auto chip border-gold text-gold">
              {flash}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-panel-3">
        <motion.div className={`h-full ${pct < 0.34 ? 'bg-bad' : pct < 0.67 ? 'bg-gold' : 'bg-good'}`} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input className="input w-20 text-center font-display text-lg" inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && damage()} />
        <select className="input w-36" value={type} onChange={(e) => setType(e.target.value)} title={t('combat.damageTypeTip')}>
          <option value="">{t('combat.damageType')}</option>
          {DAMAGE_TYPES.map((x) => (
            <option key={x} value={x}>
              {x}
              {d.resistances.includes(x) ? ' ½' : d.immunities.includes(x) ? ' ✕' : d.vulnerabilities.includes(x) ? ' ×2' : ''}
            </option>
          ))}
        </select>
        {char.hp.current <= 0 && (
          <label className="chip cursor-pointer">
            <input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} /> {t('combat.wasCrit')}
          </label>
        )}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button className="btn border-bad/50 text-bad" onClick={damage} disabled={!n}>
          <HeartCrack size={14} /> {t('combat.takeDamage')}
        </button>
        <button className="btn border-good/50 text-good" onClick={heal} disabled={!n}>
          <Heart size={14} /> {t('combat.heal')}
        </button>
        <button className="btn border-sky/50 text-sky" onClick={temp} disabled={!n}>
          <Shield size={14} /> {t('combat.tempHp')}
        </button>
      </div>
      {(d.resistances.length > 0 || d.immunities.length > 0 || d.vulnerabilities.length > 0) && (
        <div className="mt-2 text-[11px] text-muted">
          {d.resistances.length > 0 && <div>{t('combat.resist')}: {d.resistances.join(', ')}</div>}
          {d.immunities.length > 0 && <div>{t('combat.immune')}: {d.immunities.join(', ')}</div>}
          {d.vulnerabilities.length > 0 && <div>{t('combat.vulnerable')}: {d.vulnerabilities.join(', ')}</div>}
        </div>
      )}
      {char.hp.current <= 0 && <DeathSaves />}
      <ConcentrationCheck dc={concDC} onClose={() => setConcDC(null)} />
    </Section>
  )
}

function DeathSaves() {
  const { t } = useTranslation()
  const { char, derived: d, c, mut, physical } = useCombat()
  const [v, setV] = useState<number | null>(null)
  const ds = char.deathSaves
  /** natural = terningen (20/1 er spesielle), total = etter Exhaustion-fratrekk */
  const apply = (total: number, natural?: number): void => {
    const r = deathSave(natural === 20 || natural === 1 ? natural : Math.max(2, total), ds)
    mut((cc, ch) => {
      if (r.revived) {
        ch.hp.current = 1
        ch.deathSaves = { successes: 0, failures: 0 }
        ch.conditions = ch.conditions.filter((x) => x !== 'unconscious')
        addLog(cc, 'death', t('combat.log.nat20Up'))
      } else {
        ch.deathSaves = { successes: r.successes, failures: r.failures }
        addLog(cc, 'death', t('combat.log.deathSave', { n: total, s: r.successes, f: r.failures }))
        if (r.stable) addLog(cc, 'death', t('combat.log.stable'))
        if (r.dead) addLog(cc, 'death', t('combat.log.dead'))
      }
    })
    setV(null)
  }
  return (
    <div className="glow mt-3 rounded-xl border border-bad/60 bg-bad/10 p-3">
      <div className="mb-2 flex items-center gap-2 font-display text-bad">
        <Skull size={15} /> {t('combat.deathSaves')}
        <span className="ml-auto flex gap-3 text-sm">
          <span className="text-good">✓ {ds.successes}/3</span>
          <span className="text-bad">✕ {ds.failures}/3</span>
        </span>
      </div>
      {ds.failures >= 3 ? (
        <p className="text-sm text-bad">{t('combat.deadText')}</p>
      ) : ds.successes >= 3 ? (
        <p className="text-sm text-good">{t('combat.stableText')}</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">{t('combat.deathSaveHelp')}</p>
          <RollBox
            label={t('combat.deathSave')}
            notation={d.exhaustion ? `1d20-${2 * d.exhaustion}` : '1d20'}
            hint={d.exhaustion ? t('combat.exhaustionOnSave', { n: 2 * d.exhaustion }) : undefined}
            value={v}
            onValue={(x, r) => {
              setV(x)
              if (x !== null && r) apply(r.total, r.terms.find((tm) => tm.dice.length)?.dice[0]?.value)
            }}
            physical={physical}
            character={char.name}
          />
          {physical && (
            <div className="mt-2 flex justify-end">
              <button className="btn btn-primary btn-sm" disabled={v === null} onClick={() => v !== null && apply(v - 2 * d.exhaustion, v)}>
                {t('combat.applyDeathSave')}
              </button>
            </div>
          )}
        </>
      )}
      {void d}
      {void c}
    </div>
  )
}

function ConcentrationCheck({ dc, onClose }: { dc: number | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, c, mut, physical } = useCombat()
  const [v, setV] = useState<number | null>(null)
  const bonus = d.saves.con.value
  const decide = (kept: boolean): void => {
    mut((cc, ch) => {
      if (kept) addLog(cc, 'save', t('combat.log.concKept', { name: cc.concentration?.name ?? '' }))
      else {
        addLog(cc, 'save', t('combat.log.concLost', { name: cc.concentration?.name ?? '' }))
        dropConcentration(cc, ch)
      }
    })
    setV(null)
    onClose()
  }
  return (
    <Modal open={dc !== null && !!c.concentration} onClose={onClose} title={t('combat.concCheck')} width={560}>
      <p className="mb-3 text-sm">{t('combat.concCheckText', { name: c.concentration?.name ?? '', dc })}</p>
      <RollBox label="Constitution save" notation={`1d20${signed(bonus)}`} value={v} onValue={(x) => setV(x)} physical={physical} d20 character={char.name} hint={`DC ${dc}`} initialMode={rollModeOf(d.saves.con).mode} modeWhy={rollModeOf(d.saves.con).why} autoFocus />
      {v !== null && dc !== null && <p className={`mt-2 text-sm ${v >= dc ? 'text-good' : 'text-bad'}`}>{v >= dc ? t('combat.concOk') : t('combat.concFail')}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button className="btn border-bad/50 text-bad" onClick={() => decide(false)}>
          {t('combat.concLose')}
        </button>
        <button className="btn btn-primary" onClick={() => decide(true)}>
          {t('combat.concKeep')}
        </button>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Nøkkeltall og saving throws                                         */
/* ------------------------------------------------------------------ */

export function StatsPanel() {
  const { t } = useTranslation()
  const { char, derived: d, physical } = useCombat()
  const roll = useRolls((s) => s.roll)
  const sc = d.spellcasting[0]
  const box = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl border border-line-soft bg-panel-2 px-2 py-1.5 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-display text-xl">{value}</div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  )
  return (
    <Section title={t('combat.stats')}>
      <div className="grid grid-cols-4 gap-2">
        {box('AC', String(d.ac.value))}
        {box(t('combat.init'), signed(d.initiative.value))}
        {box(t('combat.speed'), `${d.speed.value}`, 'ft.')}
        {box(t('combat.pp'), String(d.passive.perception.value))}
        {sc && box(t('combat.spellDC'), String(sc.dc.value))}
        {sc && box(t('combat.spellAtk'), signed(sc.attack.value))}
        {box('PB', signed(d.pb.value))}
        {box(t('combat.inspiration'), char.heroicInspiration ? '✦' : '–')}
      </div>
      <div className="mt-3 panel-title mb-1">{t('combat.saves')}</div>
      <div className="grid grid-cols-3 gap-1">
        {ABILITIES.map((ab) => {
          const s = d.saves[ab]
          return (
            <button
              key={ab}
              className={`btn btn-sm justify-between ${s.proficient ? 'border-gold/50' : ''}`}
              title={physical ? t('combat.saveTipPhysical', { n: signed(s.value) }) : t('combat.saveTip')}
              onClick={() => roll(`1d20${signed(s.value)}`, `${ABIL[ab]} save`, { character: char.name })}
            >
              <span>{ABIL[ab]}</span>
              <span className="font-display">{signed(s.value)}</span>
              {s.advantage?.length ? <span className="text-[10px] text-good" title={s.advantage.join(', ')}>*</span> : null}
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {physical ? t('combat.savesPhysical') : t('combat.savesApp')}
        {ABILITIES.some((ab) => d.saves[ab].advantage?.length) && ` ${t('combat.savesAdv')}`}
      </p>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Conditions, concentration og effekter                               */
/* ------------------------------------------------------------------ */

export function StatusPanel() {
  const { t } = useTranslation()
  const { char, lookup: L, c, mut, update } = useCombat()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [rounds, setRounds] = useState(10)
  const conds = L.all('condition').filter((x) => x.id !== 'exhaustion')
  const active = conds.filter((x) => char.conditions.includes(x.id))
  return (
    <Section title={t('combat.status')}>
      {c.concentration ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-arcane/50 bg-arcane/10 px-3 py-2 text-sm">
          <Brain size={14} className="text-arcane" />
          <span>
            {t('combat.concentrating')}: <b>{c.concentration.spellId ? <EntityLink kind="spell" id={c.concentration.spellId}>{c.concentration.name}</EntityLink> : c.concentration.name}</b>
          </span>
          <button
            className="btn btn-ghost btn-sm ml-auto"
            onClick={() =>
              mut((cc, ch) => {
                addLog(cc, 'info', t('combat.log.concEnded', { name: cc.concentration?.name ?? '' }))
                dropConcentration(cc, ch)
              })
            }
          >
            <X size={13} /> {t('combat.end')}
          </button>
        </div>
      ) : (
        <p className="mb-3 text-xs text-muted">{t('combat.notConcentrating')}</p>
      )}

      <div className="panel-title mb-1">{t('combat.effects')}</div>
      <div className="mb-2 space-y-1">
        {c.effects.length === 0 && <p className="text-xs text-muted">{t('combat.noEffects')}</p>}
        {c.effects.map((e) => (
          <div key={e.uid} className="flex items-center gap-2 rounded-lg border border-line-soft px-2 py-1 text-sm">
            <Sparkles size={12} className={e.concentration ? 'text-arcane' : 'text-gold'} />
            <span className="min-w-0 flex-1 truncate" title={e.note}>
              {e.name}
              {e.note && <span className="text-xs text-muted"> – {e.note}</span>}
            </span>
            {e.rounds !== undefined && (
              <span className="flex items-center gap-1 text-xs">
                <button className="btn btn-ghost btn-sm px-1" onClick={() => mut((cc) => void (cc.effects.find((x) => x.uid === e.uid)!.rounds = Math.max(1, (e.rounds ?? 1) - 1)))}>
                  −
                </button>
                {t('combat.roundsLeft', { n: e.rounds })}
                <button className="btn btn-ghost btn-sm px-1" onClick={() => mut((cc) => void (cc.effects.find((x) => x.uid === e.uid)!.rounds = (e.rounds ?? 0) + 1))}>
                  +
                </button>
              </span>
            )}
            <button
              className="btn btn-ghost btn-sm px-1"
              onClick={() =>
                mut((cc, ch) => void endEffects(cc, ch, (x) => x.uid === e.uid))
              }
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input className="input w-40" placeholder={t('combat.effectName')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <NumberInput value={rounds} onChange={setRounds} min={0} max={9999} />
          <span className="text-xs text-muted">{t('combat.rounds0')}</span>
          <button
            className="btn btn-sm btn-primary"
            disabled={!name.trim()}
            onClick={() => {
              mut((cc, ch) => void addEffect(cc, ch, { name: name.trim(), rounds: rounds || undefined }))
              setName('')
              setAdding(false)
            }}
          >
            <Plus size={12} />
          </button>
        </div>
      ) : (
        <button className="btn btn-sm mb-3" onClick={() => setAdding(true)}>
          <Plus size={12} /> {t('combat.addEffect')}
        </button>
      )}

      <div className="panel-title mb-1">{t('combat.conditions')}</div>
      <div className="flex flex-wrap gap-1">
        {conds.map((x) => {
          const on = char.conditions.includes(x.id)
          return (
            <button
              key={x.id}
              title={x.summary}
              className={`chip cursor-pointer ${on ? 'border-crimson bg-crimson/20 text-crimson-2' : ''}`}
              onClick={() =>
                mut((cc, ch) => {
                  ch.conditions = on ? ch.conditions.filter((y) => y !== x.id) : [...ch.conditions, x.id]
                  addLog(cc, 'info', `${on ? '−' : '+'} ${x.name}`)
                  // Incapacitated (også via Unconscious, Stunned, Paralyzed, Petrified) avslutter concentration
                  if (!on && cc.concentration && ['incapacitated', 'unconscious', 'stunned', 'paralyzed', 'petrified'].includes(x.id)) {
                    addLog(cc, 'info', t('combat.log.concLost', { name: cc.concentration.name }))
                    dropConcentration(cc, ch)
                  }
                })
              }
            >
              {x.name}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span>Exhaustion</span>
        <NumberInput value={char.exhaustion} onChange={(v) => update((ch) => void (ch.exhaustion = v))} min={0} max={6} width={52} />
        {char.exhaustion > 0 && char.exhaustion < 6 && <span className="text-xs text-crimson-2">−{2 * char.exhaustion} d20 · −{5 * char.exhaustion} ft.</span>}
        {char.exhaustion >= 6 && <span className="text-xs font-semibold text-bad">{t('combat.hint.exhaustionDead')}</span>}
      </div>
      {active.length > 0 && (
        <div className="mt-2 space-y-1">
          {active.map((x) => (
            <div key={x.id} className="rounded-lg border border-crimson/30 bg-crimson/5 px-2 py-1 text-xs">
              <b className="text-crimson-2">{x.name}:</b> {x.summary}
            </div>
          ))}
        </div>
      )}
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={char.heroicInspiration} onChange={(e) => update((ch) => void (ch.heroicInspiration = e.target.checked))} />
        {t('combat.heroicInspiration')}
      </label>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Initiativ                                                           */
/* ------------------------------------------------------------------ */

export function InitiativePanel({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, c, mut, physical } = useCombat()
  const roll = useRolls((s) => s.roll)
  const order = initiativeOrder(c.combatants)
  const current = order[c.turnIdx]
  const [form, setForm] = useState<{ name: string; init: string; initMod: string; hp: string; ac: string; count: number; ally: boolean } | null>(null)
  const [dmgFor, setDmgFor] = useState<Record<string, string>>({})
  const [bestiary, setBestiary] = useState(false)

  /** Legg til skapninger fra bestiariet (SRD-monstre og egne) med AC, HP og rullet initiativ */
  const addCreatures = (list: CreatureDef[]): void =>
    mut((cc) => {
      const curUid = initiativeOrder(cc.combatants)[cc.turnIdx]?.uid
      for (const cr of list) {
        const dex = Math.floor(((cr.abilities?.dex ?? 10) - 10) / 2)
        const hp = parseInt(String(cr.hp), 10)
        const same = cc.combatants.filter((x) => x.name === cr.name || x.name.startsWith(`${cr.name} `)).length
        cc.combatants.push({
          uid: uidc(),
          name: same ? `${cr.name} ${same + 1}` : cr.name,
          init: roll(`1d20${signed(dex)}`, `${cr.name} initiative`).total,
          hp: Number.isFinite(hp) ? hp : undefined,
          maxHp: Number.isFinite(hp) ? hp : undefined,
          ac: cr.ac,
          note: `CR ${cr.cr}`
        })
      }
      const idx = initiativeOrder(cc.combatants).findIndex((x) => x.uid === curUid)
      if (idx >= 0) cc.turnIdx = idx
      addLog(cc, 'info', t('combat.log.joined', { name: list.map((c) => c.name).join(', '), n: list.length }))
    })

  const add = (): void => {
    if (!form || !form.name.trim()) return
    mut((cc) => {
      const curUid = initiativeOrder(cc.combatants)[cc.turnIdx]?.uid
      for (let i = 0; i < form.count; i++) {
        const mod = parseInt(form.initMod, 10) || 0
        let init = parseInt(form.init, 10)
        if (!Number.isFinite(init)) init = roll(`1d20${signed(mod)}`, `${form.name} initiative`).total
        const hp = parseInt(form.hp, 10)
        const ac = parseInt(form.ac, 10)
        cc.combatants.push({
          uid: uidc(),
          name: form.count > 1 ? `${form.name.trim()} ${i + 1}` : form.name.trim(),
          init,
          ally: form.ally,
          hp: Number.isFinite(hp) ? hp : undefined,
          maxHp: Number.isFinite(hp) ? hp : undefined,
          ac: Number.isFinite(ac) ? ac : undefined
        })
      }
      // Behold hvem sin tur det er
      const idx = initiativeOrder(cc.combatants).findIndex((x) => x.uid === curUid)
      if (idx >= 0) cc.turnIdx = idx
      addLog(cc, 'info', t('combat.log.joined', { name: form.name.trim(), n: form.count }))
    })
    setForm(null)
  }

  return (
    <Section
      title={t('combat.initiative')}
      actions={
        <>
          <button className="btn btn-sm" onClick={() => setBestiary(true)} title={t('combat.bestiaryTip')}>
            <BookOpen size={13} /> {t('combat.bestiary')}
          </button>
          <button className="btn btn-sm" onClick={() => setForm({ name: '', init: '', initMod: '0', hp: '', ac: '', count: 1, ally: false })}>
            <UserPlus size={13} /> {t('combat.addCombatant')}
          </button>
        </>
      }
    >
      {form && (
        <div className="mb-3 space-y-2 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <input className="input w-40" placeholder={t('combat.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            <input className="input w-20 text-center" placeholder="Init" value={form.init} onChange={(e) => setForm({ ...form, init: e.target.value })} title={t('combat.initTip')} />
            <input className="input w-20 text-center" placeholder={t('combat.initMod')} value={form.initMod} onChange={(e) => setForm({ ...form, initMod: e.target.value })} title={t('combat.initModTip')} />
            <input className="input w-16 text-center" placeholder="HP" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} />
            <input className="input w-16 text-center" placeholder="AC" value={form.ac} onChange={(e) => setForm({ ...form, ac: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1">
              {t('combat.count')} <NumberInput value={form.count} onChange={(v) => setForm({ ...form, count: v })} min={1} max={20} width={52} />
            </label>
            <label className="flex cursor-pointer items-center gap-1">
              <input type="checkbox" checked={form.ally} onChange={(e) => setForm({ ...form, ally: e.target.checked })} /> {t('combat.ally')}
            </label>
            <span className="text-xs text-muted">{t('combat.emptyInitRolls')}</span>
            <button className="btn btn-sm ml-auto" onClick={() => setForm(null)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary btn-sm" disabled={!form.name.trim()} onClick={add}>
              <Plus size={12} /> {t('combat.add')}
            </button>
          </div>
        </div>
      )}
      <div className="space-y-1">
        {order.map((x, i) => {
          const isCur = i === c.turnIdx
          return (
            <motion.div
              layout
              key={x.uid}
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-2 py-1.5 text-sm ${isCur ? 'border-gold bg-gold/10' : 'border-line-soft'} ${x.defeated ? 'opacity-40' : ''}`}
            >
              <input
                className="input w-12 px-1 text-center font-display"
                value={x.init}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (Number.isFinite(v)) mut((cc) => void (cc.combatants.find((y) => y.uid === x.uid)!.init = v))
                }}
              />
              <span className={`min-w-0 flex-1 truncate ${x.self ? 'font-semibold text-gold' : x.ally ? 'text-good' : ''}`}>
                {isCur && '▶ '}
                {x.self ? char.name || t('combat.you') : x.name}
                {x.ac !== undefined && <span className="ml-1 text-[10px] text-muted">AC {x.ac}</span>}
              </span>
              {x.self ? (
                <span className="text-xs text-muted">
                  {char.hp.current}/{d.hpMax.value} HP
                </span>
              ) : (
                <>
                  {x.hp !== undefined && (
                    <span className={`text-xs ${x.hp === 0 ? 'text-bad' : 'text-muted'}`}>
                      {x.hp}
                      {x.maxHp ? `/${x.maxHp}` : ''} HP
                    </span>
                  )}
                  <div className="flex w-full items-center justify-end gap-1">
                  <input
                    className="input w-14 px-1 text-center text-xs"
                    placeholder="±HP"
                    title={t('combat.quickHpTip')}
                    value={dmgFor[x.uid] ?? ''}
                    onChange={(e) => setDmgFor({ ...dmgFor, [x.uid]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const v = parseInt(dmgFor[x.uid] ?? '', 10)
                      if (!Number.isFinite(v)) return
                      mut((cc) => {
                        const y = cc.combatants.find((z) => z.uid === x.uid)!
                        // Positivt tall = skade, negativt = helbredelse
                        if (y.hp === undefined) y.hp = 0
                        y.hp = Math.max(0, y.hp - v)
                        if (y.maxHp !== undefined) y.hp = Math.min(y.maxHp, y.hp)
                        if (y.hp === 0 && y.maxHp) y.defeated = true
                        if (v > 0) cc.stats.dealt += v
                        addLog(cc, 'damage', `${y.name}: ${v > 0 ? `−${v}` : `+${-v}`} HP`)
                      })
                      setDmgFor({ ...dmgFor, [x.uid]: '' })
                    }}
                  />
                  <button
                    className="btn btn-ghost btn-sm px-1"
                    title={t('combat.duplicate')}
                    onClick={() =>
                      mut((cc) => {
                        const n = cc.combatants.filter((y) => y.name.replace(/ \d+$/, '') === x.name.replace(/ \d+$/, '')).length + 1
                        cc.combatants.push({ ...x, uid: uidc(), name: `${x.name.replace(/ \d+$/, '')} ${n}`, hp: x.maxHp ?? x.hp, defeated: false })
                      })
                    }
                  >
                    <Copy size={12} />
                  </button>
                  <button className="btn btn-ghost btn-sm px-1" title={t('combat.defeated')} onClick={() => mut((cc) => void (cc.combatants.find((y) => y.uid === x.uid)!.defeated = !x.defeated))}>
                    <Skull size={13} className={x.defeated ? 'text-bad' : ''} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm px-1"
                    onClick={() =>
                      mut((cc) => {
                        const curUid = initiativeOrder(cc.combatants)[cc.turnIdx]?.uid
                        cc.combatants = cc.combatants.filter((y) => y.uid !== x.uid)
                        const idx = initiativeOrder(cc.combatants).findIndex((y) => y.uid === curUid)
                        cc.turnIdx = Math.max(0, idx)
                      })
                    }
                  >
                    <Trash2 size={12} />
                  </button>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
      {order.length === 1 && <p className="mt-2 text-xs text-muted">{t('combat.soloHint')}</p>}
      <EntityPicker
        open={bestiary}
        onClose={() => setBestiary(false)}
        kinds={['creature']}
        title={t('combat.bestiary')}
        multi
        groupBy={(e) => (e as CreatureDef).creatureType}
        onConfirm={(_ids, ents) => addCreatures(ents as CreatureDef[])}
      />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-muted">{current?.self ? t('combat.yourTurn') : t('combat.theirTurn', { name: current?.name ?? '' })}</span>
        <button className="btn btn-primary ml-auto" onClick={onNext}>
          {t('combat.nextTurn')} <ChevronDown size={14} className="-rotate-90" />
        </button>
      </div>
      {void physical}
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Logg                                                                */
/* ------------------------------------------------------------------ */

const LOG_COLOR: Record<string, string> = {
  attack: 'text-gold', damage: 'text-bad', heal: 'text-good', spell: 'text-arcane', save: 'text-sky', feature: 'text-gold-2', turn: 'text-muted', info: 'text-muted', death: 'text-crimson-2', action: 'text-ink'
}

export function LogPanel() {
  const { t } = useTranslation()
  const { c } = useCombat()
  const [open, setOpen] = useState(true)
  return (
    <Section
      title={t('combat.log.title')}
      actions={
        <button className="btn btn-ghost btn-sm px-1" onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      }
    >
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-muted">
        <span>{t('combat.st.dealt', { n: c.stats.dealt })}</span>·<span>{t('combat.st.taken', { n: c.stats.taken })}</span>·<span>{t('combat.st.healed', { n: c.stats.healed })}</span>·
        <span>{t('combat.st.hits', { h: c.stats.hits, m: c.stats.misses })}</span>
      </div>
      {open && (
        <div className="max-h-72 space-y-0.5 overflow-y-auto text-sm">
          {c.log.length === 0 && <p className="text-xs text-muted">{t('combat.log.empty')}</p>}
          {c.log.map((l) => (
            <div key={l.uid} className="flex gap-2">
              <span className="w-8 shrink-0 text-right text-[10px] text-faint">R{l.round}</span>
              <span className={LOG_COLOR[l.kind] ?? ''}>{l.text}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

