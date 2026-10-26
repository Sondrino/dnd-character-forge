// Languages (SRD 5.2.1, CC-BY-4.0). Origins are short factual notes.
import type { LanguageDef } from '../types'

const STANDARD_TEXT =
  'The Standard Languages table lists languages that are widespread in the setting. Every player character knows Common. The other standard languages originated with the first members of the most prominent species in the setting and have since spread widely.'

const RARE_TEXT =
  'The Rare Languages table lists languages that are either secret or derived from other planes of existence and thus less widespread in the worlds of the Material Plane. Some features let a character learn a rare language.'

const lang = (
  id: string,
  name: string,
  rarity: 'standard' | 'rare',
  origin: string,
  summary: string,
  extra = ''
): LanguageDef => ({
  id,
  name,
  kind: 'language',
  source: 'SRD 5.2',
  rarity,
  origin,
  summary,
  description: `*${rarity === 'standard' ? 'Standard' : 'Rare'} language* — Origin: ${origin}\n\n${rarity === 'standard' ? STANDARD_TEXT : RARE_TEXT}${extra ? `\n\n${extra}` : ''}`
})

export const languages: LanguageDef[] = [
  lang('common', 'Common', 'standard', 'Sigil', 'The shared tongue every player character knows.', 'Your character knows at least three languages: Common plus two languages you roll or choose from the Standard Languages table.'),
  lang('common-sign-language', 'Common Sign Language', 'standard', 'Sigil', 'A widely used signed form of communication (Standard Languages table roll 1).'),
  lang('draconic', 'Draconic', 'standard', 'Dragons', 'The language of dragons and dragonborn (roll 2).'),
  lang('dwarvish', 'Dwarvish', 'standard', 'Dwarves', 'The language of dwarves (roll 3–4).'),
  lang('elvish', 'Elvish', 'standard', 'Elves', 'The language of elves (roll 5–6).'),
  lang('giant', 'Giant', 'standard', 'Giants', 'The language of giants and goliaths (roll 7).'),
  lang('gnomish', 'Gnomish', 'standard', 'Gnomes', 'The language of gnomes (roll 8).'),
  lang('goblin', 'Goblin', 'standard', 'Goblinoids', 'The language of goblinoids (roll 9).'),
  lang('halfling', 'Halfling', 'standard', 'Halflings', 'The language of halflings (roll 10–11).'),
  lang('orc', 'Orc', 'standard', 'Orcs', 'The language of orcs (roll 12).'),
  lang('abyssal', 'Abyssal', 'rare', 'Demons of the Abyss', 'The language of demons.'),
  lang('celestial', 'Celestial', 'rare', 'Celestials', 'The language of celestial beings.'),
  lang('deep-speech', 'Deep Speech', 'rare', 'Aberrations', 'The language of aberrations.'),
  lang('druidic', 'Druidic', 'rare', 'Druidic circles', 'The secret language of Druids.', 'Druids learn Druidic through their Druidic class feature; it can be used to leave hidden messages that only those who know Druidic automatically spot.'),
  lang('infernal', 'Infernal', 'rare', 'Devils of the Nine Hells', 'The language of devils.'),
  lang('primordial', 'Primordial', 'rare', 'Elementals', 'The language of elementals, including the Aquan, Auran, Ignan, and Terran dialects.', 'Primordial includes the Aquan, Auran, Ignan, and Terran dialects. Creatures that know one of these dialects can communicate with those that know a different one.'),
  lang('sylvan', 'Sylvan', 'rare', 'Fey creatures', 'The language of the fey.'),
  lang('thieves-cant', 'Thieves’ Cant', 'rare', 'Various criminal guilds', 'A secret mix of jargon and signs used by rogues and criminals.', 'Rogues learn Thieves’ Cant through their Thieves’ Cant class feature.'),
  lang('undercommon', 'Undercommon', 'rare', 'Underdark traders', 'The trade language of the Underdark.')
]
