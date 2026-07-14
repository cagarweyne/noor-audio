-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackProgress" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "collectionSlug" TEXT NOT NULL,
    "trackSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "positionSec" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TrackProgress_email_updatedAt_idx" ON "TrackProgress"("email", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrackProgress_email_collectionSlug_trackSlug_key" ON "TrackProgress"("email", "collectionSlug", "trackSlug");
