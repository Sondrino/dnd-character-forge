import type { RuleDef } from '../../types'
import { MPMM } from './mpmm-species'

/**
 * Overview entry for Mordenkainen Presents: Monsters of the Multiverse (2022).
 * MPMM is not open-licensed: summary in our own words only. Monster stat blocks are out of scope.
 */
export const mpmmRules: RuleDef[] = [
  {
    id: 'mpmm-overview',
    name: 'Monsters of the Multiverse',
    kind: 'rule',
    source: 'Supplement',
    sourceBook: MPMM,
    category: 'Monsters of the Multiverse',
    summary: 'A 2022 sourcebook of monsters plus 30-odd revised player species; the species work with 2024 character creation as-is.',
    description: `*Mordenkainen Presents: Monsters of the Multiverse* (2022) gathers and revises the monsters and playable races of Volo’s Guide to Monsters and Mordenkainen’s Tome of Foes. Its first chapter of player species — from Aarakocra to Yuan-ti, including the four Genasi — is available in the species list.

**Using them with 2024 rules**
- MPMM species already have no fixed ability score increases — under 2024 rules your background provides them.
- Languages come from 2024 character creation (Common plus two more), not from the species.
- Traits that scale use your Proficiency Bonus, often as “uses per Long Rest”, just like 2024 species.
- Innate spells come at character levels 1, 3 and 5, cast once per Long Rest without a slot (or with slots), with Intelligence, Wisdom or Charisma as the spellcasting ability — the same pattern as 2024 lineages.
- Aasimar, Goliath and Orc also appear in MPMM, but the 2024 Player’s Handbook versions replace them, so only those are listed.

The monster stat blocks of the book are not included.

*Summary in our own words — see Mordenkainen Presents: Monsters of the Multiverse for the full text.*`,
    tags: ['supplement', 'mpmm']
  }
]
