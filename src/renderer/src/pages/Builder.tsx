import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { ArrowLeft, ArrowRight, Check, Dices, Info, Sparkles, Wand2, RotateCcw, Package } from 'lucide-react'
import type { Ability, AnyEntity, BackgroundDef, Character, ClassDef, EquipmentOption, SpeciesDef } from '../types'
import { ABILITIES } from '../types'
import { useCharacter, useUi } from '../store/ui'
import { useSettings } from '../store/settings'
import { CharCtx, useChar } from '../components/sheet/context'
import { ChoiceResolver, BackgroundBonus } from '../components/sheet/ChoiceResolver'
import { SpellsTab } from '../components/sheet/SpellsTab'
import { DetailsTab } from '../components/sheet/DetailsTab'
import { ClassEmblem, CLASS_COLORS } from '../components/ClassEmblem'
import { EntityLink } from '../components/EntityInfo'
import { Markdown, NumberInput, SourceBadge, Tabs } from '../components/ui'
import { abilityNames, abilitySummaries, POINT_BUY_COST, POINT_BUY_TOTAL, STANDARD_ARRAY, skillById } from '../data/skills'
import { abilityMod, signed } from '../engine/tables'
import { rollAbilityScore } from '../dice'
import { uid } from '../store/characters'
import { DieShape } from '../components/Dice'
import { syncGrantedSpells } from '../lib/sync'
import { FaithPanel, FAITH_CLASSES } from '../components/Faith'
import { BookFilterBar, useBookFilter } from '../components/BookFilter'
import type { Lookup } from '../engine/lookup'

type StepId = 'class' | 'origin' | 'abilities' | 'equipment' | 'spells' | 'details' | 'review'
const STEPS: StepId[] = ['class', 'origin', 'abilities', 'equipment', 'spells', 'details', 'review']

