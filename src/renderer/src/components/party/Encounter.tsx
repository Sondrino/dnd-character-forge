import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Brain, ChevronDown, Copy, Dices, Flag, Plus, Skull, Swords, Trash2, UserPlus } from 'lucide-react'
import type { Character, Combatant, CreatureDef } from '../../types'
import { useCharacters } from '../../store/characters'
import { useCharacter, useLookup, useUi } from '../../store/ui'
import { useRolls } from '../../store/rolls'
import { useParties, type Party, type PartyEncounter } from '../../store/party'
import { computeCharacter } from '../../engine/compute'
import { addLog, advanceTurn, initiativeOrder, uidc } from '../../lib/combat'
import { applyCombatantHp, creatureCombatant, creatureInitMod, hpDice, toggleCombatantCondition } from '../../lib/monsters'
import { addCombatants, applyHpChange, liveMembers, memberCombatant, newEncounter, removeCombatant, setInitiative, toggleCharacterCondition, type HpOutcome } from '../../lib/party'
import { Modal, NumberInput, Section } from '../ui'
import { EntityPicker } from '../EntityPicker'
import { ConditionChips } from '../combat/ConditionChips'
import { signed } from '../combat/useCombat'

type MutE = (recipe: (e: PartyEncounter) => void) => void

/** Fast bredde på knappene til høyre, så HP-kolonnene står på linje */
const ACTIONS = 'flex w-[124px] items-center justify-end gap-0.5'

/** Felles initiativ for gruppen: alle medlemmer (koblet til de ekte karakterene) + monstre fra bestiariet */
export function PartyEncounterView({ party }: { party: Party }) {
  const update = useParties((s) => s.update)
  const mutE: MutE = (recipe) =>
    update(party.id, (p) => {
      if (p.encounter) recipe(p.encounter)
    })
  return party.encounter ? <Tracker party={party} e={party.encounter} mutE={mutE} /> : <Setup party={party} />
}

/* ------------------------------------------------------------------ */
/* Start: initiativ for medlemmene                                     */
/* ------------------------------------------------------------------ */

