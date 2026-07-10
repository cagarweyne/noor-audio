"use client";

import { useState } from "react";
import {
  Heart,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  ListMusic,
  Volume2,
} from "lucide-react";
import { Cover } from "@/components/Cover";
import { DEMO_NOW_PLAYING, formatTime, type NowPlaying } from "@/components/player";

type PlayerBarProps = {
  track?: NowPlaying;
};

// Docked player bar for tablet (md) and desktop (lg).
// md: now-playing + centered transport. lg: adds shuffle/repeat + volume/queue.
export default function PlayerBar({ track = DEMO_NOW_PLAYING }: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const pct = track.duration ? (track.position / track.duration) * 100 : 0;

  return (
    <div className="flex h-[84px] shrink-0 items-center gap-4 border-t border-line bg-surface/70 px-4 backdrop-blur-md lg:px-6">
      {/* now playing */}
      <div className="flex w-[34%] min-w-0 items-center gap-3 lg:w-[30%]">
        <Cover hue={track.hue} className="h-12 w-12 shrink-0 rounded-[10px] shadow-cover" />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-bold text-text-hi">{track.title}</div>
          <div className="truncate text-[11.5px] text-text-mid">{track.subtitle}</div>
        </div>
        <button aria-label="Like" className="ml-1 hidden text-text-mid hover:text-gold lg:block">
          <Heart size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* transport + scrubber */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-5 text-text-hi">
          <button aria-label="Shuffle" className="hidden text-text-mid hover:text-text-hi lg:block">
            <Shuffle size={18} strokeWidth={1.8} />
          </button>
          <button aria-label="Previous" className="text-text-mid hover:text-text-hi">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={() => setIsPlaying((v) => !v)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink-contrast shadow-glow"
          >
            {isPlaying ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button aria-label="Next" className="text-text-mid hover:text-text-hi">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button aria-label="Repeat" className="hidden text-text-mid hover:text-text-hi lg:block">
            <Repeat size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2 text-[11px] tabular-nums text-text-mid">
          <span>{formatTime(track.position)}</span>
          <div className="relative h-1 flex-1 rounded bg-line">
            <div className="h-full rounded bg-gold" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
              style={{ left: `${pct}%` }}
            />
          </div>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* volume + queue (desktop only) */}
      <div className="hidden w-[30%] items-center justify-end gap-4 lg:flex">
        <button aria-label="Queue" className="text-text-mid hover:text-text-hi">
          <ListMusic size={18} strokeWidth={1.8} />
        </button>
        <div className="flex items-center gap-2 text-text-mid">
          <Volume2 size={18} strokeWidth={1.8} />
          <div className="relative h-1 w-24 rounded bg-line">
            <div className="h-full w-2/3 rounded bg-text-mid" />
          </div>
        </div>
      </div>
    </div>
  );
}
