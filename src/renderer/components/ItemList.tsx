import React, { useState, useEffect } from "react";
import type { Entry, Folder, Tag, AddEntryPayload } from "../App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
} from "@/components/ui/input-group";
import {
	Link,
	Image,
	MagnifyingGlass,
	SortAscending,
	Tag as TagIcon,
	Rows,
	SquaresFour,
	Plus,
	X,
	Check,
	Spinner,
} from "@phosphor-icons/react";
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

interface ItemListProps {
	entries: Entry[];
	selectedEntry: Entry | null;
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onSelectEntry: (entry: Entry) => void;
	onAddEntry: (payload: AddEntryPayload) => void;
	onUpdateEntry: (id: number, updates: Partial<Entry>, tagIds?: number[]) => Promise<void>;
	onAddTag?: (payload: { name: string; color?: string; icon?: string }) => Promise<void>;
	folders: Folder[];
	tags: Tag[];
	activeFolder: number | null;
	activeTag: number | null;
	trashView: boolean;
	urlDialogOpen?: boolean;
	onUrlDialogOpenChange?: (open: boolean) => void;
	imageDialogOpen?: boolean;
	onImageDialogOpenChange?: (open: boolean) => void;
	editEntry?: Entry | null;
	onEditEntryClose?: () => void;
	sortOrder: "newest" | "oldest" | "alphabetical" | "type";
	onSortOrderChange: (
		order: "newest" | "oldest" | "alphabetical" | "type",
	) => void;
	viewMode: "expanded" | "compact";
	onViewModeChange: (mode: "expanded" | "compact") => void;
	activeTagFilters: number[];
	onActiveTagFiltersChange: (ids: number[]) => void;
}

