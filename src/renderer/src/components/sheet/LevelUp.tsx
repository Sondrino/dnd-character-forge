import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import { ArrowUp, ArrowDown, Dices, Check, AlertTriangle, Undo2 } from 'lucide-react'
import { Modal } from '../ui'
import { useChar } from './context'
import { averageHitDie } from '../../engine/tables'
import { useRolls } from '../../store/rolls'
import { useSettings } from '../../store/settings'
import { ChoiceResolver } from './ChoiceResolver'
import { ClassEmblem } from '../ClassEmblem'
import { abilityNames } from '../../data/skills'
import { EntityLink } from '../EntityInfo'
import type { ClassDef } from '../../types'
import { levelDown, previewLevelDown } from '../../lib/levels'
import { meetsMulticlass } from '../../lib/rules'
import { useUi } from '../../store/ui'

export function LevelUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, update } = useChar()
  const roll = useRolls((s) => s.roll)
  const animations = useSettings((s) => s.animations)
  const defaultHp = useSettings((s) => s.hpMethod)
  const [step, setStep] = useState<'class' | 'hp' | 'done'>('class')
  const [classId, setClassId] = useState<string>('')
  const [hpRoll, setHpRoll] = useState<number | null>(null)
  const [method, setMethod] = useState<'fixed' | 'roll'>(defaultHp)

  useEffect(() => {
    if (open) {
      setStep('class')
      setClassId(char.classes[0]?.classId ?? '')
      setHpRoll(null)
      setMethod(char.settings.hpMethod ?? defaultHp)
    }
  }, [open])

  const cls = L.get('class', classId)
  const entry = char.classes.find((c) => c.classId === classId)
  const newLevel = (entry?.level ?? 0) + 1
  const row = cls?.table.find((r) => r.level === newLevel)
  const sub = L.get('subclass', entry?.subclassId)
  const subFeatures = sub?.features.filter((f) => f.level === newLevel) ?? []
  const conMod = d.abilities.con.mod
  const hpGain = Math.max(1, (method === 'roll' && hpRoll !== null ? hpRoll : averageHitDie(cls?.hitDie ?? 8)) + conMod)
  const allClasses = L.all('class').sort((a, b) => a.name.localeCompare(b.name))
  // Fighter: STR eller DEX; Monk, Paladin og Ranger: begge sine (PHB 2024)
  const meetsPrereq = (c: ClassDef): boolean => meetsMulticlass(c, d)
  const currentMeet = char.classes.every((ce) => {
    const c = L.get('class', ce.classId)
    return !c || meetsPrereq(c)
  })

  const confirm = (): void => {
    update((c) => {
      const e = c.classes.find((x) => x.classId === classId)
      const val = method === 'roll' ? hpRoll : null
      if (e) {
        e.level += 1
        e.hpRolls[e.level - 1] = val
      } else {
        c.classes.push({ classId, level: 1, hpRolls: [val] })
      }
      c.hp.current += hpGain
    })
    setStep('done')
    if (animations) {
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ['#f0cd7a', '#d6a84c', '#c0392b', '#8b7cf0'] })
    }
  }

  const pending = d.pending.filter((p) => ['class', 'feats', 'skills'].includes(p.area))

  return (
    <Modal open={open} onClose={onClose} width={760} dismissable={step === 'done'} confirmClose={step === 'hp' && t('polish.modal.levelUpConfirm')} title={<span className="flex items-center gap-2"><ArrowUp size={18} /> {t('level.title')}</span>}>
      <AnimatePresence mode="wait">
        {step === 'class' && (
          <motion.div key="class" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <p className="mb-3 text-muted">{t('level.chooseClass', { n: d.totalLevel + 1 })}</p>
            {d.totalLevel >= 20 && <div className="mb-3 text-bad">{t('level.max')}</div>}
            <div className="grid grid-cols-3 gap-2">
              {allClasses.map((c) => {
                const has = char.classes.find((x) => x.classId === c.id)
                const ok = has || (meetsPrereq(c) && currentMeet)
                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setClassId(c.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left ${classId === c.id ? 'border-gold bg-gold/10' : 'border-line-soft bg-panel-2'} ${!has ? 'opacity-90' : ''}`}
                  >
                    <ClassEmblem classId={c.id} size={20} />
                    <div className="min-w-0">
                      <div className="font-display text-sm text-gold">{c.name}</div>
                      <div className="text-[11px] text-muted">
                        {has ? t('level.current', { n: has.level }) : t('level.multiclass')}
                        {!has && !ok && <AlertTriangle size={11} className="ml-1 inline text-bad" />}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
            {cls && !entry && (
              <div className={`mt-3 rounded-xl border p-3 text-sm ${meetsPrereq(cls) && currentMeet ? 'border-line-soft' : 'border-bad/40 bg-bad/5'}`}>
                <b>{t('level.prereq')}:</b> {cls.multiclass?.prerequisite || cls.primaryAbility.map((a) => `${abilityNames[a]} 13`).join(' or ')}
                {!(meetsPrereq(cls) && currentMeet) && <div className="mt-1 text-bad">{t('level.prereqFail')}</div>}
                <div className="mt-1 text-muted">{cls.multiclass?.proficiencies}</div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button className="btn btn-primary" disabled={!cls || d.totalLevel >= 20} onClick={() => setStep('hp')}>
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'hp' && cls && (
          <motion.div key="hp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <ClassEmblem classId={cls.id} size={30} />
              <div>
                <div className="font-display text-xl text-gold">
                  {cls.name} {newLevel}
                </div>
                <div className="text-sm text-muted">{t('level.totalAfter', { n: d.totalLevel + 1 })}</div>
              </div>
            </div>
            <div className="rounded-xl border border-line-soft p-4">
              <div className="panel-title mb-2">{t('level.hp')}</div>
              <div className="flex flex-wrap items-center gap-2">
                <button className={`btn btn-sm ${method === 'fixed' ? 'btn-primary' : ''}`} onClick={() => setMethod('fixed')}>
                  {t('level.fixed', { n: averageHitDie(cls.hitDie) })}
                </button>
                <button
                  className={`btn btn-sm ${method === 'roll' ? 'btn-primary' : ''}`}
                  onClick={() => {
                    setMethod('roll')
                    const r = roll(`1d${cls.hitDie}`, `${cls.name} ${newLevel} HP`, { character: char.name })
                    setTimeout(() => setHpRoll(r.total), animations ? 650 : 0)
                  }}
                >
                  <Dices size={13} /> {t('level.roll', { die: cls.hitDie })}
                </button>
                <span className="text-sm text-muted">{t('level.manual')}</span>
                <input className="input w-16 py-1 text-center" type="number" min={1} max={cls.hitDie} value={hpRoll ?? ''} onChange={(e) => (setMethod('roll'), setHpRoll(Math.max(1, Math.min(cls.hitDie, Number(e.target.value)))))} />
                <motion.span key={hpGain} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-auto font-display text-2xl text-good">
                  +{hpGain} HP
                </motion.span>
              </div>
              <div className="mt-1 text-xs text-muted">{t('level.conNote', { n: conMod >= 0 ? `+${conMod}` : conMod })}</div>
            </div>
            <div className="rounded-xl border border-line-soft p-4">
              <div className="panel-title mb-2">{t('level.newFeatures')}</div>
              <ul className="space-y-1 text-sm">
                {(row?.features ?? []).map((f) => {
                  const feat = cls.features.find((x) => x.name.toLowerCase() === f.toLowerCase().replace(/ \(.*\)$/, '') && (x.level ?? 1) <= newLevel)
                  return (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 text-good" />
                      <span>
                        {feat ? <EntityLink kind="feature" id={feat.id} entity={{ ...feat, kind: 'feature', source: cls.source } as never}>{f}</EntityLink> : f}
                        {feat && <span className="text-muted"> – {feat.summary}</span>}
                      </span>
                    </li>
                  )
                })}
                {subFeatures.map((f) => (
                  <li key={f.id} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 text-arcane" />
                    <span>
                      <b>{f.name}</b> <span className="text-muted">({sub?.name}) – {f.summary}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {row && Object.keys(row.columns).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {Object.entries(row.columns).map(([k, v]) => (
                    <span key={k} className="chip">
                      {k}: <b className="text-ink">{String(v)}</b>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button className="btn" onClick={() => setStep('class')}>
                {t('common.back')}
              </button>
              <button className="btn btn-primary" disabled={method === 'roll' && hpRoll === null} onClick={confirm}>
                <ArrowUp size={14} /> {t('level.confirm')}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="text-center">
              <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-gold-2 to-gold font-display text-3xl font-bold text-[#1d1408] shadow-xl">
                {d.totalLevel}
              </motion.div>
              <div className="font-display text-2xl text-gold">{t('level.congrats')}</div>
              <div className="text-muted">{d.classLabel}</div>
            </div>
            {pending.length > 0 && (
              <div className="space-y-2">
                <div className="panel-title">{t('level.newChoices')}</div>
                {pending.map((p) => (
                  <ChoiceResolver key={p.key} p={p} />
                ))}
              </div>
            )}
            {d.pending.some((p) => p.area === 'spells') && <div className="text-sm text-muted">{t('level.spellsHint')}</div>}
            <div className="flex justify-between">
              <button
                className="btn"
                onClick={() => {
                  update((c) => levelDown(c, classId, L))
                  onClose()
                }}
              >
                <Undo2 size={14} /> {t('level.undo')}
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                {t('common.done')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/* Level down – angre en level up                                      */
/* ------------------------------------------------------------------ */

export function LevelDownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, update } = useChar()
  const notify = useUi((s) => s.notify)
  const [classId, setClassId] = useState('')
  useEffect(() => {
    if (open) {
      // Standard: classen som sist fikk et level (siste i lista med høyest nivå)
      const last = [...char.classes].reverse()[0]
      setClassId(last?.classId ?? '')
    }
  }, [open])
  const preview = classId ? previewLevelDown(char, classId, L, d.abilities.con.mod) : null
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={560}
      title={
        <span className="flex items-center gap-2">
          <ArrowDown size={18} /> {t('level.downTitle')}
        </span>
      }
      footer={
        <>
          <button className="btn" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-danger"
            disabled={!preview}
            onClick={() => {
              update((c) => levelDown(c, classId, L))
              notify(t('level.downDone'), 'info')
              onClose()
            }}
          >
            <ArrowDown size={14} /> {t('level.downConfirm')}
          </button>
        </>
      }
    >
      {d.totalLevel <= 1 ? (
        <p className="text-muted">{t('level.downMin')}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">{t('level.downIntro')}</p>
          <div className="flex flex-wrap gap-2">
            {char.classes.map((ce) => {
              const c = L.get('class', ce.classId)
              return (
                <button key={ce.classId} onClick={() => setClassId(ce.classId)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${classId === ce.classId ? 'border-gold bg-gold/10' : 'border-line-soft'}`}>
                  <ClassEmblem classId={ce.classId} size={16} />
                  <span className="font-display text-gold">
                    {c?.name} {ce.level}
                  </span>
                </button>
              )
            })}
          </div>
          {preview && (
            <div className="space-y-1.5 rounded-xl border border-bad/30 bg-bad/5 p-3 text-sm">
              <div>
                <b>
                  {preview.className} {preview.fromLevel} → {preview.toLevel}
                </b>
              </div>
              <div>− {preview.hpLost} HP</div>
              {preview.removedFeatures.length > 0 && <div>{t('level.downFeatures')}: {preview.removedFeatures.join(', ')}</div>}
              {preview.removedFeats.length > 0 && <div>{t('level.downFeats')}: {preview.removedFeats.join(', ')}</div>}
              {preview.removesSubclass && <div>{t('level.downSubclass', { name: preview.removesSubclass })}</div>}
              {preview.removesClass && <div>{t('level.downClass')}</div>}
              <div className="text-xs text-muted">{t('level.downNote')}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
