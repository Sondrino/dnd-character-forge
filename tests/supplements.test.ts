import { describe, expect, it } from 'vitest'
import { allEntities } from '../src/renderer/src/data'
import { supplementSpells } from '../src/renderer/src/data/supplements/spells'
import { supplementMagicItems } from '../src/renderer/src/data/supplements/magicItems'
import type { MagicItemDef, School } from '../src/renderer/src/types'

const SCHOOLS: School[] = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
const RARITIES: MagicItemDef['rarity'][] = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies']
const CLASS_IDS = new Set(allEntities.filter((e) => e.kind === 'class').map((e) => e.id))
const ITEM_KINDS = new Set(['weapon', 'armor', 'gear', 'tool', 'magicItem'])

/** Normaliserer navn: små bokstaver, rette apostrofer, uten "+1"-varianter */
const norm = (n: string): string =>
  n
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/,?\s*\+\d\b/g, '')
    .replace(/^\+\d\s+/, '')
    .trim()

const all = [...supplementSpells, ...supplementMagicItems]

describe('supplement content', () => {
  it('is picked up by the data index', () => {
    const loaded = new Set(allEntities.map((e) => `${e.kind}:${e.id}`))
    for (const e of all) expect(loaded.has(`${e.kind}:${e.id}`), e.id).toBe(true)
  })

  it('has unique ids with the sup- prefix', () => {
    const ids = all.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^sup-[a-z0-9-]+$/)
  })

  it('does not reuse ids of existing entities', () => {
    const existing = new Set(allEntities.filter((e) => e.source !== 'Supplement').map((e) => `${ITEM_KINDS.has(e.kind) ? 'item' : e.kind}:${e.id}`))
    const key = (e: { kind: string; id: string }): string => `${ITEM_KINDS.has(e.kind) ? 'item' : e.kind}:${e.id}`
    for (const e of all) expect(existing.has(key(e)), e.id).toBe(false)
  })

  it('has no ids that collide with anything else', () => {
    const existing = new Set(allEntities.filter((e) => e.source !== 'Supplement').map((e) => e.id))
    for (const e of all) expect(existing.has(e.id), e.id).toBe(false)
  })

  it('marks every entry as Supplement with a sourceBook and no license', () => {
    for (const e of all) {
      expect(e.source, e.id).toBe('Supplement')
      expect(e.sourceBook, e.id).toBeTruthy()
      expect(e.license, e.id).toBeUndefined()
      expect(e.tags, e.id).toContain('supplement')
    }
  })

  it('keeps summaries and descriptions short (own-words summaries only)', () => {
    for (const e of all) {
      expect(e.summary.length, e.id).toBeGreaterThan(0)
      expect(e.description.length, e.id).toBeLessThanOrEqual(400)
    }
  })

  it('has valid spell levels, schools and classes', () => {
    for (const s of supplementSpells) {
      expect(Number.isInteger(s.level) && s.level >= 0 && s.level <= 9, s.id).toBe(true)
      expect(SCHOOLS, s.id).toContain(s.school)
      expect(s.classes.length, s.id).toBeGreaterThan(0)
      for (const c of s.classes) expect(CLASS_IDS.has(c), `${s.id}: ${c}`).toBe(true)
      expect(s.concentration, s.id).toBe(s.duration.startsWith('Concentration'))
    }
  })

  it('has valid magic item rarities', () => {
    for (const m of supplementMagicItems) expect(RARITIES, m.id).toContain(m.rarity)
  })

  it('does not duplicate names of SRD / PHB / DMG entries', () => {
    const base = allEntities.filter((e) => e.source === 'SRD 5.2' || e.source === 'PHB 2024')
    const spellNames = new Set(base.filter((e) => e.kind === 'spell').map((e) => norm(e.name)))
    const itemNames = new Set(base.filter((e) => ITEM_KINDS.has(e.kind)).map((e) => norm(e.name)))
    for (const s of supplementSpells) expect(spellNames.has(norm(s.name)), s.name).toBe(false)
    for (const m of supplementMagicItems) expect(itemNames.has(norm(m.name)), m.name).toBe(false)
  })

  it('has no duplicate names within the supplement data', () => {
    const spellNames = supplementSpells.map((s) => norm(s.name))
    const itemNames = supplementMagicItems.map((m) => norm(m.name))
    expect(new Set(spellNames).size).toBe(spellNames.length)
    expect(new Set(itemNames).size).toBe(itemNames.length)
  })
})
