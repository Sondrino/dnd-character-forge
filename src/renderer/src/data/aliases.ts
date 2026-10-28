/**
 * SRD 5.2 drops the wizard names from some spells. These are the names used in the
 * 2024 Player's Handbook, so search finds "Melf's Acid Arrow" as well as "Acid Arrow".
 */
export const SPELL_ALIASES: Record<string, string[]> = {
  'acid-arrow': ['Melf’s Acid Arrow'],
  'arcane-hand': ['Bigby’s Hand'],
  'arcane-sword': ['Mordenkainen’s Sword'],
  'arcanists-magic-aura': ['Nystul’s Magic Aura'],
  'black-tentacles': ['Evard’s Black Tentacles'],
  'faithful-hound': ['Mordenkainen’s Faithful Hound'],
  'floating-disk': ['Tenser’s Floating Disk'],
  'freezing-sphere': ['Otiluke’s Freezing Sphere'],
  'hideous-laughter': ['Tasha’s Hideous Laughter'],
  'instant-summons': ['Drawmij’s Instant Summons'],
  'irresistible-dance': ['Otto’s Irresistible Dance'],
  'magnificent-mansion': ['Mordenkainen’s Magnificent Mansion'],
  'private-sanctum': ['Mordenkainen’s Private Sanctum'],
  'resilient-sphere': ['Otiluke’s Resilient Sphere'],
  'secret-chest': ['Leomund’s Secret Chest'],
  'telepathic-bond': ['Rary’s Telepathic Bond'],
  'tiny-hut': ['Leomund’s Tiny Hut']
}

/** Temporary Hit Points fra spells (feltet `tempHp`). Oppskalering leses fra higherLevels. */
export const SPELL_TEMP_HP: Record<string, string> = {
  'false-life': '2d4+4',
  'armor-of-agathys': '5',
  heroism: 'spellcasting modifier',
  'power-word-fortify': '120',
  'sup-motivational-speech': '5',
  'sup-guardian-of-nature': '10',
  'sup-tensers-transformation': '50'
}
