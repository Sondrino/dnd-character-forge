import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Dices, Sparkles } from 'lucide-react'
import type { SpellDef } from '../types'
import { Modal } from './ui'
import { EntityLink } from './EntityInfo'
import { AidSpell, AttackRoll, EconomyWarning, HealSpell, SaveSpell, TempSpell, Warn, hurt, spend } from './combat/Resolver'
import { useCombat, type Economy } from './combat/useCombat'
import { SPELL_BUFFS, addEffect, addLog, castingKind, dropConcentration, durationRounds, freeCasts, spellDamageDice, spellHealDice, spellTempDice, type FreeCast } from '../lib/combat'
import { useSettings } from '../store/settings'
import { useUi } from '../store/ui'

/**
 * Felles «kast et spell»-dialog for kampmodus og arket: slot-nivå (upcasting), gratis-kast, ritual,
 * concentration, effekter med varighet og oppfølging (angrep, save, healing, temp HP).
 * Utenfor kamp skjules handlingsøkonomien, og effekter/concentration lagres på karakteren.
 */
export function CastDialog({ spell, source, onClose }: { spell: SpellDef | null; source?: string; onClose: () => void }) {
  return (
    <Modal open={!!spell} onClose={onClose} title={spell?.name} width={720}>
      {spell && <SpellCast key={`${spell.id}:${source ?? ''}`} spell={spell} source={source ?? ''} onDone={onClose} />}
    </Modal>
  )
}

interface SlotOpt {
  id: string
  level: number
  label: string
  pact?: boolean
  free?: FreeCast
  ritual?: boolean
}

