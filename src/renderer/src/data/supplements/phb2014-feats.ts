import type { FeatDef } from '../../types'
import { PHB14 } from './phb2014-subclasses'

/**
 * 2014 Player's Handbook feats that were dropped from the 2024 Player's Handbook.
 * Only mechanics and terse own-words summaries.
 *
 * Adapted to 2024: General feats (Level 4+) with the usual +1 ability increase
 * (only Linguist had one in 2014).
 */

const ADAPTED = '*2024 conversion: a General feat (Level 4+) with a +1 ability increase the 2014 original lacked. Own-words summary; see the 2014 Player’s Handbook.*'

function pf(f: Omit<FeatDef, 'kind' | 'source' | 'sourceBook' | 'description' | 'category' | 'minLevel'> & { description?: string; note?: string }): FeatDef {
  const { note, ...rest } = f
  const pre = f.prerequisite ? ` (Prerequisite: ${f.prerequisite})` : ''
  const asi = f.abilityIncrease
    ? `\n\n**Ability Score Increase:** +${f.abilityIncrease.amount} to ${f.abilityIncrease.options.map((a) => a.toUpperCase()).join(', ').replace(/, ([A-Z]+)$/, ' or $1')} (max 20).`
    : ''
  return {
    ...rest,
    kind: 'feat',
    category: 'general',
    minLevel: 4,
    source: 'Supplement',
    sourceBook: PHB14,
    tags: ['supplement', 'phb2014', ...(f.tags ?? [])],
    description: `*General Feat${pre}*\n\n${f.description ?? f.summary}${asi}\n\n${note ?? ADAPTED}`
  }
}

export const phb2014Feats: FeatDef[] = [
  pf({
    id: 'phb14-dungeon-delver',
    name: 'Dungeon Delver',
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['con', 'wis'], amount: 1 },
    summary: 'Advantage on Perception and Investigation checks to find secret doors, Advantage on saves against traps, Resistance to trap damage, and you can search for traps at a normal pace.'
  }),
  pf({
    id: 'phb14-linguist',
    name: 'Linguist',
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['int'], amount: 1 },
    summary: 'Learn three languages and write ciphers that others can crack only with an Intelligence check (DC = your Intelligence score + Proficiency Bonus) or magic.',
    note: '*2024 conversion: a General feat (Level 4+); the 2014 original already gave +1 Intelligence. Own-words summary; see the 2014 Player’s Handbook.*',
    choices: [{ id: 'languages', label: 'Languages', count: 3, type: 'language' }]
  }),
  pf({
    id: 'phb14-martial-adept',
    name: 'Martial Adept',
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['str', 'dex'], amount: 1 },
    summary: 'Learn two Battle Master maneuvers and gain one d6 Superiority Die (regained on a Short or Long Rest). Save DC = 8 + Proficiency Bonus + Str or Dex modifier.',
    choices: [{ id: 'maneuvers', label: 'Battle Master maneuvers', count: 2, type: 'option', filter: 'Maneuvers' }]
  }),
  pf({
    id: 'phb14-mobile',
    name: 'Mobile',
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['dex', 'con'], amount: 1 },
    summary: 'Speed +10 feet, Difficult Terrain costs no extra movement on a Dash, and a creature you make a melee attack against can’t make Opportunity Attacks against you that turn.',
    effects: [{ target: 'speed', op: 'add', value: 10, note: 'Mobile' }]
  })
]
