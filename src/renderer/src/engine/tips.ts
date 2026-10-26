import type { Character } from '../types'
import type { Derived } from './compute'
import type { Lookup } from './lookup'
import { abilityNames, skillById } from '../data/skills'
import type { SkillId } from '../types'

export interface Tip {
  id: string
  level: 'warning' | 'todo' | 'suggestion' | 'info'
  /** i18n-nøkkel eller ferdig tekst (engelsk regelspråk) */
  title: string
  text: string
  area?: string
  /** Entities som kan åpnes fra tipset */
  links?: { kind: string; id: string; name: string }[]
}

export function computeTips(char: Character, d: Derived, L0: Lookup, lang: 'nb' | 'en' = 'nb'): Tip[] {
  const L = L0.extend(char.customEntities ?? [])
  const t = (nb: string, en: string): string => (lang === 'nb' ? nb : en)
  const tips: Tip[] = []
  const firstClass = L.get('class', char.classes?.[0]?.classId)

  // Uløste valg
  for (const p of d.pending) {
    tips.push({ id: `pending:${p.key}`, level: 'todo', title: p.label, text: t(`Valgt ${p.chosen} av ${p.count}.`, `Chosen ${p.chosen} of ${p.count}.`), area: p.area })
  }

  // Samme skill fra to kilder – 2024: velg en annen
  {
    const bg = L.get('background', char.backgroundId)
    const counts = new Map<string, number>()
    for (const s of bg?.skills ?? []) counts.set(s, (counts.get(s) ?? 0) + 1)
    for (const [k, v] of Object.entries(char.choices ?? {})) if (k.endsWith('#skill')) for (const s of v) counts.set(s, (counts.get(s) ?? 0) + 1)
    for (const [s, n] of counts)
      if (n > 1)
        tips.push({
          id: `dupskill:${s}`, level: 'warning', area: 'skills',
          title: t(`Dobbel proficiency: ${skillById[s as SkillId]?.name ?? s}`, `Duplicate proficiency: ${skillById[s as SkillId]?.name ?? s}`),
          text: t('Du får samme skill fra to kilder. Bytt ut det ene valget med en annen skill (Features & valg).', 'You gain the same skill from two sources – replace one choice with another skill.')
        })
  }

  if (!char.classes?.length) tips.push({ id: 'noclass', level: 'todo', title: t('Velg en class', 'Choose a class'), text: t('Start med class – den bestemmer det meste av karakteren din.', 'Start with your class – it defines most of your character.') })
  if (!char.speciesId) tips.push({ id: 'nospecies', level: 'todo', title: t('Velg species', 'Choose a species'), text: '' })
  if (!char.backgroundId) tips.push({ id: 'nobg', level: 'todo', title: t('Velg background', 'Choose a background'), text: t('Background gir ability score-bonuser, et origin feat og skills.', 'Your background gives ability score bonuses, an origin feat and skills.') })

  // Primary ability
  if (firstClass) {
    const best = firstClass.primaryAbility
      .map((a) => ({ a, s: d.abilities[a].score.value }))
      .sort((x, y) => y.s - x.s)[0]
    const highest = Math.max(...Object.values(d.abilities).map((x) => x.score.value))
    if (best && best.s < highest) {
      tips.push({
        id: 'primary', level: 'warning',
        title: t(`${abilityNames[best.a]} bør være din høyeste`, `${abilityNames[best.a]} should be your highest score`),
        text: t(`${firstClass.name} bruker ${abilityNames[best.a]} som primary ability. Legg høyeste verdi her for bedre angrep/spells.`,
          `${firstClass.name} relies on ${abilityNames[best.a]}. Put your highest score here.`)
      })
    }
    if (d.abilities.con.mod < 0 && d.totalLevel >= 1)
      tips.push({ id: 'lowcon', level: 'suggestion', title: t('Lav Constitution', 'Low Constitution'), text: t('Negativ CON-modifier gir færre hit points per nivå. Vurder å øke CON.', 'A negative CON modifier lowers HP each level.') })
    if (firstClass.spellcasting && d.abilities[firstClass.spellcasting.ability].mod < 2)
      tips.push({ id: 'castmod', level: 'warning', title: t('Svak spellcasting ability', 'Weak spellcasting ability'), text: t(`Spell save DC og spell attack bruker ${abilityNames[firstClass.spellcasting.ability]}.`, `Spell DC and attacks use ${abilityNames[firstClass.spellcasting.ability]}.`) })
  }

  // Rustning
  if (d.armorNotProficient)
    tips.push({ id: 'armorprof', level: 'warning', title: t('Ikke trent i rustningen', 'Not trained with your armor'), text: t('Uten Armor Training får du Disadvantage på alle D20 Tests med STR/DEX og kan ikke kaste spells.', 'Without training you have Disadvantage on STR/DEX D20 Tests and can’t cast spells.') })
  if (d.strengthTooLow)
    tips.push({ id: 'armorstr', level: 'warning', title: t('For lav Strength for rustningen', 'Strength too low for armor'), text: t(`${d.armorWorn?.name} krever STR ${d.armorWorn?.strength}; speed reduseres med 10 ft.`, `${d.armorWorn?.name} requires STR ${d.armorWorn?.strength}; speed −10 ft.`) })
  if (!d.armorWorn && d.proficiencies.armor.some((a) => a !== 'shield') && !d.features.some((f) => /unarmored defense/i.test(f.name)))
    tips.push({ id: 'noarmor', level: 'suggestion', title: t('Du har ingen rustning på', 'You are not wearing armor'), text: t('Du er trent i rustning – utstyr en for høyere AC (gå til Utstyr).', 'You are trained in armor – equip some for a higher AC.') })
  if (!d.armorWorn && !d.proficiencies.armor.length && firstClass?.spellcasting && ['wizard', 'sorcerer'].includes(firstClass.id) && !char.spells.some((s) => s.spellId === 'mage-armor'))
    tips.push({ id: 'magearmor', level: 'suggestion', title: t('Vurder Mage Armor', 'Consider Mage Armor'), text: t('Mage Armor gir AC 13 + DEX i 8 timer – perfekt for casters uten rustning.', 'Mage Armor sets your AC to 13 + DEX for 8 hours.'), links: [{ kind: 'spell', id: 'mage-armor', name: 'Mage Armor' }] })
  if (d.proficiencies.armor.includes('shield') && !d.shieldWorn && !d.attacks.some((a) => a.properties.includes('two-handed')))
    tips.push({ id: 'shield', level: 'suggestion', title: t('Bruk et skjold', 'Use a Shield'), text: t('Du er trent med Shield – det gir +2 AC.', 'You are trained with Shields: +2 AC.'), links: [{ kind: 'armor', id: 'shield', name: 'Shield' }] })

  // Våpen
  const weaponAttacks = d.attacks.filter((a) => a.kind === 'weapon')
  if (!weaponAttacks.length && !d.spellcasting.length && !char.classes.some((c) => c.classId === 'monk'))
    tips.push({ id: 'noweapon', level: 'suggestion', title: t('Ingen våpen utstyrt', 'No weapon equipped'), text: t('Legg til og utstyr et våpen så angrepet vises på arket.', 'Add and equip a weapon to see your attacks.') })
  for (const a of weaponAttacks) if (!a.proficient) tips.push({ id: `wprof:${a.key}`, level: 'warning', title: t(`Ikke proficient med ${a.name}`, `Not proficient with ${a.name}`), text: t('Du legger ikke til Proficiency Bonus på angrepet.', 'You don’t add your Proficiency Bonus to the attack.') })
  if (d.weaponMasteryMax > 0) {
    const notUsed = weaponAttacks.filter((a) => a.mastery && !a.masteryActive)
    if (notUsed.length && (char.weaponMasteries?.length ?? 0) < d.weaponMasteryMax)
      tips.push({ id: 'mastery', level: 'suggestion', title: t('Velg Weapon Mastery', 'Pick Weapon Masteries'), text: t(`Du kan bruke mastery-egenskapen til ${d.weaponMasteryMax} våpen. F.eks. ${notUsed.map((a) => a.name).join(', ')}.`, `You can use mastery with ${d.weaponMasteryMax} weapons.`) })
  }

  // Last
  if (d.carry.weight > d.carry.capacity)
    tips.push({ id: 'carry', level: 'warning', title: t('For tung last', 'Over carrying capacity'), text: t(`${d.carry.weight} lb av maks ${d.carry.capacity} lb. Speed blir 5 ft. hvis du bærer mer enn kapasiteten.`, `${d.carry.weight} lb of ${d.carry.capacity} lb.`) })

  // Attunement
  if (d.attunedCount > 3) tips.push({ id: 'attune', level: 'warning', title: t('For mange attuned items', 'Too many attuned items'), text: t('Du kan bare være attuned til 3 magic items samtidig.', 'You can attune to at most 3 magic items.') })

  // HP
  if (char.hp.current <= 0 && char.classes.length) tips.push({ id: 'dying', level: 'warning', title: t('0 Hit Points', '0 Hit Points'), text: t('Du er Unconscious og må slå Death Saving Throws.', 'You are Unconscious and must make Death Saving Throws.') })

  // Class-tips og anbefalinger
  if (firstClass) {
    for (const [i, tip] of (firstClass.tips ?? []).entries()) tips.push({ id: `classtip:${i}`, level: 'info', title: `${firstClass.name}`, text: tip })
    const rec = firstClass.recommended ?? {}
    const link = (kind: string, ids?: string[]): Tip['links'] =>
      (ids ?? []).map((id) => ({ kind, id, name: (L.get(kind as never, id) as { name?: string } | undefined)?.name ?? id })).filter((x) => L.get(x.kind as never, x.id))
    if (rec.feats?.length) tips.push({ id: 'recfeats', level: 'suggestion', title: t('Anbefalte feats', 'Recommended feats'), text: t(`Gode feats for ${firstClass.name}:`, `Strong feats for ${firstClass.name}:`), links: link('feat', rec.feats) })
    if (rec.cantrips?.length || rec.spells?.length) tips.push({ id: 'recspells', level: 'suggestion', title: t('Anbefalte spells', 'Recommended spells'), text: t('Populære valg:', 'Popular picks:'), links: [...(link('spell', rec.cantrips) ?? []), ...(link('spell', rec.spells) ?? [])] })
    if (!char.backgroundId && rec.backgrounds?.length) tips.push({ id: 'recbg', level: 'suggestion', title: t('Anbefalte backgrounds', 'Recommended backgrounds'), text: '', links: link('background', rec.backgrounds) })
    if (!char.speciesId && rec.species?.length) tips.push({ id: 'recspecies', level: 'suggestion', title: t('Anbefalte species', 'Recommended species'), text: '', links: link('species', rec.species) })
    if (rec.weapons?.length && !weaponAttacks.length) tips.push({ id: 'recweapons', level: 'suggestion', title: t('Anbefalte våpen', 'Recommended weapons'), text: '', links: link('weapon', rec.weapons) })
    if (firstClass.quickBuild) tips.push({ id: 'quickbuild', level: 'info', title: t('Quick build', 'Quick build'), text: firstClass.quickBuild })
  }

  // Utstyrssjekker
  const has = (id: string): boolean => char.inventory.some((i) => i.refId === id)
  if (firstClass?.spellcasting && !char.inventory.some((i) => /focus|holy-symbol|component-pouch|spellbook|crystal|orb|rod|staff|wand|instrument|lute|flute|lyre|drum|horn|viol/.test(i.refId ?? '')))
    tips.push({ id: 'focus', level: 'suggestion', title: t('Mangler spellcasting focus', 'Missing a spellcasting focus'), text: t(`${firstClass.name} bruker en ${firstClass.spellcasting.focus ?? 'focus'} eller Component Pouch for material components.`, `Use a ${firstClass.spellcasting.focus ?? 'focus'} or Component Pouch for material components.`) })
  if (firstClass?.id === 'wizard' && !has('spellbook')) tips.push({ id: 'spellbook', level: 'warning', title: t('Mangler Spellbook', 'Missing Spellbook'), text: t('Wizards trenger en spellbook for å lære og forberede spells.', 'Wizards need a spellbook.') })
  if (!char.inventory.some((i) => /potion-of-healing|healers-kit/.test(i.refId ?? '')))
    tips.push({ id: 'healing', level: 'suggestion', title: t('Ta med healing', 'Bring healing'), text: t('En Potion of Healing eller Healer’s Kit kan redde livet ditt.', 'A Potion of Healing or Healer’s Kit can save your life.'), links: [{ kind: 'gear', id: 'potion-of-healing', name: 'Potion of Healing' }, { kind: 'gear', id: 'healers-kit', name: 'Healer’s Kit' }].filter((x) => L.item(x.id)) })
  if (!char.inventory.some((i) => /rope|torch|lamp|lantern|rations|explorers-pack|dungeoneers-pack|burglars-pack|priests-pack|scholars-pack|entertainers-pack|diplomats-pack/.test(i.refId ?? '')))
    tips.push({ id: 'pack', level: 'suggestion', title: t('Eventyrutstyr', 'Adventuring gear'), text: t('Et Explorer’s Pack eller Dungeoneer’s Pack gir det mest grunnleggende (tau, fakler, mat).', 'An Explorer’s or Dungeoneer’s Pack covers the basics.') })
  if (!char.name) tips.push({ id: 'name', level: 'todo', title: t('Gi karakteren et navn', 'Name your character'), text: '' })
  if (!char.details.backstory) tips.push({ id: 'backstory', level: 'info', title: t('Skriv en backstory', 'Write a backstory'), text: t('Noen setninger om hvor karakteren kommer fra og hva hen vil oppnå gjør rollespillet lettere.', 'A few lines on origins and goals help roleplay.') })

  return tips
}
