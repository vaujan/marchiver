import { contextBridge, ipcRenderer } from 'electron'

export interface IElectronAPI {
  getFolders: () => Promise<Array<{ id: number; name: string; parent_id: number | null }>>
  getTags: () => Promise<Array<{ id: number; name: string; color: string }>>
  getEntries: (filters: { folderId?: number; tagId?: number; search?: string; trashed?: boolean }) => Promise<Array<{
    id: number
    title: string
    type: 'url' | 'image'
    source_url: string | null
    screenshot_path: string | null
    folder_id: number
    is_deleted: boolean
    created_at: string
    tags: string[]
  }>>
  getEntry: (id: number) => Promise<{
    id: number
    title: string
    type: 'url' | 'image'
    source_url: string | null
    screenshot_path: string | null
    folder_id: number
    is_deleted: boolean
    created_at: string
    tags: string[]
  } | null>
  addEntry: (entry: {
    title: string
    type: 'url' | 'image'
    source_url?: string | null
    screenshot_path?: string | null
    folder_id?: number
    tagIds?: number[]
  }) => Promise<{
    id: number
    title: string
    type: 'url' | 'image'
    source_url: string | null
    screenshot_path: string | null
    folder_id: number
    is_deleted: boolean
    created_at: string
    tags: string[]
  }>
  updateEntry: (id: number, updates: {
    title?: string
    source_url?: string | null
    screenshot_path?: string | null
    folder_id?: number
    is_deleted?: boolean
  }) => Promise<{ id: number } & typeof updates>
  deleteEntry: (id: number) => Promise<{ success: boolean }>
  addFolder: (name: string) => Promise<{ id: number; name: string; parent_id: number | null }>
  addTag: (name: string) => Promise<{ id: number; name: string; color: string }>
  captureScreenshot: (url: string) => Promise<{ success: boolean; path: string | null; error?: string }>
  pickImage: () => Promise<string | null>
  openExternal: (url: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

const api: IElectronAPI = {
  getFolders: () => ipcRenderer.invoke('get-folders'),
  getTags: () => ipcRenderer.invoke('get-tags'),
  getEntries: (filters) => ipcRenderer.invoke('get-entries', filters),
  getEntry: (id) => ipcRenderer.invoke('get-entry', id),
  addEntry: (entry) => ipcRenderer.invoke('add-entry', entry),
  updateEntry: (id, updates) => ipcRenderer.invoke('update-entry', { id, updates }),
  deleteEntry: (id) => ipcRenderer.invoke('delete-entry', id),
  addFolder: (name) => ipcRenderer.invoke('add-folder', name),
  addTag: (name) => ipcRenderer.invoke('add-tag', name),
  captureScreenshot: (url) => ipcRenderer.invoke('capture-screenshot', url),
  pickImage: () => ipcRenderer.invoke('pick-image'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
}

contextBridge.exposeInMainWorld('electronAPI', api)
