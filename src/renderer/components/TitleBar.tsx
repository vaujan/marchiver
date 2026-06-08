import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Square, X, Sun, Moon } from "@phosphor-icons/react";
import type { Folder, Tag } from "../App";

const platform = window.electronAPI.platform;
const isMac = platform === "darwin";

interface TitleBarProps {
	isDark?: boolean;
	onToggleTheme?: () => void;
	className?: string;
	trashView?: boolean;
	activeFolder?: number | null;
	activeTag?: number | null;
	folders?: Folder[];
	tags?: Tag[];
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
			className="h-8 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={() => window.electronAPI.minimizeWindow()}
		>
			<Minus className="size-4" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			className="h-8 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={() => window.electronAPI.maximizeWindow()}
		>
			<Square className="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			className="h-8 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
			onClick={() => window.electronAPI.closeWindow()}
		>
			<X className="size-4" />
		</Button>
	</div>
);

const TitleBar: React.FC<TitleBarProps> = ({
	isDark,
	onToggleTheme,
	className,
	trashView = false,
	activeFolder = null,
	activeTag = null,
	folders = [],
	tags = [],
}) => {
	const breadcrumb = React.useMemo(() => {
		if (trashView) return "Trash";
		if (activeFolder !== null) {
			const folder = folders.find((f) => f.id === activeFolder);
			if (folder) return folder.name;
		}
		if (activeTag !== null) {
			const tag = tags.find((t) => t.id === activeTag);
			if (tag) return `Tag: ${tag.name}`;
		}
		return "All Items";
	}, [trashView, activeFolder, activeTag, folders, tags]);

	return (
		<div
			data-slot="titlebar"
			className={cn(
				"h-8 flex items-center border-b bg-card border-border/50 text-sidebar-foreground select-none",
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
				<span className="text-[11px] font-medium text-sidebar-foreground/60 truncate">
					{breadcrumb}
				</span>
			</div>

			{/* Right: theme toggle + window controls */}
			<div className="flex items-center h-full pr-0">
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-8 w-8 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
