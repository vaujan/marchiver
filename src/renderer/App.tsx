import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import Sidebar from './components/Sidebar'
import ChannelView from './components/ChannelView'
import TitleBar from './components/TitleBar'
import SettingsDialog from './components/SettingsDialog'
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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

  // Sync dark class to documentElement so portal-rendered dialogs/dropdowns inherit the theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Font state
  const [fontFamily, setFontFamily] = useState(() => {
    try {
      return window.localStorage.getItem('marchiver-font') || 'inter'
    } catch {
      return 'inter'
    }
  })

  const FONT_CSS: Record<string, string> = {
    inter: '"Inter Variable", "Inter", sans-serif',
    system: 'system-ui, sans-serif',
    arial: 'Arial, sans-serif',
    helvetica: 'Helvetica, sans-serif',
    segoe: '"Segoe UI", sans-serif',
  }

  const handleFontChange = useCallback((font: string) => {
    setFontFamily(font)
    try {
      window.localStorage.setItem('marchiver-font', font)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const css = FONT_CSS[fontFamily] || FONT_CSS.inter
    document.documentElement.style.setProperty('--font-sans', css)
  }, [fontFamily])

  // Color scheme state
  const [colorScheme, setColorScheme] = useState(() => {
    try {
      return window.localStorage.getItem('marchiver-color') || 'default'
    } catch {
      return 'default'
    }
  })

  const COLOR_CSS: Record<string, Record<string, string>> = {
    default: {
      '--primary': 'oklch(0.58 0.12 25)',
      '--ring': 'oklch(0.58 0.12 25)',
      '--chart-1': 'oklch(0.58 0.12 25)',
      '--chart-2': 'oklch(0.55 0 0)',
      '--chart-3': 'oklch(0.45 0 0)',
      '--chart-4': 'oklch(0.35 0 0)',
      '--chart-5': 'oklch(0.25 0 0)',
      '--sidebar-primary': 'oklch(0.58 0.12 25)',
      '--sidebar-ring': 'oklch(0.58 0.12 25)',
    },
    orange: {
      '--primary': 'oklch(0.65 0.15 50)',
      '--ring': 'oklch(0.65 0.15 50)',
      '--chart-1': 'oklch(0.65 0.15 50)',
      '--chart-2': 'oklch(0.6 0.12 50)',
      '--chart-3': 'oklch(0.5 0.1 50)',
      '--chart-4': 'oklch(0.4 0.08 50)',
      '--chart-5': 'oklch(0.3 0.06 50)',
      '--sidebar-primary': 'oklch(0.65 0.15 50)',
      '--sidebar-ring': 'oklch(0.65 0.15 50)',
    },
    yellow: {
      '--primary': 'oklch(0.7 0.14 85)',
      '--ring': 'oklch(0.7 0.14 85)',
      '--chart-1': 'oklch(0.7 0.14 85)',
      '--chart-2': 'oklch(0.6 0.12 85)',
      '--chart-3': 'oklch(0.5 0.1 85)',
      '--chart-4': 'oklch(0.4 0.08 85)',
      '--chart-5': 'oklch(0.3 0.06 85)',
      '--sidebar-primary': 'oklch(0.7 0.14 85)',
      '--sidebar-ring': 'oklch(0.7 0.14 85)',
    },
    green: {
      '--primary': 'oklch(0.55 0.15 155)',
      '--ring': 'oklch(0.55 0.15 155)',
      '--chart-1': 'oklch(0.55 0.15 155)',
      '--chart-2': 'oklch(0.5 0.12 155)',
      '--chart-3': 'oklch(0.4 0.1 155)',
      '--chart-4': 'oklch(0.35 0.08 155)',
      '--chart-5': 'oklch(0.25 0.06 155)',
      '--sidebar-primary': 'oklch(0.55 0.15 155)',
      '--sidebar-ring': 'oklch(0.55 0.15 155)',
    },
    blue: {
      '--primary': 'oklch(0.55 0.15 250)',
      '--ring': 'oklch(0.55 0.15 250)',
      '--chart-1': 'oklch(0.55 0.15 250)',
      '--chart-2': 'oklch(0.5 0.12 250)',
      '--chart-3': 'oklch(0.4 0.1 250)',
      '--chart-4': 'oklch(0.35 0.08 250)',
      '--chart-5': 'oklch(0.25 0.06 250)',
      '--sidebar-primary': 'oklch(0.55 0.15 250)',
      '--sidebar-ring': 'oklch(0.55 0.15 250)',
    },
    purple: {
      '--primary': 'oklch(0.5 0.15 300)',
      '--ring': 'oklch(0.5 0.15 300)',
      '--chart-1': 'oklch(0.5 0.15 300)',
      '--chart-2': 'oklch(0.45 0.12 300)',
      '--chart-3': 'oklch(0.4 0.1 300)',
      '--chart-4': 'oklch(0.35 0.08 300)',
      '--chart-5': 'oklch(0.25 0.06 300)',
      '--sidebar-primary': 'oklch(0.5 0.15 300)',
      '--sidebar-ring': 'oklch(0.5 0.15 300)',
    },
  }

  const handleColorChange = useCallback((color: string) => {
    setColorScheme(color)
    try {
      window.localStorage.setItem('marchiver-color', color)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const vars = COLOR_CSS[colorScheme] || COLOR_CSS.default
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value)
    }
  }, [colorScheme])

  const sortEntries = useCallback((list: Entry[], order: typeof sortOrder): Entry[] => {
    return [...list].sort((a, b) => {
      if (order === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (order === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (order === 'alphabetical') return a.title.localeCompare(b.title)
      if (order === 'type') return a.type.localeCompare(b.type)
      return 0
    })
  }, [])

  // Dialog state
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  const handleUpdateEntry = async (id: number, updates: Partial<Entry>, tagIds?: number[]): Promise<void> => {
    await window.electronAPI.updateEntry(id, updates, tagIds)
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
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        fontFamily={fontFamily}
        onFontChange={handleFontChange}
        colorScheme={colorScheme}
        onColorChange={handleColorChange}
      />
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
        <SidebarInset className="flex flex-col h-full w-full overflow-hidden">
          <TitleBar
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSettingsOpen={() => setSettingsOpen(true)}
          />
          <ChannelView
            entries={entries}
            selectedEntry={selectedEntry}
            folders={folders}
            tags={tags}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectEntry={setSelectedEntry}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            activeFolder={activeFolder}
            activeTag={activeTag}
            trashView={trashView}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeTagFilters={activeTagFilters}
            onActiveTagFiltersChange={setActiveTagFilters}
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
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default App
