import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Plus, Trash2 } from 'lucide-react'
import type {
  AnyEntity, ArmorCategory, DamageType, Effect, EntityKind, MasteryId, School, WeaponProperty
} from '../types'
import { ABILITIES } from '../types'
import { Modal, Markdown } from './ui'
import { EntityPicker } from './EntityPicker'
import { skills } from '../data/skills'
import { BackgroundForm, CreatureForm, LanguageForm, SpeciesForm, SubclassForm, validateHomebrew } from './homebrew/KindForms'

export const HOMEBREW_KINDS: EntityKind[] = ['subclass', 'species', 'background', 'feat', 'spell', 'magicItem', 'weapon', 'armor', 'gear', 'tool', 'creature', 'language']
export const KIND_NAMES: Record<string, string> = {
  gear: 'Item / Gear', weapon: 'Weapon', armor: 'Armor', magicItem: 'Magic Item', spell: 'Spell', feat: 'Feat', tool: 'Tool',
  subclass: 'Subclass', species: 'Species', background: 'Background', creature: 'Creature / Monster', language: 'Language'
}
/** Typer der entity-effektene brukes direkte (subclass/species-traits har egne effekter per feature) */
const KINDS_WITH_EFFECTS = new Set(['gear', 'weapon', 'armor', 'magicItem', 'feat', 'tool', 'species'])

const DAMAGE: DamageType[] = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']
const PROPS: WeaponProperty[] = ['ammunition', 'finesse', 'heavy', 'light', 'loading', 'reach', 'thrown', 'two-handed', 'versatile']
const MASTERY: MasteryId[] = ['cleave', 'graze', 'nick', 'push', 'sap', 'slow', 'topple', 'vex']
const SCHOOLS: School[] = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
const CLASSES = ['artificer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard']

export const EFFECT_TARGETS: { id: string; label: string }[] = [
  { id: 'ac', label: 'Armor Class' },
  { id: 'ac.unarmored', label: 'AC formula without armor (e.g. 13+dex)' },
  { id: 'initiative', label: 'Initiative' },
  { id: 'speed', label: 'Speed' },
  { id: 'speed.fly', label: 'Fly Speed' },
  { id: 'speed.swim', label: 'Swim Speed' },
  { id: 'speed.climb', label: 'Climb Speed' },
  { id: 'hp.max', label: 'Hit Point Maximum' },
  { id: 'hp.perLevel', label: 'HP per level' },
  { id: 'attack.all', label: 'All attack rolls' },
  { id: 'attack.melee', label: 'Melee attacks' },
  { id: 'attack.ranged', label: 'Ranged attacks' },
  { id: 'damage.all', label: 'All weapon damage' },
  { id: 'spell.dc', label: 'Spell save DC' },
  { id: 'spell.attack', label: 'Spell attack' },
  { id: 'save.all', label: 'All saving throws' },
  ...ABILITIES.map((a) => ({ id: `save.${a}`, label: `${a.toUpperCase()} saving throw` })),
  ...ABILITIES.map((a) => ({ id: `ability.${a}`, label: `${a.toUpperCase()} score` })),
  { id: 'skill.all', label: 'All skills' },
  ...skills.map((s) => ({ id: `skill.${s.id}`, label: `Skill: ${s.name}` })),
  { id: 'passive.perception', label: 'Passive Perception' },
  { id: 'darkvision', label: 'Darkvision (ft.)' },
  { id: 'resistance', label: 'Resistance (damage type)' },
  { id: 'immunity', label: 'Immunity (damage type)' },
  { id: 'proficiency.armor', label: 'Armor training' },
  { id: 'proficiency.weapon', label: 'Weapon proficiency' },
  { id: 'proficiency.tool', label: 'Tool proficiency' },
  { id: 'language', label: 'Language' },
  { id: 'sense', label: 'Sense (text)' }
]
const OPS: Effect['op'][] = ['add', 'set', 'min', 'advantage', 'disadvantage', 'proficiency', 'expertise', 'grant']

