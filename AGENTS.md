# AGENTS.md — marchiver

Context for AI coding agents working on the marchiver project.

## What is this project?

**marchiver** is a desktop application for marking and archiving things from the web. It's an Electron app with a React frontend, designed for offline-first bookmark and image collection with folder/tag organization.

## Quick Facts

- **Stack**: Electron 42 + React 19 + TypeScript 5.8 + Tailwind CSS 4.3 + shadcn/ui
- **Build**: electron-vite + Vite 5.4
- **Package Manager**: pnpm
- **Platform**: Cross-platform desktop (Windows, macOS, Linux)

## How to Build & Run

```bash
pnpm install
pnpm dev       # Development with hot reload
pnpm build     # Production build
pnpm preview   # Preview production build
```

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│  Electron Main Process (src/main/index.ts)              │
│  - Window management                                     │
│  - SQLite database (better-sqlite3)                      │
│  - File system (screenshots, images)                     │
│  - Screenshot capture (hidden BrowserWindow)             │
│  - Image picker (dialog.showOpenDialog)                  │
└──────────────────────┬────────────────────────────────────┘
                       │ IPC (contextBridge + ipcMain/handle)
┌──────────────────────┴────────────────────────────────────┐
│  Preload Script (src/preload/index.ts)                    │
│  - Secure bridge exposing typed `window.electronAPI`       │
└──────────────────────┬────────────────────────────────────┘
                       │
┌──────────────────────┴────────────────────────────────────┐
│  React Renderer (src/renderer/)                           │
│  - App.tsx: State container, data loading, mutations       │
│  - Sidebar.tsx: Folder/tag navigation, trash             │
│  - ItemList.tsx: Entry list, search, add buttons         │
│  - DetailPane.tsx: Entry details, preview, actions       │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── main/
│   └── index.ts          # Electron main process, IPC handlers
├── preload/
│   └── index.ts          # Context bridge, electronAPI type definitions
├── renderer/
│   ├── App.tsx           # Root React component
│   ├── main.tsx          # React DOM entry
│   ├── index.html        # HTML template
│   ├── styles/
│   │   └── index.css     # Tailwind v4 CSS, design tokens
│   ├── lib/
│   │   └── utils.ts      # cn() className utility
│   └── components/
│       ├── Sidebar.tsx   # Navigation sidebar
│       ├── ItemList.tsx  # Middle pane: entry list
│       └── DetailPane.tsx # Right pane: detail view
└── types/
    └── env.d.ts          # Global type declarations
```

## Key Conventions

### Imports
- Use `@/` alias for renderer code: `import Component from '@/components/Component'`.
- `@/` resolves to `src/renderer/`.

### Styling
- Tailwind CSS v4 with CSS-first `@theme inline` configuration.
- **Standard shadcn semantic tokens only** (`bg-primary`, `text-muted-foreground`, `bg-sidebar`, etc.).
- **No custom CSS tokens** (`--sidebar-bg`, `--accent-bear`, etc.).
- **No hardcoded hex colors** in component files.
- Dark sidebar in light mode via `className="dark"` on the `Sidebar` component.
- Font: Inter Variable.

### IPC
- **Main**: `ipcMain.handle('channel-name', async (event, args) => { ... })`.
- **Preload**: `const api = { method: (args) => ipcRenderer.invoke('channel-name', args) }`.
- **Renderer**: `await window.electronAPI.method(args)`.
- Channels are kebab-case. Preload methods are camelCase.

### Database
- SQLite via `better-sqlite3` in the main process.
- DB file: `app.getPath('userData')/marchiver.db`.
- Schema: entries, folders, tags, entry_tags (join table).

### File Storage
- Screenshots and imported images: `app.getPath('userData')/screenshots/`.
- Always ensure directory exists before writing: `fs.mkdirSync(dir, { recursive: true })`.

## Design System

- **Sidebar**: `Sidebar` component with `collapsible="none"` and `className="dark"`. Uses `bg-sidebar`, `text-sidebar-foreground`, `data-active:bg-sidebar-accent`.
- **ItemList**: `380px` fixed width. Uses `Card` (size="sm") for entry items, `Badge` (variant="secondary") for tags, `ScrollArea` for scrolling.
- **DetailPane**: Flexible width. Uses `Empty` for no-selection state, `Card` for detail layout, `Badge` for tags, `Button` for actions.
- **Accent**: `bg-primary` / `text-primary` (shadcn mist preset default). Links and active states use `text-primary`.
- **Border radius**: `0.45rem` default (`--radius`).
- **Font sizes**: 11px labels, 13px buttons/inputs, 14px body.

## Rules for Agents

1. **Security**: Never enable `nodeIntegration` in renderer. Always use `contextIsolation: true`. Expose APIs only through preload.
2. **Database**: All DB operations must be in the main process. Never import `better-sqlite3` in renderer or preload.
3. **File Paths**: Use `path.join()` and `app.getPath('userData')` for cross-platform compatibility.
4. **State**: Keep React state in `App.tsx`. IPC mutations should update local state after success.
5. **Styling**: Prefer Tailwind utility classes. Use standard shadcn semantic tokens from `index.css`.
6. **shadcn/ui**: Add components via `npx shadcn@latest add @shadcn/<component>`. Follow the project's `components.json` configuration.
7. **Error Handling**: IPC handlers should catch errors and return `{ success: false, error: string }` or throw (preload/renderer should handle).
8. **TypeScript**: Strict mode. Define explicit types for all IPC payloads and responses.
9. **UI Components**: Always use shadcn/ui components before writing custom markup. Use `@phosphor-icons/react` icons. Never hardcode colors — use semantic tokens only. Use `cn()` for conditional classes. Use `FieldGroup` + `Field` for form layout.

## Skills Reference

The following skills are installed for this project and provide detailed guidance:

| Skill | Location | Purpose |
|-------|----------|---------|
| shadcn | `.agents/skills/shadcn/` | shadcn/ui component management |
| tailwind-design-system | `.agents/skills/tailwind-design-system/` | Tailwind v4 patterns, tokens |
| vercel-react-best-practices | `.agents/skills/vercel-react-best-practices/` | React performance, best practices |
| typescript-advanced-types | `.agents/skills/typescript-advanced-types/` | Advanced TypeScript patterns |
| vercel-composition-patterns | `.agents/skills/vercel-composition-patterns/` | Component composition patterns |
| electron-desktop-app | `.agents/skills/electron-desktop-app/` | Electron architecture, IPC, security |
| marchiver-domain | `.agents/skills/marchiver-domain/` | Domain model, data relationships |
| marchiver-screenshot | `.agents/skills/marchiver-screenshot/` | Screenshot capture, image handling |
| marchiver-ui | `.agents/skills/marchiver-ui/` | UI component patterns, shadcn conventions |

## Contact / Ownership

This is a personal project. No external contributors at this time.
