/*
  Warnings:

  - Made the column `startMessage` on table `Bot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Bot" ALTER COLUMN "startMessage" SET NOT NULL,
ALTER COLUMN "error" DROP NOT NULL;
