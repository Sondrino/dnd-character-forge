import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Crosshair, Heart, Sparkles, Swords, X } from 'lucide-react'
import type { Combatant, CombatState, SpellDef, WeaponDef } from '../../types'
import type { DerivedAttack } from '../../engine/compute'
import type { RollResult } from '../../dice'
import { Markdown, Modal } from '../ui'
import { EntityLink } from '../EntityInfo'
import { RollBox } from './RollBox'
import { AmmoStatus, ItemFlow } from './ItemFlow'
import { consumeAmmo } from '../../lib/items'
import { classColumn, featureStates, signed, useCombat, type CombatOption, type Economy } from './useCombat'
import { addEffect, addLog, attacksPerAction, offhandBlocked, critDice, dropConcentration, evalAbility, initiativeOrder, resolveDice, rollModeOf } from '../../lib/combat'
import { SpellCast } from '../CastDialog'

const ABIL: Record<string, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

/** Marker handling/bonus/reaction som brukt */
export function spend(c: CombatState, e: Economy): void {
  if (e === 'action') c.turn.action = true
  else if (e === 'bonus') c.turn.bonus = true
  else if (e === 'reaction') c.turn.reaction = true
}

/** Skade på et mål i initiativlista */
export function hurt(c: CombatState, targetUid: string | undefined, amount: number): string {
  const tg = c.combatants.find((x) => x.uid === targetUid)
  if (!tg || tg.self) return ''
  if (tg.hp !== undefined) {
    tg.hp = Math.max(0, tg.hp - amount)
    if (tg.hp === 0) tg.defeated = true
  }
  return tg.name
}

export function Resolver({ opt, onClose }: { opt: CombatOption | null; onClose: () => void }) {
  const { t } = useTranslation()
  const title = !opt
    ? ''
    : opt.kind === 'attack'
      ? opt.key === 'opportunity'
        ? t('combat.opportunity')
        : `${opt.offhand ? t('combat.offhand') + ': ' : ''}${opt.attack?.name}`
      : opt.kind === 'spell'
        ? opt.spell.name
        : opt.kind === 'feature'
          ? opt.feature.name
          : opt.kind === 'item'
            ? opt.name
            : t(`combat.std.${opt.id}`)
  // Slot/bruk er allerede trukket i første steg – spør før dialogen lukkes uten at resultatet er logget
  const [committed, setCommitted] = useState(false)
  useEffect(() => setCommitted(false), [opt?.key])
  return (
    <Modal open={!!opt} onClose={onClose} title={title} width={720} dismissable={false} confirmClose={committed && t('polish.modal.resolverConfirm')}>
      {opt?.kind === 'attack' && <AttackFlow key={opt.key} opt={opt} onDone={onClose} />}
      {opt?.kind === 'spell' && <SpellCast key={opt.key} spell={opt.spell} source={opt.source} onDone={onClose} onCommit={() => setCommitted(true)} />}
      {opt?.kind === 'feature' && <FeatureFlow key={opt.key} opt={opt} onDone={onClose} onCommit={() => setCommitted(true)} />}
      {opt?.kind === 'std' && <StdFlow key={opt.key} id={opt.id} economy={opt.economy} onDone={onClose} />}
      {opt?.kind === 'item' && <ItemFlow key={opt.key} opt={opt} onDone={onClose} />}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Felles småbiter                                                     */
/* ------------------------------------------------------------------ */

/** Advarsel når handlingen er brukt. `attackPer`: dette er et angrep i Attack-handlingen (med så mange angrep) */
export function EconomyWarning({ e, attackPer }: { e: Economy; attackPer?: number }) {
  const { t } = useTranslation()
  const { char, c, outOfCombat } = useCombat()
  const noAttacksLeft = !!attackPer && c.turn.attacks >= attackPer
  const used =
    outOfCombat ? false : e === 'action'
      ? attackPer
        ? c.turn.action && (c.turn.attacks === 0 || noAttacksLeft)
        : c.turn.action
      : e === 'bonus'
        ? c.turn.bonus
        : e === 'reaction'
          ? c.turn.reaction
          : false
  // 0 HP eller en condition som hindrer handlinger (Incapacitated, Unconscious, Stunned, Paralyzed, Petrified)
  const blocker = char.hp.current <= 0 ? 'down' : char.conditions.find((x) => ['incapacitated', 'unconscious', 'stunned', 'paralyzed', 'petrified'].includes(x))
  return (
    <>
      {blocker && e !== 'free' && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-bad/50 bg-bad/15 px-3 py-2 text-sm text-bad">
          <AlertTriangle size={14} /> {blocker === 'down' ? t('combat.blockedDown') : t('combat.blockedCondition', { c: blocker })}
        </div>
      )}
      {used && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson-2">
          <AlertTriangle size={14} /> {noAttacksLeft && e === 'action' ? t('combat.noAttacksLeft') : t(`combat.alreadyUsed.${e}`)}
        </div>
      )}
    </>
  )
}

