import React from "react";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Square, X, Sun, Moon } from "@phosphor-icons/react";

const platform = window.electronAPI.platform;
const isMac = platform === "darwin";

interface TitleBarProps {
	isDark?: boolean;
	onToggleTheme?: () => void;
	onAddUrl?: () => void;
	onAddImage?: () => void;
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
	onAddUrl,
	onAddImage,
	className,
}) => {
	return (
		<div
			data-slot="titlebar"
			className={cn(
				"dark h-8 flex items-center bg-sidebar text-sidebar-foreground select-none",
				className,
			)}
			style={dragStyle}
		>
			{/* Left: macOS traffic-light padding + menubar */}
			<div
				className={cn(
					"flex items-center flex-1 h-full gap-1",
					isMac ? "pl-[80px]" : "pl-2",
				)}
			>
				<Menubar
					className="border-0 bg-transparent p-0 rounded-none h-7 gap-0"
					style={noDragStyle}
				>
					<MenubarMenu>
						<MenubarTrigger className="rounded-md px-2.5 py-0.5 text-[13px] font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
							File
						</MenubarTrigger>
						<MenubarContent className="min-w-40">
							<MenubarItem onSelect={onAddUrl}>Add URL</MenubarItem>
							<MenubarItem onSelect={onAddImage}>Add Image</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onSelect={() => window.electronAPI.closeWindow()}>
								Exit
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger className="rounded-md px-2.5 py-0.5 text-[13px] font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
							View
						</MenubarTrigger>
						<MenubarContent className="min-w-40">
							<MenubarItem onSelect={onToggleTheme}>
								{isDark ? "Light Mode" : "Dark Mode"}
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
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
