import { contextBridge, ipcRenderer } from 'electron'

const api = {
  listCharacters: (): Promise<unknown[]> => ipcRenderer.invoke('characters:list'),
  saveCharacter: (c: unknown): Promise<boolean> => ipcRenderer.invoke('characters:save', c),
  deleteCharacter: (id: string): Promise<boolean> => ipcRenderer.invoke('characters:delete', id),
  exportCharacter: (c: unknown): Promise<boolean> => ipcRenderer.invoke('characters:export', c),
  importCharacters: (): Promise<unknown[]> => ipcRenderer.invoke('characters:import'),
  storeGet: (key: string): Promise<unknown> => ipcRenderer.invoke('store:get', key),
  storeSet: (key: string, value: unknown): Promise<boolean> => ipcRenderer.invoke('store:set', key, value),
  dataPath: (): Promise<string> => ipcRenderer.invoke('app:dataPath'),
  openDataFolder: (): Promise<void> => ipcRenderer.invoke('app:openDataFolder'),
  pickImage: (): Promise<string | null> => ipcRenderer.invoke('image:pick'),
  exportPdf: (args: { id: string; name: string; parts: string[] }): Promise<boolean> =>
    ipcRenderer.invoke('pdf:export', args),
  printReady: (): void => ipcRenderer.send('print:ready'),
  openDndBeyond: (url: string, mode: 'app' | 'browser'): Promise<void> =>
    ipcRenderer.invoke('dndbeyond:open', url, mode)
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
