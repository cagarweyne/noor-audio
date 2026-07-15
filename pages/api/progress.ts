import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { saveTrackProgress, getContinueListening } from "@/lib/progress";

// /api/progress
//   POST — save the signed-in user's position in a track.
//          Body: { collectionSlug, trackSlug, title, hue, positionSec, durationSec }
//   GET  — list the user's most-recent in-progress tracks ("Jump back in").
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const email = session.user.email;

  if (req.method === "GET") {
    const items = await getContinueListening(email);
    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const { collectionSlug, trackSlug, title, hue, positionSec, durationSec } = req.body ?? {};
    if (!collectionSlug || !trackSlug) {
      return res.status(400).json({ error: "Missing track identity" });
    }
    await saveTrackProgress({
      email,
      collectionSlug,
      trackSlug,
      title: title ?? "",
      hue: Number(hue) || 210,
      positionSec: Number(positionSec) || 0,
      durationSec: Number(durationSec) || 0,
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
