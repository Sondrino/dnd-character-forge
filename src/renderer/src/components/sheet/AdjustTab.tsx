import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Wand2, SlidersHorizontal } from 'lucide-react'
import type { Character } from '../../types'
import { ABILITIES } from '../../types'
import { abilityNames, skills } from '../../data/skills'
import type { Stat } from '../../engine/compute'
import { useChar } from './context'
import { Section } from '../ui'
import { AdjInput } from '../Stat'

interface Row {
  key: string
  label: string
  /** Endelig verdi (med justering) */
  value: number | string
  /** Automatisk verdi uten egen justering */
  auto: number | string
  signed?: boolean
  /** Kan settes til fast verdi */
  fixable?: boolean
}

const fromStat = (key: string, label: string, s: Stat, adj: number, signed = true): Row => ({
  key, label, value: s.value, auto: s.computed - adj, signed, fixable: true
})

export function AdjustTab() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { char, derived: d, update } = useChar()
  const adj = (k: string): number => char.adjustments?.[k] ?? 0

  const groups: { title: string; rows: Row[] }[] = [
    { title: t('adjust.abilities'), rows: ABILITIES.map((a) => fromStat(`ability.${a}`, abilityNames[a], d.abilities[a].score, adj(`ability.${a}`), false)) },
    { title: t('adjust.saves'), rows: ABILITIES.map((a) => fromStat(`save.${a}`, `${abilityNames[a]} save`, d.saves[a], adj(`save.${a}`))) },
    { title: t('adjust.skills'), rows: skills.map((s) => fromStat(`skill.${s.id}`, s.name, d.skills[s.id], adj(`skill.${s.id}`))) },
    {
      title: t('adjust.combat'),
      rows: [
        fromStat('ac', 'Armor Class', d.ac, adj('ac'), false),
        fromStat('hp.max', 'Hit Point Maximum', d.hpMax, adj('hp.max'), false),
        fromStat('initiative', 'Initiative', d.initiative, adj('initiative')),
        fromStat('speed', 'Speed (ft.)', d.speed, adj('speed'), false),
        fromStat('pb', 'Proficiency Bonus', d.pb, adj('pb')),
        fromStat('passive.perception', 'Passive Perception', d.passive.perception, adj('passive.perception'), false),
        fromStat('passive.insight', 'Passive Insight', d.passive.insight, adj('passive.insight'), false),
        fromStat('passive.investigation', 'Passive Investigation', d.passive.investigation, adj('passive.investigation'), false),
        { key: 'weaponMastery', label: t('adjust.masteryCount'), value: d.weaponMasteryMax, auto: d.weaponMasteryMax - adj('weaponMastery'), fixable: true }
      ]
    },
    {
      title: t('adjust.spellcasting'),
      rows: [
        ...d.spellcasting.flatMap((sc) => [
          fromStat(`spell.dc.${sc.classId}`, `${sc.className} Spell Save DC`, sc.dc, adj(`spell.dc.${sc.classId}`), false),
          fromStat(`spell.attack.${sc.classId}`, `${sc.className} Spell Attack`, sc.attack, adj(`spell.attack.${sc.classId}`))
        ]),
        ...Array.from({ length: 9 }, (_, i) => i + 1)
          .filter((lvl) => d.slots.some((s) => s.level === lvl) || adj(`slots.${lvl}`) || d.slots.length >= lvl - 1)
          .map((lvl) => {
            const s = d.slots.find((x) => x.level === lvl)
            const v = s?.max ?? 0
            return { key: `slots.${lvl}`, label: t('adjust.slots', { n: lvl }), value: v, auto: Math.max(0, v - adj(`slots.${lvl}`)), fixable: true }
          })
      ]
    },
    {
      title: t('adjust.attacks'),
      rows: d.attacks
        .filter((a) => a.kind !== 'spell' && a.bonus)
        .flatMap((a) => {
          const bk = a.kind === 'unarmed' ? 'attack.unarmed.bonus' : `attack.${a.key}.bonus`
          const rows: Row[] = [fromStat(bk, `${a.name}: ${t('adjust.attackBonus')}`, a.bonus!, adj(bk))]
          if (a.kind === 'weapon') rows.push({ key: `attack.${a.key}.damage`, label: `${a.name}: ${t('adjust.damageBonus')}`, value: a.damage, auto: '', signed: true })
          return rows
        })
    }
  ]

  const anyCustom = Object.keys(char.adjustments ?? {}).length + Object.keys(char.overrides ?? {}).length
  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <SlidersHorizontal className="text-arcane" size={20} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-gold">{t('adjust.title')}</div>
          <p className="text-sm text-muted">{t('adjust.intro')}</p>
        </div>
        <button className="btn" onClick={() => nav(`/character/${char.id}/build?step=abilities`)}>
          <Wand2 size={14} /> {t('adjust.baseScores')}
        </button>
        {anyCustom > 0 && (
          <button
            className="btn btn-danger"
            onClick={() =>
              update((c) => {
                c.adjustments = {}
                c.overrides = {}
              })
            }
          >
            <RotateCcw size={14} /> {t('adjust.resetAll')}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {groups
          .filter((g) => g.rows.length)
          .map((g) => (
            <Section key={g.title} title={g.title}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-muted">
                    <th className="pb-1 font-semibold" />
                    <th className="pb-1 text-center font-semibold">{t('adjust.auto')}</th>
                    <th className="pb-1 text-center font-semibold">{t('adjust.adjustment')}</th>
                    <th className="pb-1 text-center font-semibold">{t('adjust.fixed')}</th>
                    <th className="pb-1 text-center font-semibold">{t('adjust.result')}</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <AdjustRow key={r.key} row={r} char={char} update={update} />
                  ))}
                </tbody>
              </table>
            </Section>
          ))}
      </div>
    </div>
  )
}

