import React, { useState } from "react";
import type { Entry } from "../App";
import BlockCard from "./BlockCard";
import AddCard from "./AddCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/date-utils";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface BlockGridProps {
	entries: Entry[];
	selectedEntry: Entry | null;
	onSelectEntry: (entry: Entry) => void;
	onAddEntry: (url: string) => Promise<void>;
	onSearchChange: (q: string) => void;
	searchQuery: string;
	trashView: boolean;
	activeFolder: number | null;
	viewMode: "grid" | "list";
}

const BlockGrid: React.FC<BlockGridProps> = ({
	entries,
	selectedEntry,
	onSelectEntry,
	onAddEntry,
	onSearchChange,
	searchQuery,
	trashView,
	activeFolder,
	viewMode,
}) => {
	const [isAdding, setIsAdding] = useState(false);

	const handleAdd = async (url: string) => {
		setIsAdding(true);
		try {
			await onAddEntry(url);
		} finally {
			setIsAdding(false);
		}
	};

	const renderEmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
			<MagnifyingGlass className="size-10 mb-4 opacity-30" />
			{searchQuery ? (
				<>
					<p className="text-sm font-medium">
						No results for "{searchQuery}"
					</p>
					<Button
						variant="ghost"
						size="sm"
						className="mt-3 text-xs"
						onClick={() => onSearchChange("")}
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
	);

	if (entries.length === 0 && !searchQuery) {
		return (
			<div className="flex-1 min-h-0">
				<div className="p-4">
					<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
						<AddCard onAdd={handleAdd} isAdding={isAdding} />
					</div>
				</div>
			</div>
		);
	}

	if (entries.length === 0) {
		return <div className="flex-1 min-h-0">{renderEmptyState()}</div>;
	}

	if (viewMode === "list") {
		return (
			<ScrollArea className="flex-1 min-h-0 overflow-x-hidden">
				<div className="flex flex-col divide-y divide-border">
					{entries.map((entry) => {
						const isSelected = selectedEntry?.id === entry.id;
						return (
							<div
								key={entry.id}
								onClick={() => onSelectEntry(entry)}
								className={cn(
									"group cursor-pointer border-l-[3px] border-l-transparent hover:bg-muted px-3 py-2",
									isSelected && "bg-accent border-l-primary",
								)}
							>
								<h3 className="text-[13px] font-semibold leading-snug text-foreground mb-0.5">
									{entry.title}
								</h3>
								<div className="flex items-center gap-2 text-[12px] text-muted-foreground">
									<span>{formatRelativeDate(entry.created_at)}</span>
									{entry.tags.length > 0 && (
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
		);
	}

	return (
		<ScrollArea className="flex-1 min-h-0">
			<div className="p-4">
				<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
					<AddCard onAdd={handleAdd} isAdding={isAdding} />
					{entries.map((entry) => (
						<BlockCard
							key={entry.id}
							entry={entry}
							onClick={onSelectEntry}
						/>
					))}
				</div>
			</div>
		</ScrollArea>
	);
};

export default BlockGrid;
