import type React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useChar } from './context'
import { NumberInput, Section } from '../ui'
import { ALIGNMENTS, XP_TABLE } from '../../data/skills'
import { api } from '../../lib/api'
import type { Character } from '../../types'
import { ClassEmblem } from '../ClassEmblem'
import { FaithPanel } from '../Faith'

type DetailKey = keyof Character['details']

export function DetailsTab() {
  const { t } = useTranslation()
  const { char, derived: d, lookup, update } = useChar()
  const field = (k: DetailKey, rows = 0): React.ReactElement => (
    <div key={k}>
      <label className="label">{t(`details.${k}`)}</label>
      {rows ? (
        <textarea className="input font-serif text-[15px]" rows={rows} value={char.details[k]} onChange={(e) => update((c) => void (c.details[k] = e.target.value))} />
      ) : (
        <input className="input" value={char.details[k]} onChange={(e) => update((c) => void (c.details[k] = e.target.value))} />
      )}
    </div>
  )
  const next = XP_TABLE[d.totalLevel] ?? null
  const prev = XP_TABLE[d.totalLevel - 1] ?? 0
  const pct = next ? Math.min(1, Math.max(0, (char.xp - prev) / (next - prev))) : 1
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-4">
        <Section title={t('details.portrait')}>
          <motion.div whileHover={{ scale: 1.01 }} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line-soft bg-panel-2">
            {char.portrait ? <img src={char.portrait} className="h-full w-full object-cover" /> : <ClassEmblem classId={char.classes[0]?.classId} size={90} />}
          </motion.div>
          <div className="mt-2 flex gap-2">
            <button
              className="btn btn-sm flex-1 justify-center"
              onClick={async () => {
                const img = await api.pickImage()
                if (img) update((c) => void (c.portrait = img))
              }}
            >
              <ImagePlus size={13} /> {t('details.upload')}
            </button>
            {char.portrait && (
              <button className="btn btn-sm btn-danger" onClick={() => update((c) => void (c.portrait = undefined))}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </Section>
        <FaithPanel char={char} L={lookup} update={update} />
        <Section title={t('details.basics')}>
          <div className="space-y-3">
            <div>
              <label className="label">{t('details.name')}</label>
              <input className="input font-display text-lg" value={char.name} onChange={(e) => update((c) => void (c.name = e.target.value))} />
            </div>
            <div>
              <label className="label">{t('details.player')}</label>
              <input className="input" value={char.playerName} onChange={(e) => update((c) => void (c.playerName = e.target.value))} />
            </div>
            <div>
              <label className="label">{t('details.alignment')}</label>
              <select className="input" value={char.alignment} onChange={(e) => update((c) => void (c.alignment = e.target.value))}>
                <option value="">—</option>
                {ALIGNMENTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">XP</label>
              <div className="flex items-center gap-2">
                <NumberInput value={char.xp} min={0} width={110} onChange={(v) => update((c) => void (c.xp = v))} />
                <span className="text-xs text-muted">{next ? t('details.nextLevel', { n: next }) : t('details.maxLevel')}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-3">
                <motion.div className="h-full bg-gold" animate={{ width: `${pct * 100}%` }} />
              </div>
              {next && char.xp >= next && <div className="mt-1 text-xs text-gold-2">{t('details.canLevel')}</div>}
            </div>
          </div>
        </Section>
      </div>
      <div className="col-span-12 space-y-4 lg:col-span-8">
        <Section title={t('details.appearance')}>
          <div className="grid grid-cols-4 gap-3">{(['gender', 'age', 'height', 'weight', 'eyes', 'hair', 'skin', 'faith'] as DetailKey[]).map((k) => field(k))}</div>
          <div className="mt-3">{field('appearance', 3)}</div>
        </Section>
        <Section title={t('details.personalitySection')}>
          <div className="grid grid-cols-2 gap-3">{(['personality', 'ideals', 'bonds', 'flaws'] as DetailKey[]).map((k) => field(k, 3))}</div>
        </Section>
        <Section title={t('details.story')}>
          <div className="space-y-3">
            {field('backstory', 8)}
            {field('allies', 3)}
            {field('notes', 5)}
          </div>
        </Section>
      </div>
    </div>
  )
}
