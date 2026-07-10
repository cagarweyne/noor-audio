import Link from "next/link";
import { Cover, type CoverItem } from "@/components/Cover";

type CoverCardProps = {
  item: CoverItem;
  size?: number;
  showProgress?: boolean;
  href?: string;
};

// Vertical cover card used in "Jump back in" / "Popular series" scrollers.
// Pass `progress` (0–1) on the item to show the resume bar overlay.
export default function CoverCard({
  item,
  size = 150,
  showProgress = false,
  href = "#",
}: CoverCardProps) {
  const { title, subtitle, hue, cover, progress = 0 } = item;
  return (
    <Link href={href} className="block flex-shrink-0 no-underline" style={{ width: size }}>
      <div className="relative rounded-cover shadow-cover" style={{ width: size, height: size }}>
        <Cover hue={hue} src={cover} className="h-full w-full rounded-cover" />
        {showProgress && (
          <div className="absolute inset-x-2 bottom-2 h-1 rounded bg-white/25">
            <div className="h-full rounded bg-gold" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>
      <div className="mt-[9px] text-[13.5px] font-bold leading-tight text-text-hi">{title}</div>
      {subtitle && <div className="mt-0.5 text-xs text-text-mid">{subtitle}</div>}
    </Link>
  );
}
