import React, { useState, useEffect } from "react";
import type { Entry, Folder, Tag, AddEntryPayload } from "../App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
} from "@/components/ui/input-group";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuCheckboxItem,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	MagnifyingGlass,
	SortAscending,
	Tag as TagIcon,
	Rows,
	SquaresFour,
	Plus,
	X,
	Link,
	Image,
} from "@phosphor-icons/react";
import BlockGrid from "./BlockGrid";
import Lightbox from "./Lightbox";
import AddUrlDialog from "./AddUrlDialog";
import AddImageDialog from "./AddImageDialog";
import EditEntryDialog from "./EditEntryDialog";

interface ChannelViewProps {
	entries: Entry[];
	selectedEntry: Entry | null;
	folders: Folder[];
	tags: Tag[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onSelectEntry: (entry: Entry) => void;
	onAddEntry: (payload: AddEntryPayload) => void;
	onUpdateEntry: (
		id: number,
		updates: Partial<Entry>,
		tagIds?: number[],
	) => Promise<void>;
	onDeleteEntry: (id: number) => void;
	onAddTag?: (payload: {
		name: string;
		color?: string;
		icon?: string;
	}) => Promise<void>;
	activeFolder: number | null;
	activeTag: number | null;
	trashView: boolean;
	sortOrder: "newest" | "oldest" | "alphabetical" | "type";
	onSortOrderChange: (
		order: "newest" | "oldest" | "alphabetical" | "type",
	) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	activeTagFilters: number[];
	onActiveTagFiltersChange: (ids: number[]) => void;
	editingEntry: Entry | null;
	onEditEntryClose: () => void;
	onEditEntry: (entry: Entry) => void;
	onNavigateToAll: () => void;
	onNavigateToFolder: (folderId: number) => void;
	urlDialogOpen?: boolean;
	onUrlDialogOpenChange?: (open: boolean) => void;
	imageDialogOpen?: boolean;
	onImageDialogOpenChange?: (open: boolean) => void;
}

function getFolderPathSegments(
	folderId: number | null,
	folders: Folder[],
): Folder[] {
	if (folderId === null) return [];
	const folder = folders.find((f) => f.id === folderId);
	if (!folder) return [];
	const segments: Folder[] = [folder];
	let current = folder;
	let depth = 0;
	while (current.parent_id !== null && depth < 100) {
		const parent = folders.find((f) => f.id === current.parent_id);
		if (!parent) break;
		segments.unshift(parent);
		current = parent;
		depth++;
	}
	return segments;
}

const ChannelView: React.FC<ChannelViewProps> = ({
	entries,
	selectedEntry,
	folders,
	tags,
	searchQuery,
	onSearchChange,
	onSelectEntry,
	onAddEntry,
	onUpdateEntry,
	onDeleteEntry,
	onAddTag,
	activeFolder,
	activeTag,
	trashView,
	sortOrder,
	onSortOrderChange,
	viewMode,
	onViewModeChange,
	activeTagFilters,
	onActiveTagFiltersChange,
	editingEntry,
	onEditEntryClose,
	onEditEntry,
	onNavigateToAll,
	onNavigateToFolder,
	urlDialogOpen: urlDialogOpenProp,
	onUrlDialogOpenChange,
	imageDialogOpen: imageDialogOpenProp,
	onImageDialogOpenChange,
}) => {
	// Search input with debounce
	const [searchInput, setSearchInput] = useState(searchQuery);

	useEffect(() => {
		setSearchInput(searchQuery);
	}, [searchQuery]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== searchQuery) {
				onSearchChange(searchInput);
			}
		}, 150);
		return () => clearTimeout(timer);
	}, [searchInput, searchQuery, onSearchChange]);

	// Dialog state (with prop-overridable internal fallback)
	const [internalUrlOpen, setInternalUrlOpen] = useState(false);
	const [internalImageOpen, setInternalImageOpen] = useState(false);
	const urlDialogOpen = urlDialogOpenProp ?? internalUrlOpen;
	const setUrlDialogOpen = (open: boolean) => {
		onUrlDialogOpenChange
			? onUrlDialogOpenChange(open)
			: setInternalUrlOpen(open);
	};
	const imageDialogOpen = imageDialogOpenProp ?? internalImageOpen;
	const setImageDialogOpen = (open: boolean) => {
		onImageDialogOpenChange
			? onImageDialogOpenChange(open)
			: setInternalImageOpen(open);
	};

	// Context-aware default folder
	const defaultFolderId = activeFolder !== null ? String(activeFolder) : "1";

	// Breadcrumb
	const breadcrumbItems = React.useMemo(() => {
		const items: React.ReactNode[] = [];

		if (trashView) {
			items.push(
				<BreadcrumbItem key="trash">
					<BreadcrumbPage className="text-muted-foreground text-[11px] font-medium">
						Trash
					</BreadcrumbPage>
				</BreadcrumbItem>,
			);
		} else if (activeTag !== null) {
			const tag = tags.find((t) => t.id === activeTag);
			if (tag) {
				items.push(
					<BreadcrumbItem key="all">
						<BreadcrumbLink
							render={
								<span
									className="cursor-pointer text-[11px] font-medium"
									onClick={onNavigateToAll}
								>
									All Items
								</span>
							}
						/>
					</BreadcrumbItem>,
				);
				items.push(<BreadcrumbSeparator key="sep" />);
				items.push(
					<BreadcrumbItem key="tag">
						<BreadcrumbPage className="text-muted-foreground text-[11px] font-medium">
							Tag: {tag.name}
						</BreadcrumbPage>
					</BreadcrumbItem>,
				);
			}
		} else if (activeFolder !== null) {
			const folderSegments = getFolderPathSegments(activeFolder, folders);
			if (folderSegments.length > 0) {
				items.push(
					<BreadcrumbItem key="all">
						<BreadcrumbLink
							render={
								<span
									className="cursor-pointer text-[11px] font-medium"
									onClick={onNavigateToAll}
								>
									All Items
								</span>
							}
						/>
					</BreadcrumbItem>,
				);
				items.push(<BreadcrumbSeparator key="sep-all" />);

				folderSegments.forEach((folder, index) => {
					const isLast = index === folderSegments.length - 1;
					items.push(
						<BreadcrumbItem key={`folder-${folder.id}`}>
							{isLast ? (
								<BreadcrumbPage className="text-muted-foreground text-[11px] font-medium">
									{folder.name}
								</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									render={
										<span
											className="cursor-pointer text-[11px] font-medium"
											onClick={() => onNavigateToFolder(folder.id)}
										>
											{folder.name}
										</span>
									}
								/>
							)}
						</BreadcrumbItem>,
					);
					if (!isLast) {
						items.push(
							<BreadcrumbSeparator key={`sep-folder-${folder.id}`} />,
						);
					}
				});
			}
		} else {
			items.push(
				<BreadcrumbItem key="all">
					<BreadcrumbPage className="text-muted-foreground text-[11px] font-medium">
						All Items
					</BreadcrumbPage>
				</BreadcrumbItem>,
			);
		}

		return items;
	}, [trashView, activeFolder, activeTag, folders, tags, onNavigateToAll, onNavigateToFolder]);

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{/* Toolbar */}
			<div className="h-10 px-3 flex items-center gap-2 border-b border-border shrink-0">
				{/* Breadcrumb */}
				{breadcrumbItems.length > 0 && (
					<Breadcrumb className="flex-1 min-w-0">
						<BreadcrumbList className="text-[11px] font-medium">
							{breadcrumbItems}
						</BreadcrumbList>
					</Breadcrumb>
				)}

				{/* Search */}
				<div className="min-w-0 max-w-[180px]">
					<InputGroup className="h-6 bg-accent border border-border rounded-md">
						<InputGroupAddon align="inline-start">
							<MagnifyingGlass className="size-3.5 opacity-50" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Search..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="h-7 text-xs"
						/>
						{searchInput && (
							<InputGroupAddon align="inline-end">
								<button
									onClick={() => setSearchInput("")}
									className="flex items-center justify-center opacity-50 hover:opacity-100"
									type="button"
								>
									<X className="size-3.5" />
								</button>
							</InputGroupAddon>
						)}
					</InputGroup>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-0.5">
					<TooltipProvider>
						{/* Sort */}
						<DropdownMenu>
							<Tooltip>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<SortAscending className="size-4" />
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>Sort</TooltipContent>
							</Tooltip>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel inset>Sort by</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={sortOrder}
									onValueChange={(v) =>
										onSortOrderChange(v as typeof sortOrder)
									}
								>
									<DropdownMenuRadioItem value="newest">
										Newest
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="oldest">
										Oldest
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="alphabetical">
										Alphabetical
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="type">
										By type
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Tag Filter */}
						<DropdownMenu>
							<Tooltip>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm" className="relative">
											<TagIcon className="size-4" />
											{activeTagFilters.length > 0 && (
												<span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
											)}
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>Filter tags</TooltipContent>
							</Tooltip>
							<DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
								<DropdownMenuLabel inset>Filter by tags</DropdownMenuLabel>
								{tags.length === 0 && (
									<DropdownMenuItem disabled>No tags available</DropdownMenuItem>
								)}
								{tags.map((tag) => (
									<DropdownMenuCheckboxItem
										key={tag.id}
										checked={activeTagFilters.includes(tag.id)}
										onCheckedChange={() => {
											if (activeTagFilters.includes(tag.id)) {
												onActiveTagFiltersChange(
													activeTagFilters.filter((id) => id !== tag.id),
												);
											} else {
												onActiveTagFiltersChange([...activeTagFilters, tag.id]);
											}
										}}
									>
										<span className="flex items-center gap-2">
											<span
												className="size-2 rounded-full"
												style={{ backgroundColor: tag.color }}
											/>
											{tag.name}
										</span>
									</DropdownMenuCheckboxItem>
								))}
								{activeTagFilters.length > 0 && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => onActiveTagFiltersChange([])}>
											Clear filters
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* View Toggle */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() =>
										onViewModeChange(
											viewMode === "grid" ? "list" : "grid",
										)
									}
								>
									{viewMode === "grid" ? (
										<Rows className="size-4" />
									) : (
										<SquaresFour className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{viewMode === "grid" ? "List view" : "Grid view"}
							</TooltipContent>
						</Tooltip>

						{/* Add Dropdown */}
						<DropdownMenu>
							<Tooltip>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<Plus className="size-4" />
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>Add</TooltipContent>
							</Tooltip>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setUrlDialogOpen(true)}>
									<Link className="size-4" />
									Add URL
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
									<Image className="size-4" />
									Add Image
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TooltipProvider>
				</div>
			</div>

			{/* Block Grid */}
			<BlockGrid
				entries={entries}
				selectedEntry={selectedEntry}
				onSelectEntry={onSelectEntry}
				onSearchChange={onSearchChange}
				searchQuery={searchQuery}
				trashView={trashView}
				activeFolder={activeFolder}
				viewMode={viewMode}
			/>

			{/* Lightbox */}
			<Lightbox
				entry={selectedEntry}
				open={!!selectedEntry}
				onOpenChange={(open) => {
					if (!open) onSelectEntry(null as unknown as Entry);
				}}
				folders={folders}
				onDeleteEntry={onDeleteEntry}
				onEditEntry={onEditEntry}
			/>

			{/* Add URL Dialog */}
			<AddUrlDialog
				open={urlDialogOpen}
				onOpenChange={setUrlDialogOpen}
				folders={folders}
				tags={tags}
				defaultFolderId={defaultFolderId}
				onAddEntry={onAddEntry}
				onAddTag={onAddTag}
			/>

			{/* Add Image Dialog */}
			<AddImageDialog
				open={imageDialogOpen}
				onOpenChange={setImageDialogOpen}
				folders={folders}
				tags={tags}
				defaultFolderId={defaultFolderId}
				onAddEntry={onAddEntry}
				onAddTag={onAddTag}
			/>

			{/* Edit Entry Dialog */}
			<EditEntryDialog
				entry={editingEntry}
				onClose={onEditEntryClose}
				folders={folders}
				tags={tags}
				onUpdateEntry={onUpdateEntry}
				onAddTag={onAddTag}
			/>
		</div>
	);
};

export default ChannelView;
