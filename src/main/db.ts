import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(): Database.Database {
  const userData = app.getPath('userData')
  const dbDir = userData
  const dbPath = path.join(dbDir, 'marchiver.db')

  fs.mkdirSync(dbDir, { recursive: true })

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES folders(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#e54d42'
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('url', 'image')),
      source_url TEXT,
      screenshot_path TEXT,
      folder_id INTEGER NOT NULL REFERENCES folders(id),
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entry_tags (
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (entry_id, tag_id)
    );
  `)

  // Seed default data if empty
  const folderCount = db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number }
  if (folderCount.count === 0) {
    const insertFolder = db.prepare('INSERT INTO folders (name, parent_id) VALUES (?, ?)')
    insertFolder.run('Unorganized', null)
    insertFolder.run('Inspiration', null)
    insertFolder.run('Read Later', null)
    insertFolder.run('Design', 2)
  }

  const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number }
  if (tagCount.count === 0) {
    const insertTag = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)')
    insertTag.run('design', '#e54d42')
    insertTag.run('article', '#4a90d9')
    insertTag.run('tool', '#7ed321')
    insertTag.run('reference', '#f5a623')
  }

  return db
}

// Folders
export function getFolders(): Array<{ id: number; name: string; parent_id: number | null }> {
  return getDb().prepare('SELECT id, name, parent_id FROM folders ORDER BY id').all() as Array<{
    id: number
    name: string
    parent_id: number | null
  }>
}

export function addFolder(name: string, parent_id: number | null = null): { id: number; name: string; parent_id: number | null } {
  const result = getDb().prepare('INSERT INTO folders (name, parent_id) VALUES (?, ?)').run(name, parent_id)
  return { id: Number(result.lastInsertRowid), name, parent_id }
}

// Tags
export function getTags(): Array<{ id: number; name: string; color: string }> {
  return getDb().prepare('SELECT id, name, color FROM tags ORDER BY id').all() as Array<{
    id: number
    name: string
    color: string
  }>
}

export function addTag(name: string, color: string = '#e54d42'): { id: number; name: string; color: string } {
  const result = getDb().prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color)
  return { id: Number(result.lastInsertRowid), name, color }
}

// Entries
export interface DbEntry {
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null
  screenshot_path: string | null
  folder_id: number
  is_deleted: number
  created_at: string
}

export function getEntries(filters: {
  folderId?: number
  tagId?: number
  search?: string
  trashed?: boolean
}): Array<{
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null
  screenshot_path: string | null
  folder_id: number
  is_deleted: boolean
  created_at: string
  tags: string[]
}> {
  const db = getDb()

  let query = `
    SELECT e.* FROM entries e
  `
  const conditions: string[] = []
  const params: (string | number)[] = []

  if (filters.trashed) {
    conditions.push('e.is_deleted = 1')
  } else {
    conditions.push('e.is_deleted = 0')
  }

  if (filters.folderId !== undefined) {
    conditions.push('e.folder_id = ?')
    params.push(filters.folderId)
  }

  if (filters.tagId !== undefined) {
    query += ` JOIN entry_tags et ON e.id = et.entry_id `
    conditions.push('et.tag_id = ?')
    params.push(filters.tagId)
  }

  if (filters.search) {
    conditions.push('LOWER(e.title) LIKE ?')
    params.push(`%${filters.search.toLowerCase()}%`)
  }

  query += ` WHERE ${conditions.join(' AND ')} ORDER BY e.created_at DESC `

  const rows = db.prepare(query).all(...params) as DbEntry[]

  // Resolve tags for each entry
  const tagStmt = db.prepare(`
    SELECT t.name FROM tags t
    JOIN entry_tags et ON t.id = et.tag_id
    WHERE et.entry_id = ?
    ORDER BY t.name
  `)

  return rows.map((row) => ({
    ...row,
    is_deleted: Boolean(row.is_deleted),
    tags: (tagStmt.all(row.id) as Array<{ name: string }>).map((t) => t.name),
  }))
}

export function addEntry(entry: {
  title: string
  type: 'url' | 'image'
  source_url?: string | null
  screenshot_path?: string | null
  folder_id?: number
  tagIds?: number[]
}): {
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null
  screenshot_path: string | null
  folder_id: number
  is_deleted: boolean
  created_at: string
  tags: string[]
} {
  const db = getDb()
  const result = db
    .prepare(
      `INSERT INTO entries (title, type, source_url, screenshot_path, folder_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      entry.title,
      entry.type,
      entry.source_url ?? null,
      entry.screenshot_path ?? null,
      entry.folder_id ?? 1
    )

  const id = Number(result.lastInsertRowid)

  // Insert tags
  if (entry.tagIds && entry.tagIds.length > 0) {
    const tagStmt = db.prepare('INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)')
    for (const tagId of entry.tagIds) {
      tagStmt.run(id, tagId)
    }
  }

  return getEntryById(id)!
}

export function updateEntry(
  id: number,
  updates: Partial<{
    title: string
    source_url: string | null
    screenshot_path: string | null
    folder_id: number
    is_deleted: boolean
  }>
): { id: number } & typeof updates {
  const db = getDb()
  const sets: string[] = []
  const params: (string | number | null)[] = []

  if (updates.title !== undefined) {
    sets.push('title = ?')
    params.push(updates.title)
  }
  if (updates.source_url !== undefined) {
    sets.push('source_url = ?')
    params.push(updates.source_url)
  }
  if (updates.screenshot_path !== undefined) {
    sets.push('screenshot_path = ?')
    params.push(updates.screenshot_path)
  }
  if (updates.folder_id !== undefined) {
    sets.push('folder_id = ?')
    params.push(updates.folder_id)
  }
  if (updates.is_deleted !== undefined) {
    sets.push('is_deleted = ?')
    params.push(updates.is_deleted ? 1 : 0)
  }

  if (sets.length > 0) {
    params.push(id)
    db.prepare(`UPDATE entries SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  }

  return { id, ...updates }
}

export function deleteEntry(id: number): { success: boolean } {
  const db = getDb()
  // Soft delete
  db.prepare('UPDATE entries SET is_deleted = 1 WHERE id = ?').run(id)
  return { success: true }
}

export function permanentDeleteEntry(id: number): { success: boolean } {
  const db = getDb()
  db.prepare('DELETE FROM entries WHERE id = ?').run(id)
  return { success: true }
}

export function getEntryById(id: number): {
  id: number
  title: string
  type: 'url' | 'image'
  source_url: string | null
  screenshot_path: string | null
  folder_id: number
  is_deleted: boolean
  created_at: string
  tags: string[]
} | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as DbEntry | undefined
  if (!row) return null

  const tags = (
    db
      .prepare(
        `SELECT t.name FROM tags t
         JOIN entry_tags et ON t.id = et.tag_id
         WHERE et.entry_id = ?`
      )
      .all(id) as Array<{ name: string }>
  ).map((t) => t.name)

  return {
    ...row,
    is_deleted: Boolean(row.is_deleted),
    tags,
  }
}
