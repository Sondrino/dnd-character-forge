/** Tekster for Wild Shape, companions, dagbok, hurtigsøk, hurtigtaster, UI-skala og terningmakroer (nb + en) */

export const toolsNb = {
  wildShape: {
    title: 'Wild Shape', known: 'Kjente former {{n}}/{{max}}', limits: 'Maks CR {{cr}} · {{fly}}', flyYes: 'fly speed tillatt', flyNo: 'ingen fly speed',
    pick: 'Velg former', pickTitle: 'Velg kjente Wild Shape-former (maks {{n}})', none: 'Ingen kjente former ennå – velg opptil {{n}} Beasts.',
    use: 'Wild Shape', useTip: 'Bonus Action: bruk én Wild Shape og få {{n}} Temporary Hit Points', noUses: 'Ingen Wild Shape-bruk igjen',
    revert: 'Tilbake til normal form', active: 'Aktiv form', uses: 'Bruk igjen', entered: 'Du er nå {{name}} (+{{n}} temp HP)', reverted: 'Tilbake i normal form',
    statBlock: 'Vis stat block', hideStatBlock: 'Skjul stat block', attacks: 'Angrep', noAttacks: 'Ingen angrep i stat blocken.',
    formHp: 'HP i stat block', keepHp: 'Du beholder dine egne HP, Hit Dice, INT/WIS/CHA, class features og feats. Du kan ikke kaste spells.',
    moonAc: 'Circle Forms: AC minst {{n}}', remove: 'Fjern formen', notEligible: 'Passer ikke lenger (CR eller fly speed)', duration: 'Varer opptil {{n}} timer',
    replaceHint: 'Etter en Long Rest kan du bytte ut én kjent form.'
  },
  companions: {
    title: 'Companions', add: 'Fra bestiariet', addCustom: 'Egen', pickTitle: 'Legg til companion fra bestiariet',
    empty: 'Ingen companions – legg til en familiar, dyrevenn, steed eller summon.', name: 'Navn', maxHp: 'Maks HP', ac: 'AC', kind: 'Type',
    kinds: { familiar: 'Familiar', companion: 'Dyrevenn', steed: 'Steed', summon: 'Summon', other: 'Annet' },
    damage: 'Skade', heal: 'Heal', temp: 'Temp', notes: 'Notater', remove: 'Fjern', statBlock: 'Vis stat block', down: 'Nede',
    amountTip: 'Skriv et tall og trykk Skade, Heal eller Temp', toInit: 'Legg companions i initiativ', toInitTip: 'HP-endringer i kampen skrives tilbake til arket',
    create: 'Legg til'
  },
  journal: {
    tab: 'Dagbok', title: 'Sesjonsdagbok', new: 'Ny oppføring', entryTitle: 'Tittel', date: 'Dato', text: 'Hva skjedde i økten?',
    edit: 'Rediger', empty: 'Ingen oppføringer ennå. Skriv ned hva som skjedde i økten, og gi XP her.',
    awardTitle: 'Gi XP', amount: 'XP', reason: 'Grunn (f.eks. «Beseiret goblinene»)', award: 'Gi XP', awarded: '+{{n}} XP',
    xpNow: '{{xp}} XP', nextAt: 'Neste level ved {{n}} XP', max: 'Maks level', canLevel: 'Nok XP til level {{n}}!', canLevelMore: 'Nok XP til {{n}} nye level!',
    levelUp: 'Level up nå', fromJournal: '{{n}} XP gitt via dagboken', defaultAward: 'XP tildelt', deleteTitle: 'Slette oppføringen?',
    deleteText: 'Oppføringen «{{title}}» slettes. XP-en karakteren har fått, blir ikke trukket fra.', untitled: 'Uten tittel'
  },
  palette: {
    placeholder: 'Søk i alt – regler, spells, karakterer, handlinger …', hint: '↑↓ velg · Enter åpne · Esc lukk', open: 'Hurtigsøk (Ctrl+K)',
    groups: { actions: 'Handlinger', characters: 'Karakterer', entities: 'Oppslag' },
    actions: {
      dice: 'Åpne terningbrett', newChar: 'Ny karakter', shortRest: 'Short Rest – {{name}}', longRest: 'Long Rest – {{name}}',
      compendium: 'Gå til Oppslag', homebrew: 'Gå til Homebrew', settings: 'Gå til Innstillinger', home: 'Gå til Karakterer'
    },
    more: '{{n}} flere treff – skriv mer for å snevre inn'
  },
  settings: {
    uiScale: 'Størrelse på grensesnittet', uiScaleReset: 'Tilbakestill', hotkeys: 'Hurtigtaster',
    keys: {
      palette: 'Hurtigsøk i alt', dice: 'Terningbrett', tabs: 'Bytt fane på karakteren', next: 'Neste tur i kampmodus', esc: 'Lukk hurtigsøk / dialog', undo: 'Angre / gjør om'
    }
  },
  macros: {
    title: 'Makroer', add: 'Ny makro', label: 'Navn', notation: '2d6+3', save: 'Lagre makro', remove: 'Slett makro', none: 'Ingen makroer – lagre kast du bruker ofte.',
    badLabel: 'Gi makroen et navn (maks 40 tegn)', badNotation: 'Ugyldig terningnotasjon'
  }
}

