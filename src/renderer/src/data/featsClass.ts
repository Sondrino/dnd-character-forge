import type { FeatDef } from '../types'

/**
 * Class-spesifikke alternativer til Fighting Style (SRD 5.2.1, Paladin/Ranger level 2).
 * Lagt inn som fighting style-«feats» slik at de kan velges i samme valg.
 */
export const classFightingStyleOptions: FeatDef[] = [
  {
    id: 'blessed-warrior',
    name: 'Blessed Warrior',
    kind: 'feat',
    source: 'SRD 5.2',
    category: 'fightingStyle',
    prerequisite: 'Paladin (Fighting Style feature)',
    summary: 'Paladin option instead of a Fighting Style feat: learn two Cleric cantrips (Charisma-based).',
    description: `*Paladin alternative to a Fighting Style feat.*

**Blessed Warrior.** You learn two Cleric cantrips of your choice (see the Cleric class’s section for a list of Cleric spells). Guidance and Sacred Flame are recommended. The chosen cantrips count as Paladin spells for you, and Charisma is your spellcasting ability for them. Whenever you gain a Paladin level, you can replace one of these cantrips with another Cleric cantrip.`,
    choices: [{ id: 'cantrips', label: 'Two Cleric cantrips', count: 2, type: 'cantrip', filter: 'cleric' }]
  },
  {
    id: 'druidic-warrior',
    name: 'Druidic Warrior',
    kind: 'feat',
    source: 'SRD 5.2',
    category: 'fightingStyle',
    prerequisite: 'Ranger (Fighting Style feature)',
    summary: 'Ranger option instead of a Fighting Style feat: learn two Druid cantrips (Wisdom-based).',
    description: `*Ranger alternative to a Fighting Style feat.*

**Druidic Warrior.** You learn two Druid cantrips of your choice (see the Druid class’s section for a list of Druid spells). Guidance and Starry Wisp are recommended. The chosen cantrips count as Ranger spells for you, and Wisdom is your spellcasting ability for them. Whenever you gain a Ranger level, you can replace one of these cantrips with another Druid cantrip.`,
    choices: [{ id: 'cantrips', label: 'Two Druid cantrips', count: 2, type: 'cantrip', filter: 'druid' }]
  }
]
