// More common magic items from the 2024 Dungeon Master's Guide that are not in the SRD 5.2.1.
// Only names, rarity/type/attunement and short summaries written in our own words.
// Source is tagged 'PHB 2024' (app convention for non-SRD books).
import type { MagicItemDef } from '../types'

const common = (
  id: string,
  name: string,
  summary: string,
  itemType = 'Wondrous Item',
  attunement: boolean | string = false,
  extra: Partial<MagicItemDef> = {}
): MagicItemDef => ({
  id,
  name,
  kind: 'magicItem',
  source: 'PHB 2024',
  itemType,
  rarity: 'common',
  attunement,
  summary,
  description: `${summary}\n\n*Summary written for this app; see the Dungeon Master’s Guide (2024) for the full text.*`,
  tags: ['dmg-2024', 'common-magic'],
  ...extra
})

export const magicItemsDmg2: MagicItemDef[] = [
  common('armor-of-gleaming', 'Armor of Gleaming', 'This armor always stays shiny and clean, no matter what you wade through.', 'Armor (Any Medium or Heavy)'),
  common('cast-off-armor', 'Cast-Off Armor', 'You can take this armor off as a single action instead of the usual time.', 'Armor (Any Light, Medium, or Heavy)'),
  common('bead-of-refreshment', 'Bead of Refreshment', 'Drop this spongy bead into a container of liquid and it dissolves, turning up to a pint of the liquid into fresh, drinkable water.'),
  common('boots-of-false-tracks', 'Boots of False Tracks', 'Only a Humanoid can wear these boots. While you do, you can make your footprints look like those of another kind of Humanoid.'),
  common('candle-of-the-deep', 'Candle of the Deep', 'The flame of this candle keeps burning even when it is submerged in water. It sheds light like an ordinary candle and burns for a limited time.'),
  common('clothes-of-mending', 'Clothes of Mending', 'This outfit repairs its own everyday wear and tear each day, though it can still be destroyed.'),
  common('dread-helm', 'Dread Helm', 'While you wear this fearsome steel helm, your eyes glow red and the rest of your face is hidden in shadow.'),
  common('ear-horn-of-hearing', 'Ear Horn of Hearing', 'While you hold this horn to your ear, it suppresses the Deafened condition on you so that you can hear normally.'),
  common('ersatz-eye', 'Ersatz Eye', 'This artificial eye replaces a real one that was lost. While it is in your eye socket, you can see through it as if it were your own, and only you can remove it.', 'Wondrous Item', true),
  common('hat-of-wizardry', 'Hat of Wizardry', 'This pointed hat works as a spellcasting focus for your Wizard spells, and it lets you occasionally attempt to cast a Wizard cantrip you don’t know.', 'Wondrous Item', 'by a Wizard'),
  common('horn-of-silent-alarm', 'Horn of Silent Alarm', 'When you blow this horn, only one creature of your choice within a long distance can hear the blast. It has a few charges that recover each dawn.'),
  common('instrument-of-illusions', 'Instrument of Illusions', 'While you play this musical instrument, you can create harmless, purely visual illusions in a small area around you.', 'Wondrous Item', true),
  common('instrument-of-scribing', 'Instrument of Scribing', 'While you play this musical instrument, you can magically write a short message on an object you can see; it has limited charges that return at dawn.', 'Wondrous Item', true),
  common('lock-of-trickery', 'Lock of Trickery', 'This lock looks ordinary but is magically devious, making it much harder for anyone to pick.'),
  common('perfume-of-bewitching', 'Perfume of Bewitching', 'A single-use vial of scent. Once applied, it gives you Advantage on Charisma checks aimed at weak Humanoids for about an hour.', 'Potion'),
  common('pole-of-angling', 'Pole of Angling', 'On command, this 10-foot pole turns into a fishing pole complete with line and hook, and back again.'),
  common('pole-of-collapsing', 'Pole of Collapsing', 'On command, this 10-foot pole collapses into a short rod for easy storage, and extends again when you wish.'),
  common('talking-doll', 'Talking Doll', 'During a rest you can teach this doll a handful of short phrases, and it speaks one of them whenever a condition you set is met nearby.', 'Wondrous Item', true),

  /* Instruments of the Bards: rarity per instrument; each lets a Bard cast a set of spells from it once per dawn. */
  ...(
    [
      ['fochlucan-bandore', 'Fochlucan Bandore', 'uncommon'],
      ['mac-fuirmidh-cittern', 'Mac-Fuirmidh Cittern', 'uncommon'],
      ['doss-lute', 'Doss Lute', 'uncommon'],
      ['canaith-mandolin', 'Canaith Mandolin', 'rare'],
      ['cli-lyre', 'Cli Lyre', 'rare'],
      ['anstruth-harp', 'Anstruth Harp', 'very rare'],
      ['ollamh-harp', 'Ollamh Harp', 'legendary']
    ] as const
  ).map(([id, name, rarity]) =>
    common(
      id,
      `Instrument of the Bards (${name})`,
      'A masterwork instrument of the bardic colleges. While attuned to it, a Bard can play it to cast a fixed set of spells, each once per dawn; higher-rarity instruments offer stronger spells.',
      'Wondrous Item',
      'by a Bard',
      { rarity, tags: ['dmg-2024', 'instrument-of-the-bards'] }
    )
  )
]
