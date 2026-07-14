"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { Cover } from "@/components/Cover";
import { usePlayer } from "@/components/player-context";

// Floating mini-player shown above the BottomNav on mobile. Reflects the shared
// player; tapping it opens the full player, the button toggles play/pause.
export default function MiniPlayer() {
  const { track, isPlaying, position, duration, currentHref, toggle } = usePlayer();
  const pathname = usePathname();

  // Hide on the full player page — it's already the player there.
  if (!track || pathname.startsWith("/player/")) return null;

  const pct = duration ? (position / duration) * 100 : 0;

  return (
    <Link
      href={currentHref ?? "#"}
      className="relative mx-2 mb-1 flex h-[60px] items-center gap-[11px] rounded-[15px] bg-surface-3 px-3 no-underline shadow-cover"
    >
      <Cover hue={track.hue} className="h-[42px] w-[42px] flex-shrink-0 rounded-[9px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-text-hi">{track.title}</div>
        <div className="truncate text-[11.5px] text-text-mid">{track.meta}</div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="text-text-hi"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      </button>
      <div className="absolute inset-x-3 bottom-1.5 h-[2.5px] rounded bg-white/15">
        <div className="h-full rounded bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
