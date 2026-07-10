"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Cover } from "@/components/Cover";
import { DEMO_NOW_PLAYING, type NowPlaying } from "@/components/player";

type MiniPlayerProps = {
  track?: NowPlaying;
};

// Floating mini-player shown above the BottomNav on mobile.
export default function MiniPlayer({ track = DEMO_NOW_PLAYING }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const pct = track.duration ? (track.position / track.duration) * 100 : 0;

  return (
    <div className="relative mx-2 flex h-[60px] items-center gap-[11px] rounded-[15px] bg-surface-3 px-3 shadow-cover">
      <Cover hue={track.hue} className="h-[42px] w-[42px] flex-shrink-0 rounded-[9px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-text-hi">{track.title}</div>
        <div className="truncate text-[11.5px] text-text-mid">{track.subtitle}</div>
      </div>
      <button
        onClick={() => setIsPlaying((v) => !v)}
        className="text-text-hi"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      </button>
      <div className="absolute inset-x-3 bottom-1.5 h-[2.5px] rounded bg-white/15">
        <div className="h-full rounded bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
