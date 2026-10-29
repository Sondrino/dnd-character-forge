/** Tekster for små UX-forbedringer (nb + en) */

export const polishNb = {
  undo: 'Angre',
  undoStale: 'Kan ikke angre herfra – andre endringer er gjort etterpå. Bruk Ctrl+Z.',
  deleted: '{{name}} slettet',
  modal: {
    close: 'Lukk',
    stay: 'Fortsett her',
    closeAnyway: 'Lukk likevel',
    levelUpConfirm: 'Avbryte level up? Valgene du har gjort her, blir ikke lagret.',
    resolverConfirm: 'Lukke uten å logge resultatet? Slot/bruk er allerede trukket – angre i kamploggen hvis det var feil.'
  },
  header: {
    more: 'Flere valg',
    showTips: 'Vis tips & å gjøre',
    hideTips: 'Skjul tips & å gjøre',
    exportFile: 'Eksporter som fil (.json)'
  },
  home: {
    search: 'Søk etter navn, class, species …',
    archive: 'Arkiver (pensjonert karakter)',
    unarchive: 'Hent fra arkivet',
    archived: 'Arkivert',
    showArchived: 'Vis arkiverte ({{n}})',
    allArchived: 'Alle karakterene er arkivert ({{n}}). Slå på «Vis arkiverte» for å se dem.'
  },
  labels: {
    armorClass: 'Armor Class',
    cantrip: 'Cantrip',
    spellLevel: 'Nivå {{n}}',
    slotShort: 'N{{n}}',
    slotsLeft: '{{n}} av {{max}} ledige',
    pactShort: 'Pact (N{{n}})',
    pactSlots: 'Pact-slots',
    classSpellcasting: '{{cls}} Spellcasting',
    lvl: 'Lvl {{n}}'
  },
  inv: {
    tooMany: 'For mange attuned items ({{n}}/3). Du kan bare være attuned til 3 samtidig – fjern attunement fra et item.'
  },
  spells: {
    search: 'Søk i dine spells …',
    preparedOnly: 'Bare prepared',
    ritual: 'Ritual',
    concentration: 'Concentration',
    time: 'Casting time',
    timeAll: 'Alle casting times',
    timeAction: 'Action',
    timeBonus: 'Bonus action',
    timeReaction: 'Reaction',
    count: 'Viser {{n}} av {{total}}',
    clear: 'Nullstill'
  },
  attack: {
    crit: 'Krit',
    critTip: 'Rull krit-skade (dobbelt så mange terninger)',
    damageTip: 'Klikk: rull skade · Høyreklikk: neste kast blir krit',
    critArmed: 'Neste kast blir krit – klikk for å rulle (høyreklikk for å avbryte)'
  },
  add: {
    to: 'Legg til hos'
  },
  combat: {
    undoLast: 'Angre siste',
    undoLastTip: 'Angre siste endring i kampen (samme som Ctrl+Z)',
    collapse: 'Skjul loggen',
    expand: 'Vis loggen'
  }
}

export const polishEn: typeof polishNb = {
  undo: 'Undo',
  undoStale: 'Can’t undo from here – other changes were made since. Use Ctrl+Z.',
  deleted: '{{name}} deleted',
  modal: {
    close: 'Close',
    stay: 'Keep going',
    closeAnyway: 'Close anyway',
    levelUpConfirm: 'Cancel the level up? The choices you made here won’t be saved.',
    resolverConfirm: 'Close without logging the result? The slot/use has already been spent – undo in the combat log if that was a mistake.'
  },
  header: {
    more: 'More options',
    showTips: 'Show tips & to-do',
    hideTips: 'Hide tips & to-do',
    exportFile: 'Export as file (.json)'
  },
  home: {
    search: 'Search by name, class, species…',
    archive: 'Archive (retired character)',
    unarchive: 'Restore from archive',
    archived: 'Archived',
    showArchived: 'Show archived ({{n}})',
    allArchived: 'All characters are archived ({{n}}). Turn on “Show archived” to see them.'
  },
  labels: {
    armorClass: 'Armor Class',
    cantrip: 'Cantrip',
    spellLevel: 'Level {{n}}',
    slotShort: 'L{{n}}',
    slotsLeft: '{{n}} of {{max}} available',
    pactShort: 'Pact (L{{n}})',
    pactSlots: 'Pact slots',
    classSpellcasting: '{{cls}} Spellcasting',
    lvl: 'Lvl {{n}}'
  },
  inv: {
    tooMany: 'Too many attuned items ({{n}}/3). You can only attune to 3 at a time – remove attunement from one.'
  },
  spells: {
    search: 'Search your spells…',
    preparedOnly: 'Prepared only',
    ritual: 'Ritual',
    concentration: 'Concentration',
    time: 'Casting time',
    timeAll: 'Any casting time',
    timeAction: 'Action',
    timeBonus: 'Bonus action',
    timeReaction: 'Reaction',
    count: 'Showing {{n}} of {{total}}',
    clear: 'Clear'
  },
  attack: {
    crit: 'Crit',
    critTip: 'Roll critical damage (double the dice)',
    damageTip: 'Click: roll damage · Right-click: next roll is a crit',
    critArmed: 'Next roll is a crit – click to roll (right-click to cancel)'
  },
  add: {
    to: 'Add to'
  },
  combat: {
    undoLast: 'Undo last',
    undoLastTip: 'Undo the last change in this combat (same as Ctrl+Z)',
    collapse: 'Collapse log',
    expand: 'Expand log'
  }
}
