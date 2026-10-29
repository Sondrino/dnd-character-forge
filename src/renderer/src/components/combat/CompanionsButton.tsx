import { useTranslation } from 'react-i18next'
import { PawPrint } from 'lucide-react'
import type { CreatureDef } from '../../types'
import { useCombat, signed } from './useCombat'
import { useRolls } from '../../store/rolls'
import { addLog, initiativeOrder } from '../../lib/combat'
import { companionCombatants } from '../../lib/companions'

/** «Legg companions i initiativ»: lager koblede combatants (HP skrives tilbake til companion på arket) */
export function AddCompanionsButton() {
  const { t } = useTranslation()
  const { char, lookup: L, mut } = useCombat()
  const roll = useRolls((s) => s.roll)
  const inFight = new Set(char.combat?.combatants.map((x) => x.companionUid).filter(Boolean))
  const missing = (char.companions ?? []).filter((cp) => !inFight.has(cp.uid))
  // Vises bare når noen companions ikke er med i kampen ennå (kompakt: ikon + antall)
  if (!missing.length) return null
  return (
    <button
      className="btn btn-sm px-2"
      title={`${t('tools.companions.toInit')} – ${t('tools.companions.toInitTip')}`}
      onClick={() =>
        mut((cc, ch) => {
          const curUid = initiativeOrder(cc.combatants)[cc.turnIdx]?.uid
          const added = companionCombatants(ch, (cp) => {
            const cr = cp.creatureId ? (L.get('creature', cp.creatureId) as CreatureDef | undefined) : undefined
            const dex = Math.floor(((cr?.abilities?.dex ?? 10) - 10) / 2)
            return roll(`1d20${signed(dex)}`, `${cp.name} initiative`).total
          })
          cc.combatants.push(...added)
          const idx = initiativeOrder(cc.combatants).findIndex((x) => x.uid === curUid)
          if (idx >= 0) cc.turnIdx = idx
          if (added.length) addLog(cc, 'info', t('combat.log.joined', { name: added.map((x) => x.name).join(', '), n: added.length }))
        })
      }
    >
      <PawPrint size={13} /> +{missing.length}
    </button>
  )
}
