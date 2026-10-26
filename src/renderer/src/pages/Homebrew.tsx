import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlaskConical, Pencil, Plus, Trash2, Download, Upload } from 'lucide-react'
import type { AnyEntity } from '../types'
import { useHomebrew } from '../store/settings'
import { EntityEditor, KIND_NAMES } from '../components/HomebrewEditor'
import { EntityLink } from '../components/EntityInfo'
import { Empty } from '../components/ui'
import { useUi } from '../store/ui'

export default function HomebrewPage() {
  const { t } = useTranslation()
  const list = useHomebrew((s) => s.entities)
  const upsert = useHomebrew((s) => s.upsert)
  const remove = useHomebrew((s) => s.remove)
  const notify = useUi((s) => s.notify)
  const [editing, setEditing] = useState<AnyEntity | null | 'new'>(null)

  const exportAll = (): void => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'homebrew.json'
    a.click()
  }
  const importAll = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const data = JSON.parse(await f.text()) as AnyEntity[]
        let n = 0
        for (const e of Array.isArray(data) ? data : []) {
          if (e?.id && e?.kind && e?.name) {
            upsert({ ...e, source: 'Homebrew' })
            n++
          }
        }
        notify(t('hb.imported', { n }), 'good')
      } catch {
        notify(t('hb.importFail'), 'bad')
      }
    }
    input.click()
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold">{t('nav.homebrew')}</h1>
          <p className="mt-1 max-w-2xl font-serif text-lg text-muted">{t('hb.intro')}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={importAll}>
            <Upload size={14} /> {t('home.import')}
          </button>
          <button className="btn" onClick={exportAll} disabled={!list.length}>
            <Download size={14} /> {t('home.export')}
          </button>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={15} /> {t('hb.new')}
          </button>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="panel">
          <Empty icon={<FlaskConical size={40} />} title={t('hb.empty')} text={t('hb.emptyText')} action={<button className="btn btn-primary mt-2" onClick={() => setEditing('new')}><Plus size={14} /> {t('hb.new')}</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {list.map((e, i) => (
            <motion.div key={`${e.kind}:${e.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="panel card-hover p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-arcane">{KIND_NAMES[e.kind] ?? e.kind}</div>
                  <EntityLink kind={e.kind} id={e.id} className="font-display text-lg" />
                </div>
                <div className="flex">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)}>
                    <Pencil size={13} />
                  </button>
                  <button className="btn btn-ghost btn-sm text-faint hover:text-bad" onClick={() => remove(e.id, e.kind)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{e.summary}</p>
              {!!e.effects?.length && <div className="mt-2 text-[11px] text-gold">{t('hb.effectCount', { n: e.effects.length })}</div>}
            </motion.div>
          ))}
        </div>
      )}
      <EntityEditor open={editing !== null} onClose={() => setEditing(null)} initial={editing === 'new' ? null : editing} existingIds={list.map((e) => e.id)} onSave={upsert} />
    </div>
  )
}
