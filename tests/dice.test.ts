import { afterEach, describe, expect, it } from 'vitest'
import { isValidNotation, roll, rollAbilityScore, setRng } from '../src/renderer/src/dice'

/** Deterministisk rng som gir en fast sekvens av terningverdier for d6/d20 */
function seq(values: number[], sides: number): void {
  let i = 0
  setRng(() => (values[i++ % values.length] - 0.5) / sides)
}

afterEach(() => setRng(Math.random))

describe('dice', () => {
  it('parser 2d6+3', () => {
    seq([4, 5], 6)
    const r = roll('2d6+3')
    expect(r.total).toBe(12)
    expect(r.terms[0].dice.map((d) => d.value)).toEqual([4, 5])
  })
  it('advantage beholder høyeste', () => {
    seq([5, 17], 20)
    const r = roll('1d20+2 adv')
    expect(r.mode).toBe('advantage')
    expect(r.total).toBe(19)
    expect(r.natural).toBe(17)
  })
  it('disadvantage beholder laveste', () => {
    seq([5, 17], 20)
    expect(roll('1d20', { mode: 'disadvantage' }).total).toBe(5)
  })
  it('nat 20 er crit', () => {
    seq([20], 20)
    expect(roll('1d20+5').crit).toBe(true)
  })
  it('4d6kh3', () => {
    seq([1, 6, 4, 3], 6)
    expect(roll('4d6kh3').total).toBe(13)
  })
  it('krit dobler terninger', () => {
    seq([3, 3], 6)
    const r = roll('1d6+2', { critDouble: true })
    expect(r.terms[0].dice.length).toBe(2)
    expect(r.total).toBe(8)
  })
  it('minus-modifier', () => {
    seq([10], 20)
    expect(roll('1d20-1').total).toBe(9)
  })
  it('validering', () => {
    expect(isValidNotation('2d6+3')).toBe(true)
    expect(isValidNotation('d20 adv')).toBe(true)
    expect(isValidNotation('hei')).toBe(false)
  })
  it('ability score 4d6 drop lowest', () => {
    seq([2, 6, 5, 4], 6)
    expect(rollAbilityScore().total).toBe(15)
  })
})
