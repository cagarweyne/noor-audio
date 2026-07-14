import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { saveTrackProgress } from "@/lib/progress";

// POST /api/progress — save the signed-in user's position in a track.
// Body: { collectionSlug, trackSlug, title, positionSec, durationSec }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const { collectionSlug, trackSlug, title, positionSec, durationSec } = req.body ?? {};
  if (!collectionSlug || !trackSlug) {
    return res.status(400).json({ error: "Missing track identity" });
  }

  await saveTrackProgress({
    email: session.user.email,
    collectionSlug,
    trackSlug,
    title: title ?? "",
    positionSec: Number(positionSec) || 0,
    durationSec: Number(durationSec) || 0,
  });

  return res.status(200).json({ ok: true });
}
