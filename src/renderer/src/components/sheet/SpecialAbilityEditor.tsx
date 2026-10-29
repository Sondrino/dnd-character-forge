import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Wand2 } from 'lucide-react'
import type { Ability, DamageType, Effect, Feature, FeatureRoll, Uses } from '../../types'
import { ABILITIES } from '../../types'
import { Markdown, Modal, Toggle } from '../ui'
import { EffectsEditor } from '../HomebrewEditor'
import { uid } from '../../store/characters'
import { CharCtx } from './context'
import { evalAbility, resolveDice } from '../../lib/combat'

const DAMAGE: DamageType[] = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']
const ABIL: Record<Ability, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }
const RECHARGE: Record<Uses['recharge'], string> = { short: 'Short Rest', long: 'Long Rest', shortOrLong: 'Short/Long Rest', dawn: 'Dawn', turn: 'Turn', shortOne: 'Long Rest (1 on Short)' }

/** Navn → tilstandsnavn for effekter som kan slås av/på («Dragon Wings» → «dragonWings») */
export function stateName(name: string): string {
  const w = name
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return w.map((x, i) => (i === 0 ? x.toLowerCase() : x[0].toUpperCase() + x.slice(1).toLowerCase())).join('') || 'customAbility'
}

interface Draft {
  name: string
  summary: string
  description: string
  activation: NonNullable<Feature['activation']>
  uses: string
  recharge: Uses['recharge']
  toggle: boolean
  duration: string
  /** Krever concentration (avslutter annen concentration når den brukes) */
  concentration: boolean
  effects: Effect[]
  roll: FeatureRoll | null
  /** Level featuren fås på (subclass: class-level, species: karakter-level) */
  level: string
}

const blank = (level = ''): Draft => ({ name: '', summary: '', description: '', activation: 'action', uses: '', recharge: 'long', toggle: false, duration: '10', concentration: false, effects: [], roll: null, level })

function fromFeature(f: Feature): Draft {
  return {
    name: f.name,
    summary: f.summary,
    description: f.description === f.summary ? '' : f.description,
    activation: f.activation ?? 'passive',
    uses: f.uses ? String(f.uses.count) : '',
    recharge: f.uses?.recharge ?? 'long',
    toggle: !!f.toggle,
    duration: f.duration ? String(f.duration) : '10',
    concentration: !!f.concentration,
    // Betingelsen som gjør effektene av/på legges på ved lagring – vis dem uten
    effects: (f.effects ?? []).map((e) => (f.toggle && e.condition === f.toggle ? { ...e, condition: undefined } : e)),
    roll: f.roll ?? null,
    level: f.level !== undefined ? String(f.level) : ''
  }
}

/** Ferdige maler for vanlige spesial-evner */
const TEMPLATES: { id: string; draft: () => Partial<Draft> }[] = [
  { id: 'breath', draft: () => ({ activation: 'action', uses: 'prof', recharge: 'long', roll: { kind: 'save', save: 'dex', dc: '8+prof+mod.con', dice: '2d6', damageType: 'fire', halfOnSave: true, range: '15 ft. cone' } }) },
  { id: 'weapon', draft: () => ({ activation: 'action', uses: '', roll: { kind: 'attack', attack: 'prof+mod.str', dice: '1d6+mod.str', damageType: 'slashing', melee: true, range: '5 ft.' } }) },
  { id: 'heal', draft: () => ({ activation: 'bonus', uses: '1', recharge: 'long', roll: { kind: 'heal', dice: '1d10+level' } }) },
  { id: 'buff', draft: () => ({ activation: 'bonus', uses: 'prof', recharge: 'long', toggle: true, duration: '10', effects: [{ target: 'ac', op: 'add', value: 2 }], roll: null }) },
  { id: 'shield', draft: () => ({ activation: 'reaction', uses: 'mod.con', recharge: 'long', roll: { kind: 'temp', dice: '1d6+level' } }) }
]

/**
 * Editor for en evne/feature. På et ark lagres den som karakterens spesial-evne; med `onSave` brukes den
 * også for features i homebrew (subclasses, species …), og `withLevel` viser level-feltet.
 */
