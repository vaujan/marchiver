import React, { useState } from "react";
import type { Folder, Tag, AddEntryPayload } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface AddImageDialogProps {
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

const AddImageDialog: React.FC<AddImageDialogProps> = ({
	open,
	onOpenChange,
	folders,
	tags,
	defaultFolderId,
	onAddEntry,
	onAddTag,
}) => {
	const [imageTitle, setImageTitle] = useState("");
	const [imagePath, setImagePath] = useState<string | null>(null);
	const [imageFolderId, setImageFolderId] = useState<string>(defaultFolderId);
	const [imageTagIds, setImageTagIds] = useState<number[]>([]);
	const [imageSubmitting, setImageSubmitting] = useState(false);

	const resetForm = () => {
		setImageTitle("");
		setImagePath(null);
		setImageFolderId(defaultFolderId);
		setImageTagIds([]);
		setImageSubmitting(false);
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

	const handleAdd = async () => {
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
		onOpenChange(false);
		resetForm();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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
							onOpenChange(false);
							resetForm();
						}}
					>
						Cancel
					</Button>
					<Button
						disabled={!imageTitle.trim() || !imagePath || imageSubmitting}
						onClick={handleAdd}
					>
						{imageSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddImageDialog;
