import { notFound } from "next/navigation";
import Player from "@/components/screens/Player";
import { getTrack, getAdjacentSlugs, TRACKS } from "@/components/catalog";

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

  // key forces a fresh player (state reset) when navigating between tracks.
  return <Player key={track.slug} track={track} prevSlug={prev} nextSlug={next} />;
}