export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
}

export function blankEntity(kind: EntityKind): AnyEntity {
  const base = { id: '', name: '', kind, source: 'Homebrew' as const, summary: '', description: '', effects: [] as Effect[] }
  switch (kind) {
    case 'weapon':
      return { ...base, kind, category: 'simple', weaponType: 'melee', damage: '1d6', damageType: 'slashing', properties: [], mastery: 'sap', weight: 2, cost: '10 GP' }
    case 'armor':
      return { ...base, kind, category: 'light', baseAC: 11, dexCap: null, stealthDisadvantage: false, weight: 10, cost: '10 GP', donDoff: '1 Minute' }
    case 'magicItem':
      return { ...base, kind, itemType: 'Wondrous Item', rarity: 'uncommon', attunement: false }
    case 'spell':
      return { ...base, kind, level: 1, school: 'Evocation', castingTime: 'Action', range: '60 feet', components: { v: true, s: true }, duration: 'Instantaneous', concentration: false, ritual: false, classes: ['wizard'] }
    case 'feat':
      return { ...base, kind, category: 'general' }
    case 'tool':
      return { ...base, kind, category: 'other', ability: 'int', utilize: [], craft: [], cost: '10 GP', weight: 1 }
    case 'subclass':
      return { ...base, kind, classId: 'fighter', features: [], alwaysPrepared: [] }
    case 'species':
      return { ...base, kind, creatureType: 'Humanoid', size: 'Medium', speed: 30, traits: [], spells: [] }
    case 'background':
      return {
        ...base, kind, abilityScores: ['str', 'dex', 'con'], originFeat: 'alert', skills: ['athletics', 'perception'], tool: 'choice:gaming',
        equipment: [{ label: 'A', items: [], gp: 15 }, { label: 'B', items: [], gp: 50 }]
      }
    case 'creature':
      return { ...base, kind, size: 'Medium', creatureType: 'Beast', alignment: 'Unaligned', ac: 12, hp: '11 (2d8 + 2)', speed: '30 ft.', cr: '1/4', abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } }
    case 'language':
      return { ...base, kind, rarity: 'standard' }
    default:
      return { ...base, kind: 'gear', cost: '1 GP', weight: 1 } as AnyEntity
  }
}

