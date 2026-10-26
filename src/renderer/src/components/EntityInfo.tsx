import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, ExternalLink, Maximize2, Plus, X, Check } from 'lucide-react'
import type {
  AnyEntity, ArmorDef, BackgroundDef, ClassDef, EntityKind, FeatDef, GearDef, MagicItemDef, SpeciesDef, SpellDef,
  SubclassDef, ToolDef, WeaponDef
} from '../types'
import { Markdown, SourceBadge } from './ui'
import { resolveEntity, useCharacter, useLookup, useUi, type DetailRef } from '../store/ui'
import { dndBeyondUrl } from '../data'
import { useSettings } from '../store/settings'
import { api } from '../lib/api'
import { abilityNames, skillById } from '../data/skills'
import { uid } from '../store/characters'
import type { Lookup } from '../engine/lookup'

export const KIND_LABEL: Record<string, string> = {
  class: 'Class', subclass: 'Subclass', species: 'Species', background: 'Background', feat: 'Feat', spell: 'Spell',
  weapon: 'Weapon', armor: 'Armor', gear: 'Gear', tool: 'Tool', magicItem: 'Magic Item', condition: 'Condition',
  rule: 'Rule', language: 'Language', feature: 'Feature', creature: 'Creature'
}

export function openDndBeyond(e: { name: string; kind?: string; dndBeyondUrl?: string }): void {
  api.openDndBeyond(dndBeyondUrl(e), useSettings.getState().dndBeyondMode)
}

/* ------------------------------------------------------------------ */
/* Nøkkeltall for en entity (brukes i popup og detaljvisning)          */
/* ------------------------------------------------------------------ */

