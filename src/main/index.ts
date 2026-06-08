import { app, BrowserWindow, ipcMain, dialog, protocol, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import {
  initDatabase,
  getFolders,
  getTags,
  getEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  addFolder,
  addTag,
  getEntryById,
} from './db'

let mainWindow: BrowserWindow | null

const isMac = process.platform === 'darwin'

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    frame: isMac,
    ...(isMac
      ? {}
      : {
          titleBarOverlay: false,
        }),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // On macOS, hiddenInset keeps traffic lights visible inside content.
  // On Windows/Linux, frame:false gives us a completely chromeless window.

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Register custom protocol for serving local files (screenshots)
  protocol.registerFileProtocol('app', (request, callback) => {
    const urlPath = request.url.replace('app://', '')
    const filePath = path.join(app.getPath('userData'), urlPath)
    callback(filePath)
  })

  // Initialize database
  initDatabase()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC handlers
ipcMain.handle('get-folders', async () => {
  return getFolders()
})

ipcMain.handle('get-tags', async () => {
  return getTags()
})

ipcMain.handle('get-entries', async (_event, filters: { folderId?: number; tagId?: number; search?: string; trashed?: boolean }) => {
  return getEntries(filters)
})

ipcMain.handle('add-entry', async (_event, entry: { title: string; type: 'url' | 'image'; source_url?: string | null; screenshot_path?: string | null; folder_id?: number; tagIds?: number[] }) => {
  return addEntry(entry)
})

ipcMain.handle('update-entry', async (_event, { id, updates }: { id: number; updates: { title?: string; source_url?: string | null; screenshot_path?: string | null; folder_id?: number; is_deleted?: boolean } }) => {
  return updateEntry(id, updates)
})

ipcMain.handle('delete-entry', async (_event, id: number) => {
  return deleteEntry(id)
})

ipcMain.handle('add-folder', async (_event, { name, parent_id, icon }: { name: string; parent_id?: number; icon?: string }) => {
  return addFolder(name, parent_id ?? null, icon ?? 'Folder')
})

ipcMain.handle('add-tag', async (_event, { name, color, icon }: { name: string; color?: string; icon?: string }) => {
  return addTag(name, color ?? '#e54d42', icon ?? 'Hash')
})

ipcMain.handle('capture-screenshot', async (_event, url: string) => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    webPreferences: {
      offscreen: true,
    },
  })

  try {
    await win.loadURL(url)
    // Wait for page to settle
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const image = await win.webContents.capturePage()
    const screenshotsDir = path.join(app.getPath('userData'), 'screenshots')
    fs.mkdirSync(screenshotsDir, { recursive: true })

    const filename = `screenshot-${Date.now()}.png`
    const filepath = path.join(screenshotsDir, filename)
    fs.writeFileSync(filepath, image.toPNG())

    // Return app:// protocol path for renderer
    return { success: true, path: `app://screenshots/${filename}` }
  } catch (error) {
    console.error('Screenshot failed:', error)
    return { success: false, path: null, error: String(error) }
  } finally {
    win.close()
  }
})

ipcMain.handle('pick-image', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }],
  })

  if (!filePaths || filePaths.length === 0) {
    return null
  }

  const sourcePath = filePaths[0]
  const screenshotsDir = path.join(app.getPath('userData'), 'screenshots')
  fs.mkdirSync(screenshotsDir, { recursive: true })

  const ext = path.extname(sourcePath)
  const filename = `image-${Date.now()}${ext}`
  const destPath = path.join(screenshotsDir, filename)

  fs.copyFileSync(sourcePath, destPath)

  // Return app:// protocol path for renderer
  return `app://screenshots/${filename}`
})

ipcMain.handle('get-entry', async (_event, id: number) => {
  return getEntryById(id)
})

ipcMain.handle('open-external', async (_event, url: string) => {
  await shell.openExternal(url)
})

// Window controls
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('close-window', () => {
  mainWindow?.close()
})
