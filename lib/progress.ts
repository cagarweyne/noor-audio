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

// Upsert how far a user got in a track (one row per user+track).
export async function saveTrackProgress(input: SaveProgressInput) {
  return prisma.trackProgress.upsert({
    where: {
      email_collectionSlug_trackSlug: {
        email: input.email,
        collectionSlug: input.collectionSlug,
        trackSlug: input.trackSlug,
      },
    },
    create: input,
    update: {
      title: input.title,
      hue: input.hue,
      positionSec: input.positionSec,
      durationSec: input.durationSec,
    },
  });
}

// A single track's saved position (for resume on the player page).
export async function getTrackProgress(
  email: string,
  collectionSlug: string,
  trackSlug: string,
) {
  return prisma.trackProgress.findUnique({
    where: {
      email_collectionSlug_trackSlug: { email, collectionSlug, trackSlug },
    },
  });
}

// Most-recent in-progress tracks for a user — powers "Jump back in".
export async function getContinueListening(email: string) {
  return prisma.trackProgress.findMany({
    where: { email },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
}