export function entityFacts(e: AnyEntity, L: Lookup): { label: string; value: ReactNode }[] {
  switch (e.kind) {
    case 'spell': {
      const s = e as SpellDef
      return [
        { label: 'Level', value: s.level === 0 ? `${s.school} cantrip` : `Level ${s.level} ${s.school}` },
        { label: 'Casting Time', value: `${s.castingTime}${s.ritual ? ' (Ritual)' : ''}` },
        { label: 'Range', value: s.range },
        { label: 'Components', value: [s.components.v && 'V', s.components.s && 'S', s.components.m && `M (${s.components.m})`].filter(Boolean).join(', ') },
        { label: 'Duration', value: s.duration },
        { label: 'Classes', value: s.classes.map((c) => L.get('class', c)?.name ?? c).join(', ') }
      ]
    }
    case 'weapon': {
      const w = e as WeaponDef
      return [
        { label: 'Damage', value: `${w.damage} ${w.damageType}${w.versatile ? ` (versatile ${w.versatile})` : ''}` },
        { label: 'Category', value: `${cap(w.category)} ${w.weaponType}` },
        { label: 'Properties', value: w.properties.map(cap).join(', ') + (w.range ? ` (${w.range})` : '') || '—' },
        { label: 'Mastery', value: cap(w.mastery) },
        { label: 'Weight / Cost', value: `${w.weight} lb. · ${w.cost}` }
      ]
    }
    case 'armor': {
      const a = e as ArmorDef
      const ac = a.category === 'shield' ? `+${a.baseAC}` : `${a.baseAC}${a.dexCap === null ? ' + Dex' : a.dexCap ? ` + Dex (max ${a.dexCap})` : ''}`
      return [
        { label: 'Armor Class', value: ac },
        { label: 'Category', value: cap(a.category) },
        { label: 'Strength', value: a.strength ? `Str ${a.strength}` : '—' },
        { label: 'Stealth', value: a.stealthDisadvantage ? 'Disadvantage' : '—' },
        { label: 'Weight / Cost', value: `${a.weight} lb. · ${a.cost}` }
      ]
    }
    case 'gear': {
      const g = e as GearDef
      return [
        { label: 'Category', value: g.category ?? 'Adventuring Gear' },
        { label: 'Weight / Cost', value: `${g.weight} lb. · ${g.cost}` }
      ]
    }
    case 'tool': {
      const t = e as ToolDef
      return [
        { label: 'Ability', value: abilityNames[t.ability] },
        { label: 'Utilize', value: t.utilize?.join('; ') },
        { label: 'Weight / Cost', value: `${t.weight} lb. · ${t.cost}` }
      ]
    }
    case 'magicItem': {
      const m = e as MagicItemDef
      return [
        { label: 'Type', value: m.itemType },
        { label: 'Rarity', value: cap(m.rarity) },
        { label: 'Attunement', value: m.attunement === true ? 'Required' : m.attunement ? `Required ${m.attunement}` : 'No' }
      ]
    }
    case 'class': {
      const c = e as ClassDef
      return [
        { label: 'Hit Die', value: `d${c.hitDie}` },
        { label: 'Primary Ability', value: c.primaryAbility.map((a) => abilityNames[a]).join(' or ') },
        { label: 'Saving Throws', value: c.savingThrows.map((a) => abilityNames[a]).join(', ') },
        { label: 'Skills', value: `Choose ${c.skillChoices.count}: ${c.skillChoices.options.map((s) => skillById[s]?.name ?? s).join(', ')}` },
        { label: 'Armor', value: c.armorTraining.length ? c.armorTraining.map(cap).join(', ') : 'None' },
        { label: 'Weapons', value: c.weaponProficiencies.map(cap).join(', ') },
        ...(c.spellcasting ? [{ label: 'Spellcasting', value: `${abilityNames[c.spellcasting.ability]} (${c.spellcasting.progression})` }] : [])
      ]
    }
    case 'subclass': {
      const s = e as SubclassDef
      return [{ label: 'Class', value: L.get('class', s.classId)?.name ?? s.classId }]
    }
    case 'species': {
      const s = e as SpeciesDef
      return [
        { label: 'Creature Type', value: s.creatureType },
        { label: 'Size', value: s.size },
        { label: 'Speed', value: `${s.speed} ft.` },
        ...(s.darkvision ? [{ label: 'Darkvision', value: `${s.darkvision} ft.` }] : [])
      ]
    }
    case 'background': {
      const b = e as BackgroundDef
      return [
        { label: 'Ability Scores', value: b.abilityScores.map((a) => abilityNames[a]).join(', ') },
        { label: 'Feat', value: L.get('feat', b.originFeat)?.name ?? b.originFeat },
        { label: 'Skills', value: b.skills.map((s) => skillById[s]?.name ?? s).join(', ') },
        { label: 'Tool', value: L.get('tool', b.tool)?.name ?? b.tool.replace('choice:', 'Choose: ') }
      ]
    }
    case 'feat': {
      const f = e as FeatDef
      return [
        { label: 'Category', value: { origin: 'Origin', general: 'General', fightingStyle: 'Fighting Style', epicBoon: 'Epic Boon' }[f.category] },
        ...(f.prerequisite ? [{ label: 'Prerequisite', value: f.prerequisite }] : []),
        ...(f.repeatable ? [{ label: 'Repeatable', value: 'Yes' }] : [])
      ]
    }
    case 'creature': {
      const c = e as unknown as { size: string; creatureType: string; ac: number; hp: string; speed: string; cr: string }
      return [
        { label: 'Type', value: `${c.size} ${c.creatureType}` },
        { label: 'AC / HP', value: `${c.ac} · ${c.hp}` },
        { label: 'Speed', value: c.speed },
        { label: 'CR', value: c.cr }
      ]
    }
    default:
      return []
  }
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/* ------------------------------------------------------------------ */
/* EntityLink – klikkbar tekst som åpner liten popup                   */
/* ------------------------------------------------------------------ */

export function EntityLink({
  kind, id, entity, children, className
}: {
  kind: DetailRef['kind']
  id: string
  entity?: AnyEntity
  children?: ReactNode
  className?: string
}) {
  const L = useLookup()
  const e = resolveEntity(L, { kind, id, entity })
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  if (!e) return <span className={className}>{children ?? id}</span>
  return (
    <>
      <span
        ref={ref}
        className={`entity-link ${className ?? ''}`}
        onClick={(ev) => {
          ev.stopPropagation()
          setAnchor(ref.current!.getBoundingClientRect())
        }}
      >
        {children ?? e.name}
      </span>
      <InfoPopover entity={e} anchor={anchor} onClose={() => setAnchor(null)} refKind={kind} />
    </>
  )
}

export function InfoPopover({
  entity, anchor, onClose, refKind
}: {
  entity: AnyEntity
  anchor: DOMRect | null
  onClose: () => void
  refKind?: DetailRef['kind']
}) {
  const { t } = useTranslation()
  const L = useLookup()
  const openDetail = useUi((s) => s.openDetail)
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!anchor) return
    const h = (e: MouseEvent): void => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose()
    }
    const k = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    setTimeout(() => window.addEventListener('mousedown', h), 0)
    window.addEventListener('keydown', k)
    return () => {
      window.removeEventListener('mousedown', h)
      window.removeEventListener('keydown', k)
    }
  }, [anchor, onClose])

  const W = 360
  const left = anchor ? Math.min(window.innerWidth - W - 12, Math.max(12, anchor.left - 20)) : 0
  const below = anchor ? anchor.bottom + 320 < window.innerHeight : true
  const top = anchor ? (below ? anchor.bottom + 8 : undefined) : 0
  const bottom = anchor && !below ? window.innerHeight - anchor.top + 8 : undefined
  const facts = entityFacts(entity, L).slice(0, 5)

  return createPortal(
    <AnimatePresence>
      {anchor && (
        <motion.div
          ref={boxRef}
          className="panel fixed z-[80] overflow-hidden"
          style={{ left, top, bottom, width: W }}
          initial={{ opacity: 0, y: below ? -6 : 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        >
          <div className="border-b border-line-soft bg-panel-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">{KIND_LABEL[entity.kind] ?? entity.kind}</div>
                <div className="font-display text-[17px] text-gold">{entity.name}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-3 px-4 py-3">
            {facts.length > 0 && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                {facts.map((f) => (
                  <FactRow key={f.label} {...f} />
                ))}
              </dl>
            )}
            <p className="font-serif text-[15px] leading-snug">{entity.summary}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose()
                  openDetail({ kind: refKind ?? entity.kind, id: entity.id, entity: entity.kind === 'feature' ? entity : undefined })
                }}
              >
                <Maximize2 size={13} /> {t('info.more')}
              </button>
              {entity.kind !== 'feature' && (
                <button className="btn btn-sm" onClick={() => openDndBeyond(entity)}>
                  <ExternalLink size={13} /> D&D Beyond
                </button>
              )}
              <span className="ml-auto">
                <SourceBadge source={entity.source} />
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-muted">{label}</dt>
      <dd className="text-ink">{value || '—'}</dd>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* DetailDrawer – full informasjon                                     */
/* ------------------------------------------------------------------ */

export function DetailDrawer() {
  const { t } = useTranslation()
  const detail = useUi((s) => s.detail)
  const history = useUi((s) => s.history)
  const close = useUi((s) => s.closeDetail)
  const back = useUi((s) => s.back)
  const L = useLookup()
  const e = detail ? resolveEntity(L, detail) : undefined

  useEffect(() => {
    if (!detail) return
    const k = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') close()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [detail, close])

  return createPortal(
    <AnimatePresence>
      {detail && e && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-[71] flex w-[min(760px,92vw)] flex-col border-l border-line bg-panel shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <header className="relative overflow-hidden border-b border-line-soft px-6 pb-4 pt-5">
              <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={back}>
                    <ArrowLeft size={14} />
                  </button>
                )}
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">{KIND_LABEL[e.kind] ?? e.kind}</span>
                <SourceBadge source={e.source} />
                <div className="ml-auto flex gap-2">
                  {e.kind !== 'feature' && (
                    <button className="btn btn-sm" onClick={() => openDndBeyond(e)}>
                      <ExternalLink size={13} /> {t('info.openDdb')}
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={close}>
                    <X size={16} />
                  </button>
                </div>
              </div>
              <motion.h2 key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-2 font-display text-3xl text-gold">
                {e.name}
              </motion.h2>
              <p className="mt-1 font-serif text-[16px] italic text-muted">{e.summary}</p>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AddToCharacter entity={e} />
              <EntityBody entity={e} />
              {e.source === 'PHB 2024' && (
                <div className="mt-6 rounded-xl border border-sky/30 bg-sky/5 p-3 text-sm text-muted">
                  <BookOpen size={14} className="mr-1 inline" /> {t('info.phbNote')}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

function EntityBody({ entity: e }: { entity: AnyEntity }) {
  const L = useLookup()
  const facts = entityFacts(e, L)
  return (
    <div className="space-y-5">
      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border border-line-soft bg-panel-2 p-4 text-[13px]">
          {facts.map((f) => (
            <FactRow key={f.label} {...f} />
          ))}
        </dl>
      )}
      <Markdown text={e.description} />
      {e.kind === 'spell' && (e as SpellDef).higherLevels && !e.description.includes((e as SpellDef).higherLevels!.slice(0, 30)) && (
        <Markdown text={`**Using a Higher-Level Spell Slot.** ${(e as SpellDef).higherLevels}`} />
      )}
      {e.kind === 'class' && <ClassBody c={e as ClassDef} />}
      {e.kind === 'subclass' && <FeatureList features={(e as SubclassDef).features} />}
      {e.kind === 'species' && <SpeciesBody s={e as SpeciesDef} />}
      {e.kind === 'weapon' && <MasteryInfo id={(e as WeaponDef).mastery} props={(e as WeaponDef).properties} />}
    </div>
  )
}

function MasteryInfo({ id, props }: { id: string; props: string[] }) {
  const L = useLookup()
  const m = L.get('rule', `mastery-${id}`)
  return (
    <div className="space-y-3">
      {m && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <div className="panel-title mb-1">Mastery: {m.name.replace(/^Mastery:?\s*/i, '')}</div>
          <Markdown text={m.description} compact />
        </div>
      )}
      {props.map((p) => {
        const r = L.get('rule', `property-${p}`)
        return r ? (
          <div key={p} className="rounded-xl border border-line-soft p-3">
            <div className="panel-title mb-1">{r.name}</div>
            <Markdown text={r.description} compact />
          </div>
        ) : null
      })}
    </div>
  )
}

function ClassBody({ c }: { c: ClassDef }) {
  const L = useLookup()
  const subs = L.all('subclass').filter((s) => s.classId === c.id)
  const cols = [...new Set(c.table.flatMap((r) => Object.keys(r.columns ?? {})))]
  const options = L.classOptions.filter((o) => o.classId === c.id)
  return (
    <div className="space-y-6">
      <div>
        <h3 className="panel-title mb-2">{c.name} Features</h3>
        <div className="overflow-x-auto rounded-xl border border-line-soft">
          <table className="w-full text-[12px]">
            <thead className="bg-panel-2 text-gold">
              <tr>
                <th className="px-2 py-1.5 text-left">Lvl</th>
                <th className="px-2 py-1.5 text-left">PB</th>
                <th className="px-2 py-1.5 text-left">Features</th>
                {cols.map((k) => (
                  <th key={k} className="px-2 py-1.5 text-center">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.table.map((r) => (
                <tr key={r.level} className="border-t border-line-soft">
                  <td className="px-2 py-1">{r.level}</td>
                  <td className="px-2 py-1">+{r.profBonus}</td>
                  <td className="px-2 py-1">{r.features.join(', ')}</td>
                  {cols.map((k) => (
                    <td key={k} className="px-2 py-1 text-center">
                      {r.columns?.[k] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {c.quickBuild && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <div className="panel-title mb-1">Quick Build</div>
          <p className="font-serif text-[15px]">{c.quickBuild}</p>
        </div>
      )}
      <FeatureList features={c.features} />
      {subs.length > 0 && (
        <div>
          <h3 className="panel-title mb-2">Subclasses</h3>
          <div className="grid grid-cols-2 gap-2">
            {subs.map((s) => (
              <div key={s.id} className="rounded-xl border border-line-soft p-3">
                <EntityLink kind="subclass" id={s.id} className="font-display" />
                <div className="mt-1 text-xs text-muted">{s.summary}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {options.map((g) => (
        <div key={g.group}>
          <h3 className="panel-title mb-2">{g.group}</h3>
          <FeatureList features={g.items} />
        </div>
      ))}
      <div className="rounded-xl border border-line-soft p-4 text-sm">
        <div className="panel-title mb-1">Multiclassing</div>
        <p>
          <b>Prerequisite:</b> {c.multiclass?.prerequisite}
        </p>
        <p>
          <b>Proficiencies gained:</b> {c.multiclass?.proficiencies}
        </p>
      </div>
    </div>
  )
}

function SpeciesBody({ s }: { s: SpeciesDef }) {
  return (
    <div className="space-y-6">
      <FeatureList features={s.traits} title="Traits" />
      {s.options && (
        <div>
          <h3 className="panel-title mb-2">{s.options.label}</h3>
          <div className="space-y-2">
            {s.options.choices.map((o) => (
              <details key={o.id} className="rounded-xl border border-line-soft p-3">
                <summary className="cursor-pointer font-display text-gold">{o.name}</summary>
                <div className="mt-2">
                  <Markdown text={o.description} compact />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function FeatureList({ features, title }: { features: { id: string; name: string; level?: number; summary: string; description: string; prerequisite?: string }[]; title?: string }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div>
      {title && <h3 className="panel-title mb-2">{title}</h3>}
      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.id + (f.level ?? '')} className="overflow-hidden rounded-xl border border-line-soft">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-panel-2" onClick={() => setOpen(open === f.id ? null : f.id)}>
              {f.level !== undefined && <span className="chip shrink-0">Lvl {f.level}</span>}
              <span className="font-display text-[15px] text-gold">{f.name}</span>
              <span className="truncate text-xs text-muted">{f.summary}</span>
            </button>
            <AnimatePresence initial={false}>
              {open === f.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="border-t border-line-soft px-4 py-3">
                    {f.prerequisite && <div className="mb-2 text-xs text-muted">Prerequisite: {f.prerequisite}</div>}
                    <Markdown text={f.description} compact />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* «Legg til i karakter» fra detaljvisningen                           */
/* ------------------------------------------------------------------ */

function AddToCharacter({ entity: e }: { entity: AnyEntity }) {
  const { t } = useTranslation()
  const activeId = useUi((s) => s.activeCharacterId)
  const notify = useUi((s) => s.notify)
  const { char, update, derived } = useCharacter(activeId ?? undefined)
  if (!char) return null
  const isItem = ['weapon', 'armor', 'gear', 'tool', 'magicItem'].includes(e.kind)
  const isSpell = e.kind === 'spell'
  const isFeat = e.kind === 'feat'
  if (!isItem && !isSpell && !isFeat) return null
  const hasSpell = isSpell && char.spells.some((s) => s.spellId === e.id)
  const hasFeat = isFeat && char.feats.some((f) => f.featId === e.id)
  const qty = isItem ? char.inventory.filter((i) => i.refId === e.id).reduce((s, i) => s + i.qty, 0) : 0
  const sp = e as SpellDef
  const caster = isSpell ? derived?.spellcasting.find((c) => sp.classes.includes(c.spellList)) ?? derived?.spellcasting[0] : undefined
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm">
      <span className="text-muted">{char.name || t('common.unnamed')}:</span>
      {isItem && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            update((d) => {
              const ex = d.inventory.find((i) => i.refId === e.id && e.kind === 'gear')
              if (ex) ex.qty += 1
              else d.inventory.push({ uid: uid(), refId: e.id, qty: 1, equipped: false, attuned: false })
            })
            notify(t('info.addedItem', { name: e.name }), 'good')
          }}
        >
          <Plus size={13} /> {t('info.addInventory')}
        </button>
      )}
      {isItem && qty > 0 && <span className="chip">{t('info.owned', { n: qty })}</span>}
      {isSpell &&
        (hasSpell ? (
          <span className="chip text-good">
            <Check size={12} /> {t('info.known')}
          </span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              update((d) => {
                d.spells.push({ spellId: e.id, source: caster?.classId ?? 'manual', prepared: sp.level > 0 })
              })
              notify(t('info.addedSpell', { name: e.name }), 'good')
            }}
          >
            <Plus size={13} /> {t('info.addSpell')}
            {caster ? ` (${caster.className})` : ''}
          </button>
        ))}
      {isFeat &&
        (hasFeat && !(e as FeatDef).repeatable ? (
          <span className="chip text-good">
            <Check size={12} /> {t('info.hasFeat')}
          </span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              update((d) => {
                d.feats.push({ uid: uid(), featId: e.id, source: 'manual' })
              })
              notify(t('info.addedFeat', { name: e.name }), 'good')
            }}
          >
            <Plus size={13} /> {t('info.addFeat')}
          </button>
        ))}
    </div>
  )
}

export function kindOf(e: { kind: EntityKind }): string {
  return KIND_LABEL[e.kind] ?? e.kind
}