export default function Builder() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { char, derived, lookup, update } = useCharacter(id)
  const setActive = useUi((s) => s.setActiveCharacter)
  const step = (params.get('step') as StepId) || 'class'
  const setStep = (s: StepId): void => setParams({ step: s }, { replace: true })
  useEffect(() => {
    setActive(id ?? null)
    return () => setActive(null)
  }, [id])
  useEffect(() => {
    if (!char) return
    const next = syncGrantedSpells(char, lookup)
    if (next) update((c) => void (c.spells = next))
  }, [char?.classes, char?.speciesOptionId, char?.speciesId])

  if (!char || !derived) return <div className="p-10 text-center text-muted">{t('common.loading')}</div>
  const idx = STEPS.indexOf(step)
  const isCaster = derived.spellcasting.length > 0 || char.spells.length > 0
  const done: Record<StepId, boolean> = {
    class: !!char.classes.length && !derived.pending.some((p) => p.area === 'skills' || p.key.startsWith('subclass:')),
    origin: !!char.backgroundId && !!char.speciesId && !derived.pending.some((p) => p.area === 'species' || p.area === 'background'),
    abilities: !derived.pending.some((p) => p.key === 'background:abilities') && char.abilityMethod !== undefined && Object.values(char.baseAbilities).some((v) => v !== 10),
    equipment: char.inventory.length > 0,
    spells: !derived.pending.some((p) => p.area === 'spells'),
    details: !!char.name,
    review: derived.pending.length === 0
  }

  return (
    <CharCtx.Provider value={{ char, derived, lookup, update, goTo: (x) => x === 'spells' && setStep('spells') }}>
      <div className="flex h-full">
        {/* Steg-meny */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-line-soft bg-bg-2/60 px-3 py-5">
          <button className="btn btn-ghost mb-4 justify-start" onClick={() => nav(char.classes.length ? `/character/${char.id}` : '/')}>
            <ArrowLeft size={15} /> {char.classes.length ? t('builder.toSheet') : t('builder.back')}
          </button>
          <div className="mb-4 px-2">
            <div className="font-display text-lg text-gold">{char.name || t('common.unnamed')}</div>
            <div className="text-xs text-muted">{derived.classLabel}</div>
          </div>
          <div className="space-y-1">
            {STEPS.filter((s) => s !== 'spells' || isCaster).map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${step === s ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                {step === s && <motion.span layoutId="builder-step" className="absolute inset-0 rounded-xl bg-gold/12 ring-1 ring-gold/30" />}
                <span className={`relative flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${done[s] ? 'border-good bg-good text-white' : step === s ? 'border-gold text-gold' : 'border-line'}`}>
                  {done[s] ? <Check size={12} /> : i + 1}
                </span>
                <span className="relative">{t(`builder.${s}`)}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-line-soft p-3 text-xs text-muted">
            <Sparkles size={13} className="mb-1 text-gold" />
            {t('builder.freeNav')}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}>
                <h1 className="mb-1 font-display text-3xl text-gold">{t(`builder.${step}Title`)}</h1>
                <p className="mb-6 max-w-3xl font-serif text-lg text-muted">{t(`builder.${step}Intro`)}</p>
                {step === 'class' && <ClassStep />}
                {step === 'origin' && <OriginStep />}
                {step === 'abilities' && <AbilitiesStep />}
                {step === 'equipment' && <EquipmentStep />}
                {step === 'spells' && <SpellsTab />}
                {step === 'details' && <DetailsTab />}
                {step === 'review' && <ReviewStep />}
              </motion.div>
            </AnimatePresence>
          </div>
          <footer className="flex items-center justify-between border-t border-line-soft bg-bg-2/60 py-3 pl-8 pr-28">
            <button className="btn" disabled={idx === 0} onClick={() => setStep(prevStep(step, isCaster))}>
              <ArrowLeft size={15} /> {t('common.back')}
            </button>
            <div className="flex gap-1">
              {STEPS.filter((s) => s !== 'spells' || isCaster).map((s) => (
                <span key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-gold' : done[s] ? 'w-1.5 bg-good' : 'w-1.5 bg-line'}`} />
              ))}
            </div>
            {step !== 'review' ? (
              <button className="btn btn-primary" onClick={() => setStep(nextStep(step, isCaster))}>
                {t('common.next')} <ArrowRight size={15} />
              </button>
            ) : (
              <FinishButton />
            )}
          </footer>
        </div>
      </div>
    </CharCtx.Provider>
  )
}

function nextStep(s: StepId, caster: boolean): StepId {
  let i = STEPS.indexOf(s) + 1
  if (STEPS[i] === 'spells' && !caster) i++
  return STEPS[Math.min(STEPS.length - 1, i)]
}
function prevStep(s: StepId, caster: boolean): StepId {
  let i = STEPS.indexOf(s) - 1
  if (STEPS[i] === 'spells' && !caster) i--
  return STEPS[Math.max(0, i)]
}

function FinishButton() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { char, derived, update } = useChar()
  const animations = useSettings((s) => s.animations)
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      className="btn btn-primary"
      disabled={!char.classes.length}
      onClick={() => {
        update((c) => {
          if (c.hp.current <= 0 || c.hp.current > derived.hpMax.value) c.hp.current = derived.hpMax.value
        })
        if (animations) confetti({ particleCount: 220, spread: 120, origin: { y: 0.7 }, colors: ['#f0cd7a', '#d6a84c', '#c0392b', '#ffffff'] })
        setTimeout(() => nav(`/character/${char.id}`), animations ? 700 : 0)
      }}
    >
      <Sparkles size={15} /> {t('builder.finish')}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Steg 1: Class                                                       */
/* ------------------------------------------------------------------ */

function ClassStep() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const openDetail = useUi((s) => s.openDetail)
  const bf = useBookFilter('class', L.all('class').sort((a, b) => a.name.localeCompare(b.name)))
  const classes = bf.filtered
  const current = L.get('class', char.classes[0]?.classId)
  const skillKey = current ? `class:${current.id}:skills#skill` : ''
  const pending = derived.pending.filter((p) => p.key !== skillKey && (p.area === 'skills' || p.area === 'class' || (p.area === 'feats' && p.key.startsWith('class:'))))
  const skillChoice = current
    ? { key: skillKey, label: `Choose ${current.skillChoices.count} ${current.name} skills`, area: 'skills' as const, type: 'skill', count: current.skillChoices.count, chosen: (char.choices[skillKey] ?? []).length, options: current.skillChoices.options, source: current.name }
    : null

  const choose = (c: ClassDef): void =>
    update((d) => {
      if (d.classes[0]?.classId === c.id) return
      const level = d.classes[0]?.level ?? 1
      // Fjern valg knyttet til forrige class
      const old = d.classes[0]?.classId
      if (old) {
        for (const k of Object.keys(d.choices)) if (k.startsWith(`class:${old}:`)) delete d.choices[k]
        d.feats = d.feats.filter((f) => !f.source.startsWith(`class:${old}`))
        d.spells = d.spells.filter((s) => s.source !== old)
        d.weaponMasteries = []
      }
      d.classes = [{ classId: c.id, level, hpRolls: [] }, ...d.classes.slice(1).filter((x) => x.classId !== c.id)]
    })

  return (
    <div className="space-y-6">
      <BookFilterBar state={bf} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {classes.map((c, i) => {
          const on = current?.id === c.id
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              onClick={() => choose(c)}
              className={`card-hover relative cursor-pointer overflow-hidden rounded-2xl border p-4 ${on ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel'}`}
              style={on ? { boxShadow: `0 0 0 1px ${CLASS_COLORS[c.id] ?? 'var(--gold)'}, 0 12px 30px rgba(0,0,0,.3)` } : undefined}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 opacity-15">
                <ClassEmblem classId={c.id} size={60} />
              </div>
              <div className="flex items-start justify-between">
                <ClassEmblem classId={c.id} size={22} />
                <button
                  className="btn btn-ghost btn-sm px-1.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDetail({ kind: 'class', id: c.id })
                  }}
                >
                  <Info size={14} />
                </button>
              </div>
              <div className="mt-2 font-display text-lg text-gold">{c.name}</div>
              <div className="mt-1 line-clamp-2 text-xs text-muted">{c.summary}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="chip">d{c.hitDie}</span>
                <span className="chip">{c.primaryAbility.map((a) => a.toUpperCase()).join('/')}</span>
                {c.spellcasting && <span className="chip text-arcane">Spells</span>}
                {c.source !== 'SRD 5.2' && c.source !== 'PHB 2024' && <SourceBadge source={c.source} book={c.sourceBook} />}
              </div>
              {on && (
                <motion.span layoutId="class-check" className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[#1d1408]">
                  <Check size={14} />
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      {current && (
        <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-12 gap-4">
          <div className="panel col-span-12 p-5 lg:col-span-7">
            <div className="mb-3 flex items-center gap-3">
              <ClassEmblem classId={current.id} size={30} />
              <div>
                <div className="font-display text-2xl text-gold">{current.name}</div>
                <SourceBadge source={current.source} book={current.sourceBook} />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted">{t('builder.startLevel')}</span>
                <NumberInput
                  value={char.classes[0]?.level ?? 1}
                  min={1}
                  max={20}
                  onChange={(v) =>
                    update((d) => {
                      if (d.classes[0]) d.classes[0].level = v
                    })
                  }
                />
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">Hit Point Die</dt>
              <dd>d{current.hitDie}</dd>
              <dt className="text-muted">Primary Ability</dt>
              <dd>{current.primaryAbility.map((a) => abilityNames[a]).join(' or ')}</dd>
              <dt className="text-muted">Saving Throws</dt>
              <dd>{current.savingThrows.map((a) => abilityNames[a]).join(', ')}</dd>
              <dt className="text-muted">Armor Training</dt>
              <dd>{current.armorTraining.join(', ') || 'None'}</dd>
              <dt className="text-muted">Weapons</dt>
              <dd>{current.weaponProficiencies.join(', ')}</dd>
            </dl>
            {current.quickBuild && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3">
                <div className="panel-title mb-1">Quick Build</div>
                <p className="font-serif">{current.quickBuild}</p>
              </div>
            )}
            <div className="mt-4">
              <div className="panel-title mb-2">{t('builder.level1Features')}</div>
              <div className="flex flex-wrap gap-1.5">
                {current.features
                  .filter((f) => (f.level ?? 1) <= (char.classes[0]?.level ?? 1))
                  .map((f) => (
                    <span key={f.id} className="chip">
                      <EntityLink kind="feature" id={f.id} entity={{ ...f, kind: 'feature', source: current.source } as AnyEntity}>
                        {f.name}
                      </EntityLink>
                      <span className="text-faint">{f.level}</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>
          <div className="col-span-12 space-y-3 lg:col-span-5">
            {skillChoice && <ChoiceResolver p={skillChoice} />}
            {char.classes.some((c) => FAITH_CLASSES.includes(c.classId)) && <FaithPanel char={char} L={L} update={update} />}
            {pending.length === 0 && (
              <div className="panel p-4 text-sm text-good">
                <Check size={14} className="mr-1 inline" /> {t('builder.allChosen')}
              </div>
            )}
            {pending.map((p) => (
              <ChoiceResolver key={p.key} p={p} />
            ))}
            {current.tips?.length > 0 && (
              <div className="panel p-4">
                <div className="panel-title mb-2">{t('builder.tips')}</div>
                <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
                  {current.tips.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Steg 2: Origin                                                      */
/* ------------------------------------------------------------------ */

function OriginStep() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'background' | 'species' | 'languages'>('background')
  const { derived } = useChar()
  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: 'background', label: 'Background', badge: derived.pending.filter((p) => p.area === 'background' && p.type !== 'language').length },
          { id: 'species', label: 'Species', badge: derived.pending.filter((p) => p.area === 'species').length },
          { id: 'languages', label: t('builder.languages'), badge: derived.pending.filter((p) => p.type === 'language').length }
        ]}
        value={tab}
        onChange={setTab}
        className="inline-flex"
      />
      {tab === 'background' && <BackgroundPick />}
      {tab === 'species' && <SpeciesPick />}
      {tab === 'languages' && <LanguagesPick />}
    </div>
  )
}

function Recommended({ ids }: { ids?: string[] }) {
  const { t } = useTranslation()
  if (!ids?.length) return null
  return (
    <span className="ml-2 text-xs text-gold">
      ★ {t('builder.recommended')}
    </span>
  )
}

function BackgroundPick() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const openDetail = useUi((s) => s.openDetail)
  const cls = L.get('class', char.classes[0]?.classId)
  const bf = useBookFilter('background', L.all('background').sort((a, b) => a.name.localeCompare(b.name)))
  const list = bf.filtered
  const cur = L.get('background', char.backgroundId)
  const choose = (b: BackgroundDef): void =>
    update((d) => {
      if (d.backgroundId === b.id) return
      d.backgroundId = b.id
      d.backgroundBonus = {}
      delete d.choices['background:tool#tool']
      const old = d.feats.filter((f) => f.source === 'background').map((f) => f.uid)
      d.feats = d.feats.filter((f) => f.source !== 'background')
      d.spells = d.spells.filter((s) => !old.some((u) => s.source === `feat:${u}`))
      const list = b.tags?.find((x) => x.startsWith('magic-initiate:'))?.split(':')[1]
      if (b.originFeat) d.feats.push({ uid: uid(), featId: b.originFeat, source: 'background', choices: list ? { list: [list] } : undefined })
    })
  return (
    <div className="grid grid-cols-12 gap-4">
      <BookFilterBar state={bf} className="col-span-12" />
      <div className="col-span-12 grid grid-cols-2 gap-2 lg:col-span-7 xl:grid-cols-3">
        {list.map((b, i) => {
          const on = cur?.id === b.id
          const rec = cls?.recommended?.backgrounds?.includes(b.id)
          return (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} onClick={() => choose(b)} className={`card-hover cursor-pointer rounded-xl border p-3 ${on ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel'}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-gold">{b.name}</span>
                <button className="btn btn-ghost btn-sm px-1" onClick={(e) => (e.stopPropagation(), openDetail({ kind: 'background', id: b.id }))}>
                  <Info size={13} />
                </button>
              </div>
              <div className="text-[11px] text-muted">{b.abilityScores.map((a) => a.toUpperCase()).join(' · ')}</div>
              <div className="text-[11px] text-muted">{b.skills.map((s) => skillById[s]?.name).join(', ')}</div>
              <div className="mt-1 flex items-center justify-between">
                <SourceBadge source={b.source} />
                {rec && <span className="text-[10px] text-gold">★ {t('builder.recommended')}</span>}
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="col-span-12 space-y-3 lg:col-span-5">
        {cur ? (
          <>
            <div className="panel p-4">
              <div className="font-display text-xl text-gold">{cur.name}</div>
              <p className="mt-1 font-serif text-muted">{cur.summary}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted">Feat</dt>
                <dd>
                  <EntityLink kind="feat" id={cur.originFeat} />
                </dd>
                <dt className="text-muted">Skills</dt>
                <dd>{cur.skills.map((s) => skillById[s]?.name).join(', ')}</dd>
                <dt className="text-muted">Tool</dt>
                <dd>{L.get('tool', cur.tool) ? <EntityLink kind="tool" id={cur.tool} /> : cur.tool.replace('choice:', 'Choose ')}</dd>
              </dl>
            </div>
            <div className="panel p-4">
              <div className="panel-title mb-2">{t('builder.bgAbilities')}</div>
              <BackgroundBonus />
            </div>
            {derived.pending
              .filter((p) => (p.area === 'background' && p.type !== 'language') || (p.area === 'feats' && derived.feats.some((f) => f.source === 'background' && p.key.includes(f.uid))))
              .map((p) => (
                <ChoiceResolver key={p.key} p={p} />
              ))}
          </>
        ) : (
          <div className="panel p-6 text-center text-muted">{t('builder.pickBackground')}</div>
        )}
      </div>
    </div>
  )
}

function SpeciesPick() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const openDetail = useUi((s) => s.openDetail)
  const cls = L.get('class', char.classes[0]?.classId)
  const bf = useBookFilter('species', L.all('species').sort((a, b) => a.name.localeCompare(b.name)))
  const list = bf.filtered
  const cur = L.get('species', char.speciesId)
  const choose = (s: SpeciesDef): void =>
    update((d) => {
      if (d.speciesId === s.id) return
      d.speciesId = s.id
      d.speciesOptionId = undefined
      d.size = s.size.includes(' or ') ? 'Medium' : s.size
      for (const k of Object.keys(d.choices)) if (k.startsWith('species:')) delete d.choices[k]
      d.feats = d.feats.filter((f) => !f.source.startsWith('species:'))
      d.spells = d.spells.filter((x) => x.source !== 'species')
    })
  return (
    <div className="grid grid-cols-12 gap-4">
      <BookFilterBar state={bf} className="col-span-12" />
      <div className="col-span-12 grid grid-cols-2 gap-2 lg:col-span-6 xl:grid-cols-3">
        {list.map((s, i) => {
          const on = cur?.id === s.id
          return (
            <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} onClick={() => choose(s)} className={`card-hover cursor-pointer rounded-xl border p-3 ${on ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel'}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-gold">{s.name}</span>
                <button className="btn btn-ghost btn-sm px-1" onClick={(e) => (e.stopPropagation(), openDetail({ kind: 'species', id: s.id }))}>
                  <Info size={13} />
                </button>
              </div>
              <div className="text-[11px] text-muted">
                {s.size} · {s.speed} ft.{s.darkvision ? ` · Darkvision ${s.darkvision}` : ''}
              </div>
              <div className="mt-1 line-clamp-2 text-xs text-ink/80">{s.summary}</div>
              {cls?.recommended?.species?.includes(s.id) && <div className="mt-1 text-[10px] text-gold">★ {t('builder.recommended')}</div>}
            </motion.div>
          )
        })}
      </div>
      <div className="col-span-12 space-y-3 lg:col-span-6">
        {cur ? (
          <>
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <div className="font-display text-xl text-gold">{cur.name}</div>
                {cur.size.includes(' or ') && (
                  <div className="flex gap-1">
                    {['Small', 'Medium'].map((sz) => (
                      <button key={sz} className={`btn btn-sm ${char.size === sz ? 'btn-primary' : ''}`} onClick={() => update((d) => void (d.size = sz))}>
                        {sz}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {cur.traits.map((tr) => (
                  <div key={tr.id} className="text-sm">
                    <EntityLink kind="feature" id={tr.id} entity={{ ...tr, kind: 'feature', source: cur.source } as AnyEntity} className="font-semibold">
                      {tr.name}
                    </EntityLink>
                    <span className="text-muted"> – {tr.summary}</span>
                  </div>
                ))}
              </div>
            </div>
            {cur.options && (
              <div className="panel p-4">
                <div className="panel-title mb-2">{cur.options.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  {cur.options.choices.map((o) => (
                    <button key={o.id} onClick={() => update((d) => void (d.speciesOptionId = o.id))} className={`rounded-xl border p-2 text-left ${char.speciesOptionId === o.id ? 'border-gold bg-gold/10' : 'border-line-soft'}`}>
                      <div className="font-display text-sm text-gold">{o.name}</div>
                      <div className="line-clamp-2 text-[11px] text-muted">{o.summary}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {derived.pending
              .filter((p) => p.area === 'species' && p.type !== 'speciesOption')
              .map((p) => (
                <ChoiceResolver key={p.key} p={p} />
              ))}
          </>
        ) : (
          <div className="panel p-6 text-center text-muted">{t('builder.pickSpecies')}</div>
        )}
      </div>
    </div>
  )
}

function LanguagesPick() {
  const { t } = useTranslation()
  const { derived } = useChar()
  const p = derived.pending.find((x) => x.key === 'origin:languages#language') ?? {
    key: 'origin:languages#language', label: t('builder.languagesLabel'), area: 'background' as const, type: 'language', count: 2, chosen: 2, source: ''
  }
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-muted">{t('builder.languagesIntro')}</p>
      <ChoiceResolver p={p} />
      <div className="text-sm text-muted">
        {t('builder.known')}: {derived.proficiencies.languages.join(', ')}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Steg 3: Ability scores                                              */
/* ------------------------------------------------------------------ */

function recommendedOrder(c: ClassDef | undefined): Ability[] {
  if (!c) return [...ABILITIES]
  const order: Ability[] = [...c.primaryAbility.slice(0, 1)]
  const push = (a: Ability): void => void (!order.includes(a) && order.push(a))
  if (c.primaryAbility[1]) push(c.primaryAbility[1])
  push('con')
  c.savingThrows.forEach(push)
  ;(['dex', 'wis', 'cha', 'int', 'str'] as Ability[]).forEach(push)
  return order
}

function AbilitiesStep() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const cls = L.get('class', char.classes[0]?.classId)
  const method = char.abilityMethod
  const setMethod = (m: Character['abilityMethod']): void =>
    update((d) => {
      d.abilityMethod = m
      if (m === 'pointBuy') d.baseAbilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
      if (m === 'standard') {
        const order = recommendedOrder(cls)
        const base = {} as Record<Ability, number>
        order.forEach((a, i) => (base[a] = STANDARD_ARRAY[i]))
        d.baseAbilities = base
      }
      if (m === 'roll') delete d.choices['builder:rolls#meta']
    })
  return (
    <div className="space-y-5">
      <Tabs
        tabs={[
          { id: 'standard', label: 'Standard Array' },
          { id: 'pointBuy', label: 'Point Buy' },
          { id: 'roll', label: t('builder.roll') },
          { id: 'manual', label: t('builder.manual') }
        ]}
        value={method}
        onChange={(m) => setMethod(m as Character['abilityMethod'])}
        className="inline-flex"
      />
      {cls && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm">
          <Wand2 size={14} className="mr-1 inline text-gold" />
          {t('builder.abilityTip', { cls: cls.name, a: cls.primaryAbility.map((a) => abilityNames[a]).join(' / ') })}
        </div>
      )}
      {method === 'standard' && <StandardArray cls={cls} />}
      {method === 'pointBuy' && <PointBuy />}
      {method === 'roll' && <RollScores cls={cls} />}
      {method === 'manual' && <ManualScores />}
      <div className="panel p-4">
        <div className="panel-title mb-2">{t('builder.bgAbilities')}</div>
        <BackgroundBonus />
      </div>
      <div className="grid grid-cols-6 gap-3">
        {ABILITIES.map((a) => {
          const primary = cls?.primaryAbility.includes(a)
          return (
            <motion.div key={a} layout className={`rounded-2xl border p-3 text-center ${primary ? 'border-gold bg-gold/5' : 'border-line-soft bg-panel'}`}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">{abilityNames[a]}</div>
              <motion.div key={derived.abilities[a].score.value} initial={{ scale: 1.3, color: 'var(--gold-2)' }} animate={{ scale: 1, color: 'var(--ink)' }} className="font-display text-3xl font-bold">
                {derived.abilities[a].score.value}
              </motion.div>
              <div className="font-display text-gold">{signed(derived.abilities[a].mod)}</div>
              <div className="mt-1 text-[10px] text-faint">{abilitySummaries[a]}</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function StandardArray({ cls }: { cls?: ClassDef }) {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const used = ABILITIES.map((a) => char.baseAbilities[a])
  const valid = [...used].sort((a, b) => b - a).join() === [...STANDARD_ARRAY].join()
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {ABILITIES.map((a) => (
          <div key={a} className="flex items-center gap-1 rounded-xl border border-line-soft bg-panel px-2 py-1">
            <span className="w-9 text-xs font-bold">{a.toUpperCase()}</span>
            <select
              className="input w-16 py-1"
              value={char.baseAbilities[a]}
              onChange={(e) =>
                update((d) => {
                  const v = Number(e.target.value)
                  const other = ABILITIES.find((b) => b !== a && d.baseAbilities[b] === v)
                  if (other) d.baseAbilities[other] = d.baseAbilities[a]
                  d.baseAbilities[a] = v
                })
              }
            >
              {STANDARD_ARRAY.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
        <button
          className="btn btn-sm"
          onClick={() =>
            update((d) => {
              recommendedOrder(cls).forEach((a, i) => (d.baseAbilities[a] = STANDARD_ARRAY[i]))
            })
          }
        >
          <Wand2 size={13} /> {t('builder.autoAssign')}
        </button>
      </div>
      {!valid && <div className="text-xs text-bad">{t('builder.arrayInvalid')}</div>}
    </div>
  )
}

function PointBuy() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const spent = ABILITIES.reduce((s, a) => s + (POINT_BUY_COST[char.baseAbilities[a]] ?? 0), 0)
  const left = POINT_BUY_TOTAL - spent
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">{t('builder.pointsLeft')}</span>
        <motion.span key={left} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={`font-display text-2xl ${left < 0 ? 'text-bad' : left === 0 ? 'text-good' : 'text-gold'}`}>
          {left}
        </motion.span>
        <span className="text-xs text-faint">/ {POINT_BUY_TOTAL}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {ABILITIES.map((a) => {
          const v = char.baseAbilities[a]
          const nextCost = (POINT_BUY_COST[v + 1] ?? 99) - (POINT_BUY_COST[v] ?? 0)
          return (
            <div key={a} className="flex items-center justify-between rounded-xl border border-line-soft bg-panel px-2 py-1.5">
              <span className="text-xs font-bold">{a.toUpperCase()}</span>
              <button className="btn btn-sm px-2" disabled={v <= 8} onClick={() => update((d) => void (d.baseAbilities[a] = v - 1))}>
                −
              </button>
              <span className="w-6 text-center font-display">{v}</span>
              <button className="btn btn-sm px-2" disabled={v >= 15 || nextCost > left} onClick={() => update((d) => void (d.baseAbilities[a] = v + 1))}>
                +
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RollScores({ cls }: { cls?: ClassDef }) {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const animations = useSettings((s) => s.animations)
  const stored = char.choices['builder:rolls#meta']
  const [rolls, setRolls] = useState<{ total: number; dice: number[]; dropped: number }[]>(() => (stored ? JSON.parse(stored[0]) : []))
  const [rolling, setRolling] = useState(false)
  const [assign, setAssign] = useState<Partial<Record<Ability, number>>>({})
  const doRoll = (): void => {
    setRolling(true)
    setAssign({})
    const r = Array.from({ length: 6 }, () => rollAbilityScore())
    setTimeout(
      () => {
        setRolls(r)
        setRolling(false)
        update((d) => void (d.choices['builder:rolls#meta'] = [JSON.stringify(r)]))
      },
      animations ? 900 : 0
    )
  }
  const usedIdx = new Set(Object.values(assign))
  const autoAssign = (): void => {
    const order = recommendedOrder(cls)
    const sorted = rolls.map((r, i) => ({ r, i })).sort((a, b) => b.r.total - a.r.total)
    const as: Partial<Record<Ability, number>> = {}
    order.forEach((a, k) => (as[a] = sorted[k]?.i))
    setAssign(as)
    update((d) => {
      for (const a of ABILITIES) if (as[a] !== undefined) d.baseAbilities[a] = rolls[as[a]!].total
    })
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={doRoll} disabled={rolling}>
          <Dices size={15} /> {rolls.length ? t('builder.reroll') : t('builder.roll4d6')}
        </button>
        {rolls.length > 0 && (
          <button className="btn" onClick={autoAssign}>
            <Wand2 size={14} /> {t('builder.autoAssign')}
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-3">
        {(rolling ? Array.from({ length: 6 }) : rolls).map((r, i) => (
          <motion.div key={`${i}-${rolling}`} initial={{ rotate: -180, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 220 }} className={`rounded-2xl border p-3 text-center ${usedIdx.has(i) ? 'border-good/50 bg-good/5' : 'border-line-soft bg-panel'}`}>
            {rolling || !r ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }} className="mx-auto w-fit">
                <DieShape sides={6} size={40} value="?" />
              </motion.div>
            ) : (
              <>
                <div className="font-display text-3xl font-bold">{(r as { total: number }).total}</div>
                <div className="mt-1 flex justify-center gap-1">
                  {(r as { dice: number[]; dropped: number }).dice.map((v, j) => (
                    <span key={j} className={`flex h-5 w-5 items-center justify-center rounded border text-[10px] ${j === (r as { dropped: number }).dropped ? 'border-line text-faint line-through' : 'border-gold/50'}`}>
                      {v}
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      {rolls.length > 0 && !rolling && (
        <div className="flex flex-wrap gap-2">
          {ABILITIES.map((a) => (
            <div key={a} className="flex items-center gap-1 rounded-xl border border-line-soft bg-panel px-2 py-1">
              <span className="w-9 text-xs font-bold">{a.toUpperCase()}</span>
              <select
                className="input w-20 py-1"
                value={assign[a] ?? ''}
                onChange={(e) => {
                  const i = Number(e.target.value)
                  const next = { ...assign }
                  for (const b of ABILITIES) if (next[b] === i) delete next[b]
                  next[a] = i
                  setAssign(next)
                  update((d) => void (d.baseAbilities[a] = rolls[i].total))
                }}
              >
                <option value="" disabled>
                  —
                </option>
                {rolls.map((r, i) => (
                  <option key={i} value={i}>
                    {r.total}
                    {usedIdx.has(i) && assign[a] !== i ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ManualScores() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">{t('builder.manualIntro')}</p>
      <div className="flex flex-wrap gap-2">
        {ABILITIES.map((a) => (
          <div key={a} className="flex items-center gap-2 rounded-xl border border-line-soft bg-panel px-3 py-1.5">
            <span className="text-xs font-bold">{a.toUpperCase()}</span>
            <NumberInput value={char.baseAbilities[a]} min={1} max={30} onChange={(v) => update((d) => void (d.baseAbilities[a] = v))} />
            <span className="w-6 text-xs text-muted">{signed(abilityMod(char.baseAbilities[a]))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Steg 4: Utstyr                                                      */
/* ------------------------------------------------------------------ */

function grantItems(d: Character, opt: EquipmentOption, L: Lookup, tag: string): void {
  const uids: string[] = []
  for (const g0 of opt.items) {
    // «(same as above)» = verktøyet som ble valgt for background
    let g = g0
    if (g0.name?.includes('(same as above)')) {
      const chosenTool = d.choices['background:tool#tool']?.[0]
      g = chosenTool ? { id: chosenTool, qty: g0.qty } : { ...g0, name: g0.name.replace(/\s*\(same as above\)/, '') }
    }
    const ent = L.item(g.id)
    const u = uid()
    uids.push(u)
    d.inventory.push({ uid: u, refId: ent ? ent.id : undefined, name: ent ? (g.name && g.name !== ent.name ? g.name : undefined) : g.name ?? g.id, qty: g.qty ?? 1, equipped: ent?.kind === 'armor', showAsAttack: ent?.kind === 'weapon', attuned: false })
  }
  d.currency.gp += opt.gp
  d.choices[`builder:${tag}#meta`] = [JSON.stringify({ uids, gp: opt.gp, label: opt.label })]
}

function removeGranted(d: Character, tag: string): void {
  const raw = d.choices[`builder:${tag}#meta`]?.[0]
  if (!raw) return
  const { uids, gp } = JSON.parse(raw) as { uids: string[]; gp: number }
  d.inventory = d.inventory.filter((i) => !uids.includes(i.uid))
  d.currency.gp = Math.max(0, d.currency.gp - gp)
  delete d.choices[`builder:${tag}#meta`]
}

function EquipmentStep() {
  const { t } = useTranslation()
  const { char, derived, lookup: L, update } = useChar()
  const cls = L.get('class', char.classes[0]?.classId)
  const bg = L.get('background', char.backgroundId)
  const wm = derived.pending.find((p) => p.key === 'weaponMastery')
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-12 gap-4">
        {cls && <EquipChooser title={`${cls.name}`} options={cls.startingEquipment} tag="classEquip" />}
        {bg && <EquipChooser title={`${bg.name}`} options={bg.equipment} tag="bgEquip" />}
      </div>
      {wm && (
        <div className="max-w-3xl">
          <ChoiceResolver p={wm} />
        </div>
      )}
      <div className="panel p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="panel-title">
            <Package size={13} className="mr-1 inline" /> {t('builder.inventoryNow')}
          </div>
          <span className="text-sm text-muted">{char.currency.gp} GP</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {char.inventory.map((i) => {
            const e = L.item(i.refId)
            return (
              <span key={i.uid} className={`chip ${i.equipped ? 'border-gold/50' : ''}`}>
                {e ? <EntityLink kind="item" id={e.id}>{i.name || e.name}</EntityLink> : i.name}
                {i.qty > 1 && <b>×{i.qty}</b>}
              </span>
            )
          })}
          {!char.inventory.length && <span className="text-sm text-faint">—</span>}
        </div>
        <div className="mt-2 text-xs text-muted">{t('builder.moreInSheet')}</div>
      </div>
      {void update}
    </div>
  )
}

function EquipChooser({ title, options, tag }: { title: string; options: EquipmentOption[]; tag: string }) {
  const { t } = useTranslation()
  const { char, lookup: L, update } = useChar()
  const raw = char.choices[`builder:${tag}#meta`]?.[0]
  const chosen = raw ? (JSON.parse(raw) as { label: string }).label : null
  return (
    <div className="panel col-span-12 p-4 lg:col-span-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-lg text-gold">
          {title} – {t('builder.startingEquipment')}
        </div>
        {chosen && (
          <button className="btn btn-ghost btn-sm" onClick={() => update((d) => removeGranted(d, tag))}>
            <RotateCcw size={13} /> {t('builder.undo')}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {options.map((o) => {
          const on = chosen === o.label
          return (
            <motion.button
              key={o.label}
              whileHover={{ x: 3 }}
              onClick={() =>
                update((d) => {
                  removeGranted(d, tag)
                  grantItems(d, o, L, tag)
                })
              }
              className={`w-full rounded-xl border p-3 text-left ${on ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel-2'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border font-display text-sm ${on ? 'border-gold bg-gold text-[#1d1408]' : 'border-line'}`}>{o.label}</span>
                <span className="text-sm">
                  {o.items.length ? o.items.map((i) => `${i.qty && i.qty > 1 ? `${i.qty} ` : ''}${i.name ?? L.item(i.id)?.name ?? i.id}`).join(', ') : ''}
                  {o.gp ? `${o.items.length ? ', ' : ''}${o.gp} GP` : ''}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Steg 7: Oversikt                                                    */
/* ------------------------------------------------------------------ */

function ReviewStep() {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L } = useChar()
  const species = L.get('species', char.speciesId)
  const bg = L.get('background', char.backgroundId)
  const summary = useMemo(
    () => [
      { label: 'Class', value: d.classLabel },
      { label: 'Species', value: species?.name ?? '—' },
      { label: 'Background', value: bg?.name ?? '—' },
      { label: 'HP', value: d.hpMax.value },
      { label: 'AC', value: d.ac.value },
      { label: 'Initiative', value: signed(d.initiative.value) },
      { label: 'Speed', value: `${d.speed.value} ft.` },
      { label: 'PB', value: signed(d.pb.value) }
    ],
    [d, species, bg]
  )
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <div className="panel grid grid-cols-4 gap-3 p-4">
          {summary.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted">{s.label}</div>
              <div className="font-display text-lg">{s.value}</div>
            </motion.div>
          ))}
        </div>
        <div className="panel grid grid-cols-6 gap-2 p-4">
          {ABILITIES.map((a) => (
            <div key={a} className="text-center">
              <div className="text-[10px] font-bold text-muted">{a.toUpperCase()}</div>
              <div className="font-display text-2xl">{d.abilities[a].score.value}</div>
              <div className="text-gold">{signed(d.abilities[a].mod)}</div>
            </div>
          ))}
        </div>
        <div className="panel p-4">
          <div className="panel-title mb-2">{t('builder.skillsProf')}</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(d.skills)
              .filter(([, s]) => s.proficient)
              .map(([k, s]) => (
                <span key={k} className="chip">
                  {skillById[k as keyof typeof skillById].name} {signed(s.value)}
                  {s.expertise && ' ★'}
                </span>
              ))}
          </div>
        </div>
        <div className="panel p-4">
          <div className="panel-title mb-2">Features</div>
          <Markdown text={d.features.map((f) => `**${f.name}** (${f.source}) – ${f.summary}`).join('\n\n')} compact />
        </div>
      </div>
      <div className="col-span-12 space-y-3 lg:col-span-5">
        {d.pending.length === 0 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel glow p-6 text-center">
            <Sparkles className="mx-auto mb-2 text-gold" size={32} />
            <div className="font-display text-xl text-gold">{t('builder.ready')}</div>
            <div className="text-sm text-muted">{t('builder.readyText')}</div>
          </motion.div>
        ) : (
          <>
            <div className="panel-title">{t('builder.remaining', { n: d.pending.length })}</div>
            {d.pending.map((p) => (
              <ChoiceResolver key={p.key} p={p} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
