import type { Character } from '../types'

export type Currency = Character['currency']
export type Coin = keyof Currency

export const COINS: Coin[] = ['cp', 'sp', 'ep', 'gp', 'pp']
/** Verdi i kobber (cp) per mynt */
export const RATE: Record<Coin, number> = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 }

export const emptyCurrency = (): Currency => ({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 })

/** Total verdi i cp */
export function toCp(cur: Partial<Currency>): number {
  return COINS.reduce((s, c) => s + (Number(cur[c]) || 0) * RATE[c], 0)
}

/**
 * cp → mynter. Bruker GP/SP/CP (ikke PP/EP, som spillere sjelden vil ha i vekslepenger),
 * med mindre `coins` sier noe annet.
 */
export function fromCp(cp: number, coins: Coin[] = ['gp', 'sp', 'cp']): Currency {
  const out = emptyCurrency()
  let rest = Math.max(0, Math.round(cp))
  for (const c of [...coins].sort((a, b) => RATE[b] - RATE[a])) {
    out[c] = Math.floor(rest / RATE[c])
    rest -= out[c] * RATE[c]
  }
  // Rest som ikke gikk opp (om cp ikke var med) havner i den minste mynten
  if (rest > 0) out.cp += rest
  return out
}

/** Legg til et beløp (i cp) som GP/SP/CP */
export function add(cur: Currency, cp: number): Currency {
  const plus = fromCp(cp)
  const out = { ...cur }
  for (const c of COINS) out[c] = (out[c] || 0) + plus[c]
  return out
}

/**
 * Betal et beløp (i cp). Betaler med de største myntene som går opp, ned til kobber. Går det ikke opp,
 * vekslet den minste mynten som dekker resten, og du får vekslepenger i mynter under den.
 * Returnerer null hvis du ikke har nok.
 */
export function spend(cur: Currency, cp: number): Currency | null {
  const cost = Math.max(0, Math.round(cp))
  if (toCp(cur) < cost) return null
  const out: Currency = { ...emptyCurrency(), ...cur }
  let rest = cost
  for (const c of [...COINS].reverse()) {
    const k = Math.min(out[c] || 0, Math.floor(rest / RATE[c]))
    out[c] -= k
    rest -= k * RATE[c]
  }
  if (rest > 0) {
    // Alle mynter som er igjen er større enn resten – vekslet den minste av dem
    const coin = COINS.find((c) => (out[c] || 0) > 0 && RATE[c] > rest)!
    out[coin] -= 1
    const change = fromCp(RATE[coin] - rest, (['gp', 'sp', 'cp'] as Coin[]).filter((c) => RATE[c] < RATE[coin]))
    for (const c of COINS) out[c] += change[c]
  }
  return out
}

/** «15 GP», «5 sp», «1,000 gp», «2.5 gp» → cp (samme format som costGp i lib/sorting). Tall uten mynt regnes som GP. null hvis ugyldig. */
export function parseCoins(text: unknown): number | null {
  const s = String(text ?? '').trim()
  if (!s) return null
  const m = s.replace(/,/g, '').match(/^([\d.]+)\s*(cp|sp|ep|gp|pp)?$/i)
  if (!m) {
    // Som costGp i lib/sorting: første «<tall> <mynt>» i teksten («50 GP each»)
    const f = s.replace(/,/g, '').match(/([\d.]+)\s*(cp|sp|ep|gp|pp)(?![a-z])/i)
    return f && Number.isFinite(Number(f[1])) ? Math.round(Number(f[1]) * RATE[f[2].toLowerCase() as Coin]) : null
  }
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  return Math.round(n * RATE[((m[2] ?? 'gp').toLowerCase()) as Coin])
}

/** Kort visning av et beløp i cp: «12 GP 5 SP» */
export function formatCp(cp: number): string {
  if (cp <= 0) return '0 GP'
  const c = fromCp(cp)
  return (['gp', 'sp', 'cp'] as Coin[])
    .filter((k) => c[k])
    .map((k) => `${c[k]} ${k.toUpperCase()}`)
    .join(' ')
}

export type CurrencyInputResult = { ok: true; currency: Currency } | { ok: false; error: 'invalid' | 'insufficient' }

/**
 * Tekst skrevet i myntfeltet `field`:
 *  «35» setter verdien, «+35»/«-4» endrer feltet, «+2 gp»/«-5 sp» endrer den mynten.
 * Trekk som er større enn det du har av mynten, betales med de andre myntene (med veksling).
 */
export function applyCurrencyInput(cur: Currency, field: Coin, text: string): CurrencyInputResult {
  const s = text.replace(/\s+/g, ' ').replace(/−/g, '-').trim()
  if (!s) return { ok: false, error: 'invalid' }
  const m = s.match(/^([+-])?\s*(\d+(?:[.,]\d+)?)\s*(cp|sp|ep|gp|pp)?$/i)
  if (!m) return { ok: false, error: 'invalid' }
  const sign = m[1]
  const coin = ((m[3]?.toLowerCase() as Coin | undefined) ?? field)
  const n = Number(m[2].replace(',', '.'))
  if (!Number.isFinite(n)) return { ok: false, error: 'invalid' }
  if (!sign) {
    // Absolutt verdi: bare hele mynter
    if (m[3] && coin !== field) return { ok: false, error: 'invalid' }
    return { ok: true, currency: { ...cur, [field]: Math.max(0, Math.floor(n)) } }
  }
  const amount = Math.round(n * RATE[coin])
  if (sign === '+') {
    // Hele mynter legges i mynten; brøkdeler («+2.5 gp») blir vekslepenger
    const whole = Math.floor(n)
    const out = { ...cur, [coin]: (cur[coin] || 0) + whole }
    const frac = amount - whole * RATE[coin]
    return { ok: true, currency: frac > 0 ? add(out, frac) : out }
  }
  // Trekk: ta først fra den mynten, resten med veksling
  const take = Math.min(cur[coin] || 0, Math.floor(amount / RATE[coin]))
  const after = { ...cur, [coin]: (cur[coin] || 0) - take }
  const rest = amount - take * RATE[coin]
  if (rest <= 0) return { ok: true, currency: after }
  const paid = spend(after, rest)
  return paid ? { ok: true, currency: paid } : { ok: false, error: 'insufficient' }
}

/** Del et funn på N: hver andel per mynt (rundet ned) + det som blir til overs */
export function splitCurrency(found: Currency, n: number): { share: Currency; remainder: Currency } {
  const k = Math.max(1, Math.floor(n))
  const share = emptyCurrency()
  const remainder = emptyCurrency()
  for (const c of COINS) {
    share[c] = Math.floor((found[c] || 0) / k)
    remainder[c] = (found[c] || 0) - share[c] * k
  }
  return { share, remainder }
}

/** Legg sammen to myntbeholdninger mynt for mynt */
export function addCurrency(a: Currency, b: Partial<Currency>): Currency {
  const out = { ...a }
  for (const c of COINS) out[c] = (out[c] || 0) + (Number(b[c]) || 0)
  return out
}
