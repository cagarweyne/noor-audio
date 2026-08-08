import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getContinueListening } from "@/lib/progress";
import { resolveCollection } from "@/lib/library";
import YouScreen, { type ProgressItem } from "@/components/screens/You";

export const metadata = { title: "You — Noor" };

export default async function YouPage() {
  const session = await getServerSession(authOptions);

  let progress: ProgressItem[] = [];
  if (session?.user?.email) {
    const email = session.user.email;
    const rows = await getContinueListening(email);
    // Enrich each row with the collection's real title (curated R2 or user DB).
    progress = await Promise.all(
      rows.map(async (r) => {
        const resolved = await resolveCollection(r.collectionSlug, email).catch(() => null);
        return {
          collectionSlug: r.collectionSlug,
          collectionTitle: resolved?.collection.title ?? r.collectionSlug,
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
