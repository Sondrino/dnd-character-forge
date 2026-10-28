import type React from 'react'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight, Plus, Info, RefreshCw, Trash2 } from 'lucide-react'
import type { Ability, AnyEntity, Character, FeatDef, SkillId, SpellDef, ToolDef } from '../../types'
import { ABILITIES } from '../../types'
import type { PendingChoice } from '../../engine/compute'
import { skills, skillById, abilityNames } from '../../data/skills'
import { useChar } from './context'
import { EntityPicker } from '../EntityPicker'
import { uid } from '../../store/characters'
import { useUi } from '../../store/ui'
import { spellFilter } from '../../lib/spellFilter'
import { featPrereqProblems } from '../../lib/rules'
import { EntityLink } from '../EntityInfo'

interface Opt {
  id: string
  label: string
  kind?: string
}

/** Chips for å velge N alternativer */
export function ChipChoice({
  options, value, count, onChange, allowDuplicates
}: {
  options: Opt[]
  value: string[]
  count: number
  onChange: (v: string[]) => void
  allowDuplicates?: boolean
}) {
  // Ref holder siste verdi slik at raske klikk ikke bruker utdatert state
  const latest = useRef(value)
  latest.current = value
  const emit = (v: string[]): void => {
    latest.current = v
    onChange(v)
  }
  const full = value.length >= count
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const n = value.filter((v) => v === o.id).length
        const on = n > 0
        return (
          <motion.button
            key={o.id}
            whileTap={{ scale: 0.92 }}
            className={`chip cursor-pointer px-2.5 py-1 text-[12px] transition-colors ${on ? 'border-gold bg-gold/20 text-gold-2' : full && !allowDuplicates ? 'opacity-40' : 'hover:border-gold hover:text-ink'}`}
            onClick={() => {
              const cur = latest.current
              const isOn = cur.includes(o.id)
              const isFull = cur.length >= count
              if (allowDuplicates) {
                if (!isFull) emit([...cur, o.id])
                else if (isOn) {
                  const i = cur.indexOf(o.id)
                  emit(cur.filter((_, j) => j !== i))
                }
                return
              }
              if (isOn) emit(cur.filter((v) => v !== o.id))
              else if (!isFull) emit([...cur, o.id])
              else if (count === 1) emit([o.id])
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              const cur = latest.current
              if (cur.includes(o.id)) {
                const i = cur.indexOf(o.id)
                emit(cur.filter((_, j) => j !== i))
              }
            }}
          >
            {on && <Check size={11} />}
            {o.kind ? (
              <span onClick={(e) => e.stopPropagation()}>
                <EntityLink kind={o.kind as never} id={o.id}>
                  {o.label}
                </EntityLink>
              </span>
            ) : (
              o.label
            )}
            {n > 1 && <span className="font-bold">×{n}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

function cap(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Hent nåværende verdier for et pending-valg */
export function getChoiceValues(char: Character, key: string): string[] {
  const m = /^featchoice:([^:]+):(.+)$/.exec(key)
  if (m) return char.feats.find((f) => f.uid === m[1])?.choices?.[m[2]] ?? []
  return char.choices[key] ?? []
}

export function setChoiceValues(d: Character, key: string, values: string[]): void {
  const m = /^featchoice:([^:]+):(.+)$/.exec(key)
  if (m) {
    const f = d.feats.find((x) => x.uid === m[1])
    if (f) f.choices = { ...(f.choices ?? {}), [m[2]]: values }
    return
  }
  d.choices[key] = values
}

/** Løser ett uløst valg inline */
export function ChoiceResolver({ p, compact }: { p: PendingChoice; compact?: boolean }) {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update, goTo } = useChar()
  const [picker, setPicker] = useState(false)
  const notify = useUi((s) => s.notify)

  const values = getChoiceValues(char, p.key)
  const set = (v: string[]): void => update((d) => setChoiceValues(d, p.key, v))

  const featChoiceMatch = /^featchoice:([^:]+):(.+)$/.exec(p.key)
  const cf = featChoiceMatch ? char.feats.find((f) => f.uid === featChoiceMatch[1]) : undefined
  const featDef = cf ? L.get('feat', cf.featId) : undefined

  let body: React.ReactElement | null = null

  switch (p.type) {
    case 'skill': {
      const opts: Opt[] = (p.options?.length ? (p.options as SkillId[]) : skills.map((s) => s.id)).map((id) => ({ id, label: skillById[id]?.name ?? cap(id) }))
      if (p.filter === 'skillOrTool') for (const tl of L.all('tool')) opts.push({ id: tl.id, label: tl.name })
      opts.sort((a, b) => a.label.localeCompare(b.label))
      body = <ChipChoice options={opts.filter((o) => values.includes(o.id) || !derived.skills[o.id as SkillId]?.proficient)} value={values} count={p.count} onChange={set} />
      break
    }
    case 'expertise': {
      const opts = skills.filter((s) => derived.skills[s.id].proficient || values.includes(s.id)).map((s) => ({ id: s.id, label: s.name }))
      body = <ChipChoice options={opts} value={values} count={p.count} onChange={set} />
      break
    }
    case 'tool': {
      const f = p.filter ?? ''
      const tools = L.all('tool').filter((tl: ToolDef) => !f || f.split(/[-,]|or/).some((c) => c && tl.category === c.trim()) || (p.options ?? []).includes(tl.id))
      body = <ChipChoice options={tools.sort((a, b) => a.name.localeCompare(b.name)).map((tl) => ({ id: tl.id, label: tl.name, kind: 'tool' }))} value={values} count={p.count} onChange={set} />
      break
    }
    case 'language': {
      const known = new Set(derived.proficiencies.languages)
      const langs = L.all('language').filter((l) => !known.has(l.id) || values.includes(l.id)).sort((a, b) => a.name.localeCompare(b.name))
      body = (
        <div className="space-y-2">
          {(['standard', 'rare'] as const).map((r) => (
            <div key={r}>
              <div className="mb-1 text-[10px] uppercase tracking-widest text-faint">{r}</div>
              <ChipChoice options={langs.filter((l) => l.rarity === r).map((l) => ({ id: l.id, label: l.name }))} value={values} count={p.count} onChange={set} />
            </div>
          ))}
        </div>
      )
      break
    }
    case 'option': {
      // Slå sammen alle grupper med samme navn (f.eks. SRD- og PHB-invocations), uten duplikater
      const groups = L.classOptions.filter((g) => g.group === p.filter)
      const merged = groups.flatMap((g) => g.items).filter((it, i, arr) => arr.findIndex((x) => x.id === it.id) === i)
      const group = groups.length ? { group: p.filter!, items: merged } : undefined
      // Invocations o.l. med level-krav vises først fra det class-levelet
      const clsLvl = char.classes.find((c) => c.classId === /^class:([^:]+):/.exec(p.key)?.[1])?.level ?? derived.totalLevel
      const opts: Opt[] = group
        ? group.items.filter((it) => ((it as { level?: number }).level ?? 0) <= clsLvl || values.includes(it.id)).map((it) => ({ id: it.id, label: it.name }))
        : (p.options ?? []).map((o) => ({ id: o, label: L.get('class', o)?.name ?? cap(o) }))
      body = (
        <div className="space-y-2">
          <ChipChoice options={opts} value={values} count={p.count} onChange={set} />
          {group &&
            values.map((v) => {
              const it = group.items.find((x) => x.id === v)
              return it ? (
                <div key={v} className="rounded-lg border border-line-soft bg-panel-2 p-2 text-xs text-muted">
                  <b className="text-ink">{it.name}:</b> {it.summary}
                </div>
              ) : null
            })}
        </div>
      )
      break
    }
    case 'ability': {
      if (p.key === 'background:abilities') {
        body = <BackgroundBonus />
        break
      }
      if (p.key.startsWith('featability:')) {
        const fuid = p.key.slice('featability:'.length)
        body = (
          <ChipChoice
            options={(p.options as Ability[]).map((a) => ({ id: a, label: abilityNames[a] }))}
            value={(() => {
              const f = char.feats.find((x) => x.uid === fuid)
              return f?.abilityChoice ? [f.abilityChoice] : []
            })()}
            count={1}
            onChange={(v) =>
              update((d) => {
                const f = d.feats.find((x) => x.uid === fuid)
                if (f) f.abilityChoice = v[0] as Ability
              })
            }
          />
        )
        break
      }
      const asi = featDef?.id === 'ability-score-improvement'
      body = (
        <ChipChoice
          options={((p.options as Ability[]) ?? ABILITIES).map((a) => ({ id: a, label: abilityNames[a] }))}
          value={values}
          count={p.count}
          onChange={set}
          allowDuplicates={asi}
        />
      )
      break
    }
    case 'cantrip':
    case 'spell': {
      if (cf && featDef) {
        const listChoice = cf.choices?.list?.[0]
        const isCantrip = p.type === 'cantrip'
        const pred = spellFilter(p.filter, { cantrip: isCantrip ? true : undefined, list: listChoice })
        body = (
          <>
            <button className="btn btn-sm" onClick={() => setPicker(true)} disabled={p.filter?.startsWith('list') && !listChoice}>
              <Plus size={13} /> {t('choice.pickSpells', { n: p.count })}
            </button>
            {p.filter?.startsWith('list') && !listChoice && <span className="ml-2 text-xs text-muted">{t('choice.pickListFirst')}</span>}
            <EntityPicker
              open={picker}
              onClose={() => setPicker(false)}
              kinds={['spell']}
              title={`${featDef.name}: ${p.label.split(': ').pop()}`}
              filter={(e) => pred(e as SpellDef)}
              multi
              max={p.count}
              selected={values}
              onConfirm={(ids) =>
                update((d) => {
                  setChoiceValues(d, p.key, ids)
                  const src = `feat:${cf.uid}`
                  const otherChoice = isCantrip ? 'spell' : 'cantrips'
                  const keep = new Set([...ids, ...(cf.choices?.[otherChoice] ?? [])])
                  d.spells = d.spells.filter((s) => s.source !== src || keep.has(s.spellId))
                  for (const id of ids) if (!d.spells.some((s) => s.source === src && s.spellId === id)) d.spells.push({ spellId: id, source: src, prepared: true, alwaysPrepared: !isCantrip })
                })
              }
            />
          </>
        )
      } else {
        body = (
          <button className="btn btn-sm" onClick={() => goTo?.('spells')}>
            {t('choice.goSpells')} <ChevronRight size={13} />
          </button>
        )
      }
      break
    }
    case 'subclass': {
      const cls = L.get('class', p.filter)
      const curSub = L.get('subclass', char.classes.find((c) => c.classId === p.filter)?.subclassId)
      body = (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {curSub && (
              <span className="chip border-gold/50 px-2.5 py-1 text-[12px]">
                <EntityLink kind="subclass" id={curSub.id} />
              </span>
            )}
            <button className={`btn btn-sm ${curSub ? '' : 'btn-primary'}`} onClick={() => setPicker(true)}>
              {curSub ? <RefreshCw size={12} /> : <Plus size={13} />} {curSub ? t('choice.change') : t('choice.pickSubclass')}
            </button>
          </div>
          <EntityPicker
            open={picker}
            onClose={() => setPicker(false)}
            kinds={['subclass']}
            title={`${cls?.name} Subclass`}
            filter={(e) => (e as { classId?: string }).classId === p.filter}
            selected={curSub ? [curSub.id] : []}
            onConfirm={(ids) =>
              update((d) => {
                const ce = d.classes.find((c) => c.classId === p.filter)
                if (!ce || !ids[0] || ce.subclassId === ids[0]) return
                // Fjern valg knyttet til forrige subclass
                const old = ce.subclassId
                if (old) {
                  for (const k of Object.keys(d.choices)) if (k.startsWith(`subclass:${old}:`)) delete d.choices[k]
                  d.feats = d.feats.filter((f) => !f.source.startsWith(`subclass:${old}:`))
                }
                ce.subclassId = ids[0]
              })
            }
          />
        </>
      )
      break
    }
    case 'speciesOption': {
      const sp = L.get('species', char.speciesId)
      body = (
        <ChipChoice
          options={(sp?.options?.choices ?? []).map((o) => ({ id: o.id, label: o.name }))}
          value={char.speciesOptionId ? [char.speciesOptionId] : []}
          count={1}
          onChange={(v) => update((d) => void (d.speciesOptionId = v[0]))}
        />
      )
      break
    }
    case 'feat': {
      body = <FeatSlot p={p} />
      break
    }
    case 'weaponMastery': {
      body = <WeaponMasteryChoice />
      break
    }
    default:
      body = null
  }

  return (
    <div className={compact ? '' : 'rounded-xl border border-line-soft bg-panel-2/60 p-3'}>
      {!compact && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-[13px] font-medium">{p.label}</div>
          <span className={`chip ${p.chosen >= p.count ? 'text-good' : ''}`}>
            {Math.min(p.chosen, p.count)}/{p.count}
          </span>
        </div>
      )}
      {body}
      {p.key === 'background:feat' && null}
      {void notify}
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function BackgroundBonus() {
  const { t } = useTranslation()
  const { char, lookup: L, update } = useChar()
  const bg = L.get('background', char.backgroundId)
  if (!bg) return <div className="text-sm text-muted">{t('choice.pickBackgroundFirst')}</div>
  const bb = char.backgroundBonus ?? {}
  const total = Object.values(bb).reduce((s, v) => s + (v ?? 0), 0)
  const setBonus = (a: Ability, v: number): void =>
    update((d) => {
      const next = { ...d.backgroundBonus, [a]: v }
      if (!v) delete next[a]
      d.backgroundBonus = next
    })
  const presets: { label: string; apply: Partial<Record<Ability, number>> }[] = [
    { label: '+1 / +1 / +1', apply: { [bg.abilityScores[0]]: 1, [bg.abilityScores[1]]: 1, [bg.abilityScores[2]]: 1 } }
  ]
  for (const a of bg.abilityScores)
    for (const b of bg.abilityScores) if (a !== b) presets.push({ label: `+2 ${a.toUpperCase()} / +1 ${b.toUpperCase()}`, apply: { [a]: 2, [b]: 1 } })
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {presets.map((pr) => {
          const on = JSON.stringify(pr.apply) === JSON.stringify(Object.fromEntries(bg.abilityScores.filter((a) => bb[a]).map((a) => [a, bb[a]])))
          return (
            <button key={pr.label} className={`btn btn-sm ${on && total === 3 ? 'btn-primary' : ''}`} onClick={() => update((d) => void (d.backgroundBonus = pr.apply))}>
              {pr.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        {bg.abilityScores.map((a) => (
          <div key={a} className="flex items-center gap-1 rounded-lg border border-line-soft px-2 py-1">
            <span className="text-xs font-semibold">{a.toUpperCase()}</span>
            {[0, 1, 2].map((v) => (
              <button key={v} className={`btn btn-sm px-2 ${(bb[a] ?? 0) === v ? 'btn-primary' : ''}`} onClick={() => setBonus(a, v)}>
                +{v}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={`text-xs ${total === 3 ? 'text-good' : total > 3 ? 'text-bad' : 'text-muted'}`}>{t('choice.bgTotal', { n: total })}</div>
    </div>
  )
}

/** Velg feat til en plass (ASI, origin, fighting style, epic boon) – viser også valgt feat med bytt/fjern */
export function FeatSlot({ p }: { p: PendingChoice }) {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const [open, setOpen] = useState(false)
  const [replaceUid, setReplaceUid] = useState<string | null>(null)
  const source = p.key === 'background:feat' ? 'background' : p.key
  const current = p.key === 'manual' ? [] : char.feats.filter((f) => f.source === source)
  const has = new Set(char.feats.filter((f) => f.uid !== replaceUid).map((f) => f.featId))
  const filter = (e: AnyEntity): boolean => {
    const f = e as FeatDef
    if (p.options?.length && p.key === 'background:feat') return p.options.includes(f.id)
    if (has.has(f.id) && !f.repeatable) return false
    // «Paladin (…)» / «Ranger (…)»-forutsetninger: bare for den classen
    const clsReq = /^([A-Z][a-z]+) \(/.exec(f.prerequisite ?? '')?.[1]?.toLowerCase()
    if (clsReq && L.get('class', clsReq) && !char.classes.some((c) => c.classId === clsReq)) return false
    if (p.options?.length && p.key !== 'background:feat' && !p.options.every((o) => !L.get('feat', o)) && !p.options.includes(f.id)) return false
    // Forutsetninger (ability scores, armor training, spellcasting, level) må være oppfylt
    if (featPrereqProblems(f, derived).length) return false
    if (p.filter === 'general') return f.category === 'general' && (f.minLevel ?? 0) <= derived.totalLevel
    if (p.filter === 'epicBoon') return f.category === 'epicBoon' || f.category === 'general'
    if (p.filter) return f.category === p.filter
    return true
  }
  const removeFeat = (d: Character, uidToRemove: string): void => {
    d.feats = d.feats.filter((x) => x.uid !== uidToRemove)
    d.spells = d.spells.filter((s) => s.source !== `feat:${uidToRemove}`)
  }
  const bgList = (): string | undefined => L.get('background', char.backgroundId)?.tags?.find((x) => x.startsWith('magic-initiate:'))?.split(':')[1]
  const canAdd = current.length < p.count || p.key === 'manual'
  return (
    <div className="flex flex-wrap items-center gap-2">
      {current.map((cf) => {
        const def = L.get('feat', cf.featId)
        return (
          <span key={cf.uid} className="chip border-gold/50 px-2.5 py-1 text-[12px]">
            {def ? <EntityLink kind="feat" id={def.id} /> : cf.featId}
            {p.key !== 'background:feat' && (
              <button
                className="ml-1 text-faint hover:text-ink"
                title={t('choice.change')}
                onClick={() => {
                  setReplaceUid(cf.uid)
                  setOpen(true)
                }}
              >
                <RefreshCw size={11} />
              </button>
            )}
            <button className="text-faint hover:text-bad" title={t('common.delete')} onClick={() => update((d) => removeFeat(d, cf.uid))}>
              <Trash2 size={11} />
            </button>
          </span>
        )
      })}
      {canAdd &&
        (p.key === 'background:feat' && p.options?.length === 1 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              update((d) => {
                const list = bgList()
                d.feats.push({ uid: uid(), featId: p.options![0], source, choices: list ? { list: [list] } : undefined })
              })
            }
          >
            <Plus size={13} /> {t('choice.addFeat', { name: L.get('feat', p.options[0])?.name ?? p.options[0] })}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setReplaceUid(null)
              setOpen(true)
            }}
          >
            <Plus size={13} /> {p.key === 'manual' ? t('features.addFeat') : t('choice.pickFeat')}
          </button>
        ))}
      <EntityPicker
        open={open}
        onClose={() => setOpen(false)}
        kinds={['feat']}
        title={p.label}
        filter={filter}
        groupBy={(e) => ({ origin: 'Origin', general: 'General', fightingStyle: 'Fighting Style', epicBoon: 'Epic Boon' })[(e as FeatDef).category]}
        onConfirm={(ids) =>
          update((d) => {
            if (!ids[0]) return
            if (replaceUid) removeFeat(d, replaceUid)
            d.feats.push({ uid: uid(), featId: ids[0], source: p.key === 'manual' ? 'manual' : source })
          })
        }
      />
    </div>
  )
}

function WeaponMasteryChoice() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {char.weaponMasteries.map((w) => (
        <span key={w} className="chip">
          <EntityLink kind="weapon" id={w} />
        </span>
      ))}
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        <Plus size={13} /> {t('choice.pickMastery')}
      </button>
      <EntityPicker
        open={open}
        onClose={() => setOpen(false)}
        kinds={['weapon']}
        title={t('choice.pickMastery')}
        multi
        max={derived.weaponMasteryMax}
        selected={char.weaponMasteries}
        groupBy={(e) => `${cap((e as { category: string }).category)} ${(e as { weaponType: string }).weaponType}`}
        filter={(e) => derived.proficiencies.weapons.some((p) => p === (e as { category: string }).category || p === e.id || p.startsWith((e as { category: string }).category))}
        onConfirm={(ids) => update((d) => void (d.weaponMasteries = ids))}
      />
      {void L}
      <Info size={0} />
    </div>
  )
}
