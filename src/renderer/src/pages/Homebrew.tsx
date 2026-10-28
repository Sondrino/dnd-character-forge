import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen, Copy, Download, Dna, FileJson, FlaskConical, Gem, Hammer, Languages, Package, Pencil, Plus, ScrollText, Search, Shield, Skull, Sparkles, Swords, Trash2, Upload, UserRound
} from 'lucide-react'
import type { AnyEntity, EntityKind } from '../types'
import { useHomebrew } from '../store/settings'
import { EntityEditor, HOMEBREW_KINDS, KIND_NAMES } from '../components/HomebrewEditor'
import { EntityLink, entityFacts } from '../components/EntityInfo'
import { Empty, Modal } from '../components/ui'
import { useLookup, useUi } from '../store/ui'
import { matchesQuery } from '../lib/search'

const KIND_ICON: Record<string, React.ReactElement> = {
  subclass: <Sparkles size={18} />, species: <Dna size={18} />, background: <UserRound size={18} />, feat: <BookOpen size={18} />, spell: <ScrollText size={18} />,
  magicItem: <Gem size={18} />, weapon: <Swords size={18} />, armor: <Shield size={18} />, gear: <Package size={18} />, tool: <Hammer size={18} />, creature: <Skull size={18} />, language: <Languages size={18} />
}

function download(name: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
}

export default function HomebrewPage() {
  const { t } = useTranslation()
  const list = useHomebrew((s) => s.entities)
  const upsert = useHomebrew((s) => s.upsert)
  const remove = useHomebrew((s) => s.remove)
  const notify = useUi((s) => s.notify)
  const L = useLookup()
  const [editing, setEditing] = useState<AnyEntity | null | 'new'>(null)
  const [newKind, setNewKind] = useState<EntityKind>('subclass')
  const [choosing, setChoosing] = useState(false)
  const [filter, setFilter] = useState<EntityKind | 'all'>('all')
  const [q, setQ] = useState('')
  const [confirmDel, setConfirmDel] = useState<AnyEntity | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of list) m.set(e.kind, (m.get(e.kind) ?? 0) + 1)
    return m
  }, [list])
  const shown = list.filter((e) => (filter === 'all' || e.kind === filter) && matchesQuery(e, q)).sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))

  const importAll = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const raw = JSON.parse(await f.text()) as AnyEntity[] | AnyEntity
        let n = 0
        for (const e of Array.isArray(raw) ? raw : [raw]) {
          if (e?.id && e?.kind && e?.name && HOMEBREW_KINDS.includes(e.kind)) {
            upsert({ ...e, source: 'Homebrew' })
            n++
          }
        }
        notify(t('hb.imported', { n }), n ? 'good' : 'bad')
      } catch {
        notify(t('hb.importFail'), 'bad')
      }
    }
    input.click()
  }
  const duplicate = (e: AnyEntity): void => {
    let id = `${e.id}-copy`
    while (list.some((x) => x.id === id && x.kind === e.kind)) id += '-2'
    upsert({ ...JSON.parse(JSON.stringify(e)), id, name: `${e.name} (2)` })
    notify(t('hb.duplicated', { name: e.name }), 'good')
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-gold">{t('nav.homebrew')}</h1>
          <p className="mt-1 max-w-2xl font-serif text-lg text-muted">{t('hb.intro')}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={importAll} title={t('hb.importTip')}>
            <Upload size={14} /> {t('home.import')}
          </button>
          <button className="btn" onClick={() => download('homebrew.json', list)} disabled={!list.length} title={t('hb.exportTip')}>
            <Download size={14} /> {t('home.export')}
          </button>
          <button className="btn btn-primary" onClick={() => setChoosing(true)}>
            <Plus size={15} /> {t('hb.new')}
          </button>
        </div>
      </div>

      {list.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input className="input pl-9" placeholder={t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className={`chip cursor-pointer ${filter === 'all' ? 'border-gold text-gold' : ''}`} onClick={() => setFilter('all')}>
            {t('common.all')} <span className="text-[10px] text-faint">{list.length}</span>
          </button>
          {HOMEBREW_KINDS.filter((k) => counts.get(k)).map((k) => (
            <button key={k} className={`chip cursor-pointer ${filter === k ? 'border-gold text-gold' : ''}`} onClick={() => setFilter(k)}>
              {KIND_NAMES[k]} <span className="text-[10px] text-faint">{counts.get(k)}</span>
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="panel">
          <Empty
            icon={<FlaskConical size={40} />}
            title={t('hb.empty')}
            text={t('hb.emptyText')}
            action={
              <button className="btn btn-primary mt-2" onClick={() => setChoosing(true)}>
                <Plus size={14} /> {t('hb.new')}
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3">
          <AnimatePresence>
            {shown.map((e, i) => {
              const facts = entityFacts(e, L).slice(0, 2)
              return (
                <motion.div
                  key={`${e.kind}:${e.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i, 20) * 0.02 }}
                  className="panel card-hover group flex flex-col p-4"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-arcane">{KIND_ICON[e.kind] ?? <FlaskConical size={18} />}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-arcane">{KIND_NAMES[e.kind] ?? e.kind}</div>
                      <EntityLink kind={e.kind} id={e.id} className="font-display text-lg" />
                    </div>
                  </div>
                  {facts.map((f) => (
                    <div key={f.label} className="truncate text-[11px] text-muted">
                      {f.value}
                    </div>
                  ))}
                  <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{e.summary}</p>
                  {!!e.effects?.length && <div className="mt-2 text-[11px] text-gold">{t('hb.effectCount', { n: e.effects.length })}</div>}
                  <div className="mt-2 flex gap-1 border-t border-line-soft pt-2 opacity-70 transition-opacity group-hover:opacity-100">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)} title={t('hb.editShort')}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => duplicate(e)} title={t('hb.duplicate')}>
                      <Copy size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => download(`${e.id}.json`, e)} title={t('hb.exportOne')}>
                      <FileJson size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm ml-auto text-faint hover:text-bad" onClick={() => setConfirmDel(e)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {!shown.length && <div className="col-span-full py-10 text-center text-muted">{t('common.noResults')}</div>}
        </div>
      )}

      {/* Velg type */}
      <Modal open={choosing} onClose={() => setChoosing(false)} title={t('hb.chooseKind')} width={760}>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {HOMEBREW_KINDS.map((k) => (
            <motion.button
              key={k}
              whileHover={{ y: -2 }}
              className="card-hover rounded-xl border border-line-soft bg-panel-2 p-3 text-left"
              onClick={() => {
                setNewKind(k)
                setChoosing(false)
                setEditing('new')
              }}
            >
              <div className="flex items-center gap-2 font-display text-gold">
                <span className="text-arcane">{KIND_ICON[k]}</span> {KIND_NAMES[k]}
              </div>
              <div className="mt-1 text-xs text-muted">{t(`hb.kindDesc.${k}`)}</div>
            </motion.button>
          ))}
        </div>
      </Modal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title={t('hb.deleteTitle')}
        width={460}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmDel(null)}>
              {t('common.cancel')}
            </button>
            <button
              className="btn border-bad/60 text-bad"
              onClick={() => {
                if (confirmDel) remove(confirmDel.id, confirmDel.kind)
                setConfirmDel(null)
              }}
            >
              <Trash2 size={13} /> {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-sm">{t('hb.deleteText', { name: confirmDel?.name ?? '' })}</p>
      </Modal>

      <EntityEditor
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing === 'new' ? null : editing}
        initialKind={newKind}
        existingIds={list.map((e) => e.id)}
        onSave={upsert}
      />
    </div>
  )
}
