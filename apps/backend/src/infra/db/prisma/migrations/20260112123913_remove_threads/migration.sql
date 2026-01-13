/*
  Warnings:

  - You are about to drop the column `assistantId` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `threadId` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "assistantId",
DROP COLUMN "token";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "threadId";
