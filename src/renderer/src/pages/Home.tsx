import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Copy, Download, FileText, Heart, Plus, Shield, Trash2, Upload, Wand2, Sparkles, RotateCcw } from 'lucide-react'
import { newCharacter, useCharacters } from '../store/characters'
import { useLookup, useUi } from '../store/ui'
import { computeCharacter } from '../engine/compute'
import { Modal } from '../components/ui'
import { api } from '../lib/api'
import type { Character } from '../types'
import { SortSelect, useSortChoice } from '../components/SortSelect'
import { ClassEmblem } from '../components/ClassEmblem'

export default function Home() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const characters = useCharacters((s) => s.characters)
  const loaded = useCharacters((s) => s.loaded)
  const add = useCharacters((s) => s.add)
  const importFiles = useCharacters((s) => s.importFiles)
  const notify = useUi((s) => s.notify)
  const [sortId, setSortId] = useSortChoice('home', 'recent')
  const level = (c: (typeof characters)[string]): number => c.classes.reduce((s, x) => s + x.level, 0)
  const list = Object.values(characters).sort((a, b) =>
    sortId === 'name'
      ? (a.name || '~').localeCompare(b.name || '~', 'nb', { numeric: true, sensitivity: 'base' })
      : sortId === 'charLevel'
        ? level(b) - level(a) || a.name.localeCompare(b.name)
        : sortId === 'class'
          ? (a.classes[0]?.classId ?? '~').localeCompare(b.classes[0]?.classId ?? '~') || a.name.localeCompare(b.name)
          : b.updatedAt.localeCompare(a.updatedAt)
  )

  const create = (): void => {
    const c = newCharacter()
    add(c)
    nav(`/character/${c.id}/build`)
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-line-soft bg-gradient-to-br from-panel to-bg-2 px-8 py-8">
        <motion.div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-crimson/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="relative flex items-end justify-between gap-6">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold text-gold">
              D&D Character Forge
            </motion.h1>
            <p className="mt-2 max-w-xl font-serif text-lg text-muted">{t('home.tagline')}</p>
          </div>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={async () => {
                const n = await importFiles()
                if (n) notify(t('home.imported', { n }), 'good')
              }}
            >
              <Upload size={15} /> {t('home.import')}
            </button>
            <button className="btn btn-primary" onClick={create}>
              <Plus size={16} /> {t('home.new')}
            </button>
          </div>
        </div>
      </header>

      {list.length > 1 && (
        <div className="mb-3 flex justify-end">
          <SortSelect
            className="w-56"
            value={sortId}
            onChange={setSortId}
            options={[
              { id: 'recent', label: 'recent' },
              { id: 'name', label: 'name' },
              { id: 'charLevel', label: 'charLevel' },
              { id: 'class', label: 'class' }
            ]}
          />
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-5">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4 }}
          onClick={create}
          className="group flex min-h-[230px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <motion.span className="flex h-14 w-14 items-center justify-center rounded-full border border-current" whileHover={{ rotate: 90 }}>
            <Plus size={26} />
          </motion.span>
          <span className="font-display">{t('home.new')}</span>
          <span className="text-xs">{t('home.newHint')}</span>
        </motion.button>
        {list.map((c, i) => (
          <CharacterCard key={c.id} c={c} index={i} />
        ))}
      </div>
      <TrashSection count={list.length} />
      {loaded && list.length === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 text-center font-serif text-lg text-muted">
          <Sparkles className="mr-2 inline text-gold" size={18} />
          {t('home.empty')}
        </motion.p>
      )}
    </div>
  )
}

