import type { DeityDef } from '../types'

/**
 * Guder og warlock-patrons i Forgotten Realms (Faerûn).
 * Kun fakta (navn, tittel, alignment, domains, symbol, portfolio) og korte beskrivelser skrevet for denne appen.
 * `suggested` peker på subclasses i appen: cleric domains (2024: Knowledge, Life, Light, Trickery, War),
 * paladin oaths og warlock patrons.
 */

const DOMAIN_SUB: Record<string, string> = {
  Knowledge: 'knowledge-domain',
  Arcana: 'knowledge-domain',
  Forge: 'knowledge-domain',
  Life: 'life-domain',
  Light: 'light-domain',
  Trickery: 'trickery-domain',
  War: 'war-domain'
}

type Row = [
  id: string,
  name: string,
  title: string,
  alignment: string,
  domains: string[],
  symbol: string,
  portfolio: string,
  pantheon: string,
  text: string,
  roleplay: string,
  oaths?: string[],
  patrons?: string[]
]

const D = 'oath-of-devotion'
const G = 'oath-of-glory'
const A = 'oath-of-the-ancients'
const V = 'oath-of-vengeance'

function god([id, name, title, alignment, domains, symbol, portfolio, pantheon, text, roleplay, oaths = [], patrons = []]: Row): DeityDef {
  const subs = [...new Set(domains.map((d) => DOMAIN_SUB[d]).filter(Boolean))]
  return {
    id,
    name,
    kind: 'deity',
    source: 'Forgotten Realms',
    category: 'god',
    pantheon,
    title,
    alignment,
    domains,
    symbol,
    portfolio,
    suggested: [...subs, ...oaths, ...patrons],
    summary: `${title} – god of ${portfolio.toLowerCase()} (${alignment}).`,
    tags: ['faerun', pantheon.toLowerCase(), ...domains.map((d) => `domain:${d.toLowerCase()}`)],
    description: `**${title}** · ${alignment} · ${pantheon} pantheon

**Portfolio:** ${portfolio}
**Domains:** ${domains.join(', ')}
**Symbol:** ${symbol}

${text}

**Roleplay:** ${roleplay}`
  }
}

