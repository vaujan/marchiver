import React, { useState } from "react";
import type { Tag } from "../App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check, Spinner } from "@phosphor-icons/react";

interface TagSelectorProps {
	tags: Tag[];
	selectedIds: number[];
	onChange: (ids: number[]) => void;
	onCreateTag?: (payload: {
		name: string;
		color?: string;
		icon?: string;
	}) => Promise<void>;
}

const TagSelector: React.FC<TagSelectorProps> = ({
	tags,
	selectedIds,
	onChange,
	onCreateTag,
}) => {
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

export default TagSelector;