export function SpecialAbilityEditor({
  open, onClose, initial, onSave, withLevel, defaultLevel = 3, title
}: {
  open: boolean
  onClose: () => void
  initial: Feature | null
  onSave?: (f: Feature) => void
  withLevel?: boolean
  defaultLevel?: number
  title?: string
}) {
  const { t } = useTranslation()
  const ctx = useContext(CharCtx)
  const d = ctx?.derived
  const [f, setF] = useState<Draft>(blank())
  useEffect(() => {
    if (open) setF(initial ? fromFeature(initial) : blank(withLevel ? String(defaultLevel) : ''))
  }, [open, initial])
  const set = (p: Partial<Draft>): void => setF((x) => ({ ...x, ...p }))
  const setRoll = (p: Partial<FeatureRoll>): void => setF((x) => ({ ...x, roll: { ...(x.roll ?? { kind: 'attack' }), ...p } }))

  // Uten karakter (homebrew) kan formlene ikke regnes ut ennå – de vises som de er
  const usesN = d && f.uses.trim() ? evalAbility(f.uses, d) : null
  const atk = d && f.roll?.kind === 'attack' ? evalAbility(f.roll.attack || 'prof', d) : null
  const dc = d && f.roll?.kind === 'save' ? evalAbility(f.roll.dc || '8+prof', d) : null
  const dice = f.roll?.dice ? (d ? resolveDice(f.roll.dice, d) : f.roll.dice) : ''

  /** Sammendrag fra mekanikken når brukeren ikke har skrevet et */
  const autoSummary = (): string => {
    const parts: string[] = []
    const r = f.roll
    if (r?.kind === 'attack') parts.push(t('ability.auto.attack', { n: atk !== null ? (atk >= 0 ? `+${atk}` : String(atk)) : `+(${r.attack || 'prof'})`, dice, type: r.damageType ?? '' }))
    if (r?.kind === 'save') parts.push(t('ability.auto.save', { ab: ABIL[r.save ?? 'dex'], dc: dc ?? (r.dc || '8+prof'), dice, type: r.damageType ?? '' }))
    if (r?.kind === 'damage') parts.push(`${dice} ${r.damageType ?? ''}`.trim())
    if (r?.kind === 'heal') parts.push(t('ability.auto.heal', { dice }))
    if (r?.kind === 'temp') parts.push(t('ability.auto.temp', { dice }))
    if (r?.range) parts.push(r.range)
    if (f.effects.length) parts.push(t('ability.nEffects', { n: f.effects.length }) + (f.toggle ? ` (${t('ability.auto.toggle')})` : ''))
    if (f.uses.trim()) parts.push(`${usesN ?? f.uses}/${RECHARGE[f.recharge]}`)
    return parts.join(' · ')
  }

  const save = (): void => {
    const name = f.name.trim()
    if (!name) return
    const state = f.toggle ? stateName(name) : undefined
    const feature: Feature = {
      id: initial?.id ?? `ability-${uid()}`,
      name,
      summary: f.summary.trim() || f.description.split('\n')[0].slice(0, 160) || autoSummary() || name,
      description: f.description.trim() || f.summary.trim(),
      activation: f.activation,
      uses: f.uses.trim() ? { count: /^\d+$/.test(f.uses.trim()) ? Number(f.uses.trim()) : f.uses.trim(), recharge: f.recharge } : undefined,
      effects: f.effects.map((e) => (state && !e.condition ? { ...e, condition: state } : e)),
      roll: f.roll ?? undefined,
      toggle: state,
      duration: (f.toggle || f.concentration) && Number(f.duration) > 0 ? Number(f.duration) : undefined,
      ...(f.concentration ? { concentration: true } : {}),
      ...(withLevel && f.level.trim() ? { level: Math.max(1, Math.min(20, Number(f.level) || 1)) } : {})
    }
    if (onSave) {
      onSave(feature)
      onClose()
      return
    }
    ctx?.update((c) => {
      const i = c.customFeatures.findIndex((x) => x.id === feature.id)
      if (i >= 0) {
        // Gammel tilstand slås av hvis navnet (og dermed tilstanden) endres
        const old = c.customFeatures[i].toggle
        if (old && old !== state) c.activeStates = c.activeStates.filter((s) => s !== old)
        c.customFeatures[i] = feature
      } else c.customFeatures.push(feature)
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (initial ? t('ability.edit') : t('ability.create'))}
      width={820}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" disabled={!f.name.trim()} onClick={save}>
            <Check size={14} /> {t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {!initial && (
          <div>
            <div className="panel-title mb-1">{t('ability.templates')}</div>
            <div className="flex flex-wrap gap-1">
              {TEMPLATES.map((tp) => (
                <button key={tp.id} className="btn btn-sm" onClick={() => set({ ...tp.draft(), name: f.name || t(`ability.tpl.${tp.id}`) })}>
                  <Wand2 size={12} /> {t(`ability.tpl.${tp.id}`)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('common.name')}</label>
            <div className="flex gap-2">
              {withLevel && (
                <input className="input w-20 text-center" title="Level" inputMode="numeric" value={f.level} onChange={(e) => set({ level: e.target.value.replace(/[^\d]/g, '') })} placeholder="Lvl" />
              )}
              <input className="input" value={f.name} onChange={(e) => set({ name: e.target.value })} autoFocus placeholder={t('ability.namePh')} />
            </div>
          </div>
          <div>
            <label className="label">{t('ability.summary')}</label>
            <input className="input" value={f.summary} onChange={(e) => set({ summary: e.target.value })} placeholder={t('ability.summaryPh')} />
          </div>
        </div>
        <div>
          <label className="label">{t('ability.description')}</label>
          <textarea className="input min-h-24" value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder={t('ability.descriptionPh')} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">{t('features.activation')}</label>
            <select className="input" value={f.activation} onChange={(e) => set({ activation: e.target.value as Draft['activation'] })}>
              {(['action', 'bonus', 'reaction', 'special', 'passive'] as const).map((a) => (
                <option key={a} value={a}>
                  {t(`ability.act.${a}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('ability.uses')}</label>
            <input className="input" value={f.uses} onChange={(e) => set({ uses: e.target.value })} placeholder={t('ability.usesPh')} />
            <div className="mt-0.5 text-[11px] text-muted">{f.uses.trim() ? (usesN !== null ? t('ability.usesNow', { n: Math.max(1, usesN) }) : (d ? t('ability.badFormula') : t('ability.perCharacter'))) : t('ability.unlimited')}</div>
          </div>
          <div>
            <label className="label">{t('features.recharge')}</label>
            <select className="input" value={f.recharge} onChange={(e) => set({ recharge: e.target.value as Uses['recharge'] })} disabled={!f.uses.trim()}>
              <option value="short">Short Rest</option>
              <option value="long">Long Rest</option>
              <option value="shortOrLong">Short or Long Rest</option>
              <option value="shortOne">Long Rest (1 back on Short Rest)</option>
              <option value="dawn">Dawn</option>
              <option value="turn">Turn</option>
            </select>
          </div>
        </div>

        {/* Effekter */}
        <div className="rounded-xl border border-line-soft p-3">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <Toggle checked={f.toggle} onChange={(v) => set({ toggle: v })} label={t('ability.toggle')} />
            <label className="flex cursor-pointer items-center gap-2 text-sm" title={t('spellsx.featureConcTip')}>
              <input type="checkbox" checked={f.concentration} onChange={(e) => set({ concentration: e.target.checked })} /> {t('spellsx.featureConc')}
            </label>
            {(f.toggle || f.concentration) && (
              <label className="flex items-center gap-2 text-sm">
                {t('ability.duration')}
                <input className="input w-20 text-center" inputMode="numeric" value={f.duration} onChange={(e) => set({ duration: e.target.value.replace(/[^\d]/g, '') })} />
                <span className="text-xs text-muted">{t('ability.rounds')}</span>
              </label>
            )}
          </div>
          <p className="mb-2 text-xs text-muted">{f.toggle ? t('ability.toggleHint') : t('ability.alwaysHint')}</p>
          <EffectsEditor effects={f.effects} onChange={(effects) => set({ effects })} />
        </div>

        {/* Kamp */}
        <div className="rounded-xl border border-line-soft p-3">
          <div className="panel-title mb-1">{t('ability.combat')}</div>
          <p className="mb-2 text-xs text-muted">{t('ability.combatHint')}</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {(['none', 'attack', 'save', 'damage', 'heal', 'temp'] as const).map((k) => {
              const on = k === 'none' ? !f.roll : f.roll?.kind === k
              return (
                <button
                  key={k}
                  className={`btn btn-sm ${on ? 'btn-primary' : ''}`}
                  onClick={() =>
                    set({
                      roll:
                        k === 'none'
                          ? null
                          : {
                              kind: k,
                              attack: k === 'attack' ? (f.roll?.attack ?? 'prof+mod.str') : undefined,
                              save: k === 'save' ? (f.roll?.save ?? 'dex') : undefined,
                              dc: k === 'save' ? (f.roll?.dc ?? '8+prof+mod.con') : undefined,
                              dice: f.roll?.dice ?? (k === 'heal' || k === 'temp' ? '1d8+level' : '2d6'),
                              damageType: k === 'attack' || k === 'save' || k === 'damage' ? (f.roll?.damageType ?? 'fire') : undefined,
                              halfOnSave: k === 'save' ? (f.roll?.halfOnSave ?? true) : undefined,
                              melee: k === 'attack' ? (f.roll?.melee ?? true) : undefined,
                              range: f.roll?.range
                            }
                    })
                  }
                >
                  {t(`ability.kind.${k}`)}
                </button>
              )
            })}
          </div>
          {f.roll && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {f.roll.kind === 'attack' && (
                <>
                  <div>
                    <label className="label">{t('ability.attackBonus')}</label>
                    <input className="input" value={f.roll.attack ?? ''} onChange={(e) => setRoll({ attack: e.target.value })} />
                    <div className="mt-0.5 text-[11px] text-muted">{atk !== null ? `= ${atk >= 0 ? '+' : ''}${atk}` : (d ? t('ability.badFormula') : t('ability.perCharacter'))}</div>
                  </div>
                  <div>
                    <label className="label">{t('ability.attackType')}</label>
                    <select className="input" value={f.roll.melee === false ? 'ranged' : 'melee'} onChange={(e) => setRoll({ melee: e.target.value === 'melee' })}>
                      <option value="melee">Melee</option>
                      <option value="ranged">Ranged</option>
                    </select>
                  </div>
                </>
              )}
              {f.roll.kind === 'save' && (
                <>
                  <div>
                    <label className="label">{t('ability.saveAbility')}</label>
                    <select className="input" value={f.roll.save ?? 'dex'} onChange={(e) => setRoll({ save: e.target.value as Ability })}>
                      {ABILITIES.map((a) => (
                        <option key={a} value={a}>
                          {ABIL[a]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Save DC</label>
                    <input className="input" value={f.roll.dc ?? ''} onChange={(e) => setRoll({ dc: e.target.value })} />
                    <div className="mt-0.5 text-[11px] text-muted">{dc !== null ? `= DC ${dc}` : (d ? t('ability.badFormula') : t('ability.perCharacter'))}</div>
                  </div>
                </>
              )}
              <div>
                <label className="label">{t(f.roll.kind === 'heal' ? 'ability.healDice' : f.roll.kind === 'temp' ? 'ability.tempDice' : 'ability.damageDice')}</label>
                <input className="input" value={f.roll.dice ?? ''} onChange={(e) => setRoll({ dice: e.target.value })} placeholder="2d6+mod.cha" />
                <div className="mt-0.5 text-[11px] text-muted">{dice ? `= ${dice}` : ''}</div>
              </div>
              {(f.roll.kind === 'attack' || f.roll.kind === 'save' || f.roll.kind === 'damage') && (
                <div>
                  <label className="label">{t('ability.damageType')}</label>
                  <select className="input" value={f.roll.damageType ?? ''} onChange={(e) => setRoll({ damageType: e.target.value })}>
                    {DAMAGE.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {f.roll.kind === 'save' && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.roll.halfOnSave !== false} onChange={(e) => setRoll({ halfOnSave: e.target.checked })} /> {t('ability.halfOnSave')}
                </label>
              )}
              <div>
                <label className="label">{t('ability.range')}</label>
                <input className="input" value={f.roll.range ?? ''} onChange={(e) => setRoll({ range: e.target.value })} placeholder="30 ft." />
              </div>
            </div>
          )}
          <p className="mt-2 text-[11px] text-muted">{t('ability.formulaHelp')}</p>
        </div>

        {(f.summary || f.description) && (
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm">
            <div className="panel-title mb-1">{t('ability.preview')}</div>
            <div className="font-display text-gold">{f.name || '—'}</div>
            <Markdown text={f.description || f.summary} compact />
          </div>
        )}
      </div>
    </Modal>
  )
}
