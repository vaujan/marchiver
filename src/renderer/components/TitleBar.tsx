import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Square, X, Sun, Moon, GearSix } from "@phosphor-icons/react";

const platform = window.electronAPI.platform;
const isMac = platform === "darwin";

interface TitleBarProps {
	isDark?: boolean;
	onToggleTheme?: () => void;
	onSettingsOpen?: () => void;
	className?: string;
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
			className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
			onClick={() => window.electronAPI.closeWindow()}
		>
			<X className="size-4" />
		</Button>
	</div>
);

const TitleBar: React.FC<TitleBarProps> = ({
	isDark,
	onToggleTheme,
	onSettingsOpen,
	className,
}) => {
	return (
		<div
			data-slot="titlebar"
			className={cn(
				"h-10 flex items-center bg-card border-border/50 text-sidebar-foreground select-none",
				className,
			)}
			style={dragStyle}
		>
			{/* Spacer for Mac traffic lights */}
			{isMac && <div className="w-[80px] shrink-0" />}

			{/* Title */}
			<div className="flex-1 min-w-0" />

			{/* Right: theme toggle + settings + window controls */}
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
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-10 w-10 rounded-none text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
					onClick={onSettingsOpen}
					title="Settings"
					style={noDragStyle}
				>
					<GearSix className="size-4" />
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
