import "server-only";
import prisma from "@/lib/prisma";
import { getCollection, type CollectionWithTracks } from "@/lib/collections";
import type { Track } from "@/types";
import type { UserCollection, UserTrack } from "@/generated/prisma";

const BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_URL!;

// The `kind` marker on a normalized user collection. Also used by the collection
// screen to know a collection is the viewer's own (resolveCollection only
// returns user collections to their owner), so it can offer management.
export const USER_COLLECTION_KIND = "Your upload";

// A stable hue (0–359) from an id, so user collections get a consistent color
// (curated collections carry their own hue; user ones don't store one).
export function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

// Normalize a DB user collection into the SAME shape as a curated one, so the
// collection screen and player consume both without caring about the source.
function normalizeUserCollection(uc: UserCollection & { tracks: UserTrack[] }): CollectionWithTracks {
  const hue = hueFromId(uc.id);
  const tracks: Track[] = [...uc.tracks]
    .sort((a, b) => a.position - b.position)
    .map((t) => ({
      slug: t.id,
      title: t.title,
      subtitle: "",
      hue,
      section: "series",
      collection: uc.id,
      meta: uc.title,
      durationSec: t.durationSec,
      audioUrl: `${BASE}/${t.storageKey}`,
    }));

  return {
    slug: uc.id,
    title: uc.title,
    kind: USER_COLLECTION_KIND,
    description: uc.description,
    hue,
    trackSlugs: tracks.map((t) => t.slug),
    tracks,
  };
}

// Resolve a collection by id from EITHER source. Curated (R2) is public; a user
// collection is private and only returned to its owner (`email`).
export async function resolveCollection(
  id: string,
  email: string | null,
): Promise<CollectionWithTracks | null> {
  const curated = await getCollection(id).catch(() => null);
  if (curated) return curated;

  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const uc = await prisma.userCollection.findFirst({
    where: { id, userId: user.id },
    include: { tracks: true },
  });
  return uc ? normalizeUserCollection(uc) : null;
}

// Lightweight list of a user's collections for the Library.
export async function listUserCollections(userId: string) {
  const rows = await prisma.userCollection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tracks: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    trackCount: c._count.tracks,
    hue: hueFromId(c.id),
  }));
}
