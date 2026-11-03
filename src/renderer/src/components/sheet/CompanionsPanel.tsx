import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, Plus, Trash2, Eye, BookOpen, Sparkles } from 'lucide-react'
import type { Companion, CreatureDef } from '../../types'
import { useChar } from './context'
import { NumberInput, Section } from '../ui'
import { EntityPicker } from '../EntityPicker'
import { useUi } from '../../store/ui'
import { useHomebrew } from '../../store/settings'
import { EntityEditor } from '../HomebrewEditor'
import { COMPANION_KINDS, companionFromCreature, customCompanion, damageCompanion, defaultCompanionKind, healCompanion, syncCombatFromCompanion } from '../../lib/companions'

/** Companions på arket: familiar, dyrevenn, steed, summon – med HP-sporing */
export function CompanionsPanel() {
  const { t } = useTranslation()
  const { char, update } = useChar()
  const [picker, setPicker] = useState(false)
  const [form, setForm] = useState<{ name: string; hp: number; ac: number; kind: Companion['kind'] } | null>(null)
  const [creating, setCreating] = useState(false)
  const library = useHomebrew((s) => s.entities)
  const saveToLibrary = useHomebrew((s) => s.upsert)
  const list = char.companions ?? []
  // Egne skapninger: fra Homebrew-siden og de som bare ligger på denne karakteren
  const homebrew = [...char.customEntities, ...library.filter((e) => !char.customEntities.some((x) => x.id === e.id))].filter((e): e is CreatureDef => e.kind === 'creature')
  const addCreatures = (creatures: CreatureDef[]): void =>
    update((c) => {
      const kind = defaultCompanionKind(c)
      c.companions = [...(c.companions ?? []), ...creatures.map((cr) => companionFromCreature(cr, kind))]
    })

  /** Endre en companion (og en ev. koblet combatant i en pågående kamp) */
  const edit = (uid: string, fn: (cp: Companion) => void): void =>
    update((c) => {
      const cp = c.companions?.find((x) => x.uid === uid)
      if (!cp) return
      fn(cp)
      syncCombatFromCompanion(c, uid)
    })

  return (
    <Section
      title={
        <span className="flex items-center gap-1.5">
          <PawPrint size={13} /> {t('tools.companions.title')}
        </span>
      }
      actions={
        <>
          <button className="btn btn-sm" onClick={() => setPicker(true)}>
            <BookOpen size={12} /> {t('tools.companions.add')}
          </button>
          <button className="btn btn-sm" onClick={() => setForm({ name: '', hp: 10, ac: 12, kind: 'companion' })}>
            <Plus size={12} /> {t('tools.companions.addCustom')}
          </button>
        </>
      }
    >
      {form && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-gold/5 p-2 text-sm">
          <input className="input w-40" placeholder={t('tools.companions.name')} value={form.name} autoFocus onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="flex items-center gap-1 text-xs text-muted">
            {t('tools.companions.maxHp')} <NumberInput value={form.hp} min={1} max={999} width={56} onChange={(v) => setForm({ ...form, hp: v })} />
          </label>
          <label className="flex items-center gap-1 text-xs text-muted">
            AC <NumberInput value={form.ac} min={0} max={40} width={48} onChange={(v) => setForm({ ...form, ac: v })} />
          </label>
          <KindSelect value={form.kind} onChange={(kind) => setForm({ ...form, kind })} />
          <button className="btn btn-sm ml-auto" onClick={() => setForm(null)}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!form.name.trim()}
            onClick={() => {
              const cp = customCompanion(form.name, form.hp, form.ac, form.kind)
              update((c) => void (c.companions = [...(c.companions ?? []), cp]))
              setForm(null)
            }}
          >
            {t('tools.companions.create')}
          </button>
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-line-soft p-2 text-xs">
        <span className="flex items-center gap-1 font-semibold text-muted">
          <Sparkles size={12} /> {t('tools.companions.homebrew')}
        </span>
        {homebrew.map((cr) => (
          <button key={cr.id} className="chip cursor-pointer hover:border-gold hover:text-ink" title={t('tools.companions.homebrewAdd', { name: cr.name })} onClick={() => addCreatures([cr])}>
            <Plus size={10} /> {cr.name}
          </button>
        ))}
        {homebrew.length === 0 && <span className="text-muted">{t('tools.companions.homebrewEmpty')}</span>}
        <button className="btn btn-sm ml-auto" onClick={() => setCreating(true)}>
          <Plus size={12} /> {t('tools.companions.homebrewNew')}
        </button>
      </div>
      {list.length === 0 && !form && <p className="text-sm text-muted">{t('tools.companions.empty')}</p>}
      <div className="space-y-2">
        {list.map((cp) => (
          <CompanionRow key={cp.uid} cp={cp} edit={(fn) => edit(cp.uid, fn)} remove={() => update((c) => void (c.companions = (c.companions ?? []).filter((x) => x.uid !== cp.uid)))} />
        ))}
      </div>
      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['creature']}
        title={t('tools.companions.pickTitle')}
        multi
        extra={char.customEntities}
        firstGroup={t('tools.companions.homebrew')}
        groupBy={(e) => (e.source === 'Homebrew' ? t('tools.companions.homebrew') : (e as CreatureDef).creatureType)}
        onConfirm={(_ids, ents) => addCreatures(ents as CreatureDef[])}
      />
      <EntityEditor
        open={creating}
        onClose={() => setCreating(false)}
        initial={null}
        initialKind="creature"
        existingIds={homebrew.map((e) => e.id)}
        onSave={(e) => {
          // Lagres i Homebrew-biblioteket, så den også kan brukes av andre karakterer og i bestiariet
          saveToLibrary(e)
          addCreatures([e as CreatureDef])
        }}
      />
    </Section>
  )
}

