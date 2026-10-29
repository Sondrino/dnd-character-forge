import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { create } from 'zustand'
import { BookOpen, Coffee, Dices, FlaskConical, Moon, Plus, Search, Settings as SettingsIcon, Swords, User } from 'lucide-react'
import type { AnyEntity, EntityKind } from '../types'
import { useLookup, useUi } from '../store/ui'
import { newCharacter, useCharacters } from '../store/characters'
import { useRolls } from '../store/rolls'
import { matchesQuery } from '../lib/search'
import { SourceBadge } from './ui'

/** Hurtigsøk (Ctrl+K): regeldata + homebrew, karakterer og handlinger */

export const usePalette = create<{ open: boolean; setOpen(v: boolean): void; toggle(): void }>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open })
}))

const KINDS: { kind: EntityKind; label: string }[] = [
  { kind: 'class', label: 'Class' }, { kind: 'subclass', label: 'Subclass' }, { kind: 'species', label: 'Species' },
  { kind: 'background', label: 'Background' }, { kind: 'feat', label: 'Feat' }, { kind: 'spell', label: 'Spell' },
  { kind: 'weapon', label: 'Weapon' }, { kind: 'armor', label: 'Armor' }, { kind: 'gear', label: 'Gear' }, { kind: 'tool', label: 'Tool' },
  { kind: 'magicItem', label: 'Magic Item' }, { kind: 'condition', label: 'Condition' }, { kind: 'rule', label: 'Rule' },
  { kind: 'language', label: 'Language' }, { kind: 'creature', label: 'Creature' }, { kind: 'deity', label: 'Deity' }, { kind: 'feature', label: 'Feature' }
]
const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.kind, k.label])) as Record<EntityKind, string>
const MAX_ENTITIES = 40

interface Item {
  key: string
  group: 'actions' | 'characters' | 'entities'
  label: string
  sub?: ReactNode
  icon: ReactNode
  run: () => void
}

