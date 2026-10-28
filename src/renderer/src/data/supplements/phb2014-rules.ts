import type { RuleDef } from '../../types'
import { PHB14 } from './phb2014-subclasses'

/** How 2014 Player's Handbook content is used with 2024 rules. Own-words summary only. */
export const phb2014Rules: RuleDef[] = [
  {
    id: 'phb14-compat',
    name: 'Using 2014 Content with 2024 Rules',
    kind: 'rule',
    source: 'Supplement',
    sourceBook: PHB14,
    category: 'PHB 2014',
    summary: 'How the 2014 subclasses, backgrounds and feats in this app are converted to work with 2024 characters.',
    description: `The app includes a few 2014 Player’s Handbook options that have no 2024 version: Path of the Totem Warrior, Nature and Tempest Domains, Way of the Four Elements, the Schools of Conjuration, Enchantment, Necromancy and Transmutation, the Folk Hero, Guild Artisan, Outlander and Urchin backgrounds, and the Dungeon Delver, Linguist, Martial Adept and Mobile feats.

**Conversion rules used**
- Ability score increases come from your background, not your species.
- 2014 backgrounds get three ability scores and an Origin feat; their skills and main tool stay.
- Every subclass starts at level 3. 2014 subclass features from levels 1–2 are gained at level 3; later features keep their levels.
- Domain spells are always prepared from Cleric levels 3, 5, 7 and 9. The 2014 level-8 Divine Strike/Potent Spellcasting is dropped, since Blessed Strikes covers it.
- 2014 ki points are Focus Points.
- 2014 feats are General feats with a Level 4+ prerequisite and a +1 ability increase.

*Own-words summary; see the 2014 Player’s Handbook for the original rules.*`,
    tags: ['supplement', 'phb2014']
  }
]
