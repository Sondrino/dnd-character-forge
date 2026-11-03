import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { useCharacter, useUi } from '../store/ui'
import { pendingSkillChoices, type SkillNoticeTarget } from '../lib/skillNotice'
import { CharCtx } from './sheet/context'
import { ChoiceResolver } from './sheet/ChoiceResolver'

/**
 * Varsel i info-boksene: den åpne karakteren har ikke valgt skill proficiencies denne class-en/species-en/featuren gir.
 * Valget kan tas rett i boksen. Rendres bare mens boksen er åpen, siden karakteren beregnes her.
 */
export function SkillChoiceNotice({ entity, className }: { entity: SkillNoticeTarget; className?: string }) {
  const { t } = useTranslation()
  const activeId = useUi((s) => s.activeCharacterId)
  const { char, derived, lookup, update } = useCharacter(activeId ?? undefined)
  const [choosing, setChoosing] = useState(false)
  if (!char || !derived) return null
  const list = pendingSkillChoices(entity, derived)
  if (!list.length) return null
  return (
    <div role="status" data-skill-notice className={`rounded-xl border border-gold/60 bg-gold/10 p-2.5 text-xs ${className ?? ''}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-gold" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gold-2">{t('tools.skillNotice.title')}</div>
          {list.map((p) => (
            <div key={p.key} className="text-muted">
              {t('tools.skillNotice.progress', { label: p.label, chosen: p.chosen, count: p.count })}
            </div>
          ))}
        </div>
        {!choosing && (
          <button className="btn btn-primary btn-sm shrink-0" onClick={() => setChoosing(true)}>
            {t('tools.skillNotice.choose')}
          </button>
        )}
      </div>
      {choosing && (
        <CharCtx.Provider value={{ char, derived, lookup, update }}>
          <div className="mt-2 space-y-2">
            {list.map((p) => (
              <ChoiceResolver key={p.key} p={p} />
            ))}
          </div>
        </CharCtx.Provider>
      )}
    </div>
  )
}
