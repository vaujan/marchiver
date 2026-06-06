---
name: marchiver-screenshot
description: Screenshot capture and image handling workflows for the marchiver Electron app.
---

# marchiver-screenshot

Guidelines for capturing webpage screenshots and handling image files in the marchiver desktop app.

## When to Use

When implementing screenshot capture, image import, file storage, or image display features.

## Screenshot Capture Workflow

### Capturing a URL Screenshot
1. **Create a hidden BrowserWindow**: `new BrowserWindow({ show: false, width: 1280, height: 720 })`.
2. **Load the URL**: `win.loadURL(url)`.
3. **Wait for page load**: `await win.webContents.executeJavaScript('document.readyState')` or use `did-finish-load` event.
4. **Capture page**: `const image = await win.webContents.capturePage()`.
5. **Convert to PNG**: `image.toPNG()`.
6. **Generate filename**: `screenshot-${Date.now()}.png`.
7. **Save to screenshots dir**: `path.join(app.getPath('userData'), 'screenshots', filename)`.
8. **Close window**: `win.close()`.
9. **Return path** via IPC.

```typescript
async function captureScreenshot(url: string): Promise<string | null> {
  const win = new BrowserWindow({ show: false, width: 1280, height: 720 })
  try {
    await win.loadURL(url)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Allow page to settle
    const image = await win.webContents.capturePage()
    const screenshotsDir = path.join(app.getPath('userData'), 'screenshots')
    fs.mkdirSync(screenshotsDir, { recursive: true })
    const filename = `screenshot-${Date.now()}.png`
    const filepath = path.join(screenshotsDir, filename)
    fs.writeFileSync(filepath, image.toPNG())
    return filepath
  } catch (error) {
    console.error('Screenshot failed:', error)
    return null
  } finally {
    win.close()
  }
}
```

## Image File Import

### Picking an Image File
1. Use `dialog.showOpenDialog()` with image filters.
2. Copy the selected file to `userData/screenshots/` to ensure persistence.
3. Generate a unique filename to avoid collisions: `image-${Date.now()}-${originalName}`.
4. Return the new file path.

```typescript
async function pickImage(): Promise<string | null> {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }],
  })
  if (!filePaths || filePaths.length === 0) return null
  
  const sourcePath = filePaths[0]
  const screenshotsDir = path.join(app.getPath('userData'), 'screenshots')
  fs.mkdirSync(screenshotsDir, { recursive: true })
  
  const ext = path.extname(sourcePath)
  const filename = `image-${Date.now()}${ext}`
  const destPath = path.join(screenshotsDir, filename)
  
  fs.copyFileSync(sourcePath, destPath)
  return destPath
}
```

## Image Display in Renderer

- Store absolute file paths in the database.
- In the renderer, use `file://` protocol or a custom protocol to display images.
- For Electron, absolute paths work with `<img src="file://C:/..." />` on Windows.
- Alternatively, register a custom protocol (`app.on('ready', () => { protocol.registerFileProtocol(...) })`).

## Storage Management

- Screenshots are stored in `app.getPath('userData')/screenshots/`.
- When an entry is permanently deleted, also delete its associated screenshot/image file.
- Clean up orphaned files periodically (not implemented in MVP).

## Error Handling

- Always wrap screenshot capture in try/finally to ensure the hidden window is closed.
- Handle network timeouts when loading URLs (set a reasonable timeout).
- Validate URL format before attempting to load (`new URL(url)`).
- Return `null` on failure so the UI can show "No preview available".
