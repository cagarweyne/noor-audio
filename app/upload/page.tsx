import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { getUserCollections } from "@/lib/user-content";
import UploadScreen from "@/components/screens/Upload";

export const dynamic = "force-dynamic";
export const metadata = { title: "Upload — Noor" };

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/upload");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login?callbackUrl=/upload");

  const rows = await getUserCollections(user.id);
  const collections = rows.map((c) => ({
    id: c.id,
    title: c.title,
    trackCount: c._count.tracks,
  }));

  return <UploadScreen collections={collections} />;
}
