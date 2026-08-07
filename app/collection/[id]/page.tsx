import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import CollectionScreen from "@/components/screens/Collection";
import { resolveCollection, USER_COLLECTION_KIND } from "@/lib/library";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Rendered at request time (data comes from R2 or the DB, not baked at build).
export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const collection = await resolveCollection(id, session?.user?.email ?? null);
  if (!collection) notFound();

  return (
    <CollectionScreen
      collection={collection}
      tracks={collection.tracks}
      editable={collection.kind === USER_COLLECTION_KIND}
    />
  );
}
