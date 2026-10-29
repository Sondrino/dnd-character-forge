import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Package, Sparkles, Library, Copy, Zap } from 'lucide-react'
import type { AnyEntity, Effect, Feature } from '../../types'
import { useChar } from './context'
import { Empty, Section, SourceBadge, Toggle } from '../ui'
import { EntityEditor, KIND_NAMES, EffectsEditor } from '../HomebrewEditor'
import { EntityLink } from '../EntityInfo'
import { uid } from '../../store/characters'
import { useHomebrew } from '../../store/settings'
import { EntityPicker } from '../EntityPicker'
import { removeWithUndo, useUi } from '../../store/ui'
import { SpecialAbilityEditor } from './SpecialAbilityEditor'
import { UsesTracker } from './SheetTab'

export function CustomTab() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const [editing, setEditing] = useState<AnyEntity | null | 'new'>(null)
  const [ability, setAbility] = useState<Feature | null | 'new'>(null)
  const [fromLib, setFromLib] = useState(false)
  const hb = useHomebrew((s) => s.entities)
  const upsertGlobal = useHomebrew((s) => s.upsert)
  const notify = useUi((s) => s.notify)

  const save = (e: AnyEntity): void =>
    update((c) => {
      const i = c.customEntities.findIndex((x) => x.id === e.id && x.kind === e.kind)
      if (i >= 0) c.customEntities[i] = e
      else c.customEntities.push(e)
    })

  /** Typer som kan legges rett på karakteren (subclass/species/background velges i veiviseren eller ved level up) */
  const usable = (e: AnyEntity): boolean => ['spell', 'feat', 'gear', 'weapon', 'armor', 'magicItem', 'tool', 'language'].includes(e.kind)
  const addToChar = (e: AnyEntity): void =>
    update((c) => {
      if (!usable(e)) return
      if (e.kind === 'language') {
        if (!c.extra.languages.includes(e.id)) c.extra.languages.push(e.id)
      } else if (e.kind === 'spell') {
        if (!c.spells.some((s) => s.spellId === e.id)) c.spells.push({ spellId: e.id, source: 'manual', prepared: true })
      } else if (e.kind === 'feat') c.feats.push({ uid: uid(), featId: e.id, source: 'manual' })
      else c.inventory.push({ uid: uid(), refId: e.id, qty: 1, equipped: false, attuned: false })
    })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <Section
          title={t('ability.title')}
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => setAbility('new')}>
              <Plus size={13} /> {t('ability.create')}
            </button>
          }
        >
          {char.customFeatures.length === 0 ? (
            <Empty icon={<Zap size={30} />} title={t('ability.empty')} text={t('ability.emptyText')} />
          ) : (
            <div className="divide-y divide-line-soft">
              {char.customFeatures.map((f) => {
                const df = d.features.find((x) => x.key === `custom:${f.id}`)
                const on = !!f.toggle && char.activeStates.includes(f.toggle)
                return (
                  <div key={f.id} className="flex flex-wrap items-center gap-2 py-2">
                    <Zap size={14} className="text-gold" />
                    <span className="font-display text-[15px] text-gold">{f.name}</span>
                    {f.activation && f.activation !== 'passive' && <span className="chip py-0 text-[10px]">{t(`ability.act.${f.activation}`)}</span>}
                    {f.roll && <span className="chip border-arcane/50 py-0 text-[10px] text-arcane">{t(`ability.kind.${f.roll.kind}`)}</span>}
                    {f.effects?.length ? <span className="chip py-0 text-[10px]">{t('ability.nEffects', { n: f.effects.length })}</span> : null}
                    <span className="min-w-0 flex-1 truncate text-xs text-muted">{f.summary}</span>
                    {df && <UsesTracker f={df} />}
                    {f.toggle && (
                      <Toggle
                        checked={on}
                        onChange={(v) => update((c) => void (c.activeStates = v ? [...c.activeStates.filter((s) => s !== f.toggle), f.toggle!] : c.activeStates.filter((s) => s !== f.toggle)))}
                        label={<span className="text-xs">{on ? t('ability.on') : t('ability.off')}</span>}
                      />
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => setAbility(f)} title={t('ability.edit')}>
                      <Pencil size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      title={t('ability.duplicate')}
                      onClick={() => update((c) => void c.customFeatures.push({ ...JSON.parse(JSON.stringify(f)), id: `ability-${uid()}`, name: `${f.name} (2)`, toggle: f.toggle ? `${f.toggle}2` : undefined }))}
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-faint hover:text-bad"
                      title={t('common.delete')}
                      aria-label={t('common.delete')}
                      onClick={() =>
                        removeWithUndo(
                          char.id,
                          (c) => {
                            c.customFeatures = c.customFeatures.filter((x) => x.id !== f.id)
                            delete c.featureUses[`custom:${f.id}`]
                            if (f.toggle) c.activeStates = c.activeStates.filter((s) => s !== f.toggle)
                          },
                          t('polish.deleted', { name: f.name })
                        )
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
        <Section
          title={t('custom.entities')}
          actions={
            <>
              <button className="btn btn-sm" onClick={() => setFromLib(true)} disabled={!hb.length}>
                <Library size={13} /> {t('custom.fromLibrary')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
                <Plus size={13} /> {t('custom.create')}
              </button>
            </>
          }
        >
          {char.customEntities.length === 0 ? (
            <Empty icon={<Sparkles size={30} />} title={t('custom.empty')} text={t('custom.emptyText')} />
          ) : (
            <div className="divide-y divide-line-soft">
              {char.customEntities.map((e) => {
                const used = !usable(e) || (e.kind === 'spell' ? char.spells.some((s) => s.spellId === e.id) : e.kind === 'feat' ? char.feats.some((f) => f.featId === e.id) : e.kind === 'language' ? char.extra.languages.includes(e.id) : char.inventory.some((i) => i.refId === e.id))
                return (
                  <div key={`${e.kind}:${e.id}`} className="flex items-center gap-3 py-2">
                    <span className="chip">{KIND_NAMES[e.kind] ?? e.kind}</span>
                    <EntityLink kind={e.kind} id={e.id} entity={e} className="font-medium" />
                    <span className="truncate text-xs text-muted">{e.summary}</span>
                    {!usable(e) && <span className="shrink-0 text-[10px] text-faint">{t(`hb.useHint.${e.kind}`, { defaultValue: '' })}</span>}
                    <div className="ml-auto flex gap-1">
                      {!used && (
                        <button className="btn btn-sm" onClick={() => addToChar(e)}>
                          <Package size={12} /> {t('custom.add')}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        title={t('custom.toLibrary')}
                        onClick={() => {
                          upsertGlobal(e)
                          notify(t('custom.savedLibrary'), 'good')
                        }}
                      >
                        <Library size={12} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)} title={t('hb.editShort')} aria-label={t('hb.editShort')}>
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-faint hover:text-bad"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        onClick={() => removeWithUndo(char.id, (c) => void (c.customEntities = c.customEntities.filter((x) => !(x.id === e.id && x.kind === e.kind))), t('polish.deleted', { name: e.name }))}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>
      <div className="col-span-12 space-y-4 lg:col-span-5">
        <Section title={t('custom.effects')}>
          <p className="mb-3 text-xs text-muted">{t('custom.effectsHint')}</p>
          <div className="space-y-2">
            {char.customEffects.map((ce, i) => (
              <div key={ce.uid} className="rounded-xl border border-line-soft p-2">
                <div className="mb-2 flex items-center gap-2">
                  <Toggle checked={ce.active} onChange={(v) => update((c) => void (c.customEffects[i].active = v))} />
                  <input className="input py-1" value={ce.label} onChange={(e) => update((c) => void (c.customEffects[i].label = e.target.value))} />
                  <button
                    className="btn btn-ghost btn-sm text-faint hover:text-bad"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                    onClick={() => removeWithUndo(char.id, (c) => void (c.customEffects = c.customEffects.filter((x) => x.uid !== ce.uid)), t('polish.deleted', { name: ce.label }))}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <EffectsEditor
                  effects={[ce]}
                  onChange={(list: Effect[]) =>
                    update((c) => {
                      const n = list[0]
                      if (!n) c.customEffects.splice(i, 1)
                      else c.customEffects[i] = { ...c.customEffects[i], target: n.target, op: n.op, value: n.value, condition: n.condition }
                    })
                  }
                />
              </div>
            ))}
          </div>
          <button className="btn btn-sm mt-3" onClick={() => update((c) => void c.customEffects.push({ uid: uid(), label: t('custom.newEffect'), active: true, target: 'ac', op: 'add', value: 1 }))}>
            <Plus size={13} /> {t('custom.addEffect')}
          </button>
        </Section>
        <Section title={t('custom.overrides')}>
          {Object.keys(char.overrides).length === 0 ? (
            <p className="text-xs text-muted">{t('custom.noOverrides')}</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(char.overrides).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-sm">
                  <code className="text-xs text-muted">{k}</code>
                  <span className="font-display">{String(v)}</span>
                  <button className="btn btn-ghost btn-sm ml-auto" onClick={() => update((c) => void delete c.overrides[k])}>
                    {t('stat.reset')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
      <SpecialAbilityEditor open={ability !== null} onClose={() => setAbility(null)} initial={ability === 'new' ? null : ability} />
      <EntityEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing === 'new' ? null : editing}
        existingIds={char.customEntities.map((e) => e.id)}
        onSave={(e) => {
          save(e)
          if (editing === 'new') addToChar(e)
        }}
      />
      <EntityPicker
        open={fromLib}
        onClose={() => setFromLib(false)}
        kinds={['gear', 'weapon', 'armor', 'magicItem', 'spell', 'feat', 'tool']}
        filter={(e) => e.source === 'Homebrew'}
        title={t('custom.fromLibrary')}
        multi
        onConfirm={(_ids, ents) => ents.forEach((e) => addToChar(e))}
      />
      <span className="hidden">
        <SourceBadge source="Homebrew" />
      </span>
    </div>
  )
}
