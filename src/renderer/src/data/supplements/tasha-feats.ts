import type { FeatDef } from '../../types'
import { TCE } from './tasha-subclasses'

/**
 * Feats from Tasha's Cauldron of Everything that were not reprinted in the 2024 Player's Handbook.
 * Only names, mechanics and short summaries in our own words.
 *
 * Adapted to 2024: these become General feats (Level 4+) and, like other 2024 General feats,
 * grant +1 to an ability score — TCE's originals mostly had no ability increase.
 */

const ADAPTED = '*Adapted to 2024 rules: a General feat (Level 4+) with the usual +1 ability increase, which the TCE original did not have. Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'

function tf(f: Omit<FeatDef, 'kind' | 'source' | 'sourceBook' | 'description'> & { description?: string }): FeatDef {
  const cat = f.category === 'fightingStyle' ? 'Fighting Style Feat' : 'General Feat'
  const pre = f.prerequisite ? ` (Prerequisite: ${f.prerequisite})` : ''
  const asi = f.abilityIncrease ? `\n\n**Ability Score Increase:** +${f.abilityIncrease.amount} to ${f.abilityIncrease.options.map((a) => a.toUpperCase()).join(', ').replace(/, ([A-Z]+)$/, ' or $1')} (max 20).` : ''
  const note = f.category === 'fightingStyle' ? '*Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*' : ADAPTED
  return {
    ...f,
    kind: 'feat',
    source: 'Supplement',
    sourceBook: TCE,
    tags: ['supplement', 'tce', ...(f.tags ?? [])],
    description: `*${cat}${pre}*\n\n${f.description ?? f.summary}${asi}\n\n${note}`
  }
}

const FIGHTING_STYLES = ['Archery', 'Blind Fighting', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Interception', 'Protection', 'Superior Technique', 'Thrown Weapon Fighting', 'Two-Weapon Fighting', 'Unarmed Fighting']

export const tashaFeats: FeatDef[] = [
  tf({
    id: 'artificer-initiate',
    name: 'Artificer Initiate',
    category: 'general',
    minLevel: 4,
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['int'], amount: 1 },
    summary: 'Learn one Artificer cantrip and one level 1 Artificer spell (cast once per Long Rest without a slot), and gain proficiency with one type of Artisan’s Tools.',
    description:
      'You learn one cantrip and one level 1 spell from the Artificer list, with Intelligence as the spellcasting ability. You can cast the level 1 spell once without a spell slot per Long Rest, or with any slots you have. You also gain proficiency with one type of Artisan’s Tools and can use those tools as a spellcasting focus for these spells.',
    choices: [
      { id: 'cantrip', label: 'Artificer cantrip', count: 1, type: 'cantrip', filter: 'artificer' },
      { id: 'spell', label: 'Level 1 Artificer spell', count: 1, type: 'spell', filter: 'artificer:1' },
      { id: 'tool', label: 'Artisan’s Tools', count: 1, type: 'tool', filter: 'artisan' }
    ]
  }),
  tf({
    id: 'eldritch-adept',
    name: 'Eldritch Adept',
    category: 'general',
    minLevel: 4,
    prerequisite: 'Level 4+, Spellcasting or Pact Magic Feature',
    abilityIncrease: { options: ['int', 'wis', 'cha'], amount: 1 },
    summary: 'Learn one Eldritch Invocation; one with a prerequisite is only available if you are a Warlock who meets it.',
    description:
      'You learn one Eldritch Invocation of your choice. If it has a prerequisite, you can pick it only if you are a Warlock and meet that prerequisite. Whenever you gain a level, you can swap the invocation for another eligible one.',
    choices: [{ id: 'invocation', label: 'Eldritch Invocation', count: 1, type: 'option', filter: 'Eldritch Invocations' }]
  }),
  tf({
    id: 'fighting-initiate',
    name: 'Fighting Initiate',
    category: 'general',
    minLevel: 4,
    prerequisite: 'Level 4+, Proficiency with a Martial Weapon',
    abilityIncrease: { options: ['str', 'dex'], amount: 1 },
    summary: 'Learn one Fighting Style (a Fighting Style feat) of your choice.',
    description:
      'Your martial training gives you one Fighting Style of your choice — in 2024 terms, one Fighting Style feat you don’t already have. Whenever you reach a level that grants an Ability Score Improvement, you can replace it with another. (In 2024 rules a Fighting Style feat can also be taken directly by characters with the Fighting Style feature.)',
    choices: [{ id: 'style', label: 'Fighting Style', count: 1, type: 'option', options: FIGHTING_STYLES }]
  }),
  tf({
    id: 'gunner',
    name: 'Gunner',
    category: 'general',
    minLevel: 4,
    prerequisite: 'Level 4+',
    abilityIncrease: { options: ['dex'], amount: 1 },
    summary: 'Proficiency with firearms, you ignore the Loading property of firearms, and being within 5 feet of an enemy doesn’t give you Disadvantage on ranged attacks.',
    description:
      'You gain proficiency with firearms (such as the Musket and Pistol), you ignore the Loading property of firearms, and attacking at range while a hostile creature is within 5 feet of you doesn’t impose Disadvantage on your ranged attack rolls. TCE’s original already gave +1 Dexterity.',
    effects: [
      { target: 'proficiency.weapon', op: 'grant', value: 'musket', note: 'Gunner' },
      { target: 'proficiency.weapon', op: 'grant', value: 'pistol', note: 'Gunner' }
    ]
  }),
  tf({
    id: 'metamagic-adept',
    name: 'Metamagic Adept',
    category: 'general',
    minLevel: 4,
    prerequisite: 'Level 4+, Spellcasting or Pact Magic Feature',
    abilityIncrease: { options: ['int', 'wis', 'cha'], amount: 1 },
    summary: 'Learn two Metamagic options and gain 2 Sorcery Points (regained on a Long Rest) that can only fuel Metamagic.',
    description:
      'You learn two Metamagic options from the Sorcerer class and gain 2 Sorcery Points that you can spend only on Metamagic; you regain them when you finish a Long Rest. Whenever you reach a level that grants an Ability Score Improvement, you can swap one option for another.',
    choices: [{ id: 'metamagic', label: 'Metamagic options', count: 2, type: 'option', filter: 'Metamagic Options' }]
  }),
  tf({
    id: 'superior-technique',
    name: 'Superior Technique',
    category: 'fightingStyle',
    prerequisite: 'Fighting Style Feature',
    summary: 'Learn one Battle Master maneuver and gain one Superiority Die (d6), regained on a Short or Long Rest.',
    description:
      'You learn one maneuver of your choice from the Battle Master’s maneuvers and gain one d6 Superiority Die to fuel it (in addition to any you already have). You regain it when you finish a Short or Long Rest. If a maneuver needs a save, the DC is 8 + your Proficiency Bonus + your Strength or Dexterity modifier.',
    choices: [{ id: 'maneuver', label: 'Battle Master maneuver', count: 1, type: 'option', filter: 'Maneuvers' }]
  })
]
