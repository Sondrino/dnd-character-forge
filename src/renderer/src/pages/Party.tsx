import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Brain, Check, Heart, HeartCrack, Pencil, Plus, Shield, Skull, Sparkles, Swords, Trash2, UserMinus, UserPlus, Users, X } from 'lucide-react'
import type { DamageType } from '../types'
import { useCharacters } from '../store/characters'
import { useCharacter, useLookup, useUi } from '../store/ui'
import { useParties, type Party } from '../store/party'
import { computeCharacter } from '../engine/compute'
import { addLog, dropConcentration } from '../lib/combat'
import { addMembers, applyHpChange, liveMembers, removeMember, toggleCharacterCondition, type HpOutcome } from '../lib/party'
import { Empty, Modal, Tabs } from '../components/ui'
import { ClassEmblem } from '../components/ClassEmblem'
import { ConditionChips } from '../components/combat/ConditionChips'
import { PartyEncounterView } from '../components/party/Encounter'
import { signed } from '../components/combat/useCombat'

const DAMAGE_TYPES: DamageType[] = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']

export default function PartyPage() {
  const { t } = useTranslation()
  const parties = useParties((s) => s.parties)
  const loaded = useParties((s) => s.loaded)
  const load = useParties((s) => s.load)
  const create = useParties((s) => s.create)
  const [selId, setSelId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  useEffect(() => {
    if (!loaded) void load()
  }, [loaded, load])
  const party = parties.find((p) => p.id === selId) ?? parties[0]

  const add = (): void => {
    const id = create(newName.trim() || t('party.defaultName', { n: parties.length + 1 }))
    setSelId(id)
    setNewName('')
  }

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <header className="relative mb-5 overflow-hidden rounded-2xl border border-line-soft bg-gradient-to-br from-panel to-bg-2 px-6 py-5">
        <motion.div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-crimson/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative flex items-center gap-3">
          <Users size={26} className="text-gold" />
          <div>
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-gold">
              {t('party.title')}
            </motion.h1>
            <p className="font-serif text-muted">{t('party.tagline')}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5">
        {/* Gruppeliste */}
        <aside className="col-span-12 space-y-2 lg:col-span-3 xl:col-span-2">
          <div className="panel-title mb-1">{t('party.parties')}</div>
          {parties.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelId(p.id)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${party?.id === p.id ? 'border-gold bg-gold/10 text-gold-2' : 'border-line-soft bg-panel-2 hover:border-line'}`}
            >
              <Users size={14} />
              <span className="min-w-0 flex-1 truncate font-display">{p.name || t('common.unnamed')}</span>
              {p.encounter && <Swords size={12} className="text-crimson-2" />}
              <span className="text-[10px] text-muted">{p.memberIds.length}</span>
            </motion.button>
          ))}
          <div className="flex gap-1 pt-1">
            <input className="input min-w-0 flex-1" placeholder={t('party.newPh')} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <button className="btn btn-primary btn-sm" onClick={add} title={t('party.new')}>
              <Plus size={14} />
            </button>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-10">
          {party ? (
            <PartyView key={party.id} party={party} />
          ) : loaded ? (
            <div className="panel">
              <Empty
                icon={<Users size={40} />}
                title={t('party.empty')}
                text={t('party.emptyText')}
                action={
                  <button className="btn btn-primary mt-2" onClick={add}>
                    <Plus size={14} /> {t('party.new')}
                  </button>
                }
              />
            </div>
          ) : (
            <div className="p-10 text-center text-muted">{t('common.loading')}</div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Én gruppe                                                           */
/* ------------------------------------------------------------------ */

function PartyView({ party }: { party: Party }) {
  const { t } = useTranslation()
  const characters = useCharacters((s) => s.characters)
  const update = useParties((s) => s.update)
  const remove = useParties((s) => s.remove)
  const [tab, setTab] = useState<'overview' | 'encounter'>(party.encounter ? 'encounter' : 'overview')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [adding, setAdding] = useState(false)
  const members = liveMembers(party, characters)

  const saveName = (): void => {
    if (renaming !== null && renaming.trim()) update(party.id, (p) => void (p.name = renaming.trim()))
    setRenaming(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {renaming !== null ? (
          <div className="flex items-center gap-1">
            <input className="input w-64 font-display text-lg" value={renaming} autoFocus onChange={(e) => setRenaming(e.target.value)} onKeyDown={(e) => (e.key === 'Enter' ? saveName() : e.key === 'Escape' && setRenaming(null))} />
            <button className="btn btn-primary btn-sm" onClick={saveName}>
              <Check size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setRenaming(null)}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <h2 className="flex items-center gap-2 font-display text-2xl text-gold">
            {party.name || t('common.unnamed')}
            <button className="btn btn-ghost btn-sm" title={t('party.rename')} onClick={() => setRenaming(party.name)}>
              <Pencil size={13} />
            </button>
          </h2>
        )}
        <span className="text-sm text-muted">{t('party.memberCount', { n: members.length })}</span>
        <Tabs
          className="ml-auto"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'overview', label: <><Users size={13} /> {t('party.overview')}</> },
            { id: 'encounter', label: <><Swords size={13} /> {party.encounter ? t('party.encounterRound', { n: party.encounter.round }) : t('party.encounter')}</> }
          ]}
        />
        <button className="btn" onClick={() => setAdding(true)}>
          <UserPlus size={14} /> {t('party.addMembers')}
        </button>
        <button className="btn btn-ghost btn-danger" title={t('party.delete')} onClick={() => setConfirmDelete(true)}>
          <Trash2 size={14} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {tab === 'overview' ? (
            members.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
                {members.map((c, i) => (
                  <MemberCard key={c.id} id={c.id} index={i} onRemove={() => update(party.id, (p) => removeMember(p, c.id))} />
                ))}
              </div>
            ) : (
              <div className="panel">
                <Empty
                  icon={<UserPlus size={36} />}
                  title={t('party.noMembers')}
                  text={t('party.noMembersText')}
                  action={
                    <button className="btn btn-primary mt-2" onClick={() => setAdding(true)}>
                      <UserPlus size={14} /> {t('party.addMembers')}
                    </button>
                  }
                />
              </div>
            )
          ) : (
            <PartyEncounterView party={party} />
          )}
        </motion.div>
      </AnimatePresence>

      <AddMembers open={adding} onClose={() => setAdding(false)} party={party} />
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('party.deleteTitle')}
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-danger" onClick={() => remove(party.id)}>
              <Trash2 size={14} /> {t('common.delete')}
            </button>
          </>
        }
      >
        {t('party.deleteText', { name: party.name || t('common.unnamed') })}
      </Modal>
    </div>
  )
}

function AddMembers({ open, onClose, party }: { open: boolean; onClose: () => void; party: Party }) {
  const { t } = useTranslation()
  const characters = useCharacters((s) => s.characters)
  const update = useParties((s) => s.update)
  const L = useLookup()
  const [picked, setPicked] = useState<string[]>([])
  useEffect(() => setPicked([]), [open])
  const list = useMemo(
    () => Object.values(characters).filter((c) => !party.memberIds.includes(c.id)).sort((a, b) => (a.name || '~').localeCompare(b.name || '~', 'nb')),
    [characters, party.memberIds]
  )
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('party.addMembers')}
      width={560}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            disabled={!picked.length}
            onClick={() => {
              update(party.id, (p) => addMembers(p, picked))
              onClose()
            }}
          >
            <UserPlus size={14} /> {t('party.addN', { n: picked.length })}
          </button>
        </>
      }
    >
      {list.length === 0 ? (
        <p className="text-sm text-muted">{t('party.allAdded')}</p>
      ) : (
        <div className="space-y-1">
          {list.map((c) => {
            const on = picked.includes(c.id)
            const d = computeCharacter(c, L)
            return (
              <button
                key={c.id}
                onClick={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm ${on ? 'border-gold bg-gold/10' : 'border-line-soft hover:border-line'}`}
              >
                <ClassEmblem classId={c.classes[0]?.classId} size={26} />
                <span className="flex-1">
                  <span className="font-display text-gold">{c.name || t('common.unnamed')}</span>
                  <span className="ml-2 text-xs text-muted">{d.classLabel}</span>
                </span>
                {on && <Check size={15} className="text-gold" />}
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* DM-kort per medlem                                                  */
/* ------------------------------------------------------------------ */

function MemberCard({ id, index, onRemove }: { id: string; index: number; onRemove: () => void }) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const notify = useUi((s) => s.notify)
  const L = useLookup()
  const { char, derived: d, update } = useCharacter(id)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [crit, setCrit] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [concDC, setConcDC] = useState<number | null>(null)
  if (!char || !d) return null
  const max = d.hpMax.value
  const pct = max ? Math.max(0, Math.min(1, char.hp.current / max)) : 0
  const n = Math.max(0, parseInt(amount, 10) || 0)
  const conc = char.combat?.concentration
  const dcs = [...new Set(d.spellcasting.map((s) => s.dc.value))]
  const ds = char.deathSaves

  const apply = (kind: 'damage' | 'heal' | 'temp'): void => {
    if (!n) return
    const res: { out?: HpOutcome } = {}
    update((ch) => {
      const out = applyHpChange(ch, { kind, amount: n, type: type || undefined, crit }, { max, resistances: d.resistances, immunities: d.immunities, vulnerabilities: d.vulnerabilities })
      res.out = out
      // Spilleren ser det i sin egen kamplogg
      if (ch.combat && out.n) {
        if (kind === 'damage') ch.combat.stats.taken += out.n
        addLog(ch.combat, kind === 'damage' ? 'damage' : 'heal', t(`party.log.dm.${kind}`, { n: out.n }))
        if (out.concentrationLost) addLog(ch.combat, 'info', t('combat.log.concLost', { name: out.concentrationLost }))
      }
    })
    const r = res.out?.damage
    if (r) {
      const msg = r.instantDeath ? t('combat.massive') : r.modifier ? t(`combat.dmgMod.${r.modifier}`) : r.droppedToZero ? t('party.down') : null
      setFlash(msg)
      if (msg) setTimeout(() => setFlash(null), 2500)
      if (r.concentrationDC) {
        setConcDC(r.concentrationDC)
        notify(t('party.concSave', { name: char.name || t('common.unnamed'), spell: conc?.name ?? '', dc: r.concentrationDC }))
      }
      if (res.out?.concentrationLost) notify(t('party.concLost', { name: char.name || t('common.unnamed'), spell: res.out.concentrationLost }), 'bad')
    }
    setAmount('')
    setCrit(false)
  }

  const box = (label: string, value: string) => (
    <div className="rounded-lg border border-line-soft bg-panel-2 px-1.5 py-1 text-center">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-display text-lg leading-tight">{value}</div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`panel flex flex-col gap-3 p-4 ${char.hp.current <= 0 ? 'border-bad/60' : ''}`}>
      {/* Navn og class */}
      <div className="flex items-start gap-3">
        {char.portrait ? <img src={char.portrait} className="h-11 w-11 rounded-xl object-cover" /> : <ClassEmblem classId={char.classes[0]?.classId} size={40} />}
        <div className="min-w-0 flex-1">
          <button className="block max-w-full truncate text-left font-display text-xl text-gold hover:text-gold-2" title={t('party.openSheet')} onClick={() => nav(`/character/${char.id}`)}>
            {char.name || t('common.unnamed')}
          </button>
          <div className="truncate text-xs text-muted">
            {t('common.level')} {d.totalLevel} · {L.get('species', char.speciesId)?.name ?? ''} {d.classLabel}
            {char.playerName && <> · {char.playerName}</>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm px-1" title={t('party.removeMember')} onClick={onRemove}>
          <UserMinus size={14} />
        </button>
      </div>

      {/* Nøkkeltall */}
      <div className="grid grid-cols-4 gap-1.5">
        {box('AC', String(d.ac.value))}
        {box(t('combat.init'), signed(d.initiative.value))}
        {box(t('combat.speed'), `${d.speed.value}`)}
        {box(t('combat.spellDC'), dcs.length ? dcs.join('/') : '–')}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <span className="chip" title={t('party.passivePerception')}>
          {t('party.perc')} <b>{d.passive.perception.value}</b>
        </span>
        <span className="chip" title={t('party.passiveInsight')}>
          {t('party.ins')} <b>{d.passive.insight.value}</b>
        </span>
        <span className="chip" title={t('party.passiveInvestigation')}>
          {t('party.inv')} <b>{d.passive.investigation.value}</b>
        </span>
        {d.darkvision > 0 && <span className="chip text-muted">DV {d.darkvision} ft.</span>}
      </div>

      {/* HP */}
      <div>
        <div className="flex items-end gap-2">
          <motion.span key={char.hp.current} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`font-display text-3xl leading-none ${char.hp.current <= 0 ? 'text-bad' : pct < 0.34 ? 'text-crimson-2' : 'text-ink'}`}>
            {char.hp.current}
          </motion.span>
          <span className="text-sm text-muted">/ {max} HP</span>
          {char.hp.temp > 0 && <span className="chip border-sky/50 text-sky">+{char.hp.temp} temp</span>}
          <AnimatePresence>
            {flash && (
              <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="chip ml-auto border-gold text-gold">
                {flash}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel-3">
          <motion.div className={`h-full ${pct < 0.34 ? 'bg-bad' : pct < 0.67 ? 'bg-gold' : 'bg-good'}`} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <input
            className="input w-16 text-center font-display"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && apply('damage')}
          />
          <select className="input min-w-0 flex-1 text-xs" value={type} onChange={(e) => setType(e.target.value)} title={t('combat.damageTypeTip')}>
            <option value="">{t('combat.damageType')}</option>
            {DAMAGE_TYPES.map((x) => (
              <option key={x} value={x}>
                {x}
                {d.resistances.includes(x) ? ' ½' : d.immunities.includes(x) ? ' ✕' : d.vulnerabilities.includes(x) ? ' ×2' : ''}
              </option>
            ))}
          </select>
          <button className="btn btn-sm border-bad/50 px-2 text-bad" disabled={!n} onClick={() => apply('damage')} title={t('combat.takeDamage')}>
            <HeartCrack size={13} />
          </button>
          <button className="btn btn-sm border-good/50 px-2 text-good" disabled={!n} onClick={() => apply('heal')} title={t('combat.heal')}>
            <Heart size={13} />
          </button>
          <button className="btn btn-sm border-sky/50 px-2 text-sky" disabled={!n} onClick={() => apply('temp')} title={t('combat.tempHp')}>
            <Shield size={13} />
          </button>
        </div>
        {char.hp.current <= 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-bad/50 bg-bad/10 px-2 py-1 text-xs">
            <Skull size={12} className="text-bad" />
            <span className="text-good">✓ {ds.successes}/3</span>
            <span className="text-bad">✕ {ds.failures}/3</span>
            <span className="text-muted">{ds.failures >= 3 ? t('party.dead') : ds.successes >= 3 ? t('party.stable') : t('party.dying')}</span>
            <label className="ml-auto flex cursor-pointer items-center gap-1">
              <input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} /> {t('combat.wasCrit')}
            </label>
          </div>
        )}
      </div>

      {/* Concentration */}
      {conc && (
        <div className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-xs ${concDC ? 'border-gold bg-gold/10' : 'border-arcane/50 bg-arcane/10'}`}>
          <Brain size={12} className="text-arcane" />
          <span className="min-w-0 flex-1 truncate">
            {t('combat.concentrating')}: <b>{conc.name}</b>
            {concDC && <span className="ml-1 text-gold">· {t('party.conDc', { dc: concDC })}</span>}
          </span>
          {concDC && (
            <button className="btn btn-ghost btn-sm px-1" title={t('party.concKept')} onClick={() => setConcDC(null)}>
              <Check size={12} />
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm px-1"
            title={t('party.endConc')}
            onClick={() => {
              update((ch) => {
                if (!ch.combat) return
                addLog(ch.combat, 'info', t('combat.log.concLost', { name: ch.combat.concentration?.name ?? '' }))
                dropConcentration(ch.combat, ch)
              })
              setConcDC(null)
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Conditions og inspiration */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <ConditionChips
          className="flex-1"
          value={char.conditions}
          onToggle={(cid) =>
            update((ch) => {
              const r = toggleCharacterCondition(ch, cid)
              if (ch.combat) {
                addLog(ch.combat, 'info', `${r.on ? '+' : '−'} ${L.get('condition', cid)?.name ?? cid}`)
                if (r.concentrationLost) addLog(ch.combat, 'info', t('combat.log.concLost', { name: r.concentrationLost }))
              }
            })
          }
        />
        {char.exhaustion > 0 && <span className="chip border-crimson/40 text-crimson-2">Exhaustion {char.exhaustion}</span>}
        <button
          className={`chip cursor-pointer ${char.heroicInspiration ? 'border-gold bg-gold/20 text-gold-2' : 'text-muted'}`}
          title={t('combat.heroicInspiration')}
          onClick={() => update((ch) => void (ch.heroicInspiration = !ch.heroicInspiration))}
        >
          <Sparkles size={11} /> {t('party.inspiration')}
        </button>
        {char.combat && (
          <button className="chip cursor-pointer border-crimson/40 text-crimson-2" title={t('party.inCombatTip')} onClick={() => nav(`/character/${char.id}/combat`)}>
            <Swords size={11} /> {t('combat.resume', { n: char.combat.round })}
          </button>
        )}
      </div>
    </motion.div>
  )
}
