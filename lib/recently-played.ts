// Client-side "continue listening" store, backed by localStorage.
//
// This is the seam for the future DB migration: when Postgres + NextAuth land,
// replace these two functions with per-user reads/writes (recordRecentlyPlayed
// on a debounced timeupdate/pause; getRecentlyPlayed as a server fetch). The
// RecentTrack shape mirrors what a `playback_progress` row would hold.

export type RecentTrack = {
  href: string; // player URL to resume (/player/<collection>/<track>) — unique id
  title: string;
  meta: string;
  hue: number;
  positionSec: number;
  durationSec: number;
  updatedAt: number; // epoch ms, for ordering
};

const KEY = "noor-recent";
const MAX = 12;

export function getRecentlyPlayed(): RecentTrack[] {
  if (typeof window === "undefined") return [];
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentTrack[];
    return Array.isArray(list) ? [...list].sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function recordRecentlyPlayed(entry: RecentTrack): void {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentlyPlayed().filter((e) => e.href !== entry.href);
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}
