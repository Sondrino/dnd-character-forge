import { describe, expect, it } from 'vitest'
import { baseLookup as L } from '../src/renderer/src/data'
import { computeCharacter, type PendingChoice } from '../src/renderer/src/engine/compute'
import { newCharacter } from '../src/renderer/src/store/characters'
import { levelDown } from '../src/renderer/src/lib/levels'
import type { Character, FeatDef, SpellDef, ToolDef } from '../src/renderer/src/types'
import { spellFilter } from '../src/renderer/src/lib/spellFilter'

/** Typer som ChoiceResolver har brukergrensesnitt for */
const HANDLED = new Set(['skill', 'expertise', 'tool', 'language', 'option', 'ability', 'cantrip', 'spell', 'subclass', 'speciesOption', 'feat', 'weaponMastery'])

/** Kan valget faktisk løses med de dataene som finnes? */
function problems(p: PendingChoice, c: Character): string[] {
  const out: string[] = []
  if (!HANDLED.has(p.type)) out.push(`ukjent type ${p.type}`)
  if (p.type === 'option') {
    const group = L.classOptions.find((g) => g.group === p.filter)
    const n = group ? group.items.length : p.options?.length ?? 0
    if (n < p.count) out.push(`for få alternativer (${n} < ${p.count})`)
  }
  if (p.type === 'tool') {
    const f = p.filter ?? ''
    const tools = L.all('tool').filter((t: ToolDef) => !f || f.split(/[-,]|or/).some((x) => x && t.category === x.trim()) || (p.options ?? []).includes(t.id))
    if (tools.length < p.count) out.push(`ingen verktøy for filter ${f}`)
  }
  if (p.type === 'feat' && p.key !== 'background:feat') {
    const feats = L.all('feat').filter((f: FeatDef) => (p.filter === 'general' ? f.category === 'general' : p.filter === 'epicBoon' ? ['epicBoon', 'general'].includes(f.category) : !p.filter || f.category === p.filter))
    if (!feats.length) out.push(`ingen feats for filter ${p.filter}`)
  }
  if (p.type === 'subclass' && !L.all('subclass').some((s) => s.classId === p.filter)) out.push('ingen subclass')
  if ((p.type === 'spell' || p.type === 'cantrip') && p.key.startsWith('featchoice:')) {
    const uid = p.key.split(':')[1]
    const cf = c.feats.find((f) => f.uid === uid)
    const list = cf?.choices?.list?.[0] ?? 'wizard'
    const n = L.all('spell').filter((s: SpellDef) => spellFilter(p.filter, { cantrip: p.type === 'cantrip' ? true : undefined, list })(s)).length
    if (n < p.count) out.push(`for få spells (${n}) for ${p.filter}`)
  }
  return out
}

function check(c: Character, label: string): void {
  const d = computeCharacter(c, L)
  for (const p of d.choices) {
    const pr = problems(p, c)
    expect(pr, `${label}: «${p.label}» (${p.key})`).toEqual([])
  }
}

describe('alle valg kan løses', () => {
  it('alle classes på alle nivåer, med og uten subclass', () => {
    for (const cls of L.all('class')) {
      for (let lvl = 1; lvl <= 20; lvl++) {
        check(newCharacter({ classes: [{ classId: cls.id, level: lvl, hpRolls: [] }] }), `${cls.id} ${lvl}`)
        for (const sub of L.all('subclass').filter((s) => s.classId === cls.id)) {
          if (lvl < cls.subclassLevel) continue
          check(newCharacter({ classes: [{ classId: cls.id, level: lvl, hpRolls: [], subclassId: sub.id }] }), `${sub.id} ${lvl}`)
        }
      }
    }
  })
  it('alle species og lineages', () => {
    for (const sp of L.all('species')) {
      check(newCharacter({ speciesId: sp.id }), sp.id)
      for (const o of sp.options?.choices ?? []) check(newCharacter({ speciesId: sp.id, speciesOptionId: o.id }), `${sp.id}/${o.id}`)
    }
  })
  it('alle backgrounds med origin feat', () => {
    for (const bg of L.all('background')) {
      const list = bg.tags?.find((x) => x.startsWith('magic-initiate:'))?.split(':')[1]
      check(newCharacter({ backgroundId: bg.id, feats: [{ uid: 'b', featId: bg.originFeat, source: 'background', choices: list ? { list: [list] } : undefined }] }), bg.id)
    }
  })
  it('alle feats', () => {
    for (const f of L.all('feat')) check(newCharacter({ classes: [{ classId: 'fighter', level: 20, hpRolls: [] }], feats: [{ uid: 'f', featId: f.id, source: 'manual' }] }), f.id)
  })
})

