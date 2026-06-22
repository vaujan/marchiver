import React, { useState, useEffect } from "react";
import type { Entry, Folder, Tag } from "../App";
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

interface EditEntryDialogProps {
	entry: Entry | null;
	onClose: () => void;
	folders: Folder[];
	tags: Tag[];
	onUpdateEntry: (
		id: number,
		updates: Partial<Entry>,
		tagIds?: number[],
	) => Promise<void>;
	onAddTag?: (payload: {
		name: string;
		color?: string;
		icon?: string;
	}) => Promise<void>;
}

const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
	entry,
	onClose,
	folders,
	tags,
	onUpdateEntry,
	onAddTag,
}) => {
	const [editTitle, setEditTitle] = useState("");
	const [editFolderId, setEditFolderId] = useState<string>("1");
	const [editTagIds, setEditTagIds] = useState<number[]>([]);
	const [editSubmitting, setEditSubmitting] = useState(false);

	useEffect(() => {
		if (entry) {
			setEditTitle(entry.title);
			setEditFolderId(String(entry.folder_id));
			const tagIds = entry.tags
				.map((name) => tags.find((t) => t.name === name)?.id)
				.filter((id): id is number => id !== undefined);
			setEditTagIds(tagIds);
		} else {
			setEditTitle("");
			setEditFolderId("1");
			setEditTagIds([]);
		}
	}, [entry, tags]);

	const handleSave = async () => {
		if (!entry || !editTitle.trim()) return;
		setEditSubmitting(true);

		await onUpdateEntry(
			entry.id,
			{
				title: editTitle.trim(),
				folder_id: Number(editFolderId),
			},
			editTagIds,
		);

		setEditSubmitting(false);
		onClose();
	};

	return (
		<Dialog
			open={!!entry}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
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
									handleSave();
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
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						disabled={!editTitle.trim() || editSubmitting}
						onClick={handleSave}
					>
						{editSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditEntryDialog;
