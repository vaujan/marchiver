---
name: marchiver-ui
description: UI component patterns and shadcn/ui conventions for the marchiver desktop app.
---

# marchiver-ui

Guidelines for building and modifying UI components in the marchiver renderer process.

## When to Use

Whenever you are creating or modifying UI components in `src/renderer/components/`. This includes the main layout (Sidebar, ItemList, DetailPane), dialogs, forms, and any new components.

## Core Rules

### 1. Use shadcn/ui Components First

Before writing any custom markup, check if a shadcn/ui component exists for the pattern. Never build a custom styled `div` when a shadcn component is available.

| Need | Use |
|------|-----|
| Button/action | `Button` with `variant="default" \| "outline" \| "destructive" \| "ghost" \| "link"` |
| Form inputs | `Input`, `Select`, `Textarea`, `Checkbox`, `Switch` |
| Form layout | `FieldGroup` + `Field` + `FieldLabel` |
| Data display | `Card`, `Badge`, `Table` |
| Navigation | `Sidebar`, `SidebarMenu`, `SidebarMenuButton` |
| Overlays | `Dialog`, `Sheet`, `Drawer` |
| Empty state | `Empty` + `EmptyHeader` + `EmptyMedia` + `EmptyTitle` + `EmptyDescription` |
| Scrollable areas | `ScrollArea` |
| Dividers | `Separator` |
| Tags/labels | `Badge` (variant="secondary" or "outline") |

### 2. No Hardcoded Colors

Never use raw hex values like `#1a1a1a`, `#e54d42`, `#a0a0a0` in component files.

Use only shadcn semantic tokens:

| Token | Purpose |
|-------|---------|
| `bg-primary` | Primary action backgrounds, selected states |
| `text-primary` | Links, active text |
| `bg-muted` | Subtle backgrounds, empty preview areas |
| `text-muted-foreground` | Secondary text, metadata |
| `bg-sidebar` | Sidebar background |
| `text-sidebar-foreground` | Sidebar text |
| `bg-sidebar-accent` | Sidebar active item background |
| `text-sidebar-accent-foreground` | Sidebar active item text |
| `border-border` | Borders, dividers |
| `bg-destructive` / `text-destructive` | Delete/trash actions |

### 3. No Custom CSS Tokens

Do not add custom CSS variables like `--sidebar-bg`, `--accent-bear`, etc. to `index.css`.

Use only the standard shadcn token set defined in `index.css` (`--background`, `--foreground`, `--primary`, `--sidebar`, etc.).

### 4. Dark Sidebar Pattern

The marchiver sidebar uses a dark background in light mode. Achieve this by adding `className="dark"` to the `Sidebar` component:

```tsx
<Sidebar collapsible="none" className="dark">
  ...
</Sidebar>
```

This forces the sidebar to use the `.dark` CSS variable values (dark `bg-sidebar`, light `text-sidebar-foreground`) while the rest of the app remains in light mode.

### 5. Icons from lucide-react

The project uses `lucide-react` (configured in `components.json` as `iconLibrary: "lucide"`).

- Import icons as named objects: `import { Inbox, Trash2, Folder } from 'lucide-react'`
- Use the `data-icon` prop for positioning inside buttons: `data-icon="inline-start"` or `data-icon="inline-end"`
- Never add sizing classes like `size-4` or `w-4 h-4` to icons inside shadcn components — the component handles sizing via CSS

### 6. Use `cn()` for Conditional Classes

Always use `cn()` from `@/lib/utils` for conditional class merging. Never write manual template literal ternaries.

```tsx
// Correct
className={cn("flex items-center gap-2", isActive && "bg-sidebar-accent")}

// Wrong
className={`flex items-center gap-2 ${isActive ? 'bg-sidebar-accent' : ''}`}
```

### 7. Form Layout: FieldGroup + Field

All forms must use `FieldGroup` and `Field` for layout. Never use raw `div` with `gap-*` or `space-y-*` for form fields.

```tsx
<FieldGroup>
  <Field>
    <FieldLabel>Title</FieldLabel>
    <Input />
  </Field>
  <Field>
    <FieldLabel>Folder</FieldLabel>
    <Select>...</Select>
  </Field>
  <Field orientation="horizontal">
    <Checkbox id="capture" />
    <FieldLabel htmlFor="capture">Capture screenshot</FieldLabel>
  </Field>
</FieldGroup>
```

### 8. Card and Badge for List Items

Entry list items in ItemList should use `Card` (size="sm") with `CardHeader` and `CardContent`. Tags should use `Badge` with `variant="secondary"`.

```tsx
<Card size="sm" data-active={selected} className="...">
  <CardHeader>
    <div className="text-sm font-semibold truncate">{title}</div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link data-icon="inline-start" />
      <span>{type}</span>
    </div>
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
    </div>
  </CardContent>
</Card>
```

### 9. Empty State Pattern

For "no selection" or "no results" states, use the `Empty` component:

