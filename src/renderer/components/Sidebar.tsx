import React, { useState, useMemo } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { Folder, Tag } from "../App";

import {
	Tray,
	Trash,
	Folder as FolderIcon,
	Hash,
	Heart,
	Star,
	Bookmark,
	Lightbulb,
	Briefcase,
	Code,
	PaintBrush,
	Palette,
	Article,
	User,
	Users,
	Airplane,
	House,
	Camera,
	Note,
	FileText,
	Globe,
	Link,
	Wrench,
	Gear,
	Bell,
	Calendar,
	MapPin,
	NotePencil,
	Pencil,
	Phone,
	Rocket,
	Shield,
	Sparkle,
	Trophy,
	Umbrella,
	Video,
	GraduationCap,
	BookBookmark,
	Layout,
	Gauge,
	Wind,
	Atom,
	FileTs,
	Lightning,
	PaintBucket,
	MagnifyingGlass,
	CaretRight,
	CaretDown,
} from "@phosphor-icons/react";

interface SidebarProps {
	folders: Folder[];
	tags: Tag[];
	activeFolder: number | null;
	activeTag: number | null;
	trashView: boolean;
	onSelectFolder: (id: number | null) => void;
	onSelectTag: (id: number | null) => void;
	onSelectTrash: () => void;
	onSelectAll: () => void;
	onAddFolder: (payload: {
		name: string;
		parent_id?: number;
		icon?: string;
	}) => void;
	onAddTag: (payload: { name: string; color?: string; icon?: string }) => void;
}

// Static icon lookup for user-chosen icons
const ICON_MAP: Record<string, React.ElementType> = {
	Tray,
	Trash,
	Folder: FolderIcon,
	Hash,
	Heart,
	Star,
	Bookmark,
	Lightbulb,
	Briefcase,
	Code,
	PaintBrush,
	Palette,
	Article,
	User,
	Users,
	Airplane,
	House,
	Camera,
	Note,
	FileText,
	Globe,
	Link,
	Wrench,
	Gear,
	Bell,
	Calendar,
	MapPin,
	NotePencil,
	Pencil,
	Phone,
	Rocket,
	Shield,
	Sparkle,
	Trophy,
	Umbrella,
	Video,
	GraduationCap,
	BookBookmark,
	Layout,
	Gauge,
	Wind,
	Atom,
	FileTs,
	Lightning,
	PaintBucket,
	MagnifyingGlass,
	CaretRight,
	CaretDown,
};

const AVAILABLE_ICONS = [
	"Folder",
	"Tray",
	"Heart",
	"Star",
	"Bookmark",
	"Lightbulb",
	"Briefcase",
	"Code",
	"PaintBrush",
	"Palette",
	"Article",
	"User",
	"Users",
	"Airplane",
	"House",
	"Camera",
	"Note",
	"FileText",
	"Globe",
	"Link",
	"Wrench",
	"Gear",
	"Bell",
	"Calendar",
	"MapPin",
	"NotePencil",
	"Pencil",
	"Phone",
	"Rocket",
	"Shield",
	"Sparkle",
	"Trophy",
	"Umbrella",
	"Video",
	"GraduationCap",
	"BookBookmark",
	"Layout",
	"Gauge",
	"Wind",
	"Atom",
	"FileTs",
	"Lightning",
	"PaintBucket",
	"Hash",
	"Trash",
];

