import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddCardProps {
	onAdd: (url: string) => void;
	isAdding: boolean;
}

const AddCard: React.FC<AddCardProps> = ({ onAdd, isAdding }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [url, setUrl] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isExpanded && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isExpanded]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (url.trim()) {
			onAdd(url.trim());
			setUrl("");
			setIsExpanded(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setUrl("");
			setIsExpanded(false);
		}
	};

	if (isExpanded) {
		return (
			<div
				className={cn(
					"rounded-lg border-2 border-dashed border-primary/50 bg-card overflow-hidden",
					"flex flex-col"
				)}
			>
				<form onSubmit={handleSubmit} className="p-3">
					<Input
						ref={inputRef}
						type="url"
						placeholder="Paste a URL..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={handleKeyDown}
						className="mb-2"
						disabled={isAdding}
					/>
					<div className="flex gap-2">
						<Button
							type="submit"
							size="sm"
							disabled={!url.trim() || isAdding}
						>
							{isAdding ? "Adding..." : "Add"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setUrl("");
								setIsExpanded(false);
							}}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		);
	}

	return (
		<button
			onClick={() => setIsExpanded(true)}
			className={cn(
				"rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30",
				"flex flex-col items-center justify-center gap-2",
				"hover:border-primary/50 hover:bg-muted/50 transition-all duration-150",
				"cursor-pointer min-h-[180px]"
			)}
		>
			<Plus className="size-8 text-muted-foreground/50" weight="bold" />
			<span className="text-[11px] text-muted-foreground/60">
				ENTER
			</span>
		</button>
	);
};

export default AddCard;
