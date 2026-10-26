// Armor (SRD 5.2.1, CC-BY-4.0).
import type { ArmorCategory, ArmorDef } from '../types'

interface Row {
  id: string
  name: string
  category: ArmorCategory
  baseAC: number
  dexCap: number | null
  strength?: number
  stealth: boolean
  weight: number
  cost: string
}

const DON_DOFF: Record<ArmorCategory, string> = {
  light: '1 Minute to Don or Doff',
  medium: '5 Minutes to Don and 1 Minute to Doff',
  heavy: '10 Minutes to Don and 5 Minutes to Doff',
  shield: 'Utilize Action to Don or Doff'
}

const CATEGORY_LABEL: Record<ArmorCategory, string> = {
  light: 'Light Armor',
  medium: 'Medium Armor',
  heavy: 'Heavy Armor',
  shield: 'Shield'
}

const rows: Row[] = [
  { id: 'padded-armor', name: 'Padded Armor', category: 'light', baseAC: 11, dexCap: null, stealth: true, weight: 8, cost: '5 GP' },
  { id: 'leather-armor', name: 'Leather Armor', category: 'light', baseAC: 11, dexCap: null, stealth: false, weight: 10, cost: '10 GP' },
  { id: 'studded-leather-armor', name: 'Studded Leather Armor', category: 'light', baseAC: 12, dexCap: null, stealth: false, weight: 13, cost: '45 GP' },
  { id: 'hide-armor', name: 'Hide Armor', category: 'medium', baseAC: 12, dexCap: 2, stealth: false, weight: 12, cost: '10 GP' },
  { id: 'chain-shirt', name: 'Chain Shirt', category: 'medium', baseAC: 13, dexCap: 2, stealth: false, weight: 20, cost: '50 GP' },
  { id: 'scale-mail', name: 'Scale Mail', category: 'medium', baseAC: 14, dexCap: 2, stealth: true, weight: 45, cost: '50 GP' },
  { id: 'breastplate', name: 'Breastplate', category: 'medium', baseAC: 14, dexCap: 2, stealth: false, weight: 20, cost: '400 GP' },
  { id: 'half-plate-armor', name: 'Half Plate Armor', category: 'medium', baseAC: 15, dexCap: 2, stealth: true, weight: 40, cost: '750 GP' },
  { id: 'ring-mail', name: 'Ring Mail', category: 'heavy', baseAC: 14, dexCap: 0, stealth: true, weight: 40, cost: '30 GP' },
  { id: 'chain-mail', name: 'Chain Mail', category: 'heavy', baseAC: 16, dexCap: 0, strength: 13, stealth: true, weight: 55, cost: '75 GP' },
  { id: 'splint-armor', name: 'Splint Armor', category: 'heavy', baseAC: 17, dexCap: 0, strength: 15, stealth: true, weight: 60, cost: '200 GP' },
  { id: 'plate-armor', name: 'Plate Armor', category: 'heavy', baseAC: 18, dexCap: 0, strength: 15, stealth: true, weight: 65, cost: '1,500 GP' },
  { id: 'shield', name: 'Shield', category: 'shield', baseAC: 2, dexCap: 0, stealth: false, weight: 6, cost: '10 GP' }
]

function acText(r: Row): string {
  if (r.category === 'shield') return `+${r.baseAC}`
  if (r.dexCap === null) return `${r.baseAC} + Dex modifier`
  if (r.dexCap > 0) return `${r.baseAC} + Dex modifier (max ${r.dexCap})`
  return `${r.baseAC}`
}

const RULES: Record<ArmorCategory, string> = {
  light: '',
  medium: '',
  heavy: '',
  shield: '\n\nYou gain the Armor Class benefit of a Shield only if you have training with it.'
}

export const armor: ArmorDef[] = rows.map((r) => {
  const ac = acText(r)
  const strText = r.strength ? `Str ${r.strength}` : '—'
  const stealthText = r.stealth ? 'Disadvantage' : '—'
  const extra: string[] = []
  if (r.strength)
    extra.push(
      `This armor reduces the wearer’s speed by 10 feet unless the wearer has a Strength score of ${r.strength} or higher.`
    )
  if (r.stealth) extra.push('The wearer has Disadvantage on Dexterity (Stealth) checks.')
  return {
    id: r.id,
    name: r.name,
    kind: 'armor',
    source: 'SRD 5.2',
    tags: [r.category],
    summary: `${CATEGORY_LABEL[r.category]}: AC ${ac}${r.strength ? `, requires Str ${r.strength}` : ''}${r.stealth ? ', Stealth Disadvantage' : ''}.`,
    description: `*${CATEGORY_LABEL[r.category]} (${DON_DOFF[r.category]})*

| Armor Class (AC) | Strength | Stealth | Weight | Cost |
|---|---|---|---|---|
| ${ac} | ${strText} | ${stealthText} | ${r.weight} lb. | ${r.cost} |${extra.length ? `\n\n${extra.join(' ')}` : ''}${RULES[r.category]}`,
    category: r.category,
    baseAC: r.baseAC,
    dexCap: r.dexCap,
    ...(r.strength ? { strength: r.strength } : {}),
    stealthDisadvantage: r.stealth,
    weight: r.weight,
    cost: r.cost,
    donDoff: DON_DOFF[r.category]
  }
})