function DynamicIcon({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	const Icon = ICON_MAP[name] || FolderIcon;
	return <Icon className={className} />;
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
	onAddFolder,
	onAddTag,
}) => {
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

	const [folderDialogOpen, setFolderDialogOpen] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [folderParentId, setFolderParentId] = useState<string>("");
	const [folderIcon, setFolderIcon] = useState("Folder");

	const [tagDialogOpen, setTagDialogOpen] = useState(false);
	const [tagName, setTagName] = useState("");
	const [tagIcon, setTagIcon] = useState("Hash");

	const toggleExpand = (id: number) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const rootFolders = useMemo(
		() => folders.filter((f) => f.parent_id === null),
		[folders],
	);

	const getChildren = (parentId: number) =>
		folders.filter((f) => f.parent_id === parentId);

	const handleAddFolder = () => {
		if (!folderName.trim()) return;
		onAddFolder({
			name: folderName.trim(),
			parent_id: folderParentId ? Number(folderParentId) : undefined,
			icon: folderIcon,
		});
		setFolderName("");
		setFolderParentId("");
		setFolderIcon("Folder");
		setFolderDialogOpen(false);
	};

	const handleAddTag = () => {
		if (!tagName.trim()) return;
		onAddTag({
			name: tagName.trim(),
			icon: tagIcon,
		});
		setTagName("");
		setTagIcon("Hash");
		setTagDialogOpen(false);
	};

	const isActive = (id: number) => activeFolder === id;

	const renderFolderTree = (folder: Folder, depth: number) => {
		const children = getChildren(folder.id);
		const hasChildren = children.length > 0;
		const isExpanded = expandedIds.has(folder.id);

		return (
			<React.Fragment key={folder.id}>
				<SidebarMenuItem className="py-0">
					<SidebarMenuButton
						isActive={isActive(folder.id)}
						onClick={() => {
							onSelectFolder(folder.id);
							onSelectTag(null);
						}}
						className={cn(
							"group py-0.5",
							depth === 0 && "px-3",
							depth === 1 && "pl-7 pr-3",
						)}
					>
						<div className="flex items-center gap-2 w-full">
							{hasChildren ? (
								<button
									onClick={(e) => {
										e.stopPropagation();
										toggleExpand(folder.id);
									}}
									className="shrink-0 size-5 flex items-center justify-center rounded hover:bg-sidebar-accent"
								>
									{isExpanded ? (
										<CaretDown className="size-3.5 text-sidebar-foreground/70" />
									) : (
										<CaretRight className="size-3.5 text-sidebar-foreground/70" />
									)}
								</button>
							) : depth > 0 ? (
								<span className="size-5 shrink-0" />
							) : null}
							<DynamicIcon
								name={folder.icon}
								className="size-4 text-sidebar-foreground/80"
							/>
							<span className="truncate">{folder.name}</span>
						</div>
					</SidebarMenuButton>
				</SidebarMenuItem>
				{hasChildren && isExpanded && depth === 0 && (
					<>{children.map((child) => renderFolderTree(child, depth + 1))}</>
				)}
			</React.Fragment>
		);
	};

	const IconPicker = ({
		value,
		onChange,
	}: {
		value: string;
		onChange: (icon: string) => void;
	}) => (
		<div className="grid grid-cols-6 gap-2">
			{AVAILABLE_ICONS.map((iconName) => {
				const Icon = ICON_MAP[iconName] || FolderIcon;
				const isSelected = value === iconName;
				return (
					<button
						key={iconName}
						type="button"
						onClick={() => onChange(iconName)}
						className={cn(
							"flex items-center justify-center rounded-md p-2 transition-colors hover:bg-accent",
							isSelected &&
								"bg-primary text-primary-foreground ring-2 ring-primary",
						)}
						title={iconName}
					>
						<Icon className="size-5" />
					</button>
				);
			})}
		</div>
	);

	return (
		<Sidebar collapsible="none" className="dark">
			<SidebarContent className="overflow-x-hidden">
				<ScrollArea className="flex-1 h-full overflow-x-hidden p-3">
					<SidebarMenu className="gap-0">
						{/* All Items */}
						<SidebarMenuItem className="py-0">
							<SidebarMenuButton
								isActive={!activeFolder && !activeTag && !trashView}
								onClick={onSelectAll}
								className="py-0.5 px-3"
							>
								<Tray data-icon="inline-start" />
								All Items
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* Trash */}
						<SidebarMenuItem className="py-0">
							<SidebarMenuButton
								isActive={trashView}
								onClick={onSelectTrash}
								className="py-0.5 px-3"
							>
								<Trash data-icon="inline-start" />
								Trash
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarSeparator className="my-1 bg-sidebar-border/50" />

						{/* Folders */}
						{rootFolders.map((folder) => renderFolderTree(folder, 0))}

						<SidebarSeparator className="my-1 bg-sidebar-border/50" />

						{/* Tags */}
						{tags.map((tag) => (
							<SidebarMenuItem key={tag.id} className="py-0">
								<SidebarMenuButton
									isActive={activeTag === tag.id}
									onClick={() => {
										onSelectTag(tag.id);
										onSelectFolder(null);
									}}
									className="py-0.5 px-3"
								>
									<DynamicIcon
										name={tag.icon}
										className="size-4 text-sidebar-foreground/80"
									/>
									{tag.name}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</ScrollArea>
			</SidebarContent>

			{/* New Folder Dialog */}
			<Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>New Folder</DialogTitle>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel>Name</FieldLabel>
							<Input
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								placeholder="Folder name"
								autoFocus
							/>
						</Field>
						<Field>
							<FieldLabel>Parent (optional)</FieldLabel>
							<Select
								value={folderParentId}
								onValueChange={(val) => setFolderParentId(val ?? "")}
							>
								<SelectTrigger>
									<SelectValue placeholder="No parent" />
								</SelectTrigger>
									<SelectContent>
										<SelectItem value="">No parent</SelectItem>
										{folders
											.filter((folder) => folder.parent_id === null)
											.map((folder) => (
												<SelectItem key={folder.id} value={String(folder.id)}>
													{folder.name}
												</SelectItem>
											))}
									</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel>Icon</FieldLabel>
							<IconPicker value={folderIcon} onChange={setFolderIcon} />
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setFolderDialogOpen(false);
								setFolderName("");
								setFolderParentId("");
								setFolderIcon("Folder");
							}}
						>
							Cancel
						</Button>
						<Button disabled={!folderName.trim()} onClick={handleAddFolder}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* New Tag Dialog */}
			<Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>New Tag</DialogTitle>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel>Name</FieldLabel>
							<Input
								value={tagName}
								onChange={(e) => setTagName(e.target.value)}
								placeholder="Tag name"
								autoFocus
							/>
						</Field>
						<Field>
							<FieldLabel>Icon</FieldLabel>
							<IconPicker value={tagIcon} onChange={setTagIcon} />
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setTagDialogOpen(false);
								setTagName("");
								setTagIcon("Hash");
							}}
						>
							Cancel
						</Button>
						<Button disabled={!tagName.trim()} onClick={handleAddTag}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Sidebar>
	);
};

export default SidebarComponent;
