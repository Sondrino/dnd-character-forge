import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, Plus, X } from 'lucide-react'
import type { RollMode } from '../dice'
import { useRolls } from '../store/rolls'
import { useSettings } from '../store/settings'
import { MAX_MACROS, cleanMacro, macroError } from '../lib/macros'

/** Egne terningmakroer i terningbrettet (lagres globalt i innstillingene) */
export function DiceMacros() {
  const { t } = useTranslation()
  const macros = useSettings((s) => s.macros ?? [])
  const set = useSettings((s) => s.set)
  const roll = useRolls((s) => s.roll)
  const [form, setForm] = useState<{ label: string; notation: string; mode: RollMode } | null>(null)
  const err = form ? macroError(form) : null
  const touched = !!form && (!!form.label || !!form.notation)

  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        <Bookmark size={11} /> {t('tools.macros.title')}
        {!form && macros.length < MAX_MACROS && (
          <button className="btn btn-ghost btn-sm ml-auto px-1 py-0 text-[10px] normal-case tracking-normal" onClick={() => setForm({ label: '', notation: '', mode: 'normal' })}>
            <Plus size={11} /> {t('tools.macros.add')}
          </button>
        )}
      </div>
      {macros.length === 0 && !form && <div className="text-[11px] text-faint">{t('tools.macros.none')}</div>}
      <div className="flex flex-wrap gap-1">
        {macros.map((m, i) => (
          <span key={`${m.label}-${i}`} className="group inline-flex items-center">
            <button
              className={`chip cursor-pointer rounded-r-none hover:border-gold hover:text-gold ${m.mode === 'advantage' ? 'text-good' : m.mode === 'disadvantage' ? 'text-bad' : ''}`}
              title={`${m.notation}${m.mode && m.mode !== 'normal' ? ` (${m.mode})` : ''}`}
              onClick={() => roll(m.notation, m.label, { mode: m.mode ?? 'normal' })}
            >
              {m.label}
            </button>
            <button className="chip cursor-pointer rounded-l-none border-l-0 px-1 text-faint hover:text-bad" title={t('tools.macros.remove')} onClick={() => set({ macros: macros.filter((_, j) => j !== i) })}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      {form && (
        <form
          className="mt-2 space-y-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            const m = cleanMacro(form)
            if (!m) return
            set({ macros: [...macros, m].slice(0, MAX_MACROS) })
            setForm(null)
          }}
        >
          <div className="flex gap-1.5">
            <input className="input w-32 py-1 text-sm" autoFocus placeholder={t('tools.macros.label')} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input
              className={`input flex-1 py-1 text-sm ${touched && err === 'notation' ? 'border-bad' : ''}`}
              placeholder={t('tools.macros.notation')}
              value={form.notation}
              onChange={(e) => setForm({ ...form, notation: e.target.value })}
            />
            <select className="input w-auto py-1 text-xs" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as RollMode })}>
              <option value="normal">Normal</option>
              <option value="advantage">ADV</option>
              <option value="disadvantage">DIS</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            {touched && err && <span className="text-[11px] text-bad">{err === 'label' ? t('tools.macros.badLabel') : t('tools.macros.badNotation')}</span>}
            <button type="button" className="btn btn-sm ml-auto" onClick={() => setForm(null)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!!err}>
              {t('tools.macros.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
