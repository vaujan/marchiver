import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Square, X, Sun, Moon } from "@phosphor-icons/react";
import type { Entry, Folder, Tag } from "../App";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const platform = window.electronAPI.platform;
const isMac = platform === "darwin";

interface TitleBarProps {
	isDark?: boolean;
	onToggleTheme?: () => void;
	className?: string;
	trashView?: boolean;
	activeFolder?: number | null;
	activeTag?: number | null;
	selectedEntry?: Entry | null;
	folders?: Folder[];
	tags?: Tag[];
	onNavigateToAll?: () => void;
	onNavigateToFolder?: (folderId: number) => void;
}

const dragStyle: React.CSSProperties = {
	WebkitAppRegion: "drag",
} as React.CSSProperties;
const noDragStyle: React.CSSProperties = {
	WebkitAppRegion: "no-drag",
} as React.CSSProperties;

const WindowControls: React.FC = () => (
	<div className="flex items-center">
		<Button
			variant="ghost"
			size="icon-sm"
			className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={() => window.electronAPI.minimizeWindow()}
		>
			<Minus className="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={() => window.electronAPI.maximizeWindow()}
		>
			<Square className="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
			onClick={() => window.electronAPI.closeWindow()}
		>
			<X className="size-4" />
		</Button>
	</div>
);

function getFolderPathSegments(
	folderId: number | null,
	folders: Folder[],
): Folder[] {
	if (folderId === null) return [];
	const folder = folders.find((f) => f.id === folderId);
	if (!folder) return [];
	const segments: Folder[] = [folder];
	let current = folder;
	let depth = 0;
	while (current.parent_id !== null && depth < 100) {
		const parent = folders.find((f) => f.id === current.parent_id);
		if (!parent) break;
		segments.unshift(parent);
		current = parent;
		depth++;
	}
	return segments;
}

const TitleBar: React.FC<TitleBarProps> = ({
	isDark,
	onToggleTheme,
	className,
	trashView = false,
	activeFolder = null,
	activeTag = null,
	selectedEntry = null,
	folders = [],
	tags = [],
	onNavigateToAll,
	onNavigateToFolder,
}) => {
	const breadcrumbItems = React.useMemo(() => {
		const items: React.ReactNode[] = [];

		if (selectedEntry) {
			const folderSegments = getFolderPathSegments(selectedEntry.folder_id, folders);

			if (folderSegments.length > 0) {
				items.push(
					<BreadcrumbItem key="all">
						{onNavigateToAll ? (
							<BreadcrumbLink
								render={
									<span
										className="cursor-pointer"
										onClick={onNavigateToAll}
									>
										All Items
									</span>
								}
							/>
						) : (
							<span className="text-sidebar-foreground/60">All Items</span>
						)}
					</BreadcrumbItem>,
				);
				items.push(<BreadcrumbSeparator key="sep-all" />);

				folderSegments.forEach((folder, index) => {
					const isLast = index === folderSegments.length - 1;
					items.push(
						<BreadcrumbItem key={`folder-${folder.id}`}>
							{onNavigateToFolder && !isLast ? (
								<BreadcrumbLink
									render={
										<span
											className="cursor-pointer"
											onClick={() => onNavigateToFolder(folder.id)}
										>
											{folder.name}
										</span>
									}
								/>
							) : (
								<span className="text-sidebar-foreground/60">{folder.name}</span>
							)}
						</BreadcrumbItem>,
					);
					if (!isLast) {
						items.push(<BreadcrumbSeparator key={`sep-folder-${folder.id}`} />);
					}
				});
			}

			items.push(
				<BreadcrumbItem key="entry">
					<BreadcrumbPage className="text-sidebar-foreground/60">
						{selectedEntry.title}
					</BreadcrumbPage>
				</BreadcrumbItem>,
			);
		} else if (trashView) {
			items.push(
				<BreadcrumbItem key="trash">
					<BreadcrumbPage className="text-sidebar-foreground/60">
						Trash
					</BreadcrumbPage>
				</BreadcrumbItem>,
			);
		} else if (activeFolder !== null) {
			const folderSegments = getFolderPathSegments(activeFolder, folders);

			if (folderSegments.length > 0) {
				items.push(
					<BreadcrumbItem key="all">
						{onNavigateToAll ? (
							<BreadcrumbLink
								render={
									<span
										className="cursor-pointer"
										onClick={onNavigateToAll}
									>
										All Items
									</span>
								}
							/>
						) : (
							<span className="text-sidebar-foreground/60">All Items</span>
						)}
					</BreadcrumbItem>,
				);
				items.push(<BreadcrumbSeparator key="sep-all" />);

				folderSegments.forEach((folder, index) => {
					const isLast = index === folderSegments.length - 1;
					items.push(
						<BreadcrumbItem key={`folder-${folder.id}`}>
							{onNavigateToFolder && !isLast ? (
								<BreadcrumbLink
									render={
										<span
											className="cursor-pointer"
											onClick={() => onNavigateToFolder(folder.id)}
										>
											{folder.name}
										</span>
									}
								/>
							) : isLast ? (
								<BreadcrumbPage className="text-sidebar-foreground/60">
									{folder.name}
								</BreadcrumbPage>
							) : (
								<span className="text-sidebar-foreground/60">
									{folder.name}
								</span>
							)}
						</BreadcrumbItem>,
					);
					if (!isLast) {
						items.push(<BreadcrumbSeparator key={`sep-folder-${folder.id}`} />);
					}
				});
			}
		} else if (activeTag !== null) {
			const tag = tags.find((t) => t.id === activeTag);
			if (tag) {
				items.push(
					<BreadcrumbItem key="tag">
						<BreadcrumbPage className="text-sidebar-foreground/60">
							Tag: {tag.name}
						</BreadcrumbPage>
					</BreadcrumbItem>,
				);
			}
		}

		return items;
	}, [
		trashView,
		activeFolder,
		activeTag,
		folders,
		tags,
		selectedEntry,
		onNavigateToAll,
		onNavigateToFolder,
	]);

	return (
		<div
			data-slot="titlebar"
			className={cn(
				"h-10 flex items-center bg-card border-border/50 text-sidebar-foreground select-none",
				className,
			)}
			style={dragStyle}
		>
			{/* Left: breadcrumb path */}
			<div
				className={cn(
					"flex items-center flex-1 h-full gap-1",
					isMac ? "pl-[80px]" : "pl-3",
				)}
			>
				{breadcrumbItems.length > 0 && (
					<Breadcrumb>
						<BreadcrumbList className="text-[11px] font-medium">
							{breadcrumbItems}
						</BreadcrumbList>
					</Breadcrumb>
				)}
			</div>

			{/* Right: theme toggle + window controls */}
			<div className="flex items-center h-full pr-0">
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
					onClick={onToggleTheme}
					title={isDark ? "Switch to light mode" : "Switch to dark mode"}
					style={noDragStyle}
				>
					{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
				</Button>

				{!isMac && (
					<div style={noDragStyle}>
						<WindowControls />
					</div>
				)}
			</div>
		</div>
	);
};

export default TitleBar;
