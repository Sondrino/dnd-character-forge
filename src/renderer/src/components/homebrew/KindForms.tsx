import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, Zap } from 'lucide-react'
import type { Ability, AnyEntity, BackgroundDef, CreatureDef, Feature, LanguageDef, SkillId, SpeciesDef, SubclassDef } from '../../types'
import { ABILITIES } from '../../types'
import { useLookup } from '../../store/ui'
import { skills } from '../../data/skills'
import { EntityPicker } from '../EntityPicker'
import { SpecialAbilityEditor } from '../sheet/SpecialAbilityEditor'

const ABIL: Record<Ability, string> = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

type Patch = (p: Record<string, unknown>) => void

/* ------------------------------------------------------------------ */
/* Features (subclass-features, species-traits)                        */
/* ------------------------------------------------------------------ */

export function FeatureListEditor({ features, onChange, withLevel, defaultLevel = 3, title }: { features: Feature[]; onChange: (f: Feature[]) => void; withLevel?: boolean; defaultLevel?: number; title: string }) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState<Feature | null | 'new'>(null)
  const sorted = [...features].sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
  return (
    <div className="rounded-xl border border-line-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="panel-title">{title}</div>
          <div className="text-xs text-muted">{t('hb.featuresHint')}</div>
        </div>
        <button className="btn btn-sm" onClick={() => setEditing('new')}>
          <Plus size={13} /> {t('hb.addFeature')}
        </button>
      </div>
      <div className="space-y-1">
        {sorted.map((f) => (
          <div key={f.id} className="flex items-center gap-2 rounded-lg border border-line-soft px-2 py-1.5 text-sm">
            {withLevel && <span className="chip py-0 text-[10px]">Lvl {f.level ?? '–'}</span>}
            <Zap size={12} className="text-gold" />
            <span className="font-display text-gold">{f.name}</span>
            {f.activation && f.activation !== 'passive' && <span className="chip py-0 text-[10px]">{f.activation}</span>}
            {f.uses && <span className="chip py-0 text-[10px]">{String(f.uses.count)}/{f.uses.recharge}</span>}
            {f.roll && <span className="chip border-arcane/50 py-0 text-[10px] text-arcane">{f.roll.kind}</span>}
            {!!f.effects?.length && <span className="chip py-0 text-[10px]">{t('ability.nEffects', { n: f.effects.length })}</span>}
            <span className="min-w-0 flex-1 truncate text-xs text-muted">{f.summary}</span>
            <button className="btn btn-ghost btn-sm px-1" onClick={() => setEditing(f)}>
              <Pencil size={12} />
            </button>
            <button className="btn btn-ghost btn-sm px-1 text-faint hover:text-bad" onClick={() => onChange(features.filter((x) => x.id !== f.id))}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!features.length && <div className="text-xs text-faint">{t('hb.noFeatures')}</div>}
      </div>
      <SpecialAbilityEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing === 'new' ? null : editing}
        withLevel={withLevel}
        defaultLevel={defaultLevel}
        title={editing === 'new' ? t('hb.addFeature') : t('hb.editFeature')}
        onSave={(f) => {
          const i = features.findIndex((x) => x.id === f.id)
          onChange(i >= 0 ? features.map((x) => (x.id === f.id ? f : x)) : [...features, f])
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Subclass                                                            */
/* ------------------------------------------------------------------ */

export function SubclassForm({ e, set }: { e: SubclassDef; set: Patch }) {
  const { t } = useTranslation()
  const L = useLookup()
  const [picker, setPicker] = useState<number | null>(null)
  const classes = L.all('class').sort((a, b) => a.name.localeCompare(b.name))
  const cls = L.get('class', e.classId)
  const groups = e.alwaysPrepared ?? []
  const setGroups = (g: { level: number; spells: string[] }[]): void => set({ alwaysPrepared: g })
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Class</label>
          <select className="input" value={e.classId} onChange={(ev) => set({ classId: ev.target.value })}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <p className="col-span-2 self-end text-xs text-muted">{t('hb.subclassHint', { cls: cls?.name ?? '', lvl: cls?.subclassLevel ?? 3 })}</p>
      </div>
      <FeatureListEditor title={t('hb.subclassFeatures')} features={e.features ?? []} onChange={(features) => set({ features })} withLevel defaultLevel={cls?.subclassLevel ?? 3} />
      <div className="rounded-xl border border-line-soft p-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="panel-title">{t('hb.alwaysPrepared')}</div>
            <div className="text-xs text-muted">{t('hb.alwaysPreparedHint')}</div>
          </div>
          <button className="btn btn-sm" onClick={() => setGroups([...groups, { level: groups.length ? Math.min(20, groups[groups.length - 1].level + 2) : cls?.subclassLevel ?? 3, spells: [] }])}>
            <Plus size={13} /> {t('hb.addSpellLevel')}
          </button>
        </div>
        <div className="space-y-1">
          {groups.map((g, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs text-muted">{t('hb.classLevel')}</span>
              <input
                className="input w-16 py-1 text-center"
                value={g.level}
                inputMode="numeric"
                onChange={(ev) => setGroups(groups.map((x, j) => (j === i ? { ...x, level: Math.max(1, Math.min(20, Number(ev.target.value) || 1)) } : x)))}
              />
              {g.spells.map((id) => (
                <span key={id} className="chip">
                  {L.get('spell', id)?.name ?? id}
                  <button className="ml-1 text-faint hover:text-bad" onClick={() => setGroups(groups.map((x, j) => (j === i ? { ...x, spells: x.spells.filter((s) => s !== id) } : x)))}>
                    ×
                  </button>
                </span>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setPicker(i)}>
                <Plus size={12} /> Spells
              </button>
              <button className="btn btn-ghost btn-sm ml-auto text-faint hover:text-bad" onClick={() => setGroups(groups.filter((_, j) => j !== i))}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {!groups.length && <div className="text-xs text-faint">{t('hb.noSpells')}</div>}
        </div>
      </div>
      <EntityPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        kinds={['spell']}
        title={t('hb.alwaysPrepared')}
        multi
        selected={picker !== null ? groups[picker]?.spells : []}
        onConfirm={(ids) => picker !== null && setGroups(groups.map((x, j) => (j === picker ? { ...x, spells: ids } : x)))}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Species                                                             */
/* ------------------------------------------------------------------ */

export function SpeciesForm({ e, set }: { e: SpeciesDef; set: Patch }) {
  const { t } = useTranslation()
  const L = useLookup()
  const [picker, setPicker] = useState(false)
  const spells = e.spells ?? []
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="label">Size</label>
          <select className="input" value={e.size} onChange={(ev) => set({ size: ev.target.value })}>
            {['Tiny', 'Small', 'Medium', 'Small or Medium', 'Large'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Speed (ft.)</label>
          <input className="input" type="number" value={e.speed} onChange={(ev) => set({ speed: Number(ev.target.value) || 0 })} />
        </div>
        <div>
          <label className="label">Darkvision (ft.)</label>
          <input className="input" type="number" value={e.darkvision ?? 0} onChange={(ev) => set({ darkvision: Number(ev.target.value) || undefined })} />
        </div>
        <div>
          <label className="label">Creature type</label>
          <input className="input" value={e.creatureType} onChange={(ev) => set({ creatureType: ev.target.value })} />
        </div>
      </div>
      <FeatureListEditor title={t('hb.traits')} features={e.traits ?? []} onChange={(traits) => set({ traits })} withLevel defaultLevel={1} />
      <div className="rounded-xl border border-line-soft p-3">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="panel-title">{t('hb.speciesSpells')}</div>
            <div className="text-xs text-muted">{t('hb.speciesSpellsHint')}</div>
          </div>
          <button className="btn btn-sm" onClick={() => setPicker(true)}>
            <Plus size={13} /> Spell
          </button>
        </div>
        <div className="space-y-1">
          {spells.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted">{t('hb.charLevel')}</span>
              <input
                className="input w-16 py-1 text-center"
                value={s.level}
                inputMode="numeric"
                onChange={(ev) => set({ spells: spells.map((x, j) => (j === i ? { ...x, level: Math.max(1, Math.min(20, Number(ev.target.value) || 1)) } : x)) })}
              />
              <span>{L.get('spell', s.spellId)?.name ?? s.spellId}</span>
              <button className="btn btn-ghost btn-sm ml-auto text-faint hover:text-bad" onClick={() => set({ spells: spells.filter((_, j) => j !== i) })}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {!spells.length && <div className="text-xs text-faint">{t('hb.noSpells')}</div>}
        </div>
      </div>
      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['spell']}
        title={t('hb.speciesSpells')}
        multi
        onConfirm={(ids) => set({ spells: [...spells, ...ids.filter((id) => !spells.some((s) => s.spellId === id)).map((id) => ({ level: 1, spellId: id }))] })}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

export function BackgroundForm({ e, set }: { e: BackgroundDef; set: Patch }) {
  const { t } = useTranslation()
  const L = useLookup()
  const [picker, setPicker] = useState(false)
  const origin = L.all('feat').filter((f) => (f as { category: string }).category === 'origin').sort((a, b) => a.name.localeCompare(b.name))
  const tools = L.all('tool').sort((a, b) => a.name.localeCompare(b.name))
  const toggleAbility = (a: Ability): void => {
    const cur = e.abilityScores as Ability[]
    const next = cur.includes(a) ? cur.filter((x) => x !== a) : cur.length >= 3 ? [...cur.slice(1), a] : [...cur, a]
    set({ abilityScores: next })
  }
  const toggleSkill = (s: SkillId): void => {
    const cur = e.skills as SkillId[]
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : cur.length >= 2 ? [cur[1], s] : [...cur, s]
    set({ skills: next })
  }
  const optA = e.equipment?.[0] ?? { label: 'A', items: [], gp: 15 }
  const optB = e.equipment?.[1] ?? { label: 'B', items: [], gp: 50 }
  return (
    <div className="space-y-3">
      <div>
        <label className="label">{t('hb.bgAbilities', { n: e.abilityScores.length })}</label>
        <div className="flex gap-1">
          {ABILITIES.map((a) => (
            <button key={a} className={`chip cursor-pointer ${(e.abilityScores as Ability[]).includes(a) ? 'border-gold text-gold' : ''}`} onClick={() => toggleAbility(a)}>
              {ABIL[a]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Origin feat</label>
          <select className="input" value={e.originFeat} onChange={(ev) => set({ originFeat: ev.target.value })}>
            {origin.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tool proficiency</label>
          <select className="input" value={e.tool} onChange={(ev) => set({ tool: ev.target.value })}>
            <option value="choice:artisan">{t('hb.toolChoice', { what: 'Artisan’s Tools' })}</option>
            <option value="choice:gaming">{t('hb.toolChoice', { what: 'Gaming Set' })}</option>
            <option value="choice:musical">{t('hb.toolChoice', { what: 'Musical Instrument' })}</option>
            {tools.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">{t('hb.bgSkills', { n: e.skills.length })}</label>
        <div className="flex flex-wrap gap-1">
          {skills.map((s) => (
            <button key={s.id} className={`chip cursor-pointer ${(e.skills as SkillId[]).includes(s.id) ? 'border-gold text-gold' : ''}`} onClick={() => toggleSkill(s.id)}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-line-soft p-3">
        <div className="panel-title mb-2">{t('hb.equipment')}</div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <b>A:</b>
          {optA.items.map((it, i) => (
            <span key={i} className="chip">
              {it.qty && it.qty > 1 ? `${it.qty}× ` : ''}
              {(it.id && L.item(it.id)?.name) || it.name}
              <button className="ml-1 text-faint hover:text-bad" onClick={() => set({ equipment: [{ ...optA, items: optA.items.filter((_, j) => j !== i) }, optB] })}>
                ×
              </button>
            </span>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => setPicker(true)}>
            <Plus size={12} /> {t('hb.addItems')}
          </button>
          <span className="ml-auto flex items-center gap-1">
            +<input className="input w-16 py-1 text-center" type="number" value={optA.gp} onChange={(ev) => set({ equipment: [{ ...optA, gp: Number(ev.target.value) || 0 }, optB] })} /> GP
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <b>B:</b>
          <input className="input w-20 py-1 text-center" type="number" value={optB.gp} onChange={(ev) => set({ equipment: [optA, { ...optB, gp: Number(ev.target.value) || 0 }] })} /> GP
        </div>
      </div>
      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['gear', 'weapon', 'armor', 'tool']}
        title={t('hb.addItems')}
        multi
        onConfirm={(ids) => set({ equipment: [{ ...optA, items: [...optA.items, ...ids.map((id) => ({ id, qty: 1 }))] }, optB] })}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Skapning                                                            */
/* ------------------------------------------------------------------ */

export function CreatureForm({ e, set }: { e: CreatureDef; set: Patch }) {
  const mod = (n: number): string => {
    const m = Math.floor((n - 10) / 2)
    return m >= 0 ? `+${m}` : String(m)
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="label">Size</label>
          <select className="input" value={e.size} onChange={(ev) => set({ size: ev.target.value })}>
            {['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <input className="input" value={e.creatureType} onChange={(ev) => set({ creatureType: ev.target.value })} />
        </div>
        <div>
          <label className="label">Alignment</label>
          <input className="input" value={e.alignment ?? ''} onChange={(ev) => set({ alignment: ev.target.value })} />
        </div>
        <div>
          <label className="label">CR</label>
          <input className="input" value={e.cr} onChange={(ev) => set({ cr: ev.target.value })} />
        </div>
        <div>
          <label className="label">AC</label>
          <input className="input" type="number" value={e.ac} onChange={(ev) => set({ ac: Number(ev.target.value) || 10 })} />
        </div>
        <div>
          <label className="label">HP</label>
          <input className="input" value={e.hp} onChange={(ev) => set({ hp: ev.target.value })} placeholder="22 (4d8 + 4)" />
        </div>
        <div className="col-span-2">
          <label className="label">Speed</label>
          <input className="input" value={e.speed} onChange={(ev) => set({ speed: ev.target.value })} placeholder="30 ft., Fly 60 ft." />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {ABILITIES.map((a) => (
          <div key={a} className="text-center">
            <label className="label">{ABIL[a]}</label>
            <input
              className="input text-center"
              type="number"
              value={e.abilities[a]}
              onChange={(ev) => set({ abilities: { ...e.abilities, [a]: Number(ev.target.value) || 10 } })}
            />
            <div className="text-[11px] text-muted">{mod(e.abilities[a])}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Språk                                                               */
/* ------------------------------------------------------------------ */

export function LanguageForm({ e, set }: { e: LanguageDef; set: Patch }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label">Rarity</label>
        <select className="input" value={e.rarity} onChange={(ev) => set({ rarity: ev.target.value })}>
          <option value="standard">Standard</option>
          <option value="rare">Rare</option>
        </select>
      </div>
      <div>
        <label className="label">Origin</label>
        <input className="input" value={e.origin ?? ''} onChange={(ev) => set({ origin: ev.target.value || undefined })} placeholder="Dragons, Underdark …" />
      </div>
    </div>
  )
}

/** Sjekk at en homebrew-entity er komplett nok til å lagres; returnerer i18n-nøkkel for feilen */
export function validateHomebrew(e: AnyEntity): string | null {
  if (!e.name.trim()) return 'hb.err.name'
  if (e.kind === 'background') {
    if (e.abilityScores.length !== 3) return 'hb.err.abilities'
    if (e.skills.length !== 2) return 'hb.err.skills'
  }
  if (e.kind === 'subclass' && !e.classId) return 'hb.err.class'
  return null
}
