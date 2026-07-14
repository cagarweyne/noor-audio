# Audio Storage Setup (Cloudflare R2)

Context for working on the audio streaming features of this app.

---

## Overview

Audio files are stored in a **public Cloudflare R2 bucket**, organised one folder
per collection. Each folder contains the mp3 files plus a `collection.json`
holding all the metadata for that collection and its tracks.

The bucket is public, so **the app never needs R2 credentials or the AWS SDK** —
reading audio and metadata is just a plain `fetch()` of a public URL.

---

## Bucket layout

```
<collection-slug>/
  collection.json     ← metadata: the collection + all its tracks
  track-001.mp3
  track-002.mp3
  track-003.mp3
```

Track slugs are always `track-NNN`, zero-padded to 3 digits. They are assigned
by the publish script and are stable — they form part of the public URL.

**Base URL:** `https://pub-4551891697e04e67a5dc4d70c174352d.r2.dev`

Stored in `.env.local` as:

```
NEXT_PUBLIC_AUDIO_BASE_URL=https://pub-4551891697e04e67a5dc4d70c174352d.r2.dev
```

The `NEXT_PUBLIC_` prefix is required so it's readable from client components.

---

## Types

These already exist in the codebase:

```typescript
export type Track = {
  slug: string;
  title: string;
  subtitle: string;
  hue: number;
  section: 'continue' | 'series';
  progress?: number; // 0–1 resume position (for "Jump back in")
  collection: string; // "PLAYING FROM COLLECTION" context label
  meta: string; // secondary line under the title on the player
  durationSec: number;
  ayah?: string; // Qur'an items only
  translation?: string;
  audioUrl?: string; // derived at read time — see below
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
```

---

## `collection.json` shape

Matches `Collection`, with the full `Track[]` nested inside under `tracks`:

```json
{
  "slug": "silsilat-al-tatar",
  "title": "The Tatars",
  "arabicTitle": "سلسلة التتار",
  "kind": "Series",
  "description": "...",
  "hue": 210,
  "trackSlugs": ["track-001", "track-002"],
  "tracks": [
    {
      "slug": "track-001",
      "title": "Track 1",
      "subtitle": "",
      "hue": 210,
      "section": "series",
      "collection": "silsilat-al-tatar",
      "meta": "The Tatars",
      "durationSec": 1284
    }
  ]
}
```

---

## IMPORTANT: `audioUrl` is not stored

`audioUrl` is deliberately **absent** from `collection.json`. Derive it at read
time:

```
`${BASE_URL}/${collection.slug}/${track.slug}.mp3`
```

This keeps the domain in exactly one place, so swapping the `r2.dev` URL for a
custom domain later is a one-line change rather than a data migration across
every JSON file. **Do not add `audioUrl` to the stored JSON.**

---

## The reading layer to build

```typescript
// lib/collections.ts
import type { Collection, Track } from '@/types';

const BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_URL!;

export type CollectionWithTracks = Collection & { tracks: Track[] };

export async function getCollection(
  slug: string,
): Promise<CollectionWithTracks> {
  const res = await fetch(`${BASE}/${slug}/collection.json`, {
    next: { revalidate: 300 }, // matches the 5-min cache header on the JSON
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
```

---

## Caching

Set by the publish script when uploading:

| File              | Cache-Control                 | Why                                                                                                   |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `*.mp3`           | `max-age=31536000, immutable` | Audio never changes once uploaded. Cached forever, so repeat plays don't count as R2 read operations. |
| `collection.json` | `max-age=300`                 | Short, so edits to titles/descriptions show up quickly.                                               |

Match the `revalidate` value in `fetch()` to the JSON's cache age (300s).

---

## Publishing new collections

Handled by `scripts/publish-collection.mjs` (separate from the app):

```bash
node --env-file=.env publish-collection.mjs ./audio/tatars silsilat-al-tatar
```

It reads a folder of numbered mp3s (`001.mp3`, `002.mp3`, …), extracts real
durations, generates `collection.json`, and uploads everything to R2.

**The R2 credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, etc.) belong
only to this script.** They must NOT be added to the Next.js app, and must NOT
be given a `NEXT_PUBLIC_` prefix.

To change track titles later: edit the `title` fields in `collection.json` and
re-upload just that one file. The mp3s never need touching again.

---

## What to build next

1. **`lib/collections.ts`** — the reading layer above (`getCollection`).

2. **A collections index.** The app needs to know which collections exist. Two
   options:
   - **Hardcode** a `COLLECTION_SLUGS` array in the app — simple, fine for ~10.
   - **Publish a top-level `collections.json`** at the bucket root listing every
     slug, so the homepage is a single fetch instead of N fetches, and adding a
     collection needs no code deploy. _This is the better option if the number of
     collections will grow._

3. **Wire the player to `audioUrl`** — a plain `<audio src={track.audioUrl}>`.
   Range requests (seeking/scrubbing) work natively against R2, no extra work.

4. **Progress saving.** On `pause` and on a debounced `timeupdate` (every ~10s),
   persist `{ trackSlug, positionSeconds }` so playback can resume. This is the
   `progress` field on `Track` (0–1). Storage target TBD — currently no database.

---

## Constraints / decisions already made

- **No database yet.** All collection/track metadata comes from R2 JSON files.
- **No auth yet.**
- Bucket is public. Do not add signed-URL logic — it isn't needed.
- The `r2.dev` URL is rate-limited and not production-grade. It's fine for now;
  swap in a custom domain before launch by changing `NEXT_PUBLIC_AUDIO_BASE_URL`.