export const toolsEn: typeof toolsNb = {
  wildShape: {
    title: 'Wild Shape', known: 'Known forms {{n}}/{{max}}', limits: 'Max CR {{cr}} · {{fly}}', flyYes: 'Fly Speed allowed', flyNo: 'no Fly Speed',
    pick: 'Choose forms', pickTitle: 'Choose known Wild Shape forms (max {{n}})', none: 'No known forms yet – choose up to {{n}} Beasts.',
    use: 'Wild Shape', useTip: 'Bonus Action: expend one Wild Shape use and gain {{n}} Temporary Hit Points', noUses: 'No Wild Shape uses left',
    revert: 'Return to normal form', active: 'Active form', uses: 'Uses left', entered: 'You are now a {{name}} (+{{n}} temp HP)', reverted: 'Back in your normal form',
    statBlock: 'Show stat block', hideStatBlock: 'Hide stat block', attacks: 'Attacks', noAttacks: 'No attacks in the stat block.',
    formHp: 'Stat block HP', keepHp: 'You keep your own Hit Points, Hit Dice, INT/WIS/CHA, class features and feats. You can’t cast spells.',
    moonAc: 'Circle Forms: AC at least {{n}}', remove: 'Remove form', notEligible: 'No longer eligible (CR or Fly Speed)', duration: 'Lasts up to {{n}} hours',
    replaceHint: 'After a Long Rest you can replace one known form.'
  },
  companions: {
    title: 'Companions', add: 'From bestiary', addCustom: 'Custom', pickTitle: 'Add a companion from the bestiary',
    empty: 'No companions – add a familiar, animal companion, steed or summon.', name: 'Name', maxHp: 'Max HP', ac: 'AC', kind: 'Type',
    kinds: { familiar: 'Familiar', companion: 'Companion', steed: 'Steed', summon: 'Summon', other: 'Other' },
    damage: 'Damage', heal: 'Heal', temp: 'Temp', notes: 'Notes', remove: 'Remove', statBlock: 'Show stat block', down: 'Down',
    amountTip: 'Type a number and press Damage, Heal or Temp', toInit: 'Add companions to initiative', toInitTip: 'HP changes in combat are written back to the sheet',
    create: 'Add'
  },
  journal: {
    tab: 'Journal', title: 'Session journal', new: 'New entry', entryTitle: 'Title', date: 'Date', text: 'What happened this session?',
    edit: 'Edit', empty: 'No entries yet. Write down what happened in the session, and award XP here.',
    awardTitle: 'Award XP', amount: 'XP', reason: 'Reason (e.g. “Defeated the goblins”)', award: 'Award XP', awarded: '+{{n}} XP',
    xpNow: '{{xp}} XP', nextAt: 'Next level at {{n}} XP', max: 'Max level', canLevel: 'Enough XP for level {{n}}!', canLevelMore: 'Enough XP for {{n}} new levels!',
    levelUp: 'Level up now', fromJournal: '{{n}} XP awarded via the journal', defaultAward: 'XP awarded', deleteTitle: 'Delete entry?',
    deleteText: 'The entry “{{title}}” will be deleted. XP the character has gained is not subtracted.', untitled: 'Untitled'
  },
  palette: {
    placeholder: 'Search everything – rules, spells, characters, actions …', hint: '↑↓ select · Enter open · Esc close', open: 'Quick search (Ctrl+K)',
    groups: { actions: 'Actions', characters: 'Characters', entities: 'Compendium' },
    actions: {
      dice: 'Open dice tray', newChar: 'New character', shortRest: 'Short Rest – {{name}}', longRest: 'Long Rest – {{name}}',
      compendium: 'Go to Compendium', homebrew: 'Go to Homebrew', settings: 'Go to Settings', home: 'Go to Characters'
    },
    more: '{{n}} more results – keep typing to narrow down'
  },
  settings: {
    uiScale: 'Interface size', uiScaleReset: 'Reset', hotkeys: 'Keyboard shortcuts',
    keys: {
      palette: 'Quick search everything', dice: 'Dice tray', tabs: 'Switch character tab', next: 'Next turn in combat mode', esc: 'Close quick search / dialog', undo: 'Undo / redo'
    }
  },
  macros: {
    title: 'Macros', add: 'New macro', label: 'Name', notation: '2d6+3', save: 'Save macro', remove: 'Delete macro', none: 'No macros – save rolls you use often.',
    badLabel: 'Give the macro a name (max 40 characters)', badNotation: 'Invalid dice notation'
  }
}
