import React from "react";
import type { Entry, Folder } from "../App";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
} from "@/components/ui/sheet";
import { ArrowSquareOut, Trash } from "@phosphor-icons/react";

interface LightboxProps {
	entry: Entry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folders: Folder[];
	onDeleteEntry: (id: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
	entry,
	open,
	onOpenChange,
	folders,
	onDeleteEntry,
}) => {
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
								<h1 className="text-base font-semibold leading-snug text-foreground pr-6">
									{entry.title}
								</h1>

								{/* Source URL */}
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

								{/* Date Added */}
								<div className="text-xs text-muted-foreground">
									Added {new Date(entry.created_at).toLocaleDateString()}
								</div>

								{/* Actions */}
								<div className="flex gap-2 pt-2">
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
										variant="destructive"
										onClick={() => onDeleteEntry(entry.id)}
									>
										<Trash data-icon="inline-start" />
										Delete
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