function KindSelect({ value, onChange }: { value: Companion['kind']; onChange: (k: Companion['kind']) => void }) {
  const { t } = useTranslation()
  return (
    <select className="input w-auto py-1 text-xs" value={value} onChange={(e) => onChange(e.target.value as Companion['kind'])} title={t('tools.companions.kind')}>
      {COMPANION_KINDS.map((k) => (
        <option key={k} value={k}>
          {t(`tools.companions.kinds.${k}`)}
        </option>
      ))}
    </select>
  )
}

function CompanionRow({ cp, edit, remove }: { cp: Companion; edit: (fn: (cp: Companion) => void) => void; remove: () => void }) {
  const { t } = useTranslation()
  const { lookup: L } = useChar()
  const openDetail = useUi((s) => s.openDetail)
  const [amt, setAmt] = useState('')
  const n = parseInt(amt, 10)
  const valid = Number.isFinite(n) && n > 0
  const pct = cp.maxHp > 0 ? Math.max(0, Math.min(1, cp.hp / cp.maxHp)) : 0
  const apply = (fn: (cp: Companion) => void): void => {
    if (!valid) return
    edit(fn)
    setAmt('')
  }
  return (
    <div className={`rounded-xl border border-line-soft p-2 ${cp.hp <= 0 ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <input className="input w-36 py-1 font-semibold" value={cp.name} onChange={(e) => edit((x) => void (x.name = e.target.value))} />
        <KindSelect value={cp.kind} onChange={(k) => edit((x) => void (x.kind = k))} />
        <label className="flex items-center gap-1 text-xs text-muted">
          AC <NumberInput value={cp.ac ?? 10} min={0} max={40} width={44} onChange={(v) => edit((x) => void (x.ac = v))} />
        </label>
        {cp.hp <= 0 && <span className="chip py-0 text-[10px] text-bad">{t('tools.companions.down')}</span>}
        <span className="ml-auto flex items-center gap-1">
          {cp.creatureId && (
            <button className="btn btn-ghost btn-sm px-1" title={t('tools.companions.statBlock')} onClick={() => openDetail({ kind: 'creature', id: cp.creatureId!, entity: L.get('creature', cp.creatureId!) })}>
              <Eye size={13} />
            </button>
          )}
          <button className="btn btn-ghost btn-sm px-1" title={t('tools.companions.remove')} onClick={remove}>
            <Trash2 size={12} />
          </button>
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-display text-lg">
          {cp.hp}
          <span className="text-muted">/</span>
          <NumberInput value={cp.maxHp} min={1} max={999} width={52} className="inline-block py-0" onChange={(v) => edit((x) => ((x.maxHp = v), (x.hp = Math.min(x.hp, v))))} />
        </span>
        {cp.temp > 0 && <span className="text-xs text-sky">+{cp.temp} temp</span>}
        <input className="input w-16 px-1 py-1 text-center" placeholder="±" title={t('tools.companions.amountTip')} value={amt} onChange={(e) => setAmt(e.target.value)} />
        <button className="btn btn-sm btn-danger" disabled={!valid} onClick={() => apply((x) => damageCompanion(x, n))}>
          {t('tools.companions.damage')}
        </button>
        <button className="btn btn-sm" disabled={!valid} onClick={() => apply((x) => healCompanion(x, n))}>
          {t('tools.companions.heal')}
        </button>
        <button className="btn btn-sm" disabled={!valid} onClick={() => apply((x) => void (x.temp = Math.max(x.temp, n)))}>
          {t('tools.companions.temp')}
        </button>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-3">
        <motion.div className={`h-full ${pct > 0.5 ? 'bg-good' : pct > 0.25 ? 'bg-gold' : 'bg-bad'}`} animate={{ width: `${pct * 100}%` }} />
      </div>
      <input className="input mt-2 py-1 text-xs" placeholder={t('tools.companions.notes')} value={cp.notes ?? ''} onChange={(e) => edit((x) => void (x.notes = e.target.value))} />
    </div>
  )
}
