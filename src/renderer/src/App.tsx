import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, FlaskConical, Globe, Settings as SettingsIcon, Swords, Dices } from 'lucide-react'
import { useCharacters } from './store/characters'
import { useHomebrew, useSettings } from './store/settings'
import { useUi } from './store/ui'
import { useRolls } from './store/rolls'
import { DetailDrawer, openDndBeyond } from './components/EntityInfo'
import { DiceTray, RollToast } from './components/Dice'
import { Dice3DLayer } from './components/dice3d/Dice3DLayer'
import Home from './pages/Home'
import CharacterPage from './pages/CharacterPage'
import Builder from './pages/Builder'
import CombatPage from './pages/Combat'
import Compendium from './pages/Compendium'
import HomebrewPage from './pages/Homebrew'
import SettingsPage from './pages/Settings'
import i18n from './i18n'
import PrintPage from './pages/Print'
import { CommandPalette, usePalette } from './components/CommandPalette'
import { useHotkeys } from './lib/hotkeys'

export default function App() {
  const loadChars = useCharacters((s) => s.load)
  const loadSettings = useSettings((s) => s.load)
  const loadHb = useHomebrew((s) => s.load)
  const loadRolls = useRolls((s) => s.load)
  useEffect(() => {
    loadSettings()
    loadChars()
    loadHb()
    loadRolls()
  }, [])
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}

/** Ctrl+Z / Ctrl+Y (eller Ctrl+Shift+Z) angrer og gjør om endringer på karakteren som er åpen */
function useUndoKeys(): void {
  useEffect(() => {
    const h = (e: KeyboardEvent): void => {
      if (!(e.ctrlKey || e.metaKey)) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      const id = useUi.getState().activeCharacterId
      if (!id) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (useCharacters.getState().undo(id)) useUi.getState().notify(i18n.t('char.undone'))
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault()
        if (useCharacters.getState().redo(id)) useUi.getState().notify(i18n.t('char.redone'))
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
}

function Shell() {
  const location = useLocation()
  useUndoKeys()
  useHotkeys({
    palette: () => usePalette.getState().toggle(),
    dice: () => useRolls.getState().setTray(!useRolls.getState().trayOpen),
    escape: () => (usePalette.getState().open ? (usePalette.getState().setOpen(false), true) : false)
  })
  if (location.pathname.startsWith('/print/')) {
    return (
      <Routes>
        <Route path="/print/:id" element={<PrintPage />} />
      </Routes>
    )
  }
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split('/').slice(0, 3).join('/')}
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/character/:id" element={<CharacterPage />} />
              <Route path="/character/:id/build" element={<Builder />} />
              <Route path="/character/:id/combat" element={<CombatPage />} />
              <Route path="/compendium" element={<Compendium />} />
              <Route path="/compendium/:kind" element={<Compendium />} />
              <Route path="/homebrew" element={<HomebrewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <DetailDrawer />
      <Dice3DLayer />
      <DiceTray />
      <RollToast />
      <Toast />
      <CommandPalette />
    </div>
  )
}

function Sidebar() {
  const { t } = useTranslation()
  const setTray = useRolls((s) => s.setTray)
  const items = [
    { to: '/', icon: <Swords size={20} />, label: t('nav.characters'), end: true },
    { to: '/compendium', icon: <BookOpen size={20} />, label: t('nav.compendium') },
    { to: '/homebrew', icon: <FlaskConical size={20} />, label: t('nav.homebrew') },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: t('nav.settings') }
  ]
  return (
    <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-line-soft bg-bg-2 py-4">
      <motion.div whileHover={{ rotate: -12, scale: 1.08 }} className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-crimson to-[#5c1612] font-display text-[13px] font-bold text-gold-2 shadow-lg">
        D&D
      </motion.div>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            `group relative flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors ${isActive ? 'text-gold-2' : 'text-muted hover:text-ink'}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-gold/12 ring-1 ring-gold/30" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
              <span className="relative">{it.icon}</span>
              <span className="relative text-center leading-tight">{it.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button className="flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-muted hover:text-ink" onClick={() => setTray(true)}>
          <Dices size={20} />
          {t('nav.dice')}
        </button>
        <button
          className="flex w-16 flex-col items-center gap-1 rounded-xl py-2 text-[10px] text-muted hover:text-ink"
          onClick={() => openDndBeyond({ name: 'D&D Beyond', dndBeyondUrl: 'https://www.dndbeyond.com/' })}
          title="D&D Beyond"
        >
          <Globe size={20} />
          D&D Beyond
        </button>
      </div>
    </nav>
  )
}

function Toast() {
  const toast = useUi((s) => s.toast)
  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[95] -translate-x-1/2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`panel px-4 py-2 text-sm ${toast.tone === 'good' ? 'border-good/50' : toast.tone === 'bad' ? 'border-bad/50' : ''}`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