export function EntityEditor({
  open, onClose, initial, onSave, existingIds, initialKind = 'gear'
}: {
  open: boolean
  onClose: () => void
  initial: AnyEntity | null
  onSave: (e: AnyEntity) => void
  existingIds?: string[]
  /** Type for nye entities (fra typevelgeren) */
  initialKind?: EntityKind
}) {
  const { t } = useTranslation()
  const [e, setE] = useState<AnyEntity>(initial ?? blankEntity(initialKind))
  const [copyFrom, setCopyFrom] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (open) {
      setE(initial ?? blankEntity(initialKind))
      setError(null)
    }
  }, [open, initial, initialKind])
  const set = (p: Record<string, unknown>): void => setE((x) => ({ ...x, ...p }) as AnyEntity)
  const isNew = !initial?.id
  const a = e as unknown as Record<string, unknown>

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={820}
      title={isNew ? t('hb.new') : t('hb.edit', { name: initial?.name })}
      footer={
        <>
          <button className="btn mr-auto" onClick={() => setCopyFrom(true)}>
            <Copy size={14} /> {t('hb.copyFrom')}
          </button>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          {error && <span className="self-center text-sm text-bad">{t(error)}</span>}
          <button
            className="btn btn-primary"
            disabled={!e.name.trim()}
            onClick={() => {
              const err = validateHomebrew(e)
              if (err) {
                setError(err)
                return
              }
              let id = e.id || `hb-${slugify(e.name)}`
              if (isNew && existingIds?.includes(id)) id = `${id}-${Date.now().toString(36).slice(-4)}`
              onSave({ ...e, id, source: 'Homebrew', summary: e.summary || e.description.split('\n')[0].slice(0, 180) } as AnyEntity)
              onClose()
            }}
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">{t('hb.type')}</label>
            <select
              className="input"
              value={e.kind}
              disabled={!isNew}
              onChange={(ev) => {
                const k = ev.target.value as EntityKind
                setE({ ...blankEntity(k), name: e.name, description: e.description, summary: e.summary, effects: e.effects } as AnyEntity)
              }}
            >
              {HOMEBREW_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_NAMES[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">{t('common.name')}</label>
            <input className="input font-display" value={e.name} onChange={(ev) => set({ name: ev.target.value })} autoFocus />
          </div>
        </div>
        <div>
          <label className="label">{t('hb.summary')}</label>
          <input className="input" value={e.summary} onChange={(ev) => set({ summary: ev.target.value })} placeholder={t('hb.summaryHint')} />
        </div>

        {/* Type-spesifikke felt */}
        {e.kind === 'weapon' && (
          <div className="grid grid-cols-4 gap-3">
            <Sel label="Category" v={a.category} o={['simple', 'martial']} on={(v) => set({ category: v })} />
            <Sel label="Type" v={a.weaponType} o={['melee', 'ranged']} on={(v) => set({ weaponType: v })} />
            <Txt label="Damage" v={a.damage} on={(v) => set({ damage: v })} />
            <Sel label="Damage Type" v={a.damageType} o={DAMAGE} on={(v) => set({ damageType: v })} />
            <Sel label="Mastery" v={a.mastery} o={MASTERY} on={(v) => set({ mastery: v })} />
            <Txt label="Versatile" v={a.versatile ?? ''} on={(v) => set({ versatile: v || undefined })} />
            <Txt label="Range" v={a.range ?? ''} on={(v) => set({ range: v || undefined })} />
            <Num label="Weight (lb.)" v={a.weight} on={(v) => set({ weight: v })} />
            <div className="col-span-4">
              <label className="label">Properties</label>
              <div className="flex flex-wrap gap-1">
                {PROPS.map((p) => {
                  const on = (a.properties as string[]).includes(p)
                  return (
                    <button key={p} className={`chip cursor-pointer ${on ? 'border-gold text-gold' : ''}`} onClick={() => set({ properties: on ? (a.properties as string[]).filter((x) => x !== p) : [...(a.properties as string[]), p] })}>
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {e.kind === 'armor' && (
          <div className="grid grid-cols-4 gap-3">
            <Sel label="Category" v={a.category} o={['light', 'medium', 'heavy', 'shield'] as ArmorCategory[]} on={(v) => set({ category: v, dexCap: v === 'light' ? null : v === 'medium' ? 2 : 0 })} />
            <Num label="Base AC" v={a.baseAC} on={(v) => set({ baseAC: v })} />
            <Num label="Strength req." v={a.strength ?? 0} on={(v) => set({ strength: v || undefined })} />
            <Num label="Weight (lb.)" v={a.weight} on={(v) => set({ weight: v })} />
            <label className="col-span-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!a.stealthDisadvantage} onChange={(ev) => set({ stealthDisadvantage: ev.target.checked })} /> Stealth Disadvantage
            </label>
          </div>
        )}
        {e.kind === 'magicItem' && (
          <div className="grid grid-cols-4 gap-3">
            <Txt label="Item type" v={a.itemType} on={(v) => set({ itemType: v })} />
            <Sel label="Rarity" v={a.rarity} o={['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']} on={(v) => set({ rarity: v })} />
            <Sel label="Attunement" v={a.attunement ? 'yes' : 'no'} o={['no', 'yes']} on={(v) => set({ attunement: v === 'yes' })} />
            <Num label="Bonus (+N)" v={a.bonus ?? 0} on={(v) => set({ bonus: v || undefined })} />
          </div>
        )}
        {e.kind === 'spell' && (
          <div className="grid grid-cols-4 gap-3">
            <Num label="Level (0 = cantrip)" v={a.level} on={(v) => set({ level: Math.max(0, Math.min(9, v)) })} />
            <Sel label="School" v={a.school} o={SCHOOLS} on={(v) => set({ school: v })} />
            <Txt label="Casting Time" v={a.castingTime} on={(v) => set({ castingTime: v })} />
            <Txt label="Range" v={a.range} on={(v) => set({ range: v })} />
            <Txt label="Duration" v={a.duration} on={(v) => set({ duration: v })} />
            <Txt label="Material" v={(a.components as { m?: string }).m ?? ''} on={(v) => set({ components: { ...(a.components as object), m: v || undefined } })} />
            <Txt label="Damage dice" v={(a.damage as { dice?: string } | undefined)?.dice ?? ''} on={(v) => set({ damage: v ? { dice: v, type: (a.damage as { type?: string } | undefined)?.type ?? 'fire' } : undefined })} />
            <Sel label="Damage type" v={(a.damage as { type?: string } | undefined)?.type ?? 'fire'} o={DAMAGE} on={(v) => a.damage && set({ damage: { ...(a.damage as object), type: v } })} />
            <Sel label="Attack" v={a.attack ?? ''} o={['', 'melee', 'ranged']} on={(v) => set({ attack: v || undefined })} />
            <Sel label="Save" v={a.save ?? ''} o={['', ...ABILITIES]} on={(v) => set({ save: v || undefined })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!a.concentration} onChange={(ev) => set({ concentration: ev.target.checked })} /> Concentration
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!a.ritual} onChange={(ev) => set({ ritual: ev.target.checked })} /> Ritual
            </label>
            <div className="col-span-4">
              <label className="label">Classes</label>
              <div className="flex flex-wrap gap-1">
                {CLASSES.map((c) => {
                  const on = (a.classes as string[]).includes(c)
                  return (
                    <button key={c} className={`chip cursor-pointer capitalize ${on ? 'border-gold text-gold' : ''}`} onClick={() => set({ classes: on ? (a.classes as string[]).filter((x) => x !== c) : [...(a.classes as string[]), c] })}>
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {e.kind === 'feat' && (
          <div className="grid grid-cols-3 gap-3">
            <Sel label="Category" v={a.category} o={['origin', 'general', 'fightingStyle', 'epicBoon']} on={(v) => set({ category: v })} />
            <Txt label="Prerequisite" v={a.prerequisite ?? ''} on={(v) => set({ prerequisite: v || undefined })} />
            <Sel label="+1 ability" v={(a.abilityIncrease as { options: string[] } | undefined) ? 'yes' : 'no'} o={['no', 'yes']} on={(v) => set({ abilityIncrease: v === 'yes' ? { options: ABILITIES, amount: 1 } : undefined })} />
          </div>
        )}
        {e.kind === 'subclass' && <SubclassForm e={e} set={set} />}
        {e.kind === 'species' && <SpeciesForm e={e} set={set} />}
        {e.kind === 'background' && <BackgroundForm e={e} set={set} />}
        {e.kind === 'creature' && <CreatureForm e={e} set={set} />}
        {e.kind === 'language' && <LanguageForm e={e} set={set} />}
        {(e.kind === 'gear' || e.kind === 'tool') && (
          <div className="grid grid-cols-3 gap-3">
            <Txt label="Cost" v={a.cost} on={(v) => set({ cost: v })} />
            <Num label="Weight (lb.)" v={a.weight} on={(v) => set({ weight: v })} />
            {e.kind === 'gear' && <Txt label="Category" v={a.category ?? ''} on={(v) => set({ category: v || undefined })} />}
          </div>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="label">{e.kind === 'creature' ? t('hb.statBlock') : t('common.description')} (Markdown)</label>
            <button className="btn btn-ghost btn-sm" onClick={() => setPreview(!preview)}>
              {preview ? t('hb.editText') : t('hb.preview')}
            </button>
          </div>
          {preview ? (
            <div className="rounded-lg border border-line-soft p-3">
              <Markdown text={e.description} />
            </div>
          ) : (
            <textarea
              className="input min-h-32 font-serif text-[15px]"
              value={e.description}
              placeholder={e.kind === 'creature' ? t('hb.statBlockPh') : ''}
              onChange={(ev) => set({ description: ev.target.value })}
            />
          )}
        </div>
        {KINDS_WITH_EFFECTS.has(e.kind) && <EffectsEditor effects={e.effects ?? []} onChange={(effects) => set({ effects })} />}
      </div>
      <EntityPicker
        open={copyFrom}
        onClose={() => setCopyFrom(false)}
        kinds={isNew ? [e.kind] : HOMEBREW_KINDS}
        title={t('hb.copyFrom')}
        groupBy={(x) => KIND_NAMES[x.kind] ?? x.kind}
        onConfirm={(_ids, ents) => {
          const src = ents[0]
          if (src) setE({ ...JSON.parse(JSON.stringify(src)), id: '', name: `${src.name} (homebrew)`, source: 'Homebrew', sourceBook: undefined, license: undefined })
        }}
      />
    </Modal>
  )
}

export function EffectsEditor({ effects, onChange }: { effects: Effect[]; onChange: (e: Effect[]) => void }) {
  const { t } = useTranslation()
  const setAt = (i: number, p: Partial<Effect>): void => onChange(effects.map((e, j) => (j === i ? { ...e, ...p } : e)))
  return (
    <div className="rounded-xl border border-line-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="panel-title">{t('hb.effects')}</div>
          <div className="text-xs text-muted">{t('hb.effectsHint')}</div>
        </div>
        <button className="btn btn-sm" onClick={() => onChange([...effects, { target: 'ac', op: 'add', value: 1 }])}>
          <Plus size={13} /> {t('hb.addEffect')}
        </button>
      </div>
      <div className="space-y-2">
        {effects.map((e, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_auto] gap-2">
            <select className="input py-1 text-xs" value={EFFECT_TARGETS.some((x) => x.id === e.target) ? e.target : '__custom'} onChange={(ev) => setAt(i, { target: ev.target.value === '__custom' ? e.target : ev.target.value })}>
              {EFFECT_TARGETS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
              {!EFFECT_TARGETS.some((x) => x.id === e.target) && <option value="__custom">{e.target}</option>}
            </select>
            <select className="input py-1 text-xs" value={e.op} onChange={(ev) => setAt(i, { op: ev.target.value as Effect['op'] })}>
              {OPS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input
              className="input py-1 text-xs"
              value={e.value ?? ''}
              placeholder="value"
              onChange={(ev) => setAt(i, { value: /^-?\d+$/.test(ev.target.value) ? Number(ev.target.value) : ev.target.value })}
            />
            <input className="input py-1 text-xs" value={e.condition ?? ''} placeholder={t('hb.condition')} onChange={(ev) => setAt(i, { condition: ev.target.value || undefined })} />
            <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => onChange(effects.filter((_, j) => j !== i))}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {!effects.length && <div className="text-xs text-faint">{t('hb.noEffects')}</div>}
      </div>
    </div>
  )
}

function Sel({ label, v, o, on }: { label: string; v: unknown; o: readonly string[]; on: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input capitalize" value={String(v ?? '')} onChange={(e) => on(e.target.value)}>
        {o.map((x) => (
          <option key={x} value={x}>
            {x || '—'}
          </option>
        ))}
      </select>
    </div>
  )
}
function Txt({ label, v, on }: { label: string; v: unknown; on: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={String(v ?? '')} onChange={(e) => on(e.target.value)} />
    </div>
  )
}
function Num({ label, v, on }: { label: string; v: unknown; on: (v: number) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" value={Number(v ?? 0)} onChange={(e) => on(Number(e.target.value))} />
    </div>
  )
}
