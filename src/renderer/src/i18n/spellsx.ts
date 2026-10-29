/** Tekster for casting utenfor kamp, varige effekter, conditions, invocation-krav og hvile (nb + en) */

export const spellsxNb = {
  mode: {
    normal: 'Advantage og Disadvantage opphever hverandre',
    advantage: 'Advantage forhåndsvalgt',
    disadvantage: 'Disadvantage forhåndsvalgt'
  },
  // Kast-dialogen
  ritual: 'Ritual (+10 min, ingen slot)',
  ritualTime: '{{time}} + 10 minutter (ritual)',
  ritualNote: 'Kastes som ritual: tar 10 minutter lenger og bruker ingen spell slot.',
  upcast: 'På level {{n}}: {{what}}',
  tracked: 'Concentration og effekter med varighet lagres på arket og følger med inn i neste kamp.',
  castDone: '{{name}} kastet{{how}}',
  log: { ritual: 'ritual', carriedIn: 'Fortsatt aktivt fra før kampen: {{names}}' },
  // Aktive effekter på arket
  rounds: '{{n}} runder',
  minutes: '{{n}} min',
  hours: '{{n}} t',
  hoursMinutes: '{{h}} t {{m}} min',
  expired: 'Utløpt: {{names}}',
  concTip: 'Du konsentrerer deg. Skade gir en Constitution save (DC 10 eller halve skaden); Incapacitated eller et nytt concentration-spell avslutter den.',
  endConc: 'Avslutt concentration',
  removeEffect: 'Fjern effekten',
  timePasses: 'Tiden går:',
  plusRound: '+1 runde',
  plusMinute: '+1 min',
  plusTenMinutes: '+10 min',
  plusHour: '+1 time',
  inCombat: 'Styres i kampmodus',
  concSave: 'Du konsentrerer deg: slå en Constitution save, DC {{dc}}, for å beholde concentration.',
  // Egne evner
  featureConc: 'Concentration',
  featureConcTip: 'Evnen krever concentration som et spell: den avslutter annen concentration og kan mistes ved skade.',
  // Språk
  rareLangHint: 'krever vanligvis DM-ens godkjenning ved opprettelse',
  // Hvile
  rest: {
    hitDie: 'Hit Die (d{{die}})',
    left: 'igjen',
    min1: 'minst 1 HP per terning',
    hdGain: 'd{{die}}: +{{n}} HP',
    budget: '{{n}}/{{max}} slot-nivåer',
    recoveryText: 'Velg brukte spell slots å få tilbake – samlet nivå opptil {{n}}, ingen på level 6+. Én gang per Long Rest.',
    recoveryUsed: 'Allerede brukt – lades på Long Rest.',
    noSlotsUsed: 'Ingen brukte spell slots å få tilbake.',
    noHigh: 'Ikke slots på level 6+',
    effectsEnd: 'Effekter som slutter'
  },
  cunningTip: '1 minutts ritual: få tilbake brukte Pact slots (opptil halvparten av maks, rundet opp). Én gang per Long Rest.',
  cunningUsed: 'brukt til Long Rest',
  cunningDone: 'Magical Cunning: +{{n}} Pact slot(s)'
}

export const spellsxEn: typeof spellsxNb = {
  mode: {
    normal: 'Advantage and Disadvantage cancel out',
    advantage: 'Advantage preselected',
    disadvantage: 'Disadvantage preselected'
  },
  ritual: 'Ritual (+10 min, no slot)',
  ritualTime: '{{time}} + 10 minutes (ritual)',
  ritualNote: 'Cast as a ritual: takes 10 minutes longer and uses no spell slot.',
  upcast: 'At level {{n}}: {{what}}',
  tracked: 'Concentration and effects with a duration are kept on your sheet and carry over into your next combat.',
  castDone: '{{name}} cast{{how}}',
  log: { ritual: 'ritual', carriedIn: 'Still active from before combat: {{names}}' },
  rounds: '{{n}} rounds',
  minutes: '{{n}} min',
  hours: '{{n}} h',
  hoursMinutes: '{{h}} h {{m}} min',
  expired: 'Expired: {{names}}',
  concTip: 'You are concentrating. Damage forces a Constitution save (DC 10 or half the damage); being Incapacitated or casting another concentration spell ends it.',
  endConc: 'End concentration',
  removeEffect: 'Remove effect',
  timePasses: 'Time passes:',
  plusRound: '+1 round',
  plusMinute: '+1 min',
  plusTenMinutes: '+10 min',
  plusHour: '+1 hour',
  inCombat: 'Managed in combat mode',
  concSave: 'You are concentrating: make a Constitution save, DC {{dc}}, to keep concentration.',
  featureConc: 'Concentration',
  featureConcTip: 'The ability requires concentration like a spell: it ends other concentration and can be lost when you take damage.',
  rareLangHint: 'usually needs your DM’s approval at character creation',
  rest: {
    hitDie: 'Hit Die (d{{die}})',
    left: 'left',
    min1: 'at least 1 HP per die',
    hdGain: 'd{{die}}: +{{n}} HP',
    budget: '{{n}}/{{max}} slot levels',
    recoveryText: 'Choose expended spell slots to recover – combined level up to {{n}}, none of level 6+. Once per Long Rest.',
    recoveryUsed: 'Already used – recharges on a Long Rest.',
    noSlotsUsed: 'No expended spell slots to recover.',
    noHigh: 'No slots of level 6+',
    effectsEnd: 'Effects that end'
  },
  cunningTip: '1-minute rite: regain expended Pact slots (up to half your maximum, rounded up). Once per Long Rest.',
  cunningUsed: 'used until Long Rest',
  cunningDone: 'Magical Cunning: +{{n}} Pact slot(s)'
}
