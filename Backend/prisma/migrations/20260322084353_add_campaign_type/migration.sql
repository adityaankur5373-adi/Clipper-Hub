/*
  Warnings:

  - The `status` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CampaignParticipation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,campaignId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `platform` on the `SocialAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('MUSIC', 'CLIP', 'GAMING', 'BRAND');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- DropForeignKey
ALTER TABLE "CampaignParticipation" DROP CONSTRAINT "CampaignParticipation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignParticipation" DROP CONSTRAINT "CampaignParticipation_userId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "allowedPlatforms" "Platform"[],
ADD COLUMN     "audioName" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "maxEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "maxEarningsPerPost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "maxSubmissions" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "type" "CampaignType" NOT NULL DEFAULT 'MUSIC',
DROP COLUMN "status",
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "SocialAccount" DROP COLUMN "platform",
ADD COLUMN     "platform" "Platform" NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "isEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "uniqueContentHash" TEXT;

-- DropTable
DROP TABLE "CampaignParticipation";

-- CreateTable
CREATE TABLE "CampaignRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "details" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_campaignId_userId_key" ON "Leaderboard"("campaignId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_campaignId_key" ON "Submission"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
