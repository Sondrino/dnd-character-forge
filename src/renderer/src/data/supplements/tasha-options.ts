import type { ClassOptionGroup } from '../../types'

/**
 * Class options from Tasha's Cauldron of Everything that are not in the 2024 Player's Handbook:
 * new Eldritch Invocations (incl. Pact of the Talisman, a pact boon turned into an invocation the
 * 2024 way), new Battle Master maneuvers, and the few TCE "optional class features" that the 2024
 * classes did not absorb. Only names, mechanics and short summaries in our own words.
 *
 * Already covered elsewhere (skipped): Eldritch Mind, Gift of the Protectors, Investment of the
 * Chain Master (2024 invocations), Seeking/Transmuted Spell (2024 Metamagic), and the maneuvers
 * Ambush, Bait and Switch, Commanding Presence and Tactical Assessment (2024 maneuvers).
 */

const OWN = '*Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'

type Item = ClassOptionGroup['items'][number]

const opt = (id: string, name: string, summary: string, extra: Partial<Item> & { more?: string } = {}): Item => {
  const { more, ...rest } = extra
  return {
    id,
    name,
    summary,
    description: `${rest.prerequisite ? `*Prerequisite: ${rest.prerequisite}*\n\n` : ''}${summary}${more ? `\n\n${more}` : ''}\n\n${OWN}`,
    activation: 'passive',
    source: 'Supplement',
    ...rest
  }
}

export const tashaInvocations: ClassOptionGroup = {
  classId: 'warlock',
  group: 'Eldritch Invocations',
  source: 'Supplement',
  items: [
    opt('pact-of-the-talisman', 'Pact of the Talisman', 'Your patron gives you a talisman amulet. When its wearer fails an ability check, they can add a d4 to the roll, possibly turning it into a success; it also works as your Spellcasting Focus.', {
      prerequisite: 'Level 1+ Warlock',
      level: 1,
      activation: 'special',
      uses: { count: 'prof', recharge: 'long' },
      more: 'If you lose the talisman you can make a new one with a 1-hour ceremony, which destroys the old one. TCE presented this as a Pact Boon; in 2024 rules pact boons are invocations.'
    }),
    opt('bond-of-the-talisman', 'Bond of the Talisman', 'While someone else wears your talisman, you can use an action to teleport to the unoccupied space closest to them (on the same plane), and the wearer can do the same to reach you.', {
      prerequisite: 'Level 12+ Warlock, Pact of the Talisman Invocation',
      level: 12,
      activation: 'action',
      uses: { count: 'prof', recharge: 'long' }
    }),
    opt('far-scribe', 'Far Scribe', 'A new page in your Book of Shadows can hold the names of creatures (up to your Proficiency Bonus) who write there; you can cast Sending targeting one of them without a spell slot or material components, the message appearing on the page.', {
      prerequisite: 'Level 5+ Warlock, Pact of the Tome Invocation',
      level: 5,
      activation: 'action',
      more: 'You can remove a name from the page with a magical action of your own.'
    }),
    opt('protection-of-the-talisman', 'Protection of the Talisman', 'When the wearer of your talisman fails a saving throw, they can add a d4 to the roll, possibly turning it into a success.', {
      prerequisite: 'Level 7+ Warlock, Pact of the Talisman Invocation',
      level: 7,
      activation: 'special',
      uses: { count: 'prof', recharge: 'long' }
    }),
    opt('rebuke-of-the-talisman', 'Rebuke of the Talisman', 'As a Reaction when an attacker you can see within 30 feet hits your talisman’s wearer, deal psychic damage equal to your Proficiency Bonus to the attacker and push it up to 10 feet away from the wearer.', {
      prerequisite: 'Pact of the Talisman Invocation',
      level: 1,
      activation: 'reaction'
    }),
    opt('undying-servitude', 'Undying Servitude', 'You can cast Animate Dead without a spell slot; once you do, you can’t do so again until you finish a Long Rest.', {
      prerequisite: 'Level 5+ Warlock',
      level: 5,
      activation: 'action',
      uses: { count: 1, recharge: 'long' }
    })
  ]
}

