import { notFound } from "next/navigation";
import CollectionScreen from "@/components/screens/Collection";
import { getCollection } from "@/lib/collections";

// Rendered at request time (data comes from R2, not baked at build).
export const dynamic = "force-dynamic";

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
