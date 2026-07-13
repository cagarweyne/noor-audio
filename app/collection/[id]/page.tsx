import { notFound } from "next/navigation";
import CollectionScreen from "@/components/screens/Collection";
import { getCollection, collectionTracks, COLLECTIONS } from "@/components/catalog";

// Pre-render a page for every catalog collection.
export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ id: c.slug }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = getCollection(id);
  if (!collection) notFound();

  return <CollectionScreen collection={collection} tracks={collectionTracks(collection)} />;
}
