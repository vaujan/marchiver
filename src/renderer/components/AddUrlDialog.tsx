import React, { useState, useEffect } from "react";
import type { Folder, Tag, AddEntryPayload } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import TagSelector from "./TagSelector";
import { Spinner } from "@phosphor-icons/react";

interface AddUrlDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folders: Folder[];
	tags: Tag[];
	defaultFolderId: string;
	onAddEntry: (payload: AddEntryPayload) => void;
	onAddTag?: (payload: {
		name: string;
		color?: string;
		icon?: string;
	}) => Promise<void>;
}

const AddUrlDialog: React.FC<AddUrlDialogProps> = ({
	open,
	onOpenChange,
	folders,
	tags,
	defaultFolderId,
	onAddEntry,
	onAddTag,
}) => {
	const [urlTitle, setUrlTitle] = useState("");
	const [urlValue, setUrlValue] = useState("");
	const [urlFolderId, setUrlFolderId] = useState<string>(defaultFolderId);
	const [urlTagIds, setUrlTagIds] = useState<number[]>([]);
	const [urlCaptureScreenshot, setUrlCaptureScreenshot] = useState(true);
	const [urlSubmitting, setUrlSubmitting] = useState(false);
	const [urlTitleFetching, setUrlTitleFetching] = useState(false);

	useEffect(() => {
		setUrlFolderId(defaultFolderId);
	}, [defaultFolderId]);

	const resetForm = () => {
		setUrlTitle("");
		setUrlValue("");
		setUrlFolderId(defaultFolderId);
		setUrlTagIds([]);
		setUrlCaptureScreenshot(true);
		setUrlSubmitting(false);
		setUrlTitleFetching(false);
	};

	// Auto-fetch title from URL
	useEffect(() => {
		if (!urlValue.trim() || urlTitle.trim()) return;
		let cancelled = false;
		const timer = setTimeout(async () => {
			try {
				setUrlTitleFetching(true);
				const result = await window.electronAPI.fetchUrlMetadata(
					urlValue.trim(),
				);
				if (!cancelled && result.success && result.title) {
					setUrlTitle(result.title);
				}
			} catch {
				// ignore
			} finally {
				if (!cancelled) setUrlTitleFetching(false);
			}
		}, 1000);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [urlValue, urlTitle]);

	// Clipboard detection on dialog open
	useEffect(() => {
		if (open && !urlValue) {
			navigator.clipboard
				.readText()
				.then((text) => {
					const trimmed = text.trim();
					if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
						setUrlValue(trimmed);
					}
				})
				.catch(() => {
					// ignore permission errors
				});
		}
	}, [open]);

	const handleAdd = async () => {
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
		onOpenChange(false);
		resetForm();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add URL</DialogTitle>
					<DialogDescription>
						Archive a webpage with an optional screenshot.
					</DialogDescription>
				</DialogHeader>
				<FieldGroup>
					<Field>
						<FieldLabel>
							Title
							{urlTitleFetching && (
								<span className="ml-2 text-xs text-muted-foreground inline-flex items-center gap-1">
									<Spinner className="size-3 animate-spin" />
									Fetching title...
								</span>
							)}
						</FieldLabel>
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
							onKeyDown={(e) => {
								if (e.key === "Enter" && urlTitle.trim() && urlValue.trim()) {
									handleAdd();
								}
							}}
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
							onOpenChange(false);
							resetForm();
						}}
					>
						Cancel
					</Button>
					<Button
						disabled={!urlTitle.trim() || !urlValue.trim() || urlSubmitting}
						onClick={handleAdd}
					>
						{urlSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddUrlDialog;
