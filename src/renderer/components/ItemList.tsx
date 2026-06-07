import React, { useState } from "react";
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
	DialogTrigger,
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
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import {
	Link,
	Image,
	MagnifyingGlass,
	NotePencil,
	CaretDown,
} from "@phosphor-icons/react";

interface ItemListProps {
	entries: Entry[];
	selectedEntry: Entry | null;
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onSelectEntry: (entry: Entry) => void;
	onAddEntry: (payload: AddEntryPayload) => void;
	folders: Folder[];
	tags: Tag[];
	activeFolder: number | null;
	activeTag: number | null;
	trashView: boolean;
}

// Generate a short description for an entry
const getEntryDescription = (entry: Entry): string => {
	const tagText =
		entry.tags.length > 0 ? entry.tags.map((t) => `#${t}`).join(" ") : "";

	if (entry.type === "url") {
		return `${tagText} ${entry.source_url || ""}`.trim();
	}

	if (entry.type === "image") {
		return tagText || "Image reference";
	}

	return tagText;
};

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

const ItemList: React.FC<ItemListProps> = ({
	entries,
	selectedEntry,
	searchQuery,
	onSearchChange,
	onSelectEntry,
	onAddEntry,
	folders,
	tags,
	activeFolder,
	activeTag,
	trashView,
}) => {
	const [urlDialogOpen, setUrlDialogOpen] = useState(false);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [searchMode, setSearchMode] = useState(false);

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

	const toggleTag = (
		tagId: number,
		currentIds: number[],
		setIds: (ids: number[]) => void,
	) => {
		if (currentIds.includes(tagId)) {
			setIds(currentIds.filter((id) => id !== tagId));
		} else {
			setIds([...currentIds, tagId]);
		}
	};

	const TagSelector = ({
		selectedIds,
		onChange,
	}: {
		selectedIds: number[];
		onChange: (ids: number[]) => void;
	}) => (
		<div className="flex flex-wrap gap-1.5">
			{tags.map((tag) => {
				const isSelected = selectedIds.includes(tag.id);
				return (
					<Badge
						key={tag.id}
						variant={isSelected ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => toggleTag(tag.id, selectedIds, onChange)}
					>
						#{" "}
						{tag.name}
					</Badge>
				);
			})}
		</div>
	);

	// Get current section name for the header
	const getCurrentSectionName = () => {
		if (trashView) return "Trash";
		if (activeFolder !== null) {
			const folder = folders.find((f) => f.id === activeFolder);
			return folder?.name || "Folder";
		}
		if (activeTag !== null) {
			const tag = tags.find((t) => t.id === activeTag);
			return tag?.name || "Tag";
		}
		return "All Items";
	};

	return (
		<div className="w-[380px] min-w-[380px] bg-card border-r border-border flex flex-col">
			{/* Top bar - matching the screenshot style */}
			<div className="px-4 py-3 flex items-center justify-between gap-3">
				{/* Left: Section name with dropdown */}
				<div className="flex items-center gap-1">
					<span className="text-[15px] font-semibold text-foreground">
						{getCurrentSectionName()}
					</span>
					<CaretDown className="size-4 text-muted-foreground" />
				</div>

				{/* Right: Action icons */}
				<div className="flex items-center gap-2">
					{/* Add button */}
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-muted-foreground hover:text-foreground"
							>
								<NotePencil className="size-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-sm">
							<DialogHeader>
								<DialogTitle>Add New</DialogTitle>
							</DialogHeader>
							<div className="flex flex-col gap-2 py-4">
								<Button
									variant="outline"
									className="justify-start"
									onClick={() => {
										resetUrlForm();
										setUrlDialogOpen(true);
									}}
								>
									<Link data-icon="inline-start" />
									Add URL
								</Button>
								<Button
									variant="outline"
									className="justify-start"
									onClick={() => {
										resetImageForm();
										setImageDialogOpen(true);
									}}
								>
									<Image data-icon="inline-start" />
									Add Image
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					{/* Search toggle */}
					<Button
						variant="ghost"
						size="icon-sm"
						className={`text-muted-foreground hover:text-foreground ${searchMode ? "bg-accent" : ""}`}
						onClick={() => setSearchMode(!searchMode)}
					>
						<MagnifyingGlass className="size-4" />
					</Button>
				</div>
			</div>

			{/* Search input - shown when search mode is active */}
			{searchMode && (
				<div className="px-4 py-2">
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<MagnifyingGlass className="size-4 opacity-50" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Search..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							autoFocus
							onBlur={() => {
								if (!searchQuery) {
									setSearchMode(false);
								}
							}}
						/>
					</InputGroup>
				</div>
			)}

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
							<TagSelector selectedIds={urlTagIds} onChange={setUrlTagIds} />
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
								selectedIds={imageTagIds}
								onChange={setImageTagIds}
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

			<ScrollArea className="flex-1">
				<div className="flex flex-col">
					{entries.map((entry) => {
						const isSelected = selectedEntry?.id === entry.id;
						const hasImage = entry.screenshot_path || entry.type === "image";

						return (
							<div
								key={entry.id}
								onClick={() => onSelectEntry(entry)}
								className="group cursor-pointer border border-transparent p-4 transition-all hover:bg-muted/50 data-[selected=true]:border-r-[3px] data-[selected=true]:border-r-primary data-[selected=true]:bg-accent"
								data-selected={isSelected}
							>
								{/* Title */}
								<h3 className="text-[15px] font-semibold leading-snug text-foreground mb-1">
									{entry.title}
								</h3>

								{/* Description with inline tags */}
								<p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">
									{entry.tags.length > 0 && (
						<span>
							{entry.tags.map((tag) => `#${tag}`).join(" ")}
						</span>
									)}
									{entry.tags.length > 0 && " "}
									{entry.source_url || entry.title}
								</p>

								{/* Optional image thumbnail */}
								{hasImage && (
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

								{/* Date */}
								<div className="flex items-center gap-1 text-[12px] text-muted-foreground">
									<span>{formatRelativeDate(entry.created_at)}</span>
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
