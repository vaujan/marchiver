import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import ItemList from './components/ItemList'
import DetailPane from './components/DetailPane'
import TitleBar from './components/TitleBar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
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

  // Toolbar states
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical' | 'type'>('newest')
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded')
  const [activeTagFilters, setActiveTagFilters] = useState<number[]>([])

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    try {
      return window.localStorage.getItem('marchiver-theme') === 'dark'
    } catch {
      return false
    }
  })

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem('marchiver-theme', next ? 'dark' : 'light')
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const sortEntries = useCallback((list: Entry[], order: typeof sortOrder): Entry[] => {
    return [...list].sort((a, b) => {
      if (order === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (order === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (order === 'alphabetical') return a.title.localeCompare(b.title)
      if (order === 'type') return a.type.localeCompare(b.type)
      return 0
    })
  }, [])

  // Dialog state (lifted from ItemList for menu bar access)
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const loadData = async (): Promise<void> => {
    if (useMockData) {
      let filteredEntries = trashView
        ? MOCK_TRASHED_ENTRIES
        : MOCK_ENTRIES.filter((entry) => !entry.is_deleted)

      if (activeFolder !== null) {
        const getDescendantIds = (parentId: number): number[] => {
          const ids: number[] = [parentId]
          for (const f of folders) {
            if (f.parent_id === parentId) {
              ids.push(...getDescendantIds(f.id))
            }
          }
          return ids
        }
        const folderIds = getDescendantIds(activeFolder)
        filteredEntries = filteredEntries.filter((entry) => folderIds.includes(entry.folder_id))
      }

      if (activeTag !== null) {
        const tagName = MOCK_TAGS.find((t) => t.id === activeTag)?.name
        if (tagName) {
          filteredEntries = filteredEntries.filter((entry) => entry.tags.includes(tagName))
        }
      }

      // Multi-tag filter (AND logic)
      if (activeTagFilters.length > 0) {
        const filterTagNames = activeTagFilters
          .map((id) => MOCK_TAGS.find((t) => t.id === id)?.name)
          .filter(Boolean) as string[]
        filteredEntries = filteredEntries.filter((entry) =>
          filterTagNames.every((name) => entry.tags.includes(name))
        )
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filteredEntries = filteredEntries.filter(
          (entry) =>
            entry.title.toLowerCase().includes(q) ||
            (entry.source_url?.toLowerCase().includes(q) ?? false) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      }

      // Sort
      filteredEntries = sortEntries(filteredEntries, sortOrder)

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
    let realEntries = e.length > 0 ? e : MOCK_ENTRIES
    const realTags = t.length > 0 ? t : MOCK_TAGS

    // Multi-tag filter (AND logic) for real data
    if (activeTagFilters.length > 0) {
      const filterTagNames = activeTagFilters
        .map((id) => realTags.find((t) => t.id === id)?.name)
        .filter(Boolean) as string[]
      realEntries = realEntries.filter((entry) =>
        filterTagNames.every((name) => entry.tags.includes(name))
      )
    }

    // Sort
    realEntries = sortEntries(realEntries, sortOrder)

    setFolders(f.length > 0 ? f : MOCK_FOLDERS)
    setTags(realTags)
    setEntries(realEntries)
  }

  useEffect(() => {
    loadData()
  }, [activeFolder, activeTag, searchQuery, trashView, sortOrder, activeTagFilters])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setSelectedEntry(null)
        const active = document.activeElement as HTMLElement | null
        active?.blur()
        return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault()
        setUrlDialogOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const lastDeletedEntry = useRef<Entry | null>(null)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const handleAddEntry = async (payload: AddEntryPayload): Promise<void> => {
    const result = await window.electronAPI.addEntry(payload)
    setEntries((prev) => [result as Entry, ...prev])
    toast.success(`Saved "${result.title}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          window.electronAPI.deleteEntry(result.id).then(() => {
            setEntries((prev) => prev.filter((e) => e.id !== result.id))
            if (selectedEntry?.id === result.id) setSelectedEntry(null)
          })
        },
      },
    })
  }

  const handleUpdateEntry = async (id: number, updates: Partial<Entry>): Promise<void> => {
    await window.electronAPI.updateEntry(id, updates)
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    if (selectedEntry?.id === id) {
      setSelectedEntry((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const handleEditEntry = (entry: Entry): void => {
    setEditingEntry(entry)
  }

  const handleEditEntryClose = (): void => {
    setEditingEntry(null)
  }

  const handleDeleteEntry = async (id: number): Promise<void> => {
    const entry = entries.find((e) => e.id === id) ?? null
    lastDeletedEntry.current = entry
    await window.electronAPI.deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
    toast.success(entry ? `Moved "${entry.title}" to trash` : 'Moved to trash', {
      action: {
        label: 'Undo',
        onClick: () => {
          window.electronAPI.restoreEntry(id).then(() => {
            loadData()
            if (entry) setSelectedEntry(entry)
          })
        },
      },
    })
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
    <div className={cn("h-screen w-screen flex flex-col overflow-hidden bg-background", isDark && "dark")}>
      <Toaster position="bottom-right" />
      <SidebarProvider className="flex-1 w-full min-h-0">
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
            onUpdateEntry={handleUpdateEntry}
            onAddTag={handleAddTag}
            folders={folders}
            tags={tags}
            activeFolder={activeFolder}
            activeTag={activeTag}
            trashView={trashView}
            urlDialogOpen={urlDialogOpen}
            onUrlDialogOpenChange={setUrlDialogOpen}
            imageDialogOpen={imageDialogOpen}
            onImageDialogOpenChange={setImageDialogOpen}
            editEntry={editingEntry}
            onEditEntryClose={handleEditEntryClose}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeTagFilters={activeTagFilters}
            onActiveTagFiltersChange={setActiveTagFilters}
          />
          <div className="flex-1 flex flex-col min-h-0">
            <TitleBar
              isDark={isDark}
              onToggleTheme={toggleTheme}
              trashView={trashView}
              activeFolder={activeFolder}
              activeTag={activeTag}
              selectedEntry={selectedEntry}
              folders={folders}
              tags={tags}
              onNavigateToAll={() => {
                setTrashView(false)
                setActiveFolder(null)
                setActiveTag(null)
                setSelectedEntry(null)
              }}
              onNavigateToFolder={(folderId) => {
                setTrashView(false)
                setActiveFolder(folderId)
                setActiveTag(null)
                setSelectedEntry(null)
              }}
            />
            <DetailPane
              entry={selectedEntry}
              folders={folders}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={handleEditEntry}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App
