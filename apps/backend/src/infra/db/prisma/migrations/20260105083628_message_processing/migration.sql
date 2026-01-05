/*
  Warnings:

  - You are about to drop the column `price` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `responseGenerated` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `responseSent` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `telegramMessageId` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MessageProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'TERMINAL');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "price",
DROP COLUMN "responseGenerated",
DROP COLUMN "responseSent",
DROP COLUMN "telegramMessageId";

-- CreateTable
CREATE TABLE "MessageProcessing" (
    "id" SERIAL NOT NULL,
    "userMessageId" INTEGER NOT NULL,
    "status" "MessageProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastErrorAt" TIMESTAMP(3),
    "terminalReason" TEXT,
    "responseMessageId" INTEGER,
    "telegramIncomingMessageId" INTEGER,
    "telegramOutgoingMessageId" INTEGER,
    "telegramUpdateId" BIGINT,
    "responseGeneratedAt" TIMESTAMP(3),
    "responseSentAt" TIMESTAMP(3),
    "price" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageProcessing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageProcessing_userMessageId_key" ON "MessageProcessing"("userMessageId");

-- CreateIndex
CREATE INDEX "MessageProcessing_status_idx" ON "MessageProcessing"("status");

-- CreateIndex
CREATE INDEX "MessageProcessing_lastErrorAt_idx" ON "MessageProcessing"("lastErrorAt");

-- AddForeignKey
ALTER TABLE "MessageProcessing" ADD CONSTRAINT "MessageProcessing_userMessageId_fkey" FOREIGN KEY ("userMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageProcessing" ADD CONSTRAINT "MessageProcessing_responseMessageId_fkey" FOREIGN KEY ("responseMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
