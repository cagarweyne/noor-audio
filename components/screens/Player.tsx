"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Cover } from "@/components/Cover";
import { formatTime } from "@/components/player";
import { usePlayer } from "@/components/player-context";
import type { Track } from "@/components/catalog";

type PlayerProps = {
  track: Track;
  prevSlug?: string;
  nextSlug?: string;
  backHref?: string; // where the back chevron returns to (the track's collection)
  collectionLabel?: string;
};

const SPEEDS = [1, 1.5, 2] as const;

// Now Playing view. The audio itself lives in PlayerProvider (so it survives
// navigation) — this screen just loads the track on mount and drives the
// shared player. Cover/ayah/title come from the page's own `track` prop.
export default function Player({
  track,
  prevSlug,
  nextSlug,
  backHref = "/library",
  collectionLabel = track.collection,
}: PlayerProps) {
  const player = usePlayer();
  const scrubRef = useRef<HTMLDivElement>(null);

  // Local UI-only toggles (not tied to audio).
  const [isLiked, setIsLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // Ensure this track is the one playing. If it's already current (e.g. the
  // user tapped the mini-player), leave it be so it keeps playing.
  useEffect(() => {
    if (player.track?.slug !== track.slug) {
      player.load(track, { autoplay: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.slug]);

  const isCurrent = player.track?.slug === track.slug;
  const resumeAt = Math.round((track.progress ?? 0) * track.durationSec);
  const position = isCurrent ? player.position : resumeAt;
  const duration = isCurrent ? player.duration || track.durationSec : track.durationSec;
  const isPlaying = isCurrent && player.isPlaying;
  const rate = isCurrent ? player.rate : 1;
  const volume = player.volume;
  const muted = player.muted;
  const pct = duration ? (position / duration) * 100 : 0;

  const onScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrubRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    player.seek(frac * duration);
  };

  return (
    <div
      className="min-h-full w-full"
      style={{
        backgroundImage: "linear-gradient(180deg, oklch(0.34 0.06 250), oklch(0.16 0.02 60) 62%)",
      }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pb-8 text-text-hi">
        {/* header */}
        <div className="flex items-center justify-between pt-3">
          <Link
            href={backHref}
            aria-label="Back to collection"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-text-hi backdrop-blur"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="text-center">
            <div className="font-mono text-[10px] tracking-[0.14em] text-white/70">
              PLAYING FROM COLLECTION
            </div>
            <div className="mt-0.5 text-[12.5px] font-bold">{collectionLabel}</div>
          </div>
          <div className="w-9" />
        </div>

        {/* cover */}
        <Cover
          hue={track.hue}
          className="mt-8 aspect-square w-full rounded-cover-lg shadow-cover-lg"
        />

        {/* ayah (Qur'an / du'a items only) */}
        {track.ayah && (
          <div className="mt-6 text-center">
            <div className="font-arabic text-[26px] leading-[1.7]" dir="rtl">
              {track.ayah}
            </div>
            {track.translation && (
              <div className="mt-1.5 font-display text-[13px] italic text-white/80">
                &ldquo;{track.translation}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* title */}
        <div className="mt-5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate font-display text-[23px] font-semibold">{track.title}</div>
            <div className="mt-0.5 text-sm text-white/80">{track.meta}</div>
          </div>
          <button
            aria-label={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
            onClick={() => setIsLiked((v) => !v)}
          >
            <Heart
              size={26}
              className="text-gold"
              strokeWidth={1.8}
              fill={isLiked ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* scrubber (draggable; thumb stays within the track) */}
        <div className="mt-5">
          <div ref={scrubRef} onClick={onScrubClick} className="relative h-1.5 cursor-pointer">
            <div className="absolute inset-y-0 my-auto h-1 w-full rounded bg-white/20" />
            <div
              className="absolute inset-y-0 my-auto h-1 rounded bg-gold"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-[13px] w-[13px] rounded-full bg-gold shadow"
              style={{ left: `${pct}%`, transform: `translate(-${pct}%, -50%)` }}
            />
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(duration))}
              step={1}
              value={Math.floor(position)}
              onChange={(e) => player.seek(Number(e.target.value))}
              aria-label="Seek"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-2 flex justify-between text-[11.5px] tabular-nums text-white/75">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* transport */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            aria-label="Shuffle"
            aria-pressed={shuffle}
            onClick={() => setShuffle((v) => !v)}
          >
            <Shuffle
              size={22}
              className={shuffle ? "text-gold" : "text-white/85"}
              strokeWidth={1.8}
            />
          </button>
          <Link
            href={prevSlug ? `/player/${prevSlug}` : "#"}
            aria-label="Previous"
            aria-disabled={!prevSlug}
            className={prevSlug ? "" : "pointer-events-none opacity-30"}
          >
            <SkipBack size={30} fill="currentColor" />
          </Link>
          <button
            onClick={player.toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-text-hi shadow-cover-lg"
          >
            {isPlaying ? (
              <Pause size={30} className="text-ink-contrast" fill="currentColor" />
            ) : (
              <Play size={30} className="ml-1 text-ink-contrast" fill="currentColor" />
            )}
          </button>
          <Link
            href={nextSlug ? `/player/${nextSlug}` : "#"}
            aria-label="Next"
            aria-disabled={!nextSlug}
            className={nextSlug ? "" : "pointer-events-none opacity-30"}
          >
            <SkipForward size={30} fill="currentColor" />
          </Link>
        </div>

        {/* speed + volume controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SPEEDS.map((r) => (
              <button
                key={r}
                onClick={() => player.setRate(r)}
                aria-pressed={rate === r}
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                  rate === r ? "bg-gold text-ink-contrast" : "bg-white/10 text-white/80"
                }`}
              >
                {r}×
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              onClick={player.toggleMuted}
              className="text-white/85"
            >
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-24 cursor-pointer accent-gold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
