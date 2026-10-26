import type { CreatureDef } from '../types'
import data from './creatures.json'

/** SRD 5.2.1 stat blocks (Monsters A–Z + Animals), parsed from the SRD PDF. */
export const creatures = data as CreatureDef[]
