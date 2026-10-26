import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Sparkles, BookOpen, Wand2, Moon } from 'lucide-react'
import type { SpellDef } from '../../types'
import { useChar } from './context'
import { Empty, Section, Tip } from '../ui'
import { EntityLink } from '../EntityInfo'
import { EntityPicker } from '../EntityPicker'
import { StatValue } from '../Stat'
import { useRolls } from '../../store/rolls'
import { useUi } from '../../store/ui'
import { abilityNames } from '../../data/skills'
import { spellFilter } from '../../lib/spellFilter'

export function SpellsTab() {
  const { t } = useTranslation()
  const { char, derived: d, lookup: L, update } = useChar()
  const [picker, setPicker] = useState<{ classId: string; cantrip: boolean } | null>(null)
  const [anyPicker, setAnyPicker] = useState(false)
  const notify = useUi((s) => s.notify)
  const roll = useRolls((s) => s.roll)

  const spells = char.spells
    .map((s, idx) => ({ s, idx, def: L.get('spell', s.spellId) as SpellDef | undefined }))
    .filter((x) => x.def)
    .sort((a, b) => a.def!.level - b.def!.level || a.def!.name.localeCompare(b.def!.name))
  const byLevel = new Map<number, typeof spells>()
  for (const x of spells) byLevel.set(x.def!.level, [...(byLevel.get(x.def!.level) ?? []), x])

  const useSlot = (level: number): boolean => {
    const pactOk = d.pact && d.pact.level >= level && d.pact.used < d.pact.count
    const slot = d.slots.find((s) => s.level >= level && s.used < s.max)
    if (slot) {
      update((c) => {
        c.spellSlotsUsed[slot.level - 1] = (c.spellSlotsUsed[slot.level - 1] ?? 0) + 1
      })
      return true
    }
    if (pactOk) {
      update((c) => void (c.pactSlotsUsed += 1))
      return true
    }
    return false
  }

  const caster = d.spellcasting[0]
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-4 lg:col-span-4">
        {d.spellcasting.map((sc) => (
          <Section key={sc.classId} title={`${sc.className} Spellcasting`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
                <div className="text-[10px] uppercase tracking-widest text-muted">{t('spells.ability')}</div>
                <div className="font-display text-lg">{sc.ability.toUpperCase()}</div>
                <div className="text-[10px] text-muted">{abilityNames[sc.ability]}</div>
              </div>
              <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
                <div className="text-[10px] uppercase tracking-widest text-muted">{t('spells.dc')}</div>
                <div className="font-display text-2xl font-bold">
                  <StatValue stat={sc.dc} okey={`spell.dc.${sc.classId}`} update={update} signed={false} rollable={false} />
                </div>
              </div>
              <div className="rounded-xl border border-line-soft bg-panel-2 p-2">
                <div className="text-[10px] uppercase tracking-widest text-muted">{t('spells.attack')}</div>
                <div className="font-display text-2xl font-bold">
                  <StatValue stat={sc.attack} okey={`spell.attack.${sc.classId}`} update={update} rollLabel="Spell attack" characterName={char.name} />
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[13px]">
              <Counter label={t('spells.cantrips')} n={sc.cantripCount} max={sc.cantripsMax} />
              <Counter label={t('spells.prepared')} n={sc.preparedCount} max={sc.preparedMax} />
              <div className="text-xs text-muted">{t('spells.maxLevel', { n: sc.maxSpellLevel })}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sc.cantripsMax > 0 && (
                <button className="btn btn-sm" onClick={() => setPicker({ classId: sc.classId, cantrip: true })}>
                  <Plus size={13} /> {t('spells.addCantrip')}
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => setPicker({ classId: sc.classId, cantrip: false })}>
                <Plus size={13} /> {t('spells.addSpell')}
              </button>
            </div>
          </Section>
        ))}

        <Section title={t('spells.slots')}>
          {d.slots.length === 0 && !d.pact && <div className="text-sm text-muted">{t('spells.noSlots')}</div>}
          <div className="space-y-2">
            {d.slots.map((s) => (
              <div key={s.level} className="flex items-center gap-3">
                <span className="w-14 text-xs text-muted">Level {s.level}</span>
                <div className="flex gap-1">
                  {Array.from({ length: s.max }, (_, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.75 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => update((c) => void (c.spellSlotsUsed[s.level - 1] = i < s.used ? i : i + 1))}
                      className={`h-5 w-5 rounded-full border-2 ${i < s.max - s.used ? 'border-arcane bg-arcane/70 shadow-[0_0_8px_var(--arcane)]' : 'border-line'}`}
                    />
                  ))}
                </div>
                <span className="ml-auto text-xs text-muted">
                  {s.max - s.used}/{s.max}
                </span>
              </div>
            ))}
            {d.pact && (
              <div className="flex items-center gap-3 border-t border-line-soft pt-2">
                <span className="w-14 text-xs text-muted">Pact (L{d.pact.level})</span>
                <div className="flex gap-1">
                  {Array.from({ length: d.pact.count }, (_, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.75 }}
                      onClick={() => update((c) => void (c.pactSlotsUsed = i < d.pact!.used ? i : i + 1))}
                      className={`h-5 w-5 rotate-45 border-2 ${i < d.pact!.count - d.pact!.used ? 'border-arcane bg-arcane/70' : 'border-line'}`}
                    />
                  ))}
                </div>
                <span className="ml-auto text-[10px] text-muted">{t('spells.shortRest')}</span>
              </div>
            )}
          </div>
          {(d.slots.length > 0 || d.pact) && (
            <button
              className="btn btn-sm mt-3"
              onClick={() =>
                update((c) => {
                  c.spellSlotsUsed = []
                  c.pactSlotsUsed = 0
                })
              }
            >
              <Moon size={13} /> {t('spells.resetSlots')}
            </button>
          )}
        </Section>
        <button className="btn w-full justify-center" onClick={() => setAnyPicker(true)}>
          <BookOpen size={14} /> {t('spells.addAny')}
        </button>
      </div>

      <div className="col-span-12 space-y-4 lg:col-span-8">
        {spells.length === 0 && (
          <div className="panel">
            <Empty icon={<Sparkles size={36} />} title={t('spells.empty')} text={d.spellcasting.length ? t('spells.emptyText') : t('spells.noCaster')} />
          </div>
        )}
        {[...byLevel.entries()].map(([lvl, list]) => (
          <Section key={lvl} title={lvl === 0 ? 'Cantrips' : `Level ${lvl}`}>
            <div className="divide-y divide-line-soft">
              <AnimatePresence initial={false}>
                {list.map(({ s, idx, def }) => {
                  const sp = def!
                  const src = d.spellcasting.find((c) => c.classId === s.source)
                  const dmg = sp.damage?.dice
                  return (
                    <motion.div key={`${s.spellId}:${s.source}`} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 py-2">
                      {sp.level > 0 ? (
                        <Tip content={s.alwaysPrepared ? t('spells.always') : s.prepared ? t('spells.isPrepared') : t('spells.notPrepared')}>
                          <button
                            disabled={s.alwaysPrepared}
                            onClick={() => update((c) => void (c.spells[idx].prepared = !c.spells[idx].prepared))}
                            className={`h-4 w-4 rounded-full border-2 ${s.prepared || s.alwaysPrepared ? 'border-arcane bg-arcane' : 'border-line'} ${s.alwaysPrepared ? 'ring-2 ring-arcane/40' : ''}`}
                          />
                        </Tip>
                      ) : (
                        <Sparkles size={14} className="text-arcane" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <EntityLink kind="spell" id={sp.id} className="font-medium" />
                          {sp.concentration && <span className="chip py-0 text-[9px]">C</span>}
                          {sp.ritual && <span className="chip py-0 text-[9px]">R</span>}
                        </div>
                        <div className="truncate text-[11px] text-muted">
                          {sp.castingTime} · {sp.range} · {sp.duration} · {src?.className ?? sourceLabel(s.source)}
                        </div>
                      </div>
                      {sp.attack && src && (
                        <button className="btn btn-sm" onClick={() => roll(`1d20${src.attack.value >= 0 ? '+' : ''}${src.attack.value}`, `${sp.name} attack`, { character: char.name })}>
                          🎯 {src.attack.value >= 0 ? '+' : ''}
                          {src.attack.value}
                        </button>
                      )}
                      {sp.save && (src ?? caster) && <span className="chip">DC {(src ?? caster).dc.value} {sp.save.toUpperCase()}</span>}
                      {dmg && (
                        <button className="btn btn-sm" onClick={() => roll(scaleCantrip(dmg, sp, d.totalLevel), `${sp.name} damage`, { character: char.name })}>
                          🎲 {scaleCantrip(dmg, sp, d.totalLevel)}
                        </button>
                      )}
                      {sp.level > 0 && (
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            if (useSlot(sp.level)) notify(t('spells.cast', { name: sp.name }), 'good')
                            else notify(t('spells.noSlotLeft'), 'bad')
                          }}
                        >
                          <Wand2 size={13} /> {t('spells.castBtn')}
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => update((c) => void c.spells.splice(idx, 1))}>
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </Section>
        ))}
      </div>

      {picker && (
        <EntityPicker
          open
          onClose={() => setPicker(null)}
          kinds={['spell']}
          title={picker.cantrip ? t('spells.addCantrip') : t('spells.addSpell')}
          multi
          selected={char.spells.filter((s) => s.source === picker.classId).map((s) => s.spellId).filter((id) => {
            const lv = (L.get('spell', id) as SpellDef | undefined)?.level ?? 0
            return picker.cantrip ? lv === 0 : lv > 0
          })}
          filter={(e) => {
            const sc = d.spellcasting.find((c) => c.classId === picker.classId)
            return spellFilter(sc?.spellList, { cantrip: picker.cantrip ? true : false, maxLevel: picker.cantrip ? 0 : sc?.maxSpellLevel })(e as SpellDef)
          }}
          onConfirm={(ids) =>
            update((c) => {
              const isC = (id: string): boolean => ((L.get('spell', id) as SpellDef | undefined)?.level ?? 0) === 0
              c.spells = c.spells.filter((s) => s.source !== picker.classId || isC(s.spellId) !== picker.cantrip || ids.includes(s.spellId))
              for (const id of ids) if (!c.spells.some((s) => s.source === picker.classId && s.spellId === id)) c.spells.push({ spellId: id, source: picker.classId, prepared: true })
            })
          }
        />
      )}
      <EntityPicker
        open={anyPicker}
        onClose={() => setAnyPicker(false)}
        kinds={['spell']}
        title={t('spells.addAny')}
        multi
        extra={char.customEntities}
        onConfirm={(ids) =>
          update((c) => {
            for (const id of ids) if (!c.spells.some((s) => s.spellId === id)) c.spells.push({ spellId: id, source: 'manual', prepared: true })
          })
        }
      />
    </div>
  )
}

function Counter({ label, n, max }: { label: string; n: number; max: number }) {
  const over = n > max
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-3">
        <motion.div className={`h-full ${over ? 'bg-bad' : 'bg-arcane'}`} animate={{ width: `${max ? Math.min(100, (n / max) * 100) : 0}%` }} />
      </div>
      <span className={`font-display ${over ? 'text-bad' : n === max ? 'text-good' : ''}`}>
        {n}/{max}
      </span>
    </div>
  )
}

function scaleCantrip(dice: string, sp: SpellDef, level: number): string {
  if (sp.level !== 0 || sp.damage?.cantripScaling === false) return dice
  const mult = level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1
  return dice.replace(/^(\d+)d/, (_m, n) => `${Number(n) * mult}d`)
}

function sourceLabel(s: string): string {
  if (s.startsWith('feat:')) return 'Feat'
  if (s === 'species') return 'Species'
  if (s === 'manual') return 'Manual'
  return s
}