const gods: Row[] = [
  // ----- Faerûnsk pantheon -----
  ['akadi', 'Akadi', 'The Queen of the Air', 'Neutral', ['Tempest'], 'A cloud', 'Air, movement, speed', 'Faerûnian',
    'Akadi is the restless spirit of wind and sky, worshipped by travelers, sailors who need a fair breeze, and air genasi.', 'Never stay in one place too long; freedom and motion are sacred.'],
  ['amaunator', 'Amaunator', 'The Keeper of the Eternal Sun', 'Lawful Neutral', ['Life', 'Light'], 'A golden sun', 'Bureaucracy, law, the sun, time', 'Faerûnian',
    'An ancient sun god of order and contracts, revered by judges, scribes and those who value fixed rules as steadily as the rising sun.', 'Keep your word and your records; order is a form of light.', [D]],
  ['asmodeus', 'Asmodeus', 'The Lord of the Nine Hells', 'Lawful Evil', ['Knowledge', 'Trickery'], 'Three inverted triangles arranged in a long triangle', 'Indulgence, contracts, tyranny', 'Faerûnian',
    'The master of the Nine Hells promises power and pleasure in exchange for souls, always bound by carefully worded contracts.', 'Every bargain has fine print – make sure you are the one who wrote it.', [], ['fiend-patron']],
  ['auril', 'Auril', 'The Frostmaiden', 'Neutral Evil', ['Nature', 'Tempest'], 'A six-pointed snowflake', 'Cold, winter', 'Faerûnian',
    'A cruel goddess of bitter winter, feared and appeased in the frozen north, especially in Icewind Dale.', 'Winter does not forgive weakness; offer respect to the cold or suffer it.'],
  ['azuth', 'Azuth', 'The High One', 'Lawful Neutral', ['Arcana', 'Knowledge'], 'A left hand pointing upward, outlined in fire', 'Wizards, spellcasting', 'Faerûnian',
    'Patron of wizards and the disciplined study of magic, close servant of Mystra.', 'Magic is a craft to be mastered with patience, not a toy.'],
  ['bane', 'Bane', 'The Black Hand', 'Lawful Evil', ['War'], 'An upright black right hand with thumb and fingers together', 'Tyranny, fear, hatred', 'Faerûnian',
    'The god of tyranny who demands absolute obedience and rules through fear, worshipped by conquerors and despots.', 'Strength comes from control; the weak exist to serve.', [V]],
  ['beshaba', 'Beshaba', 'The Maid of Misfortune', 'Chaotic Evil', ['Trickery'], 'Black antlers', 'Misfortune, bad luck, accidents', 'Faerûnian',
    'Tymora’s spiteful sister, prayed to mostly so she will look elsewhere.', 'Superstitious; never tempt fate, and always knock on wood.'],
  ['bhaal', 'Bhaal', 'The Lord of Murder', 'Neutral Evil', ['Death'], 'A skull surrounded by a ring of blood droplets', 'Murder, violent death', 'Faerûnian',
    'The god of murder, whose cult and scattered divine offspring have caused much bloodshed along the Sword Coast.', 'Not a typical choice for heroes – fitting for a dark backstory or a character fighting their heritage.'],
  ['chauntea', 'Chauntea', 'The Great Mother', 'Neutral Good', ['Life'], 'A sheaf of grain or a rose blooming over grain', 'Agriculture, growing things', 'Faerûnian',
    'The earth mother of harvests and farmers, one of the most widely worshipped deities among common folk.', 'Nurture what grows, share the harvest, and protect the farmers.', [A]],
  ['cyric', 'Cyric', 'The Prince of Lies', 'Chaotic Evil', ['Trickery'], 'A white jawless skull on a black or purple sunburst', 'Lies, intrigue, strife', 'Faerûnian',
    'A mortal who seized divinity; a god of deceit, madness and betrayal.', 'Trust no one – least of all your own allies.'],
  ['deneir', 'Deneir', 'The Lord of All Glyphs and Images', 'Neutral Good', ['Knowledge'], 'A burning candle above an open eye', 'Writing, literature, art', 'Faerûnian',
    'Patron of scribes, artists and record keepers who believes knowledge written down is knowledge preserved.', 'Document everything; a good record outlives any hero.'],
  ['eldath', 'Eldath', 'The Quiet One', 'Neutral Good', ['Life', 'Nature'], 'A waterfall plunging into a still pool', 'Peace, waterfalls, springs, pools', 'Faerûnian',
    'A gentle goddess of peace and calm waters, revered by pacifists and those seeking sanctuary.', 'Seek peaceful solutions first; violence is the last resort.', [A]],
  ['gond', 'Gond', 'The Wonderbringer', 'Neutral', ['Forge', 'Knowledge'], 'A toothed cog with four spokes', 'Craft, smithing, invention', 'Faerûnian',
    'God of inventors, artisans and tinkerers, worshipped especially by gnomes and in Lantan.', 'Always tinkering; every problem is a puzzle waiting for a clever device.'],
  ['grumbar', 'Grumbar', 'The Earthlord', 'Neutral', ['Knowledge'], 'A mountain', 'Elemental earth, stability', 'Faerûnian',
    'Primordial lord of elemental earth, revered by miners, earth genasi and those who value patience.', 'Unmoving and patient; change should be slow and solid.'],
  ['gwaeron-windstrom', 'Gwaeron Windstrom', 'The Master of Tracking', 'Neutral Good', ['Knowledge', 'Nature'], 'A paw print with a five-pointed star in its center', 'Tracking, rangers of the North', 'Faerûnian',
    'Servant of Mielikki and patron of trackers and rangers of the northern wilds.', 'Read the land like a book and guide the lost home.', [A]],
  ['helm', 'Helm', 'The Vigilant One', 'Lawful Neutral', ['Life', 'Light'], 'A staring eye on an upright left gauntlet', 'Guardians, protection, vigilance', 'Faerûnian',
    'The ever-watchful guardian god, beloved by bodyguards, city watches and paladins sworn to protect.', 'Never let your guard down; duty to protect comes before personal wishes.', [D, V]],
  ['hoar', 'Hoar', 'The Doombringer', 'Lawful Neutral', ['War'], 'A coin with a two-faced head', 'Revenge, retribution, poetic justice', 'Faerûnian',
    'God of vengeance and just retribution – the wronged pray to him so punishment fits the crime.', 'Every wrong must be answered, ideally with fitting irony.', [V]],
  ['ilmater', 'Ilmater', 'The Crying God', 'Lawful Good', ['Life'], 'Hands bound at the wrist with a red cord', 'Endurance, suffering, martyrdom', 'Faerûnian',
    'The god who takes on others’ suffering, worshipped by healers, the oppressed and those who endure hardship for others.', 'Ease the pain of others, even at your own cost.', [D]],
  ['istishia', 'Istishia', 'The Water Lord', 'Neutral', ['Tempest'], 'A wave', 'Elemental water, purification', 'Faerûnian',
    'Primordial lord of elemental water, flowing and adaptable.', 'Go around obstacles like water – change shape, but never stop.'],
  ['jergal', 'Jergal', 'The Scribe of the Dead', 'Lawful Neutral', ['Knowledge', 'Death'], 'A skull biting a scroll', 'Fatalism, proper burial, guardian of tombs', 'Faerûnian',
    'An ancient god of death who gave up his power and now keeps records of the dead for Kelemvor.', 'Calm and fatalistic; everything ends, so record it properly.'],
  ['kelemvor', 'Kelemvor', 'The Lord of the Dead', 'Lawful Neutral', ['Death'], 'An upright skeletal arm holding balanced scales', 'Death, the dead', 'Faerûnian',
    'The fair judge of the dead who teaches that death is a natural part of life, and opposes undeath.', 'Death is not to be feared – but undead must be laid to rest.', [V]],
  ['kossuth', 'Kossuth', 'The Firelord', 'Neutral', ['Light'], 'A flame', 'Elemental fire, purification by fire', 'Faerûnian',
    'Primordial lord of elemental fire, worshipped by fire genasi and those who believe in renewal through flame.', 'Burn away the old to make room for the new.'],
  ['lathander', 'Lathander', 'The Morninglord', 'Neutral Good', ['Life', 'Light'], 'A road traveling into a sunrise', 'Birth, dawn, renewal, vitality', 'Faerûnian',
    'God of new beginnings and the dawn, one of the most popular good deities among humans.', 'Optimistic; every morning is a fresh start and a chance to do better.', [D, A], ['celestial-patron']],
  ['leira', 'Leira', 'The Lady of the Mists', 'Chaotic Neutral', ['Trickery'], 'A point-down triangle containing a swirl of mist', 'Illusion, deception', 'Faerûnian',
    'Goddess of illusions and things that are not what they seem.', 'Reality is negotiable; never take anything at face value.'],
  ['lliira', 'Lliira', 'Our Lady of Joy', 'Chaotic Good', ['Life'], 'A triangle of three six-pointed stars', 'Joy, happiness, dance, festivals', 'Faerûnian',
    'Goddess of joy and celebration who hates violence that spoils festivities.', 'Spread joy; a good party heals more than many spells.', [A]],
  ['loviatar', 'Loviatar', 'The Maiden of Pain', 'Lawful Evil', ['Death'], 'A nine-tailed barbed scourge', 'Pain, hurt, agony', 'Faerûnian',
    'A cruel goddess who sees pain as a path to strength.', 'A villain’s faith – fitting for antagonists more than heroes.'],
  ['malar', 'Malar', 'The Beastlord', 'Chaotic Evil', ['Nature'], 'A clawed paw', 'Hunters, stalking, bloodlust', 'Faerûnian',
    'Savage god of the bloody hunt, worshipped by werebeasts and brutal hunters.', 'Only the strongest survive the hunt.'],
  ['mask', 'Mask', 'The Lord of Shadows', 'Chaotic Neutral', ['Trickery'], 'A black mask', 'Thieves, thievery, shadows', 'Faerûnian',
    'Patron of thieves and those who work unseen.', 'A good plan, quiet feet, and never get caught.'],
  ['mielikki', 'Mielikki', 'Our Lady of the Forest', 'Neutral Good', ['Nature'], 'A unicorn’s head', 'Forests, forest creatures, rangers, dryads', 'Faerûnian',
    'Goddess of forests and patron of rangers, who protects the wild without rejecting civilization.', 'Protect the forest and its creatures; take only what you need.', [A]],
  ['milil', 'Milil', 'The Lord of Song', 'Neutral Good', ['Light'], 'A five-stringed harp made of leaves', 'Poetry, song, eloquence', 'Faerûnian',
    'God of music and poetry, beloved by bards and storytellers.', 'Every adventure deserves a song – make sure it is a good one.'],
  ['myrkul', 'Myrkul', 'The Lord of Bones', 'Neutral Evil', ['Death'], 'A white human skull', 'Death, decay, old age', 'Faerûnian',
    'A former god of the dead, feared for his cold embrace of decay and undeath.', 'A dark faith – suited to villains or redemption stories.'],
  ['mystra', 'Mystra', 'The Mother of All Magic', 'Neutral Good', ['Arcana', 'Knowledge'], 'A circle of seven stars', 'Magic, spells, the Weave', 'Faerûnian',
    'Goddess of magic and keeper of the Weave, through which all spells in Faerûn flow.', 'Use magic responsibly – it is a gift, not a weapon for tyranny.'],
  ['oghma', 'Oghma', 'The Lord of Knowledge', 'Neutral', ['Knowledge'], 'A blank scroll', 'Knowledge, invention, inspiration', 'Faerûnian',
    'The great god of knowledge and ideas who believes information should flow freely.', 'Curious; collect knowledge and share it.'],
  ['the-red-knight', 'The Red Knight', 'The Lady of Strategy', 'Lawful Neutral', ['War'], 'A red knight chess piece with star eyes', 'Strategy, planning, tactics', 'Faerûnian',
    'Goddess of tactics and planning, served by officers and strategists.', 'Victory is won before the battle starts – plan carefully.', [G]],
  ['savras', 'Savras', 'The All-Seeing', 'Lawful Neutral', ['Arcana', 'Knowledge'], 'A crystal ball containing many kinds of eyes', 'Divination, fate, truth', 'Faerûnian',
    'God of divination and truth, worshipped by seers and diviners.', 'Look for signs in everything; the future can be read.'],
  ['selune', 'Selûne', 'Our Lady of Silver', 'Chaotic Good', ['Knowledge', 'Life'], 'A pair of eyes surrounded by seven stars', 'The moon, stars, navigation, good lycanthropes', 'Faerûnian',
    'The moon goddess, guide of travelers and eternal enemy of her dark twin Shar.', 'A light in the darkness; help the lost find their way.', [D, A], ['celestial-patron']],
  ['shar', 'Shar', 'The Mistress of the Night', 'Neutral Evil', ['Death', 'Trickery'], 'A black disk encircled with a border', 'Darkness, night, loss, forgetfulness', 'Faerûnian',
    'Goddess of darkness and secrets who offers the comfort of forgetting, eternal rival of Selûne.', 'Secrets and loss – a dramatic choice for darker characters.'],
  ['silvanus', 'Silvanus', 'Oak Father', 'Neutral', ['Nature'], 'An oak leaf', 'Wild nature, druids', 'Faerûnian',
    'The father of wild nature, most revered by druids, who seeks balance between all things.', 'Keep the balance of nature – neither civilization nor wilderness should dominate.', [A]],
  ['sune', 'Sune', 'Lady Firehair', 'Chaotic Good', ['Life', 'Light'], 'The face of a beautiful red-haired woman', 'Love, beauty, passion', 'Faerûnian',
    'Goddess of love and beauty, inside and out.', 'Follow your heart and seek beauty in all things.', [D], ['celestial-patron']],
  ['talona', 'Talona', 'The Lady of Poison', 'Chaotic Evil', ['Death'], 'Three teardrops on a triangle', 'Disease, poison', 'Faerûnian',
    'Feared goddess of plague and poison.', 'Mostly worshipped out of fear – a villain’s deity.'],
  ['talos', 'Talos', 'The Stormlord', 'Chaotic Evil', ['Tempest'], 'Three lightning bolts radiating from a central point', 'Storms, destruction, rebellion', 'Faerûnian',
    'The destructive god of storms and natural disasters.', 'Embrace chaos and raw power.'],
  ['tempus', 'Tempus', 'The Foehammer', 'Neutral', ['War'], 'An upright flaming sword', 'War, battle, warriors', 'Faerûnian',
    'The god of war and battle itself – revered by soldiers and mercenaries on every side of a conflict.', 'Fight with honor and courage; cowardice is the worst sin.', [G]],
  ['torm', 'Torm', 'The Loyal Fury', 'Lawful Good', ['War'], 'A white right gauntlet', 'Courage, self-sacrifice, duty', 'Faerûnian',
    'God of loyalty and righteous duty, beloved by paladins.', 'Stand firm for what is right and protect the innocent – no matter the cost.', [D, G, V]],
  ['tymora', 'Tymora', 'Lady Luck', 'Chaotic Good', ['Trickery'], 'A face-up coin', 'Good fortune, skill, victory, adventurers', 'Faerûnian',
    'Goddess of good luck and patron of adventurers – the most common faith among heroes in Faerûn.', 'Fortune favors the bold – take the risk!'],
  ['tyr', 'Tyr', 'The Even-Handed', 'Lawful Good', ['War'], 'Balanced scales resting on a warhammer', 'Justice', 'Faerûnian',
    'The blind god of justice, worshipped by judges and paladins.', 'Justice must be fair to everyone – the law protects the weak.', [D, V]],
  ['umberlee', 'Umberlee', 'The Queen of the Depths', 'Chaotic Evil', ['Tempest'], 'A wave curling left and right', 'Oceans, currents, waves, sea winds', 'Faerûnian',
    'The capricious and cruel sea goddess sailors offer gifts to, hoping for safe passage.', 'The sea takes what it wants – show respect and pay tribute.'],
  ['valkur', 'Valkur', 'Captain of the Waves', 'Chaotic Good', ['Tempest', 'War'], 'A cloud and three lightning bolts', 'Sailors, ships, favorable winds', 'Faerûnian',
    'The brave sailor god and Umberlee’s opponent, prayed to by crews in storms.', 'Bold and loyal to your crew; never abandon ship.', [G]],
  ['waukeen', 'Waukeen', 'The Merchant’s Friend', 'Neutral', ['Knowledge', 'Trickery'], 'An upright coin with Waukeen’s profile facing left', 'Trade, money, wealth', 'Faerûnian',
    'Goddess of trade and commerce, popular among merchants.', 'Every deal should benefit both sides – and a good bargain is a prayer.'],

  // ----- Andre pantheoner -----
  ['moradin', 'Moradin', 'The Soul Forger', 'Lawful Good', ['Forge', 'Knowledge'], 'A flaming anvil', 'Dwarves, creation, smithing', 'Dwarven',
    'Creator and father of the dwarves, patron of smiths and protectors of the clan.', 'Clan, craftsmanship and honor above all.', [D]],
  ['berronar-truesilver', 'Berronar Truesilver', 'The Revered Mother', 'Lawful Good', ['Life'], 'Two interlocking silver rings', 'Home, family, honesty, healing', 'Dwarven',
    'Goddess of dwarven home and family, consort of Moradin.', 'Protect the family and always speak truthfully.', [D]],
  ['clangeddin-silverbeard', 'Clangeddin Silverbeard', 'The Father of Battle', 'Lawful Good', ['War'], 'Two crossed silver battleaxes', 'Battle, war, honor', 'Dwarven',
    'The dwarven god of war and honorable battle.', 'Meet your enemies head-on and never break your oath.', [G]],
  ['dumathoin', 'Dumathoin', 'The Keeper of Secrets under the Mountain', 'Neutral', ['Death'], 'A flawless cut gem inside a mountain', 'Mining, gems, the dwarven dead', 'Dwarven',
    'Silent guardian of the mountain’s riches and the dwarven dead.', 'Quiet and patient; the earth keeps its secrets.'],
  ['corellon-larethian', 'Corellon Larethian', 'The Creator of the Elves', 'Chaotic Good', ['Light'], 'A quarter moon or starburst', 'Elves, magic, art, music', 'Elven',
    'Creator of the elves and patron of magic, art and beauty.', 'Freedom, beauty and creativity are elven virtues.', [A]],
  ['sehanine-moonbow', 'Sehanine Moonbow', 'The Lady of Dreams', 'Chaotic Good', ['Knowledge'], 'A full moon under a moonbow', 'Dreams, death, journeys, moonlight', 'Elven',
    'Goddess of dreams and the journey after death, who guides elven souls.', 'Pay attention to your dreams – they carry messages.'],
  ['rillifane-rallathil', 'Rillifane Rallathil', 'The Leaflord', 'Chaotic Good', ['Nature'], 'An oak', 'Wood elves, nature, wild places', 'Elven',
    'God of the wild elves and the great forests.', 'One with the forest; protect the old trees.', [A]],
  ['eilistraee', 'Eilistraee', 'The Dark Maiden', 'Chaotic Good', ['Life', 'Light', 'Nature'], 'A sword-wielding silhouette before the moon', 'Good drow, song, beauty, moonlight', 'Drow',
    'Goddess of the good drow who left the Underdark, a light of hope against Lolth.', 'Prove that origin does not decide who you are.', [A], ['celestial-patron']],
  ['lolth', 'Lolth', 'The Queen of Spiders', 'Chaotic Evil', ['Trickery'], 'A spider', 'Drow, spiders, evil, darkness', 'Drow',
    'The cruel goddess of the drow who rules through intrigue and fear.', 'A villain’s faith – or a past a drow character is fleeing.'],
  ['garl-glittergold', 'Garl Glittergold', 'The Joker', 'Lawful Good', ['Trickery'], 'A gold nugget', 'Gnomes, humor, gemcutting, trickery', 'Gnomish',
    'The playful god of the gnomes, known for practical jokes and clever crafts.', 'Laughter is the best weapon – and a good prank never hurts anyone.'],
  ['yondalla', 'Yondalla', 'The Protector and Provider', 'Lawful Good', ['Life'], 'A shield', 'Halflings, fertility, protection', 'Halfling',
    'The mother of the halflings, who protects home and community.', 'Take care of the community and stand together.', [D]],
  ['brandobaris', 'Brandobaris', 'The Master of Stealth', 'Neutral', ['Trickery'], 'A halfling’s footprint', 'Stealth, thievery, adventuring', 'Halfling',
    'The adventurous halfling god of stealth and daring escapades.', 'Curious and daring – one more adventure before going home.'],
  ['gruumsh', 'Gruumsh', 'He Who Never Sleeps', 'Chaotic Evil', ['Tempest', 'War'], 'An unblinking eye', 'Orcs, conquest, strength', 'Orc',
    'The one-eyed god of the orcs, driving them to conquest.', 'Many 2024 orc heroes reject him – a strong source of conflict for an orc character.'],
  ['bahamut', 'Bahamut', 'The Platinum Dragon', 'Lawful Good', ['Life', 'War'], 'A dragon’s head in profile', 'Good dragons, justice, protection', 'Draconic',
    'The Platinum Dragon who protects the weak and opposes Tiamat, revered by many dragonborn and paladins.', 'Protect the defenseless and fight evil with honor.', [D, G], ['celestial-patron']],
  ['tiamat', 'Tiamat', 'The Dragon Queen', 'Lawful Evil', ['Trickery'], 'A dragon head with five claw marks', 'Evil dragons, greed, conquest', 'Draconic',
    'The five-headed queen of evil dragons, driven by greed and lust for power.', 'A villain’s faith – fitting for the antagonist of a dragon campaign.']
]

