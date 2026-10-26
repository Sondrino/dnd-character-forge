import { app, BrowserWindow, ipcMain, dialog, shell, Menu, session, type IpcMainInvokeEvent, type WebContents } from 'electron'
import { pathToFileURL } from 'url'
import { join } from 'path'
import { promises as fs } from 'fs'

const isDev = !app.isPackaged && !!process.env['ELECTRON_RENDERER_URL']

let mainWindow: BrowserWindow | null = null

function dataDir(...parts: string[]): string {
  return join(app.getPath('userData'), ...parts)
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

function rendererUrl(hash = ''): { url?: string; file?: string; hash: string } {
  if (isDev) return { url: `${process.env['ELECTRON_RENDERER_URL']}#${hash}`, hash }
  return { file: join(__dirname, '../renderer/index.html'), hash }
}

function loadRenderer(win: BrowserWindow, hash = ''): Promise<void> {
  const target = rendererUrl(hash)
  if (target.url) return win.loadURL(target.url)
  return win.loadFile(target.file!, { hash })
}

/* ------------------------------------------------------------------ */
/* Sikkerhet                                                           */
/* ------------------------------------------------------------------ */

const rendererFileUrl = pathToFileURL(join(__dirname, '../renderer/index.html')).href

/** Er dette appens egen side (ikke en ekstern nettside)? */
function isAppUrl(url: string | undefined): boolean {
  if (!url) return false
  if (isDev && process.env['ELECTRON_RENDERER_URL'] && url.startsWith(process.env['ELECTRON_RENDERER_URL'])) return true
  return url.split('#')[0].split('?')[0] === rendererFileUrl
}

const isWebUrl = (url: string): boolean => /^https?:\/\//i.test(url)

/** Lås et app-vindu: ingen navigering bort fra appen, eksterne lenker åpnes trygt utenfor */
function lockDown(wc: WebContents): void {
  wc.on('will-navigate', (e, url) => {
    if (isAppUrl(url)) return
    e.preventDefault()
    if (isWebUrl(url)) openDndBeyond(url, 'browser')
  })
  wc.on('will-redirect', (e, url) => {
    if (!isAppUrl(url)) e.preventDefault()
  })
  wc.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) openDndBeyond(url, 'app')
    return { action: 'deny' }
  })
  wc.on('will-attach-webview', (e) => e.preventDefault())
}

/** IPC-kall godtas bare fra appens egne sider – aldri fra eksterne nettsider */
function handle<A extends unknown[], R>(channel: string, fn: (e: IpcMainInvokeEvent, ...args: A) => R): void {
  ipcMain.handle(channel, (e, ...args) => {
    if (!isAppUrl(e.senderFrame?.url)) throw new Error(`Blocked IPC from ${e.senderFrame?.url}`)
    return fn(e, ...(args as A))
  })
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#1a1410',
    title: 'D&D Character Forge',
    icon: join(__dirname, '../../build/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })
  mainWindow.on('ready-to-show', () => mainWindow?.show())
  // Eksterne lenker åpnes i D&D Beyond-vinduet / nettleser, aldri i hovedvinduet
  lockDown(mainWindow.webContents)
  loadRenderer(mainWindow)
}

/* ------------------------------------------------------------------ */
/* Karakterer                                                          */
/* ------------------------------------------------------------------ */

const charDir = (): string => dataDir('characters')

handle('characters:list', async () => {
  await ensureDir(charDir())
  const files = (await fs.readdir(charDir())).filter((f) => f.endsWith('.json'))
  const out: unknown[] = []
  for (const f of files) {
    try {
      out.push(JSON.parse(await fs.readFile(join(charDir(), f), 'utf-8')))
    } catch {
      /* hopp over ødelagte filer */
    }
  }
  return out
})

handle('characters:save', async (_e, character: { id: string }) => {
  if (!character || typeof character.id !== 'string' || !character.id) throw new Error('Invalid character')
  await ensureDir(charDir())
  const safeId = character.id.replace(/[^a-zA-Z0-9-_]/g, '')
  await fs.writeFile(join(charDir(), `${safeId}.json`), JSON.stringify(character, null, 2), 'utf-8')
  return true
})

handle('characters:delete', async (_e, id: string) => {
  if (typeof id !== 'string' || !id) throw new Error('Invalid id')
  const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '')
  await fs.rm(join(charDir(), `${safeId}.json`), { force: true })
  return true
})

handle('characters:export', async (_e, character: { name?: string }) => {
  const res = await dialog.showSaveDialog(mainWindow!, {
    title: 'Eksporter karakter',
    defaultPath: `${character.name || 'karakter'}.dndchar.json`,
    filters: [{ name: 'D&D Character', extensions: ['json'] }]
  })
  if (res.canceled || !res.filePath) return false
  await fs.writeFile(res.filePath, JSON.stringify(character, null, 2), 'utf-8')
  return true
})

handle('characters:import', async () => {
  const res = await dialog.showOpenDialog(mainWindow!, {
    title: 'Importer karakter',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'D&D Character', extensions: ['json'] }]
  })
  if (res.canceled) return []
  const out: unknown[] = []
  for (const p of res.filePaths) {
    try {
      out.push(JSON.parse(await fs.readFile(p, 'utf-8')))
    } catch {
      /* ignorer */
    }
  }
  return out
})

/* ------------------------------------------------------------------ */
/* Generisk JSON-lagring (homebrew, innstillinger)                     */
/* ------------------------------------------------------------------ */

handle('store:get', async (_e, key: string) => {
  if (typeof key !== 'string') return null
  try {
    return JSON.parse(await fs.readFile(dataDir(`${key.replace(/[^a-z0-9-]/gi, '')}.json`), 'utf-8'))
  } catch {
    return null
  }
})

