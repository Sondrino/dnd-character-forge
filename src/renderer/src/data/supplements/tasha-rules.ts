import type { RuleDef, SpeciesDef } from '../../types'
import { TCE } from './tasha-subclasses'

/**
 * Custom Lineage and the player-facing optional rules from Tasha's Cauldron of Everything.
 * TCE is not open-licensed: only short summaries in our own words.
 */

const OWN = '*Summary in our own words — see Tasha’s Cauldron of Everything for the full text.*'
const CAT = 'Tasha’s Optional Rules'

export const customLineage: SpeciesDef = {
  id: 'custom-lineage',
  name: 'Custom Lineage',
  kind: 'species',
  source: 'Supplement',
  sourceBook: TCE,
  summary: 'Build your own origin: a Small or Medium humanoid with a free feat and either Darkvision or an extra skill.',
  description: `Custom Lineage lets you play a character whose origin doesn’t match any listed species — a unique being shaped by magic, a curse or an unusual heritage. You choose your size, pick Darkvision or a skill, and gain a feat.

| Trait | |
|---|---|
| **Creature Type** | Humanoid |
| **Size** | Small or Medium (your choice) |
| **Speed** | 30 feet |

**Adapted to 2024 rules:**
- TCE gave +2 to one ability score; in 2024 ability increases come from your background, so that bonus is left out.
- TCE allowed any feat you qualified for at level 1; in 2024, level-1 characters can only take Origin feats, so the Feat trait offers an Origin feat.
- Languages come from the 2024 character-creation rules (Common plus two more), not from the lineage.
- If you pick the skill option, record the skill under extra proficiencies on the character sheet.

${OWN}`,
  tags: ['supplement', 'tce'],
  creatureType: 'Humanoid',
  size: 'Small or Medium',
  speed: 30,
  traits: [
    {
      id: 'custom-lineage-feat',
      name: 'Feat',
      level: 1,
      activation: 'passive',
      summary: 'You gain an Origin feat of your choice (adapted from TCE’s “any feat you qualify for”).',
      description: 'You gain one Origin feat of your choice. (TCE allowed any feat you qualify for; 2024 rules limit level-1 characters to Origin feats.)',
      choices: [{ id: 'feat', label: 'Custom Lineage: choose an Origin feat', count: 1, type: 'feat', filter: 'origin' }]
    },
    {
      id: 'custom-lineage-variable-trait',
      name: 'Variable Trait',
      level: 1,
      activation: 'passive',
      summary: 'Choose one: Darkvision out to 60 feet, or proficiency in one skill of your choice.',
      description: 'Choose one: Darkvision with a range of 60 feet, or proficiency in one skill of your choice. Pick the option under Variable Trait.'
    }
  ],
  options: {
    label: 'Variable Trait',
    choices: [
      {
        id: 'custom-lineage-darkvision',
        name: 'Darkvision',
        summary: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
        description: 'You have Darkvision with a range of 60 feet.',
        effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Custom Lineage' }]
      },
      {
        id: 'custom-lineage-skill',
        name: 'Skill Proficiency',
        summary: 'You gain proficiency in one skill of your choice.',
        description: 'You gain proficiency in one skill of your choice. Add it under extra proficiencies on the character sheet.'
      }
    ]
  }
}

const rule = (id: string, name: string, summary: string, description: string, tags: string[] = []): RuleDef => ({
  id,
  name,
  kind: 'rule',
  source: 'Supplement',
  sourceBook: TCE,
  category: CAT,
  summary,
  description: `${description}\n\n${OWN}`,
  tags: ['supplement', 'tce', ...tags]
})

