import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PawPrint, Undo2, Eye, X, Swords, Shield, Heart, Footprints } from 'lucide-react'
import type { CreatureDef } from '../../types'
import { useChar } from './context'
import { Markdown, Section } from '../ui'
import { EntityPicker } from '../EntityPicker'
import { useUi } from '../../store/ui'
import { useRolls } from '../../store/rolls'
import {
  WILD_SHAPE_STATE, crLabel, creatureHp, druidLevel, enterWildShape, isEligibleForm, isMoonDruid, parseCreatureAttacks,
  revertWildShape, wildShapeLimits, wildShapeTempHp
} from '../../lib/wildShape'

/** Wild Shape-panel på arket (Druid level 2+): kjente former, bruk, aktiv form med AC/HP/speed/angrep og stat block */
export function WildShapePanel() {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, update } = useChar()
  const openDetail = useUi((s) => s.openDetail)
  const notify = useUi((s) => s.notify)
  const roll = useRolls((s) => s.roll)
  const [picker, setPicker] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const level = druidLevel(char)
  const moon = isMoonDruid(char)
  const limits = wildShapeLimits(level, moon)
  if (!limits) return null

  const feature = d.features.find((f) => f.id === 'druid-wild-shape')
  const uses = feature?.uses ? { key: feature.key, max: feature.uses.max, used: feature.uses.used } : undefined
  const left = uses ? uses.max - uses.used : 0
  const known = (char.wildShape?.knownForms ?? []).map((id) => L.get('creature', id)).filter((c): c is CreatureDef => !!c)
  const active = char.wildShape?.activeForm ? L.get('creature', char.wildShape.activeForm) : undefined
  const shaped = !!active && char.activeStates.includes(WILD_SHAPE_STATE)
  const temp = wildShapeTempHp(level, moon)
  const moonAc = 13 + d.abilities.wis.mod

  const shape = (cr: CreatureDef): void => {
    let ok = false
    update((c) => void (ok = enterWildShape(c, cr.id, uses, temp)))
    if (ok) notify(t('tools.wildShape.entered', { name: cr.name, n: temp }), 'good')
    else notify(t('tools.wildShape.noUses'), 'bad')
  }

  return (
    <Section
      title={
        <span className="flex items-center gap-1.5">
          <PawPrint size={13} /> {t('tools.wildShape.title')}
        </span>
      }
      actions={
        <>
          {uses && (
            <span className="mr-1 text-xs text-muted" title={t('tools.wildShape.uses')}>
              {left}/{uses.max}
            </span>
          )}
          <button className="btn btn-sm" onClick={() => setPicker(true)}>
            {t('tools.wildShape.pick')}
          </button>
        </>
      }
    >
      <div className="mb-2 flex flex-wrap gap-x-3 text-xs text-muted">
        <span>{t('tools.wildShape.known', { n: known.length, max: limits.forms })}</span>
        <span>{t('tools.wildShape.limits', { cr: crLabel(limits.maxCr), fly: limits.fly ? t('tools.wildShape.flyYes') : t('tools.wildShape.flyNo') })}</span>
        <span>{t('tools.wildShape.duration', { n: Math.max(1, Math.floor(level / 2)) })}</span>
      </div>

      <AnimatePresence>
        {shaped && active && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 rounded-xl border border-good/50 bg-good/10 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-good">{t('tools.wildShape.active')}</span>
              <span className="font-display text-lg text-gold">{active.name}</span>
              <span className="text-xs text-muted">
                {active.size} {active.creatureType} · CR {active.cr}
              </span>
              <button
                className="btn btn-sm ml-auto"
                onClick={() => {
                  update((c) => revertWildShape(c))
                  notify(t('tools.wildShape.reverted'))
                }}
              >
                <Undo2 size={13} /> {t('tools.wildShape.revert')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-line-soft bg-panel-2 py-1">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted">
                  <Shield size={10} /> AC
                </div>
                <div className="font-display text-xl">{moon ? Math.max(active.ac, moonAc) : active.ac}</div>
              </div>
              <div className="rounded-lg border border-line-soft bg-panel-2 py-1" title={t('tools.wildShape.keepHp')}>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted">
                  <Heart size={10} /> {t('tools.wildShape.formHp')}
                </div>
                <div className="font-display text-xl">{creatureHp(active.hp) ?? '—'}</div>
              </div>
              <div className="rounded-lg border border-line-soft bg-panel-2 py-1">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted">
                  <Footprints size={10} /> Speed
                </div>
                <div className="text-sm font-semibold leading-7">{active.speed}</div>
              </div>
            </div>
            {moon && <div className="mt-1 text-[11px] text-muted">{t('tools.wildShape.moonAc', { n: moonAc })}</div>}
            <div className="mt-2">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">{t('tools.wildShape.attacks')}</div>
              {parseCreatureAttacks(active.description).map((a) => (
                <div key={a.name} className="flex items-center gap-2 text-sm">
                  <Swords size={12} className="text-gold" />
                  <span className="font-semibold">{a.name}</span>
                  {a.toHit && (
                    <button className="btn btn-sm px-1.5 py-0" onClick={() => roll(`1d20${a.toHit}`, `${active.name}: ${a.name}`, { character: char.name || undefined })}>
                      {a.toHit}
                    </button>
                  )}
                  {a.damage && (
                    <button className="btn btn-sm px-1.5 py-0" onClick={() => roll(a.damage!.replace(/\s+/g, ''), `${active.name}: ${a.name} (${a.damageType ?? ''})`, { character: char.name || undefined })}>
                      {a.damage} {a.damageType}
                    </button>
                  )}
                </div>
              ))}
              {!parseCreatureAttacks(active.description).length && <div className="text-xs text-muted">{t('tools.wildShape.noAttacks')}</div>}
            </div>
            <p className="mt-2 text-[11px] text-muted">{t('tools.wildShape.keepHp')}</p>
            <button className="btn btn-ghost btn-sm mt-1" onClick={() => setShowBlock(!showBlock)}>
              {showBlock ? t('tools.wildShape.hideStatBlock') : t('tools.wildShape.statBlock')}
            </button>
            {showBlock && (
              <div className="mt-2 rounded-lg border border-line-soft bg-panel-2 p-3">
                <Markdown text={active.description} compact />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {known.length === 0 ? (
        <p className="text-sm text-muted">{t('tools.wildShape.none', { n: limits.forms })}</p>
      ) : (
        <div className="space-y-1">
          {known.map((cr) => {
            const ok = isEligibleForm(cr, limits)
            const isActive = shaped && active?.id === cr.id
            return (
              <div key={cr.id} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-panel-2 ${isActive ? 'bg-good/10' : ''}`}>
                <span className="font-medium">{cr.name}</span>
                <span className="truncate text-[11px] text-faint">
                  CR {cr.cr} · AC {cr.ac} · {cr.speed}
                </span>
                {!ok && <span className="chip py-0 text-[9px] text-bad">{t('tools.wildShape.notEligible')}</span>}
                <span className="ml-auto flex items-center gap-1">
                  <button className="btn btn-ghost btn-sm px-1" title={t('tools.wildShape.statBlock')} onClick={() => openDetail({ kind: 'creature', id: cr.id })}>
                    <Eye size={13} />
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={!!uses && left <= 0}
                    title={uses && left <= 0 ? t('tools.wildShape.noUses') : t('tools.wildShape.useTip', { n: temp })}
                    onClick={() => shape(cr)}
                  >
                    <PawPrint size={12} /> {t('tools.wildShape.use')}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm px-1"
                    title={t('tools.wildShape.remove')}
                    onClick={() =>
                      update((c) => {
                        const ws = c.wildShape ?? { knownForms: [] }
                        ws.knownForms = ws.knownForms.filter((x) => x !== cr.id)
                        if (ws.activeForm === cr.id) revertWildShape(c)
                        c.wildShape = ws
                      })
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
      <p className="mt-2 text-[11px] text-faint">{t('tools.wildShape.replaceHint')}</p>

      <EntityPicker
        open={picker}
        onClose={() => setPicker(false)}
        kinds={['creature']}
        title={t('tools.wildShape.pickTitle', { n: limits.forms })}
        multi
        max={limits.forms}
        selected={char.wildShape?.knownForms ?? []}
        filter={(e) => isEligibleForm(e as CreatureDef, limits)}
        groupBy={(e) => `CR ${(e as CreatureDef).cr}`}
        onConfirm={(ids) =>
          update((c) => {
            c.wildShape = { knownForms: ids.slice(0, limits.forms), activeForm: c.wildShape?.activeForm }
          })
        }
      />
    </Section>
  )
}
