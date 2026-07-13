// Shared demo catalog. Cards (Home scrollers) and the Now Playing route both
// read from here, keyed by `slug`, so links resolve to matching player data.
// Replace with fetched data later.

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
  audioUrl?: string; // real audio; when absent the player simulates playback
};

// Demo audio: Qur'an surah recitations by Mishary Rashid Al-Afasy (CORS-enabled).
const QCDN = "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee";

export const TRACKS: Track[] = [
  {
    slug: "juz-amma-recitation",
    title: "Juz' Amma — Recitation",
    subtitle: "Murattal",
    hue: 78,
    section: "continue",
    progress: 0.62,
    collection: "Juz' Amma",
    meta: "Murattal · Surah An-Naba'",
    durationSec: 240,
    ayah: "عَمَّ يَتَسَاءَلُونَ",
    translation: "About what are they asking one another?",
    audioUrl: `${QCDN}/078.mp3`, // An-Naba'
  },
  {
    slug: "seerah-part-12",
    title: "The Seerah · Part 12",
    subtitle: "Life of the Prophet ﷺ",
    hue: 250,
    section: "continue",
    progress: 0.34,
    collection: "The Seerah",
    meta: "Recitation · Surah Al-Kahf",
    durationSec: 2011,
    audioUrl: `${QCDN}/018.mp3`, // Al-Kahf
  },
  {
    slug: "stories-of-the-prophets",
    title: "Stories of the Prophets",
    subtitle: "Lecture series",
    hue: 320,
    section: "continue",
    progress: 0.8,
    collection: "Stories of the Prophets",
    meta: "Recitation · Surah Yusuf",
    durationSec: 2525,
    audioUrl: `${QCDN}/012.mp3`, // Yusuf
  },
  {
    slug: "tazkiyah-purification",
    title: "Tazkiyah · Purification",
    subtitle: "Reflections",
    hue: 150,
    section: "continue",
    progress: 0.15,
    collection: "Tazkiyah",
    meta: "Recitation · Surah Ash-Shams",
    durationSec: 85,
    audioUrl: `${QCDN}/091.mp3`, // Ash-Shams
  },
  {
    slug: "fiqh-of-worship",
    title: "Fiqh of Worship",
    subtitle: "24 lectures",
    hue: 195,
    section: "series",
    collection: "Fiqh of Worship",
    meta: "Recitation · Surah Al-Mulk",
    durationSec: 456,
    audioUrl: `${QCDN}/067.mp3`, // Al-Mulk
  },
  {
    slug: "ramadan-nights",
    title: "Ramadan Nights",
    subtitle: "Reflections",
    hue: 40,
    section: "series",
    collection: "Ramadan Nights",
    meta: "Recitation · Surah Al-Qadr",
    durationSec: 46,
    audioUrl: `${QCDN}/097.mp3`, // Al-Qadr
  },
  {
    slug: "prophetic-duas",
    title: "Prophetic Duas",
    subtitle: "Collection",
    hue: 150,
    section: "series",
    collection: "Prophetic Duas",
    meta: "Recitation · Surah Al-Fatihah",
    durationSec: 52,
    ayah: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    translation: "Our Lord, give us good in this world.",
    audioUrl: `${QCDN}/001.mp3`, // Al-Fatihah
  },
  {
    slug: "tafsir-essentials",
    title: "Tafsir Essentials",
    subtitle: "18 lectures",
    hue: 250,
    section: "series",
    collection: "Tafsir Essentials",
    meta: "Recitation · Surah Ya-Sin",
    durationSec: 1060,
    audioUrl: `${QCDN}/036.mp3`, // Ya-Sin
  },
];

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

export function tracksBySection(section: Track["section"]): Track[] {
  return TRACKS.filter((t) => t.section === section);
}

// Neighbours in catalog order — used by the player's prev/next buttons.
export function getAdjacentSlugs(slug: string): { prev?: string; next?: string } {
  const i = TRACKS.findIndex((t) => t.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? TRACKS[i - 1].slug : undefined,
    next: i < TRACKS.length - 1 ? TRACKS[i + 1].slug : undefined,
  };
}

// ── Collections ────────────────────────────────────────────────────────────
// Hardcoded for now. Later these load from the DB via a Server Component; the
// screen components already take collections/tracks as props, so only the data
// source changes.

export type Collection = {
  slug: string;
  title: string;
  arabicTitle?: string;
  kind: string; // eyebrow label, e.g. "Recitations"
  description: string;
  hue: number;
  trackSlugs: string[]; // references TRACKS by slug
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "juz-amma",
    title: "Juz' Amma",
    arabicTitle: "جزء عمّ",
    kind: "Recitations",
    description:
      "The 30th part of the Qur'an — short surahs for daily recitation and memorisation.",
    hue: 78,
    trackSlugs: ["juz-amma-recitation", "tazkiyah-purification", "ramadan-nights"],
  },
  {
    slug: "seerah-and-stories",
    title: "Seerah & Stories",
    kind: "Series",
    description: "Longer surahs recounting the stories of the prophets and their lessons.",
    hue: 250,
    trackSlugs: ["seerah-part-12", "stories-of-the-prophets"],
  },
  {
    slug: "tafsir-essentials",
    title: "Tafsir Essentials",
    kind: "Series",
    description: "Core surahs every student of the Qur'an returns to, with reflection.",
    hue: 195,
    trackSlugs: ["tafsir-essentials", "fiqh-of-worship"],
  },
  {
    slug: "daily-protection",
    title: "Daily Protection",
    arabicTitle: "الحماية اليومية",
    kind: "Collection",
    description: "Surahs and du'as recited morning and evening for protection and barakah.",
    hue: 150,
    trackSlugs: ["prophetic-duas", "fiqh-of-worship", "tazkiyah-purification"],
  },
  {
    slug: "ramadan-nights",
    title: "Ramadan Nights",
    kind: "Collection",
    description: "A gentle set for the blessed nights — Al-Qadr, Al-Fatihah and more.",
    hue: 40,
    trackSlugs: ["ramadan-nights", "juz-amma-recitation", "prophetic-duas"],
  },
];

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

// Resolve a collection's track slugs to full Track objects (skips any unknown).
export function collectionTracks(collection: Collection): Track[] {
  return collection.trackSlugs
    .map((s) => getTrack(s))
    .filter((t): t is Track => Boolean(t));
}

// The collection a track belongs to (first match if it appears in several).
// Used by the player's back button so direct links still know where to return.
export function getCollectionForTrack(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.trackSlugs.includes(slug));
}
