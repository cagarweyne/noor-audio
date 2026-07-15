import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getContinueListening } from "@/lib/progress";
import { getCollection } from "@/lib/collections";
import YouScreen, { type ProgressItem } from "@/components/screens/You";

export const metadata = { title: "You — Noor" };

export default async function YouPage() {
  const session = await getServerSession(authOptions);

  let progress: ProgressItem[] = [];
  if (session?.user?.email) {
    const rows = await getContinueListening(session.user.email);
    // Enrich each row with the collection's real title (from R2), cached.
    progress = await Promise.all(
      rows.map(async (r) => {
        const collection = await getCollection(r.collectionSlug).catch(() => null);
        return {
          collectionSlug: r.collectionSlug,
          collectionTitle: collection?.title ?? r.collectionSlug,
          trackSlug: r.trackSlug,
          trackTitle: r.title,
          hue: r.hue,
          positionSec: r.positionSec,
          durationSec: r.durationSec,
        };
      }),
    );
  }

  return <YouScreen user={session?.user ?? null} progress={progress} />;
}
