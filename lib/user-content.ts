import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/lib/prisma";

export type CurrentUser = { id: string; email: string; name: string };

// Resolve the signed-in user's DB row (id used for ownership + storage keys).
// The app's session is email-keyed, so we look the id up here.
export async function requireUser(): Promise<CurrentUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");
  return { id: user.id, email: user.email, name: user.name };
}

// The user's collections with a track count, newest first.
export async function getUserCollections(userId: string) {
  return prisma.userCollection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tracks: true } } },
  });
}
