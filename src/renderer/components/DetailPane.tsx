import React from "react";
import type { Entry, Folder, Tag } from "../App";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
} from "@/components/ui/empty";
import { ArrowSquareOut, PencilSimple, Trash } from "@phosphor-icons/react";
import bubuntuSvg from "@/assets/bubuntu-line.svg?url";

interface DetailPaneProps {
	entry: Entry | null;
	folders: Folder[];
	tags: Tag[];
	onUpdateEntry: (id: number, updates: Partial<Entry>) => void;
	onDeleteEntry: (id: number) => void;
}

const DetailPane: React.FC<DetailPaneProps> = ({
	entry,
	folders,
	onDeleteEntry,
}) => {
	if (!entry) {
		return (
			<Empty className="h-full bg-card flex-1 border-none rounded-none p-4">
				<EmptyHeader className="gap-4 w-full max-w-none">
					<EmptyTitle className="text-xl font-medium text-muted-foreground/70">
						Nothing selected
					</EmptyTitle>
					<EmptyDescription className="text-base font-medium text-muted-foreground/70 max-w-[240px]">
						Select an item from the list to preview and manage it here.
					</EmptyDescription>
					<EmptyMedia className="max-w-[280px] max-h-[800px]">
						<img
							src={bubuntuSvg}
							alt=""
							className="w-full h-full object-contain opacity-30"
						/>
					</EmptyMedia>
				</EmptyHeader>
			</Empty>
		);
	}

	const folder = folders.find((f) => f.id === entry.folder_id);

	return (
		<ScrollArea className="flex-1 bg-background">
			<div className="flex flex-col bg-card">
				{/* Preview Image */}
				<div className="w-full aspect-video bg-muted flex items-center justify-center overflow-hidden border-b border-border">
					{entry.screenshot_path ? (
						<img
							src={entry.screenshot_path}
							alt={entry.title}
							className="w-full h-full object-cover"
						/>
					) : (
						<span className="text-sm text-muted-foreground">
							No preview available
						</span>
					)}
				</div>

				{/* Content */}
				<div className="p-5 flex flex-col gap-5">
					{/* Title + Source */}
					<div className="flex flex-col gap-1">
						<h1 className="text-base font-semibold leading-snug text-foreground">
							{entry.title}
						</h1>
						{entry.source_url && (
							<button
								className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors text-left"
								onClick={() =>
									window.electronAPI.openExternal(entry.source_url!)
								}
							>
								<ArrowSquareOut className="size-3.5 shrink-0" />
								<span className="truncate">{entry.source_url}</span>
							</button>
						)}
					</div>

					{/* Metadata Grid */}
					<div className="grid grid-cols-3 gap-3">
						<div className="flex flex-col gap-0.5">
							<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
								Type
							</span>
							<span className="text-sm text-foreground capitalize">
								{entry.type}
							</span>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
								Folder
							</span>
							<span className="text-sm text-foreground">
								{folder?.name ?? "Unorganized"}
							</span>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
								Date
							</span>
							<span className="text-sm text-foreground">
								{new Date(entry.created_at).toLocaleDateString()}
							</span>
						</div>
					</div>

					{/* Tags */}
					{entry.tags.length > 0 && (
						<div className="flex flex-col gap-1.5">
							<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
								Tags
							</span>
							<div className="flex flex-wrap gap-1.5">
								{entry.tags.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="text-xs font-normal"
									>
										#{tag}
									</Badge>
								))}
							</div>
						</div>
					)}

					<Separator />

					{/* Actions */}
					<div className="flex gap-2">
						{entry.source_url && (
							<Button
								size="sm"
								onClick={() =>
									window.electronAPI.openExternal(entry.source_url!)
								}
							>
								<ArrowSquareOut data-icon="inline-start" />
								Open
							</Button>
						)}
						<Button size="sm" variant="outline">
							<PencilSimple data-icon="inline-start" />
							Edit
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => onDeleteEntry(entry.id)}
						>
							<Trash data-icon="inline-start" />
							Move to Trash
						</Button>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
};

export default DetailPane;
