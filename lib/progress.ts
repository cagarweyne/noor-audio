import prisma from "@/lib/prisma";

export type SaveProgressInput = {
  email: string;
  collectionSlug: string;
  trackSlug: string;
  title: string;
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
      positionSec: input.positionSec,
      durationSec: input.durationSec,
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
