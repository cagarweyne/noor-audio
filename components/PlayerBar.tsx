"use client";

import Link from "next/link";
import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Cover } from "@/components/Cover";
import { formatTime } from "@/components/player";
import { usePlayer } from "@/components/player-context";

// Docked player bar for tablet (md) and desktop (lg). Reflects the shared
// player; the now-playing area links to the full player.
export default function PlayerBar() {
  const {
    track,
    isPlaying,
    position,
    duration,
    volume,
    muted,
    currentHref,
    prevHref,
    nextHref,
    toggle,
    seek,
    setVolume,
    toggleMuted,
  } = usePlayer();
  if (!track) return null;

  const pct = duration ? (position / duration) * 100 : 0;

  return (
    <div className="flex h-[84px] shrink-0 items-center gap-4 border-t border-line bg-surface/70 px-4 backdrop-blur-md lg:px-6">
      {/* now playing → opens the full player */}
      <Link
        href={currentHref ?? "#"}
        className="flex w-[34%] min-w-0 items-center gap-3 no-underline lg:w-[30%]"
      >
        <Cover hue={track.hue} className="h-12 w-12 shrink-0 rounded-[10px] shadow-cover" />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-bold text-text-hi">{track.title}</div>
          <div className="truncate text-[11.5px] text-text-mid">{track.meta}</div>
        </div>
      </Link>

      {/* transport + scrubber */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-5 text-text-hi">
          <Link
            href={prevHref ?? "#"}
            aria-label="Previous"
            aria-disabled={!prevHref}
            className={`text-text-mid hover:text-text-hi ${prevHref ? "" : "pointer-events-none opacity-30"}`}
          >
            <SkipBack size={20} fill="currentColor" />
          </Link>
          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink-contrast shadow-glow"
          >
            {isPlaying ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <Link
            href={nextHref ?? "#"}
            aria-label="Next"
            aria-disabled={!nextHref}
            className={`text-text-mid hover:text-text-hi ${nextHref ? "" : "pointer-events-none opacity-30"}`}
          >
            <SkipForward size={20} fill="currentColor" />
          </Link>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2 text-[11px] tabular-nums text-text-mid">
          <span>{formatTime(position)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration))}
            step={1}
            value={Math.floor(position)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1 flex-1 cursor-pointer accent-gold"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* volume (desktop only) */}
      <div className="hidden w-[30%] items-center justify-end gap-2 text-text-mid lg:flex">
        <button
          onClick={toggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="hover:text-text-hi"
        >
          {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="w-24 cursor-pointer accent-gold"
        />
      </div>
    </div>
  );
}
