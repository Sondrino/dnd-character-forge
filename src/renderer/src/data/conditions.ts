import type { ConditionDef } from '../types'

// Source: System Reference Document 5.2.1 (CC-BY-4.0), Rules Glossary
export const conditions: ConditionDef[] = [
  {
    "id": "blinded",
    "name": "Blinded",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You can’t see and automatically fail any ability check that requires sight. Attack rolls against you have Advantage, and your attack rolls have Disadvantage.",
    "description": "While you have the Blinded condition, you experience the following effects.\n\n**Can’t See.** You can’t see and automatically fail any ability check that requires sight.\n\n**Attacks Affected.** Attack rolls against you have Advantage, and your attack rolls have Disadvantage."
  },
  {
    "id": "charmed",
    "name": "Charmed",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You can’t attack the charmer or target it with damaging abilities or magical effects. The charmer has Advantage on ability checks to interact with you socially.",
    "description": "While you have the Charmed condition, you experience the following effects.\n\n**Can’t Harm the Charmer.** You can’t attack the charmer or target the charmer with damaging abilities or magical effects.\n\n**Social Advantage.** The charmer has Advantage on any ability check to interact with you socially."
  },
  {
    "id": "deafened",
    "name": "Deafened",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You can’t hear and automatically fail any ability check that requires hearing.",
    "description": "While you have the Deafened condition, you experience the following effect.\n\n**Can’t Hear.** You can’t hear and automatically fail any ability check that requires hearing."
  },
  {
    "id": "exhaustion",
    "name": "Exhaustion",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "Cumulative levels (1–6): D20 Tests are reduced by 2 × your Exhaustion level and your Speed by 5 × the level in feet. You die at level 6; a Long Rest removes 1 level.",
    "description": "While you have the Exhaustion condition, you experience the following effects.\n\n**Exhaustion Levels.** This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.\n\n**D20 Tests Affected.** When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.\n\n**Speed Reduced.** Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.\n\n**Removing Exhaustion Levels.** Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends."
  },
  {
    "id": "frightened",
    "name": "Frightened",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight, and you can’t willingly move closer to it.",
    "description": "While you have the Frightened condition, you experience the following effects.\n\n**Ability Checks and Attacks Affected.** You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.\n\n**Can’t Approach.** You can’t willingly move closer to the source of fear."
  },
  {
    "id": "grappled",
    "name": "Grappled",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "Your Speed is 0, and you have Disadvantage on attack rolls against any target other than the grappler. The grappler can move you with it.",
    "description": "While you have the Grappled condition, you experience the following effects.\n\n**Speed 0.** Your Speed is 0 and can’t increase.\n\n**Attacks Affected.** You have Disadvantage on attack rolls against any target other than the grappler.\n\n**Movable.** The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it."
  },
  {
    "id": "incapacitated",
    "name": "Incapacitated",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You can’t take any action, Bonus Action, or Reaction, your Concentration is broken, you can’t speak, and you have Disadvantage on Initiative.",
    "description": "While you have the Incapacitated condition, you experience the following effects.\n\n**Inactive.** You can’t take any action, Bonus Action, or Reaction.\n\n**No Concentration.** Your Concentration is broken.\n\n**Speechless.** You can’t speak.\n\n**Surprised.** If you’re Incapacitated when you roll Initiative, you have Disadvantage on the roll."
  },
  {
    "id": "invisible",
    "name": "Invisible",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You can’t be seen. You have Advantage on Initiative and on attack rolls, and attack rolls against you have Disadvantage, unless the attacker can somehow see you.",
    "description": "While you have the Invisible condition, you experience the following effects.\n\n**Surprise.** If you’re Invisible when you roll Initiative, you have Advantage on the roll.\n\n**Concealed.** You aren’t affected by any effect that requires its target to be seen unless the effect’s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.\n\n**Attacks Affected.** Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don’t gain this benefit against that creature."
  },
  {
    "id": "paralyzed",
    "name": "Paralyzed",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You have the Incapacitated condition and your Speed is 0. You fail Strength and Dexterity saves, attacks against you have Advantage, and hits from within 5 feet are Critical Hits.",
    "description": "While you have the Paralyzed condition, you experience the following effects.\n\n**Incapacitated.** You have the Incapacitated condition.\n\n**Speed 0.** Your Speed is 0 and can’t increase.\n\n**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.\n\n**Attacks Affected.** Attack rolls against you have Advantage.\n\n**Automatic Critical Hits.** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you."
  },
  {
    "id": "petrified",
    "name": "Petrified",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You are turned to a solid inanimate substance: Incapacitated, Speed 0, attacks against you have Advantage, you fail Str and Dex saves, and you have Resistance to all damage.",
    "description": "While you have the Petrified condition, you experience the following effects.\n\n**Turned to Inanimate Substance.** You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.\n\n**Incapacitated.** You have the Incapacitated condition.\n\n**Speed 0.** Your Speed is 0 and can’t increase.\n\n**Attacks Affected.** Attack rolls against you have Advantage.\n\n**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.\n\n**Resist Damage.** You have Resistance to all damage.\n\n**Poison Immunity.** You have Immunity to the Poisoned condition."
  },
  {
    "id": "poisoned",
    "name": "Poisoned",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You have Disadvantage on attack rolls and ability checks.",
    "description": "While you have the Poisoned condition, you experience the following effect.\n\n**Ability Checks and Attacks Affected.** You have Disadvantage on attack rolls and ability checks."
  },
  {
    "id": "prone",
    "name": "Prone",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "Your only movement option is to crawl unless you spend half your Speed to stand up. You have Disadvantage on attack rolls; attacks against you have Advantage within 5 feet, otherwise Disadvantage.",
    "description": "While you have the Prone condition, you experience the following effects.\n\n**Restricted Movement.** Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can’t right yourself.\n\n**Attacks Affected.** You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage."
  },
  {
    "id": "restrained",
    "name": "Restrained",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "Your Speed is 0. Attack rolls against you have Advantage, your attack rolls have Disadvantage, and you have Disadvantage on Dexterity saving throws.",
    "description": "While you have the Restrained condition, you experience the following effects.\n\n**Speed 0.** Your Speed is 0 and can’t increase.\n\n**Attacks Affected.** Attack rolls against you have Advantage, and your attack rolls have Disadvantage.\n\n**Saving Throws Affected.** You have Disadvantage on Dexterity saving throws."
  },
  {
    "id": "stunned",
    "name": "Stunned",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You have the Incapacitated condition, you automatically fail Strength and Dexterity saving throws, and attack rolls against you have Advantage.",
    "description": "While you have the Stunned condition, you experience the following effects.\n\n**Incapacitated.** You have the Incapacitated condition.\n\n**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.\n\n**Attacks Affected.** Attack rolls against you have Advantage."
  },
  {
    "id": "unconscious",
    "name": "Unconscious",
    "kind": "condition",
    "source": "SRD 5.2",
    "summary": "You are Incapacitated and Prone and drop what you’re holding. You fail Str and Dex saves, attacks against you have Advantage, and hits from within 5 feet are Critical Hits.",
    "description": "While you have the Unconscious condition, you experience the following effects.\n\n**Inert.** You have the Incapacitated and Prone conditions, and you drop whatever you’re holding. When this condition ends, you remain Prone.\n\n**Speed 0.** Your Speed is 0 and can’t increase.\n\n**Attacks Affected.** Attack rolls against you have Advantage.\n\n**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.\n\n**Automatic Critical Hits.** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.\n\n**Unaware.** You’re unaware of your surroundings."
  }
]