function CharacterCard({ c, index }: { c: Character; index: number }) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const L = useLookup()
  const dup = useCharacters((s) => s.duplicate)
  const remove = useCharacters((s) => s.remove)
  const [confirm, setConfirm] = useState(false)
  const d = useMemo(() => computeCharacter(c, L), [c, L])
  const species = L.get('species', c.speciesId)
  const firstClass = c.classes[0]?.classId
  const hpPct = d.hpMax.value ? Math.max(0, Math.min(1, c.hp.current / d.hpMax.value)) : 0
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="panel card-hover group relative flex cursor-pointer flex-col overflow-hidden"
        onClick={() => nav(`/character/${c.id}`)}
      >
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-panel-3 to-bg-2">
          {c.portrait ? (
            <img src={c.portrait} className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center opacity-70 transition-transform duration-500 group-hover:scale-110">
              <ClassEmblem classId={firstClass} size={70} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
          <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="font-display text-xl font-bold text-ink drop-shadow">{c.name || t('common.unnamed')}</div>
              <div className="text-xs text-muted">
                {t('common.level')} {d.totalLevel} {species?.name ?? ''} {d.classLabel !== 'No class' ? d.classLabel.replace(/ \d+/g, '') : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="chip">
              <Shield size={12} /> AC {d.ac.value}
            </span>
            <span className="chip">
              <Heart size={12} /> {c.hp.current}/{d.hpMax.value}
            </span>
            {d.pending.length > 0 && (
              <button
                className="chip cursor-pointer border-crimson/40 text-crimson-2 hover:bg-crimson/10"
                title={t('guide.badgeTitle')}
                onClick={(e) => {
                  e.stopPropagation()
                  nav(`/character/${c.id}?guide=1`)
                }}
              >
                {t('home.todo', { n: d.pending.length })} →
              </button>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-crimson to-good" initial={{ width: 0 }} animate={{ width: `${hpPct * 100}%` }} transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }} />
          </div>
          <div className="mt-auto flex items-center gap-1 pt-1 opacity-70 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-ghost btn-sm" title={t('home.build')} onClick={() => nav(`/character/${c.id}/build`)}>
              <Wand2 size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" title={t('home.duplicate')} onClick={() => dup(c.id)}>
              <Copy size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" title={t('home.export')} onClick={() => api.exportCharacter(c)}>
              <Download size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" title="PDF" onClick={() => api.exportPdf({ id: c.id, name: c.name, parts: ['sheet', 'spells', 'features', 'inventory', 'spellcards', 'details', 'legal'] })}>
              <FileText size={14} />
            </button>
            <span className="ml-auto text-[10px] text-faint">{new Date(c.updatedAt).toLocaleDateString()}</span>
            <button className="btn btn-ghost btn-sm btn-danger" title={t('common.delete')} onClick={() => setConfirm(true)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('home.deleteTitle')}
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirm(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-danger" onClick={() => remove(c.id)}>
              <Trash2 size={14} /> {t('common.delete')}
            </button>
          </>
        }
      >
        {t('home.deleteText', { name: c.name || t('common.unnamed') })}
      </Modal>
    </>
  )
}

/** Slettede karakterer ligger i papirkurven i 30 dager og kan hentes tilbake */
function TrashSection({ count }: { count: number }) {
  const { t } = useTranslation()
  const restore = useCharacters((s) => s.restore)
  const notify = useUi((s) => s.notify)
  const [items, setItems] = useState<{ file: string; name: string; deletedAt: number }[]>([])
  const [open, setOpen] = useState(false)
  const reload = (): void => void api.trashList().then(setItems).catch(() => setItems([]))
  // Last på nytt når antallet karakterer endrer seg (f.eks. etter sletting)
  useEffect(reload, [count])
  if (!items.length) return null
  return (
    <div className="mt-8">
      <button className="btn btn-ghost btn-sm text-muted" onClick={() => setOpen(!open)}>
        <Trash2 size={13} /> {t('home.trash', { n: items.length })} {open ? '▾' : '▸'}
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted">{t('home.trashHint')}</p>
          {items.map((it) => (
            <div key={it.file} className="flex items-center gap-3 rounded-lg border border-line-soft px-3 py-1.5 text-sm">
              <span className="font-display text-gold">{it.name || t('common.unnamed')}</span>
              <span className="text-xs text-muted">{it.deletedAt ? new Date(it.deletedAt).toLocaleString() : ''}</span>
              <button
                className="btn btn-sm ml-auto"
                onClick={async () => {
                  if (await restore(it.file)) notify(t('home.restored', { name: it.name || t('common.unnamed') }), 'good')
                  reload()
                }}
              >
                <RotateCcw size={13} /> {t('home.restore')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
