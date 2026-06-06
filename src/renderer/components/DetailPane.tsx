import React from "react";
import type { Entry, Folder, Tag } from "../App";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Package, ExternalLink, Pencil, Trash2 } from "lucide-react";

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
			<Empty className="h-full flex-1 border-none">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Package />
					</EmptyMedia>
					<EmptyTitle>marchiver</EmptyTitle>
					<EmptyDescription>Select an item to view details</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const folder = folders.find((f) => f.id === entry.folder_id);

	return (
		<ScrollArea className="flex-1 bg-background">
			<Card className="border-none shadow-none">
				<CardContent className="p-6">
					<div className="w-full aspect-video bg-muted rounded-lg mb-5 flex items-center justify-center overflow-hidden">
						{entry.screenshot_path ? (
							<img
								src={entry.screenshot_path}
								alt={entry.title}
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-sm text-muted-foreground">No preview available</span>
						)}
					</div>

					<Field>
						<FieldLabel>Title</FieldLabel>
						<div className="text-sm text-foreground">{entry.title}</div>
					</Field>

					{entry.source_url && (
						<Field>
							<FieldLabel>Source</FieldLabel>
							<Button
								variant="link"
								className="h-auto p-0 text-sm"
								onClick={() => window.electronAPI.openExternal(entry.source_url!)}
							>
								<ExternalLink data-icon="inline-start" />
								{entry.source_url}
							</Button>
						</Field>
					)}

					<Field>
						<FieldLabel>Type</FieldLabel>
						<div className="text-sm text-foreground capitalize">{entry.type}</div>
					</Field>

					<Field>
						<FieldLabel>Folder</FieldLabel>
						<div className="text-sm text-foreground">{folder?.name ?? "Unorganized"}</div>
					</Field>

					<Field>
						<FieldLabel>Date</FieldLabel>
						<div className="text-sm text-foreground">{new Date(entry.created_at).toLocaleString()}</div>
					</Field>

					{entry.tags.length > 0 && (
						<Field>
							<FieldLabel>Tags</FieldLabel>
							<div className="flex flex-wrap gap-1.5">
								{entry.tags.map((tag) => (
									<Badge key={tag} variant="secondary">{tag}</Badge>
								))}
							</div>
						</Field>
					)}

					<Separator className="my-4" />

					<div className="flex gap-2">
						{entry.source_url && (
							<Button onClick={() => window.electronAPI.openExternal(entry.source_url!)}>
								<ExternalLink data-icon="inline-start" />
								Open in Browser
							</Button>
						)}
						<Button variant="outline">
							<Pencil data-icon="inline-start" />
							Edit
						</Button>
						<Button variant="destructive" onClick={() => onDeleteEntry(entry.id)}>
							<Trash2 data-icon="inline-start" />
							Move to Trash
						</Button>
					</div>
				</CardContent>
			</Card>
		</ScrollArea>
	);
};

export default DetailPane;