export function SpellCast({ spell: sp, source, onDone }: { spell: SpellDef; source: string; onDone: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, c, mut, outOfCombat } = useCombat()
  const notify = useUi((s) => s.notify)
  const free = useMemo(() => freeCasts(char, d, L, sp), [char, d, L, sp])
  const freeLeft = free.filter((f) => f.left === null || f.left > 0)
  const kind = castingKind(sp.castingTime)
  const econ: Economy = kind === 'long' ? 'action' : kind
  const srcCaster = d.spellSources[source]
  const caster =
    d.spellcasting.find((s) => s.classId === source) ??
    (srcCaster
      ? ({ ...d.spellcasting[0], ability: srcCaster.ability, mod: srcCaster.mod, dc: { value: srcCaster.dc }, attack: { value: srcCaster.attack, advantage: srcCaster.advantage, disadvantage: srcCaster.disadvantage } } as unknown as (typeof d.spellcasting)[number])
      : d.spellcasting[0])
  const slotOpts = useMemo(() => {
    if (sp.level === 0) return []
    const o: SlotOpt[] = []
    for (const f of freeLeft) o.push({ id: f.id, level: sp.level, free: f, label: t('combat.freeCast', { name: f.label, left: f.left === null ? t('combat.atWill') : `${f.left}/${f.max}` }) })
    for (const s of d.slots) if (s.level >= sp.level && s.max - s.used > 0) o.push({ id: `s${s.level}`, level: s.level, label: t('combat.slotLevel', { n: s.level, left: s.max - s.used }) })
    if (d.pact && d.pact.level >= sp.level && d.pact.count - d.pact.used > 0) o.push({ id: 'pact', level: d.pact.level, pact: true, label: t('combat.pactSlot', { n: d.pact.level, left: d.pact.count - d.pact.used }) })
    // Ritual: +10 minutter, ingen slot (ikke realistisk midt i en kamp)
    if (sp.ritual && outOfCombat) o.push({ id: 'ritual', level: sp.level, ritual: true, label: t('spellsx.ritual') })
    o.push({ id: 'free', level: sp.level, label: t('combat.noSlot') })
    return o
  }, [d.slots, d.pact, sp.level, free, outOfCombat])
  const [slot, setSlot] = useState(slotOpts[0]?.id ?? 'free')
  const chosen = slotOpts.find((o) => o.id === slot)
  const slotLevel = chosen?.level ?? sp.level
  const [phase, setPhase] = useState<'cast' | 'resolve'>('cast')
  const rounds = durationRounds(sp.duration)

  const cast = (): void => {
    const o = chosen
    const how = o?.free ? t('combat.log.free', { name: o.free.label }) : o?.ritual ? t('spellsx.log.ritual') : sp.level > 0 && o?.id !== 'free' ? t('combat.log.slot', { n: slotLevel }) : ''
    mut((cc, ch) => {
      if (o?.free) {
        if (o.free.useKey) ch.featureUses[o.free.useKey] = (ch.featureUses[o.free.useKey] ?? 0) + 1
      } else if (o && o.id !== 'free' && !o.ritual) {
        if (o.pact) ch.pactSlotsUsed += 1
        else ch.spellSlotsUsed[o.level - 1] = (ch.spellSlotsUsed[o.level - 1] ?? 0) + 1
        cc.turn.slotUsed = true
      }
      spend(cc, econ)
      if (sp.concentration) {
        dropConcentration(cc, ch)
        cc.concentration = { name: sp.name, spellId: sp.id, since: cc.round }
      }
      // Aid legges på i neste steg (bare hvis du selv er et av målene)
      // Mage Armor slår på tilstanden «mageArmor» (AC 13 + DEX uten rustning) så lenge den varer
      const state = sp.id === 'mage-armor' ? 'mageArmor' : undefined
      if (sp.id !== 'aid' && ((rounds && rounds > 1) || SPELL_BUFFS[sp.id] || sp.concentration)) addEffect(cc, ch, { name: sp.name, rounds, concentration: sp.concentration, spellId: sp.id, state }, slotLevel)
      cc.stats.spells += 1
      addLog(cc, 'spell', `${sp.name}${how ? ` (${how})` : ''}`)
    })
    if (outOfCombat) notify(t('spellsx.castDone', { name: sp.name, how: how ? ` (${how})` : '' }), 'good')
    if (sp.attack || sp.save || sp.heal || sp.damage || sp.tempHp || sp.id === 'aid') setPhase('resolve')
    else onDone()
  }

  const dmgDice = spellDamageDice(sp, slotLevel, d.totalLevel)
  const healDice = spellHealDice(sp, slotLevel, caster?.mod ?? 0)
  const tempDice = spellTempDice(sp, slotLevel, caster?.mod ?? 0)
  const atLevel = [dmgDice && `${dmgDice} ${sp.damage?.type ?? ''}`.trim(), healDice && `${t('combat.healing')} ${healDice}`, tempDice && `${t('combat.tempHp')} ${tempDice}`].filter(Boolean).join(' · ')
  return (
    <div>
      {phase === 'cast' && (
        <>
          {outOfCombat && <DiceModeToggle />}
          <EconomyWarning e={econ} />
          {char.activeStates.includes('raging') && <Warn text={t('combat.ragingNoSpells')} />}
          {d.armorNotProficient && sp.level >= 0 && <Warn text={t('combat.armorNoSpells')} />}
          {freeLeft.length > 0 && (
            <div className="glow mb-3 rounded-xl border border-good/50 bg-good/10 px-3 py-2 text-sm text-good">
              ✦ {t('combat.freeOffer', { spell: sp.name, name: freeLeft.map((f) => f.label).join(' / ') })}
            </div>
          )}
          {free.length > 0 && !freeLeft.length && <p className="mb-3 text-xs text-muted">{t('combat.freeUsedUp', { name: free.map((f) => f.label).join(', ') })}</p>}
          {!outOfCombat && sp.level > 0 && c.turn.slotUsed && !chosen?.free && !chosen?.ritual && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson-2">
              <AlertTriangle size={14} /> {t('combat.oneSlotRule')}
            </div>
          )}
          {sp.concentration && c.concentration && (
            <div className="mb-3 rounded-xl border border-arcane/40 bg-arcane/10 px-3 py-2 text-sm">{t('combat.replaceConc', { name: c.concentration.name })}</div>
          )}
          <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
            <Fact k={t('combat.castTime')} v={chosen?.ritual ? t('spellsx.ritualTime', { time: sp.castingTime.split(',')[0] }) : sp.castingTime.split(',')[0]} />
            <Fact k={t('combat.range')} v={sp.range} />
            <Fact k={t('combat.duration')} v={sp.duration} />
            <Fact k={t('combat.level')} v={sp.level === 0 ? 'Cantrip' : String(sp.level)} />
          </div>
          <p className="mb-3 text-sm">{sp.summary}</p>
          {sp.level > 0 && (
            <div className="mb-3">
              <div className="panel-title mb-1">{t('combat.chooseSlot')}</div>
              <div className="flex flex-wrap gap-1">
                {slotOpts.map((o) => (
                  <button key={o.id} className={`btn btn-sm ${slot === o.id ? 'btn-primary' : ''}`} onClick={() => setSlot(o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
              {slotOpts.filter((o) => !o.ritual).length === 1 && <p className="mt-1 text-xs text-crimson-2">{t('combat.noSlotsLeft')}</p>}
              {chosen?.free && <p className="mt-1 text-xs text-good">{t('combat.freeNoSlot')}</p>}
              {chosen?.ritual && <p className="mt-1 text-xs text-good">{t('spellsx.ritualNote')}</p>}
              {slotLevel > sp.level && atLevel && <p className="mt-1 text-xs text-arcane">{t('spellsx.upcast', { n: slotLevel, what: atLevel })}</p>}
            </div>
          )}
          {outOfCombat && (rounds || sp.concentration) && <p className="mb-3 text-xs text-muted">{t('spellsx.tracked')}</p>}
          <div className="flex items-center justify-between">
            <EntityLink kind="spell" id={sp.id}>
              {t('combat.fullText')}
            </EntityLink>
            <button className="btn btn-primary" onClick={cast}>
              <Sparkles size={14} /> {t('combat.cast')}
            </button>
          </div>
        </>
      )}
      {phase === 'resolve' && sp.attack && (
        <AttackRoll
          setup={{ name: sp.name, bonus: caster?.attack.value ?? 0, damage: dmgDice, damageType: sp.damage?.type ? String(sp.damage.type) : undefined, melee: sp.attack === 'melee', str: false, roll: caster?.attack }}
          finishLabel={t('common.done')}
          onFinish={(r) => {
            mut((cc) => {
              const who = hurt(cc, r.target, r.damage)
              if (r.hit) {
                cc.stats.hits += 1
                cc.stats.dealt += r.damage
                if (r.crit) cc.stats.crits += 1
              } else cc.stats.misses += 1
              addLog(cc, 'attack', `${sp.name}: ${r.hit ? (r.crit ? t('combat.log.crit') : t('combat.log.hit')) : t('combat.log.miss')}${who ? ` ${who}` : ''}${r.hit ? ` – ${r.damage} ${sp.damage?.type ?? ''}` : ''}`)
            })
            onDone()
          }}
        />
      )}
      {phase === 'resolve' && !sp.attack && !sp.tempHp && (sp.save || (sp.damage && !sp.heal)) && <SaveSpell sp={sp} dc={caster?.dc.value ?? 10} dice={dmgDice} onDone={onDone} />}
      {phase === 'resolve' && !sp.attack && !sp.save && sp.heal && <HealSpell sp={sp} dice={healDice} onDone={onDone} />}
      {phase === 'resolve' && !sp.attack && !sp.heal && sp.tempHp && <TempSpell sp={sp} dice={tempDice} onDone={onDone} />}
      {phase === 'resolve' && sp.id === 'aid' && <AidSpell slotLevel={slotLevel} onDone={onDone} />}
    </div>
  )
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted">{k}</div>
      <div>{v}</div>
    </div>
  )
}

/** Utenfor kamp: ekte terninger eller app (samme innstilling som kampmodus) */
export function DiceModeToggle({ className = 'mb-3' }: { className?: string }) {
  const { t } = useTranslation()
  const dice = useSettings((s) => s.combatDice) ?? 'app'
  const set = useSettings((s) => s.set)
  return (
    <div className={`flex items-center justify-end gap-2 text-xs text-muted ${className}`}>
      <Dices size={13} />
      <div className="flex overflow-hidden rounded-lg border border-line-soft">
        {(['physical', 'app'] as const).map((k) => (
          <button key={k} className={`px-2 py-1 ${dice === k ? 'bg-gold/20 text-gold-2' : 'hover:text-ink'}`} onClick={() => set({ combatDice: k })} title={t(`combat.dice.${k}Desc`)}>
            {t(`combat.dice.${k}Short`)}
          </button>
        ))}
      </div>
    </div>
  )
}