function TargetPicker({ value, onChange, multi = false, values, onMulti }: { value?: string; onChange?: (v: string | undefined) => void; multi?: boolean; values?: string[]; onMulti?: (v: string[]) => void }) {
  const { t } = useTranslation()
  const { c, outOfCombat } = useCombat()
  const foes = initiativeOrder(c.combatants).filter((x) => !x.self && !x.defeated)
  if (outOfCombat) return null
  if (!foes.length) return <p className="mb-3 text-xs text-muted">{t('combat.noTargetsHint')}</p>
  const on = (uid: string): boolean => (multi ? !!values?.includes(uid) : value === uid)
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1">
      <span className="mr-1 text-xs text-muted">{t(multi ? 'combat.targets' : 'combat.target')}</span>
      {foes.map((f) => (
        <button
          key={f.uid}
          className={`btn btn-sm ${on(f.uid) ? 'btn-primary' : ''}`}
          onClick={() => {
            if (multi) onMulti?.(on(f.uid) ? values!.filter((x) => x !== f.uid) : [...(values ?? []), f.uid])
            else onChange?.(on(f.uid) ? undefined : f.uid)
          }}
        >
          {f.name}
          {f.ac !== undefined && <span className="text-[10px] opacity-70">AC {f.ac}</span>}
          {f.hp !== undefined && <span className="text-[10px] opacity-70">{f.hp} HP</span>}
        </button>
      ))}
    </div>
  )
}

