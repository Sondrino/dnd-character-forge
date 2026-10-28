import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Maximize2, ExternalLink, ChevronDown } from 'lucide-react'
import type { AnyEntity, EntityKind, FeatDef, MagicItemDef, SpellDef, WeaponDef } from '../types'
import { useLookup, useUi } from '../store/ui'
import { InfoPopover, entityFacts, openDndBeyond } from '../components/EntityInfo'
import { SourceBadge } from '../components/ui'
import { matchesQuery } from '../lib/search'
import { groupEntities } from '../lib/compendiumGroups'
import { sortEntities, sortOptions } from '../lib/sorting'
import { SortSelect, useSortChoice } from '../components/SortSelect'
import { BookFilterBar, BookFilterReset, useBookFilter } from '../components/BookFilter'

const KINDS: { kind: EntityKind; label: string }[] = [
  { kind: 'class', label: 'Classes' },
  { kind: 'subclass', label: 'Subclasses' },
  { kind: 'species', label: 'Species' },
  { kind: 'background', label: 'Backgrounds' },
  { kind: 'feat', label: 'Feats' },
  { kind: 'spell', label: 'Spells' },
  { kind: 'weapon', label: 'Weapons' },
  { kind: 'armor', label: 'Armor' },
  { kind: 'gear', label: 'Adventuring Gear' },
  { kind: 'tool', label: 'Tools' },
  { kind: 'magicItem', label: 'Magic Items' },
  { kind: 'condition', label: 'Conditions' },
  { kind: 'rule', label: 'Rules Glossary' },
  { kind: 'language', label: 'Languages' },
  { kind: 'creature', label: 'Creatures' },
  { kind: 'deity', label: 'Gods & Patrons' }
]

