import { describe, expect, it } from 'vitest'
import { pipClick } from '../src/renderer/src/lib/pips'

describe('pipClick (fylte prikker = igjen)', () => {
  it('klikk på siste fylte prikk bruker én', () => {
    // 4 slots, 1 brukt → prikk 0–2 fylt
    expect(pipClick(2, 4, 1)).toBe(2)
  })
  it('klikk på første tomme prikk gir tilbake én', () => {
    expect(pipClick(3, 4, 1)).toBe(0)
    expect(pipClick(2, 4, 2)).toBe(1)
  })
  it('klikk på første fylte prikk bruker alle', () => {
    expect(pipClick(0, 4, 0)).toBe(4)
  })
  it('klikk på siste tomme prikk gir tilbake alle', () => {
    expect(pipClick(3, 4, 4)).toBe(0)
  })
})
