import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import CollectionScreen from "@/components/screens/Collection";
import { resolveCollection } from "@/lib/library";
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

  const resolved = await resolveCollection(id, session?.user?.email ?? null);
  if (!resolved) notFound();

  return (
    <CollectionScreen
      collection={resolved.collection}
      tracks={resolved.collection.tracks}
      editable={resolved.isOwner}
      isPublic={resolved.source === "user" ? resolved.isPublic : undefined}
      uploaderName={resolved.uploaderName}
    />
  );
}
