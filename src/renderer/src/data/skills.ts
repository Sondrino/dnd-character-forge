import type { Ability, SkillId } from '../types'

export interface SkillInfo {
  id: SkillId
  name: string
  ability: Ability
  summary: string
}

/** SRD 5.2.1 – Skills (Playing the Game) */
export const skills: SkillInfo[] = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex', summary: 'Stay on your feet in a tricky situation, or perform an acrobatic stunt.' },
  { id: 'animalHandling', name: 'Animal Handling', ability: 'wis', summary: 'Calm or train an animal, or get an animal to behave in a certain way.' },
  { id: 'arcana', name: 'Arcana', ability: 'int', summary: 'Recall lore about spells, magic items, and the planes of existence.' },
  { id: 'athletics', name: 'Athletics', ability: 'str', summary: 'Jump farther than normal, stay afloat in rough water, or break something.' },
  { id: 'deception', name: 'Deception', ability: 'cha', summary: 'Tell a convincing lie, or wear a disguise convincingly.' },
  { id: 'history', name: 'History', ability: 'int', summary: 'Recall lore about historical events, people, nations, and cultures.' },
  { id: 'insight', name: 'Insight', ability: 'wis', summary: 'Discern the mood and intentions of a person.' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha', summary: 'Awe or threaten someone into doing what you want.' },
  { id: 'investigation', name: 'Investigation', ability: 'int', summary: 'Find obscure information in books, or deduce how something works.' },
  { id: 'medicine', name: 'Medicine', ability: 'wis', summary: 'Diagnose an illness, or determine what killed the recently slain.' },
  { id: 'nature', name: 'Nature', ability: 'int', summary: 'Recall lore about terrain, plants, animals, and weather.' },
  { id: 'perception', name: 'Perception', ability: 'wis', summary: 'Using a combination of senses, notice something that’s easy to miss.' },
  { id: 'performance', name: 'Performance', ability: 'cha', summary: 'Act, tell a story, perform music, or dance.' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha', summary: 'Honestly and graciously convince someone of something.' },
  { id: 'religion', name: 'Religion', ability: 'int', summary: 'Recall lore about gods, religious rituals, and holy symbols.' },
  { id: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dex', summary: 'Pick a pocket, conceal a handheld object, or perform legerdemain.' },
  { id: 'stealth', name: 'Stealth', ability: 'dex', summary: 'Escape notice by moving quietly and hiding behind things.' },
  { id: 'survival', name: 'Survival', ability: 'wis', summary: 'Follow tracks, forage, find a trail, or avoid natural hazards.' }
]

export const skillById = Object.fromEntries(skills.map((s) => [s.id, s])) as Record<SkillId, SkillInfo>

export const abilityNames: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
}

export const abilitySummaries: Record<Ability, string> = {
  str: 'Physical might',
  dex: 'Agility, reflexes, and balance',
  con: 'Health and stamina',
  int: 'Reasoning and memory',
  wis: 'Perceptiveness and mental fortitude',
  cha: 'Confidence, poise, and charm'
}

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'
]

/** 2024: Standard array og point buy-kostnader */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
export const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
export const POINT_BUY_TOTAL = 27

/** XP-terskler per nivå (SRD 5.2.1 Character Advancement) */
export const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
