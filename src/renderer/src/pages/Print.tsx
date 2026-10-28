import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { MagicItemDef, SpellDef } from '../types'
import { ABILITIES } from '../types'
import { useCharacters } from '../store/characters'
import { useLookup } from '../store/ui'
import { useSettings } from '../store/settings'
import { computeCharacter } from '../engine/compute'
import { abilityNames, skills } from '../data/skills'
import { signed } from '../engine/tables'
import { Markdown } from '../components/ui'
import { ATTRIBUTION, DISCLAIMER_PHB } from '../data'
import { api } from '../lib/api'

/*
 * Sideoppsett: marger og bunntekst (navn + sidetall) settes av printToPDF i main-prosessen.
 * Innholdsområdet er da ca. 192 × 276 mm. Character sheet-siden skaleres automatisk slik at
 * den alltid får plass på én side; øvrige deler flyter over flere sider uten å klippe elementer.
 */
const SHEET_HEIGHT_MM = 272
const PRINT_CSS = `
@page { size: A4; }
html, body { background: #fff !important; overflow: visible !important; height: auto !important; margin: 0; }
#root { height: auto !important; }
.pp { width: 192mm; box-sizing: border-box; break-before: page; background: #fffdf8; color: #1f160d; font-family: 'Inter Variable', sans-serif; font-size: 8.2pt; }
.pp:first-child { break-before: auto; }
.pp h2 { font-family: Cinzel, serif; color: #7a1d17; font-size: 15pt; margin: 0 0 3mm; border-bottom: 1.5px solid #7a1d17; padding-bottom: 1mm; break-after: avoid; }
.pp h3 { font-family: Cinzel, serif; color: #7a1d17; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 1.5mm; break-after: avoid; }
.box { border: 1.2px solid #3b2a1a; border-radius: 3mm; padding: 2mm 2.5mm; break-inside: avoid; }
.lab { font-size: 6.4pt; letter-spacing: .1em; text-transform: uppercase; color: #6b5640; font-weight: 600; }
.big { font-family: Cinzel, serif; font-weight: 700; font-size: 16pt; line-height: 1.1; }
.dot { display:inline-block; width: 2.3mm; height: 2.3mm; border-radius: 50%; border: 1px solid #3b2a1a; vertical-align: -0.3mm; margin-right: 1mm; }
.dot.on { background: #3b2a1a; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl thead { display: table-header-group; }
.tbl tr { break-inside: avoid; }
.tbl th { text-align: left; font-size: 6.4pt; text-transform: uppercase; letter-spacing: .08em; color: #6b5640; border-bottom: 1px solid #3b2a1a; padding: .6mm 1mm; }
.tbl td { border-bottom: .5px solid #cbb994; padding: .7mm 1mm; vertical-align: top; }
.pp .prose-dnd { font-size: 8.4pt; line-height: 1.38; color: #1f160d; }
.pp .prose-dnd strong { color: #7a1d17; }
.pp .prose-dnd h1, .pp .prose-dnd h2, .pp .prose-dnd h3, .pp .prose-dnd h4 { color:#7a1d17; font-size: 9pt; border: 0; }
.pp .prose-dnd table { font-size: 7pt; }
.pp .prose-dnd tr { break-inside: avoid; }
.pp .prose-dnd th { color: #7a1d17; }
.entry { break-inside: avoid; margin-bottom: 2.5mm; }
.cols2 { column-count: 2; column-gap: 6mm; }
.sheet-page { height: ${SHEET_HEIGHT_MM}mm; overflow: hidden; }
.sheet-fit { width: 100%; }
`

