// Canonical domain types. Metadata comes from R2 collection.json files
// (see AUDIO_SETUP.md) and is read via lib/collections.ts.

export type Track = {
  slug: string;
  title: string;
  subtitle: string;
  hue: number;
  section: "continue" | "series";
  progress?: number; // 0–1 resume position (for "Jump back in")
  collection: string; // "PLAYING FROM COLLECTION" context label
  meta: string; // secondary line under the title on the player
  durationSec: number;
  ayah?: string; // Qur'an items only
  translation?: string;
  audioUrl?: string; // derived at read time — never stored in JSON
};

export type Collection = {
  slug: string;
  title: string;
  arabicTitle?: string;
  kind: string; // eyebrow label, e.g. "Recitations"
  description: string;
  hue: number;
  trackSlugs: string[]; // references tracks by slug
};
