/**
 * Klikk på en rad med prikker der de fylte (fra venstre) er det som er igjen.
 * Klikk på en fylt prikk bruker den (og de til høyre for den); klikk på en tom gir tilbake opp til og med den.
 * Returnerer nytt antall brukt.
 */
export function pipClick(i: number, max: number, used: number): number {
  const left = max - used
  return max - (i < left ? i : i + 1)
}
