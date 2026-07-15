-- DropIndex (per-track uniqueness)
DROP INDEX "TrackProgress_email_collectionSlug_trackSlug_key";

-- Collapse to one row per (email, collectionSlug): keep the most recently
-- updated track per collection, delete the rest.
DELETE FROM "TrackProgress" a
USING "TrackProgress" b
WHERE a."email" = b."email"
  AND a."collectionSlug" = b."collectionSlug"
  AND (a."updatedAt" < b."updatedAt"
       OR (a."updatedAt" = b."updatedAt" AND a."id" < b."id"));

-- CreateIndex (per-collection uniqueness)
CREATE UNIQUE INDEX "TrackProgress_email_collectionSlug_key" ON "TrackProgress"("email", "collectionSlug");
