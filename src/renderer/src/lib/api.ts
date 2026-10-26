import type { Character } from '../types'

/** Tynt lag over Electron-preload. Faller tilbake til localStorage (f.eks. i nettleser under utvikling). */
interface Api {
  listCharacters(): Promise<unknown[]>
  saveCharacter(c: unknown): Promise<boolean>
  deleteCharacter(id: string): Promise<boolean>
  exportCharacter(c: unknown): Promise<boolean>
  importCharacters(): Promise<unknown[]>
  storeGet(key: string): Promise<unknown>
  storeSet(key: string, value: unknown): Promise<boolean>
  dataPath(): Promise<string>
  openDataFolder(): Promise<void>
  pickImage(): Promise<string | null>
  exportPdf(args: { id: string; name: string; parts: string[] }): Promise<boolean>
  printReady(): void
  openDndBeyond(url: string, mode: 'app' | 'browser'): Promise<void>
}

const LS = 'dndforge:'
const fallback: Api = {
  async listCharacters() {
    const out: unknown[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!
      if (k.startsWith(`${LS}char:`)) out.push(JSON.parse(localStorage.getItem(k)!))
    }
    return out
  },
  async saveCharacter(c) {
    localStorage.setItem(`${LS}char:${(c as Character).id}`, JSON.stringify(c))
    return true
  },
  async deleteCharacter(id) {
    localStorage.removeItem(`${LS}char:${id}`)
    return true
  },
  async exportCharacter(c) {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(c as Character).name || 'character'}.dndchar.json`
    a.click()
    return true
  },
  async importCharacters() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.multiple = true
      input.onchange = async () => {
        const out: unknown[] = []
        for (const f of Array.from(input.files ?? [])) {
          try {
            out.push(JSON.parse(await f.text()))
          } catch {
            /* ignorer */
          }
        }
        resolve(out)
      }
      input.click()
    })
  },
  async storeGet(key) {
    const v = localStorage.getItem(`${LS}${key}`)
    return v ? JSON.parse(v) : null
  },
  async storeSet(key, value) {
    localStorage.setItem(`${LS}${key}`, JSON.stringify(value))
    return true
  },
  async dataPath() {
    return 'localStorage'
  },
  async openDataFolder() {},
  async pickImage() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const f = input.files?.[0]
        if (!f) return resolve(null)
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(f)
      }
      input.click()
    })
  },
  async exportPdf() {
    window.print()
    return true
  },
  printReady() {},
  async openDndBeyond(url) {
    window.open(url, '_blank', 'noopener')
  }
}

const w = (typeof window !== 'undefined' ? window : {}) as unknown as { api?: Api }
export const api: Api = (w.api ?? fallback) as Api
export const isElectron = !!w.api
