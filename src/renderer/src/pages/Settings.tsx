import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Moon, Sun, Globe2 } from 'lucide-react'
import { useSettings } from '../store/settings'
import { Section, Toggle } from '../components/ui'
import { api } from '../lib/api'
import { ATTRIBUTION, DISCLAIMER_PHB, allEntities } from '../data'

export default function SettingsPage() {
  const { t } = useTranslation()
  const s = useSettings()
  const [path, setPath] = useState('')
  useEffect(() => {
    api.dataPath().then(setPath)
  }, [])
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-8 py-8">
      <h1 className="font-display text-3xl text-gold">{t('nav.settings')}</h1>
      <Section title={t('settings.appearance')}>
        <div className="space-y-4">
          <Row label={t('settings.language')}>
            <div className="flex gap-1">
              {(['nb', 'en'] as const).map((l) => (
                <button key={l} className={`btn btn-sm ${s.language === l ? 'btn-primary' : ''}`} onClick={() => s.set({ language: l })}>
                  <Globe2 size={13} /> {l === 'nb' ? 'Norsk' : 'English'}
                </button>
              ))}
            </div>
          </Row>
          <Row label={t('settings.theme')}>
            <div className="flex gap-1">
              <button className={`btn btn-sm ${s.theme === 'dark' ? 'btn-primary' : ''}`} onClick={() => s.set({ theme: 'dark' })}>
                <Moon size={13} /> {t('settings.dark')}
              </button>
              <button className={`btn btn-sm ${s.theme === 'light' ? 'btn-primary' : ''}`} onClick={() => s.set({ theme: 'light' })}>
                <Sun size={13} /> {t('settings.light')}
              </button>
            </div>
          </Row>
          <Row label={t('settings.animations')}>
            <Toggle checked={s.animations} onChange={(v) => s.set({ animations: v })} />
          </Row>
          <Row label={t('settings.diceSound')}>
            <Toggle checked={s.diceSound} onChange={(v) => s.set({ diceSound: v })} />
          </Row>
          <Row label={t('settings.showTips')}>
            <Toggle checked={s.showTips} onChange={(v) => s.set({ showTips: v })} />
          </Row>
        </div>
      </Section>
      <Section title={t('settings.rules')}>
        <div className="space-y-4">
          <Row label={t('settings.hpMethod')}>
            <div className="flex gap-1">
              <button className={`btn btn-sm ${s.hpMethod === 'fixed' ? 'btn-primary' : ''}`} onClick={() => s.set({ hpMethod: 'fixed' })}>
                {t('settings.hpFixed')}
              </button>
              <button className={`btn btn-sm ${s.hpMethod === 'roll' ? 'btn-primary' : ''}`} onClick={() => s.set({ hpMethod: 'roll' })}>
                {t('settings.hpRoll')}
              </button>
            </div>
          </Row>
          <Row label={t('settings.ddb')}>
            <div className="flex gap-1">
              <button className={`btn btn-sm ${s.dndBeyondMode === 'app' ? 'btn-primary' : ''}`} onClick={() => s.set({ dndBeyondMode: 'app' })}>
                {t('settings.ddbApp')}
              </button>
              <button className={`btn btn-sm ${s.dndBeyondMode === 'browser' ? 'btn-primary' : ''}`} onClick={() => s.set({ dndBeyondMode: 'browser' })}>
                {t('settings.ddbBrowser')}
              </button>
            </div>
          </Row>
        </div>
      </Section>
      <Section title={t('settings.storage')}>
        <div className="flex items-center gap-3 text-sm">
          <code className="flex-1 truncate rounded bg-bg-2 px-2 py-1 text-xs text-muted">{path}</code>
          <button className="btn btn-sm" onClick={() => api.openDataFolder()}>
            <FolderOpen size={13} /> {t('settings.openFolder')}
          </button>
        </div>
      </Section>
      <Section title={t('settings.about')}>
        <div className="space-y-2 text-sm text-muted">
          <p>D&D Character Forge 1.2.1 · {t('settings.entries', { n: allEntities.length })}</p>
          <p>{ATTRIBUTION}</p>
          <p>{DISCLAIMER_PHB}</p>
          <p>{t('settings.trademark')}</p>
        </div>
      </Section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      {children}
    </div>
  )
}
