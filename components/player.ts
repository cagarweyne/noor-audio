// Shared demo "now playing" data for the mini-player (mobile) and the docked
// player bar (tablet/desktop). Replace with your real player store later.
export type NowPlaying = {
  title: string;
  subtitle: string;
  hue: number;
  position: number;
  duration: number;
};

export const DEMO_NOW_PLAYING: NowPlaying = {
  title: "An-Naba' · Juz' Amma",
  subtitle: "Murattal recitation",
  hue: 250,
  position: 88,
  duration: 210,
};

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