export default function Compendium() {
  const { t } = useTranslation()
  const { kind: kindParam } = useParams()
  const nav = useNavigate()
  const kind = (kindParam as EntityKind) || 'class'
  const L = useLookup()
  const openDetail = useUi((s) => s.openDetail)
  const [q, setQ] = useState('')
  const [source, setSource] = useState<string>('all')
  const [f1, setF1] = useState<string>('all')
  const [f2, setF2] = useState<string>('all')
  const [popover, setPopover] = useState<{ e: AnyEntity; rect: DOMRect } | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const sortOpts = sortOptions(kind)
  const [sortId, setSortId] = useSortChoice(`compendium:${kind}`, sortOpts[0].id)
  const all = useMemo(() => sortEntities(L.all(kind), kind, sortId), [L, kind, sortId])
  const filters = filterDefs(kind, all, L)
  const bf = useBookFilter(`compendium:${kind}`, all)
  const shown = bf.filtered.filter((e) => {
    if (!matchesQuery(e, q, true)) return false
    if (source !== 'all' && e.source !== source && e.sourceBook !== source) return false
    if (filters[0] && f1 !== 'all' && !filters[0].test(e, f1)) return false
    if (filters[1] && f2 !== 'all' && !filters[1].test(e, f2)) return false
    return true
  })
  const groups = useMemo(() => groupEntities(kind, shown, L), [kind, shown, L])
  // Ny kategori eller nytt søk: start øverst med alle grupper åpne
  useEffect(() => {
    setCollapsed({})
    setExpanded({})
    scrollRef.current?.scrollTo({ top: 0 })
  }, [kind])

  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-line-soft bg-bg-2/60 px-3 py-5">
        <div className="mb-3 px-2 font-display text-lg text-gold">{t('nav.compendium')}</div>
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => {
              nav(`/compendium/${k.kind}`)
              setF1('all')
              setF2('all')
            }}
            className={`relative flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm ${kind === k.kind ? 'text-gold-2' : 'text-muted hover:text-ink'}`}
          >
            {kind === k.kind && <motion.span layoutId="comp-kind" className="absolute inset-0 rounded-lg bg-gold/10" />}
            <span className="relative">{k.label}</span>
            <span className="relative text-[10px] text-faint">{L.all(k.kind).length}</span>
          </button>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft px-6 py-3">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input className="input pl-9" placeholder={t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input w-40" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">{t('comp.allSources')}</option>
            <option value="SRD 5.2">SRD 5.2</option>
            <option value="PHB 2024">PHB 2024</option>
            <option value="Supplement">Supplement (Xanathar's, Tasha's …)</option>
            <option value="Third-party">Third-party (Kobold Press, A5E …)</option>
            <option value="Forgotten Realms">Forgotten Realms</option>
            <option value="Homebrew">Homebrew</option>
          </select>
          {filters[0] && (
            <select className="input w-44" value={f1} onChange={(e) => setF1(e.target.value)}>
              <option value="all">{filters[0].label}: {t('common.all')}</option>
              {filters[0].options.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          )}
          {filters[1] && (
            <select className="input w-44" value={f2} onChange={(e) => setF2(e.target.value)}>
              <option value="all">{filters[1].label}: {t('common.all')}</option>
              {filters[1].options.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          )}
          <SortSelect options={sortOpts} value={sortId} onChange={setSortId} className="w-52" />
          <span className="ml-auto text-sm text-muted">{t('comp.count', { n: shown.length })}</span>
          <BookFilterBar state={bf} className="w-full" />
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-6">
          {groups.length > 1 && (
            <div className="sticky top-0 z-10 -mx-6 mb-2 flex flex-wrap gap-1 border-b border-line-soft bg-bg/90 px-6 py-2 backdrop-blur">
              {groups.map((g) => (
                <button
                  key={g.id}
                  className="chip cursor-pointer hover:border-gold hover:text-gold"
                  onClick={() => {
                    setCollapsed((c) => ({ ...c, [g.id]: false }))
                    requestAnimationFrame(() => scrollRef.current?.querySelector(`#grp-${g.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
                  }}
                >
                  {g.label} <span className="text-[10px] text-faint">{g.items.length}</span>
                </button>
              ))}
            </div>
          )}
          {groups.map((g) => {
            const single = groups.length === 1
            const limit = expanded[g.id] ? Infinity : single ? 400 : 60
            const closed = !single && collapsed[g.id]
            return (
              <section key={g.id} id={`grp-${g.id}`} className={single ? 'pt-4' : 'scroll-mt-14 pt-3'}>
                {!single && (
                  <button
                    className="mb-2 flex w-full items-center gap-2 border-b border-gold/20 pb-1 text-left"
                    onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                  >
                    <ChevronDown size={15} className={`text-gold transition-transform ${closed ? '-rotate-90' : ''}`} />
                    <span className="font-display text-lg text-gold">{g.label}</span>
                    <span className="text-xs text-muted">{g.items.length}</span>
                  </button>
                )}
                {!closed && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
                    {g.items.slice(0, limit).map((e, i) => (
                      <CompCard key={`${e.kind}:${e.id}`} e={e} i={i} onPick={(rect) => setPopover({ e, rect })} />
                    ))}
                  </div>
                )}
                {!closed && g.items.length > limit && (
                  <div className="mt-2 text-center">
                    <button className="btn btn-sm" onClick={() => setExpanded((x) => ({ ...x, [g.id]: true }))}>
                      {t('comp.showAll', { n: g.items.length, group: g.label || t('common.all') })}
                    </button>
                  </div>
                )}
              </section>
            )
          })}
          {!shown.length && (
            <div className="py-10 text-center text-muted">
              {t('common.noResults')}
              <BookFilterReset state={bf} total={all.length} />
            </div>
          )}
        </div>
      </div>
      {popover && <InfoPopover entity={popover.e} anchor={popover.rect} onClose={() => setPopover(null)} />}
    </div>
  )
}

function CompCard({ e, i, onPick }: { e: AnyEntity; i: number; onPick: (rect: DOMRect) => void }) {
  const L = useLookup()
  const openDetail = useUi((s) => s.openDetail)
  const facts = entityFacts(e, L).slice(0, 2)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i, 24) * 0.015 }}
      className="panel card-hover group cursor-pointer p-3"
      onClick={(ev) => onPick((ev.currentTarget as HTMLElement).getBoundingClientRect())}
      onDoubleClick={() => openDetail({ kind: e.kind, id: e.id })}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-display text-[15px] text-gold">{e.name}</div>
        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
          <button className="btn btn-ghost btn-sm px-1" onClick={(ev) => (ev.stopPropagation(), openDetail({ kind: e.kind, id: e.id }))}>
            <Maximize2 size={13} />
          </button>
          <button className="btn btn-ghost btn-sm px-1" onClick={(ev) => (ev.stopPropagation(), openDndBeyond(e))}>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
      {facts.map((f) => (
        <div key={f.label} className="truncate text-[11px] text-muted">
          {f.value}
        </div>
      ))}
      <p className="mt-1 line-clamp-2 text-xs text-ink/80">{e.summary}</p>
      <div className="mt-2">
        <SourceBadge source={e.source} book={e.sourceBook} />
      </div>
    </motion.div>
  )
}

interface FilterDef {
  label: string
  options: { v: string; l: string }[]
  test: (e: AnyEntity, v: string) => boolean
}

function filterDefs(kind: EntityKind, all: AnyEntity[], L: ReturnType<typeof useLookup>): FilterDef[] {
  const uniq = (xs: string[]): string[] => [...new Set(xs)].sort()
  switch (kind) {
    case 'spell':
      return [
        { label: 'Level', options: Array.from({ length: 10 }, (_, i) => ({ v: String(i), l: i === 0 ? 'Cantrip' : `Level ${i}` })), test: (e, v) => (e as SpellDef).level === Number(v) },
        { label: 'Class', options: L.all('class').filter((c) => c.spellcasting).map((c) => ({ v: c.id, l: c.name })), test: (e, v) => (e as SpellDef).classes.includes(v) }
      ]
    case 'magicItem':
      return [
        { label: 'Rarity', options: ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies'].map((r) => ({ v: r, l: r })), test: (e, v) => (e as MagicItemDef).rarity === v },
        { label: 'Type', options: uniq(all.map((e) => (e as MagicItemDef).itemType.split(' (')[0])).map((x) => ({ v: x, l: x })), test: (e, v) => (e as MagicItemDef).itemType.startsWith(v) }
      ]
    case 'feat':
      return [{ label: 'Category', options: [{ v: 'origin', l: 'Origin' }, { v: 'general', l: 'General' }, { v: 'fightingStyle', l: 'Fighting Style' }, { v: 'epicBoon', l: 'Epic Boon' }], test: (e, v) => (e as FeatDef).category === v }]
    case 'weapon':
      return [
        { label: 'Category', options: [{ v: 'simple', l: 'Simple' }, { v: 'martial', l: 'Martial' }], test: (e, v) => (e as WeaponDef).category === v },
        { label: 'Mastery', options: ['cleave', 'graze', 'nick', 'push', 'sap', 'slow', 'topple', 'vex'].map((m) => ({ v: m, l: m })), test: (e, v) => (e as WeaponDef).mastery === v }
      ]
    case 'subclass':
      return [{ label: 'Class', options: L.all('class').map((c) => ({ v: c.id, l: c.name })), test: (e, v) => (e as { classId: string }).classId === v }]
    case 'rule':
      return [{ label: 'Category', options: uniq(all.map((e) => (e as { category: string }).category)).map((c) => ({ v: c, l: c })), test: (e, v) => (e as { category: string }).category === v }]
    case 'deity':
      return [
        { label: 'Pantheon', options: uniq(all.map((e) => (e as { pantheon: string }).pantheon)).map((x) => ({ v: x, l: x })), test: (e, v) => (e as { pantheon: string }).pantheon === v },
        { label: 'Domain / patron', options: uniq(all.flatMap((e) => [...(e as { domains: string[] }).domains, (e as { portfolio: string }).portfolio.endsWith('patron') ? (e as { portfolio: string }).portfolio : ''])).filter(Boolean).map((x) => ({ v: x, l: x })), test: (e, v) => (e as { domains: string[] }).domains.includes(v) || (e as { portfolio: string }).portfolio === v }
      ]
    case 'creature':
      return [
        { label: 'Type', options: uniq(all.map((e) => (e as { creatureType: string }).creatureType)).map((x) => ({ v: x, l: x })), test: (e, v) => (e as { creatureType: string }).creatureType === v },
        { label: 'CR', options: uniq(all.map((e) => (e as { cr: string }).cr)).sort((a, b) => crNum(a) - crNum(b)).map((x) => ({ v: x, l: `CR ${x}` })), test: (e, v) => (e as { cr: string }).cr === v }
      ]
    case 'gear':
      return [{ label: 'Category', options: uniq(all.map((e) => (e as { category?: string }).category ?? 'Adventuring Gear')).map((c) => ({ v: c, l: c })), test: (e, v) => ((e as { category?: string }).category ?? 'Adventuring Gear') === v }]
    default:
      return []
  }
}

function crNum(cr: string): number {
  if (cr.includes('/')) {
    const [a, b] = cr.split('/').map(Number)
    return a / b
  }
  return Number(cr) || 0
}