const maneuver = (id: string, name: string, summary: string, activation: Item['activation']): Item =>
  opt(id, name, summary, { prerequisite: 'Battle Master (or Superior Technique)', activation })

export const tashaManeuvers: ClassOptionGroup = {
  classId: 'fighter',
  group: 'Maneuvers',
  source: 'Supplement',
  items: [
    maneuver('maneuver-brace', 'Brace', 'As a Reaction when a creature you can see moves into the reach of your melee weapon, expend a Superiority Die to attack it, adding the die to the damage.', 'reaction'),
    maneuver('maneuver-grappling-strike', 'Grappling Strike', 'Right after you hit with a melee attack on your turn, expend a Superiority Die to try to Grapple the target as a Bonus Action, adding the die to your Athletics check (or to the save DC in 2024 grappling terms).', 'bonus'),
    maneuver('maneuver-quick-toss', 'Quick Toss', 'As a Bonus Action, expend a Superiority Die to make a ranged attack with a Thrown weapon, drawing it as part of the attack and adding the die to the damage.', 'bonus')
  ]
}

const OCF = 'Optional Class Features (TCE)'
const OCF_NOTE = 'TCE optional class feature that the 2024 class did not absorb; use it only with your DM’s approval.'

export const tashaOptionalFeatures: ClassOptionGroup[] = [
  {
    classId: 'bard',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-magical-inspiration', 'Magical Inspiration', 'A creature holding one of your Bardic Inspiration dice can roll it and add it to one damage or healing roll of a spell it casts; the die is then used up.', { prerequisite: 'Level 2+ Bard', level: 2, activation: 'special', more: OCF_NOTE })
    ]
  },
  {
    classId: 'cleric',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-cleric-harness-divine-power', 'Harness Divine Power', 'As a Bonus Action, spend a Channel Divinity use to regain one expended spell slot of a level no higher than half your Proficiency Bonus (rounded up).', {
        prerequisite: 'Level 2+ Cleric', level: 2, activation: 'bonus', uses: { count: 1, recharge: 'long' },
        more: `Usable once per Long Rest, twice from level 6 and three times from level 18. ${OCF_NOTE}`
      })
    ]
  },
  {
    classId: 'paladin',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-paladin-harness-divine-power', 'Harness Divine Power', 'As a Bonus Action, spend a Channel Divinity use to regain one expended spell slot of a level no higher than half your Proficiency Bonus (rounded up).', {
        prerequisite: 'Level 3+ Paladin', level: 3, activation: 'bonus', uses: { count: 1, recharge: 'long' },
        more: `Usable once per Long Rest, twice from level 7 and three times from level 15. ${OCF_NOTE}`
      })
    ]
  },
  {
    classId: 'monk',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-quickened-healing', 'Quickened Healing', 'As a Magic action, spend 2 Focus Points to regain Hit Points equal to a roll of your Martial Arts die + your Proficiency Bonus.', { prerequisite: 'Level 4+ Monk', level: 4, activation: 'action', more: OCF_NOTE }),
      opt('tce-ocf-focused-aim', 'Focused Aim', 'When you miss with an attack roll, spend 1 to 3 Focus Points to raise the roll by 2 per point spent, possibly turning the miss into a hit.', { prerequisite: 'Level 5+ Monk', level: 5, activation: 'special', more: OCF_NOTE })
    ]
  },
  {
    classId: 'ranger',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-primal-awareness', 'Primal Awareness', 'You learn extra nature spells that are always prepared — Speak with Animals (level 3), Beast Sense (5), Speak with Plants (9), Locate Creature (13) and Commune with Nature (17) — and can cast each once per Long Rest without a slot.', {
        prerequisite: 'Level 3+ Ranger', level: 3, activation: 'special',
        more: `In TCE this replaced Primeval Awareness. ${OCF_NOTE}`
      })
    ]
  },
  {
    classId: 'sorcerer',
    group: OCF,
    source: 'Supplement',
    items: [
      opt('tce-ocf-magical-guidance', 'Magical Guidance', 'When you fail an ability check, spend 1 Sorcery Point to reroll the d20; you must use the new roll.', { prerequisite: 'Level 5+ Sorcerer', level: 5, activation: 'special', more: OCF_NOTE })
    ]
  }
]
