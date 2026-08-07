"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { deleteObject } from "@/lib/r2";
import { requireUser } from "@/lib/user-content";

// Rename a user collection.
export async function renameUserCollection(id: string, title: string) {
  const user = await requireUser();
  const owned = await prisma.userCollection.findFirst({ where: { id, userId: user.id } });
  if (!owned) throw new Error("Collection not found");

  await prisma.userCollection.update({
    where: { id },
    data: { title: title.trim() || "Untitled collection" },
  });
  revalidatePath(`/collection/${id}/manage`);
  revalidatePath(`/collection/${id}`);
  revalidatePath("/library");
  revalidatePath("/");
}

// Rename a single track.
export async function renameUserTrack(id: string, title: string) {
  const user = await requireUser();
  const track = await prisma.userTrack.findFirst({ where: { id, userId: user.id } });
  if (!track) throw new Error("Track not found");

  await prisma.userTrack.update({ where: { id }, data: { title: title.trim() || "Untitled" } });
  revalidatePath(`/collection/${track.collectionId}/manage`);
  revalidatePath(`/collection/${track.collectionId}`);
}

// Delete a single track — remove the R2 object first, then the DB row.
export async function deleteUserTrack(id: string) {
  const user = await requireUser();
  const track = await prisma.userTrack.findFirst({ where: { id, userId: user.id } });
  if (!track) throw new Error("Track not found");

  await deleteObject(track.storageKey);
  await prisma.userTrack.delete({ where: { id } });
  revalidatePath(`/collection/${track.collectionId}/manage`);
  revalidatePath(`/collection/${track.collectionId}`);
  revalidatePath("/library");
}

// Delete a whole collection — delete every R2 object first (the DB cascade only
// removes rows), then the collection, then send the user back to the library.
export async function deleteUserCollection(id: string) {
  const user = await requireUser();
  const owned = await prisma.userCollection.findFirst({
    where: { id, userId: user.id },
    include: { tracks: true },
  });
  if (!owned) throw new Error("Collection not found");

  await Promise.allSettled(owned.tracks.map((t) => deleteObject(t.storageKey)));
  await prisma.userCollection.delete({ where: { id } }); // cascade removes track rows

  revalidatePath("/library");
  revalidatePath("/");
  redirect("/library");
}
