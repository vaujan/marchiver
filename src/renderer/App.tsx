import React, { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import ItemList from './components/ItemList'
import DetailPane from './components/DetailPane'
import { MOCK_FOLDERS, MOCK_TAGS, MOCK_ENTRIES, MOCK_TRASHED_ENTRIES } from './lib/mock-data'


export interface Entry {
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null
  screenshot_path: string | null
  folder_id: number
  is_deleted: boolean
  created_at: string
  tags: string[]
}

export interface Folder {
  id: number
  name: string
  parent_id: number | null
  icon: string
}

export interface Tag {
  id: number
  name: string
  color: string
  icon: string
}

export interface AddEntryPayload {
  title: string
  type: 'url' | 'image'
  source_url?: string | null
  screenshot_path?: string | null
  folder_id?: number
  tagIds?: number[]
}

function App(): React.ReactElement {
  const [entries, setEntries] = useState<Entry[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [activeFolder, setActiveFolder] = useState<number | null>(null)
  const [activeTag, setActiveTag] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [trashView, setTrashView] = useState(false)
  const [useMockData, setUseMockData] = useState(true)

  const loadData = async (): Promise<void> => {
    if (useMockData) {
      let filteredEntries = trashView
        ? MOCK_TRASHED_ENTRIES
        : MOCK_ENTRIES.filter((entry) => !entry.is_deleted)

      if (activeFolder !== null) {
        filteredEntries = filteredEntries.filter((entry) => entry.folder_id === activeFolder)
      }

      if (activeTag !== null) {
        const tagName = MOCK_TAGS.find((t) => t.id === activeTag)?.name
        if (tagName) {
          filteredEntries = filteredEntries.filter((entry) => entry.tags.includes(tagName))
        }
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filteredEntries = filteredEntries.filter((entry) =>
          entry.title.toLowerCase().includes(q)
        )
      }

      setFolders(MOCK_FOLDERS)
      setTags(MOCK_TAGS)
      setEntries(filteredEntries)
      return
    }

    const [f, t, e] = await Promise.all([
      window.electronAPI.getFolders(),
      window.electronAPI.getTags(),
      window.electronAPI.getEntries({
        folderId: activeFolder ?? undefined,
        tagId: activeTag ?? undefined,
        search: searchQuery || undefined,
        trashed: trashView,
      }),
    ])
    setFolders(f.length > 0 ? f : MOCK_FOLDERS)
    setTags(t.length > 0 ? t : MOCK_TAGS)
    setEntries(e.length > 0 ? e : MOCK_ENTRIES)
  }

  useEffect(() => {
    loadData()
  }, [activeFolder, activeTag, searchQuery, trashView])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setSelectedEntry(null)
        const active = document.activeElement as HTMLElement | null
        active?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleAddEntry = async (payload: AddEntryPayload): Promise<void> => {
    const result = await window.electronAPI.addEntry(payload)
    setEntries((prev) => [result as Entry, ...prev])
  }

  const handleUpdateEntry = async (id: number, updates: Partial<Entry>): Promise<void> => {
    await window.electronAPI.updateEntry(id, updates)
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    if (selectedEntry?.id === id) {
      setSelectedEntry((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const handleDeleteEntry = async (id: number): Promise<void> => {
    await window.electronAPI.deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
  }

	const handleAddFolder = async (payload: { name: string; parent_id?: number; icon?: string }): Promise<void> => {
		try {
			const result = await window.electronAPI.addFolder(payload)
			setFolders((prev) => [...prev, result as Folder])
		} catch (error) {
			console.error('Failed to add folder:', error)
		}
	}

	const handleAddTag = async (payload: { name: string; color?: string; icon?: string }): Promise<void> => {
		try {
			const result = await window.electronAPI.addTag(payload)
			setTags((prev) => [...prev, result as Tag])
		} catch (error) {
			console.error('Failed to add tag:', error)
		}
	}

  return (
    <SidebarProvider className="h-screen w-screen">
      <Sidebar
        folders={folders}
        tags={tags}
        activeFolder={activeFolder}
        activeTag={activeTag}
        trashView={trashView}
        onSelectFolder={setActiveFolder}
        onSelectTag={setActiveTag}
        onSelectTrash={() => {
          setTrashView(true)
          setActiveFolder(null)
          setActiveTag(null)
          setSelectedEntry(null)
        }}
        onSelectAll={() => {
          setTrashView(false)
          setActiveFolder(null)
          setActiveTag(null)
          setSelectedEntry(null)
        }}
        onAddFolder={handleAddFolder}
        onAddTag={handleAddTag}
      />
      <SidebarInset className="flex flex-row h-full w-full overflow-hidden">
        <ItemList
          entries={entries}
          selectedEntry={selectedEntry}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectEntry={setSelectedEntry}
          onAddEntry={handleAddEntry}
          folders={folders}
          tags={tags}
          activeFolder={activeFolder}
          activeTag={activeTag}
          trashView={trashView}
        />
        <DetailPane
          entry={selectedEntry}
          folders={folders}
          tags={tags}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
