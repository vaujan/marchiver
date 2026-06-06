---
name: marchiver-domain
description: Domain knowledge for the marchiver app — data model, folder/tag/entry relationships, and archiver workflows.
---

# marchiver-domain

Domain-specific rules and data model for the marchiver bookmark and image archiver application.

## When to Use

When implementing or modifying features related to entries, folders, tags, search, filtering, trash, or the core archiving workflow.

## Data Model

### Entry
An item archived by the user. Can be a URL or an image.

```typescript
interface Entry {
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null      // For URLs: the web link. For images: null.
  screenshot_path: string | null  // Path to captured screenshot or copied image file.
  folder_id: number
  is_deleted: boolean             // Soft delete (moved to trash).
  created_at: string              // ISO 8601 timestamp.
  tags: string[]                   // Tag names (not IDs), for quick display.
}
```

### Folder
Organizational container for entries.

```typescript
interface Folder {
  id: number
  name: string
  parent_id: number | null        // Supports nested folders.
}
```

### Tag
Label for categorizing entries.

```typescript
interface Tag {
  id: number
  name: string
  color: string                   // Hex color code.
}
```

## Core Workflows

### Filtering Entries
When fetching entries, apply filters in this order:
1. **Trash view**: If `trashed: true`, return only `is_deleted = true`.
2. **Folder filter**: If `folderId` is set, return entries in that folder (and not deleted).
3. **Tag filter**: If `tagId` is set, return entries with that tag (and not deleted).
4. **Search**: If `search` is set, filter by title substring (case-insensitive).
5. **Default (All Items)**: Return all non-deleted entries.

### Soft Delete (Trash)
- Deleting an entry sets `is_deleted = true` (does not remove from DB).
- Trash view shows only deleted entries.
- Entries in trash can be permanently deleted or restored.

### Adding an Entry
1. User provides title, type, and optional URL.
2. If type is `url` and URL is provided, optionally capture a screenshot.
3. Save screenshot/image to `userData/screenshots/`.
4. Store the relative or absolute path in `screenshot_path`.
5. Assign to a folder (default: Unorganized, `folder_id = 1`).
6. Assign tags.

### Tag Assignment
- Tags are stored in a join table: `entry_tags(entry_id, tag_id)`.
- When returning entries, resolve tag names from the join table.

## UI Patterns

- **Sidebar**: Shows Library (All Items, Trash), Folders (hierarchical), Tags.
- **ItemList**: Middle pane showing filtered entries. Search bar at top. Add URL/Image buttons.
- **DetailPane**: Right pane showing selected entry details, screenshot preview, metadata, actions (Open, Edit, Trash).
- **Selection**: Only one entry can be selected at a time for detail view.

## State Management

- React state in `App.tsx` is the source of truth for UI state.
- All data mutations go through IPC to the main process, then update local state optimistically or after confirmation.
- Load data on mount and when filter criteria change (`activeFolder`, `activeTag`, `searchQuery`, `trashView`).

## Design System Context

- Bear-inspired minimal UI: dark sidebar (`#1a1a1a`), light content panes.
- Accent color: `#e54d42` (coral red) for active states, buttons, links.
- Font: Inter Variable, system sans-serif fallback.
- Tailwind CSS v4 with CSS-first `@theme inline` configuration.
