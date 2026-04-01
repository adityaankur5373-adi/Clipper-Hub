/*
  Warnings:

  - You are about to drop the column `maxCreators` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `usedSlots` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `Submission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platform,platformUserId]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[campaignId,uniqueContentHash]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `socialAccountId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Submission_userId_campaignId_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "maxCreators",
DROP COLUMN "usedSlots",
ADD COLUMN     "maxSubmissionsPerAccount" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "maxSubmissions" SET DEFAULT 200;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "platform",
ADD COLUMN     "socialAccountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_platform_platformUserId_key" ON "SocialAccount"("platform", "platformUserId");

-- CreateIndex
CREATE INDEX "Submission_socialAccountId_campaignId_idx" ON "Submission"("socialAccountId", "campaignId");

-- CreateIndex
CREATE INDEX "Submission_userId_campaignId_idx" ON "Submission"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_campaignId_uniqueContentHash_key" ON "Submission"("campaignId", "uniqueContentHash");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
