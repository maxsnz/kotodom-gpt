/*
  Warnings:

  - You are about to drop the column `isStarted` on the `Bot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "isStarted",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;
