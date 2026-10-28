import { combatNb } from './combat'
import { abilityNb } from './ability'

export const nb = {
  nav: { characters: 'Karakterer', compendium: 'Oppslag', homebrew: 'Homebrew', settings: 'Innstillinger', dice: 'Terninger' },
  common: {
    all: 'Alle', back: 'Tilbake', cancel: 'Avbryt', confirm: 'Bekreft', delete: 'Slett', description: 'Beskrivelse', done: 'Ferdig',
    level: 'Level', loading: 'Laster …', name: 'Navn', next: 'Neste', noResults: 'Ingen treff', save: 'Lagre', search: 'Søk …', unnamed: 'Uten navn'
  },
  home: {
    trash: 'Nylig slettet ({{n}})', trashHint: 'Slettede karakterer ligger her i 30 dager.', restore: 'Gjenopprett', restored: '{{name}} er gjenopprettet', 
    tagline: 'Lag, utvikle og spill D&D-karakterer etter 2024-reglene – med all regeldata, terninger og tips samlet ett sted.',
    new: 'Ny karakter', newHint: 'Steg-for-steg-veiviser', import: 'Importer', export: 'Eksporter', imported: '{{n}} karakter(er) importert',
    empty: 'Ingen karakterer ennå – lag din første helt!', build: 'Veiviser', duplicate: 'Dupliser', todo: '{{n}} å gjøre',
    deleteTitle: 'Slette karakter?', deleteText: 'Er du sikker på at du vil slette {{name}}? Dette kan ikke angres.'
  },
  tabs: { adjust: 'Egne verdier', sheet: 'Ark', spells: 'Spells', inventory: 'Utstyr', features: 'Features & valg', details: 'Detaljer', custom: 'Egne ting' },
  char: { undone: 'Angret', redone: 'Gjort om', undoTip: 'Angre (Ctrl+Z)', redoTip: 'Gjør om (Ctrl+Y)', builderTip: 'Endre class, species, background, ability scores, utstyr og mer', adjust: 'Egne verdier', adjustTip: 'Juster eller overstyr alle verdier for custom game', levelDown: 'Gå ned et level', notFound: 'Fant ikke karakteren.', builder: 'Rediger', levelUp: 'Level up' },
  info: { thirdPartyNote: 'Tredjepartsinnhold fra {{book}}, brukt under lisensen {{license}}. Det er ikke offisielt D&D-innhold – spør DM-en om det er tillatt i kampanjen. Se «Open Content Licenses» i Oppslag.', supplementNote: 'Offisiell tilleggsbok: {{book}}. Dette er bare et kort sammendrag med egne ord – full tekst finnes i boken eller på D&D Beyond.',
    aka: 'I Player’s Handbook: {{names}}', more: 'Mer info', openDdb: 'Åpne på D&D Beyond', phbNote: 'Dette er et kort sammendrag med egne ord. Full regeltekst finner du i {{book}} eller på D&D Beyond.',
    addInventory: 'Legg i utstyr', owned: 'Har {{n}}', addSpell: 'Legg til spell', known: 'Kjent', addFeat: 'Legg til feat', hasFeat: 'Har denne',
    addedItem: '{{name}} lagt i utstyret', addedSpell: '{{name}} lagt til', addedFeat: '{{name}} lagt til'
  },
  dice: {
    tray: 'Terningbrett', addHint: 'Venstreklikk: legg til · Høyreklikk: fjern', advantage: 'Advantage', disadvantage: 'Disadvantage',
    rollX: 'Rull {{x}}', '3dOn': '3D-terninger er på – klikk for enkel animasjon', '3dOff': '3D-terninger er av – klikk for å slå på', modifier: 'modifier', clearPool: 'Tøm ({{n}} terninger)', quick: 'Hurtigvalg', reroll: 'Rull igjen', theme: 'Terningfarge', dice3d: '3D-terninger med fysikk', pick: 'Velg terninger', roll: 'Rull', history: 'Historikk', noHistory: 'Ingen kast ennå', nat20: '✦ NATURAL 20! ✦', nat1: 'Natural 1 …'
  },
  stat: { custom: 'Egen justering', editTitle: 'Endre verdi', auto: 'Automatisk utregnet', adjustment: 'Egen justering (+/−)', adjustmentHint: 'Legges oppå utregningen – oppdateres fortsatt automatisk.', fixed: 'Fast verdi (valgfritt)', fixedPlaceholder: 'Tom = automatisk', fixedHint: 'Erstatter hele utregningen. La stå tomt for å bruke automatikken.', resetAll: 'Tilbakestill til automatisk',
    advantage: 'Advantage', disadvantage: 'Disadvantage', overridden: 'Manuelt satt (beregnet: {{v}})', reset: 'Tilbakestill', edit: 'Endre eller juster verdien'
  },
  sheet: {
    stable: 'Stabil på 0 HP', dead: 'Død', 
    exhaustionEffect: '−{{d}} på D20 Tests · −{{s}} ft. speed · long rest fjerner 1 nivå', exhaustionDead: 'Exhaustion 6 – karakteren dør.', 
    unarmored: 'Uten rustning', initiative: 'Initiative', speed: 'Speed', passivePerception: 'Passive Perc.', inspiration: 'Inspiration',
    size: 'Størrelse', passiveInsight: 'Passive Insight', passiveInvestigation: 'Passive Investigation', hitPoints: 'Hit Points', max: 'Maks',
    damage: 'Skade', heal: 'Heal', temp: 'Temp HP', hitDice: 'Hit Dice', spendHitDie: 'Bruk en Hit Die (rull + CON)', deathSaves: 'Death Saves',
    successes: 'Suksess', failures: 'Feil', rollCheck: 'Rull ability check', save: 'Save', toggleProf: 'Klikk for proficiency → expertise → av',
    weaponsCantrips: 'Våpen & damage cantrips', addWeapon: 'Legg til våpen', name: 'Navn', atkDc: 'Angrep / DC', notes: 'Notater',
    classFeatures: 'Class features', speciesTraits: 'Species traits', feats: 'Feats', other: 'Annet', allDetails: 'Alle detaljer',
    training: 'Trening & proficiencies', weapons: 'Våpen', tools: 'Verktøy', languages: 'Språk', conditions: 'Conditions', defenses: 'Forsvar',
    resistances: 'Resistances', immunities: 'Immunities', vulnerabilities: 'Vulnerabilities', conditionImmunities: 'Condition immunities',
    activeStates: 'Aktive tilstander (slår på effekter)'
  },
  spells: {
    castFree: '{{name}} kastet gratis ({{via}})', 
    ability: 'Ability', dc: 'Save DC', attack: 'Spell attack', cantrips: 'Cantrips', prepared: 'Prepared', maxLevel: 'Høyeste spell-nivå: {{n}}',
    addCantrip: 'Velg cantrips', addSpell: 'Velg spells', slots: 'Spell slots', noSlots: 'Ingen spell slots.', shortRest: 'Short rest',
    resetSlots: 'Nullstill slots', addAny: 'Legg til en spell fra hvilken som helst liste', empty: 'Ingen spells ennå',
    emptyText: 'Velg cantrips og spells fra class-listen din til venstre.', noCaster: 'Karakteren har ikke spellcasting, men du kan legge til spells fra feats, items eller manuelt.',
    always: 'Alltid prepared', isPrepared: 'Prepared – klikk for å fjerne', notPrepared: 'Ikke prepared – klikk for å forberede',
    cast: '{{name}} kastet – slot brukt', noSlotLeft: 'Ingen ledige spell slots!', castBtn: 'Kast'
  },
  inv: {
    weapons: 'Våpen', armor: 'Rustning & skjold', magic: 'Magiske gjenstander', gear: 'Utstyr', add: 'Legg til utstyr',
    quickAdd: 'Hurtig: skriv et navn …', empty: 'Ingen ting i sekken', emptyText: 'Legg til våpen, rustning og utstyr – eller velg startutstyr i veiviseren.',
    equipped: 'Utstyrt', attuned: 'Attuned', showAttack: 'Vis som angrep', bonusTip: 'Magisk bonus (+1/+2/+3)', coins: 'Mynter', carry: 'Bæreevne',
    carryHint: 'Dra/løft/skyv: {{n}} lb.', attunement: 'Attuned: {{n}}/3', pickBase: 'Velg våpen/rustning …'
  },
  features: {
    pending: 'Valg som gjenstår ({{n}})', feats: 'Feats', addFeat: 'Legg til feat', custom: 'Egne features', addCustom: 'Ny feature',
    customHint: 'Legg til egne evner, boons eller ting DM-en har gitt deg. De vises på arket og i PDF-en.',
    uses: 'Bruk (antall)', recharge: 'Lades opp', activation: 'Aktivering'
  },
  details: {
    portrait: 'Portrett', upload: 'Last opp bilde', basics: 'Grunninfo', name: 'Navn', player: 'Spiller', alignment: 'Alignment',
    nextLevel: 'Neste level ved {{n}} XP', maxLevel: 'Maks level', canLevel: '✦ Du har nok XP til å gå opp et level!',
    appearance: 'Utseende', personalitySection: 'Personlighet', story: 'Historie & notater',
    gender: 'Kjønn', age: 'Alder', height: 'Høyde', weight: 'Vekt', eyes: 'Øyne', hair: 'Hår', skin: 'Hud', faith: 'Tro',
    personality: 'Personlighetstrekk', ideals: 'Idealer', bonds: 'Bånd', flaws: 'Svakheter', backstory: 'Backstory', allies: 'Allierte & organisasjoner', notes: 'Notater'
  },
  custom: {
    entities: 'Egne items, spells og feats', fromLibrary: 'Fra bibliotek', create: 'Lag ny', empty: 'Ingen egne ting ennå',
    emptyText: 'Lag egne våpen, rustninger, magiske gjenstander, spells eller feats. Legg til effekter (f.eks. +1 AC) så oppdateres arket automatisk.',
    add: 'Bruk', toLibrary: 'Lagre i felles bibliotek', savedLibrary: 'Lagret i homebrew-biblioteket', effects: 'Egne effekter',
    effectsHint: 'Midlertidige eller permanente bonuser, f.eks. «Bless», «Mage Armor» eller noe DM-en har gitt.',
    newEffect: 'Ny effekt', addEffect: 'Legg til effekt', overrides: 'Manuelle overstyringer', noOverrides: 'Ingen verdier er overstyrt. Hold musen over en verdi på arket og klikk blyanten for å skrive inn selv.'
  },
  choice: { change: 'Endre',
    pickSpells: 'Velg {{n}} spell(s)', pickListFirst: 'Velg spell-liste først', goSpells: 'Gå til spells', pickSubclass: 'Velg subclass',
    pickBackgroundFirst: 'Velg background først.', bgTotal: 'Brukt {{n}} av 3 poeng', addFeat: 'Legg til {{name}}', pickFeat: 'Velg feat',
    pickMastery: 'Velg våpen for Weapon Mastery'
  },
  sort: {
    title: 'Sorter', name: 'Navn A–Å', nameDesc: 'Navn Å–A', book: 'Bok', level: 'Spell-level', school: 'School', rarity: 'Rarity', type: 'Type', cr: 'Challenge rating',
    category: 'Kategori', damage: 'Skade (høyest først)', cost: 'Pris (lavest først)', weight: 'Vekt (lettest først)', ac: 'AC', class: 'Class', pantheon: 'Pantheon', kind: 'Type',
    recent: 'Sist endret', charLevel: 'Level (høyest først)', manual: 'Rekkefølge lagt til', equipped: 'I bruk først', value: 'Verdi (høyest først)'
  },
  picker: { books: 'Bøker:', allBooks: 'Alle bøker', booksHint: 'Klikk en bok for å vise bare den. Klikk flere for å ta med flere. Valget huskes.', clearBooks: 'Vis alle bøker ({{n}} skjult)', showMore: 'Vis flere ({{n}} til) – eller søk for å snevre inn', selected: 'Valgt {{n}} av {{max}}' },
  tips: {
    title: 'Tips & å gjøre', warning: 'Advarsler', todo: 'Å gjøre', suggestion: 'Forslag', info: 'Info', fix: 'Fiks dette', none: 'Ingen tips – alt ser bra ut! ✦'
  },
  level: { downTitle: 'Gå ned et level', downDone: 'Level fjernet', downConfirm: 'Fjern level', downMin: 'Karakteren er allerede level 1.', downIntro: 'Velg hvilken class som skal miste ett level. Valg som hørte til det levelet fjernes.', downFeatures: 'Features som forsvinner', downFeats: 'Feats som fjernes', downSubclass: 'Subclass fjernes: {{name}}', downClass: 'Classen fjernes helt (multiclass)', downNote: 'Spells og utstyr beholdes – sjekk Spells-fanen etterpå.', undo: 'Angre level up',
    title: 'Level up', chooseClass: 'Velg hvilken class som får level {{n}}:', max: 'Maks level (20) er nådd.', current: 'Nå level {{n}}',
    multiclass: 'Ny (multiclass)', prereq: 'Krav', prereqFail: 'Du oppfyller ikke multiclass-kravet (13 i primary ability for både nåværende og ny class). Du kan fortsatt fortsette hvis DM tillater det.',
    totalAfter: 'Karakter-level {{n}} etterpå', hp: 'Hit points', fixed: 'Fast verdi ({{n}})', roll: 'Rull d{{die}}', manual: 'eller skriv inn:',
    conNote: 'Inkluderer CON-modifier {{n}}', newFeatures: 'Nye features', confirm: 'Gå opp level', congrats: 'Gratulerer, du gikk opp et level!',
    newChoices: 'Nye valg å ta', spellsHint: 'Husk å se på spells-fanen for nye cantrips/spells.'
  },
  rest: {
    needHp: 'Du må ha minst 1 HP for å starte en rest (2024). Bli helbredet eller stabilisert først – eller fortsett hvis DM-en tillater det.', 
    short: 'Short Rest (1 time)', long: 'Long Rest (8 timer)', shortBtn: 'Short', longBtn: 'Long', take: 'Ta rest', spend: 'Bruk',
    shortText: 'Bruk Hit Dice for å gjenvinne HP. Features som lades ved Short Rest og Pact Magic-slots fylles opp.',
    longText: 'Gjenvinn alle HP, alle Hit Dice og spell slots. Features fylles opp og Exhaustion reduseres med 1.',
    recharges: 'Fylles opp', shortDone: 'Short rest fullført', longDone: 'Long rest fullført – du er uthvilt!'
  },
  pdf: {
    title: 'Eksporter til PDF', intro: 'Velg hvilke deler som skal være med i PDF-en.', export: 'Lag PDF', working: 'Lager PDF …',
    sheet: 'Character sheet', sheetDesc: 'Hovedarket i 2024-oppsett med alle verdier',
    spells: 'Spellcasting', spellsDesc: 'Spell slots, DC og liste over spells',
    features: 'Features & traits', featuresDesc: 'Full tekst for alle features, traits og feats',
    inventory: 'Utstyr', inventoryDesc: 'Inventar, mynter og beskrivelser av gjenstander',
    spellcards: 'Spell-beskrivelser', spellcardsDesc: 'Full beskrivelse av hver spell',
    details: 'Detaljer & backstory', detailsDesc: 'Portrett, utseende, personlighet og historie',
    legal: 'Kilder', legalDesc: 'CC-BY-attribusjon for SRD 5.2.1'
  },
  builder: {
    toSheet: 'Til arket', back: 'Tilbake', freeNav: 'Du kan hoppe fritt mellom stegene og endre alt senere.',
    class: 'Class', origin: 'Opprinnelse', abilities: 'Ability scores', equipment: 'Utstyr', spells: 'Spells', details: 'Detaljer', review: 'Oversikt',
    classTitle: 'Velg class', classIntro: 'Classen er det viktigste valget: den bestemmer evner, hit points, rustning og hvordan du spiller. Klikk ⓘ for full info.',
    originTitle: 'Opprinnelse', originIntro: 'Background gir ability-bonuser, et origin feat og skills. Species gir spesielle traits.',
    abilitiesTitle: 'Ability scores', abilitiesIntro: 'Bestem de seks ability scores. Legg høyest i det classen din trenger mest.',
    equipmentTitle: 'Startutstyr', equipmentIntro: 'Velg pakke fra class og background – eller ta gull og kjøp selv.',
    spellsTitle: 'Spells', spellsIntro: 'Velg cantrips og prepared spells fra class-listen din.',
    detailsTitle: 'Detaljer', detailsIntro: 'Gi karakteren navn, utseende og en historie.',
    reviewTitle: 'Oversikt', reviewIntro: 'Se over karakteren og fullfør eventuelle valg som gjenstår.',
    finish: 'Fullfør karakter', startLevel: 'Start-level', level1Features: 'Features du får', allChosen: 'Alle class-valg er tatt!', tips: 'Tips',
    languages: 'Språk', recommended: 'Anbefalt', pickBackground: 'Velg en background til venstre.', pickSpecies: 'Velg en species til venstre.',
    bgAbilities: 'Background ability-bonus', languagesLabel: 'Velg 2 språk', languagesIntro: 'Du kan Common, pluss to standardspråk etter eget valg (DM kan tillate rare languages).',
    known: 'Kjente språk', roll: 'Rull 4d6', manual: 'Manuelt', abilityTip: '{{cls}} bruker {{a}} som primary ability – legg høyeste verdi der.',
    autoAssign: 'Anbefalt fordeling', arrayInvalid: 'Hver verdi i standard array skal brukes én gang.', pointsLeft: 'Poeng igjen', reroll: 'Rull på nytt',
    roll4d6: 'Rull 6 × 4d6 (dropp laveste)', manualIntro: 'Skriv inn verdiene selv – f.eks. hvis du rullet med ekte terninger.',
    inventoryNow: 'Utstyr nå', moreInSheet: 'Du kan legge til og endre mer utstyr i «Utstyr»-fanen på arket.', startingEquipment: 'startutstyr', undo: 'Angre',
    ready: 'Karakteren er klar!', readyText: 'Alle valg er tatt. Trykk «Fullfør» for å gå til arket.', remaining: '{{n}} valg gjenstår', skillsProf: 'Skill proficiencies'
  },
  comp: { showAll: 'Vis alle {{n}} i {{group}}', allBooks: 'Alle bøker', allSources: 'Alle kilder', count: '{{n}} treff', refine: '{{n}} flere – søk for å snevre inn' },
  hb: {
    new: 'Ny homebrew', edit: 'Rediger {{name}}', copyFrom: 'Kopier fra eksisterende', type: 'Type', summary: 'Kort beskrivelse',
    summaryHint: 'Vises i den lille popupen', editText: 'Rediger', preview: 'Forhåndsvis', effects: 'Effekter (oppdaterer arket automatisk)',
    effectsHint: 'F.eks. AC +1, Speed +10, advantage på Stealth, resistance mot fire …', addEffect: 'Legg til effekt', condition: 'Betingelse (valgfri)',
    noEffects: 'Ingen effekter', intro: 'Felles bibliotek for egne subclasses, species, backgrounds, feats, spells, items, monstre og mer – brukbart for alle karakterene dine og lett å dele med andre.',
    empty: 'Biblioteket er tomt', emptyText: 'Lag homebrew her, eller lagre fra en karakters «Egne ting»-fane.', effectCount: '{{n}} effekt(er)',
    imported: '{{n}} importert', importFail: 'Kunne ikke lese filen',
    featuresHint: 'Klikk en feature for å redigere: level, bruk, effekter og hva den gjør i kamp.', addFeature: 'Legg til feature', editFeature: 'Rediger feature', noFeatures: 'Ingen features ennå.',
    subclassHint: '{{cls}} velger subclass på level {{lvl}}. Features vises på arket fra levelet du setter, og kan brukes i kampmodus.',
    subclassFeatures: 'Subclass-features', alwaysPrepared: 'Spells som alltid er prepared', alwaysPreparedHint: 'F.eks. domain- eller oath-spells. Legges automatisk til fra class-levelet du velger.',
    addSpellLevel: 'Legg til level', classLevel: 'Class-level', noSpells: 'Ingen spells.', traits: 'Traits', speciesSpells: 'Medfødte spells',
    speciesSpellsHint: 'Gis automatisk fra karakter-levelet du velger, og kan kastes gratis én gang per long rest i kampmodus.', charLevel: 'Karakter-level',
    bgAbilities: 'Ability scores (velg 3 – {{n}} valgt)', toolChoice: 'Valgfritt: {{what}}', bgSkills: 'Skill proficiencies (velg 2 – {{n}} valgt)', equipment: 'Startutstyr', addItems: 'Legg til utstyr',
    statBlock: 'Stat block (traits, actions …)', statBlockPh: '**Traits.** …\n\n### Actions\n**Bite.** Melee Attack Roll: +4, reach 5 ft. Hit: 6 (1d8 + 2) Piercing damage.',
    err: { name: 'Navn mangler', abilities: 'Velg nøyaktig 3 ability scores', skills: 'Velg nøyaktig 2 skills', class: 'Velg en class' },
    importTip: 'Importer homebrew fra en .json-fil (fra en venn eller en annen PC)', exportTip: 'Lagre hele biblioteket som én fil som kan deles',
    duplicated: '{{name}} duplisert', editShort: 'Rediger', duplicate: 'Dupliser', exportOne: 'Eksporter denne som fil',
    chooseKind: 'Hva vil du lage?', deleteTitle: 'Slette?', deleteText: '{{name}} slettes fra biblioteket. Karakterer som bruker den, mister den.',
    kindDesc: {
      subclass: 'Egen subclass for en class – med features per level og spells som alltid er prepared.',
      species: 'Egen species med størrelse, speed, darkvision, traits og medfødte spells.',
      background: 'Eget background med ability scores, origin feat, skills, tool og utstyr.',
      feat: 'Origin, general, fighting style eller epic boon – med effekter.',
      spell: 'Eget spell med skade, save, angrep og klasser.',
      magicItem: 'Magisk gjenstand med rarity, attunement, bonus og effekter.',
      weapon: 'Våpen med skade, properties og mastery.',
      armor: 'Rustning eller skjold med AC.',
      gear: 'Utstyr, verktøy eller andre ting.',
      tool: 'Verktøy eller instrument.',
      creature: 'Monster, companion eller familiar med stat block – kan legges til i kampmodus.',
      language: 'Eget språk for verdenen din.'
    },
    useHint: { subclass: 'velg ved level up / i veiviseren', species: 'velg i veiviseren', background: 'velg i veiviseren', creature: 'brukes i kampmodus' }
  },
  settings: { showSupplements: 'Vis innhold fra tilleggsbøker (Xanathar’s, Tasha’s …)', showThirdParty: 'Vis tredjepartsinnhold (Kobold Press, Level Up A5E …)', sourcesHint: 'Skjulte kilder forsvinner fra lister og velgere. Karakterer som allerede bruker dem, påvirkes ikke.',
    appearance: 'Utseende', language: 'Språk', theme: 'Tema', dark: 'Mørkt', light: 'Lyst', animations: 'Animasjoner', diceSound: 'Terninglyd',
    showTips: 'Vis tips-panel som standard', rules: 'Regler', hpMethod: 'HP ved level up', hpFixed: 'Fast verdi', hpRoll: 'Rull',
    ddb: 'Åpne D&D Beyond', ddbApp: 'I app-vindu', ddbBrowser: 'I nettleser', storage: 'Lagring', openFolder: 'Åpne mappe', about: 'Om',
    entries: '{{n}} oppføringer i regeldataene',
    trademark: 'Dungeons & Dragons og D&D Beyond er varemerker for Wizards of the Coast. Denne appen er ikke tilknyttet eller godkjent av Wizards of the Coast.'
  },
  choices: { title: 'Valg', pending: '{{n}} valg mangler', spellsPending: 'Spells mangler – gå til Spells-fanen', done: 'Valg du har tatt ({{n}}) – klikk for å endre', none: 'Ingen valg for denne karakteren.' },
  faith: {
    god: 'Gud', patron: 'Patron', godOrPatron: 'Gud / patron', pickGod: 'Velg gud', pickPatron: 'Velg patron', gods: 'Guder', patrons: 'Warlock-patrons',
    search: 'Søk etter navn, domain, pantheon …', recommended: 'Anbefalt for din subclass', recommendedFor: 'Passer godt for classen/subclassen din:',
    domains: 'Domains', symbol: 'Symbol',
    note: 'Forgotten Realms-innhold: navn og fakta med korte beskrivelser skrevet for appen. Les mer på D&D Beyond eller i Forgotten Realms-bøkene.',
    why: {
      god: 'Clerics og paladins henter ofte kraften sin fra en gud. Guden former idealer, oppførsel og hva karakteren kjemper for – og domain/oath bør passe til guden.',
      patron: 'En warlock har inngått en pakt med en mektig skapning. Hvem patronen er (en archdevil, archfey, Great Old One eller celestial) gir sterke rollespill-kroker.',
      both: 'Karakteren har både guddommelig kraft og en pakt – velg guden eller patronen som betyr mest for historien.'
    }
  },
  guide: {
    title: 'Hva mangler? – steg for steg', missingBtn: 'ting mangler – vis meg', badgeTitle: 'Klikk for å se hva som mangler og fikse det',
    step: 'Steg {{n}} av {{total}}', remaining: '{{n}} gjenstår', from: 'Kommer fra', stepDone: 'Fikset! Går videre …', skip: 'Hopp over',
    showInTab: 'Vis i fanen', allDone: 'Alt er på plass!', allDoneText: 'Karakteren har ingen uløste valg. Lykke til på eventyret!',
    recommendedSpells: 'Anbefalt for classen',
    why: {
      skill: 'Velg {{n}} skill(s) karakteren er trent i. Du legger til Proficiency Bonus når du ruller disse.',
      expertise: 'Expertise dobler Proficiency Bonus på valgte skills. Du kan bare velge skills du allerede er proficient i.',
      tool: 'Velg et verktøy du er trent i. Du legger til Proficiency Bonus når du bruker det.',
      language: 'Velg {{n}} språk karakteren kan snakke, lese og skrive.',
      option: 'Classen eller featen din lar deg velge et alternativ. Klikk på navnet for å lese hva det gjør før du velger.',
      ability: 'Velg hvilken ability score dette gjelder.',
      subclass: 'Du har nådd nivået der classen velger subclass. Subclassen gir nye features gjennom hele karrieren – klikk ⓘ i listen for å lese om hver.',
      speciesOption: 'Species-en din har flere varianter (lineage/ancestry/legacy). Varianten gir egne traits og ofte spells.',
      feat: 'Velg en feat. Feats gir nye evner – noen gir også +1 til en ability score.',
      weaponMastery: 'Velg våpen du kan bruke mastery-egenskapen til (f.eks. Topple, Sap, Vex). Velg våpnene du faktisk bruker.',
      spell: 'Velg {{n}} spell(s) fra listen.',
      cantrip: 'Velg {{n}} cantrip(s) – spells du kan kaste ubegrenset.',
      cantrips: 'Velg {{n}} cantrip(s) til. Cantrips kan kastes så ofte du vil uten spell slots.',
      prepared: 'Du kan forberede {{n}} spell(s) til. Prepared spells er de du kan kaste med spell slots i dag.',
      bgAbilities: 'Background-en din gir +2 og +1 (eller +1/+1/+1) til tre ability scores. Fordel poengene – legg gjerne +2 på primary ability.',
      bgFeat: 'Background-en gir et origin feat. Klikk for å legge det til.',
      languages: 'Alle kan Common. I tillegg velger du to språk ved opprettelse.',
      featAbility: 'Featen gir +1 til en ability score – velg hvilken.',
      asi: 'Du har nådd et Ability Score Improvement-nivå. Velg featen «Ability Score Improvement» for +2 på én (eller +1 på to) ability scores – eller en annen general feat.',
      epicBoon: 'Level 19 gir et Epic Boon – en kraftig feat for de mektigste heltene.',
      generic: 'Dette valget mangler.'
    }
  },
  adjust: {
    title: 'Egne verdier (custom game)', intro: 'Legg til en justering (f.eks. +2 STR) oppå den automatiske utregningen – alt annet regnes fortsatt ut automatisk. «Fast verdi» erstatter utregningen helt.',
    baseScores: 'Endre grunnverdier', resetAll: 'Nullstill alle', abilities: 'Ability scores', saves: 'Saving throws', skills: 'Skills', combat: 'Kamp & annet',
    masteryCount: 'Antall Weapon Mastery', spellcasting: 'Spellcasting', slots: 'Spell slots nivå {{n}}', attacks: 'Angrep', attackBonus: 'angrepsbonus', damageBonus: 'skadebonus',
    auto: 'Auto', adjustment: 'Justering', fixed: 'Fast', result: 'Resultat'
  },
  combat: combatNb,
  ability: abilityNb
}
