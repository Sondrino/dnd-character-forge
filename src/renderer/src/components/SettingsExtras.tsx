import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'lucide-react'
import { clampUiScale, useSettings } from '../store/settings'
import { Section } from './ui'

/** UI-skala (0.8–1.4). Brukes når glidebryteren slippes, så den ikke flytter seg under musepekeren. */
export function UiScaleRow() {
  const { t } = useTranslation()
  const saved = useSettings((s) => clampUiScale(s.uiScale))
  const set = useSettings((s) => s.set)
  const [v, setV] = useState(saved)
  useEffect(() => setV(saved), [saved])
  const commit = (): void => {
    if (v !== saved) set({ uiScale: clampUiScale(v) })
  }
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{t('tools.settings.uiScale')}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0.8}
          max={1.4}
          step={0.05}
          value={v}
          className="w-44 accent-[var(--gold)]"
          onChange={(e) => setV(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
        <span className="w-12 text-right font-display">{Math.round(v * 100)}%</span>
        {saved !== 1 && (
          <button className="btn btn-sm" onClick={() => set({ uiScale: 1 })}>
            {t('tools.settings.uiScaleReset')}
          </button>
        )}
      </div>
    </div>
  )
}

const KEYS: { keys: string; id: string }[] = [
  { keys: 'Ctrl + K', id: 'palette' },
  { keys: 'D', id: 'dice' },
  { keys: '1 – 8', id: 'tabs' },
  { keys: 'N', id: 'next' },
  { keys: 'Esc', id: 'esc' },
  { keys: 'Ctrl + Z / Ctrl + Y', id: 'undo' }
]

export function HotkeysSection() {
  const { t } = useTranslation()
  return (
    <Section
      title={
        <span className="flex items-center gap-1.5">
          <Keyboard size={13} /> {t('tools.settings.hotkeys')}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {KEYS.map((k) => (
          <div key={k.id} className="flex items-center justify-between gap-3">
            <span className="text-muted">{t(`tools.settings.keys.${k.id}`)}</span>
            <kbd className="rounded border border-line bg-bg-2 px-1.5 py-0.5 text-[11px]">{k.keys}</kbd>
          </div>
        ))}
      </div>
    </Section>
  )
}
