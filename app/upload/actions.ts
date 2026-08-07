"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { presignPutUrl } from "@/lib/r2";
import { requireUser } from "@/lib/user-content";

const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB per file
const QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB per user

// Create a new (empty) collection to upload into.
export async function createUserCollection(title: string) {
  const user = await requireUser();
  const collection = await prisma.userCollection.create({
    data: { userId: user.id, title: title.trim() || "Untitled collection" },
  });
  revalidatePath("/upload");
  return { id: collection.id, title: collection.title };
}

// Validate + issue a presigned PUT URL the browser uploads the file to directly.
export async function presignUpload(input: {
  collectionId: string;
  fileName: string;
  sizeBytes: number;
}) {
  const user = await requireUser();

  const collection = await prisma.userCollection.findFirst({
    where: { id: input.collectionId, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");

  if (!/\.mp3$/i.test(input.fileName)) throw new Error("Only .mp3 files are supported");
  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_FILE_BYTES) {
    throw new Error("File is too large (max 100 MB)");
  }

  const used = await prisma.userTrack.aggregate({
    where: { userId: user.id },
    _sum: { sizeBytes: true },
  });
  if ((used._sum.sizeBytes ?? 0) + input.sizeBytes > QUOTA_BYTES) {
    throw new Error("Storage quota exceeded");
  }

  const storageKey = `users/${user.id}/${randomUUID()}.mp3`;
  const url = await presignPutUrl(storageKey);
  return { url, storageKey };
}

// Record the uploaded file as a track once the R2 PUT succeeds.
export async function finalizeTrack(input: {
  collectionId: string;
  storageKey: string;
  title: string;
  durationSec: number;
  sizeBytes: number;
}) {
  const user = await requireUser();

  const collection = await prisma.userCollection.findFirst({
    where: { id: input.collectionId, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");
  // The key must be inside this user's namespace (defends against tampering).
  if (!input.storageKey.startsWith(`users/${user.id}/`)) throw new Error("Invalid storage key");

  const position = await prisma.userTrack.count({ where: { collectionId: input.collectionId } });

  const track = await prisma.userTrack.create({
    data: {
      userId: user.id,
      collectionId: input.collectionId,
      title: input.title.trim() || "Untitled",
      storageKey: input.storageKey,
      durationSec: Math.max(0, Math.floor(input.durationSec)),
      sizeBytes: input.sizeBytes,
      position,
    },
  });
  revalidatePath("/upload");
  return { id: track.id };
}