// Format date relative to now (like "Yesterday", "Just now", etc.)
const formatRelativeDate = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHours === 0) {
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			return diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`;
		}
		return `${diffHours}h ago`;
	}
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const dragStyle: React.CSSProperties = {
	WebkitAppRegion: "drag",
} as React.CSSProperties;
const noDragStyle: React.CSSProperties = {
	WebkitAppRegion: "no-drag",
} as React.CSSProperties;

const TagSelector: React.FC<{
	tags: Tag[];
	selectedIds: number[];
	onChange: (ids: number[]) => void;
	onCreateTag?: (payload: { name: string; color?: string; icon?: string }) => Promise<void>;
}> = ({ tags, selectedIds, onChange, onCreateTag }) => {
	const [isCreating, setIsCreating] = useState(false);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState("#e54d42");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCreate = async () => {
		const name = newTagName.trim();
		if (!name || !onCreateTag) return;
		setIsSubmitting(true);
		try {
			await onCreateTag({ name, color: newTagColor, icon: "Hash" });
			setIsCreating(false);
			setNewTagName("");
			setNewTagColor("#e54d42");
		} catch {
			// error handled by caller
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex flex-wrap gap-1.5">
			{tags.map((tag) => {
				const isSelected = selectedIds.includes(tag.id);
				return (
					<Badge
						key={tag.id}
						variant={isSelected ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => {
							if (selectedIds.includes(tag.id)) {
								onChange(selectedIds.filter((id) => id !== tag.id));
							} else {
								onChange([...selectedIds, tag.id]);
							}
						}}
					>
						# {tag.name}
					</Badge>
				);
			})}
			{onCreateTag && (
				<>
					{isCreating ? (
						<div className="flex items-center gap-1.5">
							<Input
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								placeholder="Tag name"
								className="h-6 w-28 text-xs"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleCreate();
									if (e.key === "Escape") {
										setIsCreating(false);
										setNewTagName("");
									}
								}}
								autoFocus
							/>
								<input
									type="color"
									value={newTagColor}
									onChange={(e) => setNewTagColor(e.target.value)}
									className="h-6 w-6 rounded cursor-pointer border-0 p-0"
									title="Tag color"
								/>
								<Button
									variant="ghost"
									size="icon-sm"
									className="h-6 w-6"
									onClick={handleCreate}
									disabled={isSubmitting || !newTagName.trim()}
								>
									{isSubmitting ? (
														<Spinner className="size-3 animate-spin" />
									) : (
										<Check className="size-3" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									className="h-6 w-6"
									onClick={() => {
										setIsCreating(false);
										setNewTagName("");
									}}
								>
									<X className="size-3" />
								</Button>
							</div>
						) : (
							<Badge
								variant="outline"
								className="cursor-pointer hover:bg-muted"
								onClick={() => setIsCreating(true)}
							>
								<Plus className="size-3 mr-0.5" />
								New tag
							</Badge>
						)}
					</>
				)}
		</div>
	);
};

const ItemList: React.FC<ItemListProps> = ({
	entries,
	selectedEntry,
	searchQuery,
	onSearchChange,
	onSelectEntry,
	onAddEntry,
	onUpdateEntry,
	onAddTag,
	folders,
	tags,
	activeFolder,
	activeTag,
	trashView,
	urlDialogOpen: urlDialogOpenProp,
	onUrlDialogOpenChange,
	imageDialogOpen: imageDialogOpenProp,
	onImageDialogOpenChange,
	editEntry,
	onEditEntryClose,
	sortOrder,
	onSortOrderChange,
	viewMode,
	onViewModeChange,
	activeTagFilters,
	onActiveTagFiltersChange,
}) => {
	const [internalUrlDialogOpen, setInternalUrlDialogOpen] = useState(false);
	const [internalImageDialogOpen, setInternalImageDialogOpen] = useState(false);

	// Local search input state with debounced sync to parent
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

	const urlDialogOpen = urlDialogOpenProp ?? internalUrlDialogOpen;
	const setUrlDialogOpen = (open: boolean) => {
		onUrlDialogOpenChange
			? onUrlDialogOpenChange(open)
			: setInternalUrlDialogOpen(open);
	};

	const imageDialogOpen = imageDialogOpenProp ?? internalImageDialogOpen;
	const setImageDialogOpen = (open: boolean) => {
		onImageDialogOpenChange
			? onImageDialogOpenChange(open)
			: setInternalImageDialogOpen(open);
	};

	// Add URL form state
	const [urlTitle, setUrlTitle] = useState("");
	const [urlValue, setUrlValue] = useState("");
	const [urlFolderId, setUrlFolderId] = useState<string>("1");
	const [urlTagIds, setUrlTagIds] = useState<number[]>([]);
	const [urlCaptureScreenshot, setUrlCaptureScreenshot] = useState(true);
	const [urlSubmitting, setUrlSubmitting] = useState(false);

	// Add Image form state
	const [imageTitle, setImageTitle] = useState("");
	const [imagePath, setImagePath] = useState<string | null>(null);
	const [imageFolderId, setImageFolderId] = useState<string>("1");
	const [imageTagIds, setImageTagIds] = useState<number[]>([]);
	const [imageSubmitting, setImageSubmitting] = useState(false);

	const resetUrlForm = () => {
		setUrlTitle("");
		setUrlValue("");
		setUrlFolderId("1");
		setUrlTagIds([]);
		setUrlCaptureScreenshot(true);
		setUrlSubmitting(false);
	};

	const resetImageForm = () => {
		setImageTitle("");
		setImagePath(null);
		setImageFolderId("1");
		setImageTagIds([]);
		setImageSubmitting(false);
	};

	const handleAddUrl = async () => {
		if (!urlTitle.trim() || !urlValue.trim()) return;
		setUrlSubmitting(true);

		let screenshotPath: string | null = null;
		if (urlCaptureScreenshot) {
			const result = await window.electronAPI.captureScreenshot(
				urlValue.trim(),
			);
			if (result.success) {
				screenshotPath = result.path;
			}
		}

		onAddEntry({
			title: urlTitle.trim(),
			type: "url",
			source_url: urlValue.trim(),
			screenshot_path: screenshotPath,
			folder_id: Number(urlFolderId),
			tagIds: urlTagIds.length > 0 ? urlTagIds : undefined,
		});

		setUrlSubmitting(false);
		setUrlDialogOpen(false);
		resetUrlForm();
	};

	const handlePickImage = async () => {
		const path = await window.electronAPI.pickImage();
		if (path) {
			setImagePath(path);
			if (!imageTitle.trim()) {
				const filename =
					path.split("/").pop() || path.split("\\").pop() || "Imported Image";
				setImageTitle(filename);
			}
		}
	};

	const handleAddImage = async () => {
		if (!imageTitle.trim() || !imagePath) return;
		setImageSubmitting(true);

		onAddEntry({
			title: imageTitle.trim(),
			type: "image",
			source_url: null,
			screenshot_path: imagePath,
			folder_id: Number(imageFolderId),
			tagIds: imageTagIds.length > 0 ? imageTagIds : undefined,
		});

		setImageSubmitting(false);
		setImageDialogOpen(false);
		resetImageForm();
	};

	// Edit dialog state
	const [editTitle, setEditTitle] = useState("");
	const [editFolderId, setEditFolderId] = useState<string>("1");
	const [editTagIds, setEditTagIds] = useState<number[]>([]);
	const [editSubmitting, setEditSubmitting] = useState(false);

	// Sync edit dialog when editEntry changes
	useEffect(() => {
		if (editEntry) {
			setEditTitle(editEntry.title);
			setEditFolderId(String(editEntry.folder_id));
			const tagIds = editEntry.tags
				.map((name) => tags.find((t) => t.name === name)?.id)
				.filter((id): id is number => id !== undefined);
			setEditTagIds(tagIds);
		} else {
			setEditTitle("");
			setEditFolderId("1");
			setEditTagIds([]);
		}
	}, [editEntry, tags]);

	const handleEditSave = async () => {
		if (!editEntry || !editTitle.trim()) return;
		setEditSubmitting(true);

		await onUpdateEntry(editEntry.id, {
			title: editTitle.trim(),
			folder_id: Number(editFolderId),
		}, editTagIds);

		setEditSubmitting(false);
		onEditEntryClose?.();
	};

	return (
		<div className="w-[380px] min-w-[380px] flex flex-col h-full">
			{/* Toolbar */}
			<div
				className="h-10 px-3 flex items-center gap-2 border-b border-border/50"
				style={dragStyle}
			>
				{/* Search */}
				<div className="flex-1 min-w-0" style={noDragStyle}>
					<InputGroup className="h-6 rounded-md">
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
									onClick={() => setSearchInput('')}
									className="flex items-center justify-center opacity-50 hover:opacity-100"
									type="button"
								>
									<X className="size-3.5" />
								</button>
							</InputGroupAddon>
						)}
					</InputGroup>
				</div>

				{/* Icon buttons */}
				<div className="flex items-center gap-0.5" style={noDragStyle}>
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
										<Button variant="ghost" size="icon-sm">
											<TagIcon className="size-4" />
											{activeTagFilters.length > 0 && (
												<span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
											)}
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>Filter tags</TooltipContent>
							</Tooltip>
							<DropdownMenuContent
								align="end"
								className="max-h-64 overflow-y-auto"
							>
								<DropdownMenuLabel inset>Filter by tags</DropdownMenuLabel>
								{tags.length === 0 && (
									<DropdownMenuItem disabled>
										No tags available
									</DropdownMenuItem>
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
										<DropdownMenuItem
											onClick={() => onActiveTagFiltersChange([])}
										>
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
										viewMode === 'expanded' ? 'compact' : 'expanded',
									)
								}
								>
									{viewMode === 'expanded' ? (
										<Rows className="size-4" />
									) : (
										<SquaresFour className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{viewMode === 'expanded' ? 'Compact view' : 'Expanded view'}
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
								<DropdownMenuItem
									onClick={() => {
										setUrlDialogOpen(true);
									}}
								>
									<Link className="size-4" />
									Add URL
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setImageDialogOpen(true);
									}}
								>
									<Image className="size-4" />
									Add Image
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TooltipProvider>
				</div>
			</div>

			{/* Add URL Dialog */}
			<Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Add URL</DialogTitle>
						<DialogDescription>
							Archive a webpage with an optional screenshot.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel>Title</FieldLabel>
							<Input
								value={urlTitle}
								onChange={(e) => setUrlTitle(e.target.value)}
								placeholder="e.g., How to Build a Second Brain"
							/>
						</Field>
						<Field>
							<FieldLabel>URL</FieldLabel>
							<Input
								value={urlValue}
								onChange={(e) => setUrlValue(e.target.value)}
								placeholder="https://..."
							/>
						</Field>
						<Field>
							<FieldLabel>Folder</FieldLabel>
							<Select
								value={urlFolderId}
								onValueChange={(val) => {
									if (val) setUrlFolderId(val);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{folders.map((folder) => (
											<SelectItem key={folder.id} value={String(folder.id)}>
												{folder.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel>Tags</FieldLabel>
							<TagSelector
								tags={tags}
								selectedIds={urlTagIds}
								onChange={setUrlTagIds}
								onCreateTag={onAddTag}
							/>
						</Field>
						<Field orientation="horizontal">
							<Checkbox
								id="capture-screenshot"
								checked={urlCaptureScreenshot}
								onCheckedChange={(checked) =>
									setUrlCaptureScreenshot(checked === true)
								}
							/>
							<FieldLabel htmlFor="capture-screenshot" className="font-normal">
								Capture screenshot
							</FieldLabel>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setUrlDialogOpen(false);
								resetUrlForm();
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={!urlTitle.trim() || !urlValue.trim() || urlSubmitting}
							onClick={handleAddUrl}
						>
							{urlSubmitting ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add Image Dialog */}
			<Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Add Image</DialogTitle>
						<DialogDescription>
							Import an image from your computer.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel>Title</FieldLabel>
							<Input
								value={imageTitle}
								onChange={(e) => setImageTitle(e.target.value)}
								placeholder="e.g., Cool gradient reference"
							/>
						</Field>
						<Field>
							<FieldLabel>Image File</FieldLabel>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handlePickImage}
									type="button"
								>
									{imagePath ? "Change Image" : "Pick Image"}
								</Button>
								{imagePath && (
									<span className="text-xs text-muted-foreground truncate">
										{imagePath.split("/").pop() || imagePath.split("\\").pop()}
									</span>
								)}
							</div>
							{imagePath && (
								<div className="mt-2 aspect-video bg-muted rounded-md overflow-hidden">
									<img
										src={imagePath}
										alt="Preview"
										className="w-full h-full object-contain"
									/>
								</div>
							)}
						</Field>
						<Field>
							<FieldLabel>Folder</FieldLabel>
							<Select
								value={imageFolderId}
								onValueChange={(val) => {
									if (val) setImageFolderId(val);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{folders.map((folder) => (
											<SelectItem key={folder.id} value={String(folder.id)}>
												{folder.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel>Tags</FieldLabel>
							<TagSelector
								tags={tags}
								selectedIds={imageTagIds}
								onChange={setImageTagIds}
								onCreateTag={onAddTag}
							/>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setImageDialogOpen(false);
								resetImageForm();
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={!imageTitle.trim() || !imagePath || imageSubmitting}
							onClick={handleAddImage}
						>
							{imageSubmitting ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Entry Dialog */}
			<Dialog open={!!editEntry} onOpenChange={(open) => { if (!open) onEditEntryClose?.(); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Entry</DialogTitle>
						<DialogDescription>
							Update the title, folder, and tags.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Field>
							<FieldLabel>Title</FieldLabel>
							<Input
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								placeholder="Entry title"
								onKeyDown={(e) => {
									if (e.key === "Enter" && editTitle.trim()) {
										handleEditSave();
									}
								}}
							/>
						</Field>
						<Field>
							<FieldLabel>Folder</FieldLabel>
							<Select
								value={editFolderId}
								onValueChange={(val) => {
									if (val) setEditFolderId(val);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{folders.map((folder) => (
											<SelectItem key={folder.id} value={String(folder.id)}>
												{folder.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel>Tags</FieldLabel>
							<TagSelector
								tags={tags}
								selectedIds={editTagIds}
								onChange={setEditTagIds}
								onCreateTag={onAddTag}
							/>
						</Field>
					</FieldGroup>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => onEditEntryClose?.()}
						>
							Cancel
						</Button>
						<Button
							disabled={!editTitle.trim() || editSubmitting}
							onClick={handleEditSave}
						>
							{editSubmitting ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ScrollArea className="flex-1 min-h-0 overflow-x-hidden">
				<div className="flex flex-col divide-y divide-border">
					{entries.length === 0 && (
						<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
							<MagnifyingGlass className="size-10 mb-4 opacity-30" />
							{searchQuery ? (
								<>
									<p className="text-sm font-medium">No results for "{searchQuery}"</p>
									<Button
										variant="ghost"
										size="sm"
										className="mt-3 text-xs"
										onClick={() => onSearchChange('')}
									>
										Clear search
									</Button>
								</>
							) : trashView ? (
								<p className="text-sm font-medium">Trash is empty</p>
							) : activeFolder ? (
								<p className="text-sm font-medium">No items in this folder</p>
							) : (
								<p className="text-sm font-medium">No items yet</p>
							)}
						</div>
					)}
					{entries.map((entry) => {
						const isSelected = selectedEntry?.id === entry.id;
						const hasImage = entry.screenshot_path || entry.type === "image";
						const isCompact = viewMode === "compact";

						return (
							<div
								key={entry.id}
								onClick={() => onSelectEntry(entry)}
							className={cn(
								"group cursor-pointer border-l-[3px] border-l-transparent hover:bg-muted data-[selected=true]:bg-accent data-[selected=true]:border-l-primary",
								isCompact ? "px-3 py-2" : "px-4 py-4",
							)}
								data-selected={isSelected}
							>
								{/* Title */}
								<h3
									className={cn(
										"font-semibold leading-snug text-foreground",
										isCompact ? "text-[13px] mb-0.5" : "text-[15px] mb-1",
									)}
								>
									{entry.title}
								</h3>

								{/* Description with inline tags */}
								{!isCompact && (
									<p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">
										{entry.tags.length > 0 && (
											<span>
												{entry.tags.map((tag) => `#${tag}`).join(" ")}
											</span>
										)}
										{entry.tags.length > 0 && " "}
										{entry.source_url || entry.title}
									</p>
								)}

								{/* Optional image thumbnail */}
								{hasImage && !isCompact && (
									<div className="mb-2 overflow-hidden rounded-lg">
										<img
											src={entry.screenshot_path || entry.source_url || ""}
											alt={entry.title}
											className="h-32 w-full object-cover"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = "none";
											}}
										/>
									</div>
								)}

								{/* Date and tags (compact) */}
								<div className="flex items-center gap-2 text-[12px] text-muted-foreground">
									<span>{formatRelativeDate(entry.created_at)}</span>
									{isCompact && entry.tags.length > 0 && (
										<span className="truncate">
											{entry.tags
												.slice(0, 2)
												.map((tag) => `#${tag}`)
												.join(" ")}
											{entry.tags.length > 2 && " ..."}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
};

export default ItemList;