function AdjustRow({ row: r, char, update }: { row: Row; char: Character; update: (f: (d: Character) => void) => void }) {
  const a = char.adjustments?.[r.key] ?? 0
  const o = char.overrides?.[r.key]
  const [fixed, setFixed] = useState(typeof o === 'number' ? String(o) : '')
  useEffect(() => setFixed(typeof o === 'number' ? String(o) : ''), [o])
  const fmt = (v: number | string): string => (typeof v === 'number' && r.signed && v >= 0 ? `+${v}` : String(v))
  const custom = a !== 0 || typeof o === 'number'
  const commitFixed = (): void =>
    update((d) => {
      const n = parseInt(fixed, 10)
      if (fixed.trim() === '' || !Number.isFinite(n)) delete d.overrides[r.key]
      else d.overrides[r.key] = n
    })
  return (
    <tr className={`border-t border-line-soft ${custom ? 'bg-arcane/5' : ''}`}>
      <td className="py-1 pr-2">{r.label}</td>
      <td className="py-1 text-center text-muted">{r.auto === '' ? '' : fmt(r.auto)}</td>
      <td className="py-1 text-center">
        <AdjInput
          value={a}
          className="h-7 w-14 text-[13px]"
          onChange={(v) =>
            update((d) => {
              d.adjustments ??= {}
              if (!v) delete d.adjustments[r.key]
              else d.adjustments[r.key] = v
            })
          }
        />
      </td>
      <td className="py-1 text-center">
        {r.fixable ? (
          <input
            className={`input h-7 w-14 px-1 py-0 text-center text-[13px] ${typeof o === 'number' ? 'border-gold text-gold-2' : ''}`}
            placeholder="—"
            value={fixed}
            onChange={(e) => setFixed(e.target.value)}
            onBlur={commitFixed}
            onKeyDown={(e) => e.key === 'Enter' && commitFixed()}
          />
        ) : null}
      </td>
      <td className={`py-1 text-center font-display ${custom ? 'text-arcane' : ''}`}>{fmt(r.value)}</td>
    </tr>
  )
}
