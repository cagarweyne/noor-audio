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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ReactPlayer from "react-player";
import type { Track } from "@/types";
import { recordRecentlyPlayed } from "@/lib/recently-played";

// Persisted resume position, keyed by the (unique) audio URL so tracks that
// share a slug across collections don't collide.
const trackId = (t: Track) => t.audioUrl ?? t.slug;
const posKey = (t: Track) => `noor-player-pos:${trackId(t)}`;

// Navigation context for a loaded track — lets the mini-player / player bar
// link to the full player and step through the collection without knowing it.
type NavContext = {
  currentHref?: string;
  prevHref?: string;
  nextHref?: string;
  backHref?: string;
  collectionLabel?: string;
};

type LoadOpts = NavContext & { autoplay?: boolean };

type PlayerContextValue = NavContext & {
  track: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  rate: number;
  volume: number;
  muted: boolean;
  load: (track: Track, opts?: LoadOpts) => void;
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
  const router = useRouter();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const mediaRef = useRef<HTMLVideoElement>(null);
  const desiredStart = useRef(0);
  const didSeek = useRef(false);

  const [track, setTrack] = useState<Track | null>(null);
  const [nav, setNav] = useState<NavContext>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  const load = useCallback((next: Track, opts?: LoadOpts) => {
    // Resume point: saved position (localStorage) wins over catalog progress.
    let start = Math.round((next.progress ?? 0) * next.durationSec);
    try {
      const saved = Number(localStorage.getItem(posKey(next)));
      if (Number.isFinite(saved) && saved > 0) start = saved;
    } catch {
      /* localStorage unavailable — fall back to catalog resume */
    }
    desiredStart.current = start;
    didSeek.current = false;
    setTrack(next);
    setNav({
      currentHref: opts?.currentHref,
      prevHref: opts?.prevHref,
      nextHref: opts?.nextHref,
      backHref: opts?.backHref,
      collectionLabel: opts?.collectionLabel,
    });
    setDuration(next.durationSec);
    setPosition(start);
    // Playback requires sign-in — anonymous users load the track for display only.
    setIsPlaying((opts?.autoplay ?? true) && isAuthed);
  }, [isAuthed]);

  // Send unauthenticated users to the login page (returning to the current track).
  const redirectToLogin = useCallback(() => {
    const callbackUrl = nav.currentHref ?? "/";
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [router, nav.currentHref]);

  const toggle = useCallback(() => {
    // Starting playback is gated; pausing is always allowed.
    if (!isPlaying && !isAuthed) {
      redirectToLogin();
      return;
    }
    setIsPlaying((v) => !v);
  }, [isPlaying, isAuthed, redirectToLogin]);

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

  // Persist position (once per second) + update the "continue listening" list.
  useEffect(() => {
    if (!track) return;
    try {
      localStorage.setItem(posKey(track), String(position));
    } catch {
      /* ignore */
    }
    if (nav.currentHref) {
      recordRecentlyPlayed({
        href: nav.currentHref,
        title: track.title,
        meta: track.meta,
        hue: track.hue,
        positionSec: position,
        durationSec: duration || track.durationSec,
        updatedAt: Date.now(),
      });
    }
  }, [track, position, duration, nav.currentHref]);

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
  }, [isPlaying, track?.audioUrl]);

  const value: PlayerContextValue = {
    track,
    isPlaying,
    position,
    duration,
    rate,
    volume,
    muted,
    ...nav,
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