function Setup({ party }: { party: Party }) {
  const { t } = useTranslation()
  const characters = useCharacters((s) => s.characters)
  const update = useParties((s) => s.update)
  const roll = useRolls((s) => s.roll)
  const L = useLookup()
  const members = liveMembers(party, characters)
  const [init, setInit] = useState<Record<string, string>>({})
  const [skip, setSkip] = useState<string[]>([])
  const mod = (c: Character): { mod: number; adv: boolean } => {
    const d = computeCharacter(c, L)
    return { mod: d.initiative.value, adv: !!d.initiative.advantage?.length }
  }
  const rollFor = (c: Character): number => {
    const m = mod(c)
    return roll(`1d20${signed(m.mod)}`, 'Initiative', { character: c.name, mode: m.adv ? 'advantage' : 'normal' }).total
  }
  const active = members.filter((c) => !skip.includes(c.id))
  const ready = active.length > 0 && active.every((c) => Number.isFinite(parseInt(init[c.id] ?? '', 10)))

  const start = (): void => {
    const list = active.map((c) => memberCombatant(c, parseInt(init[c.id], 10)))
    update(party.id, (p) => {
      const e = newEncounter(list)
      addLog(e, 'turn', t('party.log.start', { names: list.map((x) => `${x.name} (${x.init})`).join(', ') }))
      const first = initiativeOrder(e.combatants)[0]
      if (first) addLog(e, 'turn', t('combat.log.theirTurn', { name: first.name }))
      p.encounter = e
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel mx-auto max-w-3xl p-6">
      <div className="mb-1 flex items-center gap-2 font-display text-2xl text-gold">
        <Swords size={20} /> {t('party.startTitle')}
      </div>
      <p className="mb-4 text-sm text-muted">{t('party.startIntro')}</p>
      {members.length === 0 ? (
        <p className="text-sm text-muted">{t('party.noMembersText')}</p>
      ) : (
        <>
          <div className="mb-2 flex items-center">
            <div className="panel-title">{t('combat.rollInitiative')}</div>
            <button
              className="btn btn-sm ml-auto"
              onClick={() => {
                const next = { ...init }
                for (const c of active) if (!Number.isFinite(parseInt(next[c.id] ?? '', 10))) next[c.id] = String(rollFor(c))
                setInit(next)
              }}
            >
              <Dices size={13} /> {t('party.rollMissing')}
            </button>
          </div>
          <div className="space-y-1.5">
            {members.map((c) => {
              const m = mod(c)
              const off = skip.includes(c.id)
              return (
                <div key={c.id} className={`flex items-center gap-3 rounded-xl border border-line-soft px-3 py-2 ${off ? 'opacity-40' : ''}`}>
                  <input type="checkbox" checked={!off} title={t('party.joins')} onChange={() => setSkip(off ? skip.filter((x) => x !== c.id) : [...skip, c.id])} />
                  <span className="flex-1 font-display text-gold">{c.name || t('common.unnamed')}</span>
                  <span className="text-xs text-muted">
                    {t('combat.init')} {signed(m.mod)}
                    {m.adv && ` · ${t('party.adv')}`}
                  </span>
                  <input
                    className="input w-16 text-center font-display"
                    inputMode="numeric"
                    placeholder="d20"
                    title={t('party.typeInit')}
                    value={init[c.id] ?? ''}
                    disabled={off}
                    onChange={(e) => setInit({ ...init, [c.id]: e.target.value.replace(/[^\d-]/g, '') })}
                  />
                  <button className="btn btn-sm" disabled={off} title={t('party.rollInit')} onClick={() => setInit({ ...init, [c.id]: String(rollFor(c)) })}>
                    <Dices size={13} />
                  </button>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted">{t('party.initHelp')}</p>
          <div className="mt-5 flex justify-end">
            <button className="btn btn-primary" disabled={!ready} onClick={start}>
              <Swords size={15} /> {t('party.startEncounter')}
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Initiativliste                                                      */
/* ------------------------------------------------------------------ */

function Tracker({ party, e, mutE }: { party: Party; e: PartyEncounter; mutE: MutE }) {
  const { t } = useTranslation()
  const characters = useCharacters((s) => s.characters)
  const update = useParties((s) => s.update)
  const roll = useRolls((s) => s.roll)
  const L = useLookup()
  const order = initiativeOrder(e.combatants)
  const current = order[e.turnIdx]
  const [bestiary, setBestiary] = useState(false)
  const [rollHp, setRollHp] = useState(false)
  const [form, setForm] = useState<{ name: string; init: string; hp: string; ac: string; count: number; ally: boolean } | null>(null)
  const [ending, setEnding] = useState(false)
  const missing = liveMembers(party, characters).filter((c) => !e.combatants.some((x) => x.characterId === c.id))

  const next = (): void =>
    mutE((ee) => {
      const r = advanceTurn(ee)
      if (r.newRound) addLog(ee, 'turn', t('combat.log.round', { n: ee.round }))
      addLog(ee, 'turn', t('combat.log.theirTurn', { name: initiativeOrder(ee.combatants)[ee.turnIdx]?.name ?? '' }))
    })

  const addCreatures = (list: CreatureDef[]): void =>
    mutE((ee) => {
      const added: Combatant[] = []
      for (const cr of list) {
        added.push(
          creatureCombatant(cr, {
            existing: [...ee.combatants, ...added],
            init: roll(`1d20${signed(creatureInitMod(cr))}`, `${cr.name} initiative`).total,
            rollHp: rollHp ? (dice) => roll(dice, `${cr.name} HP`).total : undefined
          })
        )
      }
      addCombatants(ee, added)
      addLog(ee, 'info', t('combat.log.joined', { name: list.map((c) => c.name).join(', '), n: list.length }))
    })

  const addCustom = (): void => {
    if (!form?.name.trim()) return
    mutE((ee) => {
      const list: Combatant[] = []
      for (let i = 0; i < form.count; i++) {
        let init = parseInt(form.init, 10)
        if (!Number.isFinite(init)) init = roll('1d20', `${form.name} initiative`).total
        const hp = parseInt(form.hp, 10)
        const ac = parseInt(form.ac, 10)
        list.push({
          uid: uidc(),
          name: form.count > 1 ? `${form.name.trim()} ${i + 1}` : form.name.trim(),
          init,
          ally: form.ally,
          hp: Number.isFinite(hp) ? hp : undefined,
          maxHp: Number.isFinite(hp) ? hp : undefined,
          ac: Number.isFinite(ac) ? ac : undefined
        })
      }
      addCombatants(ee, list)
      addLog(ee, 'info', t('combat.log.joined', { name: form.name.trim(), n: form.count }))
    })
    setForm(null)
  }

  const addMember = (c: Character): void => {
    const d = computeCharacter(c, L)
    const init = roll(`1d20${signed(d.initiative.value)}`, 'Initiative', { character: c.name, mode: d.initiative.advantage?.length ? 'advantage' : 'normal' }).total
    mutE((ee) => {
      addCombatants(ee, [memberCombatant(c, init)])
      addLog(ee, 'info', t('combat.log.joined', { name: c.name, n: 1 }))
    })
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 xl:col-span-8">
        <Section
          title={
            <span className="flex items-center gap-2">
              <Swords size={14} /> {t('combat.roundN', { n: e.round })} · {current ? t('combat.theirTurn', { name: current.name }) : ''}
            </span>
          }
          actions={
            <>
              <button className="btn btn-sm" onClick={() => setEnding(true)}>
                <Flag size={13} /> {t('combat.endCombat')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={next}>
                {t('combat.nextTurn')} <ChevronDown size={13} className="-rotate-90" />
              </button>
            </>
          }
        >
          <div className="space-y-1.5">
            {order.map((x, i) =>
              x.characterId ? (
                <MemberRow key={x.uid} x={x} isCur={i === e.turnIdx} mutE={mutE} />
              ) : (
                <MonsterRow key={x.uid} x={x} isCur={i === e.turnIdx} mutE={mutE} />
              )
            )}
            {order.length === 0 && <p className="text-sm text-muted">{t('party.emptyTracker')}</p>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
            <button className="btn btn-sm" onClick={() => setBestiary(true)} title={t('combat.bestiaryTip')}>
              <BookOpen size={13} /> {t('combat.bestiary')}
            </button>
            <label className="chip cursor-pointer" title={t('party.rollHpTip')}>
              <input type="checkbox" checked={rollHp} onChange={(ev) => setRollHp(ev.target.checked)} /> {t('party.rollHp')}
            </label>
            <button className="btn btn-sm" onClick={() => setForm({ name: '', init: '', hp: '', ac: '', count: 1, ally: false })}>
              <UserPlus size={13} /> {t('combat.addCombatant')}
            </button>
            {missing.map((c) => (
              <button key={c.id} className="btn btn-sm border-good/40 text-good" title={t('party.addBackTip')} onClick={() => addMember(c)}>
                <Plus size={12} /> {c.name || t('common.unnamed')}
              </button>
            ))}
          </div>
          {form && (
            <div className="mt-3 space-y-2 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <input className="input w-40" placeholder={t('combat.name')} value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} onKeyDown={(ev) => ev.key === 'Enter' && addCustom()} autoFocus />
                <input className="input w-20 text-center" placeholder="Init" value={form.init} onChange={(ev) => setForm({ ...form, init: ev.target.value })} title={t('combat.initTip')} />
                <input className="input w-16 text-center" placeholder="HP" value={form.hp} onChange={(ev) => setForm({ ...form, hp: ev.target.value })} />
                <input className="input w-16 text-center" placeholder="AC" value={form.ac} onChange={(ev) => setForm({ ...form, ac: ev.target.value })} />
                <label className="flex items-center gap-1">
                  {t('combat.count')} <NumberInput value={form.count} onChange={(v) => setForm({ ...form, count: v })} min={1} max={20} width={52} />
                </label>
                <label className="flex cursor-pointer items-center gap-1">
                  <input type="checkbox" checked={form.ally} onChange={(ev) => setForm({ ...form, ally: ev.target.checked })} /> {t('combat.ally')}
                </label>
                <button className="btn btn-sm ml-auto" onClick={() => setForm(null)}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn-primary btn-sm" disabled={!form.name.trim()} onClick={addCustom}>
                  <Plus size={12} /> {t('combat.add')}
                </button>
              </div>
              <span className="text-xs text-muted">{t('combat.emptyInitRolls')}</span>
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted">{t('party.trackerHelp')}</p>
        </Section>
      </div>
      <div className="col-span-12 xl:col-span-4">
        <EncounterLog e={e} />
      </div>

      <EntityPicker
        open={bestiary}
        onClose={() => setBestiary(false)}
        kinds={['creature']}
        title={t('combat.bestiary')}
        multi
        groupBy={(x) => (x as CreatureDef).creatureType}
        onConfirm={(_ids, ents) => addCreatures(ents as CreatureDef[])}
      />
      <Modal
        open={ending}
        onClose={() => setEnding(false)}
        title={t('party.endTitle')}
        width={460}
        footer={
          <>
            <button className="btn" onClick={() => setEnding(false)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                update(party.id, (p) => void (p.encounter = undefined))
                setEnding(false)
              }}
            >
              <Flag size={14} /> {t('combat.endCombat')}
            </button>
          </>
        }
      >
        <p className="text-sm">{t('party.endText', { n: e.round })}</p>
      </Modal>
    </div>
  )
}

/** Initiativ-feltet: endrer verdien uten å flytte hvem sin tur det er */
function InitInput({ x, mutE }: { x: Combatant; mutE: MutE }) {
  const [v, setV] = useState(String(x.init))
  useEffect(() => setV(String(x.init)), [x.init])
  const commit = (): void => {
    const n = parseInt(v, 10)
    if (Number.isFinite(n) && n !== x.init) mutE((ee) => setInitiative(ee, x.uid, n))
    else setV(String(x.init))
  }
  return <input className="input w-12 px-1 text-center font-display" value={v} onChange={(ev) => setV(ev.target.value)} onBlur={commit} onKeyDown={(ev) => ev.key === 'Enter' && commit()} />
}

/** ±HP-felt: positivt tall = skade, negativt = helbredelse */
function QuickHp({ onApply }: { onApply: (v: number) => void }) {
  const { t } = useTranslation()
  const [v, setV] = useState('')
  return (
    <input
      className="input w-16 px-1 text-center text-xs"
      placeholder="±HP"
      title={t('combat.quickHpTip')}
      value={v}
      onChange={(ev) => setV(ev.target.value.replace(/[^\d-]/g, ''))}
      onKeyDown={(ev) => {
        if (ev.key !== 'Enter') return
        const n = parseInt(v, 10)
        if (Number.isFinite(n) && n !== 0) onApply(n)
        setV('')
      }}
    />
  )
}

function HpBar({ hp, max, temp }: { hp: number; max?: number; temp?: number }) {
  const pct = max ? Math.max(0, Math.min(1, hp / max)) : 1
  return (
    <span className="flex w-28 flex-col">
      <span className={`text-xs ${hp <= 0 ? 'text-bad' : 'text-muted'}`}>
        <b className="font-display text-sm text-ink">{hp}</b>
        {max !== undefined && `/${max}`} HP{temp ? <span className="text-sky"> +{temp}</span> : null}
      </span>
      {max !== undefined && (
        <span className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-panel-3">
          <motion.span className={`block h-full ${pct < 0.34 ? 'bg-bad' : pct < 0.67 ? 'bg-gold' : 'bg-good'}`} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
        </span>
      )}
    </span>
  )
}

function RowShell({ x, isCur, children }: { x: Combatant; isCur: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: x.defeated ? 0.45 : 1, x: 0 }}
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-2 py-1.5 text-sm ${isCur ? 'border-gold bg-gold/10' : 'border-line-soft'}`}
    >
      {children}
    </motion.div>
  )
}

/** Gruppemedlem: HP, conditions og concentration leses og skrives på den ekte karakteren */
function MemberRow({ x, isCur, mutE }: { x: Combatant; isCur: boolean; mutE: MutE }) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const notify = useUi((s) => s.notify)
  const L = useLookup()
  const { char, derived: d, update } = useCharacter(x.characterId)
  if (!char || !d) {
    return (
      <RowShell x={x} isCur={isCur}>
        <span className="flex-1 text-muted">{x.name} · {t('party.missingChar')}</span>
        <button className="btn btn-ghost btn-sm px-1" onClick={() => mutE((ee) => removeCombatant(ee, (y) => y.uid === x.uid))}>
          <Trash2 size={12} />
        </button>
      </RowShell>
    )
  }
  const max = d.hpMax.value
  const conc = char.combat?.concentration
  const applyHp = (v: number): void => {
    const res: { out?: HpOutcome } = {}
    update((ch) => {
      res.out = applyHpChange(ch, { kind: v > 0 ? 'damage' : 'heal', amount: Math.abs(v) }, { max, resistances: d.resistances, immunities: d.immunities, vulnerabilities: d.vulnerabilities })
      if (ch.combat && res.out.n) addLog(ch.combat, v > 0 ? 'damage' : 'heal', t(`party.log.dm.${v > 0 ? 'damage' : 'heal'}`, { n: res.out.n }))
    })
    const out = res.out
    if (!out) return
    const name = char.name || t('common.unnamed')
    mutE((ee) => {
      if (v > 0) ee.stats.taken += out.n
      else ee.stats.healed += out.n
      addLog(ee, v > 0 ? 'damage' : 'heal', `${name}: ${v > 0 ? `−${out.n}` : `+${out.n}`} HP`)
      if (out.damage?.droppedToZero) addLog(ee, 'death', t('party.log.down', { name }))
      if (out.damage?.deathFailures) addLog(ee, 'death', t('party.log.deathFail', { name, n: out.damage.deathFailures }))
      if (out.damage?.instantDeath) addLog(ee, 'death', t('combat.log.massive'))
      if (out.damage?.concentrationDC) addLog(ee, 'save', t('party.concSave', { name, spell: conc?.name ?? '', dc: out.damage.concentrationDC }))
      if (out.concentrationLost) addLog(ee, 'info', t('party.concLost', { name, spell: out.concentrationLost }))
    })
    if (out.damage?.concentrationDC) notify(t('party.concSave', { name, spell: conc?.name ?? '', dc: out.damage.concentrationDC }))
  }
  return (
    <RowShell x={x} isCur={isCur}>
      <InitInput x={x} mutE={mutE} />
      <span className="flex min-w-0 flex-1 items-center gap-1 truncate">
        {isCur && '▶ '}
        <button className="truncate font-semibold text-gold hover:text-gold-2" title={t('party.openSheet')} onClick={() => nav(`/character/${char.id}`)}>
          {char.name || t('common.unnamed')}
        </button>
        <span className="text-[10px] text-muted">AC {d.ac.value}</span>
        <span className="text-[10px] text-muted">· PP {d.passive.perception.value}</span>
        {conc && (
          <span className="chip border-arcane/50 px-1.5 py-0 text-[10px] text-arcane" title={t('combat.concentrating')}>
            <Brain size={10} /> {conc.name}
          </span>
        )}
        {char.hp.current <= 0 && (
          <span className="chip border-bad/50 px-1.5 py-0 text-[10px] text-bad">
            <Skull size={10} /> ✓{char.deathSaves.successes} ✕{char.deathSaves.failures}
          </span>
        )}
      </span>
      <HpBar hp={char.hp.current} max={max} temp={char.hp.temp} />
      <QuickHp onApply={applyHp} />
      <span className={ACTIONS}>
        <button className="btn btn-ghost btn-sm px-1" title={t('party.removeFromEncounter')} onClick={() => mutE((ee) => removeCombatant(ee, (y) => y.uid === x.uid))}>
          <Trash2 size={12} />
        </button>
      </span>
      <ConditionChips
        className="w-full pl-14"
        value={char.conditions}
        onToggle={(cid) => {
          const res: { on?: boolean; lost?: string } = {}
          update((ch) => {
            const r = toggleCharacterCondition(ch, cid)
            res.on = r.on
            res.lost = r.concentrationLost
          })
          const name = char.name || t('common.unnamed')
          mutE((ee) => {
            addLog(ee, 'info', `${name}: ${res.on ? '+' : '−'} ${L.get('condition', cid)?.name ?? cid}`)
            if (res.lost) addLog(ee, 'info', t('party.concLost', { name, spell: res.lost }))
          })
        }}
      />
    </RowShell>
  )
}

/** Monster eller NPC: HP lagres på deltakeren */
function MonsterRow({ x, isCur, mutE }: { x: Combatant; isCur: boolean; mutE: MutE }) {
  const { t } = useTranslation()
  const L = useLookup()
  const roll = useRolls((s) => s.roll)
  const openDetail = useUi((s) => s.openDetail)
  const cr = x.creatureId ? (L.get('creature', x.creatureId) as CreatureDef | undefined) : undefined
  const dice = hpDice(cr?.hp)
  const mutX = (recipe: (y: Combatant, ee: PartyEncounter) => void): void =>
    mutE((ee) => {
      const y = ee.combatants.find((z) => z.uid === x.uid)
      if (y) recipe(y, ee)
    })
  return (
    <RowShell x={x} isCur={isCur}>
      <InitInput x={x} mutE={mutE} />
      <span className={`flex min-w-0 flex-1 items-center gap-1 truncate ${x.ally ? 'text-good' : ''}`}>
        {isCur && '▶ '}
        {cr ? (
          <button className="entity-link truncate" title={t('party.statBlock')} onClick={() => openDetail({ kind: 'creature', id: cr.id })}>
            {x.name}
          </button>
        ) : (
          <span className="truncate">{x.name}</span>
        )}
        {x.ac !== undefined && <span className="text-[10px] text-muted">AC {x.ac}</span>}
        {x.note && <span className="text-[10px] text-faint">· {x.note}</span>}
      </span>
      {x.hp !== undefined ? <HpBar hp={x.hp} max={x.maxHp} /> : <span className="w-28" />}
      <QuickHp
        onApply={(v) =>
          mutX((y, ee) => {
            applyCombatantHp(y, v)
            if (v > 0) ee.stats.dealt += v
            addLog(ee, 'damage', `${y.name}: ${v > 0 ? `−${v}` : `+${-v}`} HP`)
            if (y.defeated && y.hp === 0) addLog(ee, 'death', t('party.log.defeated', { name: y.name }))
          })
        }
      />
      <span className={ACTIONS}>
      {dice && (
        <button
          className="btn btn-ghost btn-sm px-1"
          title={t('party.rerollHp', { dice })}
          onClick={() => {
            const hp = Math.max(1, roll(dice, `${x.name} HP`).total)
            mutX((y, ee) => {
              y.hp = y.maxHp = hp
              y.defeated = false
              addLog(ee, 'info', t('party.log.hpRolled', { name: y.name, n: hp }))
            })
          }}
        >
          <Dices size={12} />
        </button>
      )}
      <button
        className="btn btn-ghost btn-sm px-1"
        title={t('combat.duplicate')}
        onClick={() =>
          mutE((ee) => {
            const base = x.name.replace(/ \d+$/, '')
            const n = ee.combatants.filter((y) => y.name.replace(/ \d+$/, '') === base).length + 1
            addCombatants(ee, [{ ...x, uid: uidc(), name: `${base} ${n}`, hp: x.maxHp ?? x.hp, defeated: false, conditions: [] }])
          })
        }
      >
        <Copy size={12} />
      </button>
      <button className="btn btn-ghost btn-sm px-1" title={t('combat.defeated')} onClick={() => mutX((y) => void (y.defeated = !y.defeated))}>
        <Skull size={13} className={x.defeated ? 'text-bad' : ''} />
      </button>
      <button className="btn btn-ghost btn-sm px-1" onClick={() => mutE((ee) => removeCombatant(ee, (y) => y.uid === x.uid))}>
        <Trash2 size={12} />
      </button>
      </span>
      <ConditionChips
        className="w-full pl-14"
        value={x.conditions ?? []}
        onToggle={(cid) =>
          mutX((y, ee) => {
            const on = toggleCombatantCondition(y, cid)
            addLog(ee, 'info', `${y.name}: ${on ? '+' : '−'} ${L.get('condition', cid)?.name ?? cid}`)
          })
        }
      />
    </RowShell>
  )
}

const LOG_COLOR: Record<string, string> = {
  attack: 'text-gold', damage: 'text-bad', heal: 'text-good', spell: 'text-arcane', save: 'text-sky', feature: 'text-gold-2', turn: 'text-muted', info: 'text-muted', death: 'text-crimson-2', action: 'text-ink'
}

function EncounterLog({ e }: { e: PartyEncounter }) {
  const { t } = useTranslation()
  return (
    <Section title={t('combat.log.title')}>
      <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-muted">
        <span>{t('party.st.dealt', { n: e.stats.dealt })}</span>·<span>{t('party.st.taken', { n: e.stats.taken })}</span>·<span>{t('combat.st.healed', { n: e.stats.healed })}</span>
      </div>
      <div className="max-h-[520px] space-y-0.5 overflow-y-auto text-sm">
        {e.log.length === 0 && <p className="text-xs text-muted">{t('combat.log.empty')}</p>}
        {e.log.map((l) => (
          <motion.div key={l.uid} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <span className="w-8 shrink-0 text-right text-[10px] text-faint">R{l.round}</span>
            <span className={LOG_COLOR[l.kind] ?? ''}>{l.text}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
