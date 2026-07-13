"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactPlayer from "react-player";
import type { Track } from "@/components/catalog";

// Persisted resume position (per track), so playback reopens where you left off.
const posKey = (slug: string) => `noor-player-pos:${slug}`;

type PlayerContextValue = {
  track: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  rate: number;
  volume: number;
  muted: boolean;
  /** Load a track (optionally autoplay). No-op reset if it's already current. */
  load: (track: Track, opts?: { autoplay?: boolean }) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <PlayerProvider>");
  return ctx;
}

// Owns the ONE audio instance for the whole app. Rendered in AppShell (the
// persistent layout), so audio keeps playing as pages navigate underneath it.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const desiredStart = useRef(0);
  const didSeek = useRef(false);

  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  const load = useCallback((next: Track, opts?: { autoplay?: boolean }) => {
    // Resume point: saved position (localStorage) wins over catalog progress.
    let start = Math.round((next.progress ?? 0) * next.durationSec);
    try {
      const saved = Number(localStorage.getItem(posKey(next.slug)));
      if (Number.isFinite(saved) && saved > 0) start = saved;
    } catch {
      /* localStorage unavailable — fall back to catalog resume */
    }
    desiredStart.current = start;
    didSeek.current = false;
    setTrack(next);
    setDuration(next.durationSec);
    setPosition(start);
    setIsPlaying(opts?.autoplay ?? true);
  }, []);

  const toggle = useCallback(() => setIsPlaying((v) => !v), []);

  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, seconds);
    setPosition(Math.round(clamped));
    if (mediaRef.current) mediaRef.current.currentTime = clamped;
  }, []);

  const setRate = useCallback((r: number) => setRateState(r), []);
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMuted(false);
  }, []);
  const toggleMuted = useCallback(() => setMuted((v) => !v), []);

  // Seek to the resume point once the real duration is known (clamped to the end).
  const applyStartSeek = useCallback(() => {
    if (didSeek.current) return;
    const el = mediaRef.current;
    if (!el) return;
    const dur = el.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    didSeek.current = true;
    el.currentTime = Math.min(desiredStart.current, Math.max(0, dur - 1));
  }, []);

  // Persist position (once per second — position is whole seconds).
  useEffect(() => {
    if (!track) return;
    try {
      localStorage.setItem(posKey(track.slug), String(position));
    } catch {
      /* ignore */
    }
  }, [track, position]);

  // Drive play/pause imperatively (instead of react-player's `playing` prop) so
  // we can swallow the harmless AbortError thrown when the source swaps or the
  // user toggles while a play() request is still pending.
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (isPlaying) {
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.catch((err: DOMException) => {
          // Autoplay blocked → reflect paused in the UI. AbortError (source
          // swap / rapid toggle) is transient — ignore it.
          if (err?.name === "NotAllowedError") setIsPlaying(false);
        });
      }
    } else {
      el.pause();
    }
  }, [isPlaying, track?.slug]);

  const value: PlayerContextValue = {
    track,
    isPlaying,
    position,
    duration,
    rate,
    volume,
    muted,
    load,
    toggle,
    seek,
    setRate,
    setVolume,
    toggleMuted,
  };

  return (
    <PlayerContext.Provider value={value}>
      {track?.audioUrl && (
        <ReactPlayer
          ref={mediaRef}
          src={track.audioUrl}
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
      {children}
    </PlayerContext.Provider>
  );
}
