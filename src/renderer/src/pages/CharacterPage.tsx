import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUp, ArrowDown, Archive, Coffee, Download, FileText, Lightbulb, Moon, MoreHorizontal, Wand2, Check, SlidersHorizontal, Swords, Undo2, Redo2 } from 'lucide-react'
import { useCharacter, useUi } from '../store/ui'
import { useCharacters } from '../store/characters'
import { useSettings } from '../store/settings'
import { CharCtx } from '../components/sheet/context'
import { MenuButton, Modal, Tabs } from '../components/ui'
import { SheetTab } from '../components/sheet/SheetTab'
import { SpellsTab } from '../components/sheet/SpellsTab'
import { InventoryTab } from '../components/sheet/InventoryTab'
import { FeaturesTab } from '../components/sheet/FeaturesTab'
import { DetailsTab } from '../components/sheet/DetailsTab'
import { CustomTab } from '../components/sheet/CustomTab'
import { TipsPanel } from '../components/sheet/TipsPanel'
import { LevelUpModal, LevelDownModal } from '../components/sheet/LevelUp'
import { FixGuide } from '../components/sheet/FixGuide'
import { AdjustTab } from '../components/sheet/AdjustTab'
import { JournalTab } from '../components/sheet/JournalTab'
import { useHotkeyListener } from '../lib/hotkeys'
import { ClassEmblem } from '../components/ClassEmblem'
import { EntityLink } from '../components/EntityInfo'
import { api } from '../lib/api'
import { exportCharacter } from '../lib/exportCharacter'
import { syncGrantedSpells } from '../lib/sync'
import { rechargeItems } from '../lib/items'
import { useRolls } from '../store/rolls'
import { applySlotRecovery, effectsEndingOnRest, grantsInspirationOnLongRest, hitDieHeal, passRestTime, recoveryTotal, recoveryValid, slotRecoveryOptions } from '../lib/rest'
import { RollBox } from '../components/combat/RollBox'
import { DiceModeToggle } from '../components/CastDialog'
import type { Character } from '../types'
import type { Derived } from '../engine/compute'

type TabId = 'sheet' | 'spells' | 'inventory' | 'features' | 'adjust' | 'details' | 'custom' | 'journal'

