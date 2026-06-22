import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PaintBrush, X } from "@phosphor-icons/react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fontFamily: string;
	onFontChange: (font: string) => void;
	colorScheme: string;
	onColorChange: (color: string) => void;
}

const SETTINGS_CATEGORIES = [
	{ id: "appearance", label: "Appearance", icon: PaintBrush },
] as const;

type SettingsCategory = (typeof SETTINGS_CATEGORIES)[number]["id"];

const FONT_OPTIONS = [
	{
		value: "inter",
		label: "Inter",
		css: '"Inter Variable", "Inter", sans-serif',
	},
	{ value: "system", label: "System Default", css: "system-ui, sans-serif" },
	{ value: "arial", label: "Arial", css: "Arial, sans-serif" },
	{ value: "helvetica", label: "Helvetica", css: "Helvetica, sans-serif" },
	{ value: "segoe", label: "Segoe UI", css: '"Segoe UI", sans-serif' },
] as const;

const COLOR_PRESETS = [
	{
		value: "default",
		label: "Red",
		light: "oklch(0.58 0.12 25)",
		dark: "oklch(0.58 0.12 25)",
	},
	{
		value: "orange",
		label: "Orange",
		light: "oklch(0.65 0.15 50)",
		dark: "oklch(0.65 0.15 50)",
	},
	{
		value: "yellow",
		label: "Yellow",
		light: "oklch(0.7 0.14 85)",
		dark: "oklch(0.7 0.14 85)",
	},
	{
		value: "green",
		label: "Green",
		light: "oklch(0.55 0.15 155)",
		dark: "oklch(0.55 0.15 155)",
	},
	{
		value: "blue",
		label: "Blue",
		light: "oklch(0.55 0.15 250)",
		dark: "oklch(0.55 0.15 250)",
	},
	{
		value: "purple",
		label: "Purple",
		light: "oklch(0.5 0.15 300)",
		dark: "oklch(0.5 0.15 300)",
	},
] as const;

const SWATCH_COLORS: Record<string, string> = {
	default: "#c43e3e",
	orange: "#d97706",
	yellow: "#ca8a04",
	green: "#16a34a",
	blue: "#2563eb",
	purple: "#9333ea",
};

function SettingsDialog({
	open,
	onOpenChange,
	fontFamily,
	onFontChange,
	colorScheme,
	onColorChange,
}: SettingsDialogProps) {
	const [activeCategory, setActiveCategory] =
		useState<SettingsCategory>("appearance");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPortal>
				<BaseDialog.Backdrop className="fixed inset-0 isolate z-50 bg-black/30 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
				<BaseDialog.Popup
					className={cn(
						"fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[min(var(--radius-4xl),24px)] bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:ring-foreground/10",
						"max-w-[800px] h-[560px] overflow-hidden p-0",
					)}
				>
					<div className="flex h-full">
						{/* Left panel: categories */}
						<div className="w-[220px] flex-shrink-0 bg-sidebar">
							<div className="flex items-center justify-between px-4 py-3">
								<span className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
									Options
								</span>
							</div>
							<ScrollArea className="flex-1 h-[calc(100%-41px)]">
								<nav className="flex flex-col gap-0.5 p-2">
									{SETTINGS_CATEGORIES.map((category) => {
										const Icon = category.icon;
										return (
											<button
												key={category.id}
												onClick={() => setActiveCategory(category.id)}
												className={cn(
													"flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[13px] text-left transition-colors",
													activeCategory === category.id
														? "bg-sidebar-accent text-sidebar-accent-foreground"
														: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
												)}
											>
												<Icon
													weight="duotone"
													className="size-4 flex-shrink-0"
												/>
												{category.label}
											</button>
										);
									})}
								</nav>
							</ScrollArea>
						</div>

						{/* Right panel: content */}
						<div className="flex-1 flex flex-col min-w-0 relative">
							<BaseDialog.Close
								render={
									<Button
										variant="ghost"
										size="icon-sm"
										className="absolute top-3 right-3 z-10 bg-secondary"
									/>
								}
							>
								<X />
								<span className="sr-only">Close</span>
							</BaseDialog.Close>

							<ScrollArea className="flex-1">
								<div className="px-6 py-5">
									<FieldGroup>
										{/* Font setting */}
										<Field>
											<FieldLabel>Font</FieldLabel>
											<Select
												value={fontFamily}
												onValueChange={(val) => onFontChange(val as string)}
											>
												<SelectTrigger className="w-[200px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{FONT_OPTIONS.map((font) => (
														<SelectItem key={font.value} value={font.value}>
															{font.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>

										{/* Color setting */}
										<Field>
											<FieldLabel>Accent Color</FieldLabel>
											<div className="flex items-center gap-2">
												{COLOR_PRESETS.map((preset) => (
													<button
														key={preset.value}
														onClick={() => onColorChange(preset.value)}
														title={preset.label}
														className={cn(
															"size-8 rounded-full border-2 transition-all",
															colorScheme === preset.value
																? "border-foreground scale-110"
																: "border-transparent hover:border-foreground/30",
														)}
														style={{
															backgroundColor: SWATCH_COLORS[preset.value],
														}}
													/>
												))}
											</div>
										</Field>
									</FieldGroup>
								</div>
							</ScrollArea>
						</div>
					</div>
				</BaseDialog.Popup>
			</DialogPortal>
		</Dialog>
	);
}

export default SettingsDialog;
