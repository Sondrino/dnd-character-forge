import type { BackgroundDef } from '../../types'
import { PHB14 } from './phb2014-subclasses'

/**
 * Backgrounds from the 2014 Player's Handbook with no 2024 counterpart, converted to the 2024
 * background format (three ability scores, an Origin feat, two skills, one tool, equipment A/B).
 * Only mechanics and terse own-words summaries.
 */

const CONVERTED =
  '*2024 conversion: the ability scores and Origin feat are our picks; the 2014 skills and tool are kept, and 2014 extra languages come from 2024 character creation instead. Own-words summary; see the 2014 Player’s Handbook.*'

const gp50 = { label: 'B', items: [], gp: 50 }

function bg(o: Omit<BackgroundDef, 'kind' | 'source' | 'sourceBook'>): BackgroundDef {
  return {
    ...o,
    kind: 'background',
    source: 'Supplement',
    sourceBook: PHB14,
    tags: ['supplement', 'phb2014', ...(o.tags ?? [])]
  }
}

export const phb2014Backgrounds: BackgroundDef[] = [
  bg({
    id: 'phb14-folk-hero',
    name: 'Folk Hero',
    summary: 'A commoner who stood up for ordinary people. Animal Handling and Survival, one Artisan’s Tools, and the Tough feat.',
    description: `**Ability Scores:** Strength, Constitution, Wisdom
**Feat:** Tough
**Skill Proficiencies:** Animal Handling and Survival
**Tool Proficiency:** One kind of Artisan’s Tools (2014 also gave Vehicles (land); add it under extra proficiencies if you want it)
**Equipment:** (A) Artisan’s Tools (same as above), Shovel, Iron Pot, Traveler’s Clothes, 10 GP; or (B) 50 GP

**Rustic Hospitality (2014 feature):** common folk will shelter and hide you, short of risking their lives.

${CONVERTED}`,
    abilityScores: ['str', 'con', 'wis'],
    originFeat: 'tough',
    skills: ['animalHandling', 'survival'],
    tool: 'choice:artisan',
    equipment: [
      {
        label: 'A',
        items: [{ name: 'Artisan’s Tools (same as above)' }, { id: 'shovel' }, { id: 'iron-pot' }, { id: 'travelers-clothes' }],
        gp: 10
      },
      gp50
    ]
  }),
  bg({
    id: 'phb14-guild-artisan',
    name: 'Guild Artisan',
    summary: 'A guild member skilled in a trade and in business. Insight and Persuasion, one Artisan’s Tools, and the Crafter feat.',
    description: `**Ability Scores:** Intelligence, Wisdom, Charisma
**Feat:** Crafter
**Skill Proficiencies:** Insight and Persuasion
**Tool Proficiency:** One kind of Artisan’s Tools
**Equipment:** (A) Artisan’s Tools (same as above), Letter of introduction from your guild, Traveler’s Clothes, Pouch, 15 GP; or (B) 50 GP

**Guild Membership (2014 feature):** your guild offers lodging, food and legal or political help in exchange for dues of 5 GP per month.

${CONVERTED}`,
    abilityScores: ['int', 'wis', 'cha'],
    originFeat: 'crafter',
    skills: ['insight', 'persuasion'],
    tool: 'choice:artisan',
    equipment: [
      {
        label: 'A',
        items: [{ name: 'Artisan’s Tools (same as above)' }, { name: 'Letter of introduction (guild)' }, { id: 'travelers-clothes' }, { id: 'pouch' }],
        gp: 15
      },
      gp50
    ]
  }),
  bg({
    id: 'phb14-outlander',
    name: 'Outlander',
    summary: 'You grew up far from towns, living off the land. Athletics and Survival, one Musical Instrument, and the Savage Attacker feat.',
    description: `**Ability Scores:** Strength, Dexterity, Wisdom
**Feat:** Savage Attacker
**Skill Proficiencies:** Athletics and Survival
**Tool Proficiency:** One kind of Musical Instrument
**Equipment:** (A) Quarterstaff, Hunting Trap, Musical Instrument (same as above), Traveler’s Clothes, Pouch, 10 GP; or (B) 50 GP

**Wanderer (2014 feature):** you remember maps and terrain well and can find food and fresh water for yourself and up to five others each day if the land allows.

${CONVERTED}`,
    abilityScores: ['str', 'dex', 'wis'],
    originFeat: 'savage-attacker',
    skills: ['athletics', 'survival'],
    tool: 'choice:musical',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'quarterstaff' },
          { id: 'hunting-trap' },
          { id: 'musical-instrument', name: 'Musical Instrument (same as above)' },
          { id: 'travelers-clothes' },
          { id: 'pouch' }
        ],
        gp: 10
      },
      gp50
    ]
  }),
  bg({
    id: 'phb14-urchin',
    name: 'Urchin',
    summary: 'You survived alone on city streets. Sleight of Hand and Stealth, Thieves’ Tools, and the Lucky feat.',
    description: `**Ability Scores:** Dexterity, Constitution, Wisdom
**Feat:** Lucky
**Skill Proficiencies:** Sleight of Hand and Stealth
**Tool Proficiency:** Thieves’ Tools (2014 also gave a Disguise Kit; add it under extra proficiencies if you want it)
**Equipment:** (A) Dagger, Map of your home city, Pet mouse, Token of your parents, Traveler’s Clothes, Pouch, 10 GP; or (B) 50 GP

**City Secrets (2014 feature):** outside combat, you and your companions move through a city at twice your normal travel pace.

${CONVERTED}`,
    abilityScores: ['dex', 'con', 'wis'],
    originFeat: 'lucky',
    skills: ['sleightOfHand', 'stealth'],
    tool: 'thieves-tools',
    equipment: [
      {
        label: 'A',
        items: [
          { id: 'dagger' },
          { id: 'map', name: 'Map (home city)' },
          { name: 'Pet mouse' },
          { name: 'Token of your parents' },
          { id: 'travelers-clothes' },
          { id: 'pouch' }
        ],
        gp: 10
      },
      gp50
    ]
  })
]
