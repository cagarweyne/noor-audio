import prisma from "@/lib/prisma";

export type SaveProgressInput = {
  email: string;
  collectionSlug: string;
  trackSlug: string;
  title: string;
  hue: number;
  positionSec: number;
  durationSec: number;
};

// Upsert the user's position in a collection (one row per collection). Playing a
// different track in the same collection overwrites which track is tracked.
export async function saveTrackProgress(input: SaveProgressInput) {
  return prisma.trackProgress.upsert({
    where: {
      email_collectionSlug: {
        email: input.email,
        collectionSlug: input.collectionSlug,
      },
    },
    create: input,
    update: {
      trackSlug: input.trackSlug,
      title: input.title,
      hue: input.hue,
      positionSec: input.positionSec,
      durationSec: input.durationSec,
    },
  });
}

// The saved position for resuming a track — only if it's the collection's
// currently-tracked track (opening any other track starts fresh).
export async function getTrackProgress(
  email: string,
  collectionSlug: string,
  trackSlug: string,
) {
  const row = await prisma.trackProgress.findUnique({
    where: { email_collectionSlug: { email, collectionSlug } },
  });
  return row && row.trackSlug === trackSlug ? row : null;
}

// Most-recent in-progress tracks for a user — powers "Jump back in".
export async function getContinueListening(email: string) {
  return prisma.trackProgress.findMany({
    where: { email },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
}
