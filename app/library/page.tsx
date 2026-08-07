import { getServerSession } from "next-auth";
import Library from "@/components/screens/Library";
import { getAllCollections } from "@/lib/collections";
import { listUserCollections } from "@/lib/library";
import prisma from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

// Rendered at request time (data comes from R2 + the DB, not baked at build).
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const collections = await getAllCollections();

  const session = await getServerSession(authOptions);
  let userCollections: { id: string; title: string; trackCount: number; hue: number }[] = [];
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) userCollections = await listUserCollections(user.id);
  }

  return <Library collections={collections} userCollections={userCollections} />;
}
