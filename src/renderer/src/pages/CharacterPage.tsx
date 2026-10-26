import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUp, ArrowDown, Coffee, Download, FileText, Lightbulb, Moon, Wand2, Check, SlidersHorizontal } from 'lucide-react'
import { useCharacter, useUi } from '../store/ui'
import { useCharacters } from '../store/characters'
import { useSettings } from '../store/settings'
import { CharCtx } from '../components/sheet/context'
import { Modal, Tabs } from '../components/ui'
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
import { ClassEmblem } from '../components/ClassEmblem'
import { EntityLink } from '../components/EntityInfo'
import { api } from '../lib/api'
import { syncGrantedSpells } from '../lib/sync'
import type { Character } from '../types'
import type { Derived } from '../engine/compute'

type TabId = 'sheet' | 'spells' | 'inventory' | 'features' | 'adjust' | 'details' | 'custom'

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
  const [rest, setRest] = useState<'short' | 'long' | null>(null)
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
    { id: 'custom', label: t('tabs.custom') }
  ]

  return (
    <CharCtx.Provider value={{ char, derived, lookup, update, goTo: setTab, openGuide }}>
      <div className="px-6 pb-24 pt-5">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex flex-wrap items-center gap-4">
          <button className="btn btn-ghost" onClick={() => nav('/')}>
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
            <button className="btn" onClick={() => setPdf(true)}>
              <FileText size={15} /> PDF
            </button>
            <button className="btn" onClick={() => api.exportCharacter(char)} title={t('home.export')}>
              <Download size={15} />
            </button>
            <button className="btn" onClick={() => setLevelDown(true)} disabled={derived.totalLevel <= 1} title={t('char.levelDown')}>
              <ArrowDown size={15} />
            </button>
            <motion.button whileHover={{ scale: 1.03 }} className="btn btn-primary" onClick={() => setLevelUp(true)} disabled={derived.totalLevel >= 20 || !char.classes.length}>
              <ArrowUp size={15} /> {t('char.levelUp')}
            </motion.button>
            <button className={`btn ${showTips ? 'border-gold text-gold' : ''}`} onClick={() => setShowTips(!showTips)}>
              <Lightbulb size={15} />
            </button>
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
  }
  c.pactSlotsUsed = 0
  if (kind === 'long') {
    c.hp.current = d.hpMax.value
    c.hp.temp = 0
    c.spellSlotsUsed = []
    c.deathSaves = { successes: 0, failures: 0 }
    if (c.exhaustion > 0) c.exhaustion -= 1
    // Gjenvinn alle Hit Dice (2024)
    c.hitDiceUsed = {}
  } else {
    for (const [die, n] of Object.entries(hdSpent)) c.hitDiceUsed[die] = (c.hitDiceUsed[die] ?? 0) + n
  }
}

function RestModal({ kind, onClose }: { kind: 'short' | 'long' | null; onClose: () => void }) {
  const { t } = useTranslation()
  const ctx = useContext(Ctx)!
  const { char, derived: d, update } = ctx
  const notify = useUi((s) => s.notify)
  const [spent, setSpent] = useState<Record<string, number>>({})
  const [healed, setHealed] = useState(0)
  useEffect(() => {
    setSpent({})
    setHealed(0)
  }, [kind])
  if (!kind) return <Modal open={false} onClose={onClose}>{null}</Modal>
  const recharge = d.features.filter((f) => f.uses && f.uses.used > 0 && (kind === 'long' || f.uses.recharge === 'short' || f.uses.recharge === 'shortOrLong'))
  return (
    <Modal
      open={!!kind}
      onClose={onClose}
      title={kind === 'short' ? t('rest.short') : t('rest.long')}
      width={560}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              update((c) => {
                applyRest(c, kind, d, spent)
                if (kind === 'short') c.hp.current = Math.min(d.hpMax.value, c.hp.current + healed)
              })
              notify(kind === 'short' ? t('rest.shortDone') : t('rest.longDone'), 'good')
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
        {kind === 'short' && (
          <div className="rounded-xl border border-line-soft p-3">
            <div className="panel-title mb-2">{t('sheet.hitDice')}</div>
            {d.hitDice.map((h) => {
              const left = h.total - h.used - (spent[h.die] ?? 0)
              return (
                <div key={h.die} className="flex items-center gap-2">
                  <span>
                    d{h.die}: {left}/{h.total}
                  </span>
                  <button
                    className="btn btn-sm ml-auto"
                    disabled={left <= 0}
                    onClick={() => {
                      const r = 1 + Math.floor(Math.random() * h.die)
                      const gain = Math.max(0, r + d.abilities.con.mod)
                      setHealed((x) => x + gain)
                      setSpent((s) => ({ ...s, [h.die]: (s[h.die] ?? 0) + 1 }))
                      notify(`d${h.die}: ${r} ${d.abilities.con.mod >= 0 ? '+' : ''}${d.abilities.con.mod} = ${gain} HP`, 'good')
                    }}
                  >
                    🎲 {t('rest.spend')}
                  </button>
                </div>
              )
            })}
            {healed > 0 && <div className="mt-2 text-good">+{healed} HP</div>}
          </div>
        )}
        {recharge.length > 0 && (
          <div>
            <div className="panel-title mb-1">{t('rest.recharges')}</div>
            <div className="flex flex-wrap gap-1">
              {recharge.map((f) => (
                <span key={f.key} className="chip">
                  {f.name}
                </span>
              ))}
              {kind === 'long' && d.slots.some((s) => s.used) && <span className="chip">Spell Slots</span>}
              {d.pact?.used ? <span className="chip">Pact Slots</span> : null}
            </div>
          </div>
        )}
        {void char}
      </div>
    </Modal>
  )
}
