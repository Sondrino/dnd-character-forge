import { describe, expect, it } from 'vitest'
import { allEntities, baseLookup as L } from '../src/renderer/src/data'
import { PHB14, phb14TotemOptions, phb2014Subclasses } from '../src/renderer/src/data/supplements/phb2014-subclasses'
import { phb2014Backgrounds } from '../src/renderer/src/data/supplements/phb2014-backgrounds'
import { phb2014Feats } from '../src/renderer/src/data/supplements/phb2014-feats'
import { phb2014Rules } from '../src/renderer/src/data/supplements/phb2014-rules'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import type { AnyEntity, Feature } from '../src/renderer/src/types'

const BOOK = "Player's Handbook (2014)"
const newEntities: AnyEntity[] = [...phb2014Subclasses, ...phb2014Backgrounds, ...phb2014Feats, ...phb2014Rules]
const optionItems: Feature[] = phb14TotemOptions.flatMap((g) => g.items)
const subFeatures: { sub: string; f: Feature }[] = phb2014Subclasses.flatMap((s) => s.features.map((f) => ({ sub: s.id, f })))
const allFeatures: Feature[] = [...subFeatures.map((x) => x.f), ...optionItems]

describe("Player's Handbook (2014) content", () => {
  it('loads every entity and option group through the data index', () => {
    expect(PHB14).toBe(BOOK)
    const loaded = new Set(allEntities.map((e) => `${e.kind}:${e.id}`))
    for (const e of newEntities) expect(loaded.has(`${e.kind}:${e.id}`), e.id).toBe(true)
    for (const g of phb14TotemOptions) expect(L.classOptions, g.group).toContain(g)
    expect(phb2014Subclasses).toHaveLength(8)
    expect(phb2014Backgrounds).toHaveLength(4)
    expect(phb2014Feats.map((f) => f.id).sort()).toEqual(['phb14-dungeon-delver', 'phb14-linguist', 'phb14-martial-adept', 'phb14-mobile'])
  })

  it('marks every entity as Supplement with the exact book, phb2014 tag and phb14- id', () => {
    // Other 2014 content (e.g. species) may share the book string, so only check ours are included
    const fromBook = new Set(allEntities.filter((e) => e.sourceBook === BOOK).map((e) => `${e.kind}:${e.id}`))
    for (const e of newEntities) expect(fromBook.has(`${e.kind}:${e.id}`), e.id).toBe(true)
    for (const e of newEntities) {
      expect(e.source, e.id).toBe('Supplement')
      expect(e.sourceBook, e.id).toBe(BOOK)
      expect(e.tags, e.id).toContain('phb2014')
      expect(e.id, e.id).toMatch(/^phb14-[a-z0-9-]+$/)
    }
    for (const g of phb14TotemOptions) {
      expect(g.source).toBe('Supplement')
      for (const it of g.items) expect(it.source, it.id).toBe('Supplement')
    }
  })

  it('has ids that are unique across all kinds', () => {
    const counts = new Map<string, number>()
    for (const e of allEntities) counts.set(e.id, (counts.get(e.id) ?? 0) + 1)
    for (const e of newEntities) expect(counts.get(e.id), e.id).toBe(1)
    const featureIds = allFeatures.map((f) => f.id)
    expect(new Set(featureIds).size).toBe(featureIds.length)
    for (const id of featureIds) expect(id, id).toMatch(/^phb14-/)
    const allOptionIds = L.classOptions.flatMap((g) => g.items.map((it) => it.id))
    for (const it of optionItems) expect(allOptionIds.filter((x) => x === it.id).length, it.id).toBe(1)
  })

  it('references only existing spells, feats, tools, items and classes', () => {
    const bad: string[] = []
    for (const s of phb2014Subclasses) {
      if (!L.get('class', s.classId)) bad.push(`${s.id}: class ${s.classId}`)
      for (const g of s.alwaysPrepared ?? []) for (const id of g.spells) if (!L.get('spell', id)) bad.push(`${s.id}: spell ${id}`)
    }
    for (const b of phb2014Backgrounds) {
      if (L.get('feat', b.originFeat)?.category !== 'origin') bad.push(`${b.id}: feat ${b.originFeat}`)
      if (b.tool.startsWith('choice:')) {
        if (!['choice:artisan', 'choice:gaming', 'choice:musical'].includes(b.tool)) bad.push(`${b.id}: tool ${b.tool}`)
      } else if (!L.get('tool', b.tool)) bad.push(`${b.id}: tool ${b.tool}`)
      for (const opt of b.equipment) for (const it of opt.items) if (it.id && !L.item(it.id)) bad.push(`${b.id}: item ${it.id}`)
      expect(b.abilityScores, b.id).toHaveLength(3)
      expect(new Set(b.abilityScores).size, b.id).toBe(3)
      expect(b.skills, b.id).toHaveLength(2)
      expect(b.equipment.map((e) => e.label), b.id).toEqual(['A', 'B'])
    }
    for (const f of phb2014Feats) {
      expect(f.category, f.id).toBe('general')
      expect(f.minLevel, f.id).toBe(4)
      for (const ch of f.choices ?? []) if (ch.type === 'option' && ch.filter && !L.classOptions.some((g) => g.group === ch.filter)) bad.push(`${f.id}: group ${ch.filter}`)
    }
    for (const { sub, f } of subFeatures)
      for (const ch of f.choices ?? []) if (ch.type === 'option' && ch.filter && !L.classOptions.some((g) => g.group === ch.filter)) bad.push(`${sub}/${f.id}: group ${ch.filter}`)
    expect(bad).toEqual([])
  })

  it('adapts subclasses so no feature or domain spell comes before level 3', () => {
    for (const { sub, f } of subFeatures) expect(f.level ?? 0, `${sub}/${f.id}`).toBeGreaterThanOrEqual(3)
    for (const s of phb2014Subclasses) for (const g of s.alwaysPrepared ?? []) expect(g.level, s.id).toBeGreaterThanOrEqual(3)
    for (const s of phb2014Subclasses.filter((x) => x.classId === 'cleric'))
      expect(s.alwaysPrepared?.map((g) => g.level), s.id).toEqual([3, 5, 7, 9])
  })

  it('keeps all text short', () => {
    for (const e of newEntities) {
      expect(e.summary.length, e.id).toBeGreaterThan(10)
      expect(e.description.length, e.id).toBeLessThan(1500)
    }
    for (const f of allFeatures) {
      expect(f.summary.length, f.id).toBeGreaterThan(10)
      expect(f.description.length, f.id).toBeLessThan(1500)
    }
  })

  it('gives every feature with limited uses an activation', () => {
    for (const f of allFeatures) if (f.uses) expect(f.activation && f.activation !== 'passive', f.id).toBe(true)
  })

  it('Bear Totem Spirit grants resistance to everything but psychic while raging', () => {
    const bear = optionItems.find((i) => i.id === 'phb14-totem-spirit-bear')!
    const types = (bear.effects ?? []).map((e) => e.value)
    expect(types).not.toContain('psychic')
    expect(types).toHaveLength(9)
    for (const e of bear.effects ?? []) expect(e.condition).toBe('raging')
    const key = 'subclass:phb14-path-of-the-totem-warrior:phb14-totem-spirit:phb14-totem-spirit-choice#option'
    const c = newCharacter({ classes: [{ classId: 'barbarian', level: 3, hpRolls: [], subclassId: 'phb14-path-of-the-totem-warrior' }] })
    c.choices = { ...c.choices, [key]: ['phb14-totem-spirit-bear'] }
    expect(computeCharacter(c, L).resistances).not.toContain('fire')
    c.activeStates = ['raging']
    const d = computeCharacter(c, L)
    expect(d.resistances).toEqual(expect.arrayContaining(['fire', 'necrotic', 'slashing']))
    expect(d.resistances).not.toContain('psychic')
  })

  it('Tempest Wrath of the Storm is a Wisdom-based Dex save reaction', () => {
    const w = phb2014Subclasses.find((s) => s.id === 'phb14-tempest-domain')!.features.find((f) => f.id === 'phb14-tempest-wrath')!
    expect(w.activation).toBe('reaction')
    expect(w.uses).toEqual({ count: 'mod.wis', recharge: 'long' })
    expect(w.roll).toEqual({ kind: 'save', save: 'dex', dc: '8+prof+mod.wis', dice: '2d8', damageType: 'lightning' })
  })
})
