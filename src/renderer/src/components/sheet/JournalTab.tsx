import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp, BookOpenText, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { JournalEntry } from '../../types'
import { useChar } from './context'
import { Markdown, Modal, NumberInput, Section } from '../ui'
import { LevelUpModal } from './LevelUp'
import { useUi } from '../../store/ui'
import { awardXp, journalEntry, journalXpTotal, levelsAvailable, nextLevelXp, sortedJournal, todayIso, xpForLevel } from '../../lib/xp'

/** Dagbok-fanen: sesjonsnotater og XP. Når XP-en holder til neste level, vises en knapp som åpner level up. */
export function JournalTab() {
  const { t } = useTranslation()
  const { char, derived: d, update } = useChar()
  const notify = useUi((s) => s.notify)
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [draft, setDraft] = useState<JournalEntry | null>(null)
  const [del, setDel] = useState<JournalEntry | null>(null)
  const [levelUp, setLevelUp] = useState(false)

  const level = d.totalLevel
  const next = nextLevelXp(level)
  const prev = xpForLevel(level)
  const pct = next ? Math.min(1, Math.max(0, (char.xp - prev) / (next - prev))) : 1
  const avail = char.classes.length ? Math.min(20 - level, levelsAvailable(char.xp, level)) : 0
  const list = sortedJournal(char.journal)

  const saveDraft = (): void => {
    if (!draft) return
    const e = journalEntry({ ...draft, title: draft.title || t('tools.journal.untitled') })
    update((c) => {
      const j = c.journal ?? []
      const i = j.findIndex((x) => x.id === e.id)
      // XP på en oppføring endres bare via «Gi XP» – behold den ved redigering
      if (i >= 0) j[i] = { ...e, xp: j[i].xp }
      else j.unshift({ ...e, xp: undefined })
      c.journal = j
    })
    setDraft(null)
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-4">
        <Section
          title={
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} /> {t('tools.journal.awardTitle')}
            </span>
          }
        >
          <div className="font-display text-2xl text-gold">{t('tools.journal.xpNow', { xp: char.xp.toLocaleString() })}</div>
          <div className="text-xs text-muted">{next ? t('tools.journal.nextAt', { n: next.toLocaleString() }) : t('tools.journal.max')}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-3">
            <motion.div className="h-full bg-gold" animate={{ width: `${pct * 100}%` }} />
          </div>
          <AnimatePresence>
            {avail > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-3 rounded-xl border border-gold bg-gold/10 p-3">
                <div className="mb-2 text-sm text-gold-2">{avail > 1 ? t('tools.journal.canLevelMore', { n: avail }) : t('tools.journal.canLevel', { n: level + 1 })}</div>
                <button className="btn btn-primary glow w-full justify-center" onClick={() => setLevelUp(true)}>
                  <ArrowUp size={15} /> {t('tools.journal.levelUp')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (amount <= 0) return
              const title = reason.trim() || t('tools.journal.defaultAward')
              update((c) => void awardXp(c, amount, title))
              notify(t('tools.journal.awarded', { n: amount }), 'good')
              setAmount(0)
              setReason('')
            }}
          >
            <div className="flex items-center gap-2">
              <label className="label m-0">{t('tools.journal.amount')}</label>
              <NumberInput value={amount} min={0} max={1000000} width={110} onChange={setAmount} />
              <div className="flex flex-wrap gap-1">
                {[50, 100, 250, 500].map((n) => (
                  <button key={n} type="button" className="chip cursor-pointer hover:border-gold hover:text-gold" onClick={() => setAmount(amount + n)}>
                    +{n}
                  </button>
                ))}
              </div>
            </div>
            <input className="input" placeholder={t('tools.journal.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
            <button className="btn btn-primary w-full justify-center" type="submit" disabled={amount <= 0}>
              <Sparkles size={14} /> {t('tools.journal.award')}
            </button>
          </form>
          {journalXpTotal(char.journal) > 0 && <p className="mt-2 text-[11px] text-faint">{t('tools.journal.fromJournal', { n: journalXpTotal(char.journal).toLocaleString() })}</p>}
        </Section>
      </div>

      <div className="col-span-12 space-y-4 lg:col-span-8">
        <Section
          title={
            <span className="flex items-center gap-1.5">
              <BookOpenText size={13} /> {t('tools.journal.title')}
            </span>
          }
          actions={
            <button className="btn btn-sm" onClick={() => setDraft(journalEntry({ title: '', date: todayIso() }))}>
              <Plus size={12} /> {t('tools.journal.new')}
            </button>
          }
        >
          {draft && (
            <div className="mb-4 space-y-2 rounded-xl border border-gold/40 bg-gold/5 p-3">
              <div className="flex gap-2">
                <input type="date" className="input w-44" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} title={t('tools.journal.date')} />
                <input className="input flex-1" placeholder={t('tools.journal.entryTitle')} value={draft.title} autoFocus onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <textarea className="input font-serif text-[15px]" rows={8} placeholder={t('tools.journal.text')} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
              <div className="flex justify-end gap-2">
                <button className="btn btn-sm" onClick={() => setDraft(null)}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn-primary btn-sm" onClick={saveDraft}>
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}
          {list.length === 0 && !draft && <p className="text-sm text-muted">{t('tools.journal.empty')}</p>}
          <div className="space-y-3">
            {list.map((e) => (
              <motion.article layout key={e.id} className="rounded-xl border border-line-soft p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{e.date}</span>
                  <span className="font-display text-lg text-gold">{e.title || t('tools.journal.untitled')}</span>
                  {e.xp ? <span className="chip py-0 text-[11px] text-gold-2">+{e.xp.toLocaleString()} XP</span> : null}
                  <span className="ml-auto flex gap-1">
                    <button className="btn btn-ghost btn-sm px-1" title={t('tools.journal.edit')} onClick={() => setDraft({ ...e })}>
                      <Pencil size={12} />
                    </button>
                    <button className="btn btn-ghost btn-sm px-1" title={t('common.delete')} onClick={() => setDel(e)}>
                      <Trash2 size={12} />
                    </button>
                  </span>
                </div>
                {e.text && (
                  <div className="mt-1 font-serif text-[15px]">
                    <Markdown text={e.text} compact />
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </Section>
      </div>

      <LevelUpModal open={levelUp} onClose={() => setLevelUp(false)} />
      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title={t('tools.journal.deleteTitle')}
        width={460}
        footer={
          <>
            <button className="btn" onClick={() => setDel(null)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                const id = del?.id
                update((c) => void (c.journal = (c.journal ?? []).filter((x) => x.id !== id)))
                setDel(null)
              }}
            >
              <Trash2 size={13} /> {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-sm">{t('tools.journal.deleteText', { title: del?.title || t('tools.journal.untitled') })}</p>
      </Modal>
    </div>
  )
}
