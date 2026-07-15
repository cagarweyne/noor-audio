import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Player from "@/components/screens/Player";
import { getCollection } from "@/lib/collections";
import { getTrackProgress } from "@/lib/progress";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Streams from R2. Dynamic (fetched per request, cached 5 min via the fetch).
export default async function PlayerPage({
  params,
}: {
  params: Promise<{ collection: string; track: string }>;
}) {
  const { collection: collectionSlug, track: trackSlug } = await params;

  const collection = await getCollection(collectionSlug).catch(() => null);
  if (!collection) notFound();

  const idx = collection.tracks.findIndex((t) => t.slug === trackSlug);
  if (idx === -1) notFound();

  const track = collection.tracks[idx];
  const prev = idx > 0 ? collection.tracks[idx - 1] : undefined;
  const next = idx < collection.tracks.length - 1 ? collection.tracks[idx + 1] : undefined;
  const href = (t: { slug: string }) => `/player/${collectionSlug}/${t.slug}`;

  // Resume from the signed-in user's saved DB position, if any.
  const session = await getServerSession(authOptions);
  let initialPositionSec: number | undefined;
  if (session?.user?.email) {
    const saved = await getTrackProgress(session.user.email, collectionSlug, trackSlug);
    if (saved) initialPositionSec = saved.positionSec;
  }

  // key forces a fresh player mount (state reset) when the track changes.
  return (
    <Player
      key={track.audioUrl}
      track={track}
      currentHref={href(track)}
      prevHref={prev ? href(prev) : undefined}
      nextHref={next ? href(next) : undefined}
      backHref={`/collection/${collectionSlug}`}
      collectionLabel={collection.title}
      initialPositionSec={initialPositionSec}
    />
  );
}
