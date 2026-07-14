import { notFound } from "next/navigation";
import CollectionScreen from "@/components/screens/Collection";
import { getCollection, getCollectionSlugs } from "@/lib/collections";

// Prebuild the known collections; others render on demand.
export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((id) => ({ id }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const collection = await getCollection(id).catch(() => null);
  if (!collection) notFound();

  return <CollectionScreen collection={collection} tracks={collection.tracks} />;
}
