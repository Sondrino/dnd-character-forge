import type { RuleDef } from '../types'
import data from './rulesSrd.json'

/**
 * SRD 5.2.1 rules chapters as compendium entries: Playing the Game, Character Creation (incl. Trinkets),
 * Lifestyle/Hirelings/Spellcasting Services, Spellcasting rules, Gameplay Toolbox (travel, curses,
 * contagions, environmental effects, fear, poisons, traps, encounters), Magic Item rules and Monster rules.
 */
export const rulesSrd = data as RuleDef[]
