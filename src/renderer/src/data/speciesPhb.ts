// Species from the 2024 Player's Handbook that are not in the SRD 5.2.1.
// Only names, game-mechanical facts and short summaries written in our own words.
import type { Feature, SpeciesDef } from '../types'

const aasimarTraits: Feature[] = [
  {
    id: 'celestial-resistance',
    name: 'Celestial Resistance',
    level: 1,
    activation: 'passive',
    summary: 'Resistance to Necrotic and Radiant damage.',
    description: 'Your celestial heritage protects you: you have Resistance to Necrotic damage and to Radiant damage.',
    effects: [
      { target: 'resistance', op: 'grant', value: 'necrotic', note: 'Celestial Resistance' },
      { target: 'resistance', op: 'grant', value: 'radiant', note: 'Celestial Resistance' }
    ]
  },
  {
    id: 'darkvision',
    name: 'Darkvision',
    level: 1,
    activation: 'passive',
    summary: 'Darkvision with a range of 60 feet.',
    description: 'You have Darkvision with a range of 60 feet.',
    effects: [{ target: 'darkvision', op: 'min', value: 60, note: 'Aasimar' }]
  },
  {
    id: 'healing-hands',
    name: 'Healing Hands',
    level: 1,
    activation: 'action',
    uses: { count: 1, recharge: 'long' },
    summary: 'Magic action: touch a creature and roll a number of d4s equal to your Proficiency Bonus; it regains that many Hit Points. Once per Long Rest.',
    description:
      'As a Magic action, you touch a creature and channel celestial healing into it. Roll a number of d4s equal to your Proficiency Bonus; the creature regains Hit Points equal to the total. You can use this trait again after you finish a Long Rest.'
  },
  {
    id: 'light-bearer',
    name: 'Light Bearer',
    level: 1,
    activation: 'passive',
    summary: 'You know the Light cantrip; Charisma is your spellcasting ability for it.',
    description:
      'You know the *Light* cantrip, and Charisma is your spellcasting ability for it.'
  },
  {
    id: 'celestial-revelation',
    name: 'Celestial Revelation',
    level: 3,
    activation: 'bonus',
    uses: { count: 1, recharge: 'long' },
    summary:
      'From level 3: Bonus Action to transform for 1 minute (Heavenly Wings, Inner Radiance, or Necrotic Shroud, chosen each time). Once per turn, add extra damage equal to your PB. Once per Long Rest.',
    description: `Starting at character level 3, you can take a Bonus Action to unleash your celestial nature for 1 minute or until you end it (no action required). You pick one of the forms below each time you transform. You can do this once, and regain the ability when you finish a Long Rest.

While transformed, once on each of your turns you can add extra damage equal to your Proficiency Bonus to one target you damage with an attack or a spell. The extra damage is Necrotic for Necrotic Shroud and Radiant for the other two forms.

**Heavenly Wings.** Two spectral wings sprout from your back, giving you a Fly Speed equal to your Speed.

**Inner Radiance.** You glow with Bright Light in a 10-foot radius (and Dim Light for another 10 feet). At the end of each of your turns, every creature within 10 feet of you takes Radiant damage equal to your Proficiency Bonus.

**Necrotic Shroud.** Your eyes darken and ghostly, flightless wings appear. When you transform, creatures of your choice within 10 feet must succeed on a Charisma saving throw (DC 8 + your Charisma modifier + Proficiency Bonus) or have the Frightened condition until the end of your next turn.`
  }
]

export const speciesPhb: SpeciesDef[] = [
  {
    id: 'aasimar',
    name: 'Aasimar',
    kind: 'species',
    source: 'PHB 2024',
    summary:
      'Mortals touched by the Upper Planes: necrotic and radiant resistance, Darkvision, Healing Hands, the Light cantrip, and a celestial transformation from level 3.',
    description: [
      '**Creature Type:** Humanoid  \n**Size:** Medium (about 4–7 feet tall) or Small (about 2–4 feet tall), chosen when you select this species  \n**Speed:** 30 feet',
      'Aasimar carry a spark of the heavens in their souls. Summary written for this app; see the Player’s Handbook for the full text.',
      ...aasimarTraits.map((t) => `**${t.name}.** ${t.description}`)
    ].join('\n\n'),
    creatureType: 'Humanoid',
    size: 'Small or Medium',
    speed: 30,
    darkvision: 60,
    traits: aasimarTraits,
    spells: [{ level: 1, spellId: 'light', note: 'Light Bearer (Charisma)' }],
    tags: ['celestial']
  }
]
