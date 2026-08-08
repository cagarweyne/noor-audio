import "server-only";
import prisma from "@/lib/prisma";
import { getCollection, type CollectionWithTracks } from "@/lib/collections";
import type { Track } from "@/types";
import type { UserCollection, UserTrack } from "@/generated/prisma";

const BASE = process.env.NEXT_PUBLIC_AUDIO_BASE_URL!;

// Eyebrow label shown for a normalized user collection (neutral, since public
// ones are seen by other users too — ownership is conveyed via the badge).
export const USER_COLLECTION_KIND = "Uploaded audio";

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

export type ResolvedCollection = {
  collection: CollectionWithTracks;
  source: "curated" | "user";
  isOwner: boolean;
  isPublic: boolean;
  uploaderName?: string; // for user collections — the Google display name
};

// Resolve a collection by id from EITHER source, with access info:
//   - curated (R2): always public, never owned/editable
//   - user (DB): visible if public OR owned by the caller (`email`)
export async function resolveCollection(
  id: string,
  email: string | null,
): Promise<ResolvedCollection | null> {
  const curated = await getCollection(id).catch(() => null);
  if (curated) {
    return { collection: curated, source: "curated", isOwner: false, isPublic: true };
  }

  const uc = await prisma.userCollection.findUnique({
    where: { id },
    include: { tracks: true },
  });
  if (!uc) return null;

  let isOwner = false;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    isOwner = !!user && user.id === uc.userId;
  }
  // Private collections are only visible to their owner.
  if (!uc.isPublic && !isOwner) return null;

  const uploader = await prisma.user.findUnique({
    where: { id: uc.userId },
    select: { name: true },
  });

  return {
    collection: normalizeUserCollection(uc),
    source: "user",
    isOwner,
    isPublic: uc.isPublic,
    uploaderName: uploader?.name ?? undefined,
  };
}

// All public user collections (across all users) for the global browse feed,
// tagged with the uploader's name. Excludes the viewer's own and empty ones.
export async function getPublicCollections(excludeUserId?: string) {
  const rows = await prisma.userCollection.findMany({
    where: {
      isPublic: true,
      tracks: { some: {} },
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { _count: { select: { tracks: true } } },
  });

  const userIds = [...new Set(rows.map((r) => r.userId))];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    trackCount: r._count.tracks,
    hue: hueFromId(r.id),
    uploader: nameById.get(r.userId) ?? "A listener",
  }));
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