/* ------------------------------------------------------------------ */
/* Warlock-patrons                                                     */
/* ------------------------------------------------------------------ */

type PatronRow = [id: string, name: string, title: string, alignment: string, pantheon: string, patronType: string, text: string, roleplay: string]

const PATRON_SUB: Record<string, string> = {
  Fiend: 'fiend-patron',
  Archfey: 'archfey-patron',
  'Great Old One': 'great-old-one-patron',
  Celestial: 'celestial-patron'
}

function patron([id, name, title, alignment, pantheon, patronType, text, roleplay]: PatronRow): DeityDef {
  return {
    id,
    name,
    kind: 'deity',
    source: 'Forgotten Realms',
    category: 'patron',
    pantheon,
    title,
    alignment,
    domains: [],
    symbol: '—',
    portfolio: `${patronType} patron`,
    suggested: [PATRON_SUB[patronType]],
    summary: `${title} – a ${patronType} patron for warlocks (${alignment}).`,
    tags: ['faerun', 'patron', `patron:${patronType.toLowerCase()}`],
    description: `**${title}** · ${alignment} · ${patronType} patron (${pantheon})

${text}

**What they want from a warlock:** ${roleplay}`
  }
}

const patrons: PatronRow[] = [
  // Fiend
  ['mephistopheles', 'Mephistopheles', 'Lord of Cania, the Eighth Hell', 'Lawful Evil', 'Archdevil', 'Fiend',
    'A brilliant archdevil obsessed with arcane secrets and hellfire, always scheming to rise higher.', 'Arcane knowledge, forbidden spells and loyalty – he rewards ambitious spellcasters.'],
  ['zariel', 'Zariel', 'Archduke of Avernus', 'Lawful Evil', 'Archdevil', 'Fiend',
    'A fallen angel who leads the armies of the first Hell in the Blood War against the demons.', 'Warriors for the endless war, and souls hungry for glory in battle.'],
  ['glasya', 'Glasya', 'Princess of Hell', 'Lawful Evil', 'Archdevil', 'Fiend',
    'Asmodeus’s daughter, mistress of crime and loopholes in contracts.', 'Clever criminals who exploit the letter of the law.'],
  ['levistus', 'Levistus', 'Lord of Stygia', 'Lawful Evil', 'Archdevil', 'Fiend',
    'The archdevil imprisoned in ice, a master of betrayal and escape.', 'Help with his schemes to break free – and an appreciation for betrayal.'],
  ['grazzt', 'Graz’zt', 'The Dark Prince', 'Chaotic Evil', 'Demon Lord', 'Fiend',
    'A seductive and vain demon lord who rules through charm and excess.', 'Pleasure, luxury and devotion – he loves attention.'],
  ['demogorgon', 'Demogorgon', 'The Prince of Demons', 'Chaotic Evil', 'Demon Lord', 'Fiend',
    'The two-headed demon lord of madness and destruction.', 'Chaos and ruin – dangerous for any warlock who serves him.'],
  ['orcus', 'Orcus', 'The Demon Prince of Undeath', 'Chaotic Evil', 'Demon Lord', 'Fiend',
    'The demon lord of undeath who dreams of turning all life into undeath.', 'Spreading undeath – a dark patron for villains.'],
  ['yeenoghu', 'Yeenoghu', 'The Gnoll Lord', 'Chaotic Evil', 'Demon Lord', 'Fiend',
    'The demon lord of slaughter and gnolls, a ravenous force of destruction.', 'Bloodshed and hunger without limits.'],
  // Archfey
  ['titania', 'Titania', 'The Summer Queen', 'Chaotic Neutral', 'Seelie Court', 'Archfey',
    'The radiant queen of the Seelie Court in the Feywild, powerful and capricious.', 'Beauty, joy and favors returned – she remembers every promise.'],
  ['oberon', 'Oberon', 'The Green Lord', 'Chaotic Neutral', 'Seelie Court', 'Archfey',
    'The wild king of the Feywild forests and Titania’s consort.', 'Protection of wild places and the thrill of the hunt.'],
  ['queen-of-air-and-darkness', 'The Queen of Air and Darkness', 'Queen of the Gloaming Court', 'Neutral Evil', 'Unseelie Court', 'Archfey',
    'The dark, invisible queen of the Unseelie Court, a master of fear and illusion.', 'Secrets, fear and revenge on the Summer Court.'],
  ['hyrsam', 'Hyrsam', 'The Prince of Fools', 'Chaotic Neutral', 'Feywild', 'Archfey',
    'A merry archfey who loves music, jokes and pranks.', 'Mischief and entertainment – life should never be boring.'],
  ['prince-of-frost', 'The Prince of Frost', 'The Lord of Winter’s Grief', 'Neutral Evil', 'Unseelie Court', 'Archfey',
    'A cold archfey marked by grief and longing for his lost love.', 'Help in his quest – and cold vengeance on the warm.'],
  // Great Old One
  ['hadar', 'Hadar', 'The Dark Hunger', 'Chaotic Evil', 'Far Realm', 'Great Old One',
    'A star-entity of devouring darkness whose power warlocks draw on through spells like Arms of Hadar.', 'Hunger and darkness – its will is incomprehensible.'],
  ['ghaunadaur', 'Ghaunadaur', 'That Which Lurks', 'Chaotic Evil', 'Underdark', 'Great Old One',
    'An ancient slime-entity worshipped by oozes and outcasts in the Underdark.', 'Rebellion against the established order, especially Lolth.'],
  ['dendar', 'Dendar the Night Serpent', 'The Eater of Nightmares', 'Neutral Evil', 'Primordial', 'Great Old One',
    'A titanic serpent who devours mortals’ nightmares and is said to herald the end of the world.', 'Fear and nightmares that feed it.'],
  ['tharizdun', 'Tharizdun', 'The Chained God', 'Neutral Evil', 'Far Realm', 'Great Old One',
    'A bound entity of destruction and madness, whispering through cracks in reality.', 'Freedom from its chains – at any price.'],
  // Celestial
  ['lurue', 'Lurue', 'The Unicorn Queen', 'Chaotic Good', 'Celestial', 'Celestial',
    'Queen of the talking beasts and intelligent unicorns, a symbol of hope and freedom.', 'Protect the innocent and wild creatures.'],
  ['solar-of-torm', 'A Solar of Torm', 'Herald of the Loyal Fury', 'Lawful Good', 'Celestial', 'Celestial',
    'A mighty angel serving Torm who grants power to mortals defending the weak.', 'Courage, loyalty and the fight against evil.']
]

export const deities: DeityDef[] = [...gods.map(god), ...patrons.map(patron)]

/** Er dette en class som tradisjonelt har gud/patron? */
export const FAITH_CLASSES = ['cleric', 'paladin', 'warlock']