export default function CharacterPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { char, derived, lookup, update } = useCharacter(id)
  const loaded = useCharacters((s) => s.loaded)
  const setActive = useUi((s) => s.setActiveCharacter)
  const showTipsDefault = useSettings((s) => s.showTips)
  const [showTips, setShowTips] = useState(showTipsDefault)
  const [levelUp, setLevelUp] = useState(false)
  const [levelDown, setLevelDown] = useState(false)
  const [guide, setGuide] = useState<{ open: boolean; key?: string; area?: 'spells' | 'other' }>({ open: params.get('guide') === '1' })
  const openGuide = (key?: string, area?: 'spells' | 'other'): void => setGuide({ open: true, key, area })
  const [pdf, setPdf] = useState(false)
  // ?rest=short åpner short rest direkte (f.eks. etter en kamp)
  const [rest, setRest] = useState<'short' | 'long' | null>(null)
  // ?rest=short|long (fra kampen eller hurtigsøket) åpner hvilen og fjernes fra adressen
  const restParam = params.get('rest')
  useEffect(() => {
    if (restParam !== 'short' && restParam !== 'long') return
    setRest(restParam)
    const p = new URLSearchParams(params)
    p.delete('rest')
    setParams(p, { replace: true })
  }, [restParam])
  const tab = (params.get('tab') as TabId) || 'sheet'
  const setTab = (x: string): void => {
    if (x === 'build') nav(`/character/${id}/build?step=abilities`)
    else setParams({ tab: x }, { replace: true })
    document.querySelector('main > div')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    setActive(id ?? null)
    return () => setActive(null)
  }, [id])

  // Automatisk tildelte spells (subclass/species)
  useEffect(() => {
    if (!char) return
    const next = syncGrantedSpells(char, lookup)
    if (next) update((c) => void (c.spells = next))
  }, [char?.classes, char?.speciesOptionId, char?.speciesId, char?.customEntities])

  // Nåværende HP kan ikke være over maks (f.eks. etter level down eller lavere CON)
  useEffect(() => {
    if (char && derived && char.hp.current > derived.hpMax.value) update((c) => void (c.hp.current = derived.hpMax.value))
  }, [derived?.hpMax.value])

  // Hurtigtast 1–8 bytter fane
  useHotkeyListener('tab', (a) => {
    const ids: TabId[] = ['sheet', 'spells', 'inventory', 'features', 'adjust', 'details', 'custom', 'journal']
    if (char && ids[a.index]) setTab(ids[a.index])
  })

  if (!char || !derived) {
    return <div className="p-10 text-center text-muted">{loaded ? t('char.notFound') : t('common.loading')}</div>
  }
  const species = lookup.get('species', char.speciesId)
  const bg = lookup.get('background', char.backgroundId)
  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'sheet', label: t('tabs.sheet') },
    { id: 'spells', label: t('tabs.spells'), badge: derived.pending.filter((p) => p.area === 'spells').length },
    { id: 'inventory', label: t('tabs.inventory') },
    { id: 'features', label: t('tabs.features'), badge: derived.pending.filter((p) => p.area !== 'spells').length },
    { id: 'adjust', label: t('tabs.adjust') },
    { id: 'details', label: t('tabs.details') },
    { id: 'custom', label: t('tabs.custom') },
    { id: 'journal', label: t('tools.journal.tab') }
  ]

  return (
    <CharCtx.Provider value={{ char, derived, lookup, update, goTo: setTab, openGuide }}>
      <div className="px-6 pb-24 pt-5">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex flex-wrap items-center gap-4">
          <button className="btn btn-ghost" onClick={() => nav('/')} title={t('common.back')} aria-label={t('common.back')}>
            <ArrowLeft size={16} />
          </button>
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gold/40 bg-panel-2">
            {char.portrait ? <img src={char.portrait} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ClassEmblem classId={char.classes[0]?.classId} size={28} /></div>}
          </div>
          <div className="min-w-0">
            <input
              className="w-full max-w-md bg-transparent font-display text-3xl font-bold text-gold outline-none placeholder:text-faint"
              value={char.name}
              placeholder={t('common.unnamed')}
              onChange={(e) => update((c) => void (c.name = e.target.value))}
            />
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <span className="font-semibold text-ink">
                {t('common.level')} {derived.totalLevel}
              </span>
              {char.classes.map((ce) => (
                <span key={ce.classId}>
                  <EntityLink kind="class" id={ce.classId} /> {ce.level}
                  {ce.subclassId && (
                    <>
                      {' ('}
                      <EntityLink kind="subclass" id={ce.subclassId} />)
                    </>
                  )}
                </span>
              ))}
              {species && (
                <>
                  · <EntityLink kind="species" id={species.id} />
                </>
              )}
              {bg && (
                <>
                  · <EntityLink kind="background" id={bg.id} />
                </>
              )}
              {char.alignment && <>· {char.alignment}</>}
              {char.deityId && lookup.get('deity', char.deityId) && (
                <>
                  · ☀ <EntityLink kind="deity" id={char.deityId} />
                </>
              )}
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <UndoButtons id={char.id} />
            <motion.button
              whileHover={{ scale: 1.03 }}
              className={`btn ${char.combat ? 'glow border-crimson/60 text-crimson-2' : 'border-crimson/40'}`}
              onClick={() => nav(`/character/${char.id}/combat`)}
              title={t('combat.openTip')}
            >
              <Swords size={15} /> {char.combat ? t('combat.resume', { n: char.combat.round }) : t('combat.open')}
            </motion.button>
            <button className="btn" onClick={() => setRest('short')} title={t('rest.short')}>
              <Coffee size={15} /> {t('rest.shortBtn')}
            </button>
            <button className="btn" onClick={() => setRest('long')} title={t('rest.long')}>
              <Moon size={15} /> {t('rest.longBtn')}
            </button>
            <button className="btn" onClick={() => nav(`/character/${char.id}/build`)} title={t('char.builderTip')}>
              <Wand2 size={15} /> {t('char.builder')}
            </button>
            <button className={`btn ${tab === 'adjust' ? 'border-arcane text-arcane' : ''}`} onClick={() => setTab('adjust')} title={t('char.adjustTip')}>
              <SlidersHorizontal size={15} /> {t('char.adjust')}
            </button>
            <motion.button whileHover={{ scale: 1.03 }} className="btn btn-primary" onClick={() => setLevelUp(true)} disabled={derived.totalLevel >= 20 || !char.classes.length} title={t('char.levelUp')}>
              <ArrowUp size={15} /> {t('char.levelUp')}
            </motion.button>
            <button
              className={`btn ${showTips ? 'border-gold text-gold' : ''}`}
              onClick={() => setShowTips(!showTips)}
              title={showTips ? t('polish.header.hideTips') : t('polish.header.showTips')}
              aria-label={showTips ? t('polish.header.hideTips') : t('polish.header.showTips')}
              aria-pressed={showTips}
            >
              <Lightbulb size={15} />
            </button>
            <MenuButton
              label={t('polish.header.more')}
              icon={<MoreHorizontal size={15} />}
              items={[
                { label: t('pdf.title'), icon: <FileText size={14} />, onClick: () => setPdf(true) },
                { label: t('polish.header.exportFile'), icon: <Download size={14} />, onClick: () => exportCharacter(char) },
                { label: t('char.levelDown'), icon: <ArrowDown size={14} />, onClick: () => setLevelDown(true), disabled: derived.totalLevel <= 1 },
                {
                  label: char.archived ? t('polish.home.unarchive') : t('polish.home.archive'),
                  icon: <Archive size={14} />,
                  onClick: () => update((c) => void (c.archived = !c.archived ? true : undefined))
                }
              ]}
            />
          </div>
        </motion.header>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Tabs
            tabs={tabs}
            value={tab}
            onChange={setTab}
            className="inline-flex"
            badgeTitle={t('guide.badgeTitle')}
            onBadgeClick={(id) => openGuide(undefined, id === 'spells' ? 'spells' : 'other')}
          />
          <AnimatePresence>
            {derived.pending.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03 }}
                className="btn glow border-crimson/60 text-crimson-2"
                onClick={() => openGuide()}
              >
                <span className="rounded-full bg-crimson px-1.5 text-[11px] font-bold text-white">{derived.pending.length}</span>
                {t('guide.missingBtn')}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {tab === 'sheet' && <SheetTab />}
                {tab === 'spells' && <SpellsTab />}
                {tab === 'inventory' && <InventoryTab />}
                {tab === 'features' && <FeaturesTab />}
                {tab === 'adjust' && <AdjustTab />}
                {tab === 'details' && <DetailsTab />}
                {tab === 'custom' && <CustomTab />}
                {tab === 'journal' && <JournalTab />}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence>{showTips && <TipsPanel onClose={() => setShowTips(false)} />}</AnimatePresence>
        </div>
      </div>
      <LevelUpModal open={levelUp} onClose={() => setLevelUp(false)} />
      <LevelDownModal open={levelDown} onClose={() => setLevelDown(false)} />
      <FixGuide open={guide.open} startKey={guide.key} onlyArea={guide.area} onClose={() => setGuide({ open: false })} />
      <PdfModal open={pdf} onClose={() => setPdf(false)} />
      <RestModal kind={rest} onClose={() => setRest(null)} />
    </CharCtx.Provider>
  )
}

