import React from "react";
import type { Entry, Folder } from "../App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	ArrowSquareOut,
	PencilSimple,
	Trash,
} from "@phosphor-icons/react";

interface LightboxProps {
	entry: Entry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folders: Folder[];
	onDeleteEntry: (id: number) => void;
	onEditEntry: (entry: Entry) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
	entry,
	open,
	onOpenChange,
	folders,
	onDeleteEntry,
	onEditEntry,
}) => {
	const folder = entry
		? folders.find((f) => f.id === entry.folder_id)
		: null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="sm:max-w-[450px] w-full p-0 flex flex-col"
				showCloseButton={false}
			>
				{entry && (
					<>
						{/* Hero Screenshot */}
						<div className="aspect-video bg-muted flex items-center justify-center overflow-hidden shrink-0">
							{entry.screenshot_path ? (
								<img
									src={entry.screenshot_path}
									alt={entry.title}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-sm text-muted-foreground">
									No preview
								</span>
							)}
						</div>

						<ScrollArea className="flex-1">
							<div className="p-5 flex flex-col gap-4">
								{/* Title */}
								<div className="flex flex-col gap-1">
									<h1 className="text-base font-semibold leading-snug text-foreground pr-6">
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

								<Separator />

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

								{/* Notes */}
								<div className="flex flex-col gap-1.5">
									<span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
										Notes
									</span>
									<Textarea
										placeholder="Why did you save this? Add your notes here..."
										className="min-h-20 text-sm"
									/>
								</div>

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
									<Button
										size="sm"
										variant="outline"
										onClick={() => onEditEntry(entry)}
									>
										<PencilSimple data-icon="inline-start" />
										Edit
									</Button>
									<Button
										size="sm"
										variant="destructive"
										onClick={() => onDeleteEntry(entry.id)}
									>
										<Trash data-icon="inline-start" />
										Trash
									</Button>
								</div>
							</div>
						</ScrollArea>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
};

export default Lightbox;
