import { useTranslation } from 'react-i18next'
import { ArrowDownUp } from 'lucide-react'
import { useSettings } from '../store/settings'

/** Husket sorteringsvalg per liste (nøkkel f.eks. 'compendium:spell') */
export function useSortChoice(key: string, fallback: string): [string, (v: string) => void] {
  const v = useSettings((s) => s.sorts?.[key])
  const set = useSettings((s) => s.set)
  return [v ?? fallback, (id: string) => set({ sorts: { ...useSettings.getState().sorts, [key]: id } })]
}

export function SortSelect({ options, value, onChange, className = '' }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void; className?: string }) {
  const { t } = useTranslation()
  return (
    <label className={`relative flex items-center ${className}`} title={t('sort.title')}>
      <ArrowDownUp size={13} className="pointer-events-none absolute left-2.5 text-faint" />
      <select className="input py-1.5 pl-7 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {t(`sort.${o.label}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