/* ------------------------------------------------------------------ */

const PDF_PARTS = ['sheet', 'spells', 'features', 'inventory', 'spellcards', 'details', 'legal'] as const

function PdfModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [parts, setParts] = useState<string[]>([...PDF_PARTS])
  const [busy, setBusy] = useState(false)
  const char = useCharCtxChar()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('pdf.title')}
      width={520}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            disabled={busy || !parts.length}
            onClick={async () => {
              setBusy(true)
              try {
                await api.exportPdf({ id: char.id, name: char.name || 'character', parts })
              } finally {
                setBusy(false)
                onClose()
              }
            }}
          >
            <FileText size={14} /> {busy ? t('pdf.working') : t('pdf.export')}
          </button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">{t('pdf.intro')}</p>
      <div className="space-y-1.5">
        {PDF_PARTS.map((p) => {
          const on = parts.includes(p)
          return (
            <button key={p} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${on ? 'border-gold bg-gold/10' : 'border-line-soft'}`} onClick={() => setParts(on ? parts.filter((x) => x !== p) : [...parts, p])}>
              <span className={`flex h-5 w-5 items-center justify-center rounded border ${on ? 'border-gold bg-gold text-[#1d1408]' : 'border-line'}`}>{on && <Check size={12} />}</span>
              <div>
                <div className="font-medium">{t(`pdf.${p}`)}</div>
                <div className="text-xs text-muted">{t(`pdf.${p}Desc`)}</div>
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

import { useContext } from 'react'
import { CharCtx as Ctx } from '../components/sheet/context'
function useCharCtxChar(): Character {
  return useContext(Ctx)!.char
}

function applyRest(c: Character, kind: 'short' | 'long', d: Derived, hdSpent: Record<string, number>): void {
  const keys = new Map(d.features.filter((f) => f.uses).map((f) => [f.key, f.uses!.recharge]))
  for (const k of Object.keys(c.featureUses)) {
    const r = keys.get(k)
    if (kind === 'long' || r === 'short' || r === 'shortOrLong') delete c.featureUses[k]
    // 2024: én bruk tilbake på short rest (Rage, Second Wind, Wild Shape, Channel Divinity)
    else if (r === 'shortOne') {
      c.featureUses[k] = Math.max(0, (c.featureUses[k] ?? 0) - 1)
      if (!c.featureUses[k]) delete c.featureUses[k]
    }
  }
  c.pactSlotsUsed = 0
  // Tiden går: effekter utenfor kamp teller ned (Long Rest: concentration slutter når du sover)
  if (!c.combat) passRestTime(c, kind)
  if (kind === 'long') {
    // Gratis-kast fra feats, species og Mystic Arcanum (1 gang per long rest)
    for (const k of Object.keys(c.featureUses)) if (k.startsWith('free:')) delete c.featureUses[k]
    c.hp.current = d.hpMax.value
    c.hp.temp = 0
    c.spellSlotsUsed = []
    c.deathSaves = { successes: 0, failures: 0 }
    if (c.exhaustion > 0) c.exhaustion -= 1
    // Gjenvinn alle Hit Dice (2024)
    c.hitDiceUsed = {}
    // Resourceful (Human): Heroic Inspiration etter hver Long Rest
    if (grantsInspirationOnLongRest(d)) c.heroicInspiration = true
  } else {
    for (const [die, n] of Object.entries(hdSpent)) c.hitDiceUsed[die] = (c.hitDiceUsed[die] ?? 0) + n
  }
}

function RestModal({ kind, onClose }: { kind: 'short' | 'long' | null; onClose: () => void }) {
  const { t } = useTranslation()
  const ctx = useContext(Ctx)!
  const { char, derived: d, update } = ctx
  const notify = useUi((s) => s.notify)
  const physical = (useSettings((s) => s.combatDice) ?? 'app') === 'physical'
  const [spent, setSpent] = useState<Record<string, number>>({})
  const [healed, setHealed] = useState(0)
  const [hdRoll, setHdRoll] = useState<Record<string, number | null>>({})
  // Arcane Recovery / Natural Recovery: valgte slots per nivå
  const [picks, setPicks] = useState<Record<string, Record<number, number>>>({})
  useEffect(() => {
    setSpent({})
    setHealed(0)
    setHdRoll({})
    setPicks({})
  }, [kind])
  if (!kind) return <Modal open={false} onClose={onClose}>{null}</Modal>
  const recharge = d.features.filter((f) => f.uses && f.uses.used > 0 && (kind === 'long' || f.uses.recharge === 'short' || f.uses.recharge === 'shortOrLong' || f.uses.recharge === 'shortOne'))
  const slotsBack = (kind === 'long' && d.slots.some((s) => s.used)) || !!d.pact?.used
  const recoveries = kind === 'short' ? slotRecoveryOptions(char, d) : []
  const usedSlots = d.slots.filter((s) => s.used > 0)
  const ending = char.combat ? [] : effectsEndingOnRest(char, kind)
  const inspiration = kind === 'long' && grantsInspirationOnLongRest(d) && !char.heroicInspiration
  const spendDie = (die: number, total: number): void => {
    const gain = hitDieHeal(total)
    setHealed((x) => x + gain)
    setSpent((s) => ({ ...s, [die]: (s[die] ?? 0) + 1 }))
    setHdRoll((r) => ({ ...r, [die]: null }))
    notify(t('spellsx.rest.hdGain', { die, n: gain }), 'good')
  }
  return (
    <Modal
      open={!!kind}
      onClose={onClose}
      title={kind === 'short' ? t('rest.short') : t('rest.long')}
      width={600}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              let charges: { name: string; regained: number }[] = []
              update((c) => {
                for (const r of recoveries) {
                  const p = picks[r.id]
                  if (p && r.available && recoveryValid(p, r, d.slots)) applySlotRecovery(c, r, p)
                }
                applyRest(c, kind, d, spent)
                if (kind === 'short') c.hp.current = Math.min(d.hpMax.value, c.hp.current + healed)
                // Charges på magiske gjenstander («regains 1d6 + 1 expended charges daily at dawn»)
                else charges = rechargeItems(c, ctx.lookup, (dice, label) => useRolls.getState().roll(dice, label, { character: char.name }).total)
              })
              for (const x of charges) notify(t('items.chargesRegained', { name: x.name, n: x.regained }), 'good')
              notify(kind === 'short' ? t('rest.shortDone') : t('rest.longDone'), 'good')
              if (ending.length) notify(t('spellsx.expired', { names: ending.map((e) => e.name).join(', ') }), 'info')
              onClose()
            }}
          >
            {kind === 'short' ? <Coffee size={14} /> : <Moon size={14} />} {t('rest.take')}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-muted">{kind === 'short' ? t('rest.shortText') : t('rest.longText')}</p>
        {char.hp.current <= 0 && <p className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-bad">{t('rest.needHp')}</p>}
        {kind === 'short' && (
          <div className="rounded-xl border border-line-soft p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="panel-title">{t('sheet.hitDice')}</div>
              <span className="ml-auto">
                <DiceModeToggle className="" />
              </span>
            </div>
            <div className="space-y-2">
              {d.hitDice.map((h) => {
                const left = h.total - h.used - (spent[h.die] ?? 0)
                const v = hdRoll[h.die] ?? null
                return (
                  <div key={h.die} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      d{h.die}: {left}/{h.total} {t('spellsx.rest.left')}
                    </div>
                    {left > 0 ? (
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <RollBox
                            label={t('spellsx.rest.hitDie', { die: h.die })}
                            notation={`1d${h.die}${d.abilities.con.mod >= 0 ? '+' : ''}${d.abilities.con.mod}`}
                            value={v}
                            onValue={(x, r) => {
                              // Rullet i appen (3D-terninger + logg): brukes med en gang
                              if (r && x !== null) spendDie(h.die, x)
                              else setHdRoll((s) => ({ ...s, [h.die]: x }))
                            }}
                            physical={physical}
                            character={char.name}
                            hint={t('spellsx.rest.min1')}
                          />
                        </div>
                        {(physical || v !== null) && (
                          <button className="btn btn-primary btn-sm mb-3" disabled={v === null} onClick={() => v !== null && spendDie(h.die, v)}>
                            {t('rest.spend')}
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
            {healed > 0 && <div className="mt-2 text-good">+{healed} HP</div>}
          </div>
        )}
        {recoveries.map((r) => {
          const p = picks[r.id] ?? {}
          const total = recoveryTotal(p)
          const setN = (level: number, n: number): void => setPicks((x) => ({ ...x, [r.id]: { ...(x[r.id] ?? {}), [level]: n } }))
          return (
            <div key={r.id} className="rounded-xl border border-arcane/40 bg-arcane/5 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-arcane">{r.name}</span>
                <span className="ml-auto text-xs text-muted">{t('spellsx.rest.budget', { n: total, max: r.budget })}</span>
              </div>
              {!r.available ? (
                <p className="text-xs text-muted">{t('spellsx.rest.recoveryUsed')}</p>
              ) : !usedSlots.length ? (
                <p className="text-xs text-muted">{t('spellsx.rest.noSlotsUsed')}</p>
              ) : (
                <>
                  <p className="mb-2 text-xs text-muted">{t('spellsx.rest.recoveryText', { n: r.budget })}</p>
                  <div className="flex flex-wrap gap-2">
                    {usedSlots.map((s) => {
                      const n = p[s.level] ?? 0
                      const tooHigh = s.level > r.maxLevel
                      const canAdd = !tooHigh && n < s.used && total + s.level <= r.budget
                      return (
                        <div key={s.level} className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${n ? 'border-arcane text-arcane' : 'border-line-soft'} ${tooHigh ? 'opacity-40' : ''}`} title={tooHigh ? t('spellsx.rest.noHigh') : undefined}>
                          <span className="text-xs">Level {s.level}</span>
                          <button className="btn btn-ghost btn-sm px-1" disabled={!n} onClick={() => setN(s.level, n - 1)}>
                            −
                          </button>
                          <span className="w-4 text-center font-display">{n}</span>
                          <button className="btn btn-ghost btn-sm px-1" disabled={!canAdd} onClick={() => setN(s.level, n + 1)}>
                            +
                          </button>
                          <span className="text-[10px] text-muted">/ {s.used}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
        {(recharge.length > 0 || slotsBack || inspiration) && (
          <div>
            <div className="panel-title mb-1">{t('rest.recharges')}</div>
            <div className="flex flex-wrap gap-1">
              {recharge.map((f) => (
                <span key={f.key} className="chip">
                  {f.name}
                  {kind === 'short' && f.uses?.recharge === 'shortOne' ? ' (+1)' : ''}
                </span>
              ))}
              {kind === 'long' && d.slots.some((s) => s.used) && <span className="chip">{t('spells.slots')}</span>}
              {d.pact?.used ? <span className="chip">{t('polish.labels.pactSlots')}</span> : null}
              {inspiration && <span className="chip border-gold/60 text-gold">★ Heroic Inspiration (Resourceful)</span>}
            </div>
          </div>
        )}
        {ending.length > 0 && (
          <div>
            <div className="panel-title mb-1">{t('spellsx.rest.effectsEnd')}</div>
            <div className="flex flex-wrap gap-1">
              {ending.map((e) => (
                <span key={e.uid} className="chip text-muted">
                  {e.name}
                </span>
              ))}
              {kind === 'long' && char.concentration && !ending.some((e) => e.concentration) && <span className="chip text-muted">{char.concentration.name}</span>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

/** Angre/gjør om (også Ctrl+Z / Ctrl+Y) */
function UndoButtons({ id }: { id: string }) {
  const { t } = useTranslation()
  useCharacters((s) => s.historySeq)
  const { undo, redo, canUndo, canRedo } = useCharacters.getState()
  return (
    <div className="flex">
      <button className="btn rounded-r-none px-2" disabled={!canUndo(id)} onClick={() => undo(id)} title={t('char.undoTip')}>
        <Undo2 size={15} />
      </button>
      <button className="btn rounded-l-none border-l-0 px-2" disabled={!canRedo(id)} onClick={() => redo(id)} title={t('char.redoTip')}>
        <Redo2 size={15} />
      </button>
    </div>
  )
}