describe('Weapon Mastery', () => {
  it('Rogue: mastery telles og løses via felles liste', () => {
    const c = newCharacter({ classes: [{ classId: 'rogue', level: 1, hpRolls: [] }] })
    let d = computeCharacter(c, L)
    expect(d.weaponMasteryMax).toBe(2)
    const wm = d.choices.filter((p) => p.type === 'weaponMastery')
    expect(wm.length).toBe(1)
    c.weaponMasteries = ['dagger', 'shortsword']
    d = computeCharacter(c, L)
    expect(d.pending.some((p) => p.type === 'weaponMastery')).toBe(false)
  })
  it('Weapon Master-feat øker antall', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 4, hpRolls: [] }] })
    const before = computeCharacter(c, L).weaponMasteryMax
    c.feats.push({ uid: 'w', featId: 'weapon-master', source: 'manual', abilityChoice: 'str' })
    expect(computeCharacter(c, L).weaponMasteryMax).toBe(before + 1)
  })
})

describe('egne justeringer', () => {
  it('+2 STR påvirker alt som avhenger av STR', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], baseAbilities: { str: 15, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
    const before = computeCharacter(c, L)
    c.adjustments = { 'ability.str': 2 }
    const d = computeCharacter(c, L)
    expect(d.abilities.str.score.value).toBe(17)
    expect(d.abilities.str.mod).toBe(3)
    expect(d.skills.athletics.value).toBe(before.skills.athletics.value + 1)
    expect(d.abilities.str.score.overridden).toBe(false)
  })
  it('justering legges oppå, og oppdateres når grunnlaget endres', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }] })
    c.adjustments = { ac: 1, 'hp.max': 5, speed: 10, 'skill.stealth': 2 }
    let d = computeCharacter(c, L)
    expect(d.ac.value).toBe(11)
    expect(d.hpMax.value).toBe(15)
    expect(d.speed.value).toBe(40)
    c.baseAbilities.dex = 14
    d = computeCharacter(c, L)
    expect(d.ac.value).toBe(13)
    expect(d.skills.stealth.value).toBe(4)
  })
  it('ekstra spell slots selv uten spellcasting', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }], adjustments: { 'slots.1': 2 } })
    expect(computeCharacter(c, L).slots).toEqual([{ level: 1, max: 2, used: 0 }])
  })
})

describe('level down', () => {
  it('fjerner level, feats og subclass', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 4, hpRolls: [null, 8, 5, null], subclassId: 'champion' }], hp: { current: 40, temp: 0 } })
    c.feats.push({ uid: 'asi', featId: 'ability-score-improvement', source: 'class:fighter:4', choices: { abilities: ['str', 'str'] } })
    levelDown(c, 'fighter', L)
    expect(c.classes[0].level).toBe(3)
    expect(c.feats.some((f) => f.uid === 'asi')).toBe(false)
    expect(c.classes[0].subclassId).toBe('champion')
    levelDown(c, 'fighter', L)
    expect(c.classes[0].level).toBe(2)
    expect(c.classes[0].subclassId).toBeUndefined()
    expect(c.classes[0].hpRolls).toEqual([null, 8])
  })
  it('fjerner multiclass helt på level 0, men ikke under level 1 totalt', () => {
    const c = newCharacter({ classes: [{ classId: 'fighter', level: 1, hpRolls: [] }, { classId: 'wizard', level: 1, hpRolls: [] }], spells: [{ spellId: 'fire-bolt', source: 'wizard', prepared: true }] })
    levelDown(c, 'wizard', L)
    expect(c.classes.map((x) => x.classId)).toEqual(['fighter'])
    expect(c.spells.length).toBe(0)
    levelDown(c, 'fighter', L)
    expect(c.classes[0].level).toBe(1)
  })
})

describe('option-valg peker på gyldige alternativer', () => {
  it('options i en class-option-gruppe er id-er i gruppen; uten gruppe må options finnes', () => {
    const bad: string[] = []
    const feats = [
      ...L.all('class').flatMap((c) => c.features.map((f) => ({ src: c.id, f }))),
      ...L.all('subclass').flatMap((s) => s.features.map((f) => ({ src: s.id, f }))),
      ...L.all('species').flatMap((s) => s.traits.map((f) => ({ src: s.id, f })))
    ]
    for (const { src, f } of feats)
      for (const ch of f.choices ?? []) {
        if (ch.type !== 'option') continue
        const group = L.classOptions.find((g) => g.group === ch.filter)
        if (ch.filter && !group) bad.push(`${src}/${f.id}: ukjent gruppe ${ch.filter}`)
        if (group) for (const o of ch.options ?? []) if (!group.items.some((it) => it.id === o)) bad.push(`${src}/${f.id}: ${o} finnes ikke i ${group.group}`)
        if (!group && !(ch.options?.length && ch.options.length >= ch.count)) bad.push(`${src}/${f.id}: mangler options`)
      }
    expect(bad).toEqual([])
  })
  it('tool-valg i class-data har gyldig filter', () => {
    const cats = new Set(L.all('tool').map((t) => t.category))
    const bad: string[] = []
    for (const c of L.all('class'))
      for (const t of c.toolProficiencies ?? []) {
        if (!t.startsWith('choice:')) continue
        const f = t.split(':')[1]
        if (!f.split(/-or-|,/).every((x) => cats.has(x as never))) bad.push(`${c.id}: ${t}`)
      }
    for (const b of L.all('background')) if (b.tool?.startsWith('choice:') && !cats.has(b.tool.slice(7) as never)) bad.push(`${b.id}: ${b.tool}`)
    expect(bad).toEqual([])
  })
})
