---
name: marchiver
description: Mark and archive things from the web — an Electron desktop app with React, TypeScript, Tailwind v4, and shadcn/ui.
---

# marchiver

Project-specific instructions and context for working on the marchiver desktop application.

## When to Use

Use this skill whenever you are asked to modify, extend, debug, or review code in the marchiver project. This skill provides the architectural context, tech stack details, and conventions needed to work effectively on this codebase.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | Electron 42 |
| Frontend | React 19, TypeScript 5.8 |
| Styling | Tailwind CSS 4.3, tw-animate-css |
| UI Components | shadcn/ui (Base UI / Radix) |
| Icons | Lucide React |
| Font | Inter Variable (via @fontsource-variable/inter) |
| Build Tool | electron-vite, Vite 5.4 |
| Package Manager | pnpm |

## Project Structure

```
marchiver/
├── src/
│   ├── main/                 # Electron main process
│   │   └── index.ts          # Window creation, IPC handlers, app lifecycle
│   ├── preload/              # Secure preload bridge
│   │   └── index.ts          # Exposes electronAPI to renderer
│   ├── renderer/             # React application
│   │   ├── App.tsx           # Root component, state management
│   │   ├── main.tsx          # React entry point
│   │   ├── index.html        # HTML template
│   │   ├── styles/
│   │   │   └── index.css     # Tailwind v4 CSS-first config, design tokens
│   │   ├── lib/
│   │   │   └── utils.ts      # cn() utility (clsx + tailwind-merge)
│   │   └── components/
│   │       ├── Sidebar.tsx   # Folder/tag navigation
│   │       ├── ItemList.tsx  # Entry list with search
│   │       └── DetailPane.tsx # Entry detail view
│   └── types/
│       └── env.d.ts          # Type declarations
├── .agents/skills/           # Installed AI skills (skills.sh)
│   ├── shadcn/
│   ├── tailwind-design-system/
│   ├── vercel-react-best-practices/
│   ├── typescript-advanced-types/
│   ├── vercel-composition-patterns/
│   ├── electron-desktop-app/
│   ├── marchiver-domain/
│   └── marchiver-screenshot/
├── electron.vite.config.ts   # electron-vite config
├── vite.config.ts            # Renderer vite config
├── components.json             # shadcn/ui configuration
├── tsconfig.json             # TypeScript config
└── package.json
```

## Architecture

### Electron Process Model
- **Main Process** (`src/main/index.ts`): Node.js environment. Manages windows, database, file system, native APIs.
- **Preload** (`src/preload/index.ts`): Secure context bridge. Exposes typed `window.electronAPI`.
- **Renderer** (`src/renderer/`): React SPA. No Node.js access. All native APIs via IPC.

### State Management
- React `useState` in `App.tsx` is the single source of truth.
- Data flows: Main (DB) → IPC → Preload → Renderer (React state).
- Mutations go through IPC handlers, then update local state.

## Key Conventions

### Path Aliases
- `@/` resolves to `src/renderer/` for renderer code.
- Used in imports: `import Sidebar from '@/components/Sidebar'`.

### Styling
- Tailwind CSS v4 with CSS-first configuration (`@theme inline`).
- Custom design tokens in `src/renderer/styles/index.css`.
- Bear-inspired minimal aesthetic: dark sidebar (`#1a1a1a`), light content, coral accent (`#e54d42`).
- OKLCH color spaces for semantic tokens.

### shadcn/ui
- Configured in `components.json` with `style: "base-rhea"`.
- Base library: `@base-ui/react` (Radix).
- Icon library: `lucide-react`.
- Components are added via `npx shadcn@latest add <component>`.

### IPC Naming
- Channels use kebab-case: `get-folders`, `add-entry`, `capture-screenshot`.
- Preload methods use camelCase: `getFolders`, `addEntry`, `captureScreenshot`.

## Data Model

### Entry
An archived item (URL or image).

```typescript
interface Entry {
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
```

### Folder
```typescript
interface Folder {
  id: number
  name: string
  parent_id: number | null
}
```

### Tag
```typescript
interface Tag {
  id: number
  name: string
  color: string
}
```

## Development Commands

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm preview  # Preview production build
```

## Design Principles

1. **Minimal & Focused**: Bear app-inspired. No unnecessary chrome. Content is king.
2. **Three-Pane Layout**: Sidebar (nav) → ItemList (browse) → DetailPane (view/edit).
3. **Keyboard-Friendly**: Support quick capture, search, and navigation.
4. **Offline-First**: All data stored locally in SQLite. No cloud dependency.
5. **Fast**: Synchronous SQLite for instant reads. Optimistic UI updates.

## Related Skills

- `shadcn` — Component management, Tailwind integration
- `tailwind-design-system` — v4 tokens, responsive patterns, accessibility
- `vercel-react-best-practices` — Performance, memoization, data fetching
- `typescript-advanced-types` — Strict typing, generics, type guards
- `vercel-composition-patterns` — Compound components, context patterns
- `electron-desktop-app` — IPC security, main/renderer separation, native APIs
- `marchiver-domain` — Data model, filtering logic, trash workflow
- `marchiver-screenshot` — Screenshot capture, image import, file storage
