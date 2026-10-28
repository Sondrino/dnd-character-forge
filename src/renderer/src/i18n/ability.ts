/** Tekster for egne spesial-evner (nb + en) */

export const abilityNb = {
  title: 'Spesial-evner', create: 'Lag spesial-evne', edit: 'Rediger spesial-evne', duplicate: 'Dupliser',
  empty: 'Ingen spesial-evner ennå',
  emptyText: 'Lag egne evner – f.eks. et pustevåpen, en velsignelse fra DM-en, en forbannelse eller en evne fra en homebrew-class. De vises på arket og kan brukes i kampmodus.',
  templates: 'Start fra en mal',
  tpl: { breath: 'Pustevåpen', weapon: 'Naturlig våpen', heal: 'Helbredelse', buff: 'Buff (av/på)', shield: 'Beskyttelse (temp HP)' },
  namePh: 'F.eks. Frost Breath', summary: 'Kort beskrivelse', summaryPh: 'Vises i lister og popups',
  description: 'Full beskrivelse (valgfritt, markdown)', descriptionPh: 'Hva skjer, rekkevidde, varighet, begrensninger …',
  uses: 'Bruk (antall eller formel)', usesPh: 'Tomt = ubegrenset. F.eks. 3, prof, mod.cha', usesNow: 'Nå: {{n}} bruk', unlimited: 'Ubegrenset', badFormula: 'Ugyldig formel',
  act: { action: 'Handling', bonus: 'Bonus action', reaction: 'Reaction', special: 'Spesiell / gratis', passive: 'Passiv (alltid på)' },
  toggle: 'Kan slås av og på', duration: 'Varighet i kamp:', rounds: 'runder (10 = 1 minutt)',
  toggleHint: 'Effektene gjelder bare mens evnen er slått på – slå den av/på her, på arket eller ved å bruke den i kampmodus.',
  alwaysHint: 'Effektene gjelder alltid. Slå på «Kan slås av og på» for evner som Rage eller en forvandling.',
  combat: 'I kamp', combatHint: 'Velg hva som skjer når du bruker evnen i kampmodus. Ekte terninger eller app-terninger – begge deler virker.',
  kind: { none: 'Ingen rulling', attack: 'Angrep', save: 'Save (DC)', damage: 'Skade (treffer automatisk)', heal: 'Helbredelse', temp: 'Temp HP' },
  attackBonus: 'Angrepsbonus', attackType: 'Type', saveAbility: 'Save', damageDice: 'Skade', healDice: 'Helbredelse', tempDice: 'Temp HP',
  damageType: 'Skadetype', halfOnSave: 'Halv skade ved vellykket save', range: 'Rekkevidde / område',
  formulaHelp: 'Formler: tall, prof, level, mod.str … mod.cha, f.eks. «8+prof+mod.con» eller «2d6+mod.cha».',
  auto: { attack: '{{n}} to hit, {{dice}} {{type}}', save: '{{ab}} save DC {{dc}}, {{dice}} {{type}}', heal: 'helbreder {{dice}}', temp: '{{dice}} temp HP', toggle: 'av/på' },
  preview: 'Forhåndsvisning', nEffects: '{{n}} effekt(er)', on: 'På', off: 'Av'
}

export const abilityEn: typeof abilityNb = {
  title: 'Special abilities', create: 'Create special ability', edit: 'Edit special ability', duplicate: 'Duplicate',
  empty: 'No special abilities yet',
  emptyText: 'Create your own abilities – e.g. a breath weapon, a blessing from your DM, a curse or an ability from a homebrew class. They show on the sheet and can be used in combat mode.',
  templates: 'Start from a template',
  tpl: { breath: 'Breath weapon', weapon: 'Natural weapon', heal: 'Healing', buff: 'Buff (on/off)', shield: 'Protection (temp HP)' },
  namePh: 'E.g. Frost Breath', summary: 'Short description', summaryPh: 'Shown in lists and popups',
  description: 'Full description (optional, markdown)', descriptionPh: 'What happens, range, duration, limits …',
  uses: 'Uses (number or formula)', usesPh: 'Empty = unlimited. E.g. 3, prof, mod.cha', usesNow: 'Now: {{n}} use(s)', unlimited: 'Unlimited', badFormula: 'Invalid formula',
  act: { action: 'Action', bonus: 'Bonus action', reaction: 'Reaction', special: 'Special / free', passive: 'Passive (always on)' },
  toggle: 'Can be switched on and off', duration: 'Duration in combat:', rounds: 'rounds (10 = 1 minute)',
  toggleHint: 'The effects only apply while the ability is on – switch it here, on the sheet or by using it in combat mode.',
  alwaysHint: 'The effects always apply. Turn on “Can be switched on and off” for abilities like Rage or a transformation.',
  combat: 'In combat', combatHint: 'Choose what happens when you use the ability in combat mode. Works with real dice and app dice.',
  kind: { none: 'No roll', attack: 'Attack', save: 'Save (DC)', damage: 'Damage (auto-hit)', heal: 'Healing', temp: 'Temp HP' },
  attackBonus: 'Attack bonus', attackType: 'Type', saveAbility: 'Save', damageDice: 'Damage', healDice: 'Healing', tempDice: 'Temp HP',
  damageType: 'Damage type', halfOnSave: 'Half damage on a successful save', range: 'Range / area',
  formulaHelp: 'Formulas: numbers, prof, level, mod.str … mod.cha, e.g. “8+prof+mod.con” or “2d6+mod.cha”.',
  auto: { attack: '{{n}} to hit, {{dice}} {{type}}', save: '{{ab}} save DC {{dc}}, {{dice}} {{type}}', heal: 'heals {{dice}}', temp: '{{dice}} temp HP', toggle: 'on/off' },
  preview: 'Preview', nEffects: '{{n}} effect(s)', on: 'On', off: 'Off'
}
