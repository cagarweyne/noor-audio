import type { Collection, Track } from "@/types";

const BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_URL!;

export type CollectionWithTracks = Collection & { tracks: Track[] };

// Fallback list of collection slugs, used when no root `collections.json` index
// is published at the bucket root. Add your slugs here as you publish them.
export const COLLECTION_SLUGS = ["silsilat-al-tatar"];

// Fetch a collection's metadata + tracks from R2, deriving each track's
// audioUrl at read time (the URL is never stored in the JSON — see AUDIO_SETUP).
export async function getCollection(slug: string): Promise<CollectionWithTracks> {
  const res = await fetch(`${BASE}/${slug}/collection.json`, {
    next: { revalidate: 300 }, // matches the 5-min cache header on the JSON
    signal: AbortSignal.timeout(8000), // never hang a build/request on a slow R2
  });

  if (!res.ok) throw new Error(`Collection not found: ${slug}`);

  const data = await res.json();

  return {
    ...data,
    tracks: data.tracks.map((t: Track) => ({
      ...t,
      audioUrl: `${BASE}/${slug}/${t.slug}.mp3`, // derived, never stored
    })),
  };
}

// The set of collection slugs the app should show. Prefers a published root
// `collections.json` (a single fetch, no redeploy to add collections); falls
// back to the hardcoded COLLECTION_SLUGS above.
export async function getCollectionSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/collections.json`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data as string[];
    }
  } catch {
    /* no root index published — fall back below */
  }
  return COLLECTION_SLUGS;
}

// All collections, for Home / Library / SideNav. One fetch per collection until
// a root index exists; each is cached for 5 min. Missing/failed collections are
// skipped rather than failing the whole page.
export async function getAllCollections(): Promise<CollectionWithTracks[]> {
  const slugs = await getCollectionSlugs();
  const results = await Promise.allSettled(slugs.map((s) => getCollection(s)));
  return results
    .filter((r): r is PromiseFulfilledResult<CollectionWithTracks> => r.status === "fulfilled")
    .map((r) => r.value);
}
