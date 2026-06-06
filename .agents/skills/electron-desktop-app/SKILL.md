---
name: electron-desktop-app
description: Electron desktop app patterns for main/renderer separation, IPC security, and native APIs.
---

# electron-desktop-app

Guidelines for building secure, well-structured Electron desktop applications with React and TypeScript.

## When to Use

When working on the Electron main process, preload scripts, IPC communication, or native desktop features in the marchiver project.

## Architecture

- **Main Process** (`src/main/index.ts`): Node.js environment. Handles window management, native APIs, database, file system.
- **Preload Script** (`src/preload/index.ts`): Secure bridge between main and renderer. Uses `contextBridge.exposeInMainWorld()`.
- **Renderer Process** (`src/renderer/`): React app. No direct Node.js access. All native APIs go through IPC.

## Security Rules

1. **Always use `contextIsolation: true`** in `BrowserWindow.webPreferences`.
2. **Never enable `nodeIntegration: true`** in the renderer.
3. **Expose APIs only through preload**: Use `contextBridge.exposeInMainWorld()`.
4. **Validate all IPC inputs** on the main process before executing.
5. **Use `ipcMain.handle()` for request/response** and `ipcRenderer.invoke()` in preload.

## IPC Patterns

```typescript
// Main process: src/main/index.ts
ipcMain.handle('channel-name', async (_event, args) => {
  // Validate args
  // Execute logic
  return result
})

// Preload: src/preload/index.ts
const api = {
  channelName: (args) => ipcRenderer.invoke('channel-name', args),
}
contextBridge.exposeInMainWorld('electronAPI', api)
```

## File System & Storage

- Use `app.getPath('userData')` for app data directory.
- Store screenshots in a subdirectory: `path.join(userData, 'screenshots')`.
- Use `better-sqlite3` for local database (synchronous, fast).
- Always ensure directories exist before writing files (`fs.mkdirSync(dir, { recursive: true })`).

## Screenshot Capture

- Use `BrowserWindow` or existing window's `webContents.capturePage()`.
- Save as PNG to the screenshots directory.
- Return the file path to the renderer.

## Image Picker

- Use `dialog.showOpenDialog()` with `{ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }] }`.
- Copy selected file to app's screenshots directory for persistence.

## Database Setup

- Initialize DB on app ready: `app.whenReady().then(() => { initDatabase() })`.
- Use a separate module (e.g., `src/main/db.ts`) for all DB operations.
- Keep DB file in `userData`: `path.join(app.getPath('userData'), 'marchiver.db')`.

## Environment Detection

- Use `process.env['ELECTRON_RENDERER_URL']` to detect dev mode.
- Load URL in dev, load file in production.
- Open DevTools only in dev mode.
