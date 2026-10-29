import type { nb } from './nb'
import { combatEn } from './combat'
import { toolsEn } from './tools'
import { itemsEn } from './items'
import { abilityEn } from './ability'
import { partyEn } from './party'
import { polishEn } from './polish'
import { spellsxEn } from './spellsx'

export const en: typeof nb = {
  nav: { characters: 'Characters', compendium: 'Compendium', homebrew: 'Homebrew', settings: 'Settings', dice: 'Dice' },
  common: {
    all: 'All', back: 'Back', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete', description: 'Description', done: 'Done',
    level: 'Level', loading: 'Loading…', name: 'Name', next: 'Next', noResults: 'No results', save: 'Save', search: 'Search…', unnamed: 'Unnamed'
  },
  home: {
    trash: 'Recently deleted ({{n}})', trashHint: 'Deleted characters stay here for 30 days.', restore: 'Restore', restored: '{{name}} restored', 
    tagline: 'Build, level and play D&D characters with the 2024 rules – all the rules data, dice and tips in one place.',
    new: 'New character', newHint: 'Step-by-step builder', import: 'Import', export: 'Export', imported: '{{n}} character(s) imported',
    empty: 'No characters yet – create your first hero!', build: 'Builder', duplicate: 'Duplicate', todo: '{{n}} to do',
    deleteTitle: 'Delete character?', deleteText: 'Are you sure you want to delete {{name}}? It stays in “Recently deleted” for 30 days and can be restored there.'
  },
  tabs: { adjust: 'Override values', sheet: 'Sheet', spells: 'Spells', inventory: 'Inventory', features: 'Features & choices', details: 'Details', custom: 'Homebrew & abilities' },
  char: { undone: 'Undone', redone: 'Redone', undoTip: 'Undo (Ctrl+Z)', redoTip: 'Redo (Ctrl+Y)', builderTip: 'Change class, species, background, ability scores, equipment and more', adjust: 'Override values', adjustTip: 'Adjust or override any value for a custom game', levelDown: 'Level down', notFound: 'Character not found.', builder: 'Edit', levelUp: 'Level up' },
  info: { thirdPartyNote: 'Third-party content from {{book}}, used under the {{license}} license. It is not official D&D content – ask your DM whether it is allowed. See “Open Content Licenses” in the Compendium.', supplementNote: 'Official supplement: {{book}}. This is only a short summary in our own words – the full text is in the book or on D&D Beyond.',
    aka: 'In the Player’s Handbook: {{names}}', more: 'More info', openDdb: 'Open on D&D Beyond', phbNote: 'This is a short summary in our own words. Read the full rules text in the {{book}} or on D&D Beyond.',
    addInventory: 'Add to inventory', owned: 'Own {{n}}', addSpell: 'Add spell', known: 'Known', addFeat: 'Add feat', hasFeat: 'Already have',
    addedItem: '{{name}} added to inventory', addedSpell: '{{name}} added', addedFeat: '{{name}} added'
  },
  dice: {
    tray: 'Dice tray', addHint: 'Left click: add · Right click: remove', advantage: 'Advantage', disadvantage: 'Disadvantage',
    rollX: 'Roll {{x}}', '3dOn': '3D dice are on – click for a simple animation', '3dOff': '3D dice are off – click to turn on', modifier: 'modifier', clearPool: 'Clear ({{n}} dice)', quick: 'Quick rolls', reroll: 'Roll again', theme: 'Dice colour', dice3d: '3D dice with physics', pick: 'Pick dice', roll: 'Roll', history: 'History', noHistory: 'No rolls yet', nat20: '✦ NATURAL 20! ✦', nat1: 'Natural 1…'
  },
  stat: { custom: 'Custom adjustment', editTitle: 'Edit value', auto: 'Automatically calculated', adjustment: 'Custom adjustment (+/−)', adjustmentHint: 'Added on top of the calculation – still updates automatically.', fixed: 'Fixed value (optional)', fixedPlaceholder: 'Empty = automatic', fixedHint: 'Replaces the whole calculation. Leave empty to use automation.', resetAll: 'Reset to automatic', advantage: 'Advantage', disadvantage: 'Disadvantage', overridden: 'Set manually (computed: {{v}})', reset: 'Reset', edit: 'Edit or adjust value' },
  sheet: {
    stable: 'Stable at 0 HP', dead: 'Dead', 
    exhaustionEffect: '−{{d}} to D20 Tests · −{{s}} ft. Speed · a long rest removes 1 level', exhaustionDead: 'Exhaustion 6 – the character dies.', 
    unarmored: 'Unarmored', initiative: 'Initiative', speed: 'Speed', passivePerception: 'Passive Perc.', inspiration: 'Inspiration',
    size: 'Size', passiveInsight: 'Passive Insight', passiveInvestigation: 'Passive Investigation', hitPoints: 'Hit Points', max: 'Max',
    damage: 'Damage', heal: 'Heal', temp: 'Temp HP', hitDice: 'Hit Dice', spendHitDie: 'Spend a Hit Die (roll + CON)', deathSaves: 'Death Saves',
    successes: 'Successes', failures: 'Failures', rollCheck: 'Roll ability check', save: 'Save', toggleProf: 'Click: proficiency → expertise → off',
    weaponsCantrips: 'Weapons & damage cantrips', addWeapon: 'Add weapon', name: 'Name', atkDc: 'Atk / DC', notes: 'Notes',
    classFeatures: 'Class features', speciesTraits: 'Species traits', feats: 'Feats', other: 'Other', allDetails: 'All details',
    training: 'Training & proficiencies', weapons: 'Weapons', tools: 'Tools', languages: 'Languages', conditions: 'Conditions', defenses: 'Defenses',
    resistances: 'Resistances', immunities: 'Immunities', vulnerabilities: 'Vulnerabilities', conditionImmunities: 'Condition immunities',
    activeStates: 'Active states (toggle effects)'
  },
  spells: {
    castFree: '{{name}} cast for free ({{via}})', 
    ability: 'Ability', dc: 'Save DC', attack: 'Spell attack', cantrips: 'Cantrips', prepared: 'Prepared', maxLevel: 'Highest spell level: {{n}}',
    addCantrip: 'Choose cantrips', addSpell: 'Choose spells', slots: 'Spell slots', noSlots: 'No spell slots.', shortRest: 'Short rest',
    resetSlots: 'Reset slots', addAny: 'Add a spell from any list', empty: 'No spells yet',
    emptyText: 'Pick cantrips and spells from your class list on the left.', noCaster: 'This character has no Spellcasting, but you can add spells from feats, items or manually.',
    always: 'Always prepared', isPrepared: 'Prepared – click to unprepare', notPrepared: 'Not prepared – click to prepare',
    cast: '{{name}} cast – slot spent', noSlotLeft: 'No spell slots left!', castBtn: 'Cast'
  },
  inv: {
    weapons: 'Weapons', armor: 'Armor & shields', magic: 'Magic items', gear: 'Gear', add: 'Add equipment',
    quickAdd: 'Quick: type a name…', empty: 'Your pack is empty', emptyText: 'Add weapons, armor and gear – or pick starting equipment in the builder.',
    equipped: 'Equipped', attuned: 'Attuned', showAttack: 'Show as attack', bonusTip: 'Magic bonus (+1/+2/+3)', coins: 'Coins', carry: 'Carrying capacity',
    carryHint: 'Drag/lift/push: {{n}} lb.', attunement: 'Attuned: {{n}}/3', pickBase: 'Pick weapon/armor…'
  },
  features: {
    pending: 'Remaining choices ({{n}})', feats: 'Feats', addFeat: 'Add feat', custom: 'Custom features', addCustom: 'New feature',
    customHint: 'Add your own abilities, boons or things your DM gave you. They appear on the sheet and in the PDF.',
    uses: 'Uses (count)', recharge: 'Recharge', activation: 'Activation'
  },
  details: {
    portrait: 'Portrait', upload: 'Upload image', basics: 'Basics', name: 'Name', player: 'Player', alignment: 'Alignment',
    nextLevel: 'Next level at {{n}} XP', maxLevel: 'Max level', canLevel: '✦ You have enough XP to level up!',
    appearance: 'Appearance', personalitySection: 'Personality', story: 'Story & notes',
    gender: 'Gender', age: 'Age', height: 'Height', weight: 'Weight', eyes: 'Eyes', hair: 'Hair', skin: 'Skin', faith: 'Faith',
    personality: 'Personality traits', ideals: 'Ideals', bonds: 'Bonds', flaws: 'Flaws', backstory: 'Backstory', allies: 'Allies & organizations', notes: 'Notes'
  },
  custom: {
    entities: 'Custom items, spells and feats', fromLibrary: 'From library', create: 'Create new', empty: 'Nothing custom yet',
    emptyText: 'Create your own weapons, armor, magic items, spells or feats. Add effects (e.g. +1 AC) and the sheet updates automatically.',
    add: 'Use', toLibrary: 'Save to shared library', savedLibrary: 'Saved to homebrew library', effects: 'Custom effects',
    effectsHint: 'Temporary or permanent bonuses such as Bless, Mage Armor or a DM boon.',
    newEffect: 'New effect', addEffect: 'Add effect', overrides: 'Manual overrides', noOverrides: 'No values are overridden. Hover a value on the sheet and click the pencil to enter it yourself.'
  },
  choice: { change: 'Change',
    pickSpells: 'Choose {{n}} spell(s)', pickListFirst: 'Choose a spell list first', goSpells: 'Go to spells', pickSubclass: 'Choose subclass',
    pickBackgroundFirst: 'Choose a background first.', bgTotal: 'Used {{n}} of 3 points', addFeat: 'Add {{name}}', pickFeat: 'Choose feat',
    pickMastery: 'Choose Weapon Mastery weapons'
  },
  sort: {
    title: 'Sort', name: 'Name A–Z', nameDesc: 'Name Z–A', book: 'Book', level: 'Spell level', school: 'School', rarity: 'Rarity', type: 'Type', cr: 'Challenge rating',
    category: 'Category', damage: 'Damage (highest first)', cost: 'Cost (lowest first)', weight: 'Weight (lightest first)', ac: 'AC', class: 'Class', pantheon: 'Pantheon', kind: 'Type',
    recent: 'Recently changed', charLevel: 'Level (highest first)', manual: 'Order added', equipped: 'In use first', value: 'Value (highest first)'
  },
  picker: { books: 'Books:', allBooks: 'All books', booksHint: 'Click a book to show only that one. Click more to add them. Your choice is remembered.', clearBooks: 'Show all books ({{n}} hidden)', showMore: 'Show more ({{n}} left) – or search to narrow down', selected: 'Selected {{n}} of {{max}}' },
  tips: { title: 'Tips & to-do', warning: 'Warnings', todo: 'To do', suggestion: 'Suggestions', info: 'Info', fix: 'Fix this', none: 'No tips – everything looks good! ✦' },
  level: { downTitle: 'Level down', downDone: 'Level removed', downConfirm: 'Remove level', downMin: 'The character is already level 1.', downIntro: 'Choose which class loses a level. Choices tied to that level are removed.', downFeatures: 'Features removed', downFeats: 'Feats removed', downSubclass: 'Subclass removed: {{name}}', downClass: 'The class is removed entirely (multiclass)', downNote: 'Spells and equipment are kept – check the Spells tab afterwards.', undo: 'Undo level up',
    title: 'Level up', chooseClass: 'Choose which class gains level {{n}}:', max: 'Max level (20) reached.', current: 'Currently level {{n}}',
    multiclass: 'New (multiclass)', prereq: 'Prerequisite', prereqFail: 'You don’t meet the multiclass prerequisite (13 in the primary ability of both your current and new class). You may continue if your DM allows it.',
    totalAfter: 'Character level {{n}} afterwards', hp: 'Hit points', fixed: 'Fixed value ({{n}})', roll: 'Roll d{{die}}', manual: 'or enter:',
    conNote: 'Includes CON modifier {{n}}', newFeatures: 'New features', confirm: 'Level up', congrats: 'Congratulations, you leveled up!',
    newChoices: 'New choices to make', spellsHint: 'Remember to check the Spells tab for new cantrips/spells.'
  },
  rest: {
    needHp: 'You need at least 1 HP to start a rest (2024). Get healed or stabilised first – or continue if your DM allows it.', 
    short: 'Short Rest (1 hour)', long: 'Long Rest (8 hours)', shortBtn: 'Short', longBtn: 'Long', take: 'Take rest', spend: 'Spend',
    shortText: 'Spend Hit Dice to regain HP. Short-rest features and Pact Magic slots recharge.',
    longText: 'Regain all HP, all Hit Dice and spell slots. Features recharge and Exhaustion drops by 1.',
    recharges: 'Recharges', shortDone: 'Short rest complete', longDone: 'Long rest complete – fully rested!'
  },
  pdf: {
    title: 'Export to PDF', intro: 'Choose which parts to include in the PDF.', export: 'Create PDF', working: 'Creating PDF…',
    sheet: 'Character sheet', sheetDesc: 'The main 2024-style sheet with all values',
    spells: 'Spellcasting', spellsDesc: 'Spell slots, DC and list of spells',
    features: 'Features & traits', featuresDesc: 'Full text for all features, traits and feats',
    inventory: 'Equipment', inventoryDesc: 'Inventory, coins and item descriptions',
    spellcards: 'Spell descriptions', spellcardsDesc: 'Full description of each spell',
    details: 'Details & backstory', detailsDesc: 'Portrait, appearance, personality and story',
    legal: 'Sources', legalDesc: 'CC-BY attribution for SRD 5.2.1'
  },
  builder: {
    toSheet: 'To sheet', back: 'Back', freeNav: 'You can jump freely between steps and change everything later.',
    class: 'Class', origin: 'Origin', abilities: 'Ability scores', equipment: 'Equipment', spells: 'Spells', details: 'Details', review: 'Review',
    classTitle: 'Choose a class', classIntro: 'Your class is the most important choice: it sets abilities, hit points, armor and how you play. Click ⓘ for full info.',
    originTitle: 'Origin', originIntro: 'Your background grants ability bonuses, an origin feat and skills. Your species grants special traits.',
    abilitiesTitle: 'Ability scores', abilitiesIntro: 'Determine your six ability scores. Put the highest where your class needs it most.',
    equipmentTitle: 'Starting equipment', equipmentIntro: 'Pick a package from your class and background – or take gold and shop yourself.',
    spellsTitle: 'Spells', spellsIntro: 'Choose cantrips and prepared spells from your class list.',
    detailsTitle: 'Details', detailsIntro: 'Give your character a name, appearance and story.',
    reviewTitle: 'Review', reviewIntro: 'Look over your character and finish any remaining choices.',
    finish: 'Finish character', startLevel: 'Starting level', level1Features: 'Features you gain', allChosen: 'All class choices made!', tips: 'Tips',
    languages: 'Languages', recommended: 'Recommended', pickBackground: 'Choose a background on the left.', pickSpecies: 'Choose a species on the left.',
    bgAbilities: 'Background ability bonus', languagesLabel: 'Choose 2 languages', languagesIntro: 'You know Common plus two standard languages of your choice (your DM may allow rare languages).',
    known: 'Known languages', roll: 'Roll 4d6', manual: 'Manual', abilityTip: '{{cls}} uses {{a}} as its primary ability – put your highest score there.',
    autoAssign: 'Recommended assignment', arrayInvalid: 'Each standard array value must be used once.', pointsLeft: 'Points left', reroll: 'Reroll',
    roll4d6: 'Roll 6 × 4d6 (drop lowest)', manualIntro: 'Enter the scores yourself – e.g. if you rolled with real dice.',
    inventoryNow: 'Current equipment', moreInSheet: 'Add and change more equipment on the sheet’s Inventory tab.', startingEquipment: 'starting equipment', undo: 'Undo',
    ready: 'Your character is ready!', readyText: 'All choices are made. Press Finish to go to the sheet.', remaining: '{{n}} choices remaining', skillsProf: 'Skill proficiencies'
  },
  comp: { showAll: 'Show all {{n}} in {{group}}', allBooks: 'All books', allSources: 'All sources', count: '{{n}} results', refine: '{{n}} more – search to narrow down' },
  hb: {
    new: 'New homebrew', edit: 'Edit {{name}}', copyFrom: 'Copy from existing', type: 'Type', summary: 'Short description',
    summaryHint: 'Shown in the small popup', editText: 'Edit', preview: 'Preview', effects: 'Effects (update the sheet automatically)',
    effectsHint: 'E.g. AC +1, Speed +10, advantage on Stealth, fire resistance…', addEffect: 'Add effect', condition: 'Condition (optional)',
    noEffects: 'No effects', intro: 'A shared library of your own subclasses, species, backgrounds, feats, spells, items, monsters and more – usable by all your characters and easy to share.',
    empty: 'The library is empty', emptyText: 'Create homebrew here, or save from a character’s Homebrew & abilities tab.', effectCount: '{{n}} effect(s)',
    imported: '{{n}} imported', importFail: 'Could not read the file',
    featuresHint: 'Click a feature to edit it: level, uses, effects and what it does in combat.', addFeature: 'Add feature', editFeature: 'Edit feature', noFeatures: 'No features yet.',
    subclassHint: '{{cls}} chooses a subclass at level {{lvl}}. Features show on the sheet from the level you set and can be used in combat mode.',
    subclassFeatures: 'Subclass features', alwaysPrepared: 'Always-prepared spells', alwaysPreparedHint: 'E.g. domain or oath spells. Added automatically from the class level you choose.',
    addSpellLevel: 'Add level', classLevel: 'Class level', noSpells: 'No spells.', traits: 'Traits', speciesSpells: 'Innate spells',
    speciesSpellsHint: 'Granted automatically from the character level you choose, and can be cast free once per long rest in combat mode.', charLevel: 'Character level',
    bgAbilities: 'Ability scores (pick 3 – {{n}} picked)', toolChoice: 'Choice: {{what}}', bgSkills: 'Skill proficiencies (pick 2 – {{n}} picked)', equipment: 'Starting equipment', addItems: 'Add equipment',
    statBlock: 'Stat block (traits, actions …)', statBlockPh: '**Traits.** …\n\n### Actions\n**Bite.** Melee Attack Roll: +4, reach 5 ft. Hit: 6 (1d8 + 2) Piercing damage.',
    err: { name: 'Name is missing', abilities: 'Pick exactly 3 ability scores', skills: 'Pick exactly 2 skills', class: 'Pick a class' },
    importTip: 'Import homebrew from a .json file (from a friend or another PC)', exportTip: 'Save the whole library as one shareable file',
    duplicated: '{{name}} duplicated', editShort: 'Edit', duplicate: 'Duplicate', exportOne: 'Export this as a file',
    chooseKind: 'What do you want to create?', deleteTitle: 'Delete?', deleteText: '{{name}} will be removed from the library. Characters using it will lose it.',
    kindDesc: {
      subclass: 'Your own subclass for a class – with features per level and always-prepared spells.',
      species: 'Your own species with size, speed, darkvision, traits and innate spells.',
      background: 'Your own background with ability scores, origin feat, skills, tool and equipment.',
      feat: 'Origin, general, fighting style or epic boon – with effects.',
      spell: 'Your own spell with damage, save, attack and classes.',
      magicItem: 'Magic item with rarity, attunement, bonus and effects.',
      weapon: 'Weapon with damage, properties and mastery.',
      armor: 'Armor or shield with AC.',
      gear: 'Gear, equipment or other things.',
      tool: 'Tool or instrument.',
      creature: 'Monster, companion or familiar with a stat block – can be added in combat mode.',
      language: 'A language for your world.'
    },
    useHint: { subclass: 'pick at level up / in the builder', species: 'pick in the builder', background: 'pick in the builder', creature: 'used in combat mode' }
  },
  settings: { showSupplements: 'Show supplement content (Xanathar’s, Tasha’s …)', showThirdParty: 'Show third-party content (Kobold Press, Level Up A5E …)', sourcesHint: 'Hidden sources disappear from lists and pickers. Characters already using them are not affected.',
    appearance: 'Appearance', language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light', animations: 'Animations', diceSound: 'Dice sound',
    showTips: 'Show tips panel by default', rules: 'Rules', hpMethod: 'HP on level up', hpFixed: 'Fixed value', hpRoll: 'Roll',
    ddb: 'Open D&D Beyond', ddbApp: 'In app window', ddbBrowser: 'In browser', storage: 'Storage', openFolder: 'Open folder', about: 'About',
    entries: '{{n}} entries in the rules data',
    trademark: 'Dungeons & Dragons and D&D Beyond are trademarks of Wizards of the Coast. This app is not affiliated with or endorsed by Wizards of the Coast.'
  },
  choices: { title: 'Choices', pending: '{{n}} choices missing', spellsPending: 'Spells missing – go to the Spells tab', done: 'Choices made ({{n}}) – click to change', none: 'No choices for this character.' },
  faith: {
    god: 'Deity', patron: 'Patron', godOrPatron: 'Deity / patron', pickGod: 'Choose deity', pickPatron: 'Choose patron', gods: 'Deities', patrons: 'Warlock patrons',
    search: 'Search name, domain, pantheon…', recommended: 'Recommended for your subclass', recommendedFor: 'Good fits for your class/subclass:',
    domains: 'Domains', symbol: 'Symbol',
    note: 'Forgotten Realms content: names and facts with short descriptions written for this app. Read more on D&D Beyond or in the Forgotten Realms books.',
    why: {
      god: 'Clerics and paladins often draw their power from a deity. The deity shapes ideals, behavior and what the character fights for – and the domain/oath should fit the deity.',
      patron: 'A warlock has made a pact with a powerful being. Who the patron is (an archdevil, archfey, Great Old One or celestial) gives strong roleplay hooks.',
      both: 'Your character has both divine power and a pact – choose the deity or patron that matters most to the story.'
    }
  },
  guide: {
    title: 'What is missing? – step by step', missingBtn: 'things missing – show me', badgeTitle: 'Click to see what is missing and fix it',
    step: 'Step {{n}} of {{total}}', remaining: '{{n}} remaining', from: 'Comes from', stepDone: 'Fixed! Moving on…', skip: 'Skip',
    showInTab: 'Show in tab', allDone: 'Everything is in place!', allDoneText: 'Your character has no unresolved choices. Good luck on your adventure!',
    recommendedSpells: 'Recommended for the class',
    why: {
      skill: 'Choose {{n}} skill(s) your character is trained in. You add your Proficiency Bonus when rolling them.',
      expertise: 'Expertise doubles your Proficiency Bonus on the chosen skills. You can only pick skills you are already proficient in.',
      tool: 'Choose a tool you are trained with. You add your Proficiency Bonus when using it.',
      language: 'Choose {{n}} language(s) your character can speak, read and write.',
      option: 'Your class or feat lets you choose an option. Click a name to read what it does before choosing.',
      ability: 'Choose which ability score this applies to.',
      subclass: 'You have reached the level where your class chooses a subclass. It grants new features throughout your career – click ⓘ in the list to read about each.',
      speciesOption: 'Your species has several variants (lineage/ancestry/legacy). The variant grants its own traits and often spells.',
      feat: 'Choose a feat. Feats grant new abilities – some also give +1 to an ability score.',
      weaponMastery: 'Choose weapons whose mastery property you can use (e.g. Topple, Sap, Vex). Pick the weapons you actually use.',
      spell: 'Choose {{n}} spell(s) from the list.',
      cantrip: 'Choose {{n}} cantrip(s) – spells you can cast at will.',
      cantrips: 'Choose {{n}} more cantrip(s). Cantrips can be cast as often as you like without spell slots.',
      prepared: 'You can prepare {{n}} more spell(s). Prepared spells are the ones you can cast with spell slots today.',
      bgAbilities: 'Your background gives +2 and +1 (or +1/+1/+1) to three ability scores. Distribute them – ideally +2 to your primary ability.',
      bgFeat: 'Your background grants an origin feat. Click to add it.',
      languages: 'Everyone knows Common. In addition you choose two languages at creation.',
      featAbility: 'The feat grants +1 to an ability score – choose which.',
      asi: 'You reached an Ability Score Improvement level. Choose the “Ability Score Improvement” feat for +2 to one (or +1 to two) ability scores – or another general feat.',
      epicBoon: 'Level 19 grants an Epic Boon – a powerful feat for the mightiest heroes.',
      generic: 'This choice is missing.'
    }
  },
  adjust: {
    title: 'Override values (custom game)', intro: 'Add an adjustment (e.g. +2 STR) on top of the automatic calculation – everything else still updates automatically. “Fixed” replaces the calculation entirely.',
    baseScores: 'Change base scores', resetAll: 'Reset all', abilities: 'Ability scores', saves: 'Saving throws', skills: 'Skills', combat: 'Combat & other',
    masteryCount: 'Weapon Mastery count', spellcasting: 'Spellcasting', slots: 'Spell slots level {{n}}', attacks: 'Attacks', attackBonus: 'attack bonus', damageBonus: 'damage bonus',
    auto: 'Auto', adjustment: 'Adjustment', fixed: 'Fixed', result: 'Result'
  },
  party: partyEn,
  combat: combatEn,
  tools: toolsEn,
  items: itemsEn,
  ability: abilityEn,
  polish: polishEn,
  spellsx: spellsxEn
}