export function Warn({ text }: { text: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson-2">
      <AlertTriangle size={14} className="shrink-0" /> {text}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Angrep (våpen, unarmed, spell attack)                               */
/* ------------------------------------------------------------------ */

interface AttackSetup {
  name: string
  bonus: number
  damage?: string
  damageType?: string
  melee: boolean
  str: boolean
  mastery?: string
  /** Sneak Attack krever et Finesse- eller ranged-våpen */
  sneakOk?: boolean
  /** Advantage/Disadvantage-kilder for angrepsrullet (conditions o.l.) */
  roll?: { advantage?: string[]; disadvantage?: string[] } | null
}

/** Angrepsrull + treff/bom + skade, felles for våpen og spell attacks */
export function AttackRoll({ setup, onFinish, finishLabel }: { setup: AttackSetup; onFinish: (r: { hit: boolean; crit: boolean; damage: number; target?: string }) => void; finishLabel: string }) {
  const { t } = useTranslation()
  const { char, lookup: L, c, mut, physical } = useCombat()
  const [target, setTarget] = useState<string | undefined>(c.combatants.find((x) => !x.self && !x.defeated)?.uid)
  const [atk, setAtk] = useState<number | null>(null)
  const [hit, setHit] = useState<boolean | null>(null)
  const [crit, setCrit] = useState(false)
  const [dmg, setDmg] = useState<number | null>(null)
  const raging = char.activeStates.includes('raging')
  const rageDmg = raging && setup.melee && setup.str ? Number(classColumn(char, L, 'barbarian', 'Rage Damage') ?? 0) : 0
  const sneak = setup.sneakOk && !c.turn.sneakUsed ? (classColumn(char, L, 'rogue', 'Sneak Attack') as string | undefined) : undefined
  const [useSneak, setUseSneak] = useState(false)
  const conc = c.concentration?.spellId
  const markDie = conc === 'hunters-mark' ? '1d6' : conc === 'hex' ? '1d6' : undefined
  const [useMark, setUseMark] = useState(!!markDie)
  const ac = c.combatants.find((x) => x.uid === target)?.ac
  const blessed = c.effects.some((e) => e.spellId === 'bless')
  const rm = rollModeOf(setup.roll)

  const onAttack = (v: number | null, r?: RollResult): void => {
    setAtk(v)
    if (r) {
      setCrit(r.crit)
      if (r.fumble) setHit(false)
      else if (r.crit) setHit(true)
      else if (ac !== undefined) setHit(r.total >= ac)
    } else if (v !== null && ac !== undefined) setHit(v >= ac)
  }
  const extra = [rageDmg ? signed(rageDmg) : '', useSneak && sneak ? `+${sneak}` : '', useMark && markDie ? `+${markDie}` : ''].join('')
  const base = setup.damage ? `${setup.damage}${extra}` : ''
  const dmgNotation = base ? (crit ? critDice(base) : base) : ''
  const masteryRule = setup.mastery ? L.get('rule', `mastery-${setup.mastery}`) : undefined

  return (
    <div className="space-y-3">
      <TargetPicker value={target} onChange={setTarget} />
      <RollBox
        label={t('combat.attackRoll')}
        notation={`1d20${signed(setup.bonus)}${blessed ? '+1d4' : ''}`}
        value={atk}
        onValue={onAttack}
        physical={physical}
        d20
        character={char.name}
        hint={ac !== undefined ? t('combat.vsAC', { ac }) : undefined}
        initialMode={rm.mode}
        modeWhy={rm.why}
        autoFocus
      />
      <div className="flex flex-wrap items-center gap-2">
        <button className={`btn ${hit === true ? 'border-good bg-good/15 text-good' : ''}`} onClick={() => setHit(true)}>
          <Check size={14} /> {t('combat.hit')}
        </button>
        <button className={`btn ${hit === false ? 'border-bad bg-bad/15 text-bad' : ''}`} onClick={() => setHit(false)}>
          <X size={14} /> {t('combat.miss')}
        </button>
        <button className={`btn ${crit ? 'border-gold bg-gold/20 text-gold-2' : ''}`} onClick={() => (setCrit(!crit), setHit(true))}>
          ✦ {t('combat.critical')}
        </button>
        {ac !== undefined && atk !== null && <span className="text-xs text-muted">{atk >= ac ? t('combat.likelyHit') : t('combat.likelyMiss')}</span>}
      </div>
      {masteryRule && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-2 text-xs">
          <b className="text-gold">Mastery: {masteryRule.name.replace(/^Mastery:?\s*/i, '')}</b> – {masteryRule.summary}
        </div>
      )}
      {hit && setup.damage && (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            {rageDmg > 0 && <span className="chip border-crimson/50 text-crimson-2">Rage {signed(rageDmg)}</span>}
            {sneak && (
              <label className="chip cursor-pointer">
                <input type="checkbox" checked={useSneak} onChange={(e) => setUseSneak(e.target.checked)} /> Sneak Attack (+{sneak}) – {t('combat.oncePerTurn')}
              </label>
            )}
            {markDie && (
              <label className="chip cursor-pointer">
                <input type="checkbox" checked={useMark} onChange={(e) => setUseMark(e.target.checked)} /> {c.concentration?.name} (+{markDie})
              </label>
            )}
          </div>
          <RollBox
            key={dmgNotation}
            label={`${t('combat.damage')}${setup.damageType ? ` (${setup.damageType})` : ''}${crit ? ` – ${t('combat.critDouble')}` : ''}`}
            notation={dmgNotation}
            value={dmg}
            onValue={(v) => setDmg(v)}
            physical={physical}
            character={char.name}
          />
        </>
      )}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          disabled={hit === null || (hit && !!setup.damage && dmg === null)}
          onClick={() => {
            if (hit && useSneak && sneak) mut((cc) => void (cc.turn.sneakUsed = true))
            onFinish({ hit: !!hit, crit: !!hit && crit, damage: hit ? (dmg ?? 0) : 0, target })
          }}
        >
          <Swords size={14} /> {finishLabel}
        </button>
      </div>
    </div>
  )
}

function AttackFlow({ opt, onDone }: { opt: Extract<CombatOption, { kind: 'attack' }>; onDone: () => void }) {
  const { t } = useTranslation()
  const { derived: d, lookup: L, c, mut, char } = useCombat()
  const isRanged = (x: DerivedAttack): boolean => x.kind === 'weapon' && (L.get('weapon', x.refId ?? '') as WeaponDef | undefined)?.weaponType === 'ranged'
  // Opportunity Attack: bare nærkampangrep
  const weapons = d.attacks.filter((x) => x.kind !== 'spell' && !isRanged(x))
  const [chosen, setChosen] = useState<DerivedAttack | undefined>(opt.attack ?? weapons[0])
  const a = chosen
  const per = attacksPerAction(d.features.map((f) => f.name))
  if (!a) return <p className="text-muted">{t('combat.noWeapon')}</p>
  const blocked = opt.offhand ? offhandBlocked(c, a.key) : null
  // Nick: ekstra-angrepet er en del av Attack-handlingen i stedet for en bonus action
  const hasNick = (x?: DerivedAttack): boolean => !!x && x.masteryActive && x.mastery === 'nick'
  const nick = !!opt.offhand && (hasNick(a) || hasNick(d.attacks.find((x) => x.key === c.turn.lightUsed)))
  if (blocked)
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {t(`combat.offhandBlocked.${blocked}`)}
        </div>
        <p className="text-sm text-muted">{t('combat.offhandRule')}</p>
      </div>
    )
  // Off-hand: ingen positiv ability-modifier på skaden uten Two-Weapon Fighting
  const twf = char.feats.some((f) => f.featId === 'two-weapon-fighting')
  const damage = opt.offhand && !twf ? (a.offhandDamage ?? a.damage) : a.damage
  const ranged = isRanged(a)
  const usesStr = !ranged && !(a.properties.includes('finesse') && d.abilities.dex.mod > d.abilities.str.mod)
  return (
    <div>
      <EconomyWarning e={opt.via} attackPer={opt.via === 'action' ? per : undefined} />
      {opt.via === 'action' && (
        <p className="mb-3 text-sm text-muted">
          {t('combat.attackCount', { n: Math.min(per, c.turn.attacks + 1), max: per })}
          {c.turn.action && c.turn.attacks === 0 && ` ${t('combat.actionTaken')}`}
        </p>
      )}
      {opt.via === 'reaction' && (
        <>
          <p className="mb-2 text-sm text-muted">{L.get('rule', 'rule-opportunity-attacks')?.summary}</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {weapons.map((w) => (
              <button key={w.key} className={`btn btn-sm ${chosen?.key === w.key ? 'btn-primary' : ''}`} onClick={() => setChosen(w)}>
                {w.name}
              </button>
            ))}
          </div>
        </>
      )}
      {opt.offhand && (
        <p className="mb-3 text-sm text-muted">
          {t(twf ? 'combat.offhandTwf' : 'combat.offhandNote')} {nick && <b className="text-gold">{t('combat.nickNote')}</b>}
        </p>
      )}
      <AmmoStatus attack={a} />
      <AttackRoll
        key={a.key}
        setup={{ name: a.name, bonus: a.bonus?.value ?? 0, damage, damageType: a.damageType, melee: !ranged, str: usesStr, mastery: a.masteryActive ? a.mastery : undefined, sneakOk: ranged || a.properties.includes('finesse'), roll: a.bonus }}
        finishLabel={t('combat.finishAttack')}
        onFinish={(r) => {
          mut((cc, ch) => {
            if (opt.via === 'action') {
              cc.turn.action = true
              cc.turn.attacks += 1
              if (a.properties.includes('light') && !cc.turn.lightUsed) cc.turn.lightUsed = a.key
            } else if (opt.offhand) {
              cc.turn.offhandDone = true
              if (!nick) cc.turn.bonus = true
            } else spend(cc, opt.via)
            // Ammunition-våpen bruker ett stykk ammunisjon per angrep (telles for å hente igjen halvparten etterpå)
            const ammo = consumeAmmo(ch, L, L.get('weapon', a.refId), cc)
            if (ammo) addLog(cc, 'info', t('items.ammoLog', { name: ammo.name, n: ammo.left }))
            const who = hurt(cc, r.target, r.damage)
            if (r.hit) {
              cc.stats.hits += 1
              cc.stats.dealt += r.damage
              if (r.crit) cc.stats.crits += 1
              addLog(cc, 'attack', `${a.name}: ${r.crit ? t('combat.log.crit') : t('combat.log.hit')}${who ? ` ${who}` : ''} – ${r.damage} ${a.damageType}`)
            } else {
              cc.stats.misses += 1
              addLog(cc, 'attack', `${a.name}: ${t('combat.log.miss')}${who ? ` ${who}` : ''}`)
            }
          })
          onDone()
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Spells                                                              */
/* ------------------------------------------------------------------ */

export function SaveSpell({ sp, dc, dice, onDone }: { sp: SpellDef; dc: number; dice?: string; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, c, mut, physical } = useCombat()
  const [targets, setTargets] = useState<string[]>([])
  const [dmg, setDmg] = useState<number | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const halfOnSave = sp.level > 0
  const foes = c.combatants.filter((x) => targets.includes(x.uid))
  // Uten save (f.eks. Magic Missile): skaden treffer automatisk
  const auto = !sp.save
  return (
    <div className="space-y-3">
      {auto ? (
        <p className="rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">{t('combat.autoHit')}</p>
      ) : (
      <div className="rounded-xl border border-gold/40 bg-gold/5 p-3 text-center">
        <div className="text-sm text-muted">{t('combat.targetsSave')}</div>
        <div className="font-display text-2xl text-gold">
          {ABIL[sp.save!]} save · DC {dc}
        </div>
        <div className="text-xs text-muted">{halfOnSave ? t('combat.halfOnSave') : t('combat.noneOnSave')}</div>
      </div>
      )}
      <TargetPicker multi values={targets} onMulti={setTargets} />
      {dice && <RollBox label={`${t('combat.damage')} (${sp.damage?.type ?? ''})`} notation={dice} value={dmg} onValue={(v) => setDmg(v)} physical={physical} character={char.name} />}
      {foes.length > 0 && dice && !auto && (
        <div className="space-y-1">
          {foes.map((f) => (
            <div key={f.uid} className="flex items-center gap-2 text-sm">
              <span className="w-40 truncate">{f.name}</span>
              <button className={`btn btn-sm ${saved[f.uid] === false ? 'border-bad text-bad' : ''}`} onClick={() => setSaved({ ...saved, [f.uid]: false })}>
                {t('combat.failedSave')}
              </button>
              <button className={`btn btn-sm ${saved[f.uid] ? 'border-good text-good' : ''}`} onClick={() => setSaved({ ...saved, [f.uid]: true })}>
                {t('combat.madeSave')}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          disabled={!!dice && dmg === null}
          onClick={() => {
            mut((cc) => {
              const parts: string[] = []
              let total = 0
              for (const f of foes) {
                const amount = saved[f.uid] ? (halfOnSave ? Math.floor((dmg ?? 0) / 2) : 0) : (dmg ?? 0)
                hurt(cc, f.uid, amount)
                total += amount
                parts.push(`${f.name} ${amount}`)
              }
              if (!foes.length && dmg) total = dmg
              cc.stats.dealt += total
              addLog(cc, 'save', `${sp.name}: ${auto ? t('combat.log.auto') : `${ABIL[sp.save!]} DC ${dc}`}${dmg !== null ? ` – ${dmg} ${sp.damage?.type ?? ''}` : ''}${parts.length ? ` (${parts.join(', ')})` : ''}`)
            })
            onDone()
          }}
        >
          <Crosshair size={14} /> {t('common.done')}
        </button>
      </div>
    </div>
  )
}

export function HealSpell({ sp, dice, onDone }: { sp: SpellDef; dice?: string; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, c, mut, physical } = useCombat()
  const all = /^all$/i.test(sp.heal ?? '')
  const [amount, setAmount] = useState<number | null>(sp.heal && /^\d+$/.test(sp.heal) ? Number(sp.heal) : all ? Math.max(0, d.hpMax.value - char.hp.current) : null)
  const allies = c.combatants.filter((x) => x.ally && !x.defeated)
  const [target, setTarget] = useState('self')
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        <button className={`btn btn-sm ${target === 'self' ? 'btn-primary' : ''}`} onClick={() => setTarget('self')}>
          {char.name || t('combat.you')}
        </button>
        {allies.map((a) => (
          <button key={a.uid} className={`btn btn-sm ${target === a.uid ? 'btn-primary' : ''}`} onClick={() => setTarget(a.uid)}>
            {a.name}
          </button>
        ))}
        <button className={`btn btn-sm ${target === 'other' ? 'btn-primary' : ''}`} onClick={() => setTarget('other')}>
          {t('combat.someoneElse')}
        </button>
      </div>
      <RollBox label={t('combat.healing')} notation={dice ?? sp.heal ?? '?'} value={amount} onValue={(v) => setAmount(v)} physical={physical} character={char.name} hint={all ? t('combat.healAll') : undefined} />
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          disabled={amount === null}
          onClick={() => {
            mut((cc, ch) => {
              let n = amount ?? 0
              if (target === 'self') n = healSelf(cc, ch, n, d.hpMax.value)
              else {
                const a = cc.combatants.find((x) => x.uid === target)
                if (a?.hp !== undefined) a.hp = Math.min(a.maxHp ?? Infinity, a.hp + n)
              }
              cc.stats.healed += n
              addLog(cc, 'heal', `${sp.name}: +${n} HP${target !== 'self' ? ` (${cc.combatants.find((x) => x.uid === target)?.name ?? t('combat.someoneElse')})` : ''}`)
            })
            onDone()
          }}
        >
          <Heart size={14} /> {t('common.done')}
        </button>
      </div>
    </div>
  )
}

/** Spells som gir Temporary Hit Points (False Life, Armor of Agathys, Heroism, Power Word Fortify …) */
export function TempSpell({ sp, dice, onDone }: { sp: SpellDef; dice?: string; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, c, mut, physical } = useCombat()
  const selfOnly = /^self$/i.test(sp.range)
  const allies = c.combatants.filter((x) => x.ally && !x.defeated)
  const [target, setTarget] = useState('self')
  const [amount, setAmount] = useState<number | null>(dice && /^\d+$/.test(dice) ? Number(dice) : null)
  const heroism = sp.id === 'heroism'
  return (
    <div className="space-y-3">
      {!selfOnly && (
        <div className="flex flex-wrap gap-1">
          <button className={`btn btn-sm ${target === 'self' ? 'btn-primary' : ''}`} onClick={() => setTarget('self')}>
            {char.name || t('combat.you')}
          </button>
          {allies.map((a) => (
            <button key={a.uid} className={`btn btn-sm ${target === a.uid ? 'btn-primary' : ''}`} onClick={() => setTarget(a.uid)}>
              {a.name}
            </button>
          ))}
          <button className={`btn btn-sm ${target === 'other' ? 'btn-primary' : ''}`} onClick={() => setTarget('other')}>
            {t('combat.someoneElse')}
          </button>
        </div>
      )}
      <RollBox label={t('combat.tempHp')} notation={dice ?? sp.tempHp ?? '?'} value={amount} onValue={(v) => setAmount(v)} physical={physical} character={char.name} />
      <p className="text-xs text-muted">{heroism ? t('combat.heroismNote', { n: amount ?? '?' }) : t('combat.tempNote')}</p>
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          disabled={amount === null}
          onClick={() => {
            mut((cc, ch) => {
              const n = amount ?? 0
              if (target === 'self') {
                ch.hp.temp = Math.max(ch.hp.temp, n)
                if (heroism) {
                  const e = cc.effects.find((x) => x.spellId === 'heroism')
                  if (e) e.tempEachTurn = n
                }
              }
              const who = target === 'self' ? char.name || t('combat.you') : (cc.combatants.find((x) => x.uid === target)?.name ?? t('combat.someoneElse'))
              addLog(cc, 'heal', t('combat.log.tempFrom', { name: sp.name, n, who }))
            })
            onDone()
          }}
        >
          <Heart size={14} /> {t('common.done')}
        </button>
      </div>
    </div>
  )
}

/** Aid: maks HP og nåværende HP øker med 5 per slot-nivå over 1 (5 på nivå 2) */
export function AidSpell({ slotLevel, onDone }: { slotLevel: number; onDone: () => void }) {
  const { t } = useTranslation()
  const { mut } = useCombat()
  const n = 5 * (slotLevel - 1)
  const [self, setSelf] = useState(true)
  return (
    <div className="space-y-3">
      <p className="text-sm">{t('combat.aidText', { n })}</p>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={self} onChange={(e) => setSelf(e.target.checked)} /> {t('combat.aidSelf')}
      </label>
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            mut((cc, ch) => {
              if (self) {
                addEffect(cc, ch, { name: 'Aid', rounds: 4800, spellId: 'aid', note: `+${n} HP max` }, slotLevel)
                ch.hp.current += n
              }
              addLog(cc, 'heal', t('combat.log.aid', { n }))
            })
            onDone()
          }}
        >
          <Heart size={14} /> {t('common.done')}
        </button>
      </div>
    </div>
  )
}

/** Helbred karakteren: fra 0 HP våkner man og death saves nullstilles. Returnerer faktisk helbredet HP. */
export function healSelf(_c: CombatState, ch: import('../../types').Character, n: number, max: number): number {
  if (n <= 0) return 0
  const before = Math.max(0, ch.hp.current)
  ch.hp.current = Math.min(max, before + n)
  if (ch.hp.current > 0) {
    ch.deathSaves = { successes: 0, failures: 0 }
    ch.conditions = ch.conditions.filter((x) => x !== 'unconscious')
  }
  return ch.hp.current - before
}

/* ------------------------------------------------------------------ */
/* Features (Rage, Second Wind, Lay on Hands …)                        */
/* ------------------------------------------------------------------ */

function FeatureFlow({ opt, onDone, onCommit }: { opt: Extract<CombatOption, { kind: 'feature' }>; onDone: () => void; onCommit?: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, c, mut, physical } = useCombat()
  const f = opt.feature
  const econ: Economy = f.activation === 'action' || f.activation === 'bonus' || f.activation === 'reaction' ? f.activation : 'free'
  const left = f.uses ? f.uses.max - f.uses.used : undefined
  const pool = !!f.uses && f.uses.max > 12
  const [spendN, setSpendN] = useState(1)
  const states = [...new Set([...featureStates(d, f), ...(f.toggle ? [f.toggle] : [])])]
  const [phase, setPhase] = useState<'use' | 'roll'>('use')
  const fighterLvl = char.classes.find((x) => x.classId === 'fighter')?.level ?? 0
  const heal = /second wind/i.test(f.name) ? `1d10+${fighterLvl}` : undefined
  const [healAmt, setHealAmt] = useState<number | null>(null)
  const poolHeal = pool && /lay on hands/i.test(f.name)
  useEffect(() => setSpendN(pool ? Math.min(5, left ?? 1) : 1), [pool])
  const isRage = /^rage$/i.test(f.name)
  const text = `${f.summary} ${f.description}`
  const mentionsTemp = /temporary hit points/i.test(text)
  const mentionsHeal = !heal && !poolHeal && /regains? .{0,60}hit points|restore .{0,40}hit points/i.test(text)
  const [extraTemp, setExtraTemp] = useState('')
  const [extraHeal, setExtraHeal] = useState('')
  const rounds = f.duration ?? (isRage ? 100 : states.length ? 10 : undefined)
  const heavyArmor = isRage && d.armorWorn?.category === 'heavy'

  if (phase === 'roll' && f.roll) return <FeatureRollStep f={f} onDone={onDone} />
  return (
    <div className="space-y-3">
      <EconomyWarning e={econ} />
      {heavyArmor && <Warn text={t('combat.rageHeavy')} />}
      {isRage && c.concentration && <Warn text={t('combat.rageConc', { name: c.concentration.name })} />}
      {f.concentration && c.concentration && <div className="rounded-xl border border-arcane/40 bg-arcane/10 px-3 py-2 text-sm">{t('combat.replaceConc', { name: c.concentration.name })}</div>}
      <div className="flex flex-wrap gap-2 text-xs">
        {econ !== 'free' && <span className="chip">{t(`combat.econ.${econ}`)}</span>}
        {f.uses && (
          <span className={`chip ${left! > 0 ? '' : 'border-bad text-bad'}`}>
            {t('combat.usesLeft', { n: left, max: f.uses.max })} · {t(`combat.recharge.${f.uses.recharge}`)}
          </span>
        )}
        {f.concentration && <span className="chip border-arcane/50 text-arcane">Concentration</span>}
        {states.map((s) => (
          <span key={s} className="chip border-gold/50 text-gold">
            {t('combat.turnsOn', { state: s })}
          </span>
        ))}
      </div>
      <Markdown text={f.description || f.summary} compact />
      {pool && (
        <div className="flex items-center gap-2">
          <span className="text-sm">{t('combat.spendFromPool')}</span>
          <input className="input w-20 text-center" type="number" min={1} max={left} value={spendN} onChange={(e) => setSpendN(Math.max(1, Math.min(left ?? 1, Number(e.target.value) || 1)))} />
          <span className="text-xs text-muted">/ {left}</span>
        </div>
      )}
      {heal && <RollBox label={t('combat.healing')} notation={heal} value={healAmt} onValue={(v) => setHealAmt(v)} physical={physical} character={char.name} />}
      {(mentionsTemp || mentionsHeal) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line-soft p-3 text-sm">
          {mentionsTemp && (
            <label className="flex items-center gap-2">
              {t('combat.featureTemp')}
              <input className="input w-20 text-center" inputMode="numeric" value={extraTemp} onChange={(e) => setExtraTemp(e.target.value.replace(/[^\d]/g, ''))} />
            </label>
          )}
          {mentionsHeal && (
            <label className="flex items-center gap-2">
              {t('combat.featureHeal')}
              <input className="input w-20 text-center" inputMode="numeric" value={extraHeal} onChange={(e) => setExtraHeal(e.target.value.replace(/[^\d]/g, ''))} />
            </label>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          disabled={(left !== undefined && left <= 0) || (!!heal && healAmt === null)}
          onClick={() => {
            mut((cc, ch) => {
              if (f.uses) ch.featureUses[f.key] = Math.min(f.uses.max, (ch.featureUses[f.key] ?? 0) + (pool ? spendN : 1))
              spend(cc, econ)
              for (const s of states) if (!ch.activeStates.includes(s)) ch.activeStates.push(s)
              // Rage: ingen concentration mens du raser
              if (isRage && cc.concentration) {
                addLog(cc, 'info', t('combat.log.concLost', { name: cc.concentration.name }))
                dropConcentration(cc, ch)
              }
              // Evner med concentration (egne evner, homebrew): som spells – avslutter annen concentration
              if (f.concentration) {
                if (cc.concentration) addLog(cc, 'info', t('combat.log.concLost', { name: cc.concentration.name }))
                dropConcentration(cc, ch)
                cc.concentration = { name: f.name, since: cc.round }
              }
              if (states.length || isRage || f.concentration) addEffect(cc, ch, { name: f.name, rounds, state: states[0], concentration: f.concentration })
              const rolled = heal ? (healAmt ?? 0) : poolHeal ? spendN : Number(extraHeal) || 0
              const tempGain = Number(extraTemp) || 0
              if (tempGain) ch.hp.temp = Math.max(ch.hp.temp, tempGain)
              const healed = rolled ? healSelf(cc, ch, rolled, d.hpMax.value) : 0
              cc.stats.healed += healed
              addLog(cc, 'feature', `${f.name}${pool ? ` (${spendN})` : ''}${rolled ? ` – +${healed} HP` : ''}${tempGain ? ` – ${tempGain} temp HP` : ''}`)
            })
            if (f.roll) {
              setPhase('roll')
              onCommit?.()
            } else onDone()
          }}
        >
          <Sparkles size={14} /> {t('combat.use')}
        </button>
      </div>
    </div>
  )
}

/** Egne evner: angrep, save, skade, healing eller temp HP etter at evnen er brukt */
function FeatureRollStep({ f, onDone }: { f: Extract<CombatOption, { kind: 'feature' }>['feature']; onDone: () => void }) {
  const { t } = useTranslation()
  const { derived: d, mut } = useCombat()
  const r = f.roll!
  const dice = r.dice ? resolveDice(r.dice, d) : undefined
  // Gjenbruk spell-stegene med et «pseudo-spell» bygget fra evnen
  const pseudo: SpellDef = {
    id: f.id, name: f.name, kind: 'spell', source: 'Homebrew', summary: f.summary, description: f.description,
    level: r.halfOnSave === false ? 0 : 1, school: 'Evocation', castingTime: '', range: r.range ?? (r.kind === 'heal' || r.kind === 'temp' ? 'Touch' : ''),
    components: { v: false, s: false }, duration: '', concentration: false, ritual: false, classes: [],
    save: r.kind === 'save' ? (r.save ?? 'dex') : undefined,
    damage: dice && (r.kind === 'save' || r.kind === 'damage') ? { dice, type: r.damageType ?? '' } : undefined,
    heal: r.kind === 'heal' ? dice : undefined,
    tempHp: r.kind === 'temp' ? dice : undefined
  }
  if (r.kind === 'attack')
    return (
      <AttackRoll
        setup={{ name: f.name, bonus: evalAbility(r.attack || 'prof', d) ?? 0, damage: dice, damageType: r.damageType, melee: r.melee !== false, str: false, roll: d.attacks.find((x) => x.kind === 'unarmed')?.bonus }}
        finishLabel={t('combat.finishAttack')}
        onFinish={(res) => {
          mut((cc) => {
            const who = hurt(cc, res.target, res.damage)
            if (res.hit) {
              cc.stats.hits += 1
              cc.stats.dealt += res.damage
              if (res.crit) cc.stats.crits += 1
            } else cc.stats.misses += 1
            addLog(cc, 'attack', `${f.name}: ${res.hit ? (res.crit ? t('combat.log.crit') : t('combat.log.hit')) : t('combat.log.miss')}${who ? ` ${who}` : ''}${res.hit ? ` – ${res.damage} ${r.damageType ?? ''}` : ''}`)
          })
          onDone()
        }}
      />
    )
  if (r.kind === 'save' || r.kind === 'damage') return <SaveSpell sp={pseudo} dc={evalAbility(r.dc || '8+prof', d) ?? 10} dice={dice} onDone={onDone} />
  if (r.kind === 'heal') return <HealSpell sp={pseudo} dice={dice} onDone={onDone} />
  return <TempSpell sp={pseudo} dice={dice} onDone={onDone} />
}

/* ------------------------------------------------------------------ */
/* Standardhandlinger                                                  */
/* ------------------------------------------------------------------ */

function StdFlow({ id, economy, onDone }: { id: string; economy: Economy; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, c, mut, physical } = useCombat()
  const rule = L.get('rule', id === 'grapple' || id === 'shove' ? 'rule-unarmed-strike' : `rule-${id}`)
  const dc = 8 + d.abilities.str.mod + d.pb.value
  const [stealth, setStealth] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const per = d.features.some((f) => /extra attack/i.test(f.name))
  return (
    <div className="space-y-3">
      <EconomyWarning e={economy} attackPer={(id === 'grapple' || id === 'shove') && per ? attacksPerAction(d.features.map((f) => f.name)) : undefined} />
      {(id === 'grapple' || id === 'shove') && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm">
          {t(`combat.${id}Text`, { dc })}
          {per && <div className="mt-1 text-xs text-muted">{t('combat.replacesAttack')}</div>}
        </div>
      )}
      {id === 'dash' && <p className="text-sm">{t('combat.dashText', { n: d.speed.value })}</p>}
      {id === 'hide' && (
        <RollBox label="Dexterity (Stealth)" notation={`1d20${signed(d.skills.stealth.value)}`} value={stealth} onValue={(v) => setStealth(v)} physical={physical} d20 character={char.name} hint="DC 15" initialMode={rollModeOf(d.skills.stealth).mode} modeWhy={rollModeOf(d.skills.stealth).why} />
      )}
      {id === 'hide' && stealth !== null && <p className={`text-sm ${stealth >= 15 ? 'text-good' : 'text-bad'}`}>{stealth >= 15 ? t('combat.hidden') : t('combat.notHidden')}</p>}
      {id === 'ready' && <input className="input" placeholder={t('combat.readyPlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />}
      {rule && (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-line-soft p-3 text-sm">
          <Markdown text={rule.description} compact />
        </div>
      )}
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            mut((cc, ch) => {
              if ((id === 'grapple' || id === 'shove') && per) {
                cc.turn.action = true
                cc.turn.attacks += 1
              } else spend(cc, economy)
              if (id === 'dash') cc.turn.dashed = true
              if (id === 'dodge') addEffect(cc, ch, { name: 'Dodge', rounds: 1, note: t('combat.dodgeNote') })
              if (id === 'disengage') addEffect(cc, ch, { name: 'Disengage', rounds: 1, note: t('combat.disengageNote') })
              if (id === 'hide' && stealth !== null && stealth >= 15) addEffect(cc, ch, { name: 'Hidden', note: `Stealth ${stealth}` })
              if (id === 'ready') addEffect(cc, ch, { name: 'Ready', rounds: 1, note })
              addLog(cc, 'action', `${t(`combat.std.${id}`)}${id === 'hide' && stealth !== null ? ` (Stealth ${stealth})` : ''}${note ? `: ${note}` : ''}`)
            })
            onDone()
          }}
        >
          <Check size={14} /> {t('combat.doIt')}
        </button>
      </div>
      {void c}
    </div>
  )
}

export type { Combatant }