```tsx
<Empty className="h-full flex-1 border-none">
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Package />
    </EmptyMedia>
    <EmptyTitle>marchiver</EmptyTitle>
    <EmptyDescription>Select an item to view details</EmptyDescription>
  </EmptyHeader>
</Empty>
```

### 10. Button Variants

| Action | Variant |
|--------|---------|
| Primary action (Save, Open) | `variant="default"` |
| Secondary action (Cancel, Edit) | `variant="outline"` |
| Destructive action (Delete, Trash) | `variant="destructive"` |
| Navigation/link | `variant="link"` |
| Icon-only | `size="icon"` or `size="icon-sm"` |

### 11. Layout Tokens

Use semantic spacing and sizing tokens:

- `size="sm"` on `Button` and `Card` for compact items
- `size="xs"` on `Badge` for inline tags
- `gap-*` for spacing (never `space-y-*` or `space-x-*`)
- `w-[380px]` for fixed-width panes (use arbitrary values only for layout, not for styling)

### 12. Sidebar Navigation

Use the full `Sidebar` component with `collapsible="none"` for a fixed sidebar:

```tsx
<Sidebar collapsible="none" className="dark">
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Library</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={...} onClick={...}>
              <Inbox data-icon="inline-start" />
              All Items
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarSeparator />
    ...
  </SidebarContent>
</Sidebar>
```

### 13. Scroll Areas

Use `ScrollArea` for any scrollable list (folders, tags, entries, detail content). Never use `overflow-y-auto` on a raw div.

```tsx
<ScrollArea className="flex-1">
  {entries.map(entry => <Card key={entry.id}>...</Card>)}
</ScrollArea>
```

### 14. Dialogs

Use `Dialog` with `DialogTrigger` for modal actions. Use `FieldGroup` + `Field` inside the dialog content.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button size="sm">
      <Plus data-icon="inline-start" />
      Add
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Item</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    <FieldGroup>
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input />
      </Field>
    </FieldGroup>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 15. Adding New shadcn Components

If a needed component is not installed, use the CLI:

```bash
npx shadcn@latest add @shadcn/<component>
```

After adding, always read the component file to verify the API and fix any import issues.

## Anti-Patterns

These patterns are **prohibited** in the marchiver codebase:

- ❌ Hardcoded hex values (`#1a1a1a`, `#e54d42`, `#a0a0a0`)
- ❌ Custom CSS tokens (`--sidebar-bg`, `--accent-bear`)
- ❌ Raw `<button>` elements (use `Button` component)
- ❌ Raw `<input>` elements (use `Input` or `InputGroupInput`)
- ❌ Custom styled `div` for empty states (use `Empty` component)
- ❌ Manual `navItemClass` helper functions (use `SidebarMenuButton` with `isActive`)
- ❌ Custom tag pill `<button>` components (use `Badge`)
- ❌ `space-y-*` or `space-x-*` (use `flex` with `gap-*`)
- ❌ `w-10 h-10` when width and height are equal (use `size-10`)
- ❌ Manual `z-index` on overlay components (Dialog, Sheet handle their own stacking)

## Component Examples

### Sidebar (Dark on Light)

```tsx
<Sidebar collapsible="none" className="dark">
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Library</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={active} onClick={handleClick}>
              <Inbox data-icon="inline-start" />
              All Items
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarSeparator />
    <SidebarGroup>
      <SidebarGroupLabel>Folders</SidebarGroupLabel>
      <SidebarGroupContent>
        <ScrollArea className="h-[200px]">
          <SidebarMenu>
            {folders.map(folder => (
              <SidebarMenuItem key={folder.id}>
                <SidebarMenuButton isActive={activeFolder === folder.id}>
                  <Folder data-icon="inline-start" />
                  {folder.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

### Entry List Item

```tsx
<Card
  size="sm"
  data-active={selectedEntry?.id === entry.id}
  className="mb-2 cursor-pointer border-transparent data-[active=true]:border-primary data-[active=true]:bg-accent"
  onClick={() => onSelectEntry(entry)}
>
  <CardHeader>
    <div className="text-sm font-semibold truncate">{entry.title}</div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link data-icon="inline-start" />
      <span className="capitalize">{entry.type}</span>
      <span>•</span>
      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
    </div>
    {entry.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {entry.tags.map(tag => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

### Detail Pane Actions

```tsx
<div className="flex gap-2">
  <Button onClick={handleOpen}>
    <ExternalLink data-icon="inline-start" />
    Open in Browser
  </Button>
  <Button variant="outline">
    <Pencil data-icon="inline-start" />
    Edit
  </Button>
  <Button variant="destructive" onClick={handleDelete}>
    <Trash2 data-icon="inline-start" />
    Move to Trash
  </Button>
</div>
```

## See Also

- [shadcn skill](./shadcn/SKILL.md) — General shadcn/ui rules and patterns
- [tailwind-design-system skill](./tailwind-design-system/SKILL.md) — Tailwind v4 tokens and patterns
- [vercel-composition-patterns skill](./vercel-composition-patterns/SKILL.md) — React composition patterns
