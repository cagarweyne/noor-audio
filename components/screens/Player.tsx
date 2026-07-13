"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactPlayer from "react-player";
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
import type { Track } from "@/components/catalog";

type PlayerProps = {
  track: Track;
  prevSlug?: string;
  nextSlug?: string;
  backHref?: string; // where the back chevron returns to (the track's collection)
  collectionLabel?: string;
};

const SPEEDS = [1, 1.5, 2] as const;

// Persisted resume position, so a track reopens where you left off.
const posKey = (slug: string) => `noor-player-pos:${slug}`;

export default function Player({
  track,
  prevSlug,
  nextSlug,
  backHref = "/library",
  collectionLabel = track.collection,
}: PlayerProps) {
  const router = useRouter();
  const scrubRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const hasAudio = Boolean(track.audioUrl);

  // Resume point from the catalog's progress; overridden by saved position below.
  const resumeAt = Math.round((track.progress ?? 0) * track.durationSec);
  const desiredStart = useRef(resumeAt);
  const didSeek = useRef(false);

  const [position, setPosition] = useState(resumeAt);
  const [duration, setDuration] = useState(track.durationSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // On mount (client only), prefer a previously saved position over the catalog resume.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(posKey(track.slug)));
      if (Number.isFinite(saved) && saved > 0) desiredStart.current = saved;
    } catch {
      /* localStorage unavailable — fall back to catalog resume */
    }
    setPosition(desiredStart.current);
  }, [track.slug]);

  // Persist the current position (once per second — position is whole seconds).
  useEffect(() => {
    try {
      localStorage.setItem(posKey(track.slug), String(position));
    } catch {
      /* ignore */
    }
  }, [track.slug, position]);

  // Simulated playback for tracks without a real audio file.
  useEffect(() => {
    if (hasAudio || !isPlaying) return;
    const id = setInterval(() => {
      setPosition((p) => {
        if (p >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return Math.min(duration, p + rate);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [hasAudio, isPlaying, duration, rate]);

  // Seek the real media element to the resume point once its duration is known
  // (clamped so a resume point never lands past the end of a short track).
  const applyStartSeek = () => {
    if (didSeek.current) return;
    const el = mediaRef.current;
    if (!el) return;
    const dur = el.duration;
    if (!Number.isFinite(dur) || dur <= 0) return; // wait for metadata
    didSeek.current = true;
    el.currentTime = Math.min(desiredStart.current, Math.max(0, dur - 1));
  };

  const seekTo = (t: number) => {
    const clamped = Math.min(duration, Math.max(0, t));
    setPosition(Math.round(clamped));
    if (mediaRef.current) mediaRef.current.currentTime = clamped;
  };

  const onScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrubRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(frac * duration);
  };

  const pct = duration ? (position / duration) * 100 : 0;

  return (
    <div
      className="min-h-full w-full"
      style={{
        backgroundImage: "linear-gradient(180deg, oklch(0.34 0.06 250), oklch(0.16 0.02 60) 62%)",
      }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-6 pb-8 text-text-hi">
        {hasAudio && (
          <ReactPlayer
            ref={mediaRef}
            src={track.audioUrl}
            playing={isPlaying}
            playbackRate={rate}
            volume={muted ? 0 : volume}
            controls={false}
            onReady={applyStartSeek}
            onLoadedMetadata={(e) => {
              const el = e.currentTarget as HTMLMediaElement;
              if (Number.isFinite(el.duration)) setDuration(Math.floor(el.duration));
              applyStartSeek();
            }}
            onTimeUpdate={(e) => {
              const t = Math.floor((e.currentTarget as HTMLMediaElement).currentTime);
              setPosition((prev) => (t !== prev ? t : prev));
            }}
            onEnded={() => setIsPlaying(false)}
            style={{ display: "none" }}
          />
        )}

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
              onChange={(e) => seekTo(Number(e.target.value))}
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
          <button
            aria-label="Previous"
            disabled={!prevSlug}
            onClick={() => prevSlug && router.push(`/player/${prevSlug}`)}
            className="disabled:opacity-30"
          >
            <SkipBack size={30} fill="currentColor" />
          </button>
          <button
            onClick={() => setIsPlaying((v) => !v)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-text-hi shadow-cover-lg"
          >
            {isPlaying ? (
              <Pause size={30} className="text-ink-contrast" fill="currentColor" />
            ) : (
              <Play size={30} className="ml-1 text-ink-contrast" fill="currentColor" />
            )}
          </button>
          <button
            aria-label="Next"
            disabled={!nextSlug}
            onClick={() => nextSlug && router.push(`/player/${nextSlug}`)}
            className="disabled:opacity-30"
          >
            <SkipForward size={30} fill="currentColor" />
          </button>
        </div>

        {/* speed + volume controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SPEEDS.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                aria-pressed={rate === r}
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${
                  rate === r ? "bg-gold text-ink-contrast" : "bg-white/10 text-white/80"
                }`}
              >
                {r}×
              </button>
            ))}
          </div>

          {hasAudio && (
            <div className="flex items-center gap-2">
              <button
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={muted}
                onClick={() => setMuted((v) => !v)}
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
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(false);
                }}
                aria-label="Volume"
                className="w-24 cursor-pointer accent-gold"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
