/*
  Warnings:

  - Made the column `platformUserId` on table `SocialAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SocialAccount" ALTER COLUMN "platformUserId" SET NOT NULL;
