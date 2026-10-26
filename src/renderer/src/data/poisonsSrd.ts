import type { GearDef } from '../types'

// Sample Poisons from the Gameplay Toolbox (System Reference Document 5.2.1, CC-BY-4.0), as purchasable gear.
export const poisonsSrd: GearDef[] = [
  {
    "id": "assassins-blood",
    "name": "Assassin’s Blood",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "150 GP",
    "weight": 0,
    "summary": "Ingested Poison (150 GP). A creature subjected to Assassin’s Blood makes a DC 10 Constitution saving throw.",
    "description": "*Ingested Poison*\n\nA creature subjected to Assassin’s Blood makes a DC 10 Constitution saving throw. On a failed save, the creature takes 6 (1d12) Poison damage and has the Poisoned condition for 24 hours. On a successful save, the creature takes half as much damage only.\n\n**Cost:** 150 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "burnt-othur-fumes",
    "name": "Burnt Othur Fumes",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "500 GP",
    "weight": 0,
    "summary": "Inhaled Poison (500 GP). A creature subjected to Burnt Othur Fumes must succeed on a DC 13 Constitution saving throw or take 10 (3d6) Poison damage, and it must repeat the save at the start of…",
    "description": "*Inhaled Poison*\n\nA creature subjected to Burnt Othur Fumes must succeed on a DC 13 Constitution saving throw or take 10 (3d6) Poison damage, and it must repeat the save at the start of each of its turns. On each successive failed save, the creature takes 3 (1d6) Poison damage. After three successful saves, the poison ends.\n\n**Cost:** 500 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "crawler-mucus",
    "name": "Crawler Mucus",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "200 GP",
    "weight": 0,
    "summary": "Contact Poison (200 GP). A creature subjected to Crawler Mucus must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 minute.",
    "description": "*Contact Poison*\n\nA creature subjected to Crawler Mucus must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 minute. The creature also has the Paralyzed condition while Poisoned in this way. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success.\n\n**Cost:** 200 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "essence-of-ether",
    "name": "Essence of Ether",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "300 GP",
    "weight": 0,
    "summary": "Inhaled Poison (300 GP). A creature subjected to Essence of Ether must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 8 hours.",
    "description": "*Inhaled Poison*\n\nA creature subjected to Essence of Ether must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 8 hours. The creature also has the Unconscious condition while Poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake.\n\n**Cost:** 300 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "malice",
    "name": "Malice",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "250 GP",
    "weight": 0,
    "summary": "Inhaled Poison (250 GP). A creature subjected to Malice must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 1 hour.",
    "description": "*Inhaled Poison*\n\nA creature subjected to Malice must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 1 hour. The creature also has the Blinded condition while Poisoned in this way.\n\n**Cost:** 250 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "midnight-tears",
    "name": "Midnight Tears",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "1,500 GP",
    "weight": 0,
    "summary": "Ingested Poison (1,500 GP). A creature that ingests Midnight Tears suffers no effect until the stroke of midnight.",
    "description": "*Ingested Poison*\n\nA creature that ingests Midnight Tears suffers no effect until the stroke of midnight. Any effect that ends the Poisoned condition neutralizes this poison. If the poison hasn’t been neutralized before midnight, the creature makes a DC 17 Constitution saving throw, taking 31 (9d6) Poison damage on a failed save or half as much damage on a successful one.\n\n**Cost:** 1,500 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "oil-of-taggit",
    "name": "Oil of Taggit",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "400 GP",
    "weight": 0,
    "summary": "Contact Poison (400 GP). A creature subjected to Oil of Taggit must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 24 hours.",
    "description": "*Contact Poison*\n\nA creature subjected to Oil of Taggit must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 24 hours. The creature also has the Unconscious condition while Poisoned in this way. It wakes up if it takes damage.\n\n**Cost:** 400 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "pale-tincture",
    "name": "Pale Tincture",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "250 GP",
    "weight": 0,
    "summary": "Ingested Poison (250 GP). A creature subjected to Pale Tincture must succeed on a DC 16 Constitution saving throw or take 3 (1d6) Poison damage and have the Poisoned condition.",
    "description": "*Ingested Poison*\n\nA creature subjected to Pale Tincture must succeed on a DC 16 Constitution saving throw or take 3 (1d6) Poison damage and have the Poisoned condition. The Poisoned creature repeats the save every 24 hours, taking 3 (1d6) Poison damage on a failed save. The damage the poison deals can’t be healed by any means while the creature remains Poisoned. After seven successful saves against the poison, the creature is no longer Poisoned.\n\n**Cost:** 250 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "purple-worm-poison",
    "name": "Purple Worm Poison",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "2,000 GP",
    "weight": 0,
    "summary": "Injury Poison (2,000 GP). A creature subjected to Purple Worm Poison makes a DC 21 Constitution saving throw, taking 35 (10d6) Poison damage on a failed save or half as much damage on a…",
    "description": "*Injury Poison*\n\nA creature subjected to Purple Worm Poison makes a DC 21 Constitution saving throw, taking 35 (10d6) Poison damage on a failed save or half as much damage on a successful one.\n\n**Cost:** 2,000 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "serpent-venom",
    "name": "Serpent Venom",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "200 GP",
    "weight": 0,
    "summary": "Injury Poison (200 GP). A creature subjected to Serpent Venom must succeed on a DC 11 Constitution saving throw, taking 10 (3d6) Poison damage on a failed save or half as much damage on a…",
    "description": "*Injury Poison*\n\nA creature subjected to Serpent Venom must succeed on a DC 11 Constitution saving throw, taking 10 (3d6) Poison damage on a failed save or half as much damage on a successful one.\n\n**Cost:** 200 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "spiders-sting",
    "name": "Spider’s Sting",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "200 GP",
    "weight": 0,
    "summary": "Injury Poison (200 GP). A creature subjected to Spider’s Sting must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour.",
    "description": "*Injury Poison*\n\nA creature subjected to Spider’s Sting must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour. If the creature fails the save by 5 or more, the creature also has the Unconscious condition while Poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake.\n\n**Cost:** 200 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "torpor",
    "name": "Torpor",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "600 GP",
    "weight": 0,
    "summary": "Ingested Poison (600 GP). A creature subjected to Torpor poison must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 4d6 hours.",
    "description": "*Ingested Poison*\n\nA creature subjected to Torpor poison must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 4d6 hours. The creature’s Speed is halved while the creature is Poisoned in this way.\n\n**Cost:** 600 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "truth-serum",
    "name": "Truth Serum",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "150 GP",
    "weight": 0,
    "summary": "Ingested Poison (150 GP). A creature subjected to Truth Serum must succeed on a DC 11 Constitution saving throw or have the Poisoned condition for 1 hour.",
    "description": "*Ingested Poison*\n\nA creature subjected to Truth Serum must succeed on a DC 11 Constitution saving throw or have the Poisoned condition for 1 hour. The Poisoned creature can’t knowingly communicate a lie.\n\n**Cost:** 150 GP",
    "tags": [
      "poison"
    ]
  },
  {
    "id": "wyvern-poison",
    "name": "Wyvern Poison",
    "kind": "gear",
    "source": "SRD 5.2",
    "category": "Poison",
    "cost": "1,200 GP",
    "weight": 0,
    "summary": "Injury Poison (1,200 GP). A creature subjected to Wyvern Poison makes a DC 14 Constitution saving throw, taking 24 (7d6) Poison damage on a failed save or half as much damage on a successful one.",
    "description": "*Injury Poison*\n\nA creature subjected to Wyvern Poison makes a DC 14 Constitution saving throw, taking 24 (7d6) Poison damage on a failed save or half as much damage on a successful one.\n\n**Cost:** 1,200 GP",
    "tags": [
      "poison"
    ]
  }
]
