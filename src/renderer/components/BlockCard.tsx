import React from "react";
import type { Entry } from "../App";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/date-utils";
import { Link, Image } from "@phosphor-icons/react";

interface BlockCardProps {
	entry: Entry;
	onClick: (entry: Entry) => void;
}

const extractDomain = (url: string | null): string | null => {
	if (!url) return null;
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
};

const BlockCard: React.FC<BlockCardProps> = ({ entry, onClick }) => {
	const domain = extractDomain(entry.source_url);
	const hasScreenshot =
		!!entry.screenshot_path || entry.type === "image";
	const visibleTags = entry.tags.slice(0, 3);
	const extraTagCount = entry.tags.length - 3;

	return (
		<div
			onClick={() => onClick(entry)}
			className={cn(
				"group cursor-pointer rounded-xl border border-border bg-card overflow-hidden",
				"hover:border-primary/30 hover:shadow-sm transition-all duration-150",
				"flex flex-col"
			)}
		>
			{/* Screenshot / Placeholder */}
			<div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
				{entry.screenshot_path ? (
					<img
						src={entry.screenshot_path}
						alt={entry.title}
						className="w-full h-full object-cover"
						loading="lazy"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
						}}
					/>
				) : (
					<div className="text-muted-foreground/40">
						{entry.type === "image" ? (
							<Image className="size-8" weight="duotone" />
						) : (
							<Link className="size-8" weight="duotone" />
						)}
					</div>
				)}
			</div>

			{/* Info section */}
			<div className="flex flex-col gap-1.5 p-3 min-w-0">
				{/* Domain */}
				{domain && (
					<span className="text-[11px] font-medium text-muted-foreground truncate">
						{domain}
					</span>
				)}

				{/* Title */}
				<h3 className="text-[13px] font-semibold leading-snug text-foreground line-clamp-2">
					{entry.title}
				</h3>

				{/* Tags + Date */}
				<div className="flex items-center gap-2 flex-wrap min-w-0">
					{visibleTags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="text-[10px] px-1.5 py-0 h-4 font-normal"
						>
							{tag}
						</Badge>
					))}
					{extraTagCount > 0 && (
						<span className="text-[10px] text-muted-foreground">
							+{extraTagCount}
						</span>
					)}
				</div>

				{/* Date */}
				<span className="text-[11px] text-muted-foreground">
					{formatRelativeDate(entry.created_at)}
				</span>
			</div>
		</div>
	);
};

export default BlockCard;