export default function PrintPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const parts = (params.get('parts') ?? 'sheet,spells,features,inventory,spellcards,details,legal').split(',')
  const char = useCharacters((s) => (id ? s.characters[id] : undefined))
  const loaded = useCharacters((s) => s.loaded)
  const settingsLoaded = useSettings((s) => s.loaded)
  const L0 = useLookup()
  const L = useMemo(() => (char ? L0.extend(char.customEntities ?? []) : L0), [L0, char])
  const d = useMemo(() => (char ? computeCharacter(char, L0) : undefined), [char, L0])

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
  }, [settingsLoaded])
  const sheetRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!loaded) return
    const done = (): void => {
      setTimeout(() => {
        fitSheet(sheetRef.current)
        setTimeout(() => api.printReady(), 150)
      }, 250)
    }
    if (document.fonts?.ready) document.fonts.ready.then(done)
    else done()
  }, [loaded, !!char])

  if (!char || !d) return <div style={{ padding: 40 }}>Loading…</div>
  const species = L.get('species', char.speciesId)
  const bg = L.get('background', char.backgroundId)
  const spells = char.spells
    .map((s) => ({ s, def: L.get('spell', s.spellId) as SpellDef | undefined }))
    .filter((x) => x.def)
    .sort((a, b) => a.def!.level - b.def!.level || a.def!.name.localeCompare(b.def!.name))
  const name = char.name || 'Unnamed'

  return (
    <div>
      <style>{PRINT_CSS}</style>

      {parts.includes('sheet') && (
        <div className="pp sheet-page">
          <div className="sheet-fit" ref={sheetRef}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 0.6fr', gap: '2mm', marginBottom: '2.5mm' }}>
            <div className="box">
              <div className="lab">Character Name</div>
              <div className="big" style={{ fontSize: '17pt' }}>{name}</div>
            </div>
            <div className="box">
              <div className="lab">Background</div>
              <div style={{ fontWeight: 600 }}>{bg?.name ?? '—'}</div>
              <div className="lab" style={{ marginTop: '1mm' }}>Species</div>
              <div style={{ fontWeight: 600 }}>{species?.name ?? '—'}{char.speciesOptionId ? ` (${species?.options?.choices.find((o) => o.id === char.speciesOptionId)?.name})` : ''}</div>
            </div>
            <div className="box">
              <div className="lab">Class</div>
              <div style={{ fontWeight: 600 }}>{char.classes.map((c) => `${L.get('class', c.classId)?.name ?? c.classId} ${c.level}`).join(' / ') || '—'}</div>
              <div className="lab" style={{ marginTop: '1mm' }}>Subclass</div>
              <div style={{ fontWeight: 600 }}>{char.classes.map((c) => L.get('subclass', c.subclassId)?.name).filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="box">
              <div className="lab">Alignment</div>
              <div style={{ fontWeight: 600 }}>{char.alignment || '—'}</div>
              <div className="lab" style={{ marginTop: '1mm' }}>Player</div>
              <div style={{ fontWeight: 600 }}>{char.playerName || '—'}</div>
            </div>
            <div className="box" style={{ textAlign: 'center' }}>
              <div className="lab">Level</div>
              <div className="big">{d.totalLevel}</div>
              <div className="lab">XP {char.xp}</div>
            </div>
          </div>

          {/* Kampverdier */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.6fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr', gap: '2mm', marginBottom: '2.5mm' }}>
            <Stat label="Armor Class" value={d.ac.value} sub={d.armorWorn?.name ?? 'Unarmored'} />
            <div className="box">
              <div className="lab">Hit Points</div>
              <div style={{ display: 'flex', gap: '3mm', alignItems: 'baseline' }}>
                <span className="big">{char.hp.current}</span>
                <span>/ {d.hpMax.value} max</span>
                <span style={{ marginLeft: 'auto' }}>Temp: {char.hp.temp || '__'}</span>
              </div>
            </div>
            <div className="box">
              <div className="lab">Hit Dice</div>
              {d.hitDice.map((h) => (
                <div key={h.die}>
                  <b>{h.total - h.used}</b>/{h.total} d{h.die}
                </div>
              ))}
            </div>
            <div className="box">
              <div className="lab">Death Saves</div>
              <div>Successes {[1, 2, 3].map((n) => <span key={n} className={`dot ${char.deathSaves.successes >= n ? 'on' : ''}`} />)}</div>
              <div>Failures {[1, 2, 3].map((n) => <span key={n} className={`dot ${char.deathSaves.failures >= n ? 'on' : ''}`} />)}</div>
            </div>
            <Stat label="Prof. Bonus" value={signed(d.pb.value)} />
            <Stat label="Initiative" value={signed(d.initiative.value)} />
            <Stat label="Speed" value={d.speed.value} sub="ft." />
            <Stat label="Size" value={d.size.slice(0, 1)} sub={d.size} />
            <Stat label="Passive Perc." value={d.passive.perception.value} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '70mm 1fr', gap: '2.5mm' }}>
            {/* Abilities */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', alignContent: 'start' }}>
              {ABILITIES.map((a) => (
                <div key={a} className="box" style={{ padding: '1.5mm 2mm' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="lab" style={{ color: '#7a1d17' }}>{abilityNames[a]}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
                    <span className="big">{signed(d.abilities[a].mod)}</span>
                    <span style={{ border: '1px solid #3b2a1a', borderRadius: '2mm', padding: '0 1.5mm' }}>{d.abilities[a].score.value}</span>
                  </div>
                  <div style={{ borderTop: '.5px solid #cbb994', marginTop: '1mm', paddingTop: '.8mm' }}>
                    <div>
                      <span className={`dot ${d.saves[a].proficient ? 'on' : ''}`} />
                      <b>{signed(d.saves[a].value)}</b> Save
                    </div>
                    {skills
                      .filter((s) => s.ability === a)
                      .map((s) => (
                        <div key={s.id}>
                          <span className={`dot ${d.skills[s.id].proficient ? 'on' : ''}`} style={d.skills[s.id].expertise ? { boxShadow: 'inset 0 0 0 0.5mm #fff' } : undefined} />
                          <b>{signed(d.skills[s.id].value)}</b> {s.name}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              <div className="box" style={{ gridColumn: 'span 2' }}>
                <div className="lab">Heroic Inspiration</div>
                <span className={`dot ${char.heroicInspiration ? 'on' : ''}`} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5mm' }}>
              <div className="box">
                <h3>Weapons & Damage Cantrips</h3>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Atk Bonus / DC</th>
                      <th>Damage & Type</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.attacks.map((a) => (
                      <tr key={a.key}>
                        <td>{a.name}</td>
                        <td>{a.bonus ? signed(a.bonus.value) : a.save ? `DC ${a.save.dc} ${a.save.ability.toUpperCase()}` : '—'}</td>
                        <td>
                          {a.damage} {a.damageType}
                        </td>
                        <td>{[a.range, a.masteryActive && a.mastery ? `Mastery: ${a.mastery}` : '', ...a.properties.map((p) => p), ...a.notes].filter(Boolean).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="box" style={{ flex: 1 }}>
                <h3>Class Features</h3>
                <div className="cols2">
                  {d.features
                    .filter((f) => f.sourceType === 'class' || f.sourceType === 'subclass' || f.key.startsWith('option:'))
                    .filter((f) => !/^ability score improvement$/i.test(f.name))
                    .map((f) => (
                      <div key={f.key} className="entry" style={{ marginBottom: '1.2mm' }}>
                        <b>{f.name}</b> <span style={{ color: '#8a7457' }}>({f.source})</span>
                        {f.uses ? ` [${f.uses.max}/${f.uses.recharge === 'short' || f.uses.recharge === 'shortOrLong' ? 'SR' : f.uses.recharge === 'shortOne' ? 'LR, 1/SR' : 'LR'}]` : ''} – {f.summary}
                      </div>
                    ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5mm' }}>
                <div className="box">
                  <h3>Species Traits</h3>
                  {d.features
                    .filter((f) => f.sourceType === 'species' || f.key.startsWith('species-option'))
                    .map((f) => (
                      <div key={f.key} style={{ marginBottom: '1mm' }}>
                        <b>{f.name}</b> – {f.summary}
                      </div>
                    ))}
                  {d.senses.length > 0 && <div><b>Senses:</b> {d.senses.join(', ')}</div>}
                  {d.resistances.length > 0 && <div><b>Resistances:</b> {d.resistances.join(', ')}</div>}
                </div>
                <div className="box">
                  <h3>Feats</h3>
                  {d.features
                    .filter((f) => f.sourceType === 'feat')
                    .map((f) => (
                      <div key={f.key} style={{ marginBottom: '1mm' }}>
                        <b>{f.name}</b> – {f.summary}
                      </div>
                    ))}
                </div>
              </div>
              <div className="box">
                <h3>Equipment Training & Proficiencies</h3>
                <div>
                  <b>Armor:</b> {['light', 'medium', 'heavy', 'shield'].map((a) => <span key={a} style={{ marginRight: '2mm' }}><span className={`dot ${d.proficiencies.armor.includes(a as never) ? 'on' : ''}`} />{a === 'shield' ? 'Shields' : a.charAt(0).toUpperCase() + a.slice(1)}</span>)}
                </div>
                <div><b>Weapons:</b> {d.proficiencies.weapons.join(', ')}</div>
                <div><b>Tools:</b> {d.proficiencies.tools.map((t) => L.get('tool', t)?.name ?? t).join(', ') || '—'}</div>
                <div><b>Languages:</b> {d.proficiencies.languages.map((l) => L.get('language', l)?.name ?? l).join(', ')}</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {parts.includes('spells') && (d.spellcasting.length > 0 || spells.length > 0) && (
        <div className="pp">
          <h2>Spellcasting</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, d.spellcasting.length)}, 1fr) 1.4fr`, gap: '2.5mm', marginBottom: '3mm' }}>
            {d.spellcasting.map((sc) => (
              <div key={sc.classId} className="box">
                <div className="lab">{sc.className}</div>
                <div>Ability: <b>{abilityNames[sc.ability]}</b> ({signed(sc.mod)})</div>
                <div>Spell Save DC: <b>{sc.dc.value}</b> · Spell Attack: <b>{signed(sc.attack.value)}</b></div>
                <div>Cantrips {sc.cantripCount}/{sc.cantripsMax} · Prepared {sc.preparedCount}/{sc.preparedMax}</div>
              </div>
            ))}
            <div className="box">
              <div className="lab">Spell Slots</div>
              {d.slots.map((s) => (
                <span key={s.level} style={{ marginRight: '3mm', whiteSpace: 'nowrap' }}>
                  <b>{s.level}:</b> {Array.from({ length: s.max }, (_, i) => <span key={i} className={`dot ${i < s.max - s.used ? '' : 'on'}`} />)}
                </span>
              ))}
              {d.pact && (
                <div>
                  <b>Pact (Lvl {d.pact.level}):</b> {Array.from({ length: d.pact.count }, (_, i) => <span key={i} className="dot" />)}
                </div>
              )}
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Lvl</th>
                <th>Prep.</th>
                <th>Name</th>
                <th>Casting Time</th>
                <th>Range</th>
                <th>C / R / M</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {spells.map(({ s, def }) => (
                <tr key={`${s.spellId}:${s.source}`}>
                  <td>{def!.level || 'C'}</td>
                  <td>{def!.level ? <span className={`dot ${s.prepared || s.alwaysPrepared ? 'on' : ''}`} /> : ''}</td>
                  <td><b>{def!.name}</b></td>
                  <td>{def!.castingTime}</td>
                  <td>{def!.range}</td>
                  <td>{[def!.concentration && 'C', def!.ritual && 'R', def!.components.m && 'M'].filter(Boolean).join(' ')}</td>
                  <td>{def!.duration}</td>
                  <td>{[def!.damage && `${def!.damage.dice} ${def!.damage.type}`, def!.save && `${def!.save.toUpperCase()} save`, def!.attack && 'attack'].filter(Boolean).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {parts.includes('features') && (
        <div className="pp">
          <h2>Features & Traits</h2>
          <div className="cols2">
            {d.features.map((f) => (
              <div key={f.key} className="entry">
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#7a1d17' }}>
                  {f.name} <span style={{ fontFamily: 'Inter Variable', fontWeight: 400, color: '#8a7457', fontSize: '7pt' }}>{f.source}</span>
                </div>
                <Markdown text={f.description || f.summary} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {parts.includes('inventory') && (
        <div className="pp">
          <h2>Equipment & Inventory</h2>
          <div style={{ display: 'flex', gap: '3mm', marginBottom: '3mm' }}>
            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((c) => (
              <div key={c} className="box" style={{ textAlign: 'center', minWidth: '16mm' }}>
                <div className="lab">{c.toUpperCase()}</div>
                <div className="big" style={{ fontSize: '12pt' }}>{char.currency[c]}</div>
              </div>
            ))}
            <div className="box" style={{ flex: 1 }}>
              <div className="lab">Carrying</div>
              <div>{d.carry.weight} / {d.carry.capacity} lb. · Drag/Lift/Push {d.carry.dragLift} lb.</div>
              <div>Attuned items: {d.attunedCount}/3</div>
              {char.weaponMasteries.length > 0 && <div>Weapon Mastery: {char.weaponMasteries.map((w) => L.get('weapon', w)?.name ?? w).join(', ')}</div>}
            </div>
          </div>
          <table className="tbl" style={{ marginBottom: '4mm' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Weight</th>
                <th>Equipped</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {char.inventory.map((it) => {
                const def = L.item(it.refId)
                const base = def?.kind === 'magicItem' ? L.item(it.baseId) : def
                return (
                  <tr key={it.uid}>
                    <td><b>{it.name || def?.name}</b>{def?.kind === 'magicItem' && base ? ` (${base.name})` : ''}</td>
                    <td>{it.qty}</td>
                    <td>{(base as { weight?: number } | undefined)?.weight ? `${(base as { weight: number }).weight * it.qty} lb.` : ''}</td>
                    <td>{it.equipped ? '✓' : ''}{it.attuned ? ' (attuned)' : ''}</td>
                    <td>{[def?.kind === 'magicItem' ? (def as MagicItemDef).rarity : '', it.bonus ? `+${it.bonus}` : '', it.notes].filter(Boolean).join(', ')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="cols2">
            {char.inventory
              .map((it) => L.item(it.refId))
              .filter((e, i, arr) => e && (e.kind === 'magicItem' || e.source === 'Homebrew' || e.kind === 'gear') && arr.findIndex((x) => x?.id === e.id) === i)
              .map((e) => (
                <div key={e!.id} className="entry">
                  <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#7a1d17' }}>{e!.name}</div>
                  <Markdown text={e!.description} compact />
                </div>
              ))}
          </div>
        </div>
      )}

      {parts.includes('spellcards') && spells.length > 0 && (
        <div className="pp">
          <h2>Spell Descriptions</h2>
          <div className="cols2">
            {spells.map(({ s, def }) => (
              <div key={`${s.spellId}:${s.source}`} className="entry" style={{ border: '1px solid #cbb994', borderRadius: '2mm', padding: '2mm' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#7a1d17', fontSize: '10pt' }}>{def!.name}</div>
                <div style={{ fontStyle: 'italic', color: '#6b5640', marginBottom: '1mm' }}>
                  {def!.level === 0 ? `${def!.school} Cantrip` : `Level ${def!.level} ${def!.school}`}
                  {def!.ritual ? ' (Ritual)' : ''}
                </div>
                <div style={{ fontSize: '7.4pt', marginBottom: '1mm' }}>
                  <b>Casting Time:</b> {def!.castingTime} · <b>Range:</b> {def!.range} · <b>Components:</b> {[def!.components.v && 'V', def!.components.s && 'S', def!.components.m && `M (${def!.components.m})`].filter(Boolean).join(', ')} · <b>Duration:</b> {def!.duration}
                </div>
                <Markdown text={def!.description} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {parts.includes('details') && (
        <div className="pp">
          <h2>Character Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: char.portrait ? '55mm 1fr' : '1fr', gap: '4mm' }}>
            {char.portrait && <img src={char.portrait} style={{ width: '55mm', height: '55mm', objectFit: 'cover', borderRadius: '3mm', border: '1.2px solid #3b2a1a' }} />}
            <div className="box" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5mm' }}>
              {(['gender', 'age', 'height', 'weight', 'eyes', 'hair', 'skin', 'faith'] as const).map((k) => (
                <div key={k}>
                  <div className="lab">{k}</div>
                  <div>{char.details[k] || '—'}</div>
                </div>
              ))}
            </div>
          </div>
          {char.deityId && L.get('deity', char.deityId) && (() => {
            const g = L.get('deity', char.deityId)!
            return (
              <div className="box entry" style={{ marginTop: '3mm' }}>
                <h3>{g.category === 'patron' ? 'Patron' : 'Deity'}</h3>
                <div>
                  <b>{g.name}</b>, {g.title} · {g.alignment}
                  {g.domains.length > 0 && <> · Domains: {g.domains.join(', ')}</>}
                  {g.symbol !== '—' && <> · Symbol: {g.symbol}</>}
                </div>
                <div style={{ marginTop: '1mm', fontFamily: 'EB Garamond, serif', fontSize: '10pt' }}>{g.summary}</div>
              </div>
            )
          })()}
          {(
            [
              ['Appearance', char.details.appearance],
              ['Personality Traits', char.details.personality],
              ['Ideals', char.details.ideals],
              ['Bonds', char.details.bonds],
              ['Flaws', char.details.flaws],
              ['Backstory', char.details.backstory],
              ['Allies & Organizations', char.details.allies],
              ['Notes', char.details.notes]
            ] as const
          )
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="box entry" style={{ marginTop: '3mm' }}>
                <h3>{k}</h3>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'EB Garamond, serif', fontSize: '10.5pt' }}>{v}</div>
              </div>
            ))}
        </div>
      )}

      {parts.includes('legal') && (
        <div className="pp">
          <h2>Legal & Sources</h2>
          <p>{ATTRIBUTION}</p>
          <p style={{ marginTop: '2mm' }}>{DISCLAIMER_PHB}</p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="box" style={{ textAlign: 'center' }}>
      <div className="lab">{label}</div>
      <div className="big">{value}</div>
      {sub && <div style={{ fontSize: '6.4pt', color: '#6b5640' }}>{sub}</div>}
    </div>
  )
}

/** Skalerer arket (CSS zoom) slik at det fyller – men aldri overstiger – én A4-side (binærsøk) */
function fitSheet(el: HTMLDivElement | null): void {
  if (!el) return
  const page = el.parentElement!
  const avail = page.getBoundingClientRect().height
  const style = el.style as CSSStyleDeclaration & { zoom: string }
  const fits = (z: number): boolean => {
    style.zoom = String(z)
    return el.getBoundingClientRect().height <= avail
  }
  if (fits(1)) return
  let lo = 0.4
  let hi = 1
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid
    else hi = mid
  }
  style.zoom = String(lo)
}
