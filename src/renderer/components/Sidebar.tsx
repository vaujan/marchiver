import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Inbox, Trash2, Folder, Tag } from 'lucide-react'
import type { Folder, Tag as TagType } from '../App'

interface SidebarProps {
  folders: Folder[]
  tags: TagType[]
  activeFolder: number | null
  activeTag: number | null
  trashView: boolean
  onSelectFolder: (id: number | null) => void
  onSelectTag: (id: number | null) => void
  onSelectTrash: () => void
  onSelectAll: () => void
  onAddFolder: (name: string) => void
  onAddTag: (name: string) => void
}

const SidebarComponent: React.FC<SidebarProps> = ({
  folders,
  tags,
  activeFolder,
  activeTag,
  trashView,
  onSelectFolder,
  onSelectTag,
  onSelectTrash,
  onSelectAll,
}) => {
  const rootFolders = folders.filter((f) => f.parent_id === null)

  return (
    <Sidebar
      collapsible="none"
      className="dark"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={!activeFolder && !activeTag && !trashView}
                  onClick={onSelectAll}
                >
                  <Inbox data-icon="inline-start" />
                  All Items
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={trashView}
                  onClick={onSelectTrash}
                >
                  <Trash2 data-icon="inline-start" />
                  Trash
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
                {rootFolders.map((folder) => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      isActive={activeFolder === folder.id}
                      onClick={() => {
                        onSelectFolder(folder.id)
                        onSelectTag(null)
                      }}
                    >
                      <Folder data-icon="inline-start" />
                      {folder.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[200px]">
              <SidebarMenu>
                {tags.map((tag) => (
                  <SidebarMenuItem key={tag.id}>
                    <SidebarMenuButton
                      isActive={activeTag === tag.id}
                      onClick={() => {
                        onSelectTag(tag.id)
                        onSelectFolder(null)
                      }}
                    >
                      <Tag data-icon="inline-start" style={{ color: tag.color }} />
                      {tag.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default SidebarComponent
