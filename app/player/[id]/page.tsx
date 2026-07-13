import { notFound } from "next/navigation";
import Player from "@/components/screens/Player";
import {
  getTrack,
  getAdjacentSlugs,
  getCollectionForTrack,
  TRACKS,
} from "@/components/catalog";

// Pre-render a page for every catalog track.
export function generateStaticParams() {
  return TRACKS.map((t) => ({ id: t.slug }));
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const track = getTrack(id);
  if (!track) notFound();

  const { prev, next } = getAdjacentSlugs(id);
  const collection = getCollectionForTrack(id);
  const backHref = collection ? `/collection/${collection.slug}` : "/library";

  // key forces a fresh player (state reset) when navigating between tracks.
  return (
    <Player
      key={track.slug}
      track={track}
      prevSlug={prev}
      nextSlug={next}
      backHref={backHref}
      collectionLabel={collection?.title ?? track.collection}
    />
  );
}