export const tashaRules: RuleDef[] = [
  rule('tce-customizing-your-origin', 'Customizing Your Origin',
    'An optional rule for moving your species’ ability increases, languages and proficiencies around so your character isn’t locked into a stereotype.',
    `TCE lets you rearrange the parts of your origin that represent culture and training rather than biology:

- **Ability Score Increases:** move any ability increase your species gives to a different ability (never stacking more than one onto the same score).
- **Languages:** swap a species language for another from the standard list your DM allows.
- **Proficiencies:** swap a weapon, armor or tool proficiency from your species for a different one of the same kind (skills for skills, tools for tools, and so on).

With 2024 rules, ability increases already come from your background, so this rule mostly matters for languages, for proficiencies and for older 2014-style species. Custom Lineage is the extreme version of the same idea.`,
    ['character-creation']),
  rule('tce-changing-a-subclass', 'Changing a Subclass',
    'With your DM’s approval, you can swap your subclass for another of the same class when the story supports it.',
    `Sometimes a character’s path changes — a cleric’s faith shifts, or a fighter studies a new style. TCE suggests letting the player trade their current subclass for another one from the same class, replacing all its features with the new subclass’s features for their level. The DM may tie the change to a story event, training time or a quest. Anything that is tied to the old subclass (subclass spells, companions and so on) is replaced.`,
    ['character-advancement']),
  rule('tce-changing-a-skill', 'Changing a Skill',
    'When you gain an Ability Score Improvement, you can swap one class skill proficiency for another from that class’s list.',
    `Whenever you reach a level that grants the Ability Score Improvement feature, you can replace one skill proficiency your class gave you with another skill from the same class’s starting list. This represents shifting focus over a career. In the 2024 rules this pairs naturally with the levels where you gain a feat.`,
    ['character-advancement']),
  rule('tce-changing-a-fighting-style', 'Changing a Fighting Style',
    'When you gain an Ability Score Improvement, a class with Fighting Style can swap its style for another it qualifies for.',
    `If you have the Fighting Style feature, whenever you reach a level that grants an Ability Score Improvement you can replace your fighting style with another available to your class. In 2024 terms, you replace your Fighting Style feat with another Fighting Style feat (the 2024 Fighter can already do this whenever it gains a level).`,
    ['character-advancement']),
  rule('tce-changing-a-cantrip', 'Changing a Cantrip',
    'When you gain an Ability Score Improvement, you can swap one class cantrip for another from the same class list.',
    `Whenever you reach a level that grants the Ability Score Improvement feature, you can replace one cantrip you learned from a class’s Spellcasting or Pact Magic feature with another cantrip from that class’s spell list. The 2024 classes include similar swaps on level-up, so this mostly matters for 2014-era content.`,
    ['character-advancement']),
  rule('tce-optional-class-features', 'Optional Class Features',
    'TCE added optional extra features for every class; most were absorbed into the 2024 classes, and a few remain as DM-approved options.',
    `TCE gave each 2014 class extra or replacement features (Primal Knowledge, Steady Aim, Wild Companion, Favored Foe, Martial Versatility and many more). The 2024 Player’s Handbook folded most of them into the classes themselves.

Still useful with 2024 classes, and listed as “Optional Class Features (TCE)” on the class pages: Magical Inspiration (Bard), Harness Divine Power (Cleric and Paladin), Quickened Healing and Focused Aim (Monk), Primal Awareness (Ranger) and Magical Guidance (Sorcerer). New invocations, maneuvers and the Superior Technique fighting style are in their normal option lists.`,
    ['class-options']),
  rule('tce-sidekicks', 'Sidekicks',
    'Rules for turning a friendly creature into a companion that gains levels alongside the party as an Expert, Spellcaster or Warrior.',
    `A sidekick is a creature (usually of challenge rating 1/2 or lower) that joins the party and levels up as a simplified character. It gains a sidekick class:

- **Expert** — skill-focused helper with Expertise, Cunning Action-style mobility and support tricks.
- **Spellcaster** — chooses the Healer, Mage or Prodigy role and gains a small spell list and slots.
- **Warrior** — chooses the Attacker or Defender role and gains combat features like extra attacks and protection.

Sidekicks advance from level 1 to 20 using their own tables, gaining Hit Dice, proficiency and features. The DM usually controls them, though a player can run one for a small group.`,
    ['companion']),
  rule('tce-group-patrons', 'Group Patrons',
    'An organization or powerful person that backs the whole party, providing perks, contacts and missions.',
    `A group patron gives the party a shared employer or sponsor, a reason to adventure together and benefits such as resources, contacts or a base. TCE describes eight patron types, each with perks, typical roles in the organization and quest ideas:

- **Academy** — a school or research institute.
- **Ancient Being** — a dragon, celestial, fiend or similar mighty creature.
- **Aristocrat** — a noble family or wealthy individual.
- **Criminal Syndicate** — thieves’ guilds, smugglers and gangs.
- **Guild** — merchants, artisans or a professional association.
- **Military Force** — an army, mercenary company or knightly order.
- **Religious Order** — a temple, cult or monastic order.
- **Sovereign** — a ruler or government.`,
    ['campaign']),
  rule('tce-magic-tattoos', 'Magic Tattoos',
    'Magic items applied to the skin with a magic needle; you attune to them while they are applied, and rarer tattoos cover more of the body.',
    `Magic tattoos are a category of wondrous item. A tattoo is applied with its special needle in a process that takes about an hour, and you attune to the tattoo as part of that process; it counts toward your attunement limit. If the attunement ends or the tattoo is removed, its magic fades. More powerful tattoos are larger: a common one fits on a hand or foot, while very rare and legendary tattoos can cover limbs, the back or the chest. The look of a tattoo is up to you.

Examples: Illuminator’s, Masquerade, Barrier, Coiling Grasp, Eldritch Claw, Spellwrought, Shadowfell Brand, Absorbing, Ghost Step, Lifewell and Blood Fury tattoos.`,
    ['magic-items']),
  rule('tce-session-zero', 'Session Zero',
    'A pre-campaign meeting where the group agrees on tone, boundaries, character connections and how the table will play.',
    `TCE recommends starting a campaign with a “session zero”: the group talks about the campaign’s premise and tone, creates characters together so they fit the setting and each other, sets out the social contract (expectations about attendance, play style and behavior) and agrees on content boundaries — topics to avoid or handle off-screen. Safety tools such as lines and veils or an X-card make it easy to adjust during play. Players can also decide how their characters know each other before the first adventure.`,
    ['campaign'])
]