handle('store:set', async (_e, key: string, value: unknown) => {
  if (typeof key !== 'string' || !key.replace(/[^a-z0-9-]/gi, '')) throw new Error('Invalid key')
  await ensureDir(dataDir())
  await fs.writeFile(dataDir(`${key.replace(/[^a-z0-9-]/gi, '')}.json`), JSON.stringify(value, null, 2), 'utf-8')
  return true
})

handle('app:dataPath', () => dataDir())
handle('app:openDataFolder', async () => {
  await ensureDir(charDir())
  await shell.openPath(dataDir())
})

handle('image:pick', async () => {
  const res = await dialog.showOpenDialog(mainWindow!, {
    title: 'Velg portrett',
    properties: ['openFile'],
    filters: [{ name: 'Bilder', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
  })
  if (res.canceled || !res.filePaths[0]) return null
  const p = res.filePaths[0]
  const buf = await fs.readFile(p)
  const ext = p.split('.').pop()!.toLowerCase().replace('jpg', 'jpeg')
  return `data:image/${ext};base64,${buf.toString('base64')}`
})

/* ------------------------------------------------------------------ */
/* PDF-eksport                                                         */
/* ------------------------------------------------------------------ */

/** Felles PDF-oppsett: A4, faste marger og bunntekst med navn og sidetall på hver side */
export function pdfOptions(name: string): Electron.PrintToPDFOptions {
  const esc = (t: string): string => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
  return {
    pageSize: 'A4',
    printBackground: true,
    margins: { top: 0.35, bottom: 0.45, left: 0.35, right: 0.35 },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7px;font-family:Segoe UI,sans-serif;color:#8a7457;padding:0 9mm;display:flex;justify-content:space-between"><span>${esc(name || 'Character')}</span><span>D&amp;D Character Forge · SRD 5.2.1 (CC-BY-4.0) · <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`
  }
}

handle('pdf:export', async (_e, args: { id: string; name: string; parts: string[] }) => {
  const printWin = new BrowserWindow({
    show: false,
    width: 900,
    height: 1200,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: true, contextIsolation: true, nodeIntegration: false }
  })
  lockDown(printWin.webContents)
  try {
    const ready = new Promise<void>((resolve) => {
      const handler = (ev: Electron.IpcMainEvent): void => {
        if (ev.sender.id === printWin.webContents.id) {
          ipcMain.removeListener('print:ready', handler)
          resolve()
        }
      }
      ipcMain.on('print:ready', handler)
      setTimeout(resolve, 15000) // sikkerhetsnett
    })
    await loadRenderer(printWin, `/print/${encodeURIComponent(args.id)}?parts=${args.parts.join(',')}`)
    await ready
    await new Promise((r) => setTimeout(r, 400))
    const pdf = await printWin.webContents.printToPDF(pdfOptions(args.name))
    const res = await dialog.showSaveDialog(mainWindow!, {
      title: 'Lagre PDF',
      defaultPath: `${args.name || 'karakter'}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    })
    if (res.canceled || !res.filePath) return false
    await fs.writeFile(res.filePath, pdf)
    shell.openPath(res.filePath)
    return true
  } finally {
    printWin.destroy()
  }
})

/* ------------------------------------------------------------------ */
/* D&D Beyond                                                          */
/* ------------------------------------------------------------------ */

let dndbWindow: BrowserWindow | null = null

function openDndBeyond(url: string, mode: 'app' | 'browser'): void {
  if (!/^https?:\/\//.test(url)) return
  if (mode === 'browser') {
    shell.openExternal(url)
    return
  }
  if (dndbWindow && !dndbWindow.isDestroyed()) {
    dndbWindow.loadURL(url)
    dndbWindow.focus()
    return
  }
  dndbWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    title: 'D&D Beyond',
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, partition: 'persist:dndbeyond' }
  })
  const w = dndbWindow
  w.setMenu(
    Menu.buildFromTemplate([
      { label: '◀ Tilbake', click: () => w.webContents.navigationHistory.canGoBack() && w.webContents.navigationHistory.goBack() },
      { label: 'Frem ▶', click: () => w.webContents.navigationHistory.canGoForward() && w.webContents.navigationHistory.goForward() },
      { label: '⟳ Last på nytt', click: () => w.webContents.reload() },
      { label: '⌂ D&D Beyond', click: () => w.loadURL('https://www.dndbeyond.com/') },
      { label: '↗ Åpne i nettleser', click: () => isWebUrl(w.webContents.getURL()) && shell.openExternal(w.webContents.getURL()) }
    ])
  )
  w.webContents.setWindowOpenHandler(({ url: u }) => {
    if (isWebUrl(u)) w.loadURL(u)
    return { action: 'deny' }
  })
  w.webContents.on('will-navigate', (e, u) => {
    if (!isWebUrl(u)) e.preventDefault()
  })
  w.loadURL(url)
}

handle('dndbeyond:open', (_e, url: string, mode: 'app' | 'browser') => typeof url === 'string' && openDndBeyond(url, mode === 'browser' ? 'browser' : 'app'))

/* ------------------------------------------------------------------ */

app.whenReady().then(() => {
  app.setAppUserModelId('no.dnd.characterforge')
  // Ingen nettsider får kamera, mikrofon, posisjon, varsler osv.
  for (const ses of [session.defaultSession, session.fromPartition('persist:dndbeyond')]) {
    ses.setPermissionRequestHandler((_wc, _perm, cb) => cb(false))
    ses.setPermissionCheckHandler(() => false)
  }
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
