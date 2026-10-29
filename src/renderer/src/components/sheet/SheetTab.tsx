import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, Shield, Zap, Footprints, Eye, Star, Skull, Plus, Minus, Swords, Sparkles, Ruler, Crown } from 'lucide-react'
import type { Ability, ArmorCategory } from '../../types'
import { ABILITIES } from '../../types'
import { abilityNames, skills } from '../../data/skills'
import { useChar } from './context'
import { BigStat, StatValue } from '../Stat'
import { AnimatedNumber, Section, Tip, NumberInput } from '../ui'
import { useRolls } from '../../store/rolls'
import { d20 } from '../../dice'
import { EntityLink } from '../EntityInfo'
import { applyDamage, deathSave } from '../../lib/combat'
import { useAmmo } from './AmmoBadge'
import type { DerivedAttack, DerivedFeature } from '../../engine/compute'
import { WildShapePanel } from './WildShapePanel'
import { CompanionsPanel } from './CompanionsPanel'

export function SheetTab() {
  return (
    <div className="space-y-4">
      <TopBand />
      <AbilityColumn />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-7">
          <AttacksSection />
          <WildShapePanel />
          <FeatureSummary />
        </div>
        <div className="col-span-12 space-y-4 lg:col-span-5">
          <ProficiencySection />
          <ConditionsSection />
          <DefensesSection />
          <CompanionsPanel />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function TopBand() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const roll = useRolls((s) => s.roll)
  return (
    <div className="grid grid-cols-12 gap-3">
      <motion.div whileHover={{ y: -2 }} className="relative col-span-3 flex flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-b from-panel-3 to-panel-2 py-2 xl:col-span-2">
        <Shield className="absolute inset-0 m-auto text-gold/10" size={86} strokeWidth={1} />
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">Armor Class</div>
        <div className="font-display text-4xl font-bold">
          <StatValue stat={d.ac} okey="ac" update={update} signed={false} rollable={false} />
        </div>
        <div className="text-[10px] text-muted">{d.armorWorn?.name ?? t('sheet.unarmored')}{d.shieldWorn ? ' + Shield' : ''}</div>
      </motion.div>
      <HpBox />
      <HitDiceBox />
      <DeathSaves />
      <BigStat className="col-span-3" label={t('sheet.initiative')} icon={<Zap size={11} />}>
        <StatValue stat={d.initiative} okey="initiative" update={update} rollLabel="Initiative" characterName={char.name} />
      </BigStat>
      <BigStat className="col-span-3" label={t('sheet.speed')} icon={<Footprints size={11} />} sub={[d.speed.fly && `Fly ${d.speed.fly}`, d.speed.swim && `Swim ${d.speed.swim}`, d.speed.climb && `Climb ${d.speed.climb}`].filter(Boolean).join(' · ') || 'ft.'}>
        <StatValue stat={d.speed} okey="speed" update={update} signed={false} rollable={false} />
      </BigStat>
      <BigStat className="col-span-3" label={t('sheet.passivePerception')} icon={<Eye size={11} />}>
        <StatValue stat={d.passive.perception} okey="passive.perception" update={update} signed={false} rollable={false} />
      </BigStat>
      <div className="col-span-3 grid grid-rows-2 gap-2">
        <div className="flex items-center justify-between rounded-xl border border-line-soft bg-panel-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">PB</span>
          <span className="font-display text-xl font-bold">
            <StatValue stat={d.pb} okey="pb" update={update} rollable={false} />
          </span>
        </div>
        <button
          onClick={() => update((c) => void (c.heroicInspiration = !c.heroicInspiration))}
          className={`flex items-center justify-between rounded-xl border px-3 transition-colors ${char.heroicInspiration ? 'border-gold bg-gold/20 text-gold-2' : 'border-line-soft bg-panel-2 text-muted'}`}
          title="Heroic Inspiration"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">{t('sheet.inspiration')}</span>
          <motion.span animate={char.heroicInspiration ? { rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] } : {}}>
            <Star size={16} fill={char.heroicInspiration ? 'currentColor' : 'none'} />
          </motion.span>
        </button>
      </div>
      <div className="col-span-12 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="chip">
          <Ruler size={11} /> {t('sheet.size')}: {d.size}
        </span>
        <span className="chip">
          {t('sheet.passiveInsight')} {d.passive.insight.value}
        </span>
        <span className="chip">
          {t('sheet.passiveInvestigation')} {d.passive.investigation.value}
        </span>
        {d.senses.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        <button className="btn btn-ghost btn-sm ml-auto" onClick={() => roll('1d20', 'd20')}>
          🎲 d20
        </button>
      </div>
    </div>
  )
}

function HpBox() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const [amount, setAmount] = useState(1)
  const max = d.hpMax.value
  const pct = max ? Math.max(0, Math.min(1, char.hp.current / max)) : 0
  const [flash, setFlash] = useState<'dmg' | 'heal' | null>(null)
  const apply = (kind: 'dmg' | 'heal' | 'temp'): void => {
    update((c) => {
      if (kind === 'heal') c.hp.current = Math.min(max, Math.max(0, c.hp.current) + amount)
      else if (kind === 'temp') c.hp.temp = Math.max(c.hp.temp, amount)
      else {
        // Samme regler som i kampmodus: temp HP først, 0 HP = bevisstløs, skade på 0 HP = death save-feil
        const r = applyDamage({ current: c.hp.current, temp: c.hp.temp, max, amount, resistances: [], immunities: [], vulnerabilities: [], concentrating: false })
        c.hp.current = r.current
        c.hp.temp = r.temp
        if (r.droppedToZero && !c.conditions.includes('unconscious')) c.conditions.push('unconscious')
        if (r.deathFailures) c.deathSaves = { successes: c.deathSaves.successes >= 3 ? 0 : c.deathSaves.successes, failures: Math.min(3, c.deathSaves.failures + r.deathFailures) }
      }
      if (c.hp.current > 0) {
        c.deathSaves = { successes: 0, failures: 0 }
        c.conditions = c.conditions.filter((x) => x !== 'unconscious')
      }
    })
    if (kind !== 'temp') {
      setFlash(kind)
      setTimeout(() => setFlash(null), 450)
    }
  }
  return (
    <motion.div
      animate={flash === 'dmg' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`relative col-span-9 overflow-hidden rounded-2xl border bg-panel-2 px-3 py-2 xl:col-span-4 ${flash === 'dmg' ? 'border-bad' : flash === 'heal' ? 'border-good' : 'border-line-soft'}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
          <Heart size={11} /> {t('sheet.hitPoints')}
        </span>
        <span className="text-[10px] text-muted">
          {t('sheet.max')} <StatValue stat={d.hpMax} okey="hp.max" update={update} signed={false} rollable={false} />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-3xl font-bold">
          <AnimatedNumber value={char.hp.current} />
        </span>
        <span className="pb-1 text-muted">/ {max}</span>
        {char.hp.temp > 0 && <span className="mb-1 chip border-sky/50 text-sky">+{char.hp.temp} temp</span>}
        <div className="ml-auto flex items-center gap-1 pb-1">
          <NumberInput value={amount} onChange={setAmount} min={1} width={48} className="py-0.5" />
          <button className="btn btn-sm border-bad/40 px-2 text-bad" onClick={() => apply('dmg')} title={t('sheet.damage')}>
            <Minus size={13} />
          </button>
          <button className="btn btn-sm border-good/40 px-2 text-good" onClick={() => apply('heal')} title={t('sheet.heal')}>
            <Plus size={13} />
          </button>
          <button className="btn btn-sm px-2 text-sky" onClick={() => apply('temp')} title={t('sheet.temp')}>
            T
          </button>
        </div>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct > 0.5 ? 'var(--good)' : pct > 0.25 ? 'var(--gold)' : 'var(--bad)' }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </motion.div>
  )
}

function HitDiceBox() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const roll = useRolls((s) => s.roll)
  return (
    <div className="col-span-6 rounded-2xl border border-line-soft bg-panel-2 px-3 py-2 xl:col-span-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">{t('sheet.hitDice')}</div>
      <div className="mt-1 space-y-1">
        {d.hitDice.map((h) => (
          <div key={h.die} className="flex items-center gap-2">
            <span className="font-display text-lg">
              {h.total - h.used}/{h.total}
            </span>
            <span className="text-muted">d{h.die}</span>
            <button
              className="btn btn-sm ml-auto"
              disabled={h.used >= h.total}
              title={t('sheet.spendHitDie')}
              onClick={() => {
                const r = roll(`1d${h.die}${d.abilities.con.mod >= 0 ? '+' : ''}${d.abilities.con.mod}`, `Hit Die (d${h.die})`, { character: char.name })
                update((c) => {
                  c.hitDiceUsed[String(h.die)] = (c.hitDiceUsed[String(h.die)] ?? 0) + 1
                  c.hp.current = Math.min(d.hpMax.value, c.hp.current + Math.max(1, r.total))
                })
              }}
            >
              🎲
            </button>
          </div>
        ))}
        {!d.hitDice.length && <div className="text-xs text-faint">—</div>}
      </div>
    </div>
  )
}

function DeathSaves() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const roll = useRolls((s) => s.roll)
  const ds = char.deathSaves
  const set = (k: 'successes' | 'failures', n: number): void => update((c) => void (c.deathSaves[k] = c.deathSaves[k] === n ? n - 1 : n))
  return (
    <div className={`col-span-6 rounded-2xl border px-3 py-2 xl:col-span-3 ${char.hp.current <= 0 && char.classes.length ? 'glow border-bad/60 bg-bad/10' : 'border-line-soft bg-panel-2'}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
          <Skull size={11} /> {t('sheet.deathSaves')}
        </span>
        <button
          className="btn btn-ghost btn-sm px-1"
          onClick={() => {
            // Exhaustion trekker fra death saves (de er saving throws)
            const r = roll(char.exhaustion ? `1d20-${2 * Math.min(6, char.exhaustion)}` : '1d20', 'Death Saving Throw', { character: char.name })
            update((c) => {
              const res = deathSave(r.natural === 20 ? 20 : r.natural === 1 ? 1 : r.total, c.deathSaves)
              if (res.revived) {
                c.hp.current = 1
                c.deathSaves = { successes: 0, failures: 0 }
                c.conditions = c.conditions.filter((x) => x !== 'unconscious')
              } else c.deathSaves = { successes: res.successes, failures: res.failures }
            })
          }}
        >
          🎲
        </button>
      </div>
      {ds.successes >= 3 && <div className="text-[11px] font-semibold text-good">{t('sheet.stable')}</div>}
      {ds.failures >= 3 && <div className="text-[11px] font-semibold text-bad">{t('sheet.dead')}</div>}
      {(['successes', 'failures'] as const).map((k) => (
        <div key={k} className="flex items-center gap-2 text-xs">
          <span className="w-16 text-muted">{k === 'successes' ? t('sheet.successes') : t('sheet.failures')}</span>
          {[1, 2, 3].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.8 }}
              onClick={() => set(k, n)}
              className={`h-4 w-4 rounded-full border ${ds[k] >= n ? (k === 'successes' ? 'border-good bg-good' : 'border-bad bg-bad') : 'border-line'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function AbilityColumn() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {ABILITIES.map((a, i) => (
        <motion.div key={a} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <AbilityBlock a={a} />
        </motion.div>
      ))}
    </div>
  )
}

function AbilityBlock({ a }: { a: Ability }) {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const roll = useRolls((s) => s.roll)
  const ab = d.abilities[a]
  const save = d.saves[a]
  const sk = skills.filter((s) => s.ability === a)
  return (
    <div className="panel h-full p-3">
      <div className="flex items-center gap-3">
        <button
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-panel-3 to-panel-2 transition-colors hover:border-gold"
          onClick={() => roll(d20(d.checks[a].value), `${abilityNames[a]} check`, { character: char.name })}
          title={t('sheet.rollCheck')}
        >
          <span className="font-display text-2xl font-bold leading-none">
            <AnimatedNumber value={ab.mod} signed />
          </span>
          <span className="mt-0.5 text-[11px] text-muted">
            <StatValue stat={ab.score} okey={`ability.${a}`} update={update} signed={false} rollable={false} />
          </span>
        </button>
        <div className="min-w-0">
          <div className="font-display text-[13px] font-bold uppercase tracking-wider text-gold">{abilityNames[a]}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <ProfDot on={save.proficient} />
            <span className="text-muted">{t('sheet.save')}</span>
            <StatValue stat={save} okey={`save.${a}`} update={update} rollLabel={`${abilityNames[a]} save`} characterName={char.name} />
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        {sk.map((s) => {
          const v = d.skills[s.id]
          return (
            <div key={s.id} className="flex items-center gap-1.5 rounded-md px-1 text-[12.5px] hover:bg-panel-2">
              <button
                title={t('sheet.toggleProf')}
                onClick={() =>
                  update((c) => {
                    const inExtra = c.extra.skills.includes(s.id)
                    const inExp = c.extra.expertise.includes(s.id)
                    if (!v.proficient) c.extra.skills.push(s.id)
                    else if (inExtra && !inExp && !v.expertise) {
                      c.extra.expertise.push(s.id)
                    } else if (inExp) {
                      c.extra.expertise = c.extra.expertise.filter((x) => x !== s.id)
                      c.extra.skills = c.extra.skills.filter((x) => x !== s.id)
                    } else if (!v.expertise) c.extra.expertise.push(s.id)
                  })
                }
              >
                <ProfDot on={v.proficient} expertise={v.expertise} />
              </button>
              <Tip content={s.summary}>
                <span className={v.proficient ? 'text-ink' : 'text-muted'}>{s.name}</span>
              </Tip>
              {!!v.advantage?.length && <span className="text-[9px] font-bold text-good">ADV</span>}
              {!!v.disadvantage?.length && <span className="text-[9px] font-bold text-bad">DIS</span>}
              <span className="ml-auto pr-5">
                <StatValue stat={v} okey={`skill.${s.id}`} update={update} rollLabel={s.name} characterName={char.name} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfDot({ on, expertise }: { on: boolean; expertise?: boolean }) {
  return (
    <span className={`inline-flex h-3 w-3 items-center justify-center rounded-full border ${on ? 'border-gold bg-gold' : 'border-line'}`}>
      {expertise && <span className="h-1.5 w-1.5 rounded-full bg-[#1d1408]" />}
    </span>
  )
}

/* ------------------------------------------------------------------ */

function AttacksSection() {
  const { t } = useTranslation()
  const { derived: d, goTo } = useChar()
  return (
    <Section
      title={
        <span className="flex items-center gap-1.5">
          <Swords size={13} /> {t('sheet.weaponsCantrips')}
        </span>
      }
      actions={
        <button className="btn btn-ghost btn-sm" onClick={() => goTo?.('inventory')}>
          <Plus size={13} /> {t('sheet.addWeapon')}
        </button>
      }
    >
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
            <th className="pb-1 font-semibold">{t('sheet.name')}</th>
            <th className="pb-1 font-semibold">{t('sheet.atkDc')}</th>
            <th className="pb-1 font-semibold">{t('sheet.damage')}</th>
            <th className="pb-1 font-semibold">{t('sheet.notes')}</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {d.attacks.map((a) => (
              <AttackRow key={a.key} a={a} />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </Section>
  )
}

function AttackRow({ a }: { a: DerivedAttack }) {
  const { char, update } = useChar()
  const roll = useRolls((s) => s.roll)
  const ammo = useAmmo(a)
  const [critNext, setCritNext] = useState(false)
  const dmgNotation = a.damage.replace(/\s/g, '')
  const rollableDamage = /\d*d\d+/.test(dmgNotation)
  return (
    <motion.tr layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="border-t border-line-soft">
      <td className="py-1.5 pr-2">
        {a.refId ? <EntityLink kind={a.kind === 'spell' ? 'spell' : 'weapon'} id={a.refId}>{a.name}</EntityLink> : a.name}
        {a.mastery && (
          <span className={`ml-1.5 text-[10px] uppercase ${a.masteryActive ? 'text-gold' : 'text-faint line-through'}`}>
            <EntityLink kind="rule" id={`mastery-${a.mastery}`}>{a.mastery}</EntityLink>
          </span>
        )}
        {ammo.badge}
      </td>
      <td className="py-1.5 pr-5">
        {a.bonus ? (
          <StatValue
            stat={a.bonus}
            okey={a.kind === 'weapon' ? `attack.${a.key}.bonus` : a.kind === 'unarmed' ? 'attack.unarmed.bonus' : `spell.attack.x`}
            update={a.kind === 'spell' ? () => {} : update}
            rollLabel={`${a.name} attack`}
            characterName={char.name}
            onRoll={ammo.onRoll}
          />
        ) : a.save ? (
          <span className="text-xs">
            DC {a.save.dc} {a.save.ability.toUpperCase()}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="py-1.5 pr-2">
        <button
          disabled={!rollableDamage}
          className={`rounded px-1 ${rollableDamage ? 'hover:bg-gold/15 hover:text-gold-2' : ''} ${critNext ? 'text-gold-2' : ''}`}
          onClick={() => {
            roll(dmgNotation, `${a.name} damage${critNext ? ' (crit)' : ''}`, { critDouble: critNext, character: char.name })
            setCritNext(false)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setCritNext(!critNext)
          }}
          title="Klikk: rull skade · Høyreklikk: krit (dobbel terning)"
        >
          {a.damage} <span className="text-xs text-muted">{a.damageType}</span>
        </button>
      </td>
      <td className="py-1.5 text-[11px] text-muted">
        {[a.range, ...a.properties.filter((p) => p !== 'range').map((p) => p.charAt(0).toUpperCase() + p.slice(1)), ...a.notes].filter(Boolean).join(' · ')}
      </td>
    </motion.tr>
  )
}

/* ------------------------------------------------------------------ */

export function UsesTracker({ f }: { f: DerivedFeature }) {
  const { update } = useChar()
  if (!f.uses) return null
  const { max, used } = f.uses
  if (max > 12) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <button className="btn btn-sm px-1.5" onClick={() => update((c) => void (c.featureUses[f.key] = Math.min(max, used + 1)))}>
          −
        </button>
        <span className="font-display">
          {max - used}/{max}
        </span>
        <button className="btn btn-sm px-1.5" onClick={() => update((c) => void (c.featureUses[f.key] = Math.max(0, used - 1)))}>
          +
        </button>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5" title={`${max - used}/${max} · ${f.uses.recharge}`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.7 }}
          onClick={() => update((c) => void (c.featureUses[f.key] = i < used ? i : i + 1))}
          className={`h-3.5 w-3.5 rotate-45 border ${i < max - used ? 'border-gold bg-gold/80' : 'border-line bg-transparent'}`}
          style={{ borderRadius: 3 }}
        />
      ))}
    </span>
  )
}

function FeatureSummary() {
  const { t } = useTranslation()
  const { derived: d, goTo } = useChar()
  const groups: { title: string; icon: React.ReactElement; items: DerivedFeature[] }[] = [
    { title: t('sheet.classFeatures'), icon: <Crown size={13} />, items: d.features.filter((f) => f.sourceType === 'class' || f.sourceType === 'subclass' || (f.sourceType === 'option' && !f.key.startsWith('species'))) },
    { title: t('sheet.speciesTraits'), icon: <Sparkles size={13} />, items: d.features.filter((f) => f.sourceType === 'species' || f.key.startsWith('species-option')) },
    { title: t('sheet.feats'), icon: <Star size={13} />, items: d.features.filter((f) => f.sourceType === 'feat') },
    { title: t('sheet.other'), icon: <Plus size={13} />, items: d.features.filter((f) => f.sourceType === 'custom' || f.sourceType === 'item') }
  ]
  return (
    <>
      {groups
        .filter((g) => g.items.length)
        .map((g) => (
          <Section
            key={g.title}
            title={
              <span className="flex items-center gap-1.5">
                {g.icon} {g.title}
              </span>
            }
            actions={
              <button className="btn btn-ghost btn-sm" onClick={() => goTo?.('features')}>
                {t('sheet.allDetails')}
              </button>
            }
          >
            <div className="space-y-1">
              {g.items
                .filter((f) => !/^ability score improvement$/i.test(f.name))
                .map((f) => (
                  <div key={f.key} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-panel-2">
                    <EntityLink kind={(f.entityKind as never) ?? 'feature'} id={f.entityId ?? f.id} entity={f.entityId ? undefined : ({ ...f, kind: 'feature', source: 'SRD 5.2' } as never)}>
                      {f.name}
                    </EntityLink>
                    <span className="truncate text-[11px] text-faint">{f.source}</span>
                    {f.activation && f.activation !== 'passive' && <span className="chip py-0 text-[9px] uppercase">{f.activation}</span>}
                    <span className="ml-auto">
                      <UsesTracker f={f} />
                    </span>
                  </div>
                ))}
            </div>
          </Section>
        ))}
    </>
  )
}

/* ------------------------------------------------------------------ */

function ProficiencySection() {
  const { t } = useTranslation()
  const { derived: d, lookup: L } = useChar()
  const armor: ArmorCategory[] = ['light', 'medium', 'heavy', 'shield']
  return (
    <Section title={t('sheet.training')}>
      <div className="mb-2 flex flex-wrap gap-1">
        {armor.map((a) => (
          <span key={a} className={`chip ${d.proficiencies.armor.includes(a) ? 'border-gold/60 text-gold' : 'opacity-40'}`}>
            {a === 'shield' ? 'Shields' : `${a.charAt(0).toUpperCase() + a.slice(1)} armor`}
          </span>
        ))}
      </div>
      <Row label={t('sheet.weapons')}>{d.proficiencies.weapons.map((w) => L.get('weapon', w)?.name ?? w.replace(/^(\w)/, (c) => c.toUpperCase()).replace(':', ' (').replace(/-/g, ' ') + (w.includes(':') ? ')' : '')).join(', ') || '—'}</Row>
      <Row label={t('sheet.tools')}>
        {d.proficiencies.tools.length
          ? d.proficiencies.tools.map((tl, i) => (
              <span key={tl}>
                {i > 0 && ', '}
                {L.get('tool', tl) ? <EntityLink kind="tool" id={tl} /> : tl}
              </span>
            ))
          : '—'}
      </Row>
      <Row label={t('sheet.languages')}>
        {d.proficiencies.languages.map((l, i) => (
          <span key={l}>
            {i > 0 && ', '}
            {L.get('language', l) ? <EntityLink kind="language" id={l} /> : l}
          </span>
        ))}
      </Row>
    </Section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[12.5px]">
      <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">{label}:</span>
      {children}
    </div>
  )
}

function ConditionsSection() {
  const { t } = useTranslation()
  const { char, lookup: L, update } = useChar()
  const conds = L.all('condition').filter((c) => c.id !== 'exhaustion')
  return (
    <Section title={t('sheet.conditions')}>
      <div className="flex flex-wrap gap-1">
        {conds.map((c) => {
          const on = char.conditions.includes(c.id)
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.9 }}
              className={`chip cursor-pointer ${on ? 'border-crimson bg-crimson/20 text-crimson-2' : 'hover:text-ink'}`}
              onClick={() => update((d) => void (d.conditions = on ? d.conditions.filter((x) => x !== c.id) : [...d.conditions, c.id]))}
              onContextMenu={(e) => e.preventDefault()}
            >
              {c.name}
            </motion.button>
          )
        })}
      </div>
      {char.conditions.length > 0 && (
        <div className="mt-2 space-y-1 text-[11px] text-muted">
          {char.conditions.map((c) => (
            <div key={c}>
              <EntityLink kind="condition" id={c} />: {L.get('condition', c)?.summary}
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <EntityLink kind="condition" id="exhaustion">
          Exhaustion
        </EntityLink>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            onClick={() => update((d) => void (d.exhaustion = d.exhaustion === n ? n - 1 : n))}
            className={`h-5 w-5 rounded border text-[10px] ${char.exhaustion >= n ? 'border-crimson bg-crimson text-white' : 'border-line text-muted'}`}
          >
            {n}
          </button>
        ))}
      </div>
      {char.exhaustion > 0 && char.exhaustion < 6 && <div className="mt-1 text-[11px] text-crimson-2">{t('sheet.exhaustionEffect', { d: 2 * char.exhaustion, s: 5 * char.exhaustion })}</div>}
      {char.exhaustion >= 6 && <div className="mt-1 text-[11px] font-semibold text-bad">{t('sheet.exhaustionDead')}</div>}
    </Section>
  )
}

function DefensesSection() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  // Tilstander som slår på betingede effects (Rage, Wild Shape, Mage Armor ...)
  const conds = [...new Set(d.effects.map((e) => e.effect.condition).filter((c): c is string => !!c && !/^(no|armored|shield|vs|wearing|unarmored|onehanded|mageArmor)/i.test(c)))]
  const any = d.resistances.length || d.immunities.length || d.vulnerabilities.length || d.conditionImmunities.length || conds.length
  if (!any) return null
  return (
    <Section title={t('sheet.defenses')}>
      {d.resistances.length > 0 && <Row label={t('sheet.resistances')}>{d.resistances.join(', ')}</Row>}
      {d.immunities.length > 0 && <Row label={t('sheet.immunities')}>{d.immunities.join(', ')}</Row>}
      {d.vulnerabilities.length > 0 && <Row label={t('sheet.vulnerabilities')}>{d.vulnerabilities.join(', ')}</Row>}
      {d.conditionImmunities.length > 0 && <Row label={t('sheet.conditionImmunities')}>{d.conditionImmunities.join(', ')}</Row>}
      {conds.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">{t('sheet.activeStates')}</div>
          <div className="flex flex-wrap gap-1">
            {conds.map((c) => {
              const on = char.activeStates.includes(c)
              return (
                <button
                  key={c}
                  className={`chip cursor-pointer ${on ? 'border-gold bg-gold/20 text-gold-2' : ''}`}
                  onClick={() => update((x) => void (x.activeStates = on ? x.activeStates.filter((s) => s !== c) : [...x.activeStates, c]))}
                >
                  {c.replace(/([A-Z])/g, ' $1').replace(/^./, (m) => m.toUpperCase())}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}
