"use client";

import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  ArrowDownToLine,
} from "lucide-react";
import { Cover } from "@/components/Cover";

type PlayerTrack = {
  surah: string;
  meta: string;
  hue: number;
  ayah: string;
  translation: string;
};

type PlayerProps = {
  track?: PlayerTrack;
  position?: number;
  duration?: number;
  isPlaying?: boolean;
  onToggle?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const DEFAULT_TRACK: PlayerTrack = {
  surah: "Surah An-Naba'",
  meta: "Murattal · Verse 1 of 40",
  hue: 78,
  ayah: "عَمَّ يَتَسَاءَلُونَ",
  translation: "About what are they asking one another?",
};

// Now Playing. Wire props to your player store.
export default function Player({
  track = DEFAULT_TRACK,
  position = 72,
  duration = 201,
  isPlaying = true,
  onToggle,
  onPrev,
  onNext,
}: PlayerProps) {
  const pct = duration ? (position / duration) * 100 : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      className="flex h-full flex-col px-6 text-text-hi"
      style={{
        backgroundImage: "linear-gradient(180deg, oklch(0.34 0.06 250), oklch(0.16 0.02 60) 62%)",
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between pt-2">
        <button aria-label="Collapse">
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.14em] text-white/70">
            PLAYING FROM COLLECTION
          </div>
          <div className="mt-0.5 text-[12.5px] font-bold">Juz' Amma</div>
        </div>
        <button aria-label="More">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* cover */}
      <Cover hue={track.hue} className="mt-8 aspect-square w-full rounded-cover-lg shadow-cover-lg" />

      {/* ayah */}
      <div className="mt-6 text-center">
        <div className="font-arabic text-[26px] leading-[1.7]" dir="rtl">
          {track.ayah}
        </div>
        <div className="mt-1.5 font-display text-[13px] italic text-white/80">
          &ldquo;{track.translation}&rdquo;
        </div>
      </div>

      {/* title */}
      <div className="mt-5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-[23px] font-semibold">{track.surah}</div>
          <div className="mt-0.5 text-sm text-white/80">{track.meta}</div>
        </div>
        <button aria-label="Like">
          <Heart size={26} className="text-gold" strokeWidth={1.8} />
        </button>
      </div>

      {/* scrubber */}
      <div className="mt-5">
        <div className="relative h-1 rounded bg-white/20">
          <div className="h-full rounded bg-gold" style={{ width: `${pct}%` }} />
          <div
            className="absolute top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11.5px] tabular-nums text-white/75">
          <span>{fmt(position)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* transport */}
      <div className="mt-4 flex items-center justify-between">
        <button aria-label="Shuffle">
          <Shuffle size={22} className="text-white/85" strokeWidth={1.8} />
        </button>
        <button aria-label="Previous" onClick={onPrev}>
          <SkipBack size={30} fill="currentColor" />
        </button>
        <button
          onClick={onToggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-text-hi shadow-cover-lg"
        >
          {isPlaying ? (
            <Pause size={30} className="text-ink-contrast" fill="currentColor" />
          ) : (
            <Play size={30} className="text-ink-contrast" fill="currentColor" />
          )}
        </button>
        <button aria-label="Next" onClick={onNext}>
          <SkipForward size={30} fill="currentColor" />
        </button>
        <button aria-label="Download">
          <ArrowDownToLine size={22} className="text-white/85" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
