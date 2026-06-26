import React from "react";
import type { Entry } from "../App";
import { cn } from "@/lib/utils";
import { Link, Image } from "@phosphor-icons/react";

interface BlockCardProps {
	entry: Entry;
	onClick: (entry: Entry) => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ entry, onClick }) => {
	return (
		<div
			onClick={() => onClick(entry)}
			className={cn(
				"group cursor-pointer rounded-lg overflow-hidden",
				"hover:opacity-80 transition-opacity duration-150",
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

			{/* Title only */}
			<div className="p-2">
				<h3 className="text-[13px] leading-snug text-foreground line-clamp-2">
					{entry.title}
				</h3>
			</div>
		</div>
	);
};

export default BlockCard;
