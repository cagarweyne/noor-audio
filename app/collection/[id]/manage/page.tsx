import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import ManageCollection from "@/components/screens/ManageCollection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage collection — Noor" };

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect(`/login?callbackUrl=/collection/${id}/manage`);

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect(`/login?callbackUrl=/collection/${id}/manage`);

  const collection = await prisma.userCollection.findFirst({
    where: { id, userId: user.id },
    include: { tracks: { orderBy: { position: "asc" } } },
  });
  if (!collection) notFound();

  return (
    <ManageCollection
      id={collection.id}
      title={collection.title}
      tracks={collection.tracks.map((t) => ({
        id: t.id,
        title: t.title,
        durationSec: t.durationSec,
      }))}
    />
  );
}