const norm = (s: string): string => s.toLowerCase().replace(/[’‘`´]/g, "'")
const textMatch = (label: string, q: string): boolean => {
  const h = norm(label)
  return norm(q.trim()).split(/\s+/).every((w) => h.includes(w))
}

/** Rangering: navn som starter med søket først, så navn som inneholder det, så resten (alias/sammendrag) */
function rank(e: AnyEntity, q: string): number {
  const n = norm(e.name)
  const s = norm(q.trim())
  return n === s ? 0 : n.startsWith(s) ? 1 : n.includes(s) ? 2 : 3
}

export function CommandPalette() {
  const { t } = useTranslation()
  const open = usePalette((s) => s.open)
  const setOpen = usePalette((s) => s.setOpen)
  const nav = useNavigate()
  const location = useLocation()
  const L = useLookup()
  const characters = useCharacters((s) => s.characters)
  const openDetail = useUi((s) => s.openDetail)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
    }
  }, [open])

  const allEntities = useMemo(() => (open ? KINDS.flatMap((k) => L.all(k.kind) as AnyEntity[]) : []), [L, open])
  const charId = /^\/character\/([^/]+)/.exec(location.pathname)?.[1]
  const current = charId ? characters[charId] : undefined

  const { items, more } = useMemo(() => {
    const close = (fn: () => void) => () => {
      setOpen(false)
      fn()
    }
    const actions: Item[] = [
      { key: 'a:dice', group: 'actions', label: t('tools.palette.actions.dice'), icon: <Dices size={15} />, run: close(() => useRolls.getState().setTray(true)) },
      {
        key: 'a:new', group: 'actions', label: t('tools.palette.actions.newChar'), icon: <Plus size={15} />,
        run: close(() => {
          const c = newCharacter()
          useCharacters.getState().add(c)
          nav(`/character/${c.id}/build`)
        })
      },
      ...(current
        ? [
            { key: 'a:short', group: 'actions' as const, label: t('tools.palette.actions.shortRest', { name: current.name || t('common.unnamed') }), icon: <Coffee size={15} />, run: close(() => nav(`/character/${current.id}?rest=short`)) },
            { key: 'a:long', group: 'actions' as const, label: t('tools.palette.actions.longRest', { name: current.name || t('common.unnamed') }), icon: <Moon size={15} />, run: close(() => nav(`/character/${current.id}?rest=long`)) }
          ]
        : []),
      { key: 'a:home', group: 'actions', label: t('tools.palette.actions.home'), icon: <Swords size={15} />, run: close(() => nav('/')) },
      { key: 'a:comp', group: 'actions', label: t('tools.palette.actions.compendium'), icon: <BookOpen size={15} />, run: close(() => nav('/compendium')) },
      { key: 'a:hb', group: 'actions', label: t('tools.palette.actions.homebrew'), icon: <FlaskConical size={15} />, run: close(() => nav('/homebrew')) },
      { key: 'a:settings', group: 'actions', label: t('tools.palette.actions.settings'), icon: <SettingsIcon size={15} />, run: close(() => nav('/settings')) }
    ]
    const hasQ = !!q.trim()
    const chars: Item[] = Object.values(characters)
      .filter((c) => !hasQ || textMatch(c.name || t('common.unnamed'), q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, hasQ ? 20 : 5)
      .map((c) => ({
        key: `c:${c.id}`, group: 'characters', label: c.name || t('common.unnamed'), icon: <User size={15} />,
        sub: `${t('common.level')} ${c.classes.reduce((s, x) => s + x.level, 0)} · ${c.classes.map((x) => L.get('class', x.classId)?.name ?? x.classId).join(' / ')}`,
        run: close(() => nav(`/character/${c.id}`))
      }))
    let ents: AnyEntity[] = []
    let more = 0
    if (hasQ) {
      const hits = allEntities.filter((e) => matchesQuery(e, q)).sort((a, b) => rank(a, q) - rank(b, q) || a.name.localeCompare(b.name))
      more = Math.max(0, hits.length - MAX_ENTITIES)
      ents = hits.slice(0, MAX_ENTITIES)
    }
    const entItems: Item[] = ents.map((e) => ({
      key: `e:${e.kind}:${e.id}`, group: 'entities', label: e.name, icon: <Search size={14} />,
      sub: (
        <span className="flex items-center gap-1.5">
          {KIND_LABEL[e.kind] ?? e.kind} <SourceBadge source={e.source} book={e.sourceBook} />
        </span>
      ),
      run: close(() => openDetail({ kind: e.kind, id: e.id, entity: e }))
    }))
    return { items: [...actions.filter((a) => !hasQ || textMatch(a.label, q)), ...chars, ...entItems], more }
  }, [q, characters, allEntities, current, L, t])

  useEffect(() => setSel(0), [q])
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${sel}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  let lastGroup = ''
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[97] flex items-start justify-center px-6 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <motion.div
            className="panel relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
            initial={{ y: -16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          >
            <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
              <Search size={17} className="text-gold" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-base outline-none placeholder:text-faint"
                placeholder={t('tools.palette.placeholder')}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setSel((s) => Math.min(items.length - 1, s + 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setSel((s) => Math.max(0, s - 1))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    items[sel]?.run()
                  }
                }}
              />
              <kbd className="rounded border border-line px-1.5 text-[10px] text-muted">Esc</kbd>
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto p-2">
              {items.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">{t('common.noResults')}</div>}
              {items.map((it, i) => {
                const header = it.group !== lastGroup ? (lastGroup = it.group) : null
                return (
                  <div key={it.key}>
                    {header && <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-faint">{t(`tools.palette.groups.${header}`)}</div>}
                    <button
                      data-idx={i}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm ${i === sel ? 'bg-gold/15 text-gold-2' : 'hover:bg-panel-2'}`}
                      onMouseMove={() => sel !== i && setSel(i)}
                      onClick={it.run}
                    >
                      <span className="text-muted">{it.icon}</span>
                      <span className="truncate">{it.label}</span>
                      {it.sub && <span className="ml-auto shrink-0 truncate text-[11px] text-muted">{it.sub}</span>}
                    </button>
                  </div>
                )
              })}
              {more > 0 && <div className="px-3 py-2 text-center text-[11px] text-faint">{t('tools.palette.more', { n: more })}</div>}
            </div>
            <div className="border-t border-line-soft px-4 py-1.5 text-[11px] text-faint">{t('tools.palette.hint')}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
