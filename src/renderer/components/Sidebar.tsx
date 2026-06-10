import React, { useState, useMemo, useRef, useEffect } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
	Plus,
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

const POPULAR_ICONS = [
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
	return <Icon className={className} weight="duotone" />;
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
	const [isAddingFolder, setIsAddingFolder] = useState(false);
	const [isAddingTag, setIsAddingTag] = useState(false);

	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderIcon, setNewFolderIcon] = useState("Folder");
	const [showFolderIconPicker, setShowFolderIconPicker] = useState(false);
	const [newTagName, setNewTagName] = useState("");

	const folderInputRef = useRef<HTMLInputElement>(null);
	const iconPickerRef = useRef<HTMLDivElement>(null);

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
		if (!newFolderName.trim()) return;
		onAddFolder({
			name: newFolderName.trim(),
			icon: newFolderIcon,
		});
		setNewFolderName("");
		setNewFolderIcon("Folder");
		setShowFolderIconPicker(false);
		setIsAddingFolder(false);
	};

	const handleAddTag = () => {
		if (!newTagName.trim()) return;
		onAddTag({
			name: newTagName.trim(),
			icon: "Hash",
		});
		setNewTagName("");
		setIsAddingTag(false);
	};

	const isActive = (id: number) => activeFolder === id;

	// Auto-focus folder input when triggered
	useEffect(() => {
		if (isAddingFolder) {
			folderInputRef.current?.focus();
		}
	}, [isAddingFolder]);

	// Close icon picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				showFolderIconPicker &&
				iconPickerRef.current &&
				!iconPickerRef.current.contains(e.target as Node) &&
				!folderInputRef.current?.contains(e.target as Node)
			) {
				setShowFolderIconPicker(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showFolderIconPicker]);

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
							if (hasChildren && !isExpanded) {
								toggleExpand(folder.id);
							}
						}}
						className={cn(
							"group py-0.5 focus-visible:ring-0",
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
										<CaretDown
											className="size-3.5 text-sidebar-foreground/50"
										/>
									) : (
										<CaretRight
											className="size-3.5 text-sidebar-foreground/50"
										/>
									)}
								</button>
							) : depth > 0 ? (
								<span className="size-5 shrink-0" />
							) : null}
							<DynamicIcon
								name={folder.icon}
								className="size-4 text-sidebar-foreground/50"
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

	return (
		<Sidebar collapsible="none" className="dark">
			<SidebarContent className="overflow-x-hidden">
				<ScrollArea className="flex-1 h-full overflow-x-hidden px-3 py-2">
					<SidebarMenu className="gap-0">
						{/* All Items */}
						<SidebarMenuItem className="py-0">
							<SidebarMenuButton
								isActive={!activeFolder && !activeTag && !trashView}
								onClick={onSelectAll}
								className="py-0.5 px-3 focus-visible:ring-0"
							>
								<Tray
									className="size-4 text-sidebar-foreground/50"
									weight="duotone"
								/>
								All Items
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* Trash */}
						<SidebarMenuItem className="py-0">
							<SidebarMenuButton
								isActive={trashView}
								onClick={onSelectTrash}
								className="py-0.5 px-3 focus-visible:ring-0"
							>
								<Trash
									className="size-4 text-sidebar-foreground/50"
									weight="duotone"
								/>
								Trash
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* Folders Section */}
						<div className="px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-sidebar-foreground/40">
							Folders
						</div>
						{rootFolders.map((folder) => renderFolderTree(folder, 0))}

						{/* Folder Creation Trigger */}
						<SidebarMenuItem className="py-0 mt-1">
							{isAddingFolder ? (
								<div className="relative">
									<div className="flex items-center gap-2 bg-sidebar-accent/50 py-1 px-3">
										<button
											type="button"
											onMouseDown={(e) => e.preventDefault()}
											onClick={() => setShowFolderIconPicker((prev) => !prev)}
											className="shrink-0 flex items-center justify-center rounded hover:bg-sidebar-accent"
										>
											<DynamicIcon
												name={newFolderIcon}
												className="size-4 text-sidebar-foreground/50"
											/>
										</button>
										<Input
											ref={folderInputRef}
											value={newFolderName}
											onChange={(e) => setNewFolderName(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													handleAddFolder();
												}
												if (e.key === "Escape") {
													setIsAddingFolder(false);
													setNewFolderName("");
													setNewFolderIcon("Folder");
													setShowFolderIconPicker(false);
												}
											}}
											onBlur={() => {
												if (newFolderName.trim()) {
													handleAddFolder();
												} else {
													setIsAddingFolder(false);
												}
											}}
											placeholder="Folder name..."
											className="h-6 border-0 bg-transparent p-0 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
										/>
									</div>

									{showFolderIconPicker && (
										<div
											ref={iconPickerRef}
											className="absolute z-50 mt-1 left-3 right-3 bg-sidebar border border-sidebar-border rounded-md p-2 shadow-lg"
										>
											<div className="grid grid-cols-5 gap-1">
												{POPULAR_ICONS.map((iconName) => {
													const Icon = ICON_MAP[iconName] || FolderIcon;
													const isSelected = newFolderIcon === iconName;
													return (
														<button
															key={iconName}
															type="button"
															onMouseDown={(e) => e.preventDefault()}
															onClick={() => {
																setNewFolderIcon(iconName);
																setShowFolderIconPicker(false);
																folderInputRef.current?.focus();
															}}
															className={cn(
																"flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-sidebar-accent",
																isSelected &&
																	"bg-primary text-primary-foreground",
															)}
															title={iconName}
														>
															<Icon className="size-4" weight="duotone" />
														</button>
													);
												})}
											</div>
										</div>
									)}
								</div>
							) : (
								<SidebarMenuButton
									onClick={() => setIsAddingFolder(true)}
									className="py-0.5 px-3 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm transition-colors focus-visible:ring-0"
								>
									<Plus className="size-4" />
									New folder
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>

						{/* Tags Section */}
						<div className="px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-sidebar-foreground/40">
							Tags
						</div>
						{tags.map((tag) => (
							<SidebarMenuItem key={tag.id} className="py-0">
								<SidebarMenuButton
									isActive={activeTag === tag.id}
									onClick={() => {
										onSelectTag(tag.id);
										onSelectFolder(null);
									}}
									className="py-0.5 px-3 focus-visible:ring-0"
								>
									<Hash
										className="size-4 text-sidebar-foreground/50"
										weight="duotone"
									/>
									{tag.name}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}

						{/* Tag Creation Trigger */}
						<SidebarMenuItem className="py-0 mt-1">
							{isAddingTag ? (
								<div className="flex items-center gap-2 bg-sidebar-accent/50 py-1 px-3">
									<Hash
										className="size-4 text-sidebar-foreground/50 shrink-0"
										weight="duotone"
									/>
									<Input
										value={newTagName}
										onChange={(e) => setNewTagName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleAddTag();
											}
											if (e.key === "Escape") {
												setIsAddingTag(false);
												setNewTagName("");
											}
										}}
										onBlur={() => {
											if (newTagName.trim()) {
												handleAddTag();
											} else {
												setIsAddingTag(false);
											}
										}}
										placeholder="Tag name..."
										autoFocus
										className="h-6 border-0 bg-transparent p-0 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
									/>
								</div>
							) : (
								<SidebarMenuButton
									onClick={() => setIsAddingTag(true)}
									className="py-0.5 px-3 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm transition-colors focus-visible:ring-0"
								>
									<Plus className="size-4" />
									New tag
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					</SidebarMenu>
				</ScrollArea>
			</SidebarContent>
		</Sidebar>
	);
};

export default SidebarComponent;
