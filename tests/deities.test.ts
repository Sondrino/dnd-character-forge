import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import { computeCharacter } from '../src/renderer/src/engine/compute'
import { computeTips } from '../src/renderer/src/engine/tips'
import { newCharacter } from '../src/renderer/src/store/characters'

describe('guder og patrons (Forgotten Realms)', () => {
  const deities = L.all('deity')

  it('lastes, med unike ids og riktig kilde', () => {
    expect(deities.length).toBeGreaterThan(60)
    expect(new Set(deities.map((d) => d.id)).size).toBe(deities.length)
    for (const d of deities) expect(d.source, d.id).toBe('Forgotten Realms')
  })

  it('alle anbefalte subclasses finnes', () => {
    for (const d of deities) for (const s of d.suggested) expect(L.get('subclass', s), `${d.id} → ${s}`).toBeTruthy()
  })

  it('hvert 2024-domain, hver oath og hver patron-type har minst 3 forslag', () => {
    const subs = [
      'knowledge-domain', 'life-domain', 'light-domain', 'trickery-domain', 'war-domain',
      'oath-of-devotion', 'oath-of-glory', 'oath-of-the-ancients', 'oath-of-vengeance',
      'fiend-patron', 'archfey-patron', 'great-old-one-patron', 'celestial-patron'
    ]
    for (const s of subs) expect(deities.filter((d) => d.suggested.includes(s)).length, s).toBeGreaterThanOrEqual(3)
  })

  it('tips foreslår gud for cleric uten gud, men ikke når gud er valgt', () => {
    const c = newCharacter({ classes: [{ classId: 'cleric', level: 3, hpRolls: [], subclassId: 'life-domain' }] })
    let tips = computeTips(c, computeCharacter(c, L), L)
    const faith = tips.find((t) => t.id === 'faith')
    expect(faith?.links?.length).toBeGreaterThan(0)
    for (const l of faith!.links!) expect(L.get('deity', l.id)?.suggested, l.id).toContain('life-domain')
    c.deityId = 'lathander'
    tips = computeTips(c, computeCharacter(c, L), L)
    expect(tips.some((t) => t.id === 'faith')).toBe(false)
  })

  it('ingen gud-tips for classes uten tro (fighter)', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }] })
    expect(computeTips(c, computeCharacter(c, L), L).some((t) => t.id === 'faith')).toBe(false)
  })
})
