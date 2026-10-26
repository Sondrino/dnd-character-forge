import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Package, Sparkles, Library } from 'lucide-react'
import type { AnyEntity, Effect } from '../../types'
import { useChar } from './context'
import { Empty, Section, SourceBadge, Toggle } from '../ui'
import { EntityEditor, KIND_NAMES, EffectsEditor } from '../HomebrewEditor'
import { EntityLink } from '../EntityInfo'
import { uid } from '../../store/characters'
import { useHomebrew } from '../../store/settings'
import { EntityPicker } from '../EntityPicker'
import { useUi } from '../../store/ui'

export function CustomTab() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const [editing, setEditing] = useState<AnyEntity | null | 'new'>(null)
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

  const addToChar = (e: AnyEntity): void =>
    update((c) => {
      if (e.kind === 'spell') {
        if (!c.spells.some((s) => s.spellId === e.id)) c.spells.push({ spellId: e.id, source: 'manual', prepared: true })
      } else if (e.kind === 'feat') c.feats.push({ uid: uid(), featId: e.id, source: 'manual' })
      else c.inventory.push({ uid: uid(), refId: e.id, qty: 1, equipped: false, attuned: false })
    })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-7">
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
                const used = e.kind === 'spell' ? char.spells.some((s) => s.spellId === e.id) : e.kind === 'feat' ? char.feats.some((f) => f.featId === e.id) : char.inventory.some((i) => i.refId === e.id)
                return (
                  <div key={`${e.kind}:${e.id}`} className="flex items-center gap-3 py-2">
                    <span className="chip">{KIND_NAMES[e.kind] ?? e.kind}</span>
                    <EntityLink kind={e.kind} id={e.id} entity={e} className="font-medium" />
                    <span className="truncate text-xs text-muted">{e.summary}</span>
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
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)}>
                        <Pencil size={12} />
                      </button>
                      <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => update((c) => void (c.customEntities = c.customEntities.filter((x) => !(x.id === e.id && x.kind === e.kind))))}>
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
                  <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => update((c) => void c.customEffects.splice(i, 1))}>
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
